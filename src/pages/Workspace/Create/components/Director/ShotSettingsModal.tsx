import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Tabs, Tag, Typography, message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import directorApi, { DirectorCharacter, DirectorEpisode, DirectorScene, DirectorShot } from 'api/director';
import { ApplyStoryboardShotPayload } from './storyboardAgentUtils';
import ScriptAgentPanel from './ScriptAgentPanel';
import ShotVisualPanel from './ShotVisualPanel';
import ShotVideoGenerateModal from './ShotVideoGenerateModal';
import type { ShotStudioTab } from './shotStudioShared';
import {
  buildProductionPromptPreview,
  getCameraMotionOptions,
  getShotSizeOptions,
  normalizeCameraMotion,
  normalizeShotSize,
} from './shotProductionEnums';

const { Text, Paragraph } = Typography;

const FormSection = styled.div`
  padding: 14px 14px 2px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.015);

  .dark & {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  & + & {
    margin-top: 12px;
  }
`;

const SectionTitle = styled.div`
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);

  .dark & {
    color: rgba(255, 255, 255, 0.88);
  }
`;

const PreviewPanel = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: rgba(0, 0, 0, 0.65);

  .dark & {
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.65);
  }
`;

const SceneContextBanner = styled.div`
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.06);

  .dark & {
    border-color: rgba(59, 130, 246, 0.35);
    background: rgba(59, 130, 246, 0.1);
  }
`;

const SceneContextMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
`;

const SceneScriptPreview = styled(Paragraph)`
  && {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: rgba(0, 0, 0, 0.65);
  }

  .dark & {
    color: rgba(255, 255, 255, 0.65);
  }
`;
export type ShotSettingsModalMode = 'create' | 'edit';

