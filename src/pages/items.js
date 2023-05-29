
const commonUtil = require("../utils/common");
const settingStorage = require("../storage/setting");
const eventUtil = require("../utils/event");
const forgeStorage = require("../storage/forge");
const globalVarsStorage = require("../storage/globalVars")
const uiUtil = require("../utils/ui");

const quality = {
    傳說: [2.3, 0.82],
    神話: [2.1, 0.84],
    史詩: [2.0, 0.85],
    完美: [1.85, 0.87],
    頂級: [1.65, 0.88],
    精良: [1.5, 0.9],
    高級: [1.33, 0.93],
    上等: [1.15, 0.96],
    普通: [1, 1],
    次等: [0.9, 1.01],
    劣質: [0.8, 1.02],
    破爛: [0.7, 1.03],
    垃圾般: [0.55, 1.06],
    屎一般: [0.4, 1.1],
}


const tablesColumns = {};
const equipmentFilter = {
    color: "",
    type: "",
}


function Init() {
    commonUtil.bindEvent(["/items", "/market"], () => {
        //var targetContainer = document.querySelector(".chakra-tabs").childNodes[2];
        const tables = document.querySelectorAll("table");
        const targetContainer = document.querySelector(".chakra-tabs");
        if (!tables || !targetContainer) return;
        if (location.pathname === "/market" && tables.length < 3) {
            return;
        }
        commonUtil.clearTimers();
        const observer = new MutationObserver((e) => {
            if(e.length === 2 && e[1].addedNodes.length && e[1].addedNodes[0].innerHTML !== ''){
                if(!settingStorage.get("GENERAL.DISABLE_TRUE_STATS")) onItemsDetail(e[1].addedNodes[0].childNodes[0].childNodes);
                if(location.pathname === "/market" && !settingStorage.get("GENERAL.DISABLE_MARKET_FUNCTION")) createMarketButtons(e[1].addedNodes[0].childNodes[0].childNodes);
            }
        });;
        observer.observe(targetContainer, {subtree: false, childList:true })
        commonUtil.addObserver(observer);
    

        if(!document.querySelector("#searchPlayerName") && location.pathname === "/market") {
    
            const [div, input] = uiUtil.createSearchUI("搜尋販賣者", "searchPlayerName");
            // targetContainer.before(targetContainer.firstChild, div);
            div.querySelector("label").style.width = "96px";
            div.style.maxWidth = "800px";
            div.style.marginLeft = "auto";
            div.style.marginRight = "auto";
            div.style.width ="95%"
            document.querySelector("[role=tablist]").before(div);

            
            ["equipments", "mines", "items"].forEach(category => {
                eventUtil.subscribeApi(`trades?category=${category}`, (data) => {
                    data.trades = data.trades.filter(trade => trade.sellerName.match(input.value))
                
                });
            });
        };
    

        const types = ["equipments", "mines", "items"]
        tables.forEach((table) => {
            const type = types.shift();
            const tableId = `table${Object.keys(tablesColumns).length}-${type}`;
            table.id = tableId;
            tablesColumns[tableId] = commonUtil.getTableColumns(table, sortTable);
            if(location.pathname === "/items") {
                const tableData = commonUtil.getTableData(table, {name: "類型", isNumeric: false}, tablesColumns[tableId]);
                const types = [];
                tableData.forEach(row => {
                    if(!types.includes(row["類型"])) types.push(row["類型"])
                })

                createTypeFilter(table, types);
                createQuickFilter(table);
            }else if(location.pathname === "/market"){
    
                const tbody = table.querySelector("tbody");
                function highlightRow(){
                    const rows = tbody.querySelectorAll("[role=row]");
                    rows.forEach(row => { row.style.border = ""; });
                    
                    const highlightRowData = globalVarsStorage.get("HIGHTLIGHT_ROW");

                    highlightRowData[type].forEach(rowIndex => {
                        if(rows.length > 0){
                            // console.log(tbody.childNodes, rowIndex, tbody.childNodes[rowIndex])
                            try{
                                rows[rowIndex].style.border = `solid ${settingStorage.get("COLOR.MARKET_WATCH")}`;
                            }catch(e) {
                                console.error(rowIndex, rows );
                            }
                        }
                    });
                }
                const observer = new MutationObserver(highlightRow);
                // tbody.firstChild.remove();
                observer.observe(tbody, {subtree: false, childList:true })
                commonUtil.addObserver(observer);
                tbody.appendChild(document.createElement("tr"));
                // highlightRow();
            }
            
    
    
            
        });
    
        // document.querySelector(".chakra-container > div > button")?.click()
    });
    
}

