import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import SimpleHeader from "components/headers/simple";
import FooterSection from "./Home/components/FooterSection";
import instance from "api/axios";
import { base } from "api/base";
import { auth } from "api/auth";
import { 
  Button, 
  Form,
  Input,
  Select,
  Upload,
  message,
  ConfigProvider,
  theme,
  Card,
  Steps,
  Alert
} from "antd";
import { 
  IdcardOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  UploadOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  GlobalOutlined
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

// ==========================================
// 样式组件
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${props => props.$token.colorBgLayout};
  background-image: 
    radial-gradient(at 0% 0%, ${props => props.$token.colorPrimary}15 0px, transparent 50%),
    radial-gradient(at 100% 0%, #8b5cf615 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: 70px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled(motion.div)`
  max-width: 800px;
  width: 95%;
  margin: 24px auto 40px;
  position: relative;
  z-index: 10;
  flex: 1;
`;

const MainCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 8px 24px -4px rgba(0,0,0,0.08);
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  background: ${props => props.$token.colorBgContainer};
  
  .ant-card-body {
    padding: 32px;
    
    @media (max-width: 768px) {
      padding: 20px;
    }
  }
`;

const StepContainer = styled.div`
  margin: 20px 0 24px;
  
  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: ${props => props.$token.colorSuccess};
    border-color: ${props => props.$token.colorSuccess};
  }
  
  .ant-steps-item-process .ant-steps-item-icon {
    background-color: ${props => props.$token.colorPrimary};
    border-color: ${props => props.$token.colorPrimary};
  }
`;

const FormSection = styled.div`
  margin-top: 20px;
  
  .ant-form-item {
    margin-bottom: 20px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const FormLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$token.colorText};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UploadBox = styled.div`
  .ant-upload-drag {
    border-radius: 12px !important;
    background: ${props => props.$token.colorBgLayout} !important;
    border: 2px dashed ${props => props.$token.colorBorder} !important;
    transition: all 0.3s;
    padding: 16px !important;
    min-height: 160px !important;
    
    &:hover {
      border-color: ${props => props.$token.colorPrimary} !important;
      background: ${props => props.$token.colorPrimaryBg} !important;
    }
  }
  
  .ant-upload-list-item {
    border-radius: 8px !important;
  }
`;

const InfoAlert = styled(Alert)`
  margin-bottom: 20px;
  border-radius: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid ${props => props.$token.colorBorderSecondary};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${props => props.$token.colorSuccessBg};
    color: ${props => props.$token.colorSuccess};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 0 auto 24px;
  }
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: ${props => props.$token.colorText};
    margin-bottom: 12px;
  }
  
  p {
    color: ${props => props.$token.colorTextSecondary};
    margin-bottom: 32px;
  }
