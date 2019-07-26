const fs = require('fs');

module.exports = {
    load () {
        return JSON.parse(fs.readFileSync("./config.json"));
    },
    store (config) {
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
    }
};