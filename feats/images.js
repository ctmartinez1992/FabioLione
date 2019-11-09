const utils = require('./../utils');

const request = require('request');

lastCorgiImage = "";
lastShibeImage = "";
lastWrongImage = "";
lastPatheticImage = "";
lastBrutalImage = "";
lastRiffsImage = "";

module.exports = {
    CorgiCommand: function(client, receivedCommand, list) {
        lastCorgiImage = _send_image_from_subreddit_list(client, receivedCommand, list, lastCorgiImage);
    },
    ShibeCommand: function(client, receivedCommand, list) {
        lastShibeImage = _send_image_from_subreddit_list(client, receivedCommand, list, lastShibeImage);
    },
    WrongCommand: function(client, receivedCommand, list) {
        lastWrongImage = _send_image_from_link_list(client, receivedCommand, list, lastWrongImage);
    },
    PatheticCommand: function(client, receivedCommand, list) {
        lastPatheticImage = _send_image_from_link_list(client, receivedCommand, list, lastPatheticImage);
    },
    BrutalCommand: function(client, receivedCommand, list) {
        lastBrutalImage = _send_image_from_link_list(client, receivedCommand, list, lastBrutalImage);
    },
    RiffsCommand: function(client, receivedCommand, list) {
        lastRiffsImage = _send_image_from_subreddit_list(client, receivedCommand, list, lastRiffsImage);
    },
    ArmpitCommand: function(client, receivedCommand) {
        _send_image(client, receivedCommand, "https://i.imgur.com/Abzwjg7.png");
    },
    BingoCommand: function(client, receivedCommand) {
        _send_image(client, receivedCommand, "https://cdn.discordapp.com/attachments/230359936566165506/623600237604241411/bingoliva_final.png");
    },
    OlivaCommand: function(client, receivedCommand) {
        _send_image(client, receivedCommand, "https://cdn.discordapp.com/attachments/230359936566165506/642448559446163481/unknown.png");
    }
}

//TODO (carlos): This should only get images and videos.
function _send_image_from_subreddit_list(client, receivedCommand, list, lastImage) {
    const channelID = receivedCommand.channel.id; 

    var url = lastImage;
    while(url === lastImage) {
        const randomListID = utils.GetRandomIntInRange(0, list.length - 1);
        url = list[randomListID];
    }

    console.log("Getting a fresh image from ".concat(url));
    return request.get({
        url: url,
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
        if (err) {
            console.log('Error: '.concat(err, ' -- Quitting function.'));
            return null;
        } else if (res.statusCode !== 200) {
            console.log('Status: '.concat(res.statusCode, ' -- Quitting function.'));
            return null;
        } else {
            console.log('URL ('.concat(url, ') retrieved data successfully.'));

            const redditPost = data[0].data.children[0].data;
            if (redditPost) {   
                console.log('Sending this URL ('.concat(redditPost.url, ') to channel.'));
                client.channels.get(channelID).send(redditPost.url);
            }
        }
    });
}

function _send_image_from_link_list(client, receivedCommand, list, lastImage) {
    const channelID = receivedCommand.channel.id; 

    var url = lastImage;
    while(url === lastImage) {
        const randomListID = utils.GetRandomIntInRange(0, list.length - 1);
        url = list[randomListID];
    }

    console.log('Sending this URL ('.concat(url, ') to channel.'));
    client.channels.get(channelID).send(url);

    return url
}

function _send_image(client, receivedCommand, url) {
    const channelID = receivedCommand.channel.id; 

    console.log('Sending this URL ('.concat(url, ') to channel.'));
    client.channels.get(channelID).send(url);

    return url
}
