import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  StopOutlined,
  FormOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  MailOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { Button, Form, Input, Select, message, Spin, Modal, ConfigProvider, theme } from 'antd';
import { loadIpBlockReason } from '../../utils/ipBlocked';
import { workOrder } from '../../api/workOrder';
import SEO, { SEOConfigs } from 'components/SEO';

const { TextArea } = Input;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const PageShell = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${(p) => (p.$dark ? '#070b14' : '#f4f7fb')};
  padding: 24px 20px 120px;
`;

const BgOrb = styled.div`
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  opacity: ${(p) => (p.$dark ? 0.55 : 0.45)};
  background: ${(p) => p.$color};
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  top: ${(p) => p.$top};
  left: ${(p) => p.$left};
  animation: ${float} ${(p) => p.$duration || '8s'} ease-in-out infinite;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  padding-top: clamp(32px, 8vh, 72px);
`;

const HeroCard = styled.div`
  text-align: center;
  padding: 40px 28px 32px;
  border-radius: 24px;
  background: ${(p) => (p.$dark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255,255,255,0.88)')};
  border: 1px solid ${(p) => (p.$dark ? 'rgba(248, 113, 113, 0.22)' : 'rgba(239, 68, 68, 0.16)')};
  box-shadow: ${(p) => (p.$dark
    ? '0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)'
    : '0 20px 60px rgba(15, 23, 42, 0.08)')};
  backdrop-filter: blur(16px);
`;

const IconRing = styled.div`
  width: 92px;
  height: 92px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #ef4444;
  font-size: 40px;
  background: ${(p) => (p.$dark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)')};

  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 1px solid ${(p) => (p.$dark ? 'rgba(248,113,113,0.25)' : 'rgba(239,68,68,0.18)')};
    animation: ${pulse} 2.8s ease-in-out infinite;
  }
`;

const Title = styled.h1`
  margin: 0 0 12px;
  font-size: clamp(24px, 5vw, 30px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${(p) => (p.$dark ? '#f8fafc' : '#0f172a')};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.75;
  color: ${(p) => (p.$dark ? '#94a3b8' : '#64748b')};
`;

const ReasonPanel = styled.div`
  margin-top: 24px;
  text-align: left;
  padding: 18px 20px;
  border-radius: 16px;
  background: ${(p) => (p.$dark ? 'rgba(239,68,68,0.08)' : 'rgba(254, 242, 242, 0.9)')};
  border: 1px solid ${(p) => (p.$dark ? 'rgba(248,113,113,0.18)' : 'rgba(254, 202, 202, 0.9)')};

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: ${(p) => (p.$dark ? '#fca5a5' : '#b91c1c')};
  }

  .text {
    font-size: 14px;
    line-height: 1.75;
    color: ${(p) => (p.$dark ? '#fecaca' : '#991b1b')};
    word-break: break-word;
  }
`;

const InfoList = styled.div`
  margin-top: 20px;
  display: grid;
  gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 14px;
  background: ${(p) => (p.$dark ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.95)')};
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.06)' : 'rgba(226,232,240,0.9)')};
  color: ${(p) => (p.$dark ? '#cbd5e1' : '#475569')};
  font-size: 13px;
  line-height: 1.65;

  .icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${(p) => (p.$dark ? '#94a3b8' : '#64748b')};
    font-size: 16px;
  }
`;

const BottomBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px));
  background: ${(p) => (p.$dark ? 'rgba(7, 11, 20, 0.92)' : 'rgba(255,255,255,0.92)')};
  border-top: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.95)')};
  backdrop-filter: blur(14px);
`;

const BottomInner = styled.div`
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BottomHint = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${(p) => (p.$dark ? '#64748b' : '#94a3b8')};
`;

const SuccessPanel = styled.div`
  text-align: center;
  padding: 12px 0 4px;

  .ticket-no {
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #166534;
    background: rgba(34, 197, 94, 0.08);
    border: 1px dashed rgba(34, 197, 94, 0.35);
  }
`;