function filterTable( ){
    // if(equipmentFilter.color === "" && equipmentFilter.type === "") return;

    const equipmentTableRow = document.querySelectorAll("#table0-equipments > tbody > tr");

    equipmentTableRow.forEach(tr => {
        const equipmentColor = getComputedStyle(tr.querySelector("td:nth-child(1) > div")).borderColor;
        const equipmentType = tr.querySelector("td:nth-child(2)").textContent;

        
        if(equipmentFilter.color === "" || equipmentFilter.color === equipmentColor){
            tr.style.display = "";
        }else{
            tr.style.display = "none";
            return;
        }

        if(equipmentFilter.type === "" || equipmentFilter.type === equipmentType){
            tr.style.display = "";
        }else{
            tr.style.display = "none";
            return;
        }
    });

}


function createQuickFilter(table) {
    if(document.querySelector(".quick-filter-container")) return;
    const quickFilterContainer = document.createElement("div");
    
    quickFilterContainer.classList.add("quick-filter-container");
    quickFilterContainer.innerText = "快篩："

    const colors = ["red", "blue", "cyan", "green", "teal", "orange", "yellow", "pink", "purple", "gray"];
    colors.forEach(color => {
        const circle = document.createElement("div");
        circle.classList.add(`circle-${color}`);

        circle.onclick = (e) => {
            let lastClickCircle;
            circle.parentNode.querySelectorAll("div").forEach(div => {
                if(div.style.backgroundColor !== "") lastClickCircle = div;
                div.style.backgroundColor = ""
            })
            let targetColor = "";
            if(lastClickCircle !== circle) {
                circle.style.backgroundColor = `var(--chakra-colors-${color}-500)`;
                targetColor = color === "gray" ? "rgba(0, 0, 0, 0)" : getComputedStyle(circle).backgroundColor;
            }
            equipmentFilter.color = targetColor;
            filterTable();
            // table.querySelectorAll("tr > td:nth-child(1) > div").forEach(div => {
            //     const tr = div.parentElement.parentElement;
            //     if(targetColor === "" || getComputedStyle(div).borderColor === targetColor){
            //         tr.style.display = "";
            //     }else{
            //         tr.style.display = "none";
            //     }
            // });
        };

        quickFilterContainer.appendChild(circle);
    });

    table.before(quickFilterContainer);
}

function createTypeFilter(table, types) {
    if(document.querySelector(".type-filter-container")) return;

    const typeFilterContainer = document.createElement("div");
    
    typeFilterContainer.classList.add("type-filter-container");
    typeFilterContainer.innerText = "類型："

    // const types = ["單手劍", "細劍", "短刀", "單手錘", "盾牌", "雙手劍", "太刀", "雙手斧", "長槍", "大衣", "盔甲", "戒指"];
    types.forEach(type => {
        const choice = document.createElement("div");
        const circle = document.createElement("div");

        choice.classList.add(`choice`);
        circle.classList.add("circle");

        choice.appendChild(circle);
        choice.append(type)

        choice.onclick = (e) => {
            if(!e.target.matches(".circle")) return;
            // console.log(choice, circle);
            let lastClickCircle;
            choice.parentNode.querySelectorAll("div > .circle").forEach(div => {
                if(div.style.backgroundColor !== "") lastClickCircle = div;
                div.style.backgroundColor = ""
            })

            equipmentFilter.type = "";
            if(lastClickCircle !== circle) {
                circle.style.backgroundColor = `var(--chakra-colors-gray-500)`;
                equipmentFilter.type = type
            }

            filterTable();
        };

        typeFilterContainer.appendChild(choice);
    });

    table.before(typeFilterContainer);
}

