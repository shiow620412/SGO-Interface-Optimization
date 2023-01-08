// ==UserScript==
// @name         Sword Gale Online 介面優化
// @namespace    http://tampermonkey.net/
// @version      1.13.4
// @description  優化界面
// @author       Wind
// @match        https://swordgale.online/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=swordgale.online
// @grant        none
// @license MIT
// @run-at document-start
// ==/UserScript==

(function () {
    "use strict";
    const VERSION = "1.13.4"
    const STORAGE_NAME = "SGO_Interface_Optimization";
    const DEFAULT_SETTINGS = {
        COLOR: {
            WARNING: "#FC8181", //紅色警告
            TIPS: "#9AE6B4", //一般提示
            TRUE_STATS: "#FEEBC8", //裝備原始素質顏色
            ZONE_LEVEL: "#FF95CA" //樓層切換的顏色
        },
        WARNING: {
            EQUIPMENT: 20, //裝備低於多少耐久
            HP: 60, //血量單次耗損幾成
        },
        GENERAL: {
            DISABLE_BAD_BUTTON: false, //將 false 改成 true，即可禁用"搶劫"與"我要超渡你"按鍵
        },
        recipe: {}
    }

    let SETTINGS = loadSettings();
    const qualityJson = {
        傳說: 2.3,
        神話: 2.1,
        史詩: 2.0,
        完美: 1.8,
        頂級: 1.7,
        精良: 1.5,
        高級: 1.3,
        上等: 1.2,
        普通: 1,
        次等: 0.9,
        劣質: 0.8,
        破爛: 0.7,
        垃圾般: 0.55,
        屎一般: 0.4,
    };

    
    const observers = [];
    const timers = [];
    const pageScript = {
        "/profile": () => {
            bindEvent("/profile", () => {
                const actionContainer =
                    document.querySelectorAll(".chakra-container")[2];
                if (actionContainer) {
                    actionContainer.querySelector("div > button:nth-child(3)").onclick =
                        calcTime;
                    clearTimers();
                }
            });

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
                observers.push(observer);
            }
        },
        "/hunt": () => {
            let currentZoneLevel;
            bindEvent("/hunt", () => {
                const btn = document.querySelector(
                    "button.chakra-tabs__tab[data-index='0']"
                );
                const btn2 = document.querySelector(
                    "button.chakra-tabs__tab[data-index='1']"
                );
                if (btn && btn2) {
                    clearTimers();
                    btn.onclick = registerHuntLogObserver;
                    btn2.onclick = registerPlayerListObserverAndCreateSearchPlayerUI;
                    currentZoneLevel = getCurrentZoneLevel();
                    if (!localStorage.hunt_tabIndex || localStorage.hunt_tabIndex === "0") {
                        registerHuntLogObserver();
                    }else if (localStorage.hunt_tabIndex === "1") {                        
                        registerPlayerListObserverAndCreateSearchPlayerUI();
                    }
                    
                }
            });
            function getCurrentZoneLevel(){
                const currentZone = document.querySelector("[zones]").textContent.split("：")[1].trim();
                const reglevel = regexGetValue("([0-9]+)", currentZone)
                if(reglevel.length){
                    return Number(reglevel[0])
                }
                return 0;
            }

            function createSearchPlayerUI(){
                // const moveActionContainer = document.querySelector(".chakra-container > div");
                // const badButtonControl = moveActionContainer.querySelector("div").cloneNode(true);
                // const switchLabel = badButtonControl.childNodes[0];
                // badButtonControl.style.top = "2rem";
                // badButtonControl.childNodes[1].textContent = "開啟壞壞行動"
                // badButtonControl.childNodes[1].removeAttribute("for");
                // badButtonControl.onclick = (e) => {
                //     e.preventDefault();
                //     if(switchLabel.getAttribute("data-checked") !== null){
                //         switchLabel.removeAttribute("data-checked");
                //         switchLabel.querySelector("span").removeAttribute("data-checked");
                //         switchLabel.querySelector("span > span").removeAttribute("data-checked");
                //     }else {
                //         switchLabel.setAttribute("data-checked", "");
                //         switchLabel.querySelector("span").setAttribute("data-checked", "");
                //         switchLabel.querySelector("span > span").setAttribute("data-checked", "");
                //     }
                // };
                
                // moveActionContainer.appendChild(badButtonControl);
                if(document.querySelector("#searchPlayerName")) return;
                const playerListContainer = document.querySelector("[tabindex='0'] > .chakra-container > .css-0")
                // console.log(playerListContainer);
                const div = document.createElement("div");                
                div.style.display = "flex";
                div.style.alignItems = "center";
                div.style.marginBottom = "1rem"
                div.innerHTML = `<label style="width: 84px;">搜尋玩家</label>`
                const input = document.createElement("input");
                input.type = "text";
                input.id = "searchPlayerName"
                input.autocomplete = "off"
                input.style.cssText = `
                    width: var(--chakra-sizes-full);
                    min-width: 0px;
                    outline: transparent solid 2px;
                    outline-offset: 2px;
                    position: relative;
                    appearance: none;
                    transition-property: var(--chakra-transition-property-common);
                    transition-duration: var(--chakra-transition-duration-normal);
                    font-size: var(--chakra-fontSizes-md);
                    padding-inline-start: var(--chakra-space-4);
                    padding-inline-end: var(--chakra-space-4);
                    height: var(--chakra-sizes-10);
                    border-radius: var(--chakra-radii-md);
                    border-width: 2px;
                    border-style: solid;
                    border-image: initial;
                    border-color: var(--chakra-colors-transparent);
                    background: var(--chakra-colors-whiteAlpha-100);
                `
                input.onchange = () => {
                    const name = input.value;
                    document.querySelectorAll("[tabindex='0'] > .chakra-container > .css-0 > div > div").forEach(row => {
                       checkPlayerName(row, name);
                    });
                };
                div.appendChild(input);
                playerListContainer.querySelector("p").after(div);
            }

            function registerHuntLogObserver() {
                // console.log("Register");
                clearObservers();
                const huntLogContainer = document.querySelector(
                    "[tabindex='0'] > .chakra-container " // > .css-0"
                ).lastChild
                const observer = new MutationObserver(beautifyHuntLog);
                observer.observe(huntLogContainer, { childList: true });
                observers.push(observer);
                beautifyHuntLog();
            }

            function registerPlayerListObserverAndCreateSearchPlayerUI() {
                // console.log("Register");
                createSearchPlayerUI();
                clearObservers();
                const playerListContainer = document.querySelector("[tabindex='0'] > .chakra-container > .css-0")
                const observer = new MutationObserver(disableBadButton);
                observer.observe(playerListContainer, { childList: true, subtree: true });
                observers.push(observer);
                disableBadButton();
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
                                playerInformationClassname =
                                    information.childNodes[0].childNodes[0].className;
                            }
                            if (
                                information.childNodes[0].childNodes[0].className ===
                                playerInformationClassname
                            ) {
                                const informationLines = Array.from(information.childNodes);
                                //get name
                                const profileText = informationLines[0].innerText;
                                profiles.push({
                                    name: profileText.split("\n")[0],
                                    hp: regexGetValue("HP: ([0-9]+)", profileText)[0],
                                    die: false,
                                });
                                // profiles.push(informationLines[0].innerText.split("\n")[0]);
                                informationLines.shift();

                                informationLines.forEach((information) => {
                                    const equipmentData = information.innerText;
                                    const equipment = {
                                        name: regexGetValue("的(.*)（", equipmentData)[0],
                                        durability: Number(
                                            regexGetValue("耐([0-9]+)", equipmentData)[0]
                                        ),
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
                            } else if (
                                profiles.filter((profile) => !profile.die).length === 0
                            ) {
                                battleLogEnd = true;
                            }
                            if (battleLogEnd) {
                                //血量耗損計算
                                profiles.forEach((profile) => {
                                    const hpRegexMatch = regexGetValue(
                                        `${profile.name}還有 ([0-9]+) 點HP`,
                                        line.innerText
                                    );
                                    if (hpRegexMatch.length > 0) {
                                        const currentHp = Number(hpRegexMatch[0]);
                                        const costHp = profile.hp - currentHp;
                                        if (costHp / profile.hp >= getSettingByKey("WARNING").HP / 100) {
                                            line.style.color = getSettingByKey("COLOR").WARNING;
                                        }
                                    }
                                });
                                //計算耐久
                                let findEquipment = false;
                                equipments.forEach((equipment) => {
                                    //同名武器耐久篩選
                                    if (equipment.costDurablilty === 9999999 && !findEquipment) {
                                        const matchArray = regexGetValue(
                                            `${equipment.name}耗損了 ([0-9]+) 點耐久`,
                                            line.innerText
                                        );
                                        if (matchArray.length > 0) {
                                            findEquipment = true;
                                            equipment.msgClassname = line.className;
                                            equipment.costDurablilty = Number(matchArray[0]);
                                        }
                                        if (
                                            RegExp(`${equipment.name}損壞了`).test(line.innerText)
                                        ) {
                                            equipment.costDurablilty = equipment.durability;
                                            findEquipment = true;
                                        }
                                    }
                                });

                                informationDiv.appendChild(line);
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
                                    calcDurablilty <= getSettingByKey("WARNING").EQUIPMENT
                                        ? getSettingByKey("COLOR").WARNING
                                        : getSettingByKey("COLOR").TIPS;
                                informationDiv.appendChild(equipmentMsgDiv);
                            }
                        });
                        if(currentZoneLevel && getCurrentZoneLevel() > currentZoneLevel){
                            const zoneLevelChangeDiv = document.createElement("div");
                            zoneLevelChangeDiv.style.display = "flex";
                            zoneLevelChangeDiv.style.color = getSettingByKey("COLOR").ZONE_LEVEL;
                            zoneLevelChangeDiv.innerText = `爬到了${document.querySelector("[zones]").textContent.split("：")[1]}`
                            informationDiv.appendChild(zoneLevelChangeDiv);
                        }
                        currentZoneLevel = getCurrentZoneLevel();

                        const leftDiv = document.createElement("div");
                        const rightDiv = document.createElement("div");
                        leftDiv.style.display = "flex";
                        rightDiv.style.alignSelf = "flex-start";
                        leftDiv.appendChild(node.childNodes[0]);
                        leftDiv.appendChild(node.childNodes[0]);
                        rightDiv.appendChild(informationDiv);

                        node.appendChild(leftDiv);
                        node.appendChild(rightDiv);
                    }
                });
            }

            function checkPlayerName(row, name) {
                if(new RegExp("^[0-9]{2}/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$").test(row.outerText)) return;
                const playerName = row?.childNodes[1]?.childNodes[0]?.childNodes[1]?.childNodes[0].textContent;
                if(playerName && !!~playerName.indexOf(name)){
                    row.hidden = false;
                }else {
                    row.hidden = true;
                }
            }

            function disableBadButton() {
                
                document.querySelectorAll("[tabindex='0'] > .chakra-container > .css-0 > div > div").forEach(row => {
                    checkPlayerName(row, document.querySelector("#searchPlayerName").value);
                    if(getSettingByKey("GENERAL").DISABLE_BAD_BUTTON){

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
        },
        "/items": () => {
            const tablesColumns = {};
            bindEvent(["/items", "/market"], () => {
                //var targetContainer = document.querySelector(".chakra-tabs").childNodes[2];
                const tables = document.querySelectorAll("table");
                const targetContainer = document.querySelector(".chakra-tabs");
                if (!tables || !targetContainer) return;
                if (location.pathname === "/market" && tables.length < 3) {
                    return;
                }
                // if (location.pathname === "/items") {
                    // targetContainer = document.querySelector(".chakra-tabs");
                    const observer = new MutationObserver((e) => {
                        if(e.length === 2 && e[1].addedNodes.length && e[1].addedNodes[0].innerHTML !== ''){    
                            onItemsDetail(e[1].addedNodes[0].childNodes[0].childNodes);
                        }
                    });;
                    observer.observe(targetContainer, {subtree: false, childList:true })
                    // observer.observe(targetContainer, {
                    //     subtree: true,
                    //     childList: true,
                    //     characterData: true,
                    // });
                // }
                tables.forEach((table) => {
                    const tableId = `table${Object.keys(tablesColumns).length}`;
                    table.id = tableId;
                    tablesColumns[tableId] = getTableColumns(table, sortTable);
                });
                clearTimers();
            });

            function sortTable(e) {
                const tableDOM = e.target.parentElement.parentElement.parentElement;
                const sortClassDOM = tableDOM.querySelector(".sort");
                let sortingMethod = "↓";
                if (sortClassDOM) {
                    if (sortClassDOM === e.target) {
                        sortingMethod = !!~sortClassDOM.innerText.indexOf("↓") ? "↑" : "↓";
                    }
                    sortClassDOM.classList.remove("sort");
                    sortClassDOM.innerText = sortClassDOM.innerText.slice(0, -1);
                }
                const sortType = e.target.innerText;
                const tableColumns = tablesColumns[tableDOM.id];
                const targetColumn = tableColumns.find(
                    (column) => column.name === sortType
                );
                const tbodyDOM = tableDOM.querySelector("tbody");
                if (targetColumn.isNumeric) {
                    const data = getTableData(tableDOM, targetColumn, tableColumns);

                    let sortedData = data.sort((a, b) => a[sortType] - b[sortType]);
                    if (sortingMethod === "↑") {
                        sortedData = sortedData.reverse();
                    }

                    sortedData.forEach((item) => {
                        tbodyDOM.appendChild(item.DOM);
                    });

                    e.target.innerText += sortingMethod;
                    e.target.classList.add("sort");
                } else {
                    const data = {};
                    tbodyDOM.querySelectorAll("tr").forEach((rowDOM) => {
                        const index = tableColumns.indexOf(targetColumn);
                        const key = rowDOM.childNodes[index].innerText;
                        if (data[key]) {
                            data[key].push(rowDOM);
                        } else {
                            data[key] = [rowDOM];
                        }
                    });

                    Object.keys(data).forEach((key) => {
                        data[key].forEach((rowDOM) => {
                            tbodyDOM.appendChild(rowDOM);
                        });
                    });
                }
            }
            function onItemsDetail(containerNodes) {
                if(containerNodes[1].tagName === "H2") return;

                const targetDom = containerNodes[1];
                if (targetDom.classList.contains("addedTrueStat")) return;      

                let quality = regexGetValue("(傳說|神話|史詩|完美|頂級|精良|高級|上等|普通|次等|劣質|破爛|垃圾般|屎一般)的", targetDom.querySelector("h2").innerText);
                if (quality.length === 0)
                    return console.error("quality error");

                const ratio = qualityJson[quality[0]];
                if (!ratio) return console.error("ratio error");
                
                //市集的裝備顯示有較多資訊 故childNodes在7
                let statDom ;
                if(targetDom.childNodes.length >= 8){
                    statDom = targetDom.childNodes[7].childNodes[0];
                }else{
                    statDom = targetDom.querySelector("hr + div").childNodes[0];
                }
                const [atk, def, luck, kg, dur] = statDom.innerHTML
                    .split("<br>")
                    .map((s, index) => {
                        //有強化的裝備
                        let value = regexGetValue("([0-9]+) \\(([+-]{1}[0-9]+)\\)", s);
                        if(value.length === 2){                        
                            return Number(value[0]) - Number(value[1])                             
                        }else {
                            //耐久數值處理
                            if(index === 4){
                                value = regexGetValue("[0-9]+ / ([0-9]+)", s);
                            }else {
                                value = regexGetValue("([0-9]+)", s);
                            }
                            //一般情況
                            if(value.length > 0){
                                return Number( value[0]);
                            }
                            console.error("parse stat error");
                            return 0;
                        }
                    });

                const trueStats = [atk, def, luck].map((num) => {
                    return (num / ratio).toFixed(2);
                });
                trueStats.push(kg.toFixed(2));
                trueStats.push((dur / ratio).toFixed(2));

                const colorSpan = document.createElement("span");
                colorSpan.style.color = getSettingByKey("COLOR").TRUE_STATS;
                const newStatHTML = statDom.innerHTML
                    .split("<br>")
                    .map((s, index) => {
                        colorSpan.innerText = `(${trueStats[index]})`
                        return `${s} ${colorSpan.outerHTML}`;                
                    })
                    .join("<br>");
                targetDom.classList.add("addedTrueStat");
                statDom.innerHTML = newStatHTML;
                const div = document.createElement("div");
                div.innerText = "括號內原始素質僅供參考，有研究出更好的算法可以聯絡插件作者";
                targetDom.appendChild(targetDom.querySelector("hr").cloneNode());
                targetDom.appendChild(div);

            }
        },
        "/market"() {
            this["/items"]();
        },
        "/forge": () => {
            let recipeData = getSettingByKey("recipe");
            const elementClassname = {};
            let materialDiv, forgeContainer;
            const filterRecipe = {};
            bindEvent("/forge", () => {
                forgeContainer = document.querySelectorAll(".chakra-container");
                if (forgeContainer.length > 0) {
                    if (forgeContainer.length > 1) {
                        forgeContainer = forgeContainer[1];
                    } else {
                        forgeContainer = forgeContainer[0];
                    }
                    // if(!materialDiv)
                    materialDiv = forgeContainer.childNodes[2];

                    if (materialDiv.querySelector(".chakra-table__container")) {
                        clearTimers();

                        createUI();
                        refreshRecipeTable();
                        forgeContainer.querySelector("#addRecipeBtn").onclick = addRecipe;
                    }
                }
            });

            function createUI() {
                const equipmentNameDiv =
                    forgeContainer.querySelector("div[role='group']");
                elementClassname["labelDiv"] = equipmentNameDiv.childNodes[1].className;
                elementClassname["input"] = equipmentNameDiv.childNodes[2].className;
                elementClassname["button"] =
                    forgeContainer.querySelector("button").className;

                materialDiv.before(createRecipeTable());
                materialDiv.after(createAddRecipeBlock());
            }

            function createRecipeTable() {
                const recipeDiv = document.createElement("div");
                recipeDiv.id = "recipeDiv";
                recipeDiv.style.marginBottom = "1.25rem";
                const recipeH2 = materialDiv.querySelector("h2").cloneNode();
                recipeH2.innerText = "合成配方(非官方功能)";

                const recipeTable = materialDiv
                    .querySelector(".chakra-table__container")
                    .cloneNode();
                recipeTable.innerHTML = materialDiv.querySelector(
                    ".chakra-table__container"
                ).innerHTML;

                const tableColumns = recipeTable.querySelectorAll("thead > tr > th");
                tableColumns[0].innerText = "名稱";
                tableColumns[1].innerText = "材料";
                tableColumns[1].removeAttribute("data-is-numeric");
                tableColumns[2].innerText = "操作";
                tableColumns[2].style.minWidth = "1px";
                tableColumns[2].style.width = "1px";
                //清空Table
                recipeTable.querySelector("tbody").innerHTML = "";

                elementClassname["td"] =
                    materialDiv.querySelector("tbody > tr > td").className;
                elementClassname["tr"] =
                    materialDiv.querySelector("tbody > tr").className;

                recipeDiv.appendChild(recipeH2);
                recipeDiv.appendChild(recipeTable);

                return recipeDiv;
            }

            function createAddRecipeBlock() {
                const div = document.createElement("div");
                div.style.marginBottom = "1.25rem";

                div.innerHTML = `
                      <div class="${elementClassname["labelDiv"]}">選擇完原料之後輸入配方名字，可將此次選擇的原料記錄在合成配方裡面</div>
                      <input id="recipeNameInput" type="text" class="${elementClassname["input"]}" style="width: 80%;">
                      <button id="addRecipeBtn" type="button" class="${elementClassname["button"]}" style="width: 18%; float: right;">新增配方</button>
                  `;
                return div;
            }

            function refreshRecipeTable() {
                const keyOfRecipeData = Object.keys(recipeData);
                if (keyOfRecipeData.length > 0) {
                    let tbody = forgeContainer.querySelector("#recipeDiv");
                    if (!tbody) {
                        materialDiv.before(createRecipeTable());
                        tbody = forgeContainer.querySelector("#recipeDiv");
                    }
                    tbody = tbody.querySelector("tbody");
                    const recipeNamesDOM = tbody.querySelectorAll("tr > td:nth-child(1)");
                    if (recipeNamesDOM) {
                        recipeNamesDOM.forEach((recipeNamesDOM) => {
                            const index = keyOfRecipeData.indexOf(recipeNamesDOM.innerText);
                            if (!!~index) {
                                keyOfRecipeData.splice(index, 1);
                            }
                        });
                    }
                    // tbody.innerHTML = "";
                    keyOfRecipeData.forEach((key) => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                              <td class="${elementClassname["td"]}">${key}</td>
                              <td class="${elementClassname["td"]}" style="white-space: normal;">${recipeData[key]}</td>
                              <td class="${elementClassname["td"]}">
                                  <button type="button" class="${elementClassname["button"]}"
                                      style="height: 1.75rem; background-color: indianred;"
                                  >X</button>
                              </td>
                          `;
                        tr.className = elementClassname["tr"];
                        tr.querySelector("button").onclick = removeRecipe;
                        tr.onclick = clickRecipe;
                        tbody.appendChild(tr);
                    });
                }
            }

            function clickRecipe(e) {
                if(e.target.tagName === "BUTTON") return;

                let tr = e.currentTarget;

                const recipeName = tr.querySelector("td").innerText;
                if (tr.style.backgroundColor) {
                    tr.style.backgroundColor = "";
                    delete filterRecipe[recipeName];
                } else {
                    tr.style.backgroundColor = "#1C4532";
                    filterRecipe[recipeName] = recipeData[recipeName];
                }

                const materialTable = materialDiv.querySelector("table");
                const tableData = getTableData(materialTable, {
                    name: "名稱",
                    isNumeric: false,
                });
                const materials = {};
                const keyOfFilterRecipe = Object.keys(filterRecipe);
                if (keyOfFilterRecipe.length === 0) {
                    tableData.forEach((row) => {
                        row["DOM"].removeAttribute("hidden");
                    });
                } else {
                    keyOfFilterRecipe.forEach((name) => {
                        filterRecipe[name]
                            .replaceAll(/ × [0-9]+/g, "")
                            .split("、")
                            .forEach((material) => {
                                if (!materials[material]) {
                                    materials[material] = 1;
                                }
                            });
                    });
                    tableData.forEach((row) => {
                        if (materials[row["名稱"]]) {
                            row["DOM"].removeAttribute("hidden");
                        } else {
                            row["DOM"].setAttribute("hidden", "");
                        }
                    });
                }
            }

            function addRecipe() {
                const recipeNameInput = document.querySelector("#recipeNameInput");
                const recipeName = recipeNameInput.value;
                if (recipeName !== "") {
                    const materials = [];
                    forgeContainer.childNodes[5].childNodes[2].childNodes.forEach(
                        (materialDOM) => {
                            const materialName = materialDOM.innerText;
                            materials.push(materialName);
                            for (let i = 0; i < Number(materialName.split(" × ")[1]); i++) {
                                setTimeout(() => {
                                    materialDOM.click();
                                }, 100);
                            }
                        }
                    );
                    recipeData = getSettingByKey("recipe");
                    if (!recipeData[recipeName] && materials.length > 0) {
                        recipeData[recipeName] = materials.join("、");
                        SETTINGS["recipe"] = recipeData;
                        saveSettings();                        
                        refreshRecipeTable();
                        recipeNameInput.value = "";
                    } else {
                        alert("配方名稱與材料不可為空");
                    }
                } else {
                    alert("配方名稱與材料不可為空");
                }
            }

            function removeRecipe(e) {
                const row = e.target.parentElement.parentElement;
                const recipeName = row.querySelector("td").innerText;
                delete recipeData[recipeName];
                SETTINGS["recipe"] = recipeData;
                saveSettings();
                row.remove();
            }
        },
    };
    
    function createSettingUI(){
        const style = document.createElement("style");
        style.innerText = `* {
            box-sizing: border-box;
          }
          
          .wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(15, 19, 26, 0.8);
            height: 100vh;
            position: fixed;
            width: 100%;
            /* height: 100%; */
            left: 0;
            top: 0;
            overflow: auto;
            z-index: 9999;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            margin: 1rem 1rem 0 1rem;
          }
          .header button {
            height: 100%;
          }
          .header h1 {
            color: #fff;
          }
          .header #reset-settings-btn {
            border: 1px solid #3c3f43;
            margin-right: 1rem;
          }
          
          .content {
            display: flex;
            margin: 0 1rem 1rem 1rem;
            flex-direction: column;
          }
          .content hr {
            width: 100%;
          }
          
          .panel {
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
          }
          .panel input[type=checkbox] {
            margin: 0.5rem;
          }
          .panel input[type=text] {
            background-color: #1a1d24;
            background-image: none;
            border: 1px solid #3c3f43;
            border-radius: 6px;
            color: #e9ebf0;
            display: block;
            font-size: 14px;
            line-height: 1.42857143;
            padding: 7px 11px;
            transition: border-color 0.3s ease-in-out;
            width: 100px;
          }
          
          .panel + .panel::before {
            border-top: 1px solid #3c3f43;
            content: "";
            left: 20px;
            position: absolute;
            right: 20px;
            top: 0;
          }
          
          .panel-header {
            width: 100%;
            padding: 20px;
          }
          .panel-header span {
            color: #fff;
            font-size: 16px;
            line-height: 1.25;
          }
          
          .panel-body {
            padding: 0 20px 20px 20px;
          }
          
          .description {
            margin: 0px;
            color: #a4a9b3;
            line-height: 1.5;
            font-size: 8px;
          }
          
          .dialog {
            width: 800px;
            height: 500px;
            left: 0;
            top: 0;
            overflow: auto;
            z-index: 9999;
            background-color: #292d33;
            border-radius: 6px;
            box-shadow: 0 4px 4px rgba(0, 0, 0, 0.12), 0 0 10px rgba(0, 0, 0, 0.06);
          }
          
          .row {
            margin-top: 1rem;
            display: flex;
            align-items: center;
          }
          .row label {
            color: #a4a9b3;
            margin-right: 1rem;
          }
          .row input {
            margin-right: 1rem;
          }
          
          #open-dialog-btn {
            position: -webkit-sticky;
            position: sticky;
            left: 0;
            bottom: 0;
            margin-right: 1rem;
            z-index: 9998;
            color: #7d7d7d;
            background-color: transparent;
            border: none;
          }
          
          #open-dialog-btn:hover {
            color: #fff;
          }/*# sourceMappingURL=style.css.map */`
        const wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.display = "none";
        wrapper.innerHTML = `<div class="dialog">
        <div class="header">
            <h1>SGO介面優化插件 Ver${VERSION}</h1>
            <div>
                <button id="reset-settings-btn">RESET</button>
                <button id="close-dialog-btn">X</button>
            </div>
        </div>
        <div class="content">
            <div class="panel">
                <div class="panel-header">
                    <span>一般</span>
                </div>
                <div class="panel-body">
                    <p class="description">
                        一般功能的開啟與關閉
                    </p>
                    <div class="row">
                        <input type="checkbox" id="bad-button">
                        <label for="bad-button">禁用搶劫與超渡按鍵</label>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-header">
                    <span>顏色</span>
                </div>
                <div class="panel-body">
                    <p class="description">
                        設定插件各種提示的顏色
                    </p>
                    <div class="row">
                        <label for="tips">一般提示</label>
                        <input type="text" id="tips">
                        <p>我是顏文字</p>
                    </div>
                    <div class="row">
                        <label for="warning">紅色警告</label>
                        <input type="text" id="warning">
                        <p>我是顏文字</p>
                    </div>
                    <div class="row">
                        <label for="true-stats">裝備原始素質</label>
                        <input type="text" id="true-stats">
                        <p>我是顏文字</p>
                    </div>
                    <div class="row">
                        <label for="zone-level">到達新樓層</label>
                        <input type="text" id="zone-level">
                        <p>我是顏文字</p>
                    </div>
                </div>
            </div>
           
            <div class="panel">
                <div class="panel-header">
                    <span>警示</span>
                </div>
                <div class="panel-body">
                    <p class="description">
                        設定警示功能的數值
                    </p>
                    <div class="row">
                        <label for="equipment">裝備耐久低於(數值)</label>
                        <input type="text" id="equipment">
                    </div>
                    <div class="row">
                        <label for="hp">血量單次耗損(百分比)</label>
                        <input type="text" id="hp">
                    </div>
                </div>
            </div>
          
        </div>
    </div>`
        const openDialogBtn = document.createElement("button");
        openDialogBtn.id = "open-dialog-btn"
        openDialogBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings" width="50" height="50" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        `
        document.body.appendChild(style);
        document.body.appendChild(wrapper);        
        document.body.appendChild(openDialogBtn);
    }
 
    function registerSettingUIEvent(){
        document.querySelector("#open-dialog-btn").onclick = () => {document.querySelector(".wrapper").style.display = ""}
        document.querySelector("#close-dialog-btn").onclick = () => {document.querySelector(".wrapper").style.display = "none"}
        document.querySelector("#reset-settings-btn").onclick = () => {        
            SETTINGS = structuredClone(DEFAULT_SETTINGS);
            registerSettingUIEvent();
        };
        document.querySelector(".wrapper").onclick = (e) => {
            if(e.target.className === "wrapper") e.target.style.display = "none";
        }
        const settingElement = {
            GENERAL:{
                DISABLE_BAD_BUTTON: document.querySelector("#bad-button"),
            },
            COLOR: {
                TIPS: document.querySelector("#tips"),
                WARNING: document.querySelector("#warning"),
                TRUE_STATS: document.querySelector("#true-stats"),
                ZONE_LEVEL: document.querySelector("#zone-level"),
            },
            WARNING: {
                EQUIPMENT: document.querySelector("#equipment"),
                HP: document.querySelector("#hp"),
            }
        }

        settingElement.GENERAL.DISABLE_BAD_BUTTON.checked = getSettingByKey("GENERAL").DISABLE_BAD_BUTTON
        const colorSetting = getSettingByKey("COLOR");
        Object.entries(settingElement["COLOR"]).forEach(entry => {
            const element = entry[1];

            element.value = colorSetting[entry[0]];
            element.nextElementSibling.style.color = element.value;
            element.onchange = () => {
                if(!/^#[0-9a-fA-F]{6}$/.test(element.value)){
                    element.value = colorSetting[entry[0]];
                }
                colorSetting[entry[0]] = element.value;
                element.nextElementSibling.style.color = element.value
                saveSettings();
            };
        });
        const warningSetting = getSettingByKey("WARNING");
        Object.entries(settingElement["WARNING"]).forEach(entry => {
            const element = entry[1];
            element.value = warningSetting[entry[0]];

            element.onchange = () => {
                if(Number.isNaN(Number(element.value))){
                   return 
                }
                colorSetting[entry[0]] = Number(element.value);
                saveSettings();
            };
        });

        settingElement.GENERAL.DISABLE_BAD_BUTTON.onchange = () => {
            getSettingByKey("GENERAL").DISABLE_BAD_BUTTON = settingElement.GENERAL.DISABLE_BAD_BUTTON.checked;
            saveSettings();
        };  

    }

   
    function loadSettings() {
        if (localStorage[STORAGE_NAME]) {
            try{
                return JSON.parse(localStorage[STORAGE_NAME]);
            }catch(e){}
        }        
        return structuredClone(DEFAULT_SETTINGS);
    }
    
    function saveSettings() {
        localStorage[STORAGE_NAME] = JSON.stringify(SETTINGS);
    }
    function getSettingByKey(key) {
        if(!SETTINGS[key]) {
            SETTINGS[key] = structuredClone(DEFAULT_SETTINGS)[key]
            saveSettings();
        }else if(key === "recipe" && typeof SETTINGS[key] === 'string'){
            try{
                SETTINGS[key] = JSON.parse(SETTINGS[key]);
            }catch(e){
                SETTINGS[key] = {};
            }
            saveSettings();
        }
        return SETTINGS[key]
    }
    //--------------------------------
    function localDataSet(key, value) {
        let data;
        if (localStorage[STORAGE_NAME]) {
            data = JSON.parse(localStorage[STORAGE_NAME]);
        } else {
            data = {
                recipe: {},
                COLORS: {
                    WARNING: "#FC8181", //紅色警告
                    TIPS: "#9AE6B4", //一般提示
                    TRUE_STATS: "#FEEBC8", //裝備原始素質顏色
                    ZONE_LEVEL: "#FF95CA" //樓層切換的顏色
                },
                WARNING: {
                    EQUIPMENT: 20, //裝備低於多少耐久
                    HP: 0.6, //血量單次耗損幾成
                },
                DISABLE_BAD_BUTTON: false //將 false 改成 true，即可禁用"搶劫"與"我要超渡你"按鍵
            };
        }

        // data[key] = JSON.stringify(value);
        data[key] = value;
        localStorage[STORAGE_NAME] = JSON.stringify(data);
    }
    function localDataGet(key) {
        if (localStorage[STORAGE_NAME]) {
            const data = JSON.parse(localStorage[STORAGE_NAME]);
            if(data[key]){
                if(typeof data[key] === "string"){
                    return JSON.parse(data[key])
                }
                return data[key]
            }
            return {}; //data[key] ? JSON.parse(data[key]) : {};
        } else {
            // localStorage[STORAGE_NAME] = JSON.stringify({key:{}});
            return {};
        }
    }
    /**
     * @returns {{name: string, isNumeric: boolean}[]}
     */
    function getTableColumns(table, tableHeaderClickEvent) {
        const ths = table.querySelectorAll("thead > tr > th");
        const tableColumns = [];
        ths.forEach((th) => {
            const column = {
                name: th.innerText,
                isNumeric: th.getAttribute("data-is-numeric") ? true : false,
            };
            tableColumns.push(column);
            if (tableHeaderClickEvent) th.onclick = tableHeaderClickEvent;
        });

        return tableColumns;
    }
    /**
     * @param {HTMLTableElement} targetColumnName
     * @param {{name: string, isNumeric: boolean}} targetColumn
     * @param {{name: string, isNumeric: boolean}[]} columns
     * @returns {{DOM: HTMLTableRowElement}[]}
     */
    function getTableData(table, targetColumn, columns) {
        const data = [];
        if (!columns) {
            columns = getTableColumns(table);
        }
        const index = columns.findIndex(
            (column) => column.name === targetColumn.name
        );
        if (!!~index === false) return [];

        table.querySelectorAll("tbody > tr").forEach((row) => {
            const rowData = {};

            //金錢逗號處理
            const text = row.childNodes[index].innerText.replaceAll(",", "");
            if (targetColumn.name === "耐久") {
                rowData[targetColumn.name] = Number(
                    regexGetValue("([0-9]+) / [0-9]+", text)[0]
                );
            } else {
                rowData[targetColumn.name] = targetColumn.isNumeric
                    ? Number(text)
                    : text;
            }

            rowData["DOM"] = row;
            data.push(rowData);
        });
        return data;
    }
    function regexGetValue(pattern, str) {
        const match = new RegExp(pattern).exec(str);
        if (match) {
            return match.slice(1);
        } else {
            return [];
        }
    }
    function clearObservers() {
        // console.log("clear")
        observers.forEach((observer) => {
            observer.disconnect();
        });
        observers.length = 0;
    }
    function clearTimers() {
        // console.log("clear")
        timers.forEach((timer) => {
            clearInterval(timer);
        });
        timers.length = 0;
    }
    function bindEvent(pathname, timerEvent) {
        const timer = setInterval(() => {
            if (Array.isArray(pathname)) {
                if (
                    pathname.filter((path) => path === location.pathname).length === 0
                ) {
                    clearInterval(timer);
                    return;
                }
            } else {
                if (location.pathname !== pathname) {
                    clearInterval(timer);
                    return;
                }
            }

            timerEvent();
        }, 100);
        timers.push(timer);
    }

    let container;
    let debounce = 0;
    let timer = setInterval(() => {
        container = document.querySelector("#__next");
        if (container) {
            clearInterval(timer);
            createSettingUI();
            registerSettingUIEvent();
            loadObserver();
        }else{
            // console.log("test")
        }
    }, 10);

    function loadObserver() {
        const observer = new MutationObserver(function (e) {
            // console.log(e);

            //奇怪的DOM 導致forge UI產生兩次
            if (e.length) {
                let renderDiv = false;
                for(let i = 0; i < e.length; i++){

                    if (
                        (e[i].addedNodes.length && e[i].addedNodes[0].tagName === "DIV") ||
                        (e[i].removedNodes.length && e[i].removedNodes[0].tagName === "DIV")
                    ) {
                        renderDiv = true;
                        // console.log("DOM !!!!", e, location.pathname)
                        // return;
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
                        clearObservers();
                        clearTimers();
                        pageScript[pathname]();
                    }
                }, 500);
            }
        });
        observer.observe(container, { subtree: false, childList: true });
    }
    // Your code here...
})();
