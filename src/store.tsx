import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type AttendanceRecord,
  type Selection,
  // (Selection dipakai dalam antarmuka StoreValue)
  type Settings,
  type Status,
  type Student,
  monthOf,
  seedStudents,
  STORAGE_KEY,
  uid,
} from "./lib/core";

export type { Selection };

export interface Toast {
  id: number;
  msg: string;
  type: "success" | "error" | "info";
}

interface Persisted {
  students: Student[];
  records: AttendanceRecord[];
  settings: Settings;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (Array.isArray(p.students) && Array.isArray(p.records)) {
        return {
          students: p.students,
          records: p.records,
          settings: p.settings || { sheetUrl: "", lastBackup: null },
        };
      }
    }
  } catch {
    /* abaikan data korup */
  }
  return {
    students: seedStudents(),
    records: [],
    settings: { sheetUrl: "", lastBackup: null },
  };
}

interface StoreValue {
  students: Student[];
  records: AttendanceRecord[];
  settings: Settings;
  toasts: Toast[];
  toast: (msg: string, type?: Toast["type"]) => void;
  dismissToast: (id: number) => void;

  recordFor: (studentId: string, date: string) => AttendanceRecord | undefined;
  recordsOn: (date: string) => AttendanceRecord[];
  hasRecordsOn: (date: string) => boolean;
  saveAttendance: (
    date: string,
    selections: Record<string, Selection>
  ) => { saved: number; updated: number; hadir: number };

  addStudent: (s: { nis: string; name: string }) => string | null;
  updateStudent: (id: string, s: { nis: string; name: string }) => string | null;
  deleteStudent: (id: string) => number;
  importStudents: (
    rows: { nis: string; name: string }[],
    mode: "merge" | "replace"
  ) => { added: number; updated: number; removed: number };

  setSettings: (p: Partial<Settings>) => void;
  restoreFromRemote: (data: {
    students?: { nis: string; name: string }[];
    records?: { nis: string; name: string; date: string; status: string; note?: string; time?: string }[];
  }) => { imported: number; skipped: number; newStudents: number };

