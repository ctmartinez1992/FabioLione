'use strict';

const config = require('./config');

const Discord = require('discord.js');
const client = new Discord.Client();

const chat_channel_ids = ['469807990833414154', '230359936566165506'];

client.login(config.bot_secret);

client.on('ready', () => {
    console.log('Connected as ', client.user.tag);
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

// /$$$$$$\                                                                  $$\           
//|$$  __$$\                                                                 $$ |          
//|$$ /  \__| $$$$$$\  $$$$$$\$$$$\  $$$$$$\$$$$\   $$$$$$\  $$$$$$$\   $$$$$$$ | $$$$$$$\ 
//|$$ |      $$  __$$\ $$  _$$  _$$\ $$  _$$  _$$\  \____$$\ $$  __$$\ $$  __$$ |$$  _____|
//|$$ |      $$ /  $$ |$$ / $$ / $$ |$$ / $$ / $$ | $$$$$$$ |$$ |  $$ |$$ /  $$ |\$$$$$$\  
//|$$ |  $$\ $$ |  $$ |$$ | $$ | $$ |$$ | $$ | $$ |$$  __$$ |$$ |  $$ |$$ |  $$ | \____$$\ 
// \$$$$$$  |\$$$$$$  |$$ | $$ | $$ |$$ | $$ | $$ |\$$$$$$$ |$$ |  $$ |\$$$$$$$ |$$$$$$$  |
//  \______/  \______/ \__| \__| \__|\__| \__| \__| \_______|\__|  \__| \_______|\_______/ 

function processCommand(receivedCommand) {
    receivedCommand.channel.send("Fabio Lione is performing guest vocals in some band.");
}

//⚒⚒⚒Madwave is forever⚒⚒⚒