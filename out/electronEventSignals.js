"use strict";
const electron_1 = require("electron");
function isEnvTrue(v) {
    return v != null && (v.length === 0 || v === "true");
}
const isLogEvent = isEnvTrue(process.env.LOG_EVENTS);
function addHandler(emitter, event, handler) {
    if (isLogEvent) {
        emitter.on(event, function (...args) {
            console.log("%s %s", event, args);
            handler.apply(this, args);
        });
    }
    else {
        emitter.on(event, handler);
    }
}
class WebContentsSignal {
    constructor(emitter) {
        this.emitter = emitter;
    }
    navigated(handler) {
        addHandler(this.emitter, "did-navigate", handler);
        return this;
    }
    navigatedInPage(handler) {
        addHandler(this.emitter, "did-navigate-in-page", handler);
        return this;
    }
    frameLoaded(handler) {
        addHandler(this.emitter, "did-frame-finish-load", handler);
        return this;
    }
}
exports.WebContentsSignal = WebContentsSignal;
class AppSignal {
    constructor() {
        this.emitter = electron_1.app;
    }
    windowBlurred(handler) {
        addHandler(this.emitter, "browser-window-blur", handler);
        return this;
    }
    windowFocused(handler) {
        addHandler(this.emitter, "browser-window-focus", handler);
        return this;
    }
}
exports.AppSignal = AppSignal;
//# sourceMappingURL=electronEventSignals.js.map