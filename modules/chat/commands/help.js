module.exports = {
    name: "chat:help",
    init (MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.help = function (location, data) {
            if (data.stext.length === 1) {
                let text = 'Help:\n';
                let prefix = MS.moduleData.chat.commandPrefix;

                for (let cmd in MS.moduleDecl.chat.commands) {
                    text += prefix + cmd + " ";
                }
                MS.run("chat-reply", location, {
                    type: "text",
                    text: text
                });
            }
        }
    }
}