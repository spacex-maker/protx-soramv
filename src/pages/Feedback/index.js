import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import SimpleHeader from "components/headers/simple";
import FooterSection from "../Home/components/FooterSection";
import { base } from "api/base";
import axios from "api/axios";
import {
  Button,
  message,
  ConfigProvider,
  theme,
  Form,
  Input,
  Select,
  Upload,
  Tag,
} from "antd";
import {
  BugFilled,
  BulbFilled,
  QuestionCircleFilled,
  MessageFilled,
  CloudUploadOutlined,
  SendOutlined,
  CheckCircleFilled,
  MailFilled,
  ReadFilled,
  CustomerServiceFilled,
} from "@ant-design/icons";

import WechatServiceModal from "./WechatServiceModal";

const { TextArea } = Input;
const { Option } = Select;

// ==========================================
// 1. 样式系统 (Styled System)
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${(props) => props.$token.colorBgLayout};
  background-image:
    radial-gradient(at 0% 0%, ${(props) => props.$token.colorPrimary}15 0px, transparent 50%),
    radial-gradient(at 100% 0%, #8b5cf615 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-top: 80px;
  overflow-x: hidden;
`;

const ContentContainer = styled(motion.div)`
  max-width: 1120px;
  width: 94%;
  margin: 32px auto 64px;
  position: relative;
  z-index: 10;
`;

const SplitCard = styled(motion.div)`
  background: ${(props) => props.$token.colorBgContainer};
  border-radius: 24px;
  box-shadow:
    0 24px 48px -12px rgba(0,0,0,0.1),
    0 0 0 1px ${(props) => props.$token.colorBorderSecondary};
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (min-width: 992px) {
    flex-direction: row;
    min-height: 640px;
  }
`;

const LeftPanel = styled.div`
  background: linear-gradient(135deg, ${(props) => props.$token.colorPrimary} 0%, #6d28d9 100%);
  padding: 40px 36px 36px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }

  h1 {
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 12px;
    color: white;
    line-height: 1.15;
    position: relative;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 15px;
    opacity: 0.92;
    max-width: 320px;
    line-height: 1.65;
    position: relative;
  }

  @media (min-width: 992px) {
    padding: 48px 40px 44px;
    flex: 0 0 380px;
    max-width: 380px;
  }

  @media (max-width: 991px) {
    padding: 36px 28px 28px;
    flex: none;
  }
`;

const ContactLinks = styled.div`
  margin-top: 32px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 992px) {
    margin-top: 40px;
    gap: 12px;
  }
`;

const LinkItem = styled.a`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  color: white;
  text-decoration: none;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateX(4px);
    color: white;
  }

  .icon { font-size: 18px; margin-right: 14px; flex-shrink: 0; }
  .text {
    min-width: 0;
    h4 { margin: 0; color: white; font-size: 14px; font-weight: 600; }
    span { font-size: 12px; opacity: 0.85; display: block; margin-top: 2px; }
  }
`;

const RightPanel = styled.div`
  padding: 36px 32px 40px;
  flex: 1;
  min-width: 0;
  background: ${(props) => props.$token.colorBgContainer};
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;

  @media (min-width: 992px) {
    padding: 44px 48px 48px;
  }

  @media (max-width: 576px) {
    padding: 28px 20px 32px;
  }
`;

const FormSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => props.$token.colorTextSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
  padding-bottom: 6px;
`;

const FormSection = styled.div`
  margin-bottom: 28px;

  &:last-of-type {
    margin-bottom: 24px;
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const TypeCard = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  border: 2px solid ${(props) => props.$active ? props.$token.colorPrimary : props.$token.colorBorderSecondary};
  background: ${(props) => props.$active ? props.$token.colorPrimaryBg : props.$token.colorBgLayout};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  &:hover {
    border-color: ${(props) => props.$token.colorPrimary};
    background: ${(props) => props.$active ? props.$token.colorPrimaryBg : props.$token.colorBgContainer};
  }

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${(props) => props.$active ? props.$token.colorPrimary : props.$token.colorFillSecondary};
    color: ${(props) => props.$active ? '#fff' : props.$token.colorTextSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .content {
    min-width: 0;
    h4 { margin: 0 0 2px; font-size: 14px; font-weight: 600; color: ${(props) => props.$token.colorText}; }
    p { margin: 0; font-size: 12px; color: ${(props) => props.$token.colorTextSecondary}; line-height: 1.4; }
  }
`;

const FormLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.$token.colorText};
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UploadBox = styled.div`
  .ant-upload-drag {
    border-radius: 14px !important;
    background: ${(props) => props.$token.colorBgLayout} !important;
    border: 1px dashed ${(props) => props.$token.colorBorder} !important;
    transition: all 0.3s;
    padding: 24px 16px !important;

    &:hover {
      border-color: ${(props) => props.$token.colorPrimary} !important;
      background: ${(props) => props.$token.colorPrimaryBg} !important;
    }
  }

  .ant-upload-list-item {
    border-radius: 8px !important;
  }
`;

const InlineFieldsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const SuccessOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: ${(props) => props.$token.colorBgContainer};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 40px 24px;
  text-align: center;

  .icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${(props) => props.$token.colorSuccessBg};
    color: ${(props) => props.$token.colorSuccess};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin-bottom: 24px;
  }

  h2 { font-size: 22px; margin-bottom: 12px; color: ${(props) => props.$token.colorText}; font-weight: 700; }
  p { color: ${(props) => props.$token.colorTextSecondary}; max-width: 380px; margin-bottom: 28px; line-height: 1.6; font-size: 14px; }
`;

// ==========================================
// 2. 逻辑组件
// ==========================================

const FeedbackContent = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const intl = useIntl();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [submitted, setSubmitted] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [officialEmail, setOfficialEmail] = useState("support@soramv.com");
  const [wechatModalOpen, setWechatModalOpen] = useState(false);

  const typeOptions = [
    { key: "suggestion", icon: <BulbFilled />, title: intl.formatMessage({ id: "feedback.type.suggestion.title", defaultMessage: "功能建议" }), desc: intl.formatMessage({ id: "feedback.type.suggestion.desc", defaultMessage: "我有新想法或改进建议" }) },
    { key: "bug", icon: <BugFilled />, title: intl.formatMessage({ id: "feedback.type.bug.title", defaultMessage: "缺陷反馈" }), desc: intl.formatMessage({ id: "feedback.type.bug.desc", defaultMessage: "我遇到了错误或异常" }) },
    { key: "question", icon: <QuestionCircleFilled />, title: intl.formatMessage({ id: "feedback.type.question.title", defaultMessage: "使用咨询" }), desc: intl.formatMessage({ id: "feedback.type.question.desc", defaultMessage: "我不懂某个功能怎么用" }) },
    { key: "other", icon: <MessageFilled />, title: intl.formatMessage({ id: "feedback.type.other.title", defaultMessage: "其他" }), desc: intl.formatMessage({ id: "feedback.type.other.desc", defaultMessage: "其他类别的反馈" }) },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("feedbackType", feedbackType);
      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("priority", values.priority || "MEDIUM");
      if (values.contact) formData.append("contact", values.contact);
      if (fileList?.length > 0) {
        fileList.forEach((file) => formData.append("files", file));
      }
      await axios.post("/base/productx/user-feedback/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error("提交反馈失败:", error);
      message.error(intl.formatMessage({ id: "feedback.submit.error", defaultMessage: "提交失败，请稍后重试" }));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFeedbackType("suggestion");
  };

  useEffect(() => {
    const fetchOfficialEmail = async () => {
      const result = await base.getOfficialEmail();
      if (result.success && result.data) setOfficialEmail(result.data);
    };
    fetchOfficialEmail();
  }, []);

  return (
    <PageLayout $token={token}>
      <SimpleHeader />

      <ContentContainer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SplitCard $token={token}>
          <LeftPanel $token={token}>
            <div>
              <h1>
                {intl.formatMessage({ id: "feedback.leftPanel.title.line1", defaultMessage: "我们倾听" })}
                <br />
                {intl.formatMessage({ id: "feedback.leftPanel.title.line2", defaultMessage: "您的声音" })}
              </h1>
              <p style={{ marginTop: 24 }}>
                {intl.formatMessage({ id: "feedback.leftPanel.description", defaultMessage: "您的反馈是我们产品进步的动力。无论是发现 Bug，还是有绝妙的新功能点子，都请告诉我们。" })}
              </p>
            </div>

            <ContactLinks>
              <LinkItem href="#" onClick={(e) => { e.preventDefault(); navigate("/help"); }}>
                <div className="icon"><ReadFilled /></div>
                <div className="text">
                  <h4>{intl.formatMessage({ id: "feedback.contact.helpDoc.title", defaultMessage: "帮助文档" })}</h4>
                  <span>{intl.formatMessage({ id: "feedback.contact.helpDoc.desc", defaultMessage: "查阅常见问题与使用指南" })}</span>
                </div>
              </LinkItem>
              <LinkItem href={`mailto:${officialEmail}`}>
                <div className="icon"><MailFilled /></div>
                <div className="text">
                  <h4>{intl.formatMessage({ id: "feedback.contact.email.title", defaultMessage: "邮件支持" })}</h4>
                  <span>{officialEmail}</span>
                </div>
              </LinkItem>
              <LinkItem
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setWechatModalOpen(true);
                }}
              >
                <div className="icon"><CustomerServiceFilled /></div>
                <div className="text">
                  <h4>{intl.formatMessage({ id: "feedback.contact.service.title", defaultMessage: "在线客服" })}</h4>
                  <span>{intl.formatMessage({ id: "feedback.contact.service.hours", defaultMessage: "工作日 9:00 - 18:00" })}</span>
                </div>
              </LinkItem>
            </ContactLinks>
          </LeftPanel>

          <RightPanel $token={token}>
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ priority: "MEDIUM" }}>
                    <FormSection $token={token}>
                      <FormSectionTitle $token={token}>{intl.formatMessage({ id: "feedback.form.type.label", defaultMessage: "反馈类型" })}</FormSectionTitle>
                      <TypeGrid>
                        {typeOptions.map((opt) => (
                          <TypeCard key={opt.key} $active={feedbackType === opt.key} $token={token} onClick={() => setFeedbackType(opt.key)}>
                            <div className="icon-box">{opt.icon}</div>
                            <div className="content">
                              <h4>{opt.title}</h4>
                              <p>{opt.desc}</p>
                            </div>
                          </TypeCard>
                        ))}
                      </TypeGrid>
                    </FormSection>

                    <FormSection $token={token}>
                      <FormSectionTitle $token={token}>{intl.formatMessage({ id: "feedback.form.section.content", defaultMessage: "反馈内容" })}</FormSectionTitle>
                      <Form.Item name="title" label={<FormLabel $token={token}>{intl.formatMessage({ id: "feedback.form.title.label", defaultMessage: "简要概述" })}</FormLabel>} rules={[{ required: true, message: intl.formatMessage({ id: "feedback.form.title.required", defaultMessage: "请输入标题" }) }]} style={{ marginBottom: 20 }}>
                        <Input placeholder={intl.formatMessage({ id: "feedback.form.title.placeholder", defaultMessage: "一句话描述您的问题或建议" })} size="large" style={{ borderRadius: 12 }} />
                      </Form.Item>
                      <Form.Item name="content" label={<FormLabel $token={token}>{intl.formatMessage({ id: "feedback.form.content.label", defaultMessage: "详细描述" })}</FormLabel>} rules={[{ required: true, message: intl.formatMessage({ id: "feedback.form.content.required", defaultMessage: "请输入详细内容" }) }]}>
                        <TextArea rows={5} placeholder={intl.formatMessage({ id: "feedback.form.content.placeholder", defaultMessage: "请详细描述背景、重现步骤或具体建议..." })} showCount maxLength={2000} style={{ borderRadius: 12 }} />
                      </Form.Item>
                    </FormSection>

                    <FormSection $token={token}>
                      <Form.Item label={<FormLabel $token={token}>{intl.formatMessage({ id: "feedback.form.attachment.label", defaultMessage: "附件 (可选)" })}</FormLabel>}>
                        <UploadBox $token={token}>
                          <Upload.Dragger
                            fileList={fileList}
                            beforeUpload={(file) => {
                              if (file.size > 5 * 1024 * 1024) {
                                message.error(intl.formatMessage({ id: "feedback.upload.sizeLimit", defaultMessage: "文件大小不能超过 5MB" }));
                                return Upload.LIST_IGNORE;
                              }
                              setFileList((prev) => [...prev, file]);
                              return false;
                            }}
                            onRemove={(file) => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))}
                            multiple
                            listType="picture"
                            maxCount={5}
                          >
                            <p className="ant-upload-drag-icon"><CloudUploadOutlined style={{ color: token.colorPrimary }} /></p>
                            <p className="ant-upload-text" style={{ fontSize: 14 }}>{intl.formatMessage({ id: "feedback.upload.dragText", defaultMessage: "点击或拖拽文件到此处上传" })}</p>
                            <p className="ant-upload-hint" style={{ fontSize: 12, color: token.colorTextSecondary }}>{intl.formatMessage({ id: "feedback.upload.hint", defaultMessage: "支持 JPG, PNG, PDF 等格式，单个文件不超过 5MB" })}</p>
                          </Upload.Dragger>
                        </UploadBox>
                      </Form.Item>
                    </FormSection>

                    <FormSection $token={token}>
                      <FormSectionTitle $token={token}>{intl.formatMessage({ id: "feedback.form.section.extra", defaultMessage: "补充信息" })}</FormSectionTitle>
                      <InlineFieldsRow>
                        <Form.Item name="priority" label={<FormLabel $token={token}>{intl.formatMessage({ id: "feedback.form.priority.label", defaultMessage: "优先级" })}</FormLabel>}>
                          <Select size="large" style={{ borderRadius: 12 }}>
                            <Option value="LOW"><Tag color="blue">{intl.formatMessage({ id: "feedback.priority.low.label", defaultMessage: "低" })}</Tag> {intl.formatMessage({ id: "feedback.priority.low.desc", defaultMessage: "不影响使用" })}</Option>
                            <Option value="MEDIUM"><Tag color="orange">{intl.formatMessage({ id: "feedback.priority.medium.label", defaultMessage: "中" })}</Tag> {intl.formatMessage({ id: "feedback.priority.medium.desc", defaultMessage: "体验受影响" })}</Option>
                            <Option value="HIGH"><Tag color="red">{intl.formatMessage({ id: "feedback.priority.high.label", defaultMessage: "高" })}</Tag> {intl.formatMessage({ id: "feedback.priority.high.desc", defaultMessage: "严重阻碍使用" })}</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item name="contact" label={<FormLabel $token={token}>{intl.formatMessage({ id: "feedback.form.contact.label", defaultMessage: "联系方式 (可选)" })}</FormLabel>}>
                          <Input placeholder={intl.formatMessage({ id: "feedback.form.contact.placeholder", defaultMessage: "Email 或 手机号" })} size="large" style={{ borderRadius: 12 }} />
                        </Form.Item>
                      </InlineFieldsRow>
                    </FormSection>

                    <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                      <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<SendOutlined />} style={{ height: 48, borderRadius: 12, fontSize: 16, fontWeight: 600 }}>
                        {intl.formatMessage({ id: "feedback.form.submit", defaultMessage: "提交反馈" })}
                      </Button>
                    </Form.Item>
                  </Form>
                </motion.div>
              ) : (
                <SuccessOverlay key="success" $token={token} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="icon-wrapper"><CheckCircleFilled /></div>
                  <h2>{intl.formatMessage({ id: "feedback.success.title", defaultMessage: "反馈已送达！" })}</h2>
                  <p>{intl.formatMessage({ id: "feedback.success.description", defaultMessage: "感谢您的宝贵意见。我们的产品团队会仔细阅读每一条反馈。如果是 Bug 反馈，我们可能会通过预留的联系方式与您沟通。" })}</p>
                  <div style={{ display: "flex", gap: 16 }}>
                    <Button size="large" onClick={() => window.history.back()} style={{ borderRadius: 12 }}>{intl.formatMessage({ id: "feedback.success.back", defaultMessage: "返回上一页" })}</Button>
                    <Button type="primary" size="large" onClick={handleReset} style={{ borderRadius: 12 }}>{intl.formatMessage({ id: "feedback.success.another", defaultMessage: "再提一条" })}</Button>
                  </div>
                </SuccessOverlay>
              )}
            </AnimatePresence>
          </RightPanel>
        </SplitCard>
      </ContentContainer>

      <WechatServiceModal open={wechatModalOpen} onClose={() => setWechatModalOpen(false)} />

      <FooterSection />
    </PageLayout>
  );
};

// ==========================================
// 3. 根组件
// ==========================================

const FeedbackPage = () => {
  const customTheme = {
    token: {
      colorPrimary: "#7c3aed",
      borderRadius: 10,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 10 },
      Input: { borderRadius: 10 },
      Select: { borderRadius: 10 },
    },
  };

  return (
    <ConfigProvider theme={customTheme}>
      <FeedbackContent />
    </ConfigProvider>
  );
};

export default FeedbackPage;
