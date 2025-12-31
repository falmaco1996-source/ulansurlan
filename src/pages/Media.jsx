import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  HandHeart,
  Leaf,
  Link2,
  MapPin,
  MessagesSquare,
  Newspaper,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";

/**
 * =========================================================
 *  MEDIA.jsx — PKB Themed (ramai foto + animasi)
 *  - Hero + Featured: Program Ambulans Gratis
 *  - Slideshow: crossfade + Ken Burns + progress + thumbnails
 *  - Grid Galeri: hover + reveal + lightbox (klik)
 *  - Press / Rilis / Publikasi: layout modern
 *  - Fallback gambar: coba beberapa src otomatis
 *
 *  TARUH FOTO DI:
 *  /public/galeri/media-amb-01.jpg ... media-amb-04.jpg
 *  /public/galeri/media-01.jpg ... media-24.jpg (opsional)
 *
 *  Kalau kamu simpan dengan nama WhatsApp, script ini juga
 *  coba fallback ke URL encoded:
 *   "WhatsApp Image 2025-12-31 at 10.04.42.jpeg"
 *   "WhatsApp Image 2025-12-31 at 10.04.42 (1).jpeg"
 *   "WhatsApp Image 2025-12-31 at 10.04.42 (2).jpeg"
 *   "WhatsApp Image 2025-12-31 at 10.04.42 (3).jpeg"
 * =========================================================
 */

const PKB = {
  green: "#007744",
  greenDark: "#005A32",
  yellow: "#FFF212",
  yellowDark: "#F4E400",
  soft: "#EAF7EF",
};

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function isHttpUrl(v) {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
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
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const add = (el) => {
    if (!el) return;
    if (!refs.current.includes(el)) refs.current.push(el);
  };
  return add;
}

/** Image: coba beberapa src (fallback chain) */
function SmartImage({
  srcs,
  alt,
  className,
  overlay = true,
  rounded = "rounded-2xl",
  imgClassName = "",
}) {
  const list = Array.isArray(srcs) ? srcs.filter(Boolean) : [srcs].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setIdx(0);
    setBroken(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(srcs) ? srcs.join("|") : srcs]);

  const src = list[idx];

  if (!src || broken) {
    return (
      <div
        className={cn(
          "relative grid place-items-center bg-gradient-to-br from-[rgba(0,119,68,0.14)] via-white to-[rgba(255,242,18,0.20)] text-center",
          rounded,
          className
        )}
      >
        <div className="px-5">
          <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5">
            <Sparkles className="h-5 w-5 text-[#005A32]" />
          </div>
          <div className="text-xs font-semibold text-[#005A32]">Foto belum tersedia</div>
          <div className="mt-1 text-[11px] text-black/55">
            Tambahkan di <span className="font-mono">/public/galeri/</span>
          </div>
        </div>
        {overlay ? (
          <div className={cn("pointer-events-none absolute inset-0", rounded, "ring-1 ring-black/5")} />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative", rounded, className)}>
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", rounded, imgClassName)}
        loading="lazy"
        decoding="async"
        referrerPolicy={isHttpUrl(src) ? "no-referrer" : undefined}
        onError={() => {
          if (idx + 1 < list.length) setIdx((v) => v + 1);
          else setBroken(true);
        }}
      />
      {overlay ? (
        <div className={cn("pointer-events-none absolute inset-0", rounded, "ring-1 ring-black/5")} />
      ) : null}
    </div>
  );
}

function Chip({ icon: Icon, children, tone = "soft" }) {
  const toneCls =
    tone === "solid"
      ? "bg-[#007744] text-white ring-1 ring-[#007744]/20"
      : "bg-white/65 text-[#005A32] ring-1 ring-black/5 backdrop-blur";
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", toneCls)}>
      {Icon ? <Icon className={cn("h-4 w-4", tone === "solid" ? "text-[#FFF212]" : "text-[#007744]")} /> : null}
      {children}
    </span>
  );
}

function Card({ className = "", children }) {
  return (
    <div className={cn("rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm", className)}>{children}</div>
  );
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(0,119,68,0.20)] ring-1 ring-[#007744]/30 hover:opacity-95 active:translate-y-[1px]"
    >
      <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,242,18,0.30),transparent_55%)]" />
      <span className="relative">{children}</span>
      <ArrowRight className="relative h-4 w-4" />
    </button>
  );
}

function YellowButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-[#F4E400] bg-[#FFF212] px-5 py-3 text-sm font-semibold text-[#005A32] shadow-[0_16px_30px_rgba(255,242,18,0.18)] hover:brightness-95 active:translate-y-[1px]"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function SecondaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-[#007744]/20 bg-white/70 px-5 py-3 text-sm font-semibold text-[#005A32] hover:bg-white active:translate-y-[1px]"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function Slideshow({ slides }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeSlides = Array.isArray(slides) ? slides.filter(Boolean) : [];
  const len = safeSlides.length || 1;

  useEffect(() => {
    if (reduced || paused || safeSlides.length <= 1) return;
    const t = setInterval(() => setActive((p) => (p + 1) % safeSlides.length), 5200);
    return () => clearInterval(t);
  }, [reduced, paused, safeSlides.length]);

  const prev = () => setActive((p) => (p - 1 + len) % len);
  const next = () => setActive((p) => (p + 1) % len);

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {!reduced && safeSlides.length > 1 ? (
        <div className="absolute left-0 top-0 z-20 h-1 w-full bg-black/10">
          <div key={active} className="h-full bg-[#FFF212] prog" />
        </div>
      ) : null}

      <div className="relative h-[300px] w-full sm:h-[380px] lg:h-[440px]">
        {safeSlides.map((s, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition duration-700",
              i === active ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className={cn("absolute inset-0", !reduced ? "kenburns" : "")}>
              <SmartImage
                srcs={s.srcs}
                alt={s.title}
                className="h-full w-full"
                rounded="rounded-none"
                overlay={false}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute left-5 right-5 bottom-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#005A32]">
                <Star className="h-4 w-4 text-[#007744]" />
                {s.tag}
              </div>
              <div className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">{s.title}</div>
              <div className="mt-1 text-sm text-white/90 sm:text-base">{s.desc}</div>
            </div>
          </div>
        ))}

        {safeSlides.length > 1 ? (
          <div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between">
            <button
              onClick={prev}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/85 backdrop-blur hover:bg-white"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="h-5 w-5 text-[#005A32]" />
            </button>
            <button
              onClick={next}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/85 backdrop-blur hover:bg-white"
              aria-label="Berikutnya"
            >
              <ChevronRight className="h-5 w-5 text-[#005A32]" />
            </button>
          </div>
        ) : null}
      </div>

      {/* thumbnails */}
      {safeSlides.length > 1 ? (
        <div className="border-t border-black/5 bg-white/70 p-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {safeSlides.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "relative overflow-hidden rounded-2xl ring-1 ring-black/10 shrink-0",
                  i === active
                    ? "outline outline-2 outline-[#FFF212] shadow-[0_10px_22px_rgba(255,242,18,0.20)]"
                    : "opacity-80 hover:opacity-100"
                )}
                style={{ width: 128, height: 76 }}
                aria-label={`Pilih slide ${i + 1}`}
              >
                <SmartImage srcs={s.srcs} alt={s.title} className="h-full w-full" rounded="rounded-2xl" overlay={false} />
                {i === active ? <div className="absolute inset-0 bg-black/10" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .kenburns, .prog { animation: none !important; }
        }
        .kenburns { animation: kenburns 6s ease-out both; }
        @keyframes kenburns {
          from { transform: scale(1.03); }
          to { transform: scale(1.12); }
        }
        .prog { width: 0%; animation: prog 5.2s linear forwards; }
        @keyframes prog { to { width: 100%; } }
      `}</style>
    </div>
  );
}

function Lightbox({ open, onClose, items, index, setIndex }) {
  const reduced = useReducedMotion();
  const item = items?.[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") setIndex?.((i) => (i - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") setIndex?.((i) => (i + 1) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items?.length, onClose, setIndex]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/90 hover:bg-white"
        aria-label="Tutup"
      >
        <X className="h-5 w-5 text-[#005A32]" />
      </button>

      <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-4">
        <div className={cn("relative w-full overflow-hidden rounded-3xl bg-white ring-1 ring-black/10 shadow-2xl")}>
          <div className="relative h-[65vh] min-h-[320px] bg-black">
            <SmartImage
              srcs={item.srcs}
              alt={item.title || "Foto"}
              className="h-full w-full"
              rounded="rounded-none"
              overlay={false}
              imgClassName={cn(!reduced ? "lb-zoom" : "")}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
              <div className="flex flex-wrap items-center gap-2">
                {item.badge ? <Chip tone="solid" icon={Camera}>{item.badge}</Chip> : null}
                {item.tag ? <Chip icon={Star}>{item.tag}</Chip> : null}
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{item.title}</div>
              {item.desc ? <div className="mt-1 text-sm text-white/90">{item.desc}</div> : null}
            </div>

            {items.length > 1 ? (
              <>
                <button
                  onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-2xl bg-white/85 hover:bg-white"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5 text-[#005A32]" />
                </button>
                <button
                  onClick={() => setIndex((i) => (i + 1) % items.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-2xl bg-white/85 hover:bg-white"
                  aria-label="Berikutnya"
                >
                  <ChevronRight className="h-5 w-5 text-[#005A32]" />
                </button>
              </>
            ) : null}
          </div>

          <div className="border-t border-black/5 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-black/60">
                {index + 1} / {items.length}
              </div>
              <div className="text-xs text-black/60">
                Klik panah / tekan ← → untuk pindah foto
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) { .lb-zoom { animation: none !important; } }
        .lb-zoom { animation: lb 8s ease-out both; }
        @keyframes lb { from { transform: scale(1.02); } to { transform: scale(1.09); } }
      `}</style>
    </div>
  );
}

