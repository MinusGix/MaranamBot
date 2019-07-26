const fs = require('fs');

module.exports = {
    load () {
        return JSON.parse(fs.readFileSync("./moduleData.json"));
    },
    store (moduleData) {
        fs.writeFileSync("./moduleData.json", JSON.stringify(moduleData, null, 4));
    }
};