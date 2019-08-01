const fs = require('fs');
const util = require('util');

const chalk = require('chalk');

const configManager = require('./configManager.js');
const config = {
    _conf: configManager.load(),
    getConfigOptionRaw (name) {
        return this._conf[name];
    },
    setConfigOptionRaw (name, val) {
        this._conf[name] = val;
    },

    getConfigOption (name) {
        if (name === "rootModulesFolderName") {
            let folderName = this.getConfigOptionRaw(name);
            if (folderName == 0) {
                return this.getConfigOption("modulesFolderName");
            } else {
                return folderName
            }
        } else {
            return this.getConfigOptionRaw(name);
        }
    },

    setConfigOption (name, val) {
        return this.setConfigOptionRaw(name, val);
    }
};
const moduleDataManager = require('./moduleDataManager.js');
const moduleData = moduleDataManager.load();

// MainState
let MS = {
    MODULE_PATH: __dirname + '/' + config.getConfigOption("rootModulesFolderName"),
    config: config,
    chalk: chalk,

    configManager,
    moduleDataManager,

    // Public module data, should not store anything that can't be json.stringified in here.
    moduleData: moduleData,
    // things that the module wants exposed publicly, but a control wouldn't fit and it shouldn't be in moduleData
    // Won't be stored as json
    moduleDecl: {},

    // Sets moduleData for the module to a value if there wasn't anything stored there
    initModuleData (moduleName, obj={}) {
        if (this.moduleData[moduleName] === undefined) {
            this.moduleData[moduleName] = obj;
        }
    },

    // Yes, I took this idea from ww :)
    addControl (name, func) {
        if (typeof(func) !== 'function') {
            throw new Error("[ERROR] addControl for control: '%s', function passed in was not a function..");
        }
        this.controls[name] = func;
    },
    removeControl (name) {
        delete this.controls[name];
    },
    controls: Object.create(null),
    run (controlName, ...args) {
        if (typeof(this.controls[controlName]) === 'function') {
            return this.controls[controlName](...args);
        } else {
            MS.log.warn("Attempted to run non-existant control by the name of: '" + controlName + "'.");
            return undefined;
        }
    },

    log: {
        _text (modifier=(x=>x), ...data) {
            let text = '';
            for (let i = 0; i < data.length; i++) {
                if (typeof(data[i]) === 'string') {
                    text += data[i];
                } else {
                    text += util.inspect(data[i]);
                }
                text += ' ';
            }
            console.log(modifier(text));
        },
        text (...data) {
            return this._text(undefined, ...data);
        },
        info (...data) {
            return this._text(x => chalk.green(x), '[INFO]', ...data)
        },
        warn (...data) {
            return this._text(x => chalk.yellow(x), '[WARN]', ...data);
        },
        error (...data) {
            return this._text(x => chalk.red(x), '[ERROR]', ...data);
        }
    }
};

console.log(chalk.cyan("[] MainState initialized. Module Path: " + MS.MODULE_PATH));


MS.loadFileModule = function (filename) {
    let data = require(filename);
    let moduleName = "[UNNAMED] " + filename;

    MS.log.info("Loading module: " + filename);

    if (data === null || typeof(data) !== 'object') {
        MS.log.warn(`\tData exported by module (${filename}) was not an object. Please at least return an empty object with a module name.`);
        // We assume they already did their side effects, since they didn't give us a function to run.
        return;
    }

    if (data.name) {
        moduleName = data.name;
    }

    moduleName = moduleName.replace(/\..+$/, '');

    if (typeof(data.init) === 'function') {
        data.init(MS, moduleName, filename);
    }
}

MS.loadModules = function (baseDirectory) {
    MS.log.info("Loading modules in: " + baseDirectory);
    let files = fs.readdirSync(baseDirectory);
    MS.log.info("Found " + files.length + " files.");
    for (let i = 0; i < files.length; i++) {
        let filename = baseDirectory + "/" + files[i];
        let rootStat = fs.lstatSync(filename);

        if (rootStat.isFile()) {
            MS.loadFileModule(filename);
        } else if (rootStat.isDirectory()) {
            let subFilename = filename + "/" + config.getConfigOption("moduleMainFile");
            if (fs.existsSync(subFilename)) {
                let indexStat = fs.lstatSync(subFilename);

                if (indexStat.isFile()) {
                    MS.loadFileModule(subFilename);
                } else {
                    MS.log.warn("There is a non-file named the same as the set main fle for a module. Ignoring it, but this might be a mistake.");
                }
            }

            let subModules = filename + "/" + config.getConfigOption("modulesFolderName");
            if (fs.existsSync(subModules)) {
                let modStat = fs.lstatSync(subModules);
                if (modStat.isDirectory) {
                    MS.loadModules(subModules);
                } else {
                    MS.log.warn("There is a non-folder named the same as the set name for submodules. Ignoring it, but this might be a mistake.");
                }
            }
        } else {
            MS.log.warn("Found non file and non folder in modules folder. Ignoring it, but this might be a mistake.");
        }
    }
}

setInterval(() => {
    MS.log.info("Saving config and module data.");
    MS.configManager.store(MS.config._conf);
    MS.moduleDataManager.store(MS.moduleData);
}, 1200000); // 2m

MS.loadModules(MS.MODULE_PATH);