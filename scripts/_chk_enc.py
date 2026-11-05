# -*- coding: utf-8 -*-
from pathlib import Path
p = Path(r"f:/dev/proj2/protx-soramv/src/pages/Workspace/Create/components/EcommerceImage/scenarios.ts")
t = p.read_text(encoding="utf-8")
idx = t.find("id: 'pose'")
print(repr(t[idx:idx+220]))
idx = t.find("supportsOfficialModel")
print("---")
print(repr(t[idx-350:idx+100]))
print("has_mojibake_latin1", "\u00e5" in t and "\u00a7" in t)
print("has_chinese", "\u8bd5\u7a7f" in t, "\u4e0a\u4f20" in t, "\u5b98\u65b9" in t)