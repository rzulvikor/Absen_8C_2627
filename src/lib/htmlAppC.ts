/* Bagian 3/3 dari aplikasi HTML satu berkas: rekap, cetak, siswa, sinkronisasi, dan inisialisasi. */
export const HTML_PART_C = `
/* ================= rekap bulanan ================= */
function monthlyData(mo){
  return state.students.map(function(s, i){
    var rs = state.records.filter(function(r){ return r.studentId === s.id && r.month === mo; });
    var c = function(st){ return rs.filter(function(r){ return r.status === st; }).length; };
    return { i: i, s: s, h: c('Hadir'), sk: c('Sakit'), iz: c('Izin'), t: c('Tanpa Keterangan'),
      total: rs.length, pct: rs.length ? Math.round(c('Hadir') / rs.length * 100) : 0 };
  });
}
function renderMonthly(){
  var mo = $('mo-filter').value || monthOf(todayISO());
  var rows = monthlyData(mo);
  var html = '<table><thead><tr><th>No</th><th>NIS</th><th>Nama Siswa</th>' +
    '<th class="c">H</th><th class="c">S</th><th class="c">I</th><th class="c">T</th><th class="c">% Hadir</th></tr></thead><tbody>';
  var tot = { h: 0, sk: 0, iz: 0, t: 0 };
  rows.forEach(function(r){
    tot.h += r.h; tot.sk += r.sk; tot.iz += r.iz; tot.t += r.t;
    html += '<tr><td class="mono" style="color:#5f7d93;font-size:11px">' + pad2(r.i + 1) + '</td>' +
      '<td class="mono v-cyan" style="font-size:11px">' + esc(r.s.nis) + '</td>' +
      '<td style="font-weight:600">' + esc(r.s.name) + '</td>' +
      '<td class="c c-h">' + (r.h || '-') + '</td><td class="c c-s">' + (r.sk || '-') + '</td>' +
      '<td class="c c-i">' + (r.iz || '-') + '</td><td class="c c-t">' + (r.t || '-') + '</td>' +
      '<td class="c"><span class="mini-track"><i style="width:' + r.pct + '%"></i></span><b class="mono v-cyan">' + r.pct + '%</b></td></tr>';
  });
  var grand = tot.h + tot.sk + tot.iz + tot.t;
  var gp = grand ? Math.round(tot.h / grand * 100) : 0;
  html += '<tr style="background:rgba(45,226,230,.06)"><td></td><td></td><td style="font-weight:800">TOTAL KELAS</td>' +
    '<td class="c c-h"><b>' + tot.h + '</b></td><td class="c c-s"><b>' + tot.sk + '</b></td>' +
    '<td class="c c-i"><b>' + tot.iz + '</b></td><td class="c c-t"><b>' + tot.t + '</b></td>' +
    '<td class="c"><b class="mono v-lime">' + gp + '%</b></td></tr>';
  $('monthly-table').innerHTML = html + '</tbody></table>';
}

/* ================= rekap harian ================= */
function buildRecIdx(){
  var idx = {};
  state.records.forEach(function(r){ idx[r.studentId + '|' + r.date] = r; });
  return idx;
}
function renderDaily(){
  var mo = $('da-filter').value || monthOf(todayISO());
  var p = mo.split('-'), y = +p[0], m = +p[1];
  var days = daysInMonth(y, m - 1);
  var today = todayISO();
  var recIdx = buildRecIdx();
  var html = '<table style="min-width:' + (260 + days * 40) + 'px"><thead><tr><th class="sticky-col">Nama Siswa</th>';
  var d;
  for (d = 1; d <= days; d++) {
    var wd = new Date(y, m - 1, d).getDay();
    var isT = mo + '-' + pad2(d) === today;
    html += '<th class="c' + (isT ? ' today-col' : (wd === 0 || wd === 6) ? ' wkend' : '') + '" title="' + formatDateID(mo + '-' + pad2(d)) + '">' + d + '</th>';
  }
  html += '</tr></thead><tbody>';
  state.students.forEach(function(s, i){
    html += '<tr><td class="sticky-col" style="font-weight:600"><span class="mono" style="color:#5f7d93;font-size:10px">' + pad2(i + 1) + '.</span> ' + esc(s.name) + '</td>';
    for (d = 1; d <= days; d++) {
      var ds = mo + '-' + pad2(d);
      var wd2 = new Date(y, m - 1, d).getDay();
      var rec = recIdx[s.id + '|' + ds];
      html += '<td class="c mono' + (ds === today ? ' today-col' : (wd2 === 0 || wd2 === 6) ? ' wkend' : '') + ' ' + (rec ? META[rec.status].cls : 'c-x') + '" style="font-weight:700">' + (rec ? META[rec.status].code : '—') + '</td>';
    }
    html += '</tr>';
  });
  $('daily-table').innerHTML = html + '</tbody></table>';
}

/* ================= unduh & CSV ================= */
function csvCell(v){
  v = String(v == null ? '' : v);
  if (/[",\\n;]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
  return v;
}
function toCSV(rows){ return rows.map(function(r){ return r.map(csvCell).join(','); }).join('\\n'); }
function download(name, content, mime){
  var blob = new Blob([content], { type: mime || 'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 800);
}
function exportMonthlyCSV(){
  var mo = $('mo-filter').value || monthOf(todayISO());
  var rows = [['NO','NIS','NAMA SISWA','HADIR','SAKIT','IZIN','ALPA','% HADIR']];
  monthlyData(mo).forEach(function(r){ rows.push([r.i + 1, r.s.nis, r.s.name, r.h, r.sk, r.iz, r.t, r.pct + '%']); });
  download('rekap-bulanan-8c-' + mo + '.csv', toCSV(rows));
  toast('Rekap bulanan ' + monthLabel(mo) + ' diekspor ke CSV.', 'ok');
}
function exportDailyCSV(){
  var mo = $('da-filter').value || monthOf(todayISO());
  var p = mo.split('-'), y = +p[0], m = +p[1], days = daysInMonth(y, m - 1);
  var head = ['NO','NIS','NAMA SISWA'];
  for (var d = 1; d <= days; d++) head.push(d);
  var rows = [head];
  var recIdx = buildRecIdx();
  state.students.forEach(function(s, i){
    var row = [i + 1, s.nis, s.name];
    for (var d2 = 1; d2 <= days; d2++) {
      var rec = recIdx[s.id + '|' + mo + '-' + pad2(d2)];
      row.push(rec ? META[rec.status].code : '');
    }
    rows.push(row);
  });
  download('rekap-harian-8c-' + mo + '.csv', toCSV(rows));
  toast('Rekap harian ' + monthLabel(mo) + ' diekspor ke CSV.', 'ok');
}

/* ================= cetak ================= */
function printReport(kind){
  var monthly = kind === 'monthly';
  var mo = (monthly ? $('mo-filter') : $('da-filter')).value || monthOf(todayISO());
  var title = (monthly ? 'Rekap Kehadiran Bulanan' : 'Rekap Harian') + ' — ' + monthLabel(mo);
  var th = 'background:#071426;color:#fff;padding:7px;border:1px solid #33475c;font-size:10px;text-align:center';
  var td = 'padding:6px 7px;border:1px solid #c6d6e2;font-size:10px;text-align:center';
  var body = '';
  if (monthly) {
    body = '<table style="width:100%;border-collapse:collapse"><thead><tr>' +
      ['NO','NIS','NAMA SISWA','H','S','I','T','% HADIR'].map(function(h){ return '<th style="' + th + '">' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' + monthlyData(mo).map(function(r){
        return '<tr><td style="' + td + '">' + (r.i + 1) + '</td><td style="' + td + '">' + esc(r.s.nis) + '</td>' +
          '<td style="' + td + 'text-align:left;font-weight:600">' + esc(r.s.name) + '</td>' +
          '<td style="' + td + 'color:#478100">' + r.h + '</td><td style="' + td + 'color:#ad6200">' + r.sk + '</td>' +
          '<td style="' + td + 'color:#1259bd">' + r.iz + '</td><td style="' + td + 'color:#bd1766">' + r.t + '</td>' +
          '<td style="' + td + 'font-weight:700">' + r.pct + '%</td></tr>';
      }).join('') + '</tbody></table>';
  } else {
    var p = mo.split('-'), y = +p[0], m = +p[1], days = daysInMonth(y, m - 1);
    var recIdx = buildRecIdx();
    var head = '<th style="' + th + ';text-align:left">NO</th><th style="' + th + ';text-align:left;min-width:150px">NAMA SISWA</th>';
    for (var d = 1; d <= days; d++) head += '<th style="' + th + '">' + d + '</th>';
    var rows = state.students.map(function(s, i){
      var cells = '<td style="' + td + '">' + (i + 1) + '</td><td style="' + td + 'text-align:left;font-weight:600">' + esc(s.name) + '</td>';
      for (var d2 = 1; d2 <= days; d2++) {
        var rec = recIdx[s.id + '|' + mo + '-' + pad2(d2)];
        var color = !rec ? '#93a7b8' : rec.status === 'Hadir' ? '#478100' : rec.status === 'Sakit' ? '#ad6200' : rec.status === 'Izin' ? '#1259bd' : '#bd1766';
        cells += '<td style="' + td + 'color:' + color + ';font-weight:700">' + (rec ? META[rec.status].code : '-') + '</td>';
      }
      return '<tr>' + cells + '</tr>';
    }).join('');
    body = '<table style="width:100%;border-collapse:collapse"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table>';
  }
  var w = window.open('', '_blank');
  if (!w) { toast('Izinkan pop-up untuk membuka pratinjau cetak.', 'err'); return; }
  w.document.open();
  w.document.write('<!doctype html><html><head><meta charset="UTF-8"><title>' + esc(title) + '</title></head>' +
    '<body style="font-family:Arial,sans-serif;color:#102338;padding:18px">' +
    '<h1 style="font-size:17px;margin:0 0 3px">' + esc(title) + '</h1>' +
    '<p style="margin:0 0 14px;color:#536273;font-size:12px">Kelas 8C · SMP Negeri 61 · H = Hadir, S = Sakit, I = Izin, T = Tanpa Keterangan</p>' +
    body +
    '<scr' + 'ipt>window.onload = function(){ setTimeout(function(){ window.print(); }, 350); };<\\/scr' + 'ipt>' +
    '</body></html>');
  w.document.close();
}

/* ================= data siswa ================= */
var stuSearch = '';
var modalEditId = null;
function renderStudents(){
  $('stu-desc').textContent = state.students.length + ' siswa terdaftar di kelas 8C. Tambah, ubah, hapus, atau impor massal lewat CSV.';
  var q = stuSearch.toLowerCase();
  var mo = monthOf(todayISO());
  var html = '<table><thead><tr><th>No</th><th>NIS</th><th>Nama Siswa</th>' +
    '<th style="text-align:right">Hadir ' + monthLabel(mo).split(' ')[0] + '</th><th style="text-align:right">Aksi</th></tr></thead><tbody>';
  var shown = 0;
  state.students.forEach(function(s, i){
    if (q && s.name.toLowerCase().indexOf(q) === -1 && s.nis.toLowerCase().indexOf(q) === -1) return;
    shown++;
    var rs = state.records.filter(function(r){ return r.studentId === s.id && r.month === mo; });
    var h = rs.filter(function(r){ return r.status === 'Hadir'; }).length;
    var pct = rs.length ? Math.round(h / rs.length * 100) : null;
    html += '<tr><td class="mono" style="color:#5f7d93;font-size:11px">' + pad2(i + 1) + '</td>' +
      '<td class="mono v-cyan" style="font-size:11px">' + esc(s.nis) + '</td>' +
      '<td style="font-weight:600">' + esc(s.name) + '</td>' +
      '<td style="text-align:right">' + (pct === null
        ? '<span class="mono" style="color:#33506a;font-size:11px">belum ada</span>'
        : '<span class="mini-track"><i style="width:' + pct + '%"></i></span><b class="mono c-h">' + h + '/' + rs.length + ' · ' + pct + '%</b>') + '</td>' +
      '<td style="text-align:right;white-space:nowrap">' +
      '<button class="act-btn" data-act="edit" data-id="' + s.id + '" title="Ubah">&#9998;</button>' +
      '<button class="act-btn danger" data-act="del" data-id="' + s.id + '" title="Hapus">&#10005;</button></td></tr>';
  });
  if (!shown) html += '<tr><td colspan="5" class="empty">' + (state.students.length ? 'Tidak ada hasil untuk pencarian.' : 'Belum ada siswa. Tambahkan atau impor data.') + '</td></tr>';
  $('students-table').innerHTML = html + '</tbody></table>';
  each($('students-table').querySelectorAll('.act-btn'), function(b){
    b.addEventListener('click', function(){
      var id = b.getAttribute('data-id');
      if (b.getAttribute('data-act') === 'edit') openModal(id);
      else deleteStudent(id);
    });
  });
}
function openModal(id){
  modalEditId = id || null;
  var s = id ? findStudent(id) : null;
  $('m-title').textContent = s ? 'Ubah Data Siswa' : 'Tambah Siswa Baru';
  $('m-nis').value = s ? s.nis : '';
  $('m-name').value = s ? s.name : '';
  $('m-err').classList.add('hidden');
  $('modal').classList.remove('hidden');
  setTimeout(function(){ $('m-nis').focus(); }, 60);
}
function closeModal(){ $('modal').classList.add('hidden'); }
function showMErr(t){ var e = $('m-err'); e.textContent = t; e.classList.remove('hidden'); }
function saveModal(){
  var nis = $('m-nis').value.trim();
  var name = $('m-name').value.trim().toUpperCase();
  if (!nis) { showMErr('NIS wajib diisi.'); return; }
  if (!name) { showMErr('Nama wajib diisi.'); return; }
  var dup = state.students.some(function(s){ return s.nis.toLowerCase() === nis.toLowerCase() && s.id !== modalEditId; });
  if (dup) { showMErr('NIS "' + nis + '" sudah dipakai siswa lain.'); return; }
  if (modalEditId) {
    var s = findStudent(modalEditId);
    var renamed = s.name !== name;
    s.nis = nis; s.name = name;
    state.records.forEach(function(r){ if (r.studentId === modalEditId) r.studentName = name; });
    toast('Data siswa diperbarui.' + (renamed ? ' Riwayat absen ikut disesuaikan.' : ''), 'ok');
  } else {
    state.students.push({ id: uid(), nis: nis, name: name });
    toast('"' + name + '" ditambahkan ke kelas.', 'ok');
  }
  save(); closeModal(); renderStudents(); renderStudentList();
}
function deleteStudent(id){
  var s = findStudent(id);
  if (!s) return;
  var n = state.records.filter(function(r){ return r.studentId === id; }).length;
  var msg = 'Hapus "' + s.name + '" dari kelas?';
  if (n) msg += '\\n' + n + ' catatan absensinya juga akan dihapus permanen.';
  if (!window.confirm(msg)) return;
  state.students = state.students.filter(function(x){ return x.id !== id; });
  state.records = state.records.filter(function(r){ return r.studentId !== id; });
  delete sel[id];
  save(); renderStudents(); renderStudentList(); renderSummary();
  toast('"' + s.name + '" dihapus.', 'info');
}

/* ================= impor CSV siswa ================= */
function parseStudentCSV(text){
  var lines = text.replace(/\\r/g, '').split('\\n');
  var rows = [], errors = [];
  lines.forEach(function(line, idx){
    var t = line.trim();
    if (!t) return;
    if (idx === 0 && /nama/i.test(t) && /nis/i.test(t)) return;
    var sep = t.indexOf(';') > -1 ? ';' : ',';
    var parts = t.split(sep);
    var nis = (parts[0] || '').trim().replace(/^"|"$/g, '');
    var name = parts.slice(1).join(sep).trim().replace(/^"|"$/g, '').toUpperCase();
    if (!name) { errors.push('Baris ' + (idx + 1) + ': nama kosong'); return; }
    rows.push({ nis: nis, name: name });
  });
  return { rows: rows, errors: errors };
}
function handleCSVFile(file){
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    var res = parseStudentCSV(String(reader.result));
    if (!res.rows.length) {
      toast('Tidak ada baris valid di berkas' + (res.errors.length ? ' — ' + res.errors[0] : '') + '.', 'err');
      return;
    }
    var merge = window.confirm('Pilih mode impor untuk ' + res.rows.length + ' baris:\\n\\n' +
      'OK    = GABUNGKAN — NIS yang sama diperbarui, sisanya ditambahkan. Absensi lama aman.\\n' +
      'Batal = GANTI SEMUA — daftar siswa & SELURUH absensi lama dihapus!');
    var added = 0, updated = 0, auto = 0;
    if (!merge) { state.students = []; state.records = []; sel = {}; }
    var byNis = {};
    state.students.forEach(function(s){ byNis[s.nis.toLowerCase()] = s; });
    res.rows.forEach(function(r){
      var nis = r.nis || ('IMP-' + String(++auto).padStart(3, '0'));
      var key = nis.toLowerCase();
      if (byNis[key]) { byNis[key].name = r.name; updated++; }
      else { var st = { id: uid(), nis: nis, name: r.name }; byNis[key] = st; state.students.push(st); added++; }
    });
    save(); renderStudents(); renderStudentList(); renderSummary();
    var msg = 'Impor selesai: ' + added + ' siswa baru ditambahkan';
    if (updated) msg += ', ' + updated + ' diperbarui';
    if (!merge) msg += ' (mode ganti semua)';
    if (res.errors.length) msg += ' · ' + res.errors.length + ' baris dilewati';
    toast(msg + '.', 'ok');
  };
  reader.readAsText(file);
}
function studentTemplate(){
  var rows = [['nis', 'nama']];
  defaultStudents().forEach(function(s){ rows.push([s.nis, s.name]); });
  download('template-import-siswa.csv', toCSV(rows));
  toast('Template CSV diunduh — buka di Excel/Sheets, edit, lalu simpan sebagai .csv.', 'ok');
}
function exportStudents(){
  var rows = [['nis', 'nama']];
  state.students.forEach(function(s){ rows.push([s.nis, s.name]); });
  download('data-siswa-8c-' + todayISO() + '.csv', toCSV(rows));
  toast('Data siswa diekspor ke CSV.', 'ok');
}

/* ================= backup & auto-sync ================= */
function renderBackupInfo(){
  $('bk-url').value = state.settings.url || '';
  $('bk-autosync').checked = !!state.settings.autoSync;
  $('bk-interval').value = String(state.settings.interval || 30);
  $('bk-last-backup').textContent = state.settings.lastBackup ? fmtDateTime(state.settings.lastBackup) : 'belum pernah';
  $('bk-last-sync').textContent = state.settings.lastSync ? fmtDateTime(state.settings.lastSync) : 'belum pernah';
  updateSyncBadge();
}
function updateSyncBadge(){
  var on = !!(state.settings.autoSync && state.settings.url);
  $('sync-badge').classList.toggle('hidden', !on);
  $('sync-badge').title = on ? 'Memeriksa Spreadsheet setiap ' + state.settings.interval + ' detik' : '';
}
function saveUrl(){
  var url = $('bk-url').value.trim();
  if (url && !/^https:\\/\\/script\\.google/.test(url)) {
    toast('URL tidak valid. Gunakan URL Web App Apps Script (berakhiran /exec).', 'err');
    return;
  }
  var changed = url !== state.settings.url;
  state.settings.url = url;
  save(); renderBackupInfo(); applyAutoSync();
  toast(url ? 'URL Web App tersimpan.' : 'URL Web App dihapus.', 'info');
  if (url && state.settings.autoSync && changed) pull(true);
}
function mergeData(data){
  var addedSt = 0, imported = 0, skipped = 0;
  var byNis = {};
  state.students.forEach(function(s){ byNis[s.nis.toLowerCase()] = s; });
  (data.students || []).forEach(function(rs){
    if (!rs || !rs.nis || !rs.name) return;
    var key = String(rs.nis).toLowerCase();
    if (!byNis[key]) {
      addedSt++;
      var st = { id: uid(), nis: String(rs.nis), name: String(rs.name).toUpperCase() };
      byNis[key] = st;
      state.students.push(st);
    }
  });
  var idx = {};
  state.records.forEach(function(r, i){ idx[r.studentId + '|' + r.date] = i; });
  var valid = { 'Hadir': 1, 'Sakit': 1, 'Izin': 1, 'Tanpa Keterangan': 1 };
  (data.records || []).forEach(function(rr){
    if (!rr) { skipped++; return; }
    var st = byNis[String(rr.nis || '').toLowerCase()];
    if (!st || !rr.date || !valid[rr.status]) { skipped++; return; }
    imported++;
    var key = st.id + '|' + rr.date;
    var entry = { id: uid(), studentId: st.id, studentName: st.name, date: String(rr.date),
      month: monthOf(String(rr.date)), status: rr.status, note: rr.note || '', time: rr.time || new Date().toISOString() };
    if (idx[key] !== undefined) { entry.id = state.records[idx[key]].id; state.records[idx[key]] = entry; }
    else { idx[key] = state.records.length; state.records.push(entry); }
  });
  return { addedSt: addedSt, imported: imported, skipped: skipped };
}
var syncTimer = null;
var lastPullErr = 0;
function applyAutoSync(){
  if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
  updateSyncBadge();
  if (state.settings.autoSync && state.settings.url) {
    pull(true);
    syncTimer = setInterval(function(){ pull(true); }, Math.max(10, +state.settings.interval || 30) * 1000);
  }
}
function pull(silent){
  var url = (state.settings.url || '').trim();
  if (!url) { if (!silent) toast('Isi dan simpan URL Web App terlebih dahulu.', 'err'); return; }
  fetch(url).then(function(r){
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function(data){
    if (!data || typeof data !== 'object') throw new Error('respons tidak valid');
    var res = mergeData(data);
    state.settings.lastSync = new Date().toISOString();
    save();
    renderAll();
    if (res.imported || res.addedSt) {
      toast((silent ? 'Auto-sync: ' : 'Pulihkan: ') + res.addedSt + ' siswa & ' + res.imported + ' catatan diperbarui dari Spreadsheet.', silent ? 'info' : 'ok');
    } else if (!silent) {
      toast('Data sudah sinkron — tidak ada pembaruan baru.', 'info');
    }
  }).catch(function(e){
    if (!silent) toast('Gagal memulihkan: ' + e.message, 'err');
    else {
      var t = Date.now();
      if (t - lastPullErr > 120000) { lastPullErr = t; toast('Auto-sync gagal: ' + e.message, 'err'); }
    }
  });
}
function sendBackup(){
  var url = (state.settings.url || '').trim();
  if (!url) { toast('Isi dan simpan URL Web App terlebih dahulu.', 'err'); return; }
  if (!state.records.length) { toast('Belum ada data absensi untuk dibackup.', 'err'); return; }
  var payload = {
    app: 'Presensia8C',
    at: new Date().toISOString(),
    students: state.students.map(function(s){ return { nis: s.nis, name: s.name }; }),
    records: state.records.map(function(r){
      var st = findStudent(r.studentId);
      return { nis: st ? st.nis : '-', name: r.studentName, date: r.date, status: r.status, note: r.note, time: r.time };
    })
  };
  toast('Mengirim backup ke Google Sheets...', 'info');
  fetch(url, { method: 'POST', body: JSON.stringify(payload) }).then(function(r){
    return r.json().then(function(d){ return { ok: r.ok, d: d }; });
  }).then(function(o){
    if (!o.ok || !o.d || !o.d.ok) throw new Error((o.d && o.d.error) || 'HTTP gagal');
    state.settings.lastBackup = new Date().toISOString();
    save(); renderBackupInfo();
    toast('Backup terkirim: ' + (o.d.records || state.records.length) + ' catatan absensi + ' + state.students.length + ' siswa.', 'ok');
  }).catch(function(e){
    toast('Gagal mengirim backup: ' + e.message + '. Periksa URL & akses deployment (Anyone).', 'err');
  });
}
function exportJSON(){
  var payload = { app: 'Presensia8C', exportedAt: new Date().toISOString(),
    students: state.students, records: state.records, settings: state.settings };
  download('cadangan-presensia8c-' + todayISO() + '.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  toast('Cadangan lokal (JSON) diunduh.', 'ok');
}
function importJSONFile(file){
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    try {
      var data = JSON.parse(String(reader.result));
      if (data.app !== 'Presensia8C' || !Array.isArray(data.students) || !Array.isArray(data.records)) throw new Error('format');
      var res = mergeData({ students: data.students, records: data.records });
      save(); renderAll();
      toast('Cadangan dimuat: ' + res.imported + ' catatan, ' + res.addedSt + ' siswa baru.', 'ok');
    } catch (e) { toast('Berkas bukan cadangan Presensia yang valid.', 'err'); }
  };
  reader.readAsText(file);
}

/* ================= render semua & init ================= */
function renderAll(){
  renderDashboard();
  renderAttendance();
  renderMonthly();
  renderDaily();
  renderStudents();
  renderBackupInfo();
}
function syncCalBase(){ var d = parseISO(attDate); calBase = { y: d.getFullYear(), m: d.getMonth() }; }
function init(){
  var today = todayISO();
  var mo = monthOf(today);
  $('mo-filter').value = mo;
  $('da-filter').value = mo;
  $('today-txt').textContent = formatDateID(today);
  loadSelForDate();

  each(document.querySelectorAll('.nav-btn'), function(b){
    b.addEventListener('click', function(){ showPage(b.getAttribute('data-pg')); });
  });

  $('btn-prev-day').addEventListener('click', function(){ attDate = addDaysISO(attDate, -1); syncCalBase(); loadSelForDate(); renderAttendance(); });
  $('btn-next-day').addEventListener('click', function(){ attDate = addDaysISO(attDate, 1); syncCalBase(); loadSelForDate(); renderAttendance(); });
  $('btn-today').addEventListener('click', function(){ attDate = todayISO(); syncCalBase(); loadSelForDate(); renderAttendance(); });
  $('btn-prev-mon').addEventListener('click', function(){ calBase = calBase.m === 0 ? { y: calBase.y - 1, m: 11 } : { y: calBase.y, m: calBase.m - 1 }; renderCal(); });
  $('btn-next-mon').addEventListener('click', function(){ calBase = calBase.m === 11 ? { y: calBase.y + 1, m: 0 } : { y: calBase.y, m: calBase.m + 1 }; renderCal(); });
  $('att-date').addEventListener('change', function(e){
    if (!e.target.value) return;
    attDate = e.target.value; syncCalBase(); loadSelForDate(); renderAttendance();
  });
  $('att-search').addEventListener('input', function(e){ attSearch = e.target.value; renderStudentList(); });
  $('btn-all').addEventListener('click', markAll);
  $('btn-clear').addEventListener('click', clearSel);
  $('btn-submit').addEventListener('click', submitAttendance);

  $('mo-filter').addEventListener('change', renderMonthly);
  $('da-filter').addEventListener('change', renderDaily);
  $('mo-print').addEventListener('click', function(){ printReport('monthly'); });
  $('da-print').addEventListener('click', function(){ printReport('daily'); });
  $('mo-csv').addEventListener('click', exportMonthlyCSV);
  $('da-csv').addEventListener('click', exportDailyCSV);

  $('stu-search').addEventListener('input', function(e){ stuSearch = e.target.value; renderStudents(); });
  $('stu-add').addEventListener('click', function(){ openModal(null); });
  $('stu-template').addEventListener('click', studentTemplate);
  $('stu-export').addEventListener('click', exportStudents);
  $('stu-import').addEventListener('click', function(){ $('csv-file').click(); });
  $('csv-file').addEventListener('change', function(e){ handleCSVFile(e.target.files[0]); e.target.value = ''; });
  $('m-cancel').addEventListener('click', closeModal);
  $('m-save').addEventListener('click', saveModal);
  $('m-name').addEventListener('keydown', function(e){ if (e.key === 'Enter') saveModal(); });
  $('modal').addEventListener('click', function(e){ if (e.target === $('modal')) closeModal(); });

  $('bk-save-url').addEventListener('click', saveUrl);
  $('bk-send').addEventListener('click', sendBackup);
  $('bk-pull').addEventListener('click', function(){ pull(false); });
  $('bk-sync-now').addEventListener('click', function(){ pull(false); });
  $('bk-autosync').addEventListener('change', function(e){
    state.settings.autoSync = e.target.checked;
    save(); applyAutoSync(); renderBackupInfo();
    toast(state.settings.autoSync
      ? 'Auto-Sync aktif — memeriksa Spreadsheet setiap ' + state.settings.interval + ' detik.'
      : 'Auto-Sync dimatikan.', 'info');
  });
  $('bk-interval').addEventListener('change', function(e){
    state.settings.interval = +e.target.value || 30;
    save(); applyAutoSync(); renderBackupInfo();
  });
  $('bk-json-out').addEventListener('click', exportJSON);
  $('bk-json-in').addEventListener('click', function(){ $('json-file').click(); });
  $('json-file').addEventListener('change', function(e){ importJSONFile(e.target.files[0]); e.target.value = ''; });

  renderAll();
  applyAutoSync();
}
init();
</script>
</body>
</html>`;
