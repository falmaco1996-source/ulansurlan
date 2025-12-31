//src/components/Layout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import AICallCenter from "./components/AICallCenter"; // ✅ tambah ini

const NAV_ITEMS = [
  { label: "Beranda", to: "/" },
  { label: "Kinerja", to: "/kinerja" },
  { label: "Aspirasi", to: "/aspirasi" },
  { label: "Program", to: "/program" },
  { label: "Media", to: "/media" },
  { label: "Tentang", to: "/tentang" },
  { label: "Kontak", to: "/kontak" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navWrapRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState({ x: 0, w: 0, ready: false });

  const activeTo = useMemo(() => {
    const p = location.pathname || "/";
    const exact = NAV_ITEMS.find((x) => x.to === p);
    if (exact) return exact.to;

    const candidates = NAV_ITEMS
      .filter((x) => x.to !== "/" && p.startsWith(x.to))
      .sort((a, b) => b.to.length - a.to.length);

    return candidates[0]?.to || "/";
  }, [location.pathname]);

  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((n) => n.to === activeTo));

  const goNext = () => {
    const next = NAV_ITEMS[(activeIndex + 1) % NAV_ITEMS.length];
    navigate(next.to);
  };

  const recalcIndicator = () => {
    const wrap = navWrapRef.current;
    const el = itemRefs.current[activeTo];
    if (!wrap || !el) return;

    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const x = elRect.left - wrapRect.left;
    const w = elRect.width;

    setIndicator({ x, w, ready: true });
  };

  useLayoutEffect(() => {
    recalcIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTo]);

  useLayoutEffect(() => {
    const onResize = () => recalcIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTo]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF7EF] via-white to-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-[#007744]/15 bg-white/85 backdrop-blur">
        <div className="h-1 w-full bg-gradient-to-r from-[#007744] via-[#0C8C5A] to-[#FFF212]" />

        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-xl px-2 py-1 text-left hover:bg-[#007744]/5"
            aria-label="Ke Beranda"
          >
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#007744] text-[#FFF212] shadow-sm">
              <span className="text-sm font-extrabold">MS</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Mochammad Ulan Surlan</div>
              <div className="text-xs text-slate-600">DPRD Kota Bandung</div>
            </div>
          </button>

          <nav className="hidden md:flex">
            <div
              ref={navWrapRef}
              className="relative flex items-center gap-1 rounded-2xl border border-[#007744]/15 bg-gradient-to-r from-[#EAF7EF] to-white p-1 shadow-sm"
            >
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute top-1 bottom-1 rounded-xl",
                  "bg-[#007744] shadow-[0_10px_25px_rgba(0,119,68,0.25)]",
                  "ring-2 ring-[#FFF212]/70",
                  "after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-1",
                  "after:h-[3px] after:rounded-full after:bg-[#FFF212]",
                  "after:shadow-[0_0_12px_rgba(255,242,18,0.70)]",
                ].join(" ")}
                style={{
                  width: indicator.w,
                  transform: `translateX(${indicator.x}px)`,
                  transitionProperty: "transform, width, opacity",
                  transitionDuration: "320ms",
                  transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                  opacity: indicator.ready ? 1 : 0,
                }}
              />

              {NAV_ITEMS.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.to === "/"}
                  ref={(el) => {
                    if (el) itemRefs.current[m.to] = el;
                  }}
                  className={({ isActive }) =>
                    [
                      "relative z-10 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-[#FFF212]/70",
                      isActive
                        ? "text-white"
                        : "text-[#005A32] hover:bg-white/70 hover:shadow-[0_8px_18px_rgba(0,119,68,0.10)] hover:-translate-y-[1px]",
                    ].join(" ")
                  }
                >
                  {m.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/aspirasi")}
              className="hidden rounded-xl bg-[#007744] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(0,119,68,0.22)] ring-1 ring-[#007744]/25 hover:opacity-95 md:inline-flex"
            >
              Kirim Aspirasi
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="rounded-xl border border-[#F4E400] bg-[#FFF212] px-3 py-2 text-sm font-semibold text-[#005A32] shadow-[0_10px_22px_rgba(255,242,18,0.25)] hover:brightness-95"
            >
              Admin
            </button>

            <button
              className="rounded-xl border border-[#007744]/25 bg-white px-3 py-2 text-sm hover:bg-[#EAF7EF] md:hidden"
              onClick={goNext}
              aria-label="Navigasi"
            >
              <ArrowRight className="h-4 w-4 text-[#005A32]" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-3 sm:px-6 lg:px-8">
        <Outlet />

        <footer className="pb-10 pt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} • Created By Indra Sulanjana.
        </footer>
      </main>

      {/* ✅ Popup AI Call Center muncul di semua menu */}
      <AICallCenter />
    </div>
  );
}
