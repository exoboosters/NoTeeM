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
**${detail} specifications**

NoteBC is a cryptocurrency for anyone, anywhere

-- ***Symbol***
${symbol}

-- ***Algorithm***
Scrypt

-- ***${detail} Type ***
Proof-of-Work (PoW)

-- ***Block size***
2MB 

-- ***Block time***
30 seconds

-- ***Difficulty Retargets***
Every 600 blocks

-- ***Max supply***
55,000,000,000 (55 billion)

-- ***Reward details***
Originally 4756 ${symbol} per block
Currently 3,804.80 ${symbol} per block (one decrease completed)
Reward decreases by 20% every 1,051,200 blocks or approximately 1 year.
~5B Notes rewarded first year, and 20% less every year after that. (5, 4, 3.2, 2.5, etc).

-- ***Decimals***
${decimals}. Lowest unit is called 1 Mote

-- ***Useful links***
Official website - https://notebc.com
Web Wallet - https://notebc.io
Mobile Wallets - https://www.notebc.com/walletsandapps
Explorer - http://explorer.notebc.io & https://blocks.notebc.space
Twitter - https://twitter.com/BlockchainNote/
Facebook - https://fb.me/BlockchainNote
GitHub - https://github.com/note-llc/

-- ***Official Admin*** 
<@535631229245063191>.

`;

module.exports = async (msg) => {
    msg.obj.author.send({
        embed: {
            description: specs
        }
    });
};
