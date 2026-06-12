import React from 'react';
import { Form, Input, Modal, Select, Slider, Switch } from 'antd';
import type { FormInstance } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  AdvancedGrid,
  AdvancedFullRow,
  AdvancedHint,
  CompactFormItem,
  CompactSliderItem,
  SliderPanel,
  SwitchRow,
} from './styles';
import { VoiceModel } from './voiceTypes';

interface AdvancedSettingsModalProps {
  open: boolean;
  form: FormInstance;
  selectedVoice: VoiceModel | null;
  formatOptions: string[];
  dialectOptions: string[];
  onClose: () => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  open,
  form,
  selectedVoice,
  formatOptions,
  dialectOptions,
  onClose,
}) => {
  const intl = useIntl();

  return (
    <Modal
      title={<FormattedMessage id="create.speech.advancedSettings" defaultMessage="高级设置" />}
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText={<FormattedMessage id="common.confirm" defaultMessage="确定" />}
      cancelText={<FormattedMessage id="common.cancel" defaultMessage="取消" />}
      width={520}
      destroyOnClose={false}
    >
      <Form form={form} layout="vertical" component={false}>
        <AdvancedGrid>
          <CompactFormItem>
            <Form.Item name="outputFormat" label={<FormattedMessage id="create.speech.format" defaultMessage="输出格式" />}>
              <Select options={formatOptions.map(f => ({ value: f, label: f.toUpperCase() }))} />
            </Form.Item>
          </CompactFormItem>
          <CompactFormItem>
            <Form.Item name="sampleRate" label={<FormattedMessage id="create.speech.sampleRate" defaultMessage="采样率" />}>
              <Select options={[8000, 16000, 22050, 24000, 32000, 44100, 48000].map(v => ({ value: v, label: `${v} Hz` }))} />
            </Form.Item>
          </CompactFormItem>
          {selectedVoice?.ttsModel?.startsWith('seed-tts-2.0') && (
            <CompactFormItem>
              <Form.Item name="ttsModel" label={<FormattedMessage id="create.speech.ttsModel" defaultMessage="TTS 模型" />}>
                <Select options={[
                  { value: 'seed-tts-2.0-standard', label: 'Standard' },
                  { value: 'seed-tts-2.0-expressive', label: 'Expressive' },
                ]} />
              </Form.Item>
            </CompactFormItem>
          )}
          {selectedVoice?.supportDialect && dialectOptions.length > 0 && (
            <CompactFormItem>
              <Form.Item name="explicitDialect" label={<FormattedMessage id="create.speech.dialect" defaultMessage="方言" />}>
                <Select allowClear options={dialectOptions.map(d => ({ value: d, label: d }))} />
              </Form.Item>
            </CompactFormItem>
          )}
          {selectedVoice?.supportSubtitle && (
            <AdvancedFullRow>
              <SwitchRow>
                <span className="switch-label">
                  <FormattedMessage id="create.speech.enableSubtitle" defaultMessage="字幕时间戳" />
                </span>
                <Form.Item name="enableSubtitle" valuePropName="checked" noStyle>
                  <Switch size="small" />
                </Form.Item>
              </SwitchRow>
            </AdvancedFullRow>
          )}
        </AdvancedGrid>

        <SliderPanel>
          <CompactSliderItem>
            <Form.Item name="speechRate" label={<FormattedMessage id="create.speech.speechRate" defaultMessage="语速" />}>
              <Slider min={-50} max={100} tooltip={{ formatter: v => `${v}` }} />
            </Form.Item>
          </CompactSliderItem>
          <CompactSliderItem>
            <Form.Item name="loudnessRate" label={<FormattedMessage id="create.speech.loudness" defaultMessage="音量" />}>
              <Slider min={-50} max={100} tooltip={{ formatter: v => `${v}` }} />
            </Form.Item>
          </CompactSliderItem>
        </SliderPanel>

        {selectedVoice?.supportContextTexts !== false && (
          <div style={{ marginTop: 10 }}>
            <CompactFormItem>
              <Form.Item
                name="contextInstruction"
                label={<FormattedMessage id="create.speech.contextInstructionCustom" defaultMessage="自定义指令" />}
              >
                <Input placeholder={intl.formatMessage({ id: 'create.speech.contextPlaceholder', defaultMessage: '例如：用温柔自然的语气朗读' })} />
              </Form.Item>
            </CompactFormItem>
            <AdvancedHint>
              {intl.formatMessage({
                id: 'create.speech.contextInstructionCustomHint',
                defaultMessage: '留空则使用上方语气预设；填写后将覆盖预设',
              })}
            </AdvancedHint>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default AdvancedSettingsModal;
