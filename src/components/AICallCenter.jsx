import React, { useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { MessageCircle, X, Send } from "lucide-react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default function AICallCenter() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const listRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Assalamu’alaikum 👋\nSaya Asisten Call Center Mochammad Ulan Surlan (Fraksi PKB) — DPRD Kota Bandung.\n\nSilakan tulis pertanyaan (Aspirasi/Reses/Program/Media/Kontak/Ambulance Gratis).",
      ts: new Date().toISOString(),
    },
  ]);

  const history = useMemo(
    () =>
      messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    [messages]
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const reset = () => {
    setErr("");
    setInput("");
    setMessages([
      {
        role: "assistant",
        content:
          "Assalamu’alaikum 👋\nSilakan tulis pertanyaan (Aspirasi/Reses/Program/Media/Kontak/Ambulance Gratis).",
        ts: new Date().toISOString(),
      },
    ]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    setErr("");
    setBusy(true);

    const userMsg = { role: "user", content: text, ts: new Date().toISOString() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    scrollToBottom();

    try {
      const { data, error } = await supabase.functions.invoke("ai-callcenter", {
        body: {
          message: text,
          history: history.slice(-10), // kirim konteks terakhir saja
        },
      });

      if (error) throw error;

      const reply = data?.reply || "Maaf, belum ada jawaban. Coba ulangi ya.";
      setMessages((p) => [
        ...p,
        { role: "assistant", content: reply, ts: new Date().toISOString() },
      ]);
      scrollToBottom();
    } catch (e) {
      setErr(
        "Edge Function error. Cek: (1) function sudah DEPLOY, (2) OPENAI_API_KEY ada, (3) Logs Supabase."
      );
    } finally {
      setBusy(false);
      scrollToBottom();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6",
          "grid h-12 w-12 place-items-center rounded-2xl",
          "bg-[#007744] text-white shadow-[0_18px_35px_rgba(0,119,68,0.22)]",
          "ring-1 ring-[#007744]/30 hover:opacity-95"
        )}
        aria-label="Buka AI Call Center"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 pointer-events-none p-4 sm:p-6">
          {/* ini yang bikin panel ga nyerempet: inset + max width */}
          <div className="pointer-events-auto ml-auto h-full sm:h-auto sm:max-w-[420px]">
            <div
              className={cn(
                "flex h-[calc(100vh-2rem)] sm:h-[620px]",
                "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]",
                "w-full sm:w-[420px]",
                "flex-col overflow-hidden rounded-3xl bg-white",
                "ring-1 ring-black/10 shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
              )}
            >
              {/* Header */}
              <div className="border-b bg-white/90 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF7EF] px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
                        ✨ AI Call Center • PKB Bandung
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      Mochammad Ulan Surlan — Layanan Warga
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Tanya seputar Aspirasi, Program/Reses, Media, Kontak, Ambulance Gratis.
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white hover:bg-slate-50"
                    aria-label="Tutup"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {err ? (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {err}
                  </div>
                ) : null}
              </div>

              {/* Messages */}
              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      m.role === "user"
                        ? "ml-auto bg-[#007744] text-white"
                        : "bg-slate-50 text-slate-900 ring-1 ring-black/5"
                    )}
                  >
                    {m.content}
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div className="border-t bg-white p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Tulis pertanyaan warga..."
                    className={cn(
                      "h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-[#FFF212]"
                    )}
                    disabled={busy}
                  />
                  <button
                    onClick={send}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-2xl",
                      "bg-[#007744] text-white ring-1 ring-[#007744]/30",
                      "hover:opacity-95 disabled:opacity-60"
                    )}
                    disabled={busy}
                    aria-label="Kirim"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <button onClick={reset} className="underline hover:text-slate-700">
                    Reset chat
                  </button>
                  <span>Info: Jika darurat medis, hubungi 112 / RS terdekat.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
