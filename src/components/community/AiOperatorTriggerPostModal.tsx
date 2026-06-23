import React, { useEffect, useState } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, Switch, Row, Col, Typography, Tag, Space, message, theme,
} from 'antd';
import { ShopOutlined, RocketOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocale } from 'contexts/LocaleContext';
import { base } from 'api/base';
import {
  CommunityAiOperatorPromptMarketRequest,
  triggerChannelAiOperatorPost,
} from 'api/communityAiOperator';

const { TextArea } = Input;
const { Text } = Typography;

const LICENSE_OPTIONS = [
  { value: 1, labelKey: 'promptMarket.license.personal', defaultLabel: '仅供学习 (不可商用)' },
  { value: 2, labelKey: 'promptMarket.license.commercial', defaultLabel: '允许商用' },
  { value: 3, labelKey: 'promptMarket.license.exclusive', defaultLabel: '独家买断' },
];

const parseTagLabel = (
  tagNameI18n: string | Record<string, string> | undefined,
  lang?: string
): string => {
  if (!tagNameI18n) return '';
  try {
    const o = typeof tagNameI18n === 'string' ? JSON.parse(tagNameI18n) : tagNameI18n;
    const isZh = lang === 'zh';
    return (isZh ? (o?.zh || o?.en || o?.label) : (o?.en || o?.zh || o?.label)) || '';
  } catch {
    return String(tagNameI18n);
  }
};

