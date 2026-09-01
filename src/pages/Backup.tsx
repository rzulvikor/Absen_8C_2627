import { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Database,
  Download,
  FileJson,
  FileUp,
  Link2,
  Loader2,
  ShieldCheck,
  TableProperties,
  Upload,
} from "lucide-react";
import { useStore } from "../store";
import { ConfirmDialog, PageHead } from "../components/ui";
import { downloadFile, formatDateID, GS_CODE, todayISO } from "../lib/core";

export default function Backup() {
  const {
    students,
    records,
    settings,
    setSettings,
    restoreFromRemote,
    exportJSON,
    importJSON,
    toast,
  } = useStore();
  const [url, setUrl] = useState(settings.sheetUrl);
  const [busy, setBusy] = useState<"backup" | "restore" | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const jsonRef = useRef<HTMLInputElement>(null);

  const monthsCovered = useMemo(() => new Set(records.map((r) => r.month)).size, [records]);

  const saveUrl = () => {
    const clean = url.trim();
    if (clean && !/^https:\/\/script\.google(usercontent)?\.com\//.test(clean)) {
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
    try {
      const res = await fetch(target);
      const data = (await res.json()) as Parameters<typeof restoreFromRemote>[0];
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const r = restoreFromRemote(data);
      setConfirmRestore(false);
      toast(
        `Pulihkan selesai: ${r.imported} catatan dipulihkan, ${r.newStudents} siswa baru, ${r.skipped} dilewati.`
      );
    } catch (err) {
      setConfirmRestore(false);
      toast(
        `Gagal memulihkan data: ${err instanceof Error ? err.message : "periksa URL & deployment"}.`,
        "error"
      );
    } finally {
      setBusy(null);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(GS_CODE);
      setCopied(true);
      toast("Kode Apps Script disalin ke papan klip.");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast("Gagal menyalin otomatis — blok kode lalu salin manual.", "error");
    }
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
    { t: "Salin URL /exec", d: "Tempel URL Web App ke kolom di bawah, klik Simpan, lalu Kirim Backup." },
  ];

  return (
    <section className="anim-rise">
      <PageHead
        kicker="Sinkronisasi"
        title="Backup ke Google Sheets"
        accent="text-orange-300"
        desc="Amankan data absensi ke Google Spreadsheet lewat Apps Script, atau pulihkan kembali kapan saja."
      >
        <div className="glass-soft self-start px-4 py-3 rounded-2xl flex gap-3 items-center">
          <ShieldCheck className="w-5 h-5 text-lime-300" />
          <span className="font-mono text-[11px] text-slate-300">
            {settings.lastBackup
              ? `BACKUP TERAKHIR · ${formatDateID(todayISO()).split(",")[0]}, ${new Date(settings.lastBackup).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
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
              <strong className="text-orange-300">Pulihkan</strong> menarik data dari Sheets dan menggabungkannya ke aplikasi (cocok saat pindah perangkat).
            </p>
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

        {/* ===== Kode GS ===== */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-100/10 bg-[#0a1b31]/60">
              <div className="flex items-center gap-2.5">
                <span className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-300/80" />
                </span>
                <p className="font-mono text-xs text-slate-400 m-0 ml-1">Code.gs · Apps Script</p>
              </div>
              <button
                onClick={copyCode}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                  copied
                    ? "bg-lime-300/15 text-lime-300 border border-lime-300/40"
                    : "bg-cyan-300 text-[#071426] hover:brightness-110 active:scale-[0.97]"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Tersalin!" : "Salin Kode"}
              </button>
            </div>
            <pre className="p-5 m-0 overflow-auto table-wrap flex-1 max-h-[640px]">
              <code className="gs-block whitespace-pre">{GS_CODE}</code>
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
            <strong className="text-cyan-300">menggabungkannya</strong> dengan data saat ini — catatan dengan siswa + tanggal yang sama akan ditimpa, sisanya ditambahkan. Lanjutkan?
          </>
        }
      />
    </section>
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


