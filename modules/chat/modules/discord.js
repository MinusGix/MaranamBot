module.exports = {
    name: "discordchat",
};

module.exports.init = async function (MS, moduleName) {
    let discord;
    try {
        discord = require('discord.js');
    } catch (err) {
        MS.log.info("[chat] [discord] NOT Launching, due to missing discord.js module.");
        return false;
    }

    const fs = require('fs');

    let config = null;

    try {
        config = fs.readFileSync(__dirname + "/../config/discord.json");
    } catch (err) {
        MS.log.warn("[chat] [discord] Did not find config/discord.json, defaulting to discord-example.json...");
        try {
            config = fs.readFileSync(__dirname + "/../config/discord-example.json");
        } catch (err) {
            MS.log.error("[chat] [discord] Could not load discord-example.json or discord.json... starting without discord module. Please fix.");
            return;
        }
    }

    config = JSON.parse(config);

    const client = new discord.Client();

    client.on('ready', () => {
        MS.log.info("[discord] client connected");
    });

    client.on("message", async (msg) => {
        let location = {
            // Msg has a reply function
            msg: msg,
        };

        MS.log.info("[discord] Message received: " + msg.author + ": ", msg.content);

        await MS.run("chat-receive-text", "discordchat", msg.content, location, {
            client: client,
            msg: msg,
        });
    });

    client.login(config.token);

    await MS.initModuleData('discordchat', {});

    MS.addControl("chat-discordchat-send", async function (location, data) {
        if (data.type === "text") {
            location.msg.reply(data.text);
        } else {
            MS.log.warn("[discordchat] attempted to send unrecognized data type:", data);
            return;
        }
    });

    MS.addControl("chat-discordchat-getIdentifier", function (location, data) {
        return location.msg.author.id || null;
    });

    await MS.run('chat-register', "discordchat", {});
};