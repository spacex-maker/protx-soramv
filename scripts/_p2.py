from pathlib import Path
import re

root = Path(r"f:\dev\proj2\protx-soramv\src\pages\Workspace\Create\components\EcommerceImage")

picker = root / "OfficialModelPicker.tsx"
b = picker.read_bytes()
if b.count(0) > 10:
    picker.write_text(b.decode("utf-16"), encoding="utf-8", newline="\n")
    print("picker converted")
print("picker nulls", picker.read_bytes().count(0))

sc = root / "scenarios.ts"
t = sc.read_text(encoding="utf-8")
if "supportsOfficialModel" not in t:
    t = t.replace(
        "  kleinMode: EcommerceKleinMode;\n  buildPrompt:",
        "  kleinMode: EcommerceKleinMode;\n  supportsOfficialModel?: boolean;\n  buildPrompt:",
    )

for sid in ("ai-model-wear", "virtual-tryon"):
    key = "id: '%s'" % sid
    start = t.find(key)
    if start < 0:
        print("missing", sid)
        continue
    end = t.find("\n      },\n", start)
    if end < 0:
        print("end missing", sid)
        continue
    block = t[start:end]
    block2 = re.sub(r"uploads: \[[^\]]*\]", "uploads: [garmentUpload]", block)
    if "supportsOfficialModel" not in block2:
        block2 = block2.replace(
            "kleinMode: 'edit',",
            "kleinMode: 'edit',\n        supportsOfficialModel: true,",
        )
    t = t[:start] + block2 + t[end:]
    print("patched", sid)

sc.write_text(t, encoding="utf-8", newline="\n")
print("supports count", t.count("supportsOfficialModel"))