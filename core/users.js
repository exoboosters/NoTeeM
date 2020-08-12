//MySQL and BN libs.
var mysql = require("promise-mysql");
var fs = require("fs");
var BN = require("bignumber.js");
BN.config({
    ROUNDING_MODE: BN.ROUND_DOWN,
    EXPONENTIAL_AT: process.settings.coin.decimals + 1
});

//Definition of the table: `name VARCHAR(64), address VARCHAR(64), balance VARCHAR(64), notify tinyint(1)`.

//MySQL connection and table vars.
var connection, table;

//RAM cache of users.
var users;

//Array of every handled TX hash.
var handled;

//Checks an amount for validity.
async function checkAmount(amount) {
    //If the amount is invalid...
    if (amount.isNaN()) {
        return false;
    }

    //If the amount is less than or equal to 0...
    if (amount.lte(0)) {
        return false;
    }

    //Else, return true.
    return true;
}

//Creates a new user.
async function create(user) {
    //If the user already exists, return.
    if (users[user]) {
        return false;
    }
    // User table is now updated to
	// name
	// address
	// balance
	// notify
	// received <- new
	// sent <- new
    //Create the new user, with a blank address, balance of 0, and the notify flag on.
    await connection.query("INSERT INTO " + table + " VALUES(?, ?, ?, ?, ?, ?)", [user, "", "0", 1, "0", "0"]);
    //Create the new user in the RAM cache, with a status of no address, balance of 0, the notify flag on, received amount of 0 and sent amount of 0.
    users[user] = {
        address: false,
        balance: BN(0),
        notify: true,
		received: BN(0),
		sent: BN(0)
    };

    //Return true on success.
    return true;
}

//Sets an user's address.
async function setAddress(user, address) {
    //If they already have an address, return.
    if (typeof(users[user].address) === "string") {
        return;
    }

    //Update the table with the address.
    await connection.query("UPDATE " + table + " SET address = ? WHERE name = ?", [address, user]);
    //Update the RAM cache.
    users[user].address = address;
}

//Adds to an user's balance.
async function addBalance(user, amount) {
    //Return false if the amount is invalid.
    if (!(await checkAmount(amount))) {
        return false;
    }

    //Add the amount to the balance.
    var balance = users[user].balance.plus(amount);
    var received = users[user].received.plus(amount);
    //Convert the balance to the coin's smallest unit.
    balance = balance.toFixed(process.settings.coin.decimals);
    //Convert the received to the coin's smallest unit.
    received = received.toFixed(process.settings.coin.decimals);
    //Update the table with the new balance, as a string.
    await connection.query("UPDATE " + table + " SET balance = ?, received = ? WHERE name = ?", [balance, received, user]);
    //Update the RAM cache with a BN.
    users[user].balance = BN(balance);
    users[user].received = BN(received);

    return true;
}

//Subtracts from an user's balance.
async function subtractBalance(user, amount) {
    //Return false if the amount is invalid.
    if (!(await checkAmount(amount))) {
        return false;
    }

    //Subtracts the amount from the balance.
    var balance = users[user].balance.minus(amount);
    var sent = users[user].sent.minus(amount);
    //Return false if the user doesn't have enough funds to support subtracting the amount.
    if (balance.lt(0)) {
        return false;
    }

    //Convert the balance to the coin's smallest unit.
    balance = balance.toFixed(process.settings.coin.decimals);
    sent = sent.toFixed(process.settings.coin.decimals);
    //Update the table with the new balance, as a string.
    await connection.query("UPDATE " + table + " SET balance = ? , sent = ? WHERE name = ?", [balance, sent, user]);
    //Update the RAM cache with a BN.
    users[user].balance = BN(balance);

    return true;
}

//Updates the notify flag.
async function setNotified(user) {
    //Update the table with a turned off notify flag.
    await connection.query("UPDATE " + table + " SET notify = ? WHERE name = ?", [0, user]);
    //Update the RAM cache.
    users[user].notify = false;
}

//Returns an user's address.
async function getAddress(user) {
    return users[user].address;
}

//Returns an user's balance
async function getBalance(user) {
    return users[user].balance;
}

//Returns an user's notify flag.
async function getNotify(user) {
    return users[user].notify;
}

//Returns the top tipper in the channel.
async function toptipper() {
    return await connection.query("SELECT name, sent FROM " + table + " WHERE sent = (SELECT MAX(sent) FROM " + table + ")");
}

module.exports = async () => {
    //Connects to MySQL.
    connection = await mysql.createConnection({
        host: "localhost",
        database: process.settings.mysql.db,
        user: process.settings.mysql.user,
        password: process.settings.mysql.pass
    });
    //Set the table from the settings.
    table = process.settings.mysql.tips;

    //Init the RAM cache.
    users = {};
    //Init the handled array.
    handled = [];
    //Gets every row in the table.
    var rows = await connection.query("SELECT * FROM " + table);
    //Iterate over each row, creating an user object for each.
    var i;
    for (i in rows) {
        users[rows[i].name] = {
            //If the address is an empty string, set the value to false.
            //This is because we test if the address is a string to see if it's already set.
            address: (rows[i].address !== "" ? rows[i].address : false),
            //Set the balance as a BN.
            balance: BN(rows[i].balance),
            received: BN(rows[i].received),
            sent: BN(rows[i].sent),
            //Set the notify flag based on if the DB has a value of 0 or 1 (> 0 for safety).
            notify: (rows[i].notify > 0)
        };

        //Get this user's existing TXs.
        var txs = await process.core.coin.getTransactions(users[rows[i].name].address);
        //Iterate over each, and push their hashes so we don't process them again.
        var x;
        for (x in txs) {
            handled.push(txs[x].txid);
        }
    }

    //Make sure all the pools have accounts.
    for (i in process.settings.pools) {
        //Create an account for each. If they don't have one, this will do nothing.
        await create(i);
    }

    //Return all the functions.
    return {
        create: create,

        setAddress: setAddress,
        addBalance: addBalance,
        subtractBalance: subtractBalance,
        setNotified: setNotified,

        getAddress: getAddress,
        getBalance: getBalance,
        getNotify: getNotify,

        toptipper: toptipper
    };
};

//Every thirty seconds, check the TXs of each user.
setInterval(async () => {
    for (var user in users) {
        //If that user doesn't have an address, continue.
        if (users[user].address === false) {
            continue;
        }

        //Declare the amount deposited.
        var deposited = BN(0);
        //Get the TXs.
        var txs = await process.core.coin.getTransactions(users[user].address);

        //Iterate over the TXs.
        for (var i in txs) {
            //If we haven't handled them...
            if (handled.indexOf(txs[i].txid) === -1) {
                //Add the TX value to the deposited amount.
                deposited = deposited.plus(BN(txs[i].amount));
                //Push the TX ID so we don't handle it again.
                handled.push(txs[i].txid);
            }
        }

        await addBalance(user, deposited);
    }
}, 30 * 1000);
