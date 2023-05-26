const commonUtil = require("../utils/common");
const settingStorage = require("../storage/setting");
const eventUtil = require("../utils/event");
const uiUtil = require("../utils/ui");

let currentZoneLevel;

function Init() {
    commonUtil.bindEvent("/hunt", () => {

        const huntTabButton = document.querySelector("button.chakra-tabs__tab[data-index='0']");
        const playerListTabButton = document.querySelector("button.chakra-tabs__tab[data-index='1']");
        if (huntTabButton && playerListTabButton) {
            commonUtil.clearTimers();
            huntTabButton.onclick = registerHuntLogOberserverAndHideRestButtons;
            playerListTabButton.onclick = registerPlayerListObserverAndCreateSearchPlayerUI;

            currentZoneLevel = getCurrentZoneLevel();
        
            if (!localStorage.hunt_tabIndex || localStorage.hunt_tabIndex === "0") {
                registerHuntLogOberserverAndHideRestButtons();
            }else if (localStorage.hunt_tabIndex === "1") {
                registerPlayerListObserverAndCreateSearchPlayerUI();
            }
            
            eventUtil.subscribeApi("hunt", apiEvent);
            eventUtil.subscribeApi("boss", apiEvent);
    
    
        }
    });
}

function apiEvent(data) {
    if(data?.statusCode === 400) return;
    
    //百分比血體
    // if(settingStorage.get("GENERAL.HUNT_STATUS_PERCENT")){
    //     data.profile.fullHp += ` (${Math.floor(data.profile.hp / data.profile.fullHp * 100)}%)`
    //     data.profile.fullSp += ` (${Math.floor(data.profile.sp / data.profile.fullSp * 100)}%)`
    // }

    //爬層提示
    if(currentZoneLevel === undefined) currentZoneLevel = data.profile.huntStage
    if(data.profile.huntStage > currentZoneLevel){
        data.messages.push({
            m: `爬到了${data.profile.zoneName} ${data.profile.huntStage}`,
            s: "info"
        })
    }
    currentZoneLevel = data.profile.huntStage;

    //血量耗損提示
    data.meta.teamA.forEach(player => {
        const {name, hp} = player;
        const index = data.messages.findIndex(msg => msg.m.match(`^${name}還有 [0-9]+ 點HP`));
        if(!!~index){
            const huntHp = Number(commonUtil.regexGetValue(`${name}還有 ([0-9]+) 點HP`, data.messages[index].m)[0])
            if(hp - huntHp !== 0){
                if(hp - huntHp > 0){
                    data.messages[index].m += `(-${hp - huntHp})`
                }else{
                    data.messages[index].m += `(+${huntHp - hp})`
                }
            }
        }
    })

    //體力耗損提示
    const nickname = data.profile.nickname
    const metaData = data.meta.teamA.find(player => player.name === nickname);
    const index = data.messages.findIndex(msg => msg.m.match(`^${nickname}還有 [0-9]+ 點HP`));
    if(!!~index){
        const msg = {m: "", s: "subInfo"}
        if( metaData.sp - data.profile.sp > 0){
            msg.m = `${nickname}還有 ${data.profile.sp} 點體力(-${metaData.sp - data.profile.sp })`
        }else{
            msg.m = `${nickname}還有 ${data.profile.sp} 點體力(+${data.profile.sp - metaData.sp})`
        }
        data.messages.splice(index+1, 0, msg)
    }

    
    let findEquipmentBroken = false;
    let settingChanged = false;
    const playerNames = data.meta.teamA.map(player => player.name).join("|")
    data.messages.forEach(message => {
        //裝備損壞
        if(/損壞了$/.test(message.m)){
            findEquipmentBroken = true;
        }


        //物品過濾器
        if(/獲得了.*/.test(message.m)){
            const itemData = message.m.replace(/.*獲得了/, "").split(" × ");// .replace(/\ \×\ [0-9]+/, "")
            const itemName = itemData[0];
            const itemQuatity = itemData.length > 1 ? Number(itemData[1]) : 1;
            
            commonUtil.itemApplyFilter(itemName, {
                playSound: true
            })

            //狩獵記錄
            if(settingStorage.get("ITEM_RECORD.ENABLE")){                        
                const pattern = `(${playerNames}|)獲得了(.*)$`
                const regexResult = commonUtil.regexGetValue(pattern, message.m);

                if(!/ [0-9]+ 點.*(經驗值|熟練度)/.test(regexResult[1])){
                    //單人狩獵判斷
                    const currentPlayerName = regexResult[0] === "" ? nickname : regexResult[0]

                    const records = settingStorage.get("ITEM_RECORD.RECORDS");
                    if(!records[currentPlayerName]) records[currentPlayerName] = {}
                    
                    if(!records[currentPlayerName][itemName]){
                        records[currentPlayerName][itemName] = itemQuatity
                    }else{
                        records[currentPlayerName][itemName] += itemQuatity
                    }
                    settingStorage.set("ITEM_RECORD.RECORDS", records);
                    settingChanged = true;
                }
            }
        }

    });

    settingStorage.save();

    //裝備損壞超級提示
    if(findEquipmentBroken && settingStorage.get("GENERAL.RED_BACKBROUND_WHEN_EQUIPMENT_BROKEN")){
        document.querySelector("#__next").style.backgroundColor = "var(--chakra-colors-red-500)";
    }else{
        document.querySelector("#__next").style.backgroundColor = "";                            
    }
}

