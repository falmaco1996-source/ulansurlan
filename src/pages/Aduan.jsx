//src/pages/Aduan.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Send } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Pill from "../components/Pill";
import { supabase } from "../lib/supabaseClient";

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

function genTicketCode() {
  const a = String(Date.now()).slice(-8);
  const b = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `BDG-${a}-${b}`;
}

export default function Aduan() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const resesId = sp.get("reses") || sp.get("resesId") || "";

  const [reses, setReses] = useState(null);
  const [loadingReses, setLoadingReses] = useState(false);
  const [errReses, setErrReses] = useState("");

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    kategori: "Infrastruktur",
    lokasi: "",
    isi: "",
  });

  const period = useMemo(() => {
    if (!reses) return "-";
    const a = reses.start_date ? fmtDate(reses.start_date) : "";
    const b = reses.end_date ? fmtDate(reses.end_date) : "";
    if (!a && !b) return "-";
    return `${a}${b ? ` — ${b}` : ""}`;
  }, [reses]);

  useEffect(() => {
    const run = async () => {
      if (!resesId) return;
      setErrReses("");
      try {
        setLoadingReses(true);
        const { data, error } = await supabase
          .from("reses")
          .select("id,tahun,masa,label,start_date,end_date,lokasi,status,is_published")
          .eq("id", resesId)
          .maybeSingle();

        if (error) throw error;
        setReses(data || null);

        if (data?.lokasi) setForm((f) => ({ ...f, lokasi: f.lokasi || data.lokasi }));
      } catch (e) {
        setErrReses(e?.message || "Gagal memuat detail reses.");
        setReses(null);
      } finally {
        setLoadingReses(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resesId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!resesId) return alert("Reses tidak valid. Akses dari tombol di halaman Program.");
    if (!form.lokasi.trim()) return alert("Lokasi wajib diisi.");
    if (!form.isi.trim()) return alert("Isi aduan wajib diisi.");

    setToast(null);
    try {
      setSaving(true);

      const payload = {
        ticket_code: genTicketCode(),
        kategori: form.kategori,
        lokasi: form.lokasi.trim(),
        isi: form.isi.trim(),
        status: "Masuk",
        catatan_admin: null,
        reses_id: resesId,
      };

      const { error } = await supabase.from("aspirasi").insert([payload]);
      if (error) throw error;

      setToast({
        title: "Aduan terkirim",
        msg: `Nomor tiket: ${payload.ticket_code}. Aduan ini terhubung ke reses yang kamu pilih.`,
      });

      setForm({ kategori: "Infrastruktur", lokasi: form.lokasi.trim(), isi: "" });
    } catch (e2) {
      alert(e2?.message || "Gagal mengirim aduan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-[#007744]/5"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <button
          onClick={() => nav("/program")}
          className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-[#007744]/5"
        >
          Ke Program
        </button>
      </div>

      <SectionTitle
        icon={Send}
        title="Aduan Reses"
        desc="Form ini khusus untuk aduan yang terkait reses tertentu. Aduan akan tampil pada kartu resesnya."
      />

      {toast ? (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-green-600 p-2 text-white">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{toast.title}</div>
              <div className="mt-1 text-sm">{toast.msg}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => nav("/program")}
                  className="rounded-2xl bg-[#007744] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Lihat di Program
                </button>
                <button
                  onClick={() => setToast(null)}
                  className="rounded-2xl border px-4 py-2 text-xs font-semibold hover:bg-[#007744]/5"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        {/* left: info reses */}
        <div className="rounded-3xl border bg-white p-5">
          <div className="text-sm font-semibold">Reses yang dipilih</div>

          {loadingReses ? (
            <div className="mt-3 text-sm text-slate-600">Memuat...</div>
          ) : errReses ? (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errReses}
            </div>
          ) : !reses ? (
            <div className="mt-3 text-sm text-slate-600">
              Tidak ada reses terpilih. Buka dari tombol “Buat Aduan dari Reses” di halaman Program.
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{reses.status || "—"}</Pill>
                <Pill>{String(reses.tahun || "-")}</Pill>
                <Pill>Masa {String(reses.masa || "-")}</Pill>
              </div>

              <div className="mt-3 text-base font-semibold">{reses.label || "Reses"}</div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> {period}
                </div>
                <div className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {reses.lokasi || "Bandung"}
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Aduan yang kamu kirim dari halaman ini akan otomatis tersimpan dengan{" "}
                <span className="font-semibold">reses_id</span>.
              </div>
            </div>
          )}
        </div>

        {/* right: form */}
        <form onSubmit={submit} className="rounded-3xl border bg-white p-5">
          <div className="text-sm font-semibold">Form Aduan</div>
          <div className="mt-1 text-xs text-slate-600">
            Publik hanya melihat ringkasan aduan (tanpa identitas). Admin memproses lewat Dashboard.
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Kategori</span>
              <select
                value={form.kategori}
                onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
              >
                <option>Infrastruktur</option>
                <option>Kesehatan</option>
                <option>Pendidikan</option>
                <option>UMKM</option>
                <option>Administrasi</option>
                <option>Lainnya</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Lokasi (wajib)</span>
              <input
                value={form.lokasi}
                onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
                placeholder="Contoh: Kel. Sukagalih, RW 05"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Isi aduan (wajib)</span>
              <textarea
                value={form.isi}
                onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
                className="min-h-32 rounded-2xl border px-4 py-3 text-sm outline-none"
                placeholder="Tulis singkat tapi jelas: masalahnya apa, sejak kapan, dampak, kebutuhan."
                required
              />
            </label>

            <button
              type="submit"
              disabled={saving || !resesId}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#007744] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Mengirim..." : "Kirim Aduan"} <Send className="h-4 w-4" />
            </button>

            {!resesId ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Reses belum terdeteksi. Akses halaman ini dari tombol di Program.
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
