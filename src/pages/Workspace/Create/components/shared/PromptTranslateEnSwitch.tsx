import React from 'react';
import { Form, Switch, Space, Tooltip, Typography } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';

const { Text } = Typography;

export interface PromptTranslateEnSwitchProps {
  /** Form field name, default translatePromptToEnglish */
  name?: string;
}

/**
 * 提示词/文本提交前是否译为英文（默认关闭，与图生视频一致）
 */
const PromptTranslateEnSwitch: React.FC<PromptTranslateEnSwitchProps> = ({
  name = 'translatePromptToEnglish',
}) => {
  const intl = useIntl();

  return (
    <Form.Item name={name} valuePropName="checked" initialValue={false} noStyle>
      <Tooltip
        title={intl.formatMessage({
          id: 'create.prompt.translateEn.tooltip',
          defaultMessage:
            '部分模型对英文提示词支持更好，若中文或其它语言效果不理想可开启。开启后会在提交前将提示词译为英文再调用模型（会消耗翻译服务）；关闭则直接使用您输入的原文。',
        })}
      >
        <Space
          size={6}
          style={{ marginLeft: 4 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Switch size="small" />
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            <FormattedMessage id="create.prompt.translateEn" defaultMessage="译为英文" />
          </Text>
        </Space>
      </Tooltip>
    </Form.Item>
  );
};

export default PromptTranslateEnSwitch;
