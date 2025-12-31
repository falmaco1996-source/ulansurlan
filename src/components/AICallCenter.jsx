import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import {
  Bot,
  ExternalLink,
  Headset,
  HelpCircle,
  PhoneCall,
  RotateCcw,
  Send,
  Sparkles,
  X,
  HeartPulse,
  MessagesSquare,
  ClipboardList,
} from "lucide-react";

/**
 * =========================================================
 *  AICallCenter.jsx (Floating Popup)
 *  - Pop-up seperti call center (chat asisten virtual)
 *  - Jawab otomatis (rule-based/FAQ pintar: cepat & offline)
 *  - Bisa di-upgrade ke LLM via endpoint (opsional)
 *
 * Pasang: render <AICallCenter /> di Layout.jsx (lihat script Layout di bawah).
 *
 * OPTIONAL (logging Supabase):
 *  - set env VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
 *  - buat table ai_chat_logs (opsional)
 *
 * OPTIONAL (LLM):
 *  - set env VITE_AI_ENDPOINT (misal: Edge Function/Backend)
 *  - endpoint menerima POST { message, history } dan balas { reply }
 * =========================================================
 */

const PKB = {
  green: "#007744",
  greenDark: "#005A32",
  yellow: "#FFF212",
};

const CALL_CENTER = {
  // GANTI sesuai admin kamu
  whatsappNumber: "6281572054940",
  officeHours: "Setiap hari 08.00–17.00",
};

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function waLink(text = "") {
  const num = String(CALL_CENTER.whatsappNumber || "").replace(/[^\d]/g, "");
  const t = encodeURIComponent(text || "");
  return `https://wa.me/${num}?text=${t}`;
}

