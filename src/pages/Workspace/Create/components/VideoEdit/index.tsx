import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Col,
  Empty,
  Form,
  Row,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import instance from 'api/axios';
import {
  GlobalSelectStyles,
  ResultArea,
  StyledCard,
  VideoPlaceholder,
  ActionOverlay,
  AspectRatioOption,
} from '../ImageToVideo/styles';
import type { Model, VideoResult, GenerationTask, GenerationTaskPageResponse } from '../ImageToVideo/types';
import { getAspectRatioOption } from '../ImageToVideo/utils';
import VideoModelSelectField from '../ImageToVideo/VideoModelSelectField';
import VideoModelSelectionModal from '../ImageToVideo/VideoModelSelectionModal';
import HistorySection from '../ImageToVideo/HistorySection';
import TaskDetailModal from '../ImageToVideo/TaskDetailModal';
import AspectRatioIcon from '../shared/AspectRatioIcon';
import EstimatedPriceHint from '../shared/EstimatedPriceHint';
import { useTokenBalance } from '../shared/useTokenBalance';
import { getVideoRequiredTokens } from '../shared/balanceUtils';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import { handleGenerationApiFailure } from '../shared/generationErrorUtils';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import PromptTranslateEnSwitch from '../shared/PromptTranslateEnSwitch';
import { appendTranslatePromptFlag } from '../shared/promptTranslateUtils';
import { formatTokenAmount } from '../shared/estimatedPriceText';
import {
  DOUBAO_SEEDANCE_2_0_260128,
  DOUBAO_SEEDANCE_2_0_FAST_260128,
  isSeedance2ModelCode,
  MediaAsset,
} from './constants';
import CapabilityGuide from './CapabilityGuide';
import MediaUploadPanel from './MediaUploadPanel';
import PromptAssetMentions from './PromptAssetMentions';
import { uploadFileToCos } from './uploadToCos';

const { Title, Text } = Typography;