function sortTable(e) {
    const tableDOM = e.target.parentElement.parentElement.parentElement;
    const sortClassDOM = tableDOM.querySelector(".sort");
    if(["攻擊", "防禦", "耐久"].includes(e.target.innerText)  && location.pathname === "/items") {
        if(sortClassDOM && sortClassDOM.innerText.match("↓|↑")){
            sortClassDOM.innerText = sortClassDOM.innerText.slice(0, -1);
            sortClassDOM.classList.remove("sort");
        }
        return;
    };

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
        const data = commonUtil.getTableData(tableDOM, targetColumn, tableColumns);

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
        tbodyDOM.querySelectorAll("tr[role=row]").forEach((rowDOM) => {
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

    let equipmentNameMatch = commonUtil.regexGetValue("(傳說|神話|史詩|完美|頂級|精良|高級|上等|普通|次等|劣質|破爛|垃圾般|屎一般)的 (.*)", targetDom.querySelector("h2").innerText);
    if (equipmentNameMatch.length < 2) return console.error("quality error");

    //replace把強化次數移除 
    const equipmentName = equipmentNameMatch[1].replace(/\ \+\ [0-9]+/, ""); 
    const ratio = quality[equipmentNameMatch[0]];
    if (!ratio) return console.error("ratio error");

    //市集的裝備顯示有較多資訊 故childNodes在7
    let statDom, forgeDataDom ;
    if(targetDom.childNodes.length >= 6 && location.pathname === "/market"){
        forgeDataDom = targetDom.querySelector("hr + div");
        statDom = targetDom.childNodes[5].childNodes[0];
    }else{
        forgeDataDom = targetDom.childNodes[2];
        statDom = targetDom.querySelector("hr + div").childNodes[0];
    }
    const [atk, def, luck, kg, dur] = statDom.innerHTML
        .split("<br>")
        .map((s, index) => {
            //有強化的裝備
            let value = commonUtil.regexGetValue("([0-9]+) \\(([+-]{1}[0-9]+)\\)", s);
            if(value.length === 2){
                return Number(value[0]) - Number(value[1])
            }else {
                //耐久數值處理
                if(index === 4){
                    value = commonUtil.regexGetValue("[0-9]+ / ([0-9]+)", s);
                }else {
                    value = commonUtil.regexGetValue("([0-9]+)", s);
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
        return (num / ratio[0]).toFixed(2);
    });
    trueStats.push((kg / ratio[1]).toFixed(2));
    trueStats.push((dur / ratio[0]).toFixed(2));

    const colorSpan = document.createElement("span");
    colorSpan.style.color = settingStorage.get("COLOR.TRUE_STATS");
    const newStatHTML = statDom.innerHTML
        .split("<br>")
        .map((s, index) => {
            colorSpan.innerText = `(${trueStats[index]})`
            return `${s} ${colorSpan.outerHTML}`;
        })
        .join("<br>");

    const forger = forgeDataDom.childNodes[0].textContent.replace("鍛造者：","")
    const forgeTime = new Date(`${new Date().getFullYear()} ${forgeDataDom.childNodes[1].textContent.replace("鍛造時間：", "")}`)
    forgeTime.setSeconds(0);
    forgeTime.setMilliseconds(0);
    const base64 =  btoa(encodeURIComponent(`${forgeTime.getTime()},${equipmentName},${forger}`))
    let forgeMaterial = "";

    if(forgeStorage.get(base64)) {
        forgeMaterial = `鍛造材料:${forgeStorage.get(base64)}\n`;
    }

    targetDom.classList.add("addedTrueStat");
    statDom.innerHTML = newStatHTML;
    const div = document.createElement("div");
    div.innerText = `${forgeMaterial}括號內原始素質僅供參考，有研究出更好的算法可以聯絡插件作者`;
    targetDom.appendChild(targetDom.querySelector("hr").cloneNode());
    targetDom.appendChild(div);

}
function createMarketButtons(containerNodes) {
    let seller = "";
    //道具or礦物
    if(containerNodes[1].tagName === "H2"){
        //販賣者：XXXX
        if(!containerNodes[3]?.childNodes[1]?.childNodes[1]?.textContent.startsWith("販賣者：")) return;

        seller = containerNodes[3]?.childNodes[1]?.childNodes[1]?.textContent.substring(4)
    }else { //裝備類
        // seller =  containerNodes[1].childNodes[3].childNodes[0].textContent.substring(4)
        if(!containerNodes[1].querySelector("h2 + div")?.childNodes[1]?.childNodes[1]?.textContent.startsWith("販賣者：")) return;
        seller =  containerNodes[1].querySelector("h2 + div").childNodes[1].childNodes[1].textContent.substring(4)
    }

    const buttonContainer = containerNodes[containerNodes.length - 1];
    const buyButton = buttonContainer.querySelector("button");

    if(buyButton === null ||
        settingStorage.get("MARKET.WATCH_LIST").includes(seller) ||
        settingStorage.get("MARKET.BLACK_LIST").includes(seller)
    )
        return;

    const watchButton = buyButton.cloneNode();
    const blacklistButton = buyButton.cloneNode();

    watchButton.style.marginRight = "0.5rem";
    watchButton.innerText = "關注賣家"
    if(watchButton.getAttribute("disabled") === "") watchButton.removeAttribute("disabled")
    watchButton.onclick = () => {
        let list = settingStorage.get("MARKET.WATCH_LIST");
        watchButton.remove();
        blacklistButton.remove();
        if(!list.includes(seller)){
            list.push(seller);
            settingStorage.set("MARKET.WATCH_LIST", list);
            settingStorage.save();
        }
    };

    blacklistButton.innerText = "黑名單賣家"
    blacklistButton.style.backgroundColor = settingStorage.get("COLOR.WARNING");
    blacklistButton.style.marginRight = "0.5rem";
    if(blacklistButton.getAttribute("disabled") === "") blacklistButton.removeAttribute("disabled")
    blacklistButton.onclick = () => {
        watchButton.remove();
        blacklistButton.remove();
        let list = settingStorage.get("MARKET.BLACK_LIST");
        if(!list.includes(seller)){
            list.push(seller);
            settingStorage.set("MARKET.BLACK_LIST", list);
            settingStorage.save();
        }
    };
    buyButton.before(watchButton);
    watchButton.before(blacklistButton);
}




export default Init;