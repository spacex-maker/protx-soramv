import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Typography,
  Input,
  Button,
  Select,
  Form,
  message,
  Spin,
  Alert,
  Tag,
} from 'antd';
import {
  ThunderboltOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import instance from 'api/axios';
import EstimatedPriceHint from '../shared/EstimatedPriceHint';
import {
  calcSpeechTokenCost,
  countSpeechCharacters,
  getSpeechEstimatedPrice,
} from '../shared/speechTokenUtils';
import { useTokenBalance } from '../shared/useTokenBalance';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import AudioResultPanel from './AudioResultPanel';
import SpeechHistorySection, { SpeechHistoryTask } from './SpeechHistorySection';
import VoiceSelectModal from './VoiceSelectModal';
import VoiceDetailModal from './VoiceDetailModal';
import AdvancedSettingsModal from './AdvancedSettingsModal';
import { getSpeechTextHint } from './speechTextHint';
import {
  SPEECH_TONE_KEYS,
  SpeechToneKey,
  resolveSpeechContextInstruction,
} from './speechEmotionPresets';
import {
  GlobalSpeechStyles,
  PageWrap,
  TitleSection,
  MainGrid,
  FormColumn,
  ResultColumn,
  StyledCard,
  EngineSelectWrap,
  TextAreaWrap,
  GenerateButton,
  SelectorTrigger,
  SettingsTrigger,
} from './styles';
import EngineSelectField from './EngineSelectField';
import EngineSelectionModal from './EngineSelectionModal';
import EngineDetailModal from './EngineDetailModal';
import { EngineModel } from './engineTypes';
import { getEngineDescription } from './engineUtils';
import { VoiceModel } from './voiceTypes';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface GenerationTask {
  id: number;
  prompt?: string;
  status: number;
  resultUrls?: string[];
  createTime?: string;
  modelName?: string;
  voiceCode?: string;
  voiceName?: string;
  voiceNameEn?: string;
}

const normalizeResultUrls = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === 'string' && !!item);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string' && !!item);
        }
      } catch {
        return [];
      }
    }
    if (trimmed.startsWith('http')) {
      return [trimmed];
    }
  }
  return [];
};

const normalizeHistoryTask = (task: Omit<GenerationTask, 'resultUrls'> & { resultUrls?: unknown }): GenerationTask => ({
  ...task,
  resultUrls: normalizeResultUrls(task.resultUrls),
});

