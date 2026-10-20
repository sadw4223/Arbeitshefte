/* Übungen am Tablet (Mathe): zehn Aufgaben zum Antippen, nach jeder Antwort Rückmeldung mit kurzer Begründung, am Ende Auswertung.
   Der Typ steht in den Seitendaten: runden, zahlwort, wert, nachbar, zstrahl, vergl (Natürliche Zahlen);
   begriffe, kopf, luecke, add, sub, ueb, sach (Addition und Subtraktion). Schreibweise wie im Heft. */
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
  var NAMES = [['Ben', 'er'], ['Mia', 'sie'], ['Lena', 'sie'], ['Tim', 'er'], ['Emma', 'sie'], ['Noah', 'er'], ['Lea', 'sie'], ['Finn', 'er'], ['Ayla', 'sie'], ['Jonas', 'er']];

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
