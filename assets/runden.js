/* Übung „Runden“: Zahl mit Punkt unter der Rundungsstelle, zwei Nachbarzahlen zum Antippen.
   Aufgabe 1–5 mit Zahlenstrahl, 6–10 ohne (dann zählt die Regel). Nach jeder Antwort: Rückmeldung und „Weiter“. */
(function () {
  var L = JSON.parse(document.getElementById('data').textContent).labels;
  var app = document.getElementById('app');
  var AC = '#5a7fa8', INK = '#1a1a1a';
  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function pick(u, lo, hi, last) {   // Zahl zwischen lo und hi, nicht durch u teilbar; last = gewünschte Ziffer rechts neben der Rundungsstelle
    for (var t = 0; t < 200; t++) {
      var n = R(lo, hi);
      if (n % u === 0) continue;
      if (last !== undefined && Math.floor(n / (u / 10)) % 10 !== last) continue;
      if (u === 100 && n % 10 === 0 && Math.random() < .5) continue;
      var dd = Math.floor(n / (u / 10)) % 10;
      if (last === undefined && (dd === 0 || dd === 1 || dd === 9)) continue;   // nicht zu nah an den Nachbarzahlen (Beschriftung)
      return n;
    }
    return lo + 3;
  }
  function makeSet() {
    var a = [
      [10, pick(10, 11, 99), true], [10, pick(10, 11, 99, 5), true], [10, pick(10, 101, 999), true],
      [10, pick(10, 101, 999), true], [100, pick(100, 101, 999), true],
      [10, pick(10, 11, 99, 4), false], [10, pick(10, 1001, 9999), false], [100, pick(100, 101, 999, 5), false],
      [100, pick(100, 1001, 9999), false], [100, pick(100, 1001, 9999), false]];
    return a.map(function (x) { return { u: x[0], n: x[1], line: x[2] }; });
  }
  var set, i, first, wrongs;

  function numHtml(n, u) {
    var s = String(n), pos = s.length - 1 - (u === 10 ? 1 : 2), out = '';
    for (var j = 0; j < s.length; j++) {
      if (j && (s.length - j) % 3 === 0) out += '<span class="th"></span>';
      out += j === pos ? '<span class="rs">' + s[j] + '</span>' : (j === pos + 1 ? '<span class="nx">' + s[j] + '</span>' : s[j]);
    }
    return out;
  }
  function lineSvg(lo, hi, n, target) {
    var x0 = 70, x1 = 630, y = 70, X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
    var o = '<svg class="rl" viewBox="0 0 700 120">';
    o += '<line x1="' + (x0 - 30) + '" y1="' + y + '" x2="' + (x1 + 38) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="3"/>';
    o += '<path d="M' + (x1 + 50) + ' ' + y + ' l-18 -9 v18z" fill="' + INK + '"/>';
    for (var k = 0; k <= 10; k++) {
      var x = X(lo + k * (hi - lo) / 10), big = k === 0 || k === 5 || k === 10;
      o += '<line x1="' + x + '" y1="' + (y - (big ? 14 : 9)) + '" x2="' + x + '" y2="' + (y + (big ? 14 : 9)) + '" stroke="' + INK + '" stroke-width="' + (big ? 3 : 2) + '"/>';
    }
    [lo, hi].forEach(function (v) { o += '<text x="' + X(v) + '" y="' + (y + 44) + '" font-size="24" fill="' + INK + '" text-anchor="middle">' + fmt(v) + '</text>'; });
    o += '<circle cx="' + X(n) + '" cy="' + y + '" r="10" fill="' + AC + '"/>';
    o += '<text x="' + X(n) + '" y="' + (y + 44) + '" font-size="26" font-weight="700" fill="' + AC + '" text-anchor="middle">' + fmt(n) + '</text>';
    if (target !== undefined) {
      var xa = X(n), xb = X(target), xc = (xa + xb) / 2, yc = y - 62, dx = xb - xc, dy = (y - 16) - yc, m = Math.sqrt(dx * dx + dy * dy);
      var ex = xb - dx / m * 12, ey = (y - 16) - dy / m * 12, ux = dx / m, uy = dy / m, bx = xb - ux * 16, by = (y - 16) - uy * 16;
      o += '<path class="ar" d="M' + xa + ' ' + (y - 16) + ' Q' + xc + ' ' + yc + ' ' + ex + ' ' + ey + '" fill="none" stroke="' + AC + '" stroke-width="5" stroke-linecap="round"/>';
      o += '<polygon class="ar" points="' + xb + ',' + (y - 16) + ' ' + (bx - uy * 8) + ',' + (by + ux * 8) + ' ' + (bx + uy * 8) + ',' + (by - ux * 8) + '" fill="' + AC + '"/>';
    }
    return o + '</svg>';
  }
  function show() {
    var it = set[i], u = it.u, lo = Math.floor(it.n / u) * u, hi = lo + u, ans = (it.n % u) >= u / 2 ? hi : lo;
    app.innerHTML =
      '<p class="cnt">' + L.task + ' ' + (i + 1) + ' ' + L.of + ' ' + set.length + '</p>' +
      '<p class="rq">' + (u === 10 ? L.r10 : L.r100) + '</p>' +
      '<div class="card rnum">' + numHtml(it.n, u) + '</div>' +
      (it.line ? '<div class="rlw" id="lw">' + lineSvg(lo, hi, it.n) + '</div>' : '') +
      '<div class="rch"><button class="ch rc" type="button" data-v="' + lo + '">' + fmt(lo) + '</button>' +
      '<button class="ch rc" type="button" data-v="' + hi + '">' + fmt(hi) + '</button></div>' +
      '<div id="fb"></div>';
    var bs = [].slice.call(app.querySelectorAll('.rc')), done = false;
    bs.forEach(function (b) {
      b.onclick = function () {
        if (done) return; done = true;
        var v = +b.dataset.v, ok = v === ans;
        if (!ok) wrongs++;
        if (ok && first[i] === undefined) first[i] = true; else if (first[i] === undefined) first[i] = false;
        bs.forEach(function (x) { x.disabled = true; if (+x.dataset.v === ans) x.classList.add('ok'); });
        if (!ok) b.classList.add('no');
        var d = Math.floor(it.n / (u / 10)) % 10, up = d >= 5;
        var why = 'Rechts neben dem Punkt steht ' + d + '. ' + (up ? '5, 6, 7, 8, 9: aufrunden.' : '0, 1, 2, 3, 4: abrunden.');
        var lw = document.getElementById('lw');
        if (lw) lw.innerHTML = lineSvg(lo, hi, it.n, ans);
        document.getElementById('fb').innerHTML =
          '<div class="fbx ' + (ok ? 'okb' : 'nob') + '">' + (ok ? L.icOk + '<b>' + L.right + '</b>' : L.icNo + '<b>' + L.wrong + '</b>') +
          ' <span>' + why + ' ' + fmt(it.n) + ' → ' + fmt(ans) + '</span></div>' +
          '<button class="btn pri nxt" id="nx" type="button">' + L.icNext + '<span>' + L.next + '</span></button>';
        document.getElementById('nx').onclick = function () { i++; if (i < set.length) show(); else end(); };
      };
    });
  }
  function end() {
    var g = first.filter(function (x) { return x; }).length;
    app.innerHTML = '<div class="done">' + L.done + ' ' + L.first + ' ' + g + ' ' + L.of + ' ' + set.length + '</div>' +
      '<button class="btn pri" id="ag" type="button">' + L.icAgain + '<span>' + L.again + '</span></button>';
    document.getElementById('ag').onclick = start;
  }
  function start() { set = makeSet(); i = 0; first = []; wrongs = 0; show(); }
  start();
})();
