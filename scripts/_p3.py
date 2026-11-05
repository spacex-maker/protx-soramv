from pathlib import Path

wb = Path(r"f:\dev\proj2\protx-soramv\src\pages\Workspace\Create\components\EcommerceImage\ScenarioWorkbench.tsx")
w = wb.read_text(encoding="utf-8")

if "OfficialModelPicker" not in w:
    old_imp = "from './generateApi';"
    new_imp = """from './generateApi';
import OfficialModelPicker, {
  type OfficialEcommerceModel,
} from './OfficialModelPicker';
import { buildKleinOutfitPrompt } from '../shared/fluxKleinParams';"""
    if old_imp not in w:
        raise SystemExit("import anchor missing")
    w = w.replace(old_imp, new_imp, 1)
    print("import ok")

if "selectedOfficialModel" not in w:
    w = w.replace(
        "const [resultUrl, setResultUrl] = useState<string | null>(null);",
        "const [resultUrl, setResultUrl] = useState<string | null>(null);\n  const [selectedOfficialModel, setSelectedOfficialModel] =\n    useState<OfficialEcommerceModel | null>(null);",
        1,
    )
    w = w.replace(
        "    setResultUrl(null);\n  }, [scenario.id, scenario.fields]);",
        "    setResultUrl(null);\n    setSelectedOfficialModel(null);\n  }, [scenario.id, scenario.fields]);",
        1,
    )
    print("state ok")

# UI inject - find Chinese step heading; file may have correct Chinese
needle_a = "              </StepHeading>\n              <UploadGrid>"
# Prefer inject after first StepHeading of step 1
idx = w.find("StepHeading")
# find UploadGrid after first StepBlock
ug = w.find("<UploadGrid>")
if ug > 0 and "OfficialModelPicker" not in w[ug-400:ug]:
    inject = """              {scenario.supportsOfficialModel && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.75 }}>
                    Select official model (then upload garment only)
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
    # replace Chinese label to Chinese in a second pass
    inject = inject.replace(
        "Select official model (then upload garment only)",
        "\u9009\u62e9\u5b98\u65b9\u6a21\u7279\uff08\u53ea\u9700\u518d\u4e0a\u4f20\u8863\u7269\uff09",
    )
    w = w[:ug] + inject + w[ug + len("<UploadGrid>"):]
    print("ui ok")
else:
    print("ui skip", ug)

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
          message.warning('\\u8bf7\\u9009\\u62e9\\u4e00\\u4f4d\\u5b98\\u65b9\\u6a21\\u7279');
          hide();
          setLoading(false);
          return;
        }
        if (!uploadedUrls.length) {
          message.warning('\\u8bf7\\u4e0a\\u4f20\\u8863\\u7269 / \\u5546\\u54c1\\u56fe');
          hide();
          setLoading(false);
          return;
        }
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

# fix unicode escapes in new_gen to real chars
new_gen = new_gen.encode("utf-8").decode("unicode_escape")

if "selectedOfficialModel?.composedImageUrl" not in w:
    if old_gen not in w:
        print("gen missing")
        # show nearby
        i = w.find("uploadImageFiles")
        print(repr(w[i-80:i+200]))
    else:
        w = w.replace(old_gen, new_gen)
        print("gen ok")
else:
    print("gen already")

wb.write_text(w, encoding="utf-8", newline="\n")
print("nulls", wb.read_bytes().count(0))
print("has picker", "OfficialModelPicker" in w)
print("has outfit", "buildKleinOutfitPrompt" in w)