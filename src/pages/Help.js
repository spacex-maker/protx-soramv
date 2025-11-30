import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import SimpleHeader from "components/headers/simple";
import FooterSection from "./Home/components/FooterSection";
import SEO, { SEOConfigs, generateFAQStructuredData } from 'components/SEO';
import { 
  Button, 
  Input, 
  message, 
  ConfigProvider,
  theme,
  Collapse,
  Tag,
  Space,
  Empty,
  Card
} from "antd";
import { 
  QuestionCircleOutlined,
  SearchOutlined,
  BookOutlined,
  RocketOutlined,
  SafetyOutlined,
  DollarOutlined,
  SettingOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  RightOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

const { Panel } = Collapse;
const { Search } = Input;

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
  padding-top: 80px;
  overflow-x: hidden;
`;

const ContentContainer = styled(motion.div)`
  max-width: 1200px;
  width: 95%;
  margin: 40px auto 60px;
  position: relative;
  z-index: 10;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;

  h1 {
    font-size: 40px;
    font-weight: 800;
    color: ${props => props.$token.colorText};
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  p {
    font-size: 18px;
    color: ${props => props.$token.colorTextSecondary};
    margin: 0;
    max-width: 600px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    margin-bottom: 32px;
    h1 {
      font-size: 28px;
    }
    p {
      font-size: 16px;
    }
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled(motion.div)`
  background: ${props => props.$token.colorBgContainer};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  height: fit-content;
  position: sticky;
  top: 100px;

  @media (max-width: 992px) {
    position: static;
    margin-bottom: 24px;
  }
`;

const CategoryItem = styled(motion.div)`
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  background: ${props => props.$active ? props.$token.colorPrimaryBg : 'transparent'};
  color: ${props => props.$active ? props.$token.colorPrimary : props.$token.colorText};
  border: 1px solid ${props => props.$active ? props.$token.colorPrimaryBorder : 'transparent'};

  &:hover {
    background: ${props => props.$token.colorFillQuaternary};
    transform: translateX(4px);
  }

  .icon {
    font-size: 18px;
    margin-right: 12px;
  }

  .label {
    flex: 1;
    font-weight: ${props => props.$active ? 600 : 500};
    font-size: 14px;
  }

  .count {
    font-size: 12px;
    color: ${props => props.$token.colorTextTertiary};
    background: ${props => props.$token.colorFillQuaternary};
    padding: 2px 8px;
    border-radius: 12px;
  }
`;

const ContentArea = styled.div`
  background: ${props => props.$token.colorBgContainer};
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.$token.colorBorderSecondary};

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const SearchBox = styled.div`
  margin-bottom: 32px;

  .ant-input-search {
    border-radius: 12px;
    height: 48px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$token.colorText};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionDesc = styled.p`
  font-size: 14px;
  color: ${props => props.$token.colorTextSecondary};
  margin: 0 0 24px 0;
`;

const FAQCollapse = styled(Collapse)`
  background: transparent;
  border: none;

  .ant-collapse-item {
    border: 1px solid ${props => props.$token.colorBorderSecondary};
    border-radius: 12px !important;
    margin-bottom: 12px;
    background: ${props => props.$token.colorBgContainer};
    overflow: hidden;

    .ant-collapse-header {
      padding: 16px 20px !important;
      font-weight: 600;
      font-size: 15px;
      color: ${props => props.$token.colorText};
    }

    .ant-collapse-content {
      border-top: 1px solid ${props => props.$token.colorBorderSecondary};
      background: ${props => props.$token.colorBgLayout};
    }

    .ant-collapse-content-box {
      padding: 20px !important;
      color: ${props => props.$token.colorTextSecondary};
      line-height: 1.8;
      font-size: 14px;
    }
  }
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 32px;
`;

const QuickLinkCard = styled(motion.div)`
  padding: 20px;
  border-radius: 16px;
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  background: ${props => props.$token.colorBgLayout};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .icon {
    font-size: 24px;
    color: ${props => props.$token.colorPrimary};
    margin-bottom: 12px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
    margin-bottom: 6px;
  }

  .desc {
    font-size: 13px;
    color: ${props => props.$token.colorTextSecondary};
  }
`;

const ContactCard = styled(Card)`
  margin-top: 32px;
  border-radius: 16px;
  border: 1px solid ${props => props.$token.colorPrimaryBorder};
  background: ${props => props.$token.colorPrimaryBg};

  .ant-card-body {
    padding: 24px;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    color: ${props => props.$token.colorTextSecondary};
    font-size: 14px;

    .icon {
      color: ${props => props.$token.colorPrimary};
    }
  }
`;

// ==========================================
// 数据配置
// ==========================================

const categories = [
  {
    key: 'getting-started',
    icon: <RocketOutlined />,
    label: '快速开始',
    count: 8
  },
  {
    key: 'account',
    icon: <SettingOutlined />,
    label: '账户设置',
    count: 12
  },
  {
    key: 'billing',
    icon: <DollarOutlined />,
    label: '支付与订阅',
    count: 10
  },
  {
    key: 'features',
    icon: <BookOutlined />,
    label: '功能使用',
    count: 15
  },
  {
    key: 'security',
    icon: <SafetyOutlined />,
    label: '安全与隐私',
    count: 6
  },
  {
    key: 'troubleshooting',
    icon: <QuestionCircleOutlined />,
    label: '问题排查',
    count: 9
  }
];

const faqData = {
  'getting-started': [
    {
      key: '1',
      question: '如何注册账号？',
      answer: '您可以通过以下方式注册：\n1. 访问注册页面，输入邮箱和密码\n2. 完成邮箱验证\n3. 设置个人信息\n4. 开始使用平台服务'
    },
    {
      key: '2',
      question: '首次使用需要做什么？',
      answer: '首次使用建议您：\n1. 完善个人资料和头像\n2. 查看新手引导教程\n3. 了解平台主要功能\n4. 设置支付方式（如需要）'
    },
    {
      key: '3',
      question: '如何选择适合的模型？',
      answer: '平台提供多种视频生成模型，您可以根据以下因素选择：\n• 视频风格需求\n• 生成速度要求\n• 预算考虑\n• 查看模型示例和参数说明'
    },
    {
      key: '4',
      question: '视频生成需要多长时间？',
      answer: '生成时间取决于：\n• 选择的模型类型\n• 视频长度和复杂度\n• 当前服务器负载\n通常需要 1-5 分钟，您可以在"我的作品"中查看进度'
    },
    {
      key: '5',
      question: '如何下载生成的视频？',
      answer: '在"我的作品"页面：\n1. 找到您要下载的视频\n2. 点击视频卡片上的下载按钮\n3. 选择下载质量\n4. 视频将保存到您的设备'
    },
    {
      key: '6',
      question: '支持哪些视频格式？',
      answer: '平台支持以下格式：\n• 输入：MP4, MOV, AVI\n• 输出：MP4 (H.264编码)\n• 最大分辨率：4K\n• 最大文件大小：500MB'
    },
    {
      key: '7',
      question: '如何邀请好友？',
      answer: '访问"邀请好友"页面：\n1. 复制您的专属邀请码\n2. 分享给好友\n3. 好友注册后双方都能获得奖励\n4. 在邀请记录中查看详情'
    },
    {
      key: '8',
      question: '如何联系客服？',
      answer: '您可以通过以下方式联系我们：\n• 在线客服：工作日 9:00-18:00\n• 邮箱：support@productx.com\n• 反馈建议页面提交问题'
    }
  ],
  'account': [
    {
      key: '1',
      question: '如何修改个人资料？',
      answer: '在"个人中心"页面：\n1. 点击"编辑资料"按钮\n2. 修改昵称、简介等信息\n3. 上传新头像（支持 JPG、PNG，最大 2MB）\n4. 保存更改'
    },
    {
      key: '2',
      question: '如何修改密码？',
      answer: '在"安全设置"页面：\n1. 找到"修改密码"选项\n2. 输入当前密码\n3. 设置新密码（至少8位，包含字母和数字）\n4. 确认新密码并保存'
    },
    {
      key: '3',
      question: '如何绑定手机号？',
      answer: '在"个人中心"或"安全设置"：\n1. 点击"绑定手机号"\n2. 输入手机号码\n3. 接收并输入验证码\n4. 完成绑定'
    },
    {
      key: '4',
      question: '如何开启两步验证？',
      answer: '在"安全设置"页面：\n1. 找到"两步验证"选项\n2. 使用身份验证器应用扫描二维码\n3. 输入验证码确认\n4. 保存备用验证码'
    },
    {
      key: '5',
      question: '账号被锁定怎么办？',
      answer: '如果账号被锁定：\n1. 检查邮箱是否有通知邮件\n2. 联系客服说明情况\n3. 提供账号相关信息\n4. 按照客服指引解锁'
    }
  ],
  'billing': [
    {
      key: '1',
      question: '如何充值？',
      answer: '在"我的钱包"页面：\n1. 点击"充值"按钮\n2. 选择充值金额\n3. 选择支付方式（支付宝、微信、银行卡）\n4. 完成支付'
    },
    {
      key: '2',
      question: '支持哪些支付方式？',
      answer: '目前支持：\n• 支付宝\n• 微信支付\n• 银行卡（银联）\n• USDT（加密货币）\n• 更多支付方式正在接入中'
    },
    {
      key: '3',
      question: '如何查看账单记录？',
      answer: '在"我的钱包"或"账单"页面：\n1. 查看所有交易记录\n2. 按时间、类型筛选\n3. 查看详细交易信息\n4. 导出账单（PDF）'
    },
    {
      key: '4',
      question: '订阅如何取消？',
      answer: '在"订阅管理"页面：\n1. 找到当前订阅\n2. 点击"取消订阅"\n3. 确认取消操作\n4. 订阅将在当前周期结束后停止'
    },
    {
      key: '5',
      question: '退款政策是什么？',
      answer: '退款政策：\n• 充值金额不支持退款\n• 订阅费用按剩余天数退款\n• 生成失败可申请退款\n• 退款将在 3-7 个工作日内到账'
    }
  ],
  'features': [
    {
      key: '1',
      question: '如何使用文本生成视频？',
      answer: '在"工作台"页面：\n1. 选择"文本生成视频"\n2. 输入视频描述（提示词）\n3. 选择模型和参数\n4. 点击"生成"并等待完成'
    },
    {
      key: '2',
      question: '如何上传参考图片？',
      answer: '在生成页面：\n1. 点击"上传图片"区域\n2. 选择本地图片文件\n3. 等待上传完成\n4. 图片将作为视频生成的参考'
    },
    {
      key: '3',
      question: '提示词怎么写？',
      answer: '提示词建议：\n• 描述场景、人物、动作\n• 使用具体形容词\n• 可以包含风格要求\n• 支持中英文\n• 建议长度 20-200 字'
    },
    {
      key: '4',
      question: '如何调整视频参数？',
      answer: '在生成设置中：\n• 分辨率：选择 720p/1080p/4K\n• 时长：设置视频长度\n• 帧率：选择 24/30/60 fps\n• 其他高级参数'
    }
  ],
  'security': [
    {
      key: '1',
      question: '如何保护账号安全？',
      answer: '安全建议：\n1. 使用强密码（8位以上，包含大小写字母、数字、符号）\n2. 开启两步验证\n3. 定期修改密码\n4. 不要在公共设备登录'
    },
    {
      key: '2',
      question: '数据是否安全？',
      answer: '我们采用以下措施保护数据：\n• 数据加密传输（HTTPS）\n• 服务器端加密存储\n• 定期安全审计\n• 符合 GDPR 标准'
    },
    {
      key: '3',
      question: '如何查看登录记录？',
      answer: '在"安全设置"页面：\n1. 找到"登录记录"\n2. 查看所有登录历史\n3. 包括时间、地点、设备\n4. 发现异常可立即修改密码'
    }
  ],
  'troubleshooting': [
    {
      key: '1',
      question: '视频生成失败怎么办？',
      answer: '排查步骤：\n1. 检查提示词是否符合要求\n2. 确认账户余额充足\n3. 尝试重新生成\n4. 查看错误提示信息\n5. 联系客服'
    },
    {
      key: '2',
      question: '上传文件失败？',
      answer: '可能原因：\n• 文件大小超过限制（500MB）\n• 文件格式不支持\n• 网络连接不稳定\n• 服务器繁忙\n建议：检查文件、重试或联系客服'
    },
    {
      key: '3',
      question: '页面加载缓慢？',
      answer: '优化建议：\n1. 检查网络连接\n2. 清除浏览器缓存\n3. 关闭其他占用带宽的应用\n4. 尝试刷新页面\n5. 使用 Chrome 或 Edge 浏览器'
    },
    {
      key: '4',
      question: '无法登录？',
      answer: '解决方法：\n1. 确认账号密码正确\n2. 检查是否开启两步验证\n3. 清除浏览器缓存和 Cookie\n4. 尝试找回密码\n5. 联系客服'
    }
  ]
};

const quickLinks = [
  {
    icon: <RocketOutlined />,
    title: '新手教程',
    desc: '5分钟快速上手',
    href: '#'
  },
  {
    icon: <FileTextOutlined />,
    title: '使用文档',
    desc: '完整功能说明',
    href: '#'
  },
  {
    icon: <CustomerServiceOutlined />,
    title: '联系客服',
    desc: '在线咨询支持',
    href: '#'
  },
  {
    icon: <QuestionCircleOutlined />,
    title: '反馈建议',
    desc: '提交问题或建议',
    href: '/feedback'
  }
];

// ==========================================
// 逻辑组件
// ==========================================

const HelpContent = () => {
  const { token } = theme.useToken();
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const currentFAQs = faqData[activeCategory] || [];

  // 搜索过滤
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentFAQs;
    }
    const query = searchQuery.toLowerCase();
    return currentFAQs.filter(item => 
      item.question.toLowerCase().includes(query) || 
      item.answer.toLowerCase().includes(query)
    );
  }, [currentFAQs, searchQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader $token={token}>
          <h1>
            <QuestionCircleOutlined />
            帮助中心
          </h1>
          <p>在这里找到您需要的答案，或联系我们的支持团队</p>
        </PageHeader>

        <MainLayout>
          {/* 侧边栏 */}
          <Sidebar $token={token}>
            <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: token.colorText }}>
              分类导航
            </div>
            {categories.map((category) => (
              <CategoryItem
                key={category.key}
                $token={token}
                $active={activeCategory === category.key}
                onClick={() => {
                  setActiveCategory(category.key);
                  setSearchQuery('');
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="icon">{category.icon}</span>
                <span className="label">{category.label}</span>
                <span className="count">{category.count}</span>
              </CategoryItem>
            ))}
          </Sidebar>

          {/* 内容区域 */}
          <ContentArea $token={token}>
            <SearchBox>
              <Search
                placeholder="搜索问题或关键词..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
              />
            </SearchBox>

            <SectionTitle $token={token}>
              {categories.find(c => c.key === activeCategory)?.icon}
              {categories.find(c => c.key === activeCategory)?.label}
            </SectionTitle>
            <SectionDesc $token={token}>
              以下是关于"{categories.find(c => c.key === activeCategory)?.label}"的常见问题
            </SectionDesc>

            {filteredFAQs.length > 0 ? (
              <FAQCollapse $token={token} defaultActiveKey={['1']}>
                {filteredFAQs.map((faq) => (
                  <Panel
                    key={faq.key}
                    header={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircleOutlined style={{ color: token.colorPrimary, fontSize: 14 }} />
                        {faq.question}
                      </span>
                    }
                  >
                    <div style={{ whiteSpace: 'pre-line' }}>{faq.answer}</div>
                  </Panel>
                ))}
              </FAQCollapse>
            ) : (
              <Empty
                description={
                  <span style={{ color: token.colorTextSecondary }}>
                    没有找到相关问题，试试其他关键词或联系客服
                  </span>
                }
                style={{ margin: '40px 0' }}
              />
            )}

            <QuickLinks>
              {quickLinks.map((link, index) => (
                <QuickLinkCard
                  key={index}
                  $token={token}
                  onClick={() => link.href && (window.location.href = link.href)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="icon">{link.icon}</div>
                  <div className="title">{link.title}</div>
                  <div className="desc">{link.desc}</div>
                </QuickLinkCard>
              ))}
            </QuickLinks>

            <ContactCard $token={token}>
              <div className="title">
                <CustomerServiceOutlined />
                需要更多帮助？
              </div>
              <div className="contact-item">
                <span className="icon"><FileTextOutlined /></span>
                <span>查看完整文档</span>
              </div>
              <div className="contact-item">
                <span className="icon"><CustomerServiceOutlined /></span>
                <span>在线客服：工作日 9:00-18:00</span>
              </div>
              <div className="contact-item">
                <span className="icon"><QuestionCircleOutlined /></span>
                <span>邮箱：support@productx.com</span>
              </div>
            </ContactCard>
          </ContentArea>
        </MainLayout>
      </ContentContainer>
      <FooterSection />
    </PageLayout>
  );
};

// ==========================================
// 根组件
// ==========================================

const HelpPage = () => {
  const customTheme = {
    token: {
      borderRadius: 12,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Collapse: {
        borderRadiusLG: 12,
      },
      Input: {
        borderRadius: 12,
      },
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <HelpContent />
    </ConfigProvider>
  );
};

export default HelpPage;

