import React, { useState } from 'react';
import { Form, Input, Button, Space, message, Tooltip } from 'antd';
import { EditOutlined, HistoryOutlined, BulbOutlined, UndoOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import PromptVersionHistoryModal from 'components/common/PromptVersionHistoryModal';

const { TextArea } = Input;

export interface AIPromptSectionProps {
  form: ReturnType<typeof Form.useForm>[0];
  locale: string | null;
}

/**
 * AI 生成/丰富提示词区块：输入框、版本历史、恢复、AI 生成按钮及弹窗
 */
const AIPromptSection: React.FC<AIPromptSectionProps> = ({ form, locale }) => {
  const intl = useIntl();
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [promptVersionModalVisible, setPromptVersionModalVisible] = useState(false);

  const handleGeneratePrompt = async () => {
    setGeneratingPrompt(true);
    try {
      const currentPrompt = form.getFieldValue('prompt') || '';

      if (!originalPrompt || originalPrompt !== currentPrompt.trim()) {
        setOriginalPrompt(currentPrompt.trim() || null);
        if (currentPrompt.trim()) {
          setPromptHistory((prev) => [currentPrompt.trim(), ...prev].slice(0, 10));
        }
      }

      const requestData: Record<string, unknown> = {
        language: locale || 'zh',
      };
      if (currentPrompt.trim()) {
        requestData.basePrompt = currentPrompt.trim();
      }

      const response = await instance.post(
        '/productx/sa-ai-models/image/prompt/generate',
        requestData
      );

      if (response.data.success && response.data.data) {
        const generatedPrompt =
          typeof response.data.data === 'string'
            ? response.data.data
            : response.data.data.prompt || response.data.data;

        if (generatedPrompt) {
          form.setFieldsValue({ prompt: generatedPrompt });
          setPromptValue(generatedPrompt);
          message.success(
            intl.formatMessage({
              id: 'create.prompt.generate.success',
              defaultMessage: '提示词生成成功！',
            })
          );
        } else {
          message.warning(
            intl.formatMessage({
              id: 'create.prompt.generate.empty',
              defaultMessage: '未生成提示词，请重试',
            })
          );
        }
      } else {
        message.error(
          response.data.message ||
            intl.formatMessage({
              id: 'create.prompt.generate.error',
              defaultMessage: '提示词生成失败，请重试',
            })
        );
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('生成提示词失败:', error);
      message.error(
        err.response?.data?.message ||
          intl.formatMessage({
            id: 'create.prompt.generate.error',
            defaultMessage: '提示词生成失败，请重试',
          })
      );
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleRestorePrompt = () => {
    if (originalPrompt !== null) {
      form.setFieldsValue({ prompt: originalPrompt });
      setPromptValue(originalPrompt);
      message.success(
        intl.formatMessage({
          id: 'create.prompt.restore.success',
          defaultMessage: '已恢复到原始提示词',
        })
      );
    }
  };

  const canRestore = originalPrompt !== null && promptValue.trim() !== originalPrompt;

  return (
    <>
      <Form.Item
        name="prompt"
        className="prompt-form-item"
        label={
          <div className="prompt-label-wrapper">
            <Space>
              <EditOutlined style={{ color: '#1890ff' }} />
              <FormattedMessage id="create.prompt" defaultMessage="提示词 (Prompt)" />
              <Tooltip
                title={intl.formatMessage({
                  id: 'create.prompt.version.history.tooltip',
                  defaultMessage: '查看提示词版本历史',
                })}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<HistoryOutlined />}
                  onClick={() => setPromptVersionModalVisible(true)}
                  style={{
                    fontSize: 12,
                    height: 24,
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    borderRadius: 6,
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    marginLeft: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <FormattedMessage
                    id="create.prompt.version.history"
                    defaultMessage="版本历史"
                  />
                </Button>
              </Tooltip>
            </Space>
            <div className="prompt-button-wrapper">
              <Space size={8}>
                {canRestore && (
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'create.prompt.restore.tooltip',
                      defaultMessage: '恢复到AI生成/丰富之前的提示词',
                    })}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<UndoOutlined />}
                      onClick={handleRestorePrompt}
                      style={{
                        fontSize: 12,
                        height: 28,
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        borderRadius: 6,
                        background: 'rgba(0, 0, 0, 0.04)',
                        color: '#666',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                        marginTop: 4,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <FormattedMessage id="create.prompt.restore" defaultMessage="恢复" />
                    </Button>
                  </Tooltip>
                )}
                <Button
                  type="text"
                  size="small"
                  icon={<BulbOutlined />}
                  loading={generatingPrompt}
                  onClick={handleGeneratePrompt}
                  className="prompt-generate-button"
                  style={{
                    fontSize: 12,
                    height: 28,
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  {promptValue.trim() ? (
                    <FormattedMessage
                      id="create.prompt.enrich"
                      defaultMessage="AI 丰富提示词"
                    />
                  ) : (
                    <FormattedMessage
                      id="create.prompt.generate"
                      defaultMessage="AI 生成提示词"
                    />
                  )}
                </Button>
              </Space>
            </div>
          </div>
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
        style={{ marginTop: 32, marginBottom: 20 }}
      >
        <TextArea
          rows={5}
          placeholder={intl.formatMessage({
            id: 'create.prompt.placeholder',
            defaultMessage:
              '例如：一只在太空中漫步的赛博朋克猫咪，霓虹灯背景，高清细节...',
          })}
          maxLength={1000}
          showCount
          style={{ resize: 'none' }}
          onChange={(e) => setPromptValue(e.target.value)}
        />
      </Form.Item>

      <PromptVersionHistoryModal
        open={promptVersionModalVisible}
        onClose={() => setPromptVersionModalVisible(false)}
        moduleType="t2i"
        onSelectPrompt={(prompt, negativePrompt) => {
          form.setFieldsValue({
            prompt,
            ...(negativePrompt && { negativePrompt }),
          });
          setPromptValue(prompt);
        }}
      />
    </>
  );
};

export default AIPromptSection;
