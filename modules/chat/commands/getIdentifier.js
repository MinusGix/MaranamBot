module.exports = {
    name: "chat:getIdentifier",
    async init (MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.getIdentifier = async function (location, data) {
            await MS.run("chat-reply", location, {
                type: "text",
                text: "Ident: " + data.identifier
            });
        }
    }
}