'use strict';

const config = require('./config');

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(config.bot_secret);

client.on('ready', () => {
    console.log('Connected as ', client.user.tag, ' ⚒(Maintenance)⚒');
});

client.on('message', (receivedCommand) => {
    // Ignore your own messages for obvious security reasons.
    if (receivedCommand.author === client.user) {
        return;
    }
    if (receivedCommand.content.startsWith("\\")) {
        processCommand(receivedCommand);
    }
});

function processCommand(receivedCommand) {
    receivedCommand.channel.send("Fabio Lione is performing guest vocals in some band.");
}

//⚒⚒⚒Madwave is forever⚒⚒⚒\\