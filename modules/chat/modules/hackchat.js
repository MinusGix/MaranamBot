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

module.exports.init = function (MS, moduleName) {
    MS.initModuleData('hackchat', {});

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
        });

        socket.on("open", () => {
            MS.log.info("[hackchat] [" + index + "] Socket opened.")
            send(channels[index].socket, {
                cmd: "join",
                nick: channels[index].nick + (channels[index].pass ? '#'+channels[index].pass : ""),
                channel: channels[index].channel
            });
        });

        socket.on("message", (data) => {
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
                MS.run("chat-receive-text", "hackchat", pdata.text, {index: index}, pdata);
            }
        });
    });



    MS.run("chat-register", "hackchat", {
        send (location, data) {
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
        }
    });




    MS.run("hackchat-connect", "Xd", "Maranam", "fuckwit");
};