  exportJSON: () => string;
  importJSON: (text: string) => string | null;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadPersisted, []);
  const [students, setStudents] = useState<Student[]>(initial.students);
  const [records, setRecords] = useState<AttendanceRecord[]>(initial.records);
  const [settings, setSettingsState] = useState<Settings>(initial.settings);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ students, records, settings } satisfies Persisted)
      );
    } catch {
      /* penyimpanan penuh — biarkan */
    }
  }, [students, records, settings]);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, type: Toast["type"] = "success") => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-3), { id, msg, type }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  /* ---------- absensi ---------- */

  const recordFor = useCallback(
    (studentId: string, date: string) =>
      records.find((r) => r.studentId === studentId && r.date === date),
    [records]
  );

  const recordsOn = useCallback(
    (date: string) => records.filter((r) => r.date === date),
    [records]
  );

  const hasRecordsOn = useCallback(
    (date: string) => records.some((r) => r.date === date),
    [records]
  );

  const saveAttendance = useCallback(
    (date: string, selections: Record<string, Selection>) => {
      const month = monthOf(date);
      const stamp = new Date().toISOString();
      let saved = 0;
      let updated = 0;
      let hadir = 0;
      const byStudent = new Map<string, AttendanceRecord>(
        records.map((r) => [`${r.studentId}|${r.date}`, r])
      );
      const next = [...records];

      Object.entries(selections).forEach(([studentId, sel]) => {
        if (sel.status === "Hadir") hadir++;
        const key = `${studentId}|${date}`;
        const existing = byStudent.get(key);
        const student = students.find((s) => s.id === studentId);
        if (existing) {
          updated++;
          const idx = next.findIndex((r) => r.id === existing.id);
          next[idx] = { ...existing, status: sel.status, note: sel.note, time: stamp, month };
        } else {
          saved++;
          next.push({
            id: uid(),
            studentId,
            studentName: student?.name ?? "—",
            date,
            month,
            status: sel.status,
            note: sel.note,
            time: stamp,
          });
        }
      });

      setRecords(next);
      return { saved, updated, hadir };
    },
    [records, students]
  );

  /* ---------- CRUD siswa ---------- */

  const validate = useCallback(
    (s: { nis: string; name: string }, ignoreId?: string) => {
      const nis = s.nis.trim();
      const name = s.name.trim();
      if (!name) return "Nama siswa wajib diisi.";
      if (!nis) return "NIS wajib diisi.";
      const dup = students.some(
        (st) => st.nis.toLowerCase() === nis.toLowerCase() && st.id !== ignoreId
      );
      if (dup) return `NIS "${nis}" sudah dipakai siswa lain.`;
      return null;
    },
    [students]
  );

  const addStudent = useCallback(
    (s: { nis: string; name: string }) => {
      const err = validate(s);
      if (err) return err;
      setStudents((prev) => [...prev, { id: uid(), nis: s.nis.trim(), name: s.name.trim().toUpperCase() }]);
      return null;
    },
    [validate]
  );

  const updateStudent = useCallback(
    (id: string, s: { nis: string; name: string }) => {
      const err = validate(s, id);
      if (err) return err;
      const name = s.name.trim().toUpperCase();
      setStudents((prev) => prev.map((st) => (st.id === id ? { ...st, nis: s.nis.trim(), name } : st)));
      setRecords((prev) => prev.map((r) => (r.studentId === id ? { ...r, studentName: name } : r)));
      return null;
    },
    [validate]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      const removedCount = records.filter((r) => r.studentId === id).length;
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setRecords((prev) => prev.filter((r) => r.studentId !== id));
      return removedCount;
    },
    [records]
  );

  const importStudents = useCallback(
    (rows: { nis: string; name: string }[], mode: "merge" | "replace") => {
      let added = 0;
      let updated = 0;
      let removed = 0;

      if (mode === "replace") {
        removed = students.length;
        const fresh: Student[] = rows.map((r) => ({
          id: uid(),
          nis: r.nis,
          name: r.name.toUpperCase(),
        }));
        setStudents(fresh);
        setRecords([]);
        return { added: fresh.length, updated: 0, removed };
      }

      const existing = new Map(students.map((s) => [s.nis.toLowerCase(), s] as const));
      const next = [...students];
      rows.forEach((r) => {
        const key = r.nis.toLowerCase();
        const found = existing.get(key);
        if (found) {
          updated++;
          const idx = next.findIndex((s) => s.id === found.id);
          next[idx] = { ...found, name: r.name.toUpperCase() };
        } else {
          added++;
          const st = { id: uid(), nis: r.nis, name: r.name.toUpperCase() };
          existing.set(key, st);
          next.push(st);
        }
      });
      setStudents(next);
      return { added, updated, removed };
    },
    [students]
  );

  /* ---------- pengaturan & sinkronisasi ---------- */

  const setSettings = useCallback((p: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...p }));
  }, []);

  const restoreFromRemote = useCallback(
    (data: {
      students?: { nis: string; name: string }[];
      records?: { nis: string; name: string; date: string; status: string; note?: string; time?: string }[];
    }) => {
      let imported = 0;
      let skipped = 0;
      let newStudents = 0;
      const validStatus = new Set(["Hadir", "Sakit", "Izin", "Tanpa Keterangan"]);

      let studentList = [...students];
      const byNis = new Map(studentList.map((s) => [s.nis.toLowerCase(), s] as const));

      (data.students || []).forEach((rs) => {
        if (!rs.nis || !rs.name) return;
        if (!byNis.has(rs.nis.toLowerCase())) {
          newStudents++;
          const st: Student = { id: uid(), nis: rs.nis, name: rs.name.toUpperCase() };
          byNis.set(rs.nis.toLowerCase(), st);
          studentList.push(st);
        }
      });

      const nextRecords = [...records];
      const indexKey = new Map<string, number>(
        nextRecords.map((r, i) => [`${r.studentId}|${r.date}`, i])
      );

      (data.records || []).forEach((rr) => {
        const st = byNis.get(String(rr.nis).toLowerCase());
        if (!st || !rr.date || !validStatus.has(rr.status)) {
          skipped++;
          return;
        }
        imported++;
        const key = `${st.id}|${rr.date}`;
        const entry: AttendanceRecord = {
          id: uid(),
          studentId: st.id,
          studentName: st.name,
          date: rr.date,
          month: monthOf(rr.date),
          status: rr.status as Status,
          note: rr.note || "",
          time: rr.time || new Date().toISOString(),
        };
        const existingIdx = indexKey.get(key);
        if (existingIdx !== undefined) {
          nextRecords[existingIdx] = { ...entry, id: nextRecords[existingIdx].id };
        } else {
          indexKey.set(key, nextRecords.length);
          nextRecords.push(entry);
        }
      });

      setStudents(studentList);
      setRecords(nextRecords);
      return { imported, skipped, newStudents };
    },
    [students, records]
  );

  const exportJSON = useCallback(
    () =>
      JSON.stringify(
        {
          app: "Presensia8C",
          exportedAt: new Date().toISOString(),
          students,
          records,
          settings,
        },
        null,
        2
      ),
    [students, records, settings]
  );

  const importJSON = useCallback(
    (text: string): string | null => {
      try {
        const data = JSON.parse(text) as Partial<Persisted> & { app?: string };
        if (data.app !== "Presensia8C" || !Array.isArray(data.students) || !Array.isArray(data.records)) {
          return "Berkas bukan cadangan Presensia yang valid.";
        }
        setStudents(data.students as Student[]);
        setRecords(data.records as AttendanceRecord[]);
        if (data.settings) setSettingsState(data.settings as Settings);
        return null;
      } catch {
        return "Berkas JSON tidak dapat dibaca.";
      }
    },
    []
  );

  const value: StoreValue = {
    students,
    records,
    settings,
    toasts,
    toast,
    dismissToast,
    recordFor,
    recordsOn,
    hasRecordsOn,
    saveAttendance,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    setSettings,
    restoreFromRemote,
    exportJSON,
    importJSON,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return ctx;
}
