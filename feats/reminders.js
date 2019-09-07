const utils = require('./../utils');

//This is shit but nobody is watching.
const MILLIS_IN_YEAR   = 31557600 * 1000;
const MILLIS_IN_MONTH  = 2678400 * 1000;
const MILLIS_IN_DAY    = 86400 * 1000;
const MILLIS_IN_HOUR   = 3600 * 1000;
const MILLIS_IN_MINUTE = 60 * 1000;

const Reminder = utils.Struct('id', 'user_id', 'user_name', 'channel_id', 'creation_date', 'expiration_date', 'content');

module.exports = {
    //Gets all reminders and:
    //  * Deletes those who are past their expiration date;
    //  * Sets reminders for those who are yet to expire with the remaining time.
    Init: async function(client, pool) {
        const clientDB = await pool.connect(); {
            const result = await clientDB.query('SELECT * FROM reminders');
            result.rows.forEach(async function(row) {
                if (row.expiration_date.getTime() < (new Date()).getTime()) {
                    console.log('Reminder (', row.id, ') has expired and will be removed.');
                    const query = `DELETE FROM reminders WHERE reminders.id = `.concat(row.id, ";");
                    await clientDB.query(query);
                } else {
                    const reminder = Reminder(row.id, row.user_id, row.user_name, row.channel_id, row.creation_date, row.expiration_date, row.content);
                    _set_existing_reminder(client, pool, reminder);
                }
            });
        } clientDB.release();
    },

    RemindCommand: async function(args, receivedCommand, client, pool) {
        if (args.length <= 0) {
            receivedCommand.channel.send(`Fabio will guestfully remind you of whatever you need, no matter how dirty ( ͡° ͜ʖ ͡°). Use '\\help remind' for more information.`);
        } else if (args.length >= 5) {
            var time_value = 0;
            var time_granularity = "";
            var reminder_content = "";

            if (!_validate_time_value(args[1])) {
                receivedCommand.channel.send(`Invalid time value (`.concat(args[1]`). Must be a positive integer above 0`));
                return;
            } else {
                time_value = parseInt(args[1]);
            }

            if (!_validate_time_granularity(args[2])) {
                receivedCommand.channel.send(`Invalid time granularity (`.concat(args[1] ,`). Must be minute(s), hour(s), day(s), month(s) or year(s).`));
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
            const expiration_date = _compute_expiration_date(creation_date, time_value, time_granularity);
            const reminder = Reminder(0, user_id, user_name, channel_id, creation_date, expiration_date, reminder_content);

            _new_reminder(client, pool, reminder);

            receivedCommand.channel.send('Ok '.concat(receivedCommand.author.toString()));
        } else {
            receivedCommand.channel.send(`Invalid number of arguments. Use '\\help remind' for more information.`);
        }
    }
}

//r - See struct Reminder.
async function _new_reminder(client, pool, r) {
    console.log('Creating a new reminder...');
    const clientDB = await pool.connect(); {
        const query_text = 'INSERT INTO reminders(user_id, user_name, channel_id, creation_date, expiration_date, content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const query_values = [r.user_id, r.user_name, r.channel_id, r.creation_date.toGMTString(), r.expiration_date.toGMTString(), r.content];
        const result = await clientDB.query(query_text, query_values);
        r.id = result.rows[0].id;
        _set_reminder_timeout(client, pool, r, r.expiration_date);
    } clientDB.release();
}

//r - See struct Reminder.
async function _set_existing_reminder(client, pool, r) {
    console.log('Setting a reminder from an existing database reminder...');
    _set_reminder_timeout(client, pool, r, r.expiration_date);
}

//r - See struct Reminder.
async function _set_reminder_timeout(client, pool, r, date) {
    console.log('Setting reminder ('.concat(r.id, ') to expire in (', r.expiration_date, ') with text (', r.content, ').'));
    runAtDate((async () => {
        client.channels.get(r.channel_id).send("Hey ".concat(r.user_name + ", don't forget to " + r.content));
        const clientDB = await pool.connect(); {
            const query = `DELETE FROM reminders WHERE reminders.id = `.concat(r.id, ";");
            await clientDB.query(query);
        } clientDB.release();
    }), date);
}

function runAtDate(func, date) {
    var now = (new Date()).getTime();
    var then = date.getTime();
    var diff = Math.max((then - now), 0);
    if (diff > 0x7FFFFFFF) {
        setTimeout(function() { runAtDate(date, func); }, 0x7FFFFFFF);
    } else {
        setTimeout(func, diff);
    }
}

function _validate_time_value(value) {
    return /^\+?[1-9][\d]*$/.test(value);
}

function _validate_time_granularity(value) {
    return (value === "minute" || value === "minutes" ||
            value === "hour" || value === "hours" ||
            value === "day" || value === "days" ||
            value === "month" || value === "months" ||
            value === "year" || value === "years");
}

function _compute_expiration_date(creation_date, time_value, time_granularity) {
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