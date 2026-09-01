/* ================= Tipe Data ================= */

export type Status = "Hadir" | "Sakit" | "Izin" | "Tanpa Keterangan";

export interface Student {
  id: string;
  nis: string;
  name: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  status: Status;
  note: string;
  time: string; // ISO timestamp
}

export interface Settings {
  sheetUrl: string;
  lastBackup: string | null;
}

export interface Selection {
  status: Status;
  note: string;
}

/* ================= Meta Status ================= */

export const STATUSES: Status[] = ["Hadir", "Sakit", "Izin", "Tanpa Keterangan"];

export const STATUS_META: Record<
  Status,
  {
    code: string;
    label: string;
    text: string;
    dot: string;
    chipBg: string;
    print: string;
    bar: string;
  }
> = {
  Hadir: {
    code: "H",
    label: "Hadir",
    text: "text-lime-300",
    dot: "bg-lime-300",
    chipBg: "bg-lime-300/10 border-lime-300/30",
    print: "#3d7300",
    bar: "bg-lime-300",
  },
  Sakit: {
    code: "S",
    label: "Sakit",
    text: "text-amber-300",
    dot: "bg-amber-300",
    chipBg: "bg-amber-300/10 border-amber-300/30",
    print: "#9a5b00",
    bar: "bg-amber-300",
  },
  Izin: {
    code: "I",
    label: "Izin",
    text: "text-sky-300",
    dot: "bg-sky-300",
    chipBg: "bg-sky-300/10 border-sky-300/30",
    print: "#0f55b4",
    bar: "bg-sky-300",
  },
  "Tanpa Keterangan": {
    code: "T",
    label: "Alpa",
    text: "text-pink-300",
    dot: "bg-pink-300",
    chipBg: "bg-pink-300/10 border-pink-300/30",
    print: "#b31260",
    bar: "bg-pink-300",
  },
};

/* ================= Roster Awal Kelas 8C ================= */

const ROSTER_8C = [
  "ALZHIO GHAFARI FEBRIAN",
  "ARTETA KHEDIRA OZIL",
  "ARYA PERMANA RAMADHAN",
  "AUDREY AYUNDRIA JULIANA",
  "AZKIA ZEANITA",
  "AZZAHRA SALSABILLA PUTRIZANI",
  "BASTIAN IZZY KUNZURO",
  "CAHAYA MALIKA PUTRI PRASETYO",
  "DEVINA MAHARANI",
  "DIVA SYADIYAH",
  "ERVINA NUR SYAHRANI",
  "FADHLAN SURYA PRAMUDITYA",
  "FAZILA NISSYAHADI",
  "FRICIL OLIVIA PUTRI DARMAWAN",
  "FULLA RAMADHANTI",
  "HAIKAL AKBAR",
  "HASNA NAMIRA NURJANAH",
  "JANEETA KIRANA PUTRI HAMDANI",
  "KAIRA SYAHLA ALFARIZI",
  "KEYLA KIRANI",
  "KHANSAA NUR OKTAVIANI",
  "LATHIIFAH AZ-ZAHRA",
  "LULA ADYA FAHREZI",
  "MEISYA FIDELLA KUSUMAH PUTRI",
  "MOCHAMMAD LUTFI ZULRIZAL MA'RUF",
  "MUHAMAD RAFA ZULFADHLI",
  "MUHAMAD TIRTA",
  "MUHAMMAD DZAKI",
  "MUHAMMAD FAAIQ AMMAR SYADDAAD",
  "MUHAMMAD FATTAH FAIZULLAH",
  "MUHAMMAD ZAIDANSYAH",
  "NAFISHA ALMAHYRA HUSNA",
  "QUEEN JASMINE NUR REIKA",
  "RAISA HERYANTI",
  "RENO WIJAYA",
  "SULTHAN THUFAEL",
  "SYAFIAH KHANSA KHOIRUN NISSA",
  "YOESUP YAZID",
];

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const seedStudents = (): Student[] =>
  ROSTER_8C.map((name, i) => ({
    id: uid(),
    nis: `8C${String(i + 1).padStart(2, "0")}`,
    name,
  }));

