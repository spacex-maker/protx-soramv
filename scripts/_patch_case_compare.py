# -*- coding: utf-8 -*-
from pathlib import Path

sc = Path(r"f:\dev\proj2\protx-soramv\src\pages\Workspace\Create\components\EcommerceImage\scenarios.ts")
t = sc.read_text(encoding="utf-8")

old_iface = """export interface EcommerceScenario {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  steps: string[];
  workloadHint?: string;
  workbenchNotes?: EcommerceWorkbenchNotes;
  tips: string[];
  tags?: string[];
  uploads: ScenarioUploadSlot[];
  fields: ScenarioField[];
  aspectRatio: string;
  kleinMode: EcommerceKleinMode;
  buildPrompt: (values: ScenarioFieldValues) => string;
}"""

new_iface = """export interface EcommerceCaseCompare {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}

export interface EcommerceScenario {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  /** 工作台右侧案例：生成前后对比 */
  caseCompare?: EcommerceCaseCompare;
  steps: string[];
  workloadHint?: string;
  workbenchNotes?: EcommerceWorkbenchNotes;
  tips: string[];
  tags?: string[];
  uploads: ScenarioUploadSlot[];
  fields: ScenarioField[];
  aspectRatio: string;
  kleinMode: EcommerceKleinMode;
  buildPrompt: (values: ScenarioFieldValues) => string;
}"""

if "EcommerceCaseCompare" not in t:
    if old_iface not in t:
        raise SystemExit("iface block not found")
    t = t.replace(old_iface, new_iface)

needle = "        coverImage: scenarioCoverPath('white-bg-hero'),\n        steps:"
repl = """        coverImage: scenarioCoverPath('white-bg-hero'),
        caseCompare: {
          beforeImage: '/ecommerce-cases/white-bg-hero-before.jpg',
          afterImage: '/ecommerce-cases/white-bg-hero-after.jpg',
          beforeLabel: '原图（供应商实拍）',
          afterLabel: '生成后（白底主图）',
          caption: '同款商品：杂乱实拍 → 纯白棚拍主图（主体≥85%）',
        },
        steps:"""
if "white-bg-hero-before" not in t:
    if needle not in t:
        raise SystemExit("white-bg needle not found")
    t = t.replace(needle, repl)

sc.write_text(t, encoding="utf-8", newline="\n")
print("scenarios ok", "caseCompare" in t, "before" in t)
