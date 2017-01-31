"use strict";
const _isDev = require('electron-is-dev');
function isDev() {
    return _isDev;
}
exports.isDev = isDev;
let _log;
if (isDev()) {
    _log = function (...args) {
        console.log(args);
    };
}
else {
    const nsLog = require("nslog");
    _log = function (...args) {
        nsLog(args);
    };
}
function log(...args) {
    _log(args);
}
exports.log = log;
//# sourceMappingURL=util.js.map