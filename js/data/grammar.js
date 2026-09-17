/* Short grammar and pronunciation notes. body = array of paragraphs/examples.
   ex: [[dutch, english], ...] */
window.GRAMMAR = [
  {
    id: 'de-het',
    title: 'de of het?',
    en: 'The two Dutch articles',
    body: [
      'Every Dutch noun takes either <b>de</b> or <b>het</b>. Roughly two thirds are <b>de</b> words, so when you have no idea, guess <b>de</b>.',
      '<b>het</b> is used for: all diminutives (-je), most words for languages and metals, all words starting with ge-/be-/ver- that are not verbs, and nearly all single-syllable words that feel abstract. It is never plural — <b>every plural noun takes de</b>.'
    ],
    ex: [
      ['de man, de vrouw, de stad', 'the man, the woman, the city'],
      ['het huis, het kind, het brood', 'the house, the child, the bread'],
      ['het meisje, het kopje, het broodje', 'the girl, the little cup, the roll (all -je)'],
      ['de huizen, de kinderen', 'the houses, the children (plural = always de)']
    ],
    tip: 'Learn the article together with the noun from day one. "Huis" alone is half a word.'
  },
  {
    id: 'woordorde',
    title: 'Het werkwoord op plek twee',
    en: 'The verb goes second',
    body: [
      'In a Dutch main clause the conjugated verb sits in <b>second position</b> — not necessarily second word, but second <i>slot</i>. Whatever you put first, the verb follows immediately.',
      'This means that if you open with a time or place, the subject moves behind the verb. This is called inversion and it is the single most common beginner mistake.'
    ],
    ex: [
      ['Ik ga morgen naar Amsterdam.', 'I am going to Amsterdam tomorrow.'],
      ['Morgen ga ik naar Amsterdam.', 'Tomorrow I am going to Amsterdam.'],
      ['Om acht uur begint het college.', 'The lecture starts at eight.'],
      ['Gisteren was het koud.', 'It was cold yesterday.']
    ],
    tip: 'Say it out loud: "Morgen ga ik" feels wrong in English and right in Dutch. Trust the Dutch.'
  },
  {
    id: 'bijzin',
    title: 'Het werkwoord achteraan',
    en: 'Subclauses send the verb to the end',
    body: [
      'After <b>omdat, dat, als, terwijl, of, hoewel</b> and the other subordinating conjunctions, the verb travels to the end of the clause.',
      'Note the pair <b>want</b> and <b>omdat</b>: both mean "because", but <b>want</b> keeps normal order and <b>omdat</b> pushes the verb back.'
    ],
    ex: [
      ['Ik blijf thuis, want het regent.', 'I am staying home, because it is raining.'],
      ['Ik blijf thuis omdat het regent.', 'I am staying home because it is raining.'],
      ['Ik weet niet of hij komt.', "I don't know whether he is coming."],
      ['Als ik tijd heb, kom ik langs.', 'If I have time, I will drop by.']
    ]
  },
  {
    id: 'vervoeging',
    title: 'Tegenwoordige tijd',
    en: 'Present tense in one rule',
    body: [
      'Take the stem (infinitive minus <b>-en</b>). Then: <b>ik</b> = stem, <b>jij/u/hij/zij/het</b> = stem + <b>t</b>, plural = the full infinitive.',
      'Two catches. In a question with <b>jij</b> the -t disappears: <i>Kom jij?</i> And a stem already ending in -t never doubles it: <i>ik eet → hij eet</i>.'
    ],
    ex: [
      ['werken → ik werk, jij werkt, hij werkt', 'to work'],
      ['wij werken, jullie werken, zij werken', 'plural takes the infinitive'],
      ['Werk jij morgen?', 'Do you work tomorrow? (no -t after jij in a question)'],
      ['ik eet, jij eet, hij eet', 'stems in -t stay put']
    ]
  },
  {
    id: 'perfectum',
    title: 'Voltooid verleden tijd',
    en: 'Talking about the past',
    body: [
      'Everyday Dutch tells the past with <b>hebben</b> or <b>zijn</b> plus a past participle, and the participle goes last.',
      'Regular participles are <b>ge- + stem + -d/-t</b>. Use <b>-t</b> when the stem ends in one of the consonants in <i>’t kofschip</i> (t, k, f, s, ch, p), otherwise <b>-d</b>. Verbs of movement and change of state take <b>zijn</b>.'
    ],
    ex: [
      ['Ik heb gewerkt.', 'I have worked. / I worked.'],
      ['Wij hebben gefietst.', 'We cycled.'],
      ['Zij is naar huis gegaan.', 'She went home. (movement → zijn)'],
      ['Heb je het gezien?', 'Did you see it?']
    ],
    tip: '’t kofschip is the mnemonic every Dutch schoolchild learns. Memorise it once and the -d/-t choice is solved forever.'
  },
  {
    id: 'scheidbaar',
    title: 'Scheidbare werkwoorden',
    en: 'Separable verbs split up',
    body: [
      'Verbs like <b>opstaan, meegaan, aankomen, uitgaan, opbellen</b> break in two in a main clause: the verb is conjugated in slot two and the prefix drops to the very end.'
    ],
    ex: [
      ['opstaan → Ik sta om zeven uur op.', 'I get up at seven.'],
      ['meegaan → Gaat zij ook mee?', 'Is she coming along too?'],
      ['aankomen → De trein komt om acht uur aan.', 'The train arrives at eight.'],
      ['Ik wil vanavond uitgaan.', 'I want to go out tonight. (stays whole after a modal)']
    ]
  },
  {
    id: 'meervoud',
    title: 'Meervoud: -en of -s',
    en: 'Making plurals',
    body: [
      'Most nouns add <b>-en</b>. Words ending in an unstressed -el, -em, -en, -er, -je, and most loanwords, add <b>-s</b>.',
      'Spelling follows the sound: a short vowel doubles the consonant (<i>bus → bussen</i>), a long vowel written double drops one (<i>boot → boten</i>), and -f/-s often soften to -v/-z (<i>brief → brieven</i>, <i>huis → huizen</i>).'
    ],
    ex: [
      ['de stad → de steden', 'the city → the cities (irregular)'],
      ['de bus → de bussen', 'short vowel doubles the s'],
      ['de boot → de boten', 'double vowel loses one o'],
      ['het meisje → de meisjes', '-je takes -s'],
      ['het kind → de kinderen', 'the child → the children (irregular)']
    ]
  },
  {
    id: 'ontkenning',
    title: 'niet of geen?',
    en: 'Two ways to say no',
    body: [
      'Use <b>geen</b> before an indefinite noun — where English would say "no", "not a" or "not any". Use <b>niet</b> everywhere else: with verbs, adjectives, adverbs, and with definite nouns.'
    ],
    ex: [
      ['Ik heb geen tijd.', 'I have no time.'],
      ['Ik heb geen auto.', "I don't have a car."],
      ['Ik ken hem niet.', "I don't know him."],
      ['Het is niet duur.', 'It is not expensive.'],
      ['Dat is mijn fiets niet.', 'That is not my bike. (definite → niet)']
    ]
  },
  {
    id: 'adjectief',
    title: 'Het adjectief en zijn -e',
    en: 'When adjectives take -e',
    body: [
      'An adjective in front of a noun almost always gains <b>-e</b>. The one exception: a <b>het</b>-word with <b>een</b> (or no article) in front of it keeps the adjective bare.'
    ],
    ex: [
      ['de grote stad / een grote stad', 'the big city / a big city'],
      ['het grote huis', 'the big house (definite → -e)'],
      ['een groot huis', 'a big house (het-word + een → no -e)'],
      ['Het huis is groot.', 'The house is big. (after the noun → never -e)']
    ]
  },
  {
    id: 'u-jij',
    title: 'u, jij of jullie',
    en: 'Choosing how to address people',
    body: [
      '<b>jij/je</b> is the everyday singular you; <b>u</b> is the polite form for strangers, officials, older people and customer service; <b>jullie</b> is plural you.',
      'The Netherlands is informal by international standards — in a shop or with a colleague your own age, <b>je</b> is normal. With a doctor, a landlord or an older neighbour, open with <b>u</b> and let them offer <i>je</i>.'
    ],
    ex: [
      ['Hoe heet je?', "What's your name? (informal)"],
      ['Hoe heet u?', 'What is your name? (polite)'],
      ['Wilt u pinnen?', 'Would you like to pay by card?'],
      ['Waar komen jullie vandaan?', 'Where are you all from?']
    ]
  },
  {
    id: 'er',
    title: 'Het woordje er',
    en: 'The untranslatable "er"',
    body: [
      '<b>er</b> does four jobs: it is the dummy subject like English "there", it replaces a place, it carries a number ("I have three of them"), and it splits from prepositions in combinations like <i>erover, ermee, erop</i>.'
    ],
    ex: [
      ['Er staat een fiets voor de deur.', 'There is a bike in front of the door.'],
      ['Ik ben er nooit geweest.', 'I have never been there.'],
      ['Ik heb er drie.', 'I have three (of them).'],
      ['Ik denk er niet aan.', "I'm not thinking about it."]
    ],
    tip: 'Nobody masters "er" in the first year. Notice it in sentences you hear, and copy whole phrases.'
  },
  {
    id: 'verkleinwoord',
    title: 'Het verkleinwoord',
    en: 'Diminutives everywhere',
    body: [
      'Adding <b>-je</b> (or -tje, -pje, -kje) makes a word small, casual, or friendly — and the result is always a <b>het</b>-word. The Dutch use it constantly, and often not about size at all: <i>een biertje</i> is a normal beer, <i>een momentje</i> is a normal moment.'
    ],
    ex: [
      ['het kopje koffie', 'the cup of coffee'],
      ['een biertje, graag.', 'a beer, please.'],
      ['Nog een vraagje.', 'Just one small question.'],
      ['Een momentje!', 'One moment!']
    ]
  },
  {
    id: 'klanken',
    title: 'Uitspraak',
    en: 'The sounds that give you away',
    body: [
      '<b>ij</b> and <b>ei</b> are the same sound, close to English "eye" but tighter. <b>ui</b> has no English equivalent: round your lips for "oo" and try to say "ay". <b>eu</b> is the French "eu" in <i>deux</i>. <b>oe</b> is a plain "oo".',
      '<b>g</b> and <b>ch</b> are scraped in the throat; in the south and in Flanders they are softer. <b>sch</b> is s + that scrape (<i>school</i> = s-ch-ool), except in the ending <b>-isch</b>, which is simply "ies".',
      '<b>v</b> and <b>w</b>: the <b>w</b> is made with the lips only, between English v and w. A <b>j</b> is English "y". Final <b>-n</b> in -en endings is usually swallowed: <i>lopen</i> sounds like "lope".'
    ],
    ex: [
      ['ijs · trein', 'ice · train (same vowel)'],
      ['huis · uit · duim', 'house · out · thumb (the ui sound)'],
      ['goed · acht · school', 'good · eight · school (the scrape)'],
      ['logisch · typisch', 'logical · typical (-isch = "ies")'],
      ['Scheveningen', 'the classic test word']
    ],
    tip: 'Tap the speaker button on any card to hear it. If your device has a Dutch voice installed, it reads real nl-NL.'
  },
  {
    id: 'vraag',
    title: 'Vragen stellen',
    en: 'Building questions',
    body: [
      'Yes/no questions simply put the verb first. Question words come first and the verb follows straight after.',
      'Remember to drop the -t of <b>jij</b> forms when the verb comes before <i>jij</i>.'
    ],
    ex: [
      ['Kom je morgen?', 'Are you coming tomorrow?'],
      ['Heeft u een momentje?', 'Do you have a moment?'],
      ['Waar woon je?', 'Where do you live?'],
      ['Hoeveel kost dit?', 'How much does this cost?'],
      ['Wanneer begint de film?', 'When does the film start?']
    ]
  }
];
