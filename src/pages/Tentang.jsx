import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HandHeart,
  Leaf,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

/**
 * =========================================================
 *  TENTANG.jsx — PKB Themed (lebih eye-catching + foto)
 *  - Warna PKB lebih kuat (green/yellow)
 *  - Slideshow: crossfade + Ken Burns + progress + thumbnails
 *  - Foto: pakai upload kamu (01..06)
 *  - Animasi: otomatis mati kalau prefers-reduced-motion
 *
 *  UPDATE: "Galeri Foto" DIHAPUS karena sudah ada di menu Media.
 *  Diganti rubrik: Program & Prioritas + Timeline + FAQ + Stat.
 * =========================================================
 *
 * FOTO KAMU:
 *  /public/galeri/01.jpg  (podium)
 *  /public/galeri/02.webp (portrait PKB)
 *  /public/galeri/03.jpg  (rapat closeup)
 *  /public/galeri/04.webp (duduk meja)
 *  /public/galeri/05.webp (kegiatan lapangan PKB)
 *  /public/galeri/06.jpg  (bazar/UMKM)
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

function isHttpUrl(v) {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
}

/** Image: coba beberapa src (fallback chain) */
function SmartImage({
  srcs,
  alt,
  className,
  overlay = true,
  rounded = "rounded-2xl",
}) {
  const list = Array.isArray(srcs) ? srcs.filter(Boolean) : [srcs].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setIdx(0);
    setBroken(false);
  }, [srcs?.join?.("|")]);

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
        className={cn("h-full w-full object-cover", rounded)}
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

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5 backdrop-blur">
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

function SectionHeader({ title, desc, right }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">{title}</div>
        {desc ? <div className="mt-1 text-sm text-black/65">{desc}</div> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
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

/** Count-up kecil buat stat (aman & ringan) */
function CountUp({ to = 0, suffix = "", className = "" }) {
  const reduced = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (reduced) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 800;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduced]);

  return (
    <span className={cn("tabular-nums", className)}>
      {val}
      {suffix}
    </span>
  );
}

function Slideshow({ slides }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    const t = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 5200);
    return () => clearInterval(t);
  }, [reduced, paused, slides.length]);

  const prev = () => setActive((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setActive((p) => (p + 1) % slides.length);

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {!reduced ? (
        <div className="absolute left-0 top-0 z-20 h-1 w-full bg-black/10">
          <div key={active} className="h-full bg-[#FFF212] prog" />
        </div>
      ) : null}

      <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[420px]">
        {slides.map((s, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition duration-700",
              i === active ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <div className={cn("absolute inset-0", !reduced ? "kenburns" : "")}>
              <SmartImage srcs={s.srcs} alt={s.title} className="h-full w-full" rounded="rounded-none" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute left-5 right-5 bottom-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#005A32]">
                <Star className="h-4 w-4 text-[#007744]" />
                {s.tag}
              </div>
              <div className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {s.title}
              </div>
              <div className="mt-1 text-sm text-white/90 sm:text-base">{s.desc}</div>
            </div>
          </div>
        ))}

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
      </div>

      <div className="border-t border-black/5 bg-white/70 p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative overflow-hidden rounded-2xl ring-1 ring-black/10 shrink-0",
                i === active
                  ? "outline outline-2 outline-[#FFF212] shadow-[0_10px_22px_rgba(255,242,18,0.20)]"
                  : "opacity-80 hover:opacity-100"
              )}
              style={{ width: 120, height: 72 }}
              aria-label={`Pilih slide ${i + 1}`}
            >
              <SmartImage
                srcs={s.srcs}
                alt={s.title}
                className="h-full w-full"
                rounded="rounded-2xl"
                overlay={false}
              />
              {i === active ? <div className="absolute inset-0 bg-black/10" /> : null}
            </button>
          ))}
        </div>
      </div>

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

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className="rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-semibold text-[#0a0a0a]">{q}</div>
          <div className="mt-1 text-xs text-black/55">Klik untuk lihat jawaban</div>
        </div>
        <div
          className={cn(
            "mt-1 grid h-9 w-9 place-items-center rounded-2xl bg-[rgba(0,119,68,0.10)] text-[#007744] transition",
            open ? "rotate-180" : "rotate-0"
          )}
        >
          <ChevronDownIcon />
        </div>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden px-4 pb-4">
          <div className="rounded-2xl bg-[rgba(234,247,239,0.7)] p-4 text-sm text-black/75">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}

