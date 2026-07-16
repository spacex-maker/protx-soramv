import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import { theme as antTheme, Button, Tag } from 'antd';
import {
  ApiOutlined,
  AuditOutlined,
  BankOutlined,
  ClusterOutlined,
  GlobalOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ScissorOutlined,
  ShopOutlined,
  SoundOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import SimpleHeader from 'components/headers/simple';
import FooterSection from 'pages/Home/components/FooterSection';
import SEO, { SEOConfigs } from 'components/SEO';

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(180deg, #050508 0%, #0b1220 40%, #050508 100%)'
      : 'linear-gradient(180deg, #eef2f7 0%, #f7f9fc 45%, #eef2f7 100%)'};
  padding-top: 72px;
  overflow-x: hidden;
`;

const Shell = styled(motion.div as any)`
  max-width: 1100px;
  width: 92%;
  margin: 32px auto 64px;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: 40px;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${(p) => (p.theme.mode === 'dark' ? '#93c5fd' : '#1d4ed8')};
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(59,130,246,0.16)' : 'rgba(59,130,246,0.1)'};
  border: 1px solid rgba(59, 130, 246, 0.28);
`;

const Title = styled.h1`
  margin: 0 0 14px;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  line-height: 1.25;
  color: ${(p) => (p.theme.mode === 'dark' ? '#f8fafc' : '#0f172a')};
`;

const Lead = styled.p`
  margin: 0 auto;
  max-width: 780px;
  font-size: 16px;
  line-height: 1.75;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : '#475569')};
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
`;

const Section = styled.section`
  margin-bottom: 28px;
  padding: 28px 28px 24px;
  border-radius: 20px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.88)'};
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)')};
  box-shadow: ${(p) =>
    p.theme.mode === 'dark' ? 'none' : '0 12px 32px -20px rgba(15, 23, 42, 0.18)'};

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  .icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    font-size: 16px;
  }

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 750;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f1f5f9' : '#0f172a')};
  }
`;

const Body = styled.div`
  font-size: 14px;
  line-height: 1.8;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.68)' : '#334155')};

  p {
    margin: 0 0 12px;
  }

  ul {
    margin: 0;
    padding-left: 1.15em;
  }

  li {
    margin-bottom: 6px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div<{ $accent?: string }>`
  padding: 16px;
  border-radius: 14px;
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)')};
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(248,250,252,0.9)'};
  border-top: 3px solid ${(p) => p.$accent || '#3b82f6'};

  .card-icon {
    font-size: 18px;
    color: ${(p) => p.$accent || '#3b82f6'};
    margin-bottom: 8px;
  }

  h3 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 700;
    color: ${(p) => (p.theme.mode === 'dark' ? '#f8fafc' : '#0f172a')};
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : '#64748b')};
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QuoteBox = styled.div`
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)'};
  border-left: 3px solid #3b82f6;
  font-size: 13px;
  line-height: 1.7;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.75)' : '#1e293b')};
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
`;

const Note = styled.p`
  margin: 18px 0 0;
  text-align: center;
  font-size: 12px;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#94a3b8')};
