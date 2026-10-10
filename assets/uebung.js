/* Übungs-Baukasten: Typen gk (Groß oder klein?), mark (Wörter antippen), sort (Wortarten), mc (Fragen).
   Daten und Beschriftungen (Silbenschrift) stehen als JSON in der Seite. */
(function () {
  var D = JSON.parse(document.getElementById('data').textContent);
  var L = D.labels;
  var app = document.getElementById('app');

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function finish(first, total) {
    var d = el('div', 'done', L.done + (first == null ? '' : '<br>' + L.first + ' <b>' + first + '</b> ' + L.of + ' ' + total + '.'));
    var b = el('button', 'btn', L.icAgain + '<span>' + L.again + '</span>'); b.type = 'button';
    b.onclick = function () { location.reload(); };
    d.appendChild(el('div', null, '')).appendChild(b);
    app.appendChild(d);
    d.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- Groß oder klein? ---------- */
  function gk() {
    var solved = 0, first = 0;
    D.items.forEach(function (it, i) {
      var r = el('div', 'row');
      var s = el('div', 's', '<b>' + (i + 1) + '</b>&nbsp; ' + it.s);
      var gapEl = s.querySelector('.gap');
      var ch = el('div', 'choices'), fb = el('div', 'fb');
      var tries = 0;
      [it.U, it.l].forEach(function (letter) {
        var b = el('button', 'ch', letter); b.type = 'button';
        b.onclick = function () {
          tries++;
          if (letter === it.ans) {
            b.classList.add('ok'); gapEl.textContent = letter; gapEl.classList.add('ok');
            fb.className = 'fb okt'; fb.innerHTML = L.right + ' ' + it.why;
            ch.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
            solved++; if (tries === 1) first++;
            if (solved === D.items.length) finish(first, D.items.length);
          } else {
            b.classList.add('no'); b.disabled = true;
            fb.className = 'fb not'; fb.innerHTML = L.wrong + ' ' + D.tipWrong;
          }
        };
        ch.appendChild(b);
      });
      r.appendChild(s); r.appendChild(ch); r.appendChild(fb); app.appendChild(r);
    });
  }

  /* ---------- Wörter antippen (großschreiben) ---------- */
  function mark() {
    var box = el('div', 'text'), toks = [];
    D.tokens.forEach(function (t) {
      if (t.sep != null) { box.appendChild(document.createTextNode(t.sep)); return; }
      var s = el('span', 'tok', t.lock ? t.H : t.h);
      s.dataset.up = t.lock ? '1' : '0';
      if (t.lock) { s.classList.add('lock'); if (t.t) s.classList.add('up'); }
      else s.onclick = function () {
        var up = s.dataset.up === '1';
        s.dataset.up = up ? '0' : '1';
        s.innerHTML = up ? t.h : t.H;
        s.classList.toggle('up', !up);
        s.classList.remove('ok', 'no', 'miss');
      };
      box.appendChild(s); if (!t.lock) toks.push({ s: s, t: t });
    });
    app.appendChild(box);
    var res = el('div', 'score', ''), tries = 0;
    var b = el('button', 'btn pri', L.icCheck + '<span>' + L.check + '</span>'); b.type = 'button';
    b.style.marginTop = '16px';
    b.onclick = function () {
      tries++;
      var right = 0, wrong = 0, miss = 0, n = 0;
      toks.forEach(function (o) {
        var up = o.s.dataset.up === '1';
        o.s.classList.remove('ok', 'no', 'miss');
        if (o.t.t) { n++; if (up) { right++; o.s.classList.add('ok'); } else { miss++; o.s.classList.add('miss'); } }
        else if (up) { wrong++; o.s.classList.add('no'); }
      });
      res.innerHTML = L.found + ' <b>' + right + '</b> ' + L.of + ' ' + n + '.' +
        (wrong ? ' ' + L.toomuch + ' <b>' + wrong + '</b>' : '') + (miss || wrong ? '<br>' + L.retry : '');
      if (!miss && !wrong) { b.disabled = true; finish(tries === 1 ? n : null, n); }
    };
    app.appendChild(b); app.appendChild(res);
  }

  /* ---------- Wortarten sortieren ---------- */
  function sort() {
    var words = shuffle(D.words), i = 0, first = 0, tries = 0;
    var card = el('div', 'card'), cats = el('div', 'cats'), fb = el('div', 'fb'), bins = el('div', 'bins'), binEl = {};
    var cnt = el('div', 'fb', '');
    Object.keys(D.cats).forEach(function (k) {
      var b = el('button', 'cat ' + k, '<u>' + D.cats[k] + '</u>'); b.type = 'button';
      b.onclick = function () {
        var w = words[i]; if (!w) return;
        tries++;
        if (w.c === k) {
          if (tries === 1) first++;
          binEl[k].appendChild(el('span', 'x', w.h + ','));
          fb.className = 'fb okt'; fb.innerHTML = L.right + ' ' + D.why[k].replace('#', w.h);
          i++; tries = 0; show();
        } else {
          b.classList.add('no'); setTimeout(function () { b.classList.remove('no'); }, 700);
          fb.className = 'fb not'; fb.innerHTML = L.wrong + ' ' + D.tipWrong;
        }
      };
      cats.appendChild(b);
      var bin = el('div', 'bin', '<b>' + D.cats[k] + '</b>'); binEl[k] = bin; bins.appendChild(bin);
    });
    function show() {
      if (i >= words.length) { card.innerHTML = '✓'; cats.querySelectorAll('button').forEach(function (x) { x.disabled = true; }); finish(first, words.length); return; }
      card.innerHTML = words[i].h;
      cnt.innerHTML = L.word + ' ' + (i + 1) + ' ' + L.of + ' ' + words.length;
    }
    app.appendChild(cnt); app.appendChild(card); app.appendChild(cats); app.appendChild(fb); app.appendChild(bins);
    show();
  }

  /* ---------- Fragen zum Text (mit Hör-Track) ---------- */
  function mini(tr) {
    var m = el('div', 'mini');
    var b = el('button', 'btn pri', L.icPlay + '<span>' + L.play + '</span>'); b.type = 'button';
    var info = el('div', null, L.icHead + ' <b>' + L.track + ' ' + tr.n + '</b> ' + tr.ts);
    var a = new Audio(); a.preload = 'none'; a.src = D.root + tr.a;
    b.onclick = function () { if (a.paused) a.play(); else a.pause(); };
    a.onplay = a.onpause = function () { b.innerHTML = a.paused ? L.icPlay + '<span>' + L.play + '</span>' : L.icPause + '<span>' + L.pause + '</span>'; };
    m.appendChild(b); m.appendChild(info); app.appendChild(m);
  }
  function mc() {
    if (D.track) mini(D.track);
    if (D.read) app.appendChild(el('p', 'tip', D.read));
    var solved = 0, first = 0;
    D.qs.forEach(function (q, qi) {
      var box = el('div', 'q'); box.appendChild(el('div', 'qt', (qi + 1) + '&nbsp; ' + q.q));
      var ch = el('div', 'choices'), fb = el('div', 'fb'), tries = 0;
      shuffle(q.o.map(function (o, k) { return { h: o, k: k }; })).forEach(function (o) {
        var b = el('button', 'ch wide', o.h); b.type = 'button';
        b.onclick = function () {
          tries++;
          if (o.k === 0) {
            b.classList.add('ok'); ch.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
            fb.className = 'fb okt'; fb.innerHTML = L.right;
            solved++; if (tries === 1) first++;
            if (solved === D.qs.length) finish(first, D.qs.length);
          } else { b.classList.add('no'); b.disabled = true; fb.className = 'fb not'; fb.innerHTML = L.wrong + ' ' + D.tipWrong; }
        };
        ch.appendChild(b);
      });
      box.appendChild(ch); box.appendChild(fb); app.appendChild(box);
    });
  }

  ({ gk: gk, mark: mark, sort: sort, mc: mc })[D.type]();
})();
