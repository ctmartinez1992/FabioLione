const utils = require('./../utils');

module.exports = {
    ManowarCommand: function(receivedCommand) {
        const song = _build_manowar_song(receivedCommand);
        receivedCommand.channel.send(song);
    },
    ManowarCompleteCommand: function(receivedCommand) {
        const song = _build_manowar_song_complete(receivedCommand);
        receivedCommand.channel.send(song);
    },
    PMSongCommand: function(receivedCommand) {
        const song = _build_pm_song(receivedCommand);
        receivedCommand.channel.send(song);
    }
}

var _manowar_terms = {
    nouns: [
        "Battle", "Blood", "Death", "Enemies", "Fire", "Glory", "Hammer", "Honor", "Horse", "Kings",
        "Master", "Metal", "Power", "Steel", "Sword", "Warrior", "Wind"
    ],
    verbs: [
        "Attack", "Behold", "Burn", "Feel", "Fight", "Hail", "Kill", "Ride"
    ],
    adjectives: [
        "Bloody", "Brave", "Dead", "Fierce", "Heavy", "Loud", "Magic", "Mighty", "Proud", "Screaming",
        "Strong", "Victorious"
    ],
    subjects: [
        "I", "we", "they", "Brothers", "the Gods"
    ],
    adverbs: [
        "the", "all the", "my", "our", "their", "your", ""
    ],
    connectors: [
        "and", "and the", "with", "without", "against the"
    ]
};

var _pm_terms = {
    nouns: [
        "Battle", "Blood", "Death", "Thunder", "Fire", "Glory", "Dream", "Dragons", "Magic", "Kings",
        "Might", "Metal", "Power", "Steel", "Sword", "Warrior", "Wind", "Axe", "Hammer", "Land",
        "Mountains", "Eyes"
    ],
    verbs: [
        "Attack", "Behold", "Burn", "Feel", "Fight", "Hail", "Kill", "Ride", "Fly", "Slay", 
    ],
    adjectives: [
        "Bloody", "Brave", "Powerful", "Fierce", "Heavy", "Loud", "Magic", "Mighty", "Proud", "Screaming",
        "Strong", "Victorious", "Emerald", "Crimson", "Sapphire", "Evil"
    ],
    subjects: [
        "I", "we", "they"
    ],
    adverbs: [
        "the", "for the", "for", "of", ""
    ],
    connectors: [
        "and", "and the", "with", "without", "against the", "to the"
    ]
};

function _build_verse(terms, short) {
    var verse = [];
    if (utils.GetRandomIntInRange(0, 2) === 0) {
        verse.push(utils.ShuffleArray(terms.subjects)[0]);
    }

    verse.push(utils.ShuffleArray(terms.verbs)[0]);
    verse.push(utils.ShuffleArray(terms.adverbs)[0]);
  
    if (utils.GetRandomIntInRange(0, 2) === 0) {
        verse.push(utils.ShuffleArray(terms.adjectives)[0]);
    }

    verse.push(utils.ShuffleArray(terms.nouns)[0]);

    if (utils.GetRandomIntInRange(0, 2) === 0) {
        verse.push(utils.ShuffleArray(terms.connectors)[0]);
        if (utils.GetRandomIntInRange(0, 3) === 3) {
            verse.push(utils.ShuffleArray(terms.adjectives)[0]);
        }
        verse.push(utils.ShuffleArray(terms.nouns)[0]);
    }

    if (utils.GetRandomIntInRange(0, 4) === 0 && !short) {
        verse.push(utils.ShuffleArray(terms.connectors)[0]);
        if (utils.GetRandomIntInRange(0, 3) === 3) {
            verse.push(utils.ShuffleArray(terms.adjectives)[0]);
        }
        verse.push(utils.ShuffleArray(terms.nouns)[0]);
    }

    verse = utils.CompactArray(verse);

    return verse;
};
  
const _build_manowar_song = (receivedCommand) => {
    const title = _build_verse(_manowar_terms, true);
    const lyrics = [];
    for (let i = 0; i < 4; i++) {
        lyrics.push(_build_verse(_manowar_terms, false));
    }

    return _prettify_song({
        title: title,
        lyrics: lyrics.join("\n")
    });
};
  
const _build_manowar_song_complete = (receivedCommand) => {
    const title = _build_verse(_manowar_terms, true);
    const lyrics = [];
    for (let i = 0; i < 4; i++) {
        lyrics.push(_build_verse(_manowar_terms, false));
    }
    lyrics.push("");
    lyrics.push(title);
    lyrics.push(_build_verse(_manowar_terms, false));
    lyrics.push(title);
    lyrics.push(_build_verse(_manowar_terms, false));
    lyrics.push("");
    for (let i = 0; i < 4; i++) {
        lyrics.push(_build_verse(_manowar_terms, false));
    }
    lyrics.push("");
    for (let i = 0; i < 4; i++) {
        lyrics.push(title);
    }

    return _prettify_song({
        title: title,
        lyrics: lyrics.join("\n")
    });
};
  
const _build_pm_song = (receivedCommand, terms) => {
    return _build_verse(_pm_terms, true).join(" ");
};

const _prettify_song = (song) => {
    song.title = song.title.join(" ");
    var string = "***" + song.title + "***\n\n";
    string += song.lyrics.split(',').join(' ');
    return string;
};