function getCurrentZoneLevel(){
    const currentZone = document.querySelector("[zones]").textContent.split("：")[1].trim();
    const reglevel = commonUtil.regexGetValue("([0-9]+)", currentZone)
    if(reglevel.length){
        return Number(reglevel[0])
    }
    return 0;
}

function createSearchPlayerUI(){

    if(document.querySelector("#searchPlayerName")) return;
    const playerListContainer = document.querySelector("[tabindex='0'] > .chakra-container > .css-0")
    const [div, input] = uiUtil.createSearchUI("搜尋玩家", "searchPlayerName");
    input.onchange = () => {
        const name = input.value;
        document.querySelectorAll("[tabindex='0'] > .chakra-container > .css-0 > div > div").forEach(row => {
            checkPlayerName(row, name);
        });
    };
    playerListContainer.querySelector("p").after(div);
}

function registerHuntLogOberserverAndHideRestButtons() {
    // console.log("Register");
    if(settingStorage.get("GENERAL.HIDE_REST_BUTTON")) hideRestButtons();

    commonUtil.clearObservers();
    const huntLogContainer = document.querySelector("[tabindex='0'] > .chakra-container").lastChild
    const observer = new MutationObserver(beautifyHuntLog);
    observer.observe(huntLogContainer, { childList: true });
    commonUtil.addObserver(observer);
    beautifyHuntLog();
}

function registerPlayerListObserverAndCreateSearchPlayerUI() {
    // console.log("Register");
    createSearchPlayerUI();
    commonUtil.clearObservers();
    const playerListContainer = document.querySelector("[tabindex='0'] > .chakra-container > .css-0")
    const observer = new MutationObserver(playerListRefreshEvent);
    observer.observe(playerListContainer, { childList: true, subtree: true });
    commonUtil.addObserver(observer);
    playerListRefreshEvent();
}

function hideRestButtons(){
    document.querySelectorAll("[tabindex='0'] > .chakra-container > div > button").forEach(button => {
        if(button.textContent === "休息") button.style.display = "none"; //button.style.marginLeft = "auto";
        // if(button.textContent === "清空記錄") button.style.marginLeft = "var(--chakra-space-2)";
    });

}


