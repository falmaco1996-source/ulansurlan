// supabase/functions/ai-callcenter/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type Role = "user" | "assistant";
type HistoryItem = { role: Role; content: string };

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json; charset=utf-8",
};

const SYSTEM_INSTRUCTIONS = `
Kamu adalah Asisten Call Center resmi untuk "Mochammad Ulan Surlan (Fraksi PKB) — DPRD Kota Bandung".

Tugas utama:
- Jawab pertanyaan warga tentang: cara kirim Aspirasi (tiket), status aspirasi, jadwal/reses/program, kinerja, media, dan kontak.
- Highlight program unggulan: "Ambulance Gratis" (cara akses, syarat umum, dan langkah cepat).
- Jika warga butuh tindak lanjut: arahkan dengan langkah jelas (poin-poin), minta data seperlunya (nama, wilayah, detail kejadian, waktu).

Gaya bahasa:
- Bahasa Indonesia yang ramah, cepat kebaca, ringkas (pakai bullet jika perlu).
- Jangan mengarang data spesifik (tanggal/alamat/nomor) bila tidak diberikan.

Keselamatan:
- Bila kondisi gawat darurat (mis. henti napas, perdarahan hebat, tidak sadar): minta segera hubungi nomor darurat setempat (contoh 112) / fasilitas medis terdekat. Layanan chat ini bukan pengganti layanan darurat.

Output:
- Beri jawaban langsung + langkah berikutnya.
`.trim();

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

/**
 * Ekstrak teks dari Responses API
 * Kita ambil semua content dengan type "output_text" di output message.
 */
function extractOutputText(resp: any): string {
  const out = resp?.output;
  if (!Array.isArray(out)) return "";

  const chunks: string[] = [];
  for (const item of out) {
    if (item?.type !== "message") continue;
    const content = item?.content;
    if (!Array.isArray(content)) continue;

    for (const c of content) {
      if (c?.type === "output_text" && typeof c?.text === "string") {
        chunks.push(c.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

function sanitizeHistory(history: unknown): HistoryItem[] {
  if (!Array.isArray(history)) return [];
  const cleaned: HistoryItem[] = [];

  for (const h of history) {
    const role = (h as any)?.role;
    const content = (h as any)?.content;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      const text = content.trim();
      if (text) cleaned.push({ role, content: text });
    }
  }

  // batasi biar hemat token (10 turn terakhir)
  return cleaned.slice(-10);
}

function toInputItems(history: HistoryItem[], message: string) {
  // Format Responses API: input bisa array item (role + content[ {type:"input_text", text} ])
  const items = history.map((h) => ({
    role: h.role,
    content: [{ type: "input_text", text: h.content }],
  }));

  items.push({
    role: "user",
    content: [{ type: "input_text", text: message }],
  });

  return items;
}

async function callOpenAI(params: {
  message: string;
  history: HistoryItem[];
  previous_response_id?: string;
}) {
  const apiKey = Deno.env.get("OPENAI_API_KEY") || "";
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY (set via supabase secrets).");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const payload: Record<string, unknown> = {
      model,
      instructions: SYSTEM_INSTRUCTIONS,
      input: toInputItems(params.history, params.message),
      temperature: 0.3,
      max_output_tokens: 500,
    };

    if (params.previous_response_id) {
      payload.previous_response_id = params.previous_response_id;
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      const msg =
        (data as any)?.error?.message ||
        (data as any)?.message ||
        `OpenAI error (${r.status})`;
      throw new Error(msg);
    }

    return {
      response_id: (data as any)?.id as string | undefined,
      reply: extractOutputText(data) || "Maaf, saya belum bisa memproses itu. Coba ulangi sebentar ya.",
      raw: data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Optional: simpan log ke tabel Supabase.
 * - Buat tabel: callcenter_logs (optional)
 * - Set secret SERVICE_ROLE_KEY (jangan pakai prefix SUPABASE_)
 */
async function tryLogToSupabase(payload: {
  session_id: string;
  question: string;
  answer: string;
  response_id?: string;
  user_agent?: string;
}) {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") || "";
  if (!url || !serviceKey) return; // skip kalau belum diset

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

  // kalau tabel belum ada, akan error -> kita silent
  try {
    await sb.from("callcenter_logs").insert({
      session_id: payload.session_id,
      question: payload.question,
      answer: payload.answer,
      response_id: payload.response_id ?? null,
      user_agent: payload.user_agent ?? null,
    });
  } catch {
    // silent
  }
}

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  const body = await req.json().catch(() => null);

  const message = typeof (body as any)?.message === "string" ? (body as any).message.trim() : "";
  const history = sanitizeHistory((body as any)?.history);
  const previous_response_id =
    typeof (body as any)?.previous_response_id === "string" ? (body as any).previous_response_id.trim() : undefined;

  const session_id =
    typeof (body as any)?.session_id === "string" && (body as any).session_id.trim()
      ? (body as any).session_id.trim()
      : crypto.randomUUID();

  if (!message) {
    return json(400, { error: "Field 'message' wajib diisi (string)." });
  }

  try {
    const { reply, response_id } = await callOpenAI({ message, history, previous_response_id });

    // optional logging
    const ua = req.headers.get("user-agent") || undefined;
    await tryLogToSupabase({ session_id, question: message, answer: reply, response_id, user_agent: ua });

    return json(200, {
      session_id,
      response_id, // simpan ini di frontend; kirim lagi sebagai previous_response_id biar percakapan nyambung
      reply,
    });
  } catch (e) {
    return json(500, {
      error: "Callcenter AI gagal diproses.",
      detail: (e as Error)?.message || String(e),
    });
  }
});
