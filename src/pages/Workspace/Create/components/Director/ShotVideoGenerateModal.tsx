import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  DeleteOutlined,
  PictureOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import instance from 'api/axios';
import directorApi, { DirectorCharacter, DirectorShot } from 'api/director';
import { uploadImageToServer } from '../ImageToImage/utils';
import { normalizeUrl } from '../ImageToVideo/utils';
import { Model } from '../ImageToVideo/types';
import { getVideoRequiredTokens } from '../shared/balanceUtils';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import PromptMentionTextArea from './PromptMentionTextArea';
import {
  ShotVideoContentMode,
  ShotVideoReferenceAsset,
  applyPromptMention,
  buildInitialReferencePrompt,
  buildInitialShotReferences,
  detectPromptMention,
  isDisplayableImageUrl,
  isSeedance2ModelCode,
  pickDefaultContentMode,
  resolvePromptReferenceLabels,
  splitSeedanceRefLines,
  extractVideoGenerateError,
} from './shotVideoUtils';

const { Text } = Typography;
const { TextArea } = Input;

const Section = styled.div`
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.015);
  margin-bottom: 12px;

  .dark & {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }
`;

const SectionTitle = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
`;

const FrameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const FrameBox = styled.div<{ $aspectRatio: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
  border-radius: 8px;
  overflow: hidden;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RefList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RefItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;

  .dark & {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
  }
`;

const cssAspectRatio = (ratio: string) => ratio.replace(':', ' / ');

export interface ShotVideoGenerateContext {
  shot: DirectorShot;
  initialPrompt: string;
}

export interface ShotVideoGenerateModalProps {
  open?: boolean;
  embedded?: boolean;
  active?: boolean;
  context?: ShotVideoGenerateContext | null;
  shot?: DirectorShot | null;
  productionPrompt?: string;
  characters: DirectorCharacter[];
  aspectRatio?: string;
  defaultI2vModelCode?: string | null;
  onClose?: () => void;
  onApplied: () => void;
  onGoToVisual?: () => void;
}

