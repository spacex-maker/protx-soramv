import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  LinkOutlined,
  LoadingOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Image, message } from 'antd';
import styled from 'styled-components';
import type { Model } from '../ImageToImage/types';
import type { EcommerceCategory, EcommerceScenario, ScenarioFieldValues, ScenarioUploadSlot } from './scenarios';
import { resolveScenarioAspect } from './scenarios';
import FieldControls, { buildInitialFieldValues } from './FieldControls';
import {
  downloadGeneratedImage,
  fetchPreferredI2iModel,
  generateKleinImage,
  uploadImageFiles,
} from './generateApi';
import OfficialModelPicker, {
  type OfficialEcommerceModel,
} from './OfficialModelPicker';
import { buildKleinOutfitPrompt } from '../shared/fluxKleinParams';

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

const RatioNote = styled.div<{ $dark?: boolean }>`
  margin-bottom: 12px;
  font-size: 12px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)')};
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

const ResultHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ResultMeta = styled.div<{ $dark?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)')};
`;

const ResultActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ResultStage = styled.div<{ $dark?: boolean }>`
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  background: ${(p) =>
    p.$dark
      ? 'repeating-conic-gradient(rgba(255,255,255,0.035) 0% 25%, rgba(0,0,0,0.28) 0% 50%) 0 0 / 22px 22px'
      : 'repeating-conic-gradient(#fafaf9 0% 25%, #e7e5e4 0% 50%) 0 0 / 22px 22px'};
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};

  .ant-image {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  img {
    max-width: 100%;
    max-height: min(72vh, 720px);
    object-fit: contain;
    display: block;
  }
`;

const ResultEmpty = styled.div<{ $dark?: boolean }>`
  padding: 48px 20px;
  text-align: center;
  font-size: 13px;
  line-height: 1.6;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
`;

