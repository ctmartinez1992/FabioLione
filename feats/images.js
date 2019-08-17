const utils = require('./../utils');
const config = require('./../config');

const request = require('request');

module.exports = {
    CorgiCommand: function(client, args, receivedCommand) {
        _send_image_from_subreddit_list(client, receivedCommand, config.corgi_list);
    },
    ShibeCommand: function(client, args, receivedCommand) {
        _send_image_from_subreddit_list(client, receivedCommand, config.shibe_list);
    },
    WrongCommand: function(client, args, receivedCommand) {
        _send_image_from_link_list(client, receivedCommand, config.wrong_list);
    },
    PatheticCommand: function(client, args, receivedCommand) {
        _send_image_from_link_list(client, receivedCommand, config.pathetic_list);
    }
}

//TODO (carlos): This should only get images and videos.
function _send_image_from_subreddit_list(client, receivedCommand, list) {
    const channelID = receivedCommand.channel.id; 

    const randomListID = utils.GetRandomIntInRange(0, list.length - 1);
    const url = list[randomListID];

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

function _send_image_from_link_list(client, receivedCommand, list) {
    const channelID = receivedCommand.channel.id; 

    const randomListID = utils.GetRandomIntInRange(0, list.length - 1);
    const url = list[randomListID];

    console.log('Sending this URL ('.concat(url, ') to channel.'));
    client.channels.get(channelID).send(url);
}