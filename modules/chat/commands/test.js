module.exports = {
    name: "chat:test",
    init (MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.test = function (location, data) {
            MS.run("chat-reply", location, {
                type: "text",
                text: "I LOVE YOU"
            });
        }
    }
}