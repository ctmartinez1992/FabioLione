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
    \\corgi or \\corgo: Fresh corgi content.
    \\shibe or \\shiba: Fresh shibe content.
    \\sabaton: For some sick dududu beats.
    \\remind: To help you remind of whatever you want.
    \\wrong: When you're right.
    \\pathetic: When you're right and disappointed.`);
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
            } else if (args[0] === 'wrong') {
                receivedCommand.channel.send(`Share a nice argument-winning gif`);
            } else if (args[0] === 'pathetic') {
                receivedCommand.channel.send(`Share a nicer argument-winning gif`);
            } else {
                receivedCommand.channel.send(`Unknown argument (`.concat(args[0], `) for '\\help' command. Use only '\\help'.`));
            }
        }
    }
}