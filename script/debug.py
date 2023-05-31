import re
import subprocess

subprocess.call("npm run test", shell=True)

globalVarsFile = "./src/storage/globalVars.js"
print(f"讀取{globalVarsFile}...")

f = open(globalVarsFile, "r+", encoding="utf-8")
lines = f.readlines()
f.close()
currentVersion = lines[1][14:20]

file = "./dist/main.js"
f = open(file, "r", encoding="utf-8")
codes = f.read()
f.close()
print(f"讀取{file}...")
# print(f"原始版本號:{lines[3][17:]}", end="")
# newVersion = input("新版本號:")
# lines[3] = re.sub("1.[0-9]+.[0-9]+", newVersion, lines[3])
# lines[15] = re.sub("1.[0-9]+.[0-9]+", newVersion, lines[15])
# for index in range(lines.__len__()):
#     lines[index] = re.sub("1.[0-9]+.[0-9]+", "1.18.0", lines[index])

outputFile = open(f"./dist/main_tampermonkey.js", "w+", encoding="utf-8")
outputFile.write(f"""// ==UserScript==
// @name         Sword Gale Online 介面優化
// @namespace    http://tampermonkey.net/
// @version      {currentVersion}
// @description  優化界面
// @author       Wind
// @match        https://swordgale.online/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=swordgale.online
// @grant        none
// @license MIT
// @run-at document-start
// ==/UserScript==
""")
outputFile.write(codes)
# outputFile.writelines(lines)
outputFile.close()
print(f"輸出檔案:./dist/main_tampermonkey.js")
