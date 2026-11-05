# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(r"f:\dev\proj2\protx-soramv\src\pages\Workspace\Create\components\EcommerceImage")

picker = root / "OfficialModelPicker.tsx"
b = picker.read_bytes()
if b.count(0) > 10:
    picker.write_text(b.decode("utf-16"), encoding="utf-8", newline="\n")
    print("picker converted")

sc = root / "scenarios.ts"
t = sc.read_text(encoding="utf-8")
if "supportsOfficialModel" not in t:
    t = t.replace(
        "  kleinMode: EcommerceKleinMode;\n  buildPrompt:",
        "  kleinMode: EcommerceKleinMode;\n  /** 可选用官方模特库（试穿类） */\n  supportsOfficialModel?: boolean;\n  buildPrompt:",
    )

for sid in ("ai-model-wear", "virtual-tryon"):
    m = re.search(
        rf"(id: '{sid}',\n)(.*?)(\n      \}},\n      \{\{\n        id:|\n      \}},\n    \],)",
        t,
        re.S,
    )
    if not m:
        print("not found", sid)
        continue
    block = m.group(0)
    if "supportsOfficialModel: true" not in block:
        block = re.sub(
            r"(kleinMode: '[^']+',)",
            r"\1\n        supportsOfficialModel: true,",
            block,
            count=1,
        )
    block = re.sub(r"uploads: \[[^\]]+\]", "uploads: [garmentUpload]", block, count=1)
    t = t[: m.start()] + block + t[m.end() :]
    print("patched", sid)

sc.write_text(t, encoding="utf-8", newline="\n")
print("supportsOfficialModel count", t.count("supportsOfficialModel"))

# --- patch ScenarioWorkbench ---
wb = root / "ScenarioWorkbench.tsx"
w = wb.read_text(encoding="utf-8")

if "OfficialModelPicker" not in w:
    w = w.replace(
        "import {\n  fetchPreferredI2iModel,\n  generateKleinImage,\n  uploadImageFiles,\n} from './generateApi';",
        "import {\n  fetchPreferredI2iModel,\n  generateKleinImage,\n  uploadImageFiles,\n} from './generateApi';\nimport OfficialModelPicker, {\n  type OfficialEcommerceModel,\n} from './OfficialModelPicker';\nimport { buildKleinOutfitPrompt } from '../shared/fluxKleinParams';",
    )

# add state after resultUrl state
if "selectedOfficialModel" not in w:
    w = w.replace(
        "const [resultUrl, setResultUrl] = useState<string | null>(null);",
        "const [resultUrl, setResultUrl] = useState<string | null>(null);\n  const [selectedOfficialModel, setSelectedOfficialModel] =\n    useState<OfficialEcommerceModel | null>(null);",
    )
    w = w.replace(
        "    setResultUrl(null);\n  }, [scenario.id, scenario.fields]);",
        "    setResultUrl(null);\n    setSelectedOfficialModel(null);\n  }, [scenario.id, scenario.fields]);",
    )

# inject official picker UI before garment upload section - look for Step 1 heading
marker = "步骤 1 · 上传素材"
if marker in w and "官方模特" not in w.split(marker, 1)[1][:800]:
    inject = """步骤 1 · 上传素材
              </StepHeading>
              {scenario.supportsOfficialModel && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.75 }}>
                    选择官方模特（只需再上传衣物）
                  </div>
                  <OfficialModelPicker
                    value={selectedOfficialModel?.modelCode}
                    onChange={setSelectedOfficialModel}
                    accent={category.accent}
                    isDark={isDark}
                  />
                </div>
              )}
              <UploadGrid>"""
    # replace the closing of StepHeading + UploadGrid open carefully
    old = """步骤 1 · 上传素材
              </StepHeading>
              <UploadGrid>"""
    if old in w:
        w = w.replace(old, inject)
        print("injected picker UI")
    else:
        print("upload marker variant missing")

# patch handleGenerate for official model
old_gen = """      const orderedSlots = scenario.uploads.filter((s) => slotFiles[s.id]);
      const files = orderedSlots.map((s) => slotFiles[s.id]!.file);
      const imageUrls = await uploadImageFiles(files);
      const prompt = scenario.buildPrompt(fieldValues);

      const gen = await generateKleinImage({
        model,
        imageUrls,
        prompt,
        aspectRatio: aspectForGenerate,
        kleinMode: scenario.kleinMode,
        signal: ac.signal,
      });"""

new_gen = """      const orderedSlots = scenario.uploads.filter((s) => slotFiles[s.id]);
      const files = orderedSlots.map((s) => slotFiles[s.id]!.file);
      const uploadedUrls = await uploadImageFiles(files);
      let imageUrls = uploadedUrls;
      let prompt = scenario.buildPrompt(fieldValues);

      if (scenario.supportsOfficialModel) {
        if (!selectedOfficialModel?.composedImageUrl) {
          message.warning('请选择一位官方模特');
          hide();
          setLoading(false);
          return;
        }
        if (!uploadedUrls.length) {
          message.warning('请上传衣物 / 商品图');
          hide();
          setLoading(false);
          return;
        }
        // Klein outfit：Image1 模特，Image2 衣物
        imageUrls = [selectedOfficialModel.composedImageUrl, uploadedUrls[0]];
        prompt = buildKleinOutfitPrompt({
          personDesc: `${selectedOfficialModel.modelName} fashion model`,
          garmentDesc: 'the garment / product clothing from Image 2',
        });
      }

      const gen = await generateKleinImage({
        model,
        imageUrls,
        prompt,
        aspectRatio: aspectForGenerate,
        kleinMode: scenario.kleinMode,
        signal: ac.signal,
      });"""

if "selectedOfficialModel?.composedImageUrl" not in w:
    if old_gen not in w:
        print("gen block not found")
    else:
        w = w.replace(old_gen, new_gen)
        print("gen patched")

wb.write_text(w, encoding="utf-8", newline="\n")
print("workbench nulls", wb.read_bytes().count(0))
print("done")
