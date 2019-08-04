const aws = require('aws-sdk');

let heroku_config = new aws.S3({
    bot_secret: process.env.BOT_SECRET
});

module.exports = {
    bot_secret: heroku_config.bot_secret
};