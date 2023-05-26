const commonUtil = require("../utils/common");
const STORAGE_NAME = "SGO_Interface_Optimization";

const DEFAULT_SETTINGS = {
    COLOR: {
        TIPS: "#9AE6B4", //一般提示
        WARNING: "#FC8181", //紅色警告
        TRUE_STATS: "#FEEBC8", //裝備原始素質顏色
        ZONE_LEVEL: "#FF95CA", //樓層切換的顏色
        MARKET_WATCH: "#ffff00", // 關注中的訂單
        EXP_BAR_BACKGROUND: "#57595b",
        EXP_BAR_FILL: "#aadc1e",
        EXP_BAR_FONT: "#fbfbfb"
    },
    WARNING: {
        EQUIPMENT: 20, //裝備低於多少耐久
        HP: 60, //血量單次耗損幾成
        SP: 100 //體力低於多少
    },
    GENERAL: {
        DISABLE_BAD_BUTTON: false, //將 false 改成 true，即可禁用"搶劫"與"我要超渡你"按鍵
        DISABLE_TRUE_STATS: false,
        DISABLE_MARKET_FUNCTION: true,
        HIDE_REST_BUTTON: false,
        MOBILE_WRAP_NAVBAR: false,
        MOBILE_HUNT_REPORT: true,
        HUNT_STATUS_PERCENT: false,
        SHOW_EXP_BAR: false,
        RED_BACKBROUND_WHEN_EQUIPMENT_BROKEN: false,
        EXP_BAR_FILL_BACKGROUND_IMAGE_URL: "",
        BACKGROUND_IMAGE_URL: "",
        ITEM_FILTER_ENCODE: "",
    },
    MARKET: {
        WATCH_LIST: [],
        BLACK_LIST: []
    },
    ITEM_RECORD:{
        ENABLE: false,
        APPLY_FILTER: false,
        RECORDS: {}
    },
    recipe: {}
}

let SETTINGS = load();
function load() {
    if (localStorage[STORAGE_NAME]) {
        try{
            return JSON.parse(localStorage[STORAGE_NAME]);
        }catch(e){}
    }
    return structuredClone(DEFAULT_SETTINGS);
}

function save() {
    localStorage[STORAGE_NAME] = JSON.stringify(SETTINGS);
}

function get(key) {
    //檢查是否有新的類別設定或缺少類別設定
    if(key.split(".").length === 1){
        Object.keys(DEFAULT_SETTINGS).forEach(classKey => {
            // if(getObjectValueByRecursiveKey(SETTINGS, `${key}.${k}`) !== undefined) return;
            // commonUtil.setObjectValueByRecursiveKey(SETTINGS, `${key}.${k}`, DEFAULT_SETTINGS[key][k])
            // SETTINGS[key][k] = DEFAULT_SETTINGS[key][k];

            if(SETTINGS[classKey] !== undefined) return;
            SETTINGS[classKey] = structuredClone(DEFAULT_SETTINGS[classKey])
            save();
        });
    }
    if(commonUtil.getObjectValueByRecursiveKey(SETTINGS, key) === null) {
        // commonUtil.setObjectValueByRecursiveKey(SETTINGS, key, commonUtil.getObjectValueByRecursiveKey(structuredClone(DEFAULT_SETTINGS), key))
        set(key, commonUtil.getObjectValueByRecursiveKey(structuredClone(DEFAULT_SETTINGS), key));
        // SETTINGS[key] = commonUtil.getObjectValueByRecursiveKey(structuredClone(DEFAULT_SETTINGS), key)
        save();
    }else if(key === "recipe" && typeof SETTINGS[key] === 'string'){
        try{
            SETTINGS[key] = JSON.parse(SETTINGS[key]);
        }catch(e){
            SETTINGS[key] = {};
        }
        save();
    }
    return commonUtil.getObjectValueByRecursiveKey(SETTINGS, key)
}

function set(key, value) {
    commonUtil.setObjectValueByRecursiveKey(SETTINGS, key, value);
}


export {
    set,
    get, 
    save
} 