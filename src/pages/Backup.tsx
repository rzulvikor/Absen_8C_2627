import { useMemo, useRef, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  FileCode,
  FileJson,
  FileUp,
  Link2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TableProperties,
  Upload,
  Zap,
} from "lucide-react";
import { useStore } from "../store";
import { ConfirmDialog, PageHead } from "../components/ui";
import { downloadFile, GS_CODE, todayISO } from "../lib/core";
import { HTML_APP_CODE } from "../lib/htmlApp";

type Tab = "gs" | "html";

export default function Backup() {
  const {
    students,
    records,
    settings,
    setSettings,
    pullRemote,
    exportJSON,
    importJSON,
    toast,
  } = useStore();
  const [url, setUrl] = useState(settings.sheetUrl);
  const [busy, setBusy] = useState<"backup" | "restore" | null>(null);
  const [tab, setTab] = useState<Tab>("gs");
  const [copied, setCopied] = useState<"" | Tab>("");
  const [confirmRestore, setConfirmRestore] = useState(false);
  const jsonRef = useRef<HTMLInputElement>(null);

  const monthsCovered = useMemo(() => new Set(records.map((r) => r.month)).size, [records]);

  const validUrl = (v: string) => /^https:\/\/script\.google(usercontent)?\.com\//.test(v);

  const saveUrl = () => {
    const clean = url.trim();
    if (clean && !validUrl(clean)) {
      toast("URL tidak valid. Gunakan URL Web App Apps Script (berakhiran /exec).", "error");
      return;
    }
    setSettings({ sheetUrl: clean });
    toast(clean ? "URL Web App tersimpan." : "URL Web App dihapus.", "info");
  };

  const buildPayload = () => ({
    app: "Presensia8C",
    at: new Date().toISOString(),
    students: students.map((s) => ({ nis: s.nis, name: s.name })),
    records: records.map((r) => {
      const st = students.find((s) => s.id === r.studentId);
      return {
        nis: st?.nis ?? "—",
        name: r.studentName,
        date: r.date,
        status: r.status,
        note: r.note,
        time: r.time,
      };
    }),
  });

  const doBackup = async () => {
    const target = (url.trim() || settings.sheetUrl).trim();
    if (!target) {
      toast("Tempel URL Web App Apps Script terlebih dahulu.", "error");
      return;
    }
    if (records.length === 0) {
      toast("Belum ada data absensi untuk dibackup.", "error");
      return;
    }
    setBusy("backup");
    try {
      const res = await fetch(target, { method: "POST", body: JSON.stringify(buildPayload()) });
      const data = (await res.json()) as { ok?: boolean; error?: string; records?: number };
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSettings({ sheetUrl: target, lastBackup: new Date().toISOString() });
      toast(`Backup terkirim ke Google Sheets — ${data.records ?? records.length} catatan absensi.`);
    } catch (err) {
      toast(
        `Gagal mengirim backup: ${err instanceof Error ? err.message : "periksa URL & akses deployment"}.`,
        "error"
      );
    } finally {
      setBusy(null);
    }
  };

  const doRestore = async () => {
    const target = (url.trim() || settings.sheetUrl).trim();
    if (!target) {
      toast("Tempel URL Web App Apps Script terlebih dahulu.", "error");
      return;
    }
    setBusy("restore");
    const r = await pullRemote(target);
    setBusy(null);
    setConfirmRestore(false);
    if (r.ok) {
      if (target !== settings.sheetUrl) setSettings({ sheetUrl: target });
      toast(`Pulihkan selesai: ${r.imported} catatan dipulihkan, ${r.newStudents} siswa baru, ${r.skipped} dilewati.`);
    } else {
      toast(`Gagal memulihkan data: ${r.error}`, "error");
    }
  };

  const syncNow = async () => {
    const target = (url.trim() || settings.sheetUrl).trim();
    if (!target) {
      toast("Tempel URL Web App Apps Script terlebih dahulu.", "error");
      return;
    }
    setBusy("restore");
    const r = await pullRemote(target);
    setBusy(null);
    if (r.ok) {
      if (r.imported || r.newStudents) {
        toast(`Sinkron selesai: ${r.newStudents} siswa & ${r.imported} catatan diperbarui dari Spreadsheet.`);
      } else {
        toast("Data sudah sinkron — tidak ada pembaruan baru di Spreadsheet.", "info");
      }
    } else {
      toast(`Gagal sinkronisasi: ${r.error}`, "error");
    }
  };

  const toggleAutoSync = () => {
    const next = !settings.autoSync;
    setSettings({ autoSync: next });
    toast(
      next
        ? `Auto-Sync aktif — aplikasi memeriksa Spreadsheet setiap ${settings.syncInterval} detik.`
        : "Auto-Sync dimatikan.",
      "info"
    );
  };

  const copyText = async (kind: Tab) => {
    const text = kind === "gs" ? GS_CODE : HTML_APP_CODE;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      toast(kind === "gs" ? "Kode Apps Script disalin ke papan klip." : "Kode HTML satu berkas disalin ke papan klip.");
      window.setTimeout(() => setCopied(""), 2200);
    } catch {
      toast("Gagal menyalin otomatis — blok kode lalu salin manual.", "error");
    }
  };

  const downloadHtml = () => {
    downloadFile("presensia8c-standalone.html", HTML_APP_CODE, "text/html;charset=utf-8");
    toast("presensia8c-standalone.html diunduh — buka langsung di browser, semua fitur termasuk Auto-Sync sudah di dalamnya.");
  };

  const localExport = () => {
    downloadFile(
      `cadangan-presensia8c-${todayISO()}.json`,
      exportJSON(),
      "application/json;charset=utf-8"
    );
    toast("Cadangan lokal (JSON) berhasil diunduh.");
  };

  const localImport = async (f: File | null | undefined) => {
    if (!f) return;
    const err = importJSON(await f.text());
    if (err) toast(err, "error");
    else toast("Cadangan lokal berhasil dipulihkan.");
    if (jsonRef.current) jsonRef.current.value = "";
  };

  const steps = [
    { t: "Buat Google Spreadsheet", d: "Buka sheets.new, beri nama misalnya “Backup Absensi 8C”." },
    { t: "Buka Apps Script", d: "Menu Ekstensi → Apps Script, hapus isi Code.gs, tempel kode di bawah." },
    { t: "Deploy sebagai Web App", d: "Deploy → New deployment → Web app. Execute as: Me · Who has access: Anyone." },
    { t: "Salin URL /exec", d: "Tempel URL ke kolom di atas, klik Simpan, kirim backup pertama, lalu aktifkan Auto-Sync." },
  ];

  const codeText = tab === "gs" ? GS_CODE : HTML_APP_CODE;

  return (
    <section className="anim-rise">
      <PageHead
        kicker="Sinkronisasi"
        title="Backup & Auto-Sync"
        accent="text-orange-300"
        desc="Amankan data ke Google Spreadsheet lewat Apps Script, lalu aktifkan Auto-Sync — setiap penambahan di Spreadsheet otomatis masuk ke aplikasi ini."
      >
        <div className="glass-soft self-start px-4 py-3 rounded-2xl flex gap-3 items-center">
          <ShieldCheck className="w-5 h-5 text-lime-300" />
          <span className="font-mono text-[11px] text-slate-300">
            {settings.lastBackup
              ? `BACKUP TERAKHIR · ${new Date(settings.lastBackup).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
              : "BELUM PERNAH BACKUP"}
          </span>
        </div>
      </PageHead>

      {/* Ringkasan data */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <DataChip icon={Database} color="text-cyan-300" label="Siswa terdaftar" value={String(students.length)} />
        <DataChip icon={TableProperties} color="text-lime-300" label="Catatan absensi" value={String(records.length)} />
        <DataChip icon={Upload} color="text-orange-300" label="Bulan terdata" value={String(monthsCovered)} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ===== Koneksi & aksi ===== */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold m-0 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-300" /> Koneksi Web App
            </h3>
            <label className="text-xs text-slate-400 block mt-4 mb-1.5">
              URL Web App Apps Script (berakhiran /exec)
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/…/exec"
              className="input-dark rounded-xl px-3 py-2.5 text-xs w-full font-mono"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={saveUrl}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-cyan-300 text-[#071426] hover:brightness-110 active:scale-[0.98] transition"
              >
                Simpan URL
              </button>
              {settings.sheetUrl && (
                <span className="text-[11px] font-mono text-lime-300 self-center flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> tersimpan
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={doBackup}
                disabled={busy !== null}
                className="rounded-xl px-3 py-3.5 font-bold text-sm bg-lime-300 text-[#152400] flex justify-center items-center gap-2 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40"
              >
                {busy === "backup" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Kirim Backup
              </button>
              <button
                onClick={() => setConfirmRestore(true)}
                disabled={busy !== null}
                className="rounded-xl px-3 py-3.5 font-bold text-sm border border-orange-300/40 text-orange-300 flex justify-center items-center gap-2 hover:bg-orange-300/10 active:scale-[0.98] transition disabled:opacity-40"
              >
                {busy === "restore" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Pulihkan
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 m-0 leading-relaxed">
              <strong className="text-orange-300">Kirim Backup</strong> menulis sheet SISWA & ABSENSI (isi lama ditimpa).{" "}
              <strong className="text-orange-300">Pulihkan</strong> menarik data dari Sheets dan menggabungkannya ke aplikasi.
            </p>
          </div>

          {/* ===== Auto-Sync ===== */}
          <div className={`glass rounded-2xl p-5 transition ${settings.autoSync ? "border-lime-300/40 shadow-[0_0_35px_rgba(182,242,61,0.08)]" : ""}`}>
            <h3 className="font-display font-bold m-0 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${settings.autoSync ? "text-lime-300" : "text-slate-500"}`} />
              Auto-Sync dari Spreadsheet
              {settings.autoSync && settings.sheetUrl && (
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] text-lime-300 tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-300 pulse-dot" /> AKTIF
                </span>
              )}
            </h3>

            <div className="flex items-center gap-3 mt-4">
              <button
                role="switch"
                aria-checked={settings.autoSync}
                onClick={toggleAutoSync}
                className={`relative w-12 h-[26px] rounded-full transition-colors shrink-0 ${settings.autoSync ? "bg-lime-300" : "bg-slate-700"}`}
                title={settings.autoSync ? "Matikan Auto-Sync" : "Aktifkan Auto-Sync"}
              >
                <span
                  className={`absolute top-[3px] w-5 h-5 rounded-full transition-all duration-200 ${
                    settings.autoSync ? "left-[25px] bg-[#152400]" : "left-[3px] bg-slate-400"
                  }`}
                />
              </button>
              <label className="text-sm text-slate-300">
                Periksa Spreadsheet otomatis setiap{" "}
                <select
                  value={settings.syncInterval}
                  onChange={(e) => setSettings({ syncInterval: Number(e.target.value) })}
                  className="input-dark rounded-lg px-2 py-1 text-xs font-mono ml-1"
                >
                  <option value={15}>15 dtk</option>
                  <option value={30}>30 dtk</option>
                  <option value={60}>1 mnt</option>
                  <option value={120}>2 mnt</option>
                </select>
              </label>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 m-0 leading-relaxed">
              Saat aktif, aplikasi menarik data terbaru lalu menggabungkannya otomatis — siswa atau absensi yang
              ditambahkan langsung dari Google Sheets akan langsung muncul di sini. Perubahan tersimpan aman: data
              lokal tidak pernah dihapus oleh sinkronisasi.
            </p>

            {settings.autoSync && !settings.sheetUrl && (
              <p className="text-[11px] text-orange-300 bg-orange-300/10 border border-orange-300/30 rounded-lg px-3 py-2 mt-3 m-0 anim-pop">
                Auto-Sync aktif tetapi URL Web App belum diisi — simpan URL di atas agar sinkronisasi berjalan.
              </p>
            )}

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={syncNow}
                disabled={busy !== null}
                className="rounded-xl px-4 py-2.5 font-bold text-sm border border-cyan-100/20 text-slate-200 flex items-center gap-2 hover:bg-cyan-100/5 hover:text-cyan-300 active:scale-[0.98] transition disabled:opacity-40"
              >
                {busy === "restore" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Sinkronkan Sekarang
              </button>
              <span className="font-mono text-[10px] text-slate-500">
                {settings.lastSync
                  ? `terakhir · ${new Date(settings.lastSync).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                  : "belum pernah"}
              </span>
            </div>
          </div>

          {/* Cadangan lokal */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold m-0 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-sky-300" /> Cadangan Lokal (JSON)
            </h3>
            <p className="text-xs text-slate-400 mt-2 m-0 leading-relaxed">
              Tanpa internet pun data tetap aman — unduh berkas JSON sebagai salinan manual.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={localExport}
                className="rounded-xl px-3 py-3 font-bold text-sm border border-sky-300/40 text-sky-300 flex justify-center items-center gap-2 hover:bg-sky-300/10 active:scale-[0.98] transition"
              >
                <Download className="w-4 h-4" /> Unduh
              </button>
              <button
                onClick={() => jsonRef.current?.click()}
                className="rounded-xl px-3 py-3 font-bold text-sm border border-cyan-100/20 text-slate-300 flex justify-center items-center gap-2 hover:bg-cyan-100/5 active:scale-[0.98] transition"
              >
                <FileUp className="w-4 h-4" /> Muat JSON
              </button>
              <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={(e) => localImport(e.target.files?.[0])} />
            </div>
          </div>

          {/* Langkah pemasangan */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display font-bold m-0">Langkah Pemasangan</h3>
            <ol className="mt-4 space-y-3.5">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-cyan-300/12 text-cyan-300 font-mono text-xs font-bold grid place-items-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold m-0">{s.t}</p>
                    <p className="text-xs text-slate-400 m-0 mt-0.5 leading-relaxed">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ===== Kode: Apps Script / HTML ===== */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between gap-2 flex-wrap px-4 py-3 border-b border-cyan-100/10 bg-[#0a1b31]/60">
              <div className="flex items-center gap-1.5">
                <span className="flex gap-1.5 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-300/80" />
                </span>
                <TabBtn active={tab === "gs"} onClick={() => setTab("gs")} icon={<Code2 className="w-3.5 h-3.5" />} label="Code.gs · Apps Script" />
                <TabBtn active={tab === "html"} onClick={() => setTab("html")} icon={<FileCode className="w-3.5 h-3.5" />} label="HTML Satu Berkas" />
              </div>
              <div className="flex gap-2">
                {tab === "html" && (
                  <button
                    onClick={downloadHtml}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold border border-cyan-300/40 text-cyan-300 hover:bg-cyan-300/10 active:scale-[0.97] transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh .html
                  </button>
                )}
                <button
                  onClick={() => copyText(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                    copied === tab
                      ? "bg-lime-300/15 text-lime-300 border border-lime-300/40"
                      : "bg-cyan-300 text-[#071426] hover:brightness-110 active:scale-[0.97]"
                  }`}
                >
                  {copied === tab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === tab ? "Tersalin!" : "Salin Kode"}
                </button>
              </div>
            </div>

            <div className="px-5 py-2.5 border-b border-cyan-100/8 bg-cyan-300/4 text-[11px] text-slate-400 leading-relaxed">
              {tab === "gs" ? (
                <>
                  Tempel ke <span className="font-mono text-cyan-300">Code.gs</span> di Apps Script — menangani
                  pengiriman backup (POST) dan penarikan data untuk Pulihkan & Auto-Sync (GET). ·{" "}
                  <span className="font-mono">{(GS_CODE.length / 1024).toFixed(1)} KB</span>
                </>
              ) : (
                <>
                  Aplikasi absensi lengkap dalam <strong className="text-cyan-300">satu file HTML</strong> — unduh lalu buka
                  langsung di browser, atau sajikan via <span className="font-mono">HtmlService</span>. Sudah termasuk
                  absensi, rekap, data siswa, backup, dan <strong className="text-lime-300">Auto-Sync</strong>. ·{" "}
                  <span className="font-mono">{(HTML_APP_CODE.length / 1024).toFixed(1)} KB</span>
                </>
              )}
            </div>

            <pre key={tab} className="p-5 m-0 overflow-auto table-wrap flex-1 max-h-[640px] anim-rise">
              <code className="gs-block whitespace-pre">{codeText}</code>
            </pre>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRestore}
        onClose={() => setConfirmRestore(false)}
        onConfirm={doRestore}
        busy={busy === "restore"}
        title="Pulihkan dari Google Sheets"
        confirmLabel="Ya, pulihkan"
        body={
          <>
            Aplikasi akan menarik data siswa & absensi dari Google Sheets lalu{" "}
            <strong className="text-cyan-300">menggabungkannya</strong> dengan data saat ini — catatan dengan siswa +
            tanggal yang sama akan ditimpa, sisanya ditambahkan. Lanjutkan?
          </>
        }
      />
    </section>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-[11px] font-mono flex items-center gap-1.5 transition ${
        active
          ? "bg-cyan-300/15 text-cyan-300 border border-cyan-300/40"
          : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-cyan-100/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DataChip({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: typeof Database;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl grid place-items-center bg-cyan-100/6 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-mono text-2xl font-bold m-0 leading-none">{value}</p>
        <p className="text-xs text-slate-400 m-0 mt-1">{label}</p>
      </div>
    </div>
  );
}
