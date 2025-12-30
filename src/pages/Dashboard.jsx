// =====================================
// FILE: src/pages/Dashboard.jsx
// ADMIN PAGE: Aspirasi + Kinerja + Reses
//
// FIX UTAMA:
// 1) FOTO: jangan simpan signed URL ke DB (basi). simpan foto_path.
//    UI resolve URL: publicUrl -> fallback signedUrl fresh.
// 2) TAB RESES: form input lengkap (tahun, masa, label, status, tanggal, dll).
// 3) RESes: upsert dengan onConflict "tahun,masa".
// =====================================

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Inbox,
  LogOut,
  Search,
  Filter,
  BadgeCheck,
  ShieldAlert,
  Save,
  UserCog,
  Lock,
  CalendarDays,
  Plus,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import Pill from "../components/Pill";
import SectionTitle from "../components/SectionTitle";
import { supabase } from "../lib/supabaseClient";

const BUCKET_RESES = "reses";

const STATUS_ASPIRASI = ["Masuk", "Diverifikasi", "Diteruskan", "Diproses", "Selesai", "Ditolak"];
const STATUS_RESES = ["Terjadwal", "Berjalan", "Selesai", "Ditunda", "Dibatalkan"];

function fmtDate(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function sourcesToText(sourcesVal) {
  const arr = safeArr(sourcesVal);
  if (!arr.length) return "";
  return arr
    .map((s) => `${(s?.label || "Sumber").trim()}|${(s?.url || "").trim()}`)
    .join("\n");
}

function parseSources(sourcesText) {
  const lines = (sourcesText || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const out = [];
  for (const line of lines) {
    const parts = line.split("|");
    const label = (parts[0] || "").trim() || "Sumber";
    const url = (parts[1] || "").trim();
    if (!url) continue;
    out.push({ label, url });
  }
  return out;
}

function looksLikeSignedUrl(url) {
  if (!url) return false;
  return String(url).includes("token=");
}

function getPublicUrl(bucket, path) {
  if (!bucket || !path) return "";
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "";
}

async function getSignedUrl(bucket, path, expiresInSeconds = 3600) {
  if (!bucket || !path) return "";
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) return "";
  return data?.signedUrl || "";
}

function ResesThumb({ label, fotoUrlFromDb, fotoPath, heightClass = "h-36" }) {
  const [src, setSrc] = useState("");
  const [broken, setBroken] = useState(false);
  const [triedSigned, setTriedSigned] = useState(false);

  useEffect(() => {
    setBroken(false);
    setTriedSigned(false);

    const dbUrlOk = fotoUrlFromDb && !looksLikeSignedUrl(fotoUrlFromDb);
    const publicUrl = fotoPath ? getPublicUrl(BUCKET_RESES, fotoPath) : "";

    setSrc(dbUrlOk ? fotoUrlFromDb : publicUrl);
  }, [fotoUrlFromDb, fotoPath]);

  const trySigned = useCallback(async () => {
    if (!fotoPath) return;
    const signed = await getSignedUrl(BUCKET_RESES, fotoPath, 3600);
    if (signed) setSrc(signed);
  }, [fotoPath]);

  if (!src && !fotoPath) return null;

  if (broken) {
    return (
      <div className={`grid w-full place-items-center ${heightClass} bg-black/[0.03] text-xs text-black/50`}>
        Foto belum bisa ditampilkan
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-2xl border bg-black/[0.03] ${heightClass}`}>
      <img
        src={src}
        alt={label || "Foto reses"}
        className="h-full w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={async () => {
          if (!triedSigned && fotoPath) {
            setTriedSigned(true);
            await trySigned();
            return;
          }
          setBroken(true);
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [session, setSession] = useState(null);

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // tabs
  const [tab, setTab] = useState("Aspirasi"); // Aspirasi | Kinerja | Reses

  // ===== Aspirasi state
  const [tickets, setTickets] = useState([]);
  const [loadingAspirasi, setLoadingAspirasi] = useState(false);
  const [errAspirasi, setErrAspirasi] = useState("");

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selected, setSelected] = useState(null);

  const [status, setStatus] = useState("Masuk");
  const [catatan, setCatatan] = useState("");
  const [savingAspirasi, setSavingAspirasi] = useState(false);

  // ===== Kinerja state (minimal)
  const [kinerjaRows, setKinerjaRows] = useState([]);
  const [loadingKinerja, setLoadingKinerja] = useState(false);
  const [errKinerja, setErrKinerja] = useState("");

  const emptyKinerja = useMemo(
    () => ({
      id: null,
      tanggal: todayISO(),
      kategori: "Publikasi/Media",
      tag: "",
      judul: "",
      lokasi: "Bandung",
      ringkasan: "",
      sourcesText: "",
    }),
    []
  );

  const [kForm, setKForm] = useState(emptyKinerja);
  const [savingKinerja, setSavingKinerja] = useState(false);

  // ===== Reses state
  const [resesRows, setResesRows] = useState([]);
  const [loadingReses, setLoadingReses] = useState(false);
  const [errReses, setErrReses] = useState("");
  const [savingReses, setSavingReses] = useState(false);

  const emptyReses = useMemo(
    () => ({
      id: null,
      tahun: new Date().getFullYear(),
      masa: 1,
      label: "",
      status: "Terjadwal",
      start_date: "",
      end_date: "",
      lokasi: "Bandung",
      agenda_url: "",
      judul: "",
      ringkasan: "",
      catatan: "",
      is_published: true,
      sourcesText: "",
      foto_path: "",
      foto_url: "", // jangan dipakai sebagai sumber utama
      foto_caption: "",
      images: [],
    }),
    []
  );

  const [rForm, setRForm] = useState(emptyReses);

  // preview upload (local)
  const [fotoPreview, setFotoPreview] = useState("");

  // ===== session watcher
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoginErr("");
    try {
      setLoginLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setEmail("");
      setPassword("");
    } catch (e2) {
      setLoginErr(e2?.message || "Login gagal.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSelected(null);
    setTickets([]);
    setKinerjaRows([]);
    setResesRows([]);
    setKForm(emptyKinerja);
    setRForm(emptyReses);
    setFotoPreview("");
  };

  // ===== Aspirasi fetch
  const fetchTickets = async () => {
    setErrAspirasi("");
    try {
      setLoadingAspirasi(true);
      const { data, error } = await supabase
        .from("aspirasi")
        .select("ticket_code,kategori,lokasi,isi,status,catatan_admin,created_at,updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
      if (!selected && data?.length) setSelected(data[0]);
    } catch (e2) {
      setErrAspirasi(e2?.message || "Gagal memuat data aspirasi.");
    } finally {
      setLoadingAspirasi(false);
    }
  };

  // ===== Kinerja fetch
  const fetchKinerja = async () => {
    setErrKinerja("");
    try {
      setLoadingKinerja(true);
      const { data, error } = await supabase
        .from("kinerja")
        .select("id,tanggal,kategori,tag,judul,lokasi,ringkasan,sources,created_at,updated_at")
        .order("tanggal", { ascending: false });

      if (error) throw error;
      setKinerjaRows(data || []);
    } catch (e2) {
      setErrKinerja(e2?.message || "Gagal memuat kinerja.");
    } finally {
      setLoadingKinerja(false);
    }
  };

  // ===== Reses fetch
  const fetchReses = async () => {
    setErrReses("");
    try {
      setLoadingReses(true);
      const { data, error } = await supabase
        .from("reses")
        .select(
          "id,tahun,masa,label,status,start_date,end_date,lokasi,agenda_url,catatan,sources,is_published,created_at,updated_at,images,judul,ringkasan,foto_path,foto_url,foto_caption,aduan_masuk,aduan_selesai"
        )
        .order("tahun", { ascending: false })
        .order("masa", { ascending: false });

      if (error) throw error;

      const normalized = (data || []).map((r) => ({
        ...r,
        sources: safeArr(r.sources),
        images: safeArr(r.images),
        foto_path: r.foto_path || "",
        foto_url: r.foto_url || "",
      }));

      setResesRows(normalized);
    } catch (e2) {
      setErrReses(e2?.message || "Gagal memuat reses.");
      setResesRows([]);
    } finally {
      setLoadingReses(false);
    }
  };

  // fetch after login + tab
  useEffect(() => {
    if (!session) return;
    if (tab === "Aspirasi") fetchTickets();
    if (tab === "Kinerja") fetchKinerja();
    if (tab === "Reses") fetchReses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tab]);

  // keep right panel in sync (aspirasi)
  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    setCatatan(selected.catatan_admin || "");
  }, [selected]);

  const filteredAspirasi = useMemo(() => {
    const s = q.trim().toLowerCase();
    let items = [...tickets];
    if (filterStatus !== "Semua") items = items.filter((x) => x.status === filterStatus);
    if (s) {
      items = items.filter((x) => {
        const hay = [x.ticket_code, x.kategori, x.lokasi, x.isi, x.status, x.catatan_admin]
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      });
    }
    return items;
  }, [tickets, q, filterStatus]);

  const statsAspirasi = useMemo(() => {
    const total = tickets.length;
    const selesai = tickets.filter((x) => x.status === "Selesai").length;
    const masuk = tickets.filter((x) => x.status === "Masuk").length;
    const diproses = tickets.filter(
      (x) => x.status === "Diverifikasi" || x.status === "Diteruskan" || x.status === "Diproses"
    ).length;
    return { total, selesai, masuk, diproses };
  }, [tickets]);

  const saveUpdateAspirasi = async () => {
    if (!selected) return;
    setSavingAspirasi(true);
    try {
      const { error } = await supabase
        .from("aspirasi")
        .update({ status, catatan_admin: catatan })
        .eq("ticket_code", selected.ticket_code);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((x) =>
          x.ticket_code === selected.ticket_code
            ? { ...x, status, catatan_admin: catatan, updated_at: new Date().toISOString() }
            : x
        )
      );
      setSelected((x) =>
        x ? { ...x, status, catatan_admin: catatan, updated_at: new Date().toISOString() } : x
      );
    } catch (e2) {
      alert(e2?.message || "Gagal menyimpan.");
    } finally {
      setSavingAspirasi(false);
    }
  };

  // ===== Kinerja CRUD
  const startEditKinerja = (item) => {
    setKForm({
      id: item.id,
      tanggal: item.tanggal || todayISO(),
      kategori: item.kategori || "Publikasi/Media",
      tag: item.tag || "",
      judul: item.judul || "",
      lokasi: item.lokasi || "Bandung",
      ringkasan: item.ringkasan || "",
      sourcesText: sourcesToText(item.sources),
    });
  };

  const resetKinerjaForm = () => setKForm({ ...emptyKinerja, tanggal: todayISO() });

  const saveKinerja = async () => {
    setErrKinerja("");
    if (!kForm.judul.trim()) return alert("Judul wajib diisi.");
    if (!kForm.tanggal) return alert("Tanggal wajib diisi.");
    if (!kForm.kategori.trim()) return alert("Kategori wajib diisi.");

    try {
      setSavingKinerja(true);

      const payload = {
        tanggal: kForm.tanggal,
        kategori: kForm.kategori.trim(),
        tag: kForm.tag.trim() || null,
        judul: kForm.judul.trim(),
        lokasi: kForm.lokasi.trim() || null,
        ringkasan: kForm.ringkasan.trim() || null,
        sources: parseSources(kForm.sourcesText),
      };

      if (kForm.id) {
        const { error } = await supabase.from("kinerja").update(payload).eq("id", kForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("kinerja").insert([payload]);
        if (error) throw error;
      }

      await fetchKinerja();
      resetKinerjaForm();
    } catch (e2) {
      setErrKinerja(e2?.message || "Gagal menyimpan kinerja.");
    } finally {
      setSavingKinerja(false);
    }
  };

  const deleteKinerja = async (id) => {
    const ok = confirm("Hapus item kinerja ini?");
    if (!ok) return;
    setErrKinerja("");
    try {
      setSavingKinerja(true);
      const { error } = await supabase.from("kinerja").delete().eq("id", id);
      if (error) throw error;

      await fetchKinerja();
      if (kForm.id === id) resetKinerjaForm();
    } catch (e2) {
      setErrKinerja(e2?.message || "Gagal menghapus kinerja.");
    } finally {
      setSavingKinerja(false);
    }
  };

  // ===== RESES helpers
  const newReses = () => {
    setRForm({
      ...emptyReses,
      tahun: new Date().getFullYear(),
      masa: 1,
      start_date: "",
      end_date: "",
      is_published: true,
      images: [],
      sourcesText: "",
      foto_path: "",
      foto_url: "",
      foto_caption: "",
    });
    setFotoPreview("");
  };

  const startEditReses = (r) => {
    setRForm({
      id: r.id || null,
      tahun: r.tahun || new Date().getFullYear(),
      masa: r.masa || 1,
      label: r.label || "",
      status: r.status || "Terjadwal",
      start_date: r.start_date || "",
      end_date: r.end_date || "",
      lokasi: r.lokasi || "Bandung",
      agenda_url: r.agenda_url || "",
      judul: r.judul || "",
      ringkasan: r.ringkasan || "",
      catatan: r.catatan || "",
      is_published: !!r.is_published,
      sourcesText: sourcesToText(r.sources),
      foto_path: r.foto_path || "",
      foto_url: r.foto_url || "",
      foto_caption: r.foto_caption || "",
      images: safeArr(r.images),
    });
    setFotoPreview("");
  };

  const computedLabel = useMemo(() => {
    const t = rForm.tahun || new Date().getFullYear();
    const m = rForm.masa || 1;
    const fallback = `Reses ${t} • Masa ${m}`;
    return rForm.label?.trim() ? rForm.label.trim() : fallback;
  }, [rForm.tahun, rForm.masa, rForm.label]);

  const uploadFotoUtama = async (file) => {
    if (!file) return;

    // preview local (langsung keliatan)
    const localUrl = URL.createObjectURL(file);
    setFotoPreview(localUrl);

    const folder = `${rForm.tahun || new Date().getFullYear()}-${rForm.masa || 1}`;
    const safeName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const path = `${folder}/${safeName}`;

    const { error: upErr } = await supabase.storage.from(BUCKET_RESES).upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (upErr) throw upErr;

    // Simpan PATH saja. URL akan di-resolve saat tampil.
    setRForm((f) => ({
      ...f,
      foto_path: path,
      foto_url: "", // jangan simpan signed URL
    }));
  };

  const clearFotoUtama = () => {
    setRForm((f) => ({ ...f, foto_path: "", foto_url: "", foto_caption: "" }));
    setFotoPreview("");
  };

  const saveReses = async () => {
    setErrReses("");

    const label = computedLabel;

    try {
      setSavingReses(true);

      const sourcesArr = parseSources(rForm.sourcesText);

      const payload = {
        tahun: Number(rForm.tahun),
        masa: Number(rForm.masa),
        label,
        status: rForm.status || "Terjadwal",
        start_date: rForm.start_date || null,
        end_date: rForm.end_date || null,
        lokasi: rForm.lokasi?.trim() || null,
        agenda_url: rForm.agenda_url?.trim() || null,
        judul: rForm.judul?.trim() || null,
        ringkasan: rForm.ringkasan?.trim() || null,
        catatan: rForm.catatan?.trim() || null,
        sources: sourcesArr,
        images: safeArr(rForm.images),
        is_published: !!rForm.is_published,

        // penting: simpan path, jangan simpan signed URL
        foto_path: rForm.foto_path || null,

        // opsi aman:
        // - kalau bucket public, kamu boleh simpan publicUrl, tapi nggak wajib
        // - kalau bucket private, simpan null (render pakai signed url)
        foto_url: null,

        foto_caption: rForm.foto_caption?.trim() || null,
      };

      const { error } = await supabase.from("reses").upsert(payload, { onConflict: "tahun,masa" });
      if (error) throw error;

      await fetchReses();
      newReses();
    } catch (e2) {
      setErrReses(e2?.message || "Gagal menyimpan reses.");
    } finally {
      setSavingReses(false);
    }
  };

  const deleteReses = async (id) => {
    const ok = confirm("Hapus data reses ini?");
    if (!ok) return;

    setErrReses("");
    try {
      setSavingReses(true);
      const { error } = await supabase.from("reses").delete().eq("id", id);
      if (error) throw error;

      await fetchReses();
      if (rForm.id === id) newReses();
    } catch (e2) {
      setErrReses(e2?.message || "Gagal menghapus reses.");
    } finally {
      setSavingReses(false);
    }
  };

  const refreshActive = () => {
    if (tab === "Aspirasi") fetchTickets();
    if (tab === "Kinerja") fetchKinerja();
    if (tab === "Reses") fetchReses();
  };

  // ===== UI: login page
  if (!session) {
    return (
      <section className="mt-6">
        <div className="mx-auto max-w-lg rounded-3xl border bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="h-4 w-4" /> Admin Dashboard (Supabase)
          </div>
          <p className="mt-2 text-sm text-black/70">
            Login pakai akun Supabase Auth yang sudah kamu whitelist di tabel{" "}
            <span className="font-semibold">admin_users</span>.
          </p>

          <form onSubmit={login} className="mt-5 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-black/60">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="admin@email.com"
                type="email"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-black/60">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="••••••••"
                type="password"
                required
              />
            </label>

            {loginErr ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {loginErr}
              </div>
            ) : null}

            <button
              className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              disabled={loginLoading}
            >
              {loginLoading ? "Masuk..." : "Masuk"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  // ===== UI: dashboard
  return (
    <section className="mt-6">
      <SectionTitle
        icon={UserCog}
        title="Dashboard"
        desc="Kelola Aspirasi, Kinerja, dan Reses (akses admin via Supabase Auth + RLS)."
      />

      {/* Top actions */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab("Aspirasi")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold hover:bg-black/5 ${
              tab === "Aspirasi" ? "bg-black text-white" : "border"
            }`}
          >
            <Inbox className="mr-2 inline h-4 w-4" />
            Aspirasi
          </button>

          <button
            onClick={() => setTab("Kinerja")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold hover:bg-black/5 ${
              tab === "Kinerja" ? "bg-black text-white" : "border"
            }`}
          >
            <CalendarDays className="mr-2 inline h-4 w-4" />
            Kinerja
          </button>

          <button
            onClick={() => setTab("Reses")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold hover:bg-black/5 ${
              tab === "Reses" ? "bg-black text-white" : "border"
            }`}
          >
            <CalendarDays className="mr-2 inline h-4 w-4" />
            Reses
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshActive}
            className="rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Refresh
          </button>
          <button
            onClick={logout}
            className="rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            <LogOut className="mr-2 inline h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* ========================= TAB ASPIRASI ========================= */}
      {tab === "Aspirasi" ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-3xl border bg-white p-4">
              <div className="text-xs text-black/60">Total</div>
              <div className="mt-1 text-2xl font-semibold">{statsAspirasi.total}</div>
            </div>
            <div className="rounded-3xl border bg-white p-4">
              <div className="text-xs text-black/60">Masuk</div>
              <div className="mt-1 text-2xl font-semibold">{statsAspirasi.masuk}</div>
            </div>
            <div className="rounded-3xl border bg-white p-4">
              <div className="text-xs text-black/60">Diproses</div>
              <div className="mt-1 text-2xl font-semibold">{statsAspirasi.diproses}</div>
            </div>
            <div className="rounded-3xl border bg-white p-4">
              <div className="text-xs text-black/60">Selesai</div>
              <div className="mt-1 text-2xl font-semibold">{statsAspirasi.selesai}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            {/* list */}
            <div className="rounded-3xl border bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold">Inbox Aspirasi</div>
                <div className="text-xs text-black/60">
                  {loadingAspirasi ? "Memuat..." : `${filteredAspirasi.length} item`}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-black/50" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari tiket / lokasi / isi..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2">
                  <Filter className="h-4 w-4 text-black/60" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-sm outline-none"
                  >
                    <option>Semua</option>
                    {STATUS_ASPIRASI.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {errAspirasi ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errAspirasi}
                </div>
              ) : null}

              <div className="mt-4 grid gap-2">
                {filteredAspirasi.map((t) => (
                  <button
                    key={t.ticket_code}
                    onClick={() => setSelected(t)}
                    className={`w-full rounded-2xl border p-4 text-left hover:bg-black/5 ${
                      selected?.ticket_code === t.ticket_code ? "bg-black/5" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{t.ticket_code}</div>
                      <Pill>{t.status}</Pill>
                    </div>
                    <div className="mt-1 text-xs text-black/60">
                      {t.kategori} • {t.lokasi}
                    </div>
                    <div className="mt-2 text-sm text-black/70 line-clamp-2">{t.isi}</div>
                    <div className="mt-2 text-xs text-black/50">Update: {fmtDate(t.updated_at)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* detail */}
            <div className="rounded-3xl border bg-white p-5">
              {!selected ? (
                <div className="grid place-items-center rounded-3xl bg-black/[0.02] p-10 text-center">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Inbox className="h-4 w-4" /> Pilih tiket di kiri
                  </div>
                  <div className="mt-2 text-sm text-black/60">
                    Update status dan catatan tindak lanjut di sini.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{selected.ticket_code}</div>
                      <div className="mt-1 text-sm text-black/60">
                        {selected.kategori} • {selected.lokasi}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold">
                        <BadgeCheck className="h-4 w-4" /> Dibuat: {fmtDate(selected.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold">
                        <BadgeCheck className="h-4 w-4" /> Update: {fmtDate(selected.updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-black/[0.02] p-4 text-sm text-black/80">
                    {selected.isi}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-xs text-black/60">Status</span>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-2xl border px-4 py-3 text-sm outline-none"
                      >
                        {STATUS_ASPIRASI.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>

                    <div className="rounded-2xl border p-4">
                      <div className="text-xs text-black/60">Pedoman cepat</div>
                      <div className="mt-1 text-sm text-black/70">
                        Jangan bikin janji. Tulis langkah: “Diteruskan ke…”, “Menunggu…”, “Selesai karena…”.
                      </div>
                    </div>
                  </div>

                  <label className="mt-4 grid gap-1">
                    <span className="text-xs text-black/60">Catatan admin (aman untuk publik)</span>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="min-h-28 rounded-2xl border px-4 py-3 text-sm outline-none"
                      placeholder="Contoh: Diteruskan ke dinas terkait, menunggu jadwal perbaikan."
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => alert("Next: notifikasi WA/email ke pelapor (kalau kontak diisi).")}
                      className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-black/5"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Notifikasi (next)
                    </button>

                    <button
                      onClick={saveUpdateAspirasi}
                      disabled={savingAspirasi}
                      className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {savingAspirasi ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* ========================= TAB KINERJA ========================= */}
      {tab === "Kinerja" ? (
        <div className="rounded-3xl border bg-white p-6">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">Kelola Kinerja</div>
            <div className="text-sm text-black/70">
              Tambah/edit item kinerja yang tampil di publik. Format source: 1 baris ={" "}
              <span className="font-semibold">Label|URL</span>.
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            {/* list */}
            <div className="rounded-3xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Daftar Kinerja</div>
                <div className="text-xs text-black/60">
                  {loadingKinerja ? "Memuat..." : `${kinerjaRows.length} item`}
                </div>
              </div>

              {errKinerja ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errKinerja}
                </div>
              ) : null}

              <div className="mt-4 grid gap-2">
                {kinerjaRows.map((r) => (
                  <div key={r.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{r.judul}</div>
                        <div className="mt-1 text-xs text-black/60">
                          {r.tanggal} • {r.kategori} {r.tag ? `• ${r.tag}` : ""} • {r.lokasi || "Bandung"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditKinerja(r)}
                          className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-black/5"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteKinerja(r.id)}
                          className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-black/5"
                          type="button"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-black/70 line-clamp-2">{r.ringkasan || "—"}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={fetchKinerja}
                className="mt-4 rounded-2xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
              >
                Refresh Kinerja
              </button>
            </div>

            {/* form */}
            <div className="rounded-3xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{kForm.id ? "Edit Kinerja" : "Tambah Kinerja"}</div>
                {kForm.id ? (
                  <button
                    onClick={resetKinerjaForm}
                    className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-black/5"
                    type="button"
                  >
                    Batal edit
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Tanggal</span>
                    <input
                      type="date"
                      value={kForm.tanggal}
                      onChange={(e) => setKForm((f) => ({ ...f, tanggal: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Kategori</span>
                    <input
                      value={kForm.kategori}
                      onChange={(e) => setKForm((f) => ({ ...f, kategori: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                      placeholder="Pengawasan / Legislasi / Publikasi/Media ..."
                    />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Judul</span>
                  <input
                    value={kForm.judul}
                    onChange={(e) => setKForm((f) => ({ ...f, judul: e.target.value }))}
                    className="rounded-2xl border px-4 py-3 text-sm outline-none"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Lokasi</span>
                    <input
                      value={kForm.lokasi}
                      onChange={(e) => setKForm((f) => ({ ...f, lokasi: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Tag (opsional)</span>
                    <input
                      value={kForm.tag}
                      onChange={(e) => setKForm((f) => ({ ...f, tag: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Ringkasan</span>
                  <textarea
                    value={kForm.ringkasan}
                    onChange={(e) => setKForm((f) => ({ ...f, ringkasan: e.target.value }))}
                    className="min-h-28 rounded-2xl border px-4 py-3 text-sm outline-none"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Sources (1 baris = Label|URL)</span>
                  <textarea
                    value={kForm.sourcesText}
                    onChange={(e) => setKForm((f) => ({ ...f, sourcesText: e.target.value }))}
                    className="min-h-24 rounded-2xl border px-4 py-3 text-sm outline-none"
                    placeholder={"Liputan Media|https://...\nAgenda DPRD|https://..."}
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={saveKinerja}
                    disabled={savingKinerja}
                    className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    type="button"
                  >
                    {savingKinerja ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={resetKinerjaForm}
                    disabled={savingKinerja}
                    className="rounded-2xl border px-4 py-3 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
                    type="button"
                  >
                    Reset
                  </button>
                </div>

                <div className="rounded-2xl bg-black/[0.02] p-4 text-sm text-black/70">
                  Tips: kalau belum ada dokumen/link, isi ringkasan dulu, lalu sources bisa ditambah belakangan.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================= TAB RESES ========================= */}
      {tab === "Reses" ? (
        <div className="rounded-3xl border bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Kelola Reses</div>
              <div className="text-sm text-black/70">
                Simpan aman: <span className="font-semibold">label wajib</span>,{" "}
                <span className="font-semibold">sources/images wajib array</span>, dan unik (tahun, masa) pakai{" "}
                <span className="font-semibold">upsert</span>.
              </div>
            </div>

            <button
              onClick={newReses}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-black/5"
              type="button"
              title="Buat form reses baru"
            >
              <Plus className="h-4 w-4" /> Reses baru
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            {/* list */}
            <div className="rounded-3xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Daftar Reses</div>
                <div className="text-xs text-black/60">
                  {loadingReses ? "Memuat..." : `${resesRows.length} item`}
                </div>
              </div>

              {errReses ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errReses}
                </div>
              ) : null}

              <div className="mt-4 grid gap-2">
                {resesRows.map((r) => (
                  <div key={r.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{r.label}</div>
                        <div className="mt-1 text-xs text-black/60">
                          {r.tahun} • Masa {r.masa} • {r.status || "—"} • {r.lokasi || "Bandung"} •{" "}
                          {r.is_published ? "Publik" : "Draft"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditReses(r)}
                          className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-black/5"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReses(r.id)}
                          className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-black/5"
                          type="button"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <ResesThumb
                        label={r.label}
                        fotoUrlFromDb={r.foto_url}
                        fotoPath={r.foto_path}
                        heightClass="h-36"
                      />
                      {!r.foto_path ? (
                        <div className="mt-2 text-xs text-black/50">Belum ada foto_path.</div>
                      ) : (
                        <div className="mt-2 text-xs text-black/50">
                          Path: <span className="font-mono">{r.foto_path}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={fetchReses}
                className="mt-4 rounded-2xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
                type="button"
              >
                Refresh Reses
              </button>
            </div>

            {/* form */}
            <div className="rounded-3xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{rForm.id ? "Edit Reses" : "Tambah Reses"}</div>
                <div className="text-xs text-black/60">Auto-label kalau kosong.</div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Tahun</span>
                    <input
                      type="number"
                      value={rForm.tahun}
                      onChange={(e) => setRForm((f) => ({ ...f, tahun: Number(e.target.value || 0) }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Masa</span>
                    <select
                      value={rForm.masa}
                      onChange={(e) => setRForm((f) => ({ ...f, masa: Number(e.target.value) }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Label (wajib)</span>
                  <input
                    value={rForm.label}
                    onChange={(e) => setRForm((f) => ({ ...f, label: e.target.value }))}
                    className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    placeholder={`Contoh: Reses ${rForm.tahun} • Masa ${rForm.masa}`}
                  />
                  <div className="text-xs text-black/50">
                    Kalau kosong, otomatis jadi: <span className="font-semibold">{computedLabel}</span>
                  </div>
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Status</span>
                    <select
                      value={rForm.status}
                      onChange={(e) => setRForm((f) => ({ ...f, status: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    >
                      {STATUS_RESES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Lokasi</span>
                    <input
                      value={rForm.lokasi}
                      onChange={(e) => setRForm((f) => ({ ...f, lokasi: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Tanggal mulai</span>
                    <input
                      type="date"
                      value={rForm.start_date || ""}
                      onChange={(e) => setRForm((f) => ({ ...f, start_date: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs text-black/60">Tanggal selesai</span>
                    <input
                      type="date"
                      value={rForm.end_date || ""}
                      onChange={(e) => setRForm((f) => ({ ...f, end_date: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Agenda URL (opsional)</span>
                  <input
                    value={rForm.agenda_url}
                    onChange={(e) => setRForm((f) => ({ ...f, agenda_url: e.target.value }))}
                    className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    placeholder="https://..."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Judul laporan (opsional)</span>
                  <input
                    value={rForm.judul}
                    onChange={(e) => setRForm((f) => ({ ...f, judul: e.target.value }))}
                    className="rounded-2xl border px-4 py-3 text-sm outline-none"
                    placeholder="Contoh: Serap aspirasi warga RW 05"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Ringkasan (opsional)</span>
                  <textarea
                    value={rForm.ringkasan}
                    onChange={(e) => setRForm((f) => ({ ...f, ringkasan: e.target.value }))}
                    className="min-h-28 rounded-2xl border px-4 py-3 text-sm outline-none"
                    placeholder="Tulis poin penting, hasil, dan tindak lanjut singkat."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Catatan internal (opsional)</span>
                  <textarea
                    value={rForm.catatan}
                    onChange={(e) => setRForm((f) => ({ ...f, catatan: e.target.value }))}
                    className="min-h-20 rounded-2xl border px-4 py-3 text-sm outline-none"
                    placeholder="Catatan tambahan untuk admin."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-black/60">Sources (Label|URL) — wajib array di DB</span>
                  <textarea
                    value={rForm.sourcesText}
                    onChange={(e) => setRForm((f) => ({ ...f, sourcesText: e.target.value }))}
                    className="min-h-24 rounded-2xl border px-4 py-3 text-sm outline-none"
                    placeholder={"Agenda DPRD|https://...\nLiputan Media|https://..."}
                  />
                </label>

                {/* FOTO UTAMA */}
                <div className="rounded-3xl border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold inline-flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Foto utama (upload)
                    </div>
                    <button
                      type="button"
                      onClick={clearFotoUtama}
                      className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-black/5"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-2xl border bg-black/[0.03]">
                    <div className="h-56 w-full">
                      {(fotoPreview || rForm.foto_path || rForm.foto_url) ? (
                        <ResesThumb
                          label="Preview foto"
                          fotoUrlFromDb={fotoPreview || rForm.foto_url}
                          fotoPath={fotoPreview ? "" : rForm.foto_path}
                          heightClass="h-56"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-sm text-black/50">
                          Foto belum dipilih
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="mt-3 grid gap-1">
                    <span className="text-xs text-black/60">Caption (opsional)</span>
                    <input
                      value={rForm.foto_caption}
                      onChange={(e) => setRForm((f) => ({ ...f, foto_caption: e.target.value }))}
                      className="rounded-2xl border px-4 py-3 text-sm outline-none"
                      placeholder="Contoh: Serap aspirasi warga RW 05"
                    />
                  </label>

                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        try {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          await uploadFotoUtama(file);
                        } catch (err) {
                          alert(err?.message || "Upload gagal.");
                        } finally {
                          e.target.value = "";
                        }
                      }}
                      className="block w-full rounded-2xl border px-4 py-3 text-sm"
                    />
                    <div className="mt-2 text-xs text-black/50">
                      Catatan: kalau bucket private, gambar tetap bisa tampil di dashboard (admin),
                      tapi public page butuh policy read atau signed url via anon yang diizinkan.
                    </div>

                    {rForm.foto_path ? (
                      <div className="mt-2 text-xs text-black/60">
                        Path: <span className="font-mono">{rForm.foto_path}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* publish */}
                <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!!rForm.is_published}
                    onChange={(e) => setRForm((f) => ({ ...f, is_published: e.target.checked }))}
                  />
                  <span className="text-sm font-semibold">Tampilkan ke publik (is_published)</span>
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveReses}
                    disabled={savingReses}
                    className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {savingReses ? "Menyimpan..." : "Simpan Reses"}
                  </button>

                  <button
                    type="button"
                    onClick={newReses}
                    disabled={savingReses}
                    className="rounded-2xl border px-4 py-3 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>

                <div className="rounded-2xl bg-black/[0.02] p-4 text-sm text-black/70">
                  Preview cepat: <span className="font-semibold">{computedLabel}</span> • {rForm.status} •{" "}
                  {rForm.lokasi || "Bandung"}
                  <br />
                  {rForm.foto_path ? (
                    <span className="text-xs text-black/60">
                      foto_path tersimpan. URL akan dibuat otomatis saat tampil.
                    </span>
                  ) : (
                    <span className="text-xs text-black/50">Belum ada foto_path.</span>
                  )}
                </div>

                {errReses ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errReses}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
