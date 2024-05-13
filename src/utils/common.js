const settingStorage = require("../storage/setting");

let filter;
const observers = [];
const timers = [];

function getObjectValueByRecursiveKey(obj, recursiveKey) {
    const keys = recursiveKey.split(".");
    let tempObj = obj;
    for(let i = 0; i < keys.length; i++){
        const key = keys[i];
        if(tempObj[key] === undefined) {
            // tempObj = null;
            return  null;
        }
        tempObj = tempObj[key]
    }
    // keys.forEach(key => {

    // });
    return tempObj
}
function setObjectValueByRecursiveKey(obj, recursiveKey, value) {
    const keys = recursiveKey.split(".");
    const lastKey = keys.pop();
    let tempObj = obj;
    keys.forEach(key => {
        if(tempObj[key] === undefined || typeof tempObj[key] !== "object") tempObj[key] = {}
        tempObj = tempObj[key]
    });
    tempObj[lastKey] = value;
    return obj
}

function isMobileDevice() {
    const mobileDevices = ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone']
    for (let i = 0; i < mobileDevices.length; i++) {
        if (navigator.userAgent.match(mobileDevices[i])) {
            return true;
        }
    }
    return false
}

function itemApplyFilter(itemName, config) {
    if(!Array.isArray(filter)) {
        const itemFilterEncode = settingStorage.get("GENERAL.ITEM_FILTER_ENCODE")        
        try{
            filter = JSON.parse(decodeURIComponent(atob(itemFilterEncode)));
        }catch(e){
            // console.error("parse error", e);
            filter = [];
        }
        
    }
    let result = false;
    filter.forEach(filter => {
        if(filter.items.includes(itemName)){
            if(config.highlight) config.dom.style.color = filter.color
            if(config.playSound) {
                const audio = new Audio(filter.sound);
            
                audio.volume = filter.volume;
                audio.play().catch((err) => console.error(err));
            }
            result = true;
        }
    });
    return result;
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

    table.querySelectorAll("tbody > tr[role=row]").forEach((row) => {
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

function addObserver(observer){
    observers.push(observer);
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

export {
    getObjectValueByRecursiveKey,
    setObjectValueByRecursiveKey,
    isMobileDevice,
    itemApplyFilter,
    getTableColumns,
    getTableData,
    regexGetValue,
    addObserver,
    clearObservers,
    clearTimers,
    bindEvent
}
