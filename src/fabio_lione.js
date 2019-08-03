'use strict';

const request = require('request');
const Discord = require('discord.js');
const client = new Discord.Client();

const bot_secret_token = 'MjMxNDEyNTc5NzY1OTc3MDg5.XUVXgA.kN4Pm_CWbLEYUQhRGhnlyZVa3uI'
const chat_channel_id = '469807990833414154';

//NOTE (carlos): Set to true if you want it disabled on start-up. This is because I'm using the toggle function on the ready callback.
var weeklyReleasesIsActive = false;
var weeklyReleasesIntervalDefault = 60000;
var weeklyReleasesInterval = weeklyReleasesIntervalDefault;
var weeklyReleasesFuncObj = null;
var lastWeeklyReleasesSharedID = 0;
const url = 'https://www.reddit.com/r/powermetal/new.json?sort=new';

client.login(bot_secret_token);

client.on('ready', () => {
    console.log('Connected as ', client.user.tag);
    ToggleWeeklyReleasesFeature();
});

client.on('message', (receivedCommand) => {
    // Ignore your own messages for obvious security reasons.
    if (receivedCommand.author === client.user) {
        return;
    }
    if (receivedCommand.content.startsWith("!")) {
        processCommand(receivedCommand);
    }
});

function ToggleWeeklyReleasesFeature() {
    weeklyReleasesIsActive = !weeklyReleasesIsActive;
    if (weeklyReleasesIsActive) {
        console.log('Turning weekly releases feature on. Interval (', millisToMinutesAndSeconds(weeklyReleasesInterval), ').');
        weeklyReleasesFuncObj = setInterval(ProcessWeeklyReleases, weeklyReleasesInterval);
    } else {
        if (weeklyReleasesFuncObj) {
            console.log('Turning weekly releases feature off.');
            clearInterval(weeklyReleasesFuncObj);
        }
    }
}

function CleanWeeklyReleasesInterval(newInterval) {
    if (newInterval < 1) {
        newInterval = 1;
    } else if (newInterval > 1000) {
        newInterval = 1000;
    }

    return newInterval * 1000;
}

function SetWeeklyReleasesInterval(newInterval) {
    console.log('Setting weekly interval from '.concat(millisToMinutesAndSeconds(weeklyReleasesInterval), ' to ', millisToMinutesAndSeconds(newInterval)));
    weeklyReleasesInterval = newInterval;
    clearInterval(weeklyReleasesFuncObj);
    weeklyReleasesFuncObj = setInterval(ProcessWeeklyReleases, weeklyReleasesInterval);
}

function ProcessWeeklyReleases() {
    console.log("Getting the last 25 posts and searching for a fresh weekly releases thread...");
    request.get({
        url: url,
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
        if (err) {
            console.log('Error: '.concat(err, ' -- Quitting function.'));
        } else if (res.statusCode !== 200) {
            console.log('Status: '.concat(res.statusCode, ' -- Quitting function.'));
        } else {
            console.log('URL ('.concat(url, ') retrieved data successfully.'));

            const lastRedditPost = data.data.children[0].data;
            console.log('Last reddit post: '.concat(lastRedditPost.title));

            const channelToInform = client.channels.get(chat_channel_id);
            if (lastWeeklyReleasesSharedID !== lastRedditPost.id) {
                //if (lastRedditPost.title.toLowerCase().trim().includes("this week in power metal releases")) {
                    console.log('Old stored ID: '.concat(lastWeeklyReleasesSharedID, ' -- New stored ID: ', lastRedditPost.id));
                    lastWeeklyReleasesSharedID = lastRedditPost.id;

                    console.log('Sending this URL ('.concat(lastRedditPost.url, ') to channel (name here).'));
                    channelToInform.send(lastRedditPost.url);
                //}
            }
            else {
                channelToInform.send("Just checked for a new weekly release, but nothing new.");
            }
        }
    });
}

// /$$$$$$\                                                                  $$\           
//|$$  __$$\                                                                 $$ |          
//|$$ /  \__| $$$$$$\  $$$$$$\$$$$\  $$$$$$\$$$$\   $$$$$$\  $$$$$$$\   $$$$$$$ | $$$$$$$\ 
//|$$ |      $$  __$$\ $$  _$$  _$$\ $$  _$$  _$$\  \____$$\ $$  __$$\ $$  __$$ |$$  _____|
//|$$ |      $$ /  $$ |$$ / $$ / $$ |$$ / $$ / $$ | $$$$$$$ |$$ |  $$ |$$ /  $$ |\$$$$$$\  
//|$$ |  $$\ $$ |  $$ |$$ | $$ | $$ |$$ | $$ | $$ |$$  __$$ |$$ |  $$ |$$ |  $$ | \____$$\ 
// \$$$$$$  |\$$$$$$  |$$ | $$ | $$ |$$ | $$ | $$ |\$$$$$$$ |$$ |  $$ |\$$$$$$$ |$$$$$$$  |
//  \______/  \______/ \__| \__| \__|\__| \__| \__| \_______|\__|  \__| \_______|\_______/ 

