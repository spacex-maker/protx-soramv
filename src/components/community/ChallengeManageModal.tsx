import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Upload,
  Button,
  Image,
  Spin,
  Row,
  Col,
  message,
} from 'antd';
import { UploadOutlined, SettingOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import dayjs from 'dayjs';
import type { DailyChallenge, DailyChallengeUpdateRequest } from 'api/community';
import { updateChallenge } from 'api/community';
import { parseTags } from 'pages/Community/ChallengeDetailPage/utils';
import { uploadImageToServer } from 'pages/Workspace/Create/components/ImageToImage/utils';

const { TextArea } = Input;

const CoverPreview = styled.div`
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 320px;
  border: 1px solid ${(props) => (props.theme.mode === 'dark' ? '#333' : '#e8e8e8')};
`;

interface ChallengeManageModalProps {
  open: boolean;
  challenge: DailyChallenge | null;
  onCancel: () => void;
  onSuccess: (updated: DailyChallenge) => void;
}

const buildRewardsConfig = (values: Record<string, number | undefined>) => {
  const config: Record<string, number> = {};
  if (values.prize1st) config['1st'] = values.prize1st;
  if (values.prize2nd) config['2nd'] = values.prize2nd;
  if (values.prize3rd) config['3rd'] = values.prize3rd;
  if (values.prizeParticipation) config.participation = values.prizeParticipation;
  return JSON.stringify(config);
};

const parseRewardsFormValues = (rewardsConfig?: string) => {
  try {
    const config = JSON.parse(rewardsConfig || '{}');
    const extract = (key: string, alt?: string) => {
      const value = config[key] ?? (alt ? config[alt] : undefined);
      if (typeof value === 'number') return value;
      if (value && typeof value === 'object' && 'tokens' in value) return Number(value.tokens) || undefined;
      return undefined;
    };
    return {
      prize1st: extract('1st', 'first'),
      prize2nd: extract('2nd', 'second'),
      prize3rd: extract('3rd', 'third'),
      prizeParticipation: extract('participation'),
    };
  } catch {
    return {};
  }
};

const ChallengeManageModal: React.FC<ChallengeManageModalProps> = ({
  open,
  challenge,
  onCancel,
  onSuccess,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [referenceUploading, setReferenceUploading] = useState(false);
  const coverUrl = Form.useWatch('coverUrl', form);
  const referenceImageUrl = Form.useWatch('referenceImageUrl', form);

  useEffect(() => {
    if (open && challenge) {
      const rewards = parseRewardsFormValues(challenge.rewardsConfig);
      form.setFieldsValue({
        title: challenge.title,
        description: challenge.description,
        coverUrl: challenge.coverUrl,
        requiredTags: parseTags(challenge.requiredTags),
        requiredModel: challenge.requiredModel,
        referenceImageUrl: challenge.referenceImageUrl,
        startTime: challenge.startTime ? dayjs(challenge.startTime) : undefined,
        endTime: challenge.endTime ? dayjs(challenge.endTime) : undefined,
        votingEndTime: challenge.votingEndTime ? dayjs(challenge.votingEndTime) : undefined,
        status: challenge.status,
        ...rewards,
      });
    }
  }, [open, challenge, form]);

  const handleUpload = async (file: File, field: 'coverUrl' | 'referenceImageUrl') => {
    const setUploading = field === 'coverUrl' ? setCoverUploading : setReferenceUploading;
    setUploading(true);
    try {
      const url = await uploadImageToServer(file);
      form.setFieldValue(field, url);
      message.success(intl.formatMessage({ id: 'challenge.manage.uploadSuccess', defaultMessage: 'Upload successful' }));
    } catch {
      message.error(intl.formatMessage({ id: 'challenge.manage.uploadFailed', defaultMessage: 'Upload failed' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!challenge) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: DailyChallengeUpdateRequest = {
        id: challenge.id,
        title: values.title,
        description: values.description,
        coverUrl: values.coverUrl,
        requiredTags: JSON.stringify(values.requiredTags || []),
        requiredModel: values.requiredModel,
        referenceImageUrl: values.referenceImageUrl,
        startTime: values.startTime?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.endTime?.format('YYYY-MM-DD HH:mm:ss'),
        votingEndTime: values.votingEndTime?.format('YYYY-MM-DD HH:mm:ss'),
        rewardsConfig: buildRewardsConfig(values),
        status: values.status,
      };
      const updated = await updateChallenge(payload);
      message.success(intl.formatMessage({ id: 'challenge.manage.saveSuccess', defaultMessage: 'Challenge updated' }));
      onSuccess(updated);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.message || intl.formatMessage({ id: 'challenge.manage.saveFailed', defaultMessage: 'Update failed' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <SettingOutlined style={{ marginRight: 8 }} />
          <FormattedMessage id="challenge.manage.title" defaultMessage="Manage Challenge" />
          {challenge ? ` #${challenge.id}` : ''}
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={intl.formatMessage({ id: 'common.save', defaultMessage: 'Save' })}
      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: 'Cancel' })}
      confirmLoading={submitting}
      width={760}
      destroyOnClose
    >
      <Spin spinning={submitting}>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="title"
            label={<FormattedMessage id="challenge.manage.field.title" defaultMessage="Title" />}
            rules={[{ required: true, message: intl.formatMessage({ id: 'challenge.manage.field.titleRequired', defaultMessage: 'Please enter title' }) }]}
          >
            <Input maxLength={120} showCount />
          </Form.Item>

          <Form.Item
            name="description"
            label={<FormattedMessage id="challenge.manage.field.description" defaultMessage="Description & Rules" />}
          >
            <TextArea rows={5} maxLength={4000} showCount />
          </Form.Item>

          <Form.Item
            name="coverUrl"
            label={<FormattedMessage id="challenge.manage.field.cover" defaultMessage="Cover Image" />}
          >
            <Input
              placeholder={intl.formatMessage({ id: 'challenge.manage.field.coverPlaceholder', defaultMessage: 'Image URL or upload below' })}
              addonAfter={
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    handleUpload(file as File, 'coverUrl');
                    return false;
                  }}
                >
                  <Button type="link" size="small" icon={<UploadOutlined />} loading={coverUploading}>
                    <FormattedMessage id="common.upload" defaultMessage="Upload" />
                  </Button>
                </Upload>
              }
            />
          </Form.Item>
          {coverUrl && (
            <CoverPreview>
              <Image src={coverUrl} alt="cover" style={{ width: '100%', display: 'block' }} />
            </CoverPreview>
          )}

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="startTime"
                label={<FormattedMessage id="challenge.manage.field.startTime" defaultMessage="Start Time" />}
                rules={[{ required: true }]}
              >
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="endTime"
                label={<FormattedMessage id="challenge.manage.field.endTime" defaultMessage="Submission Deadline" />}
                rules={[{ required: true }]}
              >
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="votingEndTime"
                label={<FormattedMessage id="challenge.manage.field.votingEndTime" defaultMessage="Voting End Time" />}
              >
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label={<FormattedMessage id="challenge.manage.field.status" defaultMessage="Status" />}
              >
                <Select
                  options={[
                    { value: 0, label: intl.formatMessage({ id: 'challenge.status.upcoming', defaultMessage: 'Upcoming' }) },
                    { value: 1, label: intl.formatMessage({ id: 'challenge.status.live', defaultMessage: 'Live Now' }) },
                    { value: 2, label: intl.formatMessage({ id: 'challenge.status.voting', defaultMessage: 'Voting' }) },
                    { value: 3, label: intl.formatMessage({ id: 'challenge.status.ended', defaultMessage: 'Ended' }) },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="requiredTags"
            label={<FormattedMessage id="challenge.manage.field.tags" defaultMessage="Required Tags" />}
          >
            <Select mode="tags" placeholder={intl.formatMessage({ id: 'challenge.manage.field.tagsPlaceholder', defaultMessage: 'Enter tags' })} />
          </Form.Item>

          <Form.Item
            name="requiredModel"
            label={<FormattedMessage id="challenge.manage.field.model" defaultMessage="Required Model Key" />}
          >
            <Input placeholder={intl.formatMessage({ id: 'challenge.manage.field.modelPlaceholder', defaultMessage: 'Leave empty for all models' })} />
          </Form.Item>

          <Form.Item
            name="referenceImageUrl"
            label={<FormattedMessage id="challenge.manage.field.reference" defaultMessage="Reference Image" />}
          >
            <Input
              placeholder={intl.formatMessage({ id: 'challenge.manage.field.referencePlaceholder', defaultMessage: 'Optional reference image URL' })}
              addonAfter={
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    handleUpload(file as File, 'referenceImageUrl');
                    return false;
                  }}
                >
                  <Button type="link" size="small" icon={<UploadOutlined />} loading={referenceUploading}>
                    <FormattedMessage id="common.upload" defaultMessage="Upload" />
                  </Button>
                </Upload>
              }
            />
          </Form.Item>
          {referenceImageUrl && (
            <CoverPreview style={{ marginBottom: 16 }}>
              <Image src={referenceImageUrl} alt="reference" style={{ width: '100%', maxHeight: 160, objectFit: 'cover' }} />
            </CoverPreview>
          )}

          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            <FormattedMessage id="challenge.manage.field.prizes" defaultMessage="Prize Pool (PTS)" />
          </div>
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item name="prize1st" label={<FormattedMessage id="challenge.rank.1st" defaultMessage="1st Place" />}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="prize2nd" label={<FormattedMessage id="challenge.rank.2nd" defaultMessage="2nd Place" />}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="prize3rd" label={<FormattedMessage id="challenge.rank.3rd" defaultMessage="3rd Place" />}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="prizeParticipation" label={<FormattedMessage id="challenge.manage.field.participation" defaultMessage="Participation" />}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ChallengeManageModal;
