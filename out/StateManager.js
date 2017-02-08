"use strict";
const os = require("os");
const path = require("path");
const ConfigStore = require("configstore");
const util_1 = require("./util");
exports.DEFAULT_URL = "http://admin.worldfatima.com/";
function defaultWindows() {
    return [
        { url: exports.DEFAULT_URL }
    ];
}
class StateManager {
    constructor() {
        this.store = new ConfigStore("onshape-unofficial", { windows: defaultWindows() });
        if (os.platform() == "darwin") {
            this.store.path = path.join(os.homedir(), "Library", "Preferences", "com.imagine.abigail" + (util_1.isDev() ? "-dev" : "") + ".json");
        }
    }
    restoreWindows() {
        let data = this.getOrLoadData();
        data.windows = defaultWindows();
        this.store.all = data;
    }
    getOrLoadData() {
        let data = this.data;
        if (data == null) {
            data = this.store.all;
            this.data = data;
        }
        return data;
    }
    getWindows() {
        return this.getOrLoadData().windows;
    }
    save() {
        const data = this.data;
        if (data != null) {
            this.store.all = data;
        }
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=StateManager.js.map