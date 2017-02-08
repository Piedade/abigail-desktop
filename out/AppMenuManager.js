"use strict";
const electron_1 = require("electron");
const WindowManager_1 = require("./WindowManager");
const electronEventSignals_1 = require("./electronEventSignals");
function setMenu(homeUrl) {
    const windowsMenu = {
        label: 'Window',
        role: 'window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize'
            },
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close'
            },
        ]
    };
    const name = electron_1.app.getName();
    const template = [
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: (item, focusedWindow) => {
                        if (focusedWindow != null)
                            focusedWindow.reload();
                    }
                },
                {
                    label: 'Enter Full Screen',
                    accelerator: process.platform == 'darwin' ? 'Ctrl+Command+F' : 'F11',
                    click: (item, focusedWindow) => {
                        if (focusedWindow)
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                },
            ]
        },
        {
            label: 'History',
            submenu: [
                {
                    label: 'Back',
                    accelerator: 'CmdOrCtrl+[',
                    enabled: false,
                    click: function () {
                        historyGo(true);
                    }
                },
                {
                    label: 'Forward',
                    enabled: false,
                    accelerator: 'CmdOrCtrl+]',
                    click: function () {
                        historyGo(false);
                    }
                },
                {
                    label: 'Home',
                    enabled: false,
                    accelerator: 'Shift+CmdOrCtrl+H',
                    click: function () {
                        const webContents = getFocusedWebContents();
                        if (webContents != null) {
                            webContents.loadURL(homeUrl);
                        }
                    }
                },
            ]
        },
        windowsMenu,
    ];
    if (process.platform === 'darwin') {
        template.unshift({
            label: name,
            submenu: [
                {
                    label: 'About ' + name,
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide ' + name,
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    role: 'hideothers'
                },
                {
                    label: 'Show All',
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        electron_1.app.quit();
                    }
                }
            ]
        });
        (windowsMenu.submenu).push({
            type: 'separator'
        }, {
            label: 'Bring All to Front',
            role: 'front'
        });
    }
    const appMenu = electron_1.Menu.buildFromTemplate(template);
    const items = appMenu.items;
    for (const item of items) {
        if (item.label === "History") {
            const submenu = item.submenu;
            updateHistoryMenuItems(submenu.items, homeUrl);
            break;
        }
    }
    electron_1.Menu.setApplicationMenu(appMenu);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setMenu;
function updateHistoryMenuItems(items, homeUrl) {
    function updateEnabled(webContents) {
        items[0].enabled = webContents.canGoBack();
        items[1].enabled = webContents.canGoForward();
    }
    electron_1.ipcMain.on(WindowManager_1.WINDOW_NAVIGATED, ((webContents, url) => {
        updateEnabled(webContents);
        items[2].enabled = url.replace(/(\?.*)|(#.*)/g, "") != homeUrl;
    }));
    new electronEventSignals_1.AppSignal()
        .windowBlurred(() => {
        items[0].enabled = false;
        items[1].enabled = false;
    })
        .windowFocused((event, window) => {
        updateEnabled(window.webContents);
    });
}
function getFocusedWebContents() {
    const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
    return focusedWindow == null ? null : focusedWindow.webContents;
}
function historyGo(back) {
    const webContents = getFocusedWebContents();
    if (webContents != null) {
        if (back) {
            webContents.goBack();
        }
        else {
            webContents.goForward();
        }
    }
}
//# sourceMappingURL=AppMenuManager.js.map