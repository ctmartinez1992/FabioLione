const request = require('request');

const utils = require('./../utils');

module.exports = {
    LyricsCommand: function(args, receivedCommand) {
        if (args.length === 0) {
            receivedCommand.channel.send(`Fabio needs a name fool! Lyrics of whom?`);
        } else if (args.length >= 1) {
            var arg = " ";
            for (var i=0; i<args.length; i++) {
                arg = arg.concat(args[i], " ");
            }
            arg = arg.trim();

            var url = "https://www.lyrics.rip/generate?q=".concat(arg);

            request.get({
                url,
                json: true,
                headers: { 'User-Agent': 'request' }
            }, (err, res, data) => {
                if (err) {
                    console.log('Error: '.concat(err, ' -- Quitting function.'));
                } else if (res.statusCode !== 200) {
                    console.log('Status: '.concat(res.statusCode, ' -- Quitting function.'));
                } else {
                    console.log('URL ('.concat(url, ') retrieved data successfully.'));
                    receivedCommand.channel.send(data);
                }
            });
        }
    },
}
