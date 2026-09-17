# Nederlands — a pocket Dutch trainer

A phone-first web app for learning Dutch at A1–A2: spaced-repetition
flashcards, five practice modes including a word-order drill, Dutch
text-to-speech and short grammar notes. It installs to your home screen, runs
offline, and keeps everything on the device — no account, no server, no
tracking.

Built as a PWA (plain HTML/CSS/JS, no build step, no dependencies) so it runs
on iPhone and Android from the same URL.

## What's in it

- **625 cards in 22 lists, tagged A1 or A2.** A1: greetings, numbers, time,
  food, ordering out, shopping, getting around, home, people, weather and 36
  core verbs. A2: past tense forms, separable verbs, verbs with fixed
  prepositions, Dutch admin and paperwork, conversation connectors, phone &
  email formulas, and everyday expressions. Nouns carry their `de`/`het`
  article; many cards carry an example sentence.
- **A level switch** — A1, A1–A2 or A2 decides which **new** cards you are
  given, so you are not drilling *hallo* while working on the perfect tense.
  Cards already in rotation keep coming back regardless. Anything you already
  know can be skipped per card (*Dit ken ik al*) or per list.
- **19 grammar notes** — verb-second word order, subclauses, present tense,
  the perfect with *hebben*/*zijn*, perfect vs imperfect, separable verbs,
  plurals, `niet` vs `geen`, adjective `-e`, `u`/`jij`, `er`, diminutives,
  `om ... te`, `die`/`dat`, `zou`, comparatives, and a pronunciation guide
  for *ij / ui / eu / g / sch*.
- **Spaced repetition** — an SM-2 style scheduler with per-card ease and
  interval, a daily allowance for new cards, and a "weak spots" round for the
  cards you keep missing.
- **Five practice modes**, chosen per card from how well you know it:
  introduction, multiple choice, typing, listening, and a **word-order drill**
  that shuffles an example sentence into tappable words for you to rebuild —
  the A1→A2 hurdle in Dutch — plus self-graded flashcards for longer phrases.
  Direction alternates NL→EN and EN→NL. The drill is also available on its own
  from the home screen (*Zinsbouw oefenen*); 165 sentences are short enough
  to qualify.
- **Text-to-speech** in `nl-NL` through the device's own voices — tap the
  speaker on any word, example or grammar line.
- **Progress** — streak, daily goal, two-week activity chart, per-list
  mastery, seven-day accuracy.
- Light and dark themes, full keyboard support on desktop (`space` to flip,
  `1`–`4` to grade or pick, `Esc` to quit).

## Run it

Any static file server works — there is nothing to build.

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Open the same URL on your phone (same Wi-Fi) to try it there. Service workers
and installation need `https://` or `localhost`.

## Put it on your phone

Deploy the repository root to any static host, then open the URL on the phone:

- **GitHub Pages** — repository *Settings → Pages → Deploy from a branch*,
  pick this branch and the `/ (root)` folder.
- **iPhone (Safari)** — Share → *Add to Home Screen*.
- **Android (Chrome)** — the app offers *Zet op je beginscherm*, or use
  ⋮ → *Install app*.

After the first load the service worker caches the app, so it keeps working
without a connection.

### Dutch voices

Pronunciation uses the platform's speech engine. iOS ships a Dutch voice with
*Settings → Accessibility → Spoken Content → Voices*; Android installs them
through *Settings → Speech → Text-to-speech*. Without one the app stays fully
usable, it simply cannot speak.

## Layout

```
index.html              app shell
css/styles.css          theme tokens and all styling
js/data/decks.js        vocabulary and phrases
js/data/grammar.js      grammar and pronunciation notes
js/store.js             localStorage state, streak, daily log
js/srs.js               scheduler and queue building
js/speech.js            nl-NL text-to-speech
js/app.js               views, router and the study session
sw.js                   offline cache
tools/make-icons.py     regenerates the app icons
```

## Adding your own words

Append to any list in `js/data/decks.js` and reload — cards are keyed by list
id and position:

```js
{ nl: 'de bibliotheek', en: 'the library', art: 'de',
  ex: 'Ik werk in de bibliotheek.', exEn: 'I work in the library.' }
```

Lists carry a `level: 'A1'` or `level: 'A2'` field, which drives the level
switch and the filter chips. An item gains a word-order drill automatically as
soon as its `ex` sentence is between three and eight words.

Adding entries at the **end** of a list keeps existing progress intact;
inserting in the middle shifts the keys of everything after it, so cards would
inherit the wrong schedule. Whole new lists need a unique `id`.

Bump `CACHE` in `sw.js` after changing any file, so installed copies fetch the
new version.

## Data

Everything lives in one `localStorage` key, `nederlands.trainer.v1`. Clearing
site data — or *Voortgang wissen* in settings — resets it. Nothing leaves the
device.
