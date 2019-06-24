//Get variables from the settings.
var sendDM = process.settings.discord.useDM;

var sendDMbool = (Object.keys(sendDM).indexOf("deposit") === -1) ? false : true;

module.exports = async (msg) => {
    if (!(await process.core.users.getAddress(msg.sender))) {
        await process.core.users.setAddress(msg.sender, await process.core.coin.createAddress(msg.sender));
    }

	// Check if you need to use DM for deposit
    if sendDMbool {
        msg.obj.author.send("Your reusable address is " + await process.core.users.getAddress(msg.sender) + " !");
    } else {
        msg.obj.reply("Your reusable address is " + await process.core.users.getAddress(msg.sender) + " !");
    }
    
};
