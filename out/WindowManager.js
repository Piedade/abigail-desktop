"use strict";
const electron_1 = require("electron");
const StateManager_1 = require("./StateManager");
const path = require("path");
const AppUpdater_1 = require("./AppUpdater");
const electronEventSignals_1 = require("./electronEventSignals");
exports.WINDOW_NAVIGATED = "windowNavigated";
class WindowManager {
    constructor() {
        this.stateManager = new StateManager_1.StateManager();
        this.windows = [];
        electron_1.app.on("window-all-closed", () => {
            this.stateManager.restoreWindows();
            if (process.platform == 'darwin') {
                this.openWindows();
            }
            else {
                electron_1.app.quit();
            }
        });
    }
    static saveWindowState(window, descriptor) {
        if (window.isMaximized()) {
            delete descriptor.width;
            delete descriptor.height;
            delete descriptor.x;
            delete descriptor.y;
        }
        else {
            const bounds = window.getBounds();
            descriptor.width = bounds.width;
            descriptor.height = bounds.height;
            descriptor.x = bounds.x;
            descriptor.y = bounds.y;
        }
    }
    registerWindowEventHandlers(window, descriptor) {
        window.on("close", (event) => {
            const window = event.sender;
            WindowManager.saveWindowState(window, descriptor);
            const url = window.webContents.getURL();
            if (!isUrlInvalid(url)) {
                descriptor.url = url;
            }
            this.stateManager.save();
        });
        window.on("closed", (event) => {
            const index = this.windows.indexOf(event.sender);
            console.assert(index >= 0);
            this.windows.splice(index, 1);
        });
        window.on("app-command", (e, command) => {
            if (command === "browser-backward") {
                if (window.webContents.canGoBack()) {
                    window.webContents.goBack();
                }
            }
            else if (command === "browser-forward") {
                if (window.webContents.canGoForward()) {
                    window.webContents.goForward();
                }
            }
        });
        const webContents = window.webContents;
        new electronEventSignals_1.WebContentsSignal(webContents)
            .navigated((event, url) => {
            electron_1.ipcMain.emit(exports.WINDOW_NAVIGATED, event.sender, url);
            webContents.send("maybeUrlChanged", url);
        })
            .navigatedInPage((event, url) => {
            electron_1.ipcMain.emit(exports.WINDOW_NAVIGATED, event.sender, url);
            webContents.send("maybeUrlChanged", url);
        });
    }
    openWindows() {
        let descriptors = this.stateManager.getWindows();
        if (descriptors == null || descriptors.length === 0) {
            this.stateManager.restoreWindows();
            descriptors = this.stateManager.getWindows();
        }
        for (const descriptor of descriptors) {
            if (isUrlInvalid(descriptor.url)) {
                descriptor.url = StateManager_1.DEFAULT_URL;
            }
            const options = {
                show: false,
                webPreferences: {
                    preload: path.join(__dirname, "autoSignIn.js"),
                    nodeIntegration: false,
                }
            };
            let isMaximized = true;
            if (descriptor.width != null && descriptor.height != null) {
                options.width = descriptor.width;
                options.height = descriptor.height;
                isMaximized = false;
            }
            if (descriptor.x != null && descriptor.y != null) {
                options.x = descriptor.x;
                options.y = descriptor.y;
                isMaximized = false;
            }
            const window = new electron_1.BrowserWindow(options);
            if (isMaximized) {
                window.maximize();
            }
            window.loadURL(descriptor.url);
            window.show();
            this.registerWindowEventHandlers(window, descriptor);
            this.windows.push(window);
        }
        new AppUpdater_1.default(this.windows[0]);
    }
    focusFirstWindow() {
        if (this.windows.length > 0) {
            const window = this.windows[0];
            if (window.isMinimized()) {
                window.restore();
            }
            window.focus();
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WindowManager;
function isUrlInvalid(url) {
    return url == null || url.length === 0 || url == "about:blank";
}
//# sourceMappingURL=WindowManager.js.map