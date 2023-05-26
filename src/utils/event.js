const settingStorage = require("../storage/setting");
const commonUtil = require("./common");
const uiUtil = require("./ui")
const forgeStorage = require("../storage/forge")
const globalVarsStorage = require("../storage/globalVars")
const subscribeEvents = []
const specialSubscribeEvents = {
    profile: [
        (data) => {
            if(location.pathname === "/hunt" && settingStorage.get("GENERAL.HUNT_STATUS_PERCENT")){
                data.fullHp += ` (${Math.floor(data.hp / data.fullHp * 100)}%)`
                data.fullSp += ` (${Math.floor(data.sp / data.fullSp * 100)}%)`
            }
        },
        (data) => {
            if(settingStorage.get("GENERAL.SHOW_EXP_BAR")){
                if(!document.querySelector(".exp-container")) uiUtil.createExpBar();

                const expBar = document.querySelector("#exp-bar");
                const expBarFill = document.querySelector("#exp-bar-fill");
                let percent = Math.floor(data.exp / data.nextExp * 1000) / 10.0;
                document.querySelector("#exp-bar-level-label").textContent = `LV.${data.lv}`
                document.querySelector("#exp-bar-exp-label").textContent = `EXP:${data.exp} / ${data.nextExp} (${percent}%)`
                
                expBar.style.backgroundColor = settingStorage.get("COLOR.EXP_BAR_BACKGROUND");
                expBarFill.style.backgroundColor = settingStorage.get("COLOR.EXP_BAR_FILL");

                if(settingStorage.get("GENERAL.EXP_BAR_FILL_BACKGROUND_IMAGE_URL") !== ""){
                    expBar.style.backgroundImage = `url(${settingStorage.get("GENERAL.EXP_BAR_FILL_BACKGROUND_IMAGE_URL")})`
                    expBar.style.backgroundSize = "100% 24px";

                    expBarFill.style.backgroundColor = settingStorage.get("COLOR.EXP_BAR_BACKGROUND");                        
                    expBarFill.style.left = "unset";
                    expBarFill.style.right = "0px";

                    percent = 100 - percent;
                    // expBarFill.style.backgroundImage = `url(${settingStorage.get("GENERAL.EXP_BAR_FILL_BACKGROUND_IMAGE_URL")})`
                    // expBarFill.style.backgroundSize = "100% 24px";
                }else{
                    expBar.style.backgroundImage = ``
                    expBarFill.style.left = "";
                    expBarFill.style.right = "";
                }

                expBarFill.style.width = `${percent}%`;
                document.querySelector(".exp-container").style.color = settingStorage.get("COLOR.EXP_BAR_FONT");

            }
        },
    ],
    announcement: [
        (data) => {
            // data.announcement = {
            //     test: "AAA"
            // }
            // console.log(data);
        }
    ]
}
const apiData = {}

const _fetch = window.fetch;
window.fetch = async (url, fetchOptions) => {
    try{
        const originResp = await _fetch(url, fetchOptions);
        const ab = await originResp.arrayBuffer()
        const jsonObject = JSON.parse(new TextDecoder("utf-8").decode(ab));

        //特殊問題 部分電腦的url不是字串而是requestInfo 需要取其中的url property來拿到api網址
        const apiUrl = commonUtil.regexGetValue("api/(.*)", typeof url === "string" ? url : url.url);

        if(apiUrl.length){
            if(jsonObject.profile){
                apiData["profile"] = jsonObject.profile;
            
                triggerEventHook("profile");
                jsonObject.profile = structuredClone(apiData["profile"]);
            }
            if(apiUrl[0].match("trades\\?category=[a-z]+")){ //特例常駐subscribe
                apiData[apiUrl[0]] = structuredClone(jsonObject);
                triggerEventHook(apiUrl[0]);
                
                const category = commonUtil.regexGetValue("trades\\?category=([a-z]+)", apiUrl[0])[0];
                const highlightRow = globalVarsStorage.get("HIGHTLIGHT_ROW");

                highlightRow[category].length = 0;
                if(!settingStorage.get("GENERAL.DISABLE_MARKET_FUNCTION")){
                    
                    const blackList = settingStorage.get("MARKET.BLACK_LIST");
                    apiData[apiUrl[0]].trades = apiData[apiUrl[0]].trades.filter(trade => !blackList.includes(trade.sellerName))
                    
                    const watchList = settingStorage.get("MARKET.WATCH_LIST");
                    
                    for(let i = 0; i < apiData[apiUrl[0]].trades.length; i++){
                        const trade = apiData[apiUrl[0]].trades[i];
                        if(watchList.includes(trade.sellerName)){
                            highlightRow[category].push(i);
                        }
                    }

                }
                return new Response(new TextEncoder().encode(JSON.stringify(apiData[apiUrl[0]])));

            }else if(apiUrl[0].match("equipment\/([0-9]+)\/recycle")){ //清除回收裝備的鍛造資料
                const equipmentId = commonUtil.regexGetValue("equipment\/([0-9]+)\/recycle", apiUrl[0])[0];
                const equipment = apiData["items"]?.equipments.find(equipment => equipment.id === Number(equipmentId));
                if(equipment && equipment.crafter !== null){
                    const forgeTime = new Date(`${equipment.craftedTime}`)
                    forgeTime.setSeconds(0);
                    forgeTime.setMilliseconds(0);
                    const base64 =  btoa(encodeURIComponent(`${forgeTime.getTime()},${equipment.name},${equipment.crafter}`))

                    forgeStorage.deleteIfKeyExist(base64);
                }
            }


            apiData[apiUrl[0]] = structuredClone(jsonObject);
            triggerEventHook(apiUrl[0]);
            // console.log(apiUrl[0], apiData);
            return new Response(new TextEncoder().encode(JSON.stringify(apiData[apiUrl[0]])));

        }else{


            const uint8Array = new TextEncoder().encode(JSON.stringify(jsonObject));
            const newResp = new Response(uint8Array);
            return newResp;
        }
    }
    catch(error){
        console.error(error);
    }

};


function triggerEventHook(url) {
    if(specialSubscribeEvents[url]){
        specialSubscribeEvents[url].forEach(e => {
            e(apiData[url]);
        });
    }

    if(subscribeEvents[url]){

        const removes = [];
        subscribeEvents[url].forEach(element => {
            if(!element.forever) removes.push(element);
            element.event(apiData[url]);
        });
        if(removes.length) subscribeEvents[url] = subscribeEvents[url].filter(element => !removes.includes(element));
    }

}




function subscribeApi(url, event, forever = true) {
    if(!subscribeEvents[url]){
        subscribeEvents[url] = [];
    }
    subscribeEvents[url].push({
        event,
        forever
    });
}

function clearSubscribeEvents(){
    Object.keys(subscribeEvents).forEach(key => {
        delete subscribeEvents[key];
    })
}


export {
    subscribeApi,
    clearSubscribeEvents    
}