import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, message } from 'antd';
import styled from 'styled-components';
import type { Model } from '../ImageToImage/types';
import type { EcommerceCategory, EcommerceScenario, ScenarioFieldValues, ScenarioUploadSlot } from './scenarios';
import { resolveScenarioAspect } from './scenarios';
import FieldControls, { buildInitialFieldValues } from './FieldControls';
import {
  fetchPreferredI2iModel,
  generateKleinImage,
  uploadImageFiles,
} from './generateApi';

type SlotFile = {
  file: File;
  previewUrl: string;
};

const WorkbenchBar = styled.div<{ $dark?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.04)' : 'rgba(28,25,23,0.03)')};
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.08)' : 'rgba(28,25,23,0.08)')};
  margin-bottom: 16px;
`;

const WorkbenchTitle = styled.div<{ $dark?: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${(p) => (p.$dark ? '#fafaf9' : '#1c1917')};
`;


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

const WorkbenchSub = styled.div<{ $dark?: boolean }>`
  margin-top: 4px;
  font-size: 12.5px;
  line-height: 1.5;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)')};
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const MetaPill = styled.span<{ $dark?: boolean; $tone?: 'mode' | 'tag' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: ${(p) =>
    p.$tone === 'mode'
      ? p.$dark
        ? 'rgba(253,186,116,0.15)'
        : 'rgba(196,92,38,0.12)'
      : p.$dark
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(0,0,0,0.04)'};
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.55)')};
`;

const Panel = styled.div<{ $dark?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div<{ $dark?: boolean }>`
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')};
  background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.03)' : '#fff')};
`;

const SectionTitle = styled.h3<{ $dark?: boolean }>`
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 650;
  color: ${(p) => (p.$dark ? '#fafaf9' : '#1c1917')};
`;

const UploadGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UploadBox = styled.label<{ $dark?: boolean; $hasImage?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed ${(p) => (p.$hasImage ? '#c45c26' : p.$dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)')};
  background: ${(p) => (p.$dark ? 'rgba(0,0,0,0.2)' : 'rgba(250,250,249,0.8)')};
  cursor: pointer;
  text-align: center;
  overflow: hidden;
  position: relative;

  input {
    display: none;
  }

  img {
    max-width: 100%;
    max-height: 160px;
    object-fit: contain;
    border-radius: 8px;
  }
`;

const UploadLabel = styled.div<{ $dark?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.85)' : '#44403c')};
`;

const UploadHint = styled.div<{ $dark?: boolean }>`
  font-size: 11px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
`;

const Tips = styled.ul<{ $dark?: boolean }>`
  margin: 12px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.55;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)')};
`;

const ResultBox = styled.div<{ $dark?: boolean }>`
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: ${(p) => (p.$dark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.03)')};
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 420px;
    object-fit: contain;
  }
`;

const BackBtn = styled(Button)`
  && {
    border: none;
    background: transparent;
    color: inherit;
    padding-left: 0;
  }
`;

type Props = {
  category: EcommerceCategory;
  scenario: EcommerceScenario;
  onBack: () => void;
};


function parseAspectRatio(ratio: string): number {
  const [w, h] = ratio.split(':').map((n) => Number(n));
  if (!w || !h) return 1;
  return w / h;
}

function validateUploads(slots: ScenarioUploadSlot[], files: Record<string, SlotFile | undefined>): string | null {
  for (const slot of slots) {
    if (!slot.optional && !files[slot.id]) {
      return `请上传：${slot.label}`;
    }
  }
  const hasAny = slots.some((s) => files[s.id]);
  if (!hasAny) {
    return '请至少上传一张参考图';
  }
  return null;
}

const ScenarioWorkbench: React.FC<Props> = ({ category, scenario, onBack }) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [fieldValues, setFieldValues] = useState<ScenarioFieldValues>(() =>
    buildInitialFieldValues(scenario.fields),
  );
  const [slotFiles, setSlotFiles] = useState<Record<string, SlotFile | undefined>>({});
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setFieldValues(buildInitialFieldValues(scenario.fields));
    setSlotFiles({});
    setResultUrl(null);
  }, [scenario.id, scenario.fields]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await fetchPreferredI2iModel();
        if (!cancelled) setModel(m);
      } catch {
        if (!cancelled) message.error('加载图生图模型失败');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const aspectForGenerate = useMemo(
    () => resolveScenarioAspect(scenario, fieldValues),
    [scenario, fieldValues],
  );

  const aspectRatioNumber = useMemo(() => parseAspectRatio(aspectForGenerate), [aspectForGenerate]);

  const uploadsReady = useMemo(
    () => !validateUploads(scenario.uploads, slotFiles),
    [scenario.uploads, slotFiles],
  );

  const onPickFile = useCallback((slotId: string, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      message.warning('请选择图片文件');
      return;
    }
    setSlotFiles((prev) => {
      const old = prev[slotId];
      if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
      return {
        ...prev,
        [slotId]: { file, previewUrl: URL.createObjectURL(file) },
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      Object.values(slotFiles).forEach((s) => {
        if (s?.previewUrl) URL.revokeObjectURL(s.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    const uploadErr = validateUploads(scenario.uploads, slotFiles);
    if (uploadErr) {
      message.warning(uploadErr);
      return;
    }
    if (!model) {
      message.warning('图生图模型未就绪，请稍后重试');
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setResultUrl(null);
    const hide = message.loading('正在上传并生成…', 0);

    try {
      const orderedSlots = scenario.uploads.filter((s) => slotFiles[s.id]);
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
      });

      hide();
      if (gen.ok) {
        setResultUrl(gen.url);
        message.success('生成成功');
      } else if (gen.timeout) {
        message.warning(gen.error);
      } else {
        message.error(gen.error);
      }
    } catch (e: unknown) {
      hide();
      const err = e as { message?: string; name?: string };
      if (err?.name !== 'CanceledError' && err?.message !== 'canceled') {
        message.error(err?.message || '生成失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <WorkbenchBar $dark={isDark}>
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
            {scenario.uploads.map((slot) => {
              const sf = slotFiles[slot.id];
              return (
                <div key={slot.id}>
                  <UploadLabel $dark={isDark}>
                    {slot.label}
                    {slot.optional ? '（可选）' : ''}
                  </UploadLabel>
                  <UploadBox $dark={isDark} $hasImage={!!sf}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onPickFile(slot.id, e.target.files?.[0])}
                    />
                    {sf ? (
                      <img src={sf.previewUrl} alt={slot.label} />
                    ) : (
                      <>
                        <CloudUploadOutlined style={{ fontSize: 28, marginBottom: 8, opacity: 0.5 }} />
                        <UploadHint $dark={isDark}>{slot.hint || '点击或拖拽上传图片'}</UploadHint>
                      </>
                    )}
                  </UploadBox>
                </div>
              );
            })}
          </UploadGrid>
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
            {resultUrl ? (
              <img src={resultUrl} alt="生成结果" />
            ) : (
              <span style={{ opacity: 0.45, fontSize: 13 }}>{loading ? '生成中…' : '结果将显示在这里'}</span>
            )}
          </ResultBox>
        </Section>
      </Panel>
    </>
  );
};

export default ScenarioWorkbench;
