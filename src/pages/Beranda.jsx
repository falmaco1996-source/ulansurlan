import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Info,
  MapPin,
  MessageSquareText,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

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
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
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
          "grid place-items-center bg-gradient-to-br from-[rgba(0,119,68,.14)] via-white to-[rgba(255,242,18,.22)]",
          "ring-1 ring-black/5",
          rounded,
          className
        )}
      >
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/75 ring-1 ring-black/5">
            <Sparkles className="h-5 w-5 text-[#005A32]" />
          </div>
          <div className="mt-2 text-xs font-semibold text-[#005A32]">Foto belum tersedia</div>
          <div className="mt-1 text-[11px] text-black/55">
            Taruh foto di <span className="font-mono">/public/galeri</span>
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

function Pill({ icon: Icon, children, tone = "soft" }) {
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

function GoButton({ onClick, children, tone = "green" }) {
  const cls =
    tone === "yellow"
      ? "bg-[#FFF212] text-[#005A32] border border-[#F4E400] hover:brightness-95"
      : "bg-[#007744] text-white hover:opacity-95";
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm active:translate-y-[1px]",
        cls
      )}
    >
      {children} <ArrowRight className="h-4 w-4" />
    </button>
  );
}

/* ------------------ SIMPLE CHARTS (NO LIB) ------------------ */
function Sparkline({ values = [], className = "" }) {
  const reduced = useReducedMotion();
  const w = 180;
  const h = 56;
  const pad = 6;

  const max = Math.max(1, ...values);
  const min = Math.min(...values, 0);

  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
    const t = (v - min) / Math.max(1e-6, max - min);
    const y = h - pad - t * (h - pad * 2);
    return [x, y];
  });

  const d = pts.length
    ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ")
    : "";

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[56px] w-full">
        <defs>
          <linearGradient id="pkbSpark" x1="0" x2="1">
            <stop offset="0" stopColor={PKB.green} stopOpacity="1" />
            <stop offset="1" stopColor={PKB.yellow} stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <path d={d} fill="none" stroke="rgba(0,0,0,.10)" strokeWidth="6" strokeLinecap="round" />
        <path
          d={d}
          fill="none"
          stroke="url(#pkbSpark)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className={reduced ? "" : "spark-draw"}
        />
      </svg>
    </div>
  );
}

function MiniBars({ values = [], className = "" }) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...values);
  return (
    <div className={cn("flex items-end justify-end gap-1", className)}>
      {values.map((v, i) => {
        const hh = Math.max(10, Math.round((v / max) * 40));
        const bg =
          i % 3 === 0
            ? "rgba(0,119,68,.22)"
            : i % 3 === 1
            ? "rgba(255,242,18,.55)"
            : "rgba(0,90,50,.22)";
        return (
          <div
            key={i}
            className={cn("w-[10px] rounded-md ring-1 ring-black/5", reduced ? "" : "bar-grow")}
            style={{ height: hh, animationDelay: `${i * 60}ms`, background: bg }}
          />
        );
      })}
    </div>
  );
}

function LineChartBig({ labels = [], values = [], className = "" }) {
  const reduced = useReducedMotion();
  const w = 560;
  const h = 220;
  const padX = 26;
  const padY = 20;

  const max = Math.max(1, ...values);
  const min = Math.min(...values, 0);

  const pts = values.map((v, i) => {
    const x = padX + (i * (w - padX * 2)) / Math.max(1, values.length - 1);
    const t = (v - min) / Math.max(1e-6, max - min);
    const y = h - padY - t * (h - padY * 2);
    return [x, y];
  });

  const d = pts.length
    ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ")
    : "";

  const area =
    pts.length > 1
      ? `${d} L ${pts[pts.length - 1][0]} ${h - padY} L ${pts[0][0]} ${h - padY} Z`
      : "";

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="pkbArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={PKB.green} stopOpacity="0.20" />
            <stop offset="1" stopColor={PKB.yellow} stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="pkbLine" x1="0" x2="1">
            <stop offset="0" stopColor={PKB.green} />
            <stop offset="1" stopColor={PKB.yellowDark} />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((t, i) => {
          const y = padY + (h - padY * 2) * t;
          return <line key={i} x1="0" x2={w} y1={y} y2={y} stroke="rgba(0,0,0,.06)" />;
        })}

        {area ? <path d={area} fill="url(#pkbArea)" /> : null}

        <path d={d} fill="none" stroke="rgba(0,0,0,.12)" strokeWidth="7" strokeLinecap="round" />
        <path
          d={d}
          fill="none"
          stroke="url(#pkbLine)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className={reduced ? "" : "spark-draw"}
        />

        {labels.map((lab, i) => {
          if (i === 0 || i === labels.length - 1 || i === Math.floor(labels.length / 2)) {
            const x = padX + (i * (w - padX * 2)) / Math.max(1, labels.length - 1);
            return (
              <text key={lab} x={x} y={h - 4} textAnchor="middle" fontSize="11" fill="rgba(0,0,0,.55)">
                {lab}
              </text>
            );
          }
          return null;
        })}
      </svg>

      <div className="mt-2 text-[11px] font-semibold text-black/55">
        Maks {max} • Min {min}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .spark-draw { animation: none !important; }
        }
        .spark-draw {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: spark 900ms ease-out forwards;
        }
        @keyframes spark { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}

