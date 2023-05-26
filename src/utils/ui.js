
const commonUtil = require("../utils/common");
const settingStorage = require("../storage/setting");
const globalVarsStorage = require("../storage/globalVars");




//改變navbar
function wrapNavbar() {
    const style = document.createElement("style");
    style.innerHTML = `
        nav {
            flex-wrap: wrap;
            min-width: auto !important;
        }
        #__next > div > div:nth-child(2) {
            height: 120px;
        }
    `
    document.body.appendChild(style);
    // document.querySelector("nav").style.flexWrap = "wrap";
    // document.querySelector("nav").style.minWidth = "unset";
}
// 搜尋UI
function createSearchUI(labelText, inputId) {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.marginBottom = "1rem"
    div.innerHTML = `<label style="width: 84px;">${labelText}</label>`
    const input = document.createElement("input");
    input.type = "text";
    input.id = inputId
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
    // input.onchange = inputEvent
    div.appendChild(input);
    return [div, input];
}
//開啟系統設定UI
function createOpenDialogButton(){
    //開啟設定的按鍵
    const openDialogBtn = document.createElement("button");
    openDialogBtn.id = "open-dialog-btn"
    openDialogBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings" width="50" height="50" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
        <circle cx="12" cy="12" r="3" />
        </svg>
    `
    const style = document.createElement("style");
    //scss
    style.innerText = `
    *{box-sizing:border-box}.wrapper{display:flex;align-items:center;justify-content:center;background-color:rgba(15,19,26,.8);height:100vh;position:fixed;width:100%;left:0;top:0;overflow:auto;z-index:9999}.header{display:flex;justify-content:space-between;padding:1rem 1rem 0 1rem;position:absolute;width:calc(100% - 56px);top:0;left:56px;border-bottom:1px solid #3c3f43}.header button{height:100%}.header h1{color:#fff}.header #close-dialog-btn{margin-left:auto}.content-container{padding-top:50px;margin-left:56px;height:100%}.content-container .content{display:flex;margin:0 1rem 1rem 1rem;flex-direction:column;height:100%;overflow-y:scroll}.content-container .content hr{width:100%}.panel{position:relative;width:100%;display:flex;flex-direction:column;display:none;opacity:0}.panel input[type=checkbox]{margin:.5rem}.panel input[type=text]{background-color:#1a1d24;background-image:none;border:1px solid #3c3f43;border-radius:6px;color:#e9ebf0;display:block;font-size:14px;line-height:1.42857143;padding:7px 11px;transition:border-color .3s ease-in-out;width:100px}.panel input[type=color]{background-color:#292d33;width:50px}.panel button{border-radius:.375rem;padding:.25rem}.panel button.warning{background-color:var(--chakra-colors-red-500)}.panel button.warning:hover{background-color:var(--chakra-colors-red-600)}.panel[expand]{display:block;opacity:1}.panel-header{width:100%;padding:20px}.panel-header span{color:#fff;font-size:16px;line-height:1.25}.panel-body{padding:0 20px 20px 20px}.panel-body .row{margin-top:1rem;display:flex;align-items:center}.panel-body .row label{color:#a4a9b3;margin-right:1rem}.panel-body .row input{margin-right:1rem}.panel-body .row a{color:#a4a9b3;margin-right:1rem;text-decoration:underline}.panel-body .row a:hover{background-color:#3c3f43}.panel-body .row.table{flex-direction:column;align-items:flex-start}.record{width:100%;border-bottom:1px solid #3c3f43}.record .record-header{margin-top:.25rem}.record .record-body{display:flex;flex-direction:column}.record .record-item{display:flex;width:80%;margin:.5rem 0}.record .record-quatity{margin-left:auto}.grid{margin-top:10px;width:100%;color:#a4a9b3;background-color:#1a1d24}.grid div{border-bottom:1px solid #292d33;width:100%;height:40px;padding:10px}.grid .grid-row{display:flex;align-items:center}.grid .grid-row:hover{background-color:#3c3f43}.grid .grid-row button{font-size:14px;border:none;background-color:rgba(0,0,0,0);color:#9146ff;margin-left:auto}.grid .grid-row button:hover{cursor:pointer}.description{margin:0px;color:#a4a9b3;line-height:1.5;font-size:8px}.dialog{width:800px;height:500px;position:relative;overflow:auto;z-index:9999;display:flex;background-color:#292d33;border-radius:6px;box-shadow:0 4px 4px rgba(0,0,0,.12),0 0 10px rgba(0,0,0,.06);display:block}.dialog .navbar{height:500px;background-color:#1a1d24;width:56px;position:fixed;display:flex;flex-direction:column}.dialog .navbar button{height:50px}.dialog .navbar button:hover{background-color:#292d33}.dialog .navbar button[active]{background-color:#292d33}.dialog .right-container{margin-left:56px}#open-dialog-btn{position:-webkit-sticky;position:sticky;left:0;bottom:20px;margin-right:1rem;z-index:9998;color:#7d7d7d;background-color:rgba(0,0,0,0);border:none}#open-dialog-btn:hover{color:#fff}[hidden]{display:none}#exp-bar{position:fixed;bottom:0px;width:100%;height:24px}#exp-bar-fill{position:fixed;bottom:0px;left:0px;height:24px}.exp-container{display:flex;justify-content:flex-end;position:fixed;width:100%;bottom:0px}.quick-filter-container{display:flex;margin-bottom:.5rem;align-items:center;-webkit-box-align:center}.quick-filter-container div{width:18px;height:18px;margin-right:var(--chakra-space-3);border-radius:50%;background:var(--chakra-colors-transparent);border-width:2px;border-style:solid;-o-border-image:initial;border-image:initial;cursor:pointer}.quick-filter-container .circle-red{border-color:var(--chakra-colors-red-500)}.quick-filter-container .circle-red:hover{background-color:var(--chakra-colors-red-300)}.quick-filter-container .circle-blue{border-color:var(--chakra-colors-blue-500)}.quick-filter-container .circle-blue:hover{background-color:var(--chakra-colors-blue-300)}.quick-filter-container .circle-cyan{border-color:var(--chakra-colors-cyan-500)}.quick-filter-container .circle-cyan:hover{background-color:var(--chakra-colors-cyan-300)}.quick-filter-container .circle-green{border-color:var(--chakra-colors-green-500)}.quick-filter-container .circle-green:hover{background-color:var(--chakra-colors-green-300)}.quick-filter-container .circle-teal{border-color:var(--chakra-colors-teal-500)}.quick-filter-container .circle-teal:hover{background-color:var(--chakra-colors-teal-300)}.quick-filter-container .circle-orange{border-color:var(--chakra-colors-orange-500)}.quick-filter-container .circle-orange:hover{background-color:var(--chakra-colors-orange-300)}.quick-filter-container .circle-yellow{border-color:var(--chakra-colors-yellow-500)}.quick-filter-container .circle-yellow:hover{background-color:var(--chakra-colors-yellow-300)}.quick-filter-container .circle-pink{border-color:var(--chakra-colors-pink-500)}.quick-filter-container .circle-pink:hover{background-color:var(--chakra-colors-pink-300)}.quick-filter-container .circle-purple{border-color:var(--chakra-colors-purple-500)}.quick-filter-container .circle-purple:hover{background-color:var(--chakra-colors-purple-300)}.quick-filter-container .circle-gray{border-color:var(--chakra-colors-gray-500)}.quick-filter-container .circle-gray:hover{background-color:var(--chakra-colors-gray-300)}
    `;
    // document.querySelector("#open-dialog-btn").onclick = () => {createSettingUI(); registerSettingUIEvent();}
    openDialogBtn.onclick = () => {
        createSettingUI(); registerSettingUIEvent();
        document.body.style.overflow = "hidden";
    }
    document.body.appendChild(style);
    document.body.appendChild(openDialogBtn);
}
//系統設定UI
function createSettingUI(){
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.style.display = "";
    wrapper.innerHTML = ` 
    <div class="dialog">
        <div class="navbar">
        </div>
        <div class="header">
            <h1>SGO介面優化插件 Ver${globalVarsStorage.get("VERSION")}</h1>
            <button id="reset-settings-btn" hidden>RESET</button>
            <button id="close-dialog-btn">X</button>
        </div>
        <div class="content-container">
            <div class="content">
            </div>
        </div>
    </div>`
    const rowEvent = {
        checkbox: (e) => {
            const element = e.target;
            settingStorage.set(element.getAttribute("bind-setting"), element.checked);
            settingStorage.save();
        },
        colorInput: (e) => {
            const element = e.target;
            const bindSetting = element.getAttribute("bind-setting");
            // if(!/^#[0-9a-fA-F]{6}$|transparent/.test(element.value)){
            //     element.value = settingStorage.get(bindSetting);
            // }
            settingStorage.set(bindSetting, element.value);
            element.nextElementSibling.style.color = element.value
            settingStorage.save();            
        },
        numberInput: (e) => {
            const element = e.target;
            const bindSetting = element.getAttribute("bind-setting");
            if(element.value === "" || Number.isNaN(Number(element.value))){
                element.value = settingStorage.get(bindSetting);
                return;
            }
            settingStorage.set(bindSetting, Number(element.value))
            settingStorage.save();
        },
        input: (e) => {
            const element = e.target;
            const bindSetting = element.getAttribute("bind-setting");                
            settingStorage.set(bindSetting, element.value)
            settingStorage.save();
        }
    }
    const panel = [
        {
            category: "一般",
            description: "一般功能的開啟與關閉",
            rows:[
                {
                    id: "bad-button",
                    type: "checkbox",
                    label: "禁用搶劫與超渡按鍵",
                    bindSetting: "GENERAL.DISABLE_BAD_BUTTON"
                },
                {
                    id: "rest-button",
                    type: "checkbox",
                    label: "隱藏狩獵頁面的休息按鍵",
                    bindSetting: "GENERAL.HIDE_REST_BUTTON"
                },
                {
                    id: "disable-true-stats",
                    type: "checkbox",
                    label: "關閉原始素質顯示",
                    bindSetting: "GENERAL.DISABLE_TRUE_STATS"
                },
                {
                    id: "disable-market-function",
                    type: "checkbox",
                    label: "關閉市場黑名單與關注名單功能",
                    bindSetting: "GENERAL.DISABLE_MARKET_FUNCTION"
                },
                {
                    id: "hunt-status-percent",
                    type: "checkbox",
                    label: "顯示血量、體力百分比(僅在狩獵頁有效)",
                    bindSetting: "GENERAL.HUNT_STATUS_PERCENT"
                },
                {
                    id: "show-exp-bar",
                    type: "checkbox",
                    label: "顯示經驗條",
                    bindSetting: "GENERAL.SHOW_EXP_BAR"
                },
                {
                    id: "red-backround-when-equipment-broken",
                    type: "checkbox",
                    label: "裝備損壞超級提示",
                    bindSetting: "GENERAL.RED_BACKBROUND_WHEN_EQUIPMENT_BROKEN"
                },
                {
                    id: "exp-bar-fill-background-image-url",
                    type: "input",
                    label: "自訂經驗條填充圖片",
                    bindSetting: "GENERAL.EXP_BAR_FILL_BACKGROUND_IMAGE_URL"
                },
                {
                    id: "background-image-url",
                    type: "input",
                    label: "自訂背景圖片",
                    bindSetting: "GENERAL.BACKGROUND_IMAGE_URL"
                },
                {
                    id: "item-filter-encode",
                    type: "input",
                    label: "物品過濾器編碼",
                    bindSetting: "GENERAL.ITEM_FILTER_ENCODE"
                },
                {
                    type: "a",
                    label: "SGO-物品過濾器-Editor",
                    link: "https://sgo-filter.wind-tech.tw/"
                }
            ]
        },
        {
            category: "手機",
            description: "手機特別功能開啟與關閉",
            mobile: true,
            rows:[
                {
                    id: "mobile-wrap-navbar",
                    type: "checkbox",
                    label: "導覽列換行",
                    bindSetting: "GENERAL.MOBILE_WRAP_NAVBAR"
                },
                {
                    id: "mobile-hunt-report",
                    type: "checkbox",
                    label: "精簡狩獵結果",
                    bindSetting: "GENERAL.MOBILE_HUNT_REPORT"
                }
            ]
        },
        {
            category: "顏色",
            description: "設定插件各種提示的顏色",
            rows:[
                {
                    id: "tips",
                    type: "colorInput",
                    label: "一般提示",
                    bindSetting: "COLOR.TIPS"
                },
                {
                    id: "warning",
                    type: "colorInput",
                    label: "紅色警告",
                    bindSetting: "COLOR.WARNING"
                },
                {
                    id: "true-stats",
                    type: "colorInput",
                    label: "裝備原始素質",
                    bindSetting: "COLOR.TRUE_STATS"
                },
                {
                    id: "zone-level",
                    type: "colorInput",
                    label: "到達新樓層",
                    bindSetting: "COLOR.ZONE_LEVEL"
                },
                {
                    id: "market-watch",
                    type: "colorInput",
                    label: "關注中的賣家外框顏色",
                    bindSetting: "COLOR.MARKET_WATCH"
                },
                {
                    id: "exp-bar-background",
                    type: "colorInput",
                    label: "經驗條背景色",
                    bindSetting: "COLOR.EXP_BAR_BACKGROUND"
                },
                {
                    id: "exp-bar-fill-color",
                    type: "colorInput",
                    label: "經驗條填充色",
                    bindSetting: "COLOR.EXP_BAR_FILL"
                },
                {
                    id: "exp-bar-font",
                    type: "colorInput",
                    label: "經驗條字體顏色",
                    bindSetting: "COLOR.EXP_BAR_FONT"
                }
            ]
        },
        {
            category: "警示",
            description: "設定警示功能的數值",
            rows:[
                {
                    id: "equipment",
                    type: "numberInput",
                    label: "裝備耐久低於(數值)",
                    bindSetting: "WARNING.EQUIPMENT"
                },
                {
                    id: "hp",
                    type: "numberInput",
                    label: "血量單次耗損(百分比)",
                    bindSetting: "WARNING.HP"
                },
                {
                    id: "sp",
                    type: "numberInput",
                    label: "體力低於(數值)",
                    bindSetting: "WARNING.SP"
                }
            ]
        },
        {
            category: "市場",
            description: "刪除市場的關注名單與黑名單<BR>新增請至市場點擊訂單下方即可新增",
            rows:[
                {
                    id: "watch-list",
                    type: "table",
                    label: "關注名單",
                    header: "名字",
                    bindSetting: "MARKET.WATCH_LIST"
                },
                {
                    id: "black-list",
                    type: "table",
                    label: "黑名單",
                    header: "名字",
                    bindSetting: "MARKET.BLACK_LIST"
                }
            ]
        },
        {
            category: "狩獵記錄",
            description: "記錄狩獵獲得的物品",
            rows:[
                {
                    id: "item-record",
                    type: "checkbox",
                    label: "啟用狩獵記錄",                    
                    bindSetting: "ITEM_RECORD.ENABLE"
                },
                {
                    id: "reset-item-record",
                    type: "button",
                    class: "warning",
                    label: "重置狩獵記錄",                    
                    bindSetting: "ITEM_RECORD.RECORDS",
                    event: (e) => {
                        const currentPanel = e.target.closest(".panel");
                        currentPanel.querySelector(".row.table").innerHTML = `
                            <label>當前記錄</label>
                            <div style="margin: 1rem">無</div>
                        `

                        settingStorage.set("ITEM_RECORD.RECORDS", {});
                        settingStorage.save();
                    }
                },
                {
                    id: "item-record-apply-filter",
                    type: "checkbox",
                    label: "狩獵記錄套用過濾器",                    
                    bindSetting: "ITEM_RECORD.APPLY_FILTER",
                    event: (e) => {
                        const checked = e.target.checked

                        const currentPanel = e.target.closest(".panel");
                        currentPanel.querySelectorAll(".record-item").forEach((item) => {
                            if(checked){
                                const result = commonUtil.itemApplyFilter(item.innerText.split("\n")[0], {
                                    highlight: true,
                                    dom: item
                                })
                                if(!result) item.style.display = "none";
                            }else{
                                item.style.display = item.style.color = ""
                            }


                        });
                    }
                },
                {
                    id: "item-record-table",
                    type: "record-table",
                    label: "當前記錄",
                    bindSetting: "ITEM_RECORD.RECORDS"
                }
            ]
        },
        {
            category: "贊助",
            description: "",
            rows:[
                {
                    type: "customize",
                    html: `
                        <p class="description" style="font-size: 1rem"> 
                            如果你覺得插件對你有幫助<BR>歡迎贊助我喝一杯飲料
                        </p>
                        <p class="description" style="font-size: 1rem; color: var(--chakra-colors-red-300);">
                            希望你已經贊助過茅場晶彥再來贊助我<BR>沒有茅場晶彥做遊戲就不會有此插件
                        </p>
                        <a style = "color: var(--chakra-colors-blue-300);" href="https://www.buymeacoffee.com/ourcastle">茅場晶彥的 Buy Me a Coffee</a>
                        <a style = "color: var(--chakra-colors-blue-300);" href="https://www.buymeacoffee.com/sgoeplugin">Wind 的 Buy Me a Coffee</a>                            
                    
                    `,
                }
            ]
        }
    ]
    function createRow(rowDiv, rowData){
        const type = {
            checkbox: () => {
                rowDiv.innerHTML =  `
                    <input type="checkbox" id="${rowData.id}" bind-setting="${rowData.bindSetting}">
                    <label for="${rowData.id}">${rowData.label}</label>
                `
                const mainElement = rowDiv.querySelector(`#${rowData.id}`);
                mainElement.checked = settingStorage.get(rowData.bindSetting);
                mainElement.onchange = rowEvent[rowData.type]
                if(rowData.event) {
                    mainElement.addEventListener("change", rowData.event);
                }
            },
            input: () => {
                rowDiv.innerHTML =  `
                    <label for="${rowData.id}">${rowData.label}</label>
                    <input type="text" id="${rowData.id}" bind-setting="${rowData.bindSetting}">
                `
                const mainElement = rowDiv.querySelector(`#${rowData.id}`);
                mainElement.value = settingStorage.get(rowData.bindSetting);
                mainElement.onchange = rowEvent[rowData.type]
            },
            numberInput: () => {
                rowDiv.innerHTML =  `
                    <label for="${rowData.id}">${rowData.label}</label>
                    <input type="text" id="${rowData.id}" bind-setting="${rowData.bindSetting}">
                `
                const mainElement = rowDiv.querySelector(`#${rowData.id}`);
                mainElement.value = settingStorage.get(rowData.bindSetting);
                mainElement.onchange = rowEvent[rowData.type]
            },
            colorInput: () => {
                rowDiv.innerHTML =  `
                    <label for="${rowData.id}">${rowData.label}</label>
                    <input type="color" id="${rowData.id}" bind-setting="${rowData.bindSetting}">
                    <p>我是顏文字</p>
                `
                const mainElement = rowDiv.querySelector(`#${rowData.id}`);
                mainElement.value = settingStorage.get(rowData.bindSetting);
                rowDiv.querySelector("p").style.color = settingStorage.get(rowData.bindSetting);
                mainElement.onchange = mainElement.oninput = rowEvent[rowData.type]
            },
            table: () => {
                const tableData = settingStorage.get(rowData.bindSetting);
                let gridRowHTML = "";
                if(!tableData.length){
                    gridRowHTML = `
                    <div class="grid-row">
                        <label>空</label>
                    </div>`
                }else{
                    tableData.forEach(name => {
                        const div = document.createElement("div");
                        div.innerHTML = `
                            <label>${name}</label>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="19" height="19" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        `
                        div.className = "grid-row"

                        const deleteButton = document.createElement("button");
                        deleteButton.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="19" height="19" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>`
                        gridRowHTML += div.outerHTML;
                    });
                }
                rowDiv.innerHTML =  `
                    <label>${rowData.label}</label>
                    <div class="grid" id="${rowData.id}" bind-setting="${rowData.bindSetting}">
                        <div class="grid-row-header">${rowData.header}</div>
                        ${gridRowHTML}
                    </div>`
            },
            "record-table": () => {
                /*
                {
                    name: {
                        itemName: quatity
                    }
                }
                */
                const tableData = settingStorage.get(rowData.bindSetting);
                const names = Object.keys(tableData);
                let recordsHTML = "";
                if(!names.length){
                    recordsHTML = `<div style="margin: 1rem">無</div>`
                }else{
                    const itemRecordApplyFilter = settingStorage.get("ITEM_RECORD.APPLY_FILTER");

                    names.forEach(name => {
                        const record = document.createElement("div");
                        record.innerHTML = `
                            <div class="record-header">${name} 獲得了</div>
                        `
                        record.className = "record"

                        const recordBody = document.createElement("div");
                        recordBody.className = "record-body";
                        Object.keys(tableData[name]).forEach(itemName => {
                            const recordItem = document.createElement("div");
                            recordItem.className = "record-item";

                            recordItem.innerHTML = `
                                <div class="record-name">${itemName}</div>
                                <div class="record-quatity"> x ${tableData[name][itemName]}</div>
                            `
                            if(itemRecordApplyFilter) {
                                const result = commonUtil.itemApplyFilter(itemName, {
                                    highlight: true,
                                    dom: recordItem
                                });

                                if(!result)  recordItem.style.display = "none";                                   
                            }
                            recordBody.appendChild(recordItem);
                        });

                        record.appendChild(recordBody);

                        recordsHTML += record.outerHTML;
                    });
                }
                rowDiv.innerHTML =  `
                    <label>${rowData.label}</label>
                    ${recordsHTML}
                `
            },
            a: () => {
                rowDiv.innerHTML = `
                    <a href="${rowData.link}" target="_blank" rel="noopener noreferrer">${rowData.label}</a>
                `
            },
            button: () => {
                rowDiv.innerHTML = `
                    <button class=${rowData.class}>${rowData.label} </button>
                `
                rowDiv.querySelector("button").onclick = rowData.event;
            },
            customize: () => {
                rowDiv.className = "row table"
                rowDiv.innerHTML = rowData.html;
            }
        }
        type[rowData.type]();
    }
    const content = wrapper.querySelector(".content");
    const navbar =  wrapper.querySelector(".navbar");
    panel.forEach((panel, index) => {
        if(panel.mobile && !commonUtil.isMobileDevice()) return;
        const panelDiv = document.createElement("div");
        panelDiv.className = "panel";
        panelDiv.innerHTML = `
            <div class="panel-header">
                <span>${panel.category}</span>
            </div>
            <div class="panel-body">
                <p class="description">${panel.description}</p>
            </div>
        `
        const panelBody = panelDiv.querySelector(".panel-body");
        panel.rows.forEach(row => {
            const rowDiv = document.createElement("div");
            rowDiv.className = /table/.test(row.type) ? "row table" : "row";
            createRow(rowDiv, row);

            panelBody.appendChild(rowDiv);
        });
        content.appendChild(panelDiv);
        panelDiv.setAttribute("panel-index", index);
        //panel 切換
        const button = document.createElement('button');
        button.innerHTML = panel.category.length > 2 ? `${panel.category.substring(0, 2)}<br>${panel.category.substring(2)}` : panel.category;
        button.setAttribute("bind-panel-index", index);
        button.onclick = (e) => {
            content.querySelector("[expand]")?.removeAttribute("expand");
            content.querySelector(`.panel[panel-index="${button.getAttribute("bind-panel-index")}"]`)?.toggleAttribute("expand");
            navbar.querySelector("[active]")?.removeAttribute("active");
            button.toggleAttribute("active");
        }

        if(index === 0) {
            panelDiv.toggleAttribute("expand");
            button.toggleAttribute("active");
        }
        navbar.appendChild(button);
    });


    document.body.appendChild(wrapper);
}

function createExpBar() {
    const expContainer = document.createElement("div");
    expContainer.className = "exp-container";
    expContainer.innerHTML = `
    <div style="margin-right: 1rem;z-index: 1;" id="exp-bar-level-label"></div>
    <div style="margin-right: 1rem;z-index: 1;" id="exp-bar-exp-label"></div>
    <div id="exp-bar"></div>
    <div id="exp-bar-fill"></div>
    `
    // const expBar = document.createElement("div");
    // const expBarFill = document.createElement("div");

    // expBar.id = "exp-bar"
    // expBarFill.id = "exp-bar-fill"
    
    // document.body.appendChild(expBar)
    document.body.appendChild(expContainer)
}

function registerSettingUIEvent(){
    // document.querySelector("#open-dialog-btn").onclick = () => {document.querySelector(".wrapper").style.display = ""}
    // document.querySelector("#close-dialog-btn").onclick = () => {document.querySelector(".wrapper").style.display = "none"}
    document.querySelector("#close-dialog-btn").onclick = () => {
        document.querySelector(".wrapper").remove();
        document.body.style.overflow = "";
    }
    document.querySelectorAll(".grid-row > button").forEach(btn => {
        btn.onclick = (e) => {
            const grid = e.currentTarget.parentElement.parentElement;
            const name = e.currentTarget.parentElement.querySelector("label").textContent
            const bindSetting = grid.getAttribute("bind-setting")
            const tableList = settingStorage.get(bindSetting);
            settingStorage.set(bindSetting, tableList.filter(row => row !== name));
            settingStorage.save();

            e.currentTarget.parentElement.remove();
            if(grid.querySelectorAll(`.grid-row`).length === 0) {
                const spaceGridRow = document.createElement("div");
                spaceGridRow.innerHTML = "<label>空</label>"
                spaceGridRow.className = "grid-row";
                grid.appendChild(spaceGridRow);
            }
        }
    });
    document.querySelector("#reset-settings-btn").onclick = () => {
        SETTINGS = structuredClone(DEFAULT_SETTINGS);
        settingStorage.save();
        registerSettingUIEvent();
    };
    document.querySelector(".wrapper").onclick = (e) => {
        // if(e.target.className === "wrapper") e.target.style.display = "none";
        if(e.target.matches(".wrapper")) {
            e.target.remove();
            document.body.style.overflow = "";
        }
    }


}

export {
    wrapNavbar,
    createSearchUI,
    createOpenDialogButton,
    createSettingUI,
    createExpBar,
    registerSettingUIEvent
}