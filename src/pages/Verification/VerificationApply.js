import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  Steps,
  Upload,
  message,
  theme,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  GlobalOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import instance from 'api/axios';
import { base } from 'api/base';
import { auth } from 'api/auth';
import { VERIFICATION_ROUTES } from './verificationRoutes';
import {
  ActionButtons,
  FormLabel,
  FormRow,
  FormSection,
  InfoAlert,
  MainCard,
  StepContainer,
  UploadBox,
  VerificationLoading,
  VerificationHistoryLink,
  VerificationShell,
} from './verificationShared';
import { useVerificationStatus } from './useVerificationStatus';

const { Option } = Select;

const MAX_ID_IMAGE_BYTES = 20 * 1024 * 1024;

const isLikelyImageFile = (file) => {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(file.name || '');
};

const VerificationApply = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const intl = useIntl();
  const { loading: statusLoading, kycStatus, realnameInfo } = useVerificationStatus(true);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [frontPreviewUrl, setFrontPreviewUrl] = useState(null);
  const [backPreviewUrl, setBackPreviewUrl] = useState(null);
  const [kycConfigs, setKycConfigs] = useState([]);
  const [currentKycConfig, setCurrentKycConfig] = useState(null);
  const [requireFront, setRequireFront] = useState(true);
  const [requireBack, setRequireBack] = useState(true);

  const applyKycConfig = (config) => {
    if (!config) return;
    setCurrentKycConfig(config);
    setRequireFront(config.requireFront !== false);
    setRequireBack(config.requireBack !== false);
    form.setFieldsValue({
      countryCode: config.countryCode,
      idType: config.primaryIdType || undefined,
    });
  };

  useEffect(() => {
    if (!idCardFront) {
      setFrontPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(idCardFront);
    setFrontPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [idCardFront]);

  useEffect(() => {
    if (!idCardBack) {
      setBackPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(idCardBack);
    setBackPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [idCardBack]);

  const validateIdImageFile = (file) => {
    if (!isLikelyImageFile(file)) {
      message.error(
        intl.formatMessage({
          id: 'verification.upload.typeInvalid',
          defaultMessage: '请上传 JPG、PNG 等图片格式',
        })
      );
      return false;
    }
    if (file.size > MAX_ID_IMAGE_BYTES) {
      message.error(
        intl.formatMessage({ id: 'verification.upload.sizeLimit', defaultMessage: '文件大小不能超过 20MB' })
      );
      return false;
    }
    return true;
  };

  const handleFrontUpload = (file) => {
    if (!validateIdImageFile(file)) return Upload.LIST_IGNORE;
    setIdCardFront(file);
    setCurrentStep(1);
    return false;
  };

  const handleBackUpload = (file) => {
    if (!validateIdImageFile(file)) return Upload.LIST_IGNORE;
    setIdCardBack(file);
    if (idCardFront) setCurrentStep(1);
    return false;
  };

  const clearFrontImage = () => {
    setIdCardFront(null);
  };

  const clearBackImage = () => {
    setIdCardBack(null);
  };

  useEffect(() => {
    if (statusLoading) return;
    if (kycStatus === 1) {
      navigate(VERIFICATION_ROUTES.pending, { replace: true });
    } else if (kycStatus === 2) {
      navigate(VERIFICATION_ROUTES.verified, { replace: true });
    } else if (kycStatus === 5) {
      navigate(VERIFICATION_ROUTES.unbindPending, { replace: true });
    } else if (kycStatus === 6) {
      navigate(VERIFICATION_ROUTES.unbindRejected, { replace: true });
    }
  }, [statusLoading, kycStatus, navigate]);

  useEffect(() => {
    const init = async () => {
      setInitLoading(true);
      try {
        const [userInfoResult, kycResult] = await Promise.all([auth.getUserInfo(), base.getKycCountryConfigs()]);
        if (kycResult.success && Array.isArray(kycResult.data)) {
          const list = kycResult.data;
          setKycConfigs(list);
          const userCountry = userInfoResult?.data?.countryCode;
          const matched =
            (userCountry && list.find((item) => item.countryCode === userCountry)) ||
            list.find((item) => item.countryCode === 'WW') ||
            list[0];
          if (matched) {
            applyKycConfig(matched);
          }
        }
      } catch (error) {
        console.error('初始化实名认证表单失败:', error);
      } finally {
        setInitLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (values) => {
    if (requireFront && !idCardFront) {
      message.error(intl.formatMessage({ id: 'verification.upload.required', defaultMessage: '请上传证件正面照片' }));
      return;
    }
    if (requireBack && !idCardBack) {
      message.error(intl.formatMessage({ id: 'verification.upload.required', defaultMessage: '请上传证件反面照片' }));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('countryCode', values.countryCode);
      formData.append('realName', values.realName);
      formData.append('idType', values.idType || currentKycConfig?.primaryIdType || 'PASSPORT');
      formData.append('cardNum', values.cardNum);
      if (idCardFront) formData.append('idCoverImage1', idCardFront, idCardFront.name || 'id-front.jpg');
      if (idCardBack) formData.append('idCoverImage2', idCardBack, idCardBack.name || 'id-back.jpg');

      const response = await instance.post('/productx/user/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'verification.submit.success', defaultMessage: '提交成功，等待审核' }));
        navigate(VERIFICATION_ROUTES.pending, { replace: true });
      } else {
        message.error(
          response.data.message ||
            intl.formatMessage({ id: 'verification.submit.error', defaultMessage: '提交失败，请稍后重试' })
        );
      }
    } catch (error) {
      console.error('提交认证失败:', error);
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;
      let fallback = intl.formatMessage({
        id: 'verification.submit.error',
        defaultMessage: '提交失败，请稍后重试',
      });
      if (status === 413) {
        fallback = intl.formatMessage({
          id: 'verification.submit.tooLarge',
          defaultMessage: '图片过大，请压缩后重试或换一张较小的照片',
        });
      }
      message.error(serverMessage || fallback);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: intl.formatMessage({ id: 'verification.step.info', defaultMessage: '填写信息' }),
      icon: <IdcardOutlined />,
    },
    {
      title: intl.formatMessage({ id: 'verification.step.upload', defaultMessage: '上传证件' }),
      icon: <UploadOutlined />,
    },
    {
      title: intl.formatMessage({ id: 'verification.step.complete', defaultMessage: '完成' }),
      icon: <CheckCircleFilled />,
    },
  ];

  if (statusLoading || initLoading || kycStatus === 1 || kycStatus === 2) {
    return <VerificationLoading />;
  }

  const rejectReason = realnameInfo?.rejectReason || realnameInfo?.realnameRejectReason;

  return (
    <VerificationShell>
      <MainCard $token={token}>
        <div style={{ marginBottom: 20 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(kycStatus === 3 || kycStatus === 4 ? VERIFICATION_ROUTES.rejected : '/profile')}
            style={{ padding: 0, marginBottom: 12, fontSize: 14 }}
          >
            {intl.formatMessage({ id: 'verification.back', defaultMessage: '返回' })}
          </Button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: token.colorText, margin: 0, lineHeight: 1.3 }}>
            {intl.formatMessage({ id: 'verification.title', defaultMessage: '实名认证' })}
          </h1>
          <p style={{ color: token.colorTextSecondary, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
            {intl.formatMessage({
              id: 'verification.subtitle',
              defaultMessage: '请填写真实信息并上传身份证照片，我们将在1-3个工作日内完成审核',
            })}
          </p>
        </div>

        {(kycStatus === 3 || kycStatus === 4) && rejectReason ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16, borderRadius: 10 }}
            message={intl.formatMessage({ id: 'verification.resubmit.hint', defaultMessage: '上次审核未通过，请修改资料后重新提交' })}
            description={rejectReason}
          />
        ) : null}

        <StepContainer $token={token}>
          <Steps current={currentStep} items={steps} />
        </StepContainer>

        <InfoAlert
          message={intl.formatMessage({ id: 'verification.info.title', defaultMessage: '温馨提示' })}
          description={intl.formatMessage({
            id: 'verification.info.desc',
            defaultMessage: '请确保上传的身份证照片清晰可见，信息完整。您的个人信息将被严格保密，仅用于身份验证。',
          })}
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <FormSection>
            <FormRow>
              <Form.Item
                name="countryCode"
                label={
                  <FormLabel $token={token}>
                    <GlobalOutlined /> 国家/地区
                  </FormLabel>
                }
                rules={[{ required: true, message: '请选择国家/地区' }]}
              >
                <Select
                  size="large"
                  style={{ borderRadius: 12 }}
                  onChange={(code) => {
                    const cfg = kycConfigs.find((item) => item.countryCode === code);
                    if (cfg) applyKycConfig(cfg);
                  }}
                >
                  {kycConfigs.map((cfg) => (
                    <Option key={cfg.countryCode} value={cfg.countryCode}>
                      {cfg.countryNameZh || cfg.countryNameEn || cfg.countryCode}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="realName"
                label={
                  <FormLabel $token={token}>
                    <IdcardOutlined /> {intl.formatMessage({ id: 'verification.form.realName.label', defaultMessage: '真实姓名' })}
                  </FormLabel>
                }
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'verification.form.realName.required', defaultMessage: '请输入真实姓名' }),
                  },
                  {
                    pattern: /^[\u4e00-\u9fa5a-zA-Z\s]{2,30}$/,
                    message: intl.formatMessage({ id: 'verification.form.realName.invalid', defaultMessage: '姓名格式不正确' }),
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder={intl.formatMessage({
                    id: 'verification.form.realName.placeholder',
                    defaultMessage: '请输入与身份证一致的真实姓名',
                  })}
                  style={{ borderRadius: 12 }}
                />
              </Form.Item>
            </FormRow>

            <FormRow>
              <Form.Item
                name="idType"
                label={
                  <FormLabel $token={token}>
                    <SafetyCertificateOutlined />{' '}
                    {intl.formatMessage({ id: 'verification.form.idType.label', defaultMessage: '证件类型' })}
                  </FormLabel>
                }
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'verification.form.idType.required', defaultMessage: '请选择证件类型' }),
                  },
                ]}
              >
                <Select size="large" style={{ borderRadius: 12 }}>
                  {currentKycConfig && (
                    <>
                      {currentKycConfig.primaryIdType && (
                        <Option value={currentKycConfig.primaryIdType}>
                          {currentKycConfig.primaryIdNameLocal || currentKycConfig.primaryIdType}
                        </Option>
                      )}
                      {currentKycConfig.secondaryIdType && (
                        <Option value={currentKycConfig.secondaryIdType}>
                          {currentKycConfig.secondaryIdNameLocal || currentKycConfig.secondaryIdType}
                        </Option>
                      )}
                      {currentKycConfig.tertiaryIdType && (
                        <Option value={currentKycConfig.tertiaryIdType}>{currentKycConfig.tertiaryIdType}</Option>
                      )}
                    </>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="cardNum"
                label={
                  <FormLabel $token={token}>
                    <IdcardOutlined /> {intl.formatMessage({ id: 'verification.form.cardNum.label', defaultMessage: '证件号码' })}
                  </FormLabel>
                }
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'verification.form.cardNum.required', defaultMessage: '请输入证件号码' }),
                  },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (currentKycConfig?.countryCode === 'CN') {
                        const pattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
                        if (!pattern.test(value)) {
                          return Promise.reject(
                            new Error(
                              intl.formatMessage({
                                id: 'verification.form.cardNum.invalid',
                                defaultMessage: '身份证号码格式不正确',
                              })
                            )
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input
                  size="large"
                  placeholder={intl.formatMessage({
                    id: 'verification.form.cardNum.placeholder',
                    defaultMessage: '请输入18位身份证号码',
                  })}
                  style={{ borderRadius: 12 }}
                  maxLength={18}
                />
              </Form.Item>
            </FormRow>
          </FormSection>

          <FormSection>
            <FormRow>
              <Form.Item
                label={
                  <FormLabel $token={token}>
                    <UploadOutlined /> {intl.formatMessage({ id: 'verification.form.idCardFront.label', defaultMessage: '身份证正面' })}
                  </FormLabel>
                }
                required={requireFront}
              >
                <UploadBox $token={token}>
                  <Upload.Dragger
                    id="kyc-id-card-front"
                    name="idCoverImage1"
                    beforeUpload={handleFrontUpload}
                    fileList={[]}
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    maxCount={1}
                    showUploadList={false}
                  >
                    {frontPreviewUrl ? (
                      <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                        <img
                          src={frontPreviewUrl}
                          alt="证件正面"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                        />
                        <Button
                          type="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFrontImage();
                          }}
                          style={{ position: 'absolute', right: 4, top: 4, color: token.colorPrimary }}
                        >
                          {intl.formatMessage({ id: 'verification.upload.reupload', defaultMessage: '重新上传' })}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="ant-upload-drag-icon">
                          <UploadOutlined style={{ color: token.colorPrimary }} />
                        </p>
                        <p className="ant-upload-text" style={{ fontSize: 14 }}>
                          {intl.formatMessage({ id: 'verification.upload.front.text', defaultMessage: '点击或拖拽上传身份证正面' })}
                        </p>
                        <p className="ant-upload-hint" style={{ fontSize: 12, color: token.colorTextSecondary }}>
                          {intl.formatMessage({
                            id: 'verification.upload.hint',
                            defaultMessage: '支持 JPG/PNG/HEIC 等，单张不超过 20MB',
                          })}
                        </p>
                      </>
                    )}
                  </Upload.Dragger>
                </UploadBox>
              </Form.Item>

              <Form.Item
                label={
                  <FormLabel $token={token}>
                    <UploadOutlined /> {intl.formatMessage({ id: 'verification.form.idCardBack.label', defaultMessage: '身份证反面' })}
                  </FormLabel>
                }
                required={requireBack}
              >
                <UploadBox $token={token}>
                  <Upload.Dragger
                    id="kyc-id-card-back"
                    name="idCoverImage2"
                    beforeUpload={handleBackUpload}
                    fileList={[]}
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    maxCount={1}
                    showUploadList={false}
                  >
                    {backPreviewUrl ? (
                      <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                        <img
                          src={backPreviewUrl}
                          alt="证件反面"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                        />
                        <Button
                          type="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearBackImage();
                          }}
                          style={{ position: 'absolute', right: 4, top: 4, color: token.colorPrimary }}
                        >
                          {intl.formatMessage({ id: 'verification.upload.reupload', defaultMessage: '重新上传' })}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="ant-upload-drag-icon">
                          <UploadOutlined style={{ color: token.colorPrimary }} />
                        </p>
                        <p className="ant-upload-text" style={{ fontSize: 14 }}>
                          {intl.formatMessage({ id: 'verification.upload.back.text', defaultMessage: '点击或拖拽上传身份证反面' })}
                        </p>
                        <p className="ant-upload-hint" style={{ fontSize: 12, color: token.colorTextSecondary }}>
                          {intl.formatMessage({
                            id: 'verification.upload.hint',
                            defaultMessage: '支持 JPG/PNG/HEIC 等，单张不超过 20MB',
                          })}
                        </p>
                      </>
                    )}
                  </Upload.Dragger>
                </UploadBox>
              </Form.Item>
            </FormRow>
          </FormSection>

          <ActionButtons $token={token}>
            <Button size="large" onClick={() => navigate('/profile')} style={{ borderRadius: 12 }}>
              {intl.formatMessage({ id: 'verification.cancel', defaultMessage: '取消' })}
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={loading} style={{ borderRadius: 12 }}>
              {intl.formatMessage({ id: 'verification.submit', defaultMessage: '提交认证' })}
            </Button>
          </ActionButtons>
          <VerificationHistoryLink />
        </Form>
      </MainCard>
    </VerificationShell>
  );
};

export default VerificationApply;
