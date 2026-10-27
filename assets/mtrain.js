/* Übungen am Tablet (Mathe, Deutsch, Englisch): 20 Aufgaben je Runde (Wunsch Dennis, 25.10.) zum Antippen, nach jeder Antwort Rückmeldung mit kurzer Begründung, am Ende Auswertung.
   Der Typ steht in den Seitendaten: runden, zahlwort, wert, nachbar, zstrahl, vergl (Natürliche Zahlen);
   begriffe, kopf, luecke, add, sub, ueb, sach, klammern (Addition und Subtraktion);
   mdbegriffe, einmaleins, mdluecke, regeln, mdueb, halb, mul1, mul2, div, mdsach (Multiplikation und Division);
   linien, messen, senkpar, koord, symm, spiegeln, schatz (Grundlagen der Geometrie: auch Ziehen, Zuordnen, Verbinden und Antippen in der Zeichnung);
   ufrechteck, ufumfang, ufurechnen, ufflaeche, ufeinheiten, ufarechnen, ufunterschied, ufsach (Umfang und Flächeninhalt);
   grgeld, grlaengen, grlumrechnen, grlrechnen, grmassen, gruhr, grzeit, grsach (Größen);
   tvviel, tvteiler, tvregeln, tvprim, tvkgv, tvggt, tv1x1, tv1x1b (Teiler und Vielfache, 6. Schuljahr; auch Mehrfachauswahl im Zahlenfeld);
   brerkennen, brdarst, brzstrahl, brteile, brerw, brkurz (Brüche, 6. Schuljahr; Färben durch Antippen, Bruch mit zwei Eingabefeldern).
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
        choices: nums(three(sum, w)), ans: sum, cols: 3, why: S(addWhy(ns)), q: { ns: ns, nc: nc } };
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
      var it = { q: { ns: [a, b] }, head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card sgw" id="sg">' + gridHtml([a, b], '–', 3, false) + '</div>',
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
      var it = { q: { a: a, b: b }, head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card kgw" id="kg">' + kgMul(a, b, false) + '</div>',
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
      var it = { q: { a: a, b: b }, head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card kgw" id="kg">' + kgMul(a, b, false) + '</div>',
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
      var it = { q: { dd: dd, dv: dv }, head: S('Rechne schriftlich. Was kommt heraus?'), body: '<div class="card kgw" id="kg">' + kgDiv(dd, dv, false) + '</div>',
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
  var UCZ = 50, UFL = 'rgba(90,127,168,.22)', UTR = '#d0453a', UOR = '#d08a2e';
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
    o = o || {}; var b = uBox(p), nx = b[2] - b[0] + 2, ny = b[3] - b[1] + 2, q = uMove(p, 1 - b[0], 1 - b[1]), c = o.c || UCZ, m = 6;
    var P = q.map(function (v) { return [m + v[0] * c, m + v[1] * c]; });
    var s = karoJ(m, m, nx, ny, c) + pg(P, o.tr || INK, o.tr ? 7 : 4, o.fill || UFL);
    if (o.cols) {   // Streifen: abwechselnd heller und dunkler, Zahlen Streifen für Streifen (passt zu a · b: a Streifen mit je b Kästchen)
      var kk = 1, fz = Math.min(24, Math.round(c * .44));
      for (var ii = 0; ii < nx; ii++) {
        var any = false;
        for (var jj = 0; jj < ny; jj++) if (uIn(q, ii + .5, jj + .5)) {
          any = true;
          s += '<rect x="' + (m + ii * c) + '" y="' + (m + jj * c) + '" width="' + c + '" height="' + c + '" fill="' + AC + '" fill-opacity="' + ((ii % 2) ? .14 : .34) + '"/>';
          s += tx(m + (ii + .5) * c, m + (jj + .5) * c + fz * .36, String(kk++), kk > 10 ? Math.round(fz * .85) : fz, o.cols, 700);
        }
      }
      s += pg(P, INK, 4, 'none');
    }
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
      ['Breite von einem Heft: 21', 'cm'], ['Fläche von der Turnhalle: 400', 'm²'], ['Fläche von einer Spielkarte: 50', 'cm²'], ['Länge vom Schulbus: 12', 'm']];
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
        why: S(a + ' Streifen mit je ' + b + ' Kästchen: ' + a + ' · ' + b + ' = ' + A + '. Also A = ' + A + ' cm².') };
      it.after = function () { document.getElementById('ar').innerHTML = uGrid(p, { c: 44, cols: OKC }).svg; };
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
    ['q', 'Auf dem Schulhof gibt es ein Schachfeld. Es ist ein Quadrat. Jede Seite ist {a} m lang. Rund um das Schachfeld kommen Randsteine. Wie viele Meter Randsteine braucht man?', 'Man braucht {r} m Randsteine.'],
    ['u', 'Der Schulgarten ist {a} m lang und {b} m breit. Ben läuft einmal rund um den Garten. Wie weit läuft Ben?', 'Ben läuft {r} m.'],
    ['A', 'Unter dem Klettergerüst sollen Matten liegen. Die Fläche ist {a} m lang und {b} m breit. Eine Matte ist 1 m². Wie viele Matten braucht man?', 'Man braucht {r} Matten.'],
    ['A', 'Der Fahrradplatz ist {a} m lang und {b} m breit. Er bekommt ein neues Pflaster. Wie viele Quadratmeter Pflaster braucht man?', 'Man braucht {r} m² Pflaster.'],
    ['A', 'Die Wiese hinter der Schule ist {a} m lang und {b} m breit. Sie bekommt neuen Rasen. Wie viel Rasen braucht man?', 'Man braucht {r} m² Rasen.'],
    ['A', 'Die Leseecke ist {a} m lang und {b} m breit. Sie bekommt einen Teppich. Wie groß ist der Teppich?', 'Der Teppich ist {r} m² groß.']];
  GEN.ufsach = function () {
    var set = [];
    shuffle(UST.slice()).slice(0, 8).concat(shuffle(UST.slice()).slice(0, 2)).forEach(function (s, k) {
      var a = s[0] === 'A' ? R(3, 9) : (s[0] === 'q' ? R(3, 6) : R(4, 12)), b = s[0] === 'q' ? a : (s[0] === 'A' ? R(2, Math.min(a - 1, 6)) : R(2, a - 1));
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

  // ============================================================ Größen
  // Schreibweise wie im Heft: 3 € 50 ct (Kommaschreibweise 3,50 € nur lesen), mm, cm, m, km; g, kg, t; s, min, h, Tage.
  var GCU = '#c98a5a', GAU = '#dcb95e', GAG = '#c9c9c9', GRC = '#d0453a', GOR = '#d08a2e';
  var GCOIN = { 1: [16.25, 'cu'], 2: [18.75, 'cu'], 5: [21.25, 'cu'], 10: [19.75, 'au'], 20: [22.25, 'au'], 50: [24.25, 'au'], 100: [23.25, 'e1'], 200: [25.75, 'e2'] };
  var GNOTE = { 500: '#c9ccd0', 1000: '#e9b0a8', 2000: '#a9c0e0', 5000: '#f2c08a' };
  function gEuro(ct) { var e = Math.floor(ct / 100), c = ct % 100; return e && c ? e + NB + '€ ' + c + NB + 'ct' : (e ? e + NB + '€' : c + NB + 'ct'); }
  function gKomma(ct) { var c = ct % 100; return Math.floor(ct / 100) + ',' + (c < 10 ? '0' : '') + c + NB + '€'; }
  function gCoin(v, cx, cy, k) {   // echtes Bild der Münze, Durchmesser im richtigen Verhältnis
    var r = GCOIN[v][0] * k / 2;
    return '<image href="' + IMGP + 'eur_c' + v + '.png" x="' + f1(cx - r) + '" y="' + f1(cy - r) + '" width="' + f1(2 * r) + '" height="' + f1(2 * r) + '"/>';
  }
  var GNWH = { 500: [120, 62], 1000: [127, 67], 2000: [133, 72], 5000: [140, 77] };
  function gNote(v, x, y) {   // echtes Bild des Scheins (Breite 118 · Größe wie beim 5-€-Schein, Seitenverhältnis echt)
    var w = 118 * GNWH[v][0] / 120, h = w * GNWH[v][1] / GNWH[v][0];
    return '<image href="' + IMGP + 'eur_n' + v + '.jpg" x="' + f1(x) + '" y="' + f1(y + 32 - h / 2) + '" width="' + f1(w) + '" height="' + f1(h) + '" preserveAspectRatio="none"/>';
  }
  function gMoney(vals) {   // Scheine und Münzen in einer Reihe (umbrechen nach Breite)
    var o = '', x = 10, y = 10, rowH = 70, k = 2.4, W = 720, mx = 0;
    vals.forEach(function (v) {
      var w = v >= 500 ? 118 * GNWH[v][0] / 120 : GCOIN[v][0] * k;
      if (x + w > W) { x = 10; y += rowH + 10; }
      o += v >= 500 ? gNote(v, x, y + 3) : gCoin(v, x + w / 2, y + 35, k);
      x += w + 12; mx = Math.max(mx, x);
    });
    return '<svg class="gsv" viewBox="0 0 ' + f1(mx) + ' ' + (y + rowH + 10) + '" style="max-width:' + Math.round(mx * 1.35) + 'px;margin:0 auto">' + o + '</svg>';
  }
  function gStr(ans, wr, unit) {   // drei verschiedene Zahlen als Antworten (mit Einheit)
    return three(ans, wr).map(function (v) { return { v: String(v), h: fmt(v) + (unit ? NB + unit : '') }; });
  }
  function gTxt(list) { return shuffle(uniq(list).slice(0, 3)).map(function (t) { return { v: t, h: S(t) }; }); }
  function story(t) { return '<div class="card story">' + S(t) + '</div>'; }
  function big(t, cls) { return '<div class="card cmpq' + (cls ? ' ' + cls : '') + '"><span>' + t + '</span></div>'; }

  // ------------------------------------------------------------ Geld
  GEN.grgeld = function () {
    var set = [], used = {};
    var SETS = [[1000, 200, 50, 20, 5], [500, 100, 100, 50, 10, 2], [2000, 500, 200, 20, 20, 1], [1000, 500, 100, 50, 50, 5, 2], [500, 200, 200, 10, 10, 10], [2000, 1000, 100, 20, 5, 5]];
    shuffle(SETS).slice(0, 3).forEach(function (vals) {
      var s = sum(vals), e = Math.floor(s / 100), c = s % 100;
      set.push({ head: S('Wie viel Geld ist das?'), body: '<div class="card gsw">' + gMoney(vals) + '</div>', cols: 3, ans: gEuro(s),
        choices: shuffle(uniq([gEuro(s), gEuro(s + 100), gEuro(s - 10), gEuro(e * 100 + (c + 5) % 100)]).slice(0, 3)).map(function (t) { return { v: t, h: t }; }),
        why: S('Zähle zuerst die Scheine und die Euro-Münzen: ' + e + ' €. Dann die Cent-Münzen: ' + c + ' ct. Zusammen: ' + gEuro(s) + '.') });
    });
    for (var k = 0; k < 2; k++) {
      var e = R(2, 9), c = one([5, 8, 15, 30, 45, 60, 75, 90]), ct = e * 100 + c;
      set.push({ head: S('Wandle um.'), body: big(gEuro(ct) + ' = ? ct'), cols: 3, ans: String(ct),
        choices: gStr(ct, [e * 10 + c, e * 1000 + c, c < 10 ? e * 10 + c : e * 100 + c + 10], 'ct'),
        why: S(e + ' € sind ' + e * 100 + ' ct. Dazu kommen ' + c + ' ct. Das sind ' + ct + ' ct.') });
    }
    var ct2 = R(3, 9) * 100 + one([6, 35, 47, 62, 85]);
    set.push({ head: S('Wandle um. Wie viel € und ct sind das?'), body: big(ct2 + ' ct'), cols: 3, ans: gEuro(ct2),
      choices: shuffle(uniq([gEuro(ct2), Math.floor(ct2 / 10) + NB + '€ ' + ct2 % 10 + NB + 'ct', gEuro((ct2 % 100) * 100 + Math.floor(ct2 / 100))])).map(function (t) { return { v: t, h: t }; }),
      why: S('100 ct sind 1 €. ' + ct2 + ' ct sind ' + gEuro(ct2) + '.') });
    var p = R(1, 8) * 100 + one([5, 49, 95, 65, 25]);
    set.push({ head: S('Auf dem Preisschild steht:'), body: big(gKomma(p)), cols: 3, ans: gEuro(p),
      choices: shuffle(uniq([gEuro(p), Math.floor(p / 100) * 10 + Math.floor((p % 100) / 10) + NB + '€ ' + p % 10 + NB + 'ct', p + NB + '€'])).map(function (t) { return { v: t, h: t }; }),
      why: S('Vor dem Komma stehen die Euro, nach dem Komma die Cent: ' + gKomma(p) + ' heißt ' + gEuro(p) + '.') });
    var M = shuffle([[120, 'a'], [305, 'b'], [850, 'c'], [200, 'd'], [99, 'e'], [410, 'f']]).slice(0, 4);
    set.push({ kind: 'match', mcls: 'eq', head: S('Was ist gleich viel? Verbinde.'),
      left: M.map(function (m, j) { return { h: j % 2 ? gKomma(m[0]) : gEuro(m[0]), k: m[1] }; }),
      right: shuffle(M.map(function (m) { return { h: m[0] + NB + 'ct', k: m[1] }; })),
      why: S('1 € = 100 ct. Schreibe alles in ct, dann siehst du, was gleich viel ist.') });
    var pr = R(1, 4) * 100 + one([20, 40, 50, 70, 80]), back = 500 - pr;
    set.push({ head: S('Lies genau. Rechne.'), body: story('Du kaufst ein Heft und Stifte für ' + gEuro(pr) + '. Du bezahlst mit einem 5-€-Schein. Wie viel Geld bekommst du zurück?'),
      cols: 3, ans: String(back), choices: three(back, [back + 100, 1000 - pr, back - 10]).map(function (v) { return { v: String(v), h: gEuro(v) }; }),
      why: S('5 € sind 500 ct. 500 ct – ' + pr + ' ct = ' + back + ' ct. Das sind ' + gEuro(back) + '.') });
    var a = R(1, 3) * 100 + one([30, 50, 80]), b = R(1, 2) * 100 + one([40, 60, 90]), z = a + b;
    set.push({ head: S('Lies genau. Rechne.'), body: story('Ein Kakao kostet ' + gEuro(a) + '. Ein Brötchen mit Käse kostet ' + gEuro(b) + '. Wie viel kostet beides zusammen?'),
      cols: 3, ans: String(z), choices: three(z, [z - 100, z + 10, Math.abs(a - b)]).map(function (v) { return { v: String(v), h: gEuro(v) }; }),
      why: S('Rechne in ct: ' + a + ' ct + ' + b + ' ct = ' + z + ' ct. Das sind ' + gEuro(z) + '.') });
    return set;
  };

  // ------------------------------------------------------------ Längen schätzen und messen
  GEN.grlaengen = function () {
    var set = [], U = 60, xa = 70;
    var lens = shuffle([23, 37, 45, 52, 68, 74, 81, 96]).slice(0, 2).concat(shuffle([3, 4, 6, 7, 8, 9]).slice(0, 2).map(function (n) { return n * 10; }));
    lens = [lens[2], lens[0], lens[3], lens[1]];
    lens.forEach(function (mm, j) {
      var inMM = mm % 10 !== 0, y = 60, xb = xa + mm * U / 10, start = R(8, 30) * U / 10;
      var nm = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']][j];
      var seg = ln(xa, y, xb, y) + cr(xa, y, INK, 9, 4) + cr(xb, y, INK, 9, 4) + tx(xa, y - 22, nm[0], 26) + tx(xb, y - 22, nm[1], 26);
      function pic(off, hi) {
        return sv(760, 160, seg + '<g id="rul" class="rul" transform="translate(' + (xa + off) + ' ' + (y + 12) + ')">' + rulerSvg(11, U, hi) + '</g>', 'drag', 'rsv');
      }
      var it = inMM ? { head: S('Ziehe das Lineal an die Strecke. Wie lang ist sie in mm?'), cols: 3, ans: String(mm),
          choices: gStr(mm, [mm + 10, mm - 1, (mm % 10) * 10 + Math.floor(mm / 10)], 'mm'),
          why: S('Die Strecke endet nach der ' + Math.floor(mm / 10) + ', ' + mm % 10 + ' kleine Striche weiter. ' + Math.floor(mm / 10) * 10 + ' mm + ' + mm % 10 + ' mm = ' + mm + ' mm.') }
        : { head: S('Ziehe das Lineal an die Strecke. Wie lang ist sie in cm?'), cols: 3, ans: String(mm / 10),
          choices: gStr(mm / 10, [mm / 10 + 1, mm / 10 - 1, mm / 10 + 2], 'cm'),
          why: S('Lege die 0 genau an den Punkt ' + nm[0] + '. Am Punkt ' + nm[1] + ' steht die ' + mm / 10 + '. Die Strecke ist ' + mm / 10 + ' cm lang.') };
      it.body = '<div class="card gsw">' + pic(start) + '</div>';
      it.init = function () { dragRuler(document.getElementById('rsv'), U, xa); };
      it.after = function () {
        var g = document.getElementById('rul'); if (!g) return;
        g.style.transition = 'transform .6s ease'; g.setAttribute('transform', 'translate(' + xa + ' ' + (y + 12) + ')');
        g.innerHTML = rulerSvg(11, U, inMM ? null : mm / 10);
      };
      set.push(it);
    });
    var EU = [['Länge von einem Bleistift: 16', 'cm'], ['Dicke von einem Heft: 3', 'mm'], ['Höhe von einem Baum: 12', 'm'], ['Weg von Lauterbach nach Gießen: 70', 'km'],
      ['Länge von einem Marienkäfer: 6', 'mm'], ['Breite von einem Fenster: 1', 'm'], ['Länge von einer Wanderung: 8', 'km'], ['Länge von einem Smartphone: 15', 'cm'],
      ['Länge von einem Fußballfeld: 100', 'm'], ['Dicke von einem Fingernagel: 1', 'mm']];
    shuffle(EU).slice(0, 4).forEach(function (e) {
      set.push({ head: S('Welche Einheit passt?'), body: '<div class="card story">' + S(e[0]) + ' …</div>', cols: 4, ans: e[1],
        choices: ['mm', 'cm', 'm', 'km'].map(function (u) { return { v: u, h: u }; }),
        why: S('Ganz kleine Dinge misst du in mm, kleine in cm, große in m und weite Wege in km. Hier passt ' + e[1] + '.') });
    });
    var SM = shuffle([['Höhe vom Schulhaus', 'm'], ['Länge vom Schulflur', 'm'], ['Weg nach Fulda', 'km'], ['Strecke vom Stadtlauf', 'km'], ['Länge von einem Bus', 'm'], ['Weg zur Nordsee', 'km']]).slice(0, 4);
    set.push({ kind: 'sort', scls: 'txt', head: S('Misst du in m oder in km? Ziehe jede Karte in das richtige Feld.'), cats: [{ v: 'm', h: 'm' }, { v: 'km', h: 'km' }],
      items: SM.map(function (x) { return { h: '<span>' + S(x[0]) + '</span>', c: x[1] }; }), why: S('Weite Wege misst du in km. Für Häuser, Flure und Busse nimmst du m.') });
    set.push(one([rfItem('Eine Tür ist ungefähr 2 m hoch.', 'r', 'Eine Tür ist ein bisschen höher als ein Erwachsener, ungefähr 2 m.'),
      rfItem('Ein Radiergummi ist ungefähr 4 m lang.', 'f', 'Ein Radiergummi ist ungefähr 4 cm lang.'),
      rfItem('1 cm ist ungefähr so breit wie ein Finger.', 'r', 'Ein Finger ist ungefähr 1 cm breit.')]));
    return set;
  };

  // ------------------------------------------------------------ Längen umwandeln
  GEN.grlumrechnen = function () {
    var set = [];
    var T = [
      function () { var n = R(2, 9); return [n + ' m', 'cm', n * 100, [n * 10, n * 1000], 'Von m in cm: mal 100. Hänge zwei Nullen an.']; },
      function () { var n = R(2, 15); return [n + ' cm', 'mm', n * 10, [n * 100, n + 10], 'Von cm in mm: mal 10. Hänge eine Null an.']; },
      function () { var n = R(2, 9); return [n + ' km', 'm', n * 1000, [n * 100, n * 10], 'Von km in m: mal 1 000. Hänge drei Nullen an.']; },
      function () { var n = R(2, 9); return [fmt(n * 100) + ' cm', 'm', n, [n * 10, n * 100], 'Von cm in m: geteilt durch 100. Nimm zwei Nullen weg.']; },
      function () { var n = R(2, 30); return [n * 10 + ' mm', 'cm', n, [n * 100, n * 10 + 10], 'Von mm in cm: geteilt durch 10. Nimm eine Null weg.']; },
      function () { var n = R(2, 9); return [fmt(n * 1000) + ' m', 'km', n, [n * 10, n * 100], 'Von m in km: geteilt durch 1 000. Nimm drei Nullen weg.']; }];
    shuffle(T).forEach(function (f) {
      var t = f();
      set.push({ head: S('Wandle um.'), body: big(t[0] + ' = ? ' + t[1]), cols: 3, ans: String(t[2]), choices: gStr(t[2], t[3], t[1]), why: S(t[4] + ' ' + t[0] + ' = ' + fmt(t[2]) + ' ' + t[1] + '.') });
    });
    var a = R(2, 6), b = R(2, 9);
    set.push({ head: S('Achtung! Wandle um.'), body: big(a + ' m ' + b + ' cm = ? cm'), cols: 3, ans: String(a * 100 + b),
      choices: gStr(a * 100 + b, [a * 10 + b, a * 100 + b * 10], 'cm'), why: S(a + ' m sind ' + a * 100 + ' cm. Dazu kommen ' + b + ' cm. Das sind ' + (a * 100 + b) + ' cm, nicht ' + (a * 10 + b) + ' cm.') });
    var c = R(1, 4), d = one([150, 250, 400, 650, 800]);
    set.push({ head: S('Wandle um.'), body: big(c + ' km ' + d + ' m = ? m'), cols: 3, ans: String(c * 1000 + d),
      choices: gStr(c * 1000 + d, [c * 100 + d, c + d, c * 1000 + d + 100], 'm'), why: S(c + ' km sind ' + fmt(c * 1000) + ' m. Dazu kommen ' + d + ' m. Das sind ' + fmt(c * 1000 + d) + ' m.') });
    var e = R(1, 5) * 100 + R(11, 89);
    set.push({ head: S('Schreibe in m und cm.'), body: big(e + ' cm'), cols: 3, ans: Math.floor(e / 100) + ' m ' + e % 100 + ' cm',
      choices: shuffle([Math.floor(e / 100) + ' m ' + e % 100 + ' cm', Math.floor(e / 10) + ' m ' + e % 10 + ' cm', e % 100 + ' m ' + Math.floor(e / 100) + ' cm']).map(function (t) { return { v: t, h: t.replace(/ (?=[a-z])/g, NB) }; }),
      why: S('100 cm sind 1 m. ' + e + ' cm sind ' + Math.floor(e / 100) + ' m und ' + e % 100 + ' cm.') });
    var P = shuffle([['1 m', '100 cm', 'a'], ['1 km', '1 000 m', 'b'], ['1 cm', '10 mm', 'c'], ['30 cm', '300 mm', 'd'], ['2 m', '200 cm', 'e'], ['5 km', '5 000 m', 'f']]).slice(0, 4);
    set.push({ kind: 'match', mcls: 'eq', head: S('Was ist gleich lang? Verbinde.'),
      left: P.map(function (p) { return { h: p[0].replace(' ', NB), k: p[2] }; }), right: shuffle(P.map(function (p) { return { h: p[1].replace(/ (?=[a-z])/, NB), k: p[2] }; })),
      why: S('1 m = 100 cm, 1 km = 1 000 m und 1 cm = 10 mm.') });
    return set;
  };

  // ------------------------------------------------------------ Mit Längen rechnen
  GEN.grlrechnen = function () {
    var set = [];
    for (var k = 0; k < 2; k++) {
      var a = R(2, 7), b = one([15, 25, 40, 55, 60, 75, 80]), r = a * 100 + b;
      set.push({ head: S('Rechne.'), body: big(a + ' m + ' + b + ' cm = ? cm'), cols: 3, ans: String(r), choices: gStr(r, [a + b, a * 10 + b, r + 100], 'cm'),
        why: S('Wandle zuerst um: ' + a + ' m = ' + a * 100 + ' cm. Dann: ' + a * 100 + ' cm + ' + b + ' cm = ' + r + ' cm.') });
    }
    var c = one([5, 7, 9]), d = R(2, 9);
    set.push({ head: S('Rechne.'), body: big(c + ' cm + ' + d + ' mm = ? mm'), cols: 3, ans: String(c * 10 + d), choices: gStr(c * 10 + d, [c + d, c * 100 + d], 'mm'),
      why: S(c + ' cm sind ' + c * 10 + ' mm. ' + c * 10 + ' mm + ' + d + ' mm = ' + (c * 10 + d) + ' mm.') });
    var m = R(1, 3), s = one([20, 35, 40, 65, 70]), q = m * 100 - s;
    set.push({ head: S('Rechne.'), body: big(m + ' m – ' + s + ' cm = ? cm'), cols: 3, ans: String(q), choices: gStr(q, [m * 100 + s, s - m, q + 10], 'cm'),
      why: S(m + ' m sind ' + m * 100 + ' cm. ' + m * 100 + ' cm – ' + s + ' cm = ' + q + ' cm.') });
    var f = R(3, 9), g = R(3, 8);
    set.push({ head: S('Rechne.'), body: big(f + ' cm · ' + g + ' = ?'), cols: 3, ans: String(f * g), choices: gStr(f * g, [f * g + f, f + g, f * g - g], 'cm'),
      why: S('Bei mal bleibt die Einheit gleich: ' + f + ' · ' + g + ' = ' + f * g + '. Also ' + f * g + ' cm.') });
    var h = one([2, 3, 4, 5]), t = h * R(3, 9) * 5;
    set.push({ head: S('Rechne.'), body: big(t + ' m : ' + h + ' = ?'), cols: 3, ans: String(t / h), choices: gStr(t / h, [t - h, t / h + 5, t * h], 'm'),
      why: S('Bei geteilt bleibt die Einheit gleich: ' + t + ' : ' + h + ' = ' + t / h + '. Also ' + t / h + ' m.') });
    var CM = one([[2, 'm', 150, 'cm', '>'], [3, 'km', 3000, 'm', '='], [60, 'mm', 8, 'cm', '<'], [1, 'm', 120, 'cm', '<'], [4, 'cm', 40, 'mm', '=']]);
    var L1 = CM[0] + ' ' + CM[1], L2 = fmt(CM[2]) + ' ' + CM[3];
    set.push({ head: S('Vergleiche. Welches Zeichen passt?'), body: big(L1.replace(' ', NB) + ' &nbsp; ? &nbsp; ' + L2.replace(/ (?=[a-z])/, NB)), cols: 3, ans: CM[4],
      choices: [{ v: '<', h: '&lt;' }, { v: '>', h: '&gt;' }, { v: '=', h: '=' }],
      why: S('Wandle zuerst in die gleiche Einheit um. Dann kannst du vergleichen: ' + L1 + ' ' + CM[4] + ' ' + L2 + '.') });
    var se = R(2, 5), ab = one([30, 40, 60, 80]), rr = se * 100 - ab;
    set.push({ head: S('Lies genau. Rechne.'), body: story('Ayla hat ein Seil. Es ist ' + se + ' m lang. Sie schneidet ' + ab + ' cm ab. Wie lang ist das Seil jetzt?'), cols: 3, ans: String(rr),
      choices: gStr(rr, [se * 100 + ab, ab - se, rr - 100], 'cm'), why: S(se + ' m sind ' + se * 100 + ' cm. Abschneiden heißt minus: ' + se * 100 + ' cm – ' + ab + ' cm = ' + rr + ' cm.') });
    var st = R(3, 6), lg = one([20, 25, 30, 40]), ges = st * lg;
    set.push({ head: S('Lies genau. Rechne.'), body: story('Für eine Girlande braucht Ben ' + st + ' Bänder. Jedes Band ist ' + lg + ' cm lang. Wie viel Band braucht Ben zusammen?'), cols: 3, ans: String(ges),
      choices: gStr(ges, [st + lg, ges + lg, ges - lg], 'cm'), why: S(st + ' gleich lange Bänder: Du rechnest mal. ' + lg + ' cm · ' + st + ' = ' + ges + ' cm.') });
    var gw = one([300, 400, 650, 800]);
    set.push({ head: S('Lies genau. Rechne.'), body: story('Der Weg zum Sportplatz ist 1 km lang. Ben ist schon ' + gw + ' m gegangen. Wie viele Meter muss er noch gehen?'), cols: 3, ans: String(1000 - gw),
      choices: gStr(1000 - gw, [gw - 1, 1000 + gw, 100 - gw / 10], 'm'), why: S('1 km sind 1 000 m. 1 000 m – ' + gw + ' m = ' + (1000 - gw) + ' m.') });
    return set;
  };

  // ------------------------------------------------------------ Massen
  function gDial(v) {
    var cx = 150, cy = 150, r = 130, o = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
    for (var g = 0; g < 1000; g += 50) {
      var a = g * .36 * Math.PI / 180, bg = g % 100 === 0, r1 = r - (bg ? 18 : 10);
      o += ln(cx + r1 * Math.sin(a), cy - r1 * Math.cos(a), cx + r * Math.sin(a), cy - r * Math.cos(a), INK, bg ? 3 : 2);
      if (bg) o += tx(cx + (r - 38) * Math.sin(a), cy - (r - 38) * Math.cos(a) + 7, String(g), 19, INK, 700);
    }
    var b = v * .36 * Math.PI / 180;
    o += ln(cx, cy, cx + (r - 12) * Math.sin(b), cy - (r - 12) * Math.cos(b), GRC, 6) + dt(cx, cy, 7) + tx(cx, cy + 40, 'g', 26, INK, 800);
    return '<svg class="gsv" viewBox="0 0 300 300" style="max-width:300px;margin:0 auto">' + o + '</svg>';
  }
  GEN.grmassen = function () {
    var set = [];
    shuffle([150, 250, 350, 400, 550, 600, 750, 800, 900]).slice(0, 3).forEach(function (v) {
      var hund = v % 100 === 0;
      set.push({ head: S('Wie viel Gramm zeigt die Waage?'), body: '<div class="card gsw">' + gDial(v) + '</div>', cols: 3, ans: String(v),
        choices: gStr(v, hund ? [v + 50, v - 100, v + 100] : [v - 50, v + 50, v + 100], 'g'),
        why: S(hund ? 'Der Zeiger steht genau auf der ' + v + '. Es sind ' + v + ' g.' : 'Der Zeiger steht auf dem kleinen Strich nach der ' + (v - 50) + '. Das sind 50 g mehr: ' + v + ' g.') });
    });
    var EM = [['eine Tafel Schokolade: 100', 'g'], ['ein Fahrrad: 12', 'kg'], ['ein Lastwagen: 20', 't'], ['ein Ei: 60', 'g'], ['ein Hund: 25', 'kg'], ['ein Wal: 30', 't'], ['ein Radiergummi: 15', 'g'], ['ein Koffer: 18', 'kg']];
    shuffle(EM).slice(0, 2).forEach(function (e) {
      set.push({ head: S('Welche Einheit passt?'), body: '<div class="card story">' + S(e[0]) + ' …</div>', cols: 3, ans: e[1],
        choices: ['g', 'kg', 't'].map(function (u) { return { v: u, h: u }; }), why: S('Leichte Dinge wiegst du in g, schwere in kg, ganz schwere in t. Hier passt ' + e[1] + '.') });
    });
    var T = [
      function () { var n = R(2, 9); return [n + ' kg', 'g', n * 1000, [n * 100, n * 10], 'Von kg in g: mal 1 000. Hänge drei Nullen an.']; },
      function () { var n = R(2, 9); return [fmt(n * 1000) + ' g', 'kg', n, [n * 100, n * 10], 'Von g in kg: geteilt durch 1 000. Nimm drei Nullen weg.']; },
      function () { var n = R(2, 6); return [n + ' t', 'kg', n * 1000, [n * 100, n * 10], 'Von t in kg: mal 1 000. Hänge drei Nullen an.']; },
      function () { var n = R(1, 4), m = one([200, 250, 500, 750]); return [n + ' kg ' + m + ' g', 'g', n * 1000 + m, [n * 100 + m, n + m], n + ' kg sind ' + fmt(n * 1000) + ' g. Dazu kommen ' + m + ' g.']; }];
    shuffle(T).slice(0, 2).forEach(function (f) {
      var t = f();
      set.push({ head: S('Wandle um.'), body: big(t[0] + ' = ? ' + t[1]), cols: 3, ans: String(t[2]), choices: gStr(t[2], t[3], t[1]), why: S(t[4] + ' ' + t[0] + ' = ' + fmt(t[2]) + ' ' + t[1] + '.') });
    });
    var CM = one([[2, 'kg', 1500, 'g', '>'], [3000, 'g', 3, 'kg', '='], [1, 't', 1200, 'kg', '<'], [700, 'g', 1, 'kg', '<'], [5, 'kg', 5000, 'g', '=']]);
    var L1 = fmt(CM[0]) + ' ' + CM[1], L2 = fmt(CM[2]) + ' ' + CM[3];
    set.push({ head: S('Vergleiche. Welches Zeichen passt?'), body: big(L1 + ' &nbsp; ? &nbsp; ' + L2), cols: 3, ans: CM[4],
      choices: [{ v: '<', h: '&lt;' }, { v: '>', h: '&gt;' }, { v: '=', h: '=' }],
      why: S('Wandle zuerst in die gleiche Einheit um: 1 kg = 1 000 g, 1 t = 1 000 kg. Dann gilt: ' + L1 + ' ' + CM[4] + ' ' + L2 + '.') });
    var a = one([250, 300, 400]), b = one([450, 500, 550]), z = a + b, rest = 1000 - z;
    set.push({ head: S('Lies genau. Rechne.'), body: story('In eine Tüte passen 1 kg. Mia legt ' + a + ' g Kirschen und ' + b + ' g Pflaumen hinein. Wie viel Gramm passen noch hinein?'), cols: 3, ans: String(rest),
      choices: gStr(rest, [z, rest + 100, rest + 50], 'g'), why: S('Zusammen: ' + a + ' g + ' + b + ' g = ' + z + ' g. 1 kg sind 1 000 g. 1 000 g – ' + z + ' g = ' + rest + ' g.') });
    set.push(rfItem('Im Alltag sagt man für Masse oft Gewicht.', 'r', 'Man fragt zum Beispiel: Wie viel wiegt das? Wie schwer ist das?'));
    return set;
  };

  // ------------------------------------------------------------ Uhr
  function gClock(h, m) {
    var c = 140, r = 128, o = '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
    for (var i = 0; i < 60; i++) {
      var a = i * 6 * Math.PI / 180, bg = i % 5 === 0, r1 = r - (bg ? 13 : 6);
      o += ln(c + r1 * Math.sin(a), c - r1 * Math.cos(a), c + r * Math.sin(a), c - r * Math.cos(a), INK, bg ? 3 : 1.5);
    }
    for (i = 1; i <= 12; i++) { var b = i * 30 * Math.PI / 180; o += tx(c + (r - 30) * Math.sin(b), c - (r - 30) * Math.cos(b) + 9, String(i), 25, INK, 700); }
    if (h === null) return o;
    var ah = ((h % 12) * 30 + m * .5) * Math.PI / 180, am = m * 6 * Math.PI / 180;
    o += ln(c, c, c + r * .5 * Math.sin(ah), c - r * .5 * Math.cos(ah), INK, 11) + ln(c, c, c + r * .8 * Math.sin(am), c - r * .8 * Math.cos(am), INK, 6) + dt(c, c, 8);
    return '<svg class="gsv" viewBox="0 0 280 280" style="max-width:280px;margin:0 auto">' + o + '</svg>';
  }
  function hm(h, m) { return h + ':' + (m < 10 ? '0' : '') + m + NB + 'Uhr'; }
  function msd(v) { var m = Math.floor(v / 60), s = v % 60; return (m ? m + NB + 'min' : '') + (m && s ? ' ' : '') + (s || !m ? s + NB + 's' : ''); }
  function dur(n) { var h = Math.floor(n / 60), m = n % 60; return (h ? h + NB + 'h' : '') + (h && m ? ' ' : '') + (m || !h ? m + NB + 'min' : ''); }
  GEN.gruhr = function () {
    var set = [], seen = {};
    for (var k = 0; k < 4; k++) {
      var h, m; do { h = R(1, 11); m = one([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]); } while (seen[h + ':' + m] || m / 5 === h); seen[h + ':' + m] = 1;
      var swap = m % 5 === 0 && m > 0 ? [m / 5 === 0 ? 12 : m / 5, h * 5 % 60] : [h + 1, m];
      var ch = uniq([hm(h, m), hm(swap[0], swap[1]), hm(h === 1 ? 12 : h - 1, m), hm(h + 1, m)]).slice(0, 3);
      set.push({ head: S('Wie spät ist es?'), body: '<div class="card gsw">' + gClock(h, m) + '</div>', cols: 3, ans: hm(h, m), choices: shuffle(ch).map(function (t) { return { v: t, h: t }; }),
        why: S('Der kleine Zeiger zeigt die Stunde: ' + h + '. Der große Zeiger zeigt die Minuten: ' + m + '. Es ist ' + hm(h, m) + '.') });
    }
    var h2 = R(1, 9), m2 = one([10, 15, 30, 45]);
    set.push({ head: S('Es ist Nachmittag. Wie sagst du?'), body: big(hm(h2, m2)), cols: 3, ans: hm(h2 + 12, m2),
      choices: shuffle([hm(h2 + 12, m2), hm(h2 + 10, m2), hm(h2 + 2, m2)]).map(function (t) { return { v: t, h: t }; }),
      why: S('Am Nachmittag zählst du 12 dazu: ' + h2 + ' + 12 = ' + (h2 + 12) + '. Es ist ' + hm(h2 + 12, m2) + '.') });
    var SP = shuffle([[8, 40, 9, 15], [10, 20, 11, 5], [13, 45, 14, 30], [7, 50, 8, 25], [15, 35, 16, 10], [11, 15, 12, 5]]).slice(0, 3);
    SP.forEach(function (p) {
      var a = 60 - p[1], b = p[3], d = a + b;
      set.push({ head: S('Wie lange dauert es?'), body: big(S('von') + ' ' + hm(p[0], p[1]) + ' ' + S('bis') + ' ' + hm(p[2], p[3]), 'sm'), cols: 3, ans: String(d),
        choices: three(d, [d + 10, Math.abs(p[3] - p[1]), d + 60]).map(function (v) { return { v: String(v), h: dur(v) }; }),
        why: S('Bis ' + p[2] + ':00 Uhr sind es ' + a + ' min. Dann noch ' + b + ' min. ' + a + ' min + ' + b + ' min = ' + dur(d) + '.') });
    });
    var bh = R(8, 15), bm = one([20, 30, 40, 45]), dd = one([30, 45, 50]), e = bh * 60 + bm + dd;
    set.push({ head: S('Wann ist es zu Ende?'), body: story('Das Training beginnt um ' + hm(bh, bm) + '. Es dauert ' + dd + ' min.'), cols: 3, ans: hm(Math.floor(e / 60), e % 60),
      choices: shuffle(uniq([hm(Math.floor(e / 60), e % 60), hm(bh, (bm + dd) % 60), hm(Math.floor(e / 60) + 1, e % 60), hm(Math.floor(e / 60), (e + 15) % 60)]).slice(0, 3)).map(function (t) { return { v: t, h: t }; }),
      why: S('Rechne bis zur vollen Stunde und dann weiter: ' + hm(bh, bm) + ' + ' + dd + ' min = ' + hm(Math.floor(e / 60), e % 60) + '.') });
    set.push(rfItem('Bei halb steht der große Zeiger auf der 6.', 'r', 'Eine halbe Stunde sind 30 Minuten. Dann steht der große Zeiger unten auf der 6.'));
    return set;
  };

  // ------------------------------------------------------------ Zeit umwandeln und rechnen
  GEN.grzeit = function () {
    var set = [];
    var EZ = [['einen Apfel essen: 5', 'min'], ['einmal in die Hände klatschen: 1', 's'], ['ein Schultag: 6', 'h'], ['die Sommerferien: 42', 'Tage'], ['ein Kinofilm: 2', 'h'],
      ['einen Satz sagen: 3', 's'], ['eine Schulstunde: 45', 'min'], ['eine Klassenfahrt: 5', 'Tage']];
    shuffle(EZ).slice(0, 2).forEach(function (e) {
      set.push({ head: S('Welche Einheit passt?'), body: '<div class="card story">' + S(e[0]) + ' …</div>', cols: 4, ans: e[1],
        choices: ['s', 'min', 'h', 'Tage'].map(function (u) { return { v: u, h: u }; }), why: S('Ganz kurz: s. Kurz: min. Lang: h. Ganz lang: Tage. Hier passt ' + e[1] + '.') });
    });
    var T = [
      function () { var n = R(2, 5); return [n + ' h', 'min', n * 60, [n * 100, n * 10], '1 h = 60 min. ' + n + ' h sind ' + n + ' · 60 min.']; },
      function () { var n = R(2, 5); return [n + ' min', 's', n * 60, [n * 100, n * 10], '1 min = 60 s. ' + n + ' min sind ' + n + ' · 60 s.']; },
      function () { var n = R(2, 3); return [n + ' Tage', 'h', n * 24, [n * 60, n * 12], '1 Tag = 24 h. ' + n + ' Tage sind ' + n + ' · 24 h.']; },
      function () { var n = R(2, 4); return [n * 60 + ' min', 'h', n, [n * 10, n * 6], '60 min sind 1 h. ' + n * 60 + ' min sind ' + n + ' h.']; }];
    shuffle(T).slice(0, 3).forEach(function (f) {
      var t = f();
      set.push({ head: S('Wandle um.'), body: big(t[0] + ' = ? ' + t[1]), cols: 3, ans: String(t[2]), choices: gStr(t[2], t[3], t[1]), why: S(t[4]) + ' ' + t[0] + ' = ' + t[2] + ' ' + t[1] + '.' });
    });
    shuffle([70, 85, 95, 110, 125, 140]).slice(0, 2).forEach(function (n) {
      set.push({ head: S('Wandle um. Wie viele h und min sind das?'), body: big(n + ' min'), cols: 3, ans: String(n),
        choices: three(n, [n - 10, n + 10, n + 60]).map(function (v) { return { v: String(v), h: dur(v) }; }),
        why: S('Nimm 60 min weg, so oft es geht: ' + n + ' min = 60 min + ' + (n - 60) + ' min = ' + dur(n) + '.') });
    });
    var V = one([['eine halbe Stunde', 30], ['eine Viertelstunde', 15], ['eine Dreiviertelstunde', 45]]);
    set.push({ head: S('Wie viele Minuten sind das?'), body: big(S(V[0])), cols: 3, ans: String(V[1]), choices: [15, 30, 45].map(function (v) { return { v: String(v), h: v + NB + 'min' }; }),
      why: S('1 h = 60 min. Die Hälfte sind 30 min, ein Viertel sind 15 min, drei Viertel sind 45 min.') });
    var a = one([35, 40, 45, 50]), b = one([30, 35, 40]), z = a + b;
    set.push({ head: S('Rechne.'), body: big(a + ' min + ' + b + ' min = ?'), cols: 3, ans: String(z),
      choices: three(z, [z + 10, z - 10, z + 60]).map(function (v) { return { v: String(v), h: dur(v) }; }),
      why: S(a + ' min + ' + b + ' min = ' + z + ' min. Das sind ' + dur(z) + '.') });
    var s = one([35, 50, 55]), n2 = R(3, 4), ss = s * n2;
    set.push({ head: S('Lies genau. Rechne.'), body: story('Leon braucht für eine Bahn im Schwimmbad ' + s + ' s. Er schwimmt ' + n2 + ' Bahnen. Wie lange schwimmt er?'), cols: 3, ans: String(ss),
      choices: three(ss, [ss + 60, ss - 10, ss + 10]).map(function (v) { return { v: String(v), h: msd(v) }; }),
      why: S(s + ' s · ' + n2 + ' = ' + ss + ' s. 60 s sind 1 min: ' + ss + ' s = ' + msd(ss).replace(/ /g, ' ') + '.') });
    return set;
  };

  // ------------------------------------------------------------ Sachaufgaben Wochenmarkt
  var GST = [
    function () { var p = one([120, 150, 180, 240]), n = R(2, 3); return { t: 'Auf dem Wochenmarkt am Löwendenkmal kostet 1 kg Äpfel ' + gKomma(p) + '. Ayla kauft ' + n + ' kg. Wie viel muss sie bezahlen?', ans: p * n, op: p + ' ct · ' + n,
      wr: [p + n, p * n + 100], rw: [p + ' ct + ' + n, p + ' ct – ' + n], u: 'ct', why: 'Jedes kg kostet gleich viel: Du rechnest mal. ' + p + ' ct · ' + n + ' = ' + p * n + ' ct = ' + gEuro(p * n) + '.', geld: true }; },
    function () { var p = one([230, 270, 340, 380, 460]); return { t: 'Ben kauft ein Brot für ' + gKomma(p) + '. Er bezahlt mit einem 5-€-Schein. Wie viel Geld bekommt er zurück?', ans: 500 - p, op: '500 ct – ' + p + ' ct',
      wr: [500 + p, 1000 - p], rw: ['500 ct + ' + p + ' ct', p + ' ct – 5 ct'], why: '5 € sind 500 ct. Zurück bekommt er: 500 ct – ' + p + ' ct = ' + (500 - p) + ' ct = ' + gEuro(500 - p) + '.', geld: true }; },
    function () { var a = one([180, 220, 260]), b = one([140, 190, 350]); return { t: 'Mia kauft Tomaten für ' + gKomma(a) + ' und Käse für ' + gKomma(b) + '. Wie viel bezahlt sie zusammen?', ans: a + b, op: a + ' ct + ' + b + ' ct',
      wr: [Math.abs(a - b), a + b + 100], rw: [Math.max(a, b) + ' ct – ' + Math.min(a, b) + ' ct', a + ' ct · ' + b], why: 'Zusammen heißt plus: ' + a + ' ct + ' + b + ' ct = ' + (a + b) + ' ct = ' + gEuro(a + b) + '.', geld: true }; },
    function () { var a = one([500, 750]), b = one([250, 500]); return { t: 'Der Händler legt ' + a + ' g Kirschen und dann noch ' + b + ' g Kirschen auf die Waage. Wie viel Gramm sind es zusammen?', ans: a + b, op: a + ' g + ' + b + ' g',
      wr: [a - b === 0 ? a + b + 250 : Math.abs(a - b), a + b + 100], rw: [a + ' g – ' + b + ' g', a + ' g · ' + b], u: 'g', why: 'Zusammen heißt plus: ' + a + ' g + ' + b + ' g = ' + (a + b) + ' g.' }; },
    function () { var h = one([7, 8]), e = one([12, 13]); return { t: 'Der Markt ist von ' + h + ':00 Uhr bis ' + e + ':00 Uhr geöffnet. Wie viele Stunden ist er geöffnet?', ans: e - h, op: e + ' h – ' + h + ' h',
      wr: [e + h, e - h + 1], rw: [e + ' h + ' + h + ' h', '24 h – ' + e + ' h'], u: 'h', why: 'Von ' + h + ' Uhr bis ' + e + ' Uhr sind es ' + e + ' – ' + h + ' = ' + (e - h) + ' Stunden.' }; },
    function () { var w = 1600; return { t: 'Jonas geht von der Schule an der Wascherde zum Markt. Der Weg ist ' + fmt(w) + ' m lang. Danach geht er denselben Weg zurück. Wie viele Meter geht er insgesamt?', ans: 2 * w, op: fmt(w) + ' m + ' + fmt(w) + ' m',
      wr: [w, 2 * w + 100], rw: [fmt(w) + ' m – ' + fmt(w) + ' m', fmt(w) + ' m : 2'], u: 'm', why: 'Hin und zurück: Du rechnest den Weg zweimal. ' + fmt(w) + ' m + ' + fmt(w) + ' m = ' + fmt(2 * w) + ' m. Das sind 3 km 200 m.' }; },
    function () { var n = one([4, 5, 6]), p = one([30, 40, 50]); return { t: 'Ein Bund Radieschen kostet ' + gKomma(p) + '. Die Klasse 5a kauft ' + n + ' Bund für das Schulfrühstück. Wie viel kostet das?', ans: n * p, op: p + ' ct · ' + n,
      wr: [n + p, n * p + p], rw: [p + ' ct + ' + n, p + ' ct : ' + n], why: 'Jedes Bund kostet gleich viel: Du rechnest mal. ' + p + ' ct · ' + n + ' = ' + n * p + ' ct = ' + gEuro(n * p) + '.', geld: true }; },
    function () { var g = one([2, 3]), w = one([400, 600, 750]); return { t: 'Ein Sack Kartoffeln wiegt ' + g + ' kg. Lea nimmt ' + w + ' g heraus. Wie viel Gramm sind noch im Sack?', ans: g * 1000 - w, op: fmt(g * 1000) + ' g – ' + w + ' g',
      wr: [g * 1000 + w, Math.abs(w - g)], rw: [fmt(g * 1000) + ' g + ' + w + ' g', w + ' g – ' + g + ' g'], u: 'g', why: g + ' kg sind ' + fmt(g * 1000) + ' g. Herausnehmen heißt minus: ' + fmt(g * 1000) + ' g – ' + w + ' g = ' + fmt(g * 1000 - w) + ' g.' }; },
    function () { var a = one([15, 20, 25]), b = one([35, 40]); return { t: 'Malik braucht ' + a + ' min zum Markt. Er kauft ' + b + ' min lang ein. Wie lange braucht er zusammen?', ans: a + b, op: a + ' min + ' + b + ' min',
      wr: [b - a, a + b + 10], rw: [b + ' min – ' + a + ' min', a + ' min · ' + b], u: 'min', why: 'Zusammen heißt plus: ' + a + ' min + ' + b + ' min = ' + (a + b) + ' min.' }; },
    function () { var p = one([80, 120, 160]), n = 2; return { t: 'Ein Glas Marmelade kostet ' + gKomma(p) + '. Emma kauft 2 Gläser. Sie bezahlt mit einem 5-€-Schein. Wie viel Geld bekommt sie zurück?', ans: 500 - 2 * p, op: '500 ct – ' + p + ' ct · 2',
      wr: [500 - p, 2 * p], rw: ['500 ct – ' + p + ' ct', p + ' ct · 2 + 500 ct'], why: 'Zwei Gläser: ' + p + ' ct · 2 = ' + 2 * p + ' ct. Zurück: 500 ct – ' + 2 * p + ' ct = ' + (500 - 2 * p) + ' ct = ' + gEuro(500 - 2 * p) + '.', geld: true }; }];
  GEN.grsach = function () {
    var set = [];
    shuffle(GST.slice()).forEach(function (f, k) {
      var s = f(), unit = s.u || 'ct';
      s.why = s.why.replace(/(\d+) ct = \1 ct\./, '$1 ct.');
      if (k % 2 === 0) {
        set.push({ head: S('Lies genau. Welche Rechnung passt?'), body: story(s.t), cols: 1, ans: 'a',
          choices: shuffle([{ v: 'a', h: s.op }, { v: 'b', h: s.rw[0] }, { v: 'c', h: s.rw[1] }]), why: S(s.why) });
      } else {
        set.push({ head: S('Lies genau. Rechne. Was ist die Antwort?'), body: story(s.t), cols: 3, ans: String(s.ans),
          choices: three(s.ans, s.wr.filter(function (x) { return x > 0; }).concat([s.ans + 10, s.ans + 20])).map(function (v) { return { v: String(v), h: s.geld ? gEuro(v) : fmt(v) + NB + unit }; }),
          why: S(s.why) });
      }
    });
    return set;
  };

  // ============================================================ Eintippen mit dem Ziffernblock (Zahl ins Feld, Ziffern ins Karo-Feld)
  // Felder im body: nin(Zahl) = Zahlenfeld; Karo: <td class="in" data-a="7" data-o="0"> (wird bewertet, data-o = Reihenfolge beim Schreiben),
  // <td class="fr"> = freies Kästchen zum Mitrechnen (wird nicht bewertet). Nur Ziffernblock, damit keine Tablet-Tastatur die Aufgabe verdeckt.
  function nin(a, cls) { return '<span class="nin' + (cls ? ' ' + cls : '') + '" data-a="' + a + '" role="button" tabindex="0"></span>'; }
  function tdIn(a, o, cls) { return '<td class="in' + (cls ? ' ' + cls : '') + '" data-a="' + a + '" data-o="' + o + '"></td>'; }
  function tdFr(cls) { return '<td class="fr' + (cls ? ' ' + cls : '') + '"></td>'; }
  function pad() {
    var k = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(function (d) { return '<button class="kp" type="button" data-d="' + d + '">' + d + '</button>'; }).join('');
    return '<div class="kpw"><div class="kpad">' + k + '<button class="kp kdel" type="button" data-d="del" aria-label="Löschen">' + L.icDel + '</button>' +
      '<button class="kp" type="button" data-d="0">0</button><button class="kp kok" type="button" data-d="ok" aria-label="' + L.check.replace(/<[^>]+>/g, '') + '" disabled>' + L.icOk + '</button></div></div>';
  }
  var keyFn = null;
  document.addEventListener('keydown', function (e) {
    if (!keyFn) return;
    if (/^[0-9]$/.test(e.key)) { keyFn(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { keyFn('del'); e.preventDefault(); }
    else if (e.key === 'Enter') { keyFn('ok'); e.preventDefault(); }
  });
  function inpTask(it) {
    app.innerHTML = head(it) + '<div class="inpg"><div class="inpl">' + it.body + '</div><div class="inpr">' + pad() + '</div></div><div id="sol"></div><div id="fb"></div>';
    var F = [].slice.call(app.querySelectorAll('.nin, td.in, td.fr')), cur = null, fin = false;
    var chk = F.filter(function (f) { return !f.classList.contains('fr'); });
    var okb = app.querySelector('.kok');
    function isCell(f) { return f.tagName === 'TD'; }
    function val(f) { return f.getAttribute('data-v') || ''; }
    function setv(f, v) {
      f.setAttribute('data-v', v);
      f.textContent = isCell(f) ? v : fmt(v);
      [].slice.call(app.querySelectorAll('[data-mir="' + f.getAttribute('data-o') + '"]')).forEach(function (m) { if (isCell(f) && f.classList.contains('in')) m.textContent = v; });
    }
    function sel(f) { if (cur) cur.classList.remove('cur'); cur = f; if (f) f.classList.add('cur'); }
    function ready() { okb.disabled = fin || !chk.every(function (f) { return val(f) !== '' || f.hasAttribute('data-e'); }) || !chk.some(function (f) { return val(f) !== ''; }); }
    function nextOf(f) {
      if (f.classList.contains('in')) {
        var o = +f.getAttribute('data-o');
        return chk.filter(function (g) { return g.classList.contains('in') && +g.getAttribute('data-o') === o + 1; })[0] || null;
      }
      var row = f.parentNode, rtl = row.classList.contains('rtl'); if (!rtl && !row.classList.contains('ltr')) return null;
      var cells = [].slice.call(row.children), j = cells.indexOf(f), n = cells[rtl ? j - 1 : j + 1];
      return n && (n.classList.contains('fr') || n.classList.contains('in')) ? n : null;
    }
    function prevOf(f) {
      if (!f.classList.contains('in')) return null;
      var o = +f.getAttribute('data-o');
      return chk.filter(function (g) { return g.classList.contains('in') && +g.getAttribute('data-o') === o - 1; })[0] || null;
    }
    function key(d) {
      if (fin) return;
      if (d === 'ok') { if (!okb.disabled) check(); return; }
      if (!cur) return;
      if (d === 'del') {
        if (isCell(cur)) { if (val(cur) === '' && prevOf(cur)) sel(prevOf(cur)); setv(cur, ''); }
        else setv(cur, val(cur).slice(0, -1));
      } else if (isCell(cur)) { setv(cur, d); var n = nextOf(cur); if (n) sel(n); }
      else { var v = val(cur); if (v.length < 7) setv(cur, v === '0' ? d : v + d); }
      ready();
    }
    function check() {
      fin = true; keyFn = null; sel(null);
      var fok = [];   // freie Brüche (.brx.kz): auch die gekürzte Form gilt als richtig
      [].slice.call(app.querySelectorAll('.brx.kz')).forEach(function (b) {
        var ff = b.querySelectorAll('.nin'); if (ff.length !== 2) return;
        var vz = val(ff[0]), vn = val(ff[1]), az = +ff[0].getAttribute('data-a'), an = +ff[1].getAttribute('data-a');
        if (vz !== '' && vn !== '' && +vn > 0 && +vz * an === az * +vn && an % +vn === 0) fok.push(ff[0], ff[1]);
      });
      function okf(f) { if (fok.indexOf(f) >= 0) return true; var a = f.getAttribute('data-a'), v = val(f); return isCell(f) ? v === a : v !== '' && String(+v) === String(+a); }
      var good = chk.every(okf);
      chk.forEach(function (f) {
        var a = f.getAttribute('data-a'), v = val(f), r = okf(f);
        f.classList.add(r ? 'iok' : 'ino');
        if (!r && !isCell(f)) f.insertAdjacentHTML('afterend', '<span class="nfix">' + fmt(a) + '</span>');
      });
      [].slice.call(app.querySelectorAll('.kp')).forEach(function (b) { b.disabled = true; });
      app.querySelector('.kpw').classList.add('off');
      if (!good && it.sol) document.getElementById('sol').innerHTML = '<div class="card solc"><p class="solt">' + L.icEye + '<span>' + L.sol + '</span></p>' + it.sol + '</div>';
      if (it.after) it.after(good);
      feedback(good, it.why);
    }
    F.forEach(function (f) { f.addEventListener('click', function () { if (!fin) sel(f); }); });
    [].slice.call(app.querySelectorAll('.kp')).forEach(function (b) { b.addEventListener('click', function () { key(b.getAttribute('data-d')); }); });
    keyFn = key;
    var first = chk.filter(function (f) { return f.classList.contains('in') && f.getAttribute('data-o') === '0'; })[0] || chk[0];
    sel(first); ready();
    it.auto = function (good) {   // nur für Tests
      chk.forEach(function (f, j) { var a = f.getAttribute('data-a'); setv(f, !good && j === 0 ? String((+a + 1) % 10 + (isCell(f) ? 0 : 10)) : (f.hasAttribute('data-e') ? '' : a)); });
      ready(); check();
    };
    top();
  }

  // ------------------------------------------------------------ Geld legen: Münzen und Scheine antippen oder ziehen
  var GVALS = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  function mIcon(v) {
    if (v >= 500) { var w = 118 * GNWH[v][0] / 120, h = w * GNWH[v][1] / GNWH[v][0]; return '<svg class="gmi gn" viewBox="0 0 ' + f1(w) + ' ' + f1(h) + '">' + gNote(v, 0, h / 2 - 32) + '</svg>'; }
    var d = GCOIN[v][0] * 2.4; return '<svg class="gmi gc" viewBox="0 0 ' + f1(d + 2) + ' ' + f1(d + 2) + '" style="width:' + f1(d * 1.25) + 'px">' + gCoin(v, d / 2 + 1, d / 2 + 1, 2.4) + '</svg>';
  }
  function greedy(ct) { var o = []; GVALS.forEach(function (v) { while (ct >= v) { o.push(v); ct -= v; } }); return o; }
  function geldTask(it) {
    var tray = [], fin = false;
    function draw() {
      app.innerHTML = head(it) + (it.body || '') +
        '<div class="gtray" id="gt"><p class="gtt">' + L.tray + '</p><div class="gtin">' + tray.map(function (v, k) {
          return '<button class="gtk" type="button" data-k="' + k + '"' + (fin ? ' disabled' : '') + '>' + mIcon(v) + '</button>'; }).join('') + '</div></div>' +
        '<div class="gbank">' + it.vals.map(function (v) { return '<button class="gbk" type="button" data-v="' + v + '"' + (fin ? ' disabled' : '') + '>' + mIcon(v) + '</button>'; }).join('') + '</div>' +
        '<button class="btn pri gok" id="gok" type="button"' + (fin || !tray.length ? ' disabled' : '') + '>' + L.icOk + '<span>' + L.check + '</span></button>' +
        '<div id="sol"></div><div id="fb"></div>';
        if (fin) return;
      [].slice.call(app.querySelectorAll('.gbk')).forEach(function (b) {
        var v = +b.getAttribute('data-v');
        dragOrTap(b, function () { add(v); }, function (el) { if (el && el.closest && el.closest('#gt')) add(v); });
      });
      [].slice.call(app.querySelectorAll('.gtk')).forEach(function (b) { b.onclick = function () { tray.splice(+b.getAttribute('data-k'), 1); draw(); }; });
      document.getElementById('gok').onclick = check;
    }
    function add(v) { if (tray.length < 16) { tray.push(v); tray.sort(function (a, b) { return b - a; }); draw(); } }
    function check() {
      fin = true; var s = sum(tray), good = s === it.ans; draw();
      document.getElementById('gt').classList.add(good ? 'iok' : 'ino');
      if (!good) document.getElementById('sol').innerHTML = '<div class="card solc"><p class="solt">' + L.icEye + '<span>' + L.sol + '</span></p><div class="gsw">' + gMoney(greedy(it.ans)) + '</div></div>';
      feedback(good, S('Du hast ' + gEuro(s) + ' gelegt. ') + it.why);
    }
    it.auto = function (good) { tray = greedy(it.ans + (good ? 0 : 10)); check(); };
    draw(); top();
  }

  // ------------------------------------------------------------ Tipp (Glühbirne) zu jeder Aufgabe
  var TIP = {};
  function tipOf(it) { return it.tip || TIP[it.tipk || D.type] || ''; }

  // ============================================================ Interaktiver: Zahlen eintippen statt antippen (gemischt), Karo-Feld, Stellenwerttafel, Geld legen, Verbinden, Ordnen
  function numAns(it) { var a = String(it.ans); return /^\d+$/.test(a) ? a : null; }
  // Zahlen und Einheiten der richtigen Antwort, z. B. „1 h 10 min“ → [[1, 'h'], [10, 'min']]
  function ansParts(it) {
    var c = (it.choices || []).filter(function (x) { return String(x.v) === String(it.ans); })[0];
    if (!c) return [[numAns(it), '']];
    var t = String(c.h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(), out = [], re = /(\d(?:[\d\s  ]*\d)?)\s*([^\d\s  ]*)/g, m;
    while ((m = re.exec(t))) out.push([m[1].replace(/[\s  ]/g, ''), m[2]]);
    if (!out.length || t.replace(re, '').trim()) return null;
    return out;
  }
  // Antwort-Auswahl in ein Eingabefeld verwandeln: Feld an die Stelle von „?“ (in Rechnungen), sonst unter die Aufgabe
  function asInp(it, pre) {
    if (it.kind || !numAns(it)) return it;
    var P = ansParts(it); if (!P || P.length > 2) return it;
    var b = it.body || '';
    if (P.length === 1 && b.indexOf('<b class="qb" id="qb">?</b>') >= 0) { b = b.replace('<b class="qb" id="qb">?</b>', nin(P[0][0])); delete it.after; }
    else if (P.length === 1 && /<b class="qb[^"]*">\?<\/b>/.test(b)) { b = b.replace(/<b class="qb[^"]*">\?<\/b>/, nin(P[0][0])); delete it.after; }
    else if (P.length === 1 && /(=\s*|<span>)\?(\s|<|$)/.test(b)) { b = b.replace(/(=\s*|<span>)\?(\s|<|$)/, '$1' + nin(P[0][0]) + '$2'); delete it.after; }
    else b += '<div class="ninw">' + (pre ? '<span>' + pre + '</span>' : '') + P.map(function (x) { return nin(x[0], P.length > 1 ? 'sm' : '') + (x[1] ? '<span>' + x[1] + '</span>' : ''); }).join('') + '</div>';
    it.body = b; it.kind = 'inp'; delete it.choices;
    return it;
  }
  // jede zweite passende Aufgabe zum Eintippen (die erste bleibt zum Antippen)
  function mix(set, pre, start) {
    var n = 0;
    return set.map(function (it) {
      if (it.kind || !numAns(it)) return it;
      n++; return (n + (start || 0)) % 2 === 0 ? asInp(it, pre) : it;
    });
  }
  function wrapGen(name, fn) { var g = GEN[name]; GEN[name] = function () { return fn(g()); }; }

  // ------------------------------------------------------------ Karo-Feld zum Ausfüllen (schriftlich rechnen wie im Heft)
  function karoAdd(ns, op, nc) {
    var res = op === '+' ? sum(ns) : ns[0] - ns[1], lab = ['T', 'H', 'Z', 'E'].slice(4 - nc), h = '<table class="sgr"><tr class="hd"><td class="o"></td>';
    lab.forEach(function (l) { h += '<td>' + l + '</td>'; }); h += '</tr>';
    ns.forEach(function (n, r) {
      var s = String(n); while (s.length < nc) s = ' ' + s;
      h += '<tr><td class="o">' + (r === ns.length - 1 ? (op === '+' ? '+' : '–') : '') + '</td>';
      for (var k = 0; k < nc; k++) h += '<td>' + (s[k] === ' ' ? '' : s[k]) + '</td>';
      h += '</tr>';
    });
    h += '<tr class="ue"><td class="o"></td>'; for (var k2 = 0; k2 < nc; k2++) h += k2 < nc - 1 ? tdFr() : '<td></td>'; h += '</tr>';
    var rs = String(res);
    h += '<tr class="rs"><td class="o"></td>';
    for (var k3 = 0; k3 < nc; k3++) { var j = k3 - (nc - rs.length); h += j < 0 ? '<td class="nb"></td>' : tdIn(rs[j], rs.length - 1 - j); }
    return h + '</tr></table>';
  }
  function karoMul(a, b) {
    var A = String(a), B = String(b), task = [''].concat(A.split(''), [MP], B.split('')), W = task.length, Rs = String(a * b), lr = Rs.length;
    var top = task.map(function (c) { return td(c, 'k pr'); }).join('') + td('=', 'sy');
    if (B.length === 1) {
      var ob = ''; for (var k = 0; k <= W; k++) ob += td('', 'x');
      for (var i = 0; i < lr; i++) ob += i < lr - 1 ? tdFr('ob') : td('', 'x');
      return '<table class="kgr"><tr class="obr">' + ob + '</tr><tr>' + top + Rs.split('').map(function (c, j) { return tdIn(c, lr - 1 - j, 'rb'); }).join('') + '</tr></table>';
    }
    // zweistellig: Teilzeilen und Übertrag frei, Ergebnis unter dem Doppelstrich wird bewertet und oben hinter „=“ übernommen
    var h = '<table class="kgr"><tr>' + top + Rs.split('').map(function (c, j) { return '<td class="rb mir" data-mir="' + (lr - 1 - j) + '"></td>'; }).join('') + '</tr>';
    for (var r = 0; r < 2; r++) { h += '<tr class="rtl">'; for (var c = 0; c < W; c++) h += c ? tdFr('k') : td('', 'k'); h += '<td class="x" colspan="9"></td></tr>'; }
    h += '<tr class="uer">'; for (var c2 = 0; c2 < W; c2++) h += c2 ? tdFr('k uw ob') : td('', 'k uw'); h += '<td class="x" colspan="9"></td></tr>';
    h += '<tr>'; for (var c3 = 0; c3 < W; c3++) { var j3 = c3 - (W - lr); h += j3 >= 0 ? tdIn(Rs[j3], lr - 1 - j3, 'k ln dl') : td('', 'k' + (c3 >= 1 ? ' ln' : '')); }
    return h + '<td class="x" colspan="9"></td></tr></table>';
  }
  function karoDiv(dd, dv) {
    var D = String(dd), W = D.length + 1, Q = String(Math.floor(dd / dv));
    var h = '<table class="kgr"><tr>' + td('', 'k') + D.split('').map(function (c) { return td(c, 'k pr'); }).join('') + td(':', 'sy') + td(dv, 'k pr') + td('=', 'sy') +
      Q.split('').map(function (c, j) { return tdIn(c, j, 'rb'); }).join('') + '</tr>';
    divRows(dd, dv).rows.forEach(function (r) {
      h += '<tr class="ltr">'; for (var c = 0; c < W; c++) { var ul = (r._ || []).indexOf(c) >= 0 ? ' ul' : ''; h += r[c] === '–' ? td('–', 'k' + ul) : tdFr('k' + ul); }
      h += '<td class="x" colspan="9"></td></tr>';
    });
    return h + '</table>';
  }
  function karoItem(it, body, sol, tip) {
    it.kind = 'inp'; it.head = S('Rechne schriftlich im Karo-Feld.'); it.body = body; it.sol = sol; it.tip = tip;
    delete it.choices; delete it.after; return it;
  }
  var TADD = S('Beginne rechts bei den Einern. Ist eine Summe größer als 9, schreibe den Übertrag klein in die graue Zeile.');
  var TSUB = S('Ergänze von unten nach oben. Beginne rechts bei den Einern. Musst du über 10 ergänzen, schreibe den Übertrag 1 klein in die graue Zeile.');
  var TMUL = S('Beginne hinten bei den Einern. Die Zahl im Sinn kannst du klein darüber schreiben.');
  var TMUL2 = S('Zehner zuerst: Die erste Zeile endet unter der Zehnerziffer. Die zweite Zeile rückt eine Stelle nach rechts. Addiere am Schluss beide Zeilen.');
  var TDIV = S('Beginne vorne. Wie oft passt die Zahl hinein? Multipliziere, subtrahiere, ziehe die nächste Ziffer herunter.');

  // ------------------------------------------------------------ Natürliche Zahlen
  wrapGen('runden', function (set) { return set.map(function (it, k) { return k % 2 ? asInp(it, '≈') : it; }); });
  wrapGen('zahlwort', function (set) {
    return set.map(function (it, k) {
      if (k % 3 !== 1) return it;
      var s = String(it.ans), h = '<table class="stt"><tr>', d = '<tr class="ltr">';
      for (var r = 5; r >= 0; r--) { h += '<th>' + PK[r] + '</th>'; var j = s.length - 1 - r; d += j >= 0 ? tdIn(s[j], 5 - r) : '<td class="in" data-a="" data-e="1" data-o="' + (5 - r) + '"></td>'; }
      it.kind = 'inp'; it.head = S('Schreibe die Zahl in die Stellenwerttafel.');
      it.body = it.body + '<div class="stw">' + h + '</tr>' + d + '</tr></table></div>';
      it.tip = S('Suche zuerst das Wort „tausend“. Die Zahl davor gehört zu T, ZT und HT. Die Zahl danach gehört zu H, Z und E. Steht bei einer Stelle nichts, schreibe 0. Ganz vorne bleiben leere Felder frei.');
      delete it.choices; return it;
    });
  });
  wrapGen('wert', function (set) { return set.map(function (it, k) { return k % 3 === 2 ? asInp(it) : it; }); });
  wrapGen('nachbar', function (set) { return mix(set); });
  wrapGen('zstrahl', function (set) { var n = 0; return set.map(function (it) { if (it.kind) return it; n++; return n % 2 === 0 ? asInp(it) : it; }); });

  // ------------------------------------------------------------ Addition und Subtraktion
  function eqHtml(parts, blue) { return parts.map(function (p, j) { return j === blue ? '<b class="nx">' + p + '</b>' : p; }).join(' '); }
  wrapGen('begriffe', function (set) {
    var a = R(12, 68), b = R(11, 99 - a), c = R(40, 99), d = R(11, c - 10);
    var L4 = [[eqHtml([a, '+', b, '=', a + b], 4), 'Summe'], [eqHtml([c, '–', d, '=', c - d], 0), 'Minuend'], [eqHtml([c, '–', d, '=', c - d], 2), 'Subtrahend'], [eqHtml([c, '–', d, '=', c - d], 4), 'Differenz']];
    set.splice(4, 1, { kind: 'match', mcls: 'eq', head: S('Wie heißt die blaue Zahl? Verbinde.'),
      left: L4.map(function (x, k) { return { h: '<span class="eqc">' + x[0] + '</span>', k: x[1] }; }), right: shuffle(L4.map(function (x) { return { h: S(x[1]), k: x[1] }; })),
      why: S('Plus: Summand + Summand = Summe. Minus: Minuend – Subtrahend = Differenz.') });
    return set;
  });
  wrapGen('kopf', function (set) { return mix(set); });
  wrapGen('luecke', function (set) { return mix(set, '', 1); });
  wrapGen('add', function (set) {
    return [0, 1, 3, 5, 7, 9].map(function (k) { var it = set[k], q = it.q; return karoItem(it, '<div class="card sgw kin">' + karoAdd(q.ns, '+', q.nc) + '</div>', '<div class="sgw">' + gridHtml(q.ns, '+', q.nc, true) + '</div>', TADD); });
  });
  wrapGen('sub', function (set) {
    return [0, 1, 3, 4, 6, 7].map(function (k) { var it = set[k], q = it.q; return karoItem(it, '<div class="card sgw kin">' + karoAdd(q.ns, '–', 3) + '</div>', '<div class="sgw">' + gridHtml(q.ns, '–', 3, true) + '</div>', TSUB); });
  });
  wrapGen('ueb', function (set) { var n = 0; return set.map(function (it) { if (it.cols !== 3) return it; n++; return n % 2 === 0 ? asInp(it, 'Ü:') : it; }); });
  wrapGen('klammern', function (set) { return mix(set); });

  // ------------------------------------------------------------ Multiplikation und Division
  wrapGen('mdbegriffe', function (set) {
    var a = R(3, 9), b = R(3, 9), c = R(3, 9) * R(3, 9), dv = R(3, 9), dd = dv * R(3, 9);
    var L4 = [[eqHtml([a, MP, b, '=', a * b], 4), 'Produkt'], [eqHtml([dd, ':', dv, '=', dd / dv], 0), 'Dividend'], [eqHtml([dd, ':', dv, '=', dd / dv], 2), 'Divisor'], [eqHtml([dd, ':', dv, '=', dd / dv], 4), 'Quotient']];
    set.splice(4, 1, { kind: 'match', mcls: 'eq', head: S('Wie heißt die blaue Zahl? Verbinde.'),
      left: L4.map(function (x) { return { h: '<span class="eqc">' + x[0] + '</span>', k: x[1] }; }), right: shuffle(L4.map(function (x) { return { h: S(x[1]), k: x[1] }; })),
      why: S('Mal: Faktor · Faktor = Produkt. Geteilt: Dividend : Divisor = Quotient.') });
    return set;
  });
  wrapGen('einmaleins', function (set) {
    var used = {}, P = [];
    while (P.length < 4) { var x = R(3, 9), y = R(3, 9); if (!used[x * y]) { used[x * y] = 1; P.push([x, y]); } }
    set = mix(set);
    set.splice(5, 1, { kind: 'match', mcls: 'eq', head: S('Verbinde jede Aufgabe mit ihrem Ergebnis.'),
      left: P.map(function (p) { return { h: p[0] + ' ' + MP + ' ' + p[1], k: p[0] * p[1] }; }), right: shuffle(P.map(function (p) { return { h: String(p[0] * p[1]), k: p[0] * p[1] }; })),
      why: S(P.map(function (p) { return p[0] + ' · ' + p[1] + ' = ' + p[0] * p[1]; }).join('; ') + '.') });
    return set;
  });
  wrapGen('mdluecke', function (set) { return mix(set, '', 1); });
  wrapGen('regeln', function (set) { return mix(set); });
  wrapGen('mdueb', function (set) { var n = 0; return set.map(function (it) { if (it.cols !== 3) return it; n++; return n % 2 === 0 ? asInp(it, 'Ü:') : it; }); });
  wrapGen('halb', function (set) { return mix(set); });
  wrapGen('mul1', function (set) {
    return [0, 2, 3, 5, 7, 9].map(function (k) { var it = set[k], q = it.q; return karoItem(it, '<div class="card kgw kin">' + karoMul(q.a, q.b) + '</div>', '<div class="kgw">' + kgMul(q.a, q.b, true) + '</div>', TMUL); });
  });
  wrapGen('mul2', function (set) {
    return [0, 2, 3, 5, 7, 9].map(function (k) { var it = set[k], q = it.q; return karoItem(it, '<div class="card kgw kin">' + karoMul(q.a, q.b) + '</div>', '<div class="kgw">' + kgMul(q.a, q.b, true) + '</div>', TMUL2); });
  });
  wrapGen('div', function (set) {
    return [0, 1, 4, 5, 6, 8].map(function (k) { var it = set[k], q = it.q; return karoItem(it, '<div class="card kgw kin">' + karoDiv(q.dd, q.dv) + '</div>', '<div class="kgw">' + kgDiv(q.dd, q.dv, true) + '</div>', TDIV); });
  });
  wrapGen('mdsach', function (set) { return mix(set); });

  // ------------------------------------------------------------ Umfang und Flächeninhalt
  wrapGen('ufurechnen', function (set) { return mix(set); });
  wrapGen('ufarechnen', function (set) { return mix(set); });
  wrapGen('ufsach', function (set) { return mix(set); });

  // ------------------------------------------------------------ Größen
  function eurCt(it, ct) {   // Antwort in € und ct: zwei Felder
    it.kind = 'inp'; delete it.choices;
    var e = Math.floor(ct / 100), c = ct % 100;
    it.body += '<div class="ninw">' + nin(e, 'sm') + '<span>€</span>' + nin(c, 'sm') + '<span>ct</span></div>';
    return it;
  }
  function geldItem(ct, komma) {
    var lab = komma ? gKomma(ct) : gEuro(ct), g = greedy(ct);
    return { kind: 'geld', head: S('Lege ' + lab + '. Tippe die Münzen und Scheine an.'), body: komma ? big(lab) : '', ans: ct, vals: GVALS.slice(1),
      tip: S('Lege zuerst die Euro: Scheine und Euro-Münzen. Lege dann die Cent. Eine Münze nimmst du wieder weg, wenn du sie unten antippst.'),
      why: S('Zum Beispiel: ' + g.map(gEuro).join(' + ') + '.') };
  }
  wrapGen('grgeld', function (set) {
    set[1] = geldItem(R(2, 9) * 100 + one([15, 35, 45, 60, 85]), false);
    set[2] = geldItem(R(1, 8) * 100 + one([25, 49, 75, 90]) + one([0, 1000]), true);
    set = set.map(function (it) {
      if (it.kind) return it;
      if (/= \? ct/.test(it.body)) return asInp(it);
      return it;
    });
    var last = set[set.length - 1];
    if (last && !last.kind && /^\d+$/.test(String(last.ans))) eurCt(last, +last.ans);
    return set;
  });
  function ordItem(head, vals, lab, why) {   // vals in der kleinsten Einheit (verschieden)
    return { kind: 'order', head: S(head), nums: shuffle(vals.slice()), ans: vals.slice().sort(function (a, b) { return a - b; }), lab: lab, why: S(why) };
  }
  function lastHead(set, w) { for (var k = set.length - 1; k >= 0; k--) if (!set[k].kind && String(set[k].head).replace(/<[^>]+>/g, '').indexOf(w) >= 0) return k; return -1; }
  wrapGen('grlaengen', function (set) {
    var mm = R(31, 89), c1 = R(2, 9), c2 = R(12, 95), m1 = R(1, 3), c3 = R(1, 9) * 10;
    var v = [mm, c1 * 10, c2 * 10, m1 * 1000 + c3 * 10], lab = {};
    lab[v[0]] = v[0] + NB + 'mm'; lab[v[1]] = c1 + NB + 'cm'; lab[v[2]] = c2 + NB + 'cm'; lab[v[3]] = m1 + NB + 'm ' + c3 + NB + 'cm';
    var k = lastHead(set, 'Einheit');
    if (uniq(v).length === 4 && k >= 0) set.splice(k, 1, ordItem('Ordne die Längen. Beginne mit der kürzesten.', v, lab,
      'Wandle alles in mm um: ' + v.slice().sort(function (x, y) { return x - y; }).map(function (x) { return lab[x] + ' = ' + fmt(x) + ' mm'; }).join('; ') + '.'));
    return set;
  });
  wrapGen('grlumrechnen', function (set) { return mix(set); });
  wrapGen('grlrechnen', function (set) { return mix(set); });
  wrapGen('grmassen', function (set) {
    set = mix(set);
    var g1 = R(2, 9) * 100, k1 = R(2, 4), g2 = R(11, 99) * 10, k2 = k1 * 1000 + R(1, 9) * 100;
    var v = uniq([g1, k1 * 1000, g2, k2]);
    if (v.length === 4) {
      var lab = {}; lab[g1] = fmt(g1) + NB + 'g'; lab[k1 * 1000] = k1 + NB + 'kg'; lab[g2] = fmt(g2) + NB + 'g'; lab[k2] = k1 + NB + 'kg ' + (k2 - k1 * 1000) + NB + 'g';
      var kk = lastHead(set, 'Einheit'); if (kk >= 0) set.splice(kk, 1, ordItem('Ordne. Beginne mit dem leichtesten.', v, lab, 'Wandle alles in g um: 1 kg = 1 000 g. ' + v.slice().sort(function (a, b) { return a - b; }).map(function (x) { return fmt(x) + ' g'; }).join(' < ') + '.'));
    }
    return set;
  });
  wrapGen('grzeit', function (set) { return mix(set); });
  wrapGen('grsach', function (set) { return mix(set); });


  // ------------------------------------------------------------ Uhr stellen: Zeiger ziehen (großer Zeiger in 5-Minuten-Schritten)
  function uhrTask(it) {
    var h = 12, m = 0, fin = false, face = gClock(null, 0), drag = null, AC2 = AC;
    function hands(col) {
      var ah = ((h % 12) * 30 + m * .5) * Math.PI / 180, am = m * 6 * Math.PI / 180, c = 140, r = 128;
      return '<g class="uhh"><line x1="140" y1="140" x2="' + f1(c + r * .5 * Math.sin(ah)) + '" y2="' + f1(c - r * .5 * Math.cos(ah)) + '" stroke="' + (col || INK) + '" stroke-width="13" stroke-linecap="round"/></g>' +
        '<g class="uhm"><line x1="140" y1="140" x2="' + f1(c + r * .8 * Math.sin(am)) + '" y2="' + f1(c - r * .8 * Math.cos(am)) + '" stroke="' + (col || AC2) + '" stroke-width="7" stroke-linecap="round"/></g>' + dt(c, c, 9);
    }
    app.innerHTML = head(it) + '<div class="card gsw"><svg class="gsv uclk" id="uc" viewBox="0 0 280 280" style="max-width:320px;margin:0 auto">' + face + '<g id="uh">' + hands() + '</g></svg></div>' +
      '<button class="btn pri gok" id="gok" type="button">' + L.icOk + '<span>' + L.check + '</span></button><div id="sol"></div><div id="fb"></div>';
    var sv = document.getElementById('uc');
    function ang(e) { var b = sv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * 280 - 140, y = (e.clientY - b.top) / b.height * 280 - 140; return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360; }
    function setTo(e) {
      var a = ang(e);
      if (drag === 'm') m = Math.round(a / 30) * 5 % 60;
      else { var hh = Math.round((a - m * .5) / 30); h = ((hh % 12) + 12) % 12 || 12; }
      document.getElementById('uh').innerHTML = hands();
    }
    sv.addEventListener('pointerdown', function (e) {
      if (fin) return;
      var a = ang(e), am = m * 6, ah = ((h % 12) * 30 + m * .5), b = sv.getBoundingClientRect();
      var rr = Math.hypot((e.clientX - b.left) / b.width * 280 - 140, (e.clientY - b.top) / b.height * 280 - 140);
      function d(x, y) { var t = Math.abs(x - y) % 360; return Math.min(t, 360 - t); }
      var da = d(a, am), dh = d(a, ah);   // liegen die Zeiger übereinander, entscheidet der Abstand zur Mitte: innen der kleine, außen der große Zeiger
      drag = Math.abs(da - dh) < 25 ? (rr < 78 ? 'h' : 'm') : (da < dh ? 'm' : 'h');
      sv.setPointerCapture(e.pointerId); setTo(e); e.preventDefault();
    });
    sv.addEventListener('pointermove', function (e) { if (drag && !fin) { setTo(e); e.preventDefault(); } });
    sv.addEventListener('pointerup', function () { drag = null; });
    sv.addEventListener('pointercancel', function () { drag = null; });
    function check() {
      fin = true; var good = h % 12 === it.ans[0] % 12 && m === it.ans[1];
      document.getElementById('uh').innerHTML = hands(good ? OKC : NOC);
      document.getElementById('gok').disabled = true;
      if (!good) document.getElementById('sol').innerHTML = '<div class="card solc"><p class="solt">' + L.icEye + '<span>' + L.sol + '</span></p><div class="gsw">' + gClock(it.ans[0], it.ans[1]) + '</div></div>';
      feedback(good, it.why);
    }
    document.getElementById('gok').onclick = check;
    it.auto = function (good) { h = it.ans[0]; m = good ? it.ans[1] : (it.ans[1] + 5) % 60; check(); };
    top();
  }
  wrapGen('gruhr', function (set) {
    [1, 3].forEach(function (k) {
      var h = R(1, 11), mm = one([0, 15, 30, 45, 10, 20, 40, 50]);
      set[k] = { kind: 'uhr', head: S('Stelle die Uhr auf ' + hm(h, mm) + '. Ziehe die Zeiger.'), ans: [h, mm],
        tip: S('Ziehe zuerst den großen Zeiger auf die Minuten: Bei 30 Minuten steht er auf der 6. Dann den kleinen Zeiger auf die Stunde.'),
        why: S('Der große Zeiger zeigt ' + mm + ' Minuten' + (mm ? ': Er steht auf der ' + (mm / 5) + '.' : ': Er steht oben auf der 12.') + ' Der kleine Zeiger zeigt die ' + h + '.' + (mm >= 30 ? ' Nach halb steht er schon fast bei der ' + (h % 12 + 1) + '.' : '')) };
    });
    return set;
  });

  // ============================================================ Englisch: Wörter der Wörterliste hören und antippen (Daten aus der Seite)
  var AUD = null;
  function say(url) { try { if (AUD) AUD.pause(); AUD = new Audio(url); var pr = AUD.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
  function vPlay(w) { return '<div class="vpl"><button class="btn vlb" type="button" data-a="' + D.base + w.id + '.mp3">' + L.icSpeaker + '<span>' + L.listen + '</span></button></div>'; }
  function vPic(w) {
    if (w.img) return '<img src="' + D.base + w.id + '.jpg" alt="">';
    if (w.num) return '<span class="vnum">' + w.num + '</span>';
    if (w.col) return '<span class="vcol" style="background:' + w.col + '"></span>';
    if (w.ic) return '<span class="vic">' + w.ic + '</span>';
    return '';
  }
  function vHas(w) { return !!(w.img || w.num || w.col || w.ic); }
  function wire(it) { it.init = function () { [].slice.call(app.querySelectorAll('.vlb')).forEach(function (b) { b.onclick = function () { say(b.getAttribute('data-a')); }; }); if (it.auto1) say(D.base + it.auto1 + '.mp3'); }; return it; }
  function EH(en, de) { return '<b class="ten">' + en + '</b> <span class="tde">' + de + '</span>'; }
  GEN.vok = function () {
    var W = D.words.slice(), set = [], pics = W.filter(vHas), N = W.length;
    function others(w, pool, k) { return shuffle(pool.filter(function (x) { return x.id !== w.id && x.de !== w.de && x.en !== w.en; })).slice(0, k); }
    // Wörter reihum (jede Aufgabenart nimmt alle Wörter einmal, bevor sich eins wiederholt; nie zweimal hintereinander dasselbe)
    function cyc() { var q = [], last = null; return function () { if (!q.length) { q = shuffle(W.slice()); if (q[q.length - 1] === last && q.length > 1) q.unshift(q.pop()); } last = q.pop(); return last; }; }
    var nA = cyc(), nB = cyc(), nC = cyc();
    function tA() {   // hören → Bild (oder deutsches Wort) antippen
      var w = nA(), usePic = vHas(w) && pics.length >= 3, pool = usePic ? pics : W, ch = [w].concat(others(w, pool, 2));
      var lng = ch.some(function (x) { return x.de.length > 12; });
      return wire({ head: EH('Listen and tap.', 'Höre zu. Tippe an.'), body: vPlay(w), auto1: w.id, cols: usePic ? 3 : (lng ? 1 : 3), imgc: usePic, ans: w.id,
        choices: shuffle(ch).map(function (x) { return { v: x.id, h: usePic ? vPic(x) : esc(x.de) }; }),
        why: '<b>' + esc(w.en) + '</b> – ' + esc(w.de) });
    }
    function tB() {   // hören → englisches Wort antippen
      var w = nB(), ch = [w].concat(others(w, W, 2));
      return wire({ head: EH('Listen. Which word is it?', 'Höre zu. Welches Wort ist es?'), body: vPlay(w), auto1: w.id, cols: 1, ans: w.id,
        choices: shuffle(ch).map(function (x) { return { v: x.id, h: '<span class="ven">' + esc(x.en) + '</span>' }; }),
        why: '<b>' + esc(w.en) + '</b> – ' + esc(w.de) });
    }
    function tC() {   // lesen → deutsches Wort antippen
      var r = nC(), rc = [r].concat(others(r, W, 2));
      return wire({ head: EH('Read and tap.', 'Lies. Tippe an.'), body: '<div class="card cmpq sm ven">' + esc(r.en) + '</div>' + vPlay(r), cols: 1, ans: r.id,
        choices: shuffle(rc).map(function (x) { return { v: x.id, h: esc(x.de) }; }), why: '<b>' + esc(r.en) + '</b> – ' + esc(r.de) });
    }
    function tM() {
      var M = []; shuffle(W.slice()).forEach(function (x) { if (M.length < 4 && !M.some(function (y) { return y.de === x.de || y.en === x.en; })) M.push(x); });
      return { kind: 'match', mcls: 'eq vk', head: EH('Match.', 'Verbinde Englisch und Deutsch.'),
        left: M.map(function (x) { return { h: esc(x.en), k: x.id }; }), right: shuffle(M.map(function (x) { return { h: esc(x.de), k: x.id }; })),
        why: M.map(function (x) { return '<b>' + esc(x.en) + '</b> – ' + esc(x.de); }).join('; ') };
    }
    [0, 1].forEach(function () {   // zweimal derselbe Aufbau wie früher: 5 × hören und antippen, 2 × Wort wählen, 2 × lesen, 1 × verbinden
      for (var k = 0; k < 5; k++) set.push(tA());
      set.push(tB(), tB(), tC(), tC(), tM());
    });
    return set;
  };

  // ============================================================ Deutsch: Aufgaben aus einer Sammlung (Seitendaten), Wörter oder Satzglieder antippen
  var MKP = { n: ['Nomen', 'Nomen'], v: ['Verb', 'Verben'], a: ['Adjektiv', 'Adjektive'], b: ['Subjekt', 'Subjekt'], r: ['Prädikat', 'Prädikat'], g: ['Akkusativobjekt', 'Akkusativobjekt'], o: ['Dativobjekt', 'Dativobjekt'] };
  function cap1(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function low1(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function parseMark(s) {
    var re = /(\*?)\{([^}]*)\}|(\*?)([A-Za-zÄÖÜäöüß\-]+)|([^A-Za-zÄÖÜäöüß*{]+)/g, m, out = [];
    while ((m = re.exec(s))) {
      if (m[5] !== undefined) out.push({ sep: m[5] });
      else if (m[2] !== undefined) out.push({ w: m[2], t: !!m[1] });
      else out.push({ w: m[4], t: !!m[3] });
    }
    return out;
  }
  function markTask(it) {
    var T = parseMark(it.s), sel = T.map(function () { return false; }), fin = false, gk = it.m === 'gk';
    function shown(x, k) { if (!gk) return esc(x.w); return esc(sel[k] ? cap1(x.w) : (x.t ? low1(x.w) : x.w)); }
    function draw() {
      app.innerHTML = head(it) + '<div class="card mkw m-' + it.m + '">' + T.map(function (x, k) {
        if (x.sep !== undefined) return '<span class="mks">' + esc(x.sep) + '</span>';
        var c = 'mk' + (sel[k] ? ' on' : '');
        if (fin) c += x.t && sel[k] ? ' mok' : x.t ? ' mmiss' : sel[k] ? ' mno' : '';
        return '<button class="' + c + '" type="button" data-k="' + k + '"' + (fin ? ' disabled' : '') + '>' + (fin && x.t && gk ? esc(cap1(x.w)) : shown(x, k)) + '</button>';
      }).join('') + '</div><button class="btn pri gok" id="gok" type="button"' + (fin || !sel.some(Boolean) ? ' disabled' : '') + '>' + L.icOk + '<span>' + L.check + '</span></button><div id="fb"></div>';
      if (fin) return;
      [].slice.call(app.querySelectorAll('.mk')).forEach(function (b) { b.onclick = function () { var k = +b.getAttribute('data-k'); sel[k] = !sel[k]; draw(); }; });
      document.getElementById('gok').onclick = check;
    }
    function check() {
      fin = true; var good = T.every(function (x, k) { return x.sep !== undefined || !!x.t === sel[k]; });
      var tg = T.filter(function (x) { return x.t; }).map(function (x) { return gk ? cap1(x.w) : x.w; });
      var nm = MKP[it.m] ? MKP[it.m][tg.length > 1 ? 1 : 0] + ': ' : 'Groß: ';
      draw(); feedback(good, (it.why ? it.why + ' ' : '') + nm + tg.map(esc).join(', ') + '.');
    }
    it.auto = function (good) { T.forEach(function (x, k) { sel[k] = !!x.t; }); if (!good) { for (var k = 0; k < T.length; k++) if (T[k].w && !T[k].t) { sel[k] = true; break; } } check(); };
    draw(); top();
  }
  // Sammlung → Aufgaben: zufällige Auswahl (bei „Neue Aufgaben“ eine andere Mischung)
  GEN.bank = function () {
    var B = shuffle(D.bank.slice()), n = Math.min(D.n || 10, B.length);
    var pick = B.slice(0, n);
    if (D.keep) pick.sort(function (a, b) { return D.bank.indexOf(a) - D.bank.indexOf(b); });
    return pick.map(function (x) {
      var h = x.h || D.h[x.k] || '';
      if (x.k === 'mark') return { kind: 'mark', head: esc(h), m: x.m, s: x.s, why: x.why ? esc(x.why) : '', tip: x.tip ? esc(x.tip) : '' };
      if (x.k === 'mc') { var ch = x.o.map(function (o, j) { return { v: String(j), h: esc(o) }; }), a = x.a || 0;
        return { head: esc(h), body: x.q ? '<div class="card dq">' + x.q + '</div>' : '', cols: x.cols || (x.o.some(function (o) { return o.length > 9; }) ? 1 : x.o.length), ans: String(a),
          choices: x.fix ? ch : shuffle(ch), why: x.why ? esc(x.why) : '<b>' + esc(x.o[a]) + '</b>', tip: x.tip ? esc(x.tip) : '' }; }
      if (x.k === 'sort') return { kind: 'sort', scls: 'txt', head: esc(h), cats: x.cats.map(function (c) { return { v: c[0], h: esc(c[1]) }; }),
        items: shuffle(x.it.map(function (y) { return { h: '<span>' + esc(y[0]) + '</span>', c: y[1] }; })), why: esc(x.why || '') };
      if (x.k === 'match') return { kind: 'match', mcls: 'eq vk', head: esc(h), left: x.p.map(function (y, j) { return { h: esc(y[0]), k: j }; }),
        right: shuffle(x.p.map(function (y, j) { return { h: esc(y[1]), k: j }; })), why: esc(x.why || x.p.map(function (y) { return y[0] + ' – ' + y[1]; }).join('; ')) };
      if (x.k === 'order') { var lab = {}; x.w.forEach(function (w, j) { lab[j] = esc(w); });
        return { kind: 'order', head: esc(h), nums: shuffle(x.w.map(function (w, j) { return j; })), ans: x.w.map(function (w, j) { return j; }), lab: lab, sep: ' ', why: esc(x.why || x.w.join(' ')) }; }
      return null;
    }).filter(Boolean);
  };
  // ============================================================ Teiler und Vielfache (6. Schuljahr): Vielfache, Teiler, Teilbarkeitsregeln, Primzahlen, kgV, ggT
  // Mehrfachauswahl: Zahlenfeld, alle passenden Zahlen antippen, dann „Prüfen“
  function pickTask(it) {
    var sel = {}, fin = false;
    function any() { return Object.keys(sel).some(function (k) { return sel[k]; }); }
    function draw() {
      app.innerHTML = head(it) + (it.body || '') + '<div class="pkg c' + (it.cols || 5) + '">' + it.nums.map(function (n) {
        var c = 'pkb' + (sel[n] ? ' on' : '');
        if (fin) c += it.ans.indexOf(n) >= 0 ? (sel[n] ? ' pok' : ' pmiss') : (sel[n] ? ' pno' : '');
        return '<button class="' + c + '" type="button" data-n="' + n + '"' + (fin ? ' disabled' : '') + '>' + fmt(n) + '</button>';
      }).join('') + '</div><button class="btn pri gok" id="gok" type="button"' + (fin || !any() ? ' disabled' : '') + '>' + L.icOk + '<span>' + L.check + '</span></button><div id="fb"></div>';
      if (fin) return;
      [].slice.call(app.querySelectorAll('.pkb')).forEach(function (b) { b.onclick = function () { var n = +b.getAttribute('data-n'); sel[n] = !sel[n]; draw(); }; });
      document.getElementById('gok').onclick = check;
    }
    function check() {
      fin = true;
      var good = it.nums.every(function (n) { return !!sel[n] === (it.ans.indexOf(n) >= 0); });
      draw(); feedback(good, it.why);
    }
    it.auto = function (good) { sel = {}; it.ans.forEach(function (n) { sel[n] = true; }); if (!good) sel[it.ans[0]] = false; check(); };
    draw(); top();
  }
  function tvMul(n, k) { var o = []; for (var j = 1; j <= (k || 6); j++) o.push(n * j); return o; }
  function tvDiv(n) { var o = []; for (var d = 1; d <= n; d++) if (n % d === 0) o.push(d); return o; }
  function tvPrime(n) { return tvDiv(n).length === 2; }
  function tvKgv(a, b) { for (var m = Math.max(a, b); ; m++) if (m % a === 0 && m % b === 0) return m; }
  function tvGgt(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function tvL(vals, dots) { return vals.map(fmt).join('; ') + (dots ? ' …' : ''); }
  function tvList(lab, vals, dots, ring) {
    return '<p class="tvr"><b>' + S(lab) + '</b> ' + vals.map(function (v) { return ring && ring.indexOf(v) >= 0 ? '<b class="tvg">' + fmt(v) + '</b>' : fmt(v); }).join('; ') + (dots ? ' …' : '') + '</p>';
  }
  var JN = [{ v: 'j', h: S('Ja') }, { v: 'n', h: S('Nein') }];
  function jn(head, body, yes, why) { return { head: S(head), body: body || '', choices: JN, cols: 2, ans: yes ? 'j' : 'n', why: S(why) }; }
  function ldig(n) { var s = String(n); return '<div class="card cmpq"><span>' + fmt(n).slice(0, -1) + '<span class="nx">' + s.slice(-1) + '</span></span></div>'; }

  GEN.tvviel = function () {
    var plan = shuffle(['p', 'f', 'q', 'l', 'p', 'f', 'q', 'l', 'f', 'l']), Q = '<b class="qb" id="qb">?</b>';
    function setq(it, ans) { it.after = function () { var q = document.getElementById('qb'); if (q) { q.textContent = ans; q.classList.add('set'); } }; return it; }
    return mix(plan.map(function (t) {
      var n = R(3, 9);
      if (t === 'p') {
        var m = shuffle(tvMul(n, Math.floor(60 / n))).slice(0, 4), pool = [];
        while (pool.length < 6) { var z = R(2, 60); if (z % n && pool.indexOf(z) < 0) pool.push(z); }
        var all = m.concat(pool).sort(function (a, b) { return a - b; });
        return { kind: 'pick', head: S('Tippe alle Vielfachen von ' + n + ' an.'), nums: all, ans: m, cols: 5,
          why: S('Vielfache von ' + n + ' hier: ' + tvL(m.sort(function (a, b) { return a - b; })) + '. Sie kommen in der Einmaleinsreihe von ' + n + ' vor.') };
      }
      if (t === 'f') {
        var g = R(2, 4), v = tvMul(n, g + 1), ans = v[g];
        return setq({ head: S('Wie geht die Reihe weiter?'), body: '<div class="card cmpq"><span>' + tvL(v.slice(0, g)) + '; ' + Q + ' …</span></div>', choices: nums(three(ans, [ans + 1, ans + n, ans - 1])), ans: ans, cols: 3,
          why: S('Du rechnest immer ' + n + ' dazu: ' + v[g - 1] + ' + ' + n + ' = ' + ans + '.') }, ans);
      }
      if (t === 'q') {
        var yes = Math.random() < .5, k = R(3, 9), a = yes ? n * k : n * k + R(1, n - 1);
        return jn('Ist ' + a + ' ein Vielfaches von ' + n + '?', '', yes, yes ? k + ' · ' + n + ' = ' + a + '. Also ist ' + a + ' ein Vielfaches von ' + n + '.'
          : a + ' kommt in der Einmaleinsreihe von ' + n + ' nicht vor: ' + Math.floor(a / n) * n + ' und ' + (Math.floor(a / n) + 1) * n + ' liegen daneben.');
      }
      // Lücke mitten in der Reihe (statt „das 5. Vielfache“: das verstehen die Kinder nicht)
      var len = R(5, 6), vv = tvMul(n, len), gi = R(1, len - 2), an = vv[gi];
      return setq({ head: S('Welche Zahl fehlt in der Reihe?'), body: '<div class="card cmpq"><span>' + vv.map(function (x, k) { return k === gi ? Q : fmt(x); }).join('; ') + ' …</span></div>',
        choices: nums(three(an, [an + 1, an - 1, an + n])), ans: an, cols: 3,
        why: S('Die Reihe geht immer ' + n + ' weiter: ' + vv[gi - 1] + ' + ' + n + ' = ' + an + '.') }, an);
    }));
  };

  GEN.tvteiler = function () {
    var plan = shuffle(['p', 'q', 'm', 'c', 'p', 'q', 'm', 'q', 'm', 'c']);
    return mix(plan.map(function (t) {
      var n = one([12, 15, 16, 18, 20, 24]), d = tvDiv(n);
      if (t === 'p') {
        var all = []; for (var k = 1; k <= n; k++) all.push(k);
        return { kind: 'pick', head: S('Tippe alle Teiler von ' + n + ' an.'), nums: all, ans: d, cols: 6, why: S('Teiler von ' + n + ': ' + tvL(d) + '.') };
      }
      if (t === 'q') {
        var b = R(2, 9), yes = n % b === 0;
        return jn('Ist ' + b + ' ein Teiler von ' + n + '?', '', yes, yes ? n + ' : ' + b + ' = ' + n / b + '. Das geht ohne Rest auf.'
          : n + ' : ' + b + ' geht nicht ohne Rest auf. ' + b + ' ist kein Teiler von ' + n + '.');
      }
      if (t === 'm') {
        var a = one(d.filter(function (x) { return x > 1 && x < n && x * x !== n; })), Q = '<b class="qb" id="qb">?</b>', ans = n / a;
        var it = { head: S('Welche Zahl fehlt?'), body: eqCard([a, '·', Q, '=', n]), choices: nums(three(ans, [ans + 1, ans - 1, n - a])), ans: ans, cols: 3,
          why: S(a + ' · ' + ans + ' = ' + n + '. Also sind ' + a + ' und ' + ans + ' Teiler von ' + n + '.') };
        it.after = function () { var q = document.getElementById('qb'); q.textContent = ans; q.classList.add('set'); };
        return it;
      }
      return { head: S('Wie viele Teiler hat ' + n + '?'), body: '', choices: nums(three(d.length, [d.length - 1, d.length + 1, d.length - 2])), ans: d.length, cols: 3,
        why: S('Teiler von ' + n + ': ' + tvL(d) + '. Das sind ' + d.length + ' Teiler.') };
    }));
  };

  GEN.tvregeln = function () {
    var plan = shuffle(['d2', 'd5', 'd10', 'w', 'p', 'g', 'd2', 'd5', 'd10', 'w']);
    return plan.map(function (t) {
      if (t[0] === 'd') {
        var dv = +t.slice(1), yes = Math.random() < .5, n;
        do { n = R(12, 999); } while ((n % dv === 0) !== yes);
        var e = n % 10, rule = dv === 2 ? '0, 2, 4, 6 oder 8' : dv === 5 ? '0 oder 5' : '0';
        return jn('Ist die Zahl durch ' + dv + ' teilbar?', ldig(n), yes, 'Die letzte Ziffer ist ' + e + '. Durch ' + dv + ' teilbar: letzte Ziffer ' + rule + '.');
      }
      if (t === 'w') {
        var dv2 = one([2, 5, 10]), good, bad = [];
        do { good = R(20, 999); } while (good % dv2);
        while (bad.length < 2) { var z = R(20, 999); if (z % dv2 && bad.indexOf(z) < 0) bad.push(z); }
        return { head: S('Welche Zahl ist durch ' + dv2 + ' teilbar?'), body: '', choices: nums(shuffle([good].concat(bad))), ans: good, cols: 3,
          why: S(good + ' endet mit ' + good % 10 + '. Durch ' + dv2 + ' teilbar: letzte Ziffer ' + (dv2 === 2 ? '0, 2, 4, 6 oder 8' : dv2 === 5 ? '0 oder 5' : '0') + '.') };
      }
      if (t === 'p') {
        var dv3 = one([2, 5]), all = [];
        while (all.length < 10) { var y = R(10, 199); if (all.indexOf(y) < 0) all.push(y); }
        var ans = all.filter(function (x) { return x % dv3 === 0; });
        if (!ans.length) { all[0] = dv3 * R(5, 30); ans = [all[0]]; }
        all.sort(function (a, b) { return a - b; });
        return { kind: 'pick', head: S('Tippe alle Zahlen an, die durch ' + dv3 + ' teilbar sind.'), nums: all, ans: ans, cols: 5,
          why: S(dv3 === 2 ? 'Durch 2 teilbar: Die letzte Ziffer ist 0, 2, 4, 6 oder 8.' : 'Durch 5 teilbar: Die letzte Ziffer ist 0 oder 5.') };
      }
      var e2 = one([0, 5, 4, 3]), n2 = R(2, 49) * 10 + e2;
      var lab = e2 === 0 ? 'a' : e2 === 5 ? 'b' : e2 === 4 ? 'c' : 'd';
      return { head: S('Durch welche Zahlen ist die Zahl teilbar?'), body: ldig(n2), cols: 1, ans: lab,
        choices: [{ v: 'a', h: S('durch 2, durch 5 und durch 10') }, { v: 'b', h: S('nur durch 5') }, { v: 'c', h: S('nur durch 2') }, { v: 'd', h: S('durch keine davon') }],
        why: S('Die letzte Ziffer ist ' + e2 + '.' + (e2 === 0 ? ' Bei 0 ist die Zahl durch 2, 5 und 10 teilbar.' : '')) };
    });
  };

  GEN.tvprim = function () {
    var plan = shuffle(['y', 'y', 'y', 'p', 'w', 'w', 'n', 'y', 'p', 'w']);
    // jede Zahl nur einmal (sonst kam z. B. „Ist 9 eine Primzahl?“ dreimal)
    var YN = shuffle([2, 3, 4, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49]),
        WP = shuffle([7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]), NQ = shuffle([3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]), PS = shuffle([1, 11, 21, 31, 41]);
    return mix(plan.map(function (t) {
      if (t === 'y') {
        var n = YN.pop(), d = tvDiv(n), yes = d.length === 2;
        return jn('Ist ' + n + ' eine Primzahl?', '', yes, 'Teiler von ' + n + ': ' + tvL(d) + '. ' + (yes ? 'Genau zwei Teiler: eine Primzahl.' : 'Mehr als zwei Teiler: keine Primzahl.'));
      }
      if (t === 'p') {
        var s = PS.pop(), all = []; for (var k = s; k < s + 10; k++) all.push(k);
        var ans = all.filter(tvPrime);
        return { kind: 'pick', head: S('Tippe alle Primzahlen an.'), nums: all, ans: ans, cols: 5, why: S('Primzahlen hier: ' + tvL(ans) + '.') };
      }
      if (t === 'w') {
        var p = WP.pop(), bad = [];
        while (bad.length < 2) { var z = R(4, 50); if (!tvPrime(z) && z > 1 && bad.indexOf(z) < 0) bad.push(z); }
        return { head: S('Welche Zahl ist eine Primzahl?'), body: '', choices: shuffle([p].concat(bad)).map(function (v) { return { v: 'x' + v, h: fmt(v) }; }), ans: 'x' + p, cols: 3,   // nicht zum Eintippen (mehrere Primzahlen möglich)
          why: S(p + ' hat nur die Teiler 1 und ' + p + '. ' + bad.map(function (b) { var d2 = tvDiv(b); return b + ' hat auch den Teiler ' + d2[1] + '.'; }).join(' ')) };
      }
      var q = NQ.pop(), nx = q + 1; while (!tvPrime(nx)) nx++;
      return { head: S('Welche Primzahl kommt nach ' + q + '?'), body: '', choices: nums(three(nx, [q + 1, q + 2, nx + 2].filter(function (x) { return x !== nx; }))), ans: nx, cols: 3,
        why: S('Nach ' + q + ' kommt die Primzahl ' + nx + '.') };
    }));
  };

  var KGP = [[2, 3], [2, 5], [3, 4], [4, 6], [3, 5], [4, 5], [6, 8], [5, 10], [6, 9], [2, 7], [3, 6], [4, 10]];
  GEN.tvkgv = function () {
    var plan = shuffle(['k', 'k', 'k', 'c', 'c', 's', 's', 'k', 'c', 's']);
    var SK = [
      function (a, b) { return 'Ein roter Bus fährt alle ' + a + ' Minuten ab, ein grüner Bus alle ' + b + ' Minuten. Gerade fahren beide zusammen ab. Nach wie vielen Minuten fahren sie wieder zusammen ab?'; },
      function (a, b) { return 'Zwei Lampen blinken: die eine alle ' + a + ' Sekunden, die andere alle ' + b + ' Sekunden. Jetzt blinken beide. Nach wie vielen Sekunden blinken sie wieder gleichzeitig?'; },
      function (a, b) { return 'Mia und Ben laufen auf dem Sportplatz Runden. Mia braucht für eine Runde ' + a + ' Minuten, Ben braucht ' + b + ' Minuten. Sie starten zusammen. Nach wie vielen Minuten sind beide wieder zusammen am Start?'; }];
    return mix(plan.map(function (t) {
      var pr = one(KGP), a = pr[0], b = pr[1], k = tvKgv(a, b), va = tvMul(a, Math.max(6, Math.ceil(k / a))), vb = tvMul(b, Math.max(6, Math.ceil(k / b)));
      if (t === 'k') {
        return { head: S('Was ist das kgV von ' + a + ' und ' + b + '?'), body: '<div class="card tvc">' + tvList('Vielfache von ' + a + ':', va, true) + tvList('Vielfache von ' + b + ':', vb, true) + '</div>',
          choices: nums(three(k, [a * b === k ? k + a : a * b, k + a * b, Math.max(a, b)])), ans: k, cols: 3,
          why: S('Die kleinste Zahl in beiden Reihen ist ' + k + '. Das kgV von ' + a + ' und ' + b + ' ist ' + k + '.') };
      }
      if (t === 'c') {
        var m = tvMul(a, 8), com = m.filter(function (x) { return x % b === 0; });
        return { kind: 'pick', head: S('Tippe die gemeinsamen Vielfachen von ' + a + ' und ' + b + ' an.'),
          body: '<div class="card tvc">' + tvList('Vielfache von ' + b + ':', tvMul(b, Math.ceil(8 * a / b)), true) + '</div>', nums: m, ans: com, cols: 4,
          why: S('Diese Zahlen kommen in beiden Reihen vor: ' + tvL(com) + '. Das kleinste gemeinsame Vielfache ist ' + com[0] + '.') };
      }
      return { head: S('Lies genau. Rechne. Was ist die Antwort?'), body: story(one(SK)(a, b)), choices: nums(three(k, [a * b === k ? k + Math.max(a, b) : a * b, a + b, Math.max(a, b)])), ans: k, cols: 3,
        why: S('Gesucht ist das kgV: Vielfache von ' + a + ': ' + tvL(va.slice(0, 6), true) + ' Vielfache von ' + b + ': ' + tvL(vb.slice(0, 6), true) + ' Das kgV ist ' + k + '.') };
    }));
  };

  var GGP = [[8, 12], [12, 18], [10, 15], [9, 12], [16, 24], [12, 16], [6, 9], [20, 30], [14, 21], [15, 20], [18, 24], [6, 15]];
  var GGK = [[12, 16], [10, 15], [12, 15], [9, 12], [8, 12], [12, 14], [10, 14], [14, 7], [12, 9], [15, 10]];   // Mädchen, Jungen: zusammen höchstens 28
  GEN.tvggt = function () {
    var plan = shuffle(['g', 'g', 'g', 'c', 'c', 's', 's', 'w', 'w', 'g']);
    var SG = [
      function (a, b) { return 'Ayla und Mia haben ' + a + ' Äpfel und ' + b + ' Birnen. In jede Tüte kommen gleich viele Äpfel und gleich viele Birnen. Nichts bleibt übrig. Wie viele Tüten können sie höchstens packen?'; },
      function (a, b) { return 'In einer Klasse sind ' + a + ' Mädchen und ' + b + ' Jungen. Die Lehrerin bildet gleich große Gruppen mit gleich vielen Mädchen und gleich vielen Jungen. Wie viele Gruppen kann sie höchstens bilden?'; }];
    var WK = [['Zwei Busse fahren zusammen ab. Wann fahren sie wieder zusammen ab?', 'kgV'], ['Äpfel und Birnen sollen gleich auf Tüten verteilt werden. Wie viele Tüten gibt es höchstens?', 'ggT'],
      ['Zwei Lampen blinken unterschiedlich schnell. Wann blinken sie wieder gleichzeitig?', 'kgV'], ['Zwei Bänder sollen in gleich lange Stücke geschnitten werden, so lang wie möglich. Wie lang ist ein Stück?', 'ggT'],
      ['Mia und Jonas gehen an verschiedenen Tagen schwimmen. Wann sind sie wieder zusammen im Schwimmbad?', 'kgV'], ['Mädchen und Jungen sollen in gleich große Gruppen. Wie viele Gruppen gibt es höchstens?', 'ggT']];
    var wks = shuffle(WK.slice());
    return mix(plan.map(function (t) {
      var pr = one(GGP), a = pr[0], b = pr[1], g = tvGgt(a, b), da = tvDiv(a), db = tvDiv(b);
      if (t === 'g') {
        return { head: S('Was ist der ggT von ' + a + ' und ' + b + '?'), body: '<div class="card tvc">' + tvList('Teiler von ' + a + ':', da) + tvList('Teiler von ' + b + ':', db) + '</div>',
          choices: nums(three(g, [1, g * 2 <= Math.min(a, b) && Math.min(a, b) % (g * 2) ? g * 2 : Math.min(a, b), da.filter(function (x) { return x < g && b % x === 0; }).pop() || g + 1])), ans: g, cols: 3,
          why: S('Gemeinsame Teiler: ' + tvL(da.filter(function (x) { return b % x === 0; })) + '. Der größte ist ' + g + '.') };
      }
      if (t === 'c') {
        var com = da.filter(function (x) { return b % x === 0; });
        return { kind: 'pick', head: S('Tippe die gemeinsamen Teiler von ' + a + ' und ' + b + ' an.'), body: '<div class="card tvc">' + tvList('Teiler von ' + b + ':', db) + '</div>',
          nums: da, ans: com, cols: Math.min(6, da.length), why: S('Diese Zahlen sind Teiler von ' + a + ' und von ' + b + ': ' + tvL(com) + '. Der ggT ist ' + g + '.') };
      }
      if (t === 's') {
        var si = R(0, SG.length - 1);
        if (si === 1) {   // Klasse: höchstens 28 Kinder (realistisch)
          pr = one(GGK); a = pr[0]; b = pr[1]; g = tvGgt(a, b); da = tvDiv(a); db = tvDiv(b);
        }
        return { head: S('Lies genau. Rechne. Was ist die Antwort?'), body: story(SG[si](a, b)), choices: nums(three(g, [1, Math.min(a, b), g + 1].filter(function (x) { return x !== g; }))), ans: g, cols: 3,
          why: S('Gesucht ist der ggT: Teiler von ' + a + ': ' + tvL(da) + '. Teiler von ' + b + ': ' + tvL(db) + '. Der ggT ist ' + g + '.') };
      }
      var w = wks.pop();
      return { head: S('Brauchst du das kgV oder den ggT?'), body: story(w[0]), choices: [{ v: 'kgV', h: 'kgV' }, { v: 'ggT', h: 'ggT' }], cols: 2, ans: w[1],
        why: S(w[1] === 'kgV' ? 'Etwas wiederholt sich: Du suchst das kgV.' : 'Etwas wird in gleiche Gruppen oder Stücke geteilt: Du suchst den ggT.') };
    }));
  };

  // ------------------------------------------------------------ Einmaleins (Kapitel 7): Kopfrechnen mit dem Ziffernblock
  function eqIn(parts, ans) { return '<div class="card cmpq eqc">' + parts.map(function (p) { return '<span>' + (p === '?' ? nin(ans) : p) + '</span>'; }).join('') + '</div>'; }
  // Aufgaben ohne Tauschdoppel in einer Runde
  function pairsOf(list) { var o = []; list.forEach(function (a) { [2, 3, 4, 5, 6, 7, 8, 9].forEach(function (b) { o.push([a, b]); }); }); return shuffle(o); }
  GEN.tv1x1 = function () {
    // einfach abfragen (Wiederholung): leichte und schwere Reihen gemischt, schwere etwas öfter
    var K = pairsOf([2, 5, 10]), H = pairsOf([3, 4, 6, 7, 8, 9]), out = [], used = {};
    function take(src) { while (src.length) { var p = src.pop(), k = Math.min(p[0], p[1]) + 'x' + Math.max(p[0], p[1]); if (!used[k]) { used[k] = 1; return p; } } return null; }
    var plan = shuffle(['k', 'k', 'k', 'h', 'h', 'h', 'h', 'h', 'h', 'h']);
    plan.forEach(function (t) {
      var p = take(t === 'k' ? K : H); if (!p) return;
      var a = p[0], b = p[1];
      out.push({ kind: 'inp', head: S('Rechne im Kopf.'), body: eqIn([a, MP, b, '=', '?'], a * b), ans: a * b, why: S(a + ' · ' + b + ' = ' + a * b + '.') });
    });
    return out;
  };
  GEN.tv1x1b = function () {
    var H = pairsOf([2, 3, 4, 5, 6, 7, 8, 9]), out = [], used = {};
    var plan = shuffle(['xb', 'ax', 'd', 'xb', 'ax', 'd', 'xb', 'd', 'ax', 'd']);
    plan.forEach(function (t) {
      var p; do { p = H.pop(); } while (p && used[p[0] + 'x' + p[1]]); if (!p) return; used[p[0] + 'x' + p[1]] = 1;
      var x = p[0], b = p[1], c = x * b, it;
      if (t === 'xb') it = { body: eqIn(['?', MP, b, '=', c], x), ans: x, why: x + ' · ' + b + ' = ' + c + '.' };
      else if (t === 'ax') it = { body: eqIn([b, MP, '?', '=', c], x), ans: x, why: b + ' · ' + x + ' = ' + c + '.' };
      else it = { body: eqIn([c, ':', b, '=', '?'], x), ans: x, why: c + ' : ' + b + ' = ' + x + ', denn ' + x + ' · ' + b + ' = ' + c + '.' };
      it.kind = 'inp'; it.head = S(t === 'd' ? 'Rechne im Kopf.' : 'Welche Zahl fehlt?'); it.why = S(it.why);
      out.push(it);
    });
    return out;
  };

  // ============================================================ Brüche (6. Schuljahr): erkennen, darstellen, Zahlenstrahl, Bruchteile, Erweitern, Kürzen
  // Schreibweise wie im Heft: Bruch mit Bruchstrich; Nenner bis 12, beim Erweitern bis 24; Erweiterungs- und Kürzungszahlen 2 bis 5;
  // gekürzt wird nur mit vorgegebener Zahl. Färben: Teile antippen (kind 'paint').
  var BFILL = '#a7c0de';
  function FR(z, n, cls) { return '<span class="bru' + (cls ? ' ' + cls : '') + '"><span>' + z + '</span><span>' + n + '</span></span>'; }
  function FX(z, n, show) {
    return '<span class="brx">' + (show === 'z' ? '<span class="brg">' + z + '</span>' : nin(z)) + '<span class="brl"></span>' +
      (show === 'n' ? '<span class="brg">' + n + '</span>' : nin(n)) + '</span>';
  }
  function FXK(z, n) { return FX(z, n).replace('<span class="brx">', '<span class="brx kz">'); }   // freier Bruch: gekürzte Form wird auch akzeptiert
  function FC(z, n) { return { v: z + '/' + n, h: FR(z, n) }; }
  function fracChoices(z, n, wrong) {
    var c = [[z, n]], seen = {}; seen[z + '/' + n] = 1;
    wrong.forEach(function (w) { var k = w[0] + '/' + w[1]; if (w[0] > 0 && w[0] < w[1] && w[1] <= 24 && !seen[k] && c.length < 3) { seen[k] = 1; c.push(w); } });
    var t = 1; while (c.length < 3) { var w2 = [z, n + t]; if (!seen[w2.join('/')]) { seen[w2.join('/')] = 1; c.push(w2); } t++; }
    return shuffle(c.map(function (p) { return FC(p[0], p[1]); }));
  }
  function inSel(sel, i) { return sel.indexOf(i) >= 0; }
  function bPart(d, i, sel, paint) {
    return '<path' + (paint ? ' class="bp" data-k="' + i + '"' : '') + ' d="' + d + '" fill="' + (inSel(sel, i) ? BFILL : '#fff') + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
  }
  function bPie(n, sel, o) {
    o = o || {}; var r = o.r || 80, c = r + 4, a = -90, s = '';
    if (n === 1) s = '<circle' + (o.paint ? ' class="bp" data-k="0"' : '') + ' cx="' + c + '" cy="' + c + '" r="' + r + '" fill="' + (inSel(sel, 0) ? BFILL : '#fff') + '" stroke="' + INK + '" stroke-width="3"/>';
    else for (var i = 0; i < n; i++) {
      var d = o.ang ? o.ang[i] : 360 / n, a0 = a * Math.PI / 180, a1 = (a + d) * Math.PI / 180;
      s += bPart('M' + c + ' ' + c + ' L' + f1(c + r * Math.cos(a0)) + ' ' + f1(c + r * Math.sin(a0)) + ' A' + r + ' ' + r + ' 0 ' + (d > 180 ? 1 : 0) + ' 1 ' +
        f1(c + r * Math.cos(a1)) + ' ' + f1(c + r * Math.sin(a1)) + ' Z', i, sel, o.paint);
      a += d;
    }
    return '<svg class="brf" viewBox="0 0 ' + 2 * c + ' ' + 2 * c + '" style="max-width:' + (o.mw || 2 * c) + 'px">' + s + '</svg>';
  }
  function bStrip(n, sel, o) {
    o = o || {}; var w = o.w || 360, h = o.h || 70, x = 3, s = '';
    for (var i = 0; i < n; i++) { var ww = (o.ws ? o.ws[i] : 1 / n) * w; s += bPart('M' + f1(x) + ' 3 h' + f1(ww) + ' v' + h + ' h' + f1(-ww) + ' Z', i, sel, o.paint); x += ww; }
    if (o.fine) for (var j = 1; j < n * o.fine; j++) if (j % o.fine) { var xx = 3 + w * j / (n * o.fine); s += '<line x1="' + f1(xx) + '" y1="3" x2="' + f1(xx) + '" y2="' + (h + 3) + '" stroke="' + INK + '" stroke-width="2.5" stroke-dasharray="8 6"/>'; }
    if (o.coarse) {
      for (var k = o.coarse; k < n; k += o.coarse) { var xc = 3 + w * k / n; s += '<line x1="' + f1(xc) + '" y1="2" x2="' + f1(xc) + '" y2="' + (h + 4) + '" stroke="' + INK + '" stroke-width="8"/>'; }
      s += '<rect x="3" y="3" width="' + w + '" height="' + h + '" fill="none" stroke="' + INK + '" stroke-width="7"/>';
    }
    return '<svg class="brf" viewBox="0 0 ' + (w + 6) + ' ' + (h + 6) + '" style="max-width:' + (o.mw || w + 6) + 'px">' + s + '</svg>';
  }
  function bGrid(r, c, sel, o) {
    o = o || {}; var q = o.s || 56, s = '';
    for (var y = 0; y < r; y++) for (var x = 0; x < c; x++) s += bPart('M' + (3 + x * q) + ' ' + (3 + y * q) + ' h' + q + ' v' + q + ' h' + (-q) + ' Z', y * c + x, sel, o.paint);
    return '<svg class="brf" viewBox="0 0 ' + (c * q + 6) + ' ' + (r * q + 6) + '" style="max-width:' + (o.mw || c * q + 6) + 'px">' + s + '</svg>';
  }
  var BGR = { 4: [2, 2], 6: [2, 3], 8: [2, 4], 9: [3, 3], 10: [2, 5], 12: [3, 4] };
  function bKind(n) { var k = ['p', 's']; if (BGR[n]) k.push('g'); if (n > 10) k = BGR[n] ? ['s', 'g'] : ['s']; return one(k); }
  function bFig(n, sel, kind, o) {
    o = o || {};
    if (kind === 'g' && BGR[n]) return bGrid(BGR[n][0], BGR[n][1], sel, o);
    if (kind === 's') return bStrip(n, sel, o);
    return bPie(n, sel, o);
  }
  function firstK(k) { var a = []; for (var i = 0; i < k; i++) a.push(i); return a; }
  function figCard(svg, cls) { return '<div class="card brfc' + (cls ? ' ' + cls : '') + '">' + svg + '</div>'; }
  var NAMEN = { 2: 'Halbe', 3: 'Drittel', 4: 'Viertel', 5: 'Fünftel', 6: 'Sechstel', 7: 'Siebtel', 8: 'Achtel', 9: 'Neuntel', 10: 'Zehntel', 11: 'Elftel', 12: 'Zwölftel' };
  var ZWB = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
  function bName(z, n) { return z === 1 ? (n === 2 ? 'ein Halb' : 'ein ' + NAMEN[n]) : ZWB[z] + ' ' + NAMEN[n]; }
  function bFrac(maxN, minN) { var n = R(minN || 2, maxN || 12), z = R(1, n - 1); return [z, n]; }
  // Bögen über und unter dem Gleichheitszeichen (Erweitern, Kürzen); lab: Zahl oder Eingabefeld
  var ARC_T = '<svg class="bga2" viewBox="0 0 64 20"><path d="M5 18 Q32 -6 55 13" fill="none" stroke="' + INK + '" stroke-width="2.6"/><path d="M60 17 l-11 -2.5 l6.5 -7z" fill="' + INK + '"/></svg>';
  var ARC_B = '<svg class="bga2" viewBox="0 0 64 20"><path d="M5 2 Q32 26 55 7" fill="none" stroke="' + INK + '" stroke-width="2.6"/><path d="M60 3 l-11 2.5 l6.5 7z" fill="' + INK + '"/></svg>';
  function BOG(op, f) {
    var l = '<span class="bgl2">' + op + ' ' + f + '</span>';
    return '<span class="bgm2"><span class="bgt2">' + l + ARC_T + '</span><span class="bge2">=</span><span class="bgb2">' + ARC_B + l + '</span></span>';
  }
  function ewCard(inner) { return '<div class="card ewq2">' + inner + '</div>'; }
  // Pfeilbild: Ganzes —: Nenner→ ein Teil —· Zähler→ Bruchteil
  function PA(lab) { return '<span class="pfa2"><span class="pfo2">' + lab + '</span><svg viewBox="0 0 70 14"><line x1="2" y1="7" x2="58" y2="7" stroke="' + INK + '" stroke-width="3"/><path d="M68 7 l-12 -6 v12z" fill="' + INK + '"/></svg></span>'; }
  function PFK(x, n, z, a, b, u) {
    u = u ? '<span class="pfu2">' + u + '</span>' : '';
    return '<div class="card pfk2"><span>' + fmt(x) + u + '</span>' + PA(': ' + n) + '<span>' + a + u + '</span>' + PA(MP + ' ' + z) + '<span>' + b + u + '</span></div>';
  }
  // Zahlenstrahl mit Brüchen (0 bis units, jede Einheit in n Teile)
  function sFr(x, y, z, n, sz, col) {
    col = col || INK;
    return '<text x="' + f1(x) + '" y="' + f1(y - 5) + '" font-size="' + sz + '" font-weight="700" fill="' + col + '" text-anchor="middle">' + z + '</text>' +
      '<line x1="' + f1(x - sz * .5) + '" y1="' + y + '" x2="' + f1(x + sz * .5) + '" y2="' + y + '" stroke="' + col + '" stroke-width="2.5"/>' +
      '<text x="' + f1(x) + '" y="' + f1(y + sz * .88) + '" font-size="' + sz + '" font-weight="700" fill="' + col + '" text-anchor="middle">' + n + '</text>';
  }
  function bAxis(n, o, y) {
    var u = o.units || 1, N = n * u, x0 = 60, x1 = 620, s = '';
    function X(k) { return x0 + (x1 - x0) * k / N; }
    s += '<line x1="' + (x0 - 30) + '" y1="' + y + '" x2="' + (x1 + 38) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="3"/><path d="M' + (x1 + 50) + ' ' + y + ' l-18 -9 v18z" fill="' + INK + '"/>';
    for (var k = 0; k <= N; k++) {
      var wh = k % n === 0, e = wh ? 16 : 11;
      var tick = '<line x1="' + f1(X(k)) + '" y1="' + (y - e) + '" x2="' + f1(X(k)) + '" y2="' + (y + e) + '" stroke="' + INK + '" stroke-width="' + (wh ? 3 : 2.5) + '"/>';
      if (o.tap && !wh) { var w = (x1 - x0) / N; s += '<g class="tp" data-v="' + k + '"><rect x="' + f1(X(k) - w / 2) + '" y="' + (y - 60) + '" width="' + f1(w) + '" height="120" fill="transparent"/>' + tick + '</g>'; }
      else s += tick;
      if (wh) s += '<text x="' + f1(X(k)) + '" y="' + (y + 44) + '" font-size="26" font-weight="700" fill="' + INK + '" text-anchor="middle">' + (k / n) + '</text>';
    }
    (o.labs || []).forEach(function (k) { if (k % n) s += sFr(X(k), y + 40, k, n, 22, o.hl === k ? AC : INK); });
    if (o.arrow !== undefined) {
      var xa = f1(X(o.arrow));
      s += '<line x1="' + xa + '" y1="' + (y - 64) + '" x2="' + xa + '" y2="' + (y - 30) + '" stroke="' + AC + '" stroke-width="5" stroke-linecap="round"/><path d="M' + xa + ' ' + (y - 18) + ' l-10 -16 h20z" fill="' + AC + '"/>';
      s += '<text x="' + xa + '" y="' + (y - 72) + '" font-size="30" font-weight="800" fill="' + AC + '" text-anchor="middle">?</text>';
    }
    if (o.res) Object.keys(o.res).forEach(function (k) {
      var c = o.res[k] === 'ok' ? OKC : NOC; s += '<circle cx="' + f1(X(+k)) + '" cy="' + y + '" r="12" fill="' + c + '"/>';
      if (o.res[k] === 'ok') s += '<rect x="' + f1(X(+k) - 22) + '" y="' + (y + 18) + '" width="44" height="52" fill="#fff"/>' + sFr(X(+k), y + 40, k, n, 22, OKC);
    });
    if (o.dot !== undefined) s += '<circle cx="' + f1(X(o.dot)) + '" cy="' + y + '" r="12" fill="' + (o.dotCol || AC) + '"/>';
    return s;
  }
  function bLine(n, o) { o = o || {}; var y = o.arrow !== undefined ? 100 : 70, H = y + 80; return '<svg class="rl" viewBox="0 0 700 ' + H + '">' + bAxis(n, o, y) + '</svg>'; }
  function bStory(t) { return '<div class="card story">' + t + '</div>'; }
  function TF(t) {   // Text mit [z/n] in Silbenschrift, Brüche mit Bruchstrich
    return String(t).split(/(\[\d+\/\d+\])/).map(function (p) { var m = /^\[(\d+)\/(\d+)\]$/.exec(p); return m ? FR(m[1], m[2]) : S(p); }).join('');
  }

  // Kind „paint“: Teile einer Figur antippen (färben), dann prüfen; es zählt nur die Anzahl
  function paintTask(it) {
    var sel = [], fin = false;
    function draw() {
      app.innerHTML = head(it) + (it.body || '') + '<div class="card brpw' + (fin ? '' : ' tapk') + '" id="pw">' + it.fig(sel) + '</div>' +
        '<button class="btn pri gok" id="gok" type="button"' + (fin || !sel.length ? ' disabled' : '') + '>' + L.icOk + '<span>' + L.check + '</span></button><div id="fb"></div>';
      if (fin) return;
      [].slice.call(app.querySelectorAll('.bp')).forEach(function (p) {
        p.addEventListener('click', function () { var k = +p.getAttribute('data-k'), j = sel.indexOf(k); if (j >= 0) sel.splice(j, 1); else sel.push(k); draw(); });
      });
      document.getElementById('gok').onclick = check;
    }
    function check() {
      fin = true; var good = sel.length === it.need; draw();
      document.getElementById('pw').classList.add(good ? 'iok' : 'ino');
      feedback(good, (good ? '' : S('Du hast ' + sel.length + ' Teile gefärbt. ')) + it.why);
    }
    it.auto = function (good) { sel = firstK(good ? it.need : (it.need < it.n ? it.need + 1 : it.need - 1)); check(); };
    draw(); top();
  }

  GEN.brerkennen = function () {
    var plan = shuffle(['mc', 'in', 'mc', 'in', 'w', 'w2', 'g', 'mc', 'in', 'g']);
    return plan.map(function (t) {
      var f = bFrac(12), z = f[0], n = f[1], kind = bKind(n), sel = Math.random() < .3 && kind === 'g' ? shuffle(firstK(n)).slice(0, z) : firstK(z);
      var why = S(z + ' von ' + n + ' gleich großen Teilen sind gefärbt: ') + FR(z, n) + '.';
      if (t === 'mc') return { head: S('Welcher Anteil ist gefärbt?'), body: figCard(bFig(n, sel, kind)), choices: fracChoices(z, n, [[n - z, n], [z, n - z], [z, n + 1]]), ans: z + '/' + n, cols: 3, why: why };
      if (t === 'in') return { kind: 'inp', head: S('Welcher Anteil ist gefärbt? Trage Zähler und Nenner ein.'), body: figCard(bFig(n, sel, kind)) + '<div class="card cmpq">' + FXK(z, n) + '</div>', ans: z + '/' + n, why: why };
      if (t === 'w') return { head: S('Welcher Bruch ist das?'), body: '<div class="card cmpq sm">' + S(bName(z, n)) + '</div>', choices: fracChoices(z, n, [[n, z], [z, n + 1], [z + 1, n]]), ans: z + '/' + n, cols: 3,
        why: S(bName(z, n) + ': Das erste Wort ist der Zähler, das zweite der Nenner: ') + FR(z, n) + '.' };
      if (t === 'w2') {
        var ws = [bName(z, n)]; [[z, n + 1], [z + 1, n], [z - 1, n], [z, n - 1]].forEach(function (p) { if (p[0] >= 1 && p[0] < p[1] && p[1] <= 12) ws.push(bName(p[0], p[1])); });
        ws = uniq(ws).slice(0, 3);
        return { head: S('Wie liest man den Bruch?'), body: '<div class="card cmpq">' + FR(z, n) + '</div>', choices: shuffle(ws.map(function (w) { return { v: w, h: S(w) }; })), ans: bName(z, n), cols: 1,
          why: S('Zähler ' + z + ', Nenner ' + n + ': ' + bName(z, n) + '.') };
      }
      // gleich große Teile?
      var m = one([3, 4]), yes = Math.random() < .45, sp;
      if (yes) sp = Math.random() < .5 ? bPie(m, [0]) : bStrip(m, [0]);
      else if (m === 3) sp = Math.random() < .5 ? bPie(3, [one([0, 1])], { ang: [180, 90, 90] }) : bStrip(3, [one([0, 1, 2])], { ws: one([[.5, .25, .25], [.4, .35, .25]]) });
      else sp = Math.random() < .5 ? bPie(4, [one([0, 2])], { ang: one([[120, 120, 60, 60], [180, 60, 60, 60]]) }) : bStrip(4, [one([0, 1])], { ws: one([[.4, .2, .2, .2], [.3, .3, .25, .15]]) });
      return { head: S('Zeigt das Bild ') + FR(1, m) + S('?'), body: figCard(sp), choices: JN, cols: 2, ans: yes ? 'j' : 'n',
        why: yes ? S('Alle ' + m + ' Teile sind gleich groß. 1 Teil ist gefärbt: ') + FR(1, m) + '.' : S('Die Teile sind nicht gleich groß. Darum ist das kein ' + NAMEN[m] + '.') };
    });
  };

  GEN.brdarst = function () {
    var plan = shuffle(['p', 'p', 'p', 'b', 'p', 'b', 'k', 'p', 'b', 'k']);
    return plan.map(function (t) {
      var f = bFrac(12), z = f[0], n = f[1], kind = bKind(n);
      if (t === 'p') return { kind: 'paint', head: S('Färbe ') + FR(z, n) + S('. Tippe auf die Teile.'), n: n, need: z, ans: z + '/' + n + kind,
        fig: function (sel) { return bFig(n, sel, kind, { paint: true, w: 600, h: 110, r: 150, s: 96 }); }, why: S('Der Nenner ist ' + n + ': ' + n + ' gleich große Teile. Der Zähler ist ' + z + ': Du färbst ' + z + ' Teile.') };
      if (t === 'b') {
        var good = bFig(n, firstK(z), kind, { mw: 220 }), w1 = bFig(n, firstK(z < n - 1 ? z + 1 : z - 1), kind, { mw: 220 }), w2;
        if (n <= 5 && z < n) w2 = bStrip(n, firstK(z), { mw: 220, ws: n === 3 ? [.5, .25, .25] : n === 4 ? [.4, .2, .2, .2] : n === 2 ? [.65, .35] : [.3, .25, .15, .15, .15] });
        else w2 = bFig(n + 1 <= 12 ? n + 1 : n - 1, firstK(z), bKind(n + 1 <= 12 ? n + 1 : n - 1), { mw: 220 });
        return { head: S('Welches Bild zeigt ') + FR(z, n) + S('?'), choices: shuffle([{ v: 'a', h: good }, { v: 'b', h: w1 }, { v: 'c', h: w2 }]), ans: 'a', cols: 3, imgc: true,
          why: S('Richtig ist das Bild mit ' + n + ' gleich großen Teilen und ' + z + ' gefärbten Teilen.') };
      }
      var nn = one([2, 3, 4, 6]), zz = R(1, nn - 1), per = 12 / nn;
      return { kind: 'inp', head: S('Der Streifen hat 12 Kästchen. Wie viele Kästchen musst du für ') + FR(zz, nn) + S(' färben?'),
        body: figCard(bGrid(1, 12, [], { s: 50 })) + '<div class="ninw">' + nin(per * zz) + '<span>' + S('Kästchen') + '</span></div>', ans: per * zz + 'k' + nn,
        why: S('12 : ' + nn + ' = ' + per + '. Ein Teil sind ' + per + ' Kästchen. ' + per + ' · ' + zz + ' = ' + per * zz + '.') };
    });
  };

  GEN.brzstrahl = function () {
    var plan = shuffle(['r', 'r', 't', 't', 'c', 'c', 't', 'r', 'g', 'g']);
    return plan.map(function (t) {
      var n = one([2, 3, 4, 5, 6, 8, 10]), k = R(1, n - 1);
      var why = S('Die Strecke von 0 bis 1 hat ' + n + ' gleich große Teile. Bis zum Strich sind es ' + k + ' Teile: ') + FR(k, n) + '.';
      if (t === 'r') return { kind: 'inp', head: S('Welcher Bruch ist markiert? Trage Zähler und Nenner ein.'), body: '<div class="rlw">' + bLine(n, { arrow: k }) + '</div><div class="card cmpq">' + FXK(k, n) + '</div>', ans: k + '/' + n, why: why };
      if (t === 'c') {
        var it = { head: S('Welcher Bruch ist markiert?'), body: '<div class="rlw" id="lw">' + bLine(n, { arrow: k }) + '</div>', choices: fracChoices(k, n, [[k, n + 1], [k + 1, n], [n - k, n]]), ans: k + '/' + n, cols: 3, why: why };
        it.after = function () { var r = {}; r[k] = 'ok'; document.getElementById('lw').innerHTML = bLine(n, { res: r }); };
        return it;
      }
      if (t === 't') {
        var it2 = { kind: 'tap', head: S('Tippe auf ') + FR(k, n) + S('.'), body: '<div class="rlw tap" id="lw">' + bLine(n, { tap: true }) + '</div>', ans: k, why: why };
        it2.after = function (good, got) { var r = {}; r[k] = 'ok'; if (!good) r[got] = 'no'; document.getElementById('lw').innerHTML = bLine(n, { res: r }); };
        return it2;
      }
      // an derselben Stelle: oben ein Bruch, unten feinere Einteilung
      var P = one([[2, 4], [2, 6], [3, 6], [4, 8], [2, 8], [3, 12], [4, 12], [5, 10], [2, 10]]), a = P[0], b = P[1], m = b / a, ka = R(1, a - 1), kb = ka * m;
      var labsA = firstK(a + 1), labsB = firstK(b + 1);
      var xk = f1(60 + 560 * ka / a);
      var svg = '<svg class="rl" viewBox="0 0 700 260">' + bAxis(a, { labs: labsA, hl: ka }, 60) + bAxis(b, { labs: labsB.filter(function (x) { return x % b === 0; }) }, 180) +
        '<line x1="' + xk + '" y1="126" x2="' + xk + '" y2="164" stroke="' + AC + '" stroke-width="3" stroke-dasharray="6 5"/></svg>';
      return { head: S('Welcher Bruch auf dem unteren Zahlenstrahl liegt an derselben Stelle wie ') + FR(ka, a) + S('?'), body: '<div class="rlw">' + svg + '</div>',
        choices: fracChoices(kb, b, [[ka, b], [kb + 1, b], [kb - 1, b]]), ans: kb + '/' + b, cols: 3, why: FR(ka, a) + ' = ' + FR(kb, b) + S('. Beide liegen an derselben Stelle.') };
    });
  };

  var BUNITS = [['€', [20, 30, 40, 50, 60, 80, 100]], ['cm', [20, 30, 40, 60, 80, 100]], ['m', [12, 24, 36, 48, 60, 90]], ['kg', [10, 20, 30, 40, 50, 100]],
    ['min', [60]], ['g', [100, 50, 40, 80]], ['km', [12, 15, 20, 24, 30]]];
  function bPart2(xs) { var c = []; xs.forEach(function (x) { for (var n = 2; n <= 10; n++) if (x % n === 0 && x / n <= 50) c.push([x, n]); }); return one(c); }
  GEN.brteile = function () {
    var plan = shuffle(['pf', 'pf', 'mc', 'gr', 'pf', 'gr', 'mc', 's', 'pf', 's']);
    var NAMES = ['Mia', 'Ben', 'Ayla', 'Jonas'];
    return plan.map(function (t) {
      var n = R(2, 10), per = R(2, 10), x = n * per; while (x > 100) { per--; x = n * per; }
      var z = R(1, n - 1), res = per * z;
      var why = S(fmt(x) + ' : ' + n + ' = ' + per + '. ' + per + ' · ' + z + ' = ' + res + '.');
      if (t === 'pf') return { kind: 'inp', head: FR(z, n) + S(' von ' + fmt(x) + '. Rechne mit dem Pfeilbild.'), body: PFK(x, n, z, nin(per), nin(res)), ans: z + '/' + n + 'v' + x, why: why };
      if (t === 'mc') return { head: S('Wie viel sind ') + FR(z, n) + S(' von ' + fmt(x) + '?'), choices: nums(three(res, [per, res + per, x - res, res - per])), ans: res, cols: 3, why: why };
      if (t === 'gr') {
        var U = one(BUNITS), p = bPart2(U[1]), xx = p[0], nn = p[1], zz = R(1, nn - 1), pp = xx / nn;
        return { kind: 'inp', head: S('Wie viel sind ') + FR(zz, nn) + S(' von ' + fmt(xx) + ' ' + U[0] + '?'),
          body: PFK(xx, nn, zz, nin(pp), nin(pp * zz), U[0]), ans: zz + '/' + nn + 'v' + xx + U[0], why: S(xx + ' ' + U[0] + ' : ' + nn + ' = ' + pp + ' ' + U[0] + '. ' + pp + ' ' + U[0] + ' · ' + zz + ' = ' + pp * zz + ' ' + U[0] + '.') };
      }
      var ti = R(0, 3), lim = [[12, 30], [12, 60], [12, 100], [20, 100]][ti]; for (var g = 0; g < 200 && (x < lim[0] || x > lim[1]); g++) { n = R(2, 10); per = R(2, 10); x = n * per; }
      z = R(1, n - 1); res = per * z; why = S(fmt(x) + ' : ' + n + ' = ' + per + '. ' + per + ' · ' + z + ' = ' + res + '.');
      var nm = one(NAMES), T = [
        ['In der Klasse von ' + nm + ' sind ' + x + ' Kinder. [' + z + '/' + n + '] der Kinder spielen Fußball. Wie viele Kinder spielen Fußball?', 'Kinder'],
        [nm + ' hat ' + x + ' Murmeln. [' + z + '/' + n + '] davon sind blau. Wie viele Murmeln sind blau?', 'Murmeln'],
        ['Beim Schulfest gibt es ' + x + ' Becher Saft. [' + z + '/' + n + '] davon sind Apfelsaft. Wie viele Becher sind Apfelsaft?', 'Becher'],
        [nm + ' liest ein Buch mit ' + x + ' Seiten. ' + (nm === 'Ben' || nm === 'Jonas' ? 'Er' : 'Sie') + ' hat schon [' + z + '/' + n + '] gelesen. Wie viele Seiten sind das?', 'Seiten']][ti];
      return { kind: 'inp', head: S('Lies genau. Rechne.'), body: bStory(TF(T[0])) + '<div class="ninw">' + nin(res) + '<span>' + S(T[1]) + '</span></div>', ans: z + '/' + n + 'v' + x + T[1], why: why };
    });
  };

  function bEw() { for (;;) { var n = R(2, 12), z = R(1, n - 1), f = R(2, 5); if (n * f <= 24) return [z, n, f]; } }
  GEN.brerw = function () {
    var plan = shuffle(['ew', 'ew', 'mit', 'auf', 'ew', 'bild', 'auf', 'gl', 'mit', 'ew']);
    return plan.map(function (t) {
      var e = bEw(), z = e[0], n = e[1], f = e[2], Z = z * f, N = n * f;
      var why = S(z + ' · ' + f + ' = ' + Z + ' und ' + n + ' · ' + f + ' = ' + N + '. Also ') + FR(z, n) + ' = ' + FR(Z, N) + '.';
      if (t === 'ew') return { kind: 'inp', head: S('Erweitere mit ' + f + '.'), body: ewCard(FR(z, n) + BOG(MP, f) + FX(Z, N)), ans: z + '/' + n + 'e' + f, why: why };
      if (t === 'mit') return { head: S('Mit welcher Zahl wurde erweitert?'), body: ewCard(FR(z, n) + BOG(MP, '?') + FR(Z, N)), choices: nums(three(f, [f + 1, f - 1, N - n].filter(function (v) { return v >= 2; }))), ans: f, cols: 3,
        why: S(n + ' · ' + f + ' = ' + N + '. Es wurde mit ' + f + ' erweitert.') };
      if (t === 'auf') return { kind: 'inp', head: S('Erweitere auf den Nenner ' + N + '. Trage den Zähler ein.'), body: ewCard(FR(z, n) + BOG(MP, '?') + FX(Z, N, 'n')), ans: z + '/' + n + 'a' + N,
        why: S(n + ' · ' + f + ' = ' + N + '. Also auch ' + z + ' · ' + f + ' = ' + Z + '.') };
      if (t === 'bild') {
        var ee; do { ee = bEw(); } while (ee[1] > 6 || ee[2] > 3); z = ee[0]; n = ee[1]; f = ee[2]; Z = z * f; N = n * f;
        return { head: S('Jedes Teil wird in ' + f + ' Teile geteilt. Welcher Bruch ist gleich?'), body: figCard(bStrip(n, firstK(z), { fine: f, w: 420 })) + '<div class="card cmpq">' + FR(z, n) + ' = ?</div>',
          choices: fracChoices(Z, N, [[z, N], [Z, n * f + f], [Z + 1, N]]), ans: Z + '/' + N, cols: 3, why: S('Jetzt sind es ' + N + ' kleine Teile. ' + Z + ' davon sind gefärbt: ') + FR(Z, N) + '.' };
      }
      // gleichwertig?
      var yes = Math.random() < .5, c = yes ? [Z, N] : one([[z + f, n + f], [Z, N + 1], [Z, n]]);
      if (!yes && c[0] * n === z * c[1]) c = [Z + 1, N];
      return { head: S('Sind die Brüche gleichwertig?'), body: '<div class="card cmpq">' + FR(z, n) + ' = ' + FR(c[0], c[1]) + '</div>', choices: JN, cols: 2, ans: yes ? 'j' : 'n',
        why: yes ? why : S('Erweitern heißt: Zähler und Nenner mal dieselbe Zahl. Das passt hier nicht.') };
    });
  };

  function bKz() { for (;;) { var b = R(2, 12), a = R(1, b - 1), f = R(2, 5); if (b * f <= 24 && gcd2(a, b) === 1) return [a, b, f]; } }
  function gcd2(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  GEN.brkurz = function () {
    var plan = shuffle(['kz', 'kz', 'mia', 'eog', 'kz', 'bild', 'mia', 'eog', 'kz', 'bild']);
    return plan.map(function (t) {
      var k = bKz(), a = k[0], b = k[1], f = k[2], A = a * f, Bn = b * f;
      var why = S(A + ' : ' + f + ' = ' + a + ' und ' + Bn + ' : ' + f + ' = ' + b + '. Also ') + FR(A, Bn) + ' = ' + FR(a, b) + '.';
      if (t === 'kz') return { kind: 'inp', head: S('Kürze mit ' + f + '.'), body: ewCard(FR(A, Bn) + BOG(':', f) + FX(a, b)), ans: A + '/' + Bn + 'k' + f, why: why };
      if (t === 'mia') {
        var yes = Math.random() < .5, c = yes ? [a, b] : one([[a, Bn], [A, b], [a, b + 1], [a + 1, b]]);
        var who = one(['Mia', 'Ben', 'Ayla', 'Jonas']);
        return { head: S(who + ' hat gekürzt. Stimmt das?'), body: ewCard(FR(A, Bn) + BOG(':', f) + FR(c[0], c[1])), choices: JN, cols: 2, ans: yes ? 'j' : 'n', why: why };
      }
      if (t === 'eog') {
        var up = Math.random() < .5, L1 = up ? [a, b] : [A, Bn], L2 = up ? [A, Bn] : [a, b];
        return { head: S('Wurde erweitert oder gekürzt?'), body: '<div class="card cmpq">' + FR(L1[0], L1[1]) + ' = ' + FR(L2[0], L2[1]) + '</div>',
          choices: [{ v: 'e', h: S('erweitert') }, { v: 'k', h: S('gekürzt') }], cols: 2, ans: up ? 'e' : 'k',
          why: S(up ? 'Die Zahlen werden größer: Es wurde mit ' + f + ' erweitert.' : 'Die Zahlen werden kleiner: Es wurde mit ' + f + ' gekürzt.') };
      }
      var kk; do { kk = bKz(); } while (kk[1] * kk[2] > 12); a = kk[0]; b = kk[1]; f = kk[2]; A = a * f; Bn = b * f;
      return { head: S('Die dicken Linien fassen je ' + f + ' Teile zusammen. Welcher Bruch ist gleich?'), body: figCard(bStrip(Bn, firstK(A), { coarse: f, w: 420 })) + '<div class="card cmpq">' + FR(A, Bn) + ' = ?</div>',
        choices: fracChoices(a, b, [[A, b], [a, Bn], [a + 1, b]]), ans: a + '/' + b, cols: 3, why: S('Jetzt sind es ' + b + ' große Teile. ' + a + ' davon sind gefärbt: ') + FR(a, b) + '.' };
    });
  };

  // ============================================================ Dezimalzahlen (6. Schuljahr): Stellenwerte, Brüche, Zahlenstrahl, Vergleichen, Runden, Rechnen
  // Höchstens 2 Nachkommastellen (Wunsch Dennis: passt zu Preisen). Zahlen intern in Hundertsteln (ganze Zahlen, keine Rundungsfehler).
  // Eingabe wie im Heft: ein Kästchen je Ziffer, das Komma steht schon da (td.in, Reihenfolge von links).
  function dzS(h, nd) {
    var a = Math.floor(h / 100), b = h % 100;
    if (nd === undefined) nd = b === 0 ? 0 : (b % 10 === 0 ? 1 : 2);
    if (nd === 0) return fmt(a);
    return fmt(a) + ',' + (nd === 1 ? String(Math.floor(b / 10)) : (b < 10 ? '0' : '') + b);
  }
  function dzH(s) { var p = String(s).split(','), b = (p[1] || '') + '00'; return (+p[0]) * 100 + (+b.slice(0, 2)); }
  function dzR(maxE, nd) {   // zufällige Dezimalzahl (Hundertstel): Ganze 0 … maxE, nd Nachkommastellen, letzte Ziffer nicht 0
    var a = R(0, maxE), b = nd === 1 ? R(1, 9) * 10 : R(1, 99);
    if (nd === 2 && b % 10 === 0) b += R(1, 9);
    return a * 100 + b;
  }
  function DK(s, st) {
    var o = st || 0, h = '<table class="dkt"><tr>';
    String(s).replace(/[\s ]/g, '').split('').forEach(function (c) { h += c === ',' ? '<td class="dkk">,</td>' : tdIn(c, o++); });
    return h + '</tr></table>';
  }
  function dzQ(t, s, u) { return '<div class="card cmpq dzq">' + t + DK(s) + (u ? '<span class="dzu">' + u + '</span>' : '') + '</div>'; }
  function dzC(v) { return { v: v, h: dzS(v) }; }
  function dzThree(ans, wrong) {
    var c = [ans];
    wrong.forEach(function (w) { if (w >= 0 && c.indexOf(w) < 0 && c.length < 3) c.push(w); });
    var k = 1; while (c.length < 3) { var z = ans + k * 10; if (c.indexOf(z) < 0) c.push(z); k++; }
    return c.sort(function (a, b) { return a - b; }).map(dzC);
  }
  var DZW = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
  function dzWort(s) { var p = s.split(','); return DZW[+p[0]] + (p[1] ? ' Komma ' + p[1].split('').map(function (d) { return DZW[+d]; }).join(' ') : ''); }
  function dzHi(s, idx) { var k = 0; return s.split('').map(function (c) { if (c === ',') return ','; var o = k === idx ? '<b class="dzh">' + c + '</b>' : c; k++; return o; }).join(''); }
  function dzTab(s) {
    var p = s.split(','), a = p[0], b = p[1] || '', cells = [a.length > 1 ? a[a.length - 2] : '', a[a.length - 1], b[0] || '', b[1] || ''];
    return '<table class="stt dzt"><tr>' + ['Z', 'E', 'z', 'h'].map(function (k, j) { return '<th' + (j === 2 ? ' class="kc"' : '') + '>' + k + '</th>'; }).join('') + '</tr><tr>' +
      cells.map(function (c, j) { return '<td' + (j === 2 ? ' class="kc"' : '') + '>' + c + '</td>'; }).join('') + '</tr></table>';
  }
  // Zahlenstrahl mit 10 Schritten ab lo (Hundertstel), Schritt st (10 = Zehntel, 1 = Hundertstel)
  function dzAxis(lo, st, o, y) {
    var x0 = 60, x1 = 620, s = '';
    function X(k) { return x0 + (x1 - x0) * k / 10; }
    s += '<line x1="' + (x0 - 30) + '" y1="' + y + '" x2="' + (x1 + 38) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="3"/><path d="M' + (x1 + 50) + ' ' + y + ' l-18 -9 v18z" fill="' + INK + '"/>';
    for (var k = 0; k <= 10; k++) {
      var big = k % 5 === 0, e = big ? 16 : 11;
      var tick = '<line x1="' + f1(X(k)) + '" y1="' + (y - e) + '" x2="' + f1(X(k)) + '" y2="' + (y + e) + '" stroke="' + INK + '" stroke-width="' + (big ? 3 : 2.5) + '"/>';
      if (o.tap && k % 10) s += '<g class="tp" data-v="' + k + '"><rect x="' + f1(X(k) - 28) + '" y="' + (y - 60) + '" width="56" height="120" fill="transparent"/>' + tick + '</g>';
      else s += tick;
      if (big) s += '<text x="' + f1(X(k)) + '" y="' + (y + 44) + '" font-size="26" font-weight="700" fill="' + INK + '" text-anchor="middle">' + dzS(lo + k * st) + '</text>';
    }
    if (o.arrow !== undefined) {
      var xa = f1(X(o.arrow));
      s += '<line x1="' + xa + '" y1="' + (y - 64) + '" x2="' + xa + '" y2="' + (y - 30) + '" stroke="' + AC + '" stroke-width="5" stroke-linecap="round"/><path d="M' + xa + ' ' + (y - 18) + ' l-10 -16 h20z" fill="' + AC + '"/>';
      s += '<text x="' + xa + '" y="' + (y - 72) + '" font-size="30" font-weight="800" fill="' + AC + '" text-anchor="middle">?</text>';
    }
    if (o.res) Object.keys(o.res).forEach(function (k) {
      var c = o.res[k] === 'ok' ? OKC : NOC, xx = f1(X(+k));
      s += '<circle cx="' + xx + '" cy="' + y + '" r="12" fill="' + c + '"/>';
      if (o.res[k] === 'ok') s += '<rect x="' + (xx - 38) + '" y="' + (y + 20) + '" width="76" height="34" fill="#fff"/><text x="' + xx + '" y="' + (y + 44) + '" font-size="26" font-weight="800" fill="' + OKC + '" text-anchor="middle">' + dzS(lo + k * st) + '</text>';
    });
    return s;
  }
  function dzLine(lo, st, o) { o = o || {}; var y = o.arrow !== undefined ? 100 : 70, H = y + 80; return '<svg class="rl" viewBox="0 0 700 ' + H + '">' + dzAxis(lo, st, o, y) + '</svg>'; }
  // Karo-Feld mit Komma-Linie (Z E z h): Komma unter Komma, fehlende Endnullen grau gedruckt; Ergebnis von rechts eintragen
  function dzKaro(ns, op) {
    var H = ns.map(dzH), res = op === '+' ? H[0] + H[1] : H[0] - H[1];
    var h = '<table class="sgr dzk"><tr class="hd"><td class="o"></td>' + ['Z', 'E', 'z', 'h'].map(function (l, j) { return '<td' + (j === 2 ? ' class="kc"' : '') + '>' + l + '</td>'; }).join('') + '</tr>';
    ns.forEach(function (s, r) {
      var p = s.split(','), a = p[0], b = p[1] || '', cells = [a.length > 1 ? a[a.length - 2] : '', a[a.length - 1], b[0] || '0', b[1] || '0'], pad = [false, false, !b[0], !b[1]];
      h += '<tr><td class="o">' + (r === 1 ? (op === '+' ? '+' : '–') : '') + '</td>' +
        cells.map(function (c, j) { var cl = (j === 2 ? 'kc' : '') + (pad[j] ? ' pz' : ''); return '<td' + (cl ? ' class="' + cl.trim() + '"' : '') + '>' + c + '</td>'; }).join('') + '</tr>';
    });
    h += '<tr class="ue"><td class="o"></td>' + [0, 1, 2, 3].map(function (j) { return j < 3 ? tdFr(j === 2 ? 'kc' : '') : '<td></td>'; }).join('') + '</tr>';
    var rs = String(res); while (rs.length < 3) rs = '0' + rs;
    h += '<tr class="rs"><td class="o"></td>';
    for (var k = 0; k < 4; k++) { var j = k - (4 - rs.length); h += j < 0 ? '<td class="nb"></td>' : tdIn(rs[j], rs.length - 1 - j, k === 2 ? 'kc' : ''); }
    return h + '</tr></table>';
  }
  function dzKaroSol(ns, op) {   // Lösung: fertig ausgefüllt (ohne Eingabefelder)
    return dzKaro(ns, op).replace(/<td class="in( kc)?" data-a="(\d)" data-o="\d+"><\/td>/g, function (m, kc, d) { return '<td class="rv' + (kc || '') + '">' + d + '</td>'; }).replace(/<td class="fr( kc)?"><\/td>/g, '<td class="$1"></td>');
  }
  var DZN = ['Mia', 'Ben', 'Ayla', 'Jonas'];
  var TDZA = S('Komma unter Komma. Beginne rechts bei den Hundertsteln. Ist eine Summe größer als 9, schreibe den Übertrag klein in die graue Zeile.');
  var TDZS = S('Komma unter Komma. Beginne rechts bei den Hundertsteln. Ergänze von unten nach oben. Musst du über 10 ergänzen, schreibe den Übertrag 1 klein in die graue Zeile.');
  function dzSie(n) { return n === 'Ben' || n === 'Jonas' ? 'er' : 'sie'; }

  GEN.dzstw = function () {
    var plan = shuffle(['w', 'w', 't', 't', 'z', 'z', 'g', 'w', 't', 'z']);
    var NM = ['Zehner', 'Einer', 'Zehntel', 'Hundertstel'];
    return plan.map(function (t) {
      var nd = one([1, 2, 2]), h = dzR(t === 'z' ? 12 : 29, nd), s = dzS(h, nd);
      if (t === 'w') {
        var digs = s.replace(',', ''), ni = s.split(',')[0].length, idx = R(h < 100 ? 1 : 0, digs.length - 1), pos = idx - ni;
        var name = pos === -2 ? 'Zehner' : pos === -1 ? 'Einer' : pos === 0 ? 'Zehntel' : 'Hundertstel';
        return { head: S('Welchen Wert hat die blaue Ziffer?'), body: '<div class="card cmpq"><span>' + dzHi(s, idx) + '</span></div>', choices: NM.map(function (n) { return { v: n, h: S(n) }; }), ans: name, cols: 2,
          why: S(pos < 0 ? 'Die Ziffer steht vor dem Komma bei den ' + name + 'n.' : (pos === 0 ? 'Die erste Ziffer nach dem Komma sind die Zehntel.' : 'Die zweite Ziffer nach dem Komma sind die Hundertstel.')) };
      }
      if (t === 't') return { kind: 'inp', head: S('Welche Zahl steht in der Stellenwerttafel? Trage sie ein.'), body: '<div class="card dztw">' + dzTab(s) + '</div>' + dzQ('', s), ans: 't' + s,
        why: S('Das Komma steht zwischen E und z: ') + s + '.' };
      if (t === 'z') return { kind: 'inp', head: S('Schreibe die Zahl.'), body: '<div class="card cmpq sm">' + S(dzWort(s)) + '</div>' + dzQ('', s), ans: 'w' + s,
        why: S(dzWort(s) + ' ist ') + s + S('. Nach dem Komma liest man jede Ziffer einzeln.') };
      var a = R(0, 9), d = R(1, 9), yes = Math.random() < .5, x = a + ',' + d, y = yes ? a + ',' + d + '0' : a + ',0' + d;
      if (Math.random() < .5) { var tt = x; x = y; y = tt; }
      return { head: S('Sind die Zahlen gleich groß?'), body: '<div class="card cmpq">' + x + ' <span class="dzv">' + S('und') + '</span> ' + y + '</div>', choices: JN, cols: 2, ans: yes ? 'j' : 'n',
        why: yes ? S('Eine Null am Ende nach dem Komma ändert den Wert nicht.') : S('Eine Null direkt nach dem Komma ändert den Wert: Aus Zehnteln werden Hundertstel.') };
    });
  };

  GEN.dzbr = function () {
    var plan = shuffle(['bd', 'bd', 'db', 'db', 'hv', 'hv', 'fg', 'fg', 'bd', 'db']);
    var HV = [[1, 2, 50, 5, 10], [1, 4, 25, 25, 100], [3, 4, 75, 25, 100], [1, 5, 20, 2, 10], [2, 5, 40, 2, 10], [3, 5, 60, 2, 10], [4, 5, 80, 2, 10]];
    return plan.map(function (t) {
      var n = one([10, 100, 100]), z = n === 10 ? R(1, 9) : R(1, 99); if (n === 100 && z % 10 === 0) z += R(1, 9);
      var s = dzS(n === 10 ? z * 10 : z);
      var why = FR(z, n) + ' = ' + s + S(n === 10 ? '. Zehntel: 1 Stelle nach dem Komma.' : '. Hundertstel: 2 Stellen nach dem Komma.');
      if (t === 'bd') return { kind: 'inp', head: S('Schreibe als Dezimalzahl.'), body: dzQ(FR(z, n) + ' = ', s), ans: 'b' + z + '/' + n, why: why };
      if (t === 'db') return { kind: 'inp', head: S('Schreibe als Bruch. Trage Zähler und Nenner ein.'), body: '<div class="card cmpq">' + s + ' = ' + FXK(z, n) + '</div>', ans: 'd' + s, why: why };
      if (t === 'hv') {
        var q = one(HV);
        return { head: S('Welche Dezimalzahl ist ') + FR(q[0], q[1]) + S('?'), body: '<div class="card cmpq">' + FR(q[0], q[1]) + ' = ?</div>',
          choices: dzThree(q[2], [q[0] * 100 + q[1] * 10, q[0] * 10 + q[1]]), ans: q[2], cols: 3,
          why: S('Erweitere mit ' + q[3] + ': ') + FR(q[0], q[1]) + ' = ' + FR(q[0] * q[3], q[1] * q[3]) + ' = ' + dzS(q[2]) + '.' };
      }
      var hund = Math.random() < .6, k = hund ? R(11, 89) : R(1, 9); if (hund && k % 10 === 0) k += R(1, 9);
      var hs = hund ? k : k * 10;
      var fig = hund ? bGrid(10, 10, firstK(k), { s: 24, mw: 250 }) : bStrip(10, firstK(k), { w: 420 });
      return { kind: 'inp', head: S('Wie viel ist gefärbt? Schreibe als Dezimalzahl.'), body: figCard(fig) + dzQ('', dzS(hs)), ans: 'f' + hs + (hund ? 'g' : 's'),
        why: S(hund ? k + ' von 100 Kästchen sind gefärbt: ' : k + ' von 10 Teilen sind gefärbt: ') + FR(k, hund ? 100 : 10) + ' = ' + dzS(hs) + '.' };
    });
  };

  GEN.dzzs = function () {
    var plan = shuffle(['r', 'r', 't', 't', 'c', 'r', 't', 'c', 'r', 't']);
    return plan.map(function (t) {
      var fine = Math.random() < .4, st = fine ? 1 : 10, lo = fine ? R(0, 59) * 10 : R(0, 9) * 100, k = one([1, 2, 3, 4, 6, 7, 8, 9]), v = lo + k * st, s = dzS(v);
      var why = S('Ein Schritt ist ' + (fine ? '1 Hundertstel' : '1 Zehntel') + '. Von ' + dzS(lo) + ' aus sind es ' + k + ' Schritte: ') + s + '.';
      if (t === 'r') return { kind: 'inp', head: S('Welche Zahl zeigt der Pfeil? Trage sie ein.'), body: '<div class="rlw">' + dzLine(lo, st, { arrow: k }) + '</div>' + dzQ('', s), ans: 'r' + v + 's' + st, why: why };
      if (t === 'c') {
        var it = { head: S('Welche Zahl zeigt der Pfeil?'), body: '<div class="rlw" id="lw">' + dzLine(lo, st, { arrow: k }) + '</div>',
          choices: dzThree(v, [fine ? lo + k * 10 : lo + k, v + st, v - st]), ans: v, cols: 3, why: why };
        it.after = function () { var r = {}; r[k] = 'ok'; document.getElementById('lw').innerHTML = dzLine(lo, st, { res: r }); };
        return it;
      }
      var it2 = { kind: 'tap', head: S('Tippe auf ') + s + '.', body: '<div class="rlw tap" id="lw">' + dzLine(lo, st, { tap: true }) + '</div>', ans: k, why: why };
      it2.after = function (good, got) { var r = {}; r[k] = 'ok'; if (!good) r[got] = 'no'; document.getElementById('lw').innerHTML = dzLine(lo, st, { res: r }); };
      return it2;
    });
  };

  var DZCMP = [{ v: 'k', h: '&#60;' }, { v: 'g', h: '&#62;' }, { v: 'e', h: '=' }];
  function dzPair() {
    var I = R(0, 9) * 100, t = one(['len', 'len', 'z', 'h', 'eq']), a, b;
    if (t === 'len') { a = I + R(2, 9) * 10; do { b = I + R(11, 99); } while (b % 10 === 0 || Math.floor(b / 10) * 10 === a); }   // 0,8 und 0,75
    else if (t === 'z') { a = I + R(1, 9) * 10; do { b = I + R(1, 9) * 10; } while (b === a); }
    else if (t === 'h') { a = I + R(1, 9); b = I + R(1, 9) * 10; }                                                                  // 0,07 und 0,7
    else { a = I + R(1, 9) * 10; b = a; }
    if (Math.random() < .5) { var x = a; a = b; b = x; }
    var sa = dzS(a), sb = t === 'eq' ? dzS(b, 2) : dzS(b);
    return [a, b, sa, sb];
  }
  GEN.dzvgl = function () {
    var plan = shuffle(['s', 's', 's', 'b', 'b', 'o', 'o', 'z', 's', 'o']);
    return plan.map(function (t) {
      if (t === 's') {
        var p = dzPair(), a = p[0], b = p[1], sg = a < b ? 'k' : a > b ? 'g' : 'e';
        return { head: S('Setze das richtige Zeichen ein.'), body: '<div class="card cmpq">' + p[2] + ' <b class="qb">?</b> ' + p[3] + '</div>', choices: DZCMP, cols: 3, ans: sg,
          why: S('Hänge Nullen an: ') + dzS(a, 2) + S(' und ') + dzS(b, 2) + '. ' + dzS(a) + ' ' + (sg === 'k' ? '&#60;' : sg === 'g' ? '&#62;' : '=') + ' ' + dzS(b) + '.' };
      }
      if (t === 'b') {
        var q = dzPair(); while (q[0] === q[1]) q = dzPair();
        var big = Math.max(q[0], q[1]);
        return { head: S('Welche Zahl ist größer?'), choices: shuffle([dzC(q[0]), dzC(q[1])]), ans: big, cols: 2,
          why: S('Hänge Nullen an: ') + dzS(q[0], 2) + S(' und ') + dzS(q[1], 2) + S('. Größer ist ') + dzS(big) + '.' };
      }
      if (t === 'o') {
        var I = R(0, 5) * 100, d = R(1, 8), c = uniq([I + d * 10, I + d, I + d * 10 + d, I + (d + 1) * 10 + (d === 1 ? 2 : 1), I + d * 11 + 10]).slice(0, 4);
        c = shuffle(c); var lab = c.map(function (v) { return dzS(v); }), idx = [0, 1, 2, 3], ans = idx.slice().sort(function (x, y) { return c[x] - c[y]; });
        return { kind: 'order', head: S('Ordne die Zahlen. Beginne mit der kleinsten Zahl.'), nums: idx, lab: lab, ans: ans,
          why: S('Vergleiche zuerst die Ganzen, dann die Zehntel, dann die Hundertstel: ') + ans.map(function (k) { return lab[k]; }).join(' &#60; ') + '.' };
      }
      var lo = R(0, 9) * 100 + R(1, 8) * 10, hi = lo + 10, m = lo + R(1, 9);
      return { head: S('Welche Zahl liegt zwischen ') + dzS(lo) + S(' und ') + dzS(hi) + S('?'), choices: dzThree(m, [m - lo + Math.floor(lo / 100) * 100, hi + R(1, 9), lo - R(1, 9)]), ans: m, cols: 3,
        why: S('Hänge Nullen an: ') + dzS(lo, 2) + S(' und ') + dzS(hi, 2) + S('. Dazwischen liegen ') + dzS(lo + 1) + '; ' + dzS(lo + 2) + ' … ' + dzS(hi - 1) + '.' };
    });
  };

  GEN.dzrund = function () {
    var plan = shuffle(['g', 'g', 'z', 'z', 'e', 'mg', 'mz', 'g', 'z', 'e']);
    return plan.map(function (t) {
      if (t === 'g' || t === 'mg' || t === 'e') {
        var h = dzR(t === 'e' ? 19 : 29, t === 'e' ? 2 : one([1, 2])), d = Math.floor(h % 100 / 10), r = Math.floor((h + 50) / 100), s = dzS(h);
        var why = S('Die erste Ziffer nach dem Komma ist ' + d + ': ' + (d >= 5 ? 'aufrunden' : 'abrunden') + '. ') + s + (t === 'e' ? ' €' : '') + ' ≈ ' + r + (t === 'e' ? ' €' : '') + '.';
        if (t === 'e') return { kind: 'inp', head: S('Runde auf ganze Euro.'), body: dzQ(s + ' € ≈ ', String(r), '€'), ans: 'e' + h, why: why };
        if (t === 'g') return { kind: 'inp', head: S('Runde auf Ganze.'), body: dzQ(s + ' ≈ ', String(r)), ans: 'g' + h, why: why };
        return { head: S('Runde ') + s + S(' auf Ganze.'), choices: dzThree(r * 100, [(r - 1) * 100, (r + 1) * 100, Math.floor(h / 10) * 10]), ans: r * 100, cols: 3, why: why };
      }
      var h2 = dzR(19, 2), d2 = h2 % 10, r2 = Math.floor((h2 + 5) / 10) * 10, s2 = dzS(h2), rs = dzS(r2, 1);
      var why2 = S('Die zweite Ziffer nach dem Komma ist ' + d2 + ': ' + (d2 >= 5 ? 'aufrunden' : 'abrunden') + '. ') + s2 + ' ≈ ' + rs + '.';
      if (t === 'z') return { kind: 'inp', head: S('Runde auf Zehntel.'), body: dzQ(s2 + ' ≈ ', rs), ans: 'z' + h2, why: why2 };
      return { head: S('Runde ') + s2 + S(' auf Zehntel.'), choices: dzThree(r2, [Math.floor(h2 / 10) * 10 === r2 ? r2 + 10 : Math.floor(h2 / 10) * 10, Math.floor((h2 + 50) / 100) * 100]).map(function (c) { c.h = dzS(c.v, 1); return c; }),
        ans: r2, cols: 3, why: why2 };
    });
  };

  GEN.dzadd = function () {
    var plan = shuffle(['k', 'k', 'h', 's', 'u', 'k', 'g', 's', 'u', 'h']);
    return plan.map(function (t) {
      if (t === 'k') {
        var plus = Math.random() < .6, a = R(0, 4) * 100 + R(1, 9) * 10, b = R(1, 9) * 10;
        if (!plus && a <= b) a += 100;
        var r = plus ? a + b : a - b, task = dzS(a) + (plus ? ' + ' : ' – ') + dzS(b);
        return { kind: 'inp', head: S('Rechne im Kopf.'), body: dzQ(task + ' = ', dzS(r)), ans: 'k' + task,
          why: S('Rechne mit Zehnteln: ' + (a / 10) + (plus ? ' + ' : ' – ') + (b / 10) + ' = ' + (r / 10) + ' Zehntel. ') + task + ' = ' + dzS(r) + '.' };
      }
      if (t === 'h') {
        var a2 = R(0, 3) * 100 + R(1, 9) * 10, b2 = R(1, 9), task2 = dzS(a2) + ' + ' + dzS(b2);
        return { kind: 'inp', head: S('Rechne im Kopf. Achte auf die Stellen.'), body: dzQ(task2 + ' = ', dzS(a2 + b2)), ans: 'h' + task2,
          why: dzS(a2) + S(' hat Zehntel, ') + dzS(b2) + S(' hat Hundertstel: ') + task2 + ' = ' + dzS(a2 + b2) + '.' };
      }
      if (t === 's' || t === 'u') {
        var x1, x2, ns;
        if (t === 's') { x1 = dzR(19, 2); x2 = dzR(9, 1); ns = Math.random() < .5 ? [dzS(x1), dzS(x2)] : [dzS(x2), dzS(x1)]; }
        else { x1 = dzR(19, one([1, 2])); if (x1 < 300) x1 += 500; do { x2 = R(101, x1 - 50); } while (x2 % 100 === 0); ns = [dzS(x1), dzS(x2)]; }
        var op = t === 's' ? '+' : '–', res = t === 's' ? dzH(ns[0]) + dzH(ns[1]) : dzH(ns[0]) - dzH(ns[1]);
        return karoItem({ ans: 'kr' + ns.join(op), why: S('Komma unter Komma. Fehlende Stellen sind Nullen. ') + ns[0] + ' ' + op + ' ' + ns[1] + ' = ' + dzS(res, 2) + '.' },
          '<div class="card sgw kin">' + dzKaro(ns, op) + '</div>', '<div class="sgw">' + dzKaroSol(ns, op) + '</div>', t === 's' ? TDZA : TDZS);
      }
      var nm = one(DZN), p1 = R(10, 90) * 5, p2 = R(10, 90) * 5, sum = p1 + p2, back = Math.random() < .5, pay = sum <= 500 ? 500 : 1000;
      var T = one([['Brötchen', 'eine Brezel'], ['ein Heft', 'einen Stift'], ['einen Apfelsaft', 'ein Brot']]);
      var st = nm + ' kauft ' + T[0] + ' für ' + dzS(p1, 2) + ' € und ' + T[1] + ' für ' + dzS(p2, 2) + ' €. ' +
        (back ? dzSie(nm).replace(/^./, function (c) { return c.toUpperCase(); }) + ' bezahlt mit ' + pay / 100 + ' €. Wie viel Geld bekommt ' + dzSie(nm) + ' zurück?' : 'Wie viel muss ' + dzSie(nm) + ' bezahlen?');
      var rr = back ? pay - sum : sum;
      return { kind: 'inp', head: S('Lies genau. Rechne.'), body: bStory(S(st)) + dzQ('', dzS(rr, 2), '€'), ans: 'g' + st,
        why: S(dzS(p1, 2) + ' € + ' + dzS(p2, 2) + ' € = ' + dzS(sum, 2) + ' €.' + (back ? ' ' + pay / 100 + ',00 € – ' + dzS(sum, 2) + ' € = ' + dzS(rr, 2) + ' €.' : '')) };
    });
  };

  GEN.dzzehn = function () {
    var plan = shuffle(['m10', 'm100', 'd10', 'd100', 'f', 'e', 'm10', 'd10', 'm100', 'e']);
    var EIN = [['m', 'cm', 100], ['€', 'ct', 100], ['cm', 'mm', 10]];
    return plan.map(function (t) {
      var a, f, r, mul;
      if (t === 'm10') { a = dzR(9, one([1, 2])); f = 10; mul = true; }
      else if (t === 'm100') { a = dzR(5, one([1, 2])); f = 100; mul = true; }
      else if (t === 'd10') { a = R(1, 999) * 10; if (a % 100 === 0) a += 10; f = 10; mul = false; }
      else if (t === 'd100') { a = R(1, 99) * 100; if (a % 1000 === 0) a += 100; f = 100; mul = false; }
      if (t === 'f' || t === 'e') {
        if (t === 'f') {
          var ff = one([10, 100]), mm = Math.random() < .5, x = mm ? dzR(9, 2) : R(1, 99) * 100, y = mm ? x * ff : x / ff;
          return { head: S('Welche Zahl fehlt?'), body: '<div class="card cmpq">' + dzS(x) + ' ' + (mm ? MP : ':') + ' <b class="qb">?</b> = ' + dzS(y) + '</div>', choices: nums([10, 100]), ans: ff, cols: 2,
            why: S('Das Komma ist ' + (ff === 10 ? '1 Stelle' : '2 Stellen') + ' nach ' + (mm ? 'rechts' : 'links') + ' gewandert: ' + (mm ? 'mal ' : 'geteilt durch ') + ff + '.') };
        }
        var E = one(EIN), down = Math.random() < .5, big = E[2] === 100 ? dzR(9, 2) : dzR(19, 1), small = big * E[2] / 100;
        if (!down) return { kind: 'inp', head: S('Rechne in die kleinere Einheit um.'), body: dzQ(dzS(big) + ' ' + E[0] + ' = ', dzS(small * 100), E[1]), ans: 'e' + big + E[0],
          why: S('1 ' + E[0] + ' = ' + E[2] + ' ' + E[1] + '. Rechne mal ' + E[2] + ': ') + dzS(big) + ' ' + E[0] + ' = ' + dzS(small * 100) + ' ' + E[1] + '.' };
        return { kind: 'inp', head: S('Rechne in die größere Einheit um.'), body: dzQ(dzS(small * 100) + ' ' + E[1] + ' = ', dzS(big), E[0]), ans: 'u' + big + E[0],
          why: S('1 ' + E[0] + ' = ' + E[2] + ' ' + E[1] + '. Rechne geteilt durch ' + E[2] + ': ') + dzS(small * 100) + ' ' + E[1] + ' = ' + dzS(big) + ' ' + E[0] + '.' };
      }
      r = mul ? a * f : a / f;
      var task = dzS(a) + ' ' + (mul ? MP : ':') + ' ' + f;
      return { kind: 'inp', head: S('Rechne.'), body: dzQ(task + ' = ', dzS(r)), ans: t + task,
        why: S((mul ? 'Mal ' : 'Geteilt durch ') + f + ': Das Komma wandert ' + (f === 10 ? '1 Stelle' : '2 Stellen') + ' nach ' + (mul ? 'rechts' : 'links') + '. ') + task + ' = ' + dzS(r) + '.' };
    });
  };

  GEN.dzmal = function () {
    var plan = shuffle(['m', 'm', 'mh', 'd', 'd', 'o', 's', 'm', 'd', 'o']);
    return plan.map(function (t) {
      var b = R(2, 9);
      if (t === 'm' || t === 'mh') {
        var a = t === 'm' ? R(0, 2) * 100 + R(1, 9) * 10 : one([R(1, 9), one([125, 225, 105, 115, 135, 145, 215, 245])]);
        if (a > 100 && a % 10) b = R(2, 4);
        var r = a * b, task = dzS(a) + ' ' + MP + ' ' + b;
        var n0 = String(a % 100 === 0 ? a / 100 : a % 10 === 0 ? a / 10 : a);
        return { kind: 'inp', head: S('Rechne.'), body: dzQ(task + ' = ', dzS(r)), ans: t + task,
          why: S('Ohne Komma: ' + n0 + ' ' + MP + ' ' + b + ' = ' + (+n0 * b) + '. ') + dzS(a) + S(' hat ' + (a % 10 ? '2 Stellen' : '1 Stelle') + ' nach dem Komma: ') + task + ' = ' + dzS(r) + '.' };
      }
      if (t === 'd') {
        var q = R(0, 1) * 100 + R(1, 9) * 10, aa = q * b, task2 = dzS(aa) + ' : ' + b;
        return { kind: 'inp', head: S('Rechne.'), body: dzQ(task2 + ' = ', dzS(q)), ans: 'd' + task2,
          why: S('Ohne Komma: ' + (aa / 10) + ' : ' + b + ' = ' + (q / 10) + '. Mit Komma: ') + task2 + ' = ' + dzS(q) + S('. Probe: ') + dzS(q) + ' ' + MP + ' ' + b + ' = ' + dzS(aa) + '.' };
      }
      if (t === 'o') {
        var x, bb, p; do { x = R(1, 4) * 100 + R(1, 9) * 10 + R(1, 9); bb = R(2, 3); p = x * bb; } while (p % 10 === 0);
        return { head: S('Ohne Komma: ' + x + ' ' + MP + ' ' + bb + ' = ' + p + '. Wie viel ist ') + dzS(x) + ' ' + MP + ' ' + bb + '?', choices: [dzC(p), dzC(p * 10), { v: p * 100, h: fmt(p) }],
          ans: p, cols: 3, why: dzS(x) + S(' hat 2 Stellen nach dem Komma. Also hat auch das Ergebnis 2 Stellen: ') + dzS(p) + '.' };
      }
      var nm = one(DZN), pr = R(3, 19) * 5, k = R(2, 5), tot = pr * k;
      var st = one([nm + ' kauft ' + k + ' Brezeln. Eine Brezel kostet ' + dzS(pr, 2) + ' €. Wie viel muss ' + dzSie(nm) + ' bezahlen?',
        k + ' Kinder teilen sich ' + dzS(tot, 2) + ' € gerecht. Wie viel bekommt jedes Kind?']);
      var div = st.indexOf('teilen') >= 0, res = div ? pr : tot;
      return { kind: 'inp', head: S('Lies genau. Rechne.'), body: bStory(S(st)) + dzQ('', dzS(res, 2), '€'), ans: 's' + st,
        why: S(div ? dzS(tot, 2) + ' € : ' + k + ' = ' + dzS(pr, 2) + ' €.' : dzS(pr, 2) + ' € ' + MP + ' ' + k + ' = ' + dzS(tot, 2) + ' €.') };
    });
  };

  TIP.dzstw = S('Vor dem Komma stehen die Ganzen. Die erste Ziffer nach dem Komma sind die Zehntel, die zweite die Hundertstel.');
  TIP.dzbr = S('1 Stelle nach dem Komma: Zehntel, Nenner 10. 2 Stellen nach dem Komma: Hundertstel, Nenner 100.');
  TIP.dzzs = S('Schaue zuerst: Wie groß ist ein Schritt? Zähle dann die Striche ab der ersten Zahl.');
  TIP.dzvgl = S('Hänge Nullen an, bis beide Zahlen gleich viele Stellen nach dem Komma haben. Der erste Unterschied entscheidet.');
  TIP.dzrund = S('Die Ziffer rechts neben der Rundungsstelle entscheidet: bei 0, 1, 2, 3, 4 abrunden, bei 5, 6, 7, 8, 9 aufrunden.');
  TIP.dzadd = S('Rechne mit Zehnteln wie mit Einern. Schriftlich: Komma unter Komma, fehlende Stellen sind Nullen.');
  TIP.dzzehn = S('Mal 10 oder 100: Das Komma wandert 1 oder 2 Stellen nach rechts. Geteilt durch 10 oder 100: nach links.');
  TIP.dzmal = S('Rechne zuerst ohne Komma. Das Ergebnis hat so viele Stellen nach dem Komma wie die Dezimalzahl.');

  // ============================================================ Rechnen mit Brüchen (6. Schuljahr): addieren, subtrahieren, gemeinsamer Nenner, mal und geteilt durch eine Zahl, Bruchteil von einem Bruch
  // Zahlenräume wie im Heft: Nenner bis 12 (bei Bruch mal Bruch bis 24), Ergebnisse höchstens 1, nicht kürzen (das Ergebnis wird so eingetragen, wie es entsteht).
  var RB2 = '#f2c48d', RBD = '#4f74a0';
  function rbFill(i, a, b) { return i < a ? BFILL : (i < a + b ? RB2 : '#fff'); }
  function rbX(cx, cy, s) { return '<path d="M' + f1(cx - s) + ' ' + f1(cy - s) + ' L' + f1(cx + s) + ' ' + f1(cy + s) + ' M' + f1(cx + s) + ' ' + f1(cy - s) + ' L' + f1(cx - s) + ' ' + f1(cy + s) + '" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>'; }
  function rbPie(n, a, b, cross, mw) {
    var r = 80, c = r + 4, s = '', d = 360 / n, A = -90;
    for (var i = 0; i < n; i++) {
      var a0 = A * Math.PI / 180, a1 = (A + d) * Math.PI / 180;
      s += '<path d="M' + c + ' ' + c + ' L' + f1(c + r * Math.cos(a0)) + ' ' + f1(c + r * Math.sin(a0)) + ' A' + r + ' ' + r + ' 0 ' + (d > 180 ? 1 : 0) + ' 1 ' + f1(c + r * Math.cos(a1)) + ' ' + f1(c + r * Math.sin(a1)) + ' Z" fill="' + rbFill(i, a, b) + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>';
      A += d;
    }
    A = -90;
    for (var j = 0; j < n; j++) { if (cross && j >= a - cross && j < a) { var am = (A + d / 2) * Math.PI / 180; s += rbX(c + r * .6 * Math.cos(am), c + r * .6 * Math.sin(am), 12); } A += d; }
    return '<svg class="brf" viewBox="0 0 ' + 2 * c + ' ' + 2 * c + '" style="max-width:' + (mw || 2 * c) + 'px">' + s + '</svg>';
  }
  function rbStrip(n, a, b, cross, seps, mw) {
    var w = 420, h = 64, q = w / n, s = '';
    for (var i = 0; i < n; i++) s += '<rect x="' + f1(3 + i * q) + '" y="3" width="' + f1(q) + '" height="' + h + '" fill="' + rbFill(i, a, b) + '" stroke="' + INK + '" stroke-width="3"/>';
    for (var j = 0; j < n; j++) if (cross && j >= a - cross && j < a) s += rbX(3 + (j + .5) * q, 3 + h / 2, Math.min(q, h) * .24);
    (seps || []).forEach(function (k) { var x = f1(3 + k * q); s += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + (h + 6) + '" stroke="' + INK + '" stroke-width="9"/>'; });
    return '<svg class="brf" viewBox="0 0 ' + (w + 6) + ' ' + (h + 6) + '" style="max-width:' + (mw || w + 6) + 'px">' + s + '</svg>';
  }
  function rbArea(cols, a, rows, b, mw) {   // Rechteck: cols Spalten (a hellblau), rows Zeilen (gestrichelt), b Zeilen der blauen Spalten dunkel
    var W = 360, H = 220, cw = W / cols, rh = H / rows, s = '';
    for (var x = 0; x < cols; x++) for (var y = 0; y < rows; y++) s += '<rect x="' + f1(3 + x * cw) + '" y="' + f1(3 + y * rh) + '" width="' + f1(cw) + '" height="' + f1(rh) + '" fill="' + (x < a ? (y < b ? RBD : BFILL) : '#fff') + '"/>';
    for (var i = 1; i < cols; i++) s += '<line x1="' + f1(3 + i * cw) + '" y1="3" x2="' + f1(3 + i * cw) + '" y2="' + (H + 3) + '" stroke="' + INK + '" stroke-width="3"/>';
    for (var k = 1; k < rows; k++) s += '<line x1="3" y1="' + f1(3 + k * rh) + '" x2="' + (W + 3) + '" y2="' + f1(3 + k * rh) + '" stroke="' + INK + '" stroke-width="3" stroke-dasharray="12 9"/>';
    s += '<rect x="3" y="3" width="' + W + '" height="' + H + '" fill="none" stroke="' + INK + '" stroke-width="5"/>';
    return '<svg class="brf" viewBox="0 0 ' + (W + 6) + ' ' + (H + 6) + '" style="max-width:' + (mw || 300) + 'px">' + s + '</svg>';
  }
  function rbQ(t) { return '<div class="card cmpq rbq2">' + t + '</div>'; }
  function rbO(o) { return '<span class="rbo">' + o + '</span>'; }
  function rbG(t) { return '<span class="rbg">' + t + '</span>'; }   // Rechenschritt, der nicht umbrochen wird (Umbruch nur vor „=“)
  function rbF(z, n) { return FR(z, n); }
  function rbWrong(z, n, extra) {   // typische Fehler als Auswahl (Nenner addiert, Zähler und Nenner vertauscht …)
    return fracChoices(z, n, extra);
  }
  function rbAB(maxN) { for (;;) { var n = R(3, maxN || 12), a = R(1, n - 2), b = R(1, n - a); if (a + b < n || Math.random() < .15) return [a, b, n]; } }
  var RBM = [[2, 4], [2, 6], [2, 8], [2, 10], [2, 12], [3, 6], [3, 9], [3, 12], [4, 8], [4, 12], [5, 10], [6, 12]];
  function rbPair(op) {   // a/n1 ± b/n2 mit n2 Vielfaches von n1, Ergebnis zwischen 0 und 1
    for (;;) {
      var P = one(RBM), n1 = P[0], m = P[1], f = m / n1, a = R(1, n1 - 1), b = R(1, m - 1), A = a * f;
      var r = op === '+' ? A + b : A - b;
      if (r > 0 && r <= m && (op === '–' || r < m || Math.random() < .2)) {
        if (op === '+' && Math.random() < .5) return { a: b, n1: m, b: a, n2: n1, A: b, B: A, m: m, r: r, f: f, swap: true };
        return { a: a, n1: n1, b: b, n2: m, A: A, B: b, m: m, r: r, f: f };
      }
    }
  }
  var RBNM = ['Mia', 'Ben', 'Ayla', 'Jonas'];

  GEN.rbadd = function () {
    var plan = shuffle(['bild', 'bild', 'in', 'in', 'in', 'fehlt', 'fehlt', 'mc', 'jn', 'in']);
    return plan.map(function (t) {
      var q = rbAB(12), a = q[0], b = q[1], n = q[2], r = a + b;
      var why = S('Zähler plus Zähler: ' + a + ' + ' + b + ' = ' + r + '. Der Nenner bleibt ' + n + ': ') + FR(a, n) + ' + ' + FR(b, n) + ' = ' + FR(r, n) + '.';
      if (t === 'bild') { if (n > 10) n = R(4, 10), a = R(1, n - 2), b = R(1, n - 1 - a), r = a + b;
        var fig = Math.random() < .5 ? rbPie(n, a, b, 0, 220) : rbStrip(n, a, b, 0, null, 420);
        return { kind: 'inp', head: S('Blau und orange zusammen: Welcher Bruch ist das? Trage Zähler und Nenner ein.'), body: figCard(fig) + rbQ(FR(a, n) + rbO('+') + FR(b, n) + rbO('=') + FXK(r, n)), ans: 'b' + a + '+' + b + '/' + n,
          why: S(a + ' blaue und ' + b + ' orange Teile sind ' + r + ' von ' + n + ' Teilen: ') + FR(r, n) + '.' }; }
      if (t === 'in') return { kind: 'inp', head: S('Addiere. Trage Zähler und Nenner ein.'), body: rbQ(FR(a, n) + rbO('+') + FR(b, n) + rbO('=') + FXK(r, n)), ans: 'i' + a + '+' + b + '/' + n, why: why };
      if (t === 'fehlt') return { kind: 'inp', head: S('Welcher Zähler fehlt?'), body: rbQ(FR(a, n) + rbO('+') + FX(b, n, 'n') + rbO('=') + FR(r, n)), ans: 'f' + a + '+' + b + '/' + n,
        why: S(a + ' plus ' + b + ' ist ' + r + '. Es fehlt ') + FR(b, n) + '.' };
      if (t === 'mc') return { head: S('Was ist ') + FR(a, n) + ' + ' + FR(b, n) + S('?'), choices: rbWrong(r, n, [[r, 2 * n], [a + b, n + 1], [r + 1, n]]), ans: r + '/' + n, cols: 3, why: why };
      var yes = Math.random() < .5, nm = one(RBNM);
      var shown = yes ? [r, n] : one([[r, 2 * n], [r + 1, n]]);
      if (!yes && shown[1] > 24) shown = [r + 1, n];
      return { head: S(nm + ' hat gerechnet. Stimmt das?'), body: rbQ(FR(a, n) + rbO('+') + FR(b, n) + rbO('=') + FR(shown[0], shown[1])), choices: JN, cols: 2, ans: yes ? 'j' : 'n',
        why: yes ? why : S('Der Nenner bleibt gleich. Richtig ist ') + FR(r, n) + '.' };
    });
  };

  GEN.rbsub = function () {
    var plan = shuffle(['bild', 'bild', 'in', 'in', 'ganz', 'ganz', 'fehlt', 'mc', 'in', 'zeichen']);
    return plan.map(function (t) {
      var n = R(3, 12), a = R(2, n), b = R(1, a - 1), r = a - b;
      var why = S('Zähler minus Zähler: ' + a + ' – ' + b + ' = ' + r + '. Der Nenner bleibt ' + n + ': ') + FR(a, n) + ' – ' + FR(b, n) + ' = ' + FR(r, n) + '.';
      if (t === 'bild') { if (n > 10) { n = R(4, 10); a = R(2, n); b = R(1, a - 1); r = a - b; }
        var fig = Math.random() < .5 ? rbPie(n, a, 0, b, 220) : rbStrip(n, a, 0, b, null, 420);
        return { kind: 'inp', head: S('Die durchgestrichenen Teile werden weggenommen. Welcher Bruch bleibt?'), body: figCard(fig) + rbQ(FR(a, n) + rbO('–') + FR(b, n) + rbO('=') + FXK(r, n)), ans: 'b' + a + '-' + b + '/' + n,
          why: S('Von ' + a + ' gefärbten Teilen werden ' + b + ' weggenommen. Es bleiben ' + r + ' Teile: ') + FR(r, n) + '.' }; }
      if (t === 'in') return { kind: 'inp', head: S('Subtrahiere. Trage Zähler und Nenner ein.'), body: rbQ(FR(a, n) + rbO('–') + FR(b, n) + rbO('=') + FXK(r, n)), ans: 'i' + a + '-' + b + '/' + n, why: why };
      if (t === 'ganz') { var g = R(1, n - 1);
        return { kind: 'inp', head: S('Wie viel fehlt bis zum Ganzen? Schreibe zuerst 1 als Bruch.'), body: rbQ(rbG('1' + rbO('–') + FR(g, n)) + rbG(rbO('=') + FX(n, n, 'n') + rbO('–') + FR(g, n)) + rbG(rbO('=') + FX(n - g, n, 'n'))), ans: 'g' + g + '/' + n,
          why: S('Ein Ganzes sind ') + FR(n, n) + '. ' + FR(n, n) + ' – ' + FR(g, n) + ' = ' + FR(n - g, n) + '.' }; }
      if (t === 'fehlt') return { kind: 'inp', head: S('Welcher Zähler fehlt?'), body: rbQ(FR(a, n) + rbO('–') + FX(b, n, 'n') + rbO('=') + FR(r, n)), ans: 'f' + a + '-' + b + '/' + n,
        why: S(a + ' minus ' + b + ' ist ' + r + '. Es fehlt ') + FR(b, n) + '.' };
      if (t === 'mc') return { head: S('Was ist ') + FR(a, n) + ' – ' + FR(b, n) + S('?'), choices: rbWrong(r, n, [[r, n + 1], [a + b <= n ? a + b : r + 1, n], [r + 1, n]]), ans: r + '/' + n, cols: 3, why: why };
      var plus = Math.random() < .5, x = plus ? R(1, n - 2) : R(2, n), y = plus ? R(1, n - 1 - x) : R(1, x - 1), z = plus ? x + y : x - y;
      return { head: S('Plus oder minus?'), body: rbQ(FR(x, n) + ' <b class="qb">?</b> ' + FR(y, n) + rbO('=') + FR(z, n)), choices: [{ v: 'p', h: '+' }, { v: 'm', h: '–' }], cols: 2, ans: plus ? 'p' : 'm',
        why: S(plus ? 'Das Ergebnis ist größer: plus. ' + x + ' + ' + y + ' = ' + z + '.' : 'Das Ergebnis ist kleiner: minus. ' + x + ' – ' + y + ' = ' + z + '.') };
    });
  };

  GEN.rbnenner = function () {
    var plan = shuffle(['erw', 'erw', 'add', 'add', 'add', 'sub', 'sub', 'mc', 'mc', 'sub']);
    return plan.map(function (t) {
      if (t === 'erw') { var P = one(RBM), n = P[0], m = P[1], f = m / n, z = R(1, n - 1);
        return { kind: 'inp', head: S('Erweitere auf den Nenner ' + m + '.'), body: ewCard(FR(z, n) + BOG(MP, f) + FX(z * f, m, 'n')), ans: 'e' + z + '/' + n + '>' + m,
          why: S(n + ' · ' + f + ' = ' + m + '. Also auch ' + z + ' · ' + f + ' = ' + z * f + ': ') + FR(z, n) + ' = ' + FR(z * f, m) + '.' }; }
      if (t === 'mc') { var Q = one(RBM), a1 = R(1, Q[0] - 1), b1 = R(1, Q[1] - 1), w = uniq([Q[0], Q[0] + Q[1], Q[1] * 2]).filter(function (v) { return v !== Q[1]; }).slice(0, 2);
        return { head: S('Welcher Nenner ist der gemeinsame Nenner von ') + FR(a1, Q[0]) + S(' und ') + FR(b1, Q[1]) + S('?'), choices: shuffle(nums([Q[1]].concat(w))), ans: Q[1], cols: 3,
          why: S(Q[1] + ' ist ein Vielfaches von ' + Q[0] + '. Darum ist ' + Q[1] + ' der gemeinsame Nenner.') }; }
      var op = t === 'add' ? '+' : '–', p = rbPair(op);
      var steps = FR(p.a, p.n1) + ' ' + op + ' ' + FR(p.b, p.n2) + ' = ' + FR(p.A, p.m) + ' ' + op + ' ' + FR(p.B, p.m) + ' = ' + FR(p.r, p.m) + '.';
      return { kind: 'inp', head: S('Bringe zuerst auf den gemeinsamen Nenner ' + p.m + '. Rechne dann.'), body: rbQ(rbG(FR(p.a, p.n1) + rbO(op) + FR(p.b, p.n2)) + rbG(rbO('=') + FX(p.A, p.m, 'n') + rbO(op) + FX(p.B, p.m, 'n')) + rbG(rbO('=') + FXK(p.r, p.m))), ans: t + p.a + '/' + p.n1 + op + p.b + '/' + p.n2,
        sol: '<div class="card cmpq sm">' + steps + '</div>', why: S('Der gemeinsame Nenner ist ' + p.m + '. ') + steps };
    });
  };

  function rbStory(kind) {
    var nm = one(RBNM), er = nm === 'Ben' || nm === 'Jonas' ? 'er' : 'sie';
    if (kind === 'plus') { var q = rbAB(12), a = q[0], b = q[1], n = q[2];
      var T = one([[nm + ' isst [' + a + '/' + n + '] einer Pizza. Danach isst ' + er + ' noch [' + b + '/' + n + ']. Wie viel isst ' + er + ' zusammen?', ''],
        [nm + ' trinkt [' + a + '/' + n + '] l Saft und dann noch [' + b + '/' + n + '] l. Wie viel trinkt ' + er + ' insgesamt?', 'l'],
        [nm + ' läuft [' + a + '/' + n + '] km und danach [' + b + '/' + n + '] km. Wie weit läuft ' + er + ' zusammen?', 'km']]);
      return { t: T[0], u: T[1], z: a + b, n: n, why: FR(a, n) + ' + ' + FR(b, n) + ' = ' + FR(a + b, n) + '.' }; }
    var n2 = R(3, 12), x = R(2, n2), y = R(1, x - 1);
    var T2 = one([['Im Krug sind [' + x + '/' + n2 + '] l Saft. ' + nm + ' gießt [' + y + '/' + n2 + '] l aus. Wie viel bleibt im Krug?', 'l'],
      ['Ein Band ist [' + x + '/' + n2 + '] m lang. ' + nm + ' schneidet [' + y + '/' + n2 + '] m ab. Wie lang ist der Rest?', 'm'],
      [nm + ' hat [' + x + '/' + n2 + '] einer Torte. ' + er.replace(/^./, function (c) { return c.toUpperCase(); }) + ' verschenkt [' + y + '/' + n2 + ']. Wie viel bleibt?', '']]);
    return { t: T2[0], u: T2[1], z: x - y, n: n2, why: FR(x, n2) + ' – ' + FR(y, n2) + ' = ' + FR(x - y, n2) + '.' };
  }
  GEN.rbsach = function () {
    var plan = shuffle(['p', 'p', 'm', 'm', 'w', 'w', 'p', 'm', 'w', 'g']);
    return plan.map(function (t) {
      if (t === 'w') { var k = Math.random() < .5 ? 'plus' : 'minus', st = rbStory(k);
        return { head: S('Plus oder minus? Du musst nicht rechnen.'), body: bStory(TF(st.t)), choices: [{ v: 'plus', h: S('plus') }, { v: 'minus', h: S('minus') }], cols: 2, ans: k,
          why: S(k === 'plus' ? 'Es kommt etwas dazu: plus. ' : 'Es geht etwas weg: minus. ') + st.why }; }
      if (t === 'g') { var p = rbPair('+'), nm = one(RBNM);
        var tx = nm + ' geht [' + p.a + '/' + p.n1 + '] km zum Bäcker und dann [' + p.b + '/' + p.n2 + '] km zur Schule. Wie weit geht ' + (nm === 'Ben' || nm === 'Jonas' ? 'er' : 'sie') + ' insgesamt?';
        return { kind: 'inp', head: S('Lies genau. Rechne. Trage das Ergebnis ein.'), body: bStory(TF(tx)) + '<div class="card cmpq">' + FXK(p.r, p.m) + '<span class="pfu2">km</span></div>', ans: 'g' + tx,
          why: FR(p.a, p.n1) + ' + ' + FR(p.b, p.n2) + ' = ' + FR(p.A, p.m) + ' + ' + FR(p.B, p.m) + ' = ' + FR(p.r, p.m) + S(' km.') }; }
      var s2 = rbStory(t === 'p' ? 'plus' : 'minus');
      return { kind: 'inp', head: S('Lies genau. Rechne. Trage das Ergebnis ein.'), body: bStory(TF(s2.t)) + '<div class="card cmpq">' + FXK(s2.z, s2.n) + (s2.u ? '<span class="pfu2">' + s2.u + '</span>' : '') + '</div>', ans: t + s2.t, why: s2.why };
    });
  };

  GEN.rbmal = function () {
    var plan = shuffle(['plus', 'plus', 'in', 'in', 'in', 'fehlt', 'fehlt', 'bild', 'jn', 'in']);
    return plan.map(function (t) {
      var n, z, k; do { n = R(3, 12); z = R(1, n - 1); k = R(2, 5); } while (k * z > n);
      var why = S('Zähler mal Zahl: ' + k + ' · ' + z + ' = ' + k * z + '. Der Nenner bleibt ' + n + ': ') + k + ' · ' + FR(z, n) + ' = ' + FR(k * z, n) + '.';
      if (t === 'plus') { var pl = []; for (var j = 0; j < k; j++) pl.push(FR(z, n));
        return { kind: 'inp', head: S('Rechne als Plusaufgabe.'), body: rbQ(k + rbO(MP) + FR(z, n) + rbO('=') + pl.join(rbO('+')) + rbO('=') + FXK(k * z, n)), ans: 'p' + k + '*' + z + '/' + n, why: why }; }
      if (t === 'in') return { kind: 'inp', head: S('Rechne. Trage Zähler und Nenner ein.'), body: rbQ(k + rbO(MP) + FR(z, n) + rbO('=') + FXK(k * z, n)), ans: 'i' + k + '*' + z + '/' + n, why: why };
      if (t === 'fehlt') return { kind: 'inp', head: S('Welche Zahl fehlt?'), body: rbQ(nin(k) + rbO(MP) + FR(z, n) + rbO('=') + FR(k * z, n)), ans: 'f' + k + '*' + z + '/' + n,
        why: S(k + ' · ' + z + ' = ' + k * z + '. Es fehlt die ' + k + '.') };
      if (t === 'bild') { var nn = one([3, 4, 5, 6, 8]), zz = R(1, Math.floor(nn / 2)), kk = Math.min(R(2, 4), Math.floor(nn / zz)), figs = '';
        for (var i = 0; i < kk; i++) figs += bPie(nn, firstK(zz), { mw: 110 });
        return { kind: 'inp', head: S('Jeder Kreis zeigt denselben Bruch. Wie viel ist es zusammen?'), body: '<div class="card brfc rbfs">' + figs + '</div>' + rbQ(kk + rbO(MP) + FR(zz, nn) + rbO('=') + FXK(kk * zz, nn)), ans: 'b' + kk + '*' + zz + '/' + nn,
          why: S(kk + ' · ' + zz + ' = ' + kk * zz + ': ') + FR(kk * zz, nn) + '.' }; }
      var yes = k * z === n || Math.random() < .4; if (yes && k * z !== n) { for (;;) { n = R(3, 12); k = one([2, 3, 4]); if (n % k === 0) { z = n / k; break; } } }
      return { head: S('Ist das Ergebnis ein Ganzes?'), body: rbQ(k + rbO(MP) + FR(z, n)), choices: JN, cols: 2, ans: k * z === n ? 'j' : 'n',
        why: S(k + ' · ' + z + ' = ' + k * z + '. ') + FR(k * z, n) + S(k * z === n ? ' ist ein Ganzes.' : ' ist kein Ganzes. Zähler und Nenner sind verschieden.') };
    });
  };

  GEN.rbteil = function () {
    var plan = shuffle(['in', 'in', 'in', 'bild', 'bild', 'fehlt', 'fehlt', 'jn', 'probe', 'in']);
    return plan.map(function (t) {
      var n, k, g; do { n = R(3, 12); k = R(2, 5); g = R(1, Math.floor((n - 1) / k)); } while (g * k >= n || g < 1);
      var z = g * k;
      var why = S('Zähler geteilt durch die Zahl: ' + z + ' : ' + k + ' = ' + g + '. Der Nenner bleibt ' + n + ': ') + FR(z, n) + ' : ' + k + ' = ' + FR(g, n) + '.';
      if (t === 'in') return { kind: 'inp', head: S('Teile. Trage Zähler und Nenner ein.'), body: rbQ(FR(z, n) + rbO(':') + k + rbO('=') + FXK(g, n)), ans: 'i' + z + '/' + n + ':' + k, why: why };
      if (t === 'bild') { var seps = []; for (var j = 1; j < k; j++) seps.push(j * g);
        return { kind: 'inp', head: S('Die dicken Striche teilen gerecht. Wie viel ist ein Teil?'), body: figCard(rbStrip(n, z, 0, 0, seps, 420)) + rbQ(FR(z, n) + rbO(':') + k + rbO('=') + FXK(g, n)), ans: 'b' + z + '/' + n + ':' + k, why: why }; }
      if (t === 'fehlt') return { kind: 'inp', head: S('Welche Zahl fehlt?'), body: rbQ(FR(z, n) + rbO(':') + nin(k) + rbO('=') + FR(g, n)), ans: 'f' + z + '/' + n + ':' + k,
        why: S(z + ' : ' + k + ' = ' + g + '. Es fehlt die ' + k + '.') };
      if (t === 'probe') return { head: S('Welche Malaufgabe passt als Probe zu ') + FR(z, n) + ' : ' + k + ' = ' + FR(g, n) + S('?'),
        choices: shuffle([{ v: 'r', h: FR(g, n) + ' · ' + k + ' = ' + FR(z, n) }, { v: 'w1', h: FR(z, n) + ' · ' + k + ' = ' + FR(z * k > 24 ? z + 1 : z * k, n) }, { v: 'w2', h: FR(g, n) + ' · ' + n + ' = ' + FR(g * n, n) }]), ans: 'r', cols: 1,
        why: S('Die Probe ist die Umkehraufgabe: ') + FR(g, n) + ' · ' + k + ' = ' + FR(z, n) + '.' };
      var yes = Math.random() < .5, shown = yes ? [g, n] : one([[g, n * k], [z, Math.min(24, n * k)]]);
      if (!yes && shown[0] * n === g * shown[1]) shown = [g + 1, n];
      return { head: S(one(RBNM) + ' hat geteilt. Stimmt das?'), body: rbQ(FR(z, n) + rbO(':') + k + rbO('=') + FR(shown[0], shown[1])), choices: JN, cols: 2, ans: yes ? 'j' : 'n',
        why: yes ? why : S('Nur der Zähler wird geteilt, der Nenner bleibt. Richtig ist ') + FR(g, n) + '.' };
    });
  };

  var RBV = [[2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4], [2, 8], [4, 4], [3, 5], [4, 5], [2, 10], [3, 6], [3, 8], [4, 6]];
  GEN.rbvon = function () {
    var plan = shuffle(['bild', 'bild', 'bild', 'in', 'in', 'in', 'von', 'von', 'jn', 'in']);
    return plan.map(function (t) {
      var P = one(RBV), n = P[0], m = P[1], a = R(1, n - 1), b = R(1, m - 1);
      if (Math.random() < .5) { var s = n; n = m; m = s; s = a; a = b; b = s; }
      var why = S('Zähler mal Zähler: ' + a + ' · ' + b + ' = ' + a * b + '. Nenner mal Nenner: ' + n + ' · ' + m + ' = ' + n * m + '. ') + FR(a * b, n * m) + '.';
      if (t === 'bild') { var cols = one([3, 4, 5]), ca = R(1, cols - 1), rows = one([2, 3]), rb = R(1, rows - 1);
        return { kind: 'inp', head: S('Wie viel vom Ganzen ist dunkelblau? Trage Zähler und Nenner ein.'), body: figCard(rbArea(cols, ca, rows, rb, 300)) + rbQ(FR(rb, rows) + ' ' + S('von') + ' ' + FR(ca, cols) + rbO('=') + FXK(ca * rb, cols * rows)),
          ans: 'b' + cols + ca + rows + rb, why: S('Das Rechteck hat ' + cols * rows + ' kleine Teile. ' + ca * rb + ' davon sind dunkelblau: ') + FR(ca * rb, cols * rows) + '.' }; }
      if (t === 'in') return { kind: 'inp', head: S('Rechne: Zähler mal Zähler, Nenner mal Nenner.'), body: rbQ(FR(a, n) + rbO(MP) + FR(b, m) + rbO('=') + FXK(a * b, n * m)), ans: 'i' + a + '/' + n + '*' + b + '/' + m, why: why };
      if (t === 'von') return { kind: 'inp', head: S('„von“ heißt „mal“. Rechne.'), body: rbQ(FR(a, n) + ' ' + S('von') + ' ' + FR(b, m) + rbO('=') + FXK(a * b, n * m)), ans: 'v' + a + '/' + n + '*' + b + '/' + m, why: why };
      var yes = Math.random() < .5, shown = yes ? [a * b, n * m] : one([[a + b, n + m], [a * b, n + m]]);
      return { head: S(one(RBNM) + ' hat gerechnet. Stimmt das?'), body: rbQ(FR(a, n) + rbO(MP) + FR(b, m) + rbO('=') + FR(shown[0], shown[1])), choices: JN, cols: 2, ans: yes ? 'j' : 'n',
        why: yes ? why : S('Bei mal wird nicht addiert. ') + why };
    });
  };

  GEN.rbsach2 = function () {
    var plan = shuffle(['mal', 'mal', 'teil', 'teil', 'von', 'von', 'w', 'w', 'w', 'mal']);
    return plan.map(function (t) {
      var nm = one(RBNM), er = nm === 'Ben' || nm === 'Jonas' ? 'er' : 'sie';
      function mk(kind) {
        if (kind === 'mal') { var n, z, k; do { n = R(4, 12); z = R(1, 3); k = R(2, 5); } while (k * z > n);
          var T = one([['Für einen Pfannkuchen braucht ' + nm + ' [' + z + '/' + n + '] l Milch. ' + er.replace(/^./, function (c) { return c.toUpperCase(); }) + ' macht ' + k + ' Pfannkuchen. Wie viel Milch braucht ' + er + '?', 'l'],
            [nm + ' läuft jeden Tag [' + z + '/' + n + '] km. Wie weit läuft ' + er + ' in ' + k + ' Tagen?', 'km']]);
          return { t: T[0], u: T[1], z: k * z, n: n, why: k + ' · ' + FR(z, n) + ' = ' + FR(k * z, n) + '.' }; }
        if (kind === 'teil') { var n2, k2, g; do { n2 = R(4, 12); k2 = R(2, 4); g = R(1, 3); } while (g * k2 >= n2);
          var T2 = one([[nm + ' hat [' + g * k2 + '/' + n2 + '] m Band. ' + er.replace(/^./, function (c) { return c.toUpperCase(); }) + ' schneidet es in ' + k2 + ' gleich lange Stücke. Wie lang ist ein Stück?', 'm'],
            [k2 + ' Kinder teilen sich [' + g * k2 + '/' + n2 + '] einer Pizza gerecht. Wie viel bekommt jedes Kind?', '']]);
          return { t: T2[0], u: T2[1], z: g, n: n2, why: FR(g * k2, n2) + ' : ' + k2 + ' = ' + FR(g, n2) + '.' }; }
        var P = one([[2, 3], [2, 4], [2, 5], [3, 4], [2, 6]]), b = R(1, P[1] - 1);
        var T3 = one([['Vom Kuchen ist noch [' + b + '/' + P[1] + '] übrig. ' + nm + ' isst [1/' + P[0] + '] davon. Wie viel vom ganzen Kuchen ist das?', ''],
          ['[' + b + '/' + P[1] + '] des Beetes sind Blumen. Auf [1/' + P[0] + '] davon wachsen Rosen. Wie viel vom ganzen Beet ist das?', '']]);
        return { t: T3[0], u: T3[1], z: b, n: P[0] * P[1], why: FR(1, P[0]) + ' · ' + FR(b, P[1]) + ' = ' + FR(b, P[0] * P[1]) + '.' };
      }
      if (t === 'w') { var kind = one(['mal', 'teil', 'von']), st = mk(kind), op = kind === 'teil' ? 'geteilt' : 'mal';
        return { head: S('Mal oder geteilt? Du musst nicht rechnen.'), body: bStory(TF(st.t)), choices: [{ v: 'mal', h: S('mal') }, { v: 'geteilt', h: S('geteilt') }], cols: 2, ans: op,
          why: S(kind === 'teil' ? 'Gerecht teilen oder in gleiche Stücke schneiden: geteilt. ' : (kind === 'mal' ? 'Mehrmals gleich viel: mal. ' : 'Ein Teil von einem Teil: mal. ')) + st.why }; }
      var s2 = mk(t);
      return { kind: 'inp', head: S('Lies genau. Rechne. Trage das Ergebnis ein.'), body: bStory(TF(s2.t)) + '<div class="card cmpq">' + FXK(s2.z, s2.n) + (s2.u ? '<span class="pfu2">' + s2.u + '</span>' : '') + '</div>', ans: t + s2.t, why: s2.why };
    });
  };
  TIP.rbadd = S('Gleiche Nenner: Addiere die Zähler. Der Nenner bleibt gleich. Die Nenner werden nicht addiert.');
  TIP.rbsub = S('Gleiche Nenner: Subtrahiere die Zähler. Der Nenner bleibt gleich. Ein Ganzes kannst du als Bruch schreiben, zum Beispiel ') + FR(8, 8) + '.';
  TIP.rbnenner = S('Passt der kleinere Nenner in den größeren? Dann ist der größere Nenner der gemeinsame Nenner. Erweitere den anderen Bruch: ') + FR(1, 2) + ' = ' + FR(2, 4) + '.';
  TIP.rbsach = S('Kommt etwas dazu, rechnest du plus. Geht etwas weg oder bleibt etwas übrig, rechnest du minus.');
  TIP.rbmal = S('Bruch mal Zahl: Nimm den Zähler mal die Zahl. Der Nenner bleibt gleich.');
  TIP.rbteil = S('Bruch geteilt durch Zahl: Teile den Zähler durch die Zahl. Der Nenner bleibt gleich.');
  TIP.rbvon = S('„von“ heißt „mal“. Rechne Zähler mal Zähler und Nenner mal Nenner.');
  TIP.rbsach2 = S('Mehrmals gleich viel oder ein Teil von einem Teil: mal. Gerecht teilen: geteilt.');

  // ============================================================ Grundlagen der Geometrie II (6. Schuljahr): Kreis, Winkel, Winkelarten, Winkel messen und zeichnen, Achsen- und Punktsymmetrie
  // Wie im Heft: Punkte als ×, Winkel mit Bogen und griechischem Buchstaben, rechte Winkel mit Viertelkreis und Punkt; Geodreieck vereinfacht (außen 0° rechts, innen 0° links).
  var G2DF = '#eaf1f8', G2DL = '#7f9bbb';
  function g2P(S, a, r) { return [S[0] + r * Math.cos(a * Math.PI / 180), S[1] - r * Math.sin(a * Math.PI / 180)]; }
  function g2Arc(S, a1, a2, r, c, sw) {
    var d = ((a2 - a1) % 360 + 360) % 360, p1 = g2P(S, a1, r), p2 = g2P(S, a2, r);
    return '<path d="M' + f1(p1[0]) + ' ' + f1(p1[1]) + ' A' + r + ' ' + r + ' 0 ' + (d > 180 ? 1 : 0) + ' 0 ' + f1(p2[0]) + ' ' + f1(p2[1]) + '" fill="none" stroke="' + (c || INK) + '" stroke-width="' + (sw || 4) + '"/>';
  }
  function g2NameR(size, fs) {   // Winkelname im Bogen: [Abstand des Buchstabens vom Scheitelpunkt, Bogenradius]
    fs = fs || 32;
    if (Math.abs(size - 90) < .01) return [fs * 1.5, fs * 2.3];
    var d = Math.max(fs * 1.15, fs * .55 / Math.sin(Math.min(size, 180) / 2 * Math.PI / 180));
    return [d, d + fs * .88];
  }
  function g2WinkR(size, name, r) { return name ? Math.max(r || 40, g2NameR(size)[1]) : (r || 40); }
  function g2Wink(S, a1, size, L1, L2, c, name, r) {   // Winkel ab S: Schenkel in Richtung a1 und a1 + size; Name im Bogen
    c = c || INK; r = g2WinkR(size, name, r); L2 = L2 || L1;
    var p1 = g2P(S, a1, L1), p2 = g2P(S, a1 + size, L2);
    var o = ln(S[0], S[1], p1[0], p1[1], c, 5) + ln(S[0], S[1], p2[0], p2[1], c, 5);
    if (Math.abs(size - 90) < .01) { var m = g2P(S, a1 + 45, name ? 20 : r * .45); o += g2Arc(S, a1, a1 + 90, r, c, 4) + dt(m[0], m[1], 4, c); }
    else if (size) o += g2Arc(S, a1, a1 + size, r, c, 4);
    if (name) { var q = g2P(S, a1 + size / 2, g2NameR(size)[0]); o += tx(q[0], q[1] + 11, name, 32, c, 700, 'middle', true); }
    return o;
  }
  function g2AngSvg(a1, size, L1, L2, c, name, r, maxw) {   // Winkel als SVG, Größe passend
    var S = [0, 0], pts = [S, g2P(S, a1, L1), g2P(S, a1 + size, L2 || L1)];
    var rr = g2WinkR(size, name, r) + 8;
    for (var t = 0; t <= 360; t += 15) if ((((t - a1) % 360) + 360) % 360 <= size) pts.push(g2P(S, t, rr));
    var x0 = Math.min.apply(null, pts.map(function (p) { return p[0]; })) - 14, x1 = Math.max.apply(null, pts.map(function (p) { return p[0]; })) + 14;
    var y0 = Math.min.apply(null, pts.map(function (p) { return p[1]; })) - 14, y1 = Math.max.apply(null, pts.map(function (p) { return p[1]; })) + 14;
    return '<svg class="gsv" viewBox="' + f1(x0) + ' ' + f1(y0) + ' ' + f1(x1 - x0) + ' ' + f1(y1 - y0) + '" style="max-width:' + (maxw || 360) + 'px">' + g2Wink(S, a1, size, L1, L2, c, name, r) + '</svg>';
  }
  function g2Gd(cx, cy, H, read, rcol) {   // Geodreieck mit Nullpunkt (cx, cy)
    var R = H * .62, R2 = R - H * .1, fs = H * .066, o = '<polygon points="' + f1(cx - H) + ',' + cy + ' ' + f1(cx + H) + ',' + cy + ' ' + cx + ',' + f1(cy - H) + '" fill="' + G2DF + '" fill-opacity=".9" stroke="' + G2DL + '" stroke-width="3" stroke-linejoin="round"/>';
    o += '<path d="M' + f1(cx - R) + ' ' + cy + ' A' + f1(R) + ' ' + f1(R) + ' 0 0 1 ' + f1(cx + R) + ' ' + cy + '" fill="none" stroke="' + G2DL + '" stroke-width="2"/>';
    var t = '';
    for (var d = 0; d <= 180; d += 5) { var a = d * Math.PI / 180, tl = H * (d % 10 ? .045 : .075); t += 'M' + f1(cx + R * Math.cos(a)) + ' ' + f1(cy - R * Math.sin(a)) + 'L' + f1(cx + (R - tl) * Math.cos(a)) + ' ' + f1(cy - (R - tl) * Math.sin(a)); }
    o += '<path d="' + t + '" stroke="' + INK + '" stroke-width="1.8" fill="none"/>';
    for (var k = 0; k <= 180; k += 10) {
      var b = k * Math.PI / 180, ro = R + fs, ri = R2 - fs * .9;
      o += tx(cx + ro * Math.cos(b), cy - ro * Math.sin(b) + fs * .36, k, fs, INK, 700);
      o += tx(cx + ri * Math.cos(b), cy - ri * Math.sin(b) + fs * .36, 180 - k, fs * .88, '#444', 500);
    }
    o += ln(cx, cy, cx, cy - H * .9, G2DL, 2, '6 5') + '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>';
    if (read != null) { var q = g2P([cx, cy], read, R); o += '<circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="10" fill="none" stroke="' + (rcol || AC) + '" stroke-width="5"/>'; }
    return o;
  }
  function g2Lies(v, first, extra) {   // Winkel mit angelegtem Geodreieck; first: 'r' = erster Schenkel nach rechts, 'l' = nach links
    var W = 640, H = 330, S = [320, 300], G = 270, a2 = first === 'r' ? v : 180 - v;
    var o = g2Gd(S[0], S[1], G);
    o += ln(S[0], S[1], S[0] + (first === 'r' ? 300 : -300), S[1], AC, 6);
    var p = g2P(S, a2, 300); o += ln(S[0], S[1], p[0], p[1], AC, 6);
    o += g2Arc(S, Math.min(first === 'r' ? 0 : 180, a2), Math.max(first === 'r' ? 0 : 180, a2), 54, AC, 5);
    return sv(W, H, o + (extra || ''));
  }
  function g2Clock(h, r) {
    r = r || 90; var c = r + 6, o = '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
    for (var k = 0; k < 60; k++) { var a = (90 - k * 6) * Math.PI / 180, tl = k % 5 ? 6 : 13; o += ln(c + (r - tl) * Math.cos(a), c - (r - tl) * Math.sin(a), c + r * Math.cos(a), c - r * Math.sin(a), INK, k % 5 ? 1.5 : 3); }
    for (var z = 1; z <= 12; z++) { var b = (90 - z * 30) * Math.PI / 180; o += tx(c + (r - 30) * Math.cos(b), c - (r - 30) * Math.sin(b) + 8, z, 22, INK, 700); }
    var ah = (90 - (h % 12) * 30) * Math.PI / 180;
    o += ln(c, c, c + r * .36 * Math.cos(ah), c - r * .36 * Math.sin(ah), INK, 9) + ln(c, c, c, c - r * .54, INK, 5) + dt(c, c, 7, INK);
    return sv(2 * c, 2 * c, o);
  }
  function g2Kreis(r, show, hi, ra, da) {   // Kreis im Feld 300 × 300; show: 'M', 'r', 'd'; hi: farbig
    var M = [150, 150], o = '<circle cx="150" cy="150" r="' + r + '" fill="#fff" stroke="' + INK + '" stroke-width="4"/>';
    function col(k) { return hi === k ? AC : INK; }
    if (show.indexOf('d') >= 0) { var d1 = g2P(M, da, r), d2 = g2P(M, da + 180, r); o += ln(d1[0], d1[1], d2[0], d2[1], col('d'), hi === 'd' ? 7 : 4); }
    if (show.indexOf('r') >= 0) { var r1 = g2P(M, ra, r); o += ln(150, 150, r1[0], r1[1], col('r'), hi === 'r' ? 7 : 4); }
    o += cr(150, 150, col('M'), hi === 'M' ? 13 : 9, hi === 'M' ? 6 : 4);
    return sv(300, 300, o);
  }
  var G2LP = { A: 'M1 16 L6 0 L11 16 M3.2 10 H8.8', E: 'M10.5 0 H1.5 V16 H10.5 M1.5 8 H10.5', H: 'M1.5 0 V16 M10.5 0 V16 M1.5 8 H10.5', N: 'M1.5 16 V0 L10.5 16 V0',
    T: 'M0.5 0 H11.5 M6 0 V16', U: 'M1.5 0 V10.5 Q1.5 16 6 16 Q10.5 16 10.5 10.5 V0', Z: 'M1 0 H11 L1 16 H11', M: 'M1 16 V0 L6 9 L11 0 V16', X: 'M1 0 L11 16 M11 0 L1 16',
    I: 'M6 0 V16', S: 'M9.06 1.43 A4 4 0 1 0 6 8 A4 4 0 1 1 2.94 14.57', V: 'M1 0 L6 16 L11 0', L: 'M1.5 0 V16 H10.5', F: 'M10.5 0 H1.5 V16 M1.5 8 H8.5', K: 'M1.5 0 V16 M10.5 0 L1.5 9 M4.6 6 L10.5 16' };
  var G2LS = { A: 'v', E: 'h', H: 'vhp', N: 'p', T: 'v', U: 'v', Z: 'p', M: 'v', X: 'vhp', I: 'vhp', S: 'p', V: 'v', L: '', F: '', K: '', O: 'vhp' };
  function g2Let(ch) {
    var g = ch === 'O' ? '<ellipse cx="6" cy="8" rx="5" ry="8" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' : '<path d="' + G2LP[ch] + '" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
    return '<svg class="gsv" viewBox="-3 -3 18 22" style="max-width:150px">' + g + '</svg>';
  }
  var G2FIG = {   // Figuren 300 × 300: punktsymmetrisch?
    parallelo: { p: [[40, 230], [180, 230], [260, 70], [120, 70]], ps: true }, rechteck: { p: [[40, 90], [260, 90], [260, 210], [40, 210]], ps: true },
    raute: { p: [[150, 30], [250, 150], [150, 270], [50, 150]], ps: true }, dreieck: { p: [[150, 40], [260, 250], [40, 250]], ps: false },
    pfeil: { p: [[30, 120], [160, 120], [160, 60], [270, 150], [160, 240], [160, 180], [30, 180]], ps: false },
    drachen: { p: [[150, 30], [230, 110], [150, 270], [70, 110]], ps: false }, trapez: { p: [[40, 230], [260, 230], [200, 80], [100, 80]], ps: false } };
  function g2Fig(k) { return sv(300, 300, pg(G2FIG[k].p, INK, 5, ACL)); }

  GEN.g2kreis = function () {
    var plan = shuffle(['was', 'was', 'was', 'd', 'd', 'r', 'r', 'sach', 'sach', 'jn']);
    var WAS = [{ v: 'M', h: S('Mittelpunkt') }, { v: 'r', h: S('Radius') }, { v: 'd', h: S('Durchmesser') }];
    return plan.map(function (t) {
      if (t === 'was') {
        var hi = one(['M', 'r', 'd']), ra = R(0, 11) * 30, da = R(0, 5) * 30 + 15;
        return { head: S('Was ist farbig markiert?'), body: '<div class="card gsw sq">' + g2Kreis(120, hi === 'M' ? '' : hi, hi, ra, da) + '</div>', choices: WAS, cols: 3, ans: hi,
          why: S(hi === 'M' ? 'Der Punkt in der Mitte ist der Mittelpunkt M.' : (hi === 'r' ? 'Die Strecke geht von M bis zur Kreislinie: Das ist ein Radius.' : 'Die Strecke geht durch M von Kreislinie zu Kreislinie: Das ist ein Durchmesser.')) };
      }
      if (t === 'd') { var r = R(2, 15);
        return { kind: 'inp', head: S('Der Radius ist r = ' + r + ' cm. Wie groß ist der Durchmesser?'), body: '<div class="card cmpq">d = ' + nin(2 * r) + ' cm</div>', ans: 'd' + r,
          why: S('d = 2 · r = 2 · ' + r + ' cm = ' + 2 * r + ' cm.') }; }
      if (t === 'r') { var d = 2 * R(2, 15);
        return { kind: 'inp', head: S('Der Durchmesser ist d = ' + d + ' cm. Wie lang ist der Radius?'), body: '<div class="card cmpq">r = ' + nin(d / 2) + ' cm</div>', ans: 'r' + d,
          why: S('r = d : 2 = ' + d + ' cm : 2 = ' + d / 2 + ' cm.') }; }
      if (t === 'sach') {
        var T = one([['Ein Fahrrad-Rad hat einen Radius von ', 30, 'cm', 'r'], ['Das Riesenrad hat einen Durchmesser von ', 40, 'm', 'd'], ['Eine Pizza hat einen Durchmesser von ', 28, 'cm', 'd'],
          ['Ein runder Tisch hat einen Radius von ', 60, 'cm', 'r'], ['Ein Teller hat einen Durchmesser von ', 24, 'cm', 'd'], ['Eine Uhr hat einen Radius von ', 15, 'cm', 'r']]);
        var g = T[3], v = T[1], res = g === 'r' ? 2 * v : v / 2, w = g === 'r' ? 'd' : 'r';
        return { kind: 'inp', head: S('Lies genau. Rechne.'), body: bStory(S(T[0] + v + ' ' + T[2] + '. Wie ' + (w === 'd' ? 'groß ist der Durchmesser?' : 'lang ist der Radius?'))) + '<div class="card cmpq">' + w + ' = ' + nin(res) + ' ' + T[2] + '</div>',
          ans: 's' + T[0] + v, why: S(w === 'd' ? 'd = 2 · ' + v + ' ' + T[2] + ' = ' + res + ' ' + T[2] + '.' : 'r = ' + v + ' ' + T[2] + ' : 2 = ' + res + ' ' + T[2] + '.') };
      }
      var st = one([['Der Durchmesser ist doppelt so lang wie der Radius.', 1], ['Der Radius ist doppelt so lang wie der Durchmesser.', 0], ['Alle Punkte auf der Kreislinie sind gleich weit von M entfernt.', 1],
        ['Der Durchmesser geht durch den Mittelpunkt.', 1], ['Ein Kreis mit r = 5 cm hat d = 10 cm.', 1], ['Ein Kreis mit d = 6 cm hat r = 12 cm.', 0]]);
      return { head: S('Stimmt das?'), body: '<div class="card g2st">' + S(st[0]) + '</div>', choices: JN, cols: 2, ans: st[1] ? 'j' : 'n',
        why: S(st[1] ? 'Das stimmt.' : 'Das stimmt nicht. Der Durchmesser ist doppelt so lang wie der Radius: d = 2 · r.') };
    });
  };

  GEN.g2winkel = function () {
    var plan = shuffle(['ist', 'ist', 'sch', 'sch', 'gr', 'gr', 'gr', 'zahl', 'zahl', 'buch']), istK = shuffle(['ja', one(['luecke', 'bogen', 'par'])]);
    return plan.map(function (t) {
      if (t === 'ist') {
        var k = istK.pop(), S0 = [60, 230], o;
        if (k === 'ja') { var a = R(0, 6) * 15, s = R(3, 10) * 10; o = g2Wink([150, 220], a, s, 130, 130, INK); }
        else if (k === 'luecke') o = ln(40, 240, 260, 240, INK, 5) + ln(70, 200, 230, 60, INK, 5);
        else if (k === 'bogen') o = ln(40, 240, 260, 240, INK, 5) + '<path d="M40 240 Q 80 80 250 60" fill="none" stroke="' + INK + '" stroke-width="5"/>';
        else o = ln(40, 100, 260, 100, INK, 5) + ln(40, 200, 260, 200, INK, 5);
        return { head: S('Ist das ein Winkel?'), body: '<div class="card gsw sq">' + sv(300, 300, o) + '</div>', choices: JN, cols: 2, ans: k === 'ja' ? 'j' : 'n', ansk: k + Math.random(),
          why: S(k === 'ja' ? 'Zwei gerade Schenkel beginnen im selben Punkt: Das ist ein Winkel.' : 'Ein Winkel hat zwei gerade Schenkel, die im selben Punkt beginnen. Das ist hier nicht so.') };
      }
      if (t === 'sch') {
        var a1 = R(0, 7) * 45, sz = R(4, 12) * 10, Sx = [300, 200], p1 = g2P(Sx, a1, 170), p2 = g2P(Sx, a1 + sz, 170);
        var cand = shuffle([['S', Sx], ['A', p1], ['B', p2]]), ans = String(cand.map(function (c) { return c[0]; }).indexOf('S'));
        function pic(res) {
          var o2 = ln(Sx[0], Sx[1], p1[0], p1[1], INK, 5) + ln(Sx[0], Sx[1], p2[0], p2[1], INK, 5) + g2Arc(Sx, a1, a1 + sz, 40, INK, 4);
          cand.forEach(function (c, i) { var col = res ? (String(i) === ans ? OKC : (res === String(i) ? NOC : '#9a9a9a')) : AC;
            o2 += '<g class="tp" data-v="' + i + '"><circle cx="' + f1(c[1][0]) + '" cy="' + f1(c[1][1]) + '" r="30" fill="transparent"/>' + cr(c[1][0], c[1][1], col, 13, 6) + '</g>'; });
          return sv(600, 400, o2, 'tapk');
        }
        var it = { kind: 'tap', head: S('Tippe auf den Scheitelpunkt.'), body: '<div class="card gsw" id="g2s">' + pic(null) + '</div>', ans: ans, ansk: a1 + '/' + sz,
          why: S('Der Scheitelpunkt ist der Punkt, an dem beide Schenkel beginnen. Dort ist auch der Bogen.') };
        it.after = function (good, got) { document.getElementById('g2s').innerHTML = pic(got || 'x'); };
        return it;
      }
      if (t === 'gr') {
        var s1 = R(3, 15) * 10, s2; do { s2 = R(3, 15) * 10; } while (Math.abs(s1 - s2) < 20);
        var l1 = s1 > s2 ? 120 : 200, l2 = s1 > s2 ? 200 : 120;   // der größere Winkel hat die kürzeren Schenkel
        var rg = Math.max(g2NameR(s1)[1], g2NameR(s2)[1]);   // beide Bögen gleich groß
        return { head: S('Welcher Winkel ist größer?'), body: '<div class="card g2two">' + g2AngSvg(R(0, 2) * 15, s1, l1, l1, INK, 'α', rg, 280) + g2AngSvg(R(0, 2) * 15, s2, l2, l2, INK, 'β', rg, 280) + '</div>',
          choices: [{ v: 'a', h: 'α' }, { v: 'b', h: 'β' }], cols: 2, ans: s1 > s2 ? 'a' : 'b', ansk: s1 + '/' + s2,
          why: S('Die Länge der Schenkel ist egal. ' + (s1 > s2 ? 'Bei α' : 'Bei β') + ' gehen die Schenkel weiter auseinander.') };
      }
      if (t === 'zahl') {
        var n = R(3, 6), C0 = [150, 155], rr = 110, ps = [];
        for (var j = 0; j < n; j++) ps.push(g2P(C0, 90 + 360 * j / n + R(-12, 12), rr * (.8 + Math.random() * .2)));
        return { head: S('Wie viele Winkel hat die Figur?'), body: '<div class="card gsw sq">' + sv(300, 300, pg(ps, INK, 5, ACL)) + '</div>', choices: nums([3, 4, 5, 6]), cols: 4, ans: n, ansk: n + 'z' + Math.random(),
          why: S('An jeder Ecke ist ein Winkel. Die Figur hat ' + n + ' Ecken, also ' + n + ' Winkel.') };
      }
      var L3 = one([['α', 'al|pha'], ['β', 'be|ta'], ['γ', 'gam|ma']]);
      return { head: S('Wie heißt dieser Buchstabe?'), body: '<div class="card cmpq"><span class="g2gr">' + L3[0] + '</span></div>',
        choices: [{ v: 'al|pha', h: S('al|pha') }, { v: 'be|ta', h: S('be|ta') }, { v: 'gam|ma', h: S('gam|ma') }], cols: 3, ans: L3[1], why: S(L3[0] + ' heißt ' + L3[1] + '.') };
    });
  };

  var G2ART = ['spitz', 'recht', 'stumpf', 'ge|streckt', 'über|stumpf'];
  function g2ArtOf(v) { return v < 90 ? 'spitz' : (v === 90 ? 'recht' : (v < 180 ? 'stumpf' : (v === 180 ? 'ge|streckt' : (v < 360 ? 'über|stumpf' : 'Voll|win|kel')))); }
  function g2ArtCh(list) { return list.map(function (w) { return { v: w, h: S(w) }; }); }
  GEN.g2arten = function () {
    var plan = shuffle(['bild', 'bild', 'bild', 'bild', 'grad', 'grad', 'grad', 'grad', 'uhr', 'uhr']);
    return plan.map(function (t) {
      if (t === 'bild') {
        var k = one(['spitz', 'spitz', 'recht', 'stumpf', 'stumpf', 'ge|streckt', 'über|stumpf']);
        var v = k === 'spitz' ? R(2, 8) * 10 : (k === 'recht' ? 90 : (k === 'stumpf' ? R(10, 17) * 10 : (k === 'ge|streckt' ? 180 : R(20, 33) * 10)));
        var a1 = v > 180 ? 0 : R(0, 3) * 15;
        return { head: S('Welche Winkelart ist das?'), body: '<div class="card gsw sq">' + g2AngSvg(a1, v, 160, 160, INK, 'α', 40, 340) + '</div>', choices: g2ArtCh(G2ART), cols: 3, ans: k, ansk: a1 + '/' + v,
          why: S('Der Winkel ist ' + (k === 'recht' ? 'genau 90° groß: ein rechter Winkel.' : (k === 'ge|streckt' ? 'eine gerade Linie, 180°: ein gestreckter Winkel.' : (k === 'spitz' ? 'kleiner als 90°: ein spitzer Winkel.' : (k === 'stumpf' ? 'größer als 90° und kleiner als 180°: ein stumpfer Winkel.' : 'größer als 180°: ein überstumpfer Winkel.'))))) };
      }
      if (t === 'grad') {
        var g = one([R(1, 17) * 5, R(1, 17) * 5, 90, 180, R(37, 71) * 5, 360]); if (g === 90 && Math.random() < .5) g = R(91, 179);
        var a = g2ArtOf(g), ch = G2ART.concat(['Voll|win|kel']);
        return { head: S('Welche Winkelart hat diese Größe?'), body: '<div class="card cmpq">α = ' + g + '°</div>', choices: g2ArtCh(ch), cols: 3, ans: a,
          why: S('Spitz: kleiner als 90°. Recht: 90°. Stumpf: zwischen 90° und 180°. Gestreckt: 180°. Überstumpf: zwischen 180° und 360°. Vollwinkel: 360°.') };
      }
      var h = R(1, 6), w = h * 30;
      return { head: S('Die Uhrzeiger bilden einen Winkel. Welche Winkelart ist es?'), body: '<div class="card gsw sq">' + g2Clock(h) + '</div>', choices: g2ArtCh(['spitz', 'recht', 'stumpf', 'ge|streckt']), cols: 2, ans: g2ArtOf(w),
        why: S('Um ' + h + ' Uhr sind es ' + h + ' · 30° = ' + w + '°: ' + (w < 90 ? 'spitz.' : (w === 90 ? 'ein rechter Winkel.' : (w < 180 ? 'stumpf.' : 'gestreckt.')))) };
    });
  };

  GEN.g2messen = function () {
    var plan = shuffle(['lies', 'lies', 'lies', 'lies', 'lies', 'lies', 'ben', 'ben', 'sch', 'sch']);
    return plan.map(function (t) {
      var v = R(2, 16) * 10, first = Math.random() < .3 ? 'l' : 'r';
      if (Math.random() < .3) v += 5;
      if (t === 'lies') return { kind: 'inp', head: S('Lies am Geodreieck ab. Wie groß ist der Winkel?'), body: '<div class="card gsw">' + g2Lies(v, first) + '</div><div class="card cmpq">α = ' + nin(v) + '°</div>', ans: 'l' + v + first,
        why: S('Der erste Schenkel zeigt nach ' + (first === 'r' ? 'rechts' : 'links') + '. Dort beginnt die Skala mit 0. Dort liest du ab: ' + v + '°.') };
      if (t === 'ben') {
        var ok = Math.random() < .4, said = ok ? v : 180 - v, nm = one(['Ben', 'Mia', 'Ayla', 'Jonas']);
        if (said === v) ok = true;
        return { head: S(nm + ' sagt: α = ' + said + '°. Stimmt das?'), body: '<div class="card gsw">' + g2Lies(v, first) + '</div>', choices: JN, cols: 2, ans: ok ? 'j' : 'n', ansk: v + first + said,
          why: S(ok ? 'Das stimmt.' : 'Das stimmt nicht. ' + nm + ' hat die falsche Skala benutzt. Richtig ist α = ' + v + '°.') };
      }
      var vv = R(2, 16) * 10, opts, pool = [];
      for (var q = 1; q <= 17; q++) pool.push(q * 10);
      do { opts = [vv]; shuffle(pool).forEach(function (c) { if (opts.length < 4 && opts.every(function (o) { return Math.abs(o - c) >= 40; })) opts.push(c); }); } while (opts.length < 4);
      return { head: S('Schätze: Wie groß ist der Winkel ungefähr?'), body: '<div class="card gsw sq">' + g2AngSvg(R(0, 2) * 15, vv, 170, 170, INK, 'α', 40, 320) + '</div>',
        choices: shuffle(opts).map(function (o) { return { v: o, h: o + '°' }; }), cols: 4, ans: vv,
        why: S('Vergleiche mit einem rechten Winkel (90°). Der Winkel ist etwa ' + vv + '° groß.') };
    });
  };

  GEN.g2zeichnen = function () {
    var plan = shuffle(['mark', 'mark', 'mark', 'mark', 'mark', 'uhr', 'uhr', 'uhr', 'uhr', 'pruef']);
    return plan.map(function (t) {
      if (t === 'mark') {
        var v = R(2, 16) * 10, first = Math.random() < .35 ? 'l' : 'r', S0 = [320, 300], G = 270, Rr = G * .62;
        var pos = first === 'r' ? v : 180 - v, wrong = 180 - pos, cand = pos === wrong ? [pos] : [pos, wrong];
        while (cand.length < 4) { var c = R(1, 17) * 10; if (cand.every(function (o) { return Math.abs(o - c) >= 20; })) cand.push(c); }
        cand = shuffle(cand); var ans = String(cand.indexOf(pos));
        function pic(res) {
          var o = g2Gd(S0[0], S0[1], G) + ln(S0[0], S0[1], S0[0] + (first === 'r' ? 300 : -300), S0[1], AC, 6);
          cand.forEach(function (a, i) { var q = g2P(S0, a, Rr), col = res ? (String(i) === ans ? OKC : (res === String(i) ? NOC : '#b5b5b5')) : AC;
            o += '<g class="tp" data-v="' + i + '"><circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="24" fill="transparent"/><circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="11" fill="' + col + '"/></g>'; });
          if (res) { var e = g2P(S0, pos, 300); o += ln(S0[0], S0[1], e[0], e[1], OKC, 5); }
          return sv(640, 330, o, 'tapk');
        }
        var it = { kind: 'tap', head: S('Du willst α = ' + v + '° zeichnen. Wo markierst du den Punkt? Tippe ihn an.'), body: '<div class="card gsw" id="g2m">' + pic(null) + '</div>', ans: ans, ansk: v + first,
          why: S('Der erste Schenkel zeigt nach ' + (first === 'r' ? 'rechts' : 'links') + '. Die Skala beginnt dort mit 0. Markiere bei ' + v + ' auf dieser Skala.') };
        it.after = function (good, got) { document.getElementById('g2m').innerHTML = pic(got || 'x'); };
        return it;
      }
      if (t === 'uhr') { var h = R(1, 6);
        return { kind: 'inp', head: S('Wie groß ist der Winkel zwischen den Uhrzeigern? Von einer Zahl zur nächsten sind es 30°.'), body: '<div class="card gsw sq">' + g2Clock(h) + '</div><div class="card cmpq">α = ' + nin(h * 30) + '°</div>',
          ans: 'u' + h, why: S(h + ' Schritte · 30° = ' + h * 30 + '°.') }; }
      var want = R(3, 15) * 10, drawn = Math.random() < .5 ? want : (Math.random() < .5 ? 180 - want : want + 20), nm = one(['Ben', 'Mia', 'Ayla', 'Jonas']);
      if (drawn === 90 && want !== 90) drawn = want + 20;
      return { head: S(nm + ' sollte α = ' + want + '° zeichnen. Stimmt die Zeichnung?'), body: '<div class="card gsw">' + g2Lies(drawn, 'r') + '</div>', choices: JN, cols: 2, ans: drawn === want ? 'j' : 'n', ansk: want + '/' + drawn,
        why: S(drawn === want ? 'Das stimmt: Der Winkel ist ' + want + '° groß.' : 'Das stimmt nicht. Der Winkel ist ' + drawn + '° groß, nicht ' + want + '°.') };
    });
  };

  GEN.g2achse = function () {
    var set = shuffle(GEN.symm()).slice(0, 4).concat(shuffle(GEN.spiegeln()).slice(0, 4));
    set.forEach(function (it) { if (it.choices && it.choices.length === 2 && it.choices[0].v === 'j') it.choices = JN; });
    shuffle(['A', 'E', 'H', 'N', 'T', 'U', 'Z', 'S', 'M', 'L', 'F', 'K', 'V']).slice(0, 2).forEach(function (ch) {
      var s = G2LS[ch].indexOf('v') >= 0 || G2LS[ch].indexOf('h') >= 0;
      set.push({ head: S('Ist der Buchstabe achsensymmetrisch?'), body: '<div class="card gsw sq">' + g2Let(ch) + '</div>', choices: JN, cols: 2, ans: s ? 'j' : 'n', ansk: ch,
        why: S(s ? 'Ja. Du kannst den Buchstaben so falten, dass beide Hälften genau aufeinanderpassen.' : 'Nein. Es gibt keine Faltlinie, bei der beide Hälften aufeinanderpassen.') });
    });
    return shuffle(set);
  };

  GEN.g2punkt = function () {
    var set = [], C = 40, NX = 12, NY = 8, X0 = 20, Y0 = 20, W = X0 * 2 + NX * C, H = Y0 * 2 + NY * C, Z = [6, 4];
    for (var t = 0; t < 5; t++) {
      (function () {
        var dx, dy; do { dx = R(-5, 5); dy = R(-3, 3); } while ((dx === 0 && dy === 0) || Math.abs(dx) + Math.abs(dy) < 2);
        var P = [Z[0] + dx, Z[1] + dy], M = [Z[0] - dx, Z[1] - dy];
        function g(p) { return [X0 + p[0] * C, Y0 + p[1] * C]; }
        function pic(res) {
          var o = karoJ(X0, Y0, NX, NY, C), z = g(Z), p = g(P);
          o += cr(z[0], z[1], INK, 13, 7) + tx(z[0] + 24, z[1] - 14, 'Z', 26, INK, 800) + cr(p[0], p[1], INK, 11, 5) + tx(p[0] - 22, p[1] - 14, 'A', 26, INK, 800);
          if (res) {
            var m = g(M); o += ln(p[0], p[1], m[0], m[1], OKC, 3, '9 7') + cr(m[0], m[1], OKC, 12, 6) + tx(m[0] + 26, m[1] - 14, 'A′', 26, OKC, 800);
            if (res !== 'ok') { var r = res.split('|'), rp = g([+r[0], +r[1]]); o += cr(rp[0], rp[1], NOC, 12, 6); }
          } else {
            for (var i = 0; i <= NX; i++) for (var j = 0; j <= NY; j++) {
              if ((i === Z[0] && j === Z[1]) || (i === P[0] && j === P[1])) continue;
              o += '<g class="tp" data-v="' + i + '|' + j + '"><circle cx="' + (X0 + i * C) + '" cy="' + (Y0 + j * C) + '" r="18" fill="transparent"/></g>';
            }
          }
          return sv(W, H, o, 'tapk');
        }
        var it = { kind: 'tap', head: S('Spiegele den Punkt A am Punkt Z. Tippe auf den Bildpunkt A′.'), body: '<div class="card gsw" id="g2p">' + pic(null) + '</div>', ans: M[0] + '|' + M[1], ansk: dx + '/' + dy,
          why: S('Von A bis Z: ' + Math.abs(dx) + ' Kästchen nach ' + (dx < 0 ? 'rechts' : 'links') + ' und ' + Math.abs(dy) + ' Kästchen nach ' + (dy < 0 ? 'unten' : 'oben') + '. Von Z gehst du genauso weiter.') };
        it.after = function (good, got) { document.getElementById('g2p').innerHTML = pic(good ? 'ok' : got); };
        set.push(it);
      })();
    }
    shuffle(Object.keys(G2FIG)).slice(0, 2).forEach(function (k) {
      var y = G2FIG[k].ps;
      set.push({ head: S('Ist die Figur punktsymmetrisch?'), body: '<div class="card gsw sq">' + g2Fig(k) + '</div>', choices: JN, cols: 2, ans: y ? 'j' : 'n', ansk: k,
        why: S(y ? 'Ja. Nach einer halben Drehung sieht die Figur genau gleich aus.' : 'Nein. Nach einer halben Drehung steht die Figur anders da.') });
    });
    shuffle(['H', 'N', 'S', 'Z', 'X', 'T', 'A', 'E', 'U', 'O', 'L', 'I']).slice(0, 3).forEach(function (ch) {
      var s = G2LS[ch], ac = s.indexOf('v') >= 0 || s.indexOf('h') >= 0, pc = s.indexOf('p') >= 0;
      var ans = ac && pc ? 'b' : (ac ? 'a' : (pc ? 'p' : 'k'));
      set.push({ head: S('Welche Symmetrie hat der Buchstabe?'), body: '<div class="card gsw sq">' + g2Let(ch) + '</div>',
        choices: [{ v: 'a', h: '<span class="g2lw">' + S('nur achsensymmetrisch') + '</span>' }, { v: 'p', h: '<span class="g2lw">' + S('nur punktsymmetrisch') + '</span>' }, { v: 'b', h: '<span class="g2lw">' + S('beides') + '</span>' }, { v: 'k', h: '<span class="g2lw">' + S('keins von beiden') + '</span>' }], cols: 1, ans: ans, ansk: ch,
        why: S('Achsensymmetrisch: falten. Punktsymmetrisch: halb herumdrehen. ' + ch + ' ist ' + (ans === 'b' ? 'beides.' : (ans === 'a' ? 'nur achsensymmetrisch.' : (ans === 'p' ? 'nur punktsymmetrisch.' : 'keins von beiden.')))) });
    });
    return shuffle(set);
  };
  TIP.g2kreis = S('Der Durchmesser ist doppelt so lang wie der Radius: d = 2 · r. Der Radius ist die Hälfte: r = d : 2.');
  TIP.g2winkel = S('Ein Winkel hat zwei Schenkel und einen Scheitelpunkt. Die Länge der Schenkel ist egal.');
  TIP.g2arten = S('Vergleiche mit 90° (rechter Winkel) und mit 180° (gerade Linie).');
  TIP.g2messen = S('Lies an der Skala ab, die beim ersten Schenkel mit 0 beginnt. Ein spitzer Winkel ist kleiner als 90°.');
  TIP.g2zeichnen = S('Die Skala muss beim ersten Schenkel mit 0 beginnen. Von einer Zahl zur nächsten auf der Uhr sind es 30°.');
  TIP.g2achse = S('Falte in Gedanken an der Achse. Zähle die Kästchen bis zur Achse und auf der anderen Seite genauso viele.');
  TIP.g2punkt = S('Zähle die Kästchen von A bis Z. Gehe von Z genauso weiter. Punktsymmetrisch: halb herumdrehen.');

  // ============================================================ Körper und ihre Eigenschaften (6. Schuljahr): Körper, Ecken/Kanten/Flächen, Würfel und Quader, Netze, Schrägbilder, Oberfläche, Volumen
  // Wie im Heft: Schrägbild mit Kanten nach hinten unter 45° und halber Länge, verdeckte Kanten gestrichelt.
  var KPF = '#cddcec', KPT = '#e9f0f8', KPS = '#adc5de', KPH = '#f3c96b', KPD = '12 9';
  function kpP(o, x, y, z) { return [o[0] + x + z / 2, o[1] - y - z / 2]; }
  function kpPg(pts, fill, c, sw) { return '<polygon points="' + pts.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join(' ') + '" fill="' + fill + '" stroke="' + (c || 'none') + '" stroke-width="' + (sw || 0) + '" stroke-linejoin="round"/>'; }
  function kpQuader(o, a, b, c, opt) {   // a nach rechts, b nach hinten, c nach oben; o = vorne unten links
    opt = opt || {}; var sw = opt.sw || 4, col = opt.col || INK, V = {};
    [0, 1].forEach(function (i) { [0, 1].forEach(function (j) { [0, 1].forEach(function (k) { V['' + i + j + k] = kpP(o, i * a, k * c, j * b); }); }); });
    var s = '';
    if (opt.fill !== false) s += kpPg([V['000'], V['100'], V['101'], V['001']], opt.front || KPF) + kpPg([V['001'], V['101'], V['111'], V['011']], KPT) + kpPg([V['100'], V['110'], V['111'], V['101']], KPS);
    [['000', '100'], ['100', '101'], ['101', '001'], ['001', '000'], ['001', '011'], ['101', '111'], ['011', '111'], ['100', '110'], ['110', '111']].forEach(function (e) { s += ln(V[e[0]][0], V[e[0]][1], V[e[1]][0], V[e[1]][1], col, sw); });
    if (opt.hid !== false) [['010', '110'], ['010', '011'], ['010', '000']].forEach(function (e) { s += ln(V[e[0]][0], V[e[0]][1], V[e[1]][0], V[e[1]][1], col, sw * .8, opt.nodash ? null : KPD); });
    return { s: s, V: V };
  }
  function kpHalf(cx, cy, rx, ry, front, sw) {
    return '<path d="M' + f1(cx - rx) + ' ' + f1(cy) + ' A' + f1(rx) + ' ' + f1(ry) + ' 0 0 ' + (front ? 0 : 1) + ' ' + f1(cx + rx) + ' ' + f1(cy) + '" fill="none" stroke="' + INK + '" stroke-width="' + (front ? sw : sw * .8) + '"' + (front ? '' : ' stroke-dasharray="' + KPD + '"') + '/>';
  }
  function kpSolid(kind, cx, by, s) {   // Körper mittig über der Grundlinie by
    s = s || 1; var o, r, h, ry, a, w, t, F, B, G, S2, out = '';
    if (kind === 'wuerfel') { a = 100 * s; return kpQuader([cx - .75 * a, by], a, a, a).s; }
    if (kind === 'quader') { return kpQuader([cx - (150 * s + 35 * s) / 2, by], 150 * s, 70 * s, 70 * s).s; }
    if (kind === 'quaderh') { return kpQuader([cx - (70 * s + 30 * s) / 2, by], 70 * s, 60 * s, 140 * s).s; }
    if (kind === 'prisma') {
      w = 110 * s; t = 160 * s; h = 95 * s; o = [cx - (w + t / 2) / 2, by];   // Tiefe ≠ Breite: keine quadratische Fläche
      F = [kpP(o, 0, 0, 0), kpP(o, w, 0, 0), kpP(o, w / 2, h, 0)]; B = [kpP(o, 0, 0, t), kpP(o, w, 0, t), kpP(o, w / 2, h, t)];
      out = kpPg(F, KPF) + kpPg([F[1], B[1], B[2], F[2]], KPS);
      [[F[0], F[1]], [F[1], F[2]], [F[2], F[0]], [F[2], B[2]], [F[1], B[1]], [B[1], B[2]]].forEach(function (e) { out += ln(e[0][0], e[0][1], e[1][0], e[1][1], INK, 4); });
      [[F[0], B[0]], [B[0], B[1]], [B[0], B[2]]].forEach(function (e) { out += ln(e[0][0], e[0][1], e[1][0], e[1][1], INK, 3.2, KPD); });
      return out;
    }
    if (kind === 'pyramide') {
      a = 120 * s; h = 125 * s; o = [cx - .75 * a, by];
      G = [kpP(o, 0, 0, 0), kpP(o, a, 0, 0), kpP(o, a, 0, a), kpP(o, 0, 0, a)]; S2 = kpP(o, a / 2, h, a / 2);
      out = kpPg([G[0], G[1], S2], KPF) + kpPg([G[1], G[2], S2], KPS);
      [[G[0], G[1]], [G[1], G[2]], [G[0], S2], [G[1], S2], [G[2], S2]].forEach(function (e) { out += ln(e[0][0], e[0][1], e[1][0], e[1][1], INK, 4); });
      [[G[2], G[3]], [G[3], G[0]], [G[3], S2]].forEach(function (e) { out += ln(e[0][0], e[0][1], e[1][0], e[1][1], INK, 3.2, KPD); });
      return out;
    }
    if (kind === 'zylinder') {
      r = 55 * s; ry = r * .32; h = 120 * s; var cy = by - ry, ty = cy - h;
      out = '<path d="M' + f1(cx - r) + ' ' + f1(ty) + ' L' + f1(cx - r) + ' ' + f1(cy) + ' A' + f1(r) + ' ' + f1(ry) + ' 0 0 0 ' + f1(cx + r) + ' ' + f1(cy) + ' L' + f1(cx + r) + ' ' + f1(ty) + ' Z" fill="' + KPF + '"/>';
      out += '<ellipse cx="' + f1(cx) + '" cy="' + f1(ty) + '" rx="' + f1(r) + '" ry="' + f1(ry) + '" fill="' + KPT + '" stroke="' + INK + '" stroke-width="4"/>';
      return out + kpHalf(cx, cy, r, ry, true, 4) + kpHalf(cx, cy, r, ry, false, 4) + ln(cx - r, ty, cx - r, cy, INK, 4) + ln(cx + r, ty, cx + r, cy, INK, 4);
    }
    if (kind === 'kegel') {
      r = 60 * s; ry = r * .32; h = 130 * s; var cy2 = by - ry, tt = Math.asin(Math.min(1, ry / h)), px = r * Math.cos(tt), py = cy2 + ry * Math.sin(tt);
      out = '<path d="M' + f1(cx) + ' ' + f1(cy2 - h) + ' L' + f1(cx - px) + ' ' + f1(py) + ' A' + f1(r) + ' ' + f1(ry) + ' 0 0 0 ' + f1(cx + px) + ' ' + f1(py) + ' Z" fill="' + KPF + '"/>';
      out += '<path d="M' + f1(cx - px) + ' ' + f1(py) + ' A' + f1(r) + ' ' + f1(ry) + ' 0 0 0 ' + f1(cx + px) + ' ' + f1(py) + '" fill="none" stroke="' + INK + '" stroke-width="4"/>';
      out += '<path d="M' + f1(cx - px) + ' ' + f1(py) + ' A' + f1(r) + ' ' + f1(ry) + ' 0 1 1 ' + f1(cx + px) + ' ' + f1(py) + '" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-dasharray="' + KPD + '"/>';
      return out + ln(cx, cy2 - h, cx - px, py, INK, 4) + ln(cx, cy2 - h, cx + px, py, INK, 4);
    }
    if (kind === 'kugel') {
      r = 65 * s; ry = r * .32; var cy3 = by - r;
      out = '<circle cx="' + f1(cx) + '" cy="' + f1(cy3) + '" r="' + f1(r) + '" fill="' + KPF + '" stroke="' + INK + '" stroke-width="4"/>';
      return out + kpHalf(cx, cy3, r, ry, true, 3.2) + kpHalf(cx, cy3, r, ry, false, 3.2);
    }
    return '';
  }
  function kpCubes(o, cells, u) {
    var key = {}; cells.forEach(function (c) { key[c.join(',')] = 1; });
    var has = function (x, y, z) { return key[x + ',' + y + ',' + z]; }, s = '';
    cells.slice().sort(function (p, q) { return (q[2] - p[2]) || (p[1] - q[1]) || (p[0] - q[0]); }).forEach(function (c) {
      var x = c[0], y = c[1], z = c[2], P = function (i, j, k) { return kpP(o, (x + i) * u, (y + k) * u, (z + j) * u); };
      if (!has(x, y, z - 1)) s += kpPg([P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], KPF, INK, 3);
      if (!has(x, y + 1, z)) s += kpPg([P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], KPT, INK, 3);
      if (!has(x + 1, y, z)) s += kpPg([P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], KPS, INK, 3);
    });
    return s;
  }
  function kpCubesC(cells, u, W, H) {   // Würfelbau mittig in W × H
    var mx = 0, my = 0, mz = 0; cells.forEach(function (c) { mx = Math.max(mx, c[0]); my = Math.max(my, c[1]); mz = Math.max(mz, c[2]); });
    var w = (mx + 1) * u + (mz + 1) * u / 2, h = (my + 1) * u + (mz + 1) * u / 2;
    return kpCubes([W / 2 - w / 2, H / 2 + h / 2], cells, u);
  }
  function kpGridQ(o, a, b, c, u) {   // Quader aus a × b × c Würfeln (nur sichtbare Seiten mit Gitter)
    var s = kpQuader(o, a * u, b * u, c * u, { hid: false, sw: 4 }).s, g = '#4a6a90', i, p, q;
    for (i = 1; i < a; i++) { p = kpP(o, i * u, 0, 0); q = kpP(o, i * u, c * u, 0); s += ln(p[0], p[1], q[0], q[1], g, 2); p = kpP(o, i * u, c * u, b * u); s += ln(q[0], q[1], p[0], p[1], g, 2); }
    for (i = 1; i < c; i++) { p = kpP(o, 0, i * u, 0); q = kpP(o, a * u, i * u, 0); s += ln(p[0], p[1], q[0], q[1], g, 2); p = kpP(o, a * u, i * u, b * u); s += ln(q[0], q[1], p[0], p[1], g, 2); }
    for (i = 1; i < b; i++) { p = kpP(o, 0, c * u, i * u); q = kpP(o, a * u, c * u, i * u); s += ln(p[0], p[1], q[0], q[1], g, 2); p = kpP(o, a * u, 0, i * u); s += ln(q[0], q[1], p[0], p[1], g, 2); }
    return s;
  }
  function kpNet(o, cells, u, fills) {
    fills = fills || {}; var s = '';
    cells.forEach(function (c) { var x = o[0] + c[0] * u, y = o[1] + c[1] * u; s += kpPg([[x, y], [x + u, y], [x + u, y + u], [x, y + u]], fills[c.join(',')] || KPF, INK, 4); });
    return s;
  }
  function kpFold(cells) {   // Würfel über das Netz abrollen: Quadrat -> Würfelseite (0..5) oder null
    var S = {}; cells.forEach(function (c) { S[c.join(',')] = c; });
    var st0 = { d: 0, u: 1, n: 2, s: 3, w: 4, e: 5 }, seen = {}, st = [[cells[0], st0]];
    seen[cells[0].join(',')] = 0;
    function roll(t, dir) {
      var r = { d: t.d, u: t.u, n: t.n, s: t.s, w: t.w, e: t.e };
      if (dir === 'e') { r.d = t.e; r.e = t.u; r.u = t.w; r.w = t.d; }
      if (dir === 'w') { r.d = t.w; r.w = t.u; r.u = t.e; r.e = t.d; }
      if (dir === 's') { r.d = t.s; r.s = t.u; r.u = t.n; r.n = t.d; }
      if (dir === 'n') { r.d = t.n; r.n = t.u; r.u = t.s; r.s = t.d; }
      return r;
    }
    while (st.length) {
      var cur = st.pop(), c = cur[0], t = cur[1];
      [['e', 1, 0], ['w', -1, 0], ['s', 0, 1], ['n', 0, -1]].forEach(function (m) {
        var k = (c[0] + m[1]) + ',' + (c[1] + m[2]);
        if (S[k] && seen[k] === undefined) { var ns = roll(t, m[0]); seen[k] = ns.d; st.push([S[k], ns]); }
      });
    }
    var vals = Object.keys(seen).map(function (k) { return seen[k]; });
    if (vals.length !== 6 || cells.length !== 6) return null;
    var u = {}; vals.forEach(function (v) { u[v] = 1; });
    return Object.keys(u).length === 6 ? seen : null;
  }
  function kpOpp(cells, c) {
    var m = kpFold(cells), op = { 0: 1, 1: 0, 2: 3, 3: 2, 4: 5, 5: 4 }; if (!m) return null;
    var t = op[m[c.join(',')]], r = null; Object.keys(m).forEach(function (k) { if (m[k] === t) r = k; }); return r;
  }
  function kpPips(x, y, u, n, c) {
    var q = .26, P = { c: [.5, .5], tl: [.5 - q, .5 - q], tr: [.5 + q, .5 - q], bl: [.5 - q, .5 + q], br: [.5 + q, .5 + q], ml: [.5 - q, .5], mr: [.5 + q, .5] };
    var Lk = { 1: ['c'], 2: ['tr', 'bl'], 3: ['tr', 'c', 'bl'], 4: ['tl', 'tr', 'bl', 'br'], 5: ['tl', 'tr', 'c', 'bl', 'br'], 6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'] }[n];
    return Lk.map(function (k) { return dt(x + P[k][0] * u, y + P[k][1] * u, u * .09, c || INK); }).join('');
  }
  function kpNorm(cells) { var mx = Math.min.apply(null, cells.map(function (c) { return c[0]; })), my = Math.min.apply(null, cells.map(function (c) { return c[1]; })); return cells.map(function (c) { return [c[0] - mx, c[1] - my]; }); }
  function kpVar(cells) {   // zufällig drehen / spiegeln
    var f = R(0, 7);
    return kpNorm(cells.map(function (c) { var x = c[0], y = c[1], t; if (f & 4) { t = x; x = y; y = t; } if (f & 1) x = -x; if (f & 2) y = -y; return [x, y]; })).sort(function (p, q) { return (p[1] - q[1]) || (p[0] - q[0]); });
  }
  function kpBox(cells) { return [Math.max.apply(null, cells.map(function (c) { return c[0]; })) + 1, Math.max.apply(null, cells.map(function (c) { return c[1]; })) + 1]; }
  var KP_NETS = [[[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]].slice(0), [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]], [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2], [1, 3]]];
  var KP_BAD = [[[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 1]], [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2]], [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, 1]], [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1]]];
  var KP_NM = { wuerfel: 'Würfel', quader: 'Quader', quaderh: 'Quader', prisma: 'Prisma', pyramide: 'Pyramide', zylinder: 'Zylinder', kegel: 'Kegel', kugel: 'Kugel' };
  var KP_EKF = { 'Würfel': [8, 12, 6], 'Quader': [8, 12, 6], 'Prisma': [6, 9, 5], 'Pyramide': [5, 8, 5], 'Zylinder': [0, 2, 3], 'Kegel': [0, 1, 2], 'Kugel': [0, 0, 1] };
  var KP_ALL7 = ['Würfel', 'Quader', 'Kugel', 'Zylinder', 'Kegel', 'Pyramide', 'Prisma'];
  var KP_ART = { 'Würfel': 'der', 'Quader': 'der', 'Kugel': 'die', 'Zylinder': 'der', 'Kegel': 'der', 'Pyramide': 'die', 'Prisma': 'das' };
  function kpDer(n, cap) { var a = KP_ART[n]; return (cap ? a.charAt(0).toUpperCase() + a.slice(1) : a) + ' ' + n; }
  function kpEin(n) { return (KP_ART[n] === 'die' ? 'eine ' : 'ein ') + n; }
  function kpPic(kind, s) { return sv(400, 300, kpSolid(kind, 200, 270, s || 1.25)); }
  var KP_DIS = { 'Würfel': ['Quader', 'Prisma'], 'Quader': ['Würfel', 'Zylinder'], 'Kugel': ['Zylinder', 'Kegel'], 'Zylinder': ['Kegel', 'Quader'], 'Kegel': ['Pyramide', 'Zylinder'], 'Pyramide': ['Prisma', 'Kegel'], 'Prisma': ['Pyramide', 'Quader'] };
  function kpNameCh(right) { return shuffle(KP_DIS[right].concat([right])).map(function (n) { return { v: n, h: S(n) }; }); }

  GEN.kpkoerper = function () {
    var kinds = ['wuerfel', 'quader', 'quaderh', 'prisma', 'pyramide', 'zylinder', 'kegel', 'kugel'];
    var ALLT = [['eine Dose', 'Zylinder'], ['ein Fußball', 'Kugel'], ['ein Spielwürfel', 'Würfel'], ['ein Schuhkarton', 'Quader'], ['ein Partyhut', 'Kegel'],
      ['ein Zelt', 'Prisma'], ['eine Eistüte', 'Kegel'], ['ein Baumstamm', 'Zylinder'], ['ein Ziegelstein', 'Quader'], ['eine Murmel', 'Kugel'],
      ['ein Zuckerwürfel', 'Würfel'], ['die Pyramiden in Ägypten', 'Pyramide'], ['eine Milchtüte', 'Quader'], ['ein Verkehrshütchen', 'Kegel'], ['eine Kerze', 'Zylinder']];
    var RAE = [['Ich habe keine Ecken und keine Kanten. Ich rolle in alle Richtungen.', 'Kugel'], ['Ich habe 6 Flächen. Alle sind gleich große Quadrate.', 'Würfel'],
      ['Ich habe eine Spitze und unten einen Kreis.', 'Kegel'], ['Unten habe ich ein Quadrat. Oben treffen sich 4 Dreiecke in einer Spitze.', 'Pyramide'],
      ['Oben und unten habe ich einen Kreis. Ich kann geradeaus rollen.', 'Zylinder'], ['Vorne und hinten habe ich ein Dreieck. Dazwischen sind 3 Rechtecke.', 'Prisma'],
      ['Ich habe 6 Rechtecke. Gegenüber liegen immer gleich große Rechtecke.', 'Quader']];
    var plan = shuffle(['name', 'name', 'name', 'name', 'allt', 'allt', 'allt', 'roll', 'roll', 'rae', 'rae']);
    return plan.map(function (t) {
      if (t === 'name') { var k = one(kinds), n = KP_NM[k]; return { head: S('Welcher Körper ist das?'), body: '<div class="card gsw">' + kpPic(k, one([1, 1.25])) + '</div>', choices: kpNameCh(n), cols: 3, ans: n, ansk: k + Math.random().toFixed(1),
        why: S('Das ist ' + kpEin(n) + '.') }; }
      if (t === 'allt') { var a = one(ALLT); return { head: S('Welchem Körper sieht der Gegenstand ähnlich?'), body: '<div class="card g2st">' + S(a[0].charAt(0).toUpperCase() + a[0].slice(1)) + '</div>', choices: kpNameCh(a[1]), cols: 3, ans: a[1], ansk: a[0],
        why: S(a[0].charAt(0).toUpperCase() + a[0].slice(1) + ' sieht aus wie ' + kpEin(a[1]) + '.') }; }
      if (t === 'roll') { var k2 = one(kinds), n2 = KP_NM[k2], ok = ['Kugel', 'Zylinder', 'Kegel'].indexOf(n2) >= 0;
        return { head: S('Kann dieser Körper rollen?'), body: '<div class="card gsw">' + kpPic(k2, 1.1) + '</div>', choices: JN, cols: 2, ans: ok ? 'j' : 'n', ansk: k2,
          why: S(ok ? 'Ja. ' + kpDer(n2, true) + ' hat eine gebogene Fläche.' : 'Nein. ' + kpDer(n2, true) + ' hat nur ebene Flächen.') }; }
      var r = one(RAE);
      return { head: S('Wer bin ich?'), body: '<div class="card g2st">' + S(r[0]) + '</div>', choices: kpNameCh(r[1]), cols: 3, ans: r[1], ansk: r[0], why: S('Das ist ' + kpDer(r[1]) + '.') };
    });
  };

  GEN.kpekf = function () {
    var kinds = ['wuerfel', 'quader', 'quaderh', 'prisma', 'pyramide', 'zylinder', 'kegel', 'kugel'], W = ['Ecken', 'Kanten', 'Flächen'];
    var plan = shuffle(['z', 'z', 'z', 'z', 'z', 'z', 'z', 'f', 'f', 's']);
    return plan.map(function (t) {
      var k = one(kinds), n = KP_NM[k], e = KP_EKF[n];
      if (t === 'z') { var w = R(0, 2), v = e[w];
        return { kind: 'inp', head: S('Wie viele ' + W[w] + ' hat ' + kpDer(n) + '?'), body: '<div class="card gsw">' + kpPic(k, 1.15) + '</div><div class="card cmpq">' + nin(v) + ' ' + S(W[w]) + '</div>', ans: k + w,
          why: S(kpDer(n, true) + ' hat ' + e[0] + (e[0] === 1 ? ' Ecke, ' : ' Ecken, ') + e[1] + (e[1] === 1 ? ' Kante und ' : ' Kanten und ') + e[2] + (e[2] === 1 ? ' Fläche.' : ' Flächen.')) }; }
      if (t === 'f') { var FF = { 'Würfel': 'Quadrate', 'Quader': 'Rechtecke', 'Prisma': 'Dreiecke und Rechtecke', 'Pyramide': 'ein Quadrat und Dreiecke', 'Zylinder': 'Kreise und eine gebogene Fläche', 'Kegel': 'ein Kreis und eine gebogene Fläche', 'Kugel': 'nur eine gebogene Fläche' };
        var right = FF[n], opts = shuffle(Object.keys(FF).filter(function (x) { return FF[x] !== right; }).map(function (x) { return FF[x]; })).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 2).concat([right]);
        return { head: S('Welche Flächen hat ' + kpDer(n) + '?'), body: '<div class="card gsw">' + kpPic(k === 'quader' ? 'quaderh' : k, 1.1) + '</div>', choices: shuffle(opts).map(function (x) { return { v: x, h: S(x) }; }), cols: 1, ans: right, ansk: 'f' + n,
          why: S(kpDer(n, true) + ' hat ' + right + '.') }; }
      var st = one([['Ein Würfel hat 8 Ecken.', true], ['Eine Kugel hat eine Ecke.', false], ['Ein Quader hat 12 Kanten.', true], ['Die Spitze vom Kegel ist eine Ecke.', false],
        ['Ein Zylinder hat 3 Flächen.', true], ['Eine Pyramide hat 4 Flächen.', false], ['Ein Würfel hat 6 Flächen.', true], ['Ein Prisma hat 8 Ecken.', false]]);
      return { head: S('Stimmt das?'), body: '<div class="card g2st">' + S(st[0]) + '</div>', choices: JN, cols: 2, ans: st[1] ? 'j' : 'n', ansk: st[0], why: S(st[1] ? 'Das stimmt.' : 'Das stimmt nicht.') };
    });
  };

  function kpLab(V, la, lb, lc) {   // Kantenlängen an einen Quader schreiben
    var a0 = V['000'], a1 = V['100'], b1 = V['110'], c1 = V['001'];
    return tx((a0[0] + a1[0]) / 2, a0[1] + 40, la, 30, INK, 700) + tx((a1[0] + b1[0]) / 2 + 14, (a1[1] + b1[1]) / 2 + 26, lb, 30, INK, 700, 'start') + tx(a0[0] - 12, (a0[1] + c1[1]) / 2 + 10, lc, 30, INK, 700, 'end');
  }
  function kpWall() {   // Mauer: Spalten mit Höhen 1–3, Tiefe 1 (alle Würfel sichtbar)
    var n = R(2, 5), cells = [];
    for (var x = 0; x < n; x++) { var h = R(1, 3); for (var y = 0; y < h; y++) cells.push([x, y, 0]); }
    return cells;
  }
  GEN.kpwq = function () {
    var plan = shuffle(['w', 'w', 'w', 'k', 'k', 'n', 'n', 'b', 'b', 'b']);
    return plan.map(function (t) {
      if (t === 'w') {
        var cube = Math.random() < .45, a = R(2, 6), b = cube ? a : R(2, 6), c = cube ? a : R(2, 6);
        if (!cube && a === b && b === c) c = a + 1;
        var u = 30, q = kpQuader([120, 250], a * u * .9, b * u * .9, c * u * .9), ok = a === b && b === c;
        return { head: S('Ist dieser Quader ein Würfel?'), body: '<div class="card gsw">' + sv(460, 300, q.s + kpLab(q.V, a + ' cm', b + ' cm', c + ' cm')) + '</div>', choices: JN, cols: 2, ans: ok ? 'j' : 'n', ansk: a + '/' + b + '/' + c,
          why: S(ok ? 'Ja. Alle Kanten sind gleich lang.' : 'Nein. Beim Würfel sind alle Kanten gleich lang.') };
      }
      if (t === 'k') { var a2 = R(2, 10);
        return { kind: 'inp', head: S('Ben baut ein Kantenmodell von einem Würfel mit a = ' + a2 + ' cm. Wie viel Trinkhalm braucht er insgesamt?'), body: '<div class="card cmpq">12 · ' + a2 + ' cm = ' + nin(12 * a2) + ' cm</div>', ans: 'k' + a2,
          why: S('Ein Würfel hat 12 gleich lange Kanten: 12 · ' + a2 + ' = ' + 12 * a2 + '.') }; }
      if (t === 'n') { var dims = shuffle([R(2, 3), R(4, 5), R(6, 8)]), w = R(0, 2), L3 = ['a', 'b', 'c'];
        var q2 = kpQuader([110, 250], dims[0] * 22, dims[1] * 22, dims[2] * 22);
        return { kind: 'inp', head: S('Wie viele Kanten vom Quader sind ' + dims[w] + ' cm lang?'), body: '<div class="card gsw">' + sv(460, 300, q2.s + kpLab(q2.V, dims[0] + ' cm', dims[1] + ' cm', dims[2] + ' cm')) + '</div><div class="card cmpq">' + nin(4) + ' ' + S('Kanten') + '</div>', ans: 'n' + dims.join('') + w,
          why: S('Beim Quader sind immer 4 Kanten gleich lang.') }; }
      var cells = kpWall();
      return { kind: 'inp', head: S('Aus wie vielen Würfeln besteht die Mauer?'), body: '<div class="card gsw">' + sv(460, 300, kpCubesC(cells, 60, 460, 300)) + '</div><div class="card cmpq">' + nin(cells.length) + ' ' + S('Würfel') + '</div>', ans: 'b' + cells.join(';'),
        why: S('Zähle Spalte für Spalte. Es sind ' + cells.length + ' Würfel.') };
    });
  };

  GEN.kpwnetz = function () {
    var plan = shuffle(['ist', 'ist', 'ist', 'ist', 'geg', 'geg', 'geg', 'aug', 'aug', 'aug']);
    return plan.map(function (t) {
      if (t === 'ist') {
        var good = Math.random() < .5, cells = kpVar(good ? one(KP_NETS) : one(KP_BAD)), bx = kpBox(cells), u = Math.min(56, 400 / bx[0], 260 / bx[1]);
        var ok = !!kpFold(cells);
        return { head: S('Ist das ein Würfelnetz?'), body: '<div class="card gsw">' + sv(460, 300, kpNet([230 - bx[0] * u / 2, 150 - bx[1] * u / 2], cells, u)) + '</div>', choices: JN, cols: 2, ans: ok ? 'j' : 'n', ansk: JSON.stringify(cells),
          why: S(ok ? 'Ja. Beim Falten liegt jedes Quadrat auf einer anderen Seite.' : 'Nein. Beim Falten liegen zwei Quadrate übereinander.') };
      }
      var net = kpVar(one(KP_NETS)), b2 = kpBox(net), u2 = Math.min(60, 400 / b2[0], 260 / b2[1]), o = [230 - b2[0] * u2 / 2, 150 - b2[1] * u2 / 2];
      if (t === 'geg') {
        var g = one(net), opp = kpOpp(net, g), ans = String(net.map(function (c) { return c.join(','); }).indexOf(opp));
        function pic(res) {
          var f = {}; f[g.join(',')] = '#8a8a8a';
          if (res) { f[opp] = OKC; if (res !== ans && net[+res]) f[net[+res].join(',')] = NOC; }
          var s = kpNet(o, net, u2, f);
          net.forEach(function (c, i) { if (c.join(',') === g.join(',')) return; s += '<g class="tp" data-v="' + i + '"><rect x="' + f1(o[0] + c[0] * u2) + '" y="' + f1(o[1] + c[1] * u2) + '" width="' + f1(u2) + '" height="' + f1(u2) + '" fill="transparent"/></g>'; });
          return sv(460, 300, s, 'tapk');
        }
        var it = { kind: 'tap', head: S('Falte in Gedanken. Tippe auf das Quadrat, das beim Würfel gegenüber vom grauen Quadrat liegt.'), body: '<div class="card gsw" id="kpg">' + pic(null) + '</div>', ans: ans, ansk: JSON.stringify(net) + g,
          why: S('Gegenüberliegende Quadrate berühren sich im Netz nie. Das grüne Quadrat liegt gegenüber.') };
        it.after = function (good, got) { document.getElementById('kpg').innerHTML = pic(got || 'x'); };
        return it;
      }
      var vals = {}, fold = kpFold(net), facev = shuffle([1, 2, 3, 4, 5, 6]);   // Seiten 0/1, 2/3, 4/5 gegenüber
      var pairs = [[0, 1], [2, 3], [4, 5]], nums = shuffle([[1, 6], [2, 5], [3, 4]]);
      pairs.forEach(function (p, k) { var flip = Math.random() < .5; Object.keys(fold).forEach(function (key) { if (fold[key] === p[0]) vals[key] = nums[k][flip ? 1 : 0]; if (fold[key] === p[1]) vals[key] = nums[k][flip ? 0 : 1]; }); });
      var keys = net.map(function (c) { return c.join(','); }), q = one(keys), qv = vals[q], oq = kpOpp(net, net[keys.indexOf(q)]);
      var s2 = kpNet(o, net, u2, (function () { var f = {}; keys.forEach(function (k) { f[k] = '#fff'; }); f[q] = KPH; return f; })());
      keys.forEach(function (k, i) { if (k !== q && k !== oq) s2 += kpPips(o[0] + net[i][0] * u2, o[1] + net[i][1] * u2, u2, vals[k]); });
      s2 += kpPips(o[0] + net[keys.indexOf(oq)][0] * u2, o[1] + net[keys.indexOf(oq)][1] * u2, u2, vals[oq]);
      return { head: S('Spielwürfel: Gegenüberliegende Augen ergeben zusammen 7. Wie viele Augen gehören auf das gelbe Feld?'), body: '<div class="card gsw">' + sv(460, 300, s2) + '</div>',
        choices: [1, 2, 3, 4, 5, 6].map(function (v) { return { v: String(v), h: String(v) }; }), cols: 6, ans: String(qv), ansk: JSON.stringify(net) + q,
        why: S('Gegenüber vom gelben Feld liegen ' + vals[oq] + ' Augen. 7 – ' + vals[oq] + ' = ' + qv + '.') };
    });
  };

  function kpQRects(a, b, c) { var x0 = b; return [[x0, 0, a, b, 0], [x0, b, a, c, 1], [x0, b + c, a, b, 0], [x0, 2 * b + c, a, c, 1], [0, b, b, c, 2], [x0 + a, b, b, c, 2]]; }
  function kpRectSvg(rs, u, o, fills, skip) {
    var s = '';
    rs.forEach(function (r, k) { if (skip && skip.indexOf(k) >= 0) return; var x = o[0] + r[0] * u, y = o[1] + r[1] * u; s += kpPg([[x, y], [x + r[2] * u, y], [x + r[2] * u, y + r[3] * u], [x, y + r[3] * u]], (fills && fills[k]) || KPF, INK, 4); });
    return s;
  }
  GEN.kpqnetz = function () {
    var plan = shuffle(['ist', 'ist', 'ist', 'ist', 'paar', 'paar', 'paar', 'fehlt', 'fehlt', 'fehlt']);
    return plan.map(function (t) {
      var a = R(2, 4), b = R(1, 2), c = R(1, 3); if (a === b) a++;
      var rs = kpQRects(a, b, c), W = a + 2 * b, H = 2 * b + 2 * c, u = Math.min(50, 400 / W, 270 / H), o = [230 - W * u / 2, 150 - H * u / 2];
      if (t === 'ist') {
        var kind = one(['ok', 'ok', 'gross', 'lage', 'fuenf']), r2 = rs.map(function (r) { return r.slice(); });
        if (kind === 'gross') { r2[5][3] = c + 1; }
        if (kind === 'lage') { r2[4] = [b + a, b + c, b, c, 2]; }
        if (kind === 'fuenf') { r2 = r2.slice(0, 5); }
        var ok = kind === 'ok';
        return { head: S('Ist das ein Quadernetz?'), body: '<div class="card gsw">' + sv(460, 320, kpRectSvg(r2, u, [o[0], o[1] + 5])) + '</div>', choices: JN, cols: 2, ans: ok ? 'j' : 'n', ansk: kind + a + b + c,
          why: S(ok ? 'Ja. Es sind 6 Rechtecke, immer zwei sind gleich groß.' : (kind === 'fuenf' ? 'Nein. Es sind nur 5 Rechtecke.' : (kind === 'gross' ? 'Nein. Ein Rechteck ist zu groß.' : 'Nein. Beim Falten liegen zwei Rechtecke übereinander.'))) };
      }
      if (t === 'paar') {
        var g = R(0, 5), pr = rs[g][4], partner = rs.map(function (r, k) { return k; }).filter(function (k) { return k !== g && rs[k][4] === pr; })[0], ans = String(partner);
        function pic(res) {
          var f = {}; f[g] = '#8a8a8a';
          if (res) { f[partner] = OKC; if (res !== ans && rs[+res]) f[+res] = NOC; }
          var s = kpRectSvg(rs, u, o, f);
          rs.forEach(function (r, k) { if (k === g) return; s += '<g class="tp" data-v="' + k + '"><rect x="' + f1(o[0] + r[0] * u) + '" y="' + f1(o[1] + r[1] * u) + '" width="' + f1(r[2] * u) + '" height="' + f1(r[3] * u) + '" fill="transparent"/></g>'; });
          return sv(460, 300, s, 'tapk');
        }
        var it = { kind: 'tap', head: S('Tippe auf das Rechteck, das beim Quader gegenüber vom grauen Rechteck liegt.'), body: '<div class="card gsw" id="kpq">' + pic(null) + '</div>', ans: ans, ansk: 'p' + a + b + c + g,
          why: S('Gegenüberliegende Rechtecke sind gleich groß. Im Netz liegt eins dazwischen.') };
        it.after = function (good, got) { document.getElementById('kpq').innerHTML = pic(got || 'x'); };
        return it;
      }
      var miss = R(0, 5), mr = rs[miss], w0 = mr[2], h0 = mr[3], cand = [[w0, h0]];   // Ablenker mit deutlich anderer Form (nicht nur andere Größe)
      var far = function (p, q) { var r1 = p[0] / p[1], r2 = q[0] / q[1]; return Math.max(r1 / r2, r2 / r1) >= 1.4; };
      shuffle([[w0 * 2, h0], [w0, h0 * 2], [w0 + 1, h0], [w0, h0 + 1], [w0 + 2, h0], [w0, h0 + 2], [w0 * 3, h0], [w0, h0 * 3], [h0 + 1, h0 + 1], [w0 + 1, w0 + 1]]).forEach(function (p) {
        if (cand.length < 3 && p[0] <= 7 && p[1] <= 7 && cand.every(function (q) { return far(p, q); })) cand.push(p); });
      var VW = Math.max.apply(null, cand.map(function (r) { return r[0]; })) * 30 + 8, VH = Math.max.apply(null, cand.map(function (r) { return r[1]; })) * 30 + 8;
      var sh = shuffle([0, 1, 2]), chs = sh.map(function (k) { var r = cand[k], X = (VW - r[0] * 30) / 2, Y = (VH - r[1] * 30) / 2; return { v: String(k), h: '<svg class="gsv" viewBox="0 0 ' + VW + ' ' + VH + '" style="width:100%;max-width:' + VW + 'px;height:auto">' + kpPg([[X, Y], [X + r[0] * 30, Y], [X + r[0] * 30, Y + r[1] * 30], [X, Y + r[1] * 30]], KPF, INK, 3) + '</svg>' }; });
      return { head: S('Ein Rechteck fehlt im Quadernetz. Welches Rechteck passt?'), body: '<div class="card gsw">' + sv(460, 300, kpRectSvg(rs, u, o, null, [miss]) + '<rect x="' + f1(o[0] + mr[0] * u) + '" y="' + f1(o[1] + mr[1] * u) + '" width="' + f1(mr[2] * u) + '" height="' + f1(mr[3] * u) + '" fill="none" stroke="' + AC + '" stroke-width="3" stroke-dasharray="10 7"/>') + '</div>',
        choices: chs, cols: 3, ans: '0', ansk: 'f' + a + b + c + miss,
        why: S('Das fehlende Rechteck ist so groß wie das gegenüberliegende Rechteck.') };
    });
  };

  function kpKaro(x0, y0, nx, ny, c) {
    var p = ''; for (var i = 0; i <= nx; i++) p += 'M' + (x0 + i * c) + ' ' + y0 + 'v' + ny * c; for (var j = 0; j <= ny; j++) p += 'M' + x0 + ' ' + (y0 + j * c) + 'h' + nx * c;
    return '<rect x="' + x0 + '" y="' + y0 + '" width="' + nx * c + '" height="' + ny * c + '" fill="#fff"/><path d="' + p + '" stroke="#c9d6e4" stroke-width="1.5" fill="none"/>';
  }
  function kpSB(o, a, t, nodash, col) {   // Schrägbild Würfel: Kante a (px), Tiefe t (px)
    col = col || INK;
    var F = [[o[0], o[1]], [o[0] + a, o[1]], [o[0] + a, o[1] - a], [o[0], o[1] - a]], B = F.map(function (p) { return [p[0] + t, p[1] - t]; }), s = '';
    for (var k = 0; k < 4; k++) s += ln(F[k][0], F[k][1], F[(k + 1) % 4][0], F[(k + 1) % 4][1], col, 4);
    [1, 2, 3].forEach(function (k) { s += ln(F[k][0], F[k][1], B[k][0], B[k][1], col, 4); });
    s += ln(B[1][0], B[1][1], B[2][0], B[2][1], col, 4) + ln(B[2][0], B[2][1], B[3][0], B[3][1], col, 4);
    [[F[0], B[0]], [B[0], B[1]], [B[0], B[3]]].forEach(function (e) { s += ln(e[0][0], e[0][1], e[1][0], e[1][1], col, 3.2, nodash ? null : '10 8'); });
    return s;
  }
  GEN.kpschraeg = function () {
    var plan = shuffle(['rf', 'rf', 'rf', 'rf', 'rf', 'k', 'k', 'k', 'v', 'v']);
    return plan.map(function (t) {
      if (t === 'rf') {
        var kind = one(['ok', 'ok', 'lang', 'dash']), n = 2 * R(1, 3), c = 28, dx = R(0, 2);
        var depth = kind === 'lang' ? n * c : n * c / 2;
        if (kind === 'lang' && n === 6) { n = 4; depth = n * c; }
        var s = kpKaro(40, 20, 13, 10, c) + kpSB([40 + (1 + dx) * c, 20 + 9 * c], n * c, depth, kind === 'dash');
        var ok = kind === 'ok';
        return { head: S('Ist das Schrägbild vom Würfel richtig gezeichnet?'), body: '<div class="card gsw">' + sv(460, 320, s) + '</div>', choices: [{ v: 'r', h: S('richtig') }, { v: 'f', h: S('falsch') }], cols: 2, ans: ok ? 'r' : 'f', ansk: kind + n + dx,
          why: S(ok ? 'Richtig: schräge Kanten halb so lang, verdeckte Kanten gestrichelt.' : (kind === 'lang' ? 'Falsch: Die schrägen Kanten müssen halb so lang sein.' : 'Falsch: Die verdeckten Kanten müssen gestrichelt sein.')) };
      }
      if (t === 'k') { var cm = R(1, 6);
        return { kind: 'inp', head: S('Eine Kante nach hinten ist ' + cm + ' cm lang. Wie viele Kästchen zeichnest du im Schrägbild schräg?'), body: '<div class="card cmpq">' + nin(cm) + ' ' + S('Kästchen') + '</div>', ans: 'k' + cm,
          why: S(cm + ' cm sind ' + 2 * cm + ' Kästchen. Nach hinten nur halb so lang: ' + cm + ' Kästchen schräg.') }; }
      var w = one([['Wie viele Kanten zeichnest du beim Würfel gestrichelt?', 3, 'Es sind 3 verdeckte Kanten. Sie beginnen an der Ecke hinten unten links.', 'Kanten', 1],
        ['Wie viele Kanten siehst du im Schrägbild vom Würfel (durchgezogen)?', 9, '12 Kanten hat der Würfel. 3 sind verdeckt: 12 – 3 = 9.', 'Kanten', 1],
        ['Die Kanten von einem Würfel sind 2 cm lang. Wie viele Kästchen lang zeichnest du die vordere Kante?', 4, '1 cm sind 2 Kästchen. 2 cm sind 4 Kästchen.', 'Kästchen', 0],
        ['Ein Quader ist 3 cm lang. Wie viele Kästchen lang zeichnest du die vordere Kante?', 6, '1 cm sind 2 Kästchen. 3 cm sind 6 Kästchen.', 'Kästchen', 0]]);
      return { kind: 'inp', head: S(w[0]), body: (w[4] ? '<div class="card gsw">' + sv(460, 300, kpKaro(40, 15, 13, 10, 28) + kpSB([40 + 3 * 28, 15 + 9 * 28], 4 * 28, 2 * 28)) + '</div>' : '') + '<div class="card cmpq">' + nin(w[1]) + ' ' + S(w[3]) + '</div>', ans: w[0],
        why: S(w[2]) };
    });
  };

  GEN.kpober = function () {
    var plan = shuffle(['w', 'w', 'w', 'wf', 'wf', 'q', 'q', 'q', 'qn', 'qn']);
    return plan.map(function (t) {
      if (t === 'w') { var a = one([1, 2, 3, 4, 5, 6, 10]);
        return { kind: 'inp', head: S('Ein Würfel hat a = ' + a + ' cm. Wie groß ist seine Oberfläche?'), body: '<div class="card gsw">' + sv(460, 280, kpQuader([150, 250], 140, 140, 140).s) + '</div><div class="card cmpq">O = ' + nin(6 * a * a) + ' cm²</div>', ans: 'w' + a,
          why: S('Eine Fläche: ' + a + ' · ' + a + ' = ' + a * a + ' cm². O = 6 · ' + a * a + ' = ' + 6 * a * a + ' cm².') }; }
      if (t === 'wf') { var f = one([4, 9, 16, 25, 36]);
        return { kind: 'inp', head: S('Eine Fläche von einem Würfel ist ' + f + ' cm² groß. Wie groß ist die Oberfläche?'), body: '<div class="card cmpq">O = ' + nin(6 * f) + ' cm²</div>', ans: 'f' + f,
          why: S('Der Würfel hat 6 gleich große Flächen: 6 · ' + f + ' = ' + 6 * f + ' cm².') }; }
      var a2 = R(2, 5), b = R(1, 4), c = R(1, 3), O = 2 * (a2 * b + a2 * c + b * c);
      if (t === 'q') {
        var q = kpQuader([110, 250], a2 * 40, b * 40, c * 40);
        return { kind: 'inp', head: S('Rechne die Oberfläche vom Quader aus.'), body: '<div class="card gsw">' + sv(460, 300, q.s + kpLab(q.V, a2 + ' cm', b + ' cm', c + ' cm')) + '</div><div class="card cmpq">O = ' + nin(O) + ' cm²</div>', ans: 'q' + a2 + b + c,
          why: S('2 · ' + a2 + ' · ' + b + ' + 2 · ' + a2 + ' · ' + c + ' + 2 · ' + b + ' · ' + c + ' = ' + 2 * a2 * b + ' + ' + 2 * a2 * c + ' + ' + 2 * b * c + ' = ' + O + ' cm².') };
      }
      var rs = kpQRects(a2, b, c), W = a2 + 2 * b, H = 2 * b + 2 * c, u = Math.min(56, 400 / W, 280 / H), o = [230 - W * u / 2, 150 - H * u / 2];
      var s = kpRectSvg(rs, u, o);
      var fit = function (t, wd, ht) { var f = Math.min(22, ht * .7); while (f > 14 && t.length * f * .62 > wd - 8) f--; return t.length * f * .62 > wd - 8 ? 0 : f; };
      var unit = rs.every(function (r) { return fit(r[2] * r[3] + ' cm²', r[2] * u, r[3] * u) >= 17; });
      rs.forEach(function (r) { var cx = o[0] + (r[0] + r[2] / 2) * u, cy = o[1] + (r[1] + r[3] / 2) * u, lb = r[2] * r[3] + (unit ? ' cm²' : ''), fs = fit(lb, r[2] * u, r[3] * u) || 14; s += tx(cx, cy + fs * .36, lb, fs, INK, 700); });
      return { kind: 'inp', head: S(unit ? 'Die Flächen im Netz sind schon ausgerechnet. Wie groß ist die Oberfläche?' : 'Die Flächen im Netz sind schon ausgerechnet (in cm²). Wie groß ist die Oberfläche?'), body: '<div class="card gsw">' + sv(460, 300, s) + '</div><div class="card cmpq">O = ' + nin(O) + ' cm²</div>', ans: 'n' + a2 + b + c,
        why: S('Addiere alle 6 Flächen: O = ' + O + ' cm².') };
    });
  };

  GEN.kpvol = function () {
    var plan = shuffle(['z', 'z', 'z', 's', 's', 'v', 'v', 'v', 'w', 'w', 'g']);
    return plan.map(function (t) {
      if (t === 'z') { var cells = kpWall();
        return { kind: 'inp', head: S('Jeder Würfel ist 1 cm³ groß. Wie groß ist das Volumen?'), body: '<div class="card gsw">' + sv(460, 300, kpCubesC(cells, 60, 460, 300)) + '</div><div class="card cmpq">V = ' + nin(cells.length) + ' cm³</div>', ans: 'z' + cells.join(';'),
          why: S('Zähle die Würfel: ' + cells.length + ' Würfel, also ' + cells.length + ' cm³.') }; }
      var a = R(2, 5), b = R(1, 3), c = R(1, 3);
      if (t === 's') {
        var u = Math.min(56, 300 / (a + b / 2), 230 / (c + b / 2));
        return { kind: 'inp', head: S('Der Quader besteht aus Würfeln mit 1 cm³. Rechne Schicht für Schicht. Wie groß ist das Volumen?'), body: '<div class="card gsw">' + sv(460, 300, kpGridQ([230 - (a * u + b * u / 2) / 2, 150 + (c * u + b * u / 2) / 2], a, b, c, u)) + '</div><div class="card cmpq">V = ' + nin(a * b * c) + ' cm³</div>', ans: 's' + a + b + c,
          why: S('Eine Schicht: ' + a + ' · ' + b + ' = ' + a * b + ' Würfel. ' + c + ' Schichten: ' + a * b + ' · ' + c + ' = ' + a * b * c + '.') };
      }
      if (t === 'v') { var A = R(2, 10), Bq = R(2, 6), Cq = R(1, 5);
        return { kind: 'inp', head: S('Ein Quader ist ' + A + ' cm lang, ' + Bq + ' cm breit und ' + Cq + ' cm hoch. Wie groß ist das Volumen?'), body: '<div class="card cmpq">V = ' + nin(A * Bq * Cq) + ' cm³</div>', ans: 'v' + A + Bq + Cq,
          why: S('V = a · b · c = ' + A + ' · ' + Bq + ' · ' + Cq + ' = ' + A * Bq * Cq + ' cm³.') }; }
      if (t === 'w') { var w = one([1, 2, 3, 4, 5, 10]);
        return { kind: 'inp', head: S('Ein Würfel hat a = ' + w + ' cm. Wie groß ist sein Volumen?'), body: '<div class="card cmpq">V = ' + nin(w * w * w) + ' cm³</div>', ans: 'w' + w,
          why: S('V = a · a · a = ' + w + ' · ' + w + ' · ' + w + ' = ' + w * w * w + ' cm³.') }; }
      var P1 = [R(2, 6), R(2, 4), R(1, 3)], P2 = [R(2, 6), R(2, 4), R(1, 3)], v1 = P1[0] * P1[1] * P1[2], v2 = P2[0] * P2[1] * P2[2];
      return { head: S('Welche Schachtel hat das größere Volumen?'), body: '<div class="card g2st">A: ' + P1.join(' cm · ') + ' cm<br>B: ' + P2.join(' cm · ') + ' cm</div>',
        choices: [{ v: 'A', h: 'A' }, { v: 'B', h: 'B' }, { v: 'g', h: S('gleich') }], cols: 3, ans: v1 > v2 ? 'A' : (v2 > v1 ? 'B' : 'g'), ansk: P1.join('') + P2.join(''),
        why: S('A: ' + v1 + ' cm³, B: ' + v2 + ' cm³.') };
    });
  };
  TIP.kpkoerper = S('Würfel und Quader haben Ecken. Kugel, Zylinder und Kegel haben eine gebogene Fläche und können rollen.');
  TIP.kpekf = S('Mache in Gedanken an jede Ecke einen Punkt. Zähle die gestrichelten Kanten hinten mit.');
  TIP.kpwq = S('Beim Würfel sind alle Kanten gleich lang. Beim Quader sind immer 4 Kanten gleich lang.');
  TIP.kpwnetz = S('Ein Würfelnetz hat 6 Quadrate. Gegenüberliegende Quadrate berühren sich nie. Gegenüberliegende Augen ergeben 7.');
  TIP.kpqnetz = S('Ein Quadernetz hat 6 Rechtecke. Immer zwei gegenüberliegende Rechtecke sind gleich groß.');
  TIP.kpschraeg = S('Kanten nach hinten: schräg durch die Kästchen und halb so lang. Verdeckte Kanten: gestrichelt.');
  TIP.kpober = S('Würfel: O = 6 · a · a. Quader: O = 2 · a · b + 2 · a · c + 2 · b · c.');
  TIP.kpvol = S('V = a · b · c (Länge mal Breite mal Höhe). Beim Würfel: V = a · a · a.');

  // ------------------------------------------------------------ Tipps (Glühbirne): für jede Übung ein Tipp, einzelne Aufgaben haben eigene
  TIP = Object.assign({
    runden: S('Schaue auf die Ziffer rechts neben dem Punkt. Bei 0, 1, 2, 3, 4 rundest du ab. Bei 5, 6, 7, 8, 9 rundest du auf.'),
    zahlwort: S('Suche zuerst das Wort „tausend“. Was davor steht, sind die Tausender. Was danach steht, sind H, Z und E.'),
    wert: S('Lege die Zahl in Gedanken in die Stellenwerttafel: E, Z, H, T, ZT, HT. Von rechts nach links.'),
    nachbar: S('Nachfolger: 1 mehr. Vorgänger: 1 weniger. Nachbarzehner enden mit 0, Nachbarhunderter mit 00.'),
    zstrahl: S('Wie groß ist ein Schritt? Schaue zwei Zahlen am Strahl an und zähle die Striche dazwischen.'),
    vergl: S('Vergleiche zuerst die Anzahl der Stellen. Sind sie gleich, vergleiche von vorne Ziffer für Ziffer.'),
    begriffe: S('Plus: Summand + Summand = Summe. Minus: Minuend – Subtrahend = Differenz.'),
    kopf: S('Rechne in Schritten: Zerlege die zweite Zahl, zum Beispiel erst bis zum nächsten Zehner.'),
    luecke: S('Nutze die Umkehraufgabe: Aus plus wird minus, aus minus wird plus.'),
    add: TADD, sub: TSUB,
    ueb: S('Runde beide Zahlen auf Hunderter. Rechne dann mit den gerundeten Zahlen.'),
    sach: S('Lies die Frage genau. Kommt etwas dazu (plus) oder geht etwas weg (minus)?'),
    klammern: S('Was in der Klammer steht, rechnest du zuerst. Suche Zahlen, die zusammen 10 oder 100 ergeben.'),
    mdbegriffe: S('Mal: Faktor · Faktor = Produkt. Geteilt: Dividend : Divisor = Quotient.'),
    einmaleins: S('Nutze eine leichte Aufgabe: 5 · 7 = 35, dann ist 6 · 7 = 35 + 7.'),
    mdluecke: S('Nutze die Umkehraufgabe: Aus mal wird geteilt, aus geteilt wird mal.'),
    regeln: S('Punkt vor Strich: Rechne mal und geteilt zuerst. Klammern immer ganz zuerst.'),
    mdueb: S('Runde die große Zahl auf ihre erste Stelle. Rechne dann im Kopf.'),
    halb: S('Zerlege die große Zahl in H, Z und E. Multipliziere jeden Teil. Addiere am Schluss.'),
    mul1: TMUL, mul2: TMUL2, div: TDIV,
    mdsach: S('Gleich viele mehrmals: mal. Gerecht verteilen: geteilt.'),
    linien: S('Gerade: kein Anfang, kein Ende. Strecke: Anfang und Ende. Strahl: ein Anfang, kein Ende.'),
    messen: S('Lege die 0 vom Lineal genau an den Anfang der Strecke.'),
    senkpar: S('Senkrecht: Die Linien bilden einen rechten Winkel. Parallel: Sie haben überall den gleichen Abstand.'),
    koord: S('Erst nach rechts, dann nach oben. Die erste Zahl sagt, wie weit nach rechts.'),
    symm: S('Stell dir vor, du faltest die Figur an der Achse. Liegen beide Hälften genau aufeinander?'),
    spiegeln: S('Zähle die Kästchen vom Punkt bis zur Achse. Auf der anderen Seite gehst du genauso viele Kästchen weiter.'),
    schatz: S('Erst nach rechts, dann nach oben. Zähle die Kästchen genau.'),
    ufrechteck: S('Rechteck: 4 rechte Winkel, gegenüberliegende Seiten gleich lang. Quadrat: alle 4 Seiten gleich lang.'),
    ufumfang: S('Fahre mit dem Finger einmal am Rand entlang und zähle jede Kästchenseite.'),
    ufurechnen: S('Umfang: Addiere alle vier Seiten. Beim Rechteck: Länge + Breite + Länge + Breite.'),
    ufflaeche: S('Zähle alle Kästchen in der Figur. Ein Kästchen ist 1 cm².'),
    ufeinheiten: S('Kleine Flächen wie ein Heft misst du in cm². Große Flächen wie ein Zimmer misst du in m².'),
    ufarechnen: S('Flächeninhalt: Länge mal Breite. A = a · b.'),
    ufunterschied: S('Umfang: einmal um den Rand herum. Flächeninhalt: die ganze Fläche innen.'),
    ufsach: S('Geht es um den Rand (Zaun, Band) oder um die Fläche (Rasen, Fliesen)?'),
    grgeld: S('1 € = 100 ct. Zähle erst die Euro, dann die Cent.'),
    grlaengen: S('1 cm = 10 mm. 1 m = 100 cm. 1 km = 1 000 m.'),
    grlumrechnen: S('Von der großen zur kleinen Einheit: Die Zahl wird größer. 1 m = 100 cm, 1 cm = 10 mm, 1 km = 1 000 m.'),
    grlrechnen: S('Wandle zuerst beide Längen in die gleiche Einheit um. Rechne dann.'),
    grmassen: S('1 kg = 1 000 g. 1 t = 1 000 kg.'),
    gruhr: S('Der kurze Zeiger zeigt die Stunden, der lange Zeiger die Minuten. Am Nachmittag zählst du 12 dazu.'),
    grzeit: S('1 h = 60 min. 1 min = 60 s. 1 Tag = 24 h.'),
    grsach: S('Lies genau: Was kostet alles zusammen? Wie viel Geld bekommst du zurück?'),
    vok: 'Tippe auf „Anhören“. Dann hörst du das Wort noch einmal.'
  }, TIP);
  if (D.tip) TIP.bank = D.tip;
  TIP.tvviel = S('Die Vielfachen einer Zahl sind die Ergebnisse ihrer Einmaleinsreihe: 1-mal, 2-mal, 3-mal … die Zahl.');
  TIP.tvteiler = S('Suche Malaufgaben mit dem Ergebnis. Jede Zahl aus einer Malaufgabe ist ein Teiler.');
  TIP.tvregeln = S('Schaue auf die letzte Ziffer. Durch 2: 0, 2, 4, 6 oder 8. Durch 5: 0 oder 5. Durch 10: 0.');
  TIP.tvprim = S('Eine Primzahl hat genau zwei Teiler: die 1 und sich selbst. Die 1 ist keine Primzahl.');
  TIP.tvkgv = S('Schreibe die Vielfachen beider Zahlen auf. Das kgV ist die kleinste Zahl, die in beiden Reihen vorkommt.');
  TIP.tvggt = S('Schreibe die Teiler beider Zahlen auf. Der ggT ist die größte Zahl, die in beiden Listen vorkommt.');
  TIP.tv1x1 = S('Sage die Einmaleinsreihe leise auf, bis du beim Ergebnis bist.');
  TIP.tv1x1b = S('Denke an die Malaufgabe: 42 : 7 = 6, denn 6 · 7 = 42.');
  TIP.brerkennen = S('Zähle die gefärbten Teile: Das ist der Zähler. Zähle alle gleich großen Teile: Das ist der Nenner.');
  TIP.brdarst = S('Der Nenner sagt, in wie viele gleich große Teile das Ganze geteilt ist. Der Zähler sagt, wie viele Teile du färbst.');
  TIP.brzstrahl = S('Zähle die Teile von 0 bis 1: Das ist der Nenner. Zähle dann ab der 0 bis zum Strich: Das ist der Zähler.');
  TIP.brteile = S('Erst durch den Nenner, dann mal den Zähler. ') + FR(3, 4) + S(' von 12: 12 : 4 = 3 und 3 · 3 = 9.');
  TIP.brerw = S('Erweitern: Nimm den Zähler und den Nenner mal dieselbe Zahl.');
  TIP.brkurz = S('Kürzen: Teile den Zähler und den Nenner durch dieselbe Zahl.');

  // ------------------------------------------------------------ Ablauf
  var set, i, ok, rep = false, wrongs = [], tipOpen = false;
  function head(it) {
    var tp = tipOf(it);
    return '<div class="qh"><p class="cnt">' + (rep ? L.rep2 + ': ' : '') + L.task + ' ' + (i + 1) + ' ' + L.of + ' ' + set.length + '</p>' +
      (tp ? '<button class="tipb' + (tipOpen ? ' on' : '') + '" type="button">' + L.icTip + '<span>' + L.tip + '</span></button>' : '') + '</div>' +
      '<p class="rq">' + it.head + '</p>' + (tp ? '<div class="tipx"' + (tipOpen ? '' : ' hidden') + '>' + L.icTip + '<span>' + tp + '</span></div>' : '');
  }
  app.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.tipb') : null; if (!b) return;
    tipOpen = !tipOpen; var t = app.querySelector('.tipx'); if (t) t.hidden = !tipOpen; b.classList.toggle('on', tipOpen);
  });
  function show() {
    var it = set[i]; tipOpen = false; keyFn = null;
    if (it.kind === 'inp') return inpTask(it);
    if (it.kind === 'geld') return geldTask(it);
    if (it.kind === 'uhr') return uhrTask(it);
    if (it.kind === 'mark') return markTask(it);
    if (it.kind === 'order') return order(it);
    if (it.kind === 'sort') return sortTask(it);
    if (it.kind === 'match') return matchTask(it);
    if (it.kind === 'pick') return pickTask(it);
    if (it.kind === 'paint') return paintTask(it);
    app.innerHTML = head(it) + (it.body || '') +
      (it.kind === 'tap' ? '' : '<div class="rch c' + (it.cols || it.choices.length) + (it.imgc ? ' imgc' : '') + '">' + it.choices.map(function (c) {
        return '<button class="ch rc" type="button" data-v="' + c.v + '">' + c.h + '</button>';
      }).join('') + '</div>') + '<div id="fb"></div>';
    var bs = [].slice.call(app.querySelectorAll('.rc, .tp')), fin = false;
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        if (fin) return; fin = true;
        var v = b.getAttribute('data-v'), good = v === String(it.ans);
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
        if (k) slots += '<span class="olt">' + (it.sep || '&lt;') + '</span>';
        var v = placed[k];
        slots += '<button class="os' + (v !== undefined ? ' f' : '') + '" type="button" data-k="' + k + '"' + (fin ? ' disabled' : '') + '>' + (v !== undefined ? (it.lab ? it.lab[v] : fmt(v)) : '') + '</button>';
      }
      app.innerHTML = head(it) + '<div class="osl">' + slots + '</div><div class="rch c2 opool">' + it.nums.map(function (v) {
        return '<button class="ch rc" type="button" data-v="' + v + '"' + (placed.indexOf(v) >= 0 || fin ? ' disabled' : '') + '>' + (it.lab ? it.lab[v] : fmt(v)) + '</button>';
      }).join('') + '</div><div id="fb"></div>';
      [].slice.call(app.querySelectorAll('.opool .rc')).forEach(function (b) {
        b.onclick = function () {
          if (fin) return;
          placed.push(+b.getAttribute('data-v'));
          if (placed.length === it.nums.length) {
            fin = true;
            var good = placed.every(function (v, k) { return v === it.ans[k]; });
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
    if (good) ok++; else wrongs.push(set[i]);
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
  // Am Ende: falsch gelöste Aufgaben noch einmal üben (so oft, bis alle richtig sind) oder neue Aufgaben
  function end() {
    var w = wrongs.slice(); keyFn = null;
    app.innerHTML = '<div class="done">' + L.done + ' ' + L.first + ' ' + ok + ' ' + L.of + ' ' + set.length + '</div><div class="endb">' +
      (w.length ? '<button class="btn pri" id="rp" type="button">' + L.icRep + '<span>' + L.rep + '</span></button>' : '') +
      '<button class="btn' + (w.length ? '' : ' pri') + '" id="ag" type="button">' + L.icAgain + '<span>' + L.again + '</span></button></div>';
    document.getElementById('ag').onclick = start;
    if (w.length) document.getElementById('rp').onclick = function () { run(w, true); };
    top();
  }
  function run(s, r) { set = s; rep = r; i = 0; ok = 0; wrongs = []; show(); }
  var NSET = 20;
  function ikey(it) {
    var ch = (it.choices || []).map(function (c) { return String(c.v) + ':' + String(c.h); }).sort().join(',');
    var ex = JSON.stringify([it.nums || '', it.left || '', it.lab || '', it.cats || '', it.vals || '',
      (it.items || []).map(function (x) { return String(x.h) + '>' + x.c; }).sort()]);
    return [it.kind || '', it.head || '', it.body || '', it.s || '', String(it.ans), ch, ex].join('|');
  }
  function build() {
    var out = [], seen = {}, t = 0;
    while (out.length < NSET && t < 12) {
      (GEN[D.type]() || []).forEach(function (it) { var k = ikey(it); if (out.length < NSET && !seen[k]) { seen[k] = 1; out.push(it); } });
      t++;
    }
    return out;
  }
  function start() { run(build(), false); }
  start();
  window.__mt = { set: function () { return set; }, i: function () { return i; }, rep: function () { return rep; }, go: function (k) { i = k; show(); }, auto: function (g) { var it = set[i]; if (it.auto) it.auto(g); } };
})();
