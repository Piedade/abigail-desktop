"use strict";
const electron_1 = require("electron");
const os = require("os");
const util_1 = require("./util");
const electron_updater_1 = require("electron-updater");
class AppUpdater {
    constructor(window) {
        if (util_1.isDev()) {
            return;
        }
        const platform = os.platform();
        if (platform === "linux") {
            return;
        }
        if (platform === "darwin") {
            const log = require("electron-log");
            log.transports.file.level = "info";
            electron_updater_1.autoUpdater.logger = log;
        }
        electron_updater_1.autoUpdater.signals.updateDownloaded(it => {
            notify("Está disponível uma nova actualização.", `A versão ${it.version} foi transferida e vai ser automaticamente instalada quando ao Sair`);
        });
        electron_updater_1.autoUpdater.checkForUpdates();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppUpdater;
function notify(title, message) {
    let windows = electron_1.BrowserWindow.getAllWindows();
    if (windows.length == 0) {
        return;
    }
    windows[0].webContents.send("notify", title, message);
}
//# sourceMappingURL=AppUpdater.js.map