/* Nederlands — a pocket Dutch trainer.
   Views render into #view; a session takes the whole screen. */
(function () {
  'use strict';

  var DECKS = window.DECKS;
  var GRAMMAR = window.GRAMMAR;
  var ALL = DECKS;

  var view = document.getElementById('view');
  var tabbar = document.getElementById('tabbar');
  var topbar = document.getElementById('topbar');
  var route = { name: 'today', id: null };
  var installEvent = null;

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function deckById(id) {
    for (var i = 0; i < DECKS.length; i++) if (DECKS[i].id === id) return DECKS[i];
    return null;
  }

  function resolve(key) {
    var p = key.split(':');
    var d = deckById(p[0]);
    if (!d) return null;
    var item = d.items[Number(p[1])];
    if (!item) return null;
    return { key: key, deck: d, item: item, st: Store.card(key) };
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 6) return 'Goedenacht';
    if (h < 12) return 'Goedemorgen';
    if (h < 18) return 'Goedemiddag';
    return 'Goedenavond';
  }

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2200);
  }

  function speak(text) {
    if (!Speech.say(text)) toast('Dit apparaat heeft geen stem beschikbaar.');
  }

  function speakerBtn(text, size) {
    return '<button class="spk' + (size === 'lg' ? ' spk-lg' : '') +
      '" data-act="speak" data-text="' + esc(text) + '" aria-label="Spreek uit: ' + esc(text) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" fill="currentColor"/>' +
      '<path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.7a7.5 7.5 0 0 1 0 10.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button>';
  }

  function wordOfDay() {
    var day = Store.today();
    var h = 0;
    for (var i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) % 100000;
    var pool = [];
    DECKS.forEach(function (d) {
      d.items.forEach(function (it, i) { if (it.ex) pool.push(d.id + ':' + i); });
    });
    return resolve(pool[h % pool.length]);
  }

  /* ---------- shell ---------- */

  function renderTopbar() {
    var st = Store.state.streak;
    topbar.innerHTML =
      '<div class="brand">' +
        '<span class="mark" aria-hidden="true"></span>' +
        '<span class="brandname">Nederlands</span>' +
      '</div>' +
      '<button class="streak" data-act="go" data-route="progress" aria-label="Voortgang bekijken">' +
        '<span class="streak-n">' + st.count + '</span>' +
        '<span class="streak-l">dagen<br>op rij</span>' +
      '</button>';
  }

  function renderTabs() {
    var tabs = [
      ['today', 'Vandaag', 'M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
      ['decks', 'Woorden', 'M4 5h7v14H4zM13 5h7v14h-7z'],
      ['grammar', 'Grammatica', 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5'],
      ['progress', 'Voortgang', 'M4 19V9M10 19V5M16 19v-7M22 19H2']
    ];
    tabbar.innerHTML = tabs.map(function (t) {
      var on = (route.name === t[0]) ||
        (t[0] === 'decks' && route.name === 'deck') ||
        (t[0] === 'grammar' && route.name === 'gram') ||
        (t[0] === 'progress' && route.name === 'settings');
      return '<button class="tab' + (on ? ' on' : '') + '" data-act="go" data-route="' + t[0] + '"' +
        (on ? ' aria-current="page"' : '') + '>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + t[2] + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>' +
        '<span>' + t[1] + '</span></button>';
    }).join('');
  }

  function go(name, id) {
    route = { name: name, id: id || null };
    render();
    view.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function render() {
    document.body.classList.toggle('studying', route.name === 'study');
    renderTopbar();
    renderTabs();
    if (route.name === 'study') { renderStudy(); return; }
    var html = '';
    if (route.name === 'today') html = viewToday();
    else if (route.name === 'decks') html = viewDecks();
    else if (route.name === 'deck') html = viewDeck(route.id);
    else if (route.name === 'grammar') html = viewGrammar();
    else if (route.name === 'gram') html = viewGram(route.id);
    else if (route.name === 'progress') html = viewProgress();
    else if (route.name === 'settings') html = viewSettings();
    view.innerHTML = html;
  }

  /* ---------- today ---------- */

  function viewToday() {
    var c = SRS.countsFor(ALL);
    var log = Store.dayLog();
    var goal = Store.settings.goal;
    var pct = Math.min(100, Math.round(log.rev / goal * 100));
    var allowance = Math.max(0, Store.settings.newPerDay - Store.newToday());
    var newInSession = Math.min(allowance, c.nw);
    var wod = wordOfDay();
    var ready = c.due + newInSession;

    var h = '<section class="hero">' +
      '<p class="eyebrow">' + greeting() + '</p>' +
      '<h2 class="hero-h">' + (ready
        ? plural(ready, 'kaart', 'kaarten') + ' klaar voor je'
        : 'Alles is bijgewerkt') + '</h2>' +
      '<div class="hero-split">' +
        '<div><span class="stat-n">' + c.due + '</span><span class="stat-l">te herhalen</span></div>' +
        '<div><span class="stat-n">' + newInSession + '</span><span class="stat-l">nieuw vandaag</span></div>' +
        '<div><span class="stat-n">' + c.known + '</span><span class="stat-l">beheerst</span></div>' +
      '</div>' +
      (ready
        ? '<button class="btn btn-primary btn-block" data-act="study-all">Begin de sessie</button>'
        : '<button class="btn btn-block" data-act="study-extra">Extra ronde met nieuwe woorden</button>') +
      '</section>';

    h += '<section class="panel">' +
      '<div class="panel-head"><h3>Dagdoel</h3><span class="mono">' + log.rev + ' / ' + goal + '</span></div>' +
      '<div class="meter"><i style="width:' + pct + '%"></i></div>' +
      '<p class="note">' + (log.rev >= goal
        ? 'Doel gehaald. Je reeks staat op ' + plural(Store.state.streak.count, 'dag', 'dagen') + '.'
        : plural(Math.max(0, goal - log.rev), 'kaart', 'kaarten') + ' te gaan vandaag.') +
      '</p></section>';

    if (wod) {
      h += '<section class="panel wod">' +
        '<div class="panel-head"><h3>Woord van de dag</h3>' + speakerBtn(wod.item.nl) + '</div>' +
        '<p class="nl-word">' + esc(wod.item.nl) + '</p>' +
        '<p class="en-word">' + esc(wod.item.en) + '</p>' +
        (wod.item.ex ? '<blockquote class="ex"><span class="nl">' + esc(wod.item.ex) + '</span>' +
          '<span class="en">' + esc(wod.item.exEn || '') + '</span></blockquote>' : '') +
        '<p class="note">uit <b>' + esc(wod.deck.name) + '</b></p>' +
        '</section>';
    }

    var weak = SRS.weakKeys(ALL);
    h += '<section class="row-links">' +
      (weak.length >= 4
        ? '<button class="linkrow" data-act="study-weak"><span><b>Zwakke plekken</b>' +
          '<em>' + plural(weak.length, 'kaart', 'kaarten') + ' die je vaak misgaan</em></span><span class="chev">→</span></button>'
        : '') +
      '<button class="linkrow" data-act="go" data-route="grammar"><span><b>Grammatica in kleine stukjes</b>' +
        '<em>' + GRAMMAR.length + ' korte uitleggen</em></span><span class="chev">→</span></button>' +
      '<button class="linkrow" data-act="go" data-route="decks"><span><b>Alle woordenlijsten</b>' +
        '<em>' + c.total + ' kaarten in ' + DECKS.length + ' lijsten</em></span><span class="chev">→</span></button>' +
      '</section>';

    if (installEvent) {
      h += '<button class="btn btn-block btn-ghost" data-act="install">Zet op je beginscherm</button>';
    }
    return h;
  }

  /* ---------- decks ---------- */

  function deckBar(c) {
    var t = Math.max(1, c.total);
    return '<div class="bar">' +
      '<i class="b-known" style="width:' + (c.known / t * 100) + '%"></i>' +
      '<i class="b-learn" style="width:' + (c.learning / t * 100) + '%"></i>' +
      '</div>';
  }

  function viewDecks() {
    var h = '<header class="page-head"><h2>Woordenlijsten</h2>' +
      '<p>Vijftien lijsten, van begroetingen tot kernwerkwoorden. Tik een lijst om te bekijken of te leren.</p></header>';
    h += '<div class="decklist">' + DECKS.map(function (d) {
      var c = SRS.countsFor([d]);
      return '<button class="deckcard" data-act="go" data-route="deck" data-id="' + d.id + '">' +
        '<div class="deckcard-top">' +
          '<div><h3>' + esc(d.name) + '</h3><p class="deck-en">' + esc(d.en) + '</p></div>' +
          '<span class="pill' + (c.due ? ' pill-due' : '') + '">' + (c.due ? c.due + ' due' : c.total) + '</span>' +
        '</div>' +
        deckBar(c) +
        '<p class="deck-meta"><b>' + c.known + '</b> beheerst · <b>' + c.learning + '</b> in opbouw · <b>' + c.nw + '</b> nieuw</p>' +
        '</button>';
    }).join('') + '</div>';
    return h;
  }

  function viewDeck(id) {
    var d = deckById(id);
    if (!d) return '<p class="note">Lijst niet gevonden.</p>';
    var c = SRS.countsFor([d]);
    var h = '<header class="page-head"><button class="back" data-act="go" data-route="decks">← Woordenlijsten</button>' +
      '<h2>' + esc(d.name) + '</h2><p>' + esc(d.hint) + '</p></header>';
    h += '<div class="deck-actions">' +
      '<button class="btn btn-primary" data-act="study-deck" data-id="' + d.id + '">Leer deze lijst</button>' +
      '<button class="btn" data-act="study-deck-all" data-id="' + d.id + '">Alles doorlopen</button>' +
      '</div>';
    h += '<p class="note count-note">' + c.total + ' kaarten · ' + c.known + ' beheerst · ' + c.due + ' te herhalen</p>';
    h += '<ul class="wordlist">' + d.items.map(function (it, i) {
      var key = d.id + ':' + i;
      var st = Store.card(key);
      var stage = SRS.stage(st);
      return '<li class="worditem">' +
        '<span class="dot dot-' + stage + '" title="' + stage + '"></span>' +
        '<div class="word-main">' +
          '<p class="nl-word sm">' + esc(it.nl) + '</p>' +
          '<p class="en-word sm">' + esc(it.en) + '</p>' +
          (it.ex ? '<p class="ex-inline"><span class="nl">' + esc(it.ex) + '</span> <span class="en">' + esc(it.exEn || '') + '</span></p>' : '') +
          '<p class="sched">' + (st ? 'terug ' + SRS.dueIn(st) : 'nog niet geleerd') + '</p>' +
        '</div>' +
        speakerBtn(it.nl) +
        '</li>';
    }).join('') + '</ul>';
    return h;
  }

  /* ---------- grammar ---------- */

  function viewGrammar() {
    var h = '<header class="page-head"><h2>Grammatica</h2>' +
      '<p>De regels die je in de eerste maanden echt nodig hebt — met voorbeelden die je kunt naspreken.</p></header>';
    h += '<div class="gramlist">' + GRAMMAR.map(function (g, i) {
      return '<button class="gramcard" data-act="go" data-route="gram" data-id="' + g.id + '">' +
        '<span class="gram-i mono">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="gram-t"><b>' + esc(g.title) + '</b><em>' + esc(g.en) + '</em></span>' +
        '<span class="chev">→</span></button>';
    }).join('') + '</div>';
    return h;
  }

  function viewGram(id) {
    var g = null, idx = -1;
    GRAMMAR.forEach(function (x, i) { if (x.id === id) { g = x; idx = i; } });
    if (!g) return '<p class="note">Niet gevonden.</p>';
    var h = '<header class="page-head"><button class="back" data-act="go" data-route="grammar">← Grammatica</button>' +
      '<p class="eyebrow mono">Regel ' + String(idx + 1).padStart(2, '0') + '</p>' +
      '<h2>' + esc(g.title) + '</h2><p>' + esc(g.en) + '</p></header>';
    h += '<div class="prose">' + g.body.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>';
    h += '<ul class="exlist">' + g.ex.map(function (e) {
      return '<li><div><p class="nl-word sm">' + esc(e[0]) + '</p><p class="en-word sm">' + esc(e[1]) + '</p></div>' +
        speakerBtn(e[0]) + '</li>';
    }).join('') + '</ul>';
    if (g.tip) h += '<aside class="tip"><b>Tip</b><p>' + g.tip + '</p></aside>';
    var next = GRAMMAR[idx + 1];
    if (next) h += '<button class="linkrow" data-act="go" data-route="gram" data-id="' + next.id + '">' +
      '<span><b>Volgende: ' + esc(next.title) + '</b><em>' + esc(next.en) + '</em></span><span class="chev">→</span></button>';
    return h;
  }

  /* ---------- progress ---------- */

  function activityChart() {
    var days = [];
    var t = Store.today();
    for (var i = 13; i >= 0; i--) {
      var day = Store.shiftDay(t, -i);
      var l = Store.state.log[day];
      days.push({ day: day, rev: l ? l.rev : 0 });
    }
    var max = Math.max(Store.settings.goal, 1);
    days.forEach(function (d) { if (d.rev > max) max = d.rev; });
    var W = 320, H = 96, gap = 5;
    var bw = (W - gap * 13) / 14;
    var goalY = H - (Store.settings.goal / max) * H;
    var bars = days.map(function (d, i) {
      var hgt = d.rev ? Math.max(3, (d.rev / max) * H) : 2;
      var x = i * (bw + gap);
      var cls = d.rev >= Store.settings.goal ? 'ch-hit' : (d.rev ? 'ch-part' : 'ch-none');
      return '<rect class="' + cls + '" x="' + x.toFixed(1) + '" y="' + (H - hgt).toFixed(1) +
        '" width="' + bw.toFixed(1) + '" height="' + hgt.toFixed(1) + '" rx="1"></rect>';
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + (H + 16) + '" role="img" aria-label="Kaarten per dag, laatste twee weken">' +
      '<line class="ch-goal" x1="0" y1="' + goalY.toFixed(1) + '" x2="' + W + '" y2="' + goalY.toFixed(1) + '"></line>' +
      bars +
      '<text class="ch-lab" x="0" y="' + (H + 13) + '">2 weken terug</text>' +
      '<text class="ch-lab" x="' + W + '" y="' + (H + 13) + '" text-anchor="end">vandaag</text>' +
      '</svg>';
  }

  function viewProgress() {
    var c = SRS.countsFor(ALL);
    var st = Store.state.streak;
    var rev7 = 0, ok7 = 0;
    var t = Store.today();
    for (var i = 0; i < 7; i++) {
      var l = Store.state.log[Store.shiftDay(t, -i)];
      if (l) { rev7 += l.rev; ok7 += l.ok; }
    }
    var acc = rev7 ? Math.round(ok7 / rev7 * 100) : null;

    var h = '<header class="page-head"><h2>Voortgang</h2>' +
      '<p>Alles blijft op dit apparaat staan — geen account, geen cloud.</p></header>';

    h += '<div class="tiles">' +
      tile(c.known, 'beheerst', 'kaarten met een interval van 3 weken of meer') +
      tile(c.learning, 'in opbouw', 'kaarten die nog terugkomen') +
      tile(st.count, st.count === 1 ? 'dag op rij' : 'dagen op rij', 'langste reeks: ' + st.best) +
      tile(acc === null ? '–' : acc + '%', 'juist, 7 dagen', rev7 + ' antwoorden deze week') +
      '</div>';

    h += '<section class="panel"><div class="panel-head"><h3>Twee weken activiteit</h3>' +
      '<span class="mono">doel ' + Store.settings.goal + '</span></div>' + activityChart() + '</section>';

    h += '<section class="panel"><div class="panel-head"><h3>Per lijst</h3></div>' +
      '<ul class="deckstats">' + DECKS.map(function (d) {
        var dc = SRS.countsFor([d]);
        return '<li><div class="ds-top"><span>' + esc(d.name) + '</span>' +
          '<span class="mono">' + dc.known + '/' + dc.total + '</span></div>' + deckBar(dc) + '</li>';
      }).join('') + '</ul></section>';

    h += '<button class="linkrow" data-act="go" data-route="settings">' +
      '<span><b>Instellingen</b><em>tempo, typen, uitspraak, thema</em></span><span class="chev">→</span></button>';
    return h;
  }

  function tile(n, label, note) {
    return '<div class="tile"><span class="tile-n">' + n + '</span>' +
      '<span class="tile-l">' + label + '</span><span class="tile-note">' + note + '</span></div>';
  }

  /* ---------- settings ---------- */

  function viewSettings() {
    var s = Store.settings;
    var h = '<header class="page-head"><button class="back" data-act="go" data-route="progress">← Voortgang</button>' +
      '<h2>Instellingen</h2></header>';

    h += '<section class="panel"><div class="panel-head"><h3>Tempo</h3></div>' +
      '<label class="field"><span>Nieuwe kaarten per dag<b class="mono" id="v-new">' + s.newPerDay + '</b></span>' +
      '<input id="set-new" type="range" min="0" max="30" step="1" value="' + s.newPerDay + '"></label>' +
      '<label class="field"><span>Dagdoel in kaarten<b class="mono" id="v-goal">' + s.goal + '</b></span>' +
      '<input id="set-goal" type="range" min="5" max="120" step="5" value="' + s.goal + '"></label>' +
      '<p class="note">Acht nieuwe woorden per dag is ongeveer 240 per maand. Meer voelt snel maar komt later terug als een berg herhalingen.</p>' +
      '</section>';

    h += '<section class="panel"><div class="panel-head"><h3>Oefenen</h3></div>' +
      toggle('set-typing', 'Laat me woorden intypen', s.typing, 'Zonder typen blijft het bij keuzevragen en flashcards.') +
      toggle('set-speak', 'Spreek Nederlands automatisch uit', s.autoSpeak,
        Speech.supported
          ? (Speech.hasDutch() ? 'Stem: ' + esc(Speech.voiceName()) : 'Nog geen Nederlandse stem gevonden. Installeer er een bij de spraakinstellingen van je telefoon.')
          : 'Dit apparaat ondersteunt geen spraak.') +
      '</section>';

    h += '<section class="panel"><div class="panel-head"><h3>Thema</h3></div>' +
      '<div class="segmented" role="group" aria-label="Thema">' +
      ['system', 'light', 'dark'].map(function (k) {
        var lab = { system: 'Systeem', light: 'Licht', dark: 'Donker' }[k];
        return '<button class="seg' + (s.theme === k ? ' on' : '') + '" data-act="theme" data-theme="' + k + '">' + lab + '</button>';
      }).join('') + '</div></section>';

    h += '<section class="panel"><div class="panel-head"><h3>Opnieuw beginnen</h3></div>' +
      '<p class="note">Dit wist alle planningen, je reeks en je geschiedenis. De woordenlijsten blijven.</p>' +
      '<button class="btn btn-danger" data-act="reset">Voortgang wissen</button></section>';

    h += '<p class="colofon">Nederlands · offline woordtrainer · ' +
      ALL.reduce(function (a, d) { return a + d.items.length; }, 0) + ' kaarten, ' + GRAMMAR.length + ' regels</p>';
    return h;
  }

  function toggle(id, label, on, note) {
    return '<div class="field field-toggle"><div class="f-text"><b>' + label + '</b>' +
      '<em>' + note + '</em></div>' +
      '<button class="switch' + (on ? ' on' : '') + '" id="' + id + '" role="switch" aria-checked="' + (on ? 'true' : 'false') +
      '" aria-label="' + label + '" data-act="toggle" data-key="' +
      (id === 'set-typing' ? 'typing' : 'autoSpeak') + '"><i></i></button></div>';
  }

  /* ---------- study session ---------- */

  var S = null;
  var advanceToken = 0;

  function pickMode(c) {
    var words = c.item.nl.split(/\s+/).length;
    var typeable = Store.settings.typing && words <= 3 && c.item.nl.indexOf('...') === -1;
    if (!c.st) return 'intro';
    if (Speech.supported && Speech.hasDutch() && Math.random() < 0.2) return 'listen';
    if (words > 3) return Math.random() < 0.5 ? 'flip' : 'choice';
    if (c.st.r < 2) return 'choice';
    if (typeable && Math.random() < 0.55) return 'type';
    return Math.random() < 0.65 ? 'choice' : 'flip';
  }

  function makeChoices(c, field) {
    var pool = c.deck.items.filter(function (it) { return it !== c.item && it[field] !== c.item[field]; });
    if (pool.length < 3) {
      DECKS.forEach(function (d) {
        d.items.forEach(function (it) { if (it !== c.item && it[field] !== c.item[field]) pool.push(it); });
      });
    }
    SRS.shuffle(pool);
    var opts = pool.slice(0, 3).map(function (it) { return it[field]; });
    opts.push(c.item[field]);
    return SRS.shuffle(opts);
  }

  function norm(s) {
    var x = String(s).toLowerCase();
    try { x = x.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* older engine */ }
    return x.replace(/[.,!?;:\u2019']/g, '').replace(/\s+/g, ' ').trim();
  }

  function stripArticle(s) { return s.replace(/^(de|het|een)\s+/, ''); }

  function typedOk(given, target) {
    var a = norm(given), b = norm(target);
    return a === b || stripArticle(a) === stripArticle(b);
  }

  function startSession(deckList, opts) {
    opts = opts || {};
    var queue = opts.keys || SRS.buildQueue(deckList, opts);
    if (!queue.length) {
      toast(opts.emptyMsg || 'Niets te herhalen. Kom later terug of verhoog je tempo.');
      return;
    }
    S = {
      queue: queue, done: 0, correct: 0, again: 0, newSeen: 0,
      started: Date.now(), cur: null, phase: 'q', mode: null, field: 'en',
      choices: [], picked: null, wasCorrect: null, label: opts.label || ''
    };
    go('study');
    nextCard();
  }

  function nextCard() {
    advanceToken++;
    if (!S.queue.length) { finish(); return; }
    var c = resolve(S.queue.shift());
    if (!c) { nextCard(); return; }
    S.cur = c;
    S.wasNew = !c.st;
    S.mode = pickMode(c);
    S.phase = 'q';
    S.picked = null;
    S.wasCorrect = null;
    if (S.mode === 'listen') S.field = 'en';
    else if (S.mode === 'type') S.field = 'nl';
    else S.field = Math.random() < 0.5 ? 'en' : 'nl';
    if (S.mode === 'choice' || S.mode === 'listen') S.choices = makeChoices(c, S.field);
    renderStudy();
    if (S.mode === 'listen') speak(c.item.nl);
    else if (Store.settings.autoSpeak && (S.mode === 'intro' || S.field === 'en')) Speech.say(c.item.nl);
    if (S.mode === 'type') focusInput();
  }

  function focusInput() {
    setTimeout(function () {
      var el = document.getElementById('typed');
      if (el) el.focus();
    }, 60);
  }

  function applyGrade(g) {
    var c = S.cur;
    var next = SRS.grade(c.st, g);
    Store.putCard(c.key, next);
    Store.record(g > 0, S.wasNew);
    if (S.wasNew) S.newSeen++;
    S.done++;
    if (g > 0) S.correct++; else { S.again++; S.queue.push(c.key); }
    nextCard();
  }

  function answer(correct, picked) {
    S.picked = picked === undefined ? null : picked;
    S.wasCorrect = correct;
    S.phase = 'a';
    var c = S.cur;
    var next = SRS.grade(c.st, correct ? 2 : 0);
    Store.putCard(c.key, next);
    Store.record(correct, S.wasNew);
    if (S.wasNew) S.newSeen++;
    S.done++;
    if (correct) S.correct++; else { S.again++; S.queue.push(c.key); }
    renderStudy();
    if (Store.settings.autoSpeak) Speech.say(c.item.nl);
    if (correct) {
      var tok = ++advanceToken;
      setTimeout(function () { if (tok === advanceToken && S && S.phase === 'a') nextCard(); }, 1150);
    }
  }

  function renderStudy() {
    if (!S) { go('today'); return; }
    var c = S.cur;
    if (!c) { view.innerHTML = ''; return; }
    var it = c.item;
    var total = S.done + S.queue.length + 1;
    var pct = Math.round(S.done / total * 100);

    var h = '<div class="study">' +
      '<div class="study-top">' +
        '<button class="quit" data-act="quit" aria-label="Sessie stoppen">✕</button>' +
        '<div class="meter meter-thin"><i style="width:' + pct + '%"></i></div>' +
        '<span class="mono study-count">' + S.done + '/' + total + '</span>' +
      '</div>';

    var badge = {
      intro: 'nieuw woord', choice: 'kies het juiste', type: 'typ het Nederlands',
      listen: 'luister', flip: 'zeg het eerst zelf'
    }[S.mode];

    h += '<div class="card-wrap"><div class="card' +
      (S.phase === 'a' ? (S.wasCorrect ? ' card-ok' : ' card-bad') : '') + '">' +
      '<p class="card-badge">' + badge + ' · ' + esc(c.deck.name) + '</p>';

    if (S.mode === 'intro') {
      h += '<p class="nl-word xl">' + esc(it.nl) + '</p>' + speakerBtn(it.nl, 'lg') +
        '<p class="en-word">' + esc(it.en) + '</p>' +
        (it.art ? '<p class="artnote">lidwoord: <b>' + it.art + '</b></p>' : '') +
        exampleBlock(it);
    } else if (S.mode === 'listen') {
      h += '<button class="listenbig" data-act="speak" data-text="' + esc(it.nl) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" fill="currentColor"/>' +
        '<path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.7a7.5 7.5 0 0 1 0 10.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '<span>nog eens</span></button>' +
        (S.phase === 'a' ? '<p class="nl-word lg">' + esc(it.nl) + '</p>' : '<p class="hidden-word">· · ·</p>');
    } else if (S.mode === 'type') {
      h += '<p class="prompt">' + esc(it.en) + '</p>' +
        (it.art ? '<p class="artnote">een <b>' + it.art + '</b>-woord</p>' : '');
    } else if (S.mode === 'flip') {
      var flipFront = S.field === 'en' ? it.nl : it.en;
      h += '<p class="' + (S.field === 'en' ? 'nl-word lg' : 'prompt') + '">' + esc(flipFront) + '</p>' +
        (S.field === 'en' ? speakerBtn(it.nl, 'lg') : '') +
        (S.phase === 'a'
          ? '<hr class="rule"><p class="' + (S.field === 'en' ? 'en-word' : 'nl-word lg') + '">' +
            esc(S.field === 'en' ? it.en : it.nl) + '</p>' + exampleBlock(it)
          : '');
    } else { /* choice */
      var qFront = S.field === 'en' ? it.nl : it.en;
      h += '<p class="' + (S.field === 'en' ? 'nl-word lg' : 'prompt') + '">' + esc(qFront) + '</p>' +
        (S.field === 'en' ? speakerBtn(it.nl, 'lg') : '');
    }

    if (S.phase === 'a' && (S.mode === 'choice' || S.mode === 'type' || S.mode === 'listen')) {
      h += '<div class="verdict">' +
        (S.wasCorrect ? '<b class="v-ok">Goed</b>' : '<b class="v-bad">Bijna — het is:</b>') +
        '<p class="' + (S.field === 'nl' ? 'nl-word lg' : 'en-word') + '">' +
        esc(S.field === 'nl' ? it.nl : it.en) + '</p>' +
        (S.wasCorrect ? '' : (S.picked ? '<p class="picked">jij koos: ' + esc(S.picked) + '</p>' : '')) +
        (S.wasCorrect ? '' : exampleBlock(it)) +
        '</div>';
    }

    h += '</div></div>';   // card + wrap

    /* ---- controls ---- */
    h += '<div class="controls">';
    if (S.phase === 'q') {
      if (S.mode === 'intro') {
        h += '<div class="btn-pair">' +
          '<button class="btn" data-act="grade" data-g="1">Moeilijk</button>' +
          '<button class="btn btn-primary" data-act="grade" data-g="2">Snap ik</button></div>';
      } else if (S.mode === 'flip') {
        h += '<button class="btn btn-primary btn-block" data-act="reveal">Toon het antwoord</button>';
      } else if (S.mode === 'type') {
        h += '<form class="typeform" id="typeform" autocomplete="off">' +
          '<input id="typed" name="typed" type="text" inputmode="text" enterkeyhint="done" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="typ in het Nederlands…" aria-label="Typ het Nederlandse woord">' +
          '<button class="btn btn-primary" type="submit">Check</button></form>';
      } else {
        h += '<div class="choices">' + S.choices.map(function (o) {
          return '<button class="choice" data-act="choose" data-val="' + esc(o) + '">' +
            '<span class="' + (S.field === 'nl' ? 'nl' : '') + '">' + esc(o) + '</span></button>';
        }).join('') + '</div>';
      }
    } else if (S.mode === 'flip') {
      h += '<div class="grades">' +
        '<button class="btn g-again" data-act="grade" data-g="0">Opnieuw</button>' +
        '<button class="btn g-hard" data-act="grade" data-g="1">Moeilijk</button>' +
        '<button class="btn g-good" data-act="grade" data-g="2">Goed</button>' +
        '<button class="btn g-easy" data-act="grade" data-g="3">Makkelijk</button></div>';
    } else {
      h += '<button class="btn btn-primary btn-block" data-act="next">Verder</button>';
    }
    h += '</div></div>';
    view.innerHTML = h;
    if (S.phase === 'q' && S.mode === 'type') focusInput();
  }

  function exampleBlock(it) {
    if (!it.ex) return '';
    return '<blockquote class="ex"><span class="nl">' + esc(it.ex) + '</span>' +
      '<span class="en">' + esc(it.exEn || '') + '</span>' +
      '<button class="spk spk-inline" data-act="speak" data-text="' + esc(it.ex) + '" aria-label="Spreek het voorbeeld uit">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" fill="currentColor"/></svg></button>' +
      '</blockquote>';
  }

  function finish() {
    var secs = Math.round((Date.now() - S.started) / 1000);
    var acc = S.done ? Math.round(S.correct / S.done * 100) : 0;
    var mins = Math.floor(secs / 60), rest = secs % 60;
    var st = Store.state.streak;
    view.innerHTML = '<div class="study done">' +
      '<p class="eyebrow">Klaar</p>' +
      '<h2 class="hero-h">' + (acc >= 85 ? 'Sterk gedaan.' : acc >= 60 ? 'Goed bezig.' : 'Volgende keer beter — herhaling werkt.') + '</h2>' +
      '<div class="hero-split">' +
        '<div><span class="stat-n">' + S.done + '</span><span class="stat-l">antwoorden</span></div>' +
        '<div><span class="stat-n">' + acc + '%</span><span class="stat-l">juist</span></div>' +
        '<div><span class="stat-n">' + S.newSeen + '</span><span class="stat-l">nieuw geleerd</span></div>' +
      '</div>' +
      '<p class="note">' + (mins ? mins + ' min ' : '') + rest + ' sec · reeks van ' +
      plural(st.count, 'dag', 'dagen') + '</p>' +
      '<div class="btn-pair">' +
        '<button class="btn" data-act="go" data-route="today">Naar Vandaag</button>' +
        '<button class="btn btn-primary" data-act="study-all">Nog een ronde</button>' +
      '</div></div>';
    S = null;
  }

  /* ---------- events ---------- */

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.dataset.act;

    if (act === 'speak') { speak(el.dataset.text); return; }
    if (act === 'go') { go(el.dataset.route, el.dataset.id); return; }
    if (act === 'quit') { S = null; go('today'); return; }
    if (act === 'next') { nextCard(); return; }
    if (act === 'reveal') { S.phase = 'a'; renderStudy(); if (Store.settings.autoSpeak) Speech.say(S.cur.item.nl); return; }
    if (act === 'grade') { applyGrade(Number(el.dataset.g)); return; }
    if (act === 'choose') {
      if (S.phase !== 'q') return;
      var val = el.dataset.val;
      answer(val === S.cur.item[S.field], val);
      return;
    }
    if (act === 'study-all') { startSession(ALL, { label: 'Alles' }); return; }
    if (act === 'study-extra') { startSession(ALL, { ignoreLimit: true, limit: 20, label: 'Extra' }); return; }
    if (act === 'study-weak') {
      startSession(ALL, { keys: SRS.weakKeys(ALL).slice(0, 20), label: 'Zwakke plekken' });
      return;
    }
    if (act === 'study-deck') {
      var d = deckById(el.dataset.id);
      startSession([d], { label: d.name, emptyMsg: 'Deze lijst is bij — kies "Alles doorlopen".' });
      return;
    }
    if (act === 'study-deck-all') {
      var d2 = deckById(el.dataset.id);
      startSession([d2], { ignoreLimit: true, label: d2.name });
      return;
    }
    if (act === 'theme') { setTheme(el.dataset.theme); render(); return; }
    if (act === 'toggle') {
      var k = el.dataset.key;
      Store.set(k, !Store.settings[k]);
      render();
      return;
    }
    if (act === 'reset') {
      if (confirm('Alle voortgang wissen? Dit kan niet ongedaan worden gemaakt.')) {
        Store.resetProgress();
        toast('Voortgang gewist.');
        go('today');
      }
      return;
    }
    if (act === 'install') {
      if (installEvent) { installEvent.prompt(); installEvent = null; }
      return;
    }
  });

  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'typeform') return;
    e.preventDefault();
    if (!S || S.phase !== 'q') return;
    var el = document.getElementById('typed');
    var given = el ? el.value : '';
    if (!given.trim()) return;
    answer(typedOk(given, S.cur.item.nl), given);
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'set-new') {
      Store.set('newPerDay', Number(e.target.value));
      document.getElementById('v-new').textContent = e.target.value;
    }
    if (e.target.id === 'set-goal') {
      Store.set('goal', Number(e.target.value));
      document.getElementById('v-goal').textContent = e.target.value;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (route.name !== 'study' || !S || !S.cur) return;
    if (e.target.tagName === 'INPUT') return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (S.phase === 'q' && S.mode === 'flip') { S.phase = 'a'; renderStudy(); }
      else if (S.phase === 'a' && S.mode !== 'flip') nextCard();
      else if (S.phase === 'q' && S.mode === 'intro') applyGrade(2);
      return;
    }
    if (S.phase === 'a' && S.mode === 'flip' && '1234'.indexOf(e.key) >= 0) {
      applyGrade(Number(e.key) - 1);
      return;
    }
    if (S.phase === 'q' && S.mode === 'choice' && '1234'.indexOf(e.key) >= 0) {
      var btns = view.querySelectorAll('.choice');
      var b = btns[Number(e.key) - 1];
      if (b) b.click();
    }
    if (e.key === 'Escape') { S = null; go('today'); }
  });

  /* ---------- theme, install, boot ---------- */

  function setTheme(t) {
    Store.set('theme', t);
    if (t === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  if (Store.settings.theme !== 'system') {
    document.documentElement.setAttribute('data-theme', Store.settings.theme);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    if (route.name === 'today') render();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline cache unavailable here */ });
    });
  }

  render();
})();
