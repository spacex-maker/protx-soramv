import React, { useEffect, useState } from 'react';
import { Avatar, Button, Form, Input, InputNumber, Progress, Space, Switch, Tag, Typography, message } from 'antd';
import { ClockCircleOutlined, SaveOutlined, WalletOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import dayjs from 'dayjs';
import {
  AiOperatorBudgetStatus,
  getChannelAiOperatorBudget,
  saveChannelAiOperatorBudget,
} from 'api/communityAiOperator';

const { Text } = Typography;

const Panel = styled.div`
  border-radius: 10px;
  border: 1px solid ${(p) => (p.theme.mode === 'dark' ? '#2a2a2a' : '#eee')};
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
  padding: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
`;

const BreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const BreakdownItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa')};
  font-size: 13px;
`;

const BreakdownMain = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const BreakdownInfo = styled.div`
  min-width: 0;
  flex: 1;

  .name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    font-size: 11px;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)')};
  }
`;

interface ChannelAiOperatorBudgetPanelProps {
  channelId?: number;
  refreshKey?: number;
  onUpdated?: () => void;
}

const ChannelAiOperatorBudgetPanel: React.FC<ChannelAiOperatorBudgetPanelProps> = ({
  channelId,
  refreshKey,
  onUpdated,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<AiOperatorBudgetStatus | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [remark, setRemark] = useState('');

  const loadBudget = async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const data = await getChannelAiOperatorBudget(channelId);
      setStatus(data);
      setEnabled(Boolean(data.enabled));
      setBudgetLimit(data.budgetLimit && data.budgetLimit > 0 ? data.budgetLimit : null);
      setWarningThreshold(data.warningThresholdPercent ?? 80);
      setRemark(data.remark || '');
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'community.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, [channelId, refreshKey]);

  const handleSave = async () => {
    if (!channelId) return;
    setSaving(true);
    try {
      const data = await saveChannelAiOperatorBudget({
        channelId,
        enabled,
        periodType: 'DAILY',
        budgetLimit: enabled ? (budgetLimit ?? 0) : 0,
        warningThresholdPercent: warningThreshold,
        exceedAction: 'BLOCK',
        remark: remark.trim() || undefined,
      });
      setStatus(data);
      message.success(intl.formatMessage({ id: 'community.aiOperator.budget.saveSuccess', defaultMessage: '预算配置已保存' }));
      onUpdated?.();
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setSaving(false);
    }
  };

  const used = status?.usedTokens ?? 0;
  const limit = status?.budgetLimit ?? 0;
  const percent = status?.usagePercent ?? 0;
  const unlimited = !enabled || !limit;

  return (
    <Panel>
      <Space style={{ marginBottom: 12 }}>
        <WalletOutlined />
        <Text strong>
          <FormattedMessage id="community.aiOperator.budget.title" defaultMessage="频道预算" />
        </Text>
        {status?.periodKey && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {status.periodKey}
          </Text>
        )}
      </Space>

      <SummaryRow>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Progress
            percent={unlimited ? 0 : percent}
            status={status?.exceeded ? 'exception' : status?.warning ? 'active' : 'normal'}
            format={() => (unlimited
              ? intl.formatMessage({ id: 'community.aiOperator.budget.unlimited', defaultMessage: '未启用' })
              : `${used} / ${limit}`)}
          />
        </div>
        {!unlimited && status?.remainingTokens != null && (
          <Tag color={status.exceeded ? 'error' : status.warning ? 'warning' : 'blue'}>
            <FormattedMessage
              id="community.aiOperator.budget.remaining"
              defaultMessage="剩余 {amount} Token"
              values={{ amount: status.remainingTokens }}
            />
          </Tag>
        )}
      </SummaryRow>

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        <FormattedMessage
          id="community.aiOperator.budget.hint"
          defaultMessage="频道内所有 AI 运营共享此预算。超额后自动/手动发帖将被拦截。"
        />
      </Text>

      <Form layout="vertical" disabled={loading}>
        <Form.Item
          label={intl.formatMessage({ id: 'community.aiOperator.budget.enabled', defaultMessage: '启用频道预算' })}
        >
          <Switch checked={enabled} onChange={setEnabled} />
        </Form.Item>
        {enabled && (
          <>
            <Form.Item
              label={intl.formatMessage({ id: 'community.aiOperator.budget.dailyLimit', defaultMessage: '每日 Token 上限' })}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={99999999}
                value={budgetLimit}
                onChange={(v) => setBudgetLimit(v)}
                placeholder="1000"
              />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'community.aiOperator.budget.warningAt', defaultMessage: '预警阈值 (%)' })}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={50}
                max={99}
                value={warningThreshold}
                onChange={(v) => setWarningThreshold(v ?? 80)}
              />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'community.aiOperator.budget.remark', defaultMessage: '备注' })}>
              <Input.TextArea
                rows={2}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                maxLength={200}
              />
            </Form.Item>
          </>
        )}
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
          <FormattedMessage id="common.save" defaultMessage="保存" />
        </Button>
      </Form>

      {status?.operatorBreakdown && status.operatorBreakdown.length > 0 && (
        <>
          <Text strong style={{ display: 'block', marginTop: 20, marginBottom: 8, fontSize: 13 }}>
            <FormattedMessage id="community.aiOperator.budget.breakdown" defaultMessage="各运营用量" />
          </Text>
          <BreakdownList>
            {status.operatorBreakdown.map((item) => (
              <BreakdownItem key={item.operatorId}>
                <BreakdownMain>
                  <Avatar src={item.avatar} size={36} style={{ flexShrink: 0 }}>
                    {(item.displayName || '?')[0]}
                  </Avatar>
                  <BreakdownInfo>
                    <div className="name">{item.displayName || `#${item.operatorId}`}</div>
                    <div className="meta">
                      <ClockCircleOutlined style={{ fontSize: 11 }} />
                      {item.lastPostTime ? (
                        <FormattedMessage
                          id="community.aiOperator.budget.lastPost"
                          defaultMessage="最后发帖 {time}"
                          values={{ time: dayjs(item.lastPostTime).format('YYYY-MM-DD HH:mm') }}
                        />
                      ) : (
                        <FormattedMessage
                          id="community.aiOperator.budget.noPostYet"
                          defaultMessage="暂无发帖"
                        />
                      )}
                    </div>
                  </BreakdownInfo>
                </BreakdownMain>
                <Tag color={item.status ? 'green' : 'default'} style={{ margin: 0, flexShrink: 0 }}>
                  {item.usedTokens ?? 0} Token
                </Tag>
              </BreakdownItem>
            ))}
          </BreakdownList>
        </>
      )}
    </Panel>
  );
};

export default ChannelAiOperatorBudgetPanel;
