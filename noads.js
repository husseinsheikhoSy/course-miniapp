/* noads.js — shared "No Ads" subscription layer for index.html, details.html and dl.html
   • Status comes from Supabase RPC  miniapp_noads_status(p_chat_id)  (see supabase_noads.sql).
     The bot writes the subscription there after every Stars payment / monthly renewal.
   • NoAds.active        → true while the user's subscription is valid
   • NoAds.check(sb)     → Promise<boolean>  (refreshes the status)
   • NoAds.ready(sb)     → Promise<boolean>  (resolves after the first check, max ~3 s)
   • NoAds.onChange(fn)  → fn(active) is called when the status changes (e.g. after paying)
   • NoAds.mount(el, o)  → renders the promo / status card into `el`
   • NoAds.open()        → opens the subscription screen in the bot
   Requires i18n.js (window.tr) — falls back to English if it is missing. */
(function () {
  'use strict';

  var BOT = 'UdemySybot';
  var SUB_URL = 'https://t.me/' + BOT + '?start=noads';
  var PAID_URL = 'https://t.me/+zJSglPi-r7czMzAy';
  var PRICE = 300;
  var CACHE_KEY = 'noads_status_v1';
  var CACHE_MS = 120000;

  var tg = (window.Telegram && window.Telegram.WebApp) || null;
  var user = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || null;
  var state = { active: false, expires: null, checked: false };
  var listeners = [];
  var mounts = [];
  var readyPromise = null;
  var lastSb = null;

  function T(k, v) {
    if (typeof window.tr === 'function') return window.tr(k, v);
    return v ? k.replace(/\{(\w+)\}/g, function (m, n) { return v[n] != null ? v[n] : m; }) : k;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  function openTg(url) {
    try {
      if (tg && typeof tg.openTelegramLink === 'function') { tg.openTelegramLink(url); return; }
    } catch (e) {}
    window.open(url, '_blank', 'noopener');
  }

  function fmtDate(iso) {
    try { var d = new Date(iso); if (isNaN(d)) return ''; return d.toISOString().slice(0, 10); } catch (e) { return ''; }
  }

  function setState(active, expires) {
    var changed = state.active !== !!active;
    state.active = !!active; state.expires = expires || null; state.checked = true;
    api.active = state.active; api.expires = state.expires;
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ id: user && user.id, a: state.active, e: state.expires, t: Date.now() })); } catch (e) {}
    rerender();
    if (changed) listeners.slice().forEach(function (fn) { try { fn(state.active); } catch (e) {} });
  }

  function readCache() {
    try {
      var c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (c && user && c.id === user.id && Date.now() - c.t < CACHE_MS) return c;
    } catch (e) {}
    return null;
  }

  function check(sb, force) {
    if (sb) lastSb = sb;
    sb = sb || lastSb;
    if (!user || !user.id || !sb) { state.checked = true; return Promise.resolve(false); }
    if (!force) {
      var c = readCache();
      if (c) { setState(c.a, c.e); return Promise.resolve(state.active); }
    }
    return Promise.resolve(sb.rpc('miniapp_noads_status', { p_chat_id: user.id }))
      .then(function (r) {
        var d = r && r.data;
        if (d && d.ok) setState(!!d.active, d.expires_at);
        else state.checked = true;
        return state.active;
      })
      .catch(function () { state.checked = true; return state.active; });
  }

  function ready(sb) {
    if (!readyPromise) {
      readyPromise = Promise.race([
        check(sb),
        new Promise(function (res) { setTimeout(function () { res(state.active); }, 3000); })
      ]);
    }
    return readyPromise;
  }

  /* ── UI ── */
  var CSS = '' +
    '.noads-card{display:flex;align-items:center;gap:12px;margin:12px 0;padding:13px 14px;border-radius:18px;' +
    'background:linear-gradient(135deg,rgba(217,83,104,.16),rgba(216,173,103,.12));border:1px solid rgba(217,83,104,.35);color:var(--text,#f8f5f6)}' +
    '.noads-card.on{background:linear-gradient(135deg,rgba(86,197,150,.16),rgba(86,197,150,.06));border-color:rgba(86,197,150,.4)}' +
    '.noads-card .na-ico{flex:none;width:42px;height:42px;border-radius:13px;display:grid;place-items:center;font-size:21px;background:rgba(255,255,255,.07)}' +
    '.noads-card .na-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}' +
    '.noads-card .na-body b{font-size:14.5px;font-weight:800;letter-spacing:-.1px}' +
    '.noads-card .na-body span{font-size:11.5px;line-height:1.5;color:var(--muted,#aaa3a7)}' +
    '.noads-card .na-btn{flex:none;border:0;cursor:pointer;font:inherit;font-size:12px;font-weight:800;padding:10px 13px;border-radius:12px;color:#fff;' +
    'background:var(--danger,#d95368);-webkit-tap-highlight-color:transparent}' +
    '.noads-card.on .na-btn{background:var(--success,#56c596);color:#06281b}' +
    '.noads-card .na-btn:active{transform:scale(.97)}' +
    '.noads-card:not(.compact){flex-wrap:wrap}' +
    '.noads-card:not(.compact) .na-body{flex:1 1 0}' +
    '.noads-card:not(.compact) .na-btn{flex:1 1 100%;padding:12px 14px;font-size:13px}' +
    '.noads-card.compact{padding:10px 12px;margin:8px 0}' +
    '.noads-card.compact .na-body span{display:none}' +
    '.na-skip{border:1px solid rgba(217,83,104,.5);background:rgba(217,83,104,.12);color:var(--rose,#d96a88);font:inherit;font-size:11px;font-weight:800;' +
    'padding:4px 9px;border-radius:999px;cursor:pointer}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  function cardHTML(compact) {
    if (state.active) {
      var d = fmtDate(state.expires);
      return '<div class="na-ico">✅</div>' +
        '<div class="na-body"><b>' + esc(T('No Ads is active')) + '</b>' +
        '<span>' + esc(d ? T('Active until {d}', { d: d }) : T('Thank you for supporting us 💛')) + '</span></div>' +
        '<button class="na-btn" data-na="paid" type="button">' + esc(T('Paid channel')) + '</button>';
    }
    return '<div class="na-ico">🚫</div>' +
      '<div class="na-body"><b>' + esc(T('No Ads')) + '</b>' +
      '<span>' + esc(T('Monthly membership: no ads, direct access to every course, plus FREE access to the paid channel — free books & courses, a huge library of programming books in every field and very important courses.')) + '</span></div>' +
      '<button class="na-btn" data-na="sub" type="button">' + esc(T('Get No Ads · {n}⭐ / month', { n: PRICE })) + '</button>';
  }

  function paint(m) {
    m.el.className = 'noads-card' + (state.active ? ' on' : '') + (m.compact ? ' compact' : '');
    m.el.innerHTML = cardHTML(m.compact);
  }
  function rerender() { mounts.forEach(paint); }

  function mount(el, opts) {
    if (!el) return;
    var m = { el: el, compact: !!(opts && opts.compact) };
    mounts.push(m);
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-na]');
      if (!b) return;
      if (b.getAttribute('data-na') === 'paid') openTg(PAID_URL); else openTg(SUB_URL);
    });
    paint(m);
  }

  document.addEventListener('langchange', rerender);
  // Coming back from the payment sheet → refresh the status without cache.
  function refreshSoon() { if (lastSb && !state.active) check(null, true); }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshSoon(); });
  try { if (tg && tg.onEvent) tg.onEvent('activated', refreshSoon); } catch (e) {}

  var api = {
    active: false, expires: null, PRICE: PRICE,
    check: check, ready: ready, mount: mount,
    open: function () { openTg(SUB_URL); },
    openPaidChannel: function () { openTg(PAID_URL); },
    onChange: function (fn) { listeners.push(fn); }
  };
  window.NoAds = api;
})();
