'use strict';

const config = require('./config');

const request = require('request');

const Discord = require('discord.js');
const client = new Discord.Client();

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: config.database_url,
    ssl: true
});

//NOTE (carlos): Set to true if you want it disabled on start-up. This is because I'm using the toggle function on the ready callback.
var weeklyReleasesIsActive = false;
var weeklyReleasesInterval = config.weekly_releases_interval_default;
var weeklyReleasesFuncObj = null;
var lastGeneralID = 0;              //General Discussions thread.
var lastThisWeekID = 0;             //This Week in Power Metal Releases thread.
var lastListeningID = 0;            //This Week I've been Listening thread.
var lastRecommendationsID = 0;      //Recommendations for the Week thread.

client.login(config.bot_secret);

client.on('ready', async () => {
    if (config.is_in_maintenance) {
        console.log('Connected as ', client.user.tag, ' (Down for Maintenance)');
    } else {
        console.log('Connected as ', client.user.tag);

        ToggleWeeklyReleasesFeature();

        const clientDB = await pool.connect(); {
            var result = await clientDB.query('SELECT * FROM last_posts');
            result.rows.forEach(function(row) {
                if (row.name === "general_discussion") {
                    lastGeneralID = row.post_id;
                } else if (row.name === "weekly_releases") {
                    lastThisWeekID = row.post_id;
                } else if (row.name === "been_listening") {
                    lastListeningID = row.post_id;
                } else if (row.name === "weekly_recommendations") {
                    lastRecommendationsID = row.post_id;
                }
            });

            result = await clientDB.query('SELECT * FROM reminders');
            result.rows.forEach(async function(row) {
                if (row.expiration_date.getTime() < (new Date()).getTime()) {
                    const query = `DELETE FROM reminders WHERE reminders.id = `.concat(row.id, ";");
                    await clientDB.query(query);
                } else {
                    _SetReminder(row.user_id, row.user_name, row.channel_id, row.creation_date, row.expiration_date, row.content, false);
                }
            });
        } clientDB.release();
    }
});

