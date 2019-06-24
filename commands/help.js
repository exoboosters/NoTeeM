//Get variables from the settings.
var bot = process.settings.discord.user;
var symbol = process.settings.coin.symbol;
var decimals = process.settings.coin.decimals;
var fee = process.settings.coin.withdrawFee;
var prefix = process.settings.discord.botprefix;
var maxtipamt = process.settings.discord.maxtip;

//Default help text.
var help = `
**TIPBOT COMMAND LIST**

To run a command, either preface it with "${prefix}" ("${prefix}deposit", "${prefix}tip") or ping the bot ("<@${bot}> deposit", "<@${bot}> tip").

This bot does use decimals, and has ${decimals} decimals of accuracy. You can also use "all" instead of any AMOUNT to tip/withdraw your entire balance.

-- ***${prefix}balance*** or ***${prefix}bal***
Prints your balance.

-- ***${prefix}tip <@PERSON> <AMOUNT>***
Tips the person that amount of ${symbol}. The maximum amount you can tip is ${maxtipamt}.

-- ***${prefix}withdraw <AMOUNT> <ADDRESS>***
Withdraws AMOUNT to ADDRESS, charging a ${fee} ${symbol} fee.

-- ***${prefix}deposit***
Prints your personal deposit address. 

-- ***${prefix}splash <AMOUNT>***
Tips the total AMOUNT amongst online users equally. (this is not implemented yet).

-- ***${prefix}stats***
Displays the total tips sent through this bot (this is not implemented yet).

If you have any questions, feel free to ask <@463057187569270809>.

This bot is fully open source and available at https://github.com/exoboosters/tip-bot. It is based of the tip-bot kayabaNerve/tip-bot
`;

module.exports = async (msg) => {
    msg.obj.author.send({
        embed: {
            description: help
        }
    });
};
