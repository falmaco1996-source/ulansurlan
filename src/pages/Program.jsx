// ===============================
// FILE: src/pages/Program.jsx
// PUBLIC PAGE: Program/Reses + Charts
// FIX IMAGE:
// - normalisasi foto_path (hapus prefix public/reses/dll)
// - coba beberapa kandidat: foto_url, publicUrl(foto_path), images[] (string/object), dll
// - kalau masih gagal, fallback signedUrl (kalau policy memungkinkan)
// ===============================

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Filter,
  MapPin,
  Search,
  Share2,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import Pill from "../components/Pill";
import { supabase } from "../lib/supabaseClient";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BUCKET_RESES = "reses";
const STATUS_FILTER = [
  "Semua",
  "Terjadwal",
  "Berjalan",
  "Selesai",
  "Ditunda",
  "Dibatalkan",
];

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

/* =========================
   IMAGE HELPERS (FIX)
   ========================= */

function isHttpUrl(v) {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
}

function normalizeStoragePath(bucket, raw) {
  if (!raw) return "";
  let p = String(raw).trim();
  if (!p) return "";

  // kalau sudah URL, biarkan
  if (isHttpUrl(p)) return p;

  // rapihin slash depan
  p = p.replace(/^\/+/, "");

  // hapus prefix umum
  p = p.replace(/^public\//, "");
  p = p.replace(new RegExp(`^${bucket}\\/`), ""); // kalau tersimpan "reses/xxxx.jpg"

  // kalau tersimpan potongan URL supabase public object
  const pubKey = `/object/public/${bucket}/`;
  const idxPub = p.indexOf(pubKey);
  if (idxPub !== -1) p = p.slice(idxPub + pubKey.length);

  return p;
}

function pushUnique(arr, v) {
  if (!v) return;
  if (!arr.includes(v)) arr.push(v);
}

function getPublicUrl(bucket, pathOrUrl) {
  if (!bucket || !pathOrUrl) return "";
  if (isHttpUrl(pathOrUrl)) return pathOrUrl;

  const clean = normalizeStoragePath(bucket, pathOrUrl);
  if (!clean) return "";
  if (isHttpUrl(clean)) return clean;

  const { data } = supabase.storage.from(bucket).getPublicUrl(clean);
  return data?.publicUrl || "";
}

async function getSignedUrl(bucket, pathOrUrl, expiresInSeconds = 3600) {
  if (!bucket || !pathOrUrl) return "";
  if (isHttpUrl(pathOrUrl)) return pathOrUrl;

  const clean = normalizeStoragePath(bucket, pathOrUrl);
  if (!clean) return "";
  if (isHttpUrl(clean)) return clean;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(clean, expiresInSeconds);

  if (error) return "";
  return data?.signedUrl || "";
}

function buildImageCandidates({ bucket, foto_url, foto_path, images }) {
  const list = [];

  // 1) foto_url dari DB (apapun bentuknya kita coba dulu)
  pushUnique(list, foto_url);

  // 2) foto_path -> public url
  if (foto_path) {
    pushUnique(list, getPublicUrl(bucket, foto_path));
  }

  // 3) images fallback: support string / object
  const arr = Array.isArray(images) ? images : [];
  for (const it of arr) {
    if (!it) continue;

    if (typeof it === "string") {
      pushUnique(list, it);
      pushUnique(list, getPublicUrl(bucket, it));
      continue;
    }

    // object variants
    pushUnique(list, it.url);
    pushUnique(list, it.foto_url);

    if (it.path) pushUnique(list, getPublicUrl(bucket, it.path));
    if (it.foto_path) pushUnique(list, getPublicUrl(bucket, it.foto_path));
  }

  return list.filter(Boolean);
}

/**
 * Image component:
 * - coba beberapa kandidat url (foto_url, publicUrl(foto_path), images[])
 * - kalau semua gagal, coba signed url dari fotoPath
 * - kalau tetap gagal, placeholder
 */
function ResesCover({
  label,
  fotoUrlFromDb,
  fotoPath,
  images,
  heightClass = "h-56",
}) {
  const [candidates, setCandidates] = useState([]);
  const [idx, setIdx] = useState(0);
  const [src, setSrc] = useState("");
  const [broken, setBroken] = useState(false);
  const [triedSigned, setTriedSigned] = useState(false);

  useEffect(() => {
    setBroken(false);
    setTriedSigned(false);

    const list = buildImageCandidates({
      bucket: BUCKET_RESES,
      foto_url: fotoUrlFromDb,
      foto_path: fotoPath,
      images,
    });

    setCandidates(list);
    setIdx(0);
    setSrc(list[0] || "");
  }, [fotoUrlFromDb, fotoPath, images]);

  const handleError = async () => {
    // coba kandidat berikutnya
    if (idx + 1 < candidates.length) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setSrc(candidates[nextIdx]);
      return;
    }

    // habis kandidat -> coba signed url (kalau policy memungkinkan)
    if (!triedSigned && fotoPath && !isHttpUrl(fotoPath)) {
      setTriedSigned(true);
      const signed = await getSignedUrl(BUCKET_RESES, fotoPath, 3600);
      if (signed) {
        setSrc(signed);
        return;
      }
    }

    setBroken(true);
  };

  // tidak ada sumber sama sekali
  if (
    !src &&
    !fotoPath &&
    (!Array.isArray(images) || images.length === 0) &&
    !fotoUrlFromDb
  ) {
    return (
      <div
        className={`grid w-full place-items-center ${heightClass} bg-[#EAF7EF] text-sm text-slate-500`}
      >
        Foto belum ditambahkan
      </div>
    );
  }

  if (broken) {
    return (
      <div
        className={`grid w-full place-items-center ${heightClass} bg-[#EAF7EF] text-sm text-slate-500`}
      >
        Foto belum bisa ditampilkan
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heightClass} bg-[#EAF7EF]`}>
      <img
        src={src}
        alt={label || "Foto reses"}
        className="h-full w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={handleError}
      />
    </div>
  );
}

export default function Program() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [aduanByReses, setAduanByReses] = useState({}); // { [resesId]: aspirasi[] }

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Semua");
  const [sort, setSort] = useState("Terbaru"); // Terbaru | Terlama

  const fetchReses = async () => {
    setErrMsg("");
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("reses")
        .select(
          "id,tahun,masa,label,start_date,end_date,lokasi,agenda_url,catatan,sources,is_published,created_at,updated_at,images,status,judul,ringkasan,foto_path,foto_url,foto_caption,aduan_masuk,aduan_selesai"
        )
        .eq("is_published", true)
        .order("tahun", { ascending: false })
        .order("masa", { ascending: false });

      if (error) throw error;

      const normalized = (data || []).map((r) => ({
        ...r,
        sources: safeArr(r.sources),
        images: safeArr(r.images),
        foto_url: r.foto_url || "",
        foto_path: r.foto_path || "",
      }));

      setRows(normalized);

      // ===== fetch aduan terkait reses dari tabel aspirasi (reses_id)
      const ids = normalized.map((x) => x.id).filter(Boolean);
      if (!ids.length) {
        setAduanByReses({});
        return;
      }

      const { data: aduanData, error: aduanErr } = await supabase
        .from("aspirasi")
        .select("id,reses_id,ticket_code,kategori,lokasi,isi,status,created_at,updated_at")
        .in("reses_id", ids)
        .order("created_at", { ascending: false });

      if (aduanErr) {
        console.warn("Fetch aspirasi(reses) gagal:", aduanErr.message);
        setAduanByReses({});
        return;
      }

      const map = {};
      for (const a of aduanData || []) {
        const key = a.reses_id;
        if (!key) continue;
        if (!map[key]) map[key] = [];
        map[key].push(a);
      }
      setAduanByReses(map);
    } catch (e) {
      setErrMsg(e?.message || "Gagal memuat data program/reses.");
      setRows([]);
      setAduanByReses({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReses();
  }, []);

  const filtered = useMemo(() => {
    let items = [...rows];

    if (status !== "Semua") items = items.filter((x) => (x.status || "") === status);

    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter((x) => {
        const hay = [
          x.label,
          x.judul,
          x.ringkasan,
          x.lokasi,
          x.status,
          String(x.tahun || ""),
          String(x.masa || ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      });
    }

    items.sort((a, b) => {
      const aa = `${a.tahun || 0}-${String(a.masa || 0).padStart(2, "0")}`;
      const bb = `${b.tahun || 0}-${String(b.masa || 0).padStart(2, "0")}`;
      return sort === "Terlama" ? aa.localeCompare(bb) : bb.localeCompare(aa);
    });

    return items;
  }, [rows, q, status, sort]);

  const stats = useMemo(() => {
    const total = rows.length;
    const byStatus = rows.reduce((acc, r) => {
      const k = r.status || "Tidak diketahui";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const byYear = rows.reduce((acc, r) => {
      const y = String(r.tahun || "0");
      acc[y] = (acc[y] || 0) + 1;
      return acc;
    }, {});
    return { total, byStatus, byYear };
  }, [rows]);

  const chartYear = useMemo(() => {
    return Object.entries(stats.byYear)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([tahun, jumlah]) => ({ tahun, jumlah }));
  }, [stats.byYear]);

  const chartStatus = useMemo(() => {
    return Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }));
  }, [stats.byStatus]);

  const shareItem = async (item) => {
    const title = item.label || item.judul || "Reses";
    const text = `${title}\n${item.lokasi || "Bandung"}\n${
      item.start_date ? fmtDate(item.start_date) : ""
    }${item.end_date ? ` – ${fmtDate(item.end_date)}` : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        alert("Ringkasan + link disalin.");
      }
    } catch {
      // ignore
    }
  };

  const pillStatus = (s) => {
    const x = String(s || "").toLowerCase();
    if (x === "selesai") return "bg-[#007744] text-white";
    if (x === "ditolak" || x === "dibatalkan") return "bg-[#FFF212] text-[#005A32]";
    return "bg-[#007744]/10 text-[#005A32]";
  };

  return (
    <section className="mt-6">
      <SectionTitle
        icon={CalendarDays}
        title="Program"
        desc="Di sini fokusnya Reses: yang sudah berjalan, yang terjadwal, dan bukti/sumbernya (kalau tersedia)."
      />

      {/* SUMMARY + CHARTS */}
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Ringkasan Reses</div>
              <div className="mt-1 text-sm text-slate-600">
                Total reses dipublikasikan:{" "}
                <span className="font-semibold">{stats.total}</span>
              </div>
            </div>

            <button
              onClick={() => nav("/aspirasi")}
              className="rounded-2xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Buat Aduan / Aspirasi
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4" /> Reses per tahun
              </div>
              <div className="mt-3 h-56 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartYear}>
                    <XAxis dataKey="tahun" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="#007744" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Catatan: grafik cuma berdasarkan item yang dipublish.
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4" /> Proporsi status
              </div>
              <div className="mt-3 h-56 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                      {chartStatus.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={["#007744", "#005A32", "#0C8C5A", "#1FA56E", "#FFF212"][idx % 5]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm font-semibold">Standar transparansi</div>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600">
            <li>• Ada tahun + masa reses.</li>
            <li>• Ada lokasi dan periode.</li>
            <li>• Ada ringkasan hasil.</li>
            <li>• Ada sumber publik (agenda/risalah/liputan) kalau tersedia.</li>
          </ul>

          <div className="mt-4 rounded-2xl bg-[#EAF7EF] p-4 text-sm text-slate-600">
            Tips: kalau belum ada dokumen, tulis catatan “menunggu rilis/dokumen”.
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 rounded-2xl border bg-white px-4 py-3 md:max-w-xl">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari reses: label, lokasi, ringkasan..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
            <Filter className="h-4 w-4 text-slate-600" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {STATUS_FILTER.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option>Terbaru</option>
              <option>Terlama</option>
            </select>
          </div>

          <button
            onClick={fetchReses}
            className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold hover:bg-[#007744]/5"
          >
            Refresh
          </button>
        </div>
      </div>

      {errMsg ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errMsg}
        </div>
      ) : null}

      {/* LIST */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {filtered.map((r) => {
          const sources = safeArr(r.sources);
          const period =
            r.start_date || r.end_date
              ? `${fmtDate(r.start_date)}${r.end_date ? ` — ${fmtDate(r.end_date)}` : ""}`
              : "-";

          const aduanList = Array.isArray(aduanByReses?.[r.id]) ? aduanByReses[r.id] : [];
          const masukCount = aduanList.filter((a) => (a.status || "Masuk") !== "Selesai").length;
          const selesaiCount = aduanList.filter((a) => (a.status || "") === "Selesai").length;

          return (
            <article key={r.id} className="overflow-hidden rounded-3xl border bg-white">
              <div className="relative">
                <ResesCover
                  label={r.label}
                  fotoUrlFromDb={r.foto_url}
                  fotoPath={r.foto_path}
                  images={r.images}
                  heightClass="h-56"
                />

                <button
                  onClick={() => shareItem(r)}
                  className="absolute right-3 top-3 rounded-xl bg-white/90 p-2 hover:bg-white"
                  title="Bagikan"
                  aria-label="Bagikan"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{r.status || "—"}</Pill>
                  <Pill>{String(r.tahun || "-")}</Pill>
                  <Pill>Masa {String(r.masa || "-")}</Pill>
                </div>

                <h3 className="mt-3 text-base font-semibold leading-snug">
                  {r.label || r.judul || "Reses"}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> {period}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {r.lokasi || "Bandung"}
                  </div>
                </div>

                {r.ringkasan ? (
                  <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{r.ringkasan}</p>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 italic">Ringkasan belum diisi.</p>
                )}

                {/* SOURCES */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sources.length ? (
                    sources.slice(0, 4).map((s, idx) => (
                      <a
                        key={`${r.id}-${idx}`}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold hover:bg-[#007744]/5"
                      >
                        {s.label || `Sumber ${idx + 1}`} <ExternalLink className="h-4 w-4" />
                      </a>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Belum ada tautan sumber.</span>
                  )}
                </div>

                {/* ADUAN TERKAIT */}
                <div className="mt-4 rounded-3xl border bg-[#EAF7EF] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Aduan terkait reses ini</div>
                    <div className="text-xs text-slate-500">
                      Masuk {masukCount} • Selesai {selesaiCount}
                    </div>
                  </div>

                  {aduanList.length ? (
                    <div className="mt-3 grid gap-2">
                      {aduanList.slice(0, 3).map((a) => (
                        <div key={a.id} className="rounded-2xl border bg-white p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-semibold text-slate-800">
                                {a.ticket_code || "—"}
                              </div>
                              <div className="mt-1 text-xs text-slate-600">
                                {a.kategori || "—"} • {a.lokasi || "—"}
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${pillStatus(
                                a.status
                              )}`}
                            >
                              {a.status || "Masuk"}
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-slate-600 line-clamp-2">
                            {a.isi || "—"}
                          </div>
                        </div>
                      ))}

                      <div className="text-xs text-slate-500">
                        Menampilkan {Math.min(3, aduanList.length)} aduan.
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-600">Belum ada aduan untuk reses ini.</div>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={() => nav(`/aduan?reses=${r.id}`)}
                      className="rounded-2xl bg-[#007744] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                      title="Buka form aduan khusus reses ini"
                    >
                      Buat Aduan dari Reses
                    </button>
                  </div>
                </div>

                {/* CTA (lain) */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {r.agenda_url ? (
                    <a
                      href={r.agenda_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold hover:bg-[#007744]/5"
                    >
                      Agenda <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}

                  <div className="ml-auto text-xs text-slate-500">
                    (Data ringkas) Aduan: Masuk {r.aduan_masuk ?? masukCount} • Selesai{" "}
                    {r.aduan_selesai ?? selesaiCount}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && !filtered.length ? (
        <div className="mt-6 rounded-3xl border bg-[#EAF7EF] p-6 text-sm text-slate-600">
          Belum ada data reses yang cocok dengan filter.
        </div>
      ) : null}
    </section>
  );
}
