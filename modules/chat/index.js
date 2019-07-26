const path = require('path');

module.exports = {
    name: 'chat',
};

let registrar = Object.create(null);

function hasRegistrar (modName) {
    return registrar[modName] !== undefined;
}

module.exports.init = function (MS, moduleName, filename) {
    setupModuleData(MS, moduleName, filename);

    MS.moduleDecl.chat = {};
    MS.moduleDecl.chat.commands = {};
    let commands = MS.moduleDecl.chat.commands; // just an easier way to refer to it

    MS.initModuleData('chat', {});

    MS.addControl("chat-register", (modName, event) => {
        registrar[modName] = event;

        if (!event.send) event.send = () => {};
    });
    MS.addControl("chat-receive-text", (modName, text, location, ...eargs) => {
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

            if (commands[command]) {
                commands[command](data, location);
            }
        } else {
            // Ignore
        }
    });
    MS.addControl("chat-reply", (location, data) => {
        if (location === undefined || data === undefined) {
            throw new Error("chat-reply, location or data were undefined. Not allowed.");
        }

        if (hasRegistrar(location.mod)) {
            registrar[location.mod].send(location, data);
        } else {
            MS.log.warn("Received chat reply for location which does not have a registered handler: ", location.mod, data);
        }
    });
    MS.addControl("send", (data, location) => {
        if (hasRegistrar(mod)) {
            registrar[mod].send(mod, data, location);
        } else {
            MS.log.warn("Attempting to send data over a mod which doesn't exist.", mod);
        }
    });

    MS.loadModules(path.dirname(filename) + "/commands/");
}

function setupModuleData (MS, moduleName, filename) {
    if (MS.moduleData.chat === undefined) {
        MS.moduleData.chat = {};
    }

    if (!MS.moduleData.chat.commandPrefix) MS.moduleData.chat.commandPrefix = ",";
}