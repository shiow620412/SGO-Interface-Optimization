const globalVars = {
    VERSION: "1.37.0",
    LATEST_VERSION: "",
    UPDATE_CHECK_INTERVAEL: 3600,
    HIGHTLIGHT_ROW: {
        equipments: [],
        mines: [],
        items: []
    }
}

function get(key){
    return globalVars[key];
}

function set(key, value) {
    globalVars[key] = value;
}

export { get, set }