# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(
    r"f:\dev\proj2\protx-soramv\src\pages\Workspace\Create\components\EcommerceImage\ScenarioWorkbench.tsx"
)
t = p.read_text(encoding="utf-8")

# ensure import type includes case compare via EcommerceScenario already

old_thumb = """const CoverThumb = styled.img`
  width: 88px;
  height: 52px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
`;"""

new_styles = """const CoverThumb = styled.img`
  width: 120px;
  height: 72px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
`;

const CasePanel = styled.div<{ $dark?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  min-width: min(100%, 360px);
  max-width: 440px;
`;

const CaseCompareRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: stretch;
`;

const CaseShot = styled.div<{ $dark?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const CaseShotImg = styled.img<{ $dark?: boolean }>`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)')};
  background: ${(p) => (p.$dark ? 'rgba(0,0,0,0.25)' : '#f5f5f4')};
`;

const CaseShotLabel = styled.div<{ $dark?: boolean; $tone?: 'before' | 'after' }>`
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  color: ${(p) =>
    p.$tone === 'after'
      ? '#c45c26'
      : p.$dark
        ? 'rgba(255,255,255,0.65)'
        : 'rgba(0,0,0,0.55)'};
`;

const CaseArrow = styled.div<{ $dark?: boolean }>`
  align-self: center;
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => (p.$dark ? 'rgba(253,186,116,0.9)' : '#c45c26')};
  padding-top: 18px;
`;

const CaseCaption = styled.div<{ $dark?: boolean }>`
  font-size: 11.5px;
  line-height: 1.45;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)')};
`;

const IntroCluster = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 16px 20px;
  align-items: flex-start;
  min-width: 240px;
`;"""

if "CaseCompareRow" not in t:
    if old_thumb not in t:
        raise SystemExit("CoverThumb block not found")
    t = t.replace(old_thumb, new_styles)

old_bar = """      <WorkbenchBar $dark={isDark}>
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
      </WorkbenchBar>"""

new_bar = """      <WorkbenchBar $dark={isDark}>
        <BackBtn type="text" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回场景库
        </BackBtn>
        <IntroCluster>
          <div style={{ flex: '1 1 220px', minWidth: 200 }}>
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
            <MetaRow style={{ marginTop: 10 }}>
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
          </div>
          {scenario.caseCompare ? (
            <CasePanel $dark={isDark}>
              <CaseCompareRow>
                <CaseShot $dark={isDark}>
                  <CaseShotImg
                    $dark={isDark}
                    src={scenario.caseCompare.beforeImage}
                    alt={scenario.caseCompare.beforeLabel || '生成前'}
                  />
                  <CaseShotLabel $dark={isDark} $tone="before">
                    {scenario.caseCompare.beforeLabel || '生成前'}
                  </CaseShotLabel>
                </CaseShot>
                <CaseArrow $dark={isDark}>→</CaseArrow>
                <CaseShot $dark={isDark}>
                  <CaseShotImg
                    $dark={isDark}
                    src={scenario.caseCompare.afterImage}
                    alt={scenario.caseCompare.afterLabel || '生成后'}
                  />
                  <CaseShotLabel $dark={isDark} $tone="after">
                    {scenario.caseCompare.afterLabel || '生成后'}
                  </CaseShotLabel>
                </CaseShot>
              </CaseCompareRow>
              {scenario.caseCompare.caption && (
                <CaseCaption $dark={isDark}>{scenario.caseCompare.caption}</CaseCaption>
              )}
            </CasePanel>
          ) : (
            <CoverThumb src={scenario.coverImage} alt="" />
          )}
        </IntroCluster>
      </WorkbenchBar>"""

if "caseCompare ?" not in t and "caseCompare?" not in t:
    if old_bar not in t:
        # try fuzzy: show nearby
        idx = t.find("<WorkbenchBar")
        raise SystemExit("bar block not found near: " + repr(t[idx : idx + 200]))
    t = t.replace(old_bar, new_bar)

p.write_text(t, encoding="utf-8", newline="\n")
print("workbench ok", "CaseCompareRow" in t, "caseCompare" in t)
