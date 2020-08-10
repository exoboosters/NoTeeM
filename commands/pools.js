//Get variables from the settings.
var bot = process.settings.discord.user;
var symbol = process.settings.coin.symbol;
var cointype = process.settings.coin.type;
var decimals = process.settings.coin.decimals;
var fee = process.settings.coin.withdrawFee;
var prefix = process.settings.discord.botprefix;

if (cointype === 'btc') {
    var detail = 'Coin';
}

if (cointype === 'erc20') {
    var detail = 'Token';
}

//Default coin specs.
var specs = `
**${detail} pools**

| Pool Name     | URL                         | Location | Fee  | Operator     |
|---------------|-----------------------------|----------|------|--------------|
| Official Pool | https://mining.notebc.space | France   | 0.2% | exobyte_tech |
| CryptoCrop    | https://farm.cryptocrop.net | US       |   1% | johnny_chop  |
|               |                             |          |      |              |

`;

module.exports = async (msg) => {
    msg.obj.author.send({
        embed: {
            description: specs
        }
    });
};