`;

const ProjectIntroPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { token } = antTheme.useToken();

  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  const goCreate = () => {
    const loggedIn = !!localStorage.getItem('token');
    navigate(loggedIn ? '/workspace/create/image-generation' : '/signup');
  };

  const modules = [
    {
      accent: '#3b82f6',
      icon: <PictureOutlined />,
      title: t('projectIntro.module.image.title', '图像生成'),
      desc: t(
        'projectIntro.module.image.desc',
        '文生图、图生图与官方零提示词玩法，多模型切换，适合设计与营销素材生产。'
      ),
    },
    {
      accent: '#722ed1',
      icon: <VideoCameraOutlined />,
      title: t('projectIntro.module.video.title', '视频生成'),
      desc: t(
        'projectIntro.module.video.desc',
        '文生视频、图生视频，以及基于 Seedance 2 的多模态参考、定向编辑与无缝延长。'
      ),
    },
    {
      accent: '#13c2c2',
      icon: <ScissorOutlined />,
      title: t('projectIntro.module.edit.title', '视频剪辑'),
      desc: t(
        'projectIntro.module.edit.desc',
        '上传视频 / 图片 / 音频，用 @素材 精准引用，完成参考生成、局部修改与续写延长。'
      ),
    },
    {
      accent: '#eb2f96',
      icon: <TeamOutlined />,
      title: t('projectIntro.module.director.title', '导演系统'),
      desc: t(
        'projectIntro.module.director.desc',
        '集→场→镜工业化漫剧流程，AI 剧本与分镜 Agent、角色库与成片能力一体打通。'
      ),
    },
    {
      accent: '#fa8c16',
      icon: <SoundOutlined />,
      title: t('projectIntro.module.speech.title', '语音能力'),
      desc: t(
        'projectIntro.module.speech.desc',
        'AI 语音生成与声音复刻，支持情绪与音色控制，服务短视频旁白与有声内容。'
      ),
    },
    {
      accent: '#52c41a',
      icon: <ClusterOutlined />,
      title: t('projectIntro.module.workflow.title', '工作流与工具'),
      desc: t(
        'projectIntro.module.workflow.desc',
        '可视化多模型工作流，以及浏览器端图/视/音压缩转码剪辑工具箱。'
      ),
    },
    {
      accent: '#1677ff',
      icon: <ShopOutlined />,
      title: t('projectIntro.module.market.title', '社区与商城'),
      desc: t(
        'projectIntro.module.market.desc',
        '生成频道、每日挑战、提示词查看/买断交易，以及 AI 频道运营体自动供给。'
      ),
    },
    {
      accent: '#2f54eb',
      icon: <ApiOutlined />,
      title: t('projectIntro.module.api.title', '开发者能力'),
      desc: t(
        'projectIntro.module.api.desc',
        '向量 Embedding / API 入口，面向检索增强与机构集成的技术扩展面。'
      ),
    },
    {
      accent: '#08979c',
      icon: <GlobalOutlined />,
      title: t('projectIntro.module.global.title', '全球化产品'),
      desc: t(
        'projectIntro.module.global.desc',
        '11 种语言界面，Token + 多币种账户结构，便于国内服务与出海协同。'
      ),
    },
  ];

  return (
    <PageLayout>
      <SEO {...SEOConfigs.projectIntro} />
      <SimpleHeader />
      <Shell
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Hero>
          <Eyebrow>
            <BankOutlined />
            {t('projectIntro.eyebrow', '项目介绍 · 面向政府与合作方')}
          </Eyebrow>
          <Title>
            <FormattedMessage
              id="projectIntro.title"
              defaultMessage="AI2OBJ — 一站式多模态 AI 创作与创作者经济平台"
            />
          </Title>
          <Lead>
            <FormattedMessage
              id="projectIntro.lead"
              defaultMessage="AI2OBJ（AI To Object）由 ProTX 团队打造，覆盖图像、视频、语音生成与剪辑，并构建创作、社区、提示词交易与算力变现闭环。本页摘录项目核心能力与价值定位，便于政府主管部门、投资机构与合作伙伴快速了解。"
            />
          </Lead>
          <MetaRow>
            <Tag color="blue">{t('projectIntro.tag.brand', '品牌：AI2OBJ')}</Tag>
            <Tag color="geekblue">{t('projectIntro.tag.site', '官网：ai2obj.com')}</Tag>
            <Tag color="cyan">{t('projectIntro.tag.focus', '多模态创作操作系统')}</Tag>
          </MetaRow>
        </Hero>

        <Section>
          <SectionHead>
            <div className="icon">
              <ThunderboltOutlined />
            </div>
            <h2>{t('projectIntro.summary.title', '执行摘要')}</h2>
          </SectionHead>
          <Body>
            <p>
              {t(
                'projectIntro.summary.p1',
                '相较单一的文生图 / 文生视频工具，AI2OBJ 将多模型生产、工业化分镜、多模态剪辑、社区运营与提示词资产交易整合在同一平台，降低数字内容生产成本，服务短视频、漫剧、广告与机构培训等场景。'
              )}
            </p>
            <ul>
              <li>
                {t(
                  'projectIntro.summary.b1',
                  '导演系统：集→场→镜结构的 AI 漫剧 / 竖屏短剧生产链路'
                )}
              </li>
              <li>
                {t(
                  'projectIntro.summary.b2',
                  'Seedance 2 视频剪辑：多模态参考、定向编辑、无缝延长'
                )}
              </li>
              <li>
                {t(
                  'projectIntro.summary.b3',
                  '官方图生图玩法与提示词商城：降低门槛并沉淀可交易创作资产'
                )}
              </li>
              <li>
                {t(
                  'projectIntro.summary.b4',
                  'Token 计量 + 订阅 / VIP + 邀请裂变：可规模化的商业闭环'
                )}
              </li>
            </ul>
          </Body>
        </Section>

        <Section>
          <SectionHead>
            <div className="icon">
              <RocketOutlined />
            </div>
            <h2>{t('projectIntro.modules.title', '核心产品能力')}</h2>
          </SectionHead>
          <Grid>
            {modules.map((item) => (
              <Card key={item.title} $accent={item.accent}>
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section>
          <SectionHead>
            <div className="icon">
              <ShopOutlined />
            </div>
            <h2>{t('projectIntro.business.title', '商业模式概览')}</h2>
          </SectionHead>
          <Body>
            <p>
              {t(
                'projectIntro.business.p1',
                '平台以 Token 预付费消耗为基本计量，覆盖图像、视频、语音、Agent 等调用；并叠加套餐订阅营销、VIP 权益、提示词交易与开发者 API 等多元收入结构。'
              )}
            </p>
            <TwoCol>
              <QuoteBox>
                {t(
                  'projectIntro.business.gov',
                  '给政府：服务数字内容产业的人工智能应用基础设施，降低文化创作成本、助力就业创业，具备实名认证与平台治理基础。'
                )}
              </QuoteBox>
              <QuoteBox>
                {t(
                  'projectIntro.business.invest',
                  '给投资人：以 Token 计量的多模态创作平台为基本盘，导演系统与视频剪辑构成专业壁垒，提示词交易与社区运营构成第二增长曲线。'
                )}
              </QuoteBox>
            </TwoCol>
          </Body>
        </Section>

        <Section>
          <SectionHead>
            <div className="icon">
              <SafetyCertificateOutlined />
            </div>
            <h2>{t('projectIntro.compliance.title', '社会价值与合规底座')}</h2>
          </SectionHead>
          <Body>
            <TwoCol>
              <div>
                <p>
                  <strong>{t('projectIntro.compliance.social', '社会价值')}</strong>
                </p>
                <ul>
                  <li>
                    {t(
                      'projectIntro.compliance.s1',
                      '降低中小微文创主体优质内容生产成本'
                    )}
                  </li>
                  <li>
                    {t(
                      'projectIntro.compliance.s2',
                      '为高校与职业院校提供可实操的 AI 内容生产场景'
                    )}
                  </li>
                  <li>
                    {t(
                      'projectIntro.compliance.s3',
                      '促进作品传播与创作者技能升级、数字就业'
                    )}
                  </li>
                </ul>
              </div>
              <div>
                <p>
                  <strong>{t('projectIntro.compliance.base', '合规与治理')}</strong>
                </p>
                <ul>
                  <li>
                    {t(
                      'projectIntro.compliance.c1',
                      '实名认证（KYC）、用户协议与隐私政策完备'
                    )}
                  </li>
                  <li>
                    {t(
                      'projectIntro.compliance.c2',
                      '充值协议、反馈举报与通知中心等用户服务链路'
                    )}
                  </li>
                  <li>
                    {t(
                      'projectIntro.compliance.c3',
                      '模型与功能可配置开关，便于响应监管与内容安全策略'
                    )}
                  </li>
                </ul>
              </div>
            </TwoCol>
          </Body>
        </Section>

        <Section>
          <SectionHead>
            <div className="icon">
              <AuditOutlined />
            </div>
            <h2>{t('projectIntro.tech.title', '技术架构要点')}</h2>
          </SectionHead>
          <Body>
            <ul>
              <li>
                {t(
                  'projectIntro.tech.b1',
                  '前端：React 现代化应用，Ant Design 体验体系，多语言国际化'
                )}
              </li>
              <li>
                {t(
                  'projectIntro.tech.b2',
                  '媒体：云对象存储承载素材；浏览器端媒体处理能力补充生产链路'
                )}
              </li>
              <li>
                {t(
                  'projectIntro.tech.b3',
                  '后端：独立服务（ProductX）统一任务、计费、社区与模型网关，支持可插拔模型调度'
                )}
              </li>
            </ul>
          </Body>
        </Section>

        <Section style={{ textAlign: 'center' }}>
          <SectionHead style={{ justifyContent: 'center' }}>
            <div className="icon">
              <RocketOutlined />
            </div>
            <h2>{t('projectIntro.cta.title', '体验产品 / 进一步沟通')}</h2>
          </SectionHead>
          <Body style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 18px' }}>
            <p>
              {t(
                'projectIntro.cta.desc',
                '欢迎体验创作工作台，或通过意见反馈与我们联系合作、试点与投资沟通事宜。'
              )}
            </p>
          </Body>
          <CtaRow>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={goCreate}
              style={{
                height: 48,
                borderRadius: 24,
                paddingInline: 28,
                fontWeight: 700,
                background: token.colorPrimary,
              }}
            >
              {t('projectIntro.cta.start', '立即体验创作')}
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/about')}
              style={{ height: 48, borderRadius: 24, paddingInline: 24 }}
            >
              {t('projectIntro.cta.about', '关于我们')}
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/feedback')}
              style={{ height: 48, borderRadius: 24, paddingInline: 24 }}
            >
              {t('projectIntro.cta.feedback', '意见反馈')}
            </Button>
          </CtaRow>
          <Note>
            {t(
              'projectIntro.disclaimer',
              '本页为产品能力与定位介绍，不构成融资或业绩承诺。正式合作材料可另附数据与资质附录。'
            )}
          </Note>
        </Section>
      </Shell>
      <FooterSection />
    </PageLayout>
  );
};

export default ProjectIntroPage;
