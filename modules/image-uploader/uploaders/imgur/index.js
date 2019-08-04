module.exports = {
    name: 'image-uploader:imgur',
};

module.exports.init = async function (MS) {
    const fs = require('fs');

    let imgur;
    try {
        imgur = require("simple-imgur-uploader");
    } catch (err) {
        MS.log.error("[image-uploader] [imgur] failed to load imgur module:", err);
        return false;
    }

    let config = null;

    try {
        console.log(__dirname + "/config/config.json");
        config = fs.readFileSync(__dirname + "/config/config.json");
        MS.log.info("[image-uploader] [imgur] Opened config.json");
    } catch (err) {
        MS.log.warn("[image-uploader] [imgur] Did not find config/config.json, defaulting to config-example.json...", err);
        try {
            config = fs.readFileSync(__dirname + "/config/config-example.json");
        } catch (err) {
            MS.log.error("[image-uploader] [imgur] Could not load config-example.json or config.json... starting without imgur module. Please fix.", err);
            return false;
        }
    }
    config = JSON.parse(config);

    if (!config.clientID) {
        MS.log.error("[image-uploader] [imgur] config is missing client id! Can't run.");
        return false;
    }

    MS.addControl("upload-image-buffer", async (buffer, options={}) => {
        let clientID = config.clientID;
        let title = options.title || undefined;
        let description = options.description || undefined;
        let data = await imgur.uploadFileBufferAsync(clientID, buffer, "image", title, description);

        if (data.success) {
            console.log(data);
            console.log(data.data.link);
            return {
                url: data.data.link,
                _imgurData: data
            };
        } else {
            return null;
        }
    });
};