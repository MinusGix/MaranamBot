module.exports = {
    name: "chat:test",
    async init (MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.test = async function (location, data) {
            await MS.run("chat-reply", location, {
                type: "text",
                text: "I LOVE YOU"
            });
        }
    }
}