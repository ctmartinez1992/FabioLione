const moment = require('moment');
const request = require('bluebird').promisifyAll(require('request'), { multiArgs: true });

const utils = require('./../utils');

module.exports = {
    CnvCurrencyCommand: function(args, receivedCommand) {
        if (args.length == 3) {
            const value = Number(args[0]);
            const from = args[1].toUpperCase();
            const to = args[2].toUpperCase();

            _cnv_currency(receivedCommand, value, from, to)
        } else {
            receivedCommand.channel.send("Invalid number of arguments. Use \\help cnv");
        }
    },
};

function _cnv_currency(receivedCommand, value, from, to) {
    const url = 'https://api.exchangeratesapi.io/latest?base='.concat(from, '&symbols=', to);
    request.get({
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

            const rate = data.rates[to];
            const convertedValue = value * rate;

            const response = value.toString(10).concat(' ', from.toLowerCase(), ' is ', convertedValue, ' ', to.toLowerCase());
            receivedCommand.channel.send(response);
        }
    });
}