`;

// ==========================================
// 逻辑组件
// ==========================================

const VerificationContent = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const intl = useIntl();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [realnameInfo, setRealnameInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [kycConfigs, setKycConfigs] = useState([]);
  const [currentKycConfig, setCurrentKycConfig] = useState(null);
  const [requireFront, setRequireFront] = useState(true);
  const [requireBack, setRequireBack] = useState(true);

  // 根据 KYC 配置应用当前国家的证件类型等设置
  const applyKycConfig = (config) => {
    if (!config) return;
    setCurrentKycConfig(config);
    setRequireFront(config.requireFront !== false); // 后端是 tinyint(1)，null 视为 true
    setRequireBack(config.requireBack !== false);

    // 默认选中当前国家和首选证件类型
    form.setFieldsValue({
      countryCode: config.countryCode,
      idType: config.primaryIdType || undefined,
    });
  };

  // 初始化：获取用户实名认证状态、用户信息（含国家）、KYC 配置列表
  useEffect(() => {
    const init = async () => {
      try {
        const [realnameResult, userInfoResult, kycResult] = await Promise.all([
          auth.getUserRealnameInfo(),
          auth.getUserInfo(),
          base.getKycCountryConfigs()
        ]);

        // 实名状态
        if (realnameResult.success && realnameResult.data) {
          console.log('KYC Info:', realnameResult.data); // 调试信息
          setRealnameInfo(realnameResult.data);
        }

        // 用户信息（主要用 countryCode）
        if (userInfoResult.success && userInfoResult.data) {
          setUserInfo(userInfoResult.data);
        }

        // KYC 配置列表
        if (kycResult.success && Array.isArray(kycResult.data)) {
          const list = kycResult.data;
          setKycConfigs(list);
          const userCountry = userInfoResult?.data?.countryCode;

          // 优先：用户国家 -> WW(全球护照) -> 第一个
          const matched =
            (userCountry && list.find(item => item.countryCode === userCountry)) ||
            list.find(item => item.countryCode === "WW") ||
            list[0];

          if (matched) {
            applyKycConfig(matched);
          }
        }
      } catch (error) {
        console.error("初始化实名认证页面失败:", error);
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
      // 国家代码：直接使用表单中选择的 countryCode
      formData.append('countryCode', values.countryCode);
      formData.append('realName', values.realName);
      // 这里的 idType 直接使用 KYC 配置里的类型编码（如 CHINA_ID_CARD / PASSPORT）
      formData.append('idType', values.idType || (currentKycConfig?.primaryIdType || 'PASSPORT'));
      formData.append('cardNum', values.cardNum);
      if (idCardFront) {
        formData.append('idCoverImage1', idCardFront);
      }
      if (idCardBack) {
        formData.append('idCoverImage2', idCardBack);
      }

      const response = await instance.post('/productx/user/verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        message.success(intl.formatMessage({ id: 'verification.submit.success', defaultMessage: '提交成功，等待审核' }));
        setCurrentStep(2);
        // 更新实名认证信息（可能为“审核中”，由后端控制）
        const realnameResult = await auth.getUserRealnameInfo();
        if (realnameResult.success) {
          setRealnameInfo(realnameResult.data);
        }
      } else {
        message.error(response.data.message || intl.formatMessage({ id: 'verification.submit.error', defaultMessage: '提交失败，请稍后重试' }));
      }
    } catch (error) {
      console.error('提交认证失败:', error);
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'verification.submit.error', defaultMessage: '提交失败，请稍后重试' }));
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

  // 根据 KYC 状态显示不同页面
  // kycStatus: 0=未认证 1=审核中 2=已通过 3=审核失败
  const kycStatus = realnameInfo?.kycStatus || userInfo?.kycStatus || 0;

  // 状态 1：审核中
  if (kycStatus === 1) {
    return (
      <PageLayout $token={token}>
        <SimpleHeader />
        <ContentContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MainCard $token={token}>
            <SuccessContainer $token={token}>
              <div className="success-icon" style={{ background: token.colorInfoBg, color: token.colorInfo }}>
                <SafetyCertificateOutlined />
              </div>
              <h2>{intl.formatMessage({ id: 'verification.reviewing.title', defaultMessage: '实名认证审核中' })}</h2>
              <p style={{ marginBottom: 24 }}>
                {realnameInfo?.statusDescription || intl.formatMessage({ id: 'verification.reviewing.desc', defaultMessage: '您的实名认证资料正在审核中，预计1-3个工作日完成审核' })}
              </p>
              {(realnameInfo?.realName || realnameInfo?.idType || realnameInfo?.submittedAt) && (
                <div style={{ textAlign: 'left', width: '100%', maxWidth: 400, margin: '0 auto 24px', background: token.colorBgLayout, padding: 16, borderRadius: 12 }}>
                  {realnameInfo?.realName && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.name', defaultMessage: '姓名：' })}</strong>{realnameInfo.realName}
                    </p>
                  )}
                  {realnameInfo?.idType && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.idType', defaultMessage: '证件类型：' })}</strong>{realnameInfo.idType}
                    </p>
                  )}
                  {realnameInfo?.idNumber && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.idNumber', defaultMessage: '证件号码：' })}</strong>{realnameInfo.idNumber}
                    </p>
                  )}
                  {realnameInfo?.kycCountry && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.country', defaultMessage: '国家/地区：' })}</strong>{realnameInfo.kycCountry}
                    </p>
                  )}
                  {realnameInfo?.submittedAt && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.submitTime', defaultMessage: '提交时间：' })}</strong>{new Date(realnameInfo.submittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <Button size="large" onClick={() => navigate('/profile')} style={{ borderRadius: 12 }}>
                {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
              </Button>
            </SuccessContainer>
          </MainCard>
        </ContentContainer>
        <FooterSection />
      </PageLayout>
    );
  }

  // 状态 2：已通过
  if (kycStatus === 2) {
    return (
      <PageLayout $token={token}>
        <SimpleHeader />
        <ContentContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MainCard $token={token}>
            <SuccessContainer $token={token}>
              <div className="success-icon">
                <CheckCircleFilled />
              </div>
              <h2>{intl.formatMessage({ id: 'verification.verified.title', defaultMessage: '您已完成实名认证' })}</h2>
              <p style={{ marginBottom: 24 }}>
                {realnameInfo?.statusDescription || intl.formatMessage({ id: 'verification.verified.desc', defaultMessage: '您的实名认证已通过审核' })}
              </p>
              {(realnameInfo?.realName || realnameInfo?.kycCountry || realnameInfo?.verifiedAt) && (
                <div style={{ textAlign: 'left', width: '100%', maxWidth: 400, margin: '0 auto 24px', background: token.colorBgLayout, padding: 16, borderRadius: 12 }}>
                  {realnameInfo?.realName && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.name', defaultMessage: '姓名：' })}</strong>{realnameInfo.realName}
                    </p>
                  )}
                  {realnameInfo?.kycCountry && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.country', defaultMessage: '国家/地区：' })}</strong>{realnameInfo.kycCountry}
                    </p>
                  )}
                  {realnameInfo?.idType && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.idType', defaultMessage: '证件类型：' })}</strong>{realnameInfo.idType}
                    </p>
                  )}
                  {realnameInfo?.verifiedAt && (
                    <p style={{ margin: '8px 0', color: token.colorTextSecondary, fontSize: 14 }}>
                      <strong>{intl.formatMessage({ id: 'verification.info.verifyTime', defaultMessage: '认证时间：' })}</strong>{new Date(realnameInfo.verifiedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              <Button type="primary" size="large" onClick={() => navigate('/profile')} style={{ borderRadius: 12 }}>
                {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
              </Button>
            </SuccessContainer>
          </MainCard>
        </ContentContainer>
        <FooterSection />
      </PageLayout>
    );
  }

  // 状态 3：审核失败
  if (kycStatus === 3) {
    return (
      <PageLayout $token={token}>
        <SimpleHeader />
        <ContentContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MainCard $token={token}>
            <SuccessContainer $token={token}>
              <div className="success-icon" style={{ background: token.colorErrorBg, color: token.colorError }}>
                <InfoCircleOutlined />
              </div>
              <h2>{intl.formatMessage({ id: 'verification.rejected.title', defaultMessage: '实名认证未通过' })}</h2>
              <p style={{ marginBottom: 24 }}>
                {realnameInfo?.statusDescription || intl.formatMessage({ id: 'verification.rejected.desc', defaultMessage: '您的实名认证未通过审核' })}
              </p>
              {realnameInfo?.rejectReason && (
                <Alert
                  message={intl.formatMessage({ id: 'verification.rejected.reason', defaultMessage: '拒绝原因' })}
                  description={realnameInfo.rejectReason}
                  type="error"
                  showIcon
                  style={{ marginBottom: 24, textAlign: 'left', maxWidth: 500, margin: '0 auto 24px' }}
                />
              )}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button size="large" onClick={() => navigate('/profile')} style={{ borderRadius: 12 }}>
                  {intl.formatMessage({ id: 'verification.back.profile', defaultMessage: '返回个人中心' })}
                </Button>
                <Button type="primary" size="large" onClick={() => window.location.reload()} style={{ borderRadius: 12 }}>
                  {intl.formatMessage({ id: 'verification.resubmit', defaultMessage: '重新提交' })}
                </Button>
              </div>
            </SuccessContainer>
          </MainCard>
        </ContentContainer>
        <FooterSection />
      </PageLayout>
    );
  }

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <MainCard $token={token}>
            <div style={{ marginBottom: 20 }}>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/profile')}
                style={{ padding: 0, marginBottom: 12, fontSize: 14 }}
              >
                {intl.formatMessage({ id: 'verification.back', defaultMessage: '返回' })}
              </Button>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: token.colorText, margin: 0, lineHeight: 1.3 }}>
                {intl.formatMessage({ id: 'verification.title', defaultMessage: '实名认证' })}
              </h1>
              <p style={{ color: token.colorTextSecondary, marginTop: 6, marginBottom: 0, fontSize: 14 }}>
                {intl.formatMessage({ id: 'verification.subtitle', defaultMessage: '请填写真实信息并上传身份证照片，我们将在1-3个工作日内完成审核' })}
              </p>
            </div>

          <StepContainer $token={token}>
            <Steps current={currentStep} items={steps} />
          </StepContainer>

          <InfoAlert
            message={intl.formatMessage({ id: 'verification.info.title', defaultMessage: '温馨提示' })}
            description={intl.formatMessage({ id: 'verification.info.desc', defaultMessage: '请确保上传的身份证照片清晰可见，信息完整。您的个人信息将被严格保密，仅用于身份验证。' })}
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ }}
          >
            <FormSection>
              {/* 国家/地区和真实姓名 - 一行两列 */}
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
                      const cfg = kycConfigs.find(item => item.countryCode === code);
                      if (cfg) {
                        applyKycConfig(cfg);
                      }
                    }}
                  >
                    {kycConfigs.map(cfg => (
                      <Option key={cfg.countryCode} value={cfg.countryCode}>
                        {cfg.countryNameZh || cfg.countryNameEn || cfg.countryCode}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="realName"
                  label={<FormLabel $token={token}><IdcardOutlined /> {intl.formatMessage({ id: 'verification.form.realName.label', defaultMessage: '真实姓名' })}</FormLabel>}
                  rules={[
                    { required: true, message: intl.formatMessage({ id: 'verification.form.realName.required', defaultMessage: '请输入真实姓名' }) },
                    { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]{2,30}$/, message: intl.formatMessage({ id: 'verification.form.realName.invalid', defaultMessage: '姓名格式不正确' }) }
                  ]}
                >
                  <Input 
                    size="large" 
                    placeholder={intl.formatMessage({ id: 'verification.form.realName.placeholder', defaultMessage: '请输入与身份证一致的真实姓名' })} 
                    style={{ borderRadius: 12 }} 
                  />
                </Form.Item>
              </FormRow>

              {/* 证件类型和证件号码 - 一行两列 */}
              <FormRow>
                <Form.Item
                  name="idType"
                  label={<FormLabel $token={token}><SafetyCertificateOutlined /> {intl.formatMessage({ id: 'verification.form.idType.label', defaultMessage: '证件类型' })}</FormLabel>}
                  rules={[{ required: true, message: intl.formatMessage({ id: 'verification.form.idType.required', defaultMessage: '请选择证件类型' }) }]}
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
                          <Option value={currentKycConfig.tertiaryIdType}>
                            {currentKycConfig.tertiaryIdType}
                          </Option>
                        )}
                      </>
                    )}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="cardNum"
                  label={<FormLabel $token={token}><IdcardOutlined /> {intl.formatMessage({ id: 'verification.form.cardNum.label', defaultMessage: '证件号码' })}</FormLabel>}
                  rules={[
                    { required: true, message: intl.formatMessage({ id: 'verification.form.cardNum.required', defaultMessage: '请输入证件号码' }) },
                    // 如果是中国大陆，可选地校验身份证格式；其他国家不做格式校验
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        if (currentKycConfig?.countryCode === 'CN') {
                          const pattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
                          if (!pattern.test(value)) {
                            return Promise.reject(new Error(
                              intl.formatMessage({ id: 'verification.form.cardNum.invalid', defaultMessage: '身份证号码格式不正确' })
                            ));
                          }
                        }
                        return Promise.resolve();
                      },
                    })
                  ]}
                >
                  <Input 
                    size="large" 
                    placeholder={intl.formatMessage({ id: 'verification.form.cardNum.placeholder', defaultMessage: '请输入18位身份证号码' })} 
                    style={{ borderRadius: 12 }} 
                    maxLength={18}
                  />
                </Form.Item>
              </FormRow>
            </FormSection>

            <FormSection>
              {/* 证件正反面 - 一行两列 */}
              <FormRow>
                <Form.Item
                  label={<FormLabel $token={token}><UploadOutlined /> {intl.formatMessage({ id: 'verification.form.idCardFront.label', defaultMessage: '身份证正面' })}</FormLabel>}
                  required
                >
                  <UploadBox $token={token}>
                    <Upload.Dragger
                      beforeUpload={(file) => {
                        if (file.size > 5 * 1024 * 1024) {
                          message.error(intl.formatMessage({ id: 'verification.upload.sizeLimit', defaultMessage: '文件大小不能超过 5MB' }));
                          return Upload.LIST_IGNORE;
                        }
                        setIdCardFront(file);
                        setCurrentStep(1);
                        return false;
                      }}
                      onRemove={() => {
                        setIdCardFront(null);
                        if (!idCardBack) setCurrentStep(0);
                      }}
                      fileList={[]}
                      accept="image/*"
                      maxCount={1}
                      showUploadList={false}
                    >
                      {idCardFront ? (
                        <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                          <img 
                            src={URL.createObjectURL(idCardFront)} 
                            alt="证件正面" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }} 
                          />
                          <Button
                            type="text"
                            danger
                            icon={<UploadOutlined />}
                            size="small"
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: 'rgba(255,255,255,0.95)',
                              borderRadius: '6px',
                              fontSize: 12
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIdCardFront(null);
                              if (!idCardBack) setCurrentStep(0);
                            }}
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
                            {intl.formatMessage({ id: 'verification.upload.hint', defaultMessage: '支持 JPG, PNG 格式，单个文件不超过 5MB' })}
                          </p>
                        </>
                      )}
                    </Upload.Dragger>
                  </UploadBox>
                </Form.Item>

                <Form.Item
                  label={<FormLabel $token={token}><UploadOutlined /> {intl.formatMessage({ id: 'verification.form.idCardBack.label', defaultMessage: '身份证反面' })}</FormLabel>}
                  required
                >
                  <UploadBox $token={token}>
                    <Upload.Dragger
                      beforeUpload={(file) => {
                        if (file.size > 5 * 1024 * 1024) {
                          message.error(intl.formatMessage({ id: 'verification.upload.sizeLimit', defaultMessage: '文件大小不能超过 5MB' }));
                          return Upload.LIST_IGNORE;
                        }
                        setIdCardBack(file);
                        if (idCardFront) setCurrentStep(1);
                        return false;
                      }}
                      onRemove={() => {
                        setIdCardBack(null);
                        if (!idCardFront) setCurrentStep(0);
                      }}
                      fileList={[]}
                      accept="image/*"
                      maxCount={1}
                      showUploadList={false}
                    >
                      {idCardBack ? (
                        <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                          <img 
                            src={URL.createObjectURL(idCardBack)} 
                            alt="证件反面" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }} 
                          />
                          <Button
                            type="text"
                            danger
                            icon={<UploadOutlined />}
                            size="small"
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: 'rgba(255,255,255,0.95)',
                              borderRadius: '6px',
                              fontSize: 12
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIdCardBack(null);
                              if (!idCardFront) setCurrentStep(0);
                            }}
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
                            {intl.formatMessage({ id: 'verification.upload.hint', defaultMessage: '支持 JPG, PNG 格式，单个文件不超过 5MB' })}
                          </p>
                        </>
                      )}
                    </Upload.Dragger>
                  </UploadBox>
                </Form.Item>
              </FormRow>
            </FormSection>

            <ActionButtons $token={token}>
              <Button 
                size="large" 
                onClick={() => navigate('/profile')}
                style={{ borderRadius: 12 }}
              >
                {intl.formatMessage({ id: 'verification.cancel', defaultMessage: '取消' })}
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={loading}
                style={{ borderRadius: 12 }}
              >
                {intl.formatMessage({ id: 'verification.submit', defaultMessage: '提交认证' })}
              </Button>
            </ActionButtons>
          </Form>
        </MainCard>
      </ContentContainer>
      <FooterSection />
    </PageLayout>
  );
};

// ==========================================
// 根组件
// ==========================================

const VerificationPage = () => {
  const customTheme = {
    token: {
      colorPrimary: '#7c3aed',
      borderRadius: 10,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 10 },
      Input: { borderRadius: 10 },
      Select: { borderRadius: 10 },
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <VerificationContent />
    </ConfigProvider>
  );
};

export default VerificationPage;

