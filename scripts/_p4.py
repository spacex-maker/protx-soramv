from pathlib import Path
p = Path(r"f:\dev\proj2\protx-soramv\src\pages\Workspace\Create\components\EcommerceImage\ScenarioWorkbench.tsx")
w = p.read_text(encoding="utf-8")
# replace warning lines containing composedImageUrl block messages by exact search of English-safe markers
a = "if (!selectedOfficialModel?.composedImageUrl) {"
b = "if (!uploadedUrls.length) {"
i = w.find(a)
j = w.find(b, i)
if i < 0 or j < 0:
    raise SystemExit("anchors missing")
# replace message.warning in first block
k = w.find("message.warning(", i)
k2 = w.find(");", k)
w = w[:k] + "message.warning('\u8bf7\u9009\u62e9\u4e00\u4f4d\u5b98\u65b9\u6a21\u7279')" + w[k2:]
# re-find second
j = w.find(b, i)
k = w.find("message.warning(", j)
k2 = w.find(");", k)
w = w[:k] + "message.warning('\u8bf7\u4e0a\u4f20\u8863\u7269 / \u5546\u54c1\u56fe')" + w[k2:]
# UI label
label = "\u9009\u62e9\u5b98\u65b9\u6a21\u7279\uff08\u53ea\u9700\u518d\u4e0a\u4f20\u8863\u7269\uff09"
# find OfficialModelPicker preceding label div text between > and </div> before OfficialModelPicker
op = w.find("<OfficialModelPicker")
pre = w.rfind("<div style={{ fontSize: 12", 0, op)
if pre > 0:
    gt = w.find(">", pre)
    lt = w.find("<", gt+1)
    w = w[: gt + 1] + label + w[lt:]
p.write_text(w, encoding="utf-8", newline="\n")
t = p.read_text(encoding="utf-8")
print("ok1", "\u8bf7\u9009\u62e9\u4e00\u4f4d\u5b98\u65b9\u6a21\u7279" in t)
print("ok2", "\u8bf7\u4e0a\u4f20\u8863\u7269" in t)
print("ok3", label in t)
print("tpl", "${selectedOfficialModel.modelName}" in t)