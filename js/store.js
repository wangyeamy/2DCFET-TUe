/* Persistent state. Everything lives in one localStorage key and degrades
   gracefully when storage is unavailable (private windows, blocked site data). */
window.Store = (function () {
  var KEY = 'nederlands.trainer.v1';

  var DEFAULTS = {
    v: 1,
    cards: {},          // "deckId:index" -> scheduling state
    log: {},            // "YYYY-MM-DD" -> { rev, ok, nw }
    streak: { count: 0, best: 0, last: null },
    settings: {
      newPerDay: 8,
      goal: 20,
      autoSpeak: true,
      typing: true,
      theme: 'system'
    }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function today(d) {
    d = d || new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function shiftDay(dayStr, delta) {
    var p = dayStr.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    d.setDate(d.getDate() + delta);
    return today(d);
  }

  var state = (function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULTS);
      var p = JSON.parse(raw) || {};
      var s = clone(DEFAULTS);
      if (p.cards) s.cards = p.cards;
      if (p.log) s.log = p.log;
      if (p.streak) s.streak = Object.assign(s.streak, p.streak);
      if (p.settings) s.settings = Object.assign(s.settings, p.settings);
      return s;
    } catch (e) {
      return clone(DEFAULTS);
    }
  })();

  var saveTimer = null;
  function save() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* no storage: session only */ }
    }, 120);
  }

  function dayLog(day) {
    day = day || today();
    if (!state.log[day]) state.log[day] = { rev: 0, ok: 0, nw: 0 };
    return state.log[day];
  }

  return {
    state: state,
    settings: state.settings,
    today: today,
    shiftDay: shiftDay,
    save: save,

    card: function (key) { return state.cards[key] || null; },
    putCard: function (key, c) { state.cards[key] = c; save(); },

    newToday: function () { return dayLog().nw; },
    dayLog: dayLog,

    /* Records one answer and keeps the streak honest. */
    record: function (correct, wasNew) {
      var l = dayLog();
      l.rev += 1;
      if (correct) l.ok += 1;
      if (wasNew) l.nw += 1;
      var st = state.streak;
      var t = today();
      if (st.last !== t) {
        st.count = (st.last === shiftDay(t, -1)) ? st.count + 1 : 1;
        st.last = t;
        if (st.count > st.best) st.best = st.count;
      }
      save();
    },

    set: function (k, v) { state.settings[k] = v; save(); },

    resetProgress: function () {
      state.cards = {};
      state.log = {};
      state.streak = { count: 0, best: 0, last: null };
      save();
    }
  };
})();
