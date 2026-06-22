import React, { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import directorApi, { DirectorCharacter, DirectorEpisode, DirectorScene } from 'api/director';
import {
  AgentPendingPreview,
  ApplyScenePayload,
  ApplyStoryboardShotPayload,
  buildPendingPreview,
} from './storyboardAgentUtils';

const { Text, Paragraph } = Typography;

const PreviewCard = styled.div`
  margin-top: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.05);

  .dark & {
    border-color: rgba(59, 130, 246, 0.35);
    background: rgba(59, 130, 246, 0.1);
  }
`;

const ChatBox = styled.div`
  max-height: 200px;
  overflow: auto;
  margin-bottom: 12px;
`;

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AgentPanelVariant = 'scene' | 'shot';

type AgentAction = 'refine_scene' | 'split_storyboard' | 'refine_shot';

interface ScriptAgentPanelProps {
  variant: AgentPanelVariant;
  episode?: DirectorEpisode | null;
  scene: DirectorScene;
  scenes: DirectorScene[];
  characters: DirectorCharacter[];
  existingShotCountForScene: number;
  shotNo?: string;
  onSceneFieldsApply?: (fields: Partial<ApplyScenePayload>) => void;
  onShotFieldsApply?: (fields: Partial<ApplyStoryboardShotPayload>) => void;
  onDataSaved: () => void;
}

const ScriptAgentPanel: React.FC<ScriptAgentPanelProps> = ({
  variant,
  episode,
  scene,
  scenes,
  characters,
  existingShotCountForScene,
  shotNo,
  onSceneFieldsApply,
  onShotFieldsApply,
  onDataSaved,
}) => {
  const intl = useIntl();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [input, setInput] = useState('');
  const [useProModel, setUseProModel] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<AgentPendingPreview | null>(null);
  const [savingPreview, setSavingPreview] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setMessages([]);
    setSessionId(undefined);
    setInput('');
    setPendingPreview(null);
  }, [scene.id, shotNo, variant]);

  const sendMessage = async (action?: AgentAction) => {
    if (!episode?.id) return;

    const defaultSceneMessage = intl.formatMessage(
      {
        id: 'director.agent.refineSceneDefault',
        defaultMessage: '扩写并优化第 {no} 场剧本，输出 JSON 对象：location, timeOfDay, scriptContent。',
      },
      { no: scene.sceneNo }
    );
    const defaultShotListMessage = intl.formatMessage(
      {
        id: 'director.agent.splitSceneDefault',
        defaultMessage: '根据第 {no} 场剧本，生成完整分镜 JSON 数组。',
      },
      { no: scene.sceneNo }
    );
    const defaultShotRefineMessage = intl.formatMessage(
      {
        id: 'director.agent.refineShotDefault',
        defaultMessage: '优化镜号 {shotNo} 的分镜，输出 JSON 对象：description, prompt, dialogue, durationSec, shotSize, cameraMotion。',
      },
      { shotNo: shotNo ?? '?' }
    );

    const userMsg =
      input.trim() ||
      (action === 'refine_scene'
        ? defaultSceneMessage
        : action === 'split_storyboard'
          ? defaultShotListMessage
          : action === 'refine_shot'
            ? defaultShotRefineMessage
            : '');

    if (!userMsg) return;

    setPendingPreview(null);
    const nextUserMsg: AgentMessage = { role: 'user', content: userMsg };
    setMessages((prev) => [...prev, nextUserMsg]);
    setInput('');

    const apiAction =
      action === 'refine_scene' || action === 'refine_shot' ? 'refine_dialogue' : action === 'split_storyboard' ? 'split_storyboard' : undefined;

    setRequesting(true);
    try {
      const res = await directorApi.agentChat({
        episodeId: episode.id,
        message: userMsg,
        action: apiAction,
        useProModel,
        sessionId,
        sceneId: action === 'split_storyboard' || variant === 'shot' ? scene.id : undefined,
      });

      if (res.success) {
        setSessionId(res.data.sessionId);
        const assistantMsg: AgentMessage = { role: 'assistant', content: res.data.reply };
        setMessages((prev) => [...prev, assistantMsg]);

        if (action) {
          const preview = buildPendingPreview(action, res.data.reply, scenes, characters, scene.id);
          setPendingPreview(preview);
          if (!preview) {
            message.warning(
              intl.formatMessage({ id: 'director.agent.parseFailed', defaultMessage: '未识别到可保存的结构化 JSON' })
            );
          }
        }

        if (res.data.tokenDeducted) {
          message.info(
            intl.formatMessage(
              { id: 'director.agent.tokenUsed', defaultMessage: '消耗 {tokens} Token' },
              { tokens: res.data.tokenDeducted }
            )
          );
        }
      } else {
        message.error(res.message);
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : '请求失败');
    } finally {
      setRequesting(false);
    }
  };

  const confirmReplaceShots = () =>
    new Promise<boolean>((resolve) => {
      if (existingShotCountForScene <= 0) {
        resolve(true);
        return;
      }
      Modal.confirm({
        title: intl.formatMessage({ id: 'director.agent.replaceShotsTitle', defaultMessage: '替换该场分镜？' }),
        content: intl.formatMessage(
          { id: 'director.agent.replaceShotsContent', defaultMessage: '该场已有 {count} 个镜头，保存后将替换为 {next} 个新镜头。' },
          { count: existingShotCountForScene, next: pendingPreview?.type === 'shots' ? pendingPreview.items.length : 0 }
        ),
        okText: intl.formatMessage({ id: 'director.agent.confirmSave', defaultMessage: '确认保存' }),
        cancelText: intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' }),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

  const handleConfirmSave = async () => {
    if (!episode?.id || !pendingPreview) return;

    setSavingPreview(true);
    try {
      if (pendingPreview.type === 'sceneDraft') {
        onSceneFieldsApply?.(pendingPreview.item);
        message.success(intl.formatMessage({ id: 'director.agent.sceneDraftApplied', defaultMessage: '已应用到场景表单，请确认后保存' }));
        setPendingPreview(null);
        return;
      }

      if (pendingPreview.type === 'shotDraft') {
        onShotFieldsApply?.(pendingPreview.item);
        message.success(intl.formatMessage({ id: 'director.agent.shotDraftApplied', defaultMessage: '已应用到分镜表单，请确认后保存' }));
        setPendingPreview(null);
        return;
      }

      if (pendingPreview.type === 'shots') {
        if (!(await confirmReplaceShots())) return;
        const res = await directorApi.applyStoryboard({
          episodeId: episode.id,
          sceneId: scene.id,
          replaceExisting: existingShotCountForScene > 0,
          shots: pendingPreview.items,
        });
        if (res.success) {
          message.success(
            intl.formatMessage(
              { id: 'director.agent.appliedSuccess', defaultMessage: '已写入 {count} 个分镜' },
              { count: res.data?.length ?? pendingPreview.items.length }
            )
          );
          setPendingPreview(null);
          onDataSaved();
        } else {
          message.error(res.message);
        }
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : intl.formatMessage({ id: 'director.agent.applyFailed', defaultMessage: '保存失败' }));
    } finally {
      setSavingPreview(false);
    }
  };

  const shotPreviewColumns = [
    { title: intl.formatMessage({ id: 'director.shot.no', defaultMessage: '镜号' }), dataIndex: 'shotNo', width: 70 },
    { title: 'Prompt', dataIndex: 'prompt', ellipsis: true },
    { title: intl.formatMessage({ id: 'director.shot.duration', defaultMessage: '时长' }), dataIndex: 'durationSec', width: 60 },
  ];

  return (
    <div>
      <Divider orientation="left" style={{ margin: '0 0 12px' }}>
        <Space size={8}>
          <FormattedMessage
            id={variant === 'scene' ? 'director.agent.sceneTitle' : 'director.agent.shotTitle'}
            defaultMessage={variant === 'scene' ? '场景 Agent' : '分镜 Agent'}
          />
          <Text type="secondary">Pro</Text>
          <Switch checked={useProModel} onChange={setUseProModel} size="small" />
        </Space>
      </Divider>

      {variant === 'scene' ? (
        <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }} size={8}>
          <Button loading={requesting} block onClick={() => sendMessage('refine_scene')}>
            <FormattedMessage id="director.agent.refineScene" defaultMessage="AI 扩写/优化本场剧本" />
          </Button>
          <Button loading={requesting} block onClick={() => sendMessage('split_storyboard')}>
            <FormattedMessage id="director.agent.splitSceneStoryboard" defaultMessage="AI 生成本场分镜" />
          </Button>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }} size={8}>
          <Button loading={requesting} block onClick={() => sendMessage('refine_shot')}>
            <FormattedMessage id="director.agent.refineShot" defaultMessage="AI 优化本分镜" />
          </Button>
        </Space>
      )}

      <ChatBox>
        {messages.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            <FormattedMessage id="director.agent.modalEmptyChat" defaultMessage="生成结果会显示在下方，确认后写入表单或保存。" />
          </Text>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 8, textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <Tag color={m.role === 'user' ? 'blue' : 'purple'}>{m.role === 'user' ? '你' : 'Agent'}</Tag>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 4, fontSize: 13 }}>{m.content}</div>
            </div>
          ))
        )}
      </ChatBox>

      {pendingPreview ? (
        <PreviewCard>
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            <Text strong>
              {pendingPreview.type === 'sceneDraft' ? (
                <FormattedMessage id="director.agent.previewSceneDraft" defaultMessage="预览 · 场景剧本（待确认）" />
              ) : pendingPreview.type === 'shotDraft' ? (
                <FormattedMessage id="director.agent.previewShotDraft" defaultMessage="预览 · 分镜字段（待确认）" />
              ) : (
                <FormattedMessage
                  id="director.agent.previewShots"
                  defaultMessage="预览 · 第 {scene} 场 {count} 镜（待确认）"
                  values={{ scene: scene.sceneNo, count: pendingPreview.items.length }}
                />
              )}
            </Text>
            {pendingPreview.type === 'shots' ? (
              <Table
                size="small"
                pagination={false}
                rowKey={(_, index) => String(index)}
                scroll={{ y: 140 }}
                dataSource={pendingPreview.items}
                columns={shotPreviewColumns}
              />
            ) : pendingPreview.type === 'sceneDraft' ? (
              <Paragraph style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                {pendingPreview.item.scriptContent || '—'}
              </Paragraph>
            ) : pendingPreview.type === 'shotDraft' ? (
              <Paragraph style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                {pendingPreview.item.prompt || pendingPreview.item.description || '—'}
              </Paragraph>
            ) : null}
            <Space wrap>
              <Button type="primary" loading={savingPreview} onClick={handleConfirmSave}>
                <FormattedMessage id="director.agent.confirmApply" defaultMessage="确认应用" />
              </Button>
              <Button onClick={() => setPendingPreview(null)}>
                <FormattedMessage id="director.agent.discardPreview" defaultMessage="放弃" />
              </Button>
            </Space>
          </Space>
        </PreviewCard>
      ) : null}

      <Input.TextArea
        rows={2}
        style={{ marginTop: 12 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={intl.formatMessage({
          id: 'director.agent.placeholder',
          defaultMessage: '补充要求，例如风格、节奏…',
        })}
      />
      <Button loading={requesting} style={{ marginTop: 8 }} onClick={() => sendMessage()}>
        <FormattedMessage id="director.agent.send" defaultMessage="自由对话" />
      </Button>
    </div>
  );
};

export default ScriptAgentPanel;