function Donut({ items = [], centerTop = "", centerBottom = "", note = "", className = "" }) {
  const reduced = useReducedMotion();
  const size = 220;
  const r = 74;
  const stroke = 18;
  const c = size / 2;
  const total = items.reduce((a, b) => a + (b.value || 0), 0) || 1;

  let acc = 0;

  const arc = (start, end) => {
    const a0 = (start / total) * Math.PI * 2 - Math.PI / 2;
    const a1 = (end / total) * Math.PI * 2 - Math.PI / 2;
    const x0 = c + r * Math.cos(a0);
    const y0 = c + r * Math.sin(a0);
    const x1 = c + r * Math.cos(a1);
    const y1 = c + r * Math.sin(a1);
    const large = end - start > total / 2 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };

  return (
    <div className={cn("grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center", className)}>
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
          <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth={stroke} />
          {items.map((it, i) => {
            const start = acc;
            const end = acc + (it.value || 0);
            acc = end;
            return (
              <path
                key={it.name + i}
                d={arc(start, end)}
                fill="none"
                stroke={it.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                className={reduced ? "" : "arc-in"}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[11px] font-semibold text-black/55">{centerTop}</div>
            <div className="text-2xl font-extrabold text-[#005A32]">{centerBottom || total}</div>
          </div>
        </div>

        <style>{`
          @media (prefers-reduced-motion: reduce) { .arc-in { animation: none !important; } }
          .arc-in { opacity: 0; transform: scale(.98); transform-origin: 50% 50%; animation: arcIn 540ms ease-out forwards; }
          @keyframes arcIn { to { opacity: 1; transform: scale(1); } }
        `}</style>
      </div>

      <div className="rounded-2xl bg-black/[0.02] p-4 ring-1 ring-black/5">
        <div className="text-sm font-semibold text-[#005A32]">{note || "Ringkasan"}</div>
        <div className="mt-2 space-y-2">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between text-sm text-black/70">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: it.color }} />
                <span className="font-semibold">{it.name}</span>
              </div>
              <span className="font-extrabold text-[#005A32]">{it.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-black/55">{centerTop}</div>
      </div>
    </div>
  );
}

/* ------------------ MENU CARD ------------------ */
function MenuCard({ icon: Icon, title, desc, points, metric, metricHint, chart, accent, onClick }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm transition hover:-translate-y-[1px]">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: accent === "yellow" ? "rgba(255,242,18,.22)" : "rgba(0,119,68,.14)" }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid h-11 w-11 place-items-center rounded-2xl ring-1 ring-black/5 transition group-hover:scale-[1.03]",
              accent === "yellow"
                ? "bg-[rgba(255,242,18,.70)] text-[#005A32]"
                : "bg-[rgba(0,119,68,.10)] text-[#007744]"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-black">{title}</div>
            <div className="mt-1 text-sm text-black/65">{desc}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-extrabold text-[#005A32]">{metric}</div>
          <div className="text-[11px] font-semibold text-black/55">{metricHint}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <ul className="space-y-2 text-sm text-black/70">
          {points.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="mt-2 h-2 w-2 flex-none rounded-full bg-[#FFF212]" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className="min-w-[190px]">{chart}</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="h-[2px] w-10 bg-[#007744]/60 transition-all group-hover:w-16" />
        <GoButton onClick={onClick} tone={accent === "yellow" ? "yellow" : "green"}>
          Buka
        </GoButton>
      </div>
    </div>
  );
}

/* ------------------ MAIN ------------------ */
export default function Beranda() {
  const navigate = useNavigate();
  const reveal = useReveal();

  const heroPhotos = useMemo(
    () => ["/galeri/02.webp", "/galeri/01.jpg", "/galeri/03.jpg", "/galeri/05.webp", "/galeri/06.jpg"],
    []
  );

  const [loading, setLoading] = useState(true);
  const [realtimeOn, setRealtimeOn] = useState(false);

  // counts
  const [kinerjaCount, setKinerjaCount] = useState(0);
  const [aspCount, setAspCount] = useState(0);
  const [resesCount, setResesCount] = useState(0);

  // realtime badge
  const [resesBerjalan, setResesBerjalan] = useState(0);

  // charts 6 bulan
  const [labels6, setLabels6] = useState([]);
  const [kinerja6, setKinerja6] = useState([]);
  const [asp6, setAsp6] = useState([]);
  const [reses6, setReses6] = useState([]);

  // donuts
  const [aspStatus, setAspStatus] = useState([]);
  const [resesStatus, setResesStatus] = useState([]);

  const months6 = useMemo(() => {
    const now = new Date();
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("id-ID", { month: "short" }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
      });
    }
    return out;
  }, []);

  useEffect(() => {
    let alive = true;

    const monthKey = (dt) => {
      const d = new Date(dt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };
    const normStatus = (s) => String(s || "").trim().toLowerCase();

    const refreshTimerRef = { current: null };
    const scheduleRefresh = (fn) => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(fn, 180); // debounce biar tidak spam
    };

    const loadAllData = async () => {
      try {
        setLoading(true);
        const startISO = months6[0].start.toISOString();

        // ===================== KINERJA =====================
        const seedKinerja = 5;
        const kCountRes = await supabase.from("kinerja").select("id", { count: "exact", head: true });
        const kDbCount = kCountRes?.count ?? 0;
        if (alive) setKinerjaCount(kDbCount + seedKinerja);

        const { data: kRows, error: kErr } = await supabase
          .from("kinerja")
          .select("tanggal")
          .gte("tanggal", startISO);
        if (kErr) throw kErr;

        const kMap = new Map(months6.map((m) => [m.key, 0]));
        (kRows || []).forEach((r) => {
          if (!r?.tanggal) return;
          const mk = monthKey(r.tanggal);
          if (kMap.has(mk)) kMap.set(mk, (kMap.get(mk) || 0) + 1);
        });
        const kVals = months6.map((m) => kMap.get(m.key) || 0);

        // ===================== ASPIRASI (PUBLIC) =====================
        const aCountRes = await supabase
          .from("aspirasi_public")
          .select("ticket_code", { count: "exact", head: true });
        if (alive) setAspCount(aCountRes?.count ?? 0);

        const { data: aRows, error: aErr } = await supabase
          .from("aspirasi_public")
          .select("status,created_at")
          .gte("created_at", startISO);
        if (aErr) throw aErr;

        const aMap = new Map(months6.map((m) => [m.key, 0]));
        const sMap = new Map();
        (aRows || []).forEach((r) => {
          if (r?.created_at) {
            const mk = monthKey(r.created_at);
            if (aMap.has(mk)) aMap.set(mk, (aMap.get(mk) || 0) + 1);
          }
          const st = r?.status || "Masuk";
          sMap.set(st, (sMap.get(st) || 0) + 1);
        });
        const aVals = months6.map((m) => aMap.get(m.key) || 0);

        const aspOrder = ["Masuk", "Diverifikasi", "Diteruskan", "Diproses", "Selesai", "Ditolak"];
        const aspColors = [
          PKB.green,
          "rgba(0,90,50,.88)",
          "rgba(0,119,68,.35)",
          PKB.yellowDark,
          PKB.yellow,
          "rgba(0,0,0,.22)",
        ];
        const donutAsp = aspOrder
          .map((name, i) => ({ name, value: sMap.get(name) || 0, color: aspColors[i] }))
          .filter((x) => x.value > 0);

        // ===================== RESES (PUBLISHED + STATUS + PER BULAN) =====================
        const resesOrder = ["terjadwal", "berjalan", "selesai", "ditunda", "dibatalkan"];
        const resesLabel = {
          terjadwal: "Terjadwal",
          berjalan: "Berjalan",
          selesai: "Selesai",
          ditunda: "Ditunda",
          dibatalkan: "Dibatalkan",
        };
        const resesColor = {
          terjadwal: "rgba(0,119,68,1)",
          berjalan: "rgba(255,242,18,.95)",
          selesai: "rgba(0,90,50,.90)",
          ditunda: "rgba(0,0,0,.22)",
          dibatalkan: "rgba(0,0,0,.35)",
        };

        const { data: rRows, error: rErr } = await supabase
          .from("reses")
          .select("status,start_date,is_published")
          .eq("is_published", true);
        if (rErr) throw rErr;

        const rAll = rRows || [];
        if (alive) setResesCount(rAll.length);

        const rsMap = new Map(resesOrder.map((k) => [k, 0]));
        rAll.forEach((r) => {
          const st = normStatus(r?.status) || "terjadwal";
          const key = rsMap.has(st) ? st : "terjadwal";
          rsMap.set(key, (rsMap.get(key) || 0) + 1);
        });

        if (alive) setResesBerjalan(rsMap.get("berjalan") || 0);

        const donutReses = resesOrder
          .map((k) => ({ name: resesLabel[k], value: rsMap.get(k) || 0, color: resesColor[k] }))
          .filter((x) => x.value > 0);

        const rMap = new Map(months6.map((m) => [m.key, 0]));
        rAll.forEach((r) => {
          if (!r?.start_date) return;
          const mk = monthKey(r.start_date);
          if (rMap.has(mk)) rMap.set(mk, (rMap.get(mk) || 0) + 1);
        });
        const rVals = months6.map((m) => rMap.get(m.key) || 0);

        if (!alive) return;

        setLabels6(months6.map((m) => m.label));
        setKinerja6(kVals);
        setAsp6(aVals);
        setReses6(rVals);
        setAspStatus(donutAsp.length ? donutAsp : [{ name: "Masuk", value: 0, color: PKB.green }]);
        setResesStatus(donutReses.length ? donutReses : [{ name: "Terjadwal", value: 0, color: PKB.green }]);
      } catch {
        if (!alive) return;
        setLabels6(months6.map((m) => m.label));
        setKinerja6([1, 2, 1, 3, 2, 4]);
        setAsp6([1, 1, 2, 3, 2, 4]);
        setReses6([0, 1, 1, 2, 1, 2]);
        setAspStatus([{ name: "Masuk", value: 1, color: PKB.green }]);
        setResesStatus([
          { name: "Terjadwal", value: 2, color: PKB.green },
          { name: "Berjalan", value: 1, color: PKB.yellowDark },
          { name: "Selesai", value: 3, color: "rgba(0,90,50,.90)" },
        ]);
        setResesBerjalan(1);
      } finally {
        if (alive) setLoading(false);
      }
    };

    // initial load
    loadAllData();

    // ===================== REALTIME: RESes =====================
    // setiap INSERT/UPDATE/DELETE di public.reses -> refresh data reses (dan grafiknya)
    const channel = supabase
      .channel("realtime-beranda-reses")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reses" },
        () => {
          // debounce refresh biar tidak spam kalau update beruntun
          scheduleRefresh(loadAllData);
        }
      )
      .subscribe((status) => {
        if (!alive) return;
        setRealtimeOn(status === "SUBSCRIBED");
      });

    return () => {
      alive = false;
      try {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      } catch {}
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [months6]);

  const menus = useMemo(
    () => [
      {
        key: "kinerja",
        icon: CalendarDays,
        title: "Kinerja",
        desc: "Ringkasan kegiatan yang bisa dicek.",
        points: ["Tanggal & lokasi jelas.", "Ringkasan rapi + sumber/tautan bila ada.", "Mudah dipantau warga."],
        metric: kinerjaCount,
        metricHint: loading ? "memuat..." : "item tampil",
        chart: <Sparkline values={kinerja6.length ? kinerja6 : [1, 2, 1, 3, 2, 4]} />,
        accent: "green",
        to: "/kinerja",
      },
      {
        key: "aspirasi",
        icon: MessageSquareText,
        title: "Aspirasi",
        desc: "Tiket aspirasi warga (public).",
        points: ["Cek status pakai kode tiket.", "Alur jelas: masuk → proses → update.", "Lampiran bikin tindak lanjut cepat."],
        metric: aspCount,
        metricHint: loading ? "memuat..." : "tiket masuk",
        chart: <MiniBars values={asp6.length ? asp6 : [1, 2, 1, 3, 2, 4]} />,
        accent: "yellow",
        to: "/aspirasi",
      },
      {
        key: "program",
        icon: BarChart3,
        title: "Program",
        desc: "Reses yang dipublish (Supabase).",
        points: [
          "Status: terjadwal + berjalan + selesai + ditunda + dibatalkan.",
          "Grafik reses 6 bulan di Beranda.",
          "Update status langsung kebaca (realtime).",
        ],
        metric: resesCount,
        metricHint: loading ? "memuat..." : `berjalan: ${resesBerjalan}`,
        chart: <Sparkline values={reses6.length ? reses6 : [0, 1, 1, 2, 1, 2]} />,
        accent: "green",
        to: "/program",
      },
      {
        key: "media",
        icon: ImageIcon,
        title: "Media",
        desc: "Dokumentasi & publikasi.",
        points: ["Kompilasi liputan/tautan.", "Konten bisa dibagikan.", "Rapi dan mudah dicari."],
        metric: "—",
        metricHint: "kurasi konten",
        chart: <MiniBars values={[2, 3, 1, 4, 2, 3]} />,
        accent: "yellow",
        to: "/media",
      },
      {
        key: "tentang",
        icon: Info,
        title: "Tentang",
        desc: "Profil + slideshow foto.",
        points: ["Foto besar + galeri ramai.", "Nilai & fokus kerja ringkas.", "Nuansa PKB modern & bersih."],
        metric: "OK",
        metricHint: "profil",
        chart: <Sparkline values={[1, 3, 2, 4, 3, 5]} />,
        accent: "green",
        to: "/tentang",
      },
      {
        key: "kontak",
        icon: MapPin,
        title: "Kontak",
        desc: "Kanal komunikasi.",
        points: ["Info kontak jelas.", "Arahkan warga ke Aspirasi.", "Mudah ditemukan dari beranda."],
        metric: "—",
        metricHint: "kanal",
        chart: <MiniBars values={[3, 2, 2, 3, 1, 2]} />,
        accent: "yellow",
        to: "/kontak",
      },
    ],
    [asp6, aspCount, kinerja6, kinerjaCount, loading, reses6, resesBerjalan, resesCount]
  );

  return (
    <section className="mt-6 pb-10">
      <style>{`
        .pkb-grid {
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,.06) 1px, transparent 0);
          background-size: 18px 18px;
        }
        .reveal { opacity:0; transform: translateY(10px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.is-visible { opacity:1; transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          .bar-grow { animation: none !important; transform: scaleY(1) !important; }
          .spark-draw { animation: none !important; }
        }
        .bar-grow{
          transform-origin: bottom;
          transform: scaleY(.25);
          animation: bar 700ms ease-out forwards;
        }
        @keyframes bar { to { transform: scaleY(1); } }
      `}</style>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border bg-white">
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,119,68,1), rgba(12,140,90,1), rgba(255,242,18,1))",
          }}
        />
        <div className="relative pkb-grid bg-gradient-to-b from-[rgba(234,247,239,.92)] via-white to-[rgba(255,242,18,.16)] p-6 sm:p-10">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(0,119,68,.14)] blur-3xl" />
          <div className="pointer-events-none absolute -right-28 -bottom-28 h-80 w-80 rounded-full bg-[rgba(255,242,18,.22)] blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="reveal" ref={reveal}>
              <div className="flex flex-wrap gap-2">
                <Pill icon={Users}>Fraksi PKB</Pill>
                <Pill icon={FileText}>Komisi I • Bamusi</Pill>
                <Pill icon={MapPin}>DPRD Kota Bandung</Pill>

                <Pill icon={BarChart3} tone="yellow">
                  Reses berjalan: <span className="font-extrabold">{resesBerjalan}</span>
                </Pill>

                <Pill icon={Zap} tone={realtimeOn ? "green" : "soft"}>
                  Realtime: <span className="font-extrabold">{realtimeOn ? "ON" : "OFF"}</span>
                </Pill>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                Beranda <span className="text-[#007744]">Ringkas</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-black/70 sm:text-base">
                Minimalis, cepat kebaca: foto besar + intisari tiap menu. Status reses akan ikut berubah tanpa refresh.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <GoButton onClick={() => navigate("/aspirasi")} tone="green">
                  Kirim Aspirasi
                </GoButton>
                <GoButton onClick={() => navigate("/kinerja")} tone="yellow">
                  Lihat Kinerja
                </GoButton>
              </div>

              <div className="mt-4 text-xs text-black/55">
                {loading ? "Mengambil data dari Supabase..." : "Data Supabase aktif (kinerja, reses, aspirasi_public)."}
              </div>
            </div>

            <div className="reveal" ref={reveal}>
              <SmartImage
                srcs={heroPhotos}
                alt="Mochammad Ulan Surlan"
                className="h-[360px] w-full sm:h-[420px]"
                rounded="rounded-[28px]"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-black/55">
                <span>Foto utama Beranda</span>
                <span className="font-semibold text-[#005A32]">PKB • Bandung</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTISARI MENU */}
      <div className="mt-8 reveal" ref={reveal}>
        <div className="text-2xl font-semibold tracking-tight text-black">Intisari Menu</div>
        <div className="mt-1 text-sm text-black/65">Setiap kartu punya grafik mini + animasi.</div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {menus.map((m) => (
            <MenuCard
              key={m.key}
              icon={m.icon}
              title={m.title}
              desc={m.desc}
              points={m.points}
              metric={m.metric}
              metricHint={m.metricHint}
              chart={m.chart}
              accent={m.accent}
              onClick={() => navigate(m.to)}
            />
          ))}
        </div>
      </div>

      {/* LAPORAN GRAFIK */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="reveal" ref={reveal}>
          <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(0,119,68,.10)] px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
                  <CalendarDays className="h-4 w-4 text-[#007744]" />
                  Kinerja (6 bulan)
                </div>
                <div className="mt-3 text-lg font-semibold text-black">Tren item kinerja</div>
                <div className="mt-1 text-sm text-black/60">Sumber: tabel kinerja (+ seed tampilan).</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#005A32]">{kinerjaCount}</div>
                <div className="text-[11px] font-semibold text-black/55">total item</div>
              </div>
            </div>

            <div className="mt-4">
              <LineChartBig labels={labels6} values={kinerja6.length ? kinerja6 : [1, 2, 1, 3, 2, 4]} />
            </div>
          </div>
        </div>

        <div className="reveal" ref={reveal}>
          <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,242,18,.55)] px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
                  <BarChart3 className="h-4 w-4 text-[#005A32]" />
                  Reses (6 bulan)
                </div>
                <div className="mt-3 text-lg font-semibold text-black">Grafik reses per bulan</div>
                <div className="mt-1 text-sm text-black/60">
                  Sumber: reses (published) berdasarkan <span className="font-mono">start_date</span>.
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-[#005A32]">{resesCount}</div>
                <div className="text-[11px] font-semibold text-black/55">
                  berjalan: <span className="font-extrabold">{resesBerjalan}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <LineChartBig labels={labels6} values={reses6.length ? reses6 : [0, 1, 1, 2, 1, 2]} />
            </div>

            <div className="mt-4 flex justify-end">
              <GoButton onClick={() => navigate("/program")} tone="green">
                Lihat Program
              </GoButton>
            </div>
          </div>
        </div>
      </div>

      {/* DONUTS */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="reveal" ref={reveal}>
          <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(0,119,68,.10)] px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
              <BarChart3 className="h-4 w-4 text-[#007744]" />
              Status Reses
            </div>
            <div className="mt-3 text-lg font-semibold text-black">Komposisi status reses</div>
            <div className="mt-1 text-sm text-black/60">Sumber: reses (published).</div>

            <div className="mt-4">
              <Donut
                items={resesStatus.length ? resesStatus : [{ name: "Terjadwal", value: 0, color: PKB.green }]}
                centerTop="Reses"
                centerBottom={resesCount}
                note="Status Reses"
              />
            </div>
          </div>
        </div>

        <div className="reveal" ref={reveal}>
          <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,242,18,.55)] px-3 py-1 text-xs font-semibold text-[#005A32] ring-1 ring-black/5">
              <MessageSquareText className="h-4 w-4 text-[#005A32]" />
              Status Aspirasi
            </div>
            <div className="mt-3 text-lg font-semibold text-black">Komposisi status aspirasi</div>
            <div className="mt-1 text-sm text-black/60">
              Sumber: <span className="font-mono">aspirasi_public</span>.
            </div>

            <div className="mt-4">
              <Donut
                items={aspStatus.length ? aspStatus : [{ name: "Masuk", value: 0, color: PKB.green }]}
                centerTop="Aspirasi"
                centerBottom={aspCount}
                note="Status Aspirasi"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <GoButton onClick={() => navigate("/aspirasi")} tone="green">
                Buat Tiket Baru
              </GoButton>
            </div>
          </div>
        </div>
      </div>

      <div className="h-6" />
    </section>
  );
}
