const commonUtil = require("../utils/common");
const settingStorage = require("../storage/setting");
const eventUtil = require("../utils/event");
const forgeStorage = require("../storage/forge");

let recipeData = settingStorage.get("recipe");
let selectedMaterials = []
let equipmentName = "";
const elementClassname = {};
let materialDiv, forgeContainer;
const filterRecipe = {};

function Init() {
    commonUtil.bindEvent("/forge", () => {
        forgeContainer = document.querySelectorAll(".chakra-container");
        if (forgeContainer.length > 0) {
            if (forgeContainer.length > 1) {
                forgeContainer = forgeContainer[1];
            } else {
                forgeContainer = forgeContainer[0];
            }
            // if(!materialDiv)
            materialDiv = forgeContainer.childNodes[2];
            const forgeButton = forgeContainer.querySelector("button");
            if (materialDiv.querySelector(".chakra-table__container") && forgeButton) {
                commonUtil.clearTimers();

                createUI();
                refreshRecipeTable();
                forgeContainer.querySelector("#addRecipeBtn").onclick = addRecipe;
                forgeButton.onclick = forgeClick;

                eventUtil.subscribeApi("forge", (data) => {
                    const time = new Date(data.profile.actionStart);
                    time.setSeconds(0);
                    time.setMilliseconds(0);
                    const base64 = btoa(encodeURIComponent(`${time.getTime()},${equipmentName},${data.profile.nickname}`))

                    forgeStorage.set(base64, selectedMaterials.join(","))
                    forgeStorage.save();
                });
            }
        }
    });
}

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
    const tableData = commonUtil.getTableData(materialTable, {
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
        recipeData = settingStorage.get("recipe");
        if (!recipeData[recipeName] && materials.length > 0) {
            recipeData[recipeName] = materials.join("、");
            settingStorage.set("recipe", recipeData);
            settingStorage.save();
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
    settingStorage.set("recipe", recipeData);
    settingStorage.save();
    row.remove();
}

function forgeClick(){
    selectedMaterials.length = 0
    forgeContainer.querySelectorAll("p + div > div").forEach(div => {
        selectedMaterials.push(div.textContent.replace(" × ","x"));
    });
    equipmentName = forgeContainer.querySelector("input").value

}


export default Init;