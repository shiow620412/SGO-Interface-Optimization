const commonUtil = require("../utils/common");

function Init() {
    commonUtil.bindEvent("/profile", () => {
        const actionContainer = document.querySelectorAll(".chakra-container")[2];
        if (actionContainer) {
            actionContainer.querySelector("div > button:nth-child(3)").onclick = calcTime;
            commonUtil.clearTimers();
        }
    });
}

function calcTime() {
    const actionContainer =
        document.querySelectorAll(".chakra-container")[2];
    const actionLogContainer = actionContainer.querySelector(
        "div > :nth-child(12)"
    );
    if (actionLogContainer.tagName === "HR") return;
    const actionTime =
        actionContainer.querySelector("div > span").innerText;

    const observer = new MutationObserver(function (e) {
        const row = actionLogContainer.querySelector(
            "div:nth-child(1) > div:nth-child(2) > div"
        );
        // console.log("row", row, row.innerText);
        row.innerText += `    ${actionTime}`;
        setTimeout(() => {
            const msgArray = JSON.parse(localStorage.generalActionMessages);
            // console.log("msgArray", msgArray);
            msgArray[0].messages[0].m = row.innerText;
            localStorage.generalActionMessages = JSON.stringify(msgArray);
        }, 1500);

        observer.disconnect();
        // console.log("disconnnnnnnnnnnn");
    });

    observer.observe(actionLogContainer, {
        subtree: true,
        childList: true,
        characterData: true,
    });
    commonUtil.addObserver(observer);
}



export default Init;