/* Erklärung zum Durchklicken: Schritt für Schritt wie eine Präsentation.
   Elemente der Zeichnung tragen data-s (erster Schritt) und data-e (letzter Schritt); unter der Zeichnung steht der Text des Schritts.
   Weiter/Zurück per Knopf, Wischen oder Pfeiltasten. */
(function () {
  var D = JSON.parse(document.getElementById('data').textContent), L = D.labels, S = D.steps, N = S.length;
  var els = [].slice.call(document.querySelectorAll('.stg .el'));
  var nx = document.getElementById('nx'), bk = document.getElementById('bk'), cp = document.getElementById('cp'), sg = document.getElementById('sg');
  var k = 0;
  for (var i = 0; i < N; i++) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'seg'; b.setAttribute('aria-label', 'Schritt ' + (i + 1));
    (function (j) { b.onclick = function () { show(j); }; })(i);
    sg.appendChild(b);
  }
  var segs = [].slice.call(sg.children);
  function show(j) {
    k = Math.max(0, Math.min(N - 1, j));
    var s = k + 1;
    els.forEach(function (e) { e.classList.toggle('on', s >= +e.dataset.s && s <= +e.dataset.e); });
    segs.forEach(function (b, t) { b.classList.toggle('done', t < k); b.classList.toggle('cur', t === k); });
    cp.textContent = S[k];
    bk.disabled = k === 0;
    nx.innerHTML = (k === N - 1 ? L.icAgain + '<span>' + L.again : L.icNext + '<span>' + L.next) + '</span>';
  }
  nx.onclick = function () { show(k === N - 1 ? 0 : k + 1); };
  bk.onclick = function () { show(k - 1); };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); if (k < N - 1) show(k + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(k - 1); }
  });
  var x0 = null, y0 = null, st = document.querySelector('.stage');
  st.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  st.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? k + 1 : k - 1);
  }, { passive: true });
  show(0);
  window.__erk = { show: show };
})();