const ShotVideoGenerateModal: React.FC<ShotVideoGenerateModalProps> = ({
  open = false,
  embedded = false,
  active = true,
  context,
  shot: shotProp,
  productionPrompt: productionPromptProp,
  characters,
  aspectRatio = '16:9',
  defaultI2vModelCode,
  onClose,
  onApplied,
  onGoToVisual,
}) => {
  const intl = useIntl();
  const shot = shotProp || context?.shot;
  const baseProductionPrompt = productionPromptProp ?? context?.initialPrompt ?? '';
  const promptRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [contentMode, setContentMode] = useState<ShotVideoContentMode>('first_last_frame');
  const [prompt, setPrompt] = useState('');
  const [references, setReferences] = useState<ShotVideoReferenceAsset[]>([]);
  const [startFrameUrl, setStartFrameUrl] = useState<string | null>(null);
  const [startFrameFile, setStartFrameFile] = useState<File | null>(null);
  const [endFrameUrl, setEndFrameUrl] = useState<string | null>(null);
  const [endFrameFile, setEndFrameFile] = useState<File | null>(null);
  const [useEndFrame, setUseEndFrame] = useState(false);
  const useStudioFrames = embedded;
  const [videoRefsRaw, setVideoRefsRaw] = useState('');
  const [audioRefsRaw, setAudioRefsRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [uploadingRef, setUploadingRef] = useState(false);
  const {
    insufficientBalanceOpen,
    insufficientBalanceRequired,
    insufficientBalanceModalBalance,
    closeInsufficientBalanceModal,
    ensureSufficientBalance,
    ensureKycForModel,
    tryShowFromApiError,
  } = useInsufficientBalanceGuard();

  const seedanceModels = useMemo(
    () => models.filter((m) => (m.modelCode || '').toLowerCase().includes('seedance')),
    [models]
  );

  const isSeedance2 = isSeedance2ModelCode(selectedModel?.modelCode);

  const resetFromContext = useCallback(() => {
    if (!shot) return;
    const initialRefs = buildInitialShotReferences(shot, characters);
    const mode = pickDefaultContentMode(shot, initialRefs);
    const initialPrompt = buildInitialReferencePrompt(baseProductionPrompt, initialRefs);
    setContentMode(mode);
    setReferences(initialRefs);
    setPrompt(initialPrompt);
    if (!useStudioFrames) {
      setStartFrameUrl(isDisplayableImageUrl(shot.keyframeImageUrl) ? shot.keyframeImageUrl : null);
      setStartFrameFile(null);
      setEndFrameUrl(isDisplayableImageUrl(shot.endFrameImageUrl) ? shot.endFrameImageUrl : null);
      setEndFrameFile(null);
      setUseEndFrame(isDisplayableImageUrl(shot.endFrameImageUrl));
    }
    setVideoRefsRaw('');
    setAudioRefsRaw('');
    setGenerateError(null);
    form.setFieldsValue({
      duration: shot.durationSec ?? 5,
      seedanceResolution: '720p',
      seedanceGenerateAudio: false,
      seedanceWatermark: false,
    });
  }, [baseProductionPrompt, characters, form, shot, useStudioFrames]);

  const isActive = embedded ? active : open;

  useEffect(() => {
    if (!isActive) return;
    resetFromContext();
  }, [isActive, resetFromContext]);

  useEffect(() => {
    if (!isActive) return;
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
          params: { modelType: 'i2v' },
        });
        if (response.data?.success && Array.isArray(response.data.data)) {
          const filtered = (response.data.data as Model[]).filter((m) =>
            (m.modelCode || '').toLowerCase().includes('seedance')
          );
          setModels(filtered);
          const preferred =
            filtered.find((m) => m.modelCode === defaultI2vModelCode) ||
            filtered.find((m) => isSeedance2ModelCode(m.modelCode)) ||
            filtered[0] ||
            null;
          setSelectedModel(preferred);
          if (filtered.length === 0) {
            message.warning(
              intl.formatMessage({
                id: 'create.seedance.noModel',
                defaultMessage: '暂无可用的 Seedance 模型，请先在后台配置',
              })
            );
          }
        } else {
          setModels([]);
          setSelectedModel(null);
          message.warning(
            intl.formatMessage({
              id: 'create.model.loadFailed',
              defaultMessage: '加载模型列表失败',
            })
          );
        }
      } catch (error) {
        console.error('获取分镜视频模型失败:', error);
        message.error(
          intl.formatMessage({ id: 'director.shot.videoModelsFailed', defaultMessage: '加载视频模型失败' })
        );
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
  }, [defaultI2vModelCode, intl, isActive]);

  const availableCharacters = useMemo(() => {
    const used = new Set(references.filter((r) => r.characterId).map((r) => r.characterId));
    return characters.filter(
      (c) => isDisplayableImageUrl(c.referenceImageUrl) && !used.has(c.id)
    );
  }, [characters, references]);

  const insertMention = (label: string) => {
    setPrompt((prev) => {
      const textarea = promptRef.current?.resizableTextArea?.textArea as HTMLTextAreaElement | undefined;
      const cursor = textarea?.selectionStart ?? prev.length;
      const mention = detectPromptMention(prev, cursor);
      if (mention) {
        return applyPromptMention(prev, mention, label).value;
      }
      const trimmed = (prev || '').trim();
      const token = `@${label}`;
      return trimmed ? `${trimmed} ${token}` : token;
    });
    promptRef.current?.focus?.();
  };

  const addCharacterReference = (character: DirectorCharacter) => {
    const referenceUrl = character.referenceImageUrl;
    if (!isDisplayableImageUrl(referenceUrl)) {
      message.warning(
        intl.formatMessage({
          id: 'director.shot.videoCharacterNoImage',
          defaultMessage: '该角色尚未上传参考图',
        })
      );
      return;
    }
    setReferences((prev) => [
      ...prev,
      {
        id: `character-${character.id}`,
        kind: 'character' as const,
        label: character.name,
        url: referenceUrl,
        characterId: character.id,
      },
    ]);
  };

  const handleCustomReferenceUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setUploadingRef(true);
    try {
      const uploadFile = file as File;
      const previewUrl = URL.createObjectURL(uploadFile);
      setReferences((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          kind: 'custom_image',
          label: intl.formatMessage(
            { id: 'director.shot.videoCustomRefLabel', defaultMessage: '参考图{index}' },
            { index: prev.length + 1 }
          ),
          url: previewUrl,
          localFile: uploadFile,
        },
      ]);
      onSuccess?.({});
    } catch (e) {
      onError?.(e as Error);
    } finally {
      setUploadingRef(false);
    }
  };

  const removeReference = (id: string) => {
    setReferences((prev) => prev.filter((item) => item.id !== id));
  };

  const resolveRemoteUrl = async (url: string | null, file: File | null) => {
    if (url && isDisplayableImageUrl(url) && !url.startsWith('blob:')) {
      return url;
    }
    if (file) {
      return uploadImageToServer(file);
    }
    if (url?.startsWith('blob:')) {
      throw new Error('invalid blob url');
    }
    return null;
  };

  const pollTaskStatus = async (taskId: string): Promise<string | null> => {
    for (let i = 0; i < 120; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await instance.get(`/productx/sa-ai-models/video/task/${taskId}/status`);
      const result = response.data?.data || response.data;
      const status = result?.status;
      if (status === 'completed' || status === 'success') {
        return result?.videoUrl || result?.video_url || null;
      }
      if (status === 'failed' || status === 'error') {
        throw new Error(result?.error || result?.message || 'failed');
      }
    }
    return null;
  };

  const handleGenerate = async () => {
    if (!shot || !selectedModel) {
      message.warning(
        intl.formatMessage({ id: 'director.shot.videoModelRequired', defaultMessage: '请选择视频模型' })
      );
      return;
    }
    if (!prompt.trim()) {
      message.warning(
        intl.formatMessage({ id: 'director.shot.videoPromptRequired', defaultMessage: '请填写生成描述' })
      );
      return;
    }
    if (contentMode === 'multimodal_reference' && !isSeedance2) {
      message.warning(
        intl.formatMessage({
          id: 'director.shot.videoReferenceNeedsSeedance2',
          defaultMessage: '多资产参考需使用 Seedance 2.0 模型',
        })
      );
      return;
    }

    const duration = Number(form.getFieldValue('duration')) || shot.durationSec || 5;
    const requiredTokens = getVideoRequiredTokens(selectedModel.tokenCost, duration);
    if (!(await ensureSufficientBalance(requiredTokens))) return;
    if (!(await ensureKycForModel(selectedModel))) return;

    setLoading(true);
    setGenerateError(null);
    try {
      let imageUrls: string[] = [];
      const resolvedPrompt = resolvePromptReferenceLabels(prompt, references);
      const videoRefs = splitSeedanceRefLines(videoRefsRaw);
      const audioRefs = splitSeedanceRefLines(audioRefsRaw);

      if (contentMode === 'first_last_frame') {
        if (useStudioFrames) {
          if (!isDisplayableImageUrl(shot.keyframeImageUrl)) {
            message.warning(
              intl.formatMessage({
                id: 'director.shot.videoStartFrameRequired',
                defaultMessage: '首尾帧模式需要首帧图片',
              })
            );
            onGoToVisual?.();
            return;
          }
          imageUrls = [shot.keyframeImageUrl];
          if (isDisplayableImageUrl(shot.endFrameImageUrl)) {
            imageUrls.push(shot.endFrameImageUrl);
          }
        } else {
          const startUrl = await resolveRemoteUrl(startFrameUrl, startFrameFile);
          if (!startUrl) {
            message.warning(
              intl.formatMessage({
                id: 'director.shot.videoStartFrameRequired',
                defaultMessage: '首尾帧模式需要首帧图片',
              })
            );
            return;
          }
          imageUrls = [startUrl];
          if (useEndFrame) {
            const endUrl = await resolveRemoteUrl(endFrameUrl, endFrameFile);
            if (endUrl) imageUrls.push(endUrl);
          }
        }
      } else {
        for (const ref of references) {
          const url = ref.localFile ? await uploadImageToServer(ref.localFile) : ref.url;
          if (url) imageUrls.push(url);
        }
        if (!imageUrls.length && !videoRefs.length) {
          message.warning(
            intl.formatMessage({
              id: 'director.shot.videoReferenceRequired',
              defaultMessage: '请至少添加一张参考图或填写参考视频 URL',
            })
          );
          return;
        }
      }

      const useTextEndpoint = contentMode === 'multimodal_reference' && imageUrls.length === 0;
      const requestData: Record<string, unknown> = {
        prompt: resolvedPrompt,
        modelCode: selectedModel.modelCode,
        aspectRatio,
        seconds: duration,
        seedanceRatio: aspectRatio,
        seedanceResolution: form.getFieldValue('seedanceResolution') || '720p',
        seedanceGenerateAudio: form.getFieldValue('seedanceGenerateAudio') === true,
        seedanceWatermark: form.getFieldValue('seedanceWatermark') === true,
        seedanceContentMode: contentMode,
      };

      if (!useTextEndpoint) {
        requestData.imageUrls = imageUrls;
      }
      if (videoRefs.length) requestData.seedanceVideoReferenceUrls = videoRefs;
      if (audioRefs.length) requestData.seedanceAudioReferenceUrls = audioRefs;

      const endpoint = useTextEndpoint
        ? '/productx/sa-ai-models/video/generate/text'
        : '/productx/sa-ai-models/video/generate/image';

      const response = await instance.post(endpoint, requestData, {
        timeout: 0,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'generate failed');
      }

      const result = response.data.data;
      const taskId = result?.id ? String(result.id) : '';
      let videoUrl = result?.videoUrl as string | undefined;

      if (!videoUrl && taskId && (result?.status === 'queued' || result?.status === 'processing')) {
        message.info(
          intl.formatMessage({ id: 'director.shot.videoQueued', defaultMessage: '视频任务已提交，生成中…' })
        );
        videoUrl = (await pollTaskStatus(taskId)) || undefined;
      }

      const genTaskId = Number(taskId);
      const updateRes = await directorApi.updateShot(shot.id, {
        genTaskId: Number.isFinite(genTaskId) ? genTaskId : null,
        status: videoUrl ? 'approved' : 'generating',
      });
      if (!updateRes.success) {
        message.error(updateRes.message);
        return;
      }
      if (videoUrl && Number.isFinite(genTaskId)) {
        await directorApi.syncShotTask(shot.id);
      }

      onApplied();
      if (videoUrl) {
        setGenerateError(null);
        message.success(
          intl.formatMessage({ id: 'director.shot.videoApplied', defaultMessage: '分镜视频已生成' })
        );
        if (!embedded) onClose?.();
      }
    } catch (error: unknown) {
      const messageText = extractVideoGenerateError(error, (descriptor) =>
        intl.formatMessage(descriptor)
      );
      if (!(await tryShowFromApiError(messageText, error))) {
        setGenerateError(messageText);
      }
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form form={form} layout="vertical">

      <Section>
            <SectionTitle>
              <FormattedMessage id="director.shot.videoMode" defaultMessage="生成模式" />
            </SectionTitle>
            <Segmented
              block
              value={contentMode}
              onChange={(value) => setContentMode(value as ShotVideoContentMode)}
              options={[
                {
                  label: intl.formatMessage({
                    id: 'director.shot.videoModeFrames',
                    defaultMessage: '首尾帧',
                  }),
                  value: 'first_last_frame',
                },
                {
                  label: intl.formatMessage({
                    id: 'director.shot.videoModeReference',
                    defaultMessage: '多资产参考',
                  }),
                  value: 'multimodal_reference',
                },
              ]}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
              {contentMode === 'first_last_frame' ? (
                <FormattedMessage
                  id="director.shot.videoModeFramesHint"
                  defaultMessage="锁定片头片尾画面，适合已有分镜首尾帧的出片流程"
                />
              ) : (
                <FormattedMessage
                  id="director.shot.videoModeReferenceHint"
                  defaultMessage="引用角色/参考图/音视频，在描述中用 @名称 或 图片1 关联素材（需 Seedance 2.0）"
                />
              )}
            </Text>
          </Section>

          {contentMode === 'first_last_frame' ? (
            <Section>
              <SectionTitle>
                {useStudioFrames ? (
                  <FormattedMessage id="director.shot.video.useStudioFrames" defaultMessage="使用「画面」标签中的首尾帧" />
                ) : (
                  <FormattedMessage id="director.shot.section.frames" defaultMessage="首尾帧" />
                )}
              </SectionTitle>
              <FrameGrid>
                <div>
                  <Text style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    <FormattedMessage id="director.shot.startFrame" defaultMessage="首帧" />
                  </Text>
                  <FrameBox $aspectRatio={cssAspectRatio(aspectRatio)}>
                    {(useStudioFrames ? isDisplayableImageUrl(shot?.keyframeImageUrl) : startFrameUrl) ? (
                      <Image
                        src={normalizeUrl(useStudioFrames ? shot!.keyframeImageUrl! : startFrameUrl!)}
                        alt="start"
                        preview
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <PictureOutlined style={{ fontSize: 24, color: 'rgba(0,0,0,0.25)' }} />
                    )}
                  </FrameBox>
                  {!useStudioFrames ? (
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        setStartFrameFile(file);
                        setStartFrameUrl(URL.createObjectURL(file));
                        return false;
                      }}
                    >
                      <Button size="small" icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                        <FormattedMessage id="director.shot.uploadStartFrame" defaultMessage="上传首帧" />
                      </Button>
                    </Upload>
                  ) : null}
                </div>
                <div>
                  {!useStudioFrames ? (
                    <Space style={{ marginBottom: 6 }}>
                      <Text style={{ fontSize: 12 }}>
                        <FormattedMessage id="director.shot.endFrame" defaultMessage="尾帧" />
                      </Text>
                      <Switch size="small" checked={useEndFrame} onChange={setUseEndFrame} />
                    </Space>
                  ) : (
                    <Text style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                      <FormattedMessage id="director.shot.endFrame" defaultMessage="尾帧" />
                    </Text>
                  )}
                  <FrameBox $aspectRatio={cssAspectRatio(aspectRatio)}>
                    {(useStudioFrames
                      ? isDisplayableImageUrl(shot?.endFrameImageUrl)
                      : useEndFrame && endFrameUrl) ? (
                      <Image
                        src={normalizeUrl(
                          useStudioFrames ? shot!.endFrameImageUrl! : endFrameUrl!
                        )}
                        alt="end"
                        preview
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <FormattedMessage id="director.shot.endFrameEmpty" defaultMessage="可选，用于约束结束画面" />
                      </Text>
                    )}
                  </FrameBox>
                  {!useStudioFrames && useEndFrame ? (
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        setEndFrameFile(file);
                        setEndFrameUrl(URL.createObjectURL(file));
                        return false;
                      }}
                    >
                      <Button size="small" icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                        <FormattedMessage id="director.shot.uploadEndFrame" defaultMessage="上传尾帧" />
                      </Button>
                    </Upload>
                  ) : null}
                </div>
              </FrameGrid>
              {useStudioFrames && !isDisplayableImageUrl(shot?.keyframeImageUrl) && onGoToVisual ? (
                <Button size="small" type="link" onClick={onGoToVisual} style={{ paddingLeft: 0, marginTop: 8 }}>
                  <FormattedMessage id="director.shot.video.goVisual" defaultMessage="前往「画面」生成或上传首帧" />
                </Button>
              ) : null}
            </Section>
          ) : (
            <Section>
              <SectionTitle>
                <FormattedMessage id="director.shot.videoReferences" defaultMessage="参考资产" />
              </SectionTitle>
              {!isSeedance2 ? (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 10 }}
                  message={intl.formatMessage({
                    id: 'director.shot.videoReferenceNeedsSeedance2',
                    defaultMessage: '多资产参考需使用 Seedance 2.0 模型',
                  })}
                />
              ) : null}
              {availableCharacters.length > 0 ? (
                <div style={{ marginBottom: 10 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    <FormattedMessage id="director.shot.videoAddCharacter" defaultMessage="从角色库添加" />
                  </Text>
                  <Space wrap>
                    {availableCharacters.map((c) => (
                      <Tag
                        key={c.id}
                        icon={<UserOutlined />}
                        style={{ cursor: 'pointer', padding: '4px 8px' }}
                        onClick={() => addCharacterReference(c)}
                      >
                        {c.name}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ) : null}
              <Space style={{ marginBottom: 10 }}>
                <Upload accept="image/*" showUploadList={false} customRequest={handleCustomReferenceUpload}>
                  <Button size="small" icon={<PlusOutlined />} loading={uploadingRef}>
                    <FormattedMessage id="director.shot.videoAddImage" defaultMessage="上传参考图" />
                  </Button>
                </Upload>
              </Space>
              <RefList>
                {references.map((ref, index) => (
                  <RefItem key={ref.id}>
                    <Avatar shape="square" size={40} src={normalizeUrl(ref.url)} icon={<PictureOutlined />} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 12 }}>
                        {ref.label}
                      </Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          图片{index + 1}
                          {ref.kind === 'character' ? ' · 角色' : ' · 自定义'}
                        </Text>
                      </div>
                    </div>
                    <Button size="small" onClick={() => insertMention(ref.label)}>
                      @
                    </Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeReference(ref.id)} />
                  </RefItem>
                ))}
              </RefList>
              <Row gutter={12} style={{ marginTop: 12 }}>
                <Col span={12}>
                  <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    <FormattedMessage id="create.seedance2.videoRefs" defaultMessage="参考视频 URL" />
                  </Text>
                  <TextArea
                    rows={2}
                    value={videoRefsRaw}
                    onChange={(e) => setVideoRefsRaw(e.target.value)}
                    placeholder={intl.formatMessage({
                      id: 'create.seedance2.videoRefs.placeholder',
                      defaultMessage: '每行一个可访问的视频 URL，可选',
                    })}
                  />
                </Col>
                <Col span={12}>
                  <Text style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    <FormattedMessage id="create.seedance2.audioRefs" defaultMessage="参考音频 URL" />
                  </Text>
                  <TextArea
                    rows={2}
                    value={audioRefsRaw}
                    onChange={(e) => setAudioRefsRaw(e.target.value)}
                    placeholder={intl.formatMessage({
                      id: 'create.seedance2.audioRefs.placeholder',
                      defaultMessage: '每行一个可访问的音频 URL，可选',
                    })}
                  />
                </Col>
              </Row>
            </Section>
          )}

          <Section>
            <SectionTitle>
              <FormattedMessage id="director.shot.videoPrompt" defaultMessage="生成描述" />
            </SectionTitle>
            <PromptMentionTextArea
              ref={promptRef}
              rows={embedded ? 3 : 4}
              value={prompt}
              onChange={setPrompt}
              references={references}
              availableCharacters={availableCharacters}
              onAddCharacter={addCharacterReference}
              mentionEnabled={contentMode === 'multimodal_reference'}
              placeholder={intl.formatMessage({
                id: 'director.shot.videoPromptPlaceholder',
                defaultMessage: '描述画面与运镜；多资产模式下可用 @角色名 引用参考图',
              })}
            />
          </Section>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={intl.formatMessage({ id: 'director.shot.videoModel', defaultMessage: '视频模型' })}
              >
                <Select
                  loading={modelsLoading}
                  value={selectedModel?.id}
                  options={seedanceModels.map((m) => ({
                    value: m.id,
                    label: m.modelName || m.modelCode,
                  }))}
                  onChange={(id) => {
                    const model = seedanceModels.find((m) => m.id === id) || null;
                    setSelectedModel(model);
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item
                name="duration"
                label={intl.formatMessage({ id: 'director.shot.duration', defaultMessage: '时长(秒)' })}
              >
                <InputNumber min={4} max={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Item
                name="seedanceResolution"
                label={intl.formatMessage({ id: 'create.seedance2.resolution', defaultMessage: '输出分辨率' })}
              >
                <Select
                  options={[
                    { value: '480p', label: '480p' },
                    { value: '720p', label: '720p' },
                    { value: '1080p', label: '1080p' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="seedanceGenerateAudio"
                label={intl.formatMessage({ id: 'create.seedance2.generateAudio', defaultMessage: '生成原生音轨' })}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="seedanceWatermark"
                label={intl.formatMessage({ id: 'create.seedance.watermark', defaultMessage: '添加水印' })}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            block
            size="large"
            icon={<ThunderboltOutlined />}
            loading={loading}
            onClick={handleGenerate}
          >
            <FormattedMessage id="director.shot.videoGenerateSubmit" defaultMessage="开始生成视频" />
          </Button>
          {generateError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginTop: 12 }}
              message={intl.formatMessage({
                id: 'director.shot.videoGenerateFailedTitle',
                defaultMessage: '生成失败',
              })}
              description={generateError}
            />
          ) : null}
        </Form>
  );

  if (embedded) {
    return (
      <>
        {formContent}
        <InsufficientBalanceModal
          open={insufficientBalanceOpen}
          requiredTokens={insufficientBalanceRequired}
          tokenBalance={insufficientBalanceModalBalance}
          onCancel={closeInsufficientBalanceModal}
        />
      </>
    );
  }

  return (
    <>
      <Modal
        title={
          <div>
            <div>
              <FormattedMessage id="director.shot.videoGenerateTitle" defaultMessage="分镜生视频" />
              {shot?.shotNo ? ` · ${shot.shotNo}` : ''}
            </div>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
              <FormattedMessage
                id="director.shot.videoGenerateHint"
                defaultMessage="支持首尾帧锁定或多资产参考，提交后关联到本镜"
              />
            </Text>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        width={960}
        destroyOnClose
        zIndex={2000}
        styles={{ body: { paddingTop: 12 } }}
      >
        {formContent}
      </Modal>

      <InsufficientBalanceModal
        open={insufficientBalanceOpen}
        requiredTokens={insufficientBalanceRequired}
        tokenBalance={insufficientBalanceModalBalance}
        onCancel={closeInsufficientBalanceModal}
      />
    </>
  );
};

export default ShotVideoGenerateModal;
