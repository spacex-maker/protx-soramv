import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Typography,
  Input,
  Button,
  Form,
  message,
  Spin,
  Upload,
  Select,
  Popconfirm,
  Empty,
  Segmented,
  Descriptions,
  Modal,
  Tooltip,
  Alert,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  ThunderboltOutlined,
  SoundOutlined,
  UploadOutlined,
  ReloadOutlined,
  DeleteOutlined,
  AudioOutlined,
  UserOutlined,
  PlusOutlined,
  CheckOutlined,
  SyncOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import instance from 'api/axios';
import {
  calcSpeechTokenCost,
  countSpeechCharacters,
  formatSpeechTokenAmount,
  getSpeechEstimatedPrice,
} from '../shared/speechTokenUtils';
import EstimatedPriceHint from '../shared/EstimatedPriceHint';
import { fetchCnyBalance } from '../shared/balanceUtils';
import { useTokenBalance } from '../shared/useTokenBalance';
import { useInsufficientBalanceGuard } from '../shared/useInsufficientBalanceGuard';
import InsufficientBalanceModal from '../shared/InsufficientBalanceModal';
import AudioResultPanel from '../SpeechGeneration/AudioResultPanel';
import SpeechHistorySection, { SpeechHistoryTask } from '../SpeechGeneration/SpeechHistorySection';
import { EngineModel } from '../SpeechGeneration/engineTypes';
import { getEngineDescription } from '../SpeechGeneration/engineUtils';
import EngineSelectField from '../SpeechGeneration/EngineSelectField';
import EngineSelectionModal from '../SpeechGeneration/EngineSelectionModal';
import EngineDetailModal from '../SpeechGeneration/EngineDetailModal';
import {
  GlobalSpeechStyles,
  PageWrap,
  TitleSection,
  MainGrid,
  FormColumn,
  ResultColumn,
  ResultSection,
  ResultSectionTitle,
  StyledCard,
  EngineSelectWrap,
  TextAreaWrap,
  GenerateButton,
} from '../SpeechGeneration/styles';
import {
  GlobalVoiceCloneStyles,
  TrainFormGrid,
  TrainTips,
  SynthSettingsRow,
  UnifiedWorkspaceCard,
  WorkspaceBody,
  WorkspaceEnginePanel,
  WorkspaceMainSplit,
  WorkspaceSection,
  WorkspaceSectionHead,
  WorkspaceSectionHeadMain,
  WorkspaceStepBadge,
  WorkspaceSectionTitleWrap,
  WorkspaceSectionTitle,
  WorkspaceSectionDesc,
  WorkspaceSectionStats,
  UnifiedVoiceList,
  SynthPanel,
  SynthEmptyPlaceholder,
  SelectedVoiceChip,
  CloneListTitleRow,
  CloneListCountBadge,
  CloneListToolbar,
  CloneToolbarIconBtn,
  CloneToolbarPrimaryBtn,
  StatPill,
  CloneVoiceCard,
  CloneCardCornerActions,
  CloneCardIconBtn,
  CloneCardBody,
  CloneCardTop,
  CloneCardAvatar,
  CloneCardMain,
  CloneCardNameRow,
  CloneCardName,
  CloneStatusPill,
  CloneCardMeta,
  FailReasonText,
  CloneDemoAudioWrap,
  EmptyLibrary,
  AudioInputTabs,
} from './styles';
import AudioRecordPanel, { RecordedTrainingAudio } from './AudioRecordPanel';
import UploadedAudioPreview from './UploadedAudioPreview';
import { fileToBase64, getAudioFormatFromFile } from './voiceCloneAudioUtils';

const { Title, Text } = Typography;
const { TextArea } = Input;

type AudioInputMode = 'upload' | 'record';

interface VoiceCloneItem {
  id: number;
  name: string;
  speakerId: string;
  status: string;
  referenceText?: string;
  failReason?: string;
  demoAudioUrl?: string;
  ready?: boolean;
  createTime?: string;
  billingMode?: string;
  slotActivatedAt?: string | null;
  slotFeeRequired?: boolean;
  slotFeeCny?: number;
  retrainable?: boolean;
}

const STATUS_VARIANT: Record<string, 'ready' | 'training' | 'failed' | 'unknown' | 'expired' | 'success'> = {
  Training: 'training',
  Success: 'success',
  Active: 'ready',
  Failed: 'failed',
  Unknown: 'unknown',
  Expired: 'expired',
};

const shortenSpeakerId = (id: string) => {
  if (!id || id.length <= 22) return id;
  return `${id.slice(0, 16)}…${id.slice(-4)}`;
};

const isCloneRetrainable = (clone: VoiceCloneItem) => {
  if (clone.retrainable != null) return clone.retrainable;
  if (clone.slotActivatedAt) return false;
  if (clone.status === 'Active' || clone.status === 'Training' || clone.status === 'Unknown') return false;
  return true;
};

const normalizeHistoryTask = (task: Omit<SpeechHistoryTask, 'resultUrls'> & { resultUrls?: unknown }): SpeechHistoryTask => {
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

  return {
    ...task,
    resultUrls: normalizeResultUrls(task.resultUrls),
  };
};

