/* A compact SM-2 style scheduler. Grades: 0 again, 1 hard, 2 good, 3 easy. */
window.SRS = (function () {
  var DAY = 86400000;
  var MIN_EASE = 1.3;

  function fresh() {
    return { r: 0, i: 0, e: 2.5, d: 0, ok: 0, bad: 0, lapses: 0 };
  }

  function fuzz(days) {
    if (days < 1) return days;
    var f = 1 + (Math.random() * 0.1 - 0.05);
    return Math.max(1, Math.round(days * f * 100) / 100);
  }

  function grade(prev, g) {
    var c = prev ? Object.assign(fresh(), prev) : fresh();
    var now = Date.now();

    if (g === 0) {
      c.bad += 1;
      if (c.r > 0) c.lapses += 1;
      c.e = Math.max(MIN_EASE, c.e - 0.2);
      c.i = 0;
      c.r = 0;
      c.d = now + 8 * 60000;          // back in about eight minutes
      return c;
    }

    c.ok += 1;
    if (g === 1) c.e = Math.max(MIN_EASE, c.e - 0.15);
    if (g === 3) c.e = Math.min(3.2, c.e + 0.1);

    var i;
    if (c.r === 0) {
      i = g === 1 ? 0.02 : (g === 2 ? 1 : 3);
    } else if (c.r === 1) {
      i = g === 1 ? 1 : (g === 2 ? 3 : 6);
    } else {
      var mult = g === 1 ? 1.2 : (g === 2 ? c.e : c.e * 1.3);
      i = Math.max(c.i * mult, c.i + 1);
    }
    c.i = fuzz(i);
    c.r += 1;
    c.d = now + c.i * DAY;
    return c;
  }

  function stage(c) {
    if (!c || !c.r && !c.bad) return 'new';
    if (c.i >= 21) return 'known';
    return 'learning';
  }

  function isDue(c, now) { return !!c && c.d <= (now || Date.now()); }

  /* New cards are filtered by the level you are working at; cards already in
     rotation always come back regardless of level. */
  function levelOk(deck) {
    var lv = Store.settings.level || 'A1A2';
    if (lv === 'A1A2') return true;
    return (deck.level || 'A1') === lv;
  }

  function markKnown(key) {
    Store.putCard(key, { r: 3, i: 30, e: 2.6, d: Date.now() + 30 * DAY, ok: 1, bad: 0, lapses: 0 });
  }

  function buildable(item) {
    if (!item.ex) return false;
    var w = item.ex.trim().split(/\s+/);
    return w.length >= 3 && w.length <= 8;
  }

  /* Cards whose example sentence is short enough to rebuild word by word. */
  function buildableKeys(decks) {
    var seen = [], rest = [];
    decks.forEach(function (d) {
      d.items.forEach(function (it, i) {
        if (!buildable(it)) return;
        var k = d.id + ':' + i;
        (Store.card(k) ? seen : rest).push(k);
      });
    });
    return shuffle(seen).concat(shuffle(rest));
  }

  function keysOf(deck) {
    return deck.items.map(function (_, i) { return deck.id + ':' + i; });
  }

  function countsFor(decks) {
    var out = { nw: 0, due: 0, learning: 0, known: 0, total: 0 };
    var now = Date.now();
    decks.forEach(function (d) {
      keysOf(d).forEach(function (k) {
        var c = Store.card(k);
        out.total += 1;
        var s = stage(c);
        if (s === 'new') out.nw += 1;
        else if (s === 'learning') out.learning += 1;
        else out.known += 1;
        if (isDue(c, now)) out.due += 1;
      });
    });
    return out;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Builds a study queue: everything due first, then as many unseen cards as
     the daily allowance still permits, interleaved so a session never opens
     with a wall of new words. */
  function buildQueue(decks, opts) {
    opts = opts || {};
    var now = Date.now();
    var due = [], fresh_ = [];
    decks.forEach(function (d) {
      var allowNew = opts.ignoreLevel || levelOk(d);
      keysOf(d).forEach(function (k) {
        var c = Store.card(k);
        if (!c) { if (allowNew) fresh_.push(k); }
        else if (isDue(c, now)) due.push({ k: k, d: c.d });
      });
    });
    due.sort(function (a, b) { return a.d - b.d; });
    var dueKeys = due.map(function (x) { return x.k; });

    var allowance = opts.ignoreLimit
      ? fresh_.length
      : Math.max(0, Store.settings.newPerDay - Store.newToday());
    shuffle(fresh_);
    var newKeys = fresh_.slice(0, allowance);

    var queue = [];
    var di = 0, ni = 0, slot = 0;
    var cap = opts.limit || Infinity;
    while ((di < dueKeys.length || ni < newKeys.length) && queue.length < cap) {
      var wantNew = (slot % 4 === 3 && ni < newKeys.length) || di >= dueKeys.length;
      if (wantNew && ni < newKeys.length) queue.push(newKeys[ni++]);
      else if (di < dueKeys.length) queue.push(dueKeys[di++]);
      slot++;
    }
    return queue;
  }

  /* Cards answered wrong more often than right — worth a dedicated round. */
  function weakKeys(decks) {
    var out = [];
    decks.forEach(function (d) {
      keysOf(d).forEach(function (k) {
        var c = Store.card(k);
        if (c && c.bad > 0 && c.bad >= c.ok) out.push({ k: k, bad: c.bad - c.ok });
      });
    });
    out.sort(function (a, b) { return b.bad - a.bad; });
    return out.map(function (x) { return x.k; });
  }

  function dueIn(c) {
    if (!c) return 'nieuw';
    var ms = c.d - Date.now();
    if (ms <= 0) return 'nu';
    var days = ms / 86400000;
    if (days < 1) return 'vandaag';
    if (days < 2) return 'morgen';
    if (days < 30) return 'over ' + Math.round(days) + ' dagen';
    return 'over ' + Math.round(days / 30) + ' mnd';
  }

  return {
    grade: grade, stage: stage, isDue: isDue, keysOf: keysOf,
    countsFor: countsFor, buildQueue: buildQueue, weakKeys: weakKeys,
    shuffle: shuffle, dueIn: dueIn, fresh: fresh,
    levelOk: levelOk, markKnown: markKnown, buildable: buildable, buildableKeys: buildableKeys
  };
})();