/** icon kecil supaya gak nambah import baru */
function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Tentang() {
  const navigate = useNavigate();
  const reveal = useReveal();

  // === PATH FOTO KAMU ===
  const IMG = useMemo(
    () => ({
      podium: "/galeri/01.jpg",
      portraitPKB: "/galeri/02.webp",
      rapat: "/galeri/03.jpg",
      meja: "/galeri/04.webp",
      lapangan: "/galeri/05.webp",
      bazar: "/galeri/06.jpg",
    }),
    []
  );

  const profile = useMemo(
    () => ({
      name: "Mochammad Ulan Surlan",
      title: "Anggota DPRD Kota Bandung",
      faction: "Fraksi PKB",
      dapil: "Dapil 1",
      roles: ["Komisi I", "Badan Musyawarah"],
      area: [
        "Coblong",
        "Cidadap",
        "Bandung Wetan",
        "Cibeunying Kaler",
        "Cibeunying Kidul",
        "Sumur Bandung",
      ],
      tagline: "Kerja yang bisa dicek, data yang bisa ditelusuri, dan aspirasi yang ditangani dengan rapi.",
      intro:
        "Halaman ini dibuat agar warga bisa mengenal profil singkat, fokus kerja, dan cara menyampaikan aspirasi. Nuansa visual mengikuti identitas hijau–kuning agar terasa PKB, tapi tetap modern dan bersih.",
    }),
    []
  );

  // === SLIDESHOW ===
  const slides = useMemo(
    () => [
      {
        tag: "Aspirasi Warga",
        title: "Mendengar dulu, baru bertindak",
        desc: "Serap aspirasi lapangan: kebutuhan warga jadi dasar penyusunan prioritas dan pengawalan program.",
        srcs: [IMG.lapangan, IMG.portraitPKB],
      },
      {
        tag: "Transparansi",
        title: "Komunikasi publik yang rapi dan jelas",
        desc: "Kegiatan, ringkasan, dan konteks dibuat mudah dipahami agar warga bisa ikut mengawasi.",
        srcs: [IMG.podium, IMG.rapat],
      },
      {
        tag: "Kolaborasi",
        title: "Kerja bareng komunitas & UMKM",
        desc: "Gotong royong: memperkuat ekosistem warga agar program tidak berhenti di wacana.",
        srcs: [IMG.bazar, IMG.lapangan],
      },
      {
        tag: "Pelayanan",
        title: "Fokus pada dampak yang terasa",
        desc: "Kerja-kerja dekat warga: layanan publik, ekonomi lokal, dan program sosial yang tepat sasaran.",
        srcs: [IMG.meja, IMG.rapat],
      },
    ],
    [IMG]
  );

  const values = useMemo(
    () => [
      {
        icon: ShieldCheck,
        title: "Bersih & akuntabel",
        desc: "Kegiatan dan progres dibuat rapi agar warga bisa memantau, bukan sekadar percaya.",
      },
      {
        icon: Users,
        title: "Partisipatif",
        desc: "Warga dilibatkan sejak awal: pemetaan kebutuhan, prioritas, hingga evaluasi.",
      },
      {
        icon: HandHeart,
        title: "Berpihak pada warga",
        desc: "Fokus pada isu harian: layanan, ketertiban, ekonomi lokal, dan perlindungan sosial.",
      },
      {
        icon: Leaf,
        title: "Semangat PKB",
        desc: "Hijau–kuning sebagai identitas: kerja gotong royong, santun, dan nyata.",
      },
    ],
    []
  );

  const focus = useMemo(
    () => [
      {
        icon: Building2,
        title: "Penguatan RW & kewilayahan",
        points: [
          "Pemetaan kebutuhan RW secara bertahap.",
          "Dorong program berbasis kebutuhan wilayah.",
          "Perkuat peran RW sebagai pintu layanan warga.",
        ],
      },
      {
        icon: BadgeCheck,
        title: "Transparansi program",
        points: [
          "Ringkasan kegiatan jelas & terstruktur.",
          "Sumber/link publik ditampilkan jika tersedia.",
          "Update progres agar tidak menggantung.",
        ],
      },
      {
        icon: Sparkles,
        title: "UMKM & ekonomi warga",
        points: [
          "Pendampingan dasar (legalitas, promosi, jaringan).",
          "Dorong kolaborasi event/pasar warga.",
          "Akses informasi peluang dan pelatihan.",
        ],
      },
    ],
    []
  );

  const flow = useMemo(
    () => [
      { icon: MessagesSquare, title: "Masuk", desc: "Warga kirim aspirasi + kategori + lokasi + detail singkat." },
      { icon: BadgeCheck, title: "Verifikasi", desc: "Cek kelengkapan, bukti/foto (kalau ada), dan urgensi." },
      { icon: Building2, title: "Klasifikasi", desc: "Masuk isu RW/kelurahan/kota untuk rute tindak lanjut." },
      { icon: ShieldCheck, title: "Kawal", desc: "Dihubungkan ke agenda/program/mitra terkait bila relevan." },
      { icon: Sparkles, title: "Update", desc: "Status ditampilkan agar warga bisa memantau progresnya." },
    ],
    []
  );

  // === RUBRIK PENGGANTI GALLERY: PROGRAM & PRIORITAS ===
  const priorities = useMemo(
    () => [
      {
        icon: HandHeart,
        title: "Pelayanan warga yang cepat",
        desc: "Fokus pada respons cepat, pengawalan keluhan, dan memastikan warga dapat akses layanan dengan jelas.",
        cta: { label: "Kirim Aspirasi", to: "/aspirasi" },
      },
      {
        icon: ShieldCheck,
        title: "Transparansi yang bisa dicek",
        desc: "Ringkasan kegiatan dibuat rapi: tanggal, lokasi, tujuan, dan progres supaya warga bisa ikut mengawasi.",
        cta: { label: "Lihat Kinerja", to: "/kinerja" },
      },
      {
        icon: Building2,
        title: "Penguatan wilayah & RW",
        desc: "Pemetaan kebutuhan wilayah, kolaborasi perangkat setempat, serta dorong program berbasis kebutuhan nyata.",
        cta: { label: "Lihat Program", to: "/program" },
      },
      {
        icon: Sparkles,
        title: "UMKM & ekonomi lokal",
        desc: "Dorong kegiatan warga, bazar/kolaborasi, dan jaringan promosi agar ekonomi lingkungan bergerak.",
        cta: { label: "Lihat Media", to: "/media" },
      },
    ],
    []
  );

  // === TIMELINE JEJAK KERJA ===
  const timeline = useMemo(
    () => [
      {
        icon: CalendarDays,
        title: "Dengar & Catat",
        desc: "Aspirasi warga diterima, dicatat rapi, dan dipetakan lokasi/isu agar tidak tercecer.",
      },
      {
        icon: Users,
        title: "Diskusi Wilayah",
        desc: "Koordinasi dengan RT/RW/komunitas untuk menajamkan kebutuhan dan prioritas.",
      },
      {
        icon: Building2,
        title: "Kawal ke Program/Agenda",
        desc: "Masuk ke jalur yang tepat: kelurahan/kecamatan/kota—atau dibawa ke agenda dewan bila perlu.",
      },
      {
        icon: ShieldCheck,
        title: "Pantau & Pastikan",
        desc: "Progres dipantau. Kalau mandek, didorong ulang. Warga tidak dibiarkan menunggu tanpa kabar.",
      },
      {
        icon: BadgeCheck,
        title: "Update Terbuka",
        desc: "Info dibuat jelas agar warga bisa mengecek: sudah sampai mana, kendalanya apa, dan next step.",
      },
    ],
    []
  );

  // === FAQ ===
  const faqs = useMemo(
    () => [
      {
        q: "Kalau saya kirim aspirasi, apa harus lengkap banget?",
        a: "Minimal tulis lokasi, kategori masalah, dan penjelasan singkat. Kalau ada foto/dokumen/link, sertakan supaya proses verifikasi lebih cepat.",
      },
      {
        q: "Apakah semua aspirasi pasti langsung selesai?",
        a: "Tidak selalu. Ada yang butuh koordinasi lintas pihak. Tapi prinsipnya: aspirasi tidak dibiarkan “hilang”; statusnya dipantau dan diupdate.",
      },
      {
        q: "Aspirasi saya masuk ke mana?",
        a: "Tergantung isu: RW/kelurahan/kecamatan/kota. Jika perlu advokasi/kebijakan, bisa dikawal lewat mekanisme dewan sesuai jalur yang tepat.",
      },
      {
        q: "Bagaimana cara cek progresnya?",
        a: "Gunakan menu Kinerja/Media untuk melihat ringkasan aktivitas dan update. Jika kamu butuh follow-up, bisa lewat menu Kontak atau Aspirasi.",
      },
      {
        q: "Kalau ada dokumen belum siap, bagaimana?",
        a: "Tidak masalah. Jangan mengarang link/dokumen. Lebih baik kosong dulu, lalu ditambahkan saat tersedia agar data tetap akurat.",
      },
      {
        q: "Kenapa desainnya hijau-kuning?",
        a: "Itu identitas visual PKB. Tujuannya biar terasa ‘brand’ namun tetap modern, bersih, dan nyaman dibaca.",
      },
    ],
    []
  );

  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="mt-6 pb-10">
      <style>{`
        :root{
          --pkb-green:${PKB.green};
          --pkb-green-dark:${PKB.greenDark};
          --pkb-yellow:${PKB.yellow};
          --pkb-soft:${PKB.soft};
        }
        .reveal { opacity:0; transform: translateY(10px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.is-visible { opacity:1; transform: translateY(0); }
        .pkb-grid {
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,.06) 1px, transparent 0);
          background-size: 18px 18px;
        }
        .ribbon {
          background: linear-gradient(90deg, rgba(0,119,68,1), rgba(12,140,90,1), rgba(255,242,18,1));
        }
        @media (prefers-reduced-motion: reduce) { .floaty { animation:none !important; } }
        .floaty { animation: floaty 10s ease-in-out infinite; }
        @keyframes floaty { 0%,100%{ transform: translate(0,0)} 50%{ transform: translate(10px, -12px)} }
      `}</style>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border bg-white">
        <div className="h-1 w-full ribbon" />
        <div className="relative pkb-grid bg-gradient-to-b from-[rgba(234,247,239,0.9)] via-white to-[rgba(255,242,18,0.18)] p-6 sm:p-10">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(0,119,68,0.14)] blur-3xl floaty" />
          <div className="pointer-events-none absolute -right-28 -bottom-28 h-80 w-80 rounded-full bg-[rgba(255,242,18,0.20)] blur-3xl floaty" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            {/* Left */}
            <div className="reveal" ref={reveal}>
              <div className="flex flex-wrap gap-2">
                <Chip icon={Leaf}>{profile.faction}</Chip>
                <Chip icon={MapPin}>{profile.dapil}</Chip>
                {profile.roles.map((r) => (
                  <Chip key={r} icon={Users}>{r}</Chip>
                ))}
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#0a0a0a] sm:text-4xl">
                Tentang <span className="text-[#007744]">{profile.name}</span>
              </h1>
              <p className="mt-2 text-sm text-black/65 sm:text-base">
                {profile.title} • {profile.faction}
              </p>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-black/75">
                {profile.intro}
              </p>

              <div className="mt-4 rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
                <div className="text-sm font-semibold text-[#005A32]">Wilayah Dapil {profile.dapil}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.area.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-[rgba(0,119,68,0.08)] px-3 py-1 text-xs font-semibold text-[#005A32]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-sm text-black/70">
                  <span className="font-semibold">Tagline:</span> {profile.tagline}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <PrimaryButton onClick={() => navigate("/aspirasi")}>Kirim Aspirasi</PrimaryButton>
                <YellowButton onClick={() => navigate("/kinerja")}>Lihat Kinerja</YellowButton>
                <SecondaryButton onClick={() => navigate("/media")}>Lihat Media</SecondaryButton>
              </div>

              {/* Stat ringkas */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5">
                  <div className="text-xs font-semibold text-black/55">Wilayah Dapil</div>
                  <div className="mt-1 text-2xl font-extrabold text-[#005A32]">
                    <CountUp to={6} />
                  </div>
                  <div className="mt-1 text-xs text-black/60">Kecamatan/area utama</div>
                </div>
                <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5">
                  <div className="text-xs font-semibold text-black/55">Prinsip Kerja</div>
                  <div className="mt-1 text-2xl font-extrabold text-[#005A32]">
                    <CountUp to={5} />
                  </div>
                  <div className="mt-1 text-xs text-black/60">Tahap alur aspirasi</div>
                </div>
                <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5">
                  <div className="text-xs font-semibold text-black/55">Akses Menu</div>
                  <div className="mt-1 text-2xl font-extrabold text-[#005A32]">
                    <CountUp to={6} />
                  </div>
                  <div className="mt-1 text-xs text-black/60">Beranda–Kontak</div>
                </div>
              </div>
            </div>

            {/* Right: Collage */}
            <div className="reveal" ref={reveal}>
              <div className="grid gap-3 sm:grid-cols-2">
                <SmartImage srcs={[IMG.portraitPKB]} alt="Portrait PKB" className="h-[180px] sm:h-[220px]" />
                <SmartImage srcs={[IMG.podium]} alt="Podium" className="h-[180px] sm:h-[220px]" />
                <SmartImage srcs={[IMG.rapat]} alt="Rapat" className="h-[180px] sm:h-[220px]" />

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgba(0,119,68,0.12)] via-white to-[rgba(255,242,18,0.22)] ring-1 ring-black/5">
                  <div className="p-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
                      <Sparkles className="h-4 w-4 text-[#007744]" />
                      PKB Look & Feel
                    </div>
                    <div className="mt-3 text-lg font-semibold text-[#005A32]">
                      Hijau yang tegas,
                      <br />
                      kuning yang hangat
                    </div>
                    <p className="mt-2 text-sm text-black/70">
                      Desain dibuat terang & bersih supaya konten mudah dibaca, tapi tetap “brandable”
                      dengan aksen PKB.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="h-8 w-8 rounded-2xl bg-[#007744] ring-1 ring-black/5" />
                      <span className="h-8 w-8 rounded-2xl bg-[#005A32] ring-1 ring-black/5" />
                      <span className="h-8 w-8 rounded-2xl bg-[#FFF212] ring-1 ring-black/5" />
                      <span className="h-8 w-8 rounded-2xl bg-[#EAF7EF] ring-1 ring-black/5" />
                    </div>
                  </div>
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[rgba(0,119,68,0.18)] blur-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDESHOW */}
      <div className="mt-10 reveal" ref={reveal}>
        <SectionHeader
          title="Slideshow Kegiatan"
          desc="Auto-play + progress + Ken Burns. Sudah pakai foto kamu semua."
          right={
            <button
              onClick={() => navigate("/aspirasi")}
              className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            >
              Kirim Aspirasi <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
        <div className="mt-4">
          <Slideshow slides={slides} />
        </div>
      </div>

      {/* VALUES */}
      <div className="mt-12 grid gap-4 lg:grid-cols-4">
        {values.map((v, i) => (
          <div key={i} className="reveal" ref={reveal}>
            <Card className="h-full">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[rgba(0,119,68,0.10)] text-[#007744]">
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-semibold text-[#0a0a0a]">{v.title}</div>
                  <div className="mt-2 text-sm text-black/70">{v.desc}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* FOCUS */}
      <div className="mt-12 reveal" ref={reveal}>
        <SectionHeader
          title="Fokus Pengawalan"
          desc="Disusun jadi poin yang kebayang dampaknya untuk warga."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {focus.map((f, i) => (
            <Card key={i} className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[rgba(255,242,18,0.18)] blur-3xl" />
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#007744] text-white shadow-sm">
                  <f.icon className="h-6 w-6" />
                </div>
                <div className="text-lg font-semibold text-[#0a0a0a]">{f.title}</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-black/70">
                {f.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#FFF212]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* FLOW */}
      <div className="mt-12 reveal" ref={reveal}>
        <div className="rounded-3xl border bg-gradient-to-br from-[#007744] to-[#005A32] p-6 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <MessagesSquare className="h-4 w-4" />
                Alur Aspirasi
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">
                Biar warga nggak bingung, prosesnya dibuat jelas
              </div>
              <div className="mt-2 max-w-2xl text-sm text-white/80">
                Masuk → verifikasi → klasifikasi → kawal → update. Transparan dan bisa dipantau.
              </div>
            </div>

            <YellowButton onClick={() => navigate("/aspirasi")}>Mulai Kirim Aspirasi</YellowButton>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {flow.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
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

      {/* ===== RUBRIK PENGGANTI GALLERY ===== */}
      <div className="mt-12 reveal" ref={reveal}>
        <SectionHeader
          title="Program & Prioritas"
          desc="Ringkasan arah kerja. Foto dokumentasi lengkap ada di menu Media."
          right={
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/media")}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-[#005A32] ring-1 ring-black/5 hover:bg-white"
              >
                Lihat Foto di Media <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {priorities.map((p, i) => (
            <Card key={i} className="relative overflow-hidden">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(0,119,68,0.10)] blur-3xl" />
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(255,242,18,0.55)] text-[#005A32] ring-1 ring-[#F4E400]/50">
                  <p.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-[#0a0a0a]">{p.title}</div>
                  <div className="mt-1 text-sm text-black/70">{p.desc}</div>

                  <div className="mt-4">
                    <button
                      onClick={() => navigate(p.cta.to)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                    >
                      {p.cta.label} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* TIMELINE */}
      <div className="mt-12 reveal" ref={reveal}>
        <SectionHeader
          title="Jejak Kerja"
          desc="Model kerja yang bisa diikuti warga: dari aspirasi masuk sampai update progres."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {timeline.map((t, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[rgba(255,242,18,0.18)] blur-3xl" />
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgba(0,119,68,0.10)] text-[#007744]">
                  <t.icon className="h-6 w-6" />
                </div>
                <div className="rounded-full bg-[#FFF212] px-3 py-1 text-[11px] font-extrabold text-[#005A32]">
                  Step {i + 1}
                </div>
              </div>
              <div className="mt-4 text-sm font-semibold text-[#0a0a0a]">{t.title}</div>
              <div className="mt-2 text-xs text-black/70">{t.desc}</div>
              <div className="mt-4 h-[2px] w-12 bg-[#007744] opacity-60" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12 reveal" ref={reveal}>
        <SectionHeader
          title="FAQ Warga"
          desc="Pertanyaan yang sering muncul — dibuat singkat & jelas."
          right={
            <div className="flex flex-wrap gap-2">
              <SecondaryButton onClick={() => navigate("/kontak")}>Kontak</SecondaryButton>
              <PrimaryButton onClick={() => navigate("/aspirasi")}>Kirim Aspirasi</PrimaryButton>
            </div>
          }
        />

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {faqs.map((f, i) => (
            <div key={i} className="reveal" ref={reveal}>
              <FAQItem
                q={f.q}
                a={f.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq((p) => (p === i ? -1 : i))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* CTA BOTTOM */}
      <div className="mt-12 reveal" ref={reveal}>
        <div className="rounded-3xl border bg-gradient-to-br from-[rgba(234,247,239,1)] via-white to-[rgba(255,242,18,0.20)] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
                <HandHeart className="h-4 w-4 text-[#007744]" />
                Aspirasi Warga
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0a0a0a]">
                Punya masukan, usulan, atau aduan?
              </div>
              <div className="mt-2 max-w-2xl text-sm text-black/70">
                Kirim lewat menu Aspirasi. Jika ada foto/dokumen/link pendukung, sertakan supaya tindak lanjutnya
                lebih jelas.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={() => navigate("/aspirasi")}>Kirim Aspirasi</PrimaryButton>
              <SecondaryButton onClick={() => navigate("/kontak")}>Kontak</SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </section>
  );
}
