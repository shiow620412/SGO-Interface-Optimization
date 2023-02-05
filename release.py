import re

file = "sgoScript.js"
f = open(file, "r", encoding="utf-8")
lines = f.readlines()
f.close()
print(f"讀取{file}...")
print(f"原始版本號:{lines[3][17:]}", end="")
newVersion = input("新版本號:")
lines[3] = re.sub("1.[0-9]+.[0-9]+", newVersion, lines[3])
lines[15] = re.sub("1.[0-9]+.[0-9]+", newVersion, lines[15])
# for index in range(lines.__len__()):
#     lines[index] = re.sub("1.[0-9]+.[0-9]+", "1.18.0", lines[index])

releaseFile = open(f"release\sgoScript Ver{newVersion}.js", "w+", encoding="utf-8")
releaseFile.writelines(lines)
releaseFile.close()
print(f"輸出檔案:release\\sgoScript Ver{newVersion}.js")
f = open(file, "w+", encoding="utf-8")
f.writelines(lines)
f.close()