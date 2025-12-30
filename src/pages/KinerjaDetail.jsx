import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, MapPin, ExternalLink, Share2, ArrowLeft } from "lucide-react";
import Pill from "../components/Pill";
import { KINERJA_ITEMS } from "../data/kinerjaData";

function fmtDate(iso) {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function KinerjaDetail() {
  const { id } = useParams();

  const item = useMemo(() => KINERJA_ITEMS.find((x) => x.id === id), [id]);

  const shareWhatsApp = () => {
    if (!item) return;
    const firstSrc = item.sources?.[0]?.url ? `\nSumber: ${item.sources[0].url}` : "";
    const text = encodeURIComponent(
      `Kinerja — ${item.title}\nTanggal: ${fmtDate(item.date)}\nLokasi: ${item.location}${firstSrc}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noreferrer");
  };

  if (!item) {
    return (
      <section className="mt-6">
        <div className="rounded-3xl border bg-white p-6">
          <div className="text-lg font-semibold">Item tidak ditemukan</div>
          <p className="mt-2 text-sm text-slate-600">
            Linknya mungkin salah atau datanya belum dimasukkan.
          </p>
          <Link
            to="/kinerja"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Kinerja
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="mb-4">
        <Link
          to="/kinerja"
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-[#007744]/5"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>

      <div className="rounded-3xl border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Pill>{item.category}</Pill>
            <Pill>{item.tag}</Pill>
          </div>

          <button
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-[#007744]/5"
          >
            <Share2 className="h-4 w-4" /> Bagikan
          </button>
        </div>

        <h1 className="mt-4 text-2xl font-semibold leading-snug">{item.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> {fmtDate(item.date)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {item.location}
          </span>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold">Ringkasan</div>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600">
            {(item.summary || []).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#007744]" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {item.nextSteps?.length ? (
          <div className="mt-6 rounded-2xl bg-[#EAF7EF] p-4">
            <div className="text-sm font-semibold">Tindak lanjut yang disarankan</div>
            <ul className="mt-2 grid gap-2 text-sm text-slate-600">
              {item.nextSteps.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#007744]" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {item.faq?.length ? (
          <div className="mt-6">
            <div className="text-sm font-semibold">FAQ singkat</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {item.faq.map((x) => (
                <div key={x.q} className="rounded-2xl bg-[#EAF7EF] p-4">
                  <div className="text-sm font-semibold">{x.q}</div>
                  <div className="mt-1 text-sm text-slate-600">{x.a}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {item.sources?.length ? (
          <div className="mt-6">
            <div className="text-sm font-semibold">Sumber</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.sources.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-[#007744]/5"
                >
                  {s.label || `Sumber ${idx + 1}`} <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