/** ---------- Simple "AI" engine (fast & offline) ---------- */
function normalize(s = "") {
  return String(s).toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreMatch(text, keywords = []) {
  const t = normalize(text);
  let score = 0;
  for (const k of keywords) {
    const kk = normalize(k);
    if (!kk) continue;
    if (t.includes(kk)) score += 2;
    const parts = kk.split(" ");
    if (parts.length > 1 && parts.every((p) => t.includes(p))) score += 1;
  }
  return score;
}

function buildReply(text) {
  const KB = [
    {
      id: "ambulans",
      keywords: [
        "ambulans",
        "ambulance",
        "gratis",
        "darurat",
        "gawat",
        "rujukan",
        "evakuasi",
      ],
      title: "Program Ambulans Gratis",
      answer:
        "Program unggulan: **Ambulans Gratis** untuk membantu mobilisasi warga (antar-jemput rujukan/keperluan medis tertentu sesuai ketentuan). Untuk info syarat & alur terbaru, buka menu Program/Media atau hubungi admin.",
      actions: [
        { label: "Buka Program", type: "route", to: "/program" },
        { label: "Lihat Media", type: "route", to: "/media" },
        {
          label: "Hubungi Admin (WA)",
          type: "wa",
          text: "Halo Admin, saya ingin info Program Ambulans Gratis. Mohon arahan syarat & alurnya ya.",
        },
      ],
    },
    {
      id: "aspirasi",
      keywords: ["aspirasi", "aduan", "keluhan", "lapor", "usulan", "masukan"],
      title: "Kirim Aspirasi / Aduan",
      answer:
        "Kamu bisa kirim aspirasi lewat menu **Aspirasi**. Tips biar cepat diproses: tulis lokasi, kategori, detail singkat, dan tambah foto/link pendukung bila ada.",
      actions: [
        { label: "Buka Aspirasi", type: "route", to: "/aspirasi" },
        {
          label: "Contoh Format",
          type: "text",
          text: "Format cepat: [Lokasi] - [Kategori] - [Masalah/Usulan] - [Dampak] - [Harapan]",
        },
      ],
    },
    {
      id: "kinerja",
      keywords: ["kinerja", "laporan", "progress", "progres", "agenda", "rapat", "reses"],
      title: "Lihat Kinerja & Laporan",
      answer:
        "Ringkasan kegiatan dan progres bisa kamu lihat di menu **Kinerja**. Kalau kamu sebutkan isu/area, aku bisa arahkan lebih spesifik.",
      actions: [
        { label: "Buka Kinerja", type: "route", to: "/kinerja" },
        {
          label: "Status Reses",
          type: "text",
          text: "Status reses: terjadwal, berjalan, selesai, ditunda, dibatalkan.",
        },
      ],
    },
    {
      id: "kontak",
      keywords: ["kontak", "alamat", "nomor", "wa", "whatsapp", "telepon", "admin"],
      title: "Kontak Admin",
      answer:
        "Silakan hubungi admin via WhatsApp. Kalau pesanmu spesifik (lokasi/isu), sertakan detail ya biar cepat ditangani.",
      actions: [
        {
          label: "WhatsApp Admin",
          type: "wa",
          text: "Halo Admin, saya ingin bertanya/konfirmasi terkait layanan dan aspirasi warga. Terima kasih.",
        },
        { label: "Buka Kontak", type: "route", to: "/kontak" },
      ],
    },
    {
      id: "profil",
      keywords: ["ulan", "surlan", "pkb", "tentang", "profil", "dprd", "dapil"],
      title: "Profil Singkat",
      answer:
        "Mochammad Ulan Surlan — Anggota DPRD Kota Bandung dari Fraksi PKB. Fokus: aspirasi warga, transparansi progres, penguatan wilayah, dan kolaborasi UMKM/komunitas.",
      actions: [{ label: "Buka Tentang", type: "route", to: "/tentang" }],
    },
  ];

  const t = normalize(text);
  if (t === "/reset" || t === "reset" || t === "hapus chat") {
    return {
      reply:
        "Chat direset ✅\n\nKetik: **aspirasi**, **ambulans gratis**, **kinerja**, atau **kontak**.",
      actions: [{ label: "Buka Aspirasi", type: "route", to: "/aspirasi" }],
    };
  }

  let best = null;
  let bestScore = 0;
  for (const item of KB) {
    const sc = scoreMatch(text, item.keywords);
    if (sc > bestScore) {
      bestScore = sc;
      best = item;
    }
  }

  if (best && bestScore > 0) {
    return {
      reply: `**${best.title}**\n\n${best.answer}`,
      actions: best.actions,
    };
  }

  return {
    reply:
      "Aku bisa bantu arahkan kamu 😊\n\nPilih topik di bawah, atau tulis pertanyaan dengan kata kunci (mis: **aspirasi Coblong**, **ambulans gratis**, **status reses**, **kontak admin**).",
    actions: [
      { label: "Aspirasi", type: "route", to: "/aspirasi" },
      { label: "Ambulans Gratis", type: "text", text: "Saya ingin info program ambulans gratis." },
      { label: "Kinerja", type: "route", to: "/kinerja" },
      { label: "Kontak", type: "route", to: "/kontak" },
    ],
  };
}

/** ---------- Optional Supabase logger ---------- */
function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

async function safeLog(supabase, payload) {
  if (!supabase) return;
  try {
    await supabase.from("ai_chat_logs").insert(payload);
  } catch {
    // silent
  }
}

function Bubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ring-1",
          isUser
            ? "bg-[#007744] text-white ring-[#007744]/20"
            : "bg-white/90 text-black/80 ring-black/5"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ActionButton({ onClick, children, variant = "ghost" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition active:translate-y-[1px]";
  const styles =
    variant === "primary"
      ? "bg-[#007744] text-white hover:opacity-95"
      : variant === "yellow"
      ? "bg-[#FFF212] text-[#005A32] ring-1 ring-[#F4E400]/70 hover:brightness-95"
      : "bg-white/70 text-black/70 ring-1 ring-black/5 hover:bg-white";

  return (
    <button onClick={onClick} className={cn(base, styles)}>
      {children}
    </button>
  );
}

function MessageContent({ text }) {
  // markdown-lite: **bold**
  const parts = String(text || "").split(/\*\*(.*?)\*\*/g);
  return (
    <div className="whitespace-pre-wrap">
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-extrabold">
            {p}
          </strong>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40" />
    </span>
  );
}

export default function AICallCenter() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  const sessionId = useMemo(() => {
    const k = "ai_call_center_session";
    const existing = localStorage.getItem(k);
    if (existing) return existing;
    const id = `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    localStorage.setItem(k, id);
    return id;
  }, []);

  const supabase = useMemo(() => getSupabase(), []);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("ai_call_center_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {}
    }
    return [
      {
        id: `m_${Date.now()}`,
        role: "assistant",
        content:
          "Halo! Saya **Asisten Virtual** (AI Call Center) 👋\n\nSaya bisa bantu:\n• cara kirim aspirasi\n• info program Ambulans Gratis\n• arahkan ke kinerja/media/kontak\n\nTulis pertanyaanmu ya 🙂",
        ts: Date.now(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("ai_call_center_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  const aiEndpoint = import.meta.env.VITE_AI_ENDPOINT; // optional

  async function getLLMReply(userText, history) {
    if (!aiEndpoint) return null;
    try {
      const r = await fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
      });
      if (!r.ok) return null;
      const data = await r.json();
      if (data?.reply) return String(data.reply);
      return null;
    } catch {
      return null;
    }
  }

  async function sendMessage(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;

    const userMsg = { id: `u_${Date.now()}`, role: "user", content: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    safeLog(supabase, {
      session_id: sessionId,
      role: "user",
      content: trimmed,
      meta: { page: window.location.pathname },
    });

    setTyping(true);

    const history = [...messages, userMsg]
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

    let llm = null;
    if (aiEndpoint) llm = await getLLMReply(trimmed, history);

    let replyText = "";
    let actions = [];
    if (llm) {
      replyText = llm;
      actions = [
        { label: "Kirim Aspirasi", type: "route", to: "/aspirasi" },
        { label: "Hubungi Admin (WA)", type: "wa", text: "Halo Admin, saya butuh bantuan lanjutan dari info AI Call Center." },
      ];
    } else {
      const res = buildReply(trimmed);
      replyText = res.reply;
      actions = res.actions || [];
    }

    const delay = reduced ? 0 : 650;
    setTimeout(() => {
      const botMsg = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: replyText,
        actions,
        ts: Date.now(),
      };
      setTyping(false);
      setMessages((prev) => [...prev, botMsg]);

      safeLog(supabase, {
        session_id: sessionId,
        role: "assistant",
        content: replyText,
        meta: { actions_count: actions.length, llm: !!llm },
      });
    }, delay);
  }

  function clearChat() {
    localStorage.removeItem("ai_call_center_messages");
    setMessages([
      {
        id: `m_${Date.now()}`,
        role: "assistant",
        content:
          "Chat dibersihkan ✅\n\nTulis pertanyaanmu ya 🙂\nContoh: **ambulans gratis**, **kirim aspirasi**, **cek kinerja**, atau **kontak admin**.",
        ts: Date.now(),
      },
    ]);
  }

  function handleAction(a) {
    if (!a) return;
    if (a.type === "route") {
      window.location.href = a.to;
      return;
    }
    if (a.type === "wa") {
      window.open(waLink(a.text), "_blank", "noopener,noreferrer");
      return;
    }
    if (a.type === "text") {
      setInput(a.text || "");
      return;
    }
  }

  const quick = [
    { label: "Aspirasi", icon: MessagesSquare, action: { type: "route", to: "/aspirasi" } },
    { label: "Ambulans Gratis", icon: HeartPulse, action: { type: "text", text: "Saya ingin info program ambulans gratis." } },
    { label: "Kinerja", icon: ClipboardList, action: { type: "route", to: "/kinerja" } },
    { label: "Kontak Admin", icon: PhoneCall, action: { type: "wa", text: "Halo Admin, saya ingin bertanya. Terima kasih." } },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-[0_18px_35px_rgba(0,119,68,0.28)]",
          "bg-[#007744] ring-1 ring-[#007744]/30 hover:opacity-95 active:translate-y-[1px]"
        )}
        aria-label="Buka AI Call Center"
      >
        <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,242,18,0.30),transparent_55%)]" />
        <span className="relative">
          <Headset className="h-6 w-6" />
        </span>
        {!reduced ? (
          <span className="pointer-events-none absolute -inset-1 rounded-[18px] ring-2 ring-[#FFF212]/50 animate-pulse" />
        ) : null}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-end p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

            {/* Card */}
            <motion.div
              className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border bg-white shadow-2xl"
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {/* Top ribbon */}
              <div
                className="h-1 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,119,68,1), rgba(12,140,90,1), rgba(255,242,18,1))",
                }}
              />

              {/* Header */}
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[rgba(0,119,68,0.10)] text-[#007744]">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-extrabold text-[#005A32]">AI Call Center</div>
                      <span className="rounded-full bg-[#FFF212] px-2 py-0.5 text-[10px] font-extrabold text-[#005A32] ring-1 ring-[#F4E400]/70">
                        PKB
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-black/60">
                      {CALL_CENTER.officeHours} • Auto-reply aktif
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChat}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-black/5 hover:bg-black/5"
                    aria-label="Reset chat"
                    title="Reset chat"
                  >
                    <RotateCcw className="h-5 w-5 text-black/70" />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white ring-1 ring-black/5 hover:bg-black/5"
                    aria-label="Tutup"
                  >
                    <X className="h-5 w-5 text-black/70" />
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="px-4 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  {quick.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => handleAction(q.action)}
                      className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 text-xs font-semibold text-[#005A32] ring-1 ring-black/5 hover:bg-white"
                    >
                      <q.icon className="h-4 w-4 text-[#007744]" />
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={listRef}
                className="h-[360px] overflow-y-auto px-4 pb-4"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(234,247,239,0.55), rgba(255,255,255,1) 40%, rgba(255,242,18,0.14))",
                }}
              >
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div key={m.id}>
                      <Bubble role={m.role}>
                        <MessageContent text={m.content} />
                      </Bubble>

                      {m.role === "assistant" && Array.isArray(m.actions) && m.actions.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {m.actions.map((a, i) => (
                            <ActionButton
                              key={i}
                              variant={a.type === "wa" ? "yellow" : a.type === "route" ? "primary" : "ghost"}
                              onClick={() => handleAction(a)}
                            >
                              {a.type === "wa" ? (
                                <>
                                  <PhoneCall className="h-4 w-4" /> WA
                                </>
                              ) : a.type === "route" ? (
                                <>
                                  <ExternalLink className="h-4 w-4" /> Buka
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4" /> Isi
                                </>
                              )}
                              <span className="truncate">{a.label}</span>
                            </ActionButton>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {typing ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-white/90 px-3 py-2 text-sm text-black/70 ring-1 ring-black/5">
                        <span className="inline-flex items-center gap-2">
                          <span className="grid h-6 w-6 place-items-center rounded-xl bg-[rgba(0,119,68,0.10)]">
                            <Bot className="h-4 w-4 text-[#007744]" />
                          </span>
                          Mengetik… {!reduced ? <Dots /> : null}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl bg-white/70 p-3 text-[11px] text-black/60 ring-1 ring-black/5">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="mt-0.5 h-4 w-4 text-[#007744]" />
                    <div>
                      <div className="font-semibold text-black/70">Catatan</div>
                      <div className="mt-1">
                        Ini asisten virtual. Untuk kondisi gawat darurat, segera hubungi layanan darurat setempat (mis. 112/119) atau fasilitas kesehatan terdekat.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Composer */}
              <div className="border-t bg-white p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Tulis pesan… (contoh: "ambulans gratis")'
                    className="h-11 flex-1 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[#007744]/40 focus:ring-4 focus:ring-[#007744]/10"
                  />
                  <button
                    type="submit"
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-[#007744] text-white hover:opacity-95 active:translate-y-[1px]"
                    aria-label="Kirim"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-black/55">
                  <div className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#007744]" />
                    Ketik <span className="font-mono">/reset</span> untuk reset chat
                  </div>

                  <a
                    href={waLink("Halo Admin, saya butuh bantuan lebih lanjut.")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#FFF212] px-3 py-1 font-extrabold text-[#005A32] ring-1 ring-[#F4E400]/70 hover:brightness-95"
                  >
                    <PhoneCall className="h-4 w-4" />
                    WA Admin
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
