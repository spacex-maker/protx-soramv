import React, { useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Segmented,
  Select,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  BookOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  SkinOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  CHARACTER_PROFILE_FIELD_KEYS,
  CHARACTER_PROFILE_PRESET_FIELDS,
  CHARACTER_PROFILE_PRESET_KEYS,
  CHARACTER_PROFILE_SECTIONS,
  CharacterProfilePresetKey,
  CharacterProfileSectionKey,
  CharacterProfileTemplateKey,
  CharacterProfileTemplateValues,
  buildDescriptionFromTemplate,
  buildPromptSuffixFromTemplate,
  countFilledTemplateFields,
  hasTemplateValues,
  parseDescriptionToTemplate,
} from './characterProfileTemplate';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.12);

  .dark & {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.2);
  }
`;

const PresetWrap = styled.div`
  flex: 1;
  min-width: 220px;

  .ant-segmented {
    width: 100%;
    max-width: 360px;
  }
`;

const SectionCard = styled.div`
  padding: 14px 14px 4px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.015);

  .dark & {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const SectionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  font-size: 14px;

  .dark & {
    background: rgba(59, 130, 246, 0.2);
  }
`;

const PreviewPanel = styled.div`
  height: 100%;
  min-height: 280px;
  padding: 14px;
  border-radius: 10px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;

  .dark & {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.02);
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff;
  overflow-y: auto;
  max-height: 420px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(0, 0, 0, 0.78);

  .dark & {
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.82);
  }
`;

const FooterBar = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);

  .dark & {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

const FormScroll = styled.div`
  max-height: min(56vh, 520px);
  overflow-y: auto;
  padding-right: 4px;
