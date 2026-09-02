/* Bagian 2/3 dari aplikasi HTML satu berkas: JavaScript inti (state, dashboard, absensi). */
export const HTML_PART_B = `<script>
'use strict';
/* ================= helper ================= */
function $(id){ return document.getElementById(id); }
function each(list, fn){ Array.prototype.forEach.call(list, fn); }
function pad2(n){ return String(n).padStart(2, '0'); }
function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function uid(){ return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }
function toISO(d){ return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function todayISO(){ return toISO(new Date()); }
function parseISO(s){ var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDaysISO(s, n){ var d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); }
function monthOf(s){ return s.slice(0, 7); }
function daysInMonth(y, m){ return new Date(y, m + 1, 0).getDate(); }
function firstDayMon(y, m){ return (new Date(y, m, 1).getDay() + 6) % 7; }
var MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var WD_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
function monthLabel(mo){ var p = mo.split('-'); return MONTHS_ID[+p[1] - 1] + ' ' + p[0]; }
function formatDateID(iso){ var d = parseISO(iso); return WD_SHORT[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtDateTime(isoStr){ if (!isoStr) return 'belum pernah'; var d = new Date(isoStr); return d.getDate() + ' ' + MONTHS_ID[d.getMonth()].slice(0,3) + ' ' + d.getFullYear() + ' ' + pad2(d.getHours()) + '.' + pad2(d.getMinutes()); }

/* ================= status ================= */
var STATUSES = ['Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan'];
var META = {
  'Hadir':            { code: 'H', cls: 'c-h' },
  'Sakit':            { code: 'S', cls: 'c-s' },
  'Izin':             { code: 'I', cls: 'c-i' },
  'Tanpa Keterangan': { code: 'T', cls: 'c-t' }
};

/* ================= data siswa awal ================= */
var NAMES = [
  'ALZHIO GHAFARI FEBRIAN','ARTETA KHEDIRA OZIL','ARYA PERMANA RAMADHAN','AUDREY AYUNDRIA JULIANA',
  'AZKIA ZEANITA','AZZAHRA SALSABILLA PUTRIZANI','BASTIAN IZZY KUNZURO','CAHAYA MALIKA PUTRI PRASETYO',
  'DEVINA MAHARANI','DIVA SYADIYAH','ERVINA NUR SYAHRANI','FADHLAN SURYA PRAMUDITYA',
  'FAZILA NISSYAHADI','FRICIL OLIVIA PUTRI DARMAWAN','FULLA RAMADHANTI','HAIKAL AKBAR',
  'HASNA NAMIRA NURJANAH','JANEETA KIRANA PUTRI HAMDANI','KAIRA SYAHLA ALFARIZI','KEYLA KIRANI',
  'KHANSAA NUR OKTAVIANI','LATHIIFAH AZ-ZAHRA','LULA ADYA FAHREZI','MEISYA FIDELLA KUSUMAH PUTRI',
  "MOCHAMMAD LUTFI ZULRIZAL MA'RUF",'MUHAMAD RAFA ZULFADHLI','MUHAMAD TIRTA','MUHAMMAD DZAKI',
  'MUHAMMAD FAAIQ AMMAR SYADDAAD','MUHAMMAD FATTAH FAIZULLAH','MUHAMMAD ZAIDANSYAH','NAFISHA ALMAHYRA HUSNA',
  'QUEEN JASMINE NUR REIKA','RAISA HERYANTI','RENO WIJAYA','SULTHAN THUFAEL',
  'SYAFIAH KHANSA KHOIRUN NISSA','YOESUP YAZID'
];
function defaultStudents(){
  return NAMES.map(function(n, i){ return { id: 's' + pad2(i + 1), nis: '8C' + pad2(i + 1), name: n }; });
}

/* ================= state & penyimpanan ================= */
var LS_KEY = 'presensia8c-v1';
var DEF_SETTINGS = { url: '', autoSync: false, interval: 30, lastSync: '', lastBackup: '' };
function loadState(){
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (raw) {
      var s = JSON.parse(raw);
      if (s && Array.isArray(s.students) && Array.isArray(s.records)) {
        var set = JSON.parse(JSON.stringify(DEF_SETTINGS));
        var src = s.settings || {};
        for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) set[k] = src[k]; }
        s.settings = set;
        return s;
      }
    }
  } catch (e) { /* data korup — pakai bawaan */ }
  return { students: defaultStudents(), records: [], settings: JSON.parse(JSON.stringify(DEF_SETTINGS)) };
}
var state = loadState();
function save(){ try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* penuh */ } }

function toast(msg, type){
  var t = document.createElement('div');
  t.className = 'toast' + (type === 'err' ? ' err' : type === 'ok' ? ' ok' : '');
  t.textContent = msg;
  t.onclick = function(){ t.remove(); };
  $('toast-host').appendChild(t);
  setTimeout(function(){ t.remove(); }, 4600);
}

/* ================= helper data ================= */
function findStudent(id){
  for (var i = 0; i < state.students.length; i++) if (state.students[i].id === id) return state.students[i];
  return null;
}
function hasRecordsOn(date){
  return state.records.some(function(r){ return r.date === date; });
}
function pctOf(rs){
  if (!rs.length) return null;
  var h = rs.filter(function(r){ return r.status === 'Hadir'; }).length;
  return Math.round(h / rs.length * 100);
}

/* ================= navigasi ================= */
function showPage(name){
  each(document.querySelectorAll('.page'), function(p){ p.classList.toggle('active', p.id === 'pg-' + name); });
  each(document.querySelectorAll('.nav-btn'), function(b){ b.classList.toggle('active', b.getAttribute('data-pg') === name); });
  if (name === 'dashboard') renderDashboard();
  if (name === 'attendance') renderAttendance();
  if (name === 'monthly') renderMonthly();
  if (name === 'daily') renderDaily();
  if (name === 'students') renderStudents();
  if (name === 'backup') renderBackupInfo();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================= dashboard ================= */
function statCard(lbl, val, cls, sub){
  return '<div class="card stat"><p class="lbl">' + lbl + '</p><p class="val ' + cls + '">' + val + '</p><p class="sub">' + sub + '</p></div>';
}
function renderDashboard(){
  var today = todayISO(), mo = monthOf(today);
  var todayRecs = state.records.filter(function(r){ return r.date === today; });
  var monthRecs = state.records.filter(function(r){ return r.month === mo; });
  var tp = pctOf(todayRecs), mp = pctOf(monthRecs);
  var alpa = monthRecs.filter(function(r){ return r.status === 'Tanpa Keterangan'; }).length;
  var hadirToday = todayRecs.filter(function(r){ return r.status === 'Hadir'; }).length;
  $('dash-desc').textContent = 'Pantau kehadiran ' + state.students.length + ' siswa · ' + monthLabel(mo) +
    ' · SMP Negeri 61. Data tersimpan otomatis di perangkat ini' +
    (state.settings.url ? ' dan tersinkron ke Google Spreadsheet.' : '.');
  $('dash-stats').innerHTML =
    statCard('Total Siswa', String(state.students.length), 'v-cyan', 'terdaftar di kelas 8C') +
    statCard('Hadir Hari Ini', tp === null ? '—' : tp + '%', 'v-lime', todayRecs.length ? hadirToday + ' dari ' + todayRecs.length + ' siswa hadir' : 'belum ada absensi masuk') +
    statCard('Kehadiran Bulan Ini', mp === null ? '—' : mp + '%', 'v-sky', monthRecs.length ? monthRecs.length + ' catatan absensi' : 'belum ada catatan') +
    statCard('Alpa Bulan Ini', String(alpa), 'v-pink', 'tanpa keterangan');

  var html = '', i;
  for (i = 6; i >= 0; i--) {
    var d = addDaysISO(today, -i);
    var rs = state.records.filter(function(r){ return r.date === d; });
    var p = pctOf(rs);
    html += '<div class="tcol' + (i === 0 ? ' now' : '') + '" title="' + formatDateID(d) + '">' +
      '<span class="pct">' + (p === null ? '·' : p + '%') + '</span>' +
      '<div class="bar"><i style="height:' + (p === null ? '6px' : Math.max(p, 8) + '%') + ';animation-delay:' + ((6 - i) * 60) + 'ms"></i></div>' +
      '<span class="wd">' + WD_SHORT[parseISO(d).getDay()] + '</span></div>';
  }
  $('dash-trend').innerHTML = html;

  var map = {};
  state.records.forEach(function(r){ (map[r.date] = map[r.date] || []).push(r); });
  var dates = Object.keys(map).sort().reverse().slice(0, 5);
  if (!dates.length) {
    $('dash-sessions').innerHTML = '<div class="empty">Belum ada sesi absensi.<br>Buka tab Absen untuk mulai mencatat.</div>';
  } else {
    var sh = '';
    dates.forEach(function(dt, idx){
      var rs = map[dt];
      var h = rs.filter(function(r){ return r.status === 'Hadir'; }).length;
      var p = Math.round(h / rs.length * 100);
      sh += '<div class="sess-row"><div class="top"><span>' + formatDateID(dt) + '</span><b>' + h + '/' + rs.length + ' hadir · <em>' + p + '%</em></b></div>' +
        '<div class="track"><i style="width:' + p + '%;animation-delay:' + (idx * 80) + 'ms"></i></div></div>';
    });
    $('dash-sessions').innerHTML = sh;
  }
}

/* ================= absensi ================= */
var attDate = todayISO();
var sel = {};
var attSearch = '';
var calBase = (function(){ var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; })();

function loadSelForDate(){
  sel = {};
  state.records.forEach(function(r){
    if (r.date === attDate) sel[r.studentId] = { status: r.status, note: r.note || '' };
  });
}

function renderCal(){
  var y = calBase.y, m = calBase.m;
  var mo = y + '-' + pad2(m + 1);
  $('cal-label').textContent = MONTHS_ID[m] + ' ' + y;
  var marked = {};
  state.records.forEach(function(r){ if (r.month === mo) marked[r.date] = 1; });
  var first = firstDayMon(y, m), days = daysInMonth(y, m), today = todayISO();
  var html = '', i;
  for (i = 0; i < first; i++) html += '<span></span>';
  for (i = 1; i <= days; i++) {
    var ds = mo + '-' + pad2(i);
    html += '<button type="button" class="cal-day' + (ds === today ? ' today' : '') + (ds === attDate ? ' chosen' : '') + '" data-d="' + ds + '">' + i +
      (marked[ds] && ds !== attDate ? '<span class="mk"></span>' : '') + '</button>';
  }
  $('cal-grid').innerHTML = html;
  each($('cal-grid').querySelectorAll('.cal-day'), function(b){
    b.addEventListener('click', function(){
      attDate = b.getAttribute('data-d');
      var d = parseISO(attDate);
      calBase = { y: d.getFullYear(), m: d.getMonth() };
      loadSelForDate();
      renderAttendance();
    });
  });
}

function renderStudentList(){
  var q = attSearch.toLowerCase();
  var html = '', shown = 0;
  state.students.forEach(function(s, i){
    if (q && s.name.toLowerCase().indexOf(q) === -1 && s.nis.toLowerCase().indexOf(q) === -1) return;
    shown++;
    var v = sel[s.id];
    var code = v ? META[v.status].code : '—';
    var codeCls = v ? META[v.status].cls : '';
    html += '<div class="card s-card' + (v ? ' filled' : '') + '" data-id="' + s.id + '">' +
      '<div class="s-top"><div style="min-width:0"><p class="s-no">' + pad2(i + 1) + ' · ' + esc(s.nis) + '</p>' +
      '<p class="s-name">' + esc(s.name) + '</p></div>' +
      '<span class="s-code ' + codeCls + '">' + code + '</span></div>' +
      '<div class="st-row">' + STATUSES.map(function(st){
        return '<button type="button" class="st-btn' + (v && v.status === st ? ' sel' : '') + '" data-s="' + st + '">' + (st === 'Tanpa Keterangan' ? 'Alpa' : st) + '</button>';
      }).join('') + '</div>' +
      '<input class="note" type="text" placeholder="Catatan opsional..." value="' + esc(v ? v.note : '') + '">' +
      '</div>';
  });
  if (!shown) html = '<div class="card empty" style="grid-column:1/-1">Tidak ada siswa yang cocok dengan pencarian.</div>';
  $('student-list').innerHTML = html;
  each($('student-list').querySelectorAll('.s-card'), function(card){
    var id = card.getAttribute('data-id');
    each(card.querySelectorAll('.st-btn'), function(b){
      b.addEventListener('click', function(){
        sel[id] = { status: b.getAttribute('data-s'), note: (sel[id] && sel[id].note) || '' };
        renderStudentList();
        renderSummary();
      });
    });
    card.querySelector('.note').addEventListener('input', function(e){
      if (sel[id]) sel[id].note = e.target.value;
    });
  });
}

function renderSummary(){
  var counts = { 'Hadir': 0, 'Sakit': 0, 'Izin': 0, 'Tanpa Keterangan': 0 };
  Object.keys(sel).forEach(function(k){ counts[sel[k].status]++; });
  var html = '';
  STATUSES.forEach(function(st){
    html += '<div><p class="n ' + (counts[st] ? META[st].cls : 'c-x') + '">' + counts[st] + '</p>' +
      '<p class="l">' + META[st].code + ' · ' + (st === 'Tanpa Keterangan' ? 'Alpa' : st) + '</p></div>';
  });
  $('sum-grid').innerHTML = html;
  var filled = Object.keys(sel).length, total = state.students.length;
  $('prog-txt').textContent = filled + ' / ' + total;
  $('prog-bar').style.width = (total ? Math.round(filled / total * 100) : 0) + '%';
  var saved = hasRecordsOn(attDate);
  var btn = $('btn-submit');
  btn.disabled = filled === 0;
  btn.innerHTML = (saved ? 'Perbarui Absensi (' : 'Kirim Absensi (') + filled + '/' + total + ') &#10148;';
}

function renderAttendance(){
  $('att-date').value = attDate;
  $('att-title').textContent = formatDateID(attDate);
  $('btn-today').classList.toggle('hidden', attDate === todayISO());
  renderCal();
  renderStudentList();
  renderSummary();
}

function markAll(){
  state.students.forEach(function(s){
    sel[s.id] = { status: 'Hadir', note: (sel[s.id] && sel[s.id].note) || '' };
  });
  renderStudentList();
  renderSummary();
  toast('Semua siswa ditandai hadir — periksa kembali sebelum disimpan.', 'info');
}
function clearSel(){
  sel = {};
  renderStudentList();
  renderSummary();
  toast('Pilihan status dikosongkan.', 'info');
}

function submitAttendance(){
  var filled = Object.keys(sel).length;
  if (!filled) { toast('Pilih status minimal satu siswa terlebih dahulu.', 'err'); return; }
  if (filled < state.students.length) {
    var left = state.students.length - filled;
    if (!window.confirm('Baru ' + filled + ' dari ' + state.students.length + ' siswa terisi. ' + left + ' siswa tidak akan tercatat untuk tanggal ini. Simpan sebagian?')) return;
  }
  var now = new Date().toISOString();
  var saved = 0, updated = 0, hadir = 0;
  state.students.forEach(function(s){
    var v = sel[s.id];
    if (!v) return;
    if (v.status === 'Hadir') hadir++;
    var found = -1;
    for (var i = 0; i < state.records.length; i++) {
      if (state.records[i].studentId === s.id && state.records[i].date === attDate) { found = i; break; }
    }
    var entry = {
      id: found >= 0 ? state.records[found].id : uid(),
      studentId: s.id, studentName: s.name,
      date: attDate, month: monthOf(attDate),
      status: v.status, note: v.note || '', time: now
    };
    if (found >= 0) { state.records[found] = entry; updated++; }
    else { state.records.push(entry); saved++; }
  });
  save();
  renderCal();
  renderSummary();
  toast('Absensi ' + formatDateID(attDate) + ' tersimpan — ' + saved + ' baru, ' + updated + ' diperbarui, ' + hadir + ' hadir.', 'ok');
}
`;
