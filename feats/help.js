module.exports = {
    HelpCommand: function(args, receivedCommand) {
        if (args.length <= 0) {
            receivedCommand.channel.send(`\n
Fabio Lione will tell you when a new weekly release thread was posted.
List of available commands:
    \\help: A list of all commands and an explanation for each.
        Use: '\\help command_name' for a detailed explanation of the command.
    \\toggle: Toggle features on or off.
    \\set: Change internal variables to customize behavior.
    \\remind: To help you remind of whatever you want.
    \\cnv: For conversion between units.
    \\Other commands: corgi/corgo, shibe/shiba, sabaton, wrong, pathetic, longestsong, aoty, demonbitch, brutal, manowar, pmsong`);
        } else {
            if (args[0] === 'help') {
                receivedCommand.channel.send(`This command will help you out. However, asking for help on the help command is ridiculous.`);
            } else if (args[0] === 'toggle') {
                receivedCommand.channel.send(`Toggle a feature on or off. Use: '\\toggle list' to see what can be toggled.`);
            } else if (args[0] === 'set') {
                receivedCommand.channel.send(`Set a variable value to something else. Use: '\\set list' to see what can be toggled.`);
            } else if (args[0] === 'remind') {
                receivedCommand.channel.send(`\n
Fabio will guestfully remind you of whatever you need, no matter how dirty ( ͡° ͜ʖ ͡°). Use:
\\remind in time_value time_granularity to reminder_content
    * time_value can be any positive integer above 0;
    * time_granularity can be minute(s), hour(s), day(s), month(s), year(s);
    * reminder_content is what you want to be reminded of;
    * NOTE: The 'in' and 'to' words need to be there, they don't need to be in or to respectively, they just need to be a word.`);
            } else if (args[0] === 'cnv') {
                receivedCommand.channel.send(`\n
Fabio will convert values between units. Use:
\\cnv value from_unit to_unit
\\cnv list (for all types of unit categories)
\\cnv list all (to list all possible units (be ready for a wall of text))
\\cnv list category (to list all possible units within a category)
    * Units can be:
        * Currency (CAD, HKD, ISK, PHP, DKK, HUF, CZK, AUD, RON, SEK, IDR, INR, BRL, RUB, HRK, JPY, THB, CHF, SGD, PLN, BGN, TRY, CNY, NOK, NZD, ZAR, USD, MXN, ILS, GBP, KRW, MYR, EUR)
        * Length (mm, cm, m, in, ft-us, ft, mi)
        * Area (mm2, cm2, m2, ha, km2, in2, ft2, ac, mi2)
        * Mass (mcg, mg, g, kg, oz, lb, mt, t)
        * Volume (mm3, cm3, ml, l, kl, m3, km3, tsp, Tbs, in3, fl-oz, cup, pnt, qt, gal, ft3, yd3)
        * Volume Flow Rate (mm3/s, cm3/s, ml/s, cl/s, dl/s, l/s, l/min, l/h, kl/s, kl/min, kl/h, m3/s, m3/min, m3/h, km3/s, tsp/s, Tbs/s, in3/s, in3/min, in3/h, fl-oz/s, fl-oz/min, fl-oz/h, cup/s, pnt/s, pnt/min, pnt/h, qt/s, gal/s, gal/min, gal/h, ft3/s, ft3/min, ft3/h, yd3/s, yd3/min, yd3/h)
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
            } else {
                receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '\\help' command. Use only '\\help'.`));
            }
        }
    }
}