/* Übungen am Tablet (Mathe): zehn Aufgaben zum Antippen, nach jeder Antwort Rückmeldung mit kurzer Begründung, am Ende Auswertung.
   Der Typ steht in den Seitendaten: runden, zahlwort, wert, nachbar, zstrahl, vergl (Natürliche Zahlen);
   begriffe, kopf, luecke, add, sub, ueb, sach (Addition und Subtraktion);
   mdbegriffe, einmaleins, mdluecke, regeln, mdueb, halb, mul1, mul2, div, mdsach (Multiplikation und Division). Schreibweise wie im Heft. */
(function () {
  var D = JSON.parse(document.getElementById('data').textContent), L = D.labels;
  var app = document.getElementById('app');
  var AC = '#5a7fa8', INK = '#1a1a1a', OKC = '#2e7d46', NOC = '#b3261e', NB = ' ';

  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function one(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB); }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { var k = String(x); if (!s[k]) { s[k] = 1; o.push(x); } }); return o; }
  function nums(list) { return list.map(function (v) { return { v: v, h: fmt(v) }; }); }
  // Silbenschrift wie auf den Erklärungen: jedes Wort beginnt schwarz, dann abwechselnd grau (Silben aus den Seitendaten);
  // Wörter mit „|“ (Zahlwörter) sind schon getrennt. Alles andere wird als Text ausgegeben.
  var SY = D.syl || {};
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function S(t) {
    return String(t).split(/([A-Za-zÄÖÜäöüßé|]+)/).map(function (tok, k) {
      if (k % 2 === 0) return esc(tok);
      var p = tok.indexOf('|') >= 0 ? tok.split('|') : (SY[tok] || [tok]);
      return '<span class="w">' + p.map(function (x, j) {
        return '<span>' + x + '</span>' + (/^(send|dert)$/.test(x) && j < p.length - 1 && p.length > 5 ? '<wbr>' : '');
      }).join('') + '</span>';
    }).join('');
  }
  // drei Antworten: richtige + zwei passende falsche (aus der Liste der typischen Fehler)
  function three(ans, wrong, sort) {
    var w = uniq(wrong.filter(function (x) { return x !== ans && x > 0 && x < 1000000; }));
    var c = [ans].concat(w.slice(0, 2));
    var k = 1;
    while (c.length < 3) { var z = ans + k * (ans >= 100 ? 100 : 10); if (c.indexOf(z) < 0) c.push(z); k++; }
    return sort === false ? shuffle(c) : c.sort(function (a, b) { return a - b; });
  }
  function digitHtml(n, opts) {   // opts: dot (Index von rechts), blue (Index von rechts)
    var s = String(n), out = '';
    for (var j = 0; j < s.length; j++) {
      var r = s.length - 1 - j;
      if (j && (s.length - j) % 3 === 0) out += '<span class="th"></span>';
      var c = s[j];
      if (opts.dot === r) c = '<span class="rs">' + c + '</span>';
      else if (opts.blue === r) c = '<span class="nx">' + c + '</span>';
      out += c;
    }
    return out;
  }

  // ------------------------------------------------------------ Zahlenstrahl (SVG)
  // o: lo, st (Schritt), n (Anzahl Schritte), lab (Indizes mit Zahl), dot (Wert), dotLab, arcTo, tap, res {v: 'ok'|'no'}, show (Werte mit Zahl, grün)
  function nline(o) {
    var n = o.n || 10, x0 = 70, x1 = 630, y = 78, hi = o.lo + o.st * n;
    function X(v) { return x0 + (v - o.lo) / (hi - o.lo) * (x1 - x0); }
    var s = '<svg class="rl" viewBox="0 0 700 140">';
    s += '<line x1="' + (x0 - 30) + '" y1="' + y + '" x2="' + (x1 + 38) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="3"/>';
    s += '<path d="M' + (x1 + 50) + ' ' + y + ' l-18 -9 v18z" fill="' + INK + '"/>';
    var lab = o.lab || [0, n / 2, n];
    for (var k = 0; k <= n; k++) {
      var v = o.lo + k * o.st, x = X(v), big = lab.indexOf(k) >= 0;
      var tick = '<line x1="' + x + '" y1="' + (y - (big ? 15 : 10)) + '" x2="' + x + '" y2="' + (y + (big ? 15 : 10)) + '" stroke="' + INK + '" stroke-width="' + (big ? 3 : 2) + '"/>';
      if (o.tap) {
        var w = (x1 - x0) / n;
        s += '<g class="tp" data-v="' + v + '"><rect x="' + (x - w / 2) + '" y="0" width="' + w + '" height="140" fill="transparent"/>' + tick + '</g>';
      } else s += tick;
      if (big) s += '<text x="' + x + '" y="' + (y + 46) + '" font-size="24" fill="' + INK + '" text-anchor="middle">' + fmt(v) + '</text>';
    }
    if (o.res) Object.keys(o.res).forEach(function (v) {
      var c = o.res[v] === 'ok' ? OKC : NOC;
      s += '<circle cx="' + X(+v) + '" cy="' + y + '" r="12" fill="' + c + '"/>';
      var rw = fmt(+v).length * 15 + 8;
      if (o.res[v] === 'ok') s += '<rect x="' + (X(+v) - rw / 2) + '" y="' + (y + 22) + '" width="' + rw + '" height="32" fill="#fff"/><text x="' + X(+v) + '" y="' + (y + 46) + '" font-size="26" font-weight="700" fill="' + OKC + '" text-anchor="middle">' + fmt(+v) + '</text>';
    });
    if (o.dot !== undefined) {
      s += '<circle cx="' + X(o.dot) + '" cy="' + y + '" r="11" fill="' + AC + '"/>';
      var dw = fmt(o.dot).length * 15 + 8;
      if (o.dotLab) s += '<rect x="' + (X(o.dot) - dw / 2) + '" y="' + (y + 22) + '" width="' + dw + '" height="32" fill="#fff"/><text x="' + X(o.dot) + '" y="' + (y + 46) + '" font-size="26" font-weight="700" fill="' + (o.dotCol || AC) + '" text-anchor="middle">' + fmt(o.dot) + '</text>';
    }
    if (o.arcTo !== undefined) {
      var xa = X(o.dot), xb = X(o.arcTo), xc = (xa + xb) / 2, yc = y - 62, dx = xb - xc, dy = (y - 16) - yc, m = Math.sqrt(dx * dx + dy * dy);
      var ex = xb - dx / m * 12, ey = (y - 16) - dy / m * 12, ux = dx / m, uy = dy / m, bx = xb - ux * 16, by = (y - 16) - uy * 16;
      s += '<path d="M' + xa + ' ' + (y - 16) + ' Q' + xc + ' ' + yc + ' ' + ex + ' ' + ey + '" fill="none" stroke="' + AC + '" stroke-width="5" stroke-linecap="round"/>';
      s += '<polygon points="' + xb + ',' + (y - 16) + ' ' + (bx - uy * 8) + ',' + (by + ux * 8) + ' ' + (bx + uy * 8) + ',' + (by - ux * 8) + '" fill="' + AC + '"/>';
    }
    return s + '</svg>';
  }

  // ------------------------------------------------------------ Zahlwörter
  var U = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sie|ben', 'acht', 'neun'];
  var UC = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sie|ben', 'acht', 'neun'];
  var TEEN = ['zehn', 'elf', 'zwölf', 'drei|zehn', 'vier|zehn', 'fünf|zehn', 'sech|zehn', 'sieb|zehn', 'acht|zehn', 'neun|zehn'];
  var TEN = ['', '', 'zwan|zig', 'drei|ßig', 'vier|zig', 'fünf|zig', 'sech|zig', 'sieb|zig', 'acht|zig', 'neun|zig'];
  function u100(n, c) { if (n < 10) return (c ? UC : U)[n]; if (n < 20) return TEEN[n - 10]; var u = n % 10; return (u ? UC[u] + '|und|' : '') + TEN[Math.floor(n / 10)]; }
  function u1000(n, c) { var h = Math.floor(n / 100), r = n % 100, p = []; if (h) p.push(UC[h] + '|hun|dert'); if (r) p.push(u100(r, c)); return p.join('|'); }
  // Zahlwort in Silbenschrift; nach „tausend“ ein Trennstrich als Lesehilfe (z. B. siebenhunderttausend | dreihundertvierzig)
  function zwHtml(n) {
    var t = Math.floor(n / 1000), r = n % 1000, a = t ? u1000(t, true) + '|tau|send' : '', b = r ? u1000(r, false) : '';
    return (a ? S(a) : '') + (a && b ? '<span class="zdiv" aria-hidden="true">|</span><wbr>' : '') + (b ? S(b) : '');
  }

  // ------------------------------------------------------------ Aufgaben-Erzeuger
  var GEN = {};

  GEN.runden = function () {
    function pick(u, lo, hi, last) {
      for (var t = 0; t < 300; t++) {
        var n = R(lo, hi);
        if (n % u === 0) continue;
        var dd = Math.floor(n / (u / 10)) % 10;
        if (last !== undefined && dd !== last) continue;
        if (last === undefined && (dd === 0 || dd === 1 || dd === 9)) continue;   // nicht zu nah an den Nachbarzahlen
        return n;
      }
      return lo + 3 * u / 10;
    }
    var spec = [[10, 11, 99, true], [10, 11, 99, true, 5], [10, 101, 999, true], [100, 101, 999, true], [1000, 1001, 9999, true],
      [10, 11, 99, false, 4], [10, 1001, 9999, false], [100, 101, 999, false, 5], [100, 1001, 9999, false], [1000, 1001, 9999, false]];
    var NAME = { 10: 'Zehner', 100: 'Hunderter', 1000: 'Tausender' };
    return spec.map(function (x) {
      var u = x[0], n = pick(u, x[1], x[2], x[4]), lo = Math.floor(n / u) * u, hi = lo + u, ans = (n % u) >= u / 2 ? hi : lo, pos = { 10: 1, 100: 2, 1000: 3 }[u];
      var d = Math.floor(n / (u / 10)) % 10, up = d >= 5;
      var it = {
        head: S('Runde auf ' + NAME[u] + '.'),
        body: '<div class="card rnum">' + digitHtml(n, { dot: pos, blue: pos - 1 }) + '</div>' +
          (x[3] ? '<div class="rlw" id="lw">' + nline({ lo: lo, st: u / 10, dot: n, dotLab: true }) + '</div>' : ''),
        choices: nums([lo, hi]), ans: ans,
        why: S('Rechts neben dem Punkt steht ' + d + '. ' + (up ? '5, 6, 7, 8, 9: aufrunden.' : '0, 1, 2, 3, 4: abrunden.') + ' ' + fmt(n) + ' → ' + fmt(ans))
      };
      if (x[3]) it.after = function () { document.getElementById('lw').innerHTML = nline({ lo: lo, st: u / 10, dot: n, dotLab: true, arcTo: ans }); };
      return it;
    });
  };

  GEN.zahlwort = function () {
    function num(len, zero) {
      for (var t = 0; t < 300; t++) {
        var s = String(R(1, 9));
        for (var i = 1; i < len; i++) s += String(Math.random() < (zero ? .35 : .12) ? 0 : R(1, 9));
        var n = +s;
        if (zero && s.slice(1).indexOf('0') < 0) continue;
        if (n % 1000 === 0 && Math.random() < .7) continue;
        return n;
      }
      return 40508;
    }
    function wrongs(n) {
      var t = Math.floor(n / 1000), r = n % 1000, h = Math.floor(r / 100), z = Math.floor(r / 10) % 10, e = r % 10, c = [];
      if (z && e && z !== e) c.push(t * 1000 + h * 100 + e * 10 + z);                  // Zahlendreher bei Zehnern und Einern
      if (z === 0 && e) c.push(t * 1000 + h * 100 + e * 10);                           // Null an der falschen Stelle
      if (r < 100 && r > 0) c.push(t * Math.pow(10, String(r).length) + r);            // Nullen weggelassen
      if (t % 10 === 0) c.push(t / 10 * 1000 + r); else if (t < 100) c.push(t * 10000 + r);
      if (t >= 10 && t < 100 && t % 10 && Math.floor(t / 10) !== t % 10) c.push(((t % 10) * 10 + Math.floor(t / 10)) * 1000 + r);
      if (h && !z && !e) c.push(t * 1000 + h * 10);
      return shuffle(c);
    }
    var spec = [[4, false], [4, true], [4, true], [5, false], [5, true], [5, true], [5, false], [6, true], [6, false], [6, true]];
    return spec.map(function (x) {
      var n = num(x[0], x[1]), t = Math.floor(n / 1000), r = n % 1000;
      var rs = String(r); while (rs.length < 3) rs = '0' + rs;
      var why = S('Suche das Wort „tausend“. Davor steht ') + '<b>' + S(u1000(t, true)) + '</b>' + S(': ' + fmt(t) + '. Danach steht ') +
        (r ? '<b>' + S(u1000(r, false)) + '</b>' + S(': ' + rs + '.') : S('nichts: 000.')) + S(' Zusammen: ' + fmt(n));
      return { head: S('Welche Zahl ist das?'), body: '<div class="card zwd">' + zwHtml(n) + '</div>', choices: nums(three(n, wrongs(n))), ans: n, why: why, cols: 3 };
    });
  };

  var PL = ['Einern', 'Zehnern', 'Hundertern', 'Tausendern', 'Zehntausendern', 'Hunderttausendern'];
  var PK = ['E', 'Z', 'H', 'T', 'ZT', 'HT'];
  function swTable(n, blue) {
    var s = String(n), h = '', d = '';
    for (var j = 0; j < s.length; j++) {
      var r = s.length - 1 - j;
      h += '<th>' + PK[r] + '</th>';
      d += '<td' + (r === blue ? ' class="b"' : '') + '>' + s[j] + '</td>';
    }
    return '<table class="swf"><tr>' + h + '</tr><tr>' + d + '</tr></table>';
  }
  GEN.wert = function () {
    var lens = [4, 4, 4, 5, 5, 5, 6, 6, 5, 6];
    var used = {};
    return lens.map(function (len) {
      var n, pos, d;
      for (var t = 0; t < 300; t++) {
        n = R(Math.pow(10, len - 1), Math.pow(10, len) - 1); pos = R(0, len - 1);
        d = Math.floor(n / Math.pow(10, pos)) % 10;
        if (d === 0 || d === 1 || used[pos] > 1) continue;
        break;
      }
      used[pos] = (used[pos] || 0) + 1;
      var k0 = Math.max(0, Math.min(len - 3, pos - R(0, 2))), ch = [];
      for (var k = k0; k < k0 + 3; k++) ch.push(d * Math.pow(10, k));
      var ans = d * Math.pow(10, pos);
      return {
        head: S('Welchen Wert hat die blaue Ziffer?'), body: '<div class="card rnum">' + digitHtml(n, { blue: pos }) + '</div>',
        choices: nums(ch), ans: ans, cols: 3,
        why: S('Die ' + d + ' steht bei den ' + PL[pos] + '. Sie ist ' + fmt(ans) + ' wert.') + swTable(n, pos)
      };
    });
  };

  GEN.nachbar = function () {
    function n3() { return R(101, 9899); }
    function endNot(n, d) { return n % 10 !== d; }
    var types = ['nf', 'vg', 'nf9', 'vg0', 'nf99', 'vg00', 'nz', 'nz', 'nh', 'nh'];
    return types.map(function (ty) {
      var n, ans, w, head, why, pair = false;
      if (ty === 'nf') { do { n = n3(); } while (!endNot(n, 9)); ans = n + 1; w = [n - 1, n + 10]; }
      if (ty === 'vg') { do { n = n3(); } while (!endNot(n, 0)); ans = n - 1; w = [n + 1, n - 10]; }
      if (ty === 'nf9') { do { n = R(10, 989) * 10 + 9; } while (Math.floor(n / 10) % 10 === 9); ans = n + 1; w = [Math.floor(n / 10) * 100 + 10, n - 9]; }
      if (ty === 'vg0') { do { n = R(11, 989) * 10; } while (Math.floor(n / 10) % 10 === 0); ans = n - 1; w = [n + 9, n + 1]; }
      if (ty === 'nf99') { n = one([R(1, 8) * 100 + 99, R(10, 98) * 100 + 99, R(1, 8) * 1000 + 999]); ans = n + 1; w = [Math.floor(n / 10) * 100 + 10, n - 9]; }
      if (ty === 'vg00') { n = one([R(2, 9) * 100, R(1, 9) * 1000, R(11, 98) * 100]); ans = n - 1; w = [n + 9, n - 91]; }
      if (ty === 'nf' || ty === 'nf9' || ty === 'nf99') { head = S('Nachfolger (+' + NB + '1)'); why = S('Der Nachfolger ist 1 mehr: ' + fmt(n) + ' + 1 = ' + fmt(ans)); }
      if (ty === 'vg' || ty === 'vg0' || ty === 'vg00') { head = S('Vorgänger (–' + NB + '1)'); why = S('Der Vorgänger ist 1 weniger: ' + fmt(n) + ' – 1 = ' + fmt(ans)); }
      if (ty === 'nz' || ty === 'nh') {
        var u = ty === 'nz' ? 10 : 100;
        do { n = ty === 'nz' ? R(11, 9989) : R(101, 9989); } while (n % u === 0 || (ty === 'nh' && n % 10 === 0 && Math.random() < .5));
        var lo = Math.floor(n / u) * u, hi = lo + u, zlo = Math.floor(n / 10) * 10;
        var cand = [[lo, hi], [lo - u, lo], [hi, hi + u]];
        if (ty === 'nh' && zlo !== lo) cand[1] = [zlo, zlo + 10];
        if (cand[1][0] <= 0) cand[1] = [hi, hi + u];
        if (cand[1][0] === cand[2][0]) cand[2] = [lo - u > 0 ? lo - u : hi + u, lo - u > 0 ? lo : hi + 2 * u];
        head = S(ty === 'nz' ? 'Nachbarzehner' : 'Nachbarhunderter');
        why = S(fmt(n) + ' liegt zwischen ' + fmt(lo) + ' und ' + fmt(hi) + ': ' + fmt(lo) + ' < ' + fmt(n) + ' < ' + fmt(hi) + '. ' +
          (ty === 'nz' ? 'Nachbarzehner enden mit 0.' : 'Nachbarhunderter enden mit 00.'));
        return {
          head: head, body: '<div class="card rnum">' + fmt(n) + '</div>', cols: 1, ans: lo + '-' + hi, why: why,
          choices: shuffle(cand.map(function (p) { return { v: p[0] + '-' + p[1], h: S(fmt(p[0]) + ' und ' + fmt(p[1])) }; }))
        };
      }
      return { head: head, body: '<div class="card rnum">' + fmt(n) + '</div>', choices: nums(three(ans, w)), ans: ans, why: why, cols: 3 };
    });
  };

  GEN.zstrahl = function () {
    var SC = { a: [0, 1], b: [0, 10], c: [0, 5], d: [100, 10], e: [0, 100], f: [2000, 100], g: [0, 2], h: [500, 50] };
    var plan = [['read', 'a'], ['read', 'b'], ['read', 'c'], ['read', 'd'], ['read', 'e'], ['tap', 'b'], ['tap', 'g'], ['tap', 'd'], ['tap', 'h'], ['tap', 'f']];
    return plan.map(function (p) {
      var lo = SC[p[1]][0], st = SC[p[1]][1], k = one([1, 2, 3, 4, 6, 7, 8, 9]), v = lo + k * st, mid = lo + 5 * st;
      var from = k < 5 ? lo : mid, cnt = [];
      for (var x = from + st; x <= v; x += st) cnt.push(fmt(x));
      var why = S('Von ' + fmt(lo) + ' bis ' + fmt(mid) + ' sind es 5 Schritte. Ein Schritt ist ' + fmt(st) + '. Zähle: ' + fmt(from) + ', ' + cnt.join(', ') + '.');
      if (p[0] === 'read') {
        var hi = lo + 10 * st, side = Math.random() < .5 ? st : -st;
        var w = [lo + k, v + side, v - side, v + 2 * side, v - 2 * side].filter(function (z) { return z > lo && z < hi && z !== mid && z !== v; });
        var it = { head: S('Welche Zahl ist markiert?'), body: '<div class="rlw" id="lw">' + nline({ lo: lo, st: st, dot: v }) + '</div>', choices: nums(three(v, w)), ans: v, why: why, cols: 3 };
        it.after = function () { document.getElementById('lw').innerHTML = nline({ lo: lo, st: st, dot: v, dotLab: true, dotCol: OKC }); };
        return it;
      }
      var it2 = { kind: 'tap', head: S('Tippe auf die ' + fmt(v) + '.'), body: '<div class="rlw tap" id="lw">' + nline({ lo: lo, st: st, tap: true }) + '</div>', ans: v, why: why };
      it2.after = function (good, got) { var r = {}; r[v] = 'ok'; if (!good) r[got] = 'no'; document.getElementById('lw').innerHTML = nline({ lo: lo, st: st, res: r }); };
      return it2;
    });
  };

  GEN.vergl = function () {
    function pairOf(kind) {
      var a, b;
      if (kind === 1) { a = R(60, 99); b = R(100, 140); }
      if (kind === 2) { do { a = R(12, 98); } while (a % 10 === 0 || Math.floor(a / 10) === a % 10); b = (a % 10) * 10 + Math.floor(a / 10); }
      if (kind === 3) { var h = R(1, 9), x = R(0, 9), y; do { y = R(0, 9); } while (y === x); a = h * 100 + x * 10 + y; b = h * 100 + y * 10 + x; }
      if (kind === 4) { a = b = R(1001, 9999); }
      if (kind === 5) { a = R(1001, 1300); b = R(950, 999); }
      if (kind === 6) { var t = R(10, 99) * 100, p = R(1, 9), q; do { q = R(1, 9); } while (q === p); a = t + p * 10; b = t + q; }
      if (kind === 7) { var base = R(10, 99) * 1000, m = R(1, 9), o; do { o = R(1, 9); } while (o === m); a = base + m * 100; b = base + o * 10; }
      return Math.random() < .5 ? [a, b] : [b, a];
    }
    function why(a, b) {
      var sa = String(a), sb = String(b), sg = a < b ? '<' : (a > b ? '>' : '=');
      if (sa.length !== sb.length) return fmt(a) + ' hat ' + sa.length + ' Stellen, ' + fmt(b) + ' hat ' + sb.length + ' Stellen. Mehr Stellen heißt größer: ' + fmt(a) + ' ' + sg + ' ' + fmt(b);
      if (a === b) return 'Alle Ziffern sind gleich: ' + fmt(a) + ' = ' + fmt(b);
      for (var i = 0; i < sa.length && sa[i] === sb[i]; i++);
      return 'Vergleiche von links. Die erste andere Ziffer: ' + sa[i] + ' und ' + sb[i] + '. Also: ' + fmt(a) + ' ' + sg + ' ' + fmt(b);
    }
    var items = shuffle([1, 2, 3, 4, 5, 6, 7]).map(function (kind) {
      var p = pairOf(kind), a = p[0], b = p[1], sg = a < b ? '<' : (a > b ? '>' : '=');
      var it = {
        head: S('Setze das passende Zeichen ein.'), ans: sg, why: S(why(a, b)), cols: 3,
        body: '<div class="card cmpq"><span>' + fmt(a) + '</span><span class="cmq" id="cq">?</span><span>' + fmt(b) + '</span></div>',
        choices: [{ v: '<', h: '&lt;' }, { v: '>', h: '&gt;' }, { v: '=', h: '=' }]
      };
      it.after = function () { var q = document.getElementById('cq'); q.textContent = sg; q.classList.add('set'); };
      return it;
    });
    function ordSet(kind) {
      var s = [];
      if (kind === 0) { var d = shuffle([R(1, 3), R(4, 6), R(7, 9)]), P = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]; shuffle(P).slice(0, 4).forEach(function (q) { s.push(+(String(d[q[0]]) + d[q[1]] + d[q[2]])); }); }
      if (kind === 1) { var t = R(2, 9) * 1000; while (s.length < 4) s = uniq(s.concat([t + R(1, 9) * 100 + R(0, 99)])); }
      if (kind === 2) { s = uniq([R(90, 99), R(901, 999), R(1001, 1099), R(1100, 1999)]); }
      return s;
    }
    [0, 1, 2].forEach(function (kind) {
      var s = ordSet(kind), sorted = s.slice().sort(function (a, b) { return a - b; });
      items.push({ kind: 'order', head: S('Tippe die Zahlen der Reihe nach an. Beginne mit der kleinsten.'), nums: shuffle(s.slice()), ans: sorted,
        why: S('Richtig ist: ' + sorted.map(fmt).join(' < ')) });
    });
    return items;
  };

  // ============================================================ Addition und Subtraktion
  function eqCard(parts) { return '<div class="card cmpq eqc">' + parts.map(function (p) { return '<span>' + p + '</span>'; }).join('') + '</div>'; }
  function dig(n, p) { return Math.floor(n / Math.pow(10, p)) % 10; }
  var NAMES = [['Ben', 'er'], ['Mia', 'sie'], ['Lena', 'sie'], ['Tim', 'er'], ['Emma', 'sie'], ['Noah', 'er'], ['Lea', 'sie'], ['Emil', 'er'], ['Ayla', 'sie'], ['Jonas', 'er']];

  GEN.begriffe = function () {
    var plan = shuffle(['p0', 'p1', 'p2', 'm0', 'm1', 'm2', 'p2', 'm2']).concat(shuffle(['wa', 'ws']));
    return plan.map(function (t) {
      if (t === 'wa' || t === 'ws') {
        var pl = t === 'wa';
        return { head: S(pl ? 'Was heißt addieren?' : 'Was heißt subtrahieren?'), body: '', cols: 1, ans: pl ? 'p' : 'm',
          choices: [{ v: 'p', h: S('plus rechnen') }, { v: 'm', h: S('minus rechnen') }],
          why: S(pl ? 'Addieren heißt plus rechnen.' : 'Subtrahieren heißt minus rechnen.') };
      }
      var plus = t[0] === 'p', k = +t[1], a, b, c;
      if (plus) { a = R(12, 68); b = R(11, 99 - a); c = a + b; } else { a = R(40, 99); b = R(11, a - 10); c = a - b; }
      var nn = [a, b, c], parts = [String(a), plus ? '+' : '–', String(b), '=', String(c)];
      parts[k * 2] = '<b class="nx">' + nn[k] + '</b>';
      var names = plus ? ['Summand', 'Summand', 'Summe'] : ['Minuend', 'Subtrahend', 'Differenz'];
      var ans = names[k], pool = plus ? ['Summand', 'Summe', 'Differenz'] : ['Minuend', 'Subtrahend', 'Differenz'];
      if (!plus && k === 2) pool = ['Summe', 'Subtrahend', 'Differenz'];
      return { head: S('Wie heißt die blaue Zahl?'), body: eqCard(parts), cols: 3, ans: ans,
        choices: pool.map(function (w) { return { v: w, h: S(w) }; }),
        why: S(plus ? 'Bei der Plusaufgabe heißen die Zahlen vorne Summanden. Das Ergebnis heißt Summe.'
          : 'Bei der Minusaufgabe heißt die erste Zahl Minuend, die Zahl nach dem Minus Subtrahend. Das Ergebnis heißt Differenz.') };
    });
  };

  GEN.kopf = function () {
    var plan = ['uzp', 'uzm', 'uzp', 'uzm', 'zzp', 'zzm', 'zzp', 'zzm', 'hun', 'zeh'];
    return plan.map(function (t) {
      var a, b, ans, why, w;
      if (t === 'uzp') { do { a = R(12, 88); b = R(3, 9); } while (a % 10 + b <= 10 || a % 10 === 0); ans = a + b; var x = 10 - a % 10;
        why = a + ' + ' + x + ' = ' + (a + x) + '. ' + (a + x) + ' + ' + (b - x) + ' = ' + ans + '.'; }
      if (t === 'uzm') { do { a = R(21, 97); b = R(3, 9); } while (a % 10 >= b || a % 10 === 0); ans = a - b; var y = a % 10;
        why = a + ' – ' + y + ' = ' + (a - y) + '. ' + (a - y) + ' – ' + (b - y) + ' = ' + ans + '.'; }
      if (t === 'zzp') { do { a = R(14, 68); b = R(13, 39); } while (a + b > 99 || a % 10 + b % 10 < 10 || b % 10 === 0); ans = a + b;
        var bz = b - b % 10; why = a + ' + ' + bz + ' = ' + (a + bz) + '. ' + (a + bz) + ' + ' + (b % 10) + ' = ' + ans + '.'; }
      if (t === 'zzm') { do { a = R(41, 97); b = R(13, 39); } while (a % 10 >= b % 10 || b % 10 === 0 || a - b < 10); ans = a - b;
        var cz = b - b % 10; why = a + ' – ' + cz + ' = ' + (a - cz) + '. ' + (a - cz) + ' – ' + (b % 10) + ' = ' + ans + '.'; }
      if (t === 'hun') { var pl = Math.random() < .5; a = R(2, 7) * 100; b = R(1, pl ? (9 - a / 100) : (a / 100 - 1)) * 100; ans = pl ? a + b : a - b;
        why = (a / 100) + (pl ? ' + ' : ' – ') + (b / 100) + ' = ' + (ans / 100) + '. Bei Hundertern hängst du zwei Nullen an: ' + fmt(ans) + '.';
        return { head: S('Rechne im Kopf.'), body: eqCard([fmt(a), pl ? '+' : '–', fmt(b), '=', '?']), choices: nums(three(ans, [ans + 100, ans - 100])), ans: ans, why: S(why), cols: 3 }; }
      if (t === 'zeh') { a = R(5, 9) * 10; b = R(4, 9) * 10; while (a + b < 110) b += 10; ans = a + b;
        why = (a / 10) + ' + ' + (b / 10) + ' = ' + (ans / 10) + '. Bei Zehnern hängst du eine Null an: ' + fmt(ans) + '.';
        return { head: S('Rechne im Kopf.'), body: eqCard([a, '+', b, '=', '?']), choices: nums(three(ans, [ans - 10, ans + 10])), ans: ans, why: S(why), cols: 3 }; }
      var plus = t.slice(-1) === 'p';
      return { head: S('Rechne im Kopf.'), body: eqCard([a, plus ? '+' : '–', b, '=', '?']), ans: ans, cols: 3,
        choices: nums(three(ans, shuffle([ans - 10, ans + 10, ans - 1, ans + 1]))), why: S('In Schritten: ' + why) };
    });
  };

  GEN.luecke = function () {
    var plan = shuffle(['xb', 'ax', 'xm', 'am', 'xb', 'ax', 'xm', 'am', 'xb', 'am']);
    return plan.map(function (t) {
      var x, b, c, parts, ans, why, wr;
      var Q = '<b class="qb" id="qb">?</b>';
      if (t === 'xb') { x = R(12, 65); b = R(11, 99 - x); c = x + b; parts = [Q, '+', b, '=', c]; ans = x; wr = c + b;
        why = 'Umkehraufgabe: ' + c + ' – ' + b + ' = ' + x + '. Prüfe: ' + x + ' + ' + b + ' = ' + c + '.'; }
      if (t === 'ax') { b = R(12, 65); x = R(11, 99 - b); c = x + b; parts = [b, '+', Q, '=', c]; ans = x; wr = c + b;
        why = 'Umkehraufgabe: ' + c + ' – ' + b + ' = ' + x + '. Prüfe: ' + b + ' + ' + x + ' = ' + c + '.'; }
      if (t === 'xm') { b = R(11, 45); c = R(11, 99 - b); x = c + b; parts = [Q, '–', b, '=', c]; ans = x; wr = c - b > 0 ? c - b : x + 10;
        why = 'Umkehraufgabe: Aus minus wird plus. ' + c + ' + ' + b + ' = ' + x + '. Prüfe: ' + x + ' – ' + b + ' = ' + c + '.'; }
      if (t === 'am') { var a0 = R(50, 100); x = R(11, a0 - 11); c = a0 - x; parts = [a0, '–', Q, '=', c]; ans = x; wr = x > 20 ? x - 10 : x + 20;
        why = 'Rechne ' + a0 + ' – ' + c + ' = ' + x + '. Prüfe: ' + a0 + ' – ' + x + ' = ' + c + '.'; }
      var it = { head: S('Welche Zahl fehlt?'), body: eqCard(parts), choices: nums(three(ans, [wr, ans + 10, ans - 10])), ans: ans, why: S(why), cols: 3 };
      it.after = function () { var q = document.getElementById('qb'); q.textContent = ans; q.classList.add('set'); };
      return it;
    });
  };

  // ------------------------------------------------------------ schriftlich rechnen
  function carAdd(ns, nc) { var c = {}, cr = 0; for (var p = 0; p < nc; p++) { var s = cr; ns.forEach(function (n) { s += dig(n, p); }); cr = Math.floor(s / 10); if (cr && nc - 2 - p >= 0) c[nc - 2 - p] = String(cr); } return c; }
  function carSub(a, b, nc) { var c = {}, cr = 0; for (var p = 0; p < nc; p++) { var da = dig(a, p), db = dig(b, p) + cr; cr = db > da ? 1 : 0; if (cr && nc - 2 - p >= 0) c[nc - 2 - p] = '1'; } return c; }
  function gridHtml(ns, op, nc, fill) {
    var res = op === '+' ? ns.reduce(function (s, n) { return s + n; }, 0) : ns[0] - ns[1];
    var lab = ['T', 'H', 'Z', 'E'].slice(4 - nc), h = '<table class="sgr"><tr class="hd"><td class="o"></td>';
    lab.forEach(function (l) { h += '<td>' + l + '</td>'; }); h += '</tr>';
    ns.forEach(function (n, r) {
      var s = String(n); while (s.length < nc) s = ' ' + s;
      h += '<tr><td class="o">' + (r === ns.length - 1 ? (op === '+' ? '+' : '–') : '') + '</td>';
      for (var k = 0; k < nc; k++) h += '<td>' + (s[k] === ' ' ? '' : s[k]) + '</td>';
      h += '</tr>';
    });
    var car = fill ? (op === '+' ? carAdd(ns, nc) : carSub(ns[0], ns[1], nc)) : {};
    h += '<tr class="ue"><td class="o"></td>'; for (var k2 = 0; k2 < nc; k2++) h += '<td>' + (car[k2] || '') + '</td>'; h += '</tr>';
    var rs = String(res);
    h += '<tr class="rs"><td class="o"></td>';
    for (var k3 = 0; k3 < nc; k3++) { var j = k3 - (nc - rs.length); h += j < 0 ? '<td class="nb"></td>' : '<td>' + (fill ? rs[j] : '') + '</td>'; }
    return h + '</tr></table>';
  }
  function addWhy(ns) {
    var nc = String(ns.reduce(function (s, n) { return s + n; }, 0)).length, cr = 0, t = [], NAME = ['Einer', 'Zehner', 'Hunderter', 'Tausender'];
    var mx = Math.max.apply(null, ns.map(function (n) { return String(n).length; }));
    for (var p = 0; p < mx; p++) {
      var ds = ns.map(function (n) { return dig(n, p); }).filter(function (d, i) { return String(ns[i]).length > p; }), s = cr + ds.reduce(function (a, b) { return a + b; }, 0);
      t.push(NAME[p] + ': ' + (cr ? cr + ' + ' : '') + ds.join(' + ') + ' = ' + s + '.' + (s > 9 ? ' Schreibe ' + (s % 10) + ', Übertrag ' + Math.floor(s / 10) + '.' : ''));
      cr = Math.floor(s / 10);
    }
    if (cr) t.push('Der Übertrag ' + cr + ' kommt vorne zu den Tausendern.');
    return t.join(' ');
  }
  function subWhy(a, b) {
    var cr = 0, t = [], NAME = ['Einer', 'Zehner', 'Hunderter'];
    for (var p = 0; p < String(a).length; p++) {
      var da = dig(a, p), db = dig(b, p), u = db + cr, inc = cr, r, line;
      if (u <= da) { r = da - u; line = NAME[p] + ': ' + (cr ? cr + ' + ' + db + ' = ' + u + '. ' : '') + u + ' + ' + r + ' = ' + da + '.'; cr = 0; }
      else { r = da + 10 - u; line = NAME[p] + ': ' + (cr ? cr + ' + ' + db + ' = ' + u + '. ' : '') + u + ' + ' + r + ' = ' + (da + 10) + ', Übertrag 1.'; cr = 1; }
      if (p >= String(b).length) line = inc ? NAME[p] + ': ' + inc + ' + ' + r + ' = ' + da + '.' : NAME[p] + ': ' + da + ' bleibt.';
      t.push(line);
    }
    return 'Ergänze von unten nach oben. ' + t.join(' ');
  }
  function nCarry(ns) { var c = 0, cr = 0; for (var p = 0; p < 4; p++) { var s = cr; ns.forEach(function (n) { s += dig(n, p); }); cr = Math.floor(s / 10); if (cr) c++; } return c; }
  function noCarry(ns) { var r = 0; for (var p = 0; p < 4; p++) { var s = 0; ns.forEach(function (n) { s += dig(n, p); }); r += (s % 10) * Math.pow(10, p); } return r; }

  GEN.add = function () {
    var spec = ['c0', 'c1', 'c1', 'c2', 'c2', 'd2', 'c1', 'k4', 'k4', 'n3'];
    return spec.map(function (t) {
      var ns, tries = 0;
      do {
        tries++;
        if (t === 'd2') ns = [R(120, 899), R(12, 98)];
        else if (t === 'n3') ns = [R(101, 399), R(11, 99), R(101, 399)];
        else ns = [R(101, 899), R(101, 899)];
        var s = ns.reduce(function (a, b) { return a + b; }, 0), c = nCarry(ns);
        var ok = t === 'c0' ? c === 0 && s < 1000 : t === 'c1' ? c === 1 && s < 1000 : t === 'c2' ? c === 2 && s < 1000 :
          t === 'd2' ? c >= 1 && s < 1000 : t === 'k4' ? s >= 1000 && s < 2000 : s < 1000 && c >= 1;
      } while (!ok && tries < 500);
      var sum = ns.reduce(function (a, b) { return a + b; }, 0), nc = Math.max(3, String(sum).length);
      var nc0 = noCarry(ns), w = [nc0 !== sum ? nc0 : sum + 100, sum + (sum % 100 >= 10 ? -10 : 10), sum + 100];
      var it = { head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card sgw" id="sg">' + gridHtml(ns, '+', nc, false) + '</div>',
        choices: nums(three(sum, w)), ans: sum, cols: 3, why: S(addWhy(ns)) };
      it.after = function () { document.getElementById('sg').innerHTML = gridHtml(ns, '+', nc, true); };
      return it;
    });
  };

  GEN.sub = function () {
    function carries(a, b) { var c = 0, cr = 0; for (var p = 0; p < 3; p++) { var u = dig(b, p) + cr; cr = u > dig(a, p) ? 1 : 0; c += cr; } return c; }
    function noCar(a, b) { var r = 0, cr = 0; for (var p = 0; p < 3; p++) { var da = dig(a, p), db = dig(b, p); r += ((da - db + 10) % 10) * Math.pow(10, p); } return r; }
    function absd(a, b) { var r = 0; for (var p = 0; p < 3; p++) r += Math.abs(dig(a, p) - dig(b, p)) * Math.pow(10, p); return r; }
    var spec = ['c0', 'c1', 'c1', 'c1z', 'c2', 'c2', 'd2', 'z0', 'z0', 'c1'];
    return spec.map(function (t) {
      var a, b, tries = 0, ok;
      do {
        tries++;
        if (t === 'd2') { a = R(201, 989); b = R(12, 98); }
        else if (t === 'z0') { a = R(2, 9) * 100 + one([0, R(1, 9) * 10]); b = R(101, a - 50); }
        else { a = R(300, 989); b = R(101, a - 60); }
        var c = carries(a, b);
        ok = t === 'c0' ? c === 0 : t === 'c1' ? c === 1 && dig(a, 0) < dig(b, 0) : t === 'c1z' ? c === 1 && dig(a, 0) >= dig(b, 0) :
          t === 'c2' ? c === 2 : t === 'd2' ? c >= 1 : c >= 1;
        if (a - b < 20) ok = false;
      } while (!ok && tries < 800);
      var r = a - b, w = [noCar(a, b), absd(a, b), r + 10, r - 10];
      var it = { head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card sgw" id="sg">' + gridHtml([a, b], '–', 3, false) + '</div>',
        choices: nums(three(r, w.filter(function (x) { return x !== r; }))), ans: r, cols: 3, why: S(subWhy(a, b) + ' Probe: ' + r + ' + ' + b + ' = ' + a + '.') };
      it.after = function () { document.getElementById('sg').innerHTML = gridHtml([a, b], '–', 3, true); };
      return it;
    });
  };

  GEN.ueb = function () {
    function r100(n) { return Math.round(n / 100) * 100; }
    function clear(n) { var z = dig(n, 1); return z !== 4 && z !== 5; }
    var plan = shuffle(['rp', 'rp', 'rp', 'rm', 'rm', 'rm']).concat(shuffle(['ky', 'kn', 'ky', 'kn']));
    return plan.map(function (t) {
      var plus = t === 'rp' || (t[0] === 'k' && Math.random() < .5), a, b;
      do { a = R(150, 849); b = R(110, plus ? 949 - a : a - 120); } while (!clear(a) || !clear(b) || b < 110 || (!plus && r100(a) - r100(b) < 100) || (plus && r100(a) + r100(b) > 1000));
      var x = r100(a), y = r100(b), u = plus ? x + y : x - y, o = plus ? '+' : '–', ex = plus ? a + b : a - b;
      var why = fmt(a) + ' ≈ ' + fmt(x) + ', ' + fmt(b) + ' ≈ ' + fmt(y) + '. Ü: ' + fmt(x) + ' ' + o + ' ' + fmt(y) + ' = ' + fmt(u) + '.';
      if (t[0] === 'r') {
        var fl = plus ? Math.floor(a / 100) * 100 + Math.floor(b / 100) * 100 : Math.floor(a / 100) * 100 - Math.ceil(b / 100) * 100;
        var ce = plus ? Math.ceil(a / 100) * 100 + Math.ceil(b / 100) * 100 : Math.ceil(a / 100) * 100 - Math.floor(b / 100) * 100;
        return { head: S('Mache einen Überschlag.'), body: eqCard([fmt(a), o, fmt(b)]), choices: nums(three(u, [fl, ce, u + 100, u - 100].filter(function (z) { return z !== u && z > 0; }))), ans: u, cols: 3, why: S(why) };
      }
      var good = t === 'ky', shown = good ? ex : ex + one([-200, -100, 100, 200]);
      if (shown <= 0) shown = ex + 100;
      return { head: S('Kann das Ergebnis stimmen? Mache einen Überschlag.'), body: eqCard([fmt(a), o, fmt(b), '=', fmt(shown)]), cols: 2,
        ans: good ? 'j' : 'n', choices: [{ v: 'j', h: S('kann stimmen') }, { v: 'n', h: S('kann nicht stimmen') }],
        why: S(why + ' ' + fmt(shown) + (good ? ' ist nah an ' + fmt(u) + '. Es kann stimmen.' : ' ist weit weg von ' + fmt(u) + '. Richtig ist ' + fmt(ex) + '.')) };
    });
  };

  GEN.sach = function () {
    var T = [
      function (n) { var a = R(2, 5), b = R(1, 4); return { t: n[0] + ' kauft in der Bäckerei Happ ein Brot für ' + a + ' € und Brötchen für ' + b + ' €. Wie viel bezahlt ' + n[1] + ' zusammen?', x: a, y: b, op: '+', why: 'Zusammen bezahlen heißt: plus.' }; },
      function (n) { var g = one([20, 30, 50]), a = R(8, g - 4); return { t: n[0] + ' hat ' + g + ' €. ' + cap(n[1]) + ' kauft in der Buchhandlung ein Buch für ' + a + ' €. Wie viel Geld hat ' + n[1] + ' dann noch?', x: g, y: a, op: '–', why: 'Das Geld wird weniger. Du rechnest minus.' }; },
      function () { var g = R(35, 58), a = R(11, g - 15); return { t: 'Im Bus sitzen ' + g + ' Kinder. An der Schule an der Wascherde steigen ' + a + ' Kinder aus. Wie viele Kinder sitzen noch im Bus?', x: g, y: a, op: '–', why: 'Kinder steigen aus. Es werden weniger. Du rechnest minus.' }; },
      function () { var a = R(35, 80), b = R(25, 70); return { t: 'Am Samstag kommen ' + a + ' Gäste ins Eiscafé Forum. Am Sonntag kommen ' + b + ' Gäste. Wie viele Gäste sind es zusammen?', x: a, y: b, op: '+', why: 'Zusammen heißt: plus.' }; },
      function () { var a = R(12, 25), b = R(45, 79); return { t: 'Im Modegeschäft Kimpel kostet ein T-Shirt ' + a + ' €. Eine Jacke kostet ' + b + ' €. Wie viel teurer ist die Jacke?', x: b, y: a, op: '–', why: 'Wie viel teurer heißt: Du vergleichst. Rechne minus, die größere Zahl steht vorne.' }; },
      function () { var a = R(18, 26), b = R(17, 26); return { t: 'In der Klasse 5a sind ' + a + ' Kinder. In der Klasse 5b sind ' + b + ' Kinder. Wie viele Kinder sind es zusammen?', x: a, y: b, op: '+', why: 'Zusammen heißt: plus.' }; },
      function (n) { var g = R(60, 95), a = R(15, g - 20); return { t: n[0] + ' sammelt Kastanien. ' + cap(n[1]) + ' hat ' + g + ' Kastanien. ' + cap(n[1]) + ' verschenkt ' + a + ' Kastanien. Wie viele Kastanien hat ' + n[1] + ' noch?', x: g, y: a, op: '–', why: 'Verschenken heißt: Es werden weniger. Du rechnest minus.' }; },
      function (n) { var g = R(25, 60), a = R(10, 30); return { t: n[0] + ' spart. ' + cap(n[1]) + ' hat ' + g + ' €. Zum Geburtstag bekommt ' + n[1] + ' ' + a + ' € dazu. Wie viel Geld hat ' + n[1] + ' jetzt?', x: g, y: a, op: '+', why: 'Es kommt Geld dazu. Du rechnest plus.' }; },
      function () { var g = R(320, 680), a = R(110, 290); return { t: 'In der Bücherei stehen ' + g + ' Bücher. ' + a + ' Bücher sind ausgeliehen. Wie viele Bücher stehen noch im Regal?', x: g, y: a, op: '–', why: 'Ausgeliehene Bücher fehlen im Regal. Du rechnest minus.' }; },
      function () { var a = R(240, 480), b = R(150, 390); return { t: 'Beim Schulfest der Schule an der Wascherde verkaufen die Kinder am Vormittag ' + a + ' Waffeln und am Nachmittag ' + b + ' Waffeln. Wie viele Waffeln sind es zusammen?', x: a, y: b, op: '+', why: 'Zusammen heißt: plus.' }; }
    ];
    function cap(w) { return w[0].toUpperCase() + w.slice(1); }
    var names = shuffle(NAMES.slice());
    return shuffle(T.slice()).map(function (f, k) {
      var q = f(names[k % names.length]), x = q.x, y = q.y, r = q.op === '+' ? x + y : x - y;
      var good = x + ' ' + q.op + ' ' + y, alt = q.op === '+' ? [x + ' – ' + y, y + ' – ' + x] : [x + ' + ' + y, y + ' – ' + x];
      return { head: S('Welche Rechnung passt?'), body: '<div class="card story">' + S(q.t) + '</div>', cols: 1, ans: good,
        choices: shuffle([good].concat(alt)).map(function (c) { return { v: c, h: c }; }),
        why: S(q.why + ' ' + good + ' = ' + fmt(r) + '.') };
    });
  };

  // ============================================================ Multiplikation und Division
  var MP = '·';
  function td(c, k) { return '<td' + (k ? ' class="' + k + '"' : '') + '>' + (c === undefined || c === null ? '' : c) + '</td>'; }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function rnd1(n) { var p = Math.pow(10, String(n).length - 1); return Math.round(n / p) * p; }
  function nxt(n) { var s = String(n); return s.length > 1 ? +s[1] : 0; }
  function mulCarries(a, d) { var A = String(a), c = 0, cin = {}; for (var p = 0; p < A.length; p++) { var s = +A[A.length - 1 - p] * d + c; c = Math.floor(s / 10); if (p < A.length - 1) cin[p + 1] = c; } return cin; }
  function hasCarry(a, d) { var A = String(a); for (var p = 0; p < A.length - 1; p++) if (+A[A.length - 1 - p] * d > 9) return true; var cin = mulCarries(a, d); return Object.keys(cin).some(function (k) { return cin[k] > 0; }); }
  // Karo-Feld wie im Heft: Aufgabe in der ersten Zeile, = und Ergebniskästchen rechts; fill: Rechnung eingetragen
  function kgMul(a, b, fill) {
    var A = String(a), B = String(b), task = [''].concat(A.split(''), [MP], B.split('')), W = task.length, Rs = String(a * b);
    var h = '<table class="kgr"><tr>' + task.map(function (c) { return td(c, 'k pr'); }).join('') + td('=', 'sy') +
      Rs.split('').map(function (c) { return td(fill ? c : '', 'rb' + (fill ? ' ac' : '')); }).join('') + '</tr>';
    if (B.length === 1) {
      var cin = mulCarries(a, +B), lr = Rs.length, row = '';
      for (var k = 0; k <= W; k++) row += td('', 'x');
      for (var i = 0; i < lr; i++) { var p = lr - 1 - i; row += (p >= 1 && p <= A.length - 1) ? td(fill && cin[p] ? cin[p] : '', 'mz' + (fill ? ' ac' : '')) : td('', 'x'); }
      return h + '<tr class="mzr">' + row + '</tr></table>';
    }
    if (!fill) return h + '</table>';
    var rows = [[a * +B[0], W - 2], [a * +B[1], W - 1]], col = {};
    rows.forEach(function (r) { var s = String(r[0]); for (var i = 0; i < s.length; i++) { var c = r[1] - s.length + 1 + i; (col[c] = col[c] || []).push(+s[i]); } });
    var car = {}, cr = 0;
    for (var c = W - 1; c >= 0; c--) { var t = cr + sum(col[c] || []); cr = Math.floor(t / 10); if (cr && c > 0) car[c - 1] = cr; }
    rows.forEach(function (r) {
      var s = String(r[0]), m = {}; for (var i = 0; i < s.length; i++) m[r[1] - s.length + 1 + i] = s[i];
      h += '<tr>'; for (var c = 0; c < W; c++) h += td(m[c], 'k'); h += '<td class="x" colspan="9"></td></tr>';
    });
    h += '<tr class="uer">'; for (var c2 = 0; c2 < W; c2++) h += td(car[c2], 'k uc ac'); h += '<td class="x" colspan="9"></td></tr>';
    h += '<tr>'; for (var c3 = 0; c3 < W; c3++) { var j = c3 - (W - Rs.length); h += td(j >= 0 ? Rs[j] : '', 'k ac' + (c3 >= 1 ? ' ln' : '') + (j >= 0 ? ' dl' : '')); }
    return h + '<td class="x" colspan="9"></td></tr></table>';
  }
  function divRows(dd, dv) {
    var D = String(dd), n = D.length, rows = [], cur = +D[0], k = 0, txt = [];
    while (true) {
      var q = Math.floor(cur / dv), p = q * dv, end = k + 1, ps = String(p), st = end - ps.length + 1, r = { _: [] };
      r[st - 1] = '–'; for (var i = 0; i < ps.length; i++) r[st + i] = ps[i]; for (var c = st - 1; c <= end; c++) r._.push(c); rows.push(r);
      var rem = cur - p, rs = String(rem);
      txt.push(cur + ' : ' + dv + ' = ' + q + '. ' + q + ' · ' + dv + ' = ' + p + '. ' + cur + ' – ' + p + ' = ' + rem + '.');
      if (k + 1 < n) {
        var r2 = {}; for (var i2 = 0; i2 < rs.length; i2++) r2[end - rs.length + 1 + i2] = rs[i2]; r2[end + 1] = D[k + 1]; r2.dn = end + 1; rows.push(r2);
        cur = rem * 10 + (+D[k + 1]); k++; txt.push('Hole die ' + D[k] + ' herunter.');
      } else { var r3 = {}; for (var i3 = 0; i3 < rs.length; i3++) r3[end - rs.length + 1 + i3] = rs[i3]; rows.push(r3); break; }
    }
    return { rows: rows, txt: txt };
  }
  function kgDiv(dd, dv, fill) {
    var D = String(dd), n = D.length, W = n + 1, Q = String(Math.floor(dd / dv));
    var h = '<table class="kgr"><tr>' + td('', 'k') + D.split('').map(function (c) { return td(c, 'k pr'); }).join('') + td(':', 'sy') + td(dv, 'k pr') + td('=', 'sy') +
      Q.split('').map(function (c) { return td(fill ? c : '', 'rb' + (fill ? ' ac' : '')); }).join('') + '</tr>';
    if (!fill) return h + '</table>';
    divRows(dd, dv).rows.forEach(function (r) {
      h += '<tr>'; for (var c = 0; c < W; c++) h += td(r[c], 'k' + ((r._ || []).indexOf(c) >= 0 ? ' ul' : '') + (r.dn === c ? ' ac' : '')); h += '<td class="x" colspan="9"></td></tr>';
    });
    return h + '</table>';
  }

  GEN.mdbegriffe = function () {
    var plan = shuffle(['m0', 'm1', 'm2', 'd0', 'd1', 'd2', 'm2', 'd2']).concat(shuffle(['wm', 'wd']));
    return plan.map(function (t) {
      if (t === 'wm' || t === 'wd') {
        var m = t === 'wm';
        return { head: S(m ? 'Was heißt multiplizieren?' : 'Was heißt dividieren?'), body: '', cols: 1, ans: m ? 'm' : 'd',
          choices: [{ v: 'p', h: S('plus rechnen') }, { v: 'm', h: S('mal rechnen') }, { v: 'd', h: S('geteilt rechnen') }],
          why: S(m ? 'Multiplizieren heißt mal rechnen.' : 'Dividieren heißt geteilt rechnen.') };
      }
      var mul = t[0] === 'm', k = +t[1], a = R(2, 9), b = R(2, 9), c = a * b, nn, parts;
      if (mul) { nn = [a, b, c]; parts = [String(a), MP, String(b), '=', String(c)]; } else { nn = [c, b, a]; parts = [String(c), ':', String(b), '=', String(a)]; }
      parts[k * 2] = '<b class="nx">' + nn[k] + '</b>';
      var names = mul ? ['Faktor', 'Faktor', 'Produkt'] : ['Dividend', 'Divisor', 'Quotient'];
      var pool = mul ? ['Faktor', 'Produkt', 'Quotient'] : (k === 2 ? ['Produkt', 'Divisor', 'Quotient'] : ['Dividend', 'Divisor', 'Quotient']);
      return { head: S('Wie heißt die blaue Zahl?'), body: eqCard(parts), cols: 3, ans: names[k], choices: pool.map(function (w) { return { v: w, h: S(w) }; }),
        why: S(mul ? 'Bei der Malaufgabe heißen die Zahlen vorne Faktoren. Das Ergebnis heißt Produkt.'
          : 'Bei der Geteiltaufgabe heißt die erste Zahl Dividend, die Zahl nach dem Geteiltzeichen Divisor. Das Ergebnis heißt Quotient.') };
    });
  };

  GEN.einmaleins = function () {
    var plan = shuffle(['e', 'e', 'e', 'e', 'g', 'g', 'n0', 'n1', 'z10', 'zz']);
    return plan.map(function (t) {
      var a, b, ans, why, w, parts;
      if (t === 'e') {
        a = R(3, 9); b = R(3, 9); ans = a * b; parts = [a, MP, b, '=', '?']; w = [ans + b, ans - b, ans + 10];
        if (a > 5) why = '5 · ' + b + ' = ' + 5 * b + '. ' + (a - 5) + ' · ' + b + ' = ' + (a - 5) * b + '. ' + 5 * b + ' + ' + (a - 5) * b + ' = ' + ans + '.';
        else if (a === 5) why = '10 · ' + b + ' = ' + 10 * b + '. Die Hälfte ist ' + ans + '.';
        else why = a + ' · ' + b + ' = ' + Array(a + 1).join(b + ' + ').slice(0, -3) + ' = ' + ans + '.';
      }
      if (t === 'g') { a = R(3, 9); b = R(3, 9); ans = a; parts = [a * b, ':', b, '=', '?']; w = [a + 1, a - 1, b];
        why = 'Denke an die Malaufgabe: ' + a + ' · ' + b + ' = ' + a * b + '. Also ist ' + a * b + ' : ' + b + ' = ' + a + '.'; }
      if (t === 'n0') { b = R(3, 19); var f = one([0, 1, 2]); ans = 0; w = [b, 1];
        parts = f === 0 ? [0, MP, b, '=', '?'] : f === 1 ? [b, MP, 0, '=', '?'] : [0, ':', b, '=', '?'];
        why = f === 2 ? '0 geteilt durch eine Zahl ist 0.' : 'Mal 0 ist immer 0.'; }
      if (t === 'n1') { b = R(3, 19); var g = one([0, 1, 2]); ans = g === 2 ? 1 : b; w = g === 2 ? [b, 0, 2] : [b + 1, 1, b * 10];
        parts = g === 0 ? [b, MP, 1, '=', '?'] : g === 1 ? [b, ':', 1, '=', '?'] : [b, ':', b, '=', '?'];
        why = g === 0 ? 'Mal 1 bleibt die Zahl gleich.' : g === 1 ? 'Geteilt durch 1 bleibt die Zahl gleich.' : 'Eine Zahl geteilt durch sich selbst ist 1.'; }
      if (t === 'z10') { a = R(12, 99); var u = one([10, 100]); ans = a * u; parts = [a, MP, fmt(u), '=', '?']; w = [ans * 10, ans / 10, a + u];
        why = u === 10 ? 'Mal 10: Hänge eine 0 an.' : 'Mal 100: Hänge zwei Nullen an.'; why += ' ' + a + ' · ' + fmt(u) + ' = ' + fmt(ans) + '.'; }
      if (t === 'zz') { a = R(2, 9); var z = one([10, 100]); b = R(2, 9); ans = a * z * b; parts = [fmt(a * z), MP, b, '=', '?']; w = [ans / 10, ans * 10];
        why = a + ' · ' + b + ' = ' + a * b + '. Hänge ' + (z === 10 ? 'die 0' : 'die zwei Nullen') + ' an: ' + fmt(ans) + '.'; }
      return { head: S('Rechne im Kopf.'), body: eqCard(parts), choices: nums(three(ans, w)), ans: ans, why: S(why), cols: 3 };
    });
  };

  GEN.mdluecke = function () {
    var plan = shuffle(['xb', 'ax', 'xd', 'ad', 'xb', 'ax', 'xd', 'ad', 'xb', 'xd']);
    var Q = '<b class="qb" id="qb">?</b>';
    return plan.map(function (t) {
      var x, b, c, a, parts, ans, why, wr;
      if (t === 'xb' || t === 'ax') { x = R(2, 9); b = R(2, 9); c = x * b; ans = x; wr = [c - b, b, x + 1];
        parts = t === 'xb' ? [Q, MP, b, '=', c] : [b, MP, Q, '=', c];
        why = 'Umkehraufgabe: Aus mal wird geteilt. ' + c + ' : ' + b + ' = ' + x + '. Prüfe: ' + (t === 'xb' ? x + ' · ' + b : b + ' · ' + x) + ' = ' + c + '.'; }
      if (t === 'xd') { c = R(2, 9); b = R(2, 9); x = c * b; ans = x; parts = [Q, ':', b, '=', c]; wr = [x + b, x - b, c + b];
        why = 'Umkehraufgabe: Aus geteilt wird mal. ' + c + ' · ' + b + ' = ' + x + '. Prüfe: ' + x + ' : ' + b + ' = ' + c + '.'; }
      if (t === 'ad') { x = R(2, 9); c = R(2, 9); a = x * c; ans = x; parts = [a, ':', Q, '=', c]; wr = [x + 1, x - 1, c];
        why = 'Welche Zahl mal ' + c + ' ergibt ' + a + '? ' + a + ' : ' + c + ' = ' + x + '. Prüfe: ' + a + ' : ' + x + ' = ' + c + '.'; }
      var it = { head: S('Welche Zahl fehlt?'), body: eqCard(parts), choices: nums(three(ans, wr)), ans: ans, why: S(why), cols: 3 };
      it.after = function () { var q = document.getElementById('qb'); q.textContent = ans; q.classList.add('set'); };
      return it;
    });
  };

  GEN.regeln = function () {
    var plan = shuffle(['pa', 'pm', 'pb', 'pd', 'ka', 'km', 'kd', 'lr', 'pa', 'ka']);
    return plan.map(function (t) {
      var a, b, c, ex, ans, wrong, why;
      if (t === 'pa') { a = R(2, 9); b = R(2, 9); c = R(2, 9); ex = a + ' + ' + b + ' · ' + c; ans = a + b * c; wrong = (a + b) * c;
        why = 'Punkt vor Strich: ' + b + ' · ' + c + ' = ' + b * c + '. Dann ' + a + ' + ' + b * c + ' = ' + ans + '.'; }
      if (t === 'pm') { b = R(2, 5); c = R(2, 6); a = b * c + R(3, 20); ex = a + ' – ' + b + ' · ' + c; ans = a - b * c; wrong = (a - b) * c;
        why = 'Punkt vor Strich: ' + b + ' · ' + c + ' = ' + b * c + '. Dann ' + a + ' – ' + b * c + ' = ' + ans + '.'; }
      if (t === 'pb') { a = R(2, 9); b = R(2, 9); c = R(2, 15); ex = a + ' · ' + b + ' + ' + c; ans = a * b + c; wrong = a * (b + c);
        why = 'Punkt vor Strich: ' + a + ' · ' + b + ' = ' + a * b + '. Dann ' + a * b + ' + ' + c + ' = ' + ans + '.'; }
      if (t === 'pd') { c = R(2, 6); b = c * R(2, 6); a = R(2, 20); ex = a + ' + ' + b + ' : ' + c; ans = a + b / c; wrong = (a + b) % c === 0 ? (a + b) / c : a + b;
        why = 'Punkt vor Strich: ' + b + ' : ' + c + ' = ' + b / c + '. Dann ' + a + ' + ' + b / c + ' = ' + ans + '.'; }
      if (t === 'ka') { a = R(2, 9); b = R(2, 9); c = R(2, 9); ex = '(' + a + ' + ' + b + ') · ' + c; ans = (a + b) * c; wrong = a + b * c;
        why = 'Klammer zuerst: ' + a + ' + ' + b + ' = ' + (a + b) + '. Dann ' + (a + b) + ' · ' + c + ' = ' + ans + '.'; }
      if (t === 'km') { b = R(2, 7); a = b + R(2, 8); c = R(2, 9); ex = c + ' · (' + a + ' – ' + b + ')'; ans = c * (a - b); wrong = c * a - b;
        why = 'Klammer zuerst: ' + a + ' – ' + b + ' = ' + (a - b) + '. Dann ' + c + ' · ' + (a - b) + ' = ' + ans + '.'; }
      if (t === 'kd') { c = R(2, 6); var s = c * R(3, 9); a = R(2, s - 2); b = s - a; ex = '(' + a + ' + ' + b + ') : ' + c; ans = s / c; wrong = b % c === 0 ? a + b / c : ans + c;
        why = 'Klammer zuerst: ' + a + ' + ' + b + ' = ' + s + '. Dann ' + s + ' : ' + c + ' = ' + ans + '.'; }
      if (t === 'lr') { a = R(20, 40); b = R(3, 9); c = R(2, 9); ex = a + ' – ' + b + ' + ' + c; ans = a - b + c; wrong = a - (b + c);
        why = 'Nur Strich: Rechne von links nach rechts. ' + a + ' – ' + b + ' = ' + (a - b) + '. Dann ' + (a - b) + ' + ' + c + ' = ' + ans + '.'; }
      return { head: S('Rechne. Denke an die Rechenregeln.'), body: '<div class="card cmpq eqc">' + ex + ' = ?</div>', choices: nums(three(ans, [wrong, ans + 2, ans - 2])), ans: ans, why: S(why), cols: 3 };
    });
  };

  GEN.mdueb = function () {
    function pick(len) { for (var t = 0; t < 400; t++) { var n = R(Math.pow(10, len - 1) + 1, Math.pow(10, len) - 1), d = nxt(n); if (d === 4 || d === 5 || n % Math.pow(10, len - 1) === 0) continue; return n; } return 38; }
    var plan = shuffle(['r2', 'r2', 'r3', 'r3', 'r3', 'r4']).concat(shuffle(['ky', 'kn', 'ky', 'kn']));
    return plan.map(function (t) {
      var a = pick(t === 'r2' ? 2 : t === 'r4' ? 4 : 3), b = R(2, 9), x = rnd1(a), u = x * b, ex = a * b, p = Math.pow(10, String(a).length - 1);
      var other = x === Math.floor(a / p) * p ? x + p : x - p;
      var why = fmt(a) + ' ≈ ' + fmt(x) + '. Die ' + b + ' bleibt. Ü: ' + fmt(x) + ' · ' + b + ' = ' + fmt(u) + '.';
      if (t[0] === 'r') return { head: S('Mache einen Überschlag.'), body: eqCard([fmt(a), MP, b]), choices: nums(three(u, [other * b, u * 10, u + p])), ans: u, cols: 3, why: S(why) };
      var good = t === 'ky', shown = good ? ex : (Math.random() < .5 || ex < 100 ? ex * 10 : Math.floor(ex / 10));
      return { head: S('Kann das Ergebnis stimmen? Mache einen Überschlag.'), body: eqCard([fmt(a), MP, b, '=', fmt(shown)]), cols: 2,
        ans: good ? 'j' : 'n', choices: [{ v: 'j', h: S('kann stimmen') }, { v: 'n', h: S('kann nicht stimmen') }],
        why: S(why + ' ' + fmt(shown) + (good ? ' ist nah an ' + fmt(u) + '. Es kann stimmen.' : ' ist weit weg von ' + fmt(u) + '. Richtig ist ' + fmt(ex) + '.')) };
    });
  };

  GEN.halb = function () {
    var plan = shuffle(['2z', '2e', '2s', '2s', '2e', '3h', '3z', '3s', '3s', '2s']);
    return plan.map(function (t) {
      var a, b, parts;
      do { a = t[0] === '2' ? R(21, 98) : R(112, 489); b = R(2, 9); } while (a % 10 === 0 || (t[0] === '3' && Math.floor(a / 10) % 10 === 0));
      var A = String(a); parts = A.split('').map(function (d, k) { return +d * Math.pow(10, A.length - 1 - k); });
      var prods = parts.map(function (p) { return p * b; }), total = a * b;
      var miss = t[1] === 's' ? parts.length : t[1] === 'e' ? parts.length - 1 : t[1] === 'z' ? parts.length - 2 : 0;
      var lines = parts.map(function (p, k) { return [fmt(p) + ' · ' + b + ' = ', fmt(prods[k])]; });
      lines.push([prods.map(fmt).join(' + ') + ' = ', fmt(total)]);
      var ans = miss === parts.length ? total : prods[miss];
      function card(done) {
        return '<div class="card hlw"><div class="hlq">' + a + ' · ' + b + '</div>' + lines.map(function (l, k) {
          if (done || k < miss) return '<div class="hll">' + l[0] + '<b>' + l[1] + '</b></div>';
          if (k === miss) return '<div class="hll">' + l[0] + '<b class="qb' + (done ? ' set' : '') + '">?</b></div>';
          return '<div class="hll hid">…</div>';
        }).join('') + '</div>';
      }
      var w = miss === parts.length ? [total + 10, total - 10, sum(parts.slice(0, -1).map(function (p) { return p * b; })) + parts[parts.length - 1]] : [ans * 10, ans % 10 === 0 ? ans / 10 : ans + b, ans + b];
      var it = { head: S('Rechne halbschriftlich. Welche Zahl fehlt?'), body: '<div id="hw">' + card(false) + '</div>', choices: nums(three(ans, w)), ans: ans, cols: 3,
        why: S('Zerlege ' + a + ' in ' + parts.map(fmt).join(' und ') + '. Multipliziere jeden Teil mit ' + b + '. Addiere am Schluss: ' + prods.map(fmt).join(' + ') + ' = ' + fmt(total) + '.') };
      it.after = function () { document.getElementById('hw').innerHTML = card(true); };
      return it;
    });
  };

  GEN.mul1 = function () {
    var spec = ['o3', 'o3', 'c2', 'c3', 'c3', 'c3', 'c3', 'k4', 'k4', 'c2'];
    return spec.map(function (t) {
      var a, b, tries = 0, ok;
      do {
        tries++; b = R(2, 9); a = t === 'c2' ? R(12, 98) : R(102, 989);
        var r = a * b, c = hasCarry(a, b);
        ok = t === 'o3' ? !c && r < 1000 : t === 'c2' ? c : t === 'c3' ? c && r < 1000 : c && r >= 1000;
      } while (!ok && tries < 800);
      var ans = a * b, A = String(a), forgot = 0, steps = [], cr = 0, NAME = ['Einer', 'Zehner', 'Hunderter'];
      for (var p = 0; p < A.length; p++) {
        var d = +A[A.length - 1 - p], s = d * b, s2 = s + cr, last = p === A.length - 1;
        forgot += (last ? s : s % 10) * Math.pow(10, p);
        steps.push(NAME[p] + ': ' + b + ' · ' + d + ' = ' + s + (cr ? ', ' + s + ' + ' + cr + ' = ' + s2 : '') + '. ' + (last ? 'Schreibe ' + s2 + '.' : 'Schreibe ' + (s2 % 10) + (Math.floor(s2 / 10) ? ', merke ' + Math.floor(s2 / 10) : '') + '.'));
        cr = Math.floor(s2 / 10);
      }
      var it = { head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card kgw" id="kg">' + kgMul(a, b, false) + '</div>',
        choices: nums(three(ans, [forgot !== ans ? forgot : ans + 10 * b, ans + 100, ans - 10])), ans: ans, cols: 3, why: S('Beginne hinten bei den Einern. ' + steps.join(' ')) };
      it.after = function () { document.getElementById('kg').innerHTML = kgMul(a, b, true); };
      return it;
    });
  };

  GEN.mul2 = function () {
    function addCarry(a, b) { var p1 = a * Math.floor(b / 10) * 10, p2 = a * (b % 10); for (var k = 0; k < 5; k++) if (dig(p1, k) + dig(p2, k) > 9) return true; return false; }
    var spec = ['o', 'o', 'c', 'c', 'c', 'c', 'c', 'k', 'k', 'c'];
    return spec.map(function (t) {
      var a, b, tries = 0, ok;
      do {
        tries++; a = R(12, 98); b = R(12, 98);
        var r = a * b, c = addCarry(a, b) || hasCarry(a, Math.floor(b / 10)) || hasCarry(a, b % 10);
        ok = b % 10 !== 0 && a % 10 !== 0 && (t === 'o' ? !c && r < 1000 : t === 'c' ? c && r < 10000 : r >= 2000);
      } while (!ok && tries < 800);
      var z = Math.floor(b / 10), e = b % 10, ans = a * b, noShift = a * z + a * e;
      var why = 'Zehner zuerst: ' + a + ' · ' + z + ' = ' + fmt(a * z) + '. Dann die Einer: ' + a + ' · ' + e + ' = ' + fmt(a * e) + '. Diese Zeile rückt eine Stelle nach rechts. Addiere die beiden Zeilen: ' + fmt(ans) + '.';
      var it = { head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card kgw" id="kg">' + kgMul(a, b, false) + '</div>',
        choices: nums(three(ans, [noShift, ans + 100, ans - 10])), ans: ans, cols: 3, why: S(why) };
      it.after = function () { document.getElementById('kg').innerHTML = kgMul(a, b, true); };
      return it;
    });
  };

  GEN.div = function () {
    function classify(dd, dv) { var D = String(dd), cur = +D[0], rem = false, zero = false;
      for (var k = 0; k < D.length; k++) { if (k) cur = cur * 10 + (+D[k]); var q = Math.floor(cur / dv); if (q === 0) zero = true; cur -= q * dv; if (cur && k < D.length - 1) rem = true; }
      return { rem: rem, zero: zero }; }
    var spec = ['3o', '3r', '3r', '3r', '30', '4r', '4r', '4r', '40', '3r'];
    return spec.map(function (t) {
      var dv, dd, tries = 0, ok;
      do {
        tries++; dv = R(2, 9); var len = +t[0];
        dd = dv * R(Math.ceil(Math.pow(10, len - 1) / dv), Math.floor((Math.pow(10, len) - 1) / dv));
        var f = +String(dd)[0], cl = classify(dd, dv);
        ok = String(dd).length === len && f % dv === 0 && (t[1] === 'o' ? !cl.rem && !cl.zero : t[1] === 'r' ? cl.rem && !cl.zero : cl.zero);
      } while (!ok && tries < 2000);
      var ans = dd / dv, A = String(ans), dropZero = +A.replace(/0/g, '') || ans + 1;
      var it = { head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card kgw" id="kg">' + kgDiv(dd, dv, false) + '</div>',
        choices: nums(three(ans, [dropZero !== ans ? dropZero : ans + 10, ans + 1, ans - 1])), ans: ans, cols: 3,
        why: S(divRows(dd, dv).txt.join(' ') + ' Probe: ' + fmt(ans) + ' · ' + dv + ' = ' + fmt(dd) + '.') };
      it.after = function () { document.getElementById('kg').innerHTML = kgDiv(dd, dv, true); };
      return it;
    });
  };

  GEN.mdsach = function () {
    var T = [
      function () { var a = R(5, 9), b = R(3, 4); return { t: 'Im Bus sitzen die Kinder in ' + a + ' Reihen. In jeder Reihe sitzen ' + b + ' Kinder. Wie viele Kinder sitzen im Bus?', x: a, y: b, op: MP, why: 'Gleich viele in jeder Reihe, und du suchst alle zusammen: Du rechnest mal.' }; },
      function (n) { var a = R(3, 6); return { t: 'Eine Fahrt mit der Sommerrodelbahn kostet 2 €. ' + n[0] + ' fährt ' + a + '-mal. Wie viel bezahlt ' + n[1] + ' zusammen?', x: a, y: 2, op: MP, why: 'Jede Fahrt kostet gleich viel. Du rechnest mal.' }; },
      function () { var g = R(3, 6), k = g * R(4, 6); return { t: k + ' Kinder werden auf ' + g + ' gleich große Gruppen verteilt. Wie viele Kinder sind in einer Gruppe?', x: k, y: g, op: ':', why: 'Die Kinder werden verteilt. Du rechnest geteilt.' }; },
      function () { var a = R(6, 12), b = R(3, 4); return { t: 'In der Jugendherberge gibt es ' + a + ' Zimmer. In jedem Zimmer stehen ' + b + ' Betten. Wie viele Betten sind es zusammen?', x: a, y: b, op: MP, why: 'In jedem Zimmer gleich viele Betten: Du rechnest mal.' }; },
      function (n) { var p = R(4, 6), k = p * R(3, 6); return { t: n[0] + ' verteilt ' + k + ' Kekse gerecht auf ' + p + ' Teller. Wie viele Kekse liegen auf einem Teller?', x: k, y: p, op: ':', why: 'Gerecht verteilen heißt: Du rechnest geteilt.' }; },
      function (n) { var a = R(2, 4); return { t: 'In einer Kiste sind 12 Flaschen Wasser. ' + n[0] + ' trägt ' + a + ' Kisten in den Bus. Wie viele Flaschen sind das?', x: a, y: 12, op: MP, why: 'In jeder Kiste gleich viele Flaschen: Du rechnest mal.' }; },
      function () { var k = R(4, 6), p = R(12, 18); return { t: 'Der Kletterwald kostet für ' + k + ' Kinder zusammen ' + k * p + ' €. Wie viel kostet er für ein Kind?', x: k * p, y: k, op: ':', why: 'Der Preis wird gerecht auf die Kinder verteilt. Du rechnest geteilt.' }; },
      function () { var d = R(2, 3), km = R(6, 9); return { t: 'Die Klasse wandert ' + d + ' Tage lang. Jeden Tag wandert sie ' + km + ' Kilometer. Wie viele Kilometer sind das zusammen?', x: d, y: km, op: MP, why: 'Jeden Tag gleich weit, und du suchst alles zusammen: Du rechnest mal.' }; },
      function () { var p = R(3, 4), k = p * R(6, 9); return { t: 'In ein Kanu passen ' + p + ' Kinder. Wie viele Kanus braucht man für ' + k + ' Kinder?', x: k, y: p, op: ':', why: 'Die Kinder werden auf die Kanus verteilt. Du rechnest geteilt.' }; },
      function (n) { var a = R(3, 6); return { t: n[0] + ' kauft ' + a + ' Postkarten. Eine Postkarte kostet 2 €. Wie viel bezahlt ' + n[1] + '?', x: a, y: 2, op: MP, why: 'Jede Postkarte kostet gleich viel. Du rechnest mal.' }; }
    ];
    var names = shuffle(NAMES.slice());
    return shuffle(T.slice()).map(function (f, k) {
      var q = f(names[k % names.length]), x = q.x, y = q.y, r = q.op === MP ? x * y : x / y;
      var good = x + ' ' + q.op + ' ' + y, alt = q.op === MP ? [x + ' + ' + y, x + ' : ' + y] : [x + ' · ' + y, x + ' – ' + y];
      return { head: S('Welche Rechnung passt?'), body: '<div class="card story">' + S(q.t) + '</div>', cols: 1, ans: good,
        choices: shuffle([good].concat(alt)).map(function (c) { return { v: c, h: c }; }),
        why: S(q.why + ' ' + good + ' = ' + fmt(r) + '.') };
    });
  };

  // ------------------------------------------------------------ Ablauf
  var set, i, ok;
  function head(it) {
    return '<p class="cnt">' + L.task + ' ' + (i + 1) + ' ' + L.of + ' ' + set.length + '</p><p class="rq">' + it.head + '</p>';
  }
  function show() {
    var it = set[i];
    if (it.kind === 'order') return order(it);
    app.innerHTML = head(it) + (it.body || '') +
      (it.kind === 'tap' ? '' : '<div class="rch c' + (it.cols || it.choices.length) + '">' + it.choices.map(function (c) {
        return '<button class="ch rc" type="button" data-v="' + c.v + '">' + c.h + '</button>';
      }).join('') + '</div>') + '<div id="fb"></div>';
    var bs = [].slice.call(app.querySelectorAll('.rc, .tp')), fin = false;
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        if (fin) return; fin = true;
        var v = b.getAttribute('data-v'), good = v === String(it.ans);
        if (good) ok++;
        bs.forEach(function (x) { if (x.tagName === 'BUTTON') x.disabled = true; if (x.getAttribute('data-v') === String(it.ans)) x.classList.add('ok'); });
        if (!good) b.classList.add('no');
        if (it.after) it.after(good, v);
        feedback(good, it.why);
      });
    });
    top();
  }
  function order(it) {
    var placed = [], fin = false;
    function draw() {
      var slots = '';
      for (var k = 0; k < it.nums.length; k++) {
        if (k) slots += '<span class="olt">&lt;</span>';
        var v = placed[k];
        slots += '<button class="os' + (v !== undefined ? ' f' : '') + '" type="button" data-k="' + k + '"' + (fin ? ' disabled' : '') + '>' + (v !== undefined ? fmt(v) : '') + '</button>';
      }
      app.innerHTML = head(it) + '<div class="osl">' + slots + '</div><div class="rch c2 opool">' + it.nums.map(function (v) {
        return '<button class="ch rc" type="button" data-v="' + v + '"' + (placed.indexOf(v) >= 0 || fin ? ' disabled' : '') + '>' + fmt(v) + '</button>';
      }).join('') + '</div><div id="fb"></div>';
      [].slice.call(app.querySelectorAll('.opool .rc')).forEach(function (b) {
        b.onclick = function () {
          if (fin) return;
          placed.push(+b.getAttribute('data-v'));
          if (placed.length === it.nums.length) {
            fin = true;
            var good = placed.every(function (v, k) { return v === it.ans[k]; });
            if (good) ok++;
            draw();
            [].slice.call(app.querySelectorAll('.os')).forEach(function (s, k) { s.classList.add(placed[k] === it.ans[k] ? 'ok' : 'no'); });
            feedback(good, it.why);
          } else draw();
        };
      });
      [].slice.call(app.querySelectorAll('.os.f')).forEach(function (s) {
        s.onclick = function () { if (fin) return; placed.splice(+s.getAttribute('data-k'), 1); draw(); };
      });
    }
    draw(); top();
  }
  function feedback(good, why) {
    document.getElementById('fb').innerHTML =
      '<div class="fbx ' + (good ? 'okb' : 'nob') + '">' + (good ? L.icOk + '<b>' + L.right + '</b>' : L.icNo + '<b>' + L.wrong + '</b>') +
      ' <span>' + why + '</span></div>' +
      '<button class="btn pri nxt" id="nx" type="button">' + L.icNext + '<span>' + L.next + '</span></button>';
    var nx = document.getElementById('nx');
    nx.onclick = function () { i++; if (i < set.length) show(); else end(); };
    var r = nx.getBoundingClientRect();
    if (r.bottom > window.innerHeight) window.scrollBy({ top: r.bottom - window.innerHeight + 16, behavior: 'smooth' });
  }
  function top() { var r = app.getBoundingClientRect(); if (r.top < 0) window.scrollBy({ top: r.top - 12 }); }
  function end() {
    app.innerHTML = '<div class="done">' + L.done + ' ' + L.first + ' ' + ok + ' ' + L.of + ' ' + set.length + '</div>' +
      '<button class="btn pri" id="ag" type="button">' + L.icAgain + '<span>' + L.again + '</span></button>';
    document.getElementById('ag').onclick = start;
    top();
  }
  function start() { set = GEN[D.type](); i = 0; ok = 0; show(); }
  start();
  window.__mt = { set: function () { return set; }, i: function () { return i; } };
})();
