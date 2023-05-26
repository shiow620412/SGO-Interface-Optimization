const FORGE_STORAGE_NAME = "forgeLog";
let FORGE_LOG = load();

function set(key, value){
    FORGE_LOG[key] = value;
}

function get(key) {
    return FORGE_LOG[key] ?? "";
}

function load(){
    if (localStorage[FORGE_STORAGE_NAME]) {
        try{
            return JSON.parse(localStorage[FORGE_STORAGE_NAME]);
        }catch(e){
            console.error("load forge log failed", e)
        }
    }
    return {};
}

function save(){
    localStorage[FORGE_STORAGE_NAME] = JSON.stringify(FORGE_LOG);
}

function deleteIfKeyExist(key){
    if(FORGE_LOG[key]){
        delete FORGE_LOG[key];
        save();
    }
}
export {
    set,
    get,
    load,
    save,
    deleteIfKeyExist
}