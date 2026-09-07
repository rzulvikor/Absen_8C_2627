/* Bagian 1/3 dari aplikasi HTML satu berkas: head, CSS, dan kerangka body. */
export const HTML_PART_A = `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presensia 8C — Absensi & Rekap</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--navy:#071426;--cyan:#2de2e6;--lime:#b6f23d;--pink:#ff4fa3;--blue:#3f8cff;--orange:#ffb547}
*{box-sizing:border-box;margin:0}
body{background:radial-gradient(circle at 85% -5%,rgba(45,226,230,.14),transparent 28%),radial-gradient(circle at 8% 108%,rgba(63,140,255,.16),transparent 32%),#071426;color:#e9f8ff;font-family:"DM Sans",sans-serif;min-height:100vh}
::selection{background:rgba(45,226,230,.35)}
.bg-grid{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(45,226,230,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,226,230,.04) 1px,transparent 1px);background-size:36px 36px;mask-image:linear-gradient(to bottom,#000 0%,rgba(0,0,0,.4) 60%,transparent 100%)}
.topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:14px 22px;border-bottom:1px solid rgba(126,226,255,.12);background:rgba(7,20,38,.82);backdrop-filter:blur(14px)}
.brand{display:flex;align-items:center;gap:10px}
.brand-mark{width:38px;height:38px;border-radius:12px;background:var(--cyan);color:var(--navy);display:grid;place-items:center;font-family:"Space Mono",monospace;font-weight:700;font-size:13px;box-shadow:0 0 26px rgba(45,226,230,.5)}
.brand-name{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:15px}
.brand-sub{font-family:"Space Mono",monospace;font-size:9px;color:var(--cyan);letter-spacing:.14em}
#nav{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}
.nav-btn{font-family:"DM Sans",sans-serif;font-size:12.5px;font-weight:600;color:#9bb7cb;background:none;border:1px solid transparent;border-radius:10px;padding:8px 13px;cursor:pointer;transition:.18s}
.nav-btn:hover{color:#dffcff;background:rgba(45,226,230,.08)}
.nav-btn.active{color:var(--cyan);background:rgba(45,226,230,.13);border-color:rgba(45,226,230,.35)}
.top-right{display:flex;align-items:center;gap:10px}
.sync-badge{display:flex;align-items:center;gap:6px;border:1px solid rgba(182,242,61,.4);background:rgba(182,242,61,.1);color:var(--lime);font-family:"Space Mono",monospace;font-size:9px;letter-spacing:.12em;padding:5px 10px;border-radius:99px}
.sync-badge .dot{width:6px;height:6px;border-radius:99px;background:var(--lime);animation:pulse 2.2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(182,242,61,.55)}55%{box-shadow:0 0 0 7px rgba(182,242,61,0)}}
.hidden{display:none!important}
.today-txt{font-family:"Space Mono",monospace;font-size:10px;color:#8aa3b8}
.wrap{max-width:1400px;margin:0 auto;padding:26px 22px 60px}
.page{display:none;animation:rise .35s cubic-bezier(.22,1,.36,1) both}
.page.active{display:block}
@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.kicker{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.22em;color:var(--cyan);margin-bottom:6px}
.page-head h1,.page-head h2{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:clamp(22px,3vw,32px);line-height:1.12}
.desc{color:#8aa3b8;max-width:640px;margin-top:8px;font-size:13.5px;line-height:1.6}
.card{background:rgba(14,35,61,.66);border:1px solid rgba(126,226,255,.14);border-radius:18px;padding:18px;box-shadow:0 18px 48px rgba(0,0,0,.28);backdrop-filter:blur(16px)}
.card h3{font-family:"Bricolage Grotesque",sans-serif;font-size:15px;margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin:22px 0}
.stat{position:relative;overflow:hidden}
.stat .lbl{font-size:11.5px;color:#8aa3b8}
.stat .val{font-family:"Space Mono",monospace;font-size:34px;font-weight:700;margin:6px 0 2px}
.stat .sub{font-size:11px;color:#5f7d93}
.v-cyan{color:var(--cyan)}.v-lime{color:var(--lime)}.v-sky{color:#7cc4ff}.v-pink{color:var(--pink)}
.grid-2{display:grid;grid-template-columns:1.4fr 1fr;gap:14px}
@media(max-width:900px){.grid-2{grid-template-columns:1fr}}
.trend{display:flex;align-items:flex-end;gap:8px;height:150px;padding-top:6px}
.tcol{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
.tcol .pct{font-family:"Space Mono",monospace;font-size:10px;color:#7cc4ff}
.tcol .bar{width:100%;max-width:34px;height:92px;background:rgba(126,226,255,.06);border-radius:8px;display:flex;align-items:flex-end;overflow:hidden}
.tcol .bar i{display:block;width:100%;border-radius:8px;background:linear-gradient(to top,rgba(63,140,255,.85),rgba(45,226,230,.9));animation:grow .8s cubic-bezier(.22,1,.36,1) both}
.tcol.now .bar i{background:linear-gradient(to top,#2de2e6,#b6f23d)}
.tcol .wd{font-family:"Space Mono",monospace;font-size:9.5px;color:#5f7d93}
.tcol.now .wd{color:var(--lime);font-weight:700}
@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.sess{margin-top:4px}
.sess-row{margin-bottom:11px}
.sess-row .top{display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px}
.sess-row .top b{font-family:"Space Mono",monospace;color:#8aa3b8;font-weight:400}
.sess-row .top b em{font-style:normal;color:var(--lime)}
.track{height:6px;border-radius:99px;background:rgba(126,226,255,.08);overflow:hidden}
.track i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--lime),var(--cyan));animation:growx .9s cubic-bezier(.22,1,.36,1) both}
@keyframes growx{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.empty{padding:26px 10px;text-align:center;color:#5f7d93;font-size:13px}
.grid-att{display:grid;grid-template-columns:290px 1fr;gap:18px;align-items:start}
@media(max-width:1000px){.grid-att{grid-template-columns:1fr}}
.inp{background:#06101f;border:1px solid rgba(126,226,255,.18);color:#d9f6ff;border-radius:11px;padding:9px 12px;font-size:13px;font-family:"DM Sans",sans-serif;width:100%}
.inp:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 3px rgba(45,226,230,.15)}
input[type="date"].inp::-webkit-calendar-picker-indicator,input[type="month"].inp::-webkit-calendar-picker-indicator{filter:invert(.8) sepia(1) saturate(4) hue-rotate(140deg);cursor:pointer}
.date-row{display:flex;gap:6px;margin-top:10px}
.sq-btn{width:38px;flex:none;border-radius:11px;border:1px solid rgba(126,226,255,.16);background:none;color:#9bb7cb;cursor:pointer;font-size:15px;transition:.18s}
.sq-btn:hover{border-color:var(--cyan);color:var(--cyan)}
.mini-link{background:none;border:none;color:var(--cyan);font-family:"Space Mono",monospace;font-size:10.5px;cursor:pointer;margin-top:8px;padding:0}
.cal-head{display:flex;justify-content:space-between;align-items:center;margin:16px 0 8px}
.cal-head p{font-family:"Space Mono",monospace;font-size:11px;color:#7cd7e0}
.cal-wk{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;font-family:"Space Mono",monospace;font-size:9px;color:#5f7d93;text-align:center;margin-bottom:3px}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cal-day{position:relative;height:30px;border:none;border-radius:8px;background:none;color:#a9c2d3;font-size:11.5px;cursor:pointer;transition:.15s}
.cal-day:hover{background:rgba(45,226,230,.16);color:var(--cyan)}
.cal-day.today{outline:1px solid var(--cyan);color:var(--cyan)}
.cal-day.chosen{background:var(--cyan);color:var(--navy);font-weight:700}
.cal-day .mk{position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:99px;background:var(--lime)}
.btn-row{display:flex;gap:10px;margin-top:12px}
.btn-row.right{justify-content:flex-end}
.btn{flex:1;border:none;border-radius:12px;padding:11px 8px;font-weight:700;font-size:13px;font-family:"DM Sans",sans-serif;cursor:pointer;transition:.18s}
.btn.lime{background:var(--lime);color:#152400}
.btn.cyan{background:var(--cyan);color:var(--navy)}
.btn.ghost{background:none;border:1px solid rgba(126,226,255,.2);color:#a9c2d3}
.btn.ghost:hover{background:rgba(126,226,255,.06);color:#fff}
.btn.lime:hover,.btn.cyan:hover{filter:brightness(1.1)}
.btn:active{transform:scale(.98)}
.sum-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center}
.sum-grid .n{font-family:"Space Mono",monospace;font-size:19px;font-weight:700}
.sum-grid .l{font-size:9.5px;color:#5f7d93}
.prog-top{display:flex;justify-content:space-between;font-size:11px;margin:14px 0 5px;color:#8aa3b8}
.prog-top b{font-family:"Space Mono",monospace;color:var(--cyan)}
.list-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.list-head h2{font-family:"Bricolage Grotesque",sans-serif;font-size:19px}
.search{max-width:230px}
.att-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.s-card{padding:14px;transition:border-color .2s,transform .2s}
.s-card:hover{border-color:rgba(45,226,230,.35)}
.s-card.filled{border-color:rgba(45,226,230,.3)}
.s-top{display:flex;justify-content:space-between;gap:10px;align-items:center}
.s-no{font-family:"Space Mono",monospace;font-size:9.5px;color:var(--cyan)}
.s-name{font-size:13px;font-weight:600;margin-top:2px;line-height:1.3}
.s-code{font-family:"Space Mono",monospace;font-size:22px;font-weight:700;color:#33506a}
.st-row{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:10px}
.st-btn{border:1px solid rgba(176,211,232,.18);background:none;color:#a9c2d3;border-radius:8px;padding:7px 2px;font-size:10px;font-weight:700;cursor:pointer;font-family:"DM Sans",sans-serif;transition:.16s}
.st-btn:hover{transform:translateY(-1px);border-color:rgba(45,226,230,.6);color:#fff}
.st-btn.sel[data-s="Hadir"]{background:rgba(182,242,61,.16);border-color:var(--lime);color:var(--lime)}
.st-btn.sel[data-s="Sakit"]{background:rgba(255,181,71,.15);border-color:var(--orange);color:var(--orange)}
.st-btn.sel[data-s="Izin"]{background:rgba(63,140,255,.16);border-color:var(--blue);color:#8bb8ff}
.st-btn.sel[data-s="Tanpa Keterangan"]{background:rgba(255,79,163,.14);border-color:var(--pink);color:var(--pink)}
.note{margin-top:8px;width:100%;background:rgba(6,16,31,.75);border:1px solid rgba(126,226,255,.1);border-radius:8px;padding:7px 10px;font-size:11px;color:#e9f8ff;font-family:"DM Sans",sans-serif}
.note:focus{outline:none;border-color:var(--cyan)}
.note::placeholder{color:#4c6a80}
.sticky-bar{position:sticky;bottom:14px;margin-top:18px;z-index:20}
.btn-submit{width:100%;border:none;border-radius:16px;padding:15px;background:var(--cyan);color:var(--navy);font-weight:800;font-size:15px;font-family:"DM Sans",sans-serif;cursor:pointer;box-shadow:0 0 35px rgba(45,226,230,.28);transition:.18s}
.btn-submit:hover{filter:brightness(1.1)}
.btn-submit:active{transform:scale(.99)}
.btn-submit:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.page-tools{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin:18px 0 14px}
.tool-group{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
.tool-group label{display:block;font-size:11px;color:#8aa3b8;margin-bottom:5px}
.tool-group .inp{width:auto}
.btn-sm{border:none;border-radius:11px;padding:10px 14px;font-weight:700;font-size:12.5px;cursor:pointer;font-family:"DM Sans",sans-serif;transition:.18s}
.btn-sm.cy{background:var(--cyan);color:var(--navy)}
.btn-sm.lm{background:var(--lime);color:#152400}
.btn-sm.gh{background:none;border:1px solid rgba(126,226,255,.2);color:#a9c2d3}
.btn-sm:hover{filter:brightness(1.12)}
.btn-sm.gh:hover{background:rgba(126,226,255,.06);color:#fff}
.table-wrap{overflow:auto;scrollbar-color:rgba(45,226,230,.7) #0a1b31}
.table-wrap::-webkit-scrollbar{height:8px;width:8px}
.table-wrap::-webkit-scrollbar-thumb{background:rgba(45,226,230,.7);border-radius:10px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#82a5bd;text-align:left;padding:13px 14px;border-bottom:1px solid rgba(126,226,255,.12)}
th.c,td.c{text-align:center}
td{padding:12px 14px;border-bottom:1px solid rgba(126,226,255,.05)}
tbody tr{transition:background .15s}
tbody tr:hover{background:rgba(45,226,230,.05)}
.mono{font-family:"Space Mono",monospace}
.c-h{color:var(--lime)}.c-s{color:var(--orange)}.c-i{color:#8bb8ff}.c-t{color:var(--pink)}.c-x{color:#33506a}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;padding:11px 16px;margin-bottom:12px}
.sticky-col{position:sticky;left:0;background:#0d2138;z-index:5;min-width:210px}
th.sticky-col{z-index:6;background:#0d2138}
.today-col{background:rgba(45,226,230,.07)}
.wkend{background:rgba(255,255,255,.02)}
.mini-track{display:inline-block;width:70px;height:5px;border-radius:99px;background:rgba(126,226,255,.08);overflow:hidden;vertical-align:middle;margin-right:7px}
.mini-track i{display:block;height:100%;background:var(--lime)}
.act-btn{border:1px solid rgba(126,226,255,.15);background:none;color:#a9c2d3;border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:12px;transition:.15s;margin-left:5px}
.act-btn:hover{border-color:var(--cyan);color:var(--cyan)}
.act-btn.danger:hover{border-color:var(--pink);color:var(--pink)}
.modal{position:fixed;inset:0;z-index:60;background:rgba(3,10,20,.7);backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px}
.modal-box{width:100%;max-width:420px;background:#0d2138;border:1px solid rgba(45,226,230,.28);border-radius:18px;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.5);animation:rise .25s both}
.modal-box h3{font-family:"Bricolage Grotesque",sans-serif;font-size:17px;margin-bottom:14px}
.modal-box label{display:block;font-size:11.5px;color:#8aa3b8;margin:10px 0 5px}
.err{color:var(--pink);background:rgba(255,79,163,.1);border:1px solid rgba(255,79,163,.3);border-radius:9px;padding:8px 11px;font-size:11.5px;margin-top:10px}
.bk-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;margin-top:20px}
@media(max-width:900px){.bk-grid{grid-template-columns:1fr}}
.bk-grid .card{margin-bottom:14px}
.url-row{display:flex;gap:8px;margin-top:8px}
.chk-row{display:flex;align-items:center;gap:10px;margin:6px 0}
.switch{position:relative;width:42px;height:23px;flex:none}
.switch input{opacity:0;width:0;height:0}
.slider{position:absolute;inset:0;border-radius:99px;background:#22405c;cursor:pointer;transition:.2s}
.slider:before{content:"";position:absolute;width:17px;height:17px;left:3px;top:3px;border-radius:99px;background:#8aa3b8;transition:.2s}
.switch input:checked + .slider{background:var(--lime)}
.switch input:checked + .slider:before{transform:translateX(19px);background:#152400}
.info-line{font-family:"Space Mono",monospace;font-size:10.5px;color:#8aa3b8;margin-top:10px;line-height:1.7}
.info-line b{color:var(--lime);font-weight:400}
.steps{counter-reset:st;list-style:none;padding:0}
.steps li{counter-increment:st;display:flex;gap:11px;margin-bottom:13px}
.steps li:before{content:counter(st);flex:none;width:24px;height:24px;border-radius:8px;background:rgba(45,226,230,.12);color:var(--cyan);font-family:"Space Mono",monospace;font-size:11px;font-weight:700;display:grid;place-items:center}
.steps b{font-size:13px}
.steps p{font-size:11.5px;color:#8aa3b8;line-height:1.55;margin-top:2px}
#toast-host{position:fixed;bottom:20px;right:20px;z-index:80;display:flex;flex-direction:column;gap:9px;max-width:360px}
.toast{background:#0d2138;border:1px solid rgba(45,226,230,.3);border-left:3px solid var(--cyan);border-radius:12px;padding:12px 15px;font-size:12.5px;box-shadow:0 18px 45px rgba(0,0,0,.45);animation:toastin .3s cubic-bezier(.22,1,.36,1) both;cursor:pointer}
.toast.ok{border-left-color:var(--lime)}
.toast.err{border-left-color:var(--pink)}
@keyframes toastin{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
footer{padding:0 22px 26px;max-width:1400px;margin:0 auto}
footer p{font-family:"Space Mono",monospace;font-size:9.5px;color:#3d5a70}
</style>
</head>
<body>
<div class="bg-grid"></div>
<header class="topbar">
  <div class="brand">
    <div class="brand-mark">8C</div>
    <div>
      <p class="brand-name">Presensia 8C</p>
      <p class="brand-sub">SMPN 61 · KELAS 8C</p>
    </div>
  </div>
  <nav id="nav">
    <button class="nav-btn active" data-pg="dashboard">Dashboard</button>
    <button class="nav-btn" data-pg="attendance">Absen</button>
    <button class="nav-btn" data-pg="monthly">Bulanan</button>
    <button class="nav-btn" data-pg="daily">Harian</button>
    <button class="nav-btn" data-pg="students">Siswa</button>
    <button class="nav-btn" data-pg="backup">Backup</button>
  </nav>
  <div class="top-right">
    <span id="sync-badge" class="sync-badge hidden"><i class="dot"></i> AUTO-SYNC</span>
    <span id="today-txt" class="today-txt"></span>
  </div>
</header>
<main class="wrap">

  <section id="pg-dashboard" class="page active">
    <div class="page-head">
      <p class="kicker">RINGKASAN KELAS</p>
      <h1>Halo, Wali Kelas 8C</h1>
      <p class="desc" id="dash-desc"></p>
    </div>
    <div class="stats" id="dash-stats"></div>
    <div class="grid-2">
      <div class="card"><h3>Tren Kehadiran — 7 Hari Terakhir</h3><div class="trend" id="dash-trend"></div></div>
      <div class="card"><h3>Sesi Absen Terbaru</h3><div class="sess" id="dash-sessions"></div></div>
    </div>
  </section>

  <section id="pg-attendance" class="page">
    <div class="page-head">
      <p class="kicker">INPUT HARIAN</p>
      <h1>Absen Kelas</h1>
      <p class="desc">Tandai kehadiran seluruh siswa. Ganti tanggal untuk melihat atau memperbaiki absensi yang sudah tersimpan.</p>
    </div>
    <div class="grid-att" style="margin-top:20px">
      <div>
        <div class="card">
          <h3>Tanggal Absensi</h3>
          <div class="date-row">
            <button class="sq-btn" id="btn-prev-day" title="Hari sebelumnya">&#8249;</button>
            <input type="date" class="inp" id="att-date">
            <button class="sq-btn" id="btn-next-day" title="Hari berikutnya">&#8250;</button>
          </div>
          <button class="mini-link hidden" id="btn-today">&#8617; kembali ke hari ini</button>
          <div class="cal-head">
            <p id="cal-label"></p>
            <span>
              <button class="sq-btn" id="btn-prev-mon" style="width:26px;height:24px;font-size:13px">&#8249;</button>
              <button class="sq-btn" id="btn-next-mon" style="width:26px;height:24px;font-size:13px">&#8250;</button>
            </span>
          </div>
          <div class="cal-wk"><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span></div>
          <div class="cal-grid" id="cal-grid"></div>
          <p style="font-size:10px;color:#5f7d93;margin-top:10px"><span style="color:var(--lime)">&#9679;</span> titik hijau = sudah ada absensi</p>
        </div>
        <div class="btn-row">
          <button class="btn lime" id="btn-all">&#10003;&#10003; Semua Hadir</button>
          <button class="btn ghost" id="btn-clear">Kosongkan</button>
        </div>
        <div class="card" style="margin-top:12px">
          <div class="sum-grid" id="sum-grid"></div>
          <div class="prog-top"><span>Terisi</span><b id="prog-txt">0 / 0</b></div>
          <div class="track"><i id="prog-bar" style="width:0%"></i></div>
        </div>
      </div>
      <div>
        <div class="list-head">
          <div>
            <p class="kicker" style="margin-bottom:2px">DAFTAR SISWA</p>
            <h2 id="att-title"></h2>
          </div>
          <input class="inp search" id="att-search" placeholder="Cari nama / NIS...">
        </div>
        <div class="att-grid" id="student-list"></div>
        <div class="sticky-bar"><button class="btn-submit" id="btn-submit">Kirim Absensi</button></div>
      </div>
    </div>
  </section>

  <section id="pg-monthly" class="page">
    <div class="page-head">
      <p class="kicker">REKAP</p>
      <h1>Rekap Kehadiran Bulanan</h1>
    </div>
    <div class="page-tools">
      <div class="tool-group">
        <div><label for="mo-filter">Pilih Bulan</label><input type="month" class="inp" id="mo-filter"></div>
      </div>
      <div class="tool-group">
        <button class="btn-sm gh" id="mo-csv">&#11015; Ekspor CSV</button>
        <button class="btn-sm cy" id="mo-print">&#128424; Cetak</button>
      </div>
    </div>
    <div class="card" style="padding:6px"><div class="table-wrap" id="monthly-table"></div></div>
  </section>

  <section id="pg-daily" class="page">
    <div class="page-head">
      <p class="kicker">REKAP</p>
      <h1>Rekap Harian</h1>
    </div>
    <div class="page-tools">
      <div class="tool-group">
        <div><label for="da-filter">Pilih Bulan</label><input type="month" class="inp" id="da-filter"></div>
      </div>
      <div class="tool-group">
        <button class="btn-sm gh" id="da-csv">&#11015; Ekspor CSV</button>
        <button class="btn-sm cy" id="da-print">&#128424; Cetak</button>
      </div>
    </div>
    <div class="card legend">
      <span class="c-h">&#9632; H · Hadir</span><span class="c-s">&#9632; S · Sakit</span>
      <span class="c-i">&#9632; I · Izin</span><span class="c-t">&#9632; T · Tanpa Keterangan</span>
    </div>
    <div class="card" style="padding:6px"><div class="table-wrap" id="daily-table"></div></div>
  </section>

  <section id="pg-students" class="page">
    <div class="page-head">
      <p class="kicker">MANAJEMEN DATA</p>
      <h1>Data Siswa</h1>
      <p class="desc" id="stu-desc"></p>
    </div>
    <div class="page-tools">
      <input class="inp search" id="stu-search" placeholder="Cari nama / NIS...">
      <div class="tool-group">
        <button class="btn-sm gh" id="stu-template">&#11015; Template CSV</button>
        <button class="btn-sm gh" id="stu-import">&#128228; Impor CSV</button>
        <button class="btn-sm gh" id="stu-export">&#11015; Ekspor</button>
        <button class="btn-sm lm" id="stu-add">&#10010; Tambah Siswa</button>
      </div>
    </div>
    <input type="file" id="csv-file" accept=".csv,.txt" class="hidden">
    <div class="card" style="padding:6px"><div class="table-wrap" id="students-table"></div></div>
  </section>

  <section id="pg-backup" class="page">
    <div class="page-head">
      <p class="kicker">SINKRONISASI</p>
      <h1>Backup &amp; Auto-Sync</h1>
      <p class="desc">Kirim data ke Google Spreadsheet lewat Apps Script, aktifkan Auto-Sync agar aplikasi ter-update otomatis setiap ada penambahan di Spreadsheet, atau pulihkan data kapan saja.</p>
    </div>
    <div class="bk-grid">
      <div>
        <div class="card">
          <h3>&#128279; Koneksi Web App</h3>
          <label style="font-size:11.5px;color:#8aa3b8">URL Web App Apps Script (berakhiran /exec)</label>
          <input class="inp mono" id="bk-url" placeholder="https://script.google.com/macros/s/.../exec" style="margin-top:6px;font-size:11px">
          <div class="btn-row">
            <button class="btn cyan" id="bk-save-url">Simpan URL</button>
          </div>
          <div class="btn-row">
            <button class="btn lime" id="bk-send">&#10148; Kirim Backup</button>
            <button class="btn ghost" id="bk-pull">&#8635; Pulihkan</button>
          </div>
          <p class="info-line">Backup terakhir: <b id="bk-last-backup">belum pernah</b></p>
        </div>
        <div class="card">
          <h3>&#9889; Auto-Sync dari Spreadsheet</h3>
          <div class="chk-row">
            <label class="switch"><input type="checkbox" id="bk-autosync"><span class="slider"></span></label>
            <div style="font-size:12.5px">Periksa Spreadsheet otomatis setiap
              <select class="inp" id="bk-interval" style="width:auto;display:inline-block;padding:5px 8px;font-size:12px">
                <option value="15">15 dtk</option><option value="30" selected>30 dtk</option>
                <option value="60">1 mnt</option><option value="120">2 mnt</option>
              </select>
            </div>
          </div>
          <p style="font-size:11.5px;color:#8aa3b8;line-height:1.6">Saat aktif, aplikasi menarik data terbaru dari Sheets dan menggabungkannya otomatis — siswa atau absensi yang ditambahkan dari Sheets langsung muncul di sini.</p>
          <div class="btn-row"><button class="btn ghost" id="bk-sync-now">&#8635; Sinkronkan Sekarang</button></div>
          <p class="info-line">Sinkron terakhir: <b id="bk-last-sync">belum pernah</b></p>
        </div>
      </div>
      <div>
        <div class="card">
          <h3>&#128190; Cadangan Lokal (JSON)</h3>
          <p style="font-size:11.5px;color:#8aa3b8;line-height:1.6">Salinan manual tanpa internet — unduh atau muat berkas JSON.</p>
          <div class="btn-row">
            <button class="btn ghost" id="bk-json-out">&#11015; Unduh JSON</button>
            <button class="btn ghost" id="bk-json-in">&#128228; Muat JSON</button>
          </div>
          <input type="file" id="json-file" accept=".json" class="hidden">
        </div>
        <div class="card">
          <h3>&#128221; Langkah Pemasangan</h3>
          <ol class="steps">
            <li><div><b>Buat Google Spreadsheet</b><p>Buka sheets.new, beri nama mis. "Backup Absensi 8C".</p></div></li>
            <li><div><b>Buka Apps Script</b><p>Ekstensi &#8594; Apps Script. Tempel kode Code.gs dari aplikasi utama (halaman Backup &amp; Sync).</p></div></li>
            <li><div><b>Deploy Web App</b><p>Deploy &#8594; New deployment &#8594; Web app. Execute as: Me, Who has access: Anyone.</p></div></li>
            <li><div><b>Tempel URL /exec</b><p>Simpan URL di atas, kirim backup pertama, lalu aktifkan Auto-Sync.</p></div></li>
          </ol>
        </div>
      </div>
    </div>
  </section>

</main>
<footer><p>PRESENSIA 8C · SATU BERKAS · data tersimpan otomatis di perangkat ini (localStorage)</p></footer>

<div id="modal" class="modal hidden">
  <div class="modal-box">
    <h3 id="m-title">Tambah Siswa</h3>
    <label for="m-nis">NIS / Nomor Induk</label>
    <input class="inp mono" id="m-nis" placeholder="cth: 8C39">
    <label for="m-name">Nama Lengkap</label>
    <input class="inp" id="m-name" placeholder="NAMA SISWA" style="text-transform:uppercase">
    <p class="err hidden" id="m-err"></p>
    <div class="btn-row right">
      <button class="btn ghost" id="m-cancel" style="flex:none;padding:11px 18px">Batal</button>
      <button class="btn lime" id="m-save" style="flex:none;padding:11px 20px">Simpan</button>
    </div>
  </div>
</div>
<div id="toast-host"></div>
`;
