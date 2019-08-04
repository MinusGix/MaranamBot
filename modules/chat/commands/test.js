module.exports = {
    name: "chat:test",
    async init (MS, moduleName, filename) {
        MS.moduleDecl.chat.commands.test = async function (location, data) {
            await MS.run("chat-reply", location, {
                type: "text",
                text: "I LOVE YOU"
            });
        }

        MS.moduleDecl.chat.commands.testImage = async function (location, data) {
            let odata = await MS.run("upload-image-buffer", require('fs').readFileSync(__dirname + "/../../image-uploader/test_image.png"));
            await MS.run("chat-reply", location, {
                type: "text",
                text: "output: " + (odata ? odata.url : null)
            });
        }
    }
}