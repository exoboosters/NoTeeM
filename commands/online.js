//BN lib.
var BN = require("bignumber.js");
BN.config({
    ROUNDING_MODE: BN.ROUND_DOWN,
    EXPONENTIAL_AT: process.settings.coin.decimals + 1
});

//Vars from the settings.
var pools = process.settings.pools;
var symbol = process.settings.coin.symbol;
var prefix = process.settings.discord.botprefix;
var servid = process.settings.discord.serverid;

module.exports = async (msg) => {
    //Tip details.
    var pool, from, amount, online, finamount;

    //Get the total number of online users
    //const guild = process.client.guilds.get(servid);
    //var onlineCount = guild.members.filter(m => m.presence.status === 'online');
    
    //msg.obj.reply("Total number of online users " + onlineCount);

    msg.obj.reply("Bot is running with "+process.client.users.size+" users, in  "+process.client.channels.size+" channels of "+process.client.guilds.size+" guilds! 👍");

        var u, user;
        for(u in process.client.users){
           user = process.client.users[u];
           //if(user instanceof Discord.User) msg.obj.reply("["+u+"] "+user.username);
		   if(user instanceof Discord.User) msg.obj.reply("["+u+"] "+user.username);
        }

};
