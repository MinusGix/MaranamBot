module.exports = {
    name: "chat:help",
    async init (MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.help = async function (location, data) {
            if (data.stext.length === 1) {
                let text = 'Help:\n';
                let prefix = MS.moduleData.chat.commandPrefix;

                for (let cmd in MS.moduleDecl.chat.commands) {
                    text += prefix + cmd + " ";
                }
                await MS.run("chat-reply", location, {
                    type: "text",
                    text: text
                });
            }
        }
    }
}