import os
import shutil
import subprocess
# subprocess.call("npm run test", shell=True)

# file = "./dist/main.js"
globalVarsFile = "./src/storage/globalVars.js"
print(f"讀取{globalVarsFile}...")

f = open(globalVarsFile, "r+", encoding="utf-8")
lines = f.readlines()
f.close()
currentVersion = lines[1][14:20]
print(f"當前版本號:{currentVersion}")
newVersion = input("新版本號:")
lines[1] = lines[1].replace(currentVersion, newVersion)
f = open(globalVarsFile, "w+", encoding="utf-8")
f.writelines(lines)
f.close()


subprocess.call("npm run test", shell=True)

file = "./dist/main.js"
f = open(file, "r+", encoding="utf-8")
codes = f.readlines()
f.close()

outputFile = open(f"./dist/main_tampermonkey.js", "w+", encoding="utf-8")
outputFile.write(f"""// ==UserScript==
// @name         Sword Gale Online 介面優化
// @namespace    http://tampermonkey.net/
// @version      {newVersion}
// @description  優化界面
// @author       Wind
// @match        https://swordgale.online/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=swordgale.online
// @grant        none
// @license MIT
// @run-at document-start
// ==/UserScript==
""")
outputFile.writelines(codes)
outputFile.close()
shutil.copy("./dist/main_tampermonkey.js", f"./release/sgoScript Ver{newVersion}.js")
print(f"輸出檔案:../dist/main_tampermonkey.js")
print(f"輸出檔案:../release/sgoScript Ver{newVersion}.js")
