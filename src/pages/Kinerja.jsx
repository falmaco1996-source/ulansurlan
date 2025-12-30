import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Filter, Search, Share2, ExternalLink, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import Pill from "../components/Pill";
import { supabase } from "../lib/supabaseClient";

/**
 * PROFIL RESMI (SPESIFIK ULAN) DI WEBSITE DPRD KOTA BANDUNG
 * Catatan: ini bukan link general, ini halaman profil Ulan.
 */
const PROFIL_RESMI_ULAN_URL = "https://dprd.bandung.go.id/profil/mochammad-ulan-surlan-s-tr-akun";

/**
 * DATA “MOCKUP” YANG KAMU BILANG REAL
 * - Jangan dihapus.
 * - Jangan diubah isi/tanggalnya kalau itu memang data real versi kamu.
 * - Yang kita tambahin cuma `sources` (tautan yang beneran relevan).
 *
 * sources: array {label,url}
 */
const STATIC_KINERJA = [
  {
    id: "static-1",
    tanggal: "2025-12-04",
    kategori: "Publikasi/Media",
    tag: "Parlemen Talks",
    judul: "Penguatan RW jadi pondasi pembangunan Kota Bandung",
    lokasi: "Bandung (Radio Sonata)",
    ringkasan:
      "• Menekankan pembangunan berbasis kebutuhan wilayah terkecil (RW).\n" +
      "• Mendorong penguatan perencanaan dan pelaksanaan program dari tingkat RW.\n" +
      "• Disorot soal pemetaan RW dan peningkatan kualitas RW (berdasarkan liputan).",
    sources: [
      {
        label: "Koran Mandala (liputan Parlemen Talks/RW)",
        url: "https://koranmandala.com/politik/265374/ulan-surlan-dorong-penguatan-rw-sebagai-fondasi-pembangunan-kota-bandung/",
      },
    ],
  },
  {
    id: "static-2",
    tanggal: "2025-11-20",
    kategori: "Publikasi/Media",
    tag: "Parlemen Talks",
    judul: "Mengawal program Prakarsa agar tepat sasaran, transparan, dan berdampak",
    lokasi: "Bandung (Radio Sonata)",
    ringkasan:
      "• Mendorong pengawasan program Prakarsa supaya efektif dan manfaatnya terasa di warga.\n" +
      "• Menekankan transparansi dan akuntabilitas pelaksanaan di tingkat kewilayahan.",
    sources: [
      {
        label: "Sergap (liputan Prakarsa Bandung Utama)",
        url: "https://sergap.co.id/2025/11/20/dprd-kawal-transparansi-program-prakarsa-bandung-utama/",
      },
      {
        label: "Legislatornews (liputan Parlemen Talks Prakarsa)",
        url: "https://www.legislatornews.com/2025/11/dprd-kota-bandung-kawal-program.html",
      },
    ],
  },

  // ==== Yang dari mockup single-page kamu (anggap real juga) ====
  // NOTE: kalau belum ada link publik yang valid, BIARIN sources kosong.
  // Nanti admin bisa nambah dari dashboard kalau sudah ketemu risalah/agenda/berita resmi.
  {
    id: "static-3",
    tanggal: "2025-10-01",
    kategori: "Audiensi",
    tag: "Dengar Warga",
    judul: "Parlemen Talks: penguatan RW sebagai pondasi pembangunan",
    lokasi: "Bandung",
    ringkasan: "Ringkasan poin kegiatan/parlemen talks. (Isi ringkasan real kamu di sini biar konsisten).",
    sources: [],
  },
  {
    id: "static-4",
    tanggal: "2025-09-15",
    kategori: "Legislasi",
    tag: "Raperda",
    judul: "Pembahasan raperda: grand design pembangunan kependudukan 2025–2045",
    lokasi: "Bandung",
    ringkasan: "Catatan rapat/hasil pembahasan raperda. (Isi ringkasan real kamu di sini).",
    sources: [],
  },
  {
    id: "static-5",
    tanggal: "2025-08-10",
    kategori: "Pengawasan",
    tag: "Transparansi",
    judul: "Mengawal transparansi program kewilayahan berbasis RW",
    lokasi: "Kota Bandung",
    ringkasan: "Checklist transparansi: anggaran, papan informasi RW, dan pelaporan progres. (Isi ringkasan real).",
    sources: [],
  },
];

