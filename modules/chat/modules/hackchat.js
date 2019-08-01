const ws = require('ws');

module.exports = {
    name: "hackchat",
};

let channels = [];

function send (socket, data) {
    if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        MS.log.warn("[hackchat] socket attempted to send data when it wasn't in an OPEN state.");
    }
}

module.exports.init = async function (MS, moduleName) {
    await MS.initModuleData('hackchat', {});

    function combineUserEntries (cindex) {
        if (!channels[cindex]) {
            MS.log.warn("[hackchat] combineUserEntries called with cindex of: ", cindex, " but it doesn't exist. Ignoring, but this should be fixed");
            return;
        }

        // Holds user objects that are marked for removal
        let markedForDeath = [];

        for (let i = 0; i < channels[cindex].users.length; i++) {
            let iuser = channels[cindex].users[i];
            if (markedForDeath.includes(iuser)) {
                continue;
            }

            let foundUsers = [];
            for (let j = 0; j < channels[cindex].users.length; j++) {
                let juser = channels[cindex].users[j];
                if (markedForDeath.includes(juser) || j === i) {
                    continue;
                }
                // If they have no trips and no hashes but nicks match, we don't consider that a match
                // I was tempted to, but honestly that will just cause issues with random users on tor that join

                // Neither users have trips
                if (iuser.trips.length === 0 && juser.trips.length === 0) {
                    // They both have hashes stored of some amount
                    if (iuser.hashes.length > 0 && juser.hashes.length > 0) {
                        for (let e = 0; e < iuser.hashes.length; e++) {
                            if (juser.hashes.includes(iuser.hashes[e])) {
                                foundUsers.push(juser);
                                break;
                            }
                        }
                    }

                    // No trips no hashes, only nicks :( these poor souls
                    if (iuser.hashes.length === 0 && juser.hashes.length === 0) {
                        if (iuser.nicks.length > 0 && juser.nicks.length > 0) {
                            let fuserLen = foundUsers.length;
                            for (let g = 0; g < iuser.nicks.length; g++) {
                                if (juser.nicks.includes(iuser.nicks[g])) {
                                    foundUsers.push(juser);
                                    break;
                                }
                            }

                            // Check if we've added anything to foundUsers
                            if (fuserLen < foundUser.length) {
                                break;
                            }
                        }
                    }
                }

                if (iuser.trips.length > 0 && juser.trips.length > 0) {
                    let fusersLen = foundUsers.length;
                    for (let f = 0; f < iuser.trips.length; f++) {
                        if (juser.trips.includes(iuser.trips[f])) {
                            foundUsers.push(juser);
                            break;
                        }
                    }

                    // Check if we've added anything to foundUsers
                    if (fusersLen < foundUsers.length) {
                        break;
                    }
                }
            }

            for (let n = 0; n < foundUsers.length; n++) {
                let fuser = foundUsers[n];

                // Check for duplicates
                for (let m = 0; m < foundUsers.length; m++) {
                    if (n !== m && fuser === foundUsers[m]) {
                        MS.log.error("[hackchat] combineUserEntries produced duplicate values in foundUsers! This really shouldn't happen. Falling out of combineUserEntries, FIX THIS!");
                        return;
                    }
                }

                // Copy over nicks
                for (let a1 = 0; a1 < fuser.nicks.length; a1++) {
                    if (!iuser.nicks.includes(fuser.nicks[a1])) {
                        iuser.nicks.push(fuser.nicks[a1]);
                    }
                }

                // Copy over trips
                for (let a2 = 0; a2 < fuser.trips.length; a2++) {
                    if (!iuser.trips.includes(fuser.trips[a2])) {
                        iuser.trips.push(fuser.trips[a2]);
                    }
                }

                // Copy over hashes
                for (let a3 = 0; a3 < fuser.hashes.length; a3++) {
                    if (!iuser.hashes.includes(fuser.hashes[a3])) {
                        iuser.hashes.push(fuser.hashes[a3]);
                    }
                }

                // Set isAdmin and isMod to whichever hold greatest superiority.
                // false > true > undefined
                if (iuser.isAdmin === undefined) {
                    iuser.isAdmin = fuser.isAdmin;
                } else if (iuser.isAdmin === true && fuser.isAdmin === false) {
                    iuser.isAdmin = false;
                }

                if (iuser.isMod === undefined) {
                    iuser.isMod = fuser.isMod;
                } else if (iuser.isMod === true && fuser.isMod === false) {
                    iuser.isMod = false;
                }

                markedForDeath.push(fuser);
            }
        }

        for (let k = 0; k < markedForDeath.length; k++) {
            channels[cindex].users.splice(channels[cindex].users.indexOf(markedForDeath[k]));
        }

        // Do it again if we combined some users, this will hopefully guard against issues in the looping logic
        if (markedForDeath.length > 0) {
            MS.log.info("[hackchat] combineUserEntries is running once more...");
            let ret = combineUserEntries(cindex);
            return markedForDeath.length + ret;
        }

        // This will always be zero since the above if statement returns it's own way if it's above zero.
        // I mean it could technically be negative, but I feel we have greater issues than the correctness of this function then
        return 0;
    }

    /// Note: this should only be called if you are sure that the user does not exist.
    function addUser (cindex, nick=undefined, trip=undefined, hash=undefined, isAdmin=undefined, isMod=undefined) {
        if (!channels[cindex]) {
            MS.log.warn("[hackchat] addUser called with cindex of:", cindex, " but it doesn't exist. Ignoring, but this should be fixed.");
            return;
        }
        let obj = {
            nicks: [],
            trips: [],
            hashes: [],
            isAdmin: isAdmin,
            isMod: isMod
        };

        if (nick !== undefined) {
            obj.nicks.push(nick);
        }

        if (trip !== undefined) {
            obj.trips.push(trip);
        }

        if (hash !== undefined) {
            obj.hashes.push(hash);
        }

        channels[cindex].users.push(obj);

        combineUserEntries(cindex);
    }

    function updateSuppliedUser (user, nick=undefined, trip=undefined, hash=undefined, isAdmin=undefined, isMod=undefined) {
        if (nick !== undefined) {
            if (!user.nicks.includes(nick)) {
                user.nicks.push(nick);
            }
        }

        if (trip !== undefined) {
            if (!user.trips.includes(trip)) {
                user.trips.push(trip);
            }
        }

        if (hash !== undefined) {
            if (!user.hashes.includes(hash)) {
                user.hashes.push(hash);
            }
        }

        if (isAdmin === true || isAdmin === false) {
            user.isAdmin = isAdmin;
        }

        if (isMod === true || isMod === false) {
            user.isMod = isMod;
        }
    }

    function findUser (cindex, nick=undefined, trip=undefined, hash=undefined, startIndex=0) {
        let foundUser = null;
        // Priority list:
        //  trip
        //  hash
        //  nick, if there is no stored trip
        for (let i = startIndex; i < channels[cindex].users.length; i++) {
            let user = channels[cindex].users[i];

            if (user === undefined) {
                continue;
            }

            // only try to match with trip if there is a trip to try to find and the user we're looking at has a trip.
            if (trip !== undefined) {
                // If it matches trip, we consider them to be the same user.
                // While someone could have the same trip (aka idiots using 'password' or something for their pass)
                // That doesn't matter, since they shouldn't have been dumb.
                if (user.trips.includes(trip)) {
                    foundUser = user;
                    break;
                }
            }

            if (hash !== undefined) {
                // They have the same ip, so let's consider them the same user... this breaks down because of tor and vpns
                // but this is after we check the trip, so that takes precedence
                if (user.hashes.includes(hash)) {
                    if (user.trips.length === 0) {
                        foundUser = user;
                    }
                    break;
                }
            }

            // If we have no trip, and there is no stored trips, but we have a nickname.
            // So basically a user with the same name.
            if (trip === undefined && nick !== undefined && user.trips.length === 0) {
                if (user.nicks.includes(nick)) {
                    foundUser = user;
                    break;
                }
            }
        }

        return foundUser;
    }

    function updateUser (cindex, nick=undefined, trip=undefined, hash=undefined, isAdmin=undefined, isMod=undefined) {
        if (nick === undefined && trip === undefined && hash === undefined && isAdmin === undefined && isMod === undefined) {
            MS.log.warn("[hackchat] updateUser's Every argument was set to it's default of undefined...");
            return;
        }

        if (nick !== undefined && typeof(nick) !== 'string') {
            MS.log.warn("[hackchat] updateUser's trip was not a string and was not undefined. It was:", nick, ". Ignoring and setting to undefined, but this should be fixed.");
            nick = undefined;
        }

        if (trip !== undefined && typeof(trip) !== 'string') {
            MS.log.warn("[hackchat] updateUser's trip was not a string and was not undefined. It was:", trip, ". Ignoring and setting to undefined, but this should be fixed.");
            trip = undefined;
        }

        if (hash !== undefined && typeof(hash) !== 'string') {
            MS.log.warn("[hackchat] updateUser's hash was not a string and was not undefined. It was:", hash, ". Ignoring and setting to undefined, but this should be fixed.");
            hash = undefined;
        }

        if (isAdmin !== undefined && typeof(isAdmin) !== 'boolean') {
            MS.log.warn("[hackchat] updateUser's isAdmin was not a boolean and was not undefined. It was:", isAdmin, ". Ignoring and setting to undefined, but this should be fixed.");
            isAdmin = undefined;
        }

        if (isMod !== undefined && typeof(isMod) !== 'boolean') {
            MS.log.warn("[hackchat] updateUser's isMod was not a boolean and was not undefined. It was:", isMod, ". Ignoring and setting to undefined, but this should be fixed.");
            isMod = undefined;
        }

        foundUser = findUser(cindex, nick, trip, hash);

        if (foundUser === undefined) {
            MS.log.warn("[hackchat] updateUser foundUser was undefined, which shouldn't be possible. FIX.");
        }

        if (foundUser === null) {
            addUser(cindex, nick, trip, hash, isAdmin, isMod);
        } else {
            updateSuppliedUser(foundUser, nick, trip, hash, isAdmin, isMod);
        }
    }

    MS.addControl("hackchat-connect", (channel, nick, pass=null, addr="wss://hack.chat/chat-ws") => {
        let socket = new ws(addr);
        let index = channels.length;

        MS.log.info("[hackchat] [" + index + "] hackchat-connect called. Connecting to ?" + channel + " with the nick: " + nick + ". To address: " + addr);

        channels.push({
            socket: socket,
            channel: channel,
            nick: nick,
            pass: pass,
            index: index,

            users: []
        });

        socket.on("open", () => {
            MS.log.info("[hackchat] [" + index + "] Socket opened.")
            send(channels[index].socket, {
                cmd: "join",
                nick: channels[index].nick + (channels[index].pass ? '#'+channels[index].pass : ""),
                channel: channels[index].channel
            });
        });

        socket.on("message", async (data) => {
            let pdata;
            try {
                pdata = JSON.parse(data);
            } catch (err) {
                MS.log("[hackchat] [" + index + "] socket received malformed json. Data:", data);
                return;
            }

            // I use data here as it's easier to read in the console, since it's not that complex of json so spreading it over multiple lines is annoying.
            MS.log.info("[hackchat] [" + index + "] received data: ", data);
            if (pdata.cmd === "chat") {
                updateUser(
                    index,
                    pdata.nick,
                    pdata.trip === "null" ? undefined : pdata.trip,
                    undefined,
                    pdata.admin === undefined ? false : pdata.admin,
                    pdata.mod === undefined ? false : pdata.mod
                );
                await MS.run("chat-receive-text", "hackchat", pdata.text, {index: index}, {
                    data: pdata
                });
            } else if (pdata.cmd === "onlineAdd") {
                updateUser(
                    index,
                    pdata.nick,
                    pdata.trip === "null" ? undefined : pdata.trip,
                    pdata.hash,
                    pdata.admin,
                    pdata.mod
                );
            } else if (pdata.cmd === "onlineSet") {
                for (let i = 0; i < pdata.nicks; i++) {
                    updateUser(
                        index,
                        pdata.nicks[i],
                        undefined,
                        undefined,
                        undefined,
                        undefined
                    );
                }
            } else if (pdata.cmd === "info") {
                // don't do anything
            }
        });
    });

    MS.addControl("chat-hackchat-send", function (location, data) {
        if (typeof(location.index) !== 'number') {
            MS.log.warn("[hackchat] location index was not a number. Ignoring, but this should be fixed.");
            return;
        }

        if (!channels[location.index]) {
            MS.log.warn("[hackchat] [" + location.index + "] tried to send data over dead channel. Ignoring, but this should be fixed.");
            return;
        }

        if (data.type === "text") {
            send(channels[location.index].socket, {
                cmd: "chat",
                text: data.text
            });
        } else {
            MS.log.warn("[hackchat] [" + location.index + "] attempted to send unrecognized data: ", data);
            return;
        }
    });

    MS.addControl("chat-hackchat-getIdentifier", function (location, data) {
        if (typeof(location.index) !== 'number') {
            MS.log.warn("[hackchat] location index was not a number. Ignoring, but this should be fixed.");
            return;
        }

        console.log(channels[location.index].users);

        /*return JSON.stringify(findUser(
            location.index,
            data.eargs.data.nick || undefined,
            data.eargs.data.trip === "null" ? undefined : (data.eargs.data.trip || undefined),
            data.eargs.data.hash || undefined
        ));*/

        let edata = data.eargs.data;
        let nick = edata.nick;
        if (typeof(nick) !== "string") nick = undefined;
        let trip = edata.trip;
        if (trip === "null" || typeof(trip) !== "string") trip = undefined;
        let hash = edata.hash;
        if (typeof(hash) !== "string") hash = undefined;


        let user = findUser(location.index, nick, trip, hash);

        if (user === null) {
            return null;
        } else {
            return channels[location.index].users.indexOf(user);
        }
    });

    await MS.run("chat-register", "hackchat", {});

    await MS.run("hackchat-connect", "Xd", "Maranam", "fuckwit");
};