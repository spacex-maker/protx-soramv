import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Space, message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import directorApi, { DirectorCharacter, DirectorEpisode, DirectorScene } from 'api/director';
import { ApplyScenePayload } from './storyboardAgentUtils';
import ScriptAgentPanel from './ScriptAgentPanel';

interface SceneSettingsModalProps {
  open: boolean;
  scene?: DirectorScene | null;
  episode?: DirectorEpisode | null;
  scenes: DirectorScene[];
  characters: DirectorCharacter[];
  shotCount: number;
  onClose: () => void;
  onSaved: () => void;
}

const SceneSettingsModal: React.FC<SceneSettingsModalProps> = ({
  open,
  scene,
  episode,
  scenes,
  characters,
  shotCount,
  onClose,
  onSaved,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && scene) {
      form.setFieldsValue({
        location: scene.location || '',
        timeOfDay: scene.timeOfDay || '',
        scriptContent: scene.scriptContent || '',
      });
    }
  }, [open, scene, form]);

  const handleSave = async () => {
    if (!scene) return;
    const values = await form.validateFields();
    setSaving(true);
    try {
      const res = await directorApi.updateScene(scene.id, {
        location: values.location?.trim() || null,
        timeOfDay: values.timeOfDay?.trim() || null,
        scriptContent: values.scriptContent,
      });
      if (res.success) {
        message.success(intl.formatMessage({ id: 'director.script.sceneSaved', defaultMessage: '场次已保存' }));
        onSaved();
        onClose();
      } else {
        message.error(res.message);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message) message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const applySceneFields = (fields: Partial<ApplyScenePayload>) => {
    form.setFieldsValue({
      location: fields.location ?? form.getFieldValue('location'),
      timeOfDay: fields.timeOfDay ?? form.getFieldValue('timeOfDay'),
      scriptContent: fields.scriptContent ?? form.getFieldValue('scriptContent'),
    });
  };

  if (!scene) return null;

  return (
    <Modal
      title={intl.formatMessage(
        { id: 'director.scene.settingsTitle', defaultMessage: '场景设置 · 第 {no} 场' },
        { no: scene.sceneNo }
      )}
      open={open}
      onCancel={onClose}
      width={720}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>
            <FormattedMessage id="common.cancel" defaultMessage="取消" />
          </Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            <FormattedMessage id="common.save" defaultMessage="保存" />
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="location" label={intl.formatMessage({ id: 'director.script.location', defaultMessage: '场景' })}>
          <Input placeholder={intl.formatMessage({ id: 'director.script.locationPlaceholder', defaultMessage: '例如：学校教室、街道' })} />
        </Form.Item>
        <Form.Item name="timeOfDay" label={intl.formatMessage({ id: 'director.script.timeOfDay', defaultMessage: '时间' })}>
          <Input placeholder={intl.formatMessage({ id: 'director.script.timeOfDayPlaceholder', defaultMessage: '日 / 夜 / 晨' })} />
        </Form.Item>
        <Form.Item name="scriptContent" label={intl.formatMessage({ id: 'director.script.content', defaultMessage: '剧本内容' })}>
          <Input.TextArea rows={8} placeholder={intl.formatMessage({ id: 'director.script.contentPlaceholder', defaultMessage: '场次描述、对白、动作指示…' })} />
        </Form.Item>
      </Form>

      <ScriptAgentPanel
        variant="scene"
        episode={episode}
        scene={scene}
        scenes={scenes}
        characters={characters}
        existingShotCountForScene={shotCount}
        onSceneFieldsApply={applySceneFields}
        onDataSaved={onSaved}
      />
    </Modal>
  );
};

export default SceneSettingsModal;
