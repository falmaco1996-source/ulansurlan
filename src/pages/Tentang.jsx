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
 *  - Foto: multi-source fallback (kalau 1 rusak, coba src berikutnya)
 *  - Animasi: otomatis mati kalau prefers-reduced-motion
 * =========================================================
 *
 * FOTO KAMU (sesuai upload):
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
          <div className="text-xs font-semibold text-[#005A32]">
            Foto belum tersedia
          </div>
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
              <div className="mt-1 text-sm text-white/90 sm:text-base">
                {s.desc}
              </div>
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
              <SmartImage srcs={s.srcs} alt={s.title} className="h-full w-full" rounded="rounded-2xl" overlay={false} />
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

export default function Tentang() {
  const navigate = useNavigate();
  const reveal = useReveal();

  // === PATH FOTO KAMU (langsung pakai nama file yang ada di /public/galeri) ===
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
      tagline:
        "Kerja yang bisa dicek, data yang bisa ditelusuri, dan aspirasi yang ditangani dengan rapi.",
      intro:
        "Halaman ini dibuat agar warga bisa mengenal profil singkat, fokus kerja, dan cara menyampaikan aspirasi. Nuansa visual mengikuti identitas hijau–kuning agar terasa PKB, tapi tetap modern dan bersih.",
    }),
    []
  );

  // === SLIDESHOW (isi 4 slide pakai foto kamu) ===
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
          "Dorong program yang benar-benar berbasis kebutuhan wilayah.",
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
      {
        icon: MessagesSquare,
        title: "Masuk",
        desc: "Warga kirim aspirasi + kategori + lokasi + detail singkat.",
      },
      {
        icon: BadgeCheck,
        title: "Verifikasi",
        desc: "Cek kelengkapan, bukti/foto (kalau ada), dan urgensi.",
      },
      {
        icon: Building2,
        title: "Klasifikasi",
        desc: "Masuk isu RW/kelurahan/kota untuk rute tindak lanjut.",
      },
      {
        icon: ShieldCheck,
        title: "Kawal",
        desc: "Dihubungkan ke agenda/program/mitra terkait bila relevan.",
      },
      {
        icon: Sparkles,
        title: "Update",
        desc: "Status ditampilkan agar warga bisa memantau progresnya.",
      },
    ],
    []
  );

  // === GALLERY 12 kartu (pakai 6 foto kamu, di-rotate biar penuh) ===
  const gallery = useMemo(() => {
    const base = [
      { srcs: [IMG.portraitPKB], title: "Potret PKB", cap: "Identitas fraksi & kedekatan dengan warga." },
      { srcs: [IMG.lapangan], title: "Kegiatan Lapangan", cap: "Serap aspirasi dan penguatan layanan." },
      { srcs: [IMG.podium], title: "Pemaparan / Forum", cap: "Penyampaian program & informasi publik." },
      { srcs: [IMG.rapat], title: "Rapat / Koordinasi", cap: "Koordinasi dan pengawalan kebijakan." },
      { srcs: [IMG.meja], title: "Pelayanan / Kantor", cap: "Kerja administratif dan tindak lanjut." },
      { srcs: [IMG.bazar], title: "UMKM / Bazar", cap: "Dorong ekonomi lokal dan kolaborasi." },
    ];

    // bikin 12 item (ulang 6 item)
    const out = [];
    for (let i = 0; i < 12; i++) out.push(base[i % base.length]);
    return out;
  }, [IMG]);

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
                <div className="text-sm font-semibold text-[#005A32]">
                  Wilayah Dapil {profile.dapil}
                </div>
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
            </div>

            {/* Right: Collage (DIISI FOTO KAMU) */}
            <div className="reveal" ref={reveal}>
              <div className="grid gap-3 sm:grid-cols-2">
                <SmartImage
                  srcs={[IMG.portraitPKB]}
                  alt="Portrait PKB"
                  className="h-[180px] sm:h-[220px]"
                />
                <SmartImage
                  srcs={[IMG.podium]}
                  alt="Podium"
                  className="h-[180px] sm:h-[220px]"
                />
                <SmartImage
                  srcs={[IMG.rapat]}
                  alt="Rapat"
                  className="h-[180px] sm:h-[220px]"
                />
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
                      Desain dibuat terang & bersih supaya konten mudah dibaca, tapi tetap
                      “brandable” dengan aksen PKB.
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
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
              Slideshow Kegiatan
            </div>
            <div className="mt-1 text-sm text-black/65">
              Auto-play + progress + Ken Burns. Sudah pakai foto kamu semua.
            </div>
          </div>
          <button
            onClick={() => navigate("/aspirasi")}
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Kirim Aspirasi <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <Slideshow slides={slides} />
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
        <div className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
          Fokus Pengawalan
        </div>
        <div className="mt-2 text-sm text-black/65">
          Disusun jadi poin yang “kebayang” dampaknya untuk warga.
        </div>

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

            <YellowButton onClick={() => navigate("/aspirasi")}>
              Mulai Kirim Aspirasi
            </YellowButton>
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

      {/* GALLERY GRID (FULL, NO KOSONG) */}
      <div className="mt-12 reveal" ref={reveal}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
              Galeri Foto
            </div>
            <div className="mt-1 text-sm text-black/65">
              Terisi 12 kartu (pakai foto kamu, diulang rapi biar penuh).
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((g, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <div
                key={i}
                className="group overflow-hidden rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm"
              >
                <div className="relative h-44">
                  <SmartImage
                    srcs={g.srcs}
                    alt={`Galeri ${num}`}
                    className="h-full w-full"
                    rounded="rounded-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />
                  <div className="absolute left-3 top-3 rounded-full bg-[#FFF212] px-3 py-1 text-[11px] font-extrabold text-[#005A32] shadow-sm">
                    PKB
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-semibold text-[#0a0a0a]">
                    Dokumentasi Kegiatan #{num}
                  </div>
                  <div className="mt-1 text-xs text-black/65">
                    <span className="font-semibold">{g.title}</span> — {g.cap}
                  </div>
                  <div className="mt-3 h-[2px] w-10 bg-[#007744] opacity-60 transition group-hover:w-16" />
                </div>
              </div>
            );
          })}
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
                Kirim lewat menu Aspirasi. Jika ada foto/dokumen/link pendukung, sertakan supaya
                tindak lanjutnya lebih jelas.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton onClick={() => navigate("/aspirasi")}>
                Kirim Aspirasi
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate("/kontak")}>
                Kontak
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />
    </section>
  );
}
