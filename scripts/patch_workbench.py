# -*- coding: utf-8 -*-
from pathlib import Path

P = Path(__file__).resolve().parents[1] / "src/pages/Workspace/Create/components/EcommerceImage/ScenarioWorkbench.tsx"

STYLES = r"""
const CoverThumb = styled.img`
  width: 88px;
  height: 52px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
`;

const StepsList = styled.ol<{ $dark?: boolean }>`
  margin: 10px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.55;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)')};
`;

const NotesRow = styled.div<{ $dark?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  font-size: 11px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)')};
`;

const StepFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepBlock = styled.div<{ $dark?: boolean }>`
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)')};
  background: ${(p) => (p.$dark ? 'rgba(0,0,0,0.15)' : 'rgba(250,250,249,0.6)')};
`;

const StepHeading = styled.div<{ $dark?: boolean }>`
  font-size: 13px;
  font-weight: 650;
  margin-bottom: 12px;
  color: ${(p) => (p.$dark ? '#fafaf9' : '#1c1917')};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AspectPreviewWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const AspectFrame = styled.div<{ $ratio: number; $dark?: boolean }>`
  width: min(100%, 160px);
  aspect-ratio: ${(p) => p.$ratio};
  max-height: 120px;
  border-radius: 10px;
  border: 2px dashed ${(p) => (p.$dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)')};
  background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)')};
`;
"""

OLD_IMPORT = (
    "import { ArrowLeftOutlined, CloudUploadOutlined, LoadingOutlined, ThunderboltOutlined } "
    "from '@ant-design/icons';"
)
NEW_IMPORT = """import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';"""

PARSE_FN = """
function parseAspectRatio(ratio: string): number {
  const [w, h] = ratio.split(':').map((n) => Number(n));
  if (!w || !h) return 1;
  return w / h;
}

"""

OLD_RETURN_START = """      <WorkbenchBar $dark={isDark}>
        <BackBtn type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回场景库
        </BackBtn>
        <div style={{ flex: 1, minWidth: 200 }}>
          <WorkbenchTitle $dark={isDark}>
            {category.title} · {scenario.title}
          </WorkbenchTitle>
          <WorkbenchSub $dark={isDark}>{scenario.description}</WorkbenchSub>
        </div>
        <MetaRow>
          <MetaPill $dark={isDark} $tone="mode">
            Klein {scenario.kleinMode === 'edit' ? '精修' : '重绘'}
          </MetaPill>
          <MetaPill $dark={isDark}>比例 {aspectForGenerate}</MetaPill>
          {scenario.tags?.slice(0, 2).map((tag) => (
            <MetaPill key={tag} $dark={isDark} $tone="tag">
              {tag}
            </MetaPill>
          ))}
        </MetaRow>
      </WorkbenchBar>

      <Panel>
        <Section $dark={isDark}>
          <SectionTitle $dark={isDark}>上传与参数</SectionTitle>
          <UploadGrid>
"""

NEW_RETURN_START = """      <WorkbenchBar $dark={isDark}>
        <BackBtn type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回场景库
        </BackBtn>
        <CoverThumb src={scenario.coverImage} alt="" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <WorkbenchTitle $dark={isDark}>
            {category.title} · {scenario.title}
          </WorkbenchTitle>
          <WorkbenchSub $dark={isDark}>{scenario.description}</WorkbenchSub>
          {scenario.steps.length > 0 && (
            <StepsList $dark={isDark}>
              {scenario.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </StepsList>
          )}
          {scenario.workbenchNotes && (
            <NotesRow $dark={isDark}>
              {scenario.workbenchNotes.outputQuality && (
                <span>输出：{scenario.workbenchNotes.outputQuality}</span>
              )}
              {scenario.workbenchNotes.brandTone && <span>调性：{scenario.workbenchNotes.brandTone}</span>}
              {scenario.workbenchNotes.cropSafeZone && (
                <span>安全区：{scenario.workbenchNotes.cropSafeZone}</span>
              )}
              {scenario.workbenchNotes.batchVariant && (
                <span>批量：{scenario.workbenchNotes.batchVariant}</span>
              )}
            </NotesRow>
          )}
        </div>
        <MetaRow>
          <MetaPill $dark={isDark} $tone="mode">
            Klein {scenario.kleinMode === 'edit' ? '精修' : '重绘'}
          </MetaPill>
          <MetaPill $dark={isDark}>比例 {aspectForGenerate}</MetaPill>
          {scenario.workloadHint && <MetaPill $dark={isDark}>{scenario.workloadHint}</MetaPill>}
          {scenario.tags?.slice(0, 2).map((tag) => (
            <MetaPill key={tag} $dark={isDark} $tone="tag">
              {tag}
            </MetaPill>
          ))}
        </MetaRow>
      </WorkbenchBar>

      <Panel>
        <Section $dark={isDark}>
          <StepFlow>
            <StepBlock $dark={isDark}>
              <StepHeading $dark={isDark}>
                <CheckCircleOutlined style={{ opacity: uploadsReady ? 1 : 0.35 }} />
                步骤 1 · 上传素材
              </StepHeading>
              <UploadGrid>
"""

