/* Dutch text-to-speech through the platform's own voices. */
window.Speech = (function () {
  var synth = window.speechSynthesis || null;
  var voice = null;
  var voiceName = null;

  function pick() {
    if (!synth) return;
    var list = [];
    try { list = synth.getVoices() || []; } catch (e) { return; }
    var nl = list.filter(function (v) { return /^nl/i.test(v.lang || ''); });
    if (!nl.length) { voice = null; voiceName = null; return; }
    // Prefer a Netherlands voice, then any Dutch one; local voices first.
    nl.sort(function (a, b) {
      var an = /nl[-_]NL/i.test(a.lang) ? 0 : 1, bn = /nl[-_]NL/i.test(b.lang) ? 0 : 1;
      if (an !== bn) return an - bn;
      return (a.localService === b.localService) ? 0 : (a.localService ? -1 : 1);
    });
    voice = nl[0];
    voiceName = voice.name + ' (' + voice.lang + ')';
  }

  if (synth) {
    pick();
    if ('onvoiceschanged' in synth) synth.onvoiceschanged = pick;
    setTimeout(pick, 400);
  }

  return {
    supported: !!synth,
    hasDutch: function () { return !!voice; },
    voiceName: function () { return voiceName; },
    say: function (text) {
      if (!synth || !text) return false;
      try {
        synth.cancel();
        var u = new SpeechSynthesisUtterance(String(text).replace(/\.\.\./g, ' '));
        u.lang = voice ? voice.lang : 'nl-NL';
        if (voice) u.voice = voice;
        u.rate = 0.88;
        u.pitch = 1;
        synth.speak(u);
        return true;
      } catch (e) { return false; }
    }
  };
})();