const SpeechGeneration: React.FC = () => {
  const intl = useIntl();
  const { locale } = useLocale();
  const { tokenBalance, balanceLoading } = useTokenBalance();
  const {
    insufficientBalanceOpen,
    insufficientBalanceRequired,
    insufficientBalanceModalBalance,
    closeInsufficientBalanceModal,
    ensureSufficientBalance,
    tryShowFromApiError,
  } = useInsufficientBalanceGuard();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [engines, setEngines] = useState<EngineModel[]>([]);
  const [voices, setVoices] = useState<VoiceModel[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<EngineModel | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceModel | null>(null);
  const [enginesLoading, setEnginesLoading] = useState(false);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [engineModalOpen, setEngineModalOpen] = useState(false);
  const [engineDetail, setEngineDetail] = useState<EngineModel | null>(null);
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [detailVoice, setDetailVoice] = useState<VoiceModel | null>(null);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playTick, setPlayTick] = useState(0);
  const resultPanelRef = useRef<HTMLDivElement>(null);
  const [historyTasks, setHistoryTasks] = useState<GenerationTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({ current: 1, pageSize: 8, total: 0 });

  const textValue = Form.useWatch('text', form) || '';
  const outputFormat = Form.useWatch('outputFormat', form) || 'mp3';
  const textHint = useMemo(
    () => getSpeechTextHint(textValue, selectedVoice?.language),
    [textValue, selectedVoice?.language],
  );

  const getVoiceName = (model: VoiceModel) =>
    locale === 'zh' || locale === 'zh-CN' ? model.voiceName : (model.voiceNameEn || model.voiceName);

  const getHistoryVoiceName = (task: SpeechHistoryTask) => {
    if (locale === 'zh' || locale === 'zh-CN') {
      return task.voiceName || task.voiceCode;
    }
    return task.voiceNameEn || task.voiceName || task.voiceCode;
  };

  const charCount = useMemo(() => countSpeechCharacters(textValue.trim()), [textValue]);

  const requiredTokens = useMemo(
    () => calcSpeechTokenCost(
      charCount,
      selectedEngine?.tokenCost,
      selectedVoice?.tokenCost,
      selectedEngine?.unit,
    ),
    [charCount, selectedEngine?.tokenCost, selectedEngine?.unit, selectedVoice?.tokenCost],
  );

  const estimatedPrice = useMemo(
    () => getSpeechEstimatedPrice(
      textValue,
      selectedEngine?.tokenCost,
      selectedVoice?.tokenCost,
      selectedEngine?.unit,
    ),
    [textValue, selectedEngine?.tokenCost, selectedEngine?.unit, selectedVoice?.tokenCost],
  );

  const speechToneOptions = useMemo(
    () => SPEECH_TONE_KEYS.map(key => ({
      value: key,
      label: intl.formatMessage({
        id: `create.speech.tone.${key}`,
        defaultMessage: key === 'natural' ? '自然（默认）' : key,
      }),
    })),
    [intl],
  );

  const fetchEngines = useCallback(async () => {
    setEnginesLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
        params: { modelType: 't2a' },
      });
      if (response.data.success && response.data.data?.length > 0) {
        const list = response.data.data as EngineModel[];
        setEngines(list);
        const first = list[0];
        setSelectedEngine(first);
        form.setFieldsValue({ modelCode: first.modelCode });
      }
    } catch {
      message.error(intl.formatMessage({ id: 'create.model.loadFailed', defaultMessage: '加载模型列表失败' }));
    } finally {
      setEnginesLoading(false);
    }
  }, [form, intl]);

  const fetchVoices = useCallback(async (engineModelCode: string, preserveVoiceCode?: string) => {
    setVoicesLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-speech/voices', {
        params: { engineModelCode },
      });
      if (response.data.success) {
        const list = (response.data.data || []) as VoiceModel[];
        setVoices(list);
        if (list.length > 0) {
          const matched = preserveVoiceCode
            ? list.find(v => v.voiceCode === preserveVoiceCode)
            : null;
          const next = matched || list[0];
          setSelectedVoice(next);
          form.setFieldsValue({
            voiceCode: next.voiceCode,
            outputFormat: next.defaultFormat || 'mp3',
            sampleRate: next.sampleRate || 24000,
            ttsModel: next.ttsModel || undefined,
          });
        } else {
          setSelectedVoice(null);
          form.setFieldsValue({ voiceCode: undefined });
        }
      }
    } catch {
      message.error(intl.formatMessage({ id: 'create.speech.voiceLoadFailed', defaultMessage: '加载音色列表失败' }));
    } finally {
      setVoicesLoading(false);
    }
  }, [form, intl]);

  const fetchHistoryTasks = useCallback(async (page = 1, pageSize = 8) => {
    setHistoryLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', {
        params: { currentPage: page, pageSize, taskType: 't2a', successOnly: true },
      });
      if (response.data.success && response.data.data) {
        setHistoryTasks((response.data.data.records || []).map((task: Omit<GenerationTask, 'resultUrls'> & { resultUrls?: unknown }) => normalizeHistoryTask(task)));
        setHistoryPagination({
          current: page,
          pageSize,
          total: response.data.data.totalNum || 0,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEngines();
    fetchHistoryTasks();
  }, [fetchEngines, fetchHistoryTasks]);

  useEffect(() => {
    if (selectedEngine?.modelCode) {
      fetchVoices(selectedEngine.modelCode);
    }
  }, [selectedEngine?.modelCode, fetchVoices]);

  const handleEngineChange = (engine: EngineModel) => {
    setSelectedEngine(engine);
    form.setFieldsValue({ modelCode: engine.modelCode });
  };

  const handleVoiceChange = (voiceCode: string) => {
    const voice = voices.find(v => v.voiceCode === voiceCode) || null;
    setSelectedVoice(voice);
    if (voice) {
      form.setFieldsValue({
        voiceCode,
        outputFormat: voice.defaultFormat || 'mp3',
        sampleRate: voice.sampleRate || 24000,
        ttsModel: voice.ttsModel || undefined,
      });
    }
  };

  const triggerAudioPlay = useCallback((url: string, scrollToResult = true) => {
    setAudioUrl(url);
    setPlayTick(tick => tick + 1);
    if (scrollToResult) {
      window.requestAnimationFrame(() => {
        resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, []);

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      if (!ensureSufficientBalance(requiredTokens)) {
        return;
      }
      setLoading(true);
      setAudioUrl(null);

      const payload: Record<string, unknown> = {
        modelCode: values.modelCode,
        voiceCode: values.voiceCode,
        text: values.text?.trim(),
        outputFormat: values.outputFormat,
        sampleRate: values.sampleRate,
        speechRate: values.speechRate,
        loudnessRate: values.loudnessRate,
        enableSubtitle: values.enableSubtitle,
      };
      if (values.ttsModel) payload.ttsModel = values.ttsModel;
      const contextInstruction = resolveSpeechContextInstruction(
        values.speechTone as SpeechToneKey | undefined,
        values.contextInstruction,
        selectedVoice?.language,
      );
      if (contextInstruction) {
        payload.contextTexts = [contextInstruction];
      }
      if (values.explicitDialect) payload.explicitDialect = values.explicitDialect;

      const response = await instance.post('/productx/sa-ai-speech/generate/text', payload);
      if (response.data.success && response.data.data) {
        const url = response.data.data.audioUrl || response.data.data.resultUrls?.[0];
        if (url) {
          triggerAudioPlay(url, false);
          message.success(intl.formatMessage({ id: 'create.speech.generateSuccess', defaultMessage: '语音生成成功' }));
          fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
          if (selectedEngine?.modelCode) {
            fetchVoices(selectedEngine.modelCode, values.voiceCode);
          }
        }
      } else {
        const errMsg = response.data.message || response.data.msg;
        if (!tryShowFromApiError(errMsg)) {
          message.error(errMsg || intl.formatMessage({ id: 'create.speech.generateFailed', defaultMessage: '语音生成失败' }));
        }
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message;
      if (!tryShowFromApiError(errMsg)) {
        message.error(errMsg || intl.formatMessage({ id: 'create.speech.generateFailed', defaultMessage: '语音生成失败' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = (selectedVoice?.audioFormats || 'mp3,pcm,ogg_opus')
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);

  const dialectOptions = (selectedVoice?.dialect || '')
    .split(',')
    .map(d => d.trim())
    .filter(Boolean);

  const openVoiceDetail = (voice: VoiceModel) => {
    setDetailVoice(voice);
  };

  const updateVoiceFavoriteState = (voiceId: number, favorited: boolean) => {
    setVoices(prev => prev.map(v => (v.id === voiceId ? { ...v, favorited } : v)));
    setSelectedVoice(prev => (prev?.id === voiceId ? { ...prev, favorited } : prev));
    setDetailVoice(prev => (prev?.id === voiceId ? { ...prev, favorited } : prev));
  };

  const handleToggleFavorite = async (voice: VoiceModel, favorited: boolean) => {
    setFavoriteLoadingId(voice.id);
    try {
      const path = favorited
        ? `/productx/sa-ai-speech/voices/${voice.id}/unfavorite`
        : `/productx/sa-ai-speech/voices/${voice.id}/favorite`;
      const response = await instance.post(path);
      if (response.data.success) {
        updateVoiceFavoriteState(voice.id, !favorited);
        message.success(intl.formatMessage({
          id: favorited ? 'create.speech.unfavoritedVoice' : 'create.speech.favoritedVoice',
          defaultMessage: favorited ? '已取消收藏' : '已收藏',
        }));
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message
        || intl.formatMessage({ id: 'create.speech.favoriteFailed', defaultMessage: '收藏操作失败' }),
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  return (
    <PageWrap className="speech-generation-page">
      <GlobalSpeechStyles />

      <TitleSection>
        <Title level={4} style={{ margin: 0 }}>
          <CustomerServiceOutlined style={{ marginRight: 8, color: '#13c2c2' }} />
          <FormattedMessage id="create.speech.title" defaultMessage="语音生成" />
        </Title>
        <Text type="secondary">
          <FormattedMessage id="create.speech.pageSubtitle" defaultMessage="基于火山引擎豆包语音，支持多音色、情感与语音指令" />
        </Text>
      </TitleSection>

      <MainGrid>
        <FormColumn>
          <StyledCard bordered={false}>
            <Spin spinning={enginesLoading}>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  speechRate: 0,
                  loudnessRate: 0,
                  sampleRate: 24000,
                  outputFormat: 'mp3',
                  enableSubtitle: false,
                  speechTone: 'natural',
                }}
              >
                <EngineSelectWrap>
                  <EngineSelectField
                    engines={engines}
                    selectedEngine={selectedEngine}
                    enginesLoading={enginesLoading}
                    locale={locale}
                    onOpenModal={() => setEngineModalOpen(true)}
                  />
                  {selectedEngine && getEngineDescription(selectedEngine, locale) && (
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                      {getEngineDescription(selectedEngine, locale)}
                    </Text>
                  )}
                </EngineSelectWrap>

                <Form.Item name="voiceCode" hidden rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                <Form.Item
                  label={<FormattedMessage id="create.speech.voice" defaultMessage="音色" />}
                  style={{ marginTop: 16, marginBottom: 0 }}
                >
                  <SelectorTrigger type="button" onClick={() => setVoiceModalOpen(true)}>
                    <div className="trigger-main">
                      <div className="trigger-label">
                        <FormattedMessage id="create.speech.voiceHint" defaultMessage="点击选择音色" />
                      </div>
                      <div className="trigger-value">
                        {selectedVoice ? getVoiceName(selectedVoice) : intl.formatMessage({ id: 'create.speech.noVoice', defaultMessage: '暂无可用音色' })}
                      </div>
                      {selectedVoice && (
                        <div className="trigger-meta">
                          {selectedVoice.style && <Tag bordered={false}>{selectedVoice.style}</Tag>}
                          {(selectedVoice.usageCount || 0) > 0 && (
                            <Tag bordered={false} color="orange">
                              <FormattedMessage
                                id="create.speech.voiceUsageCount"
                                defaultMessage="{count} 次使用"
                                values={{ count: selectedVoice.usageCount }}
                              />
                            </Tag>
                          )}
                          {selectedVoice.favorited && (
                            <Tag bordered={false} color="gold">
                              <FormattedMessage id="create.speech.favoritedTag" defaultMessage="已收藏" />
                            </Tag>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="trigger-action">
                      <FormattedMessage id="create.speech.changeVoice" defaultMessage="更换" />
                      <RightOutlined style={{ marginLeft: 4, fontSize: 11 }} />
                    </span>
                  </SelectorTrigger>
                </Form.Item>

                {textHint && (
                  <Alert
                    type={textHint.type}
                    showIcon
                    style={{ marginTop: 12, marginBottom: 4 }}
                    message={intl.formatMessage({
                      id: textHint.messageId,
                      defaultMessage: textHint.defaultMessage,
                    })}
                  />
                )}

                <TextAreaWrap>
                  <Form.Item
                    name="text"
                    label={<FormattedMessage id="create.speech.text" defaultMessage="合成文本" />}
                    rules={[{ required: true, message: intl.formatMessage({ id: 'create.speech.textRequired', defaultMessage: '请输入合成文本' }) }]}
                    style={{ marginTop: 20, marginBottom: 0 }}
                  >
                    <TextArea
                      rows={6}
                      maxLength={selectedVoice?.maxTextLength || 5000}
                      showCount
                      placeholder={intl.formatMessage({ id: 'create.speech.textPlaceholder', defaultMessage: '输入要转换为语音的文本...' })}
                    />
                  </Form.Item>
                </TextAreaWrap>

                {selectedVoice?.supportContextTexts !== false && (
                  <Form.Item
                    name="speechTone"
                    label={<FormattedMessage id="create.speech.speechTone" defaultMessage="语气风格" />}
                    extra={intl.formatMessage({
                      id: 'create.speech.speechToneHint',
                      defaultMessage: '通过语音指令控制语气，适用于所有 2.0 音色',
                    })}
                    style={{ marginTop: 16, marginBottom: 0 }}
                  >
                    <Select options={speechToneOptions} />
                  </Form.Item>
                )}

                <SettingsTrigger type="button" onClick={() => setAdvancedModalOpen(true)}>
                  <div className="trigger-main">
                    <div className="trigger-label">
                      <FormattedMessage id="create.speech.advancedSettings" defaultMessage="高级设置" />
                    </div>
                    <div className="trigger-value">
                      <SettingOutlined style={{ marginRight: 6 }} />
                      <FormattedMessage id="create.speech.advancedSettingsHint" defaultMessage="格式、采样率、语速、自定义指令等" />
                    </div>
                  </div>
                  <span className="trigger-action">
                    <FormattedMessage id="create.speech.openSettings" defaultMessage="打开" />
                    <RightOutlined style={{ marginLeft: 4, fontSize: 11 }} />
                  </span>
                </SettingsTrigger>

                <EstimatedPriceHint
                  price={estimatedPrice}
                  tokenBalance={tokenBalance}
                  balanceLoading={balanceLoading}
                />

                <GenerateButton>
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<ThunderboltOutlined />}
                    loading={loading}
                    onClick={handleGenerate}
                  >
                    <FormattedMessage id="create.speech.generate" defaultMessage="生成语音" />
                  </Button>
                </GenerateButton>
              </Form>
            </Spin>
          </StyledCard>
        </FormColumn>

        <ResultColumn ref={resultPanelRef}>
          <StyledCard
            bordered={false}
            title={<FormattedMessage id="create.speech.result" defaultMessage="生成结果" />}
          >
            <AudioResultPanel
              loading={loading}
              audioUrl={audioUrl}
              playTick={playTick}
              voiceName={selectedVoice ? getVoiceName(selectedVoice) : undefined}
              outputFormat={outputFormat}
              generatingTip={intl.formatMessage({ id: 'create.speech.generating', defaultMessage: '正在合成语音...' })}
            />
          </StyledCard>
        </ResultColumn>
      </MainGrid>

      <StyledCard bordered={false}>
        <SpeechHistorySection
          tasks={historyTasks}
          loading={historyLoading}
          activeUrl={audioUrl}
          pagination={historyPagination}
          getVoiceName={getHistoryVoiceName}
          onPlay={triggerAudioPlay}
          onRefresh={() => fetchHistoryTasks(historyPagination.current, historyPagination.pageSize)}
          onPageChange={(page, pageSize) => fetchHistoryTasks(page, pageSize)}
        />
      </StyledCard>

      <EngineSelectionModal
        open={engineModalOpen}
        onClose={() => setEngineModalOpen(false)}
        engines={engines}
        selectedEngine={selectedEngine}
        locale={locale}
        loading={enginesLoading}
        onSelect={handleEngineChange}
        onShowDetail={(engine) => setEngineDetail(engine)}
      />

      <EngineDetailModal
        open={!!engineDetail}
        engine={engineDetail}
        locale={locale}
        onClose={() => setEngineDetail(null)}
        onSelect={(engine) => {
          handleEngineChange(engine);
          setEngineModalOpen(false);
        }}
      />

      <VoiceSelectModal
        open={voiceModalOpen}
        voices={voices}
        value={selectedVoice?.voiceCode}
        loading={voicesLoading}
        favoriteLoadingId={favoriteLoadingId}
        getVoiceName={getVoiceName}
        onClose={() => setVoiceModalOpen(false)}
        onConfirm={voiceCode => {
          handleVoiceChange(voiceCode);
          setVoiceModalOpen(false);
        }}
        onDetailClick={openVoiceDetail}
        onToggleFavorite={handleToggleFavorite}
      />

      <VoiceDetailModal
        open={!!detailVoice}
        voice={detailVoice}
        favoriteLoadingId={favoriteLoadingId}
        getVoiceName={getVoiceName}
        onClose={() => setDetailVoice(null)}
        onToggleFavorite={handleToggleFavorite}
        onSelect={voiceCode => {
          handleVoiceChange(voiceCode);
          setDetailVoice(null);
          setVoiceModalOpen(false);
        }}
      />

      <AdvancedSettingsModal
        open={advancedModalOpen}
        form={form}
        selectedVoice={selectedVoice}
        formatOptions={formatOptions}
        dialectOptions={dialectOptions}
        onClose={() => setAdvancedModalOpen(false)}
      />

      <InsufficientBalanceModal
        open={insufficientBalanceOpen}
        onCancel={closeInsufficientBalanceModal}
        requiredTokens={insufficientBalanceRequired}
        tokenBalance={insufficientBalanceModalBalance}
      />
    </PageWrap>
  );
};

export default SpeechGeneration;
