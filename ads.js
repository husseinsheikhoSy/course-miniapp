/* ads.js — one entry point for every ad in the Mini App.
   Order:  1) Adsgram   →   2) tads.me (only when Adsgram has no ad / fails to load / the SDK is missing)

   AdManager.show({ adsgram: 'int-46421', tads: 9579, strict: false })
     → resolves { source: 'adsgram' | 'tads' }  when the ad was watched
     → rejects  { reason: 'closed' }  the user closed the Adsgram ad early (tads is NOT tried — they saw an ad)
                { reason: 'nofill' }  neither network had an ad
                { reason: 'timeout' } strict mode only: tads ad never reported completion
                { reason: 'busy' }    another ad is already on screen

   strict: true  → the promise resolves ONLY when the network confirms the ad was watched to the end
                   (Adsgram show() resolution / tads onShowReward). Use it for anything that pays points.
   strict: false → for tads, if the overlay opened but no reward callback arrives, the ad is treated as
                   watched after SOFT_VIEW_MS, so an unlock step can never get stuck behind a widget
                   that has no reward event configured.

   Widget map used by this app (tads.me — all FULLSCREEN BANNER):
     9579   opening ad when the bot opens  +  "Ad 1" button on the details page
     9966   "Ad 2" button on the details page
     10306  extra rewarded ads (earn points tab)
*/
(function () {
  'use strict';

  var TADS_WAIT_MS = 5000;      // how long to wait for https://w.tads.me/widget.js to be ready
  var SOFT_VIEW_MS = 7000;      // non-strict: minimum on-screen time before a reward-less tads ad counts
  var STRICT_TIMEOUT_MS = 120000;
  var DEBUG = false;            // true → tads uses its debug mode (no real ads, no stats)

  var adsgramCtrls = {};
  var tadsCtrls = {};
  var busy = false;

  function log() { try { if (window.console) console.log.apply(console, ['[ads]'].concat([].slice.call(arguments))); } catch (e) {} }

  /* ── Adsgram ── */
  function getAdsgram(blockId) {
    if (!blockId) return null;
    if (adsgramCtrls[blockId]) return adsgramCtrls[blockId];
    try {
      if (window.Adsgram && typeof window.Adsgram.init === 'function') {
        adsgramCtrls[blockId] = window.Adsgram.init({ blockId: blockId });
      }
    } catch (e) { log('Adsgram init failed', e); }
    return adsgramCtrls[blockId] || null;
  }

  function showAdsgram(blockId) {
    return new Promise(function (resolve, reject) {
      var ctrl = getAdsgram(blockId);
      if (!ctrl) { reject({ reason: 'nofill', detail: 'adsgram sdk unavailable' }); return; }
      var p;
      try { p = ctrl.show(); } catch (e) { reject({ reason: 'nofill', detail: e }); return; }
      Promise.resolve(p).then(function () { resolve({ source: 'adsgram' }); }, function (err) {
        // Adsgram: { error:false, done:false } = user closed it early; { error:true, ... } = no fill / playback error
        if (err && err.error === false) reject({ reason: 'closed', detail: err });
        else reject({ reason: 'nofill', detail: err });
      });
    });
  }

  /* ── tads.me ── */
  function waitForTads() {
    return new Promise(function (resolve, reject) {
      if (window.tads && typeof window.tads.init === 'function') { resolve(); return; }
      var t0 = Date.now();
      var iv = setInterval(function () {
        if (window.tads && typeof window.tads.init === 'function') { clearInterval(iv); resolve(); }
        else if (Date.now() - t0 > TADS_WAIT_MS) { clearInterval(iv); reject(new Error('tads widget.js not loaded')); }
      }, 80);
    });
  }

  function getTads(widgetId) {
    var key = String(widgetId);
    if (tadsCtrls[key]) return tadsCtrls[key];
    var holder = { ctrl: null, pending: null };
    try {
      holder.ctrl = window.tads.init({
        widgetId: Number(widgetId),
        type: 'fullscreen',
        debug: DEBUG,
        // callbacks are fixed at init time, so they just forward to whatever show() is waiting right now
        onShowReward: function (r) { if (holder.pending) holder.pending.reward(r); },
        onAdsNotFound: function () { if (holder.pending) holder.pending.nofill(); }
      });
    } catch (e) { log('tads init failed', e); return null; }
    tadsCtrls[key] = holder;
    return holder;
  }

  function showTads(widgetId, strict) {
    return waitForTads().then(function () {
      return new Promise(function (resolve, reject) {
        var h = getTads(widgetId);
        if (!h || !h.ctrl || typeof h.ctrl.showAd !== 'function') { reject({ reason: 'nofill', detail: 'tads controller unavailable' }); return; }
        var finished = false, soft = null, hard = null;
        function done(fn, val) {
          if (finished) return; finished = true;
          clearTimeout(soft); clearTimeout(hard); h.pending = null; fn(val);
        }
        h.pending = {
          reward: function () { done(resolve, { source: 'tads' }); },
          nofill: function () { done(reject, { reason: 'nofill', detail: 'tads: no ads' }); }
        };
        hard = setTimeout(function () { done(reject, { reason: strict ? 'timeout' : 'nofill', detail: 'tads timeout' }); }, STRICT_TIMEOUT_MS);
        var p;
        try { p = h.ctrl.showAd(); } catch (e) { done(reject, { reason: 'nofill', detail: e }); return; }
        Promise.resolve(p).then(function () {
          // overlay opened. Strict: keep waiting for onShowReward. Non-strict: accept after a minimum view time.
          if (!strict && !finished) soft = setTimeout(function () { done(resolve, { source: 'tads', soft: true }); }, SOFT_VIEW_MS);
        }, function (err) { done(reject, { reason: 'nofill', detail: err }); });
      });
    }, function (err) { return Promise.reject({ reason: 'nofill', detail: err }); });
  }

  /* ── public API ── */
  function show(opts) {
    opts = opts || {};
    if (busy) return Promise.reject({ reason: 'busy' });
    busy = true;
    var strict = !!opts.strict;
    function release() { busy = false; }

    var chain = opts.adsgram
      ? showAdsgram(opts.adsgram)
      : Promise.reject({ reason: 'nofill', detail: 'no adsgram block' });

    return chain.catch(function (err) {
      if (err && err.reason === 'closed') return Promise.reject(err);        // user saw an ad and closed it
      log('Adsgram has no ad → falling back to tads', err && err.detail);
      if (!opts.tads) return Promise.reject({ reason: 'nofill', detail: err && err.detail });
      return showTads(opts.tads, strict);
    }).then(function (r) { release(); return r; }, function (e) { release(); return Promise.reject(e); });
  }

  window.AdManager = { show: show, isBusy: function () { return busy; }, setDebug: function (v) { DEBUG = !!v; } };
})();
