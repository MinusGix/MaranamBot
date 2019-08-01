module.exports = {
    name: "chat:getIdentifier",
    init (MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.getIdentifier = function (location, data) {
            MS.run("chat-reply", location, {
                type: "text",
                text: "Ident: " + data.identifier
            });
        }
    }
}