interface ShotSettingsModalProps {
  open: boolean;
  mode?: ShotSettingsModalMode;
  shot?: DirectorShot | null;
  scene?: DirectorScene | null;
  episode?: DirectorEpisode | null;
  scenes: DirectorScene[];
  characters: DirectorCharacter[];
  shotCountForScene: number;
  defaultShotNo?: string;
  aspectRatio?: string;
  stylePrompt?: string | null;
  initialTab?: ShotStudioTab;
  defaultT2iModelCode?: string | null;
  defaultI2vModelCode?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const ShotSettingsModal: React.FC<ShotSettingsModalProps> = ({
  open,
  mode = 'edit',
  shot,
  scene,
  episode,
  scenes,
  characters,
  shotCountForScene,
  defaultShotNo = '',
  aspectRatio = '16:9',
  stylePrompt,
  initialTab = 'script',
  defaultT2iModelCode,
  defaultI2vModelCode,
  onClose,
  onSaved,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ShotStudioTab>(initialTab);
  const isCreate = mode === 'create';
  const watchedPrompt = Form.useWatch('prompt', form);
  const watchedDescription = Form.useWatch('description', form);
  const watchedDialogue = Form.useWatch('dialogue', form);
  const watchedShotSize = Form.useWatch('shotSize', form);
  const watchedCameraMotion = Form.useWatch('cameraMotion', form);

  const shotSizeOptions = useMemo(() => getShotSizeOptions(intl), [intl]);
  const cameraMotionOptions = useMemo(() => getCameraMotionOptions(intl), [intl]);
  const productionPreviewParams = useMemo(
    () => ({
      prompt: watchedPrompt,
      description: watchedDescription,
      dialogue: watchedDialogue,
      shotSize: watchedShotSize,
      cameraMotion: watchedCameraMotion,
    }),
    [watchedPrompt, watchedDescription, watchedDialogue, watchedShotSize, watchedCameraMotion]
  );
  const productionPromptPreview = useMemo(
    () => buildProductionPromptPreview(productionPreviewParams),
    [productionPreviewParams]
  );

  const keyframeGeneratePrompt = useMemo(() => {
    const production = productionPromptPreview;
    const trimmedStyle = stylePrompt?.trim();
    if (trimmedStyle && production) return `${trimmedStyle}, ${production}`;
    return production || trimmedStyle || '';
  }, [productionPromptPreview, stylePrompt]);

  const videoProductionPrompt = keyframeGeneratePrompt;

  useEffect(() => {
    if (!open) return;
    setActiveTab(isCreate ? 'script' : initialTab);
  }, [open, initialTab, isCreate]);

  useEffect(() => {
    if (!open) return;
    if (isCreate) {
      form.setFieldsValue({
        shotNo: defaultShotNo,
        description: '',
        prompt: '',
        dialogue: '',
        durationSec: 5,
        shotSize: 'medium',
        cameraMotion: 'none',
      });
      return;
    }
    if (shot) {
      form.setFieldsValue({
        shotNo: shot.shotNo,
        description: shot.description || '',
        prompt: shot.prompt || '',
        dialogue: shot.dialogue || '',
        durationSec: shot.durationSec ?? 5,
        shotSize: normalizeShotSize(shot.shotSize) || undefined,
        cameraMotion: normalizeCameraMotion(shot.cameraMotion) || 'none',
      });
    }
  }, [open, isCreate, shot, defaultShotNo, form]);

  const serializeShotProductionFields = (values: {
    shotSize?: string;
    cameraMotion?: string;
  }) => ({
    shotSize: normalizeShotSize(values.shotSize) || null,
    cameraMotion: normalizeCameraMotion(values.cameraMotion) || 'none',
  });

  const handleSave = async () => {
    const values = await form.validateFields();
    const productionFields = serializeShotProductionFields(values);
    setSaving(true);
    try {
      if (isCreate) {
        if (!episode?.id || !scene?.id) return;
        const res = await directorApi.createShot(episode.id, {
          shotNo: values.shotNo?.trim(),
          sceneId: scene.id,
          description: values.description?.trim() || null,
          prompt: values.prompt?.trim() || null,
          dialogue: values.dialogue?.trim() || null,
          durationSec: values.durationSec,
          shotSize: productionFields.shotSize,
          cameraMotion: productionFields.cameraMotion,
        });
        if (res.success) {
          message.success(intl.formatMessage({ id: 'director.shot.created', defaultMessage: '镜头已添加' }));
          onSaved();
          onClose();
        } else {
          message.error(res.message);
        }
        return;
      }

      if (!shot) return;
      const res = await directorApi.updateShot(shot.id, {
        description: values.description?.trim() || null,
        prompt: values.prompt?.trim() || null,
        dialogue: values.dialogue?.trim() || null,
        durationSec: values.durationSec,
        shotSize: productionFields.shotSize,
        cameraMotion: productionFields.cameraMotion,
      });
      if (res.success) {
        message.success(intl.formatMessage({ id: 'director.shot.saved', defaultMessage: '分镜已保存' }));
        onSaved();
        if (isCreate) onClose();
      } else {
        message.error(res.message);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const applyShotFields = (fields: Partial<ApplyStoryboardShotPayload>) => {
    form.setFieldsValue({
      description: fields.description ?? form.getFieldValue('description'),
      prompt: fields.prompt ?? form.getFieldValue('prompt'),
      dialogue: fields.dialogue ?? form.getFieldValue('dialogue'),
      durationSec: fields.durationSec ?? form.getFieldValue('durationSec'),
      shotSize: normalizeShotSize(fields.shotSize) ?? form.getFieldValue('shotSize'),
      cameraMotion: normalizeCameraMotion(fields.cameraMotion) ?? form.getFieldValue('cameraMotion'),
    });
  };

  const scriptForm = (
    <Form form={form} layout="vertical" requiredMark={false}>
      <FormSection>
        <SectionTitle>
          <FormattedMessage id="director.shot.section.basic" defaultMessage="基本信息" />
        </SectionTitle>
        <Row gutter={12}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="shotNo"
              label={intl.formatMessage({ id: 'director.shot.no', defaultMessage: '镜号' })}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: 'director.shot.shotNoRequired', defaultMessage: '请输入镜号' }),
                },
              ]}
            >
              <Input
                disabled={!isCreate}
                placeholder={intl.formatMessage({
                  id: 'director.shot.shotNoPlaceholder',
                  defaultMessage: '例如：1-1、1-2',
                })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="durationSec" label={intl.formatMessage({ id: 'director.shot.duration', defaultMessage: '时长' })}>
              <InputNumber min={1} max={60} addonAfter="s" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <FormattedMessage id="director.shot.section.camera" defaultMessage="镜头参数" />
        </SectionTitle>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item name="shotSize" label={intl.formatMessage({ id: 'director.shot.size', defaultMessage: '景别' })}>
              <Select
                allowClear
                style={{ width: '100%' }}
                popupMatchSelectWidth={false}
                dropdownStyle={{ minWidth: 168 }}
                placeholder={intl.formatMessage({ id: 'director.shot.sizePlaceholder', defaultMessage: '选择景别' })}
                options={shotSizeOptions}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="cameraMotion" label={intl.formatMessage({ id: 'director.shot.motion', defaultMessage: '运镜' })}>
              <Select
                style={{ width: '100%' }}
                popupMatchSelectWidth={false}
                dropdownStyle={{ minWidth: 200 }}
                options={cameraMotionOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <FormattedMessage id="director.shot.section.content" defaultMessage="画面内容" />
        </SectionTitle>
        <Form.Item name="description" label={intl.formatMessage({ id: 'director.shot.description', defaultMessage: '画面描述' })}>
          <Input.TextArea
            rows={3}
            placeholder={intl.formatMessage({
              id: 'director.shot.descriptionPlaceholder',
              defaultMessage: '描述这一镜的画面、动作与氛围',
            })}
          />
        </Form.Item>
        <Form.Item name="dialogue" label={intl.formatMessage({ id: 'director.shot.dialogue', defaultMessage: '对白' })}>
          <Input.TextArea
            rows={2}
            placeholder={intl.formatMessage({
              id: 'director.shot.dialoguePlaceholder',
              defaultMessage: '角色台词，无对白可留空',
            })}
          />
        </Form.Item>
        <Form.Item
          name="prompt"
          label={intl.formatMessage({ id: 'director.shot.prompt', defaultMessage: '生成提示词' })}
          extra={intl.formatMessage({
            id: 'director.shot.promptStudioHint',
            defaultMessage: '将自动用于「画面」文生图与「视频」生成，无需重复填写',
          })}
        >
          <Input.TextArea
            rows={2}
            placeholder={intl.formatMessage({
              id: 'director.shot.promptPlaceholder',
              defaultMessage: '补充风格、光影等生成细节（可选）',
            })}
          />
        </Form.Item>
        {productionPromptPreview ? (
          <PreviewPanel>{productionPromptPreview}</PreviewPanel>
        ) : null}
      </FormSection>
    </Form>
  );

  if (!scene) return null;
  if (!isCreate && !shot) return null;

  const contextScene = scene;
  const contextShot = shot;

  return (
    <Modal
      title={
        isCreate
          ? intl.formatMessage({ id: 'director.shot.createTitle', defaultMessage: '添加镜头' })
          : intl.formatMessage(
              { id: 'director.shot.studioTitle', defaultMessage: '分镜工作台 · {shotNo}' },
              { shotNo: contextShot?.shotNo }
            )
      }
      open={open}
      onCancel={onClose}
      width={isCreate ? 720 : 1180}
      destroyOnClose
      footer={
        activeTab === 'script' || isCreate ? (
          <Space>
            <Button onClick={onClose}>
              <FormattedMessage id="common.cancel" defaultMessage="取消" />
            </Button>
            <Button type="primary" loading={saving} onClick={handleSave}>
              <FormattedMessage id="common.save" defaultMessage="保存" />
            </Button>
          </Space>
        ) : (
          <Button onClick={onClose}>
            <FormattedMessage id="common.close" defaultMessage="关闭" />
          </Button>
        )
      }
    >
      <SceneContextBanner>
        <Text strong style={{ fontSize: 13 }}>
          <FormattedMessage id="director.shot.sceneContextTitle" defaultMessage="所属场景" />
        </Text>
        {episode ? (
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            {episode.title || intl.formatMessage({ id: 'director.episode.noTag', defaultMessage: '第 {no} 集' }, { no: episode.episodeNo })}
          </Text>
        ) : null}
        <SceneContextMeta>
          <Tag color="blue">
            {intl.formatMessage({ id: 'director.script.sceneNo', defaultMessage: '第 {no} 场' }, { no: contextScene.sceneNo })}
          </Tag>
          {contextScene.location ? (
            <Tag>
              {intl.formatMessage({ id: 'director.script.location', defaultMessage: '场景' })}：{contextScene.location}
            </Tag>
          ) : null}
          {contextScene.timeOfDay ? (
            <Tag>
              {intl.formatMessage({ id: 'director.script.timeOfDay', defaultMessage: '时间' })}：{contextScene.timeOfDay}
            </Tag>
          ) : null}
          <Tag>
            {intl.formatMessage(
              { id: 'director.shot.sceneShotCount', defaultMessage: '本场 {count} 镜' },
              { count: shotCountForScene }
            )}
          </Tag>
          {!isCreate && contextShot?.status ? (
            <Tag color={contextShot.status === 'approved' ? 'success' : contextShot.status === 'failed' ? 'error' : 'default'}>
              {intl.formatMessage({ id: 'director.shot.status', defaultMessage: '状态' })}：{contextShot.status}
            </Tag>
          ) : null}
        </SceneContextMeta>
        {contextScene.scriptContent ? (
          <SceneScriptPreview ellipsis={{ rows: 3, tooltip: contextScene.scriptContent }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <FormattedMessage id="director.script.content" defaultMessage="剧本内容" />：
            </Text>{' '}
            {contextScene.scriptContent}
          </SceneScriptPreview>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            <FormattedMessage id="director.shot.noSceneScript" defaultMessage="该场景暂无剧本内容" />
          </Text>
        )}
      </SceneContextBanner>

      {isCreate ? (
        scriptForm
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ShotStudioTab)}
          items={[
            {
              key: 'script',
              label: intl.formatMessage({ id: 'director.shot.tab.script', defaultMessage: '脚本' }),
              children: scriptForm,
            },
            {
              key: 'visual',
              label: intl.formatMessage({ id: 'director.shot.tab.visual', defaultMessage: '画面' }),
              children: contextShot ? (
                <ShotVisualPanel
                  shot={contextShot}
                  aspectRatio={aspectRatio}
                  keyframePrompt={keyframeGeneratePrompt}
                  defaultT2iModelCode={defaultT2iModelCode}
                  active={activeTab === 'visual'}
                  onSaved={onSaved}
                />
              ) : null,
            },
            {
              key: 'video',
              label: intl.formatMessage({ id: 'director.shot.tab.video', defaultMessage: '视频' }),
              children: contextShot ? (
                <ShotVideoGenerateModal
                  embedded
                  active={activeTab === 'video'}
                  shot={contextShot}
                  productionPrompt={videoProductionPrompt}
                  characters={characters}
                  aspectRatio={aspectRatio}
                  defaultI2vModelCode={defaultI2vModelCode}
                  onApplied={onSaved}
                  onGoToVisual={() => setActiveTab('visual')}
                />
              ) : null,
            },
          ]}
        />
      )}

      {!isCreate && contextShot && activeTab === 'script' ? (
        <ScriptAgentPanel
          variant="shot"
          episode={episode}
          scene={contextScene}
          scenes={scenes}
          characters={characters}
          existingShotCountForScene={shotCountForScene}
          shotNo={contextShot.shotNo}
          onShotFieldsApply={applyShotFields}
          onDataSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
};

export default ShotSettingsModal;