MIDDLE_OLD = """          </UploadGrid>

          <FieldControls
            fields={scenario.fields}
            values={fieldValues}
            accent={category.accent}
            isDark={isDark}
            onChange={setFieldValues}
          />

          {scenario.tips.length > 0 && (
            <Tips $dark={isDark}>
              {scenario.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </Tips>
          )}

          <Button
            type="primary"
            size="large"
            icon={loading ? <LoadingOutlined /> : <ThunderboltOutlined />}
            loading={loading}
            onClick={handleGenerate}
            style={{ marginTop: 16, background: category.accent, borderColor: category.accent }}
            block
          >
            生成
          </Button>
        </Section>

        <Section $dark={isDark}>
          <SectionTitle $dark={isDark}>生成结果</SectionTitle>
          <ResultBox $dark={isDark}>
"""

MIDDLE_NEW = """          </UploadGrid>
            </StepBlock>

            <StepBlock $dark={isDark}>
              <StepHeading $dark={isDark}>步骤 2 · 场景属性</StepHeading>
              <AspectPreviewWrap>
                <AspectFrame $dark={isDark} $ratio={aspectRatioNumber}>
                  {aspectForGenerate}
                </AspectFrame>
                <span style={{ fontSize: 12, opacity: 0.55 }}>生成比例预览框</span>
              </AspectPreviewWrap>
              <FieldControls
                fields={scenario.fields}
                values={fieldValues}
                accent={category.accent}
                isDark={isDark}
                onChange={setFieldValues}
              />
              {scenario.tips.length > 0 && (
                <Tips $dark={isDark}>
                  {scenario.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </Tips>
              )}
            </StepBlock>

            <StepBlock $dark={isDark}>
              <StepHeading $dark={isDark}>步骤 3 · 生成</StepHeading>
              <Button
                type="primary"
                size="large"
                icon={loading ? <LoadingOutlined /> : <ThunderboltOutlined />}
                loading={loading}
                onClick={handleGenerate}
                style={{ background: category.accent, borderColor: category.accent }}
                block
              >
                生成
              </Button>
            </StepBlock>
          </StepFlow>
        </Section>

        <Section $dark={isDark}>
          <SectionTitle $dark={isDark}>生成结果</SectionTitle>
          <AspectPreviewWrap>
            <AspectFrame $dark={isDark} $ratio={aspectRatioNumber}>
              预览
            </AspectFrame>
          </AspectPreviewWrap>
          <ResultBox $dark={isDark}>
"""

HOOK_OLD = """  const aspectForGenerate = useMemo(
    () => resolveScenarioAspect(scenario, fieldValues),
    [scenario, fieldValues],
  );

  const onPickFile = useCallback((slotId: string, file: File | undefined) => {
"""

HOOK_NEW = """  const aspectForGenerate = useMemo(
    () => resolveScenarioAspect(scenario, fieldValues),
    [scenario, fieldValues],
  );

  const aspectRatioNumber = useMemo(() => parseAspectRatio(aspectForGenerate), [aspectForGenerate]);

  const uploadsReady = useMemo(
    () => !validateUploads(scenario.uploads, slotFiles),
    [scenario.uploads, slotFiles],
  );

  const onPickFile = useCallback((slotId: string, file: File | undefined) => {
"""


def main() -> None:
    t = P.read_text(encoding="utf-8")
    if "CoverThumb" in t:
        print("already patched")
        return
    t = t.replace(OLD_IMPORT, NEW_IMPORT)
    anchor = "const WorkbenchSub = styled.div"
    t = t.replace(anchor, STYLES + "\n" + anchor, 1)
    t = t.replace(
        "function validateUploads(slots: ScenarioUploadSlot[], files: Record<string, SlotFile | undefined>): string | null {",
        PARSE_FN
        + "function validateUploads(slots: ScenarioUploadSlot[], files: Record<string, SlotFile | undefined>): string | null {",
        1,
    )
    t = t.replace(HOOK_OLD, HOOK_NEW, 1)
    t = t.replace(OLD_RETURN_START, NEW_RETURN_START, 1)
    t = t.replace(MIDDLE_OLD, MIDDLE_NEW, 1)
    P.write_text(t, encoding="utf-8", newline="\n")
    print("patched workbench")


if __name__ == "__main__":
    main()
