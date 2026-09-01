import { useEffect, useMemo, useState } from "react";
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Eraser,
  Loader2,
  Search,
  Send,
} from "lucide-react";
import { useStore, type Selection } from "../store";
import { PageHead, ConfirmDialog } from "../components/ui";
import {
  addDays,
  daysInMonth,
  firstDayMonday,
  formatDateID,
  monthLabelID,
  parseISO,
  STATUSES,
  STATUS_META,
  todayISO,
} from "../lib/core";

export default function Attendance() {
  const { students, records, recordsOn, hasRecordsOn, saveAttendance, toast } = useStore();
  const [date, setDate] = useState(todayISO());
  const [sel, setSel] = useState<Record<string, Selection>>({});
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmPartial, setConfirmPartial] = useState(false);
  const [calBase, setCalBase] = useState(() => {
    const d = parseISO(todayISO());
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  /* Muat ulang pilihan saat tanggal / data berubah */
  useEffect(() => {
    const map: Record<string, Selection> = {};
    records.forEach((r) => {
      if (r.date === date) map[r.studentId] = { status: r.status, note: r.note };
    });
    setSel(map);
  }, [date, records]);

  const filled = Object.keys(sel).length;
  const total = students.length;
  const dayRecords = recordsOn(date);
  const alreadySaved = hasRecordsOn(date);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Hadir: 0, Sakit: 0, Izin: 0, "Tanpa Keterangan": 0 };
    Object.values(sel).forEach((s) => c[s.status]++);
    return c;
  }, [sel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => !q || s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
  }, [students, query]);

  const setStatus = (id: string, status: Selection["status"]) =>
    setSel((prev) => ({ ...prev, [id]: { status, note: prev[id]?.note || "" } }));

  const setNote = (id: string, note: string) =>
    setSel((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], note } } : prev));

  const markAllPresent = () => {
    setSel((prev) => {
      const next: Record<string, Selection> = {};
      students.forEach((s) => {
        next[s.id] = { status: "Hadir", note: prev[s.id]?.note || "" };
      });
      return next;
    });
    toast("Semua siswa ditandai hadir — periksa kembali sebelum disimpan.", "info");
  };

  const resetSelections = () => {
    setSel({});
    toast("Pilihan status dikosongkan.", "info");
  };

  const doSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      const res = saveAttendance(date, sel);
      setSaving(false);
      setConfirmPartial(false);
      toast(
        `Absensi ${formatDateID(date)} tersimpan — ${res.saved} baru, ${res.updated} diperbarui, ${res.hadir} hadir.`
      );
    }, 420);
  };

  const handleSubmit = () => {
    if (filled === 0) {
      toast("Pilih status minimal satu siswa terlebih dahulu.", "error");
      return;
    }
    if (filled < total) {
      setConfirmPartial(true);
      return;
    }
    doSave();
  };

  /* Kalender mini */
  const calDays = useMemo(() => {
    const days = daysInMonth(calBase.y, calBase.m);
    const first = firstDayMonday(calBase.y, calBase.m);
    const monthStr = `${calBase.y}-${String(calBase.m + 1).padStart(2, "0")}`;
    const marked = new Set(records.filter((r) => r.month === monthStr).map((r) => r.date));
    const cells: (string | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) {
      cells.push(`${monthStr}-${String(d).padStart(2, "0")}`);
    }
    return { cells, marked };
  }, [calBase, records]);

  const today = todayISO();

  return (
    <section className="anim-rise">
      <PageHead
        kicker="Input Harian"
        title="Absen Kelas"
        desc={`Catat kehadiran ${total} siswa untuk ${formatDateID(date)}. Mengubah tanggal akan memuat absensi yang sudah tersimpan.`}
      >
        <span
          className={`glass-soft self-start px-4 py-3 rounded-2xl font-mono text-xs tracking-wide flex items-center gap-2 ${
            alreadySaved ? "text-lime-300" : "text-slate-400"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${alreadySaved ? "bg-lime-300 pulse-dot" : "bg-slate-600"}`} />
          {alreadySaved ? `SUDAH TERSIMPAN · ${dayRecords.length} SISWA` : "BELUM ADA DATA TANGGAL INI"}
        </span>
      </PageHead>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ===== Panel alat ===== */}
        <div className="xl:w-80 shrink-0 space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold m-0">Tanggal Absensi</h3>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDate(addDays(date, -1))}
                className="w-10 h-10 rounded-xl border border-cyan-100/15 text-slate-300 grid place-items-center hover:border-cyan-300/60 hover:text-cyan-300 transition shrink-0"
                aria-label="Hari sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  if (!e.target.value) return;
                  setDate(e.target.value);
                  const d = parseISO(e.target.value);
                  setCalBase({ y: d.getFullYear(), m: d.getMonth() });
                }}
                className="input-dark rounded-xl px-3 py-2 text-sm w-full font-mono"
              />
              <button
                onClick={() => setDate(addDays(date, 1))}
                className="w-10 h-10 rounded-xl border border-cyan-100/15 text-slate-300 grid place-items-center hover:border-cyan-300/60 hover:text-cyan-300 transition shrink-0"
                aria-label="Hari berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {date !== today && (
              <button
                onClick={() => {
                  setDate(today);
                  const d = parseISO(today);
                  setCalBase({ y: d.getFullYear(), m: d.getMonth() });
                }}
                className="mt-2 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition"
              >
                ↩ kembali ke hari ini
              </button>
            )}

            {/* Kalender mini */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs text-cyan-200 m-0">{monthLabelID(`${calBase.y}-${String(calBase.m + 1).padStart(2, "0")}`)}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCalBase((b) => (b.m === 0 ? { y: b.y - 1, m: 11 } : { y: b.y, m: b.m - 1 }))}
                    className="w-6 h-6 rounded-md grid place-items-center text-slate-400 hover:bg-cyan-300/15 hover:text-cyan-300 transition"
                    aria-label="Bulan sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCalBase((b) => (b.m === 11 ? { y: b.y + 1, m: 0 } : { y: b.y, m: b.m + 1 }))}
                    className="w-6 h-6 rounded-md grid place-items-center text-slate-400 hover:bg-cyan-300/15 hover:text-cyan-300 transition"
                    aria-label="Bulan berikutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 mb-1 font-mono">
                {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calDays.cells.map((ds, i) =>
                  ds === null ? (
                    <span key={`x${i}`} />
                  ) : (
                    <button
                      key={ds}
                      type="button"
                      onClick={() => setDate(ds)}
                      className={`cal-day relative h-8 rounded-lg text-xs text-slate-300 ${ds === today ? "today" : ""} ${ds === date ? "chosen" : ""}`}
                    >
                      {Number(ds.slice(8))}
                      {calDays.marked.has(ds) && ds !== date && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-lime-300" />
                      )}
                    </button>
                  )
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-3 m-0 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-lime-300 inline-block" /> titik hijau = sudah ada absensi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={markAllPresent}
              className="rounded-xl px-3 py-3 font-bold text-sm bg-lime-300 text-[#152400] flex justify-center items-center gap-2 hover:brightness-110 active:scale-[0.98] transition"
            >
              <CheckCheck className="w-4 h-4" /> Semua Hadir
            </button>
            <button
              onClick={resetSelections}
              className="rounded-xl px-3 py-3 font-bold text-sm border border-cyan-100/20 text-slate-300 flex justify-center items-center gap-2 hover:bg-cyan-100/5 active:scale-[0.98] transition"
            >
              <Eraser className="w-4 h-4" /> Kosongkan
            </button>
          </div>

          {/* Ringkasan status */}
          <div className="glass-soft rounded-2xl p-4">
            <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500 m-0 mb-3">RINGKASAN PILIHAN</p>
            <div className="grid grid-cols-4 gap-2">
              {STATUSES.map((st) => (
                <div key={st} className="text-center">
                  <p className={`font-mono text-xl font-bold m-0 ${counts[st] ? STATUS_META[st].text : "text-slate-700"}`}>
                    {counts[st]}
                  </p>
                  <p className="text-[10px] text-slate-500 m-0">{STATUS_META[st].code} · {st === "Tanpa Keterangan" ? "Alpa" : st}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-slate-400">Terisi</span>
                <span className="font-mono text-cyan-300">{filled} / {total}</span>
              </div>
              <div className="h-2 rounded-full bg-cyan-100/8 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${filled === total ? "bg-gradient-to-r from-lime-300 to-cyan-300" : "bg-cyan-300/70"}`}
                  style={{ width: `${total ? (filled / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-500 px-1 m-0">
            Tips: klik <span className="text-lime-300 font-semibold">Semua Hadir</span> lalu ubah satu per satu siswa yang sakit, izin, atau alpa — jauh lebih cepat daripada mengisi manual.
          </p>
        </div>

        {/* ===== Daftar siswa ===== */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
            <div>
              <p className="text-xs font-mono text-cyan-300 tracking-[0.18em] m-0">DAFTAR SISWA</p>
              <h3 className="font-display font-bold mt-1 mb-0 text-xl">{formatDateID(date)}</h3>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau NIS…"
                className="input-dark rounded-xl pl-9 pr-3 py-2.5 text-sm w-56"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 m-0">Tidak ada siswa yang cocok dengan "{query}".</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-3">
              {filtered.map(({ s, i }, idx) => {
                const v = sel[s.id];
                const meta = v ? STATUS_META[v.status] : null;
                return (
                  <article
                    key={s.id}
                    className={`glass rounded-2xl p-4 anim-rise transition hover:border-cyan-300/35 ${v ? "border-cyan-300/25" : ""}`}
                    style={{ animationDelay: `${Math.min(idx * 22, 300)}ms` }}
                  >
                    <div className="flex justify-between gap-3 items-center">
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] text-cyan-300">
                          {String(i + 1).padStart(2, "0")} · {s.nis}
                        </span>
                        <h4 className="m-0 mt-0.5 font-semibold text-sm leading-snug truncate" title={s.name}>
                          {s.name}
                        </h4>
                      </div>
                      <span className={`font-mono text-2xl font-bold shrink-0 ${meta ? meta.text : "text-slate-700"}`}>
                        {meta ? meta.code : "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 mt-3">
                      {STATUSES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          data-status={st}
                          onClick={() => setStatus(s.id, st)}
                          className={`status-btn rounded-lg px-1 py-2 text-[10px] font-semibold ${v?.status === st ? "selected" : ""}`}
                        >
                          {st === "Tanpa Keterangan" ? "Alpa" : st}
                        </button>
                      ))}
                    </div>
                    <input
                      value={v?.note || ""}
                      onChange={(e) => setNote(s.id, e.target.value)}
                      className="mt-2.5 w-full bg-[#06101f]/75 border border-cyan-100/10 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-300 transition"
                      placeholder="Catatan opsional…"
                    />
                  </article>
                );
              })}
            </div>
          )}

          {/* Tombol kirim */}
          <div className="sticky bottom-4 mt-6 z-20">
            <button
              onClick={handleSubmit}
              disabled={saving || filled === 0}
              className="w-full rounded-2xl px-5 py-4 font-bold bg-cyan-300 text-[#071426] flex justify-center items-center gap-3 shadow-[0_0_35px_rgba(45,226,230,0.28)] hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {saving
                ? "Menyimpan absensi…"
                : alreadySaved
                  ? `Perbarui Absensi (${filled}/${total})`
                  : `Kirim Absensi (${filled}/${total})`}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmPartial}
        onClose={() => setConfirmPartial(false)}
        onConfirm={doSave}
        title="Absensi belum lengkap"
        confirmLabel="Simpan sebagian"
        body={
          <>
            Baru <strong className="text-cyan-300">{filled} dari {total}</strong> siswa yang memiliki status.{" "}
            <strong className="text-pink-300">{total - filled} siswa</strong> sisanya tidak akan tercatat untuk tanggal ini. Lanjutkan menyimpan?
          </>
        }
      />

      {total === 0 && (
        <div className="glass rounded-2xl p-10 text-center mt-6">
          <ClipboardCheck className="w-9 h-9 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold m-0">Belum ada siswa terdaftar.</p>
          <p className="text-sm text-slate-400 mt-1 m-0">Tambahkan atau impor data siswa melalui halaman Data Siswa.</p>
        </div>
      )}
    </section>
  );
}