const VoiceClone: React.FC = () => {
  const intl = useIntl();
  const { locale } = useLocale();
  const { tokenBalance, balanceLoading, refreshTokenBalance } = useTokenBalance();
  const {
    insufficientBalanceOpen,
    insufficientBalanceRequired,
    insufficientBalanceModalBalance,
    closeInsufficientBalanceModal,
    ensureSufficientBalance,
    tryShowFromApiError,
  } = useInsufficientBalanceGuard();

  const [trainForm] = Form.useForm();
  const [synthForm] = Form.useForm();
  const resultPanelRef = useRef<HTMLDivElement>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const [trainModalOpen, setTrainModalOpen] = useState(false);
  const [retrainCloneId, setRetrainCloneId] = useState<number | null>(null);
  const [detailClone, setDetailClone] = useState<VoiceCloneItem | null>(null);
  const [engines, setEngines] = useState<EngineModel[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<EngineModel | null>(null);
  const [enginesLoading, setEnginesLoading] = useState(false);
  const [engineModalOpen, setEngineModalOpen] = useState(false);
  const [engineDetail, setEngineDetail] = useState<EngineModel | null>(null);

  const [clones, setClones] = useState<VoiceCloneItem[]>([]);
  const [clonesLoading, setClonesLoading] = useState(false);
  const [refreshingCloneIds, setRefreshingCloneIds] = useState<Set<number>>(() => new Set());
  const [selectedClone, setSelectedClone] = useState<VoiceCloneItem | null>(null);

  const [trainLoading, setTrainLoading] = useState(false);
  const [synthLoading, setSynthLoading] = useState(false);
  const [audioFileList, setAudioFileList] = useState<UploadFile[]>([]);
  const [uploadedTrainingFile, setUploadedTrainingFile] = useState<File | null>(null);
  const [audioInputMode, setAudioInputMode] = useState<AudioInputMode>('upload');
  const [recordedAudio, setRecordedAudio] = useState<RecordedTrainingAudio | null>(null);

  const clearRecordedAudio = useCallback(() => {
    setRecordedAudio(prev => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
  }, []);

  const applyUploadedFile = useCallback((file: File) => {
    setUploadedTrainingFile(file);
    setAudioFileList([{
      uid: 'voice-clone-training-audio',
      name: file.name,
      status: 'done',
      originFileObj: file as UploadFile['originFileObj'],
    }]);
    clearRecordedAudio();
  }, [clearRecordedAudio]);

  const clearUploadedFile = useCallback(() => {
    setUploadedTrainingFile(null);
    setAudioFileList([]);
  }, []);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playTick, setPlayTick] = useState(0);

  const [historyTasks, setHistoryTasks] = useState<SpeechHistoryTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({ current: 1, pageSize: 8, total: 0 });

  const synthText = Form.useWatch('text', synthForm) || '';
  const trainReferenceText = Form.useWatch('referenceText', trainForm) || '';
  const outputFormat = Form.useWatch('outputFormat', synthForm) || 'mp3';

  const synthCharCount = useMemo(() => countSpeechCharacters(synthText.trim()), [synthText]);
  const trainCharCount = useMemo(() => countSpeechCharacters(trainReferenceText.trim()), [trainReferenceText]);

  const synthRequiredTokens = useMemo(
    () => calcSpeechTokenCost(synthCharCount, selectedEngine?.tokenCost, undefined, selectedEngine?.unit),
    [synthCharCount, selectedEngine?.tokenCost, selectedEngine?.unit],
  );
  const trainRequiredTokens = useMemo(
    () => calcSpeechTokenCost(trainCharCount, selectedEngine?.tokenCost, undefined, selectedEngine?.unit),
    [trainCharCount, selectedEngine?.tokenCost, selectedEngine?.unit],
  );

  const trainEstimatedPrice = useMemo(
    () => getSpeechEstimatedPrice(
      trainReferenceText,
      selectedEngine?.tokenCost,
      undefined,
      selectedEngine?.unit,
    ),
    [trainReferenceText, selectedEngine?.tokenCost, selectedEngine?.unit],
  );

  const synthEstimatedPrice = useMemo(
    () => getSpeechEstimatedPrice(
      synthText,
      selectedEngine?.tokenCost,
      undefined,
      selectedEngine?.unit,
    ),
    [synthText, selectedEngine?.tokenCost, selectedEngine?.unit],
  );

  const readyClones = useMemo(() => clones.filter(c => c.ready), [clones]);
  const trainingClones = useMemo(
    () => clones.filter(c => c.status === 'Training' || c.status === 'Unknown'),
    [clones],
  );

  const handleEngineChange = (engine: EngineModel) => {
    setSelectedEngine(engine);
    synthForm.setFieldsValue({ modelCode: engine.modelCode });
  };

  const fetchEngines = useCallback(async () => {
    setEnginesLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-models/enabled/by-type', {
        params: { modelType: 'vclone' },
      });
      if (response.data.success && response.data.data?.length > 0) {
        const list = response.data.data as EngineModel[];
        setEngines(list);
        const first = list[0];
        setSelectedEngine(first);
        synthForm.setFieldsValue({ modelCode: first.modelCode, outputFormat: 'mp3', sampleRate: 24000 });
      }
    } catch {
      message.error(intl.formatMessage({ id: 'create.model.loadFailed', defaultMessage: '加载模型列表失败' }));
    } finally {
      setEnginesLoading(false);
    }
  }, [intl, synthForm]);

  const fetchClones = useCallback(async () => {
    setClonesLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-voice-clone/list');
      if (response.data.success) {
        const list = (response.data.data || []) as VoiceCloneItem[];
        setClones(list);
        setSelectedClone(prev => {
          if (!prev) return list.find(c => c.ready) || null;
          return list.find(c => c.id === prev.id) || list.find(c => c.ready) || null;
        });
      }
    } catch {
      message.error(intl.formatMessage({ id: 'create.voiceClone.loadFailed', defaultMessage: '加载复刻音色失败' }));
    } finally {
      setClonesLoading(false);
    }
  }, [intl]);

  const refreshCloneStatus = useCallback(async (id: number) => {
    setRefreshingCloneIds(prev => new Set(prev).add(id));
    try {
      const response = await instance.post(`/productx/sa-ai-voice-clone/${id}/refresh`);
      if (response.data?.success && response.data.data) {
        const updated = response.data.data as VoiceCloneItem;
        setClones(prev => prev.map(c => (c.id === id ? updated : c)));
        setSelectedClone(prev => (prev?.id === id ? updated : prev));
        message.success(
          intl.formatMessage(
            { id: 'create.voiceClone.refreshSuccess', defaultMessage: '状态已更新：{status}' },
            {
              status: intl.formatMessage({
                id: `create.voiceClone.status.${updated.status}`,
                defaultMessage: updated.status,
              }),
            },
          ),
        );
        return updated;
      }
      message.error(
        response.data?.message
          || intl.formatMessage({ id: 'create.voiceClone.refreshFailed', defaultMessage: '刷新状态失败' }),
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message
          || error?.message
          || intl.formatMessage({ id: 'create.voiceClone.refreshFailed', defaultMessage: '刷新状态失败' }),
      );
    } finally {
      setRefreshingCloneIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    return null;
  }, [intl]);

  const fetchHistoryTasks = useCallback(async (page = 1, pageSize = 8) => {
    setHistoryLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', {
        params: {
          currentPage: page,
          pageSize,
          taskType: 'vclone',
          outputType: 'audio',
          successOnly: true,
        },
      });
      if (response.data.success && response.data.data) {
        setHistoryTasks(
          (response.data.data.records || []).map(
            (task: Omit<SpeechHistoryTask, 'resultUrls'> & { resultUrls?: unknown }) => normalizeHistoryTask(task),
          ),
        );
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
    fetchClones();
    fetchHistoryTasks();
  }, [fetchEngines, fetchClones, fetchHistoryTasks]);

  useEffect(() => {
    if (trainingClones.length === 0) return undefined;
    const timer = window.setInterval(() => {
      trainingClones.forEach(c => {
        refreshCloneStatus(c.id);
      });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [trainingClones, refreshCloneStatus]);

  const triggerAudioPlay = useCallback((url: string) => {
    setAudioUrl(url);
    setPlayTick(tick => tick + 1);
    window.requestAnimationFrame(() => {
      resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, []);

  const handleSelectClone = (clone: VoiceCloneItem) => {
    if (!clone.ready) return;
    setSelectedClone(clone);
  };

  const closeTrainModal = useCallback(() => {
    setTrainModalOpen(false);
    setRetrainCloneId(null);
    trainForm.resetFields();
    clearUploadedFile();
    clearRecordedAudio();
    setAudioInputMode('upload');
  }, [trainForm, clearUploadedFile, clearRecordedAudio]);

  const openTrainModal = useCallback(() => {
    if (!selectedEngine?.modelCode) {
      message.warning(intl.formatMessage({ id: 'create.voiceClone.engineRequired', defaultMessage: '请选择声音复刻引擎' }));
      return;
    }
    setRetrainCloneId(null);
    trainForm.resetFields();
    clearUploadedFile();
    clearRecordedAudio();
    setAudioInputMode('upload');
    setTrainModalOpen(true);
  }, [intl, selectedEngine?.modelCode, trainForm, clearUploadedFile, clearRecordedAudio]);

  const openRetrainModal = useCallback((clone: VoiceCloneItem) => {
    if (!selectedEngine?.modelCode) {
      message.warning(intl.formatMessage({ id: 'create.voiceClone.engineRequired', defaultMessage: '请选择声音复刻引擎' }));
      return;
    }
    if (!isCloneRetrainable(clone)) {
      message.warning(intl.formatMessage({
        id: 'create.voiceClone.retrainNotAllowed',
        defaultMessage: '该音色已激活或正在训练，无法重新训练。正式合成后火山侧音色固定。',
      }));
      return;
    }
    setRetrainCloneId(clone.id);
    trainForm.setFieldsValue({ name: clone.name, referenceText: clone.referenceText || '' });
    clearUploadedFile();
    clearRecordedAudio();
    setAudioInputMode('upload');
    setTrainModalOpen(true);
  }, [intl, selectedEngine?.modelCode, trainForm, clearUploadedFile, clearRecordedAudio]);

  const handleTrain = async () => {
    try {
      const values = await trainForm.validateFields();

      let audioBase64 = '';
      let audioFormat = 'wav';

      if (audioInputMode === 'upload') {
        if (!uploadedTrainingFile) {
          message.warning(intl.formatMessage({ id: 'create.voiceClone.audioRequired', defaultMessage: '请上传训练音频' }));
          return;
        }
        audioBase64 = await fileToBase64(uploadedTrainingFile);
        audioFormat = getAudioFormatFromFile(uploadedTrainingFile);
      } else if (!recordedAudio) {
        message.warning(intl.formatMessage({ id: 'create.voiceClone.recordRequired', defaultMessage: '请先完成录音' }));
        return;
      } else {
        audioBase64 = recordedAudio.base64;
        audioFormat = recordedAudio.format;
      }

      if (!selectedEngine?.modelCode) {
        message.warning(intl.formatMessage({ id: 'create.voiceClone.engineRequired', defaultMessage: '请选择声音复刻引擎' }));
        return;
      }
      if (!ensureSufficientBalance(trainRequiredTokens)) {
        return;
      }

      setTrainLoading(true);
      const trainPayload = {
        name: values.name?.trim(),
        modelCode: selectedEngine.modelCode,
        audioBase64,
        audioFormat,
        referenceText: values.referenceText?.trim(),
      };
      const response = retrainCloneId
        ? await instance.post(`/productx/sa-ai-voice-clone/${retrainCloneId}/retrain`, trainPayload)
        : await instance.post('/productx/sa-ai-voice-clone/train', trainPayload);
      if (response.data.success) {
        const deducted = response.data.data?.creditsCost ?? trainRequiredTokens;
        message.success(
          deducted > 0
            ? intl.formatMessage(
              retrainCloneId
                ? { id: 'create.voiceClone.retrainSubmittedWithCost', defaultMessage: '重新训练已提交，已扣除 {cost}' }
                : { id: 'create.voiceClone.trainSubmittedWithCost', defaultMessage: '训练已提交，已扣除 {cost}' },
              { cost: formatSpeechTokenAmount(Number(deducted)) },
            )
            : intl.formatMessage(
              retrainCloneId
                ? { id: 'create.voiceClone.retrainSubmitted', defaultMessage: '重新训练已提交，请等待完成' }
                : { id: 'create.voiceClone.trainSubmitted', defaultMessage: '训练已提交，请等待完成' },
            ),
        );
        trainForm.resetFields();
        clearUploadedFile();
        clearRecordedAudio();
        setRetrainCloneId(null);
        setTrainModalOpen(false);
        fetchClones();
        refreshTokenBalance();
      } else {
        message.error(response.data.message || response.data.msg);
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message;
      message.error(errMsg || intl.formatMessage({ id: 'create.voiceClone.trainFailed', defaultMessage: '训练提交失败' }));
    } finally {
      setTrainLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await instance.delete(`/productx/sa-ai-voice-clone/${id}`);
      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'create.voiceClone.deleted', defaultMessage: '已删除' }));
        if (selectedClone?.id === id) setSelectedClone(null);
        fetchClones();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message);
    }
  };

  const handleSynthesize = async () => {
    try {
      const values = await synthForm.validateFields();
      if (!selectedClone?.ready) {
        message.warning(intl.formatMessage({ id: 'create.voiceClone.selectReadyVoice', defaultMessage: '请选择已完成训练的音色' }));
        return;
      }
      if (!ensureSufficientBalance(synthRequiredTokens)) return;

      const runSynthesize = async (confirmSlotFee = false) => {
        setSynthLoading(true);
        setAudioUrl(null);
        try {
          const response = await instance.post('/productx/sa-ai-voice-clone/synthesize', {
            cloneId: selectedClone.id,
            modelCode: selectedEngine?.modelCode || values.modelCode,
            text: values.text?.trim(),
            outputFormat: values.outputFormat,
            sampleRate: values.sampleRate,
            speechRate: values.speechRate,
            loudnessRate: values.loudnessRate,
            confirmSlotFee,
          });
          if (response.data.success && response.data.data) {
            const url = response.data.data.audioUrl || response.data.data.resultUrls?.[0];
            if (url) {
              triggerAudioPlay(url);
              const deducted = response.data.data?.creditsCost ?? synthRequiredTokens;
              const slotFeeCharged = Number(response.data.data?.slotFeeCharged || 0);
              if (slotFeeCharged > 0) {
                message.success(
                  intl.formatMessage(
                    {
                      id: 'create.voiceClone.synthSuccessWithSlotFee',
                      defaultMessage: '语音合成成功，已扣除槽位费 ¥{slotFee} 及合成费用 {cost}',
                    },
                    {
                      slotFee: slotFeeCharged.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
                      cost: formatSpeechTokenAmount(Number(deducted)),
                    },
                  ),
                );
              } else {
                message.success(
                  deducted > 0
                    ? intl.formatMessage(
                      { id: 'create.voiceClone.synthSuccessWithCost', defaultMessage: '语音合成成功，已扣除 {cost}' },
                      { cost: formatSpeechTokenAmount(Number(deducted)) },
                    )
                    : intl.formatMessage({ id: 'create.voiceClone.synthSuccess', defaultMessage: '语音合成成功' }),
                );
              }
              refreshTokenBalance();
              fetchClones();
              fetchHistoryTasks(historyPagination.current, historyPagination.pageSize);
            }
          } else {
            const errMsg = response.data.message || response.data.msg;
            if (!tryShowFromApiError(errMsg)) {
              message.error(errMsg || intl.formatMessage({ id: 'create.voiceClone.synthFailed', defaultMessage: '语音合成失败' }));
            }
          }
        } catch (error: any) {
          const errMsg = error?.response?.data?.message || error?.message;
          if (!tryShowFromApiError(errMsg)) {
            message.error(errMsg || intl.formatMessage({ id: 'create.voiceClone.synthFailed', defaultMessage: '语音合成失败' }));
          }
        } finally {
          setSynthLoading(false);
        }
      };

      if (selectedClone.slotFeeRequired) {
        const slotFee = Number(selectedClone.slotFeeCny || 138);
        const cnyBalance = await fetchCnyBalance();
        if (cnyBalance < slotFee) {
          message.error(
            intl.formatMessage(
              {
                id: 'create.voiceClone.slotFeeInsufficient',
                defaultMessage: '人民币余额不足，音色槽位费需要 ¥{fee}，当前余额 ¥{balance}',
              },
              {
                fee: slotFee.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
                balance: cnyBalance.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
              },
            ),
          );
          return;
        }

        Modal.confirm({
          title: intl.formatMessage({ id: 'create.voiceClone.slotFeeConfirmTitle', defaultMessage: '确认音色槽位费' }),
          content: (
            <div>
              <p>
                {intl.formatMessage(
                  {
                    id: 'create.voiceClone.slotFeeConfirmBody',
                    defaultMessage:
                      '首次使用该音色进行正式合成，将扣除音色槽位费 ¥{fee}。此费用由火山引擎向平台收取，平台将从您的人民币余额中扣减。',
                  },
                  { fee: slotFee.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) },
                )}
              </p>
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message={intl.formatMessage({
                  id: 'create.voiceClone.slotFeeConfirmWhyTitle',
                  defaultMessage: '为什么槽位费较高？',
                })}
                description={
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                    <li>
                      {intl.formatMessage({
                        id: 'create.voiceClone.slotFeeConfirmWhy1',
                        defaultMessage:
                          '火山引擎声音复刻按「音色槽位」计费，官方定价约 ¥138/槽位，平台按上游成本代扣，并非按次合成的常规 TTS 单价。',
                      })}
                    </li>
                    <li>
                      {intl.formatMessage({
                        id: 'create.voiceClone.slotFeeConfirmWhy2',
                        defaultMessage:
                          '首次正式合成会永久占用一个云端专属槽位，并部署您的个性化声纹模型，属于一次性资源开通与托管费用。',
                      })}
                    </li>
                    <li>
                      {intl.formatMessage({
                        id: 'create.voiceClone.slotFeeConfirmWhy3',
                        defaultMessage:
                          '槽位激活后该音色长期可用；同一音色后续合成仅按字数扣 Token，不会重复收取槽位费。',
                      })}
                    </li>
                  </ul>
                }
              />
              <p style={{ marginBottom: 0, color: 'var(--ant-color-text-secondary)' }}>
                {intl.formatMessage(
                  {
                    id: 'create.voiceClone.slotFeeConfirmExtra',
                    defaultMessage: '本次合成另需扣除约 {tokenCost} 作为合成费用。',
                  },
                  { tokenCost: formatSpeechTokenAmount(synthRequiredTokens) },
                )}
              </p>
            </div>
          ),
          okText: intl.formatMessage({ id: 'create.voiceClone.slotFeeConfirmOk', defaultMessage: '确认并合成' }),
          cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
          centered: true,
          onOk: () => runSynthesize(true),
        });
        return;
      }

      await runSynthesize(false);
    } catch {
      /* form validation */
    }
  };

  const getHistoryVoiceName = (task: SpeechHistoryTask) => task.voiceName || task.voiceNameEn || task.voiceCode;

  const getStatusLabel = (status: string) =>
    intl.formatMessage({
      id: `create.voiceClone.status.${status}`,
      defaultMessage: status,
    });

  const renderVoiceLibrary = () => (
    <Spin spinning={clonesLoading} wrapperClassName="voice-clone-list-spin">
      {clones.length === 0 ? (
        <EmptyLibrary>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({ id: 'create.voiceClone.empty', defaultMessage: '暂无复刻音色，训练你的第一个专属声音' })}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openTrainModal} style={{ marginTop: 12 }}>
            <FormattedMessage id="create.voiceClone.trainNew" defaultMessage="训练音色" />
          </Button>
        </EmptyLibrary>
      ) : (
        <UnifiedVoiceList>
          {clones.map(clone => {
            const isSelected = selectedClone?.id === clone.id;
            const isTraining = clone.status === 'Training' || clone.status === 'Unknown';
            const isFailed = clone.status === 'Failed';
            const statusVariant = STATUS_VARIANT[clone.status] || 'unknown';
            const showRefresh = clone.status === 'Training' || clone.status === 'Unknown' || clone.status === 'Success';
            const isRefreshing = refreshingCloneIds.has(clone.id);

            return (
            <CloneVoiceCard
              key={clone.id}
              $listLayout
              $selected={isSelected}
              $ready={!!clone.ready}
              $training={isTraining}
              role={clone.ready ? 'button' : undefined}
              tabIndex={clone.ready ? 0 : undefined}
              onClick={() => handleSelectClone(clone)}
              onKeyDown={e => {
                if (clone.ready && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSelectClone(clone);
                }
              }}
            >
              <CloneCardCornerActions onClick={e => e.stopPropagation()}>
                {showRefresh && (
                  <Tooltip title={intl.formatMessage({ id: 'create.voiceClone.refreshStatus', defaultMessage: '查状态' })}>
                    <CloneCardIconBtn
                      type="button"
                      $spinning={isRefreshing}
                      disabled={isRefreshing}
                      onClick={e => {
                        e.preventDefault();
                        refreshCloneStatus(clone.id);
                      }}
                    >
                      <SyncOutlined />
                    </CloneCardIconBtn>
                  </Tooltip>
                )}
                <Tooltip title={intl.formatMessage({ id: 'create.voiceClone.detail', defaultMessage: '音色详情' })}>
                  <CloneCardIconBtn
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      setDetailClone(clone);
                    }}
                  >
                    <InfoCircleOutlined />
                  </CloneCardIconBtn>
                </Tooltip>
                <Popconfirm
                  title={intl.formatMessage({ id: 'create.voiceClone.deleteConfirm', defaultMessage: '确定删除该音色？' })}
                  description={intl.formatMessage({
                    id: 'create.voiceClone.deleteConfirmDesc',
                    defaultMessage: '删除后不可恢复。已支付的槽位费、训练及合成费用均不退还；火山侧槽位可能仍被占用直至平台同步释放。',
                  })}
                  okText={intl.formatMessage({ id: 'create.voiceClone.deleteConfirmOk', defaultMessage: '确认删除' })}
                  cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(clone.id)}
                >
                  <Tooltip title={intl.formatMessage({ id: 'create.voiceClone.delete', defaultMessage: '删除' })}>
                    <CloneCardIconBtn type="button" $danger onClick={e => e.preventDefault()}>
                      <DeleteOutlined />
                    </CloneCardIconBtn>
                  </Tooltip>
                </Popconfirm>
              </CloneCardCornerActions>

              <CloneCardBody $hasDemoFooter={!!clone.demoAudioUrl}>
                <CloneCardTop>
                  <CloneCardAvatar
                    $ready={clone.ready}
                    $training={isTraining}
                    $failed={isFailed}
                    $selected={isSelected}
                  >
                    {isSelected ? <CheckOutlined /> : <UserOutlined />}
                  </CloneCardAvatar>
                  <CloneCardMain>
                    <CloneCardNameRow>
                      <CloneCardName>{clone.name}</CloneCardName>
                      <CloneStatusPill $variant={statusVariant}>
                        {statusVariant === 'training' && <span className="status-dot" />}
                        {getStatusLabel(clone.status)}
                      </CloneStatusPill>
                    </CloneCardNameRow>
                    <Tooltip title={clone.speakerId}>
                      <CloneCardMeta>{shortenSpeakerId(clone.speakerId)}</CloneCardMeta>
                    </Tooltip>
                  </CloneCardMain>
                </CloneCardTop>

                {clone.failReason && <FailReasonText>{clone.failReason}</FailReasonText>}
              </CloneCardBody>

              {clone.demoAudioUrl && (
                <CloneDemoAudioWrap onClick={e => e.stopPropagation()}>
                  <audio controls preload="none" src={clone.demoAudioUrl} />
                </CloneDemoAudioWrap>
              )}
            </CloneVoiceCard>
            );
          })}
        </UnifiedVoiceList>
      )}
    </Spin>
  );

  return (
    <PageWrap className="voice-clone-page speech-generation-page">
      <GlobalSpeechStyles />
      <GlobalVoiceCloneStyles />

      <TitleSection>
        <Title level={4} style={{ margin: 0 }}>
          <SoundOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          <FormattedMessage id="create.voiceClone.title" defaultMessage="语音复刻" />
        </Title>
        <Text type="secondary">
          <FormattedMessage
            id="create.voiceClone.pageSubtitle"
            defaultMessage="基于火山引擎声音复刻 V3，上传参考音频训练专属音色，再合成语音"
          />
        </Text>
      </TitleSection>

      <MainGrid>
        <FormColumn>
          <UnifiedWorkspaceCard
            bordered={false}
            title={(
              <CloneListTitleRow>
                <FormattedMessage id="create.voiceClone.workspaceTitle" defaultMessage="音色与合成" />
                {clones.length > 0 && <CloneListCountBadge>{clones.length}</CloneListCountBadge>}
              </CloneListTitleRow>
            )}
            extra={(
              <CloneListToolbar>
                <Tooltip title={intl.formatMessage({ id: 'create.voiceClone.refreshList', defaultMessage: '刷新' })}>
                  <CloneToolbarIconBtn
                    type="button"
                    $spinning={clonesLoading}
                    disabled={clonesLoading}
                    onClick={fetchClones}
                    aria-label={intl.formatMessage({ id: 'create.voiceClone.refreshList', defaultMessage: '刷新' })}
                  >
                    <ReloadOutlined />
                  </CloneToolbarIconBtn>
                </Tooltip>
                <CloneToolbarPrimaryBtn type="button" onClick={openTrainModal}>
                  <PlusOutlined />
                  <FormattedMessage id="create.voiceClone.trainNew" defaultMessage="训练音色" />
                </CloneToolbarPrimaryBtn>
              </CloneListToolbar>
            )}
          >
            <WorkspaceBody>
              <WorkspaceEnginePanel>
                <Spin spinning={enginesLoading}>
                  <Form form={synthForm} layout="vertical" component={false}>
                    <EngineSelectWrap style={{ marginBottom: 0 }}>
                      <EngineSelectField
                        engines={engines}
                        selectedEngine={selectedEngine}
                        enginesLoading={enginesLoading}
                        locale={locale}
                        onOpenModal={() => setEngineModalOpen(true)}
                        labelMessageId="create.voiceClone.engineSection"
                        labelDefaultMessage="复刻引擎"
                        placeholderMessageId="create.voiceClone.enginePlaceholder"
                        placeholderDefaultMessage="请选择声音复刻引擎"
                        iconColor="#722ed1"
                      />
                      {selectedEngine && getEngineDescription(selectedEngine, locale) && (
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                          {getEngineDescription(selectedEngine, locale)}
                        </Text>
                      )}
                    </EngineSelectWrap>
                  </Form>
                </Spin>
              </WorkspaceEnginePanel>

              <WorkspaceMainSplit>
                <WorkspaceSection $tone="voices">
                  <WorkspaceSectionHead>
                    <WorkspaceSectionHeadMain>
                      <WorkspaceStepBadge>1</WorkspaceStepBadge>
                      <WorkspaceSectionTitleWrap>
                        <WorkspaceSectionTitle>
                          <FormattedMessage id="create.voiceClone.myVoices" defaultMessage="我的音色" />
                        </WorkspaceSectionTitle>
                        <WorkspaceSectionDesc>
                          <FormattedMessage
                            id="create.voiceClone.pickVoiceHint"
                            defaultMessage="点击可用音色卡片选中，右侧输入文本合成"
                          />
                        </WorkspaceSectionDesc>
                        {(readyClones.length > 0 || trainingClones.length > 0) && (
                          <WorkspaceSectionStats>
                            {readyClones.length > 0 && (
                              <StatPill $variant="ready">
                                <FormattedMessage id="create.voiceClone.readyCount" defaultMessage="{count} 可用" values={{ count: readyClones.length }} />
                              </StatPill>
                            )}
                            {trainingClones.length > 0 && (
                              <StatPill $variant="training">
                                <span className="dot" />
                                <FormattedMessage id="create.voiceClone.trainingCount" defaultMessage="{count} 训练中" values={{ count: trainingClones.length }} />
                              </StatPill>
                            )}
                          </WorkspaceSectionStats>
                        )}
                      </WorkspaceSectionTitleWrap>
                    </WorkspaceSectionHeadMain>
                  </WorkspaceSectionHead>
                  {renderVoiceLibrary()}
                </WorkspaceSection>

                <WorkspaceSection $tone="synth" $active={!!selectedClone?.ready}>
                  <WorkspaceSectionHead>
                    <WorkspaceSectionHeadMain>
                      <WorkspaceStepBadge>2</WorkspaceStepBadge>
                      <WorkspaceSectionTitleWrap>
                        <WorkspaceSectionTitle>
                          <FormattedMessage id="create.voiceClone.synthSection" defaultMessage="合成语音" />
                        </WorkspaceSectionTitle>
                        <WorkspaceSectionDesc>
                          <FormattedMessage id="create.voiceClone.step.synthDesc" defaultMessage="输入文本并生成语音" />
                        </WorkspaceSectionDesc>
                      </WorkspaceSectionTitleWrap>
                    </WorkspaceSectionHeadMain>
                    {selectedClone?.ready && (
                      <SelectedVoiceChip>
                        <span className="chip-icon">
                          <CheckOutlined />
                        </span>
                        <span className="chip-name">{selectedClone.name}</span>
                      </SelectedVoiceChip>
                    )}
                  </WorkspaceSectionHead>

                  {!selectedClone?.ready ? (
                    <SynthEmptyPlaceholder>
                      <span className="empty-icon">
                        <UserOutlined />
                      </span>
                      <span className="empty-title">
                        <FormattedMessage id="create.voiceClone.synthEmptyTitle" defaultMessage="尚未选择音色" />
                      </span>
                      <span className="empty-desc">
                        <FormattedMessage
                          id="create.voiceClone.synthEmptyHint"
                          defaultMessage="请先在左侧选择已完成训练的音色，再输入合成文本"
                        />
                      </span>
                    </SynthEmptyPlaceholder>
                  ) : (
                    <SynthPanel>
                      <Spin spinning={enginesLoading || synthLoading}>
                        <Form
                          form={synthForm}
                          layout="vertical"
                          initialValues={{ speechRate: 0, loudnessRate: 0, sampleRate: 24000, outputFormat: 'mp3' }}
                        >
                          <TextAreaWrap>
                            <Form.Item
                              name="text"
                              label={<FormattedMessage id="create.speech.text" defaultMessage="合成文本" />}
                              rules={[{ required: true, message: intl.formatMessage({ id: 'create.speech.textRequired', defaultMessage: '请输入合成文本' }) }]}
                            >
                              <TextArea
                                rows={6}
                                maxLength={5000}
                                showCount
                                placeholder={intl.formatMessage({ id: 'create.speech.textPlaceholder', defaultMessage: '输入要转换为语音的文本...' })}
                              />
                            </Form.Item>
                          </TextAreaWrap>

                          <SynthSettingsRow>
                            <Form.Item name="outputFormat" label={<FormattedMessage id="create.speech.format" defaultMessage="输出格式" />}>
                              <Select options={['mp3', 'pcm', 'ogg_opus'].map(v => ({ value: v, label: v }))} />
                            </Form.Item>
                            <Form.Item name="sampleRate" label={<FormattedMessage id="create.speech.sampleRate" defaultMessage="采样率" />}>
                              <Select options={[16000, 24000, 48000].map(v => ({ value: v, label: `${v} Hz` }))} />
                            </Form.Item>
                          </SynthSettingsRow>

                          {selectedClone.slotFeeRequired && (
                            <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(250, 173, 20, 0.12)', border: '1px solid rgba(250, 173, 20, 0.35)', fontSize: 13, lineHeight: 1.6 }}>
                              {intl.formatMessage(
                                {
                                  id: 'create.voiceClone.slotFeeHint',
                                  defaultMessage: '首次正式合成将扣除 ¥{fee} 音色槽位费（火山收取），另按字数扣 Token',
                                },
                                {
                                  fee: Number(selectedClone.slotFeeCny || 138).toLocaleString('zh-CN', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                  }),
                                },
                              )}
                            </div>
                          )}

                          <EstimatedPriceHint
                            price={synthEstimatedPrice}
                            tokenBalance={tokenBalance}
                            balanceLoading={balanceLoading}
                          />

                          <GenerateButton>
                            <Button
                              type="primary"
                              size="large"
                              block
                              icon={<ThunderboltOutlined />}
                              loading={synthLoading}
                              onClick={handleSynthesize}
                            >
                              <FormattedMessage id="create.voiceClone.synthesize" defaultMessage="合成语音" />
                            </Button>
                          </GenerateButton>
                        </Form>
                      </Spin>
                    </SynthPanel>
                  )}
                </WorkspaceSection>
              </WorkspaceMainSplit>
            </WorkspaceBody>
          </UnifiedWorkspaceCard>
        </FormColumn>

        <ResultColumn ref={resultPanelRef}>
          <ResultSection>
            <ResultSectionTitle>
              <FormattedMessage id="create.speech.result" defaultMessage="生成结果" />
            </ResultSectionTitle>
            <AudioResultPanel
              loading={synthLoading}
              audioUrl={audioUrl}
              playTick={playTick}
              voiceName={selectedClone?.name}
              outputFormat={outputFormat}
              generatingTip={intl.formatMessage({ id: 'create.voiceClone.generating', defaultMessage: '正在合成语音...' })}
            />
          </ResultSection>
        </ResultColumn>
      </MainGrid>

      <StyledCard bordered={false}>
        <SpeechHistorySection
          tasks={historyTasks}
          loading={historyLoading}
          activeUrl={audioUrl}
          pagination={historyPagination}
          getVoiceName={getHistoryVoiceName}
          titleMessageId="create.voiceClone.history"
          titleDefaultMessage="合成记录"
          emptyMessageId="create.voiceClone.historyEmpty"
          emptyDefaultMessage="暂无合成记录"
          onPlay={triggerAudioPlay}
          onRefresh={() => fetchHistoryTasks(historyPagination.current, historyPagination.pageSize)}
          onPageChange={(page, pageSize) => fetchHistoryTasks(page, pageSize)}
          onDeleted={(task) => {
            const deletedUrl = task.resultUrls?.[0];
            if (deletedUrl && deletedUrl === audioUrl) {
              setAudioUrl(null);
            }
          }}
        />
      </StyledCard>

      <Modal
        title={detailClone?.name || intl.formatMessage({ id: 'create.voiceClone.detailTitle', defaultMessage: '音色详情' })}
        open={!!detailClone}
        onCancel={() => setDetailClone(null)}
        centered
        width={520}
        footer={[
          <Button key="close" onClick={() => setDetailClone(null)}>
            {intl.formatMessage({ id: 'common.close', defaultMessage: '关闭' })}
          </Button>,
          detailClone && isCloneRetrainable(detailClone) ? (
            <Button
              key="retrain"
              type="primary"
              icon={<AudioOutlined />}
              onClick={() => {
                const target = detailClone;
                setDetailClone(null);
                openRetrainModal(target);
              }}
            >
              {intl.formatMessage({ id: 'create.voiceClone.retrain', defaultMessage: '重新训练' })}
            </Button>
          ) : null,
        ]}
      >
        {detailClone && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label={intl.formatMessage({ id: 'create.voiceClone.status.label', defaultMessage: '状态' })}>
                {getStatusLabel(detailClone.status)}
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: 'create.voiceClone.detailSpeakerId', defaultMessage: 'Speaker ID' })}>
                <Text copyable={{ text: detailClone.speakerId }} style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {detailClone.speakerId}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: 'create.voiceClone.detailSlotStatus', defaultMessage: '槽位状态' })}>
                {detailClone.slotActivatedAt || detailClone.status === 'Active'
                  ? intl.formatMessage({ id: 'create.voiceClone.detailSlotActivated', defaultMessage: '已激活（首次合成后不可重训）' })
                  : intl.formatMessage({ id: 'create.voiceClone.detailSlotPending', defaultMessage: '未激活（首次合成时将收取槽位费）' })}
              </Descriptions.Item>
              {detailClone.referenceText ? (
                <Descriptions.Item label={intl.formatMessage({ id: 'create.voiceClone.detailReferenceText', defaultMessage: '参考文本' })}>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{detailClone.referenceText}</Text>
                </Descriptions.Item>
              ) : null}
              {detailClone.failReason ? (
                <Descriptions.Item label={intl.formatMessage({ id: 'create.voiceClone.failReason', defaultMessage: '失败原因' })}>
                  <Text type="danger">{detailClone.failReason}</Text>
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            {detailClone.demoAudioUrl && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {intl.formatMessage({ id: 'create.voiceClone.detailDemo', defaultMessage: '试听音频' })}
                </Text>
                <audio controls preload="none" src={detailClone.demoAudioUrl} style={{ width: '100%' }} />
              </div>
            )}

            <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
              {isCloneRetrainable(detailClone)
                ? intl.formatMessage({ id: 'create.voiceClone.detailRetrainHint', defaultMessage: '可在同一槽位重新上传音频训练，不会重复收取槽位费。' })
                : intl.formatMessage({ id: 'create.voiceClone.detailRetrainDisabled', defaultMessage: '该音色已正式合成或正在训练，火山侧不支持重新训练。' })}
            </Text>
          </>
        )}
      </Modal>

      <Modal
        title={
          retrainCloneId
            ? intl.formatMessage({ id: 'create.voiceClone.retrainSection', defaultMessage: '重新训练音色' })
            : intl.formatMessage({ id: 'create.voiceClone.trainSection', defaultMessage: '训练音色' })
        }
        open={trainModalOpen}
        onCancel={closeTrainModal}
        footer={null}
        width={720}
        destroyOnClose
        centered
      >
        <Spin spinning={trainLoading}>
          <Form form={trainForm} layout="vertical">
            <TrainFormGrid>
              <div>
                <Form.Item
                  name="name"
                  label={<FormattedMessage id="create.voiceClone.name" defaultMessage="音色名称" />}
                  rules={[{ required: true, message: intl.formatMessage({ id: 'create.voiceClone.nameRequired', defaultMessage: '请输入音色名称' }) }]}
                >
                  <Input maxLength={128} placeholder={intl.formatMessage({ id: 'create.voiceClone.namePlaceholder', defaultMessage: '例如：我的声音' })} />
                </Form.Item>

                <Form.Item
                  name="referenceText"
                  label={<FormattedMessage id="create.voiceClone.referenceText" defaultMessage="参考文本" />}
                  rules={[{ required: true, message: intl.formatMessage({ id: 'create.voiceClone.referenceTextRequired', defaultMessage: '请输入与音频一致的参考文本' }) }]}
                >
                  <TextArea
                    rows={5}
                    maxLength={2000}
                    showCount
                    placeholder={intl.formatMessage({ id: 'create.voiceClone.referenceTextPlaceholder', defaultMessage: '输入与参考音频内容完全一致的文本...' })}
                  />
                </Form.Item>
              </div>

              <div>
                <Form.Item label={<FormattedMessage id="create.voiceClone.uploadAudio" defaultMessage="参考音频" />} required style={{ marginBottom: 0 }}>
                  <AudioInputTabs>
                    <Segmented
                      block
                      value={audioInputMode}
                      onChange={value => {
                        const mode = value as AudioInputMode;
                        setAudioInputMode(mode);
                        if (mode === 'upload') {
                          clearRecordedAudio();
                        } else {
                          clearUploadedFile();
                        }
                      }}
                      options={[
                        {
                          label: (
                            <span>
                              <UploadOutlined style={{ marginRight: 6 }} />
                              <FormattedMessage id="create.voiceClone.audioUpload" defaultMessage="上传文件" />
                            </span>
                          ),
                          value: 'upload',
                        },
                        {
                          label: (
                            <span>
                              <AudioOutlined style={{ marginRight: 6 }} />
                              <FormattedMessage id="create.voiceClone.audioRecord" defaultMessage="现场录音" />
                            </span>
                          ),
                          value: 'record',
                        },
                      ]}
                    />
                  </AudioInputTabs>

                  {audioInputMode === 'upload' ? (
                    <>
                      <input
                        ref={uploadFileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.aac"
                        style={{ display: 'none' }}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            applyUploadedFile(file);
                          }
                          event.target.value = '';
                        }}
                      />
                      {uploadedTrainingFile ? (
                        <UploadedAudioPreview
                          file={uploadedTrainingFile}
                          onRemove={clearUploadedFile}
                          onReplace={() => uploadFileInputRef.current?.click()}
                        />
                      ) : (
                        <Upload.Dragger
                          className="voice-clone-upload"
                          accept="audio/*,.mp3,.wav,.m4a,.aac"
                          maxCount={1}
                          fileList={audioFileList}
                          beforeUpload={() => false}
                          showUploadList={false}
                          onChange={({ fileList }) => {
                            const latest = fileList.slice(-1)[0];
                            if (latest?.originFileObj) {
                              applyUploadedFile(latest.originFileObj as File);
                            } else {
                              clearUploadedFile();
                            }
                          }}
                        >
                          <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                          </p>
                          <p className="ant-upload-text">
                            <FormattedMessage id="create.voiceClone.uploadHint" defaultMessage="点击或拖拽上传音频（mp3/wav/m4a/aac）" />
                          </p>
                          <p className="ant-upload-hint">
                            <FormattedMessage id="create.voiceClone.uploadDesc" defaultMessage="建议 10–30 秒清晰人声，背景噪音少" />
                          </p>
                        </Upload.Dragger>
                      )}
                    </>
                  ) : (
                    <AudioRecordPanel
                      value={recordedAudio}
                      onChange={next => {
                        setRecordedAudio(next);
                        if (next) {
                          clearUploadedFile();
                        }
                      }}
                    />
                  )}
                </Form.Item>
                <TrainTips>
                  {retrainCloneId ? (
                    <li>
                      <FormattedMessage
                        id="create.voiceClone.retrainTip"
                        defaultMessage="将在同一音色槽位重新训练，不会重复收取槽位费；正式合成后无法再重新训练"
                      />
                    </li>
                  ) : null}
                  <li>
                    <FormattedMessage id="create.voiceClone.tip1" defaultMessage="音频与参考文本内容需完全一致" />
                  </li>
                  <li>
                    <FormattedMessage id="create.voiceClone.tip2" defaultMessage="建议使用无背景音乐的单人清晰录音" />
                  </li>
                  <li>
                    <FormattedMessage id="create.voiceClone.tip3" defaultMessage="训练完成后可在上方音色库中选择使用" />
                  </li>
                </TrainTips>
              </div>
            </TrainFormGrid>

            <EstimatedPriceHint
              price={trainEstimatedPrice}
              tokenBalance={tokenBalance}
              balanceLoading={balanceLoading}
            />

            <GenerateButton style={{ marginTop: 20 }}>
              <Button type="primary" size="large" block icon={<AudioOutlined />} loading={trainLoading} onClick={handleTrain}>
                {retrainCloneId
                  ? intl.formatMessage({ id: 'create.voiceClone.startRetrain', defaultMessage: '提交重新训练' })
                  : intl.formatMessage({ id: 'create.voiceClone.startTrain', defaultMessage: '开始训练' })}
              </Button>
            </GenerateButton>
          </Form>
        </Spin>
      </Modal>

      <InsufficientBalanceModal
        open={insufficientBalanceOpen}
        onCancel={closeInsufficientBalanceModal}
        requiredTokens={insufficientBalanceRequired}
        tokenBalance={insufficientBalanceModalBalance}
      />

      <EngineSelectionModal
        open={engineModalOpen}
        onClose={() => setEngineModalOpen(false)}
        engines={engines}
        selectedEngine={selectedEngine}
        locale={locale}
        loading={enginesLoading}
        onSelect={handleEngineChange}
        onShowDetail={(engine) => setEngineDetail(engine)}
        titleMessageId="create.voiceClone.selectEngine"
        titleDefaultMessage="选择声音复刻引擎"
        searchPlaceholderMessageId="create.voiceClone.engineSearch"
        searchPlaceholderDefaultMessage="搜索引擎名称或描述..."
        searchEmptyMessageId="create.voiceClone.engineSearchEmpty"
        searchEmptyDefaultMessage="未找到匹配的引擎"
        detailMessageId="create.voiceClone.engineDetail"
        detailDefaultMessage="查看详情"
        badgeText="VClone"
        badgeBg="rgba(114, 46, 209, 0.85)"
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
    </PageWrap>
  );
};

export default VoiceClone;
