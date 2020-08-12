//Get variables from the settings.
var sendDM = process.settings.discord.useDM;
var qrurl = process.settings.coin.qrurl;
var sendDMbool = (Object.keys(sendDM).indexOf("deposit") === -1) ? false : true;
var useQR = (process.settings.coin.qrurl.indexOf("http") === - 1) ? false : true;
var strAddr = "";

module.exports = async (msg) => {
    if (!(await process.core.users.getAddress(msg.sender))) {
        await process.core.users.setAddress(msg.sender, await process.core.coin.createAddress(msg.sender));
    }

	strAddr = "Your reusable address is " + await process.core.users.getAddress(msg.sender) + " !";
	If useQR {
		strAddr = strAddr + "\n" + qrurl + await process.core.users.getAddress(msg.sender);
	}
	// Check if you need to use DM for deposit
    if sendDMbool {
        msg.obj.author.send(strAddr);
    } else {
        msg.obj.reply(strAddr);
    }
    
};
