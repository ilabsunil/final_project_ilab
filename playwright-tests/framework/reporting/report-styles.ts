// Styling for the final execution + test-gap report (PNC theme).
export const REPORT_CSS = `
:root{--orange:#f58025;--orange-d:#d96a12;--ink:#0f1b2d;--ink2:#33475b;--muted:#6b7c93;--line:#e6ebf1;--bg:#f4f6fa;--card:#fff;
--green:#1f9d55;--green-s:#e6f7ee;--amber:#c9820a;--amber-s:#fdf3e0;--red:#d64545;--red-s:#fdecec;--blue:#2563eb;--blue-s:#e8f0ff;
--shadow:0 10px 30px rgba(15,27,45,.08);--shadow-s:0 2px 10px rgba(15,27,45,.06)}
*{box-sizing:border-box}body{margin:0;font-family:"Aptos","Segoe UI",system-ui,sans-serif;background:linear-gradient(135deg,#e8f4ff 0%,#f9fcff 42%,#fff7ec 100%);color:var(--ink);line-height:1.55}
.wrap{max-width:1200px;margin:0 auto;padding:32px 24px 64px}
.hero{background:linear-gradient(120deg,#0e2d4a 0%,#176789 54%,#1c9a83 100%);color:#fff;border-radius:24px;padding:42px 46px;position:relative;overflow:hidden;box-shadow:0 22px 46px rgba(16,40,66,.22)}
.hero::after{content:"";position:absolute;right:-60px;top:-60px;width:260px;height:260px;background:radial-gradient(circle,rgba(245,128,37,.35),transparent 70%)}
.brand{display:flex;align-items:center;gap:15px;margin-bottom:24px;position:relative;z-index:1}
.logo{width:50px;height:50px;border-radius:14px;background:#ffad62;color:#132b44;display:grid;place-items:center;font-weight:900;letter-spacing:.04em;box-shadow:0 8px 18px rgba(0,0,0,.18)}
.brand small{display:block;opacity:.75;font-size:12px;letter-spacing:.14em;text-transform:uppercase}.brand strong{font-size:19px}
.hero h1{position:relative;z-index:1;margin:8px 0 12px;font-size:38px;line-height:1.1;letter-spacing:-.035em;text-shadow:0 2px 14px rgba(0,0,0,.14)}.hero p{position:relative;z-index:1;margin:0;opacity:.94;max-width:720px;font-size:15px}
.meta{display:flex;flex-wrap:wrap;gap:22px;margin-top:22px;font-size:13px}.meta span{display:block;opacity:.6;font-size:11px;text-transform:uppercase;letter-spacing:.1em}
.badge{position:absolute;right:34px;top:34px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:8px 16px;font-size:13px;font-weight:600}
.badge.ok{color:#c7f5da}.badge.bad{color:#ffd0d0}
.grid{display:grid;gap:18px;margin-top:26px}.k6{grid-template-columns:repeat(6,1fr)}.two{grid-template-columns:1fr 1fr}
@media(max-width:1000px){.k6{grid-template-columns:repeat(3,1fr)}.two{grid-template-columns:1fr}}
.card{background:rgba(255,255,255,.94);border:1px solid rgba(209,222,235,.95);border-radius:16px;box-shadow:var(--shadow-s);backdrop-filter:blur(10px)}
.kpi{padding:18px 20px}.kpi .l{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.kpi .v{font-size:30px;font-weight:800;margin:6px 0 2px}.kpi .s{font-size:12px;color:var(--ink2)}
.g .v{color:var(--green)}.a .v{color:var(--amber)}.r .v{color:var(--red)}.b .v{color:var(--blue)}.i .v{color:var(--ink)}
.panel{padding:24px 26px}.panel h2{margin:0 0 4px;font-size:17px}.hint{color:var(--muted);font-size:13px;margin:0 0 18px}
.donuts{display:flex;gap:34px;flex-wrap:wrap;align-items:center;justify-content:space-around}
.donut{--v:0;--c:var(--green);width:150px;height:150px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--c) calc(var(--v)*1%),var(--line) 0)}
.donut i{width:116px;height:116px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:inset 0 0 0 1px #edf2f7}
.donut b{font-size:30px;font-weight:850;display:block;line-height:1.08}.donut span{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;line-height:1.2}
.legend{display:flex;flex-direction:column;gap:10px;min-width:170px}.legend .row{display:flex;align-items:center;gap:10px;font-size:14px}
.legend i{width:12px;height:12px;border-radius:3px}.legend b{margin-left:auto}
table{width:100%;border-collapse:collapse;font-size:14px}
thead th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);padding:12px 14px;border-bottom:2px solid var(--line)}
tbody td{padding:12px 14px;border-bottom:1px solid var(--line);vertical-align:middle}tbody tr:hover{background:#fafcff}
.tc{font-weight:700}.tc small{display:block;font-weight:400;color:var(--muted);font-size:12px}
.pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;font-size:12px;font-weight:700}
.pill.pass{background:var(--green-s);color:var(--green)}.pill.fail{background:var(--red-s);color:var(--red)}
.pill.skip{background:var(--amber-s);color:var(--amber)}.pill.flaky{background:var(--blue-s);color:var(--blue)}
.pill.cov{background:var(--green-s);color:var(--green)}.pill.gap{background:var(--red-s);color:var(--red)}.pill.part{background:var(--amber-s);color:var(--amber)}
.mini{display:flex;align-items:center;gap:8px}.mini .t{flex:1;height:7px;background:var(--line);border-radius:999px;overflow:hidden;min-width:70px}
.mini .f{height:100%;border-radius:999px}.mini b{font-size:12px;min-width:38px;text-align:right}
.hi{background:var(--green)}.md{background:var(--amber)}.lo{background:var(--red)}
.tag{display:inline-block;background:var(--blue-s);color:var(--blue);border-radius:6px;padding:2px 8px;font-size:12px;font-weight:600}
.risk{display:inline-block;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;text-transform:uppercase}
.risk.high{background:var(--red-s);color:var(--red)}.risk.medium{background:var(--amber-s);color:var(--amber)}.risk.low{background:var(--green-s);color:var(--green)}
.sub td:first-child{padding-left:38px;color:var(--ink2)}.fn td:first-child{padding-left:62px;color:var(--muted);font-size:13px}
.sec{margin:34px 0 8px;font-size:20px;display:flex;align-items:center;gap:10px}.sec .rule{flex:1;height:1px;background:var(--line)}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{background:var(--red-s);color:var(--red);border-radius:8px;padding:6px 11px;font-size:13px;font-weight:600}
.chip small{display:block;font-weight:400;color:#a45;font-size:11px}.chip.ok{background:var(--green-s);color:var(--green)}
.err{font-family:Consolas,monospace;font-size:12px;color:var(--red);background:var(--red-s);padding:8px 10px;border-radius:8px;white-space:pre-wrap;max-width:560px}
.note{background:var(--blue-s);border:1px solid #c7d7ff;color:#1e3a8a;border-radius:12px;padding:14px 18px;font-size:13px;margin-top:22px}
.foot{margin-top:30px;text-align:center;color:var(--muted);font-size:12px}
`;
