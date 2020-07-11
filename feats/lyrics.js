const request = require('request');

const utils = require('./../utils');

module.exports = {
    LyricsCommand: function(args, receivedCommand) {
        if (args.length === 0) {
            receivedCommand.channel.send(`Fabio needs a name fool! Lyrics of what?`);
        } else if (args.length >= 1) {
            var arg = args[0];

            request.get({
                url: "https://www.lyrics.rip/s/Rihanna",
                json: true,
                headers: { 'User-Agent': 'request' }
            }, (err, res, data) => {
                if (err) {
                    console.log('Error: '.concat(err, ' -- Quitting function.'));
                } else if (res.statusCode !== 200) {
                    console.log('Status: '.concat(res.statusCode, ' -- Quitting function.'));
                } else {
                    console.log('URL ('.concat("https://www.lyrics.rip/s/Rihanna", ') retrieved data successfully.'));
                    console.log(data);
                    receivedCommand.channel.send("did something");
                }
            });
        }
    },
}
