import { useMemo, useRef, useState } from "react";
import {
  Download,
  FileDown,
  FileUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useStore } from "../store";
import { ConfirmDialog, Modal, PageHead } from "../components/ui";
import {
  downloadFile,
  monthLabelID,
  monthOf,
  parseStudentCSV,
  STUDENT_CSV_TEMPLATE,
  todayISO,
  toCSV,
  type ParsedRow,
} from "../lib/core";

interface StudentModalState {
  open: boolean;
  id: string | null;
  nis: string;
  name: string;
  error: string | null;
}

export default function Students() {
  const {
    students,
    records,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    toast,
  } = useStore();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<StudentModalState>({ open: false, id: null, nis: "", name: "", error: null });
  const [delTarget, setDelTarget] = useState<{ id: string; name: string; count: number } | null>(null);
  const [impOpen, setImpOpen] = useState(false);

  const month = monthOf(todayISO());

  const monthPct = useMemo(() => {
    const map = new Map<string, { hadir: number; total: number }>();
    records.forEach((r) => {
      if (r.month !== month) return;
      const e = map.get(r.studentId) || { hadir: 0, total: 0 };
      e.total++;
      if (r.status === "Hadir") e.hadir++;
      map.set(r.studentId, e);
    });
    return map;
  }, [records, month]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => !q || s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
  }, [students, query]);

  /* ---------- tambah / edit ---------- */

  const openAdd = () => setModal({ open: true, id: null, nis: "", name: "", error: null });
  const openEdit = (id: string) => {
    const s = students.find((x) => x.id === id);
    if (s) setModal({ open: true, id, nis: s.nis, name: s.name, error: null });
  };

  const submitModal = () => {
    const payload = { nis: modal.nis, name: modal.name };
    const err = modal.id ? updateStudent(modal.id, payload) : addStudent(payload);
    if (err) {
      setModal((m) => ({ ...m, error: err }));
      return;
    }
    toast(modal.id ? "Data siswa berhasil diperbarui." : `"${modal.name.trim().toUpperCase()}" ditambahkan ke kelas.`);
    setModal((m) => ({ ...m, open: false }));
  };

  const confirmDelete = () => {
    if (!delTarget) return;
    const removed = deleteStudent(delTarget.id);
    toast(`"${delTarget.name}" dihapus${removed ? ` beserta ${removed} catatan absensinya` : ""}.`, "info");
    setDelTarget(null);
  };

  /* ---------- ekspor & template ---------- */

  const exportCSV = () => {
    const csv = toCSV([
      ["nis", "nama"],
      ...students.map((s) => [s.nis, s.name]),
    ]);
    downloadFile(`data-siswa-8c-${todayISO()}.csv`, csv);
    toast("Data siswa berhasil diekspor ke CSV.");
  };

  return (
    <section className="anim-rise">
      <PageHead
        kicker="Manajemen Data"
        title="Data Siswa"
        accent="text-lime-300"
        desc={`${students.length} siswa terdaftar di kelas 8C. Tambah, ubah, hapus, atau impor massal lewat CSV.`}
      >
        <button
          onClick={() => downloadFile("template-import-siswa.csv", STUDENT_CSV_TEMPLATE)}
          className="glass-soft rounded-xl px-4 py-2.5 font-semibold text-sm flex gap-2 items-center hover:border-cyan-300/50 hover:text-cyan-300 transition"
        >
          <FileDown className="w-4 h-4" /> Template
        </button>
        <button
          onClick={() => setImpOpen(true)}
          className="glass-soft rounded-xl px-4 py-2.5 font-semibold text-sm flex gap-2 items-center hover:border-orange-neon/60 hover:text-orange-300 transition"
        >
          <Upload className="w-4 h-4" /> Impor CSV
        </button>
        <button
          onClick={exportCSV}
          className="glass-soft rounded-xl px-4 py-2.5 font-semibold text-sm flex gap-2 items-center hover:border-lime-300/50 hover:text-lime-300 transition"
        >
          <Download className="w-4 h-4" /> Ekspor
        </button>
        <button
          onClick={openAdd}
          className="bg-lime-300 text-[#152400] rounded-xl px-4 py-2.5 font-bold text-sm flex gap-2 items-center hover:brightness-110 active:scale-[0.98] transition"
        >
          <Plus className="w-4 h-4" /> Tambah Siswa
        </button>
      </PageHead>

      {/* Pencarian */}
      <div className="relative max-w-sm mb-4">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau NIS…"
          className="input-dark rounded-xl pl-9 pr-3 py-2.5 text-sm w-full"
        />
      </div>

      {/* Tabel siswa */}
      <div className="glass rounded-2xl p-2 table-wrap overflow-auto">
        <table className="w-full min-w-[640px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-cyan-100/10 text-left">
              <th className="th-mono p-4 w-14">No</th>
              <th className="th-mono p-4 w-28">NIS</th>
              <th className="th-mono p-4">Nama Siswa</th>
              <th className="th-mono p-4 text-right w-44">Hadir {monthLabelID(month).split(" ")[0]}</th>
              <th className="th-mono p-4 text-right w-28">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ s, i }) => {
              const st = monthPct.get(s.id);
              const pct = st && st.total ? Math.round((st.hadir / st.total) * 100) : null;
              return (
                <tr key={s.id} className="border-b border-cyan-100/5 hover:bg-cyan-300/5 transition group">
                  <td className="p-4 font-mono text-slate-500 text-xs">{String(i + 1).padStart(2, "0")}</td>
                  <td className="p-4 font-mono text-cyan-300 text-xs">{s.nis}</td>
                  <td className="p-4 font-semibold">{s.name}</td>
                  <td className="p-4">
                    {pct === null ? (
                      <span className="text-slate-600 text-xs font-mono block text-right">belum ada</span>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-20 h-1.5 rounded-full bg-cyan-100/8 overflow-hidden">
                          <div className="h-full bg-lime-300 bar-grow rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-xs text-lime-300 w-14 text-right">
                          {st!.hadir}/{st!.total} · {pct}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5 justify-end opacity-60 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(s.id)}
                        className="w-8 h-8 rounded-lg grid place-items-center border border-cyan-100/15 text-slate-300 hover:text-cyan-300 hover:border-cyan-300/60 transition"
                        aria-label={`Ubah ${s.name}`}
                        title="Ubah"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDelTarget({
                            id: s.id,
                            name: s.name,
                            count: records.filter((r) => r.studentId === s.id).length,
                          })
                        }
                        className="w-8 h-8 rounded-lg grid place-items-center border border-cyan-100/15 text-slate-300 hover:text-pink-300 hover:border-pink-300/60 transition"
                        aria-label={`Hapus ${s.name}`}
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-500">
                  {students.length === 0 ? "Belum ada siswa. Tambahkan atau impor data terlebih dahulu." : `Tidak ada hasil untuk "${query}".`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Modal tambah / edit ---------- */}
      <Modal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        title={modal.id ? "Ubah Data Siswa" : "Tambah Siswa Baru"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">NIS / Nomor Induk</label>
            <input
              value={modal.nis}
              onChange={(e) => setModal((m) => ({ ...m, nis: e.target.value, error: null }))}
              placeholder="cth: 8C39"
              className="input-dark rounded-xl px-3 py-2.5 text-sm w-full font-mono"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Nama Lengkap</label>
            <input
              value={modal.name}
              onChange={(e) => setModal((m) => ({ ...m, name: e.target.value, error: null }))}
              onKeyDown={(e) => e.key === "Enter" && submitModal()}
              placeholder="cth: NAMA SISWA BARU"
              className="input-dark rounded-xl px-3 py-2.5 text-sm w-full uppercase"
            />
          </div>
          {modal.error && (
            <p className="text-xs text-pink-300 bg-pink-300/10 border border-pink-300/30 rounded-lg px-3 py-2 m-0 anim-pop">
              {modal.error}
            </p>
          )}
          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={() => setModal((m) => ({ ...m, open: false }))}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-cyan-100/15 hover:bg-cyan-100/5 transition"
            >
              Batal
            </button>
            <button
              onClick={submitModal}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-lime-300 text-[#152400] hover:brightness-110 active:scale-[0.98] transition"
            >
              {modal.id ? "Simpan Perubahan" : "Tambahkan"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ---------- Konfirmasi hapus ---------- */}
      <ConfirmDialog
        open={delTarget !== null}
        onClose={() => setDelTarget(null)}
        onConfirm={confirmDelete}
        danger
        title="Hapus Siswa"
        confirmLabel="Ya, hapus"
        body={
          delTarget && (
            <>
              Siswa <strong className="text-pink-300">{delTarget.name}</strong> akan dihapus dari kelas.
              {delTarget.count > 0 && (
                <>
                  {" "}
                  <strong className="text-pink-300">{delTarget.count} catatan absensi</strong> miliknya juga akan ikut terhapus permanen.
                </>
              )}{" "}
              Tindakan ini tidak dapat dibatalkan.
            </>
          )
        }
      />

      {/* ---------- Modal impor ---------- */}
      <ImportModal
        open={impOpen}
        onClose={() => setImpOpen(false)}
        onImport={(rows, mode) => {
          const res = importStudents(rows, mode);
          if (mode === "replace") {
            toast(`Data siswa diganti: ${res.added} siswa dimuat, data absensi lama dibersihkan.`);
          } else {
            toast(`Impor selesai: ${res.added} siswa baru ditambahkan, ${res.updated} diperbarui.`);
          }
          setImpOpen(false);
        }}
        existingCount={students.length}
      />

      {students.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center mt-4">
          <Users className="w-9 h-9 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold m-0">Kelas masih kosong.</p>
          <p className="text-sm text-slate-400 mt-1 m-0">Gunakan tombol Tambah Siswa atau Impor CSV di atas.</p>
        </div>
      )}
    </section>
  );
}

/* ==================== Modal Impor CSV ==================== */

function ImportModal({
  open,
  onClose,
  onImport,
  existingCount,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (rows: ParsedRow[], mode: "merge" | "replace") => void;
  existingCount: number;
}) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<{ line: number; text: string; reason: string }[]>([]);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows([]);
    setErrors([]);
    setFileName("");
    setMode("merge");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleText = (text: string, name: string) => {
    const res = parseStudentCSV(text);
    /* Beri NIS otomatis untuk baris tanpa NIS */
    let auto = 0;
    const withNis = res.rows.map((r) =>
      r.nis ? r : { ...r, nis: `IMP-${String(++auto).padStart(3, "0")}` }
    );
    setRows(withNis);
    setErrors(res.errors);
    setFileName(name);
  };

  const handleFile = async (f: File | undefined | null) => {
    if (!f) return;
    if (!/\.(csv|txt)$/i.test(f.name)) {
      setErrors([{ line: 0, text: f.name, reason: "Format berkas harus .csv atau .txt" }]);
      setRows([]);
      setFileName(f.name);
      return;
    }
    handleText(await f.text(), f.name);
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Impor Data Siswa (CSV)" wide>
      <div className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
            dragOver ? "border-cyan-300 bg-cyan-300/8" : "border-cyan-100/20 hover:border-cyan-300/50"
          }`}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <FileUp className={`w-8 h-8 mx-auto mb-2 ${dragOver ? "text-cyan-300" : "text-slate-500"}`} />
          <p className="m-0 text-sm font-semibold">
            {fileName ? fileName : "Seret berkas CSV ke sini, atau klik untuk memilih"}
          </p>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Format: <span className="font-mono text-cyan-300">nis,nama</span> (pemisah koma atau titik koma) · unduh template jika perlu
          </p>
        </div>

        {/* Pratinjau */}
        {rows.length > 0 && (
          <div className="anim-pop">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm m-0 font-semibold">
                <span className="text-lime-300 font-mono">{rows.length}</span> baris siap diimpor
              </p>
              {errors.length > 0 && (
                <p className="text-xs text-pink-300 m-0">{errors.length} baris dilewati</p>
              )}
            </div>
            <div className="max-h-44 overflow-auto table-wrap rounded-xl border border-cyan-100/10">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#0b1e35]">
                  <tr className="text-left">
                    <th className="th-mono p-2.5 w-10">#</th>
                    <th className="th-mono p-2.5 w-24">NIS</th>
                    <th className="th-mono p-2.5">Nama</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 60).map((r, i) => (
                    <tr key={i} className="border-t border-cyan-100/5">
                      <td className="p-2.5 font-mono text-slate-500">{i + 1}</td>
                      <td className="p-2.5 font-mono text-cyan-300">{r.nis}</td>
                      <td className="p-2.5">{r.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 60 && (
                <p className="text-center text-[11px] text-slate-500 p-2 m-0">…dan {rows.length - 60} baris lainnya</p>
              )}
            </div>
            {errors.length > 0 && (
              <div className="mt-2 text-[11px] text-pink-300/90 space-y-0.5">
                {errors.slice(0, 3).map((e, i) => (
                  <p key={i} className="m-0">
                    Baris {e.line}: {e.reason} — "{e.text.slice(0, 40)}"
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode impor */}
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              {
                v: "merge",
                title: "Gabungkan",
                desc: `NIS yang sudah ada diperbarui namanya, sisanya ditambahkan. Data absensi tetap aman. (${existingCount} siswa saat ini)`,
              },
              {
                v: "replace",
                title: "Ganti Semua",
                desc: "Seluruh daftar siswa diganti dengan isi berkas. SEMUA data absensi lama akan dihapus!",
              },
            ] as const
          ).map((o) => (
            <label
              key={o.v}
              className={`rounded-xl border p-3.5 cursor-pointer transition ${
                mode === o.v ? "border-cyan-300 bg-cyan-300/8" : "border-cyan-100/15 hover:border-cyan-300/40"
              }`}
            >
              <input
                type="radio"
                name="import-mode"
                className="sr-only"
                checked={mode === o.v}
                onChange={() => setMode(o.v)}
              />
              <p className={`m-0 text-sm font-bold flex items-center gap-2 ${o.v === "replace" && mode === o.v ? "text-pink-300" : mode === o.v ? "text-cyan-300" : ""}`}>
                <span className={`w-3 h-3 rounded-full border-2 ${mode === o.v ? (o.v === "replace" ? "border-pink-300 bg-pink-300" : "border-cyan-300 bg-cyan-300") : "border-slate-500"}`} />
                {o.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 m-0 leading-relaxed">{o.desc}</p>
            </label>
          ))}
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={close}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-cyan-100/15 hover:bg-cyan-100/5 transition"
          >
            Batal
          </button>
          <button
            disabled={rows.length === 0}
            onClick={() => onImport(rows, mode)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-300 text-[#071426] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Impor {rows.length > 0 ? `${rows.length} Siswa` : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}
