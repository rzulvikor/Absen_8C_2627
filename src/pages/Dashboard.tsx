import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
  UserX,
  Users,
} from "lucide-react";
import { useStore } from "../store";
import { PageHead } from "../components/ui";
import {
  addDays,
  formatDateShort,
  monthLabelID,
  monthOf,
  todayISO,
  weekdayShort,
} from "../lib/core";

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { students, records } = useStore();
  const today = todayISO();
  const month = monthOf(today);

  const todayRecs = useMemo(() => records.filter((r) => r.date === today), [records, today]);
  const monthRecs = useMemo(() => records.filter((r) => r.month === month), [records, month]);

  const pct = (rs: typeof records) =>
    rs.length ? Math.round((rs.filter((r) => r.status === "Hadir").length / rs.length) * 100) : null;

  const todayPct = pct(todayRecs);
  const monthPct = pct(monthRecs);
  const alpaMonth = monthRecs.filter((r) => r.status === "Tanpa Keterangan").length;

  /* Tren 7 hari terakhir */
  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      const rs = records.filter((r) => r.date === d);
      return {
        date: d,
        pct: pct(rs),
        hadir: rs.filter((r) => r.status === "Hadir").length,
        total: rs.length,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, today]);

  /* Sesi absen terbaru (dikelompokkan per tanggal) */
  const sessions = useMemo(() => {
    const map = new Map<string, typeof records>();
    records.forEach((r) => {
      const arr = map.get(r.date) || [];
      arr.push(r);
      map.set(r.date, arr);
    });
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 5)
      .map(([date, rs]) => ({
        date,
        total: rs.length,
        hadir: rs.filter((r) => r.status === "Hadir").length,
      }));
  }, [records]);

  const quick = [
    {
      page: "attendance",
      icon: ClipboardCheck,
      accent: "text-cyan-300",
      border: "hover:border-cyan-300/60",
      title: "Isi Absen Hari Ini",
      text: todayRecs.length
        ? `${todayRecs.length}/${students.length} siswa sudah tercatat — lanjutkan atau perbarui.`
        : "Tandai kehadiran seluruh siswa dengan cepat, satu per satu atau sekaligus.",
      done: todayRecs.length > 0,
    },
    {
      page: "monthly",
      icon: BarChart3,
      accent: "text-blue-300",
      border: "hover:border-blue-400/60",
      title: "Rekap Bulanan",
      text: `Persentase kehadiran tiap siswa untuk ${monthLabelID(month)}, siap cetak.`,
    },
    {
      page: "students",
      icon: Users,
      accent: "text-lime-300",
      border: "hover:border-lime-300/60",
      title: "Kelola Data Siswa",
      text: "Tambah, ubah, atau impor daftar siswa dari berkas CSV dalam sekejap.",
    },
  ];

  return (
    <section className="anim-rise">
      <PageHead
        kicker="Ringkasan Kelas"
        title={`Halo, Wali Kelas 8C`}
        desc={`Pantau kehadiran ${students.length} siswa · ${monthLabelID(month)} · SMP Negeri 61. Semua data tersimpan otomatis di perangkat ini.`}
      >
        <div className="glass-soft self-start px-4 py-3 rounded-2xl flex gap-3 items-center">
          <span className="w-2 h-2 rounded-full bg-lime-300 pulse-dot" />
          <span className="font-mono text-xs text-lime-300 tracking-wide">
            {todayRecs.length ? `ABSEN HARI INI · ${todayPct}% HADIR` : "BELUM ABSEN HARI INI"}
          </span>
        </div>
      </PageHead>

      {/* Kartu statistik */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          iconClass="text-cyan-300/40"
          label="Total Siswa"
          value={String(students.length)}
          valueClass="text-cyan-300"
          detail="terdaftar di kelas 8C"
        />
        <StatCard
          icon={Activity}
          iconClass="text-lime-300/40"
          label="Kehadiran Hari Ini"
          value={todayPct === null ? "—" : `${todayPct}%`}
          valueClass="text-lime-300"
          detail={
            todayRecs.length
              ? `${todayRecs.filter((r) => r.status === "Hadir").length} dari ${todayRecs.length} tercatat hadir`
              : "belum ada absensi masuk"
          }
        />
        <StatCard
          icon={TrendingUp}
          iconClass="text-sky-300/40"
          label={`Kehadiran ${monthLabelID(month).split(" ")[0]}`}
          value={monthPct === null ? "—" : `${monthPct}%`}
          valueClass="text-sky-300"
          detail={monthRecs.length ? `${monthRecs.length} catatan absensi bulan ini` : "belum ada catatan"}
        />
        <StatCard
          icon={UserX}
          iconClass="text-pink-300/40"
          label="Alpa Bulan Ini"
          value={String(alpaMonth)}
          valueClass="text-pink-300"
          detail="tanpa keterangan"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 mb-8">
        {/* Tren mingguan */}
        <div className="glass rounded-2xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold m-0">Tren Kehadiran</h3>
              <p className="text-xs text-slate-400 m-0 mt-1">Persentase hadir · 7 hari terakhir</p>
            </div>
            <CalendarDays className="w-5 h-5 text-cyan-300/50" />
          </div>
          <div className="flex items-end gap-2 h-40">
            {week.map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group" title={d.pct === null ? "Tidak ada absensi" : `${formatDateShort(d.date)} — ${d.pct}% hadir (${d.hadir}/${d.total})`}>
                <span className={`font-mono text-[10px] transition ${d.pct === null ? "text-slate-600" : "text-cyan-200 group-hover:text-cyan-300"}`}>
                  {d.pct === null ? "·" : `${d.pct}%`}
                </span>
                <div className="w-full max-w-9 h-24 rounded-lg bg-cyan-100/5 relative overflow-hidden flex items-end">
                  <div
                    className={`col-grow w-full rounded-lg transition-all ${
                      d.date === today
                        ? "bg-gradient-to-t from-cyan-400 to-lime-300"
                        : d.pct === null
                          ? "bg-cyan-100/8 h-1.5"
                          : "bg-gradient-to-t from-blue-500/80 to-cyan-300/90 group-hover:to-cyan-200"
                    }`}
                    style={{ height: d.pct === null ? "6px" : `${Math.max(d.pct, 8)}%`, animationDelay: `${i * 60}ms` }}
                  />
                </div>
                <span className={`font-mono text-[10px] ${d.date === today ? "text-lime-300 font-bold" : "text-slate-500"}`}>
                  {weekdayShort(d.date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sesi terbaru */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold m-0">Sesi Absen Terbaru</h3>
              <p className="text-xs text-slate-400 m-0 mt-1">5 tanggal terakhir yang tercatat</p>
            </div>
          </div>
          {sessions.length === 0 ? (
            <div className="h-40 grid place-items-center text-center">
              <div>
                <ClipboardCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 m-0">Belum ada sesi absensi.</p>
                <button
                  onClick={() => onNavigate("attendance")}
                  className="mt-3 text-xs font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 transition"
                >
                  Mulai absen sekarang <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {sessions.map((s, i) => {
                const p = Math.round((s.hadir / s.total) * 100);
                return (
                  <li key={s.date} className="anim-rise" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200">{formatDateShort(s.date)}</span>
                      <span className="font-mono text-slate-400">
                        {s.hadir}/{s.total} hadir · <span className="text-lime-300">{p}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-cyan-100/8 overflow-hidden">
                      <div className="bar-grow h-full bg-gradient-to-r from-lime-300 to-cyan-300 rounded-full" style={{ width: `${p}%`, animationDelay: `${i * 80}ms` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Aksi cepat */}
      <h3 className="font-display font-bold text-lg mb-4">Aksi Cepat</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {quick.map((q, i) => (
          <button
            key={q.page}
            onClick={() => onNavigate(q.page)}
            className={`anim-rise glass rounded-2xl text-left p-5 transition group ${q.border} hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start justify-between">
              <q.icon className={`w-7 h-7 ${q.accent} mb-8 group-hover:scale-110 transition-transform`} />
              {q.done && (
                <span className="font-mono text-[10px] text-lime-300 border border-lime-300/30 bg-lime-300/10 rounded-full px-2 py-0.5">
                  SELESAI
                </span>
              )}
            </div>
            <h4 className="font-display m-0 font-bold flex items-center gap-2">
              {q.title}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-300" />
            </h4>
            <p className="text-sm text-slate-400 mt-2 mb-0 leading-relaxed">{q.text}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  valueClass,
  detail,
}: {
  icon: typeof Users;
  iconClass: string;
  label: string;
  value: string;
  valueClass: string;
  detail: string;
}) {
  return (
    <article className="glass p-5 rounded-2xl relative overflow-hidden transition hover:-translate-y-0.5 hover:border-cyan-300/30">
      <Icon className={`absolute right-4 top-4 w-10 h-10 ${iconClass}`} />
      <p className="m-0 text-xs text-slate-400 tracking-wide">{label}</p>
      <p className={`m-0 mt-2 text-4xl font-bold font-mono ${valueClass}`}>{value}</p>
      <span className="text-xs text-slate-500">{detail}</span>
    </article>
  );
}
