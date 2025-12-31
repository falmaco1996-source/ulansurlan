// src/components/AICallCenter.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headset, Send, X, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const PKB = {
  green: "#007744",
  greenDark: "#005A32",
  yellow: "#FFF212",
};

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function AICallCenter() {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");

  // Simpan agar chat nyambung (edge function balikin response_id & session_id)
  const storageKey = "ai_callcenter_state_v1";
  const [sessionId, setSessionId] = useState("");
  const [prevResponseId, setPrevResponseId] = useState("");

  const [messages, setMessages] = useState(() => [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text:
        "Assalamu’alaikum 👋\nSaya Asisten Call Center Mochammad Ulan Surlan (Fraksi PKB) — DPRD Kota Bandung.\n\nSilakan tulis pertanyaan (Aspirasi/Reses/Program/Ambulance Gratis/Media/Kontak).",
      at: nowTime(),
    },
  ]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  // load saved state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.sessionId) setSessionId(parsed.sessionId);
      if (parsed?.prevResponseId) setPrevResponseId(parsed.prevResponseId);

      if (Array.isArray(parsed?.messages) && parsed.messages.length) {
        setMessages(parsed.messages);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          sessionId,
          prevResponseId,
          messages,
        })
      );
    } catch {}
  }, [sessionId, prevResponseId, messages]);

  // auto scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const bubbleClass = useMemo(
    () => ({
      user: "bg-[#007744] text-white",
      assistant: "bg-white text-slate-900 ring-1 ring-black/5",
    }),
    []
  );

  async function sendMessage() {
    const text = draft.trim();
    if (!text || typing) return;

    setError("");
    setDraft("");

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      at: nowTime(),
    };

    setMessages((m) => [...m, userMsg]);
    setTyping(true);

    try {
      // Pakai Edge Function via supabase-js
      // body: message, previous_response_id, session_id
      const { data, error: fnErr } = await supabase.functions.invoke("ai-callcenter", {
        body: {
          message: text,
          previous_response_id: prevResponseId || undefined,
          session_id: sessionId || undefined,
          // history opsional (kalau mau), tapi kita andalkan previous_response_id biar hemat
          history: [],
        },
      });

      if (fnErr) throw fnErr;

      const reply = data?.reply || "Maaf, saya belum bisa memproses itu. Coba ulangi ya.";
      const newSession = data?.session_id;
      const newRespId = data?.response_id;

      if (newSession) setSessionId(newSession);
      if (newRespId) setPrevResponseId(newRespId);

      const botMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
        at: nowTime(),
      };

      setMessages((m) => [...m, botMsg]);
    } catch (e) {
      setError(
        (e?.message || "").includes("FunctionsHttpError")
          ? "Edge Function error. Pastikan function sudah di-deploy & secrets OPENAI_API_KEY sudah benar."
          : e?.message || "Gagal menghubungi AI Call Center."
      );
    } finally {
      setTyping(false);
    }
  }

  function clearChat() {
    setError("");
    setPrevResponseId("");
    setSessionId("");
    const base = [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          "Assalamu’alaikum 👋\nSaya Asisten Call Center Mochammad Ulan Surlan (Fraksi PKB) — DPRD Kota Bandung.\n\nSilakan tulis pertanyaan (Aspirasi/Reses/Program/Ambulance Gratis/Media/Kontak).",
        at: nowTime(),
      },
    ];
    setMessages(base);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-[60]">
        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(0,119,68,0.28)] ring-1 ring-[#007744]/30 hover:opacity-95"
          aria-label="Buka AI Call Center"
        >
          <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,242,18,0.28),transparent_55%)]" />
          <span className="relative grid h-9 w-9 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Headset className="h-5 w-5" />
          </span>
          <span className="relative hidden sm:block">AI Call Center</span>

          <span className="relative ml-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] ring-1 ring-white/15">
            <span className={cn("h-2 w-2 rounded-full", typing ? "bg-[#FFF212]" : "bg-white/80")} />
            Online
          </span>
        </button>
      </div>

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-end bg-black/30 p-4 sm:place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10"
              initial={{ y: 20, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {/* Header */}
              <div className="relative border-b border-black/5 bg-gradient-to-r from-[rgba(234,247,239,1)] to-white p-4">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#007744] via-[#0C8C5A] to-[#FFF212]" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
                      <Sparkles className="h-4 w-4 text-[#007744]" />
                      AI Call Center • PKB Bandung
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      Mochammad Ulan Surlan — Layanan Warga
                    </div>
                    <div className="mt-1 text-[12px] text-slate-600">
                      Tanya seputar Aspirasi, Program/Reses, Media, Kontak, Ambulance Gratis.
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 ring-1 ring-black/5 hover:bg-white"
                    aria-label="Tutup"
                  >
                    <X className="h-5 w-5 text-slate-700" />
                  </button>
                </div>

                {error ? (
                  <div className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-[12px] text-red-700 ring-1 ring-red-200">
                    {error}
                  </div>
                ) : null}
              </div>

              {/* Messages */}
              <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-4">
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div className="max-w-[85%]">
                        <div
                          className={cn(
                            "whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                            bubbleClass[m.role]
                          )}
                        >
                          {m.text}
                        </div>
                        <div className={cn("mt-1 text-[11px] text-slate-500", m.role === "user" ? "text-right" : "")}>
                          {m.at}
                        </div>
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-black/5">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mengetik…
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-black/5 bg-white p-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    placeholder="Tulis pertanyaan warga…"
                    className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[rgba(255,242,18,0.8)]"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={typing || !draft.trim()}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm",
                      typing || !draft.trim()
                        ? "bg-slate-300"
                        : "bg-[#007744] hover:opacity-95"
                    )}
                    aria-label="Kirim"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={clearChat}
                    className="text-[12px] font-semibold text-slate-600 hover:text-slate-900"
                    type="button"
                  >
                    Reset chat
                  </button>

                  <div className="text-[11px] text-slate-500">
                    {sessionId ? (
                      <span>
                        Sesi: <span className="font-mono">{sessionId.slice(0, 8)}…</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Sesi belum dibuat</span>
                    )}
                  </div>
                </div>

                <div className="mt-2 rounded-2xl bg-[rgba(234,247,239,0.8)] px-3 py-2 text-[11px] text-slate-700 ring-1 ring-black/5">
                  <span className="font-semibold" style={{ color: PKB.greenDark }}>
                    Info:
                  </span>{" "}
                  Jika darurat medis, segera hubungi layanan darurat setempat (mis. 112) / RS terdekat.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
