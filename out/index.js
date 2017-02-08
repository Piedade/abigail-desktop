"use strict";
const electron_1 = require("electron");
const util_1 = require("./util");
const WindowManager_1 = require("./WindowManager");
let windowManager = null;
if (electron_1.app.makeSingleInstance((commandLine, workingDirectory) => {
    if (windowManager != null) {
        windowManager.focusFirstWindow();
    }
    return true;
})) {
    electron_1.app.quit();
}
else {
    require("electron-debug")();
    electron_1.app.on("ready", () => {
        electron_1.ipcMain.on("log.error", (event, arg) => {
            util_1.log(arg);
        });
        windowManager = new WindowManager_1.default();
        windowManager.openWindows();
    });
}
//# sourceMappingURL=index.js.map