`;

const SECTION_ICONS: Record<CharacterProfileSectionKey, React.ReactNode> = {
  basic: <UserOutlined />,
  visual: <SkinOutlined />,
  personality: <BulbOutlined />,
  story: <BookOutlined />,
};

const TEXTAREA_FIELDS: CharacterProfileTemplateKey[] = [
  'personality',
  'appearance',
  'background',
  'relationship',
];

export interface CharacterProfileTemplateModalProps {
  open: boolean;
  initialDescription?: string;
  initialPromptSuffix?: string;
  onCancel: () => void;
  onApply: (result: { description: string; promptSuffix?: string }) => void;
}

const CharacterProfileTemplateModal: React.FC<CharacterProfileTemplateModalProps> = ({
  open,
  initialDescription,
  initialPromptSuffix,
  onCancel,
  onApply,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<CharacterProfileTemplateValues>();
  const [alsoFillPromptSuffix, setAlsoFillPromptSuffix] = useState(true);
  const [activePreset, setActivePreset] = useState<CharacterProfilePresetKey | null>(null);
  const watchedValues = Form.useWatch([], form);

  const getFieldLabel = (key: CharacterProfileTemplateKey) =>
    intl.formatMessage({
      id: `director.characters.template.${key}`,
      defaultMessage: key,
    });

  const getFieldPlaceholder = (key: CharacterProfileTemplateKey) =>
    intl.formatMessage({
      id: `director.characters.template.${key}Placeholder`,
      defaultMessage: '',
    });

  const getFieldHint = (key: CharacterProfileTemplateKey) =>
    intl.formatMessage({
      id: `director.characters.template.${key}Hint`,
      defaultMessage: '',
    });

  useEffect(() => {
    if (!open) return;
    const parsed = parseDescriptionToTemplate(initialDescription || '', getFieldLabel);
    form.setFieldsValue(parsed);
    setAlsoFillPromptSuffix(!initialPromptSuffix?.trim());
    setActivePreset(null);
  }, [open, initialDescription, initialPromptSuffix, form, intl.locale]);

  const presetOptions = useMemo(
    () =>
      CHARACTER_PROFILE_PRESET_KEYS.map((key) => ({
        value: key,
        label: intl.formatMessage({
          id: `director.characters.template.preset.${key}`,
          defaultMessage: key,
        }),
      })),
    [intl]
  );

  const applyPreset = (presetKey: CharacterProfilePresetKey) => {
    const fields = CHARACTER_PROFILE_PRESET_FIELDS[presetKey];
    const current = form.getFieldsValue();
    const presetValues: CharacterProfileTemplateValues = { ...current };

    fields.forEach((field) => {
      const value = intl.formatMessage({
        id: `director.characters.template.preset.${presetKey}.${field}`,
        defaultMessage: '',
      });
      if (value) {
        presetValues[field] = value;
      }
    });

    form.setFieldsValue(presetValues);
    setActivePreset(presetKey);
  };

  const handleApply = async () => {
    const values = form.getFieldsValue();
    if (!hasTemplateValues(values)) {
      message.warning(
        intl.formatMessage({
          id: 'director.characters.template.empty',
          defaultMessage: '请至少填写一项属性',
        })
      );
      return;
    }

    const description = buildDescriptionFromTemplate(values, getFieldLabel);
    let promptSuffix: string | undefined;

    if (alsoFillPromptSuffix) {
      const suggested = buildPromptSuffixFromTemplate(values);
      if (suggested) {
        promptSuffix = initialPromptSuffix?.trim() ? initialPromptSuffix.trim() : suggested;
      }
    }

    onApply({ description, promptSuffix });
  };

  const genderOptions = [
    {
      value: intl.formatMessage({
        id: 'director.characters.template.genderFemale',
        defaultMessage: '女',
      }),
    },
    {
      value: intl.formatMessage({
        id: 'director.characters.template.genderMale',
        defaultMessage: '男',
      }),
    },
    {
      value: intl.formatMessage({
        id: 'director.characters.template.genderOther',
        defaultMessage: '其他',
      }),
    },
  ];

  const formValues = (watchedValues || {}) as CharacterProfileTemplateValues;
  const filledCount = countFilledTemplateFields(formValues);
  const totalCount = CHARACTER_PROFILE_FIELD_KEYS.length;
  const previewText = buildDescriptionFromTemplate(formValues, getFieldLabel);
  const previewSuffix = buildPromptSuffixFromTemplate(formValues);

  const renderLabel = (key: CharacterProfileTemplateKey) => {
    const hint = getFieldHint(key);
    return (
      <span>
        {getFieldLabel(key)}
        {hint ? (
          <Tooltip title={hint}>
            <QuestionCircleOutlined style={{ marginLeft: 6, color: 'rgba(0,0,0,0.35)', fontSize: 12 }} />
          </Tooltip>
        ) : null}
      </span>
    );
  };

  const renderField = (key: CharacterProfileTemplateKey, compact?: boolean) => {
    const placeholder = getFieldPlaceholder(key);
    const colSpan = compact ? 12 : 24;

    let control: React.ReactNode;
    if (key === 'gender') {
      control = <Select allowClear placeholder={placeholder} options={genderOptions} />;
    } else if (TEXTAREA_FIELDS.includes(key)) {
      control = <TextArea rows={compact ? 2 : 3} placeholder={placeholder} maxLength={500} showCount />;
    } else {
      control = <Input placeholder={placeholder} maxLength={200} />;
    }

    return (
      <Col xs={24} sm={colSpan} key={key}>
        <Form.Item name={key} label={renderLabel(key)} style={{ marginBottom: 12 }}>
          {control}
        </Form.Item>
      </Col>
    );
  };

  const renderSection = (sectionKey: CharacterProfileSectionKey, fields: CharacterProfileTemplateKey[]) => {
    const compactBasic = sectionKey === 'basic';
    const compactVisual = sectionKey === 'visual';

    return (
      <SectionCard key={sectionKey}>
        <SectionHeader>
          <SectionIcon>{SECTION_ICONS[sectionKey]}</SectionIcon>
          <div>
            <Text strong style={{ display: 'block', lineHeight: 1.3 }}>
              {intl.formatMessage({
                id: `director.characters.template.section.${sectionKey}`,
                defaultMessage: sectionKey,
              })}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {intl.formatMessage({
                id: `director.characters.template.section.${sectionKey}Desc`,
                defaultMessage: '',
              })}
            </Text>
          </div>
        </SectionHeader>
        <Row gutter={[12, 0]}>
          {fields.map((field) => renderField(field, compactBasic || compactVisual))}
        </Row>
      </SectionCard>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 24 }}>
          <span>
            {intl.formatMessage({
              id: 'director.characters.template.title',
              defaultMessage: '模板设定',
            })}
          </span>
          <Tag color={filledCount > 0 ? 'processing' : 'default'} style={{ margin: 0, fontWeight: 400 }}>
            {intl.formatMessage(
              {
                id: 'director.characters.template.progress',
                defaultMessage: '{filled}/{total}',
              },
              { filled: filledCount, total: totalCount }
            )}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleApply}
      width={920}
      destroyOnClose
      centered
      okText={intl.formatMessage({
        id: 'director.characters.template.apply',
        defaultMessage: '应用到人物设定',
      })}
      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
      styles={{ body: { paddingTop: 16 } }}
    >
      <ModalBody>
        <TopBar>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
              {intl.formatMessage({
                id: 'director.characters.template.intro',
                defaultMessage: '按剧集角色常用维度填写，系统会自动整理成人物设定文本，方便剧本 Agent 理解。',
              })}
            </Text>
            <Progress
              percent={Math.round((filledCount / totalCount) * 100)}
              size="small"
              showInfo={false}
              strokeColor="#3b82f6"
            />
          </div>
          <PresetWrap>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              <FormattedMessage id="director.characters.template.quickPreset" defaultMessage="快速预设" />
            </Text>
            <Segmented
              options={presetOptions}
              value={activePreset || undefined}
              onChange={(val) => applyPreset(val as CharacterProfilePresetKey)}
            />
          </PresetWrap>
        </TopBar>

        <Row gutter={16} align="stretch">
          <Col xs={24} lg={15}>
            <FormScroll>
              <Form form={form} layout="vertical" requiredMark={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {CHARACTER_PROFILE_SECTIONS.map(({ key, fields }) => renderSection(key, fields))}
                </div>
              </Form>
            </FormScroll>
          </Col>

          <Col xs={24} lg={9}>
            <PreviewPanel>
              <Text strong>
                <FormattedMessage id="director.characters.template.preview" defaultMessage="设定预览" />
              </Text>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                <FormattedMessage
                  id="director.characters.template.previewHint"
                  defaultMessage="填写后会实时生成人物设定文本"
                />
              </Text>
              <PreviewContent>
                {previewText ? (
                  previewText
                ) : (
                  <Text type="secondary">
                    <FormattedMessage
                      id="director.characters.template.previewEmpty"
                      defaultMessage="在左侧填写属性，这里会显示整理后的人物设定"
                    />
                  </Text>
                )}
              </PreviewContent>
              {previewSuffix ? (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <FormattedMessage
                      id="director.characters.template.previewSuffix"
                      defaultMessage="提示词后缀预览"
                    />
                  </Text>
                  <Paragraph
                    style={{ marginBottom: 0, marginTop: 4, fontSize: 12 }}
                    ellipsis={{ rows: 2, expandable: true }}
                  >
                    {previewSuffix}
                  </Paragraph>
                </div>
              ) : null}
            </PreviewPanel>
          </Col>
        </Row>

        <FooterBar>
          <Checkbox checked={alsoFillPromptSuffix} onChange={(e) => setAlsoFillPromptSuffix(e.target.checked)}>
            <FormattedMessage
              id="director.characters.template.fillPromptSuffix"
              defaultMessage="根据外貌/服装自动生成提示词后缀（若已有内容则保留）"
            />
          </Checkbox>
        </FooterBar>
      </ModalBody>
    </Modal>
  );
};

export default CharacterProfileTemplateModal;
