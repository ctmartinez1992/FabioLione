const aws = require('aws-sdk');

let heroku_config = new aws.S3({
    is_in_maintenance:						process.env.IS_IN_MAINTENANCE,
    bot_secret:								process.env.BOT_SECRET,
    weekly_releases_interval_default:		process.env.WEEKLY_RELEASES_INTERVAL_DEFAULT,
    weekly_releases_reddit_url:				process.env.WEEKLY_RELEASES_REDDIT_URL,
    chat_channel_ids:						process.env.CHAT_CHANNEL_IDS,
    corgi_list:                             process.env.CORGI_LIST,
    shibe_list:                             process.env.SHIBE_LIST,
    wrong_list:                             process.env.WRONG_LIST,
    pathetic_list:                          process.env.PATHETIC_LIST,
    database_url:                           process.env.DATABASE_URL,
});

var _is_in_maintenance = true;
if (heroku_config.config.is_in_maintenance.toLowerCase().trim().includes("false")) {
    _is_in_maintenance = false;
}

module.exports = {
    is_in_maintenance:						_is_in_maintenance,
    bot_secret:								heroku_config.config.bot_secret,
    weekly_releases_interval_default:		parseInt(heroku_config.config.weekly_releases_interval_default),
    weekly_releases_reddit_url:				heroku_config.config.weekly_releases_reddit_url,
    chat_channel_ids:						JSON.parse(heroku_config.config.chat_channel_ids),
    corgi_list:						        JSON.parse(heroku_config.config.corgi_list),
    shibe_list:						        JSON.parse(heroku_config.config.shibe_list),
    wrong_list:                             JSON.parse(heroku_config.config.wrong_list),
    pathetic_list:                          JSON.parse(heroku_config.config.pathetic_list),
    database_url:                           heroku_config.config.database_url,
};