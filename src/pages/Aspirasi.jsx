import React, { useMemo, useState } from "react";
import { Search, Send, BadgeCheck, AlertTriangle } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import { supabase } from "../lib/supabaseClient";

const KATEGORI = ["Infrastruktur", "Pendidikan", "Kesehatan", "UMKM", "Administrasi", "Lainnya"];

function fmtDate(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Aspirasi() {
  const [form, setForm] = useState({
    nama: "",
    kontak: "",
    kategori: "Infrastruktur",
    lokasi: "",
    isi: "",
  });

  const [loading, setLoading] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null); // ticket_code
  const [errMsg, setErrMsg] = useState("");

  const [cek, setCek] = useState("");
  const [cekLoading, setCekLoading] = useState(false);
  const [cekResult, setCekResult] = useState(null);
  const [cekErr, setCekErr] = useState("");

  const canSubmit = useMemo(() => {
    return form.lokasi.trim().length > 2 && form.isi.trim().length > 10 && !loading;
  }, [form, loading]);

  const submit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setTicketCreated(null);

    try {
      setLoading(true);

      const payload = {
        p_kategori: form.kategori,
        p_lokasi: form.lokasi.trim(),
        p_isi: form.isi.trim(),
        p_nama: form.nama.trim() || null,
        p_kontak: form.kontak.trim() || null,
      };

      const { data, error } = await supabase.rpc("submit_aspirasi", payload);
      if (error) throw error;

      const ticket = data?.[0]?.ticket_code;
      if (!ticket) throw new Error("Ticket code tidak terbaca dari server.");

      setTicketCreated(ticket);
      setForm({ nama: "", kontak: "", kategori: "Infrastruktur", lokasi: "", isi: "" });
    } catch (e2) {
      setErrMsg(e2?.message || "Gagal mengirim aspirasi.");
    } finally {
      setLoading(false);
    }
  };

  const cekStatus = async () => {
    setCekErr("");
    setCekResult(null);

    const ticket = cek.trim().toUpperCase();
    if (!ticket) return;

    try {
      setCekLoading(true);
      const { data, error } = await supabase
        .from("aspirasi_public")
        .select("ticket_code,kategori,lokasi,status,updated_at,created_at")
        .eq("ticket_code", ticket)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setCekErr("Tiket tidak ditemukan. Pastikan formatnya benar (contoh: BDG-000123).");
        return;
      }
      setCekResult(data);
    } catch (e2) {
      setCekErr(e2?.message || "Gagal cek status.");
    } finally {
      setCekLoading(false);
    }
  };

  return (
    <section className="mt-6">
      <SectionTitle
        icon={Send}
        title="Aspirasi"
        desc="Kirim aspirasi dan dapat nomor tiket. Status bisa dicek tanpa menampilkan identitas."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* FORM */}
        <form onSubmit={submit} className="rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold">Kirim aspirasi</div>
          <div className="mt-1 text-xs text-slate-600">
            Privasi: nama/kontak tidak ditampilkan publik. Yang publik hanya tiket + status.
          </div>

          <div className="mt-5 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Nama (opsional)</span>
                <input
                  value={form.nama}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#007744]/20 focus:border-[#007744]"
                  placeholder="Mis. Andi"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Kontak (opsional)</span>
                <input
                  value={form.kontak}
                  onChange={(e) => setForm((f) => ({ ...f, kontak: e.target.value }))}
                  className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#007744]/20 focus:border-[#007744]"
                  placeholder="WA / email"
                />
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Kategori</span>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
                  className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#007744]/20 focus:border-[#007744]"
                >
                  {KATEGORI.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Lokasi</span>
                <input
                  value={form.lokasi}
                  onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
                  className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#007744]/20 focus:border-[#007744]"
                  placeholder="Kecamatan/kelurahan/RT-RW"
                  required
                />
              </label>
            </div>

            <label className="grid gap-1">
              <span className="text-xs text-slate-600">Isi aspirasi</span>
              <textarea
                value={form.isi}
                onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
                className="min-h-32 rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#007744]/20 focus:border-[#007744]"
                placeholder="Tulis singkat tapi jelas: masalahnya apa, sejak kapan, dampak, dan kebutuhan."
                required
              />
            </label>

            {errMsg ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  <div>{errMsg}</div>
                </div>
              </div>
            ) : null}

            {ticketCreated ? (
              <div className="rounded-2xl border bg-[#EAF7EF] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-[#007744] p-2 text-white">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Aspirasi terkirim</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Nomor tiket kamu: <span className="font-semibold">{ticketCreated}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">Simpan nomor ini untuk cek status.</div>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#007744] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Mengirim..." : "Kirim"} <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* CEK STATUS */}
        <div className="rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold">Cek status tiket</div>
          <div className="mt-1 text-xs text-slate-600">Masukkan tiket (contoh: BDG-000123)</div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={cek}
              onChange={(e) => setCek(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="BDG-000123"
            />
            <button
              onClick={cekStatus}
              disabled={cekLoading}
              className="rounded-xl bg-[#007744] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              type="button"
            >
              {cekLoading ? "Cek..." : "Cek"}
            </button>
          </div>

          {cekErr ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>{cekErr}</div>
              </div>
            </div>
          ) : null}

          {cekResult ? (
            <div className="mt-4 rounded-3xl border bg-[#EAF7EF] p-5">
              <div className="text-xs text-slate-600">Tiket</div>
              <div className="mt-1 text-lg font-semibold">{cekResult.ticket_code}</div>

              <div className="mt-3 grid gap-2 text-sm text-slate-800">
                <div>
                  <span className="text-slate-600">Kategori:</span> {cekResult.kategori}
                </div>
                <div>
                  <span className="text-slate-600">Lokasi:</span> {cekResult.lokasi}
                </div>
                <div>
                  <span className="text-slate-600">Status:</span>{" "}
                  <span className="rounded-full bg-[#007744] px-3 py-1 text-xs font-semibold text-white">
                    {cekResult.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Dibuat: {fmtDate(cekResult.created_at)} • Update: {fmtDate(cekResult.updated_at)}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl bg-[#EAF7EF] p-4 text-sm text-slate-600">
            Tips biar cepat ditindaklanjuti: lokasi spesifik, foto/video kalau ada, dan jelaskan dampaknya.
          </div>
        </div>
      </div>
    </section>
  );
}
