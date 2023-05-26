// import scriptLoader from "./pages/main";
const scriptLoader = require("./pages/main").default;
const commonUtil = require("./utils/common");
const uiUtil = require("./utils/ui");
const settingStorage = require("./storage/setting");
const eventUtil = require("./utils/event");

const pageScript = {
    "/profile": () => {
        scriptLoader.profile();
    },
    "/hunt": () => {       
        scriptLoader.hunt();
    },
    "/items": () => {
        scriptLoader.items();
    },
    "/market"() {
        this["/items"]();
    },
    "/forge": () => {
        scriptLoader.forge();
    },
};


let container;
let debounce = 0;
let timer = setInterval(() => {
    container = document.querySelector("#__next");
    if (container) {
        clearInterval(timer);
        uiUtil.createOpenDialogButton();
        if(commonUtil.isMobileDevice() && settingStorage.get("GENERAL.MOBILE_WRAP_NAVBAR")) uiUtil.wrapNavbar()
        if(settingStorage.get("GENERAL.BACKGROUND_IMAGE_URL") !== ""){
            const backgroundImageDiv = document.createElement("div");
            backgroundImageDiv.style.cssText = `
                background: #fff url(${settingStorage.get("GENERAL.BACKGROUND_IMAGE_URL")}) center center fixed no-repeat;
                background-size: cover;
                -webkit-background-size: cover;
                width: 100%;
                height: 100%;
                position: fixed;
                top: 0;
                left: 0;
                opacity: 0.5;
                pointer-events: none;
            `
            if((/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)))
                backgroundImageDiv.style.cssText += "background-attachment: scroll;"
            backgroundImageDiv.id = "background-image-div";
            document.body.insertBefore(backgroundImageDiv, document.body.firstChild);
            // document.body.style.background = ``;
            // document.body.style.backgroundSize = "cover";
        }
        // createSettingUI();
        // registerSettingUIEvent();
        loadObserver();
    }else{
        // console.log("test")
    }
}, 10);

function loadObserver() {
    const observer = new MutationObserver(function (e) {

        //奇怪的DOM 導致forge UI產生兩次
        if (e.length) {
            let renderDiv = false;
            for(let i = 0; i < e.length; i++){

                if (
                    (e[i].addedNodes.length && e[i].addedNodes[0].tagName === "DIV") ||
                    (e[i].removedNodes.length && e[i].removedNodes[0].tagName === "DIV")
                ) {
                    renderDiv = true;
                }
            }
            if(!renderDiv) return;
        }
        const pathname = location.pathname;
        if (pageScript[pathname]) {
            debounce++;
            setTimeout(() => {
                debounce--;
                if (debounce === 0) {
                    //console.log(e);
                    commonUtil.clearObservers();
                    commonUtil.clearTimers();
                    eventUtil.clearSubscribeEvents();

                    pageScript[pathname]();
                }
            }, 500);
        }
    });
    observer.observe(container, { subtree: false, childList: true });
}

if(location.hash !== ""){
    const token = location.hash.substring(1); 
    history.pushState(null, null, "/");
    const _getItem = localStorage.getItem;
    localStorage.getItem = (key) => {
        if(key === "token") return token;
        return _getItem.apply(localStorage, [key]);
    }
}

