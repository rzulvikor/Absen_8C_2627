import { useMemo, useState } from "react";
import { CalendarDays, Download, Printer, Table2 } from "lucide-react";
import { useStore } from "../store";
import { PageHead } from "../components/ui";
import {
  daysInMonth,
  downloadFile,
  formatDateID,
  isWeekend,
  monthLabelID,
  monthOf,
  printReport,
  STATUSES,
  STATUS_META,
  todayISO,
  toCSV,
  weekdayShort,
  type Status,
} from "../lib/core";

interface MonthRow {
  nis: string;
  name: string;
  c: Record<Status, number>;
  total: number;
  pct: number;
}

function useMonthRows(month: string) {
  const { students, records } = useStore();
  return useMemo<MonthRow[]>(() => {
    return students.map((s) => {
      const rs = records.filter((r) => r.studentId === s.id && r.month === month);
      const c: Record<Status, number> = { Hadir: 0, Sakit: 0, Izin: 0, "Tanpa Keterangan": 0 };
      rs.forEach((r) => c[r.status]++);
      return {
        nis: s.nis,
        name: s.name,
        c,
        total: rs.length,
        pct: rs.length ? Math.round((c.Hadir / rs.length) * 100) : 0,
      };
    });
  }, [students, records, month]);
}

/* =============== REKAP BULANAN =============== */

