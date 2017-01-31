(function () {
    "use strict";
    const SERVICE_NAME = "org.develar.onshape";
    const LOGIN_NAME = "data";
    const keytar = require("keytar");
    let passwordToSave = null;
    let foundFormElementTimerId = -1;
    let oldUrl = null;
    const ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.on("maybeUrlChanged", (event, newUrl) => {
        if (oldUrl != newUrl) {
            try {
                urlChanged(oldUrl, window.location);
            }
            finally {
                oldUrl = newUrl;
            }
        }
    });
    ipcRenderer.on("notify", (event, title, message) => {
        new Notification(title, {
            body: message
        });
    });
    document.addEventListener("DOMContentLoaded", () => {
        checkLocationAndSignInIfNeed();
    });
    class Credentials {
        constructor(login, password) {
            this.login = login;
            this.password = password;
        }
    }
    function loadCredentials() {
        const data = keytar.getPassword(SERVICE_NAME, LOGIN_NAME);
        if (isNotEmpty(data)) {
            try {
                var parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    if (parsed.length == 2) {
                        return new Credentials(parsed[0], parsed[1]);
                    }
                    else {
                        ipcRenderer.send("log.error", "Incorrect credentials data, see keychain");
                    }
                }
            }
            catch (e) {
                console.error(e);
                ipcRenderer.send("log.error", e);
            }
        }
        return null;
    }
    function getInputElement(name) {
        return document.querySelector('input[name="' + name + '"]');
    }
    function isNotEmpty(string) {
        return string != null && string.length != 0;
    }
    function setValue(input, value) {
        input.value = value;
        input.dispatchEvent(new Event("change", { "bubbles": true }));
    }
    function fillAndSubmit(formElement) {
        const credentials = loadCredentials();
        if (credentials != null && isNotEmpty(credentials.login)) {
            setValue(getInputElement("email"), credentials.login);
            if (isNotEmpty(credentials.password)) {
                setValue(getInputElement("password"), credentials.password);
                document.querySelector('div.os-form-btn-container > button[type="submit"').click();
                return;
            }
        }
        var superOnSubmit = formElement.onsubmit;
        formElement.onsubmit = event => {
            passwordToSave = null;
            if (superOnSubmit != null) {
                superOnSubmit(event);
            }
            let login = getInputElement("email").value;
            let password = getInputElement("password").value;
            if (isNotEmpty(login) && isNotEmpty(password)) {
                passwordToSave = new Credentials(login, password);
            }
        };
    }
    function fillOrWait() {
        let formElement = document.querySelector("form[name='osForm']");
        if (formElement != null) {
            console.log("form element found");
            fillAndSubmit(formElement);
        }
        else {
            console.log("form element not found, schedule");
            setTimeout(() => {
                checkLocationAndSignInIfNeed();
            });
        }
    }
    function checkLocationAndSignInIfNeed() {
        let location = window.location;
        if (location.host == "cad.onshape.com" && location.pathname == "/signin") {
            fillOrWait();
        }
    }
    function urlChanged(oldUrl, newLocation) {
        if (foundFormElementTimerId != -1) {
            clearTimeout(foundFormElementTimerId);
        }
        if (passwordToSave != null) {
            if (newLocation.host == "cad.onshape.com" && oldUrl.endsWith("/signin") && newLocation.pathname != "/signup/forgotpassword") {
                keytar.replacePassword(SERVICE_NAME, LOGIN_NAME, JSON.stringify([passwordToSave.login, passwordToSave.password]));
            }
            passwordToSave = null;
        }
        else if (document.readyState != "loading") {
            checkLocationAndSignInIfNeed();
        }
    }
}());
//# sourceMappingURL=autoSignIn.js.map