const Page = styled.div<{ $embedded?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: auto;
  min-height: ${(p) => (p.$embedded ? 0 : 'auto')};
  /* 禁止设 overflow-x:hidden（会连带把 overflow-y 变成 auto，叠出双滚动条） */
  box-sizing: border-box;

  .ant-row {
    max-width: 100%;
  }

  .ant-col {
    min-width: 0;
    max-width: 100%;
  }

  /* 移动端收紧卡片内边距，避免 gutter 负边距撑出横向滚动 */
  @media (max-width: 768px) {
    gap: 12px;

    .ant-card-body {
      padding: 16px 12px !important;
    }

    ${ResultArea} {
      min-height: 240px;
      padding: 12px;
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
  max-width: 100%;
`;

const FormLayout = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
`;

const ASPECT_OPTIONS = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'];
const DURATION_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const RESOLUTION_OPTIONS = ['480p', '720p', '1080p'];

async function ensureRemoteUrls(assets: MediaAsset[]): Promise<string[]> {
  const urls: string[] = [];
  for (const asset of assets) {
    if (asset.remoteUrl) {
      urls.push(asset.remoteUrl);
      continue;
    }
    const url = await uploadFileToCos(asset.file);
    asset.remoteUrl = url;
    urls.push(url);
  }
  return urls;
}

const VideoEdit: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { tokenBalance, balanceLoading } = useTokenBalance();
  const {
    insufficientBalanceOpen,
    insufficientBalanceRequired,
    insufficientBalanceModalBalance,
    closeInsufficientBalanceModal,
    ensureSufficientBalance,
    ensureKycForModel,
    tryShowFromApiError,
  } = useInsufficientBalanceGuard();

  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelModalOpen, setModelModalOpen] = useState(false);

  const [videos, setVideos] = useState<MediaAsset[]>([]);
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [audios, setAudios] = useState<MediaAsset[]>([]);

  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);

  const [historyTasks, setHistoryTasks] = useState<GenerationTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserSubmitRef = useRef(false);
  const historyPaginationRef = useRef(historyPagination);
  historyPaginationRef.current = historyPagination;

  const clearPoll = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const [i2vRes, t2vRes] = await Promise.all([
          instance.get('/productx/sa-ai-models/enabled/by-type', { params: { modelType: 'i2v' } }),
          instance.get('/productx/sa-ai-models/enabled/by-type', { params: { modelType: 't2v' } }),
        ]);
        const merged: Model[] = [];
        const seen = new Set<string>();
        const pushList = (list: Model[] | undefined) => {
          (list || []).forEach((m) => {
            if (!isSeedance2ModelCode(m.modelCode)) return;
            if (seen.has(m.modelCode)) return;
            seen.add(m.modelCode);
            merged.push(m);
          });
        };
        pushList(i2vRes.data?.data);
        pushList(t2vRes.data?.data);
        merged.sort((a, b) => {
          if (a.modelCode === DOUBAO_SEEDANCE_2_0_260128) return -1;
          if (b.modelCode === DOUBAO_SEEDANCE_2_0_260128) return 1;
          return 0;
        });
        setModels(merged);
        if (merged.length > 0) {
          setSelectedModel(merged[0]);
          form.setFieldsValue({ modelId: merged[0].id });
        }
      } catch (e) {
        console.error(e);
        message.error(
          intl.formatMessage({ id: 'create.model.load.error', defaultMessage: '加载模型失败' })
        );
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
    return () => {
      clearPoll();
      abortControllerRef.current?.abort();
    };
  }, [intl]);

  useEffect(() => {
    form.setFieldsValue({
      aspectRatio: '16:9',
      duration: 8,
      seedanceResolution: '720p',
      seedanceGenerateAudio: true,
      seedanceWatermark: false,
      translatePromptToEnglish: false,
    });
  }, [form]);

  const fetchHistoryTasks = useCallback(async (page: number = 1, pageSize: number = 10) => {
    setHistoryLoading(true);
    try {
      const response = await instance.get<{
        success: boolean;
        data: GenerationTaskPageResponse;
      }>('/productx/sa-ai-gen-task/my-tasks/page', {
        params: {
          currentPage: page,
          pageSize,
          taskType: 'i2v',
        },
      });

      if (response.data.success && response.data.data) {
        setHistoryTasks(response.data.data.records);
        setHistoryPagination({
          current: response.data.data.current,
          pageSize: response.data.data.size,
          total: response.data.data.total,
        });
      }
    } catch (error) {
      console.error('获取生成记录失败:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryTasks(1, 10);
  }, [fetchHistoryTasks]);

  useEffect(() => {
    if (generatedVideo && !loading) {
      const timer = setTimeout(() => {
        const { current, pageSize } = historyPaginationRef.current;
        fetchHistoryTasks(current, pageSize);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [generatedVideo, loading, fetchHistoryTasks]);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return intl.formatMessage({ id: 'create.history.status.processing', defaultMessage: '处理中' });
      case 2:
        return intl.formatMessage({ id: 'create.history.status.success', defaultMessage: '成功' });
      case 3:
      case 4:
        return intl.formatMessage({ id: 'create.history.status.failed', defaultMessage: '失败' });
      default:
        return intl.formatMessage({ id: 'create.history.status.unknown', defaultMessage: '未知' });
    }
  };

  const handleHistoryPageChange = (page: number, pageSize: number) => {
    fetchHistoryTasks(page, pageSize);
  };

  const handleShowTaskDetail = (taskId: number) => {
    setSelectedTaskId(taskId);
    setTaskDetailModalVisible(true);
  };

  const handleCloseTaskDetail = () => {
    setTaskDetailModalVisible(false);
    setSelectedTaskId(null);
  };

  const isFastModel = selectedModel?.modelCode === DOUBAO_SEEDANCE_2_0_FAST_260128;
  const resolutionOptions = useMemo(
    () =>
      RESOLUTION_OPTIONS.filter((r) => !(isFastModel && r === '1080p')).map((value) => ({
        value,
        label: value,
      })),
    [isFastModel]
  );

  const estimatedDuration = Form.useWatch('duration', form) || 8;

  const pollTaskStatus = useCallback(
    async (taskId: string, aspectRatio: string, duration: number) => {
      try {
        const response = await instance.get(`/productx/sa-ai-models/video/task/${taskId}/status`);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'status failed');
        }
        const result = response.data.data;
        const status = (result.status || '').toLowerCase();

        if (status === 'completed' || status === 'success') {
          clearPoll();
          setLoading(false);
          if (result.videoUrl) {
            setGeneratedVideo({
              url: result.videoUrl,
              aspectRatio,
              duration,
              thumbnail: result.thumbnail || result.thumbnailUrl || '',
            });
            message.success(
              intl.formatMessage({
                id: 'create.video.generate.success',
                defaultMessage: '视频生成成功',
              })
            );
          }
          return;
        }
        if (status === 'failed' || status === 'error') {
          clearPoll();
          setLoading(false);
          message.error(
            result.error ||
              intl.formatMessage({
                id: 'create.video.generate.failed',
                defaultMessage: '视频生成失败',
              })
          );
          return;
        }
        pollTimerRef.current = setTimeout(() => pollTaskStatus(taskId, aspectRatio, duration), 4000);
      } catch (error: any) {
        clearPoll();
        setLoading(false);
        message.error(
          error?.response?.data?.message ||
            intl.formatMessage({
              id: 'create.video.generate.failed',
              defaultMessage: '视频生成失败',
            })
        );
      }
    },
    [intl]
  );

  const handleApplyExample = (prompt: string) => {
    form.setFieldsValue({ prompt });
    message.success(
      intl.formatMessage({
        id: 'create.videoEdit.guide.applied',
        defaultMessage: '已填入示例提示词',
      })
    );
  };

  const handleGenerate = async (values: any) => {
    if (!isUserSubmitRef.current) return;
    isUserSubmitRef.current = false;

    if (loading) return;
    if (!selectedModel) {
      message.warning(
        intl.formatMessage({
          id: 'create.model.select.placeholder',
          defaultMessage: '请选择要使用的视频生成模型',
        })
      );
      return;
    }
    if (videos.length < 1) {
      message.warning(
        intl.formatMessage({
          id: 'create.videoEdit.video.required',
          defaultMessage: '请至少上传一段参考视频',
        })
      );
      return;
    }
    if (!values.prompt?.trim()) {
      message.warning(
        intl.formatMessage({
          id: 'create.prompt.required',
          defaultMessage: '请输入提示词',
        })
      );
      return;
    }

    const duration = Number(values.duration) || 8;
    const requiredTokens = getVideoRequiredTokens(selectedModel.tokenCost, duration);
    if (!(await ensureSufficientBalance(requiredTokens))) return;
    if (!(await ensureKycForModel(selectedModel))) return;

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setGeneratedVideo(null);
    clearPoll();

    const uploading = message.loading(
      intl.formatMessage({
        id: 'create.videoEdit.uploading',
        defaultMessage: '正在上传素材到云端...',
      }),
      0
    );

    try {
      const [videoUrls, imageUrls, audioUrls] = await Promise.all([
        ensureRemoteUrls(videos),
        ensureRemoteUrls(images),
        ensureRemoteUrls(audios),
      ]);
      uploading();

      const requestData: any = appendTranslatePromptFlag(
        {
          prompt: values.prompt.trim(),
          modelCode: selectedModel.modelCode,
          imageUrls: imageUrls.length ? imageUrls : [],
          seedanceVideoReferenceUrls: videoUrls,
          seedanceAudioReferenceUrls: audioUrls.length ? audioUrls : undefined,
          seedanceContentMode: 'multimodal_reference',
          seconds: duration,
          aspectRatio: values.aspectRatio || '16:9',
          seedanceRatio: values.aspectRatio || '16:9',
          seedanceResolution: values.seedanceResolution || '720p',
          seedanceGenerateAudio: values.seedanceGenerateAudio === true,
          seedanceWatermark: values.seedanceWatermark === true,
        },
        values
      );

      const response = await instance.post(
        '/productx/sa-ai-models/video/generate/image',
        requestData,
        { timeout: 0, signal: abortController.signal }
      );

      if (abortController.signal.aborted) return;

      if (response.data?.success) {
        const result = response.data.data;
        const status = (result.status || '').toLowerCase();
        const aspectRatio = values.aspectRatio || '16:9';

        if ((status === 'queued' || status === 'processing') && result.id) {
          message.success(
            intl.formatMessage({
              id: 'create.video.generate.queued',
              defaultMessage: '视频生成任务已提交，正在排队中...',
            })
          );
          pollTaskStatus(String(result.id), aspectRatio, duration);
          return;
        }
        if ((status === 'completed' || status === 'success') && result.videoUrl) {
          setGeneratedVideo({
            url: result.videoUrl,
            aspectRatio,
            duration,
            thumbnail: result.thumbnail || '',
          });
          setLoading(false);
          message.success(
            intl.formatMessage({
              id: 'create.video.generate.success',
              defaultMessage: '视频生成成功',
            })
          );
          return;
        }
        if (status === 'failed' || status === 'error') {
          setLoading(false);
          message.error(
            result.error ||
              intl.formatMessage({
                id: 'create.video.generate.failed',
                defaultMessage: '视频生成失败',
              })
          );
          return;
        }
        if (result.id) {
          pollTaskStatus(String(result.id), aspectRatio, duration);
          return;
        }
        setLoading(false);
      } else {
        setLoading(false);
        handleGenerationApiFailure(response.data, tryShowFromApiError, {
          fallbackMessage: intl.formatMessage({
            id: 'create.video.generate.failed',
            defaultMessage: '视频生成失败',
          }),
        });
      }
    } catch (error: any) {
      uploading();
      if (abortController.signal.aborted) return;
      setLoading(false);
      const handled = await handleGenerationApiFailure(error?.response?.data, tryShowFromApiError, {
        error,
        fallbackMessage: intl.formatMessage({
          id: 'create.video.generate.failed',
          defaultMessage: '视频生成失败',
        }),
      });
      if (!handled) {
        message.error(
          error?.response?.data?.message ||
            intl.formatMessage({
              id: 'create.video.generate.failed',
              defaultMessage: '视频生成失败',
            })
        );
      }
    }
  };

  return (
    <Page $embedded={embedded}>
      <GlobalSelectStyles />
      {!embedded && (
        <Header>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              <Space>
                <ScissorOutlined />
                <FormattedMessage id="create.videoEdit.title" defaultMessage="视频剪辑" />
              </Space>
            </Title>
            <Text type="secondary">
              <FormattedMessage
                id="create.videoEdit.subtitle"
                defaultMessage="多模态参考、视频编辑与延长，Seedance 2 统一创作"
              />
            </Text>
          </div>
        </Header>
      )}

      <CapabilityGuide onApplyExample={handleApplyExample} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <StyledCard>
            <Spin spinning={modelsLoading}>
              <FormLayout>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleGenerate}
                onFinishFailed={() => {
                  isUserSubmitRef.current = false;
                }}
              >
                <VideoModelSelectField
                  selectedModel={selectedModel}
                  modelsLoading={modelsLoading}
                  onOpenModal={() => setModelModalOpen(true)}
                  marginBottom={16}
                />

                <MediaUploadPanel
                  videos={videos}
                  images={images}
                  audios={audios}
                  onVideosChange={setVideos}
                  onImagesChange={setImages}
                  onAudiosChange={setAudios}
                />

                <Form.Item
                  name="prompt"
                  label={
                    <Space>
                      <VideoCameraOutlined style={{ color: '#13c2c2' }} />
                      <FormattedMessage id="create.prompt.label" defaultMessage="提示词" />
                      <PromptTranslateEnSwitch />
                    </Space>
                  }
                  rules={[
                    {
                      required: true,
                      message: intl.formatMessage({
                        id: 'create.prompt.required',
                        defaultMessage: '请输入提示词',
                      }),
                    },
                  ]}
                  extra={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <FormattedMessage
                        id="create.videoEdit.prompt.hint"
                        defaultMessage="用 @视频1、@图像1、@音频1 引用上方素材顺序"
                      />
                    </Text>
                  }
                >
                  <PromptAssetMentions
                    videos={videos}
                    images={images}
                    audios={audios}
                    placeholder={intl.formatMessage({
                      id: 'create.videoEdit.prompt.placeholder',
                      defaultMessage: '描述如何参考 / 编辑 / 延长你上传的视频…输入 @ 可快速选择素材',
                    })}
                  />
                </Form.Item>

                <Row gutter={[12, 0]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="aspectRatio"
                      label={
                        <FormattedMessage id="create.video.aspectRatio" defaultMessage="画面比例" />
                      }
                    >
                      <Select
                        optionLabelProp="label"
                        placeholder={intl.formatMessage({
                          id: 'create.video.ratio.placeholder',
                          defaultMessage: '请选择视频比例',
                        })}
                      >
                        {ASPECT_OPTIONS.map((ratio) => {
                          const opt = getAspectRatioOption(ratio, intl);
                          const labelText = opt.label || ratio;
                          const icon = <AspectRatioIcon ratio={ratio} size={16} />;
                          return (
                            <Select.Option
                              key={ratio}
                              value={ratio}
                              label={
                                <AspectRatioOption>
                                  {icon}
                                  <span>{labelText}</span>
                                </AspectRatioOption>
                              }
                            >
                              <AspectRatioOption>
                                {icon}
                                <span>{labelText}</span>
                              </AspectRatioOption>
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="duration"
                      label={
                        <Space>
                          <ClockCircleOutlined />
                          <FormattedMessage id="create.video.duration" defaultMessage="时长（秒）" />
                        </Space>
                      }
                    >
                      <Select
                        options={DURATION_OPTIONS.map((v) => ({ value: v, label: `${v}s` }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="seedanceResolution"
                      label={
                        <FormattedMessage
                          id="create.seedance2.resolution"
                          defaultMessage="分辨率"
                        />
                      }
                    >
                      <Select options={resolutionOptions} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[12, 0]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="seedanceGenerateAudio"
                      label={
                        <FormattedMessage
                          id="create.seedance2.generateAudio"
                          defaultMessage="生成原生音轨"
                        />
                      }
                    >
                      <Select
                        options={[
                          {
                            value: true,
                            label: intl.formatMessage({
                              id: 'create.seedance2.option.yes',
                              defaultMessage: '是',
                            }),
                          },
                          {
                            value: false,
                            label: intl.formatMessage({
                              id: 'create.seedance2.option.no',
                              defaultMessage: '否',
                            }),
                          },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="seedanceWatermark"
                      label={
                        <Space>
                          <InfoCircleOutlined />
                          <FormattedMessage
                            id="create.seedance2.watermark"
                            defaultMessage="添加水印"
                          />
                        </Space>
                      }
                    >
                      <Select
                        options={[
                          {
                            value: false,
                            label: intl.formatMessage({
                              id: 'create.seedance2.option.no',
                              defaultMessage: '否',
                            }),
                          },
                          {
                            value: true,
                            label: intl.formatMessage({
                              id: 'create.seedance2.option.yes',
                              defaultMessage: '是',
                            }),
                          },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <EstimatedPriceHint
                  price={
                    selectedModel?.tokenCost != null && selectedModel.tokenCost > 0
                      ? formatTokenAmount(
                          getVideoRequiredTokens(selectedModel.tokenCost, estimatedDuration)
                        )
                      : null
                  }
                  tokenBalance={tokenBalance}
                  balanceLoading={balanceLoading}
                />

                <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    icon={<ThunderboltOutlined />}
                    style={{ height: 48, fontSize: 16, borderRadius: 24 }}
                    onClick={() => {
                      isUserSubmitRef.current = true;
                    }}
                  >
                    <FormattedMessage id="create.videoEdit.generate" defaultMessage="开始生成" />
                  </Button>
                </Form.Item>
              </Form>
              </FormLayout>
            </Spin>
          </StyledCard>
        </Col>

        <Col xs={24} lg={10}>
          <StyledCard
            title={
              <FormattedMessage id="create.video.result" defaultMessage="生成结果" />
            }
          >
            <ResultArea>
              {loading && (
                <VideoPlaceholder>
                  <Spin size="large" />
                  <Text type="secondary" style={{ marginTop: 12 }}>
                    <FormattedMessage
                      id="create.video.generating"
                      defaultMessage="视频生成中，请稍候…"
                    />
                  </Text>
                </VideoPlaceholder>
              )}
              {!loading && generatedVideo?.url && (
                <div style={{ position: 'relative' }}>
                  <video
                    src={generatedVideo.url}
                    controls
                    style={{ width: '100%', borderRadius: 12, background: '#000' }}
                  />
                  <ActionOverlay>
                    <Tooltip
                      title={intl.formatMessage({
                        id: 'common.download',
                        defaultMessage: '下载',
                      })}
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<DownloadOutlined />}
                        href={generatedVideo.url}
                        target="_blank"
                        rel="noreferrer"
                      />
                    </Tooltip>
                    <Button
                      shape="circle"
                      icon={<PlayCircleOutlined />}
                      onClick={() => window.open(generatedVideo.url, '_blank')}
                    />
                  </ActionOverlay>
                </div>
              )}
              {!loading && !generatedVideo && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <FormattedMessage
                      id="create.videoEdit.result.empty"
                      defaultMessage="上传参考视频并提交后，结果将显示在这里"
                    />
                  }
                />
              )}
            </ResultArea>
          </StyledCard>
        </Col>
      </Row>

      <HistorySection
        historyTasks={historyTasks}
        historyLoading={historyLoading}
        historyPagination={historyPagination}
        onRefresh={() => fetchHistoryTasks(historyPagination.current, historyPagination.pageSize)}
        onPageChange={handleHistoryPageChange}
        onTaskClick={handleShowTaskDetail}
        getStatusText={getStatusText}
      />

      <VideoModelSelectionModal
        open={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        type="family"
        title={intl.formatMessage({
          id: 'create.model.select',
          defaultMessage: '选择模型',
        })}
        models={models}
        selectedModel={selectedModel}
        onSelect={(model) => {
          const m = model as Model;
          setSelectedModel(m);
          form.setFieldsValue({ modelId: m.id });
          setModelModalOpen(false);
          if (m.modelCode === DOUBAO_SEEDANCE_2_0_FAST_260128) {
            const res = form.getFieldValue('seedanceResolution');
            if (res === '1080p') {
              form.setFieldsValue({ seedanceResolution: '720p' });
            }
          }
        }}
        loading={modelsLoading}
      />

      <TaskDetailModal
        open={taskDetailModalVisible}
        onClose={handleCloseTaskDetail}
        taskId={selectedTaskId}
      />

      <InsufficientBalanceModal
        open={insufficientBalanceOpen}
        onCancel={closeInsufficientBalanceModal}
        requiredTokens={insufficientBalanceRequired}
        tokenBalance={insufficientBalanceModalBalance}
      />
    </Page>
  );
};

export default VideoEdit;