export function Monthly() {
  const [month, setMonth] = useState(monthOf(todayISO()));
  const rows = useMonthRows(month);
  const { toast } = useStore();

  const totals = useMemo(() => {
    const t: Record<Status, number> = { Hadir: 0, Sakit: 0, Izin: 0, "Tanpa Keterangan": 0 };
    let total = 0;
    rows.forEach((r) => {
      STATUSES.forEach((st) => (t[st] += r.c[st]));
      total += r.total;
    });
    return { t, total, pct: total ? Math.round((t.Hadir / total) * 100) : 0 };
  }, [rows]);

  const hasData = totals.total > 0;

  const doPrint = () => {
    if (!hasData) {
      toast("Belum ada data absensi untuk bulan ini.", "error");
      return;
    }
    const body = rows
      .map(
        (r, i) =>
          `<tr><td>${String(i + 1).padStart(2, "0")}</td><td class="left">${r.name}</td>` +
          STATUSES.map((st) => `<td style="color:${STATUS_META[st].print};font-weight:700">${r.c[st] || "-"}</td>`).join("") +
          `<td style="font-weight:700">${r.pct}%</td></tr>`
      )
      .join("");
    const foot = `<tr><td colspan="2" class="left">TOTAL KELAS</td>` +
      STATUSES.map((st) => `<td>${totals.t[st]}</td>`).join("") +
      `<td>${totals.pct}%</td></tr>`;
    const ok = printReport({
      title: `Rekap Kehadiran Bulanan — ${monthLabelID(month)}`,
      subtitle: `Kelas 8C · SMP Negeri 61 · dicetak ${formatDateID(todayISO())}`,
      orientation: "portrait",
      tableHTML: `<table><thead><tr><th>No</th><th>Nama Siswa</th><th>H</th><th>S</th><th>I</th><th>T</th><th>% Hadir</th></tr></thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table>`,
    });
    if (!ok) toast("Popup cetak terblokir. Izinkan popup untuk situs ini.", "error");
  };

  const doExport = () => {
    if (!hasData) {
      toast("Belum ada data untuk diekspor.", "error");
      return;
    }
    const csv = toCSV([
      ["No", "NIS", "Nama Siswa", "Hadir", "Sakit", "Izin", "Alpa", "% Hadir"],
      ...rows.map((r, i) => [i + 1, r.nis, r.name, r.c.Hadir, r.c.Sakit, r.c.Izin, r.c["Tanpa Keterangan"], `${r.pct}%`]),
      ["", "", "TOTAL", totals.t.Hadir, totals.t.Sakit, totals.t.Izin, totals.t["Tanpa Keterangan"], `${totals.pct}%`],
    ]);
    downloadFile(`rekap-bulanan-8c-${month}.csv`, csv);
    toast("Berkas CSV rekap bulanan berhasil diunduh.");
  };

  return (
    <section className="anim-rise">
      <PageHead
        kicker="Rekap Bulanan"
        title="Rekapitulasi Kehadiran"
        accent="text-sky-300"
        desc={`Akumulasi status kehadiran tiap siswa selama ${monthLabelID(month)}.` }
      >
        <label className="text-xs text-slate-400">
          Bulan
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="input-dark rounded-xl px-3 py-2.5 text-sm font-mono ml-2 block mt-1"
          />
        </label>
        <button
          onClick={doExport}
          className="glass-soft rounded-xl px-4 py-2.5 font-semibold text-sm flex gap-2 items-center hover:border-lime-300/50 hover:text-lime-300 transition"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
        <button
          onClick={doPrint}
          className="bg-sky-300 text-[#062036] rounded-xl px-4 py-2.5 font-bold text-sm flex gap-2 items-center hover:brightness-110 active:scale-[0.98] transition"
        >
          <Printer className="w-4 h-4" /> Cetak
        </button>
      </PageHead>

      <div className="glass rounded-2xl p-2 table-wrap overflow-auto">
        <table className="w-full min-w-[760px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-cyan-100/10 text-left">
              <th className="th-mono p-4">No</th>
              <th className="th-mono p-4">Nama Siswa</th>
              {STATUSES.map((st) => (
                <th key={st} className={`th-mono p-4 text-center ${STATUS_META[st].text}`} title={st}>
                  {STATUS_META[st].code}
                </th>
              ))}
              <th className="th-mono p-4 text-center">% Hadir</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.nis} className="border-b border-cyan-100/5 hover:bg-cyan-300/5 transition">
                <td className="p-4 font-mono text-slate-500 text-xs">{String(i + 1).padStart(2, "0")}</td>
                <td className="p-4 font-semibold">{r.name}</td>
                {STATUSES.map((st) => (
                  <td key={st} className={`p-4 text-center font-mono font-bold ${r.c[st] ? STATUS_META[st].text : "text-slate-700"}`}>
                    {r.c[st] || "·"}
                  </td>
                ))}
                <td className="p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-16 h-1.5 rounded-full bg-cyan-100/8 overflow-hidden hidden sm:block">
                      <div className={`h-full bar-grow ${STATUS_META.Hadir.bar}`} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="font-mono text-cyan-300 text-xs w-9 text-right">{r.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-cyan-300/25 bg-cyan-300/5">
              <td className="p-4" colSpan={2}>
                <span className="font-display font-bold text-cyan-200">TOTAL KELAS</span>
              </td>
              {STATUSES.map((st) => (
                <td key={st} className={`p-4 text-center font-mono font-bold ${STATUS_META[st].text}`}>
                  {totals.t[st]}
                </td>
              ))}
              <td className="p-4 text-center font-mono font-bold text-cyan-300">{totals.pct}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
        {STATUSES.map((st) => (
          <span key={st} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${STATUS_META[st].dot}`} />
            {STATUS_META[st].code} = {st}
          </span>
        ))}
      </div>
    </section>
  );
}

/* =============== REKAP HARIAN =============== */

export function Daily() {
  const [month, setMonth] = useState(monthOf(todayISO()));
  const { students, records, toast } = useStore();
  const today = todayISO();

  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return daysInMonth(y, (m || 1) - 1);
  }, [month]);

  const dayList = useMemo(
    () =>
      Array.from({ length: days }, (_, i) => {
        const d = `${month}-${String(i + 1).padStart(2, "0")}`;
        return { d, wd: weekdayShort(d), we: isWeekend(d), isToday: d === today };
      }),
    [month, days, today]
  );

  const cellMap = useMemo(() => {
    const map = new Map<string, Status>();
    records.forEach((r) => {
      if (r.month === month) map.set(`${r.studentId}|${r.date}`, r.status);
    });
    return map;
  }, [records, month]);

  const hasData = cellMap.size > 0;

  const doPrint = () => {
    if (!hasData) {
      toast("Belum ada data absensi untuk bulan ini.", "error");
      return;
    }
    const head =
      `<tr><th style="min-width:180px">Nama Siswa</th>` +
      dayList.map((x) => `<th>${Number(x.d.slice(8))}<br/><span style="font-weight:400">${x.wd}</span></th>`).join("") +
      `</tr>`;
    const body = students
      .map((s, i) => {
        const cells = dayList
          .map((x) => {
            const st = cellMap.get(`${s.id}|${x.d}`);
            const color = st ? STATUS_META[st].print : "#c3d2dd";
            return `<td style="color:${color};font-weight:700">${st ? STATUS_META[st].code : "·"}</td>`;
          })
          .join("");
        return `<tr><td class="left">${String(i + 1).padStart(2, "0")}. ${s.name}</td>${cells}</tr>`;
      })
      .join("");
    const ok = printReport({
      title: `Rekap Harian — ${monthLabelID(month)}`,
      subtitle: `Kelas 8C · SMP Negeri 61 · H = Hadir, S = Sakit, I = Izin, T = Tanpa Keterangan · dicetak ${formatDateID(today)}`,
      orientation: "landscape",
      tableHTML: `<table><thead>${head}</thead><tbody>${body}</tbody></table>`,
    });
    if (!ok) toast("Popup cetak terblokir. Izinkan popup untuk situs ini.", "error");
  };

  const doExport = () => {
    if (!hasData) {
      toast("Belum ada data untuk diekspor.", "error");
      return;
    }
    const csv = toCSV([
      ["No", "NIS", "Nama Siswa", ...dayList.map((x) => Number(x.d.slice(8)))],
      ...students.map((s, i) => [
        i + 1,
        s.nis,
        s.name,
        ...dayList.map((x) => {
          const st = cellMap.get(`${s.id}|${x.d}`);
          return st ? STATUS_META[st].code : "";
        }),
      ]),
    ]);
    downloadFile(`rekap-harian-8c-${month}.csv`, csv);
    toast("Berkas CSV rekap harian berhasil diunduh.");
  };

  return (
    <section className="anim-rise">
      <PageHead
        kicker="Rekap Harian"
        title="Matriks Kehadiran Harian"
        accent="text-pink-300"
        desc={`Peta status kehadiran seluruh siswa per tanggal selama ${monthLabelID(month)}.`}
      >
        <label className="text-xs text-slate-400">
          Bulan
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="input-dark rounded-xl px-3 py-2.5 text-sm font-mono ml-2 block mt-1"
          />
        </label>
        <button
          onClick={doExport}
          className="glass-soft rounded-xl px-4 py-2.5 font-semibold text-sm flex gap-2 items-center hover:border-lime-300/50 hover:text-lime-300 transition"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
        <button
          onClick={doPrint}
          className="bg-pink-400 text-[#2a0517] rounded-xl px-4 py-2.5 font-bold text-sm flex gap-2 items-center hover:brightness-110 active:scale-[0.98] transition"
        >
          <Printer className="w-4 h-4" /> Cetak
        </button>
      </PageHead>

      {/* Legenda */}
      <div className="glass-soft rounded-2xl px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 mb-4 text-xs items-center">
        <CalendarDays className="w-4 h-4 text-cyan-300/60" />
        {STATUSES.map((st) => (
          <span key={st} className={STATUS_META[st].text}>
            <strong className="font-mono">{STATUS_META[st].code}</strong> · {st}
          </span>
        ))}
        <span className="text-slate-500 ml-auto flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-cyan-300/10 border border-cyan-300/25" /> akhir pekan
        </span>
      </div>

      <div className="glass rounded-2xl p-2 table-wrap overflow-auto max-h-[70vh]">
        <table className="w-full text-xs border-collapse" style={{ minWidth: `${180 + days * 40}px` }}>
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#0b1e35]">
              <th className="th-mono p-3 text-left sticky left-0 bg-[#0b1e35] z-10 min-w-[200px] border-b border-cyan-100/10">
                Nama Siswa
              </th>
              {dayList.map((x) => (
                <th
                  key={x.d}
                  className={`th-mono p-2 text-center border-b border-cyan-100/10 ${
                    x.isToday ? "bg-cyan-300/15 text-cyan-200" : x.we ? "bg-pink-300/5 text-slate-500" : ""
                  }`}
                >
                  <span className="block">{Number(x.d.slice(8))}</span>
                  <span className="block font-body normal-case tracking-normal text-[9px] text-slate-500">{x.wd}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-cyan-300/5 transition group">
                <td className="p-3 font-semibold sticky left-0 bg-[#0b1e35] z-10 border-r border-cyan-100/10 group-hover:bg-[#0e233d] transition min-w-[200px]">
                  <span className="font-mono text-[10px] text-cyan-300 mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {s.name}
                </td>
                {dayList.map((x) => {
                  const st = cellMap.get(`${s.id}|${x.d}`);
                  return (
                    <td
                      key={x.d}
                      className={`p-2 text-center font-mono font-bold ${x.isToday ? "bg-cyan-300/8" : x.we ? "bg-pink-300/4" : ""} ${
                        st ? STATUS_META[st].text : "text-slate-700"
                      }`}
                    >
                      {st ? STATUS_META[st].code : "·"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!hasData && (
        <div className="glass rounded-2xl p-10 text-center mt-4">
          <Table2 className="w-9 h-9 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold m-0">Belum ada absensi pada {monthLabelID(month)}.</p>
          <p className="text-sm text-slate-400 mt-1 m-0">Isi absen terlebih dahulu, matriks akan terisi otomatis.</p>
        </div>
      )}
    </section>
  );
}
