//Get variables from the settings.
var sendDM = process.settings.discord.useDM;
var sendDMbool = (Object.keys(sendDM).indexOf("balance") === -1) ? false : true;
var pools = process.settings.pools;

module.exports = async (msg) => {
    //If an argument was provided...
    if (msg.text[1]) {
        var pool = msg.text[1];
        //Verify the pool exists.
        if (Object.keys(pools).indexOf(pool) === -1) {
            //Tell the user that pool doesn't exist.
            if sendDMbool {
				msg.obj.author.send("That pool doesn't exist.");
			} else {
				msg.obj.reply("That pool doesn't exist.");
			}
            return;
        }

        //Verify the person has access to the pool.
        if (
            //If the user isn't an admin of the pool...
            (pools[pool].admins.indexOf(msg.sender) === -1) &&
            //And isn't a member of the pool...
            (pools[pool].members.indexOf(msg.sender) === -1)
        ) {
            //Tell the user they don't have permission to access that pool.
			if sendDMbool {
				msg.obj.author.send("You don't have permission to access that pool.");
			} else {
				msg.obj.reply("You don't have permission to access that pool.");
			}
            return;
        }

        //Tell the user the pool's balance.
		if sendDMbool {
			msg.obj.author.send(pools[pool].printName + " has " + (await process.core.users.getBalance(pool)).toString() + " " + process.settings.coin.symbol + ".");
		} else {
			msg.obj.reply(pools[pool].printName + " has " + (await process.core.users.getBalance(pool)).toString() + " " + process.settings.coin.symbol + ".");
		}
        return;
    }

    //If no argument was provided, tell the user their balance.
	
    msg.obj.reply("You have " + (await process.core.users.getBalance(msg.sender)).toString() + " " + process.settings.coin.symbol + ".");
};
