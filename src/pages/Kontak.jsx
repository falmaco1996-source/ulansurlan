import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Copy,
  ExternalLink,
  HandHeart,
  Info,
  Instagram,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Sparkles,
  Users,
  X,
} from "lucide-react";

/**
 * =========================================================
 *  KONTAK.jsx — PKB Themed
 *  - FIX lucide icon forwardRef (no more React child object error)
 *  - Modal Janji Temu lebih lega (nggak mepet)
 *  - ✅ Setelah klik "Kirim via WhatsApp": modal langsung tutup + form reset
 * =========================================================
 *
 * EDIT DATA DI SINI:
 */
const CONTACT = {
  person: "Mochammad Ulan Surlan",
  org: "DPRD Kota Bandung • Fraksi PKB",
  dapil: "Dapil 1",
  roles: ["Komisi I", "Badan Musyawarah"],

  whatsappNumber: "6281572054940", // format internasional tanpa + / spasi
  phoneNumber: "081572054940", // bebas format (untuk tel:)
  email: "emailkamu@domain.com",
  instagram: "https://instagram.com/usernamekamu",

  officeName: "Posko Aspirasi • Fraksi PKB",
  addressLine1: "Isi alamat lengkap di sini",
  addressLine2: "Kota Bandung, Jawa Barat",

  mapEmbedUrl: "https://www.google.com/maps?q=DPRD%20Kota%20Bandung&output=embed",

  serviceHours: [
    { day: "Senin–Jumat", time: "09.00–17.00 WIB" },
    { day: "Sabtu", time: "09.00–13.00 WIB (opsional)" },
    { day: "Minggu", time: "Libur / by appointment" },
  ],

  wilayah: [
    "Coblong",
    "Cidadap",
    "Bandung Wetan",
    "Cibeunying Kaler",
    "Cibeunying Kidul",
    "Sumur Bandung",
  ],

  photos: [
    "/galeri/02.webp",
    "/galeri/01.jpg",
    "/galeri/03.jpg",
    "/galeri/05.webp",
    "/galeri/06.jpg",
  ],
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

function useReveal() {
  const refs = useRef([]);
  useEffect(() => {
    const els = refs.current.filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const add = (el) => el && !refs.current.includes(el) && refs.current.push(el);
  return add;
}

function isHttpUrl(v) {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
}

/** WhatsApp icon (lucide-react tidak menyediakan WhatsApp) */
function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.11 17.6c-.28-.14-1.66-.82-1.92-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.17.19-.33.21-.61.07-.28-.14-1.2-.44-2.29-1.41-.85-.76-1.42-1.7-1.59-1.98-.17-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.55-.46-.48-.64-.49h-.55c-.19 0-.5.07-.76.36-.26.28-1 0.97-1 2.36 0 1.39 1.03 2.74 1.17 2.93.14.19 2.03 3.1 4.93 4.35.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.55-.08 1.66-.68 1.9-1.33.23-.65.23-1.21.16-1.33-.07-.12-.26-.19-.54-.33ZM16.02 3C8.86 3 3.04 8.82 3.04 15.98c0 2.28.6 4.52 1.74 6.49L3 29l6.71-1.76a12.9 12.9 0 0 0 6.31 1.62h.01c7.16 0 12.98-5.82 12.98-12.98S23.18 3 16.02 3Zm0 23.63h-.01c-2.06 0-4.07-.55-5.82-1.6l-.42-.25-3.98 1.04 1.06-3.88-.28-.44a10.64 10.64 0 0 1-1.64-5.51c0-5.88 4.79-10.67 10.68-10.67 5.89 0 10.68 4.79 10.68 10.67 0 5.88-4.79 10.64-10.69 10.64Z"
      />
    </svg>
  );
}

function SmartImage({ srcs, alt, className = "", rounded = "rounded-3xl" }) {
  const list = Array.isArray(srcs) ? srcs.filter(Boolean) : [srcs].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setIdx(0);
    setBroken(false);
  }, [list.join("|")]);

  const src = list[idx];
  if (!src || broken) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-gradient-to-br from-[rgba(0,119,68,.14)] via-white to-[rgba(255,242,18,.22)] ring-1 ring-black/5",
          rounded,
          className
        )}
      >
        <div className="text-center px-5">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/75 ring-1 ring-black/5">
            <Sparkles className="h-5 w-5 text-[#005A32]" />
          </div>
          <div className="mt-2 text-xs font-semibold text-[#005A32]">Foto belum tersedia</div>
          <div className="mt-1 text-[11px] text-black/55">
            Taruh di <span className="font-mono">/public/galeri</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden ring-1 ring-black/5", rounded, className)}>
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", rounded)}
        loading="lazy"
        decoding="async"
        referrerPolicy={isHttpUrl(src) ? "no-referrer" : undefined}
        onError={() => {
          if (idx + 1 < list.length) setIdx((v) => v + 1);
          else setBroken(true);
        }}
      />
      <div className={cn("pointer-events-none absolute inset-0", rounded, "ring-1 ring-black/5")} />
    </div>
  );
}