const ModelLine = styled.div<{ $dark?: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 10px;
  font-size: 12px;
  color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)')};
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
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [selectedOfficialModel, setSelectedOfficialModel] =
    useState<OfficialEcommerceModel | null>(null);
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
    setSelectedOfficialModel(null);
  }, [scenario.id, scenario.fields]);

  const loadModel = useCallback(async () => {
    setModelLoading(true);
    setModelError(null);
    try {
      const m = await fetchPreferredI2iModel();
      setModel(m);
      if (!m) setModelError('当前没有可用的图生图模型');
      return m;
    } catch (e: unknown) {
      const err = e as { message?: string };
      setModel(null);
      setModelError(err?.message || '加载图生图模型失败');
      return null;
    } finally {
      setModelLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadModel();
  }, [loadModel]);

  const aspectForGenerate = useMemo(
    () => resolveScenarioAspect(scenario, fieldValues),
    [scenario, fieldValues],
  );

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
    if (scenario.supportsOfficialModel && !selectedOfficialModel?.composedImageUrl) {
      message.warning('请选择一位官方模特');
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setResultUrl(null);
    const hide = message.loading('正在上传并生成…', 0);

    try {
      let activeModel = model;
      if (!activeModel?.modelCode) {
        activeModel = await fetchPreferredI2iModel();
        setModel(activeModel);
      }
      if (!activeModel?.modelCode) {
        hide();
        setModelError('当前没有可用的图生图模型');
        message.error('没有可用的图生图模型，请稍后重试');
        return;
      }

      const orderedSlots = scenario.uploads.filter((s) => slotFiles[s.id]);
      const files = orderedSlots.map((s) => slotFiles[s.id]!.file);
      const uploadedUrls = await uploadImageFiles(files);
      let imageUrls = uploadedUrls;
      let prompt = scenario.buildPrompt(fieldValues);

      if (scenario.supportsOfficialModel) {
        if (!uploadedUrls.length) {
          message.warning('请上传衣物 / 商品图');
          hide();
          setLoading(false);
          return;
        }
        imageUrls = [selectedOfficialModel!.composedImageUrl, uploadedUrls[0]];
        prompt = buildKleinOutfitPrompt({
          personDesc: `${selectedOfficialModel!.modelName} fashion model`,
          garmentDesc: 'the garment / product clothing from Image 2',
        });
      }

      const run = (m: Model) =>
        generateKleinImage({
          model: m,
          imageUrls,
          prompt,
          aspectRatio: aspectForGenerate,
          kleinMode: scenario.kleinMode,
          signal: ac.signal,
        });

      let gen = await run(activeModel);
      if (!gen.ok && /未找到模型/.test(gen.error || '')) {
        const next = await fetchPreferredI2iModel([activeModel.modelCode]);
        if (next?.modelCode) {
          setModel(next);
          activeModel = next;
          gen = await run(next);
        }
      }

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

  const handleDownload = async () => {
    if (!resultUrl) return;
    setDownloading(true);
    try {
      const mode = await downloadGeneratedImage(resultUrl, `ecommerce-${scenario.id}-${Date.now()}.png`);
      if (mode === 'saved') message.success('已开始下载');
      else message.info('图片已在新标签打开，可右键另存为');
    } catch (e: unknown) {
      const err = e as { message?: string };
      message.error(err?.message || '下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!resultUrl) return;
    try {
      await navigator.clipboard.writeText(resultUrl);
      message.success('已复制图片链接');
    } catch {
      message.error('复制失败，请直接下载');
    }
  };

  return (
    <>
      <WorkbenchBar $dark={isDark}>
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
      </WorkbenchBar>

      <Panel>
        <Section $dark={isDark}>
          <StepFlow>
            <StepBlock $dark={isDark}>
              <StepHeading $dark={isDark}>
                <CheckCircleOutlined style={{ opacity: uploadsReady ? 1 : 0.35 }} />
                步骤 1 · 上传素材
              </StepHeading>
                            {scenario.supportsOfficialModel && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.75 }}>选择官方模特（只需再上传衣物）</div>
                  <OfficialModelPicker
                    value={selectedOfficialModel?.modelCode}
                    onChange={setSelectedOfficialModel}
                    accent={category.accent}
                    isDark={isDark}
                  />
                </div>
              )}
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
              <RatioNote $dark={isDark}>输出比例 {aspectForGenerate}</RatioNote>
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
              <ModelLine $dark={isDark}>
                {modelLoading
                  ? '正在连接图生图模型…'
                  : model
                    ? `图生图模型：${model.modelName || model.modelCode}`
                    : modelError || '图生图模型未就绪'}
                {!modelLoading && !model && (
                  <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => void loadModel()}>
                    重试
                  </Button>
                )}
              </ModelLine>
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
          <ResultHead>
            <div>
              <SectionTitle $dark={isDark} style={{ margin: 0 }}>
                生成结果
              </SectionTitle>
              <ResultMeta $dark={isDark}>
                {resultUrl ? `比例 ${aspectForGenerate} · 可下载或复制链接` : '生成完成后在这里预览，并直接下载'}
              </ResultMeta>
            </div>
            <ResultActions>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                disabled={!resultUrl}
                loading={downloading}
                onClick={() => void handleDownload()}
                style={{ background: category.accent, borderColor: category.accent }}
              >
                下载
              </Button>
              <Button icon={<LinkOutlined />} disabled={!resultUrl} onClick={() => void handleCopyLink()}>
                复制链接
              </Button>
            </ResultActions>
          </ResultHead>
          <ResultStage $dark={isDark}>
            {resultUrl ? (
              <Image src={resultUrl} alt="生成结果" />
            ) : (
              <ResultEmpty $dark={isDark}>
                {loading ? '正在生成，完成后会出现在这里' : '还没有结果。上传素材后点左侧「生成」。'}
              </ResultEmpty>
            )}
          </ResultStage>
        </Section>
      </Panel>
    </>
  );
};

export default ScenarioWorkbench;