export interface AiOperatorTriggerPostModalProps {
  open: boolean;
  operatorId: number | null;
  operatorName?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

const AiOperatorTriggerPostModal: React.FC<AiOperatorTriggerPostModalProps> = ({
  open,
  operatorId,
  operatorName,
  onCancel,
  onSuccess,
}) => {
  const intl = useIntl();
  const { locale } = useLocale();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [tagOptions, setTagOptions] = useState<{ value: string; label: string }[]>([]);
  const [recommendTags, setRecommendTags] = useState<{ value: string; label: string }[]>([]);

  const publishToPromptMarket = Form.useWatch('publishToPromptMarket', form);
  const priceToken = Form.useWatch('priceToken', form);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }
    form.setFieldsValue({
      publishToPromptMarket: false,
      licenseType: 1,
      priceToken: 100,
      isPromptHidden: true,
    });
  }, [open, form]);

  useEffect(() => {
    if (!open) return;
    const lang = locale || 'zh';
    const toOption = (item: { id?: number; tagCode?: string; tagNameI18n?: string }): { value: string; label: string } => ({
      value: item.tagCode != null ? String(item.tagCode) : (item.id != null ? String(item.id) : ''),
      label: parseTagLabel(item.tagNameI18n, lang) || item.tagCode || String(item.id ?? ''),
    });
    const isValidTagOption = (o: { value: string; label: string }) => Boolean(o.value && o.label);
    const load = async () => {
      const [listRes, recommendRes] = await Promise.all([
        base.getPromptTagLibraryList().catch(() => null),
        base.getPromptTagLibraryRecommend().catch(() => null),
      ]);
      if (listRes?.success && Array.isArray(listRes?.data)) {
        setTagOptions(listRes.data.map(toOption).filter(isValidTagOption));
      }
      if (recommendRes?.success && Array.isArray(recommendRes?.data)) {
        setRecommendTags(
          recommendRes.data.map(toOption).filter(isValidTagOption).slice(0, 8)
        );
      }
    };
    load();
  }, [open, locale]);

  useEffect(() => {
    if (open && (priceToken === 0 || priceToken === '0')) {
      form.setFieldsValue({ isPromptHidden: false });
    }
  }, [open, priceToken, form]);

  const buildPromptMarketPayload = (values: Record<string, unknown>): CommunityAiOperatorPromptMarketRequest | undefined => {
    if (!values.publishToPromptMarket) return undefined;

    const price = values.priceToken != null && values.priceToken !== ''
      ? Number(values.priceToken)
      : 100;
    const description = String(values.description || '').trim();
    const tags = values.tags;
    const hasTags = Array.isArray(tags) ? tags.length > 0 : Boolean(tags);
    const isPromptHidden = price === 0 ? false : values.isPromptHidden !== false;

    const payload: CommunityAiOperatorPromptMarketRequest = {
      publishToPromptMarket: true,
      priceToken: price,
      licenseType: Number(values.licenseType ?? 1),
      isPromptHidden: isPromptHidden ? 1 : 0,
    };

    if (description) {
      payload.description = description;
    }
    if (hasTags) {
      payload.tags = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!operatorId) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const promptMarket = buildPromptMarketPayload(values);
      const result = await triggerChannelAiOperatorPost(operatorId, promptMarket);
      message.success(result || intl.formatMessage({ id: 'community.aiOperator.triggerSuccess', defaultMessage: '已触发发帖' }));
      onSuccess?.();
      onCancel();
    } catch (error: unknown) {
      const err = error as { message?: string; errorFields?: unknown[] };
      if (err?.errorFields) return;
      message.error(err?.message || intl.formatMessage({ id: 'common.operationFailed', defaultMessage: '操作失败' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <RocketOutlined style={{ color: token.colorPrimary }} />
          <FormattedMessage id="community.aiOperator.triggerPost" defaultMessage="立即发帖" />
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确认' })}
      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
      confirmLoading={submitting}
      width={640}
      destroyOnClose
      centered
    >
      {operatorName && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          <FormattedMessage
            id="community.aiOperator.triggerFor"
            defaultMessage="即将为 {name} 执行一次发帖"
            values={{ name: operatorName }}
          />
        </Text>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="publishToPromptMarket"
          valuePropName="checked"
          style={{ marginBottom: publishToPromptMarket ? 16 : 0 }}
        >
          <Switch
            checkedChildren={
              <Space size={4}>
                <ShopOutlined />
                <FormattedMessage id="community.aiOperator.publishToPromptMarket" defaultMessage="同时发布到提示词商城" />
              </Space>
            }
            unCheckedChildren={
              <FormattedMessage id="community.aiOperator.channelOnly" defaultMessage="仅发布到频道" />
            }
          />
        </Form.Item>

        {publishToPromptMarket && (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12, lineHeight: 1.7 }}>
              <FormattedMessage
                id="community.aiOperator.promptMarketOptionalHint"
                defaultMessage="以下字段可选：留空时 AI 自动生成作品描述与搜索标签；费用默认 100 TOKEN。频道内提示词将隐藏。"
              />
            </Text>

            <Form.Item
              name="description"
              label={<FormattedMessage id="promptMarket.description" defaultMessage="作品描述" />}
              extra={
                <FormattedMessage
                  id="community.aiOperator.descriptionOptional"
                  defaultMessage="留空由 AI 自动生成"
                />
              }
            >
              <TextArea
                rows={3}
                maxLength={200}
                showCount
                placeholder={intl.formatMessage({
                  id: 'promptMarket.descriptionPlaceholder',
                  defaultMessage: '描述画面内容、适用场景等（可选）',
                })}
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label={<FormattedMessage id="promptMarket.tags" defaultMessage="搜索标签" />}
              extra={
                <FormattedMessage
                  id="community.aiOperator.tagsOptional"
                  defaultMessage="留空由 AI 从标签库自动匹配"
                />
              }
            >
              <Select
                mode="tags"
                placeholder={intl.formatMessage({
                  id: 'promptMarket.tagsPlaceholder',
                  defaultMessage: '选择或输入标签（可选）',
                })}
                tokenSeparators={[',', ' ']}
                options={tagOptions}
              />
            </Form.Item>

            {recommendTags.length > 0 && (
              <div style={{ marginTop: -8, marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <FormattedMessage id="promptMarket.recommendTags" defaultMessage="热门标签" />
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {recommendTags.map((t) => (
                    <Tag
                      key={t.value}
                      style={{ cursor: 'pointer', margin: 0 }}
                      onClick={() => {
                        const current = form.getFieldValue('tags') || [];
                        const next = Array.isArray(current) ? [...current] : [];
                        if (!next.includes(t.value)) next.push(t.value);
                        form.setFieldsValue({ tags: next });
                      }}
                    >
                      {t.label}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="priceToken"
                  label={<FormattedMessage id="promptMarket.price" defaultMessage="费用 (TOKEN)" />}
                >
                  <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="100" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="licenseType"
                  label={<FormattedMessage id="promptMarket.license" defaultMessage="商用许可" />}
                >
                  <Select
                    options={LICENSE_OPTIONS.map((o) => ({
                      value: o.value,
                      label: intl.formatMessage({ id: o.labelKey, defaultMessage: o.defaultLabel }),
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="isPromptHidden"
              label={<FormattedMessage id="promptMarket.hidePrompt" defaultMessage="隐藏提示词" />}
              valuePropName="checked"
              tooltip={intl.formatMessage({
                id: 'promptMarket.hidePromptTip',
                defaultMessage: '未购买时隐藏完整提示词与参数',
              })}
            >
              <Switch disabled={priceToken === 0 || priceToken === '0'} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AiOperatorTriggerPostModal;
