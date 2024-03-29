const path = require('path');

module.exports = {
    name: 'chat',
};

let registrar = Object.create(null);

function hasRegistrar (modName) {
    return registrar[modName] !== undefined;
}

module.exports.init = async function (MS, moduleName, filename) {
    setupModuleData(MS, moduleName, filename);

    MS.moduleDecl.chat = {};
    MS.moduleDecl.chat.commands = {};
    let commands = MS.moduleDecl.chat.commands; // just an easier way to refer to it

    await MS.initModuleData('chat', {});

    // Register yourself as a chat controller, give it an event for functions to call when something happens
    await MS.addControl("chat-register", (modName, data) => {
        registrar[modName] = data;
    });
    await MS.addControl("chat-receive-text", async (modName, text, location, eargs={}) => {
        location.mod = modName;

        // Do command parsing.
        if (text.startsWith(MS.moduleData.chat.commandPrefix)) {
            let command = text.slice(MS.moduleData.chat.commandPrefix.length).split(' ')[0];
            let stext = text.split(/\s/);
            let data = {
                modName: modName,
                command: command,
                eargs: eargs,
                text: text,
                stext: stext,
            };

            data.identifier = await MS.run("chat-get-identifier", location, data);

            if (commands[command]) {
                await commands[command](location, data);
            }
        } else {
            // Ignore
        }
    });
    MS.addControl("chat-reply", async (location, data) => {
        if (location === undefined || data === undefined) {
            throw new Error("chat-reply, location or data were undefined. Not allowed.");
        }

        if (hasRegistrar(location.mod)) {
            return await MS.run("chat-" + location.mod + "-send", location, data);
        } else {
            MS.log.warn("Received chat reply for location which does not have a registered handler: ", location.mod, data);
        }
    });
    MS.addControl("chat-get-identifier", async (location, data) => {
        if (location === undefined || data === undefined) {
            throw new Error("chat-reply, location or data were undefined. Not allowed.");
        }

        if (hasRegistrar(location.mod)) {
            return await MS.run("chat-" + location.mod + "-getIdentifier", location, data);
        } else {
            MS.log.warn("Received chat reply for location which does not have a registered handler: ", location.mod, data);
        }
    })

    await MS.loadModules(path.dirname(filename) + "/commands/");
}

function setupModuleData (MS, moduleName, filename) {
    MS.initModuleData("chat", {});
    if (!MS.moduleData.chat.commandPrefix) MS.moduleData.chat.commandPrefix = ",";
}