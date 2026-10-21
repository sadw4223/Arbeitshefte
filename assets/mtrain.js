/* Übungen am Tablet (Mathe): zehn Aufgaben zum Antippen, nach jeder Antwort Rückmeldung mit kurzer Begründung, am Ende Auswertung.
   Der Typ steht in den Seitendaten: runden, zahlwort, wert, nachbar, zstrahl, vergl (Natürliche Zahlen);
   begriffe, kopf, luecke, add, sub, ueb, sach, klammern (Addition und Subtraktion);
   mdbegriffe, einmaleins, mdluecke, regeln, mdueb, halb, mul1, mul2, div, mdsach (Multiplikation und Division);
   linien, messen, senkpar, koord, symm, spiegeln, schatz (Grundlagen der Geometrie: auch Ziehen, Zuordnen, Verbinden und Antippen in der Zeichnung);
   ufrechteck, ufumfang, ufurechnen, ufflaeche, ufeinheiten, ufarechnen, ufunterschied, ufsach (Umfang und Flächeninhalt).
   Schreibweise wie im Heft. */
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
      if (tok === '|') return '|';   // Koordinaten (3 | 2)
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
      // Zeile über der Aufgabe: Zahl im Sinn klein über dem nächsten Ergebniskästchen (wie im Heft)
      var cin = mulCarries(a, +B), lr = Rs.length, row = '';
      for (var k = 0; k <= W; k++) row += td('', 'x');
      for (var i = 0; i < lr; i++) { var p = lr - 1 - i; row += td(fill && p >= 1 && p <= A.length - 1 && cin[p] ? cin[p] : '', 'x ob'); }
      return h.replace('<table class="kgr"><tr>', '<table class="kgr"><tr class="obr">' + row + '</tr><tr>') + '</table>';
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
    h += '<tr class="uer">'; for (var c2 = 0; c2 < W; c2++) h += td(car[c2] ? '<small>' + car[c2] + '</small>' : '', 'k uw ac'); h += '<td class="x" colspan="9"></td></tr>';
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
        cur = rem * 10 + (+D[k + 1]); k++; txt.push('Ziehe die ' + D[k] + ' herunter.');
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

  // Farbig (blau) ist, was zuerst gerechnet wird, und sein Ergebnis: so sieht man, woher die Zahl kommt
  function pv(t) { return '<span class="pv">' + S(t) + '</span>'; }
  GEN.regeln = function () {
    var plan = shuffle(['pa', 'pm', 'pb', 'pd', 'ka', 'km', 'kd', 'lr', 'pa', 'ka']);
    return plan.map(function (t) {
      var a, b, c, ex, ans, wrong, why, f, r;   // ex = [vorne, zuerst, hinten]; f = erste Rechnung, r = ihr Ergebnis
      if (t === 'pa') { a = R(2, 9); b = R(2, 9); c = R(2, 9); r = b * c; ex = [a + ' + ', b + ' · ' + c, '']; ans = a + r; wrong = (a + b) * c;
        why = S('Punkt vor Strich: ') + pv(b + ' · ' + c + ' = ' + r) + S('. Dann ' + a + ' + ') + pv(r) + S(' = ' + ans + '.'); }
      if (t === 'pm') { b = R(2, 5); c = R(2, 6); a = b * c + R(3, 20); r = b * c; ex = [a + ' – ', b + ' · ' + c, '']; ans = a - r; wrong = (a - b) * c;
        why = S('Punkt vor Strich: ') + pv(b + ' · ' + c + ' = ' + r) + S('. Dann ' + a + ' – ') + pv(r) + S(' = ' + ans + '.'); }
      if (t === 'pb') { a = R(2, 9); b = R(2, 9); c = R(2, 15); r = a * b; ex = ['', a + ' · ' + b, ' + ' + c]; ans = r + c; wrong = a * (b + c);
        why = S('Punkt vor Strich: ') + pv(a + ' · ' + b + ' = ' + r) + S('. Dann ') + pv(r) + S(' + ' + c + ' = ' + ans + '.'); }
      if (t === 'pd') { c = R(2, 6); b = c * R(2, 6); a = R(2, 20); r = b / c; ex = [a + ' + ', b + ' : ' + c, '']; ans = a + r; wrong = (a + b) % c === 0 ? (a + b) / c : a + b;
        why = S('Punkt vor Strich: ') + pv(b + ' : ' + c + ' = ' + r) + S('. Dann ' + a + ' + ') + pv(r) + S(' = ' + ans + '.'); }
      if (t === 'ka') { a = R(2, 9); b = R(2, 9); c = R(2, 9); r = a + b; ex = ['', '(' + a + ' + ' + b + ')', ' · ' + c]; ans = r * c; wrong = a + b * c;
        why = S('Klammer zuerst: ') + pv(a + ' + ' + b + ' = ' + r) + S('. Dann ') + pv(r) + S(' · ' + c + ' = ' + ans + '.'); }
      if (t === 'km') { b = R(2, 7); a = b + R(2, 8); c = R(2, 9); r = a - b; ex = [c + ' · ', '(' + a + ' – ' + b + ')', '']; ans = c * r; wrong = c * a - b;
        why = S('Klammer zuerst: ') + pv(a + ' – ' + b + ' = ' + r) + S('. Dann ' + c + ' · ') + pv(r) + S(' = ' + ans + '.'); }
      if (t === 'kd') { c = R(2, 6); var s = c * R(3, 9); a = R(2, s - 2); b = s - a; r = s; ex = ['', '(' + a + ' + ' + b + ')', ' : ' + c]; ans = s / c; wrong = b % c === 0 ? a + b / c : ans + c;
        why = S('Klammer zuerst: ') + pv(a + ' + ' + b + ' = ' + s) + S('. Dann ') + pv(s) + S(' : ' + c + ' = ' + ans + '.'); }
      if (t === 'lr') { a = R(20, 40); b = R(3, 9); c = R(2, 9); r = a - b; ex = ['', a + ' – ' + b, ' + ' + c]; ans = r + c; wrong = a - (b + c);
        why = S('Nur Strich: Rechne von links nach rechts. ') + pv(a + ' – ' + b + ' = ' + r) + S('. Dann ') + pv(r) + S(' + ' + c + ' = ' + ans + '.'); }
      var it = { head: S('Rechne. Denke an die Rechenregeln.'), body: '<div class="card cmpq eqc" id="rq"><span>' + ex.join('') + ' = ?</span></div>', choices: nums(three(ans, [wrong, ans + 2, ans - 2])), ans: ans, why: why, cols: 3 };
      // nach der Antwort: in der Aufgabe wird farbig, was zuerst gerechnet wird
      it.after = function () { document.getElementById('rq').innerHTML = '<span>' + ex[0] + '<span class="pv">' + ex[1] + '</span>' + ex[2] + ' = ' + ans + '</span>'; };
      return it;
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

  // Stellenfarben beim Zerlegen (wie in der Erklärung): Hunderter lila, Zehner blau, Einer orange
  function stc(len, k) { return ['ze', 'zz', 'zh'][len - 1 - k]; }
  function cs(t, c) { return '<span class="' + c + '">' + t + '</span>'; }
  GEN.halb = function () {
    var plan = shuffle(['2z', '2e', '2s', '2s', '2e', '3h', '3z', '3s', '3s', '2s']);
    return plan.map(function (t) {
      var a, b;
      do { a = t[0] === '2' ? R(21, 98) : R(112, 489); b = R(2, 9); } while (a % 10 === 0 || (t[0] === '3' && Math.floor(a / 10) % 10 === 0));
      var A = String(a), n = A.length, parts = A.split('').map(function (d, k) { return +d * Math.pow(10, n - 1 - k); });
      var prods = parts.map(function (p) { return p * b; }), total = a * b;
      var miss = t[1] === 's' ? n : t[1] === 'e' ? n - 1 : t[1] === 'z' ? n - 2 : 0;
      var aCol = A.split('').map(function (d, k) { return cs(d, stc(n, k)); }).join('');
      var lines = parts.map(function (p, k) { return [cs(fmt(p), stc(n, k)) + ' · ' + b + ' = ', fmt(prods[k]), stc(n, k)]; });
      lines.push([prods.map(function (q, k) { return cs(fmt(q), stc(n, k)); }).join(' + ') + ' = ', fmt(total), '']);
      var ans = miss === n ? total : prods[miss];
      function card(done) {
        return '<div class="card hlw"><div class="hlq">' + aCol + ' · ' + b + '</div>' + lines.map(function (l, k) {
          if (done || k < miss) return '<div class="hll">' + l[0] + '<b' + (l[2] ? ' class="' + l[2] + '"' : '') + '>' + l[1] + '</b></div>';
          if (k === miss) return '<div class="hll">' + l[0] + '<b class="qb' + (done ? ' set' : '') + '">?</b></div>';
          return '<div class="hll hid">…</div>';
        }).join('') + '</div>';
      }
      var w = miss === n ? [total + 10, total - 10, sum(parts.slice(0, -1).map(function (p) { return p * b; })) + parts[n - 1]] : [ans * 10, ans % 10 === 0 ? ans / 10 : ans + b, ans + b];
      var it = { head: S('Rechne halbschriftlich. Welche Zahl fehlt?'), body: '<div id="hw">' + card(false) + '</div>', choices: nums(three(ans, w)), ans: ans, cols: 3,
        why: S('Zerlege ' + a + ' in ') + parts.map(function (p, k) { return cs(S(fmt(p)), stc(n, k)); }).join(S(' und ')) +
          S('. Multipliziere jeden Teil mit ' + b + '. Addiere am Schluss: ') + prods.map(function (q, k) { return cs(S(fmt(q)), stc(n, k)); }).join(' + ') + S(' = ' + fmt(total) + '.') };
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
        steps.push(NAME[p] + ': ' + b + ' · ' + d + ' = ' + s + (cr ? '. Dazu die ' + cr + ' im Sinn: ' + s + ' + ' + cr + ' = ' + s2 : '') + '. ' + (last ? 'Schreibe ' + s2 + '.' : Math.floor(s2 / 10) ? (s2 % 10) + ' hin, ' + Math.floor(s2 / 10) + ' im Sinn.' : 'Schreibe ' + s2 + '.'));
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
      var why = 'Zehner zuerst: ' + a + ' · ' + z + ' = ' + fmt(a * z) + '. Die letzte Ziffer steht unter der ' + z + '. Dann die Einer: ' + a + ' · ' + e + ' = ' + fmt(a * e) +
        '. Diese Zeile rückt eine Stelle nach rechts. Behalte die Zahl im Sinn bei jedem Schritt. Addiere die beiden Zeilen: ' + fmt(ans) + '.';
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


  // ------------------------------------------------------------ Klammern und Rechenvorteile (Addition und Subtraktion, Kapitel 8)
  function kTrip() { var b = R(1, 4) * 10 + (Math.random() < .5 ? 5 : 0), c = R(2, 9), a = b + c + R(2, 5) * 10; return [a, b, c]; }
  function kPar(t) { return t[0] + ' – <span class="pv">(' + t[1] + ' + ' + t[2] + ')</span>'; }
  function kLin(t) { return t[0] + ' – ' + t[1] + ' + ' + t[2]; }
  GEN.klammern = function () {
    var set = [];
    [1, 1, 1, 0, 0].forEach(function (par) {
      var t = kTrip(), a = t[0], b = t[1], c = t[2], wp = a - (b + c), wl = a - b + c, ans = par ? wp : wl;
      set.push({ head: S('Rechne. Was kommt heraus?'), body: '<div class="card cmpq">' + (par ? kPar(t) : kLin(t)) + '</div>', cols: 3, ans: ans,
        choices: nums(three(ans, [par ? wl : wp, ans + 10, ans - 10])),
        why: S(par ? 'Zuerst die Klammer: ' + b + ' + ' + c + ' = ' + (b + c) + '. Dann ' + a + ' – ' + (b + c) + ' = ' + ans + '.'
          : 'Keine Klammer: Rechne von links nach rechts. ' + a + ' – ' + b + ' = ' + (a - b) + '. Dann ' + (a - b) + ' + ' + c + ' = ' + ans + '.') });
    });
    // Verbinden: Rechnung und Ergebnis
    var t1, t2, ok2 = false, n2 = 0;
    do { t1 = kTrip(); t2 = kTrip(); n2++; ok2 = [t1[0] - t1[1] - t1[2], t1[0] - t1[1] + t1[2], t2[0] - t2[1] - t2[2]].filter(function (v, i, A) { return A.indexOf(v) === i; }).length === 3; } while (!ok2 && n2 < 200);
    var L3 = [{ h: kPar(t1), k: t1[0] - t1[1] - t1[2] }, { h: kLin(t1), k: t1[0] - t1[1] + t1[2] }, { h: kPar(t2), k: t2[0] - t2[1] - t2[2] }];
    set.push({ kind: 'match', mcls: 'eq', head: S('Verbinde jede Rechnung mit ihrem Ergebnis.'), left: L3,
      right: shuffle(L3.map(function (x) { return { h: String(x.k), k: x.k }; })),
      why: S('Mit Klammer: die Klammer zuerst. Ohne Klammer: von links nach rechts.') });
    // Welche Rechnung ergibt …?
    [1, 0].forEach(function (par) {
      var t = kTrip(), a = t[0], b = t[1], c = t[2], r = par ? a - (b + c) : a - b + c;
      set.push({ head: S('Welche Rechnung ergibt ' + r + '?'), cols: 1, ans: par ? 'r' : 'l',
        choices: shuffle([{ v: 'r', h: kPar(t) }, { v: 'l', h: '<span class="pv">(' + a + ' – ' + b + ')</span> + ' + c }]),
        why: S(par ? a + ' – (' + b + ' + ' + c + ') = ' + a + ' – ' + (b + c) + ' = ' + r + '.' : '(' + a + ' – ' + b + ') + ' + c + ' = ' + (a - b) + ' + ' + c + ' = ' + r + '.') });
    });
    // Rechenvorteil: Welche zwei Zahlen zuerst?
    for (var k = 0; k < 2; k++) {
      var p, q, r2, e;
      do { p = R(11, 48); e = p % 10; r2 = (10 - e) + (Math.random() < .5 ? 0 : R(1, 3) * 10); q = R(12, 49); }
      while (e === 0 || q % 10 === 0 || (q % 10 + e) % 10 === 0 || (q % 10 + r2 % 10) % 10 === 0 || r2 === p);
      var ord = shuffle([p, q, r2]), lab = function (x, y) { return x + ' + ' + y; };
      var pairs = [[p, r2], [p, q], [q, r2]].map(function (x) { var s2 = x.slice().sort(function (u, w) { return ord.indexOf(u) - ord.indexOf(w); }); return lab(s2[0], s2[1]); });
      set.push({ head: S('Rechne geschickt: Welche zwei Zahlen rechnest du zuerst?'), body: '<div class="card cmpq">' + ord.join(' + ') + '</div>', cols: 3, ans: pairs[0],
        choices: shuffle(pairs.map(function (x) { return { v: x, h: x }; })),
        why: S('Die Einer ' + e + ' und ' + (r2 % 10) + ' ergeben zusammen 10. ' + pairs[0] + ' = ' + (p + r2) + '. Dann ' + (p + r2) + ' + ' + q + ' = ' + (p + q + r2) + '.') });
    }
    return set;
  };

  // ============================================================ Grundlagen der Geometrie
  // Zeichnungen exakt konstruiert wie im Heft: Punkte als ×, Anfang und Ende von Linien als ●, rechte Winkel mit Viertelkreis und Punkt.
  var GRY = '#777', KLC = '#d9d9d9', ACL = '#e5edf5', IMGP = '../../assets/img/';
  function f1(v) { return Math.round(v * 10) / 10; }
  function sv(w, h, inner, cls, id) { return '<svg class="gsv ' + (cls || '') + '"' + (id ? ' id="' + id + '"' : '') + ' viewBox="0 0 ' + w + ' ' + h + '">' + inner + '</svg>'; }
  function ln(x1, y1, x2, y2, c, sw, dash) {
    return '<line x1="' + f1(x1) + '" y1="' + f1(y1) + '" x2="' + f1(x2) + '" y2="' + f1(y2) + '" stroke="' + (c || INK) + '" stroke-width="' + (sw || 4) +
      '" stroke-linecap="' + (dash ? 'butt' : 'round') + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function cr(x, y, c, s, sw) { s = s || 9; return '<path d="M' + f1(x - s) + ' ' + f1(y - s) + 'L' + f1(x + s) + ' ' + f1(y + s) + 'M' + f1(x - s) + ' ' + f1(y + s) + 'L' + f1(x + s) + ' ' + f1(y - s) + '" stroke="' + (c || INK) + '" stroke-width="' + (sw || 4) + '" stroke-linecap="round"/>'; }
  function dt(x, y, r, c) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + (r || 8) + '" fill="' + (c || INK) + '"/>'; }
  function tx(x, y, t, size, c, w, anchor, it) {
    return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + (size || 26) + '" font-weight="' + (w || 700) + '" fill="' + (c || INK) + '" text-anchor="' + (anchor || 'middle') + '"' + (it ? ' font-style="italic"' : '') + '>' + t + '</text>';
  }
  function pg(pts, c, sw, fill) { return '<polygon points="' + pts.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') + '" fill="' + (fill || 'none') + '" stroke="' + (c || INK) + '" stroke-width="' + (sw || 4) + '" stroke-linejoin="round"/>'; }
  function ax(x1, y1, x2, y2, c, sw) { return ln(x1, y1, x2, y2, c || AC, sw || 5, '14 9'); }
  function rwj(x, y, ux, uy, vx, vy, c, r) {
    r = r || 24; var n1 = Math.hypot(ux, uy), n2 = Math.hypot(vx, vy); ux /= n1; uy /= n1; vx /= n2; vy /= n2;
    var sw = ux * vy - uy * vx > 0 ? 1 : 0;
    return '<path d="M' + f1(x + ux * r) + ' ' + f1(y + uy * r) + ' A' + r + ' ' + r + ' 0 0 ' + sw + ' ' + f1(x + vx * r) + ' ' + f1(y + vy * r) + '" fill="none" stroke="' + (c || AC) + '" stroke-width="3"/>' +
      dt(x + (ux + vx) * r * .42, y + (uy + vy) * r * .42, 3.4, c || AC);
  }
  function karoJ(x0, y0, nx, ny, c) {
    var p = '';
    for (var i = 0; i <= nx; i++) p += 'M' + (x0 + i * c) + ' ' + y0 + 'v' + ny * c;
    for (var j = 0; j <= ny; j++) p += 'M' + x0 + ' ' + (y0 + j * c) + 'h' + nx * c;
    return '<rect x="' + x0 + '" y="' + y0 + '" width="' + nx * c + '" height="' + ny * c + '" fill="#fff"/><path d="' + p + '" stroke="' + KLC + '" stroke-width="1.5" fill="none"/>';
  }
  // Gerade durch (px, py) mit Richtung (dx, dy), abgeschnitten am Rechteck W × H (mit Rand m)
  function clip(px, py, dx, dy, W, H, m) {
    m = m || 0; var t0 = -1e9, t1 = 1e9;
    [[dx, px, m, W - m], [dy, py, m, H - m]].forEach(function (a) {
      if (Math.abs(a[0]) < 1e-9) return;
      var ta = (a[2] - a[1]) / a[0], tb = (a[3] - a[1]) / a[0];
      t0 = Math.max(t0, Math.min(ta, tb)); t1 = Math.min(t1, Math.max(ta, tb));
    });
    return [px + dx * t0, py + dy * t0, px + dx * t1, py + dy * t1];
  }
  function deg(a) { return a * Math.PI / 180; }
  // Abstand Punkt – Strecke
  function dSeg(px, py, l) {
    var dx = l[2] - l[0], dy = l[3] - l[1], q = dx * dx + dy * dy, t = q ? Math.max(0, Math.min(1, ((px - l[0]) * dx + (py - l[1]) * dy) / q)) : 0;
    return Math.hypot(px - l[0] - t * dx, py - l[1] - t * dy);
  }
  // Platz für den Namen einer Geraden: neben der eigenen Linie, möglichst weit weg von allen anderen Linien und Namen
  function labelSpot(l, all, spots, W, H) {
    var best = null, bs = -1, dx = l[2] - l[0], dy = l[3] - l[1], n = Math.hypot(dx, dy), nx = -dy / n, ny = dx / n;
    // nur nahe den Enden der eigenen Linie (wie im Schulbuch), dicht an der Linie
    var ts = []; for (var t = .05; t <= .25; t += .02) { ts.push(t); ts.push(1 - t); }
    ts.forEach(function (t) {
      for (var sd = -1; sd <= 1; sd += 2) {
        var x = l[0] + dx * t + nx * 20 * sd, y = l[1] + dy * t + ny * 20 * sd;
        if (x < 20 || x > W - 20 || y < 24 || y > H - 12) continue;
        var sc = 70;
        all.forEach(function (o) { if (o !== l) sc = Math.min(sc, dSeg(x, y, o)); });
        spots.forEach(function (p) { sc = Math.min(sc, Math.hypot(x - p[0], y - p[1]) * .7); });
        sc -= Math.min(t, 1 - t) * 40;          // lieber ganz am Ende
        if (sc > bs) { bs = sc; best = [x, y]; }
      }
    });
    return best || [l[0] + dx * .1 + 20, l[1] + dy * .1];
  }
  // Schrift mit weißem Rand (bleibt lesbar, auch nah an einer Linie)
  function htx(x, y, t, size) {
    return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + size + '" font-weight="700" font-style="italic" text-anchor="middle" fill="' + INK +
      '" stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke">' + t + '</text>';
  }
  function cxy(x, y) { return '(' + x + NB + '|' + NB + y + ')'; }

  // ------------------------------------------------------------ Gerade, Strecke, Strahl
  var LKIND = { strecke: 'Stre|cke', strahl: 'Strahl', gerade: 'Ge|ra|de' };
  var LWHY = { strecke: 'Zwei Punkte an den Enden: Das ist eine Strecke. Sie hat einen Anfang und ein Ende.',
    strahl: 'Ein Punkt am Anfang, dann geht die Linie bis zum Rand: Das ist ein Strahl.',
    gerade: 'Kein Punkt, die Linie geht von Rand zu Rand: Das ist eine Gerade.' };
  function linePic(kind, W, H) {
    W = W || 700; H = H || 200;
    var a = deg(R(-22, 22)), dx = Math.cos(a), dy = -Math.sin(a), cx = W / 2 + R(-40, 40), cy = H / 2 + R(-15, 15), o = '';
    if (kind === 'strecke') {
      var hl = R(Math.round(W * .2), Math.round(W * .32));
      o = ln(cx - dx * hl, cy - dy * hl, cx + dx * hl, cy + dy * hl) + cr(cx - dx * hl, cy - dy * hl, INK, 11, 4.5) + cr(cx + dx * hl, cy + dy * hl, INK, 11, 4.5);
    } else if (kind === 'strahl') {
      var s = Math.random() < .5 ? 1 : -1, sx = cx - s * dx * W * .3, sy = cy - s * dy * W * .3, e = clip(sx, sy, s * dx, s * dy, W, H);
      o = ln(sx, sy, e[2], e[3]) + cr(sx, sy, INK, 11, 4.5);
    } else {
      var g = clip(cx, cy, dx, dy, W, H);
      o = ln(g[0], g[1], g[2], g[3]);
    }
    return sv(W, H, o);
  }
  var LCATS = [{ v: 'strecke', h: S(LKIND.strecke) }, { v: 'strahl', h: S(LKIND.strahl) }, { v: 'gerade', h: S(LKIND.gerade) }];
  GEN.linien = function () {
    var set = [];
    shuffle(['strecke', 'strahl', 'gerade', one(['strecke', 'strahl', 'gerade'])]).forEach(function (k) {
      set.push({ head: S('Was ist das?'), body: '<div class="card gsw">' + linePic(k) + '</div>', choices: LCATS, ans: k, cols: 3, why: S(LWHY[k]) });
    });
    for (var r = 0; r < 3; r++) {
      var ks = shuffle(['strecke', 'strahl', 'gerade', one(['strecke', 'strahl', 'gerade'])]);
      set.push({ kind: 'sort', head: S('Ziehe jede Linie in das richtige Feld.'), cats: LCATS,
        items: ks.map(function (k) { return { h: linePic(k, 420, 150), c: k }; }),
        why: S('Zähle die Punkte: zwei Punkte = Strecke, ein Punkt = Strahl, kein Punkt = Gerade.') });
    }
    var RF = [['Eine Strecke hat einen Anfang und ein Ende.', 'r'], ['Ein Strahl hat einen Anfang.', 'r'], ['Eine Gerade hat keinen Anfang und kein Ende.', 'r'],
      ['Eine Gerade hat ein Ende.', 'f'], ['Ein Strahl hat zwei Endpunkte.', 'f'], ['Eine Strecke geht immer weiter.', 'f'], ['Eine Strecke kann man messen.', 'r']];
    var RFW = { r: 'Das stimmt.', f: 'Das stimmt nicht.' };
    shuffle(RF).slice(0, 2).forEach(function (q) {
      set.push({ head: S('Richtig oder falsch?'), body: '<div class="card story">' + S(q[0]) + '</div>', cols: 2, ans: q[1],
        choices: [{ v: 'r', h: S('rich|tig') }, { v: 'f', h: S('falsch') }],
        why: S(RFW[q[1]] + ' Strecke: Anfang und Ende. Strahl: Anfang, kein Ende. Gerade: kein Anfang und kein Ende.') });
    });
    set.push({ kind: 'match', head: S('Verbinde den Namen mit dem Bild.'),
      left: LCATS.map(function (c) { return { h: c.h, k: c.v }; }),
      right: shuffle(['strecke', 'strahl', 'gerade'].map(function (k) { return { h: linePic(k, 360, 130), k: k }; })),
      why: S('Zwei Punkte = Strecke, ein Punkt = Strahl, kein Punkt = Gerade.') });
    return set;
  };

  // ------------------------------------------------------------ Strecken messen (Lineal zum Ziehen)
  function rulerSvg(n, u, hi) {
    var o = '<rect x="-14" y="0" width="' + (n * u + 28) + '" height="54" fill="#f4f7fb" stroke="' + INK + '" stroke-width="2.5"/>', p = '';
    for (var k = 0; k <= n * 10; k++) { var h = k % 10 === 0 ? 19 : (k % 5 === 0 ? 12 : 7); p += 'M' + f1(k * u / 10) + ' 0v' + h; }
    o += '<path d="' + p + '" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    for (k = 0; k <= n; k++) o += tx(k * u, 44, String(k), hi === k ? 25 : 21, hi === k ? AC : INK, hi === k ? 800 : 400);
    return o + '<rect x="-14" y="0" width="' + (n * u + 28) + '" height="54" fill="transparent" class="rgrip"/>';
  }
  GEN.messen = function () {
    var U = 60, xa = 70, used = {};
    var names = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['K', 'L'], ['M', 'N'], ['P', 'Q'], ['R', 'S'], ['T', 'U'], ['V', 'W']];
    return names.map(function (nm, i) {
      var n; do { n = R(2, 9); } while (used[n] && Object.keys(used).length < 8); used[n] = 1;
      var y = 60, xb = xa + n * U, start = i < 5 ? R(5, 25) * U / 10 : -R(1, 2) * U;   // Lineal liegt verschoben
      var seg = ln(xa, y, xb, y) + cr(xa, y, INK, 9, 4) + cr(xb, y, INK, 9, 4) + tx(xa, y - 22, nm[0], 26) + tx(xb, y - 22, nm[1], 26);
      function pic(off, hi, fin) {
        return sv(760, 160, seg + (fin ? ln(xb, y + 6, xb, y + 22, AC, 4) : '') +
          '<g id="rul" class="rul" transform="translate(' + (xa + off) + ' ' + (y + 12) + ')">' + rulerSvg(11, U, hi) + '</g>', 'drag', 'rsv');
      }
      var ans = n, w = [n + 1, n - 1, n + 2];
      if (start < 0) w = [n - start / U, n + 1, n - 1];
      var it = { head: S('Ziehe das Lineal an die Strecke. Wie lang ist sie?'), body: '<div class="card gsw">' + pic(start) + '</div>',
        choices: three(ans, w).map(function (v) { return { v: v, h: v + NB + 'cm' }; }), ans: ans, cols: 3,
        why: S('Lege die 0 genau an den Punkt ' + nm[0] + '. Am Punkt ' + nm[1] + ' steht die ' + n + '. Die Strecke ist ' + n + ' cm lang.') };
      it.init = function () { dragRuler(document.getElementById('rsv'), U, xa); };
      it.after = function () {
        var g = document.getElementById('rul'); if (!g) return;
        g.style.transition = 'transform .6s ease'; g.setAttribute('transform', 'translate(' + xa + ' ' + (y + 12) + ')');
        g.innerHTML = rulerSvg(11, U, n);
        var s = document.getElementById('rsv'); s.insertAdjacentHTML('beforeend', ln(xb, y + 6, xb, y + 14, AC, 4));
      };
      return it;
    });
  };
  // Lineal mit Finger oder Maus waagerecht ziehen (rastet in Millimetern ein)
  function dragRuler(svg, U, xa) {
    if (!svg) return;
    var g = svg.querySelector('#rul'), m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute('transform')), x = +m[1], y = +m[2], x0 = null, gx = 0;
    function sx(e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()).x; }
    g.addEventListener('pointerdown', function (e) { if (g.classList.contains('fix')) return; x0 = sx(e); gx = x; g.setPointerCapture(e.pointerId); g.classList.add('grab'); e.preventDefault(); });
    g.addEventListener('pointermove', function (e) {
      if (x0 === null) return;
      x = Math.max(-11 * U + 40, Math.min(720, xa + Math.round((gx + sx(e) - x0 - xa) / (U / 10)) * (U / 10)));   // Millimeter ab dem Punkt
      g.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
    });
    function up() { x0 = null; g.classList.remove('grab'); }
    g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
  }

  // ------------------------------------------------------------ Senkrecht und parallel
  function twoLines(kind, W, H) {
    var a = R(-35, 35), b, cx = W / 2 + R(-60, 60), cy = H / 2 + R(-25, 25), o = '', ex = '';
    var d1 = [Math.cos(deg(a)), -Math.sin(deg(a))], g1 = clip(cx, cy, d1[0], d1[1], W, H, 14), g2, n;
    if (kind === 'senk') {
      b = a + 90; var d2 = [Math.cos(deg(b)), -Math.sin(deg(b))]; g2 = clip(cx, cy, d2[0], d2[1], W, H, 14);
      ex = rwj(cx, cy, d1[0], d1[1], d2[0], d2[1], OKC, 28);
    } else if (kind === 'par') {
      n = [-d1[1], d1[0]]; var dd = R(70, 110) * (Math.random() < .5 ? 1 : -1), qx = cx + n[0] * dd / 2, qy = cy + n[1] * dd / 2;
      g1 = clip(cx - n[0] * dd / 2, cy - n[1] * dd / 2, d1[0], d1[1], W, H, 14); g2 = clip(qx, qy, d1[0], d1[1], W, H, 14);
      [-.3, 0, .3].forEach(function (t) {
        var px = cx - n[0] * dd / 2 + d1[0] * t * W, py = cy - n[1] * dd / 2 + d1[1] * t * W;
        ex += ln(px, py, px + n[0] * dd, py + n[1] * dd, OKC, 4, '9 7');
      });
    } else {
      var diff = Math.random() < .6 ? R(35, 60) : R(14, 20); b = a + diff * (Math.random() < .5 ? 1 : -1);
      var d3 = [Math.cos(deg(b)), -Math.sin(deg(b))];
      if (diff < 25) { n = [-d1[1], d1[0]]; var qx2 = cx + n[0] * 90, qy2 = cy + n[1] * 90; g2 = clip(qx2, qy2, d3[0], d3[1], W, H, 14); g1 = clip(cx - n[0] * 10, cy - n[1] * 10, d1[0], d1[1], W, H, 14); }
      else g2 = clip(cx, cy, d3[0], d3[1], W, H, 14);
    }
    o = ln(g1[0], g1[1], g1[2], g1[3]) + ln(g2[0], g2[1], g2[2], g2[3]);
    return { pic: function (sol) { return sv(W, H, o + (sol ? ex : '')); } };
  }
  GEN.senkpar = function () {
    var CH = [{ v: 'senk', h: S('senk|recht') }, { v: 'par', h: S('pa|ral|lel') }, { v: 'nix', h: S('nichts da|von') }];
    var WHY = { senk: 'Die Geraden bilden einen rechten Winkel. Sie sind senkrecht zueinander.',
      par: 'Die Geraden sind überall gleich weit voneinander entfernt. Sie sind parallel.',
      nix: 'Die Geraden kreuzen sich schief oder treffen sich irgendwann. Sie sind nicht senkrecht und nicht parallel.' };
    var set = shuffle(['senk', 'senk', 'par', 'par', 'nix', 'nix']).map(function (k) {
      var t = twoLines(k, 700, 300);
      var it = { head: S('Senkrecht, parallel oder nichts davon?'), body: '<div class="card gsw" id="lw2">' + t.pic(false) + '</div>', choices: CH, ans: k, cols: 3, why: S(WHY[k]) };
      it.after = function () { document.getElementById('lw2').innerHTML = t.pic(true); };
      return it;
    });
    ['senk', 'par', 'senk', 'par'].forEach(function (k) {
      var W = 700, H = 340, a = R(-30, 30), cx = 350 + R(-40, 40), cy = 170 + R(-20, 20), d = [Math.cos(deg(a)), -Math.sin(deg(a))], nrm = [-d[1], d[0]];
      var gg = clip(cx, cy, d[0], d[1], W, H, 16), cands = [], labs = shuffle(['a', 'b', 'c']);
      // richtige Gerade, die andere Art und eine schiefe
      var pp = [cx + d[0] * R(-160, -90), cy + d[1] * R(-160, -90)];
      var perp = clip(pp[0], pp[1], nrm[0], nrm[1], W, H, 16);
      var off = 110 * (Math.random() < .5 ? 1 : -1), par = clip(cx + nrm[0] * off, cy + nrm[1] * off, d[0], d[1], W, H, 16);
      var b = a + R(50, 65) * (Math.random() < .5 ? 1 : -1), ob = [Math.cos(deg(b)), -Math.sin(deg(b))], sp = [cx + d[0] * R(110, 170), cy + d[1] * R(110, 170)];
      var obl = clip(sp[0], sp[1], ob[0], ob[1], W, H, 16);
      cands = [{ l: perp, k: 'senk', at: pp, dir: nrm }, { l: par, k: 'par' }, { l: obl, k: 'nix' }];
      cands.forEach(function (c, i) { c.n = labs[i]; });
      var ans = cands.filter(function (c) { return c.k === k; })[0].n;
      var allL = [gg].concat(cands.map(function (c) { return c.l; })), spots = [];
      var gPos = labelSpot(gg, allL, spots, W, H); spots.push(gPos);
      cands.forEach(function (c) { c.p = labelSpot(c.l, allL, spots, W, H); spots.push(c.p); });
      function lab(c) { return htx(c.p[0], c.p[1] + 10, c.n, 30); }
      function pic(res) {
        var o = ln(gg[0], gg[1], gg[2], gg[3], INK, 6) + htx(gPos[0], gPos[1] + 10, 'g', 32);
        cands.forEach(function (c) {
          var col = res ? (c.n === ans ? OKC : (res === c.n ? NOC : '#9a9a9a')) : '#555';
          o += '<g class="tp" data-v="' + c.n + '"><line x1="' + f1(c.l[0]) + '" y1="' + f1(c.l[1]) + '" x2="' + f1(c.l[2]) + '" y2="' + f1(c.l[3]) + '" stroke="transparent" stroke-width="40"/>' +
            ln(c.l[0], c.l[1], c.l[2], c.l[3], col, 4) + lab(c) + '</g>';
        });
        if (res && k === 'senk') o += rwj(cands[0].at[0], cands[0].at[1], d[0], d[1], nrm[0], nrm[1], OKC, 28);
        return sv(W, H, o, 'tapl');
      }
      var it = { kind: 'tap', head: S(k === 'senk' ? 'Tippe auf die Gerade, die senkrecht zu g ist.' : 'Tippe auf die Gerade, die parallel zu g ist.'),
        body: '<div class="card gsw" id="lw3">' + pic(null) + '</div>', ans: ans,
        why: S(k === 'senk' ? 'Die Gerade ' + ans + ' bildet mit g einen rechten Winkel.' : 'Die Gerade ' + ans + ' ist überall gleich weit von g entfernt.') };
      it.after = function (good, got) { document.getElementById('lw3').innerHTML = pic(got || 'x'); };
      set.push(it);
    });
    return set;
  };

  // ------------------------------------------------------------ Koordinatensystem
  function kSys(nx, ny, c, ox, oy, inner, tap) {
    var o = '', k;
    o += karoJ(ox, oy - ny * c, nx, ny, c).replace(KLC, '#e4e4e4');
    o += ln(ox - 8, oy, ox + nx * c + 22, oy, INK, 3) + '<path d="M' + (ox + nx * c + 36) + ' ' + oy + ' l-18 -9 v18z" fill="' + INK + '"/>';
    o += ln(ox, oy + 8, ox, oy - ny * c - 22, INK, 3) + '<path d="M' + ox + ' ' + (oy - ny * c - 36) + ' l-9 18 h18z" fill="' + INK + '"/>';
    o += tx(ox + nx * c + 40, oy + 30, 'x', 26, INK, 700, 'middle', true) + tx(ox - 26, oy - ny * c - 26, 'y', 26, INK, 700, 'middle', true);
    for (k = 1; k <= nx; k++) o += ln(ox + k * c, oy - 7, ox + k * c, oy + 7, INK, 2.5) + tx(ox + k * c, oy + 32, String(k), 22, INK, 400);
    for (k = 1; k <= ny; k++) o += ln(ox - 7, oy - k * c, ox + 7, oy - k * c, INK, 2.5) + tx(ox - 22, oy - k * c + 8, String(k), 22, INK, 400);
    o += tx(ox - 18, oy + 28, '0', 22, INK, 400);
    if (tap) for (var i = 0; i <= nx; i++) for (var j = 0; j <= ny; j++)
      o += '<g class="tp" data-v="' + i + '|' + j + '"><circle cx="' + (ox + i * c) + '" cy="' + (oy - j * c) + '" r="' + (c * .45) + '" fill="transparent"/></g>';
    return o + (inner || '');
  }
  function kPath(ox, oy, c, x, y, col) {   // erst nach rechts, dann nach oben (Pfeile)
    var o = '';
    if (x) o += ln(ox, oy - 3, ox + x * c - 10, oy - 3, col, 6) + '<path d="M' + (ox + x * c) + ' ' + (oy - 3) + ' l-16 -9 v18z" fill="' + col + '"/>';
    if (y) o += ln(ox + x * c, oy, ox + x * c, oy - y * c + 22, col, 6) + '<path d="M' + (ox + x * c) + ' ' + (oy - y * c + 12) + ' l-9 16 h18z" fill="' + col + '"/>';
    return o;
  }
  GEN.koord = function () {
    var NX = 8, NY = 6, C = 58, OX = 60, OY = 410, W = 600, H = 450, set = [], seen = {};
    function pick() { var x, y; do { x = R(1, NY); y = R(1, NY); } while (x === y || seen[x + '|' + y]); seen[x + '|' + y] = 1; return [x, y]; }   // x ≤ 6: der vertauschte Punkt existiert auch
    var nm = shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'K', 'M', 'P', 'R']);
    for (var t = 0; t < 5; t++) (function (t) {
      var p = pick(), x = p[0], y = p[1], n = nm[t];
      var w = [[y, x], [x + (x < NX ? 1 : -1), y], [x, y + (y < NY ? 1 : -1)]].filter(function (q) { return q[0] <= NX && q[1] <= NY; });
      var ch = shuffle([[x, y], w[0], one(w.slice(1))]).map(function (q) { return { v: q[0] + '|' + q[1], h: n + NB + cxy(q[0], q[1]) }; });
      function pic(sol) { return sv(W, H, kSys(NX, NY, C, OX, OY, (sol ? kPath(OX, OY, C, x, y, OKC) : '') + cr(OX + x * C, OY - y * C, AC, 11, 5) + tx(OX + x * C + 22, OY - y * C - 14, n, 28, AC))); }
      var it = { head: S('Wo liegt der Punkt ' + n + '?'), body: '<div class="card gsw" id="kw">' + pic(false) + '</div>', choices: ch, ans: x + '|' + y, cols: 3,
        why: S('Erst nach rechts: ' + x + '. Dann nach oben: ' + y + '. Also ' + n + NB + cxy(x, y) + '.') };
      it.after = function () { document.getElementById('kw').innerHTML = pic(true); };
      set.push(it);
    })(t);
    for (t = 0; t < 5; t++) (function () {
      var p = pick(), x = p[0], y = p[1];
      function pic(res) {
        var o = '';
        if (res) {
          o += kPath(OX, OY, C, x, y, OKC) + cr(OX + x * C, OY - y * C, OKC, 12, 6);
          if (res !== 'ok') { var q = res.split('|'); o += cr(OX + q[0] * C, OY - q[1] * C, NOC, 12, 6); }
        }
        return sv(W, H, kSys(NX, NY, C, OX, OY, o, !res), 'tapk');
      }
      var it = { kind: 'tap', head: S('Tippe auf den Punkt ' + cxy(x, y) + '.'), body: '<div class="card gsw" id="kw">' + pic(null) + '</div>', ans: x + '|' + y,
        why: S('Erst ' + x + ' nach rechts, dann ' + y + ' nach oben.') };
      it.after = function (good, got) { document.getElementById('kw').innerHTML = pic(good ? 'ok' : got); };
      set.push(it);
    })();
    return set;
  };

  // ------------------------------------------------------------ Achsensymmetrie
  // Figuren im Feld 300 × 300; ax: Symmetrieachsen [x1, y1, x2, y2]
  var FIG = {
    haus: { p: [[80, 270], [220, 270], [220, 140], [150, 50], [80, 140]], ax: [[150, 20, 150, 290]] },
    pfeil: { p: [[40, 120], [170, 120], [170, 70], [260, 150], [170, 230], [170, 180], [40, 180]], ax: [[20, 150, 280, 150]] },
    drachen: { p: [[150, 30], [230, 120], [150, 270], [70, 120]], ax: [[150, 10, 150, 290]] },
    trapez: { p: [[60, 220], [240, 220], [190, 90], [110, 90]], ax: [[150, 50, 150, 260]] },
    tanne: { p: [[150, 30], [230, 160], [180, 160], [180, 260], [120, 260], [120, 160], [70, 160]], ax: [[150, 10, 150, 285]] },
    winkel: { p: [[70, 70], [130, 70], [130, 170], [230, 170], [230, 230], [70, 230]], ax: [[40, 260, 260, 40]] },
    rechteck: { p: [[50, 90], [250, 90], [250, 210], [50, 210]], ax: [[150, 50, 150, 250], [20, 150, 280, 150]] },
    quadrat: { p: [[70, 70], [230, 70], [230, 230], [70, 230]], ax: [[150, 35, 150, 265], [35, 150, 265, 150], [45, 45, 255, 255], [255, 45, 45, 255]] },
    plus: { p: [[120, 50], [180, 50], [180, 120], [250, 120], [250, 180], [180, 180], [180, 250], [120, 250], [120, 180], [50, 180], [50, 120], [120, 120]],
      ax: [[150, 25, 150, 275], [25, 150, 275, 150], [40, 40, 260, 260], [260, 40, 40, 260]] },
    raute: { p: [[150, 40], [250, 150], [150, 260], [50, 150]], ax: [[150, 15, 150, 285], [20, 150, 280, 150]] },
    parallelo: { p: [[50, 210], [190, 210], [250, 90], [110, 90]], ax: [] },
    flagge: { p: [[90, 270], [90, 40], [230, 85], [110, 130], [110, 270]], ax: [] },
    zett: { p: [[60, 60], [240, 60], [240, 110], [130, 200], [240, 200], [240, 250], [60, 250], [60, 200], [170, 110], [60, 110]], ax: [] },
    stufe: { p: [[50, 250], [50, 170], [130, 170], [130, 100], [210, 100], [210, 40], [260, 40], [260, 250]], ax: [] },
    eff: { p: [[90, 40], [230, 40], [230, 90], [140, 90], [140, 140], [210, 140], [210, 185], [140, 185], [140, 270], [90, 270]], ax: [] }
  };
  function figSvg(f, axes, cls, extra) {
    var o = pg(FIG[f].p, INK, 5, ACL);
    (axes || []).forEach(function (a) { o += ax(a[0], a[1], a[2], a[3], OKC, 5); });
    return sv(300, 300, o + (extra || ''), cls);
  }
  GEN.symm = function () {
    var set = [];
    var yes = shuffle(['haus', 'pfeil', 'drachen', 'trapez', 'tanne', 'winkel']), no = shuffle(['parallelo', 'flagge', 'zett', 'stufe', 'eff']);
    shuffle([yes[0], yes[1], no[0], no[1]]).forEach(function (f) {
      var s = FIG[f].ax.length > 0;
      var it = { head: S('Ist die Figur achsensymmetrisch?'), body: '<div class="card gsw sq" id="sw">' + figSvg(f) + '</div>', cols: 2, ans: s ? 'j' : 'n',
        choices: [{ v: 'j', h: S('ja') }, { v: 'n', h: S('nein') }],
        why: S(s ? 'Die Figur hat eine Symmetrieachse. Beide Hälften passen genau aufeinander.' : 'Es gibt keine Faltlinie, bei der beide Hälften genau aufeinander passen.') };
      it.after = function () { document.getElementById('sw').innerHTML = figSvg(f, FIG[f].ax); };
      set.push(it);
    });
    // Achse antippen: drei Linien zur Auswahl
    ['haus', 'pfeil', 'winkel'].forEach(function (f) {
      var A = FIG[f].ax[0], cand = [[150, 15, 150, 285], [15, 150, 285, 150], [30, 30, 270, 270], [270, 30, 30, 270]];
      var good = cand.filter(function (c) { return c[0] === A[0] || Math.abs((c[2] - c[0]) * (A[3] - A[1]) - (c[3] - c[1]) * (A[2] - A[0])) < 1; })[0];
      var others = shuffle(cand.filter(function (c) { return c !== good; })).slice(0, 2), lines = shuffle([good].concat(others)), ans = String(lines.indexOf(good));
      function pic(res) {
        var o = pg(FIG[f].p, INK, 5, ACL);
        lines.forEach(function (c, i) {
          var col = res ? (String(i) === ans ? OKC : (res === String(i) ? NOC : '#b5b5b5')) : GRY;
          o += '<g class="tp" data-v="' + i + '"><line x1="' + c[0] + '" y1="' + c[1] + '" x2="' + c[2] + '" y2="' + c[3] + '" stroke="transparent" stroke-width="34"/>' + ax(c[0], c[1], c[2], c[3], col, 5) + '</g>';
        });
        return sv(300, 300, o, 'tapl');
      }
      var it = { kind: 'tap', head: S('Tippe auf die Symmetrieachse.'), body: '<div class="card gsw sq" id="sw">' + pic(null) + '</div>', ans: ans,
        why: S('An dieser Achse kannst du die Figur falten. Dann passen beide Hälften genau aufeinander.') };
      it.after = function (g, got) { document.getElementById('sw').innerHTML = pic(got || 'x'); };
      set.push(it);
    });
    shuffle(['rechteck', 'quadrat', 'plus', 'raute', 'drachen', 'parallelo']).slice(0, 3).forEach(function (f) {
      var n = FIG[f].ax.length;
      var it = { head: S('Wie viele Symmetrieachsen hat die Figur?'), body: '<div class="card gsw sq" id="sw">' + figSvg(f) + '</div>', cols: 4, ans: n,
        choices: nums([0, 1, 2, 4]),
        why: S(n === 0 ? 'Die Figur hat keine Symmetrieachse.' : 'Die Figur hat ' + n + (n === 1 ? ' Symmetrieachse.' : ' Symmetrieachsen.') + (n === 4 ? ' Denke auch an die schrägen Achsen.' : '')) };
      it.after = function () { document.getElementById('sw').innerHTML = figSvg(f, FIG[f].ax); };
      set.push(it);
    });
    return set;
  };

  // ------------------------------------------------------------ Spiegeln (Karo, Kästchen zählen)
  GEN.spiegeln = function () {
    var set = [], C = 40, NX = 12, NY = 8, X0 = 20, Y0 = 20, W = X0 * 2 + NX * C, H = Y0 * 2 + NY * C;
    [0, 0, 0, 1, 1, 1].forEach(function (hor, t) {
      var a = hor ? NY / 2 : NX / 2, d = R(1, hor ? 3 : 5) * (Math.random() < .5 ? 1 : -1), q = hor ? R(1, NX - 1) : R(1, NY - 1);
      // Punkt: Abstand d von der Achse; Spiegelpunkt: -d
      var P = hor ? [q, a - d] : [a + d, q], M = hor ? [q, a + d] : [a - d, q];
      function g2s(p) { return [X0 + p[0] * C, Y0 + p[1] * C]; }
      function pic(res) {
        var o = karoJ(X0, Y0, NX, NY, C);
        o += hor ? ax(X0 - 8, Y0 + a * C, X0 + NX * C + 8, Y0 + a * C, INK, 5) : ax(X0 + a * C, Y0 - 8, X0 + a * C, Y0 + NY * C + 8, INK, 5);
        var p = g2s(P); o += cr(p[0], p[1], INK, 11, 5);
        if (res) {
          var m = g2s(M), axp = hor ? [p[0], Y0 + a * C] : [X0 + a * C, p[1]], n = Math.abs(d), sh = hor ? [16, 0] : [0, -14];
          o += ln(p[0] + sh[0], p[1] + sh[1], axp[0] + sh[0], axp[1] + sh[1], OKC, 4) + ln(axp[0] + sh[0], axp[1] + sh[1], m[0] + sh[0], m[1] + sh[1], OKC, 4);
          o += tx((p[0] + axp[0]) / 2 + sh[0] * 1.8, (p[1] + axp[1]) / 2 + sh[1] * 1.6 + (hor ? 8 : 0), String(n), 26, OKC, 800) +
            tx((axp[0] + m[0]) / 2 + sh[0] * 1.8, (axp[1] + m[1]) / 2 + sh[1] * 1.6 + (hor ? 8 : 0), String(n), 26, OKC, 800);
          o += cr(m[0], m[1], OKC, 12, 6);
          if (res !== 'ok') { var r = res.split('|'), rp = g2s([+r[0], +r[1]]); o += cr(rp[0], rp[1], NOC, 12, 6); }
        } else {
          for (var i = 0; i <= NX; i++) for (var j = 0; j <= NY; j++) {
            if ((hor && j === a) || (!hor && i === a) || (i === P[0] && j === P[1])) continue;
            o += '<g class="tp" data-v="' + i + '|' + j + '"><circle cx="' + (X0 + i * C) + '" cy="' + (Y0 + j * C) + '" r="18" fill="transparent"/></g>';
          }
        }
        return sv(W, H, o, 'tapk');
      }
      var it = { kind: 'tap', head: S('Spiegele den Punkt an der Achse. Tippe auf den Spiegelpunkt.'), body: '<div class="card gsw" id="pw">' + pic(null) + '</div>', ans: M[0] + '|' + M[1],
        why: S('Der Punkt ist ' + Math.abs(d) + ' Kästchen von der Achse entfernt. Der Spiegelpunkt liegt auf der anderen Seite, auch ' + Math.abs(d) + ' Kästchen entfernt.') };
      it.after = function (good, got) { document.getElementById('pw').innerHTML = pic(good ? 'ok' : got); };
      set.push(it);
    });
    // Welches Bild ist richtig gespiegelt?
    var SH = [[[1, 1], [3, 1], [3, 4]], [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]], [[2, 1], [3, 3], [1, 4]], [[1, 1], [3, 2], [1, 3]]];   // nicht in sich senkrecht symmetrisch (sonst sähe Verschieben wie Spiegeln aus)
    shuffle(SH.slice()).forEach(function (sh) {
      var c = 22, ax0 = 4;   // Feld 8 × 5 Kästchen, Achse bei x = 4; Figur links
      function mini(pts, col) {
        var o = karoJ(4, 4, 8, 5, c) + ax(4 + ax0 * c, 0, 4 + ax0 * c, 4 + 5 * c + 4, INK, 3);
        o += pg(sh.map(function (p) { return [4 + p[0] * c, 4 + p[1] * c]; }), INK, 3, '#e6e6e6');
        o += pg(pts.map(function (p) { return [4 + p[0] * c, 4 + p[1] * c]; }), col || AC, 3.5, ACL);
        return sv(8 * c + 8, 5 * c + 8, o);
      }
      var mir = sh.map(function (p) { return [2 * ax0 - p[0], p[1]]; });
      var trans = sh.map(function (p) { return [p[0] + 4, p[1]]; });
      var far = mir.map(function (p) { return [p[0] + 1, p[1]]; });
      var opts = shuffle([{ k: 'ok', p: mir }, { k: 't', p: trans }, { k: 'f', p: far }]), ans;
      var ch = opts.map(function (o, i) { if (o.k === 'ok') ans = 'b' + i; return { v: 'b' + i, h: mini(o.p) }; });
      set.push({ head: S('Welches Bild ist richtig gespiegelt?'), choices: ch, ans: ans, cols: 3, imgc: true,
        why: S('Jede Ecke muss auf der anderen Seite genauso weit von der Achse entfernt sein. Die Figur wird umgeklappt, nicht nur verschoben.') });
    });
    return set.slice(0, 10);
  };

  // ------------------------------------------------------------ Schatzsuche in Lauterbach (Plan mit Koordinaten)
  var ORT = [['schule', 'die Schule', 'an der Schule'], ['baecker', 'die Bäckerei', 'an der Bäckerei'], ['turm', 'der Ankerturm', 'am Ankerturm'],
    ['kirche', 'die Stadtkirche', 'an der Stadtkirche'], ['hohhaus', 'das Hohhaus', 'am Hohhaus'], ['eis', 'das Eiscafé', 'am Eiscafé'], ['schloss', 'das Schloss Eisenbach', 'am Schloss Eisenbach']];
  var ONAME = { schule: 'Schu|le', baecker: 'Bä|cke|rei', turm: 'An|ker|turm', kirche: 'Stadt|kir|che', hohhaus: 'Hoh|haus', eis: 'Eis|ca|fé', schloss: 'Schloss Ei|sen|bach' };
  GEN.schatz = function () {
    var NX = 10, NY = 6, C = 64, OX = 54, OY = 452, W = OX + NX * C + 64, H = OY + 48, places = [], set = [];
    // Orte zufällig verteilen (jede Runde anders), nicht zu dicht beieinander
    shuffle(ORT.slice()).forEach(function (o) {
      for (var t = 0; t < 400; t++) {
        var x = R(1, NX), y = R(1, NY - 1), okp = places.every(function (p) { return Math.abs(p.x - x) + Math.abs(p.y - y) >= 3 && !(p.x === x && Math.abs(p.y - y) < 2); });
        if (okp && x !== y) { places.push({ k: o[0], art: o[1], am: o[2], x: x, y: y }); return; }
      }
    });
    function icon(p, hl) {
      return (hl ? '<circle cx="' + (OX + p.x * C) + '" cy="' + (OY - p.y * C - 36) + '" r="50" fill="' + hl + '" opacity=".22"/>' : '') +
        '<image href="' + IMGP + 's_' + p.k + '.png" x="' + (OX + p.x * C - 38) + '" y="' + (OY - p.y * C - 86) + '" width="76" height="78" preserveAspectRatio="xMidYMax meet"/>' +
        cr(OX + p.x * C, OY - p.y * C, INK, 8, 4);
    }
    function plan(inner, tapPlaces, tapGrid, hl) {
      var o = kSys(NX, NY, C, OX, OY, '', tapGrid);
      places.forEach(function (p) {
        var h = hl && hl[p.k];
        o += tapPlaces ? '<g class="tp" data-v="' + p.k + '"><rect x="' + (OX + p.x * C - 40) + '" y="' + (OY - p.y * C - 90) + '" width="80" height="104" fill="transparent"/>' + icon(p) + '</g>' : icon(p, h);
      });
      return sv(W, H, o + (inner || ''), tapPlaces || tapGrid ? 'tapk' : '');
    }
    // Legende: Bild und Name jedes Ortes
    var LEG = '<div class="olg">' + places.map(function (p) { return '<span class="oli"><img src="' + IMGP + 's_' + p.k + '.png" alt=""><span class="olt">' + S(ONAME[p.k]) + '</span></span>'; }).join('') + '</div>';
    var ps = shuffle(places.slice());
    ps.slice(0, 3).forEach(function (p) {
      var w = [[p.y, p.x], [p.x + (p.x < NX ? 1 : -1), p.y], [p.x, p.y + (p.y < NY ? 1 : -1)]].filter(function (q) { return q[0] <= NX && q[1] <= NY && q[0] >= 0 && q[1] >= 0; });
      var hlo = {}; hlo[p.k] = OKC;
      var it = { head: S('Wo liegt ' + p.art + '?'), body: '<div class="card gsw" id="sp">' + plan() + '</div>' + LEG, cols: 3, ans: p.x + '|' + p.y,
        choices: shuffle([[p.x, p.y], w[0], one(w.slice(1))]).map(function (q) { return { v: q[0] + '|' + q[1], h: cxy(q[0], q[1]) }; }),
        why: S('Das Kreuz unter dem Bild zeigt den Ort. Erst nach rechts: ' + p.x + '. Dann nach oben: ' + p.y + '.') };
      it.after = function () { document.getElementById('sp').innerHTML = plan(kPath(OX, OY, C, p.x, p.y, OKC), false, false, hlo); };
      set.push(it);
    });
    ps.slice(3, 6).forEach(function (p) {
      var it = { kind: 'tap', head: S('Was liegt bei ' + cxy(p.x, p.y) + '? Tippe auf den Ort.'), body: '<div class="card gsw" id="sp">' + plan('', true) + '</div>' + LEG, ans: p.k,
        why: S('Erst ' + p.x + ' nach rechts, dann ' + p.y + ' nach oben. Dort ist ' + p.art + '.') };
      it.after = function (good, got) { var h = {}; h[p.k] = OKC; if (!good) h[got] = NOC; document.getElementById('sp').innerHTML = plan(kPath(OX, OY, C, p.x, p.y, OKC), false, false, h); };
      set.push(it);
    });
    // Wege: Start an einem Ort, dann Schritte nach rechts/links und oben/unten
    for (var t = 0; t < 3; t++) (function () {
      var s, e, n = 0;
      do { s = one(places); e = one(places); n++; } while ((s === e || s.x === e.x || s.y === e.y || Math.abs(s.x - e.x) > 6) && n < 500);
      var dx = e.x - s.x, dy = e.y - s.y;
      var wx = Math.abs(dx) + ' nach ' + (dx > 0 ? 'rechts' : 'links'), wy = Math.abs(dy) + ' nach ' + (dy > 0 ? 'oben' : 'unten');
      function route(col) {
        var x1 = OX + s.x * C, y1 = OY - s.y * C, x2 = OX + e.x * C, y2 = OY - e.y * C, sx = dx > 0 ? 1 : -1, sy = dy > 0 ? -1 : 1;
        return ln(x1, y1, x2 - sx * 12, y1, col, 6) + '<path d="M' + x2 + ' ' + y1 + ' l' + (-sx * 16) + ' -9 v18z" fill="' + col + '"/>' +
          ln(x2, y1, x2, y2 - sy * 14, col, 6) + '<path d="M' + x2 + ' ' + (y2 - sy * 2) + ' l-9 ' + (-sy * 16) + ' h18z" fill="' + col + '"/>';
      }
      var it = { kind: 'tap', head: S('Du startest ' + s.am + '. Gehe ' + wx + ' und ' + wy + '. Wo kommst du an? Tippe auf den Ort.'),
        body: '<div class="card gsw" id="sp">' + plan('', true) + '</div>' + LEG, ans: e.k, why: S('Erst ' + wx + ', dann ' + wy + '. Du kommst ' + e.am + ' an.') };
      it.after = function (good, got) { var h = {}; h[e.k] = OKC; if (!good) h[got] = NOC; document.getElementById('sp').innerHTML = plan(route(OKC), false, false, h); };
      set.push(it);
    })();
    var free, k2 = 0; do { free = [R(1, NX), R(1, NY)]; k2++; } while (places.some(function (p) { return Math.abs(p.x - free[0]) + Math.abs(p.y - free[1]) < 2; }) && k2 < 300);
    var it = { kind: 'tap', head: S('Der Schatz liegt bei ' + cxy(free[0], free[1]) + '. Tippe auf die Stelle.'), body: '<div class="card gsw" id="sp">' + plan('', false, true) + '</div>' + LEG,
      ans: free[0] + '|' + free[1], why: S('Erst ' + free[0] + ' nach rechts, dann ' + free[1] + ' nach oben. Dort liegt der Schatz!') };
    it.after = function (good, got) {
      var o = kPath(OX, OY, C, free[0], free[1], OKC) + '<image href="' + IMGP + 's_schatz.png" x="' + (OX + free[0] * C - 36) + '" y="' + (OY - free[1] * C - 66) + '" width="72" height="58"/>' + cr(OX + free[0] * C, OY - free[1] * C, OKC, 12, 6);
      if (!good) { var r = got.split('|'); o += cr(OX + r[0] * C, OY - r[1] * C, NOC, 12, 6); }
      document.getElementById('sp').innerHTML = plan(o);
    };
    set.push(it);
    return set;
  };

  // ------------------------------------------------------------ Zuordnen (ziehen oder antippen) und Verbinden
  function sortTask(it) {
    var pos = it.items.map(function () { return null; }), sel = null, fin = false;
    function draw() {
      // Gezogene Karten lassen ihren Platz frei (unsichtbarer Platzhalter): So ändert sich die Höhe der Seite nicht.
      var pool = it.items.map(function (x, k) {
        return pos[k] === null ? '<button class="scd' + (sel === k ? ' sel' : '') + '" type="button" data-k="' + k + '">' + x.h + '</button>'
          : '<span class="scd ph" aria-hidden="true">' + x.h + '</span>';
      }).join('');
      app.innerHTML = head(it) + '<div class="srt' + (it.scls ? ' ' + it.scls : '') + '"><div class="spool">' + pool + '</div><div class="sbins c' + it.cats.length + '">' +
        it.cats.map(function (c) {
          return '<div class="sbin" data-c="' + c.v + '"><div class="sbt">' + c.h + '</div><div class="sbc">' +
            it.items.map(function (x, k) { return pos[k] === c.v ? '<button class="scd in' + (fin ? (x.c === c.v ? ' ok' : ' no') : '') + '" type="button" data-k="' + k + '"' + (fin ? ' disabled' : '') + '>' + x.h + '</button>' : ''; }).join('') +
            '</div></div>';
        }).join('') + '</div></div><div id="fb"></div>';
      if (fin) return;
      [].slice.call(app.querySelectorAll('button.scd')).forEach(function (b) {
        var k = +b.getAttribute('data-k');
        dragOrTap(b, function () {   // antippen
          if (pos[k] !== null) { pos[k] = null; sel = k; } else sel = sel === k ? null : k;
          draw();
        }, function (el) {           // losgelassen über …
          var bin = el && el.closest ? el.closest('.sbin') : null;
          if (bin) place(k, bin.getAttribute('data-c')); else { pos[k] = null; draw(); }
        });
      });
      [].slice.call(app.querySelectorAll('.sbin')).forEach(function (bn) {
        bn.addEventListener('click', function (e) { if (sel !== null && !e.target.closest('.scd')) place(sel, bn.getAttribute('data-c')); });
      });
    }
    function place(k, c) {
      pos[k] = c; sel = null;
      if (pos.every(function (p) { return p !== null; })) {
        fin = true; var good = it.items.every(function (x, j) { return x.c === pos[j]; });
        if (good) ok++;
        draw(); feedback(good, it.why);
      } else draw();
    }
    it.auto = function (good) {   // nur für Tests: alles einsortieren (good = false: erste Karte falsch)
      var n = it.items.length;
      for (var j = 0; j < n - 1; j++) pos[j] = it.items[j].c;
      if (!good) pos[0] = it.cats.filter(function (c) { return c.v !== it.items[0].c; })[0].v;
      place(n - 1, it.items[n - 1].c);
    };
    draw(); top();
  }
  // Ziehen mit Finger oder Maus; ohne Bewegung zählt es als Antippen
  function dragOrTap(el, onTap, onDrop) {
    var st = null, ghost = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      st = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!st) return;
      var dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.moved && Math.hypot(dx, dy) > 10) {
        st.moved = true; var r = el.getBoundingClientRect();
        ghost = el.cloneNode(true); ghost.classList.add('ghost'); ghost.style.width = r.width + 'px'; ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px';
        st.ox = e.clientX - r.left; st.oy = e.clientY - r.top; document.body.appendChild(ghost); el.classList.add('lift');
      }
      if (st.moved) { ghost.style.left = (e.clientX - st.ox) + 'px'; ghost.style.top = (e.clientY - st.oy) + 'px'; e.preventDefault(); }
    });
    function end(e, cancel) {
      if (!st) return;
      var moved = st.moved; st = null;
      if (ghost) { ghost.remove(); ghost = null; }
      el.classList.remove('lift');
      if (!moved) { if (!cancel) onTap(); return; }
      onDrop(cancel ? null : document.elementFromPoint(e.clientX, e.clientY));
    }
    el.addEventListener('pointerup', function (e) { end(e, false); });
    el.addEventListener('pointercancel', function (e) { end(e, true); });
  }
  function matchTask(it) {
    var pairs = {}, sel = null, fin = false;   // pairs: Index links -> Index rechts
    app.innerHTML = head(it) + '<div class="mtc' + (it.mcls ? ' ' + it.mcls : '') + '" id="mtc"><svg class="mtl" id="mtl"></svg><div class="mcol ml">' +
      it.left.map(function (x, k) { return '<button class="mi" type="button" data-s="l" data-k="' + k + '"><span class="mic">' + x.h + '</span><span class="mdot"></span></button>'; }).join('') +
      '</div><div class="mcol mr">' +
      it.right.map(function (x, k) { return '<button class="mi" type="button" data-s="r" data-k="' + k + '"><span class="mdot"></span><span class="mic">' + x.h + '</span></button>'; }).join('') +
      '</div></div><div id="fb"></div>';
    var box = document.getElementById('mtc'), svg = document.getElementById('mtl');
    function el(s, k) { return box.querySelector('.mi[data-s="' + s + '"][data-k="' + k + '"]'); }
    function pt(s, k) {
      var b = box.getBoundingClientRect(), d = el(s, k).querySelector('.mdot').getBoundingClientRect();
      return [d.left + d.width / 2 - b.left, d.top + d.height / 2 - b.top];
    }
    function lines(extra) {
      var b = box.getBoundingClientRect(), o = '';
      svg.setAttribute('viewBox', '0 0 ' + b.width + ' ' + b.height); svg.setAttribute('width', b.width); svg.setAttribute('height', b.height);
      Object.keys(pairs).forEach(function (l) {
        var a = pt('l', l), c = pt('r', pairs[l]), col = fin ? (it.left[l].k === it.right[pairs[l]].k ? OKC : NOC) : AC;
        o += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + c[0] + '" y2="' + c[1] + '" stroke="' + col + '" stroke-width="5" stroke-linecap="round"/>';
      });
      svg.innerHTML = o + (extra || '');
      [].slice.call(box.querySelectorAll('.mi')).forEach(function (m) {
        var s = m.getAttribute('data-s'), k = m.getAttribute('data-k');
        var used = s === 'l' ? pairs[k] !== undefined : Object.keys(pairs).some(function (l) { return String(pairs[l]) === k; });
        m.classList.toggle('pr', used); m.classList.toggle('sel', !!sel && sel.s === s && String(sel.k) === k);
      });
    }
    function link(a, b) {   // a, b: {s, k}
      if (a.s === b.s) { sel = b; lines(); return; }
      var l = a.s === 'l' ? a.k : b.k, r = a.s === 'l' ? b.k : a.k;
      Object.keys(pairs).forEach(function (x) { if (String(pairs[x]) === String(r)) delete pairs[x]; });
      pairs[l] = +r; sel = null;
      if (Object.keys(pairs).length === it.left.length) {
        fin = true; var good = Object.keys(pairs).every(function (x) { return it.left[x].k === it.right[pairs[x]].k; });
        if (good) ok++;
        [].slice.call(box.querySelectorAll('.mi')).forEach(function (m) { m.disabled = true; });
        lines(); feedback(good, it.why);
      } else lines();
    }
    [].slice.call(box.querySelectorAll('.mi')).forEach(function (m) {
      var me = { s: m.getAttribute('data-s'), k: +m.getAttribute('data-k') }, st = null;
      m.addEventListener('pointerdown', function (e) { if (fin || e.button) return; st = { x: e.clientX, y: e.clientY, moved: false }; m.setPointerCapture(e.pointerId); });
      m.addEventListener('pointermove', function (e) {
        if (!st) return;
        if (Math.hypot(e.clientX - st.x, e.clientY - st.y) > 10) st.moved = true;
        if (st.moved) { var b = box.getBoundingClientRect(), a = pt(me.s, me.k); lines('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + (e.clientX - b.left) + '" y2="' + (e.clientY - b.top) + '" stroke="' + AC + '" stroke-width="5" stroke-dasharray="10 8" stroke-linecap="round"/>'); e.preventDefault(); }
      });
      m.addEventListener('pointerup', function (e) {
        if (!st) return; var moved = st.moved; st = null;
        if (!moved) {
          if (me.s === 'l' && pairs[me.k] !== undefined) delete pairs[me.k];
          if (me.s === 'r') Object.keys(pairs).forEach(function (x) { if (pairs[x] === me.k) delete pairs[x]; });
          if (sel && sel.s !== me.s) link(sel, me); else { sel = me; lines(); }
          return;
        }
        var t = document.elementFromPoint(e.clientX, e.clientY), o = t && t.closest ? t.closest('.mi') : null;
        if (o && o.getAttribute('data-s') !== me.s) link(me, { s: o.getAttribute('data-s'), k: +o.getAttribute('data-k') }); else lines();
      });
      m.addEventListener('pointercancel', function () { st = null; lines(); });
    });
    var rt = null; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (document.getElementById('mtl') === svg) lines(); }, 100); });
    it.auto = function (good) {
      it.left.forEach(function (x, l) { var r = it.right.map(function (y) { return y.k; }).indexOf(x.k); pairs[l] = r; });
      if (!good) { var a = pairs[0]; pairs[0] = pairs[1]; pairs[1] = a; }
      var last = it.left.length - 1, rr = pairs[last]; delete pairs[last]; link({ s: 'l', k: last }, { s: 'r', k: rr });
    };
    lines(); top();
  }

  // ============================================================ Umfang und Flächeninhalt
  // Raster: 1 Kästchen = 1 cm (Kästchenseite = 1 cm, Kästchen = 1 cm²), Ecken auf den Kästchenkreuzen, Schreibweise wie im Heft (u, A, a, b).
  var UC = 50, UFL = 'rgba(90,127,168,.22)', UTR = '#d0453a', UOR = '#d08a2e';
  function uRect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
  function uPer(p) { var s = 0; for (var k = 0; k < p.length; k++) { var a = p[k], b = p[(k + 1) % p.length]; s += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); } return s; }
  function uAre(p) { var s = 0; for (var k = 0; k < p.length; k++) { var a = p[k], b = p[(k + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; }
  function uIn(p, x, y) {
    var c = false;
    for (var k = 0, j = p.length - 1; k < p.length; j = k++) {
      if ((p[k][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[k][0]) * (y - p[k][1]) / (p[j][1] - p[k][1]) + p[k][0]) c = !c;
    }
    return c;
  }
  function uBox(p) { var xs = p.map(function (q) { return q[0]; }), ys = p.map(function (q) { return q[1]; }); return [Math.min.apply(0, xs), Math.min.apply(0, ys), Math.max.apply(0, xs), Math.max.apply(0, ys)]; }
  function uMove(p, dx, dy) { return p.map(function (q) { return [q[0] + dx, q[1] + dy]; }); }
  // feste Formen (Ecken auf Kästchenkreuzen)
  var USH = [
    [[0, 0], [1, 0], [1, 2], [3, 2], [3, 3], [0, 3]],                                  // L
    [[0, 0], [3, 0], [3, 1], [2, 1], [2, 3], [1, 3], [1, 1], [0, 1]],                  // T
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 0], [3, 0], [3, 2], [0, 2]],                  // U
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [0, 3]],                  // Treppe
    [[0, 0], [4, 0], [4, 1], [1, 1], [1, 2], [0, 2]],                                  // flaches L
    [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1]]   // Plus
  ];
  function uShape(kind) {
    if (kind === 'rect') { var w, h; do { w = R(2, 6); h = R(1, 4); } while (w === h); return uRect(0, 0, w, h); }
    if (kind === 'quad') { var s = R(2, 4); return uRect(0, 0, s, s); }
    var p = one(USH);
    if (Math.random() < .5) { var bx = uBox(p)[2]; p = p.map(function (q) { return [bx - q[0], q[1]]; }).reverse(); }   // gespiegelt
    return p;
  }
  // Figur auf dem Raster (Feld = Figur + 1 Kästchen Rand); o.tr: Rand nachfahren, o.ring: Zahlen an den Kästchenseiten, o.cells: Zahlen in den Kästchen
  function uGrid(p, o) {
    o = o || {}; var b = uBox(p), nx = b[2] - b[0] + 2, ny = b[3] - b[1] + 2, q = uMove(p, 1 - b[0], 1 - b[1]), c = o.c || UC, m = 6;
    var P = q.map(function (v) { return [m + v[0] * c, m + v[1] * c]; });
    var s = karoJ(m, m, nx, ny, c) + pg(P, o.tr || INK, o.tr ? 7 : 4, o.fill || UFL);
    if (o.cells) {
      var k = 1, fs = Math.min(24, Math.round(c * .44));
      for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) if (uIn(q, i + .5, j + .5)) s += tx(m + (i + .5) * c, m + (j + .5) * c + fs * .36, String(k++), k > 10 ? Math.round(fs * .85) : fs, o.cells, 700);
    }
    if (o.ring) {
      var n = 1;
      for (var t = 0; t < q.length; t++) {
        var a = q[t], e = q[(t + 1) % q.length], L2 = Math.abs(e[0] - a[0]) + Math.abs(e[1] - a[1]), dx = (e[0] - a[0]) / L2, dy = (e[1] - a[1]) / L2;
        for (var u = 0; u < L2; u++) {
          var mx = a[0] + dx * (u + .5), my = a[1] + dy * (u + .5), nx2 = dy, ny2 = -dx;
          if (uIn(q, mx + nx2 * .1, my + ny2 * .1)) { nx2 = -nx2; ny2 = -ny2; }
          s += tx(m + (mx + nx2 * .34) * c, m + (my + ny2 * .34) * c + 6, String(n++), Math.min(18, Math.round(c * .36)), o.ring, 800);
        }
      }
    }
    var W = nx * c + 2 * m, H = ny * c + 2 * m;
    return { svg: '<svg class="gsv" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:' + Math.round(W * .95) + 'px;margin:0 auto">' + s + '</svg>', u: uPer(p), A: uAre(p),
      at: function (x, y, w, h) { return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + W + ' ' + H + '">' + s + '</svg>'; } };
  }
  // Rechteck mit Maßen (nicht in Originalgröße): Länge unten, Breite rechts
  function uLab(a, b, unit, cls) {
    var k = Math.min(56, 380 / a, 200 / b), w = a * k, h = b * k, m = 14;
    var s = '<rect x="' + m + '" y="' + m + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + ACL + '" stroke="' + INK + '" stroke-width="4"/>' +
      tx(m + w / 2, m + h + 38, a + NB + unit, 28) + tx(m + w + 14, m + h / 2 + 10, b + NB + unit, 28, INK, 700, 'start');
    return '<svg class="gsv ' + (cls || '') + '" viewBox="0 0 ' + f1(w + m + 110) + ' ' + f1(h + m + 56) + '" style="max-width:' + Math.round(w + m + 110) + 'px;margin:0 auto">' + s + '</svg>';
  }
  function uCard(svg, id) { return '<div class="card gsw"' + (id ? ' id="' + id + '"' : '') + '>' + svg + '</div>'; }
  function uOpts(list, unit) { return uniq(list).map(function (v) { return { v: String(v), h: fmt(v) + (unit ? NB + unit : '') }; }); }
  function uThree(ans, wrong) {
    var w = uniq(wrong.filter(function (x) { return x !== ans && x > 0; })), c = [ans].concat(w.slice(0, 2)), k = 1;
    while (c.length < 3) { var z = ans + 2 * k; if (c.indexOf(z) < 0) c.push(z); k++; }
    return c.sort(function (x, y) { return x - y; });
  }
  function rfItem(q, a, why) {
    return { head: S('Richtig oder falsch?'), body: '<div class="card story">' + S(q) + '</div>', cols: 2, ans: a,
      choices: [{ v: 'r', h: S('rich|tig') }, { v: 'f', h: S('falsch') }], why: S((a === 'r' ? 'Das stimmt. ' : 'Das stimmt nicht. ') + why) };
  }

  // ------------------------------------------------------------ Rechteck und Quadrat
  var RQN = { q: 'Qua|drat', r: 'Recht|eck', n: 'nichts da|von' };
  var RQC = [{ v: 'q', h: S(RQN.q) }, { v: 'r', h: S(RQN.r) }, { v: 'n', h: S(RQN.n) }];
  function rqPic(kind, W, H) {
    W = W || 420; H = H || 220;
    var cx = W / 2 + R(-30, 30), cy = H / 2, p, a;
    if (kind === 'r') { var w = R(150, 230), h = R(60, 110); if (Math.random() < .3) { var t = w; w = h + 40; h = Math.min(t, H - 50); } p = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]; }
    else if (kind === 'q') { var s = R(90, 150); p = [[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]]; }
    else {
      var f = one(['para', 'trapez', 'drei', 'raute', 'fuenf']);
      if (f === 'para') p = [[-120, 55], [70, 55], [120, -55], [-70, -55]];
      else if (f === 'trapez') p = [[-120, 60], [120, 60], [70, -60], [-70, -60]];
      else if (f === 'drei') p = [[-110, 65], [110, 65], [0, -75]];
      else if (f === 'raute') p = [[0, -85], [95, 0], [0, 85], [-95, 0]];
      else p = [[-90, 70], [90, 70], [100, -20], [0, -85], [-100, -20]];
    }
    a = (kind !== 'n' && Math.random() < .35) ? deg(R(-25, 25)) : 0;
    var P = p.map(function (v) { return [cx + v[0] * Math.cos(a) - v[1] * Math.sin(a), cy + v[0] * Math.sin(a) + v[1] * Math.cos(a)]; });
    return sv(W, H, pg(P, INK, 4, ACL));
  }
  var RQW = { q: 'Vier rechte Winkel und alle vier Seiten sind gleich lang: Das ist ein Quadrat.',
    r: 'Vier rechte Winkel, gegenüberliegende Seiten sind gleich lang: Das ist ein Rechteck.',
    n: 'Die Ecken sind keine rechten Winkel. Die Figur ist kein Rechteck und kein Quadrat.' };
  GEN.ufrechteck = function () {
    var set = [];
    shuffle(['q', 'r', 'n', one(['q', 'r', 'n'])]).forEach(function (k) {
      set.push({ head: S('Was ist das?'), body: '<div class="card gsw">' + rqPic(k) + '</div>', choices: RQC, ans: k, cols: 3, why: S(RQW[k]) });
    });
    for (var r = 0; r < 2; r++) {
      var ks = shuffle(['q', 'r', 'n', one(['q', 'r', 'n'])]);
      set.push({ kind: 'sort', head: S('Ziehe jede Figur in das richtige Feld.'), cats: RQC,
        items: ks.map(function (k) { return { h: rqPic(k, 360, 200), c: k }; }),
        why: S('Prüfe zuerst die Ecken: 4 rechte Winkel? Dann die Seiten: Sind alle 4 Seiten gleich lang, ist es ein Quadrat.') });
    }
    // Tippe auf das Quadrat
    (function () {
      var kinds = shuffle(['q', 'r', 'r', 'n']), ans = String(kinds.indexOf('q'));
      function pic(res) {
        var o = '';
        kinds.forEach(function (k, i) {
          var x = 10 + (i % 2) * 300, y = 10 + Math.floor(i / 2) * 200, inner = rqPic(k, 280, 180).replace(/^<svg[^>]*>|<\/svg>$/g, '');
          var col = res ? (String(i) === ans ? OKC : (res === String(i) ? NOC : '#d0d0d0')) : '#d0d0d0';
          o += '<g class="tp" data-v="' + i + '"><rect x="' + x + '" y="' + y + '" width="280" height="180" fill="#fff" stroke="' + col + '" stroke-width="' + (res && col !== '#d0d0d0' ? 6 : 2) + '"/>' +
            '<g transform="translate(' + x + ' ' + y + ')">' + inner + '</g></g>';
        });
        return sv(600, 400, o, 'tapl');
      }
      var it = { kind: 'tap', head: S('Tippe auf das Quadrat.'), body: '<div class="card gsw" id="rq">' + pic(null) + '</div>', ans: ans,
        why: S('Das Quadrat hat vier rechte Winkel und vier gleich lange Seiten.') };
      it.after = function (g, got) { document.getElementById('rq').innerHTML = pic(got || 'x'); };
      set.push(it);
    })();
    var RF = [['Ein Rechteck hat 4 rechte Winkel.', 'r'], ['Beim Quadrat sind alle 4 Seiten gleich lang.', 'r'], ['Beim Rechteck sind immer alle Seiten gleich lang.', 'f'],
      ['Gegenüberliegende Seiten im Rechteck sind gleich lang.', 'r'], ['Ein Dreieck ist ein Rechteck.', 'f'], ['Ein Quadrat hat 5 Ecken.', 'f']];
    shuffle(RF).slice(0, 2).forEach(function (q) { set.push(rfItem(q[0], q[1], 'Rechteck: 4 rechte Winkel, gegenüberliegende Seiten gleich lang. Quadrat: alle 4 Seiten gleich lang.')); });
    set.push({ kind: 'match', mcls: 'eq wd', head: S('Verbinde, was zusammengehört.'),
      left: [{ h: S(RQN.r), k: 'r' }, { h: S(RQN.q), k: 'q' }, { h: S('Drei|eck'), k: 'd' }],
      right: shuffle([{ h: S('Gegenüberliegende Seiten sind gleich lang.'), k: 'r' }, { h: S('Alle 4 Seiten sind gleich lang.'), k: 'q' }, { h: S('Es hat 3 Ecken.'), k: 'd' }]),
      why: S('Rechteck: gegenüberliegende Seiten gleich lang. Quadrat: alle Seiten gleich lang. Dreieck: 3 Ecken.') });
    return set;
  };

  // ------------------------------------------------------------ Umfang zeigen und zählen
  GEN.ufumfang = function () {
    var set = [], kinds = shuffle(['rect', 'rect', 'quad', 'form', 'form', 'form']);
    kinds.forEach(function (k) {
      var p = uShape(k === 'form' ? 'x' : k), g = uGrid(p), u = g.u, A = g.A;
      var it = { head: S('Wie groß ist der Umfang? Zähle die Kästchenseiten am Rand.'), body: uCard(g.svg, 'ug'), choices: uOpts(uThree(u, [A, u - 2, u + 2]), 'cm'), ans: String(u), cols: 3,
        why: S('Am Rand sind ' + u + ' Kästchenseiten. Jede ist 1 cm lang. Also u = ' + u + ' cm.') };
      it.after = function () { document.getElementById('ug').innerHTML = uGrid(p, { tr: UTR, ring: UTR }).svg; };
      set.push(it);
    });
    for (var t = 0; t < 2; t++) (function () {
      var p1, p2, g1, g2;
      do { p1 = uShape(one(['rect', 'x'])); p2 = uShape(one(['rect', 'quad', 'x'])); g1 = uGrid(p1, { c: 36 }); g2 = uGrid(p2, { c: 36 }); } while (g1.u === g2.u);
      var ans = g1.u > g2.u ? '0' : '1';
      function pic(res) {
        var o = '';
        [[p1, g1], [p2, g2]].forEach(function (pg2, i) {
          var gr = uGrid(pg2[0], res ? { c: 36, tr: String(i) === ans ? OKC : '#999', ring: String(i) === ans ? OKC : '#999' } : { c: 36 });
          var col = res ? (String(i) === ans ? OKC : (res === String(i) ? NOC : '#d0d0d0')) : '#d0d0d0';
          o += '<g class="tp" data-v="' + i + '"><rect x="' + (8 + i * 300) + '" y="8" width="284" height="284" fill="#fff" stroke="' + col + '" stroke-width="' + (res && col !== '#d0d0d0' ? 6 : 2) + '"/>' +
            gr.at(16 + i * 300, 16, 268, 268) + '</g>';
        });
        return sv(600, 300, o, 'tapl');
      }
      var it = { kind: 'tap', head: S('Welche Figur hat den größeren Umfang? Zähle und tippe sie an.'), body: '<div class="card gsw" id="uv">' + pic(null) + '</div>', ans: ans,
        why: S('Links: u = ' + g1.u + ' cm. Rechts: u = ' + g2.u + ' cm.') };
      it.after = function (g, got) { document.getElementById('uv').innerHTML = pic(got || 'x'); };
      set.push(it);
    })();
    var RF = [['Linien innen gehören zum Umfang.', 'f'], ['Der Umfang ist die Länge vom Rand rund um eine Fläche.', 'r'], ['Eine Kästchenseite ist 1 cm lang.', 'r'],
      ['Für den Umfang zählst du die Kästchen innen.', 'f'], ['u ist die Abkürzung für Umfang.', 'r']];
    shuffle(RF).slice(0, 2).forEach(function (q) { set.push(rfItem(q[0], q[1], 'Der Umfang ist der Rand rundherum. Du zählst die Kästchenseiten am Rand.')); });
    return set;
  };

  // ------------------------------------------------------------ Umfang berechnen
  function uPairs(n, sq) {
    var out = [], seen = {};
    while (out.length < n) {
      var a = R(3, 10), b = sq ? a : R(1, a - 1);
      if (seen[a + 'x' + b]) continue; seen[a + 'x' + b] = 1; out.push([a, b]);
    }
    return out;
  }
  GEN.ufurechnen = function () {
    var set = [], pr = shuffle(uPairs(4, false).concat(uPairs(2, true)));
    pr.forEach(function (ab) {
      var a = ab[0], b = ab[1], u = 2 * (a + b), q = a === b;
      set.push({ head: S(q ? 'Das Quadrat hat 4 gleich lange Seiten. Wie groß ist der Umfang?' : 'Wie groß ist der Umfang?'), body: uCard(uLab(a, b, 'cm')),
        choices: uOpts(uThree(u, [a + b, a * b, u + 2]), 'cm'), ans: String(u), cols: 3,
        why: S('u = ' + a + ' cm + ' + b + ' cm + ' + a + ' cm + ' + b + ' cm = ' + u + ' cm') });
    });
    uPairs(2, false).forEach(function (ab) {
      var a = ab[0], b = ab[1], c1 = a + ' cm + ' + b + ' cm + ' + a + ' cm + ' + b + ' cm', c2 = a + ' cm + ' + b + ' cm', c3 = a + ' cm · ' + b + ' cm';
      set.push({ head: S('Welche Rechnung passt zum Umfang?'), body: uCard(uLab(a, b, 'cm')), cols: 1, ans: 'a',
        choices: shuffle([{ v: 'a', h: 'u = ' + c1 }, { v: 'b', h: 'u = ' + c2 }, { v: 'c', h: 'u = ' + c3 }]),
        why: S('Für den Umfang addierst du alle vier Seiten: Länge, Breite, Länge, Breite.') });
    });
    var SA = [['Ein Beet ist ', ' m lang und ', ' m breit. Rund um das Beet kommt ein Zaun. Wie lang ist der Zaun?'],
      ['Ein Spielfeld ist ', ' m lang und ', ' m breit. Rund um das Spielfeld wird eine Linie gemalt. Wie lang ist die Linie?']];
    SA.forEach(function (s) {
      var a = R(5, 12), b = R(2, a - 1), u = 2 * (a + b);
      set.push({ head: S('Lies genau. Rechne.'), body: '<div class="card story">' + S(s[0] + a + s[1] + b + s[2]) + '</div>', cols: 3, ans: String(u),
        choices: uOpts(uThree(u, [a + b, a * b, u - 2]), 'm'), why: S('Rund um: Das ist der Umfang. u = ' + a + ' m + ' + b + ' m + ' + a + ' m + ' + b + ' m = ' + u + ' m') });
    });
    return set;
  };

  // ------------------------------------------------------------ Flächen vergleichen und Kästchen zählen
  GEN.ufflaeche = function () {
    var set = [];
    shuffle(['rect', 'rect', 'quad', 'x', 'x']).forEach(function (k) {
      var p = uShape(k), g = uGrid(p), A = g.A, u = g.u;
      var it = { head: S('Wie groß ist der Flächeninhalt? Zähle die Kästchen.'), body: uCard(g.svg, 'ag'), choices: uOpts(uThree(A, [u, A + 1, A - 1]), 'cm²'), ans: String(A), cols: 3,
        why: S('In der Figur sind ' + A + ' Kästchen. Jedes Kästchen ist 1 cm². Also A = ' + A + ' cm².') };
      it.after = function () { document.getElementById('ag').innerHTML = uGrid(p, { cells: OKC }).svg; };
      set.push(it);
    });
    for (var t = 0; t < 5; t++) (function (t) {
      var n = t < 3 ? 2 : 3, ps, gs;
      do {
        ps = []; gs = [];
        for (var j = 0; j < n; j++) {
          var p = j === 0 ? uRect(0, 0, R(4, 6), 1) : uShape(one(['rect', 'quad', 'x']));
          ps.push(p); gs.push(uGrid(p, { c: n === 2 ? 36 : 26 }));
        }
        var As = gs.map(function (g) { return g.A; }), mx = Math.max.apply(0, As);
      } while (As.filter(function (a) { return a === mx; }).length > 1 || As[0] === mx);
      var order = shuffle(ps.map(function (_, j) { return j; })), ans = String(order.indexOf(As.indexOf(mx))), bw = n === 2 ? 300 : 200;
      function pic(res) {
        var o = '';
        order.forEach(function (j, i) {
          var good = String(i) === ans, gr = uGrid(ps[j], res ? { c: n === 2 ? 36 : 26, cells: good ? OKC : '#999' } : { c: n === 2 ? 36 : 26 });
          var col = res ? (good ? OKC : (res === String(i) ? NOC : '#d0d0d0')) : '#d0d0d0';
          o += '<g class="tp" data-v="' + i + '"><rect x="' + (8 + i * bw) + '" y="8" width="' + (bw - 16) + '" height="' + (bw - 16) + '" fill="#fff" stroke="' + col + '" stroke-width="' + (res && col !== '#d0d0d0' ? 6 : 2) + '"/>' +
            gr.at(16 + i * bw, 16, bw - 32, bw - 32) + '</g>';
        });
        return sv(n * bw, bw, o, 'tapl');
      }
      var it = { kind: 'tap', head: S(n === 2 ? 'Welche Fläche ist größer? Zähle die Kästchen und tippe an.' : 'Welche Fläche ist am größten? Zähle die Kästchen und tippe an.'),
        body: '<div class="card gsw" id="av">' + pic(null) + '</div>', ans: ans,
        why: S('Die größte Fläche hat ' + mx + ' Kästchen. Die lange Fläche ist nicht immer die größte.') };
      it.after = function (g, got) { document.getElementById('av').innerHTML = pic(got || 'x'); };
      set.push(it);
    })(t);
    return set;
  };

  // ------------------------------------------------------------ cm² und m²
  var UK = [['eine Postkarte', 'cm²'], ['ein Fußballfeld', 'm²'], ['ein Radiergummi', 'cm²'], ['der Schulhof', 'm²'], ['eine Heftseite', 'cm²'], ['ein Zimmer', 'm²'],
    ['eine Briefmarke', 'cm²'], ['ein Garten', 'm²'], ['ein Handy', 'cm²'], ['der Sportplatz', 'm²'], ['ein Foto', 'cm²'], ['der Boden in der Turnhalle', 'm²']];
  GEN.ufeinheiten = function () {
    var set = [], CT = [{ v: 'cm²', h: 'cm²' }, { v: 'm²', h: 'm²' }];
    var pa = shuffle(UK.filter(function (x) { return x[1] === 'cm²'; })), pb = shuffle(UK.filter(function (x) { return x[1] === 'm²'; }));
    for (var r = 0; r < 3; r++) {
      var its = shuffle(pa.slice(r * 2, r * 2 + 2).concat(pb.slice(r * 2, r * 2 + 2)));
      set.push({ kind: 'sort', scls: 'txt', head: S('Misst du die Fläche in cm² oder in m²? Ziehe jede Karte in das richtige Feld.'), cats: CT,
        items: its.map(function (x) { return { h: '<span>' + S(x[0]) + '</span>', c: x[1] }; }), why: S('Kleine Flächen misst du in cm², große Flächen in m².') });
    }
    var EU = [['Länge von einem Bleistift: 17', 'cm'], ['Fläche von einer Tischplatte: 1', 'm²'], ['Länge vom Klassenraum: 9', 'm'], ['Fläche von einem Notizzettel: 49', 'cm²'],
      ['Breite von einem Heft: 21', 'cm'], ['Fläche vom Spielplatz: 300', 'm²'], ['Fläche von einer Spielkarte: 50', 'cm²'], ['Länge vom Schulbus: 12', 'm']];
    shuffle(EU).slice(0, 5).forEach(function (e) {
      set.push({ head: S('Welche Einheit passt?'), body: '<div class="card story">' + S(e[0]) + ' …</div>', cols: 4, ans: e[1],
        choices: ['cm', 'm', 'cm²', 'm²'].map(function (u) { return { v: u, h: u }; }),
        why: S(/^Fläche/.test(e[0]) ? 'Es geht um eine Fläche. Dann steht die kleine 2 an der Einheit: ' + e[1] + '.' : 'Es geht um eine Länge. Dann nimmst du cm oder m: ' + e[1] + '.') });
    });
    set.push({ kind: 'match', mcls: 'eq', head: S('Verbinde das Wort mit der Abkürzung.'),
      left: [{ h: S('Qua|drat|zen|ti|me|ter'), k: 'a' }, { h: S('Qua|drat|me|ter'), k: 'b' }, { h: S('Zen|ti|me|ter'), k: 'c' }, { h: S('Me|ter'), k: 'd' }],
      right: shuffle([{ h: 'cm²', k: 'a' }, { h: 'm²', k: 'b' }, { h: 'cm', k: 'c' }, { h: 'm', k: 'd' }]),
      why: S('Quadrat im Wort heißt: Es geht um eine Fläche. Dann steht die kleine 2 an der Einheit.') });
    set.push(rfItem('1 cm² ist ungefähr so groß wie ein Fingernagel.', 'r', 'Ein Quadrat mit 1 cm langen Seiten ist ungefähr so groß wie ein Fingernagel.'));
    return set;
  };

  // ------------------------------------------------------------ Flächeninhalt berechnen
  GEN.ufarechnen = function () {
    var set = [];
    for (var t = 0; t < 3; t++) (function () {
      var a = R(3, 6), b = R(2, 4), p = uRect(0, 0, a, b), g = uGrid(p, { c: 44 }), A = a * b;
      var it = { head: S('Rechne Länge mal Breite. Wie groß ist der Flächeninhalt?'), body: uCard(g.svg, 'ar'), choices: uOpts(uThree(A, [a + b, 2 * (a + b), A + a]), 'cm²'), ans: String(A), cols: 3,
        why: S(b + ' Reihen mit je ' + a + ' Kästchen: ' + a + ' · ' + b + ' = ' + A + '. Also A = ' + A + ' cm².') };
      it.after = function () { document.getElementById('ar').innerHTML = uGrid(p, { c: 44, cells: OKC }).svg; };
      set.push(it);
    })();
    shuffle(uPairs(3, false).concat(uPairs(1, true))).forEach(function (ab) {
      var a = ab[0], b = ab[1], A = a * b, q = a === b;
      set.push({ head: S(q ? 'Das Quadrat hat 4 gleich lange Seiten. Wie groß ist der Flächeninhalt?' : 'Wie groß ist der Flächeninhalt?'), body: uCard(uLab(a, b, 'cm')),
        choices: uOpts(uThree(A, [2 * (a + b), a + b, A + b]), 'cm²'), ans: String(A), cols: 3, why: S('A = ' + a + ' cm · ' + b + ' cm = ' + A + ' cm²') });
    });
    uPairs(2, false).forEach(function (ab) {
      var a = ab[0], b = ab[1];
      set.push({ head: S('Welche Rechnung passt zum Flächeninhalt?'), body: uCard(uLab(a, b, 'cm')), cols: 1, ans: 'a',
        choices: shuffle([{ v: 'a', h: 'A = ' + a + ' cm · ' + b + ' cm' }, { v: 'b', h: 'A = ' + a + ' cm + ' + b + ' cm' }, { v: 'c', h: 'A = ' + a + ' cm + ' + b + ' cm + ' + a + ' cm + ' + b + ' cm' }]),
        why: S('Flächeninhalt: Länge mal Breite. A = a · b') });
    });
    (function () {
      var a = R(4, 8), b = R(2, 5), A = a * b;
      set.push({ head: S('Lies genau. Rechne.'), body: '<div class="card story">' + S('Ein Teppich ist ' + a + ' m lang und ' + b + ' m breit. Wie groß ist der Teppich?') + '</div>', cols: 3,
        ans: String(A), choices: uOpts(uThree(A, [2 * (a + b), a + b, A + 2]), 'm²'), why: S('Es geht um die ganze Fläche. A = ' + a + ' m · ' + b + ' m = ' + A + ' m²') });
    })();
    return set;
  };

  // ------------------------------------------------------------ Umfang oder Flächeninhalt?
  var UQ = [['ein Zaun rund um den Garten', 'u'], ['Rasen für den Garten', 'A'], ['eine Linie rund um das Spielfeld', 'u'], ['ein Teppich für das Zimmer', 'A'],
    ['ein Rahmen rund um das Bild', 'u'], ['Matten unter dem Klettergerüst', 'A'], ['eine Lichterkette rund um das Fenster', 'u'], ['Farbe für die ganze Wand', 'A'],
    ['Klebeband rund um das Plakat', 'u'], ['Fliesen für den Boden', 'A'], ['einmal rund um den Schulhof laufen', 'u'], ['Stoff für eine Tischdecke', 'A']];
  GEN.ufunterschied = function () {
    var set = [], CT = [{ v: 'u', h: S('Um|fang') }, { v: 'A', h: S('Flä|chen|in|halt') }];
    var pa = shuffle(UQ.filter(function (x) { return x[1] === 'u'; })), pb = shuffle(UQ.filter(function (x) { return x[1] === 'A'; }));
    for (var r = 0; r < 3; r++) {
      var its = shuffle(pa.slice(r * 2, r * 2 + 2).concat(pb.slice(r * 2, r * 2 + 2)));
      set.push({ kind: 'sort', scls: 'txt', head: S('Geht es um den Umfang oder um den Flächeninhalt? Ziehe jede Karte in das richtige Feld.'), cats: CT,
        items: its.map(function (x) { return { h: '<span>' + S(x[0]) + '</span>', c: x[1] }; }), why: S('Rund um, Rand, Linie, Zaun: Umfang. Die ganze Fläche: Flächeninhalt.') });
    }
    shuffle(['u', 'A', 'u', 'A']).forEach(function (w) {
      var p = uShape(one(['rect', 'x'])), g = uGrid(p), u = g.u, A = g.A, ans = w === 'u' ? u + ' cm' : A + ' cm²';
      var ch = shuffle([ans].concat(uniq([u + ' cm', A + ' cm²', A + ' cm', u + ' cm²', (u + 2) + ' cm', (A + 2) + ' cm²']).filter(function (x) { return x !== ans; }).slice(0, 2)))
        .map(function (x) { return { v: x, h: x.replace(' ', NB) }; });
      var it = { head: S(w === 'u' ? 'Wie groß ist der Umfang?' : 'Wie groß ist der Flächeninhalt?'), body: uCard(g.svg, 'ua'), choices: ch, ans: ans, cols: 3,
        why: S(w === 'u' ? 'Umfang: Kästchenseiten am Rand zählen. u = ' + u + ' cm' : 'Flächeninhalt: Kästchen innen zählen. A = ' + A + ' cm²') };
      it.after = function () { document.getElementById('ua').innerHTML = uGrid(p, w === 'u' ? { tr: UTR, ring: UTR } : { cells: OKC }).svg; };
      set.push(it);
    });
    uPairs(3, false).forEach(function (ab, k) {
      var a = ab[0], b = ab[1], u = 2 * (a + b), A = a * b, w = k % 2 ? 'A' : 'u', ans = w === 'u' ? u + ' cm' : A + ' cm²';
      var ch = shuffle([ans].concat(uniq([u + ' cm', A + ' cm²', (a + b) + (w === 'u' ? ' cm' : ' cm²'), A + ' cm', u + ' cm²']).filter(function (x) { return x !== ans; }).slice(0, 2)))
        .map(function (x) { return { v: x, h: x.replace(' ', NB) }; });
      set.push({ head: S(w === 'u' ? 'Berechne den Umfang.' : 'Berechne den Flächeninhalt.'), body: uCard(uLab(a, b, 'cm')), choices: ch, ans: ans, cols: 3,
        why: S(w === 'u' ? 'u = ' + a + ' cm + ' + b + ' cm + ' + a + ' cm + ' + b + ' cm = ' + u + ' cm' : 'A = ' + a + ' cm · ' + b + ' cm = ' + A + ' cm²') });
    });
    return set;
  };

  // ------------------------------------------------------------ Sachaufgaben: Der Schulhof wird neu gestaltet
  var UST = [
    ['u', 'Das Hochbeet ist {a} m lang und {b} m breit. Rund um das Hochbeet kommt ein Zaun. Wie viele Meter Zaun braucht man?', 'Man braucht {r} m Zaun.'],
    ['u', 'Das Basketballfeld ist {a} m lang und {b} m breit. Rund um das Feld wird eine Linie gemalt. Wie lang ist die Linie?', 'Die Linie ist {r} m lang.'],
    ['q', 'Der Sandkasten ist ein Quadrat. Jede Seite ist {a} m lang. Rund um den Sandkasten kommen Randsteine. Wie viele Meter Randsteine braucht man?', 'Man braucht {r} m Randsteine.'],
    ['u', 'Der Schulgarten ist {a} m lang und {b} m breit. Ben läuft einmal rund um den Garten. Wie weit läuft Ben?', 'Ben läuft {r} m.'],
    ['A', 'Unter dem Klettergerüst sollen Matten liegen. Die Fläche ist {a} m lang und {b} m breit. Eine Matte ist 1 m². Wie viele Matten braucht man?', 'Man braucht {r} Matten.'],
    ['A', 'Der Fahrradplatz ist {a} m lang und {b} m breit. Er bekommt ein neues Pflaster. Wie viele Quadratmeter Pflaster braucht man?', 'Man braucht {r} m² Pflaster.'],
    ['A', 'Die Wiese hinter der Schule ist {a} m lang und {b} m breit. Sie bekommt neuen Rasen. Wie viel Rasen braucht man?', 'Man braucht {r} m² Rasen.'],
    ['A', 'Die Leseecke ist {a} m lang und {b} m breit. Sie bekommt einen Teppich. Wie groß ist der Teppich?', 'Der Teppich ist {r} m² groß.']];
  GEN.ufsach = function () {
    var set = [];
    shuffle(UST.slice()).slice(0, 8).concat(shuffle(UST.slice()).slice(0, 2)).forEach(function (s, k) {
      var a = s[0] === 'A' ? R(3, 9) : R(4, 12), b = s[0] === 'q' ? a : (s[0] === 'A' ? R(2, Math.min(a - 1, 6)) : R(2, a - 1));
      var u = 2 * (a + b), A = a * b, isA = s[0] === 'A', res = isA ? A : u;
      var txt = s[1].replace('{a}', a).replace('{b}', b);
      var unit = isA ? (/Matten/.test(s[2]) ? '' : 'm²') : 'm';
      var cU = s[0] === 'q' ? a + ' m + ' + a + ' m + ' + a + ' m + ' + a + ' m' : a + ' m + ' + b + ' m + ' + a + ' m + ' + b + ' m';
      var cA = s[0] === 'q' ? a + ' m · ' + a + ' m' : a + ' m · ' + b + ' m';
      if (k % 2 === 0) {
        set.push({ head: S('Lies genau. Welche Rechnung passt?'), body: '<div class="card story">' + S(txt) + '</div>', cols: 1, ans: 'a',
          choices: shuffle([{ v: 'a', h: isA ? cA : cU }, { v: 'b', h: isA ? cU : cA }, { v: 'c', h: a + ' m + ' + b + ' m' }]),
          why: S(isA ? 'Es geht um die ganze Fläche. Das ist der Flächeninhalt: Länge mal Breite.' : 'Es geht um den Rand rundherum. Das ist der Umfang: alle vier Seiten addieren.') });
      } else {
        var wr = isA ? [u, a + b, A + a] : [A, a + b, u + 2];
        set.push({ head: S('Lies genau. Rechne. Was ist die Antwort?'), body: '<div class="card story">' + S(txt) + '</div>', cols: 3, ans: String(res),
          choices: uOpts(uThree(res, wr), unit),
          why: S((isA ? 'Flächeninhalt: ' + cA + ' = ' + A + (unit ? ' m². ' : '. ') : 'Umfang: ' + cU + ' = ' + u + ' m. ') + s[2].replace('{r}', res)) });
      }
    });
    return set;
  };

  // ------------------------------------------------------------ Ablauf
  var set, i, ok;
  function head(it) {
    return '<p class="cnt">' + L.task + ' ' + (i + 1) + ' ' + L.of + ' ' + set.length + '</p><p class="rq">' + it.head + '</p>';
  }
  function show() {
    var it = set[i];
    if (it.kind === 'order') return order(it);
    if (it.kind === 'sort') return sortTask(it);
    if (it.kind === 'match') return matchTask(it);
    app.innerHTML = head(it) + (it.body || '') +
      (it.kind === 'tap' ? '' : '<div class="rch c' + (it.cols || it.choices.length) + (it.imgc ? ' imgc' : '') + '">' + it.choices.map(function (c) {
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
    if (it.init) it.init();
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
  window.__mt = { set: function () { return set; }, i: function () { return i; }, auto: function (g) { var it = set[i]; if (it.auto) it.auto(g); } };
})();