/* ================= Util Tanggal ================= */

export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayISO = (): string => toISO(new Date());

export const monthOf = (dateISO: string): string => dateISO.slice(0, 7);

export const addDays = (dateISO: string, delta: number): string => {
  const d = new Date(`${dateISO}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toISO(d);
};

export const daysInMonth = (year: number, month0: number): number =>
  new Date(year, month0 + 1, 0).getDate();

/** Hari pertama bulan, Senin = 0 */
export const firstDayMonday = (year: number, month0: number): number =>
  (new Date(year, month0, 1).getDay() + 6) % 7;

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const DAYS_SHORT_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const parseISO = (dateISO: string): Date => new Date(`${dateISO}T00:00:00`);

export const formatDateID = (dateISO: string): string => {
  const d = parseISO(dateISO);
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateShort = (dateISO: string): string => {
  const d = parseISO(dateISO);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

export const monthLabelID = (month: string): string => {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS_ID[(m || 1) - 1]} ${y || ""}`.trim();
};

export const weekdayShort = (dateISO: string): string =>
  DAYS_SHORT_ID[parseISO(dateISO).getDay()];

export const isWeekend = (dateISO: string): boolean => {
  const g = parseISO(dateISO).getDay();
  return g === 0 || g === 6;
};

/* ================= Util CSV ================= */

const stripBOM = (t: string) => t.replace(/^\ufeff/, "");

function splitCSVLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === delim) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export interface ParsedRow {
  nis: string;
  name: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: { line: number; text: string; reason: string }[];
}

export function parseStudentCSV(text: string): ParseResult {
  const rows: ParsedRow[] = [];
  const errors: ParseResult["errors"] = [];
  const lines = stripBOM(text).split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return { rows, errors };

  const delim = (lines[0].match(/;/g)?.length || 0) >= (lines[0].match(/,/g)?.length || 0) ? ";" : ",";

  lines.forEach((line, idx) => {
    const cols = splitCSVLine(line, delim);
    const lower = line.toLowerCase();
    // lewati baris header
    if (idx === 0 && (lower.includes("nis") || lower.includes("nama"))) return;
    if (cols.length >= 2) {
      const [nis, name] = [cols[0], cols[1]];
      if (!name) {
        errors.push({ line: idx + 1, text: line, reason: "Kolom nama kosong" });
        return;
      }
      rows.push({ nis, name: name.toUpperCase() });
    } else if (cols.length === 1 && cols[0]) {
      rows.push({ nis: "", name: cols[0].toUpperCase() });
    } else {
      errors.push({ line: idx + 1, text: line, reason: "Format baris tidak dikenali" });
    }
  });
  return { rows, errors };
}