client.on('message', (receivedCommand) => {
    // Ignore your own messages for obvious security reasons.
    if (receivedCommand.author === client.user) {
        return;
    }
    if (receivedCommand.content.startsWith("\\")) {
        if (config.is_in_maintenance) {
            receivedCommand.channel.send(`Fabio Lione is performing guest vocals in some band. He will return promptly.`);
        } else {
            processCommand(receivedCommand);
        }
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
    if (newInterval < 60) {
        newInterval = 60;
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

async function _UpdateLastPost(new_post_id, name) {
    const clientDB = await pool.connect(); {
        const query = `UPDATE last_posts SET post_id = '`.concat(new_post_id, `' WHERE name ='`, name, `';`);
        const result = await clientDB.query(query);
    } clientDB.release();
}

function ProcessWeeklyReleases() {
    console.log("Getting the last 3 posts and searching for a fresh weekly releases thread...");
    request.get({
        url: config.weekly_releases_reddit_url,
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, res, data) => {
        if (err) {
            console.log('Error: '.concat(err, ' -- Quitting function.'));
        } else if (res.statusCode !== 200) {
            console.log('Status: '.concat(res.statusCode, ' -- Quitting function.'));
        } else {
            console.log('URL ('.concat(config.weekly_releases_reddit_url, ') retrieved data successfully.'));

            //NOTE (carlos): A bit of an odd choice, but I don't want to just check the last post.
            //As a safeguard, I'm going to be checking the last three posts, just to make sure that there was no abnormal amount of posts in a short amount of time.
            for (var i = 2; i >= 0; --i) {
                const redditPost = data.data.children[i].data;
                console.log('Checking reddit post: '.concat(redditPost.title));

                const trimmedTitle = redditPost.title.toLowerCase().trim();

                var _generalID = lastGeneralID;
                var _thisWeekID = lastThisWeekID;
                var _listeningID = lastListeningID;
                var _recommendationsID = lastRecommendationsID;

                lastGeneralID = _ProcessWeeklyRelease(lastGeneralID, redditPost.id, trimmedTitle, "general discussion", redditPost.url);
                lastThisWeekID = _ProcessWeeklyRelease(lastThisWeekID, redditPost.id, trimmedTitle, "this week in power metal releases", redditPost.url);
                lastListeningID = _ProcessWeeklyRelease(lastListeningID, redditPost.id, trimmedTitle, "this week i've been listening to...", redditPost.url);
                lastRecommendationsID = _ProcessWeeklyRelease(lastRecommendationsID, redditPost.id, trimmedTitle, "recommendations for the week", redditPost.url);

                if (_generalID !== lastGeneralID)                       _UpdateLastPost(lastGeneralID, "general_discussion");
                if (_thisWeekID !== lastThisWeekID)                     _UpdateLastPost(lastThisWeekID, "weekly_releases");
                if (_listeningID !== lastListeningID)                   _UpdateLastPost(lastListeningID, "been_listening");
                if (_recommendationsID !== lastRecommendationsID)       _UpdateLastPost(lastRecommendationsID, "weekly_recommendations");
            }
        }
    });
}

function _ProcessWeeklyRelease(lastID, redditPostID, trimmedTitle, stringToCompare, redditPostURL) {
    if (lastID !== redditPostID && trimmedTitle.includes(stringToCompare)) {
        console.log('Old stored ID: '.concat(lastID, ' -- New stored ID: ', redditPostID));

        config.chat_channel_ids.forEach(function(id) {
            console.log('Sending this URL ('.concat(redditPostURL, ') to channel.'));
            client.channels.get(id).send(redditPostURL);
        });
        return redditPostID;
    }
    return lastID;
}

async function _SetReminder(user_id, user_name, channel_id, creation_date, expiration_date, content, use_creation_date) {
    var rowID = 0;

    const clientDB = await pool.connect(); {
        const query_text = 'INSERT INTO reminders(user_id, user_name, channel_id, creation_date, expiration_date, content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const query_values = [user_id, user_name, channel_id, creation_date.toGMTString(), expiration_date.toGMTString(), content];
        const result = await clientDB.query(query_text, query_values);
        rowID = result.rows[0].id;
    } clientDB.release();

    var timeout = 0;
    if (use_creation_date) {
        timeout = expiration_date.getTime() - creation_date.getTime();
    } else {
        timeout = expiration_date.getTime() - (new Date).getTime();
    }

    setTimeout((async () => {
        client.channels.get(channel_id).send("Hey ".concat(user_name + ", don't forget to " + content));

        const clientDB = await pool.connect(); {
            const query_text = `DELETE FROM reminders WHERE reminders.id = `.concat(rowID, ";");
            await clientDB.query(query_text);
        } clientDB.release();
    }), timeout);
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
    } else if (command === "corgi" || command === "corgo") {
        CorgiCommand(args, receivedCommand);
    } else if (command === "shibe" || command === "shiba") {
        ShibeCommand(args, receivedCommand);
    } else if (command === "sabaton") {
        SabatonCommand(args, receivedCommand);
    } else if (command === "remind") {
        RemindCommand(args, receivedCommand);
    }
}

function HelpCommand(args, receivedCommand) {
    if (args.length <= 0) {
        receivedCommand.channel.send(`\n
Fabio Lione will tell you when a new weekly release thread was posted.
List of available commands:
    \\help: A list of all commands and an explanation for each.
        Use: '\\help command_name' for a detailed explanation of the command.
    \\toggle: Toggle features on or off.
    \\set: Change internal variables to customize behavior.
    \\corgi or \\corgo: Fresh corgi content.
    \\shibe or \\shiba: Fresh shibe content.
    \\sabaton: For some sick dududu beats.
    \\remind: To help you remind of whatever you want.`);
    } else {
        if (args[0] === 'help') {
            receivedCommand.channel.send(`This command will help you out. However, asking for help on the help command is ridiculous.`);
        } else if (args[0] === 'toggle') {
            receivedCommand.channel.send(`Toggle a feature on or off. Use: '\\toggle list' to see what can be toggled.`);
        } else if (args[0] === 'set') {
            receivedCommand.channel.send(`Set a variable value to something else. Use: '\\set list' to see what can be toggled.`);
        } else if (args[0] === 'corgi' || args[0] === 'corgo') {
            receivedCommand.channel.send(`Searches reddit for a good ol' corgo.`);
        } else if (args[0] === 'shibe' || args[0] === 'shiba') {
            receivedCommand.channel.send(`Searches reddit for a good ol' shiba.`);
        } else if (args[0] === 'sabaton') {
            receivedCommand.channel.send(`Then the winged hussars arrived!`);
        } else if (args[0] === 'remind') {
            receivedCommand.channel.send(`\n
Fabio will guestfully remind you of whatever you need, no matter how dirty ( ͡° ͜ʖ ͡°). Use:
\\remind in time_value time_granularity to reminder_content
    * time_value can be any positive integer above 0;
    * time_granularity can be minute(s), hour(s), day(s), month(s), year(s);
    * reminder_content is what you want to be reminded of;
    * NOTE: The 'in' and 'to' words need to be there, they don't need to be in or to respectively, they just need to be a word.`);
        } else {
            receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '\\help' command. Use only '\\help'.`));
        }
    }
}

function ToggleCommand(args, receivedCommand) {
    if (args.length <= 0) {
        receivedCommand.channel.send(`\n
Toggle features on or off. Use:
    '\\toggle feature_name' to toggle on or off a feature.
    '\\toggle list' to list all toggleable features.`
        );
    } else {
        if (args[0] === 'list') {
            receivedCommand.channel.send(`\n
This is a list of all toggleable features:
    '\\toggle weekly' to turn of/off the share weekly release thread feature.`);
        } else if (args[0] === 'weekly') {
            if (args.length >= 2) {
                newInterval = parseInt(args[1], 10) || weeklyReleasesIntervalDefault;
                SetWeeklyReleasesInterval(newInterval);
            } else {
                ToggleWeeklyReleasesFeature();
                receivedCommand.channel.send('Turning weekly releases feature '.concat((weeklyReleasesIsActive) ? 'on.' : 'off.'));
            }
        } else {
            receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '\\toggle' command. Use '\\help toggle' for more information.`));
        }
    }
}

function SetCommand(args, receivedCommand) {
    if (args.length <= 0) {
        receivedCommand.channel.send(`\n
Allows you customize certain behaviors. Use:
    '\\set list' for a list of all variables that can be set.`);
    } else {
        if (args.length === 1) {
            if (args[0] === 'list') {
                receivedCommand.channel.send(`\n
This is a list of all settable variables:
    '\\set weekly interval value' to set the interval with which a new weekly release thread is checked for. Replace 'value' with an integer from 1 to 1000. This value is in seconds.`);
            }
            else if (args[0] === 'weekly') {
                receivedCommand.channel.send(`Argument (`.concat(args[0], `) needs more arguments. Use '\\help set' for more information.`));
            } else {
                receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '\\toggle' command. Use '\\help toggle' for more information.`));
            }
        } else if (args.length === 3) {
            if (args[0] === 'weekly' && args[1] === 'interval') {
                const newInterval = CleanWeeklyReleasesInterval(parseInt(args[2], 10)) || weeklyReleasesIntervalDefault;
                receivedCommand.channel.send('Setting weekly releases interval from '.concat(millisToMinutesAndSeconds(weeklyReleasesInterval), ' to ', millisToMinutesAndSeconds(newInterval)));
                SetWeeklyReleasesInterval(newInterval);
            }
        } else {
            receivedCommand.channel.send(`Invalid amount of arguments. Use '\\help set' for more information.`);
        }
    }
}

function CorgiCommand(args, receivedCommand) {
    SendImageFromSubredditList(receivedCommand, config.corgi_list);
}

function ShibeCommand(args, receivedCommand) {
    SendImageFromSubredditList(receivedCommand, config.shibe_list);
}

function SabatonCommand(args, receivedCommand) {
    const channelID = receivedCommand.channel.id;

    var rng = getRandomIntInRange(6, 24);
    var string = "";
    var skip = false;
    
    for (var i = 0; i < rng; i++) {
        var style = getRandomIntInRange(1, 8);
        var space = getRandomIntInRange(1, 4);

        if (style === 1) {
            string += "du";
        } else if (style === 2) {
            string += "_du_";
        } else if (style === 3) {
            string += "__du__";
        } else if (style === 4) {
            string += "~~du~~";
        } else if (style === 5) {
            string += "DU";
        } else if (style === 6) {
            string += "*DU*";
        } else if (style === 7) {
            string += "__DU__";
        } else if (style === 8) {
            string += "~~DU~~";
        }
    
        if (space === 1) {
            string += " ";
        }
    }

    client.channels.get(channelID).send(string);
}

function _RemindValidateTimeValue(value) {
    return /^\+?[1-9][\d]*$/.test(value);
}

function _RemindValidateTimeGranularity(value) {
    return (value === "minute" || value === "minutes" ||
            value === "hour" || value === "hours" ||
            value === "day" || value === "days" ||
            value === "month" || value === "months" ||
            value === "year" || value === "years");
}

const MILLIS_IN_YEAR   = 31557600 * 1000;
const MILLIS_IN_MONTH  = 2678400 * 1000;
const MILLIS_IN_DAY    = 86400 * 1000;
const MILLIS_IN_HOUR   = 3600 * 1000;
const MILLIS_IN_MINUTE = 60 * 1000;
function _RemindComputeExpirationDate(creation_date, time_value, time_granularity) {
    if (time_granularity === "year" || time_granularity === "years") {
        return new Date(creation_date.getTime() + (MILLIS_IN_YEAR * time_value));
    } else if (time_granularity === "month" || time_granularity === "months") {
        return new Date(creation_date.getTime() + (MILLIS_IN_MONTH * time_value));
    } else if (time_granularity === "day" || time_granularity === "days") {
        return new Date(creation_date.getTime() + (MILLIS_IN_DAY * time_value));
    } else if (time_granularity === "hours" || time_granularity === "hours") {
        return new Date(creation_date.getTime() + (MILLIS_IN_HOUR * time_value));
    } else if (time_granularity === "minute" || time_granularity === "minutes") {
        return new Date(creation_date.getTime() + (MILLIS_IN_MINUTE * time_value));
    }
    return new Date(creation_date.getTime() + (MILLIS_IN_MINUTE * 1));
}

async function RemindCommand(args, receivedCommand) {
    if (args.length <= 0) {
        receivedCommand.channel.send(`Fabio will guestfully remind you of whatever you need, no matter how dirty ( ͡° ͜ʖ ͡°). Use '\\help remind' for more information.`);
    } else if (args.length >= 5) {
        var time_value = 0;
        var time_granularity = "";
        var reminder_content = "";

        if (!_RemindValidateTimeValue(args[1])) {
            receivedCommand.channel.send(`Invalid time value. Must be a positive integer above 0`);
            return;
        } else {
            time_value = parseInt(args[1]);
        }

        if (!_RemindValidateTimeGranularity(args[2])) {
            receivedCommand.channel.send(`Invalid time granularity. Must be minute(s), hour(s), day(s), month(s) or year(s).`);
            return;
        } else {
            time_granularity = args[2];
        }
        
        for (var i=4; i<args.length - 1; i++) {
            reminder_content = reminder_content.concat(args[i], ' ');
        }
        reminder_content = reminder_content.concat(args[args.length - 1]);

        const user_id = receivedCommand.author.id;
        const user_name = receivedCommand.author.toString();
        const channel_id = receivedCommand.channel.id;
        const creation_date = receivedCommand.createdAt;
        const expiration_date = _RemindComputeExpirationDate(creation_date, time_value, time_granularity);
        const content = reminder_content;

        _SetReminder(user_id, user_name, channel_id, creation_date, expiration_date, content, true)

        receivedCommand.channel.send('Ok '.concat(receivedCommand.author.toString()));
    } else {
        receivedCommand.channel.send(`Invalid number of arguments. Use '\\help remind' for more information.`);
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

//min and max are inclusive.
function getRandomIntInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//TODO (carlos): This should only get images and videos.
function SendImageFromSubredditList(receivedCommand, list) {
    const channelID = receivedCommand.channel.id; 

    const randomListID = getRandomIntInRange(0, list.length - 1);
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

//⚒⚒⚒Madwave is forever⚒⚒⚒\\