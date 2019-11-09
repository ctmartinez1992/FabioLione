const utils = require('./../utils');

module.exports = {
    RollCommand: function(args, receivedCommand) {
        if (args.length <= 0) {
            receivedCommand.channel.send(`Example: "\\roll 3d16+3" would give 3 rolls of a 16-faced dice and add 3 to each result.`);
        } else {
            options = _parse_roll_options(args);

            result = options.actual_match;
            result = result.concat(": ");
            if (options.amount_of_rolls === 1) {
                result = result.concat(_roll(options));
            } else {
                for (let i = 0; i < options.amount_of_rolls; i++) {
                    result = result.concat((i === options.amount_of_rolls - 1) ? `${_roll(options)}` : `${_roll(options)}, `);
                }
            }
            
            receivedCommand.channel.send(result);
        }
    },
}

function _parse_roll_options(args) {
    let options = {
        full_match: "d20",
        actual_match: "d20",
        amount_of_rolls: 1,
        main_range: 20,
        extra_add_or_sub: 1,            //1 = addition, 2 = subtraction
        extra_value: 0,
    };

    const str = args[0];
    const regex = /(\d+)?d(\d+)([\+\-]\d+)?/;

    //[0] = What matched.
    //[1] = Amount of times to roll.
    //[2] = Range (from 0 to the number).
    //[3] = Extra addition/subtraction.
    let regex_result = str.match(regex);
    if(regex_result[1] !== undefined && regex_result[1] > 0) {
        options.amount_of_rolls = parseInt(regex_result[1]);
    }
    if(regex_result[2] !== null && regex_result[2] > 1) {
        options.main_range = parseInt(regex_result[2]);
    }
    if(regex_result[3] !== undefined) {
        options.extra_add_or_sub = regex_result[3][0] === "+" ? 1 : 2;
        options.extra_value = parseInt(regex_result[3].substring(1));
    }

    options.actual_match = _actual_match(options);

    return options;
}

function _actual_match(options) {
    let match = "";
    if (options.amount_of_rolls > 1) {
        match = match.concat(options.amount_of_rolls);
    }
    match = match.concat("d");
    match = match.concat(options.main_range);
    if (options.extra_value > 0) {
        match = match.concat(options.extra_add_or_sub === 1 ? "+" : "-");
        match = match.concat(options.extra_value);
    }

    return match;
}

function _roll(options) {
    const base = Math.floor(Math.random() * options.main_range) + 1;
    const extra_value = options.extra_add_or_sub === 1 ? +options.extra_value : -options.extra_value;
    return base + extra_value;
}