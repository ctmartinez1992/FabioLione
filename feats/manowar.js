const utils = require('./../utils');

module.exports = {
    ManowarCommand: function(receivedCommand) {
        const song = _build_song(receivedCommand);
        receivedCommand.channel.send(song);
    }
}

var terms = {
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

function _build_verse(short) {
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
  
const _build_song = (receivedCommand) => {
    const title = _build_verse(true);
    const lyrics = [];
    for (let i = 0; i < 4; i++) {
        lyrics.push(_build_verse());
    }

    /*
    lyrics.push("");
    lyrics.push(title);
    lyrics.push(_build_verse());
    lyrics.push(title);
    lyrics.push(_build_verse());
    lyrics.push("");
    for (let i = 0; i < 4; i++) {
        lyrics.push(_build_verse());
    }
  
    lyrics.push("");
    for (let i = 0; i < 4; i++) {
        lyrics.push(title);
    }
    */

    return _prettify_song({
        title: title,
        lyrics: lyrics.join("\n")
    });
};

const _prettify_song = (song) => {
    song.title = song.title.join(" ");
    var string = "***" + song.title + "***\n\n";
    string += song.lyrics.split(',').join(' ');
    return string;
};