function Chip({ icon: Icon, children, tone = "soft" }) {
  const cls =
    tone === "green"
      ? "bg-[rgba(0,119,68,.10)] text-[#005A32]"
      : tone === "yellow"
      ? "bg-[rgba(255,242,18,.60)] text-[#005A32]"
      : "bg-white/70 text-[#005A32]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-black/5 backdrop-blur",
        cls
      )}
    >
      <Icon className="h-4 w-4 text-[#007744]" />
      {children}
    </span>
  );
}

function Card({ className = "", children }) {
  return (
    <div className={cn("rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm", className)}>
      {children}
    </div>
  );
}

function ActionButton({ onClick, tone = "green", children }) {
  const cls =
    tone === "yellow"
      ? "bg-[#FFF212] text-[#005A32] border border-[#F4E400] hover:brightness-95 shadow-[0_16px_30px_rgba(255,242,18,.16)]"
      : "bg-[#007744] text-white hover:opacity-95 shadow-[0_18px_35px_rgba(0,119,68,.18)] ring-1 ring-[#007744]/25";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold active:translate-y-[1px]",
        cls
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

/** ✅ FIX lucide: render icon selalu via createElement */
function LinkRow({ icon: Icon, label, value, onCopy, href }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(0,119,68,.10)] text-[#007744]">
          {React.isValidElement(Icon)
            ? Icon
            : React.createElement(Icon, { className: "h-5 w-5" })}
        </div>
        <div>
          <div className="text-sm font-semibold text-black">{label}</div>
          <div className="mt-1 text-sm text-black/70 break-all">{value}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {onCopy ? (
          <button
            onClick={onCopy}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/80 ring-1 ring-black/10 hover:bg-white"
            aria-label="Copy"
          >
            <Copy className="h-4 w-4 text-black/70" />
          </button>
        ) : null}
        {href ? (
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/80 ring-1 ring-black/10 hover:bg-white"
            aria-label="Open"
          >
            <ExternalLink className="h-4 w-4 text-black/70" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={it.q}
            className="overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm"
          >
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(255,242,18,.55)] ring-1 ring-black/5">
                  <Info className="h-5 w-5 text-[#005A32]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">{it.q}</div>
                  <div className="mt-1 text-xs text-black/60">{it.hint}</div>
                </div>
              </div>
              <span className={cn("text-xs font-extrabold", isOpen ? "text-[#007744]" : "text-black/55")}>
                {isOpen ? "TUTUP" : "BUKA"}
              </span>
            </button>

            <div className={cn("px-5 pb-5 text-sm text-black/70", isOpen ? "block" : "hidden")}>
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className={cn("absolute inset-0 bg-black/40", !reduced ? "fade-in" : "")} onClick={onClose} />
      <div className={cn("absolute inset-0 flex items-center justify-center p-5 sm:p-6", !reduced ? "pop-in" : "")}>
        <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 shadow-xl">
          <div className="flex items-center justify-between border-b border-black/5 p-4 sm:p-5">
            <div className="text-base font-semibold text-black">{title}</div>
            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-black/[0.03] ring-1 ring-black/10 hover:bg-black/[0.05]"
              aria-label="Tutup"
            >
              <X className="h-5 w-5 text-black/70" />
            </button>
          </div>

          <div className="max-h-[calc(85vh-64px)] overflow-auto p-5 sm:p-6">{children}</div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce){
          .fade-in, .pop-in { animation:none !important; }
        }
        .fade-in { animation: fadeIn .16s ease-out both; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .pop-in { animation: popIn .18s ease-out both; }
        @keyframes popIn { from { transform: translateY(10px) scale(.98); opacity:.7 } to { transform: translateY(0) scale(1); opacity:1 } }
      `}</style>
    </div>
  );
}

function InputLabel({ children }) {
  return <div className="text-xs font-semibold text-black/70">{children}</div>;
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={cn(
        "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none",
        "focus:border-[#007744]/45 focus:ring-2 focus:ring-[#007744]/10",
        props.className
      )}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={cn(
        "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none",
        "focus:border-[#007744]/45 focus:ring-2 focus:ring-[#007744]/10",
        props.className
      )}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none",
        "focus:border-[#007744]/45 focus:ring-2 focus:ring-[#007744]/10",
        props.className
      )}
    />
  );
}

export default function Kontak() {
  const navigate = useNavigate();
  const reveal = useReveal();

  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => () => toastTimer.current && clearTimeout(toastTimer.current), []);

  const copyText = async (v) => {
    try {
      await navigator.clipboard.writeText(v);
      showToast("Tersalin ✅");
    } catch {
      showToast("Gagal copy (browser) ❗");
    }
  };

  const waHref = useMemo(() => {
    const n = String(CONTACT.whatsappNumber || "").replace(/\D/g, "");
    if (!n) return "";
    const text = encodeURIComponent(
      `Assalamualaikum, saya ingin menyampaikan aspirasi/pertanyaan.\n\nNama: ...\nWilayah: ...\nPesan: ...`
    );
    return `https://wa.me/${n}?text=${text}`;
  }, []);

  const mailHref = useMemo(() => {
    if (!CONTACT.email) return "";
    const subject = encodeURIComponent("Kontak & Aspirasi Warga");
    const body = encodeURIComponent(`Halo, saya ingin menyampaikan pesan.\n\nNama:\nWilayah:\nPesan:\n\nTerima kasih.`);
    return `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  }, []);

  const telHref = useMemo(() => {
    if (!CONTACT.phoneNumber) return "";
    const p = String(CONTACT.phoneNumber).replace(/\s/g, "");
    return `tel:${p}`;
  }, []);

  const copyAllContacts = () => {
    const text = [
      `Kontak ${CONTACT.person}`,
      `${CONTACT.org}`,
      "",
      `WhatsApp: ${CONTACT.whatsappNumber || "-"}`,
      `Telepon: ${CONTACT.phoneNumber || "-"}`,
      `Email: ${CONTACT.email || "-"}`,
      `Instagram: ${CONTACT.instagram || "-"}`,
      "",
      `Posko: ${CONTACT.officeName}`,
      `${CONTACT.addressLine1}`,
      `${CONTACT.addressLine2}`,
    ].join("\n");
    copyText(text);
  };

  // ===== Janji Temu =====
  const [openJanji, setOpenJanji] = useState(false);
  const [jtNama, setJtNama] = useState("");
  const [jtWilayah, setJtWilayah] = useState(CONTACT.wilayah?.[0] || "");
  const [jtWilayahLain, setJtWilayahLain] = useState("");
  const [jtTgl, setJtTgl] = useState("");
  const [jtJam, setJtJam] = useState("");
  const [jtTopik, setJtTopik] = useState("Aspirasi / Usulan");
  const [jtDetail, setJtDetail] = useState("");

  /** ✅ reset form biar habis kirim WA modal langsung bersih */
  const resetJanjiForm = () => {
    setJtNama("");
    setJtWilayah(CONTACT.wilayah?.[0] || "");
    setJtWilayahLain("");
    setJtTgl("");
    setJtJam("");
    setJtTopik("Aspirasi / Usulan");
    setJtDetail("");
  };

  const makeJanjiMessage = () => {
    const wilayahFinal = jtWilayah === "Lainnya" ? jtWilayahLain.trim() : jtWilayah;
    const tglTxt = jtTgl ? jtTgl : "(fleksibel)";
    const jamTxt = jtJam ? jtJam : "(fleksibel)";
    const namaTxt = jtNama.trim() || "(anon)";
    const detailTxt = jtDetail.trim() || "-";

    return (
      `Assalamualaikum.\n` +
      `Saya ingin mengajukan *Janji Temu*.\n\n` +
      `Nama: ${namaTxt}\n` +
      `Wilayah: ${wilayahFinal || "-"}\n` +
      `Topik: ${jtTopik}\n` +
      `Preferensi waktu: ${tglTxt} • ${jamTxt}\n\n` +
      `Detail singkat:\n${detailTxt}\n\n` +
      `Terima kasih.`
    );
  };

  /** ✅ Setelah klik: buka WA + TUTUP MODAL + RESET FORM */
  const sendJanjiToWA = () => {
    const n = String(CONTACT.whatsappNumber || "").replace(/\D/g, "");
    if (!n) return showToast("Isi dulu nomor WhatsApp di CONTACT.whatsappNumber");
    if (!jtNama.trim()) return showToast("Nama wajib diisi untuk Janji Temu.");

    const wilayahFinal = jtWilayah === "Lainnya" ? jtWilayahLain.trim() : jtWilayah;
    if (!wilayahFinal) return showToast("Wilayah wajib diisi.");

    const msg = encodeURIComponent(makeJanjiMessage());
    const url = `https://wa.me/${n}?text=${msg}`;

    window.open(url, "_blank", "noreferrer");

    // ✅ langsung hilang / gak nempel
    setOpenJanji(false);
    resetJanjiForm();
    showToast("Dibuka di WhatsApp ✅");
  };

  const faq = useMemo(
    () => [
      {
        q: "Lebih baik kirim lewat Aspirasi atau Kontak?",
        hint: "Biar pesan kamu nggak ketukar dan bisa dipantau.",
        a: (
          <div className="space-y-2">
            <p>
              Kalau kamu ingin <b>pesan tercatat</b> dan bisa dipantau statusnya, gunakan menu{" "}
              <b>Aspirasi</b> (tiket).
            </p>
            <p>
              Menu <b>Kontak</b> cocok untuk hal cepat seperti: tanya jadwal, konfirmasi pertemuan,
              atau koordinasi teknis.
            </p>
          </div>
        ),
      },
      {
        q: "Info apa yang sebaiknya saya sertakan?",
        hint: "Supaya tindak lanjutnya cepat dan jelas.",
        a: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Nama + wilayah (RW/kelurahan/kecamatan).</li>
            <li>Ringkasan masalah / usulan (1–3 paragraf cukup).</li>
            <li>Tanggal & lokasi kejadian (kalau aduan).</li>
            <li>Foto/dokumen/link pendukung (jika ada).</li>
          </ul>
        ),
      },
    ],
    []
  );

  return (
    <section className="mt-6 pb-10">
      <style>{`
        .pkb-grid{
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,.06) 1px, transparent 0);
          background-size: 18px 18px;
        }
        .ribbon{
          background: linear-gradient(90deg, rgba(0,119,68,1), rgba(12,140,90,1), rgba(255,242,18,1));
        }
        .reveal{ opacity:0; transform: translateY(10px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.is-visible{ opacity:1; transform: translateY(0); }
      `}</style>

      {toast ? (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {/* MODAL JANJI TEMU */}
      <Modal
        open={openJanji}
        onClose={() => {
          setOpenJanji(false);
          resetJanjiForm();
        }}
        title="Ajukan Janji Temu"
      >
        <div className="grid gap-5">
          <div className="rounded-3xl bg-[rgba(255,242,18,.35)] p-5 ring-1 ring-black/5">
            <div className="text-sm font-semibold text-[#005A32]">Isi form → pesan WA otomatis rapi</div>
            <div className="mt-2 text-xs text-black/70">Cocok untuk undangan/pertemuan/koordinasi warga.</div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <InputLabel>Nama *</InputLabel>
              <TextInput value={jtNama} onChange={(e) => setJtNama(e.target.value)} placeholder="Nama lengkap" />
            </div>

            <div>
              <InputLabel>Wilayah *</InputLabel>
              <SelectInput value={jtWilayah} onChange={(e) => setJtWilayah(e.target.value)}>
                {CONTACT.wilayah.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </SelectInput>
            </div>

            {jtWilayah === "Lainnya" ? (
              <div className="sm:col-span-2">
                <InputLabel>Tulis wilayah</InputLabel>
                <TextInput
                  value={jtWilayahLain}
                  onChange={(e) => setJtWilayahLain(e.target.value)}
                  placeholder="Contoh: Antapani / Kiaracondong / dll"
                />
              </div>
            ) : null}

            <div>
              <InputLabel>Preferensi tanggal</InputLabel>
              <TextInput type="date" value={jtTgl} onChange={(e) => setJtTgl(e.target.value)} />
            </div>

            <div>
              <InputLabel>Preferensi jam</InputLabel>
              <TextInput type="time" value={jtJam} onChange={(e) => setJtJam(e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <InputLabel>Topik</InputLabel>
              <SelectInput value={jtTopik} onChange={(e) => setJtTopik(e.target.value)}>
                <option>Aspirasi / Usulan</option>
                <option>Aduan / Layanan</option>
                <option>Kegiatan / Undangan</option>
                <option>Koordinasi RW/Komunitas</option>
                <option>UMKM / Ekonomi Warga</option>
                <option>Lainnya</option>
              </SelectInput>
            </div>

            <div className="sm:col-span-2">
              <InputLabel>Detail singkat</InputLabel>
              <TextArea
                value={jtDetail}
                onChange={(e) => setJtDetail(e.target.value)}
                placeholder="Jelaskan singkat maksud pertemuan + poin penting. (1–5 kalimat)"
                rows={5}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-black/[0.02] p-5 ring-1 ring-black/5">
            <div className="text-xs font-semibold text-black/70">Preview pesan</div>
            <pre className="mt-3 whitespace-pre-wrap text-xs text-black/65 font-mono">{makeJanjiMessage()}</pre>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => copyText(makeJanjiMessage())}
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80 hover:bg-black/[0.02]"
            >
              <Copy className="h-4 w-4" /> Copy Pesan
            </button>

            <button
              onClick={sendJanjiToWA}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(0,119,68,.18)] hover:opacity-95"
            >
              <WhatsAppIcon className="h-4 w-4" /> Kirim via WhatsApp <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setOpenJanji(false);
                resetJanjiForm();
                navigate("/aspirasi");
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF212] px-4 py-3 text-sm font-semibold text-[#005A32] border border-[#F4E400] hover:brightness-95"
            >
              <MessageSquareText className="h-4 w-4" /> Buat Tiket Aspirasi <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Modal>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border bg-white">
        <div className="h-1 w-full ribbon" />
        <div className="relative pkb-grid bg-gradient-to-b from-[rgba(234,247,239,.92)] via-white to-[rgba(255,242,18,.16)] p-6 sm:p-10">
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="reveal" ref={reveal}>
              <div className="flex flex-wrap gap-2">
                <Chip icon={Users} tone="green">Fraksi PKB</Chip>
                <Chip icon={MapPin}>{CONTACT.dapil}</Chip>
                {CONTACT.roles.map((r) => (
                  <Chip key={r} icon={BadgeCheck}>{r}</Chip>
                ))}
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Kontak & Layanan Warga
              </h1>
              <p className="mt-2 text-sm text-black/65 sm:text-base">
                Untuk laporan/aspirasi yang perlu dipantau statusnya, gunakan menu <b>Aspirasi</b>.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <ActionButton onClick={() => navigate("/aspirasi")} tone="green">
                  <MessageSquareText className="h-4 w-4" /> Buat Tiket Aspirasi
                </ActionButton>

                <ActionButton
                  onClick={() => {
                    resetJanjiForm();
                    setOpenJanji(true);
                  }}
                  tone="yellow"
                >
                  <CalendarClock className="h-4 w-4" /> Janji Temu
                </ActionButton>

                <button
                  onClick={copyAllContacts}
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm font-semibold text-black/80 hover:bg-white"
                >
                  <Copy className="h-4 w-4" /> Copy Semua Kontak
                </button>
              </div>
            </div>

            <div className="reveal" ref={reveal}>
              <div className="grid gap-3 sm:grid-cols-2">
                <SmartImage srcs={CONTACT.photos} alt={CONTACT.person} className="h-[190px] sm:h-[220px]" />
                <SmartImage srcs={[CONTACT.photos?.[2], ...CONTACT.photos]} alt="Kegiatan" className="h-[190px] sm:h-[220px]" />
                <SmartImage srcs={[CONTACT.photos?.[1], ...CONTACT.photos]} alt="Dokumentasi" className="h-[190px] sm:h-[220px]" />
                <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,242,18,.55)] px-3 py-1 text-xs font-extrabold text-[#005A32] ring-1 ring-black/5">
                    <HandHeart className="h-4 w-4" /> Jalur cepat
                  </div>
                  <div className="mt-3 text-lg font-semibold text-[#005A32]">Janji Temu = form → WA rapi</div>
                  <p className="mt-2 text-sm text-black/70">Cocok untuk undangan & koordinasi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="reveal" ref={reveal}>
          <Card>
            <div className="text-xl font-semibold text-black">Hubungi kami</div>
            <div className="mt-1 text-sm text-black/65">Pilih kanal yang paling nyaman.</div>

            <div className="mt-5 space-y-3">
              <LinkRow
                icon={WhatsAppIcon}
                label="WhatsApp"
                value={CONTACT.whatsappNumber || "Isi nomor WhatsApp"}
                onCopy={CONTACT.whatsappNumber ? () => copyText(CONTACT.whatsappNumber) : undefined}
                href={waHref || undefined}
              />
              <LinkRow
                icon={Mail}
                label="Email"
                value={CONTACT.email || "Isi email"}
                onCopy={CONTACT.email ? () => copyText(CONTACT.email) : undefined}
                href={mailHref || undefined}
              />
              <LinkRow
                icon={Phone}
                label="Telepon"
                value={CONTACT.phoneNumber || "Isi nomor telepon"}
                onCopy={CONTACT.phoneNumber ? () => copyText(CONTACT.phoneNumber) : undefined}
                href={telHref || undefined}
              />
              <LinkRow
                icon={Instagram}
                label="Instagram"
                value={CONTACT.instagram || "Isi link Instagram"}
                onCopy={CONTACT.instagram ? () => copyText(CONTACT.instagram) : undefined}
                href={CONTACT.instagram || undefined}
              />
            </div>
          </Card>
        </div>

        <div className="reveal" ref={reveal}>
          <Card className="overflow-hidden p-0">
            <div className="p-5">
              <div className="text-xl font-semibold text-black">Lokasi & Jam Layanan</div>
              <div className="mt-2 rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/5">
                <div className="text-sm font-semibold text-black">{CONTACT.officeName}</div>
                <div className="mt-1 text-sm text-black/70">{CONTACT.addressLine1}</div>
                <div className="text-sm text-black/70">{CONTACT.addressLine2}</div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {CONTACT.serviceHours.map((h) => (
                  <div key={h.day} className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
                    <div className="text-sm font-semibold text-black">{h.day}</div>
                    <div className="mt-1 text-sm text-black/70">{h.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[280px] w-full bg-white">
              <iframe
                title="Google Maps"
                src={CONTACT.mapEmbedUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10 reveal" ref={reveal}>
        <div className="mb-3">
          <div className="text-2xl font-semibold tracking-tight text-black">Pertanyaan Umum</div>
          <div className="mt-1 text-sm text-black/65">Biar warga nggak bingung langkahnya.</div>
        </div>
        <Accordion items={faq} />
      </div>

      <div className="h-8" />
    </section>
  );
}