function beautifyHuntLog() {
    if (localStorage.hunt_tabIndex === "1") return;
    const huntLogContainer = document.querySelector(
        "[tabindex='0'] > .chakra-container " // > .css-0"
    ).lastChild
    huntLogContainer.childNodes.forEach((node) => {
        const lines = node.querySelectorAll("[data-line-number]");
        if (lines.length > 1 && !node.querySelector(".information")) {
            node.style.justifyContent = "space-between";
            const beforeHuntInformations = Array.from(
                node.childNodes[1].childNodes[0].childNodes
            );
            const profiles = [];
            const equipments = [];
            let playerInformationClassname;
            beforeHuntInformations.forEach((information) => {
                if (!playerInformationClassname) {
                    playerInformationClassname = information.childNodes[0].childNodes[0].className;
                }
                if ( information.childNodes[0].childNodes[0].className === playerInformationClassname) {
                    const informationLines = Array.from(information.childNodes);
                    //get name
                    const profileText = informationLines[0].innerText;
                    profiles.push({
                        name: profileText.split("\n")[0],
                        hp: commonUtil.regexGetValue("HP: ([0-9]+)", profileText)[0],
                        die: false,
                    });
                    // profiles.push(informationLines[0].innerText.split("\n")[0]);
                    informationLines.shift();

                    informationLines.forEach((information) => {
                        const equipmentData = information.innerText;
                        const equipment = {
                            name: commonUtil.regexGetValue("的(.*)（", equipmentData)[0],
                            durability: Number(commonUtil.regexGetValue("耐([0-9]+)", equipmentData)[0]),
                            costDurablilty: 9999999,
                            msgClassname: "",
                        };
                        equipments.push(equipment);
                    });
                }
            });

            const informationDiv = document.createElement("div");
            informationDiv.className = "information";
            informationDiv.style.marginLeft = "0.5em";
            let battleLogEnd = false;

            lines.forEach((line) => {
                const profile = profiles.find(
                    (profile) => line.innerText === `${profile.name}被擊殺死亡了`
                );
                if (profile) {
                    profile.die = true;
                    informationDiv.appendChild(line);
                }

                //單人戰鬥結束檢查
                if (!!~line.innerText.indexOf("點HP")) {
                    battleLogEnd = true;
                    //組隊戰鬥結束檢查
                } else if (profiles.filter((profile) => !profile.die).length === 0) {
                    battleLogEnd = true;
                }
                if (battleLogEnd) {
                    //血量耗損計算
                    profiles.forEach((profile) => {
                        const hpRegexMatch = commonUtil.regexGetValue(
                            `${profile.name}還有 ([0-9]+) 點HP`,
                            line.innerText
                        );
                        if (hpRegexMatch.length > 0) {
                            const currentHp = Number(hpRegexMatch[0]);
                            const costHp = profile.hp - currentHp;
                            if (costHp / profile.hp >= settingStorage.get("WARNING.HP") / 100) {
                                line.style.color = settingStorage.get("COLOR.WARNING");
                            }
                        }

                        const spRegexMatch = commonUtil.regexGetValue(
                            `${profile.name}還有 ([0-9]+) 點體力`,
                            line.innerText
                        );
                        if(spRegexMatch.length){
                            const currentSp = Number(spRegexMatch[0]);
                            if(currentSp < settingStorage.get("WARNING.SP")){
                                line.style.color = settingStorage.get("COLOR.WARNING");
                            }
                        }
                    });
                    //計算耐久
                    let findEquipment = false;
                    let equipmentBroken = false;
                    equipments.forEach((equipment) => {
                        //同名武器耐久篩選
                        if (equipment.costDurablilty === 9999999 && !findEquipment) {
                            const matchArray = commonUtil.regexGetValue(
                                `${equipment.name}耗損了 ([0-9]+) 點耐久`,
                                line.innerText
                            );
                            if (matchArray.length > 0) {
                                findEquipment = true;
                                equipment.msgClassname = line.className;
                                equipment.costDurablilty = Number(matchArray[0]);
                            }
                            if (RegExp(`${equipment.name}損壞了`).test(line.innerText)) {
                                equipment.costDurablilty = equipment.durability;
                                findEquipment = true;
                                equipmentBroken = true;
                            }
                        }
                    });

                    //武器損壞
                    if(equipmentBroken) {
                        informationDiv.insertBefore(line, informationDiv.firstChild);                                    
                    }
                    else{
                        informationDiv.appendChild(line);
                    }

                    //爬層提示
                    if(/^爬到了(.*)/.test(line.innerText)){
                        line.style.color = settingStorage.get("COLOR.ZONE_LEVEL");
                        informationDiv.insertBefore(line, informationDiv.firstChild);
                    }

                    if(/獲得了.*/.test(line.innerText)){
                        const itemName = line.innerText.replace(/.*獲得了/, "").replace(/\ \×\ [0-9]+/, "")
                        
                        commonUtil.itemApplyFilter(itemName, {
                            highlight: true,
                            dom: line
                        })
                    }
                }
            });
            //裝備耐久提示
            equipments.forEach((equipment) => {
                const calcDurablilty =
                    equipment.durability - equipment.costDurablilty;
                if (calcDurablilty > 0) {
                    const equipmentMsgDiv = document.createElement("div");
                    equipmentMsgDiv.className = equipment.msgClassname;
                    equipmentMsgDiv.innerText = `${equipment.name}還有 ${calcDurablilty} 點耐久`;
                    equipmentMsgDiv.style.color =
                        calcDurablilty <= settingStorage.get("WARNING.EQUIPMENT")
                            ? settingStorage.get("COLOR.WARNING")
                            : settingStorage.get("COLOR.TIPS")
                    informationDiv.appendChild(equipmentMsgDiv);
                }
            });
            // if(currentZoneLevel && getCurrentZoneLevel() > currentZoneLevel){
            //     const zoneLevelChangeDiv = document.createElement("div");
            //     zoneLevelChangeDiv.style.display = "flex";
            //     zoneLevelChangeDiv.style.color = settingStorage.get("COLOR.ZONE_LEVEL");
            //     zoneLevelChangeDiv.innerText = `爬到了${document.querySelector("[zones]").textContent.split("：")[1]}`
            //     informationDiv.insertBefore(zoneLevelChangeDiv, informationDiv.firstChild);
            // }
            // currentZoneLevel = getCurrentZoneLevel();

            const leftDiv = document.createElement("div");
            const rightDiv = document.createElement("div");
            leftDiv.style.display = "flex";
            rightDiv.style.alignSelf = "flex-start";
            leftDiv.appendChild(node.childNodes[0]);
            if(commonUtil.isMobileDevice()){
                informationDiv.style.marginLeft = "";
                if(settingStorage.get("GENERAL.MOBILE_HUNT_REPORT")){
                    informationDiv.insertBefore(node.childNodes[0].childNodes[0], informationDiv.childNodes[0]);                            
                    node.childNodes[0].remove();
                }else{
                    informationDiv.insertBefore(node.childNodes[0], informationDiv.childNodes[0]);
                }     
                leftDiv.appendChild(informationDiv);
            }else{
                leftDiv.appendChild(node.childNodes[0]);
                rightDiv.appendChild(informationDiv);
            }
            node.appendChild(leftDiv);
            if(!commonUtil.isMobileDevice()) node.appendChild(rightDiv);
        }
    });
}

function checkPlayerName(row, name) {
    //檢查是否為體力低下的提示row
    if(new RegExp("^[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$").test(row.outerText)) return;
    const playerName = row?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes[0].textContent;
    if(playerName && !!~playerName.indexOf(name)){
        row.hidden = false;
    }else {
        row.hidden = true;
    }
}

function playerListRefreshEvent() {

    document.querySelectorAll("[tabindex='0'] > .chakra-container > .css-0 > div > div").forEach(row => {
        //搜尋玩家
        checkPlayerName(row, document.querySelector("#searchPlayerName").value);
        //禁用壞按鍵
        if(settingStorage.get("GENERAL.DISABLE_BAD_BUTTON")){
            const menuButtons = row.querySelectorAll("[role='menu'] > button");
            menuButtons.forEach(button => {
                if(["搶劫", "我要超渡你"].includes(button.textContent)){
                    button.disabled = true;
                }
            });
        }


        // }
    });
}



export default Init;