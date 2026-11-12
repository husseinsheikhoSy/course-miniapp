/* theme.js — Night / Day mode (pure black & white) shared by index.html, details.html and dl.html
   • Load it in <head> right after telegram-web-app.js so the theme is applied before the first paint.
   • First visit follows Telegram's colour scheme; after the user taps the toggle the choice is remembered.
   • window.AppTheme.get() / .set('dark'|'light') / .toggle() / .syncTelegram() */
(function () {
  'use strict';

  var KEY = 'app_theme_v1';
  var tg = (window.Telegram && window.Telegram.WebApp) || null;
  var root = document.documentElement;

  var CSS = '' +
    'html[data-theme="dark"]{color-scheme:dark;' +
      '--bg:#000;--surface:#0a0a0a;--surface-2:#141414;--surface-3:#1e1e1e;' +
      '--text:#fff;--muted:#a6a6a6;--faint:#757575;--border:rgba(255,255,255,.14);' +
      '--wine-bright:#fff;--wine:#d2d2d2;--wine-soft:rgba(255,255,255,.08);--rose:#fff;' +
      '--gold:#e4e4e4;--gold-soft:rgba(255,255,255,.08);--tint:#e9e9e9;--deep:#161616;' +
      '--on-accent:#000;--on-rgb:0,0,0;--fg:255,255,255;--sh:0,0,0;--bar:10,10,10;' +
      '--ac:255,255,255;--ac-d:255,255,255;--ac-r:255,255,255;--ac-g:255,255,255;' +
      '--success:#56c596;--danger:#ff5d73;--warn:#e0902f;' +
      '--shadow:0 24px 70px rgba(0,0,0,.6);--shadow-wine:0 10px 26px rgba(255,255,255,.07)}' +
    'html[data-theme="light"]{color-scheme:light;' +
      '--bg:#ededed;--surface:#fff;--surface-2:#f3f3f3;--surface-3:#e6e6e6;' +
      '--text:#000;--muted:#555;--faint:#8c8c8c;--border:rgba(0,0,0,.14);' +
      '--wine-bright:#000;--wine:#2a2a2a;--wine-soft:rgba(0,0,0,.06);--rose:#000;' +
      '--gold:#1c1c1c;--gold-soft:rgba(0,0,0,.06);--tint:#333;--deep:#e2e2e2;' +
      '--on-accent:#fff;--on-rgb:255,255,255;--fg:0,0,0;--sh:0,0,0;--bar:255,255,255;' +
      '--ac:0,0,0;--ac-d:0,0,0;--ac-r:0,0,0;--ac-g:0,0,0;' +
      '--success:#14865a;--danger:#d62f48;--warn:#b86a10;' +
      '--shadow:0 18px 50px rgba(0,0,0,.14);--shadow-wine:0 10px 26px rgba(0,0,0,.18)}' +

    /* plain black / white surfaces instead of the old wine gradients */
    'html[data-theme] body{background:var(--bg)}' +
    'html[data-theme="dark"] .top-bar{background:#000}' +
    'html[data-theme="light"] .top-bar{background:#fff}' +
    'html[data-theme] .top-bar{border-bottom:1px solid var(--border)}' +
    'html[data-theme] .top-bar::after{background:linear-gradient(90deg,transparent,var(--text),transparent);opacity:.35}' +
    'html[data-theme] .avatar{background:var(--surface-3);color:var(--text);border-color:var(--border)}' +
    'html[data-theme] .toast{background:var(--text);color:var(--bg);border-color:transparent}' +
    'html[data-theme] .skel-line,html[data-theme] .skel-thumb{background:linear-gradient(90deg,var(--surface-2) 25%,var(--surface-3) 50%,var(--surface-2) 75%);background-size:200% 100%}' +
    'html[data-theme="light"] .ad-btn[data-state="loading"]{background:var(--surface-3);color:var(--text)}' +
    'html[data-theme="dark"] .ad-btn[data-state="loading"]{background:var(--surface-3)}' +

    /* elements that sit on an accent (white in night mode / black in day mode) background */
    'html[data-theme] .ad-btn:not([data-state="locked"]):not([data-state="done"]):not([data-state="loading"]):not([data-state="failed"]) .ad-idx{background:rgba(var(--on-rgb),.14)}' +
    'html[data-theme] .ad-btn:not([data-state="locked"]):not([data-state="done"]):not([data-state="loading"]):not([data-state="failed"]) .ad-sub{color:rgba(var(--on-rgb),.7)}' +
    'html[data-theme] .ad-btn[data-state="failed"]{color:#fff}' +
    'html[data-theme] .ad-btn[data-state="done"] .ad-lbl{color:var(--text)}' +

    /* the toggle itself */
    '.theme-btn{width:40px;height:40px;flex:0 0 40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;' +
      'border:1px solid var(--border);background:rgba(var(--fg),.07);color:var(--text);cursor:pointer;-webkit-tap-highlight-color:transparent;' +
      'transition:background .2s,transform .12s}' +
    '.theme-btn:active{transform:scale(.92)}' +
    '.theme-btn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}' +
    '.theme-btn .i-sun{display:none}' +
    'html[data-theme="dark"] .theme-btn .i-sun{display:block}' +
    'html[data-theme="dark"] .theme-btn .i-moon{display:none}';

  var BTN_HTML =
    '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z"/></svg>' +
    '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  function stored() { try { var s = localStorage.getItem(KEY); return (s === 'light' || s === 'dark') ? s : null; } catch (e) { return null; } }
  function initial() {
    var s = stored(); if (s) return s;
    if (tg && tg.colorScheme) return tg.colorScheme === 'light' ? 'light' : 'dark';
    try { if (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) return 'light'; } catch (e) {}
    return 'dark';
  }

  var st = document.createElement('style'); st.id = 'theme-css'; st.textContent = CSS;
  (document.head || root).appendChild(st);

  function syncTelegram() {
    var dark = root.getAttribute('data-theme') !== 'light';
    var bg = dark ? '#000000' : '#ffffff';
    try {
      if (tg) {
        if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor(bg);
        if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor(bg);
        if (typeof tg.setBottomBarColor === 'function') tg.setBottomBarColor(bg);
      }
    } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', bg);
  }

  function label(t) { return t === 'dark' ? 'Switch to day mode' : 'Switch to night mode'; }
  function paintBtns() {
    var t = root.getAttribute('data-theme');
    [].forEach.call(document.querySelectorAll('.theme-btn'), function (b) { b.setAttribute('aria-label', label(t)); b.title = label(t); });
  }

  function set(t, persist) {
    t = t === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    if (persist !== false) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    syncTelegram(); paintBtns();
    try { document.dispatchEvent(new CustomEvent('themechange', { detail: t })); } catch (e) {}
  }

  // applied immediately (before first paint)
  root.setAttribute('data-theme', initial());

  function mountButton() {
    if (document.querySelector('.theme-btn')) return;
    var bar = document.querySelector('.top-bar');
    if (!bar) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'theme-btn'; b.innerHTML = BTN_HTML;
    b.addEventListener('click', function () { api.toggle(); try { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } catch (e) {} });
    bar.appendChild(b);
    paintBtns();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountButton); else mountButton();

  // follow Telegram's own switch while the user hasn't chosen manually
  try { if (tg && tg.onEvent) tg.onEvent('themeChanged', function () { if (!stored()) set(tg.colorScheme === 'light' ? 'light' : 'dark', false); }); } catch (e) {}

  var api = {
    get: function () { return root.getAttribute('data-theme'); },
    set: function (t) { set(t, true); },
    toggle: function () { set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true); },
    syncTelegram: syncTelegram
  };
  window.AppTheme = api;
})();