export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["\ufeff" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const STUDENT_CSV_TEMPLATE = `nis,nama
8C39,CONTOH SISWA BARU SATU
8C40,CONTOH SISWA BARU DUA
8C41,CONTOH SISWA BARU TIGA`;

export const toCSV = (rows: (string | number)[][]): string =>
  rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");

/* ================= Util Cetak ================= */

export function printReport(opts: {
  title: string;
  subtitle: string;
  orientation: "portrait" | "landscape";
  tableHTML: string;
}) {
  const win = window.open("", "_blank");
  if (!win) return false;
  const doc = `<!doctype html>
<html><head><meta charset="UTF-8"><title>${opts.title}</title>
<style>
@page{size:A4 ${opts.orientation};margin:11mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;color:#13283d;padding:8px;line-height:1.35}
h1{font-size:17px;letter-spacing:.02em}
p.sub{color:#5a6b7d;font-size:12px;margin:3px 0 14px}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #b8c9d6;padding:5px 6px;font-size:10px;text-align:center}
th{background:#071426;color:#7ee8ff;letter-spacing:.05em;text-transform:uppercase;font-size:9px}
td.left{text-align:left}
tr:nth-child(even) td{background:#f2f8fb}
tfoot td{font-weight:700;background:#e8f6fa}
</style></head>
<body><h1>${opts.title}</h1><p class="sub">${opts.subtitle}</p>${opts.tableHTML}
<script>window.addEventListener('load',function(){setTimeout(function(){window.print()},500)});<\/script>
</body></html>`;
  try {
    win.document.open();
    win.document.write(doc);
    win.document.close();
    return true;
  } catch {
    return false;
  }
}

/* ================= Kode Google Apps Script ================= */

export const GS_CODE = `/**
 * ============================================================
 *  PRESENSIA 8C — Skrip Backup & Restore (Google Apps Script)
 * ============================================================
 *  CARA PEMASANGAN (± 3 menit):
 *  1. Buka https://sheets.new  →  beri nama "Backup Absensi 8C"
 *  2. Menu: Ekstensi → Apps Script
 *  3. Hapus seluruh isi Code.gs, lalu tempel kode ini
 *  4. Klik "Deploy" → "New deployment" → jenis: "Web app"
 *       • Execute as : Me
 *       • Who has access : Anyone
 *  5. Klik "Deploy", izinkan akses akun Google Anda
 *  6. Salin URL Web App (berakhiran /exec)
 *  7. Tempel URL tersebut di aplikasi Presensia → halaman
 *     "Backup & Sync", lalu klik "Kirim Backup"
 * ============================================================
 */

function getSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doGet() {
  var out = { app: 'Presensia8C', students: [], records: [] };
  var ss = getSheet_();

  var sSiswa = ss.getSheetByName('SISWA');
  if (sSiswa && sSiswa.getLastRow() > 1) {
    sSiswa.getRange(2, 1, sSiswa.getLastRow() - 1, 2).getValues().forEach(function (r) {
      if (r[0] !== '') out.students.push({ nis: String(r[0]), name: String(r[1]) });
    });
  }

  var sAbsen = ss.getSheetByName('ABSENSI');
  if (sAbsen && sAbsen.getLastRow() > 1) {
    sAbsen.getRange(2, 1, sAbsen.getLastRow() - 1, 6).getValues().forEach(function (r) {
      if (r[0] === '') return;
      out.records.push({
        nis: String(r[0]),
        name: String(r[1]),
        date: String(r[2]),
        status: String(r[3]),
        note: String(r[4] || ''),
        time: String(r[5] || '')
      });
    });
  }

  return json_(out);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = getSheet_();

    if (data.students) {
      writeSheet_(ss, 'SISWA',
        ['NIS', 'NAMA SISWA'],
        data.students.map(function (s) { return [s.nis, s.name]; }),
        [110, 320]);
    }

    if (data.records) {
      writeSheet_(ss, 'ABSENSI',
        ['NIS', 'NAMA SISWA', 'TANGGAL', 'STATUS', 'CATATAN', 'WAKTU SIMPAN'],
        data.records.map(function (r) {
          return [r.nis, r.name, r.date, r.status, r.note, r.time];
        }),
        [110, 300, 100, 140, 220, 160]);
    }

    stampBackup_(ss, (data.records || []).length);
    return json_({
      ok: true,
      students: (data.students || []).length,
      records: (data.records || []).length,
      at: new Date().toISOString()
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function writeSheet_(ss, name, header, rows, widths) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length)
    .setValues([header])
    .setFontWeight('bold')
    .setBackground('#071426')
    .setFontColor('#2de2e6');
  sheet.setFrozenRows(1);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  }
  for (var i = 0; i < widths.length; i++) sheet.setColumnWidth(i + 1, widths[i]);
}

function stampBackup_(ss, total) {
  var sheet = ss.getSheetByName('INFO BACKUP') || ss.insertSheet('INFO BACKUP', 0);
  sheet.clearContents();
  sheet.getRange('A1:B4').setValues([
    ['APLIKASI', 'Presensia 8C — SMP Negeri 61'],
    ['BACKUP TERAKHIR', new Date()],
    ['JUMLAH DATA ABSENSI', total],
    ['SUMBER', 'Aplikasi web Presensia (localStorage)']
  ]);
  sheet.getRange('A1:A4').setFontWeight('bold').setBackground('#0e233d').setFontColor('#7ee8ff');
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 340);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`;

/* Simpan data lokal */
export const STORAGE_KEY = "presensia8c:v1";
