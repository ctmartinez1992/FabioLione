const request = require('bluebird').promisifyAll(require('request'), { multiArgs: true });

var convert = require('convert-units');

all_currencies = [
    "CAD", "HKD", "ISK", "PHP", "DKK", "HUF", "CZK", "AUD", "RON", "SEK", "IDR", "INR", "BRL", "RUB", "HRK",
    "JPY", "THB", "CHF", "SGD", "PLN", "BGN", "TRY", "CNY", "NOK", "NZD", "ZAR", "USD", "MXN", "ILS", "GBP",
    "KRW", "MYR", "EUR"
];

module.exports = {
    CnvCurrencyCommand: function(args, receivedCommand) {
        if (args.length === 0) {
            receivedCommand.channel.send(`Fabio will convert values between units. Use "\\help cnv for more information."`);
        } else if (args.length === 1) {
            if (args[0] === "list") {
                receivedCommand.channel.send(`Here are all the possible categories of units to choose from: Currency, Length, Are, Mass, Volume, Volume Flow Rate, Temperature, Time, Frequency, Speed, Pace, Pressure, Digital, Illuminance, Parts-Per, Voltage, Current, Power, Apparent Power, Reactive Power, Energy, Reactive Energy, Angle (deg, rad, grad, arcmin, arcsec)`);
            } else {
                receivedCommand.channel.send(args[0].concat(" is an invalid argument."));
            }
        } else if (args.length === 2) {
            if (args[0] === "list" && args[1] === "all") {
                receivedCommand.channel.send(`\nHere are all the possible units:
* Currency (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)
* Length (mm, cm, m, in, ft-us, ft, mi)
* Area (mm2, cm2, m2, ha, km2, in2, ft2, ac, mi2)
* Mass (mcg, mg, g, kg, oz, lb, mt, t)
* Volume (mm3, cm3, ml, l, kl, m3, km3, tsp, Tbs, in3, fl-oz, cup, pnt, qt, gal, ft3, yd3)
* Temperature (C, F, K, R)
* Time (ns, mu, ms, s, min, h, d, week, month, year
* Frequency (Hz, mHz, kHz, MHz, GHz, THz, rpm, deg/s, rad/s)
* Speed (m/s, km/h, m/h, knot, ft/s)
* Pace (s/m, min/km, s/ft, min/km)
* Pressure (Pa, hPa, kPa, MPa, bar, torr, psi, ksi)
* Digital (b, Kb, Mb, Gb, Tb, B, KB, MB, GB, TB)
* Illuminance (lx, ft-cd)
* Parts-Per (ppm, ppb, ppt, ppq)
* Voltage (V, mV, kV)
* Current (A, mA, kA)
* Power (W, mW, kW, MW, GW)
* Apparent Power (VA, mVA, kVA, MVA, GVA)
* Reactive Power (VAR, mVAR, kVAR, MVAR, GVAR)
* Energy (Wh, mWh, kWh, MWh, GWh, J, kJ)
* Reactive Energy (VARh, mVARh, kVARh, MVARh, GVARh)
* Angle (deg, rad, grad, arcmin, arcsec)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "length") {
                receivedCommand.channel.send(`\nHere are all length units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "area") {
                receivedCommand.channel.send(`\nHere are all area units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "mass") {
                receivedCommand.channel.send(`\nHere are all mass units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "volume") {
                receivedCommand.channel.send(`\nHere are all volume units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "temperature") {
                receivedCommand.channel.send(`\nHere are all temperature units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "time") {
                receivedCommand.channel.send(`\nHere are all time units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "frequency") {
                receivedCommand.channel.send(`\nHere are all frequency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "speed") {
                receivedCommand.channel.send(`\nHere are all speed units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else if (args[0] === "list" && args[1] === "currency") {
                receivedCommand.channel.send(`\nHere are all currency units: (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)`);
            } else {
                receivedCommand.channel.send("Invalid argument.");
            }
        }
        if (args.length === 3) {
            const value = Number(args[0]);
            const from = args[1];
            const to = args[2];

            if (all_currencies.includes(from.toUpperCase()) && all_currencies.includes(to.toUpperCase())) {
                _cnv_currency(receivedCommand, value, from.toUpperCase(), to.toUpperCase());
            } else {
                try {
                    const convertedValue = convert(value).from(from).to(to);
                    const response = value.toString(10).concat(' ', from, ' is ', convertedValue, ' ', to);
                    receivedCommand.channel.send(response);
                } catch(err) {
                    receivedCommand.channel.send("Something went wrong, check your units");
                }
            }
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