export default function Media() {
  const navigate = useNavigate();
  const reveal = useReveal();

  // Fallback ke nama file WhatsApp (URL encoded) jika kamu tidak rename
  const wa1 = "/galeri/WhatsApp%20Image%202025-12-31%20at%2010.04.42.jpeg";
  const wa2 = "/galeri/WhatsApp%20Image%202025-12-31%20at%2010.04.42%20(1).jpeg";
  const wa3 = "/galeri/WhatsApp%20Image%202025-12-31%20at%2010.04.42%20(2).jpeg";
  const wa4 = "/galeri/WhatsApp%20Image%202025-12-31%20at%2010.04.42%20(3).jpeg";

  const profile = useMemo(
    () => ({
      name: "Mochammad Ulan Surlan",
      title: "Anggota DPRD Kota Bandung",
      faction: "Fraksi PKB",
      dapil: "Dapil 1",
      highlight:
        "Media ini berisi dokumentasi kegiatan lapangan, publikasi, dan sorotan program yang dekat dengan kebutuhan warga—termasuk Program Ambulans Gratis.",
    }),
    []
  );

  const ambulanceStory = useMemo(
    () => ({
      tag: "Program Unggulan",
      title: "Ambulans Gratis",
      desc:
        "Fokus layanan cepat untuk kebutuhan darurat/rujukan warga. Dokumentasi berikut menunjukkan kerja lapangan & respon langsung di situasi nyata.",
      bullets: [
        "Respons cepat & koordinasi lapangan.",
        "Pendampingan warga saat rujukan/antar pasien (sesuai kebutuhan & ketersediaan).",
        "Transparan: lokasi & kronologi dibuat jelas dalam dokumentasi.",
      ],
      cta1: { label: "Ajukan Bantuan / Janji Temu", to: "/kontak" },
      cta2: { label: "Kirim Aspirasi", to: "/aspirasi" },
      cover: {
        srcs: ["/galeri/media-amb-01.jpg", wa1, "/galeri/media-01.jpg", "/galeri/01.jpg"],
      },
      gallery: [
        {
          badge: "Ambulans Gratis",
          tag: "Tindakan Lapangan",
          title: "Evakuasi & pendampingan warga",
          desc: "Kondisi lapangan: tim bergerak cepat bantu proses evakuasi/antar pasien.",
          srcs: ["/galeri/media-amb-01.jpg", wa1],
        },
        {
          badge: "Ambulans Gratis",
          tag: "Branding Program",
          title: "Identitas layanan di kendaraan",
          desc: "Kendaraan layanan dengan identitas program untuk memudahkan warga mengenali.",
          srcs: ["/galeri/media-amb-02.jpg", wa3],
        },
        {
          badge: "Ambulans Gratis",
          tag: "Koordinasi",
          title: "Loading pasien & koordinasi tim",
          desc: "Koordinasi tim dan warga saat proses loading/rujukan.",
          srcs: ["/galeri/media-amb-03.jpg", wa2],
        },
        {
          badge: "Ambulans Gratis",
          tag: "Layanan Darurat",
          title: "Rujukan malam hari",
          desc: "Dokumentasi rujukan/antar pasien pada malam hari (kondisi darurat).",
          srcs: ["/galeri/media-amb-04.jpg", wa4],
        },
      ],
    }),
    []
  );

  const slides = useMemo(
    () => [
      {
        tag: "Ambulans Gratis",
        title: "Program layanan yang dekat kebutuhan warga",
        desc: "Dokumentasi lapangan: membantu proses rujukan dan respon cepat.",
        srcs: ambulanceStory.cover.srcs,
      },
      {
        tag: "Dokumentasi",
        title: "Transparansi: kronologi dibuat jelas",
        desc: "Media dibuat agar warga bisa menilai kerja nyata, bukan sekadar wacana.",
        srcs: ["/galeri/media-02.jpg", "/galeri/02.jpg", wa2],
      },
      {
        tag: "Kolaborasi",
        title: "Kerja bareng RT/RW, komunitas, dan relawan",
        desc: "Gotong royong mempercepat penanganan dan koordinasi.",
        srcs: ["/galeri/media-03.jpg", "/galeri/03.jpg", wa3],
      },
      {
        tag: "Pelayanan",
        title: "Fokus pada dampak yang terasa",
        desc: "Kegiatan disusun agar warga bisa lihat hasil & tindak lanjut.",
        srcs: ["/galeri/media-04.jpg", "/galeri/04.jpg", wa4],
      },
    ],
    [ambulanceStory.cover.srcs]
  );

  const quickCards = useMemo(
    () => [
      {
        icon: Camera,
        title: "Galeri Kegiatan",
        desc: "Kumpulan foto lapangan, kegiatan warga, dan dokumentasi program.",
        action: () => {
          const el = document.getElementById("galeri-grid");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        btn: "Lihat Galeri",
      },
      {
        icon: Newspaper,
        title: "Publikasi & Rilis",
        desc: "Ringkasan narasi kegiatan: tanggal, lokasi, tujuan, dan hasil singkat.",
        action: () => {
          const el = document.getElementById("rilis");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        btn: "Buka Rilis",
      },
      {
        icon: ShieldCheck,
        title: "Transparansi",
        desc: "Dokumentasi dibuat rapi agar warga bisa memantau progres dan rute tindak lanjut.",
        action: () => navigate("/kinerja"),
        btn: "Lihat Kinerja",
      },
      {
        icon: MessagesSquare,
        title: "Aspirasi Warga",
        desc: "Warga bisa kirim aspirasi/usulan/aduan agar dapat ditindaklanjuti.",
        action: () => navigate("/aspirasi"),
        btn: "Kirim Aspirasi",
      },
    ],
    [navigate]
  );

  const mediaPosts = useMemo(
    () => [
      {
        badge: "Publikasi/Media",
        title: "Ambulans Gratis: respon cepat & pendampingan warga",
        meta: "Kota Bandung • Dokumentasi program",
        icon: HandHeart,
        linkLabel: "Baca ringkasan",
        href: "#",
        points: [
          "Koordinasi lapangan bersama warga dan relawan.",
          "Pendampingan rujukan/antar pasien sesuai kebutuhan & ketersediaan.",
          "Dokumentasi dibuat jelas agar bisa dicek.",
        ],
      },
      {
        badge: "Parlemen Talks",
        title: "Gotong royong: memperkuat layanan warga dari tingkat RW",
        meta: "Dapil 1 • Wilayah Coblong–Cidadap–Bandung Wetan–Cibeunying–Sumur Bandung",
        icon: Users,
        linkLabel: "Lihat detail",
        href: "#",
        points: [
          "Pemetaan kebutuhan kewilayahan.",
          "Kolaborasi RT/RW, komunitas, UMKM.",
          "Prioritas pada dampak yang terasa di warga.",
        ],
      },
      {
        badge: "Seed",
        title: "Transparansi data: dokumentasi, tanggal, lokasi, dan progres",
        meta: "Sistem • Ringkasan kegiatan terstruktur",
        icon: BadgeCheck,
        linkLabel: "Lihat contoh",
        href: "#",
        points: [
          "Ringkasan singkat + rujukan jika tersedia.",
          "Update progres agar tidak menggantung.",
          "Warga mudah memantau.",
        ],
      },
    ],
    []
  );

  // Galeri besar (ramai). Kamu tinggal isi file di /public/galeri/
  const gallery = useMemo(() => {
    const base = [];

    // 4 foto ambulans (prioritas)
    ambulanceStory.gallery.forEach((g) => base.push(g));

    // Tambah 20 slot foto umum (media-01..media-20)
    for (let i = 1; i <= 20; i++) {
      const n = String(i).padStart(2, "0");
      base.push({
        badge: "Dokumentasi",
        tag: "Kegiatan",
        title: `Dokumentasi Kegiatan #${n}`,
        desc: "Tambahkan caption jika perlu (opsional).",
        srcs: [`/galeri/media-${n}.jpg`, `/galeri/${n}.jpg`],
      });
    }

    return base;
  }, [ambulanceStory.gallery]);

  // Lightbox state
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);

  return (
    <section className="mt-6 pb-10">
      <style>{`
        :root{
          --pkb-green:${PKB.green};
          --pkb-green-dark:${PKB.greenDark};
          --pkb-yellow:${PKB.yellow};
          --pkb-soft:${PKB.soft};
        }

        /* reveal */
        .reveal { opacity:0; transform: translateY(12px); filter: blur(2px); transition: opacity .65s ease, transform .65s ease, filter .65s ease; }
        .reveal.is-visible { opacity:1; transform: translateY(0); filter: blur(0); }

        /* bg pattern */
        .pkb-grid {
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,.06) 1px, transparent 0);
          background-size: 18px 18px;
        }
        .ribbon { background: linear-gradient(90deg, rgba(0,119,68,1), rgba(12,140,90,1), rgba(255,242,18,1)); }

        @media (prefers-reduced-motion: reduce) {
          .floaty, .shine, .tilt { animation:none !important; }
        }

        .floaty { animation: floaty 10s ease-in-out infinite; }
        @keyframes floaty { 0%,100%{ transform: translate(0,0)} 50%{ transform: translate(10px, -12px)} }

        .shine { position: relative; overflow:hidden; }
        .shine::after{
          content:"";
          position:absolute; inset:-40% -80%;
          background: linear-gradient(110deg, transparent 30%, rgba(255,242,18,.22) 45%, transparent 60%);
          transform: translateX(-30%);
          animation: shine 6.5s ease-in-out infinite;
          pointer-events:none;
        }
        @keyframes shine {
          0%,45% { transform: translateX(-30%) }
          55%,100% { transform: translateX(35%) }
        }

        .tilt { transition: transform .25s ease, box-shadow .25s ease; }
        .tilt:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(0,0,0,.08); }
      `}</style>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border bg-white">
        <div className="h-1 w-full ribbon" />
        <div className="relative pkb-grid bg-gradient-to-b from-[rgba(234,247,239,0.9)] via-white to-[rgba(255,242,18,0.16)] p-6 sm:p-10">
          {/* glow blobs */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(0,119,68,0.14)] blur-3xl floaty" />
          <div className="pointer-events-none absolute -right-28 -bottom-28 h-80 w-80 rounded-full bg-[rgba(255,242,18,0.20)] blur-3xl floaty" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="reveal" ref={reveal}>
              <div className="flex flex-wrap gap-2">
                <Chip icon={Leaf}>{profile.faction}</Chip>
                <Chip icon={MapPin}>{profile.dapil}</Chip>
                <Chip icon={Newspaper}>Media</Chip>
                <Chip icon={Camera}>Dokumentasi</Chip>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#0a0a0a] sm:text-4xl">
                Media{" "}
                <span className="text-[#007744]">& Dokumentasi</span>
              </h1>

              <p className="mt-2 text-sm text-black/65 sm:text-base">
                {profile.name} • {profile.title} • {profile.faction}
              </p>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/75">
                {profile.highlight}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <PrimaryButton onClick={() => navigate("/kontak")}>Ajukan Janji Temu</PrimaryButton>
                <YellowButton onClick={() => navigate("/aspirasi")}>Kirim Aspirasi</YellowButton>
                <SecondaryButton onClick={() => navigate("/kinerja")}>Lihat Kinerja</SecondaryButton>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {quickCards.map((c, i) => (
                  <div key={i} className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5 tilt">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[rgba(0,119,68,0.10)] text-[#007744]">
                        <c.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#0a0a0a]">{c.title}</div>
                        <div className="mt-1 text-xs text-black/70">{c.desc}</div>
                        <button
                          onClick={c.action}
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[rgba(255,242,18,0.55)] px-3 py-1 text-xs font-extrabold text-[#005A32] ring-1 ring-[#F4E400]/60 hover:brightness-95"
                        >
                          {c.btn} <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Featured */}
            <div className="reveal" ref={reveal}>
              <div className="shine overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm">
                <div className="relative">
                  <SmartImage
                    srcs={ambulanceStory.cover.srcs}
                    alt="Program Ambulans Gratis"
                    className="h-[240px] sm:h-[300px]"
                    rounded="rounded-none"
                    overlay={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute left-5 bottom-5 right-5">
                    <Chip tone="solid" icon={HandHeart}>{ambulanceStory.tag}</Chip>
                    <div className="mt-3 text-2xl font-semibold text-white">{ambulanceStory.title}</div>
                    <div className="mt-1 text-sm text-white/90">{ambulanceStory.desc}</div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[rgba(0,119,68,0.08)] p-4 ring-1 ring-black/5">
                      <div className="text-xs font-bold text-[#005A32]">Fokus</div>
                      <div className="mt-1 text-sm font-semibold text-[#0a0a0a]">Darurat & rujukan</div>
                      <div className="mt-1 text-xs text-black/65">Mengutamakan kebutuhan mendesak.</div>
                    </div>
                    <div className="rounded-2xl bg-[rgba(255,242,18,0.35)] p-4 ring-1 ring-black/5">
                      <div className="text-xs font-bold text-[#005A32]">Pendampingan</div>
                      <div className="mt-1 text-sm font-semibold text-[#0a0a0a]">Koordinasi lapangan</div>
                      <div className="mt-1 text-xs text-black/65">Bersama warga/relawan sesuai kondisi.</div>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                      <div className="text-xs font-bold text-[#005A32]">Transparan</div>
                      <div className="mt-1 text-sm font-semibold text-[#0a0a0a]">Dokumentasi rapi</div>
                      <div className="mt-1 text-xs text-black/65">Foto + ringkasan + konteks.</div>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-black/70">
                    {ambulanceStory.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#007744]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <PrimaryButton onClick={() => navigate(ambulanceStory.cta1.to)}>
                      {ambulanceStory.cta1.label}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => navigate(ambulanceStory.cta2.to)}>
                      {ambulanceStory.cta2.label}
                    </SecondaryButton>
                  </div>
                </div>
              </div>

              {/* mini strip */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ambulanceStory.gallery.slice(0, 2).map((g, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setLbIndex(i);
                      setLbOpen(true);
                    }}
                    className="group relative overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm tilt text-left"
                  >
                    <div className="relative h-44">
                      <SmartImage srcs={g.srcs} alt={g.title} className="h-full w-full" rounded="rounded-none" overlay={false} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-90" />
                      <div className="absolute left-3 top-3 rounded-full bg-[#FFF212] px-3 py-1 text-[11px] font-extrabold text-[#005A32] shadow-sm">
                        PKB
                      </div>
                      <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-2xl bg-white/85">
                        <Play className="h-4 w-4 text-[#005A32]" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-semibold text-[#0a0a0a]">{g.title}</div>
                      <div className="mt-1 text-xs text-black/65">{g.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDESHOW */}
      <div className="mt-10 reveal" ref={reveal}>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
              Sorotan Media
            </div>
            <div className="mt-1 text-sm text-black/65">
              Auto-play + progress + Ken Burns. Cocok untuk banner dokumentasi.
            </div>
          </div>
          <button
            onClick={() => navigate("/kontak")}
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Hubungi Tim <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <Slideshow slides={slides} />
      </div>

      {/* RILIS / POSTS */}
      <div id="rilis" className="mt-12 reveal" ref={reveal}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
              Publikasi & Rilis Singkat
            </div>
            <div className="mt-1 text-sm text-black/65">
              Format ringkas yang mudah dibaca: tujuan, lokasi, hasil singkat.
            </div>
          </div>
          <div className="text-xs font-semibold text-[#005A32]">
            Tips: nanti bisa dihubungkan ke Supabase table <span className="font-mono">media</span>.
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {mediaPosts.map((p, i) => (
            <Card key={i} className="relative overflow-hidden tilt">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[rgba(255,242,18,0.18)] blur-3xl" />
              <div className="flex items-start justify-between gap-3">
                <Chip icon={p.icon}>{p.badge}</Chip>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(0,119,68,0.10)]">
                  <p.icon className="h-5 w-5 text-[#007744]" />
                </div>
              </div>

              <div className="mt-4 text-lg font-semibold text-[#0a0a0a]">{p.title}</div>
              <div className="mt-1 text-xs text-black/60">{p.meta}</div>

              <ul className="mt-4 space-y-2 text-sm text-black/70">
                {p.points.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#FFF212]" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    // placeholder (nanti isi link asli)
                    // eslint-disable-next-line no-alert
                    alert("Nanti link publikasi/liputan bisa ditaruh di sini.");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#007744]/20 bg-white/70 px-4 py-2 text-sm font-semibold text-[#005A32] hover:bg-white"
                >
                  <Link2 className="h-4 w-4" />
                  {p.linkLabel}
                </button>
                <button
                  onClick={() => navigate("/aspirasi")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                >
                  Aspirasi <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AMBULANCE SECTION (detail) */}
      <div className="mt-12 reveal" ref={reveal}>
        <div className="rounded-3xl border bg-gradient-to-br from-[#007744] to-[#005A32] p-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <HandHeart className="h-4 w-4" />
                Program Ambulans Gratis
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">
                Layanan yang “kerasa” dampaknya di warga
              </div>
              <div className="mt-2 max-w-2xl text-sm text-white/85">
                Fokus pada koordinasi lapangan, pendampingan, dan dokumentasi yang jelas.
                (Pelaksanaan menyesuaikan kebutuhan & ketersediaan tim/layanan.)
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <YellowButton onClick={() => navigate("/kontak")}>Ajukan Bantuan</YellowButton>
              <SecondaryButton onClick={() => navigate("/kinerja")}>Cek Kinerja</SecondaryButton>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, title: "Koordinasi", desc: "Respon & komunikasi cepat." },
              { icon: MapPin, title: "Lokasi jelas", desc: "Dokumentasi lokasi/konteks." },
              { icon: CalendarDays, title: "Terjadwal/insidental", desc: "Menyesuaikan kebutuhan." },
              { icon: ShieldCheck, title: "Aman & rapi", desc: "Proses ditata sebaik mungkin." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold">{s.title}</div>
                <div className="mt-1 text-xs text-white/80">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div id="galeri-grid" className="mt-12 reveal" ref={reveal}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
              Galeri Media
            </div>
            <div className="mt-1 text-sm text-black/65">
              Klik foto untuk zoom (lightbox). Hover untuk efek.
            </div>
          </div>
          <div className="text-xs font-semibold text-[#005A32]">
            Rekomendasi: isi 24–60 foto agar galeri “hidup”.
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((g, i) => (
            <button
              key={i}
              onClick={() => {
                setLbIndex(i);
                setLbOpen(true);
              }}
              className="group overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm tilt text-left"
            >
              <div className="relative h-44">
                <SmartImage
                  srcs={g.srcs}
                  alt={g.title}
                  className="h-full w-full"
                  rounded="rounded-none"
                  overlay={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80" />
                <div className="absolute left-3 top-3 rounded-full bg-[#FFF212] px-3 py-1 text-[11px] font-extrabold text-[#005A32] shadow-sm">
                  PKB
                </div>
                <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-2xl bg-white/85">
                  <Play className="h-4 w-4 text-[#005A32]" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold text-[#0a0a0a]">{g.title}</div>
                <div className="mt-1 text-xs text-black/65">{g.desc}</div>
                <div className="mt-3 h-[2px] w-10 bg-[#007744] opacity-60 transition group-hover:w-16" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA BOTTOM */}
      <div className="mt-12 reveal" ref={reveal}>
        <div className="rounded-3xl border bg-gradient-to-br from-[rgba(234,247,239,1)] via-white to-[rgba(255,242,18,0.20)] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
                <Building2 className="h-4 w-4 text-[#007744]" />
                Informasi & Koordinasi
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0a0a0a]">
                Mau liputan / kolaborasi / dokumentasi kegiatan?
              </div>
              <div className="mt-2 max-w-2xl text-sm text-black/70">
                Kamu bisa hubungi lewat menu Kontak. Sertakan lokasi, waktu, dan tujuan agar tim bisa menyiapkan.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={() => navigate("/kontak")}>Kontak</PrimaryButton>
              <SecondaryButton onClick={() => navigate("/aspirasi")}>Aspirasi</SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        open={lbOpen}
        onClose={() => setLbOpen(false)}
        items={gallery}
        index={lbIndex}
        setIndex={setLbIndex}
      />

      <div className="h-8" />
    </section>
  );
}
rttdrh
