import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Alert, Button, Checkbox, Form, Input, message, theme } from 'antd';
import { ArrowLeftOutlined, InfoCircleOutlined, UnlockOutlined } from '@ant-design/icons';
import { auth } from 'api/auth';
import { VERIFICATION_ROUTES } from './verificationRoutes';
import {
  ActionButtons,
  FormLabel,
  FormSection,
  InfoAlert,
  MainCard,
  VerificationHistoryLink,
  VerificationLoading,
  VerificationShell,
} from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';

const { TextArea } = Input;

const VerificationUnbindApply = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const intl = useIntl();
  const { loading: statusLoading, kycStatus, realnameInfo } = useVerificationStatus(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (statusLoading) return;
    if (kycStatus === 0 || kycStatus === 1 || kycStatus === 3 || kycStatus === 4) {
      navigate(VERIFICATION_ROUTES.root, { replace: true });
    } else if (kycStatus === 5) {
      navigate(VERIFICATION_ROUTES.unbindPending, { replace: true });
    } else if (kycStatus === 6) {
      navigate(VERIFICATION_ROUTES.unbindRejected, { replace: true });
    } else if (kycStatus !== 2) {
      navigate(VERIFICATION_ROUTES.root, { replace: true });
    }
  }, [statusLoading, kycStatus, navigate]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await auth.submitUnbindRequest(values.reason.trim());
      if (response.success) {
        message.success(
          intl.formatMessage({ id: 'verification.unbind.submit.success', defaultMessage: '解绑申请已提交，等待审核' })
        );
        navigate(VERIFICATION_ROUTES.unbindPending, { replace: true });
      } else {
        message.error(
          response.message ||
            intl.formatMessage({ id: 'verification.unbind.submit.error', defaultMessage: '提交失败，请稍后重试' })
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          intl.formatMessage({ id: 'verification.unbind.submit.error', defaultMessage: '提交失败，请稍后重试' })
      );
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading || kycStatus !== 2) {
    return <VerificationLoading />;
  }

  return (
    <VerificationShell>
      <MainCard $token={token}>
        <div style={{ marginBottom: 20 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(VERIFICATION_ROUTES.verified)}
            style={{ padding: 0, marginBottom: 12, fontSize: 14 }}
          >
            {intl.formatMessage({ id: 'verification.back', defaultMessage: '返回' })}
          </Button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: token.colorText, margin: 0, lineHeight: 1.3 }}>
            {intl.formatMessage({ id: 'verification.unbind.title', defaultMessage: '申请解除实名绑定' })}
          </h1>
          <p style={{ color: token.colorTextSecondary, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
            {intl.formatMessage({
              id: 'verification.unbind.subtitle',
              defaultMessage: '提交解绑申请后，我们将在1-3个工作日内完成审核。审核通过后将解除您的实名绑定。',
            })}
          </p>
        </div>

        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
          message={intl.formatMessage({ id: 'verification.unbind.warning.title', defaultMessage: '解绑须知' })}
          description={intl.formatMessage({
            id: 'verification.unbind.warning.desc',
            defaultMessage:
              '解绑后将无法使用需要实名认证的模型与功能。若账号存在安全风险，解绑申请可能被拒绝。',
          })}
        />

        {realnameInfo?.realName ? (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 10 }}
            message={intl.formatMessage({ id: 'verification.unbind.currentBinding', defaultMessage: '当前绑定信息' })}
            description={`${intl.formatMessage({ id: 'verification.info.name', defaultMessage: '姓名：' })}${realnameInfo.realName}${
              realnameInfo.idNumber
                ? ` · ${intl.formatMessage({ id: 'verification.info.idNumber', defaultMessage: '证件号码：' })}${realnameInfo.idNumber}`
                : ''
            }`}
          />
        ) : null}

        <InfoAlert
          message={intl.formatMessage({ id: 'verification.info.title', defaultMessage: '温馨提示' })}
          description={intl.formatMessage({
            id: 'verification.unbind.info.desc',
            defaultMessage: '请如实填写解绑原因，便于我们尽快处理您的申请。',
          })}
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <FormSection>
            <Form.Item
              name="reason"
              label={
                <FormLabel $token={token}>
                  <UnlockOutlined />{' '}
                  {intl.formatMessage({ id: 'verification.unbind.reason.label', defaultMessage: '解绑原因' })}
                </FormLabel>
              }
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'verification.unbind.reason.required',
                    defaultMessage: '请填写解绑原因',
                  }),
                },
                {
                  min: 10,
                  message: intl.formatMessage({
                    id: 'verification.unbind.reason.min',
                    defaultMessage: '解绑原因至少10个字',
                  }),
                },
                {
                  max: 500,
                  message: intl.formatMessage({
                    id: 'verification.unbind.reason.max',
                    defaultMessage: '解绑原因不能超过500字',
                  }),
                },
              ]}
            >
              <TextArea
                rows={5}
                maxLength={500}
                showCount
                placeholder={intl.formatMessage({
                  id: 'verification.unbind.reason.placeholder',
                  defaultMessage: '请说明申请解除实名绑定的原因',
                })}
                style={{ borderRadius: 12 }}
              />
            </Form.Item>

            <Form.Item
              name="confirmed"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            intl.formatMessage({
                              id: 'verification.unbind.confirm.required',
                              defaultMessage: '请确认已了解解绑后果',
                            })
                          )
                        ),
                },
              ]}
            >
              <Checkbox>
                {intl.formatMessage({
                  id: 'verification.unbind.confirm.text',
                  defaultMessage: '我已了解解绑后将失去实名认证相关权益，并确认提交解绑申请',
                })}
              </Checkbox>
            </Form.Item>
          </FormSection>

          <ActionButtons $token={token}>
            <Button size="large" onClick={() => navigate(VERIFICATION_ROUTES.verified)} style={{ borderRadius: 12 }}>
              {intl.formatMessage({ id: 'verification.cancel', defaultMessage: '取消' })}
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading} danger style={{ borderRadius: 12 }}>
              {intl.formatMessage({ id: 'verification.unbind.submit', defaultMessage: '提交解绑申请' })}
            </Button>
          </ActionButtons>
          <VerificationHistoryLink />
        </Form>
      </MainCard>
    </VerificationShell>
  );
};

export default VerificationUnbindApply;
