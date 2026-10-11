/* Abspielseite: t/?<id>  (Daten in tracks.js, Beschriftungen in Silbenschrift aus dem Seitenkopf).
   Oben (über dem Strich): Titel des Heftes. Im Kasten: Kopfhörer + Nummer, darunter Titel des Textes bzw. der Aufgabe. */
(function () {
  var L = JSON.parse(document.getElementById('labels').textContent);
  var app = document.getElementById('app');
  var id = (location.search || '').replace(/^\?/, '').split('&')[0].trim();
  var t = window.TRACKS && window.TRACKS[id];

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), x = Math.floor(s % 60);
    return m + ':' + (x < 10 ? '0' : '') + x;
  }

  if (!t) {
    app.innerHTML = '<div class="msg">' + L.notfound + '</div>';
    return;
  }

  var nn = (t.n < 10 ? '0' : '') + t.n;
  document.body.className = t.f === 'Englisch' ? 'f-en' : (t.f === 'Mathematik' ? 'f-ma' : 'f-de');
  document.title = t.hp + ' · ' + nn + ' ' + t.p;
  var hd = document.querySelector('header h1');
  if (hd) hd.innerHTML = t.hs;

  app.innerHTML =
    '<div class="player">' +
    '<div class="trk">' + L.icHead + '<span>' + nn + '</span></div>' +
    '<h2 class="ttl">' + t.ts + '</h2>' +
    '<button class="play" id="pl" type="button">' + L.icPlay + '<span>' + L.play + '</span></button>' +
    '<div class="bar"><input id="pos" type="range" min="0" max="1000" value="0" aria-label="Position">' +
    '<span class="time" id="tm">0:00 / –:––</span></div>' +
    '<div class="ctl">' +
    '<button class="btn" id="rw" type="button">' + L.icRw + '<span>' + L.back10 + '</span></button>' +
    '<button class="btn" id="ff" type="button">' + L.icFf + '<span>' + L.fwd10 + '</span></button>' +
    '<button class="btn" id="sl" type="button">' + L.icSlow + '<span>' + L.slow + '</span></button>' +
    '</div>' +
    (t.k === 'diktat' ? '<p class="note">' + L.icPen + '<span>' + L.dnote + '</span></p>' : '') +
    '<div id="err"></div>' +
    '</div>';

  var a = new Audio();
  a.preload = 'metadata';
  a.src = '../' + t.a;
  var pl = document.getElementById('pl'), pos = document.getElementById('pos'), tm = document.getElementById('tm');
  var seeking = false;

  function ui() {
    pl.innerHTML = a.paused ? L.icPlay + '<span>' + L.play + '</span>' : L.icPause + '<span>' + L.pause + '</span>';
  }
  function upd() {
    if (!seeking && a.duration) pos.value = Math.round(a.currentTime / a.duration * 1000);
    tm.textContent = fmt(a.currentTime) + ' / ' + (a.duration ? fmt(a.duration) : '–:––');
  }
  pl.onclick = function () { if (a.paused) a.play(); else a.pause(); };
  a.onplay = a.onpause = ui;
  a.onended = function () { ui(); };
  a.ontimeupdate = upd; a.onloadedmetadata = upd;
  pos.oninput = function () { seeking = true; if (a.duration) tm.textContent = fmt(pos.value / 1000 * a.duration) + ' / ' + fmt(a.duration); };
  pos.onchange = function () { if (a.duration) a.currentTime = pos.value / 1000 * a.duration; seeking = false; };
  document.getElementById('rw').onclick = function () { a.currentTime = Math.max(0, a.currentTime - 10); upd(); };
  document.getElementById('ff').onclick = function () { if (a.duration) a.currentTime = Math.min(a.duration, a.currentTime + 10); upd(); };
  var sl = document.getElementById('sl');
  sl.onclick = function () {
    var slow = a.playbackRate === 1;
    a.playbackRate = slow ? 0.85 : 1;
    sl.classList.toggle('on', slow);
  };
  a.onerror = function () {
    document.getElementById('err').innerHTML = '<div class="msg">' + L.soon + '</div>';
    pl.disabled = true; pl.style.opacity = '.4';
  };
  if ('mediaSession' in navigator && window.MediaMetadata) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: nn + ' ' + t.p, artist: 'Lerncampus Wascherde', album: t.hp });
  }
})();
