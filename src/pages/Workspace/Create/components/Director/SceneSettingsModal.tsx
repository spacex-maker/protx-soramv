import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Space, message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import directorApi, { DirectorCharacter, DirectorEpisode, DirectorScene, DirectorSceneReferenceImage } from 'api/director';
import { ApplyScenePayload } from './storyboardAgentUtils';
import SceneReferenceImagesEditor from './SceneReferenceImagesEditor';
import { areSceneReferenceImagesEqual, fetchSceneReferenceImagesSafe, mergeSceneReferenceImages, toSceneReferenceSavePayload } from './sceneReferenceUtils';
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
  const [referenceImages, setReferenceImages] = useState<DirectorSceneReferenceImage[]>([]);
  const [savedReferenceImages, setSavedReferenceImages] = useState<DirectorSceneReferenceImage[]>([]);
  const [refsLoading, setRefsLoading] = useState(false);

  useEffect(() => {
    if (!open || !scene) return;

    form.setFieldsValue({
      location: scene.location || '',
      timeOfDay: scene.timeOfDay || '',
      scriptContent: scene.scriptContent || '',
    });

    const initialRefs = mergeSceneReferenceImages(scene.referenceImages);
    setReferenceImages(initialRefs);
    setSavedReferenceImages(initialRefs);

    if (initialRefs.length > 0) return;

    let cancelled = false;
    setRefsLoading(true);
    fetchSceneReferenceImagesSafe(scene.id)
      .then((loaded) => {
        if (cancelled) return;
        setReferenceImages(loaded);
        setSavedReferenceImages(loaded);
      })
      .finally(() => {
        if (!cancelled) setRefsLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
      if (!res.success) {
        message.error(res.message);
        return;
      }

      const refsDirty = !areSceneReferenceImagesEqual(referenceImages, savedReferenceImages);
      if (refsDirty) {
        const refRes = await directorApi.replaceSceneReferenceImages(scene.id, {
          images: toSceneReferenceSavePayload(referenceImages),
        });
        if (!refRes.success) {
          message.warning(
            refRes.message ||
              intl.formatMessage({
                id: 'director.scene.referenceImages.saveFailed',
                defaultMessage: '场景已保存，但参考图保存失败',
              })
          );
          onSaved();
          onClose();
          return;
        }
        setSavedReferenceImages(mergeSceneReferenceImages(null, refRes.data));
      }

      message.success(intl.formatMessage({ id: 'director.script.sceneSaved', defaultMessage: '场次已保存' }));
      onSaved();
      onClose();
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
        <Form.Item
          label={intl.formatMessage({ id: 'director.scene.referenceImages', defaultMessage: '场景参考图' })}
        >
          {refsLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <FormattedMessage id="director.scene.referenceImages.loading" defaultMessage="加载中…" />
            </div>
          ) : (
            <SceneReferenceImagesEditor value={referenceImages} onChange={setReferenceImages} />
          )}
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