const KATEGORI_FILTER = [
  "Semua",
  "Legislasi",
  "Pengawasan",
  "Audiensi",
  "Kegiatan Warga/UMKM",
  "Publikasi/Media",
  "Agenda DPRD",
  "Kelembagaan",
];

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function normalizeKey(item) {
  const t = (item?.judul || "").trim().toLowerCase();
  const d = (item?.tanggal || "").trim();
  return `${d}__${t}`;
}

/**
 * sources bisa berupa:
 * - array [{label,url}]
 * - string JSON '[{"label":"...","url":"..."}]' (kalau kolom text)
 * - null
 */
function normalizeSources(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function Kinerja() {
  const nav = useNavigate();

  const [dbRows, setDbRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [sort, setSort] = useState("Terbaru"); // Terbaru | Terlama

  const fetchKinerja = async () => {
    setErrMsg("");
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("kinerja")
        .select("id,tanggal,kategori,tag,judul,lokasi,ringkasan,sources,created_at,updated_at")
        .order("tanggal", { ascending: false });

      if (error) throw error;
      setDbRows(data || []);
    } catch (e) {
      setErrMsg(e?.message || "Gagal memuat data kinerja dari database.");
      setDbRows([]); // aman: tetap ada STATIC_KINERJA
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKinerja();
  }, []);

  /**
   * Merge: DB + STATIC
   * - STATIC dimasukin dulu supaya seed kamu tetap tampil.
   * - DB timpa kalau ada item yang sama (tanggal+judul sama), karena DB bisa diupdate via admin.
   */
  const mergedRows = useMemo(() => {
    const map = new Map();

    for (const s of STATIC_KINERJA) {
      map.set(normalizeKey(s), { ...s, __source: "static" });
    }

    for (const d of dbRows) {
      const key = normalizeKey(d);
      map.set(key, { ...d, __source: "db" });
    }

    return Array.from(map.values());
  }, [dbRows]);

  const filtered = useMemo(() => {
    let items = [...mergedRows];

    if (kategori !== "Semua") items = items.filter((x) => x.kategori === kategori);

    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter((x) => {
        const hay = [x.judul, x.tag, x.kategori, x.lokasi, x.ringkasan, x.tanggal]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      });
    }

    items.sort((a, b) => {
      const aa = a.tanggal || "";
      const bb = b.tanggal || "";
      return sort === "Terlama" ? aa.localeCompare(bb) : bb.localeCompare(aa);
    });

    return items;
  }, [mergedRows, q, kategori, sort]);

  const shareItem = async (item) => {
    const title = item.judul || "Kinerja";
    const text = `${title}\n${item.kategori || ""}${item.tag ? " • " + item.tag : ""}\n${fmtDate(
      item.tanggal
    )} • ${item.lokasi || "Bandung"}`;

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

  return (
    <section className="mt-6">
      <SectionTitle
        icon={CalendarDays}
        title="Kinerja"
        desc="Ringkasan kegiatan yang bisa dicek. Data dari dashboard (Supabase) + data real versi mockup (tetap tampil)."
      />

      {/* top summary box */}
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border bg-white p-5">
          <div className="flex flex-wrap gap-2">
            <Pill>Anggota DPRD Kota Bandung</Pill>
            <Pill>Komisi I</Pill>
            <Pill>Badan Musyawarah</Pill>
            <Pill>Fraksi PKB</Pill>
            <Pill>Dapil 1</Pill>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-slate-600">Item kinerja (ditampilkan)</div>
              <div className="mt-1 text-2xl font-semibold">{filtered.length}</div>
              <div className="mt-2 text-xs text-slate-500">
                {loading ? "Mengambil data DB..." : "DB + seed (data real mockup) digabung."}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-slate-600">Cara ngecek</div>
              <div className="mt-2 text-sm text-slate-600">
                Klik tombol <span className="font-semibold">Sumber</span> di setiap item.
              </div>
              <div className="mt-2 text-xs text-slate-500">Minimal 1 tautan agenda/risalah/liputan yang relevan.</div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-slate-600">Profil resmi</div>
              <a
                href={PROFIL_RESMI_ULAN_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              >
                Profil Ulan Surlan (DPRD Kota Bandung) <ExternalLink className="h-4 w-4" />
              </a>
              <div className="mt-2 text-xs text-slate-500">Link resmi khusus Ulan.</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm font-semibold">Standar transparansi</div>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600">
            <li>• Ada tanggal dan lokasi.</li>
            <li>• Ada tujuan dan hasil singkat.</li>
            <li>• Ada sumber publik (agenda/risalah/liputan) kalau tersedia.</li>
            <li>• Kalau ada tindak lanjut: tulis progresnya.</li>
          </ul>
          <div className="mt-4 rounded-2xl bg-[#EAF7EF] p-4 text-sm text-slate-600">
            Kalau belum ada dokumen/link, jangan ngarang: biarin kosong dan tambah nanti.
          </div>
        </div>
      </div>

      {/* search + filter */}
      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 rounded-2xl border bg-white px-4 py-3 md:max-w-xl">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari: RW, Prakarsa, UMKM, rapat..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
            <Filter className="h-4 w-4 text-slate-600" />
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {KATEGORI_FILTER.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-sm outline-none">
              <option>Terbaru</option>
              <option>Terlama</option>
            </select>
          </div>

          <button
            onClick={() => nav("/aspirasi")}
            className="rounded-2xl bg-[#007744] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Kirim Aspirasi
          </button>

          <button
            onClick={fetchKinerja}
            className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold hover:bg-[#007744]/5"
          >
            Refresh
          </button>
        </div>
      </div>

      {errMsg ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errMsg}</div>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {filtered.map((k) => {
          const sources = normalizeSources(k.sources);
          const fromDb = k.__source === "db";

          return (
            <article key={k.id || normalizeKey(k)} className="rounded-3xl border bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Pill>{k.kategori || "—"}</Pill>
                  {k.tag ? <Pill>{k.tag}</Pill> : null}
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      fromDb ? "bg-[#007744] text-white" : "bg-[#007744]/5 text-slate-600"
                    }`}
                    title={fromDb ? "Sumber: Database (Dashboard)" : "Sumber: Seed (data real mockup)"}
                  >
                    {fromDb ? "DB" : "Seed"}
                  </span>
                </div>

                <button
                  onClick={() => shareItem(k)}
                  className="rounded-xl p-2 hover:bg-[#007744]/5"
                  aria-label="Bagikan"
                  title="Bagikan"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-3 text-base font-semibold leading-snug">{k.judul || "(Tanpa judul)"}</h3>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {fmtDate(k.tanggal)}
                </div>
                <div className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {k.lokasi || "Bandung"}
                </div>
              </div>

              {k.ringkasan ? (
                <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{k.ringkasan}</p>
              ) : (
                <p className="mt-3 text-sm text-slate-500 italic">Ringkasan belum ditambahkan.</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {sources.length ? (
                  sources.slice(0, 4).map((s, idx) => (
                    <a
                      key={`${k.id || "x"}-${idx}`}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold hover:bg-[#007744]/5"
                    >
                      {s.label || `Sumber ${idx + 1}`} <ExternalLink className="h-4 w-4" />
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Belum ada tautan sumber (tambahkan dari dashboard kalau sudah ada yang valid).</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!loading && !filtered.length ? (
        <div className="mt-6 rounded-3xl border bg-[#EAF7EF] p-6 text-sm text-slate-600">
          Belum ada data kinerja yang cocok dengan filter.
        </div>
      ) : null}
    </section>
  );
}
