import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Database,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Orbit,
  ShieldCheck,
  Users,
} from "lucide-react";
import { StoreProvider, useStore } from "./store";
import { ToastHost } from "./components/ui";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import { Daily, Monthly } from "./pages/Recaps";
import Students from "./pages/Students";
import Backup from "./pages/Backup";
import { STORAGE_KEY } from "./lib/core";

type PageId = "dashboard" | "attendance" | "monthly" | "daily" | "students" | "backup";

const NAV: { id: PageId; label: string; icon: typeof Orbit; kicker: string; heading: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, kicker: "BERANDA", heading: "Dashboard" },
  { id: "attendance", label: "Absen Kelas", icon: ClipboardCheck, kicker: "INPUT HARIAN", heading: "Absen Kelas" },
  { id: "monthly", label: "Rekap Bulanan", icon: BarChart3, kicker: "REKAP", heading: "Rekap Kehadiran" },
  { id: "daily", label: "Rekap Harian", icon: CalendarDays, kicker: "REKAP", heading: "Rekap Harian" },
  { id: "students", label: "Data Siswa", icon: Users, kicker: "MANAJEMEN", heading: "Data Siswa" },
  { id: "backup", label: "Backup & Sync", icon: Database, kicker: "SINKRONISASI", heading: "Backup & Sync" },
];

function Shell() {
  const { students, records } = useStore();
  const [page, setPage] = useState<PageId>("dashboard");
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const active = NAV.find((n) => n.id === page)!;

  const kb = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "";
      return (raw.length / 1024).toFixed(1);
    } catch {
      return "0";
    }
  }, [students, records]);

  const navigate = (p: string) => {
    setPage(p as PageId);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-shell relative min-h-screen flex">
      {/* ambient orbs */}
      <div className="orb w-[420px] h-[420px] bg-cyan-400/12 -top-24 -right-24" />
      <div className="orb w-[360px] h-[360px] bg-blue-500/12 bottom-[-120px] left-[12%]" style={{ animationDelay: "-6s" }} />
      <div className="orb w-[280px] h-[280px] bg-pink-500/8 top-[38%] right-[30%]" style={{ animationDelay: "-11s" }} />
      <div className="grid-bg fixed inset-0 pointer-events-none" />

      {/* shade mobile */}
      {mobileOpen && (
        <button
          aria-label="Tutup navigasi"
          onClick={closeMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden cursor-default"
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`glass fixed md:sticky top-0 h-screen z-50 flex flex-col transition-all duration-300 border-y-0 border-l-0 ${
          compact ? "md:w-[74px]" : "md:w-[262px]"
        } w-[262px] ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-20 flex items-center px-5 gap-3 border-b border-cyan-100/10 overflow-hidden shrink-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-300 text-[#071426] grid place-items-center shrink-0 shadow-[0_0_28px_rgba(45,226,230,0.55)]">
            <Orbit className="w-5 h-5" />
          </div>
          <div className={`min-w-0 transition-opacity duration-200 ${compact ? "md:opacity-0 md:w-0 md:pointer-events-none" : ""} overflow-hidden`}>
            <p className="m-0 font-display font-bold text-sm tracking-wide whitespace-nowrap">Presensia</p>
            <p className="m-0 text-[10px] font-mono text-cyan-300 whitespace-nowrap">KELAS 8C · SMPN 61</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto table-wrap" aria-label="Navigasi utama">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => navigate(n.id)}
              title={compact ? n.label : undefined}
              className={`nav-item w-full rounded-xl p-3 flex items-center gap-4 text-left ${page === n.id ? "active" : ""}`}
            >
              <n.icon className="w-5 h-5 shrink-0" />
              <span
                className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                  compact ? "md:opacity-0 md:w-0 md:pointer-events-none" : ""
                } overflow-hidden`}
              >
                {n.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="m-3 p-3 rounded-xl bg-cyan-300/5 border border-cyan-300/10 overflow-hidden">
          <div className="flex gap-3 items-center">
            <ShieldCheck className="w-5 h-5 text-lime-300 shrink-0" />
            <span
              className={`text-[11px] text-slate-300 whitespace-nowrap transition-opacity duration-200 ${
                compact ? "md:opacity-0 md:w-0 md:pointer-events-none" : ""
              } overflow-hidden`}
            >
              Data tersimpan lokal · {kb} KB · {records.length} catatan
            </span>
          </div>
        </div>
      </aside>

      {/* ===== Konten ===== */}
      <div className="flex-1 min-w-0 relative z-10">
        <header className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-cyan-100/10 bg-[#071426]/70 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.innerWidth < 768 ? setMobileOpen((v) => !v) : setCompact((v) => !v))}
              aria-label="Buka atau tutup navigasi"
              className="w-10 h-10 rounded-xl glass-soft text-cyan-300 grid place-items-center hover:bg-cyan-300/15 active:scale-95 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="m-0 font-mono text-[10px] tracking-[0.22em] text-cyan-300">{active.kicker}</p>
              <h1 className="m-0 text-lg font-display font-bold leading-tight">{active.heading}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="m-0 text-xs font-semibold">SMP Negeri 61</p>
              <p className="m-0 text-[10px] text-slate-400 font-mono">
                {now.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
            <div className="w-11 h-11 rounded-full border border-cyan-300/50 bg-cyan-300/10 grid place-items-center text-cyan-300 shadow-[0_0_22px_rgba(45,226,230,0.18)]">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1500px] mx-auto">
          <div key={page}>
            {page === "dashboard" && <Dashboard onNavigate={navigate} />}
            {page === "attendance" && <Attendance />}
            {page === "monthly" && <Monthly />}
            {page === "daily" && <Daily />}
            {page === "students" && <Students />}
            {page === "backup" && <Backup />}
          </div>
        </main>

        <footer className="px-4 md:px-8 pb-6 max-w-[1500px] mx-auto">
          <p className="text-[11px] text-slate-600 font-mono m-0">
            PRESENSIA 8C · absensi tersimpan otomatis di perangkat — gunakan Backup & Sync untuk menyalin ke Google Sheets.
          </p>
        </footer>
      </div>

      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
