const globalVars = {
    VERSION: "1.36.1",
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