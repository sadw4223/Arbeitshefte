/* Erklärvideo: Szene für Szene. Jede Szene hat einen Sprechertext (MP3). Elemente mit data-s/e/d erscheinen,
   sobald der Ton in ihrer Szene den Zeitpunkt d (Anteil 0–1) erreicht. Fehlt der Ton, läuft ein Zeitgeber. */
(function () {
  var D = JSON.parse(document.getElementById('data').textContent), L = D.labels, S = D.steps, N = S.length;
  var els = [].slice.call(document.querySelectorAll('.stg .el'));
  var pl = document.getElementById('pl'), sg = document.getElementById('sg');
  var a = new Audio(); a.preload = 'auto';
  var k = 0, playing = false, slow = false, fake = null, fakeT = 0, fakeDur = 0, noAudio = false, ended = false;

  for (var i = 0; i < N; i++) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'seg'; b.setAttribute('aria-label', 'Szene ' + (i + 1));
    (function (j) { b.onclick = function () { go(j, playing); }; })(i);
    sg.appendChild(b);
  }
  var segs = [].slice.call(sg.children);

  function frac() {
    if (noAudio) return fakeDur ? Math.min(1, fakeT / fakeDur) : 0;
    return a.duration ? Math.min(1, a.currentTime / a.duration) : 0;
  }
  function render(all) {
    var s = k + 1, started = playing || a.currentTime > 0.05 || fakeT > 0;
    var f = (all || !started) ? 1 : frac();
    els.forEach(function (e) {
      var a0 = +e.dataset.s, e0 = +e.dataset.e, d = +e.dataset.d;
      var on = s >= a0 && s <= e0 && (s > a0 || f >= d || all);
      e.classList.toggle('on', on);
    });
    segs.forEach(function (b, j) { b.classList.toggle('done', j < k); b.classList.toggle('cur', j === k); });
  }
  function btn(p) {
    pl.innerHTML = (p ? L.icPause + '<span>' + L.pause : L.icPlay + '<span>' + (ended ? L.again : L.play)) + '</span>';
  }
  function stopFake() { if (fake) { clearInterval(fake); fake = null; } }
  function startFake() {
    stopFake(); fakeDur = Math.max(4, S[k].t.length / 13) * (slow ? 1.18 : 1);
    fake = setInterval(function () { fakeT += 0.1; render(false); if (fakeT >= fakeDur) { stopFake(); next(); } }, 100);
  }
  function load(j) {
    k = j; fakeT = 0; noAudio = false;
    a.src = S[k].a; a.playbackRate = slow ? 0.85 : 1; a.load();
    render(false);
  }
  function play() {
    playing = true; ended = false; btn(true);
    if (noAudio) { startFake(); return; }
    a.playbackRate = slow ? 0.85 : 1;
    var p = a.play();
    if (p && p.catch) p.catch(function () { noAudio = true; startFake(); });
  }
  function pause() { playing = false; btn(false); a.pause(); stopFake(); }
  function next() {
    if (k < N - 1) { setTimeout(function () { if (!playing) return; load(k + 1); play(); }, 600); }
    else { playing = false; ended = true; btn(false); render(true); }
  }
  function go(j, keep) {
    stopFake(); a.pause(); load(Math.max(0, Math.min(N - 1, j)));
    if (keep) play(); else { btn(false); render(false); }
  }
  a.ontimeupdate = function () { render(false); };
  a.onended = function () { render(true); next(); };
  var note = document.createElement('p'); note.className = 'note vnote'; note.hidden = true; note.textContent = L.soon;
  document.querySelector('.stage').after(note);
  a.onerror = function () { noAudio = true; note.hidden = false; if (playing) startFake(); };

  pl.onclick = function () {
    if (playing) { pause(); return; }
    if (ended) { ended = false; load(0); }
    play();
  };
  document.getElementById('bk').onclick = function () { go(k - 1, playing); };
  document.getElementById('rp').onclick = function () { go(k, true); };
  document.getElementById('sl').onclick = function () {
    slow = !slow; this.classList.toggle('on', slow); a.playbackRate = slow ? 0.85 : 1;
  };
  load(0); btn(false);
  window.__vid = { go: go, render: render, state: function () { return { k: k, playing: playing, noAudio: noAudio }; } };
})();