function processCommand(receivedCommand) {
    let fullCommand = receivedCommand.content.substr(1);
    let splitCommand = fullCommand.split(' ');
    let command = splitCommand[0];
    let args = splitCommand.slice(1);

    console.log('Processing ('.concat(command, ') with arguments (', args, ').'));
    if (command === "help") {
        HelpCommand(args, receivedCommand);
    } else if (command === "toggle") {
        ToggleCommand(args, receivedCommand);
    } else if (command === "set") {
        SetCommand(args, receivedCommand);
    } else {
        receivedCommand.channel.send("Unknown command. Try '!help' or '!kys'");
    }
}

function HelpCommand(args, receivedCommand) {
    if (args.length <= 0) {
        receivedCommand.channel.send(`\n
List of available commands:
    !help: A list of all commands and an explanation for each.
        Use: '!help command_name' for a detailed explanation of the command.
    !toggle: Toggle features on or off.
    !set: Change internal variables to customize behavior.`);
    } else {
        if (args[0] === 'help') {
            receivedCommand.channel.send(`This command will help you out. However, asking for help on the help command is ridiculous.`);
        } else if (args[0] === 'toggle') {
            receivedCommand.channel.send(`Toggle a feature on or off. Use: '!toggle list' to see what can be toggled.`);
        } else if (args[0] === 'set') {
            receivedCommand.channel.send(`Set a variable value to something else. Use: '!set list' to see what can be toggled.`);
        } else {
            receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '!help' command. Use only '!help'.`));
        }
    }
}

function ToggleCommand(args, receivedCommand) {
    if (args.length <= 0) {
        receivedCommand.channel.send(`\n
Toggle features on or off. Use:
    '!toggle feature_name' to toggle on or off a feature.
    '!toggle list' to list all toggleable features.`
        );
    } else {
        if (args[0] === 'list') {
            receivedCommand.channel.send(`\n
This is a list of all toggleable features:
    '!toggle weekly' to turn of/off the share weekly release thread feature.`);
        } else if (args[0] === 'weekly') {
            if (args.length >= 2) {
                newInterval = parseInt(args[1], 10) || weeklyReleasesIntervalDefault;
                SetWeeklyReleasesInterval(newInterval);
            } else {
                ToggleWeeklyReleasesFeature();
                receivedCommand.channel.send('Turning weekly releases feature '.concat((weeklyReleasesIsActive) ? 'on.' : 'off.'));
            }
        } else {
            receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '!toggle' command. Use '!help toggle' for more information.`));
        }
    }
}

function SetCommand(args, receivedCommand) {
    if (args.length <= 0) {
        receivedCommand.channel.send(`\n
Allows you customize certain behaviors. Use:
    '!set list' for a list of all variables that can be set.`);
    } else {
        if (args.length === 1) {
            if (args[0] === 'list') {
                receivedCommand.channel.send(`\n
This is a list of all settable variables:
    '!set weekly interval value' to set the interval with which a new weekly release thread is checked for. Replace 'value' with an integer from 1 to 1000. This value is in seconds.`);
            }
            else if (args[0] === 'weekly') {
                receivedCommand.channel.send(`Argument (`.concat(args[0], `) needs more arguments. Use '!help set' for more information.`));
            } else {
                receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '!toggle' command. Use '!help toggle' for more information.`));
            }
        } else if (args.length === 3) {
            if (args[0] === 'weekly' && args[1] === 'interval') {
                const newInterval = CleanWeeklyReleasesInterval(parseInt(args[2], 10)) || weeklyReleasesIntervalDefault;
                receivedCommand.channel.send('Setting weekly releases interval from '.concat(millisToMinutesAndSeconds(weeklyReleasesInterval), ' to ', millisToMinutesAndSeconds(newInterval)));
                SetWeeklyReleasesInterval(newInterval);
            }
        } else {
            receivedCommand.channel.send(`Invalid amount of arguments. Use '!help set' for more information.`);
        }
    }
}

///$$\   $$\   $$\     $$\ $$\ $$\   $$\     $$\                     
//|$$ |  $$ |  $$ |    \__|$$ |\__|  $$ |    \__|                    
//|$$ |  $$ |$$$$$$\   $$\ $$ |$$\ $$$$$$\   $$\  $$$$$$\   $$$$$$$\ 
//|$$ |  $$ |\_$$  _|  $$ |$$ |$$ |\_$$  _|  $$ |$$  __$$\ $$  _____|
//|$$ |  $$ |  $$ |    $$ |$$ |$$ |  $$ |    $$ |$$$$$$$$ |\$$$$$$\  
//|$$ |  $$ |  $$ |$$\ $$ |$$ |$$ |  $$ |$$\ $$ |$$   ____| \____$$\ 
// \$$$$$$  |  \$$$$  |$$ |$$ |$$ |  \$$$$  |$$ |\$$$$$$$\ $$$$$$$  |
//  \______/    \____/ \__|\__|\__|   \____/ \__| \_______|\_______/ 

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
}

//⚒⚒⚒Madwave is forever⚒⚒⚒