const IpBlockedPage = () => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [reason, setReason] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const isDark = typeof localStorage !== 'undefined' && localStorage.getItem('theme') !== 'light';
  const { token } = theme.useToken();

  const defaultCategoryId = useMemo(() => {
    const appeal = categories.find((item) => item.name === 'IP封禁申诉');
    return appeal?.id;
  }, [categories]);

  useEffect(() => {
    setReason(loadIpBlockReason());
  }, []);

  const loadCategories = async () => {
    if (categories.length > 0) return;
    setLoadingCategories(true);
    try {
      const result = await workOrder.getPublicCategories();
      if (result?.success) {
        setCategories(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'ipBlocked.ticket.loadCategoryFailed', defaultMessage: '加载工单分类失败' }));
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOpenTicketModal = async () => {
    setTicketModalOpen(true);
    await loadCategories();
  };

  const handleCloseTicketModal = () => {
    if (submitting) return;
    setTicketModalOpen(false);
  };

  useEffect(() => {
    if (ticketModalOpen && defaultCategoryId) {
      form.setFieldsValue({
        categoryId: defaultCategoryId,
        title: intl.formatMessage({ id: 'ipBlocked.ticket.defaultTitle', defaultMessage: 'IP封禁申诉' }),
      });
    }
  }, [ticketModalOpen, defaultCategoryId, form, intl]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const result = await workOrder.createPublicWorkOrder({
        title: values.title?.trim(),
        description: values.description?.trim(),
        categoryId: values.categoryId,
        contactEmail: values.contactEmail?.trim(),
        contactName: values.contactName?.trim(),
      });
      if (result?.success) {
        setSubmittedTicket(result.data);
        message.success(intl.formatMessage({ id: 'ipBlocked.ticket.submitSuccess', defaultMessage: '工单提交成功' }));
      } else {
        message.error(result?.message || intl.formatMessage({ id: 'ipBlocked.ticket.submitFailed', defaultMessage: '工单提交失败' }));
      }
    } catch (error) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'ipBlocked.ticket.submitFailed', defaultMessage: '工单提交失败' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <SEO {...SEOConfigs.login} />
      <PageShell $dark={isDark}>
        <BgOrb $dark={isDark} $color="rgba(239,68,68,0.28)" $size={280} $top="-80px" $left="-60px" $duration="9s" />
        <BgOrb $dark={isDark} $color="rgba(249,115,22,0.18)" $size={220} $top="20%" $left="70%" $duration="11s" />
        <BgOrb $dark={isDark} $color="rgba(127,29,29,0.22)" $size={320} $top="55%" $left="10%" $duration="13s" />

        <Content>
          <HeroCard $dark={isDark}>
            <IconRing $dark={isDark}>
              <StopOutlined />
            </IconRing>
            <Title $dark={isDark}>
              {intl.formatMessage({ id: 'ipBlocked.page.title', defaultMessage: '访问已被限制' })}
            </Title>
            <Subtitle $dark={isDark}>
              {intl.formatMessage({
                id: 'ipBlocked.page.desc',
                defaultMessage: '您的网络地址已被平台限制访问，暂时无法使用本站服务。',
              })}
            </Subtitle>

            <ReasonPanel $dark={isDark}>
              <div className="label">
                <InfoCircleOutlined />
                {intl.formatMessage({ id: 'ipBlocked.page.reasonLabel', defaultMessage: '限制原因' })}
              </div>
              <div className="text">
                {reason || intl.formatMessage({ id: 'ipBlocked.page.defaultReason', defaultMessage: '请联系客服' })}
              </div>
            </ReasonPanel>

            <InfoList>
              <InfoItem $dark={isDark}>
                <SafetyCertificateOutlined className="icon" />
                <span>
                  {intl.formatMessage({
                    id: 'ipBlocked.page.tipReview',
                    defaultMessage: '如认为限制有误，可通过页面底部按钮提交申诉工单，客服将在审核后处理。',
                  })}
                </span>
              </InfoItem>
              <InfoItem $dark={isDark}>
                <MailOutlined className="icon" />
                <span>
                  {intl.formatMessage({
                    id: 'ipBlocked.page.tipEmail',
                    defaultMessage: '提交工单时请填写有效邮箱，以便我们向您反馈处理结果。',
                  })}
                </span>
              </InfoItem>
            </InfoList>
          </HeroCard>
        </Content>

        <BottomBar $dark={isDark}>
          <BottomInner>
            {submittedTicket ? (
              <>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleFilled />}
                  disabled
                  style={{ height: 48, borderRadius: 12 }}
                >
                  {intl.formatMessage({ id: 'ipBlocked.page.ticketSubmitted', defaultMessage: '工单已提交' })}
                </Button>
                <BottomHint $dark={isDark}>
                  {intl.formatMessage({ id: 'ipBlocked.page.ticketNoHint', defaultMessage: '工单编号' })}：
                  {submittedTicket.ticketNo}
                </BottomHint>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<FormOutlined />}
                  onClick={handleOpenTicketModal}
                  style={{ height: 48, borderRadius: 12, fontWeight: 600 }}
                >
                  {intl.formatMessage({ id: 'ipBlocked.page.openTicket', defaultMessage: '提交申诉工单' })}
                </Button>
                <BottomHint $dark={isDark}>
                  {intl.formatMessage({
                    id: 'ipBlocked.page.footerHint',
                    defaultMessage: '如对限制有异议，可提交工单申请复核',
                  })}
                </BottomHint>
              </>
            )}
          </BottomInner>
        </BottomBar>

        <Modal
          title={
            submittedTicket
              ? intl.formatMessage({ id: 'ipBlocked.ticket.successTitle', defaultMessage: '工单已提交' })
              : intl.formatMessage({ id: 'ipBlocked.ticket.sectionTitle', defaultMessage: '提交申诉工单' })
          }
          open={ticketModalOpen}
          onCancel={handleCloseTicketModal}
          footer={null}
          centered
          width={520}
          destroyOnClose={false}
          maskClosable={!submitting}
          closable={!submitting}
        >
          {submittedTicket ? (
            <SuccessPanel>
              <CheckCircleFilled style={{ fontSize: 48, color: token.colorSuccess }} />
              <div style={{ marginTop: 16, fontSize: 15, color: token.colorTextSecondary, lineHeight: 1.7 }}>
                {intl.formatMessage({
                  id: 'ipBlocked.ticket.successDesc',
                  defaultMessage: '我们已收到您的申诉，客服将尽快处理。请保存工单编号以便查询。',
                })}
              </div>
              <div className="ticket-no">{submittedTicket.ticketNo}</div>
              <Button
                type="primary"
                block
                size="large"
                style={{ marginTop: 20, borderRadius: 10 }}
                onClick={handleCloseTicketModal}
              >
                {intl.formatMessage({ id: 'ipBlocked.ticket.close', defaultMessage: '我知道了' })}
              </Button>
            </SuccessPanel>
          ) : (
            <Spin spinning={loadingCategories}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ marginTop: 8 }}
              >
                <Form.Item
                  name="contactName"
                  label={intl.formatMessage({ id: 'ipBlocked.ticket.contactName', defaultMessage: '联系人' })}
                  required
                  rules={[
                    { required: true, whitespace: true, message: intl.formatMessage({ id: 'ipBlocked.ticket.contactNameRequired', defaultMessage: '请填写联系人' }) },
                    { max: 100, message: intl.formatMessage({ id: 'ipBlocked.ticket.contactNameMax', defaultMessage: '联系人不能超过100字' }) },
                  ]}
                >
                  <Input placeholder={intl.formatMessage({ id: 'ipBlocked.ticket.contactNamePlaceholder', defaultMessage: '请输入您的姓名或昵称' })} maxLength={100} />
                </Form.Item>

                <Form.Item
                  name="contactEmail"
                  label={intl.formatMessage({ id: 'ipBlocked.ticket.contactEmail', defaultMessage: '联系邮箱' })}
                  required
                  rules={[
                    { required: true, whitespace: true, message: intl.formatMessage({ id: 'ipBlocked.ticket.contactEmailRequired', defaultMessage: '请填写联系邮箱' }) },
                    { type: 'email', message: intl.formatMessage({ id: 'ipBlocked.ticket.contactEmailInvalid', defaultMessage: '邮箱格式不正确' }) },
                  ]}
                >
                  <Input placeholder={intl.formatMessage({ id: 'ipBlocked.ticket.contactEmailPlaceholder', defaultMessage: '用于接收工单处理结果' })} />
                </Form.Item>

                <Form.Item
                  name="categoryId"
                  label={intl.formatMessage({ id: 'ipBlocked.ticket.category', defaultMessage: '工单分类' })}
                  rules={[{ required: true, message: intl.formatMessage({ id: 'ipBlocked.ticket.categoryRequired', defaultMessage: '请选择工单分类' }) }]}
                >
                  <Select
                    placeholder={intl.formatMessage({ id: 'ipBlocked.ticket.categoryPlaceholder', defaultMessage: '请选择分类' })}
                    options={categories.map((item) => ({ value: item.id, label: item.name }))}
                  />
                </Form.Item>

                <Form.Item
                  name="title"
                  label={intl.formatMessage({ id: 'ipBlocked.ticket.title', defaultMessage: '工单标题' })}
                  rules={[{ required: true, whitespace: true, message: intl.formatMessage({ id: 'ipBlocked.ticket.titleRequired', defaultMessage: '请填写工单标题' }) }]}
                >
                  <Input maxLength={255} showCount />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={intl.formatMessage({ id: 'ipBlocked.ticket.description', defaultMessage: '申诉说明' })}
                  required
                  rules={[
                    { required: true, whitespace: true, message: intl.formatMessage({ id: 'ipBlocked.ticket.descriptionRequired', defaultMessage: '请填写申诉说明' }) },
                    { min: 10, message: intl.formatMessage({ id: 'ipBlocked.ticket.descriptionMin', defaultMessage: '申诉说明至少10个字' }) },
                    { max: 5000, message: intl.formatMessage({ id: 'ipBlocked.ticket.descriptionMax', defaultMessage: '申诉说明不能超过5000字' }) },
                  ]}
                >
                  <TextArea
                    rows={5}
                    maxLength={5000}
                    showCount
                    placeholder={intl.formatMessage({
                      id: 'ipBlocked.ticket.descriptionPlaceholder',
                      defaultMessage: '请说明您的使用情况、申诉理由，以及希望恢复访问的原因...',
                    })}
                  />
                </Form.Item>

                <Button type="primary" htmlType="submit" block size="large" loading={submitting} style={{ borderRadius: 10 }}>
                  {intl.formatMessage({ id: 'ipBlocked.ticket.submit', defaultMessage: '提交工单' })}
                </Button>
              </Form>
            </Spin>
          )}
        </Modal>
      </PageShell>
    </ConfigProvider>
  );
};

export default IpBlockedPage;
