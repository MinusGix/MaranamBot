module.exports = {
    name: "image-uploader",
};

const path = require('path');
const fs = require('fs');


module.exports.init = async function (MS, moduleName, filename) {
    MS.initModuleData(MS, moduleName, filename);

    let config = null;

    try {
        config = fs.readFileSync(__dirname + "/config/config.json");
        MS.log.info("[image-uploader] Opened config.json");
    } catch (err) {
        MS.log.warn("[image-uploader] Did not find config/config.json, defaulting to config-example.json...");
        try {
            config = fs.readFileSync(__dirname + "/config/config-example.json");
            MS.log.info("[image-uploader] Opened config-example.json");
        } catch (err) {
            MS.log.error("[image-uploader] Could not load config-example.json or config.json... starting without image-uploader module. Please fix.");
            return false;
        }
    }
    config = JSON.parse(config);

    if (config.uploader === "") {
        MS.log.warn("[image-uploader] Not loaded due to the selected uploader being blank. Please set it if you want image uploading functionality.");
        return;
    }

    let uploaderDir = path.dirname(filename) + "/uploaders/" + config.uploader;

    try {
        await (new Promise((resolve, reject) => {
            fs.stat(uploaderDir, (err, stat) => {
                if (err === null) {
                    if (!stat.isDirectory()) {
                        reject("Not loaded due to selected uploader not being a directory. Currently only directory image modules are supported. (It would be nice to make so single file modules work too, though!");
                    } else {
                        // No issues
                        resolve();
                    }
                } else if (err.code == 'ENOENT') {
                    reject("Not loaded due to the selected uploader being a folder that does not exist.");
                } else {
                    reject("Not loaded due to unknown error in loading the selected uploader module folder.");
                }
            });
        }));
    } catch (err) {
        MS.log.warn("[image-uploader] Failed to load.", err);
        return false;
    }

    await MS.loadModules(uploaderDir);

    /* 'Standard' Options. None of these are required to be supported, but these are the names that should be used if they exist.
        - title
        - description
        - 
    */
    // the uploader should add a control named "upload-image-buffer" with takes (buffer, options) and returns an object with data.
    // If there was an error, it returns null.
    // The return object must have a property named `url` which is the url. It can include extra info if it wishes.

    if (!MS.hasControl("upload-image-buffer")) {
        MS.log.warn("[image-uploader] Failed to load. A control named 'upload-image-buffer' was not created.");
        return false;
    }
};