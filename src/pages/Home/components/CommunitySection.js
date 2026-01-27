import React, { useContext, useRef } from 'react';
import styled, { ThemeContext, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useIntl } from 'react-intl';
import { 
  PictureOutlined, 
  VideoCameraOutlined, 
  CustomerServiceOutlined,
  BoxPlotOutlined,
  SoundOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  FireOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';

// ==========================================
// 动画定义
// ==========================================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// ==========================================
// 样式组件
// ==========================================

const StyledSection = styled(Section)`
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)' 
    : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)'};
  position: relative;
  overflow: hidden;
  padding: 100px 24px;

  /* 背景装饰 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: radial-gradient(circle at 50% 0%, 
      ${props => props.theme.mode === 'dark' 
        ? 'rgba(147, 51, 234, 0.1)' 
        : 'rgba(147, 51, 234, 0.05)'}, 
      transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;
  z-index: 1;
  margin-top: 60px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CommunityCard = styled(motion.div)`
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 30, 35, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'};
  backdrop-filter: blur(20px);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 380px;
  display: flex;
  flex-direction: column;

  /* 渐变边框效果 */
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: linear-gradient(135deg, ${props => props.$color}66, ${props => props.$color}33, transparent);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${props => props.$color};
    box-shadow: 0 20px 60px -10px ${props => props.$color}44;

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    min-height: 340px;
    border-radius: 20px;
  }
`;

const CardHeader = styled.div`
  position: relative;
  height: 180px;
  background: linear-gradient(135deg, ${props => props.$color}22, ${props => props.$color}11);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  /* 背景动画图案 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 50%, ${props => props.$color}11 1px, transparent 1px),
                      radial-gradient(circle at 80% 50%, ${props => props.$color}11 1px, transparent 1px);
    background-size: 40px 40px;
    animation: ${float} 6s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    height: 140px;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100px;
  height: 100px;
  border-radius: 24px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(20, 20, 25, 0.9)' 
    : 'rgba(255, 255, 255, 0.95)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: ${props => props.$color};
  box-shadow: 0 10px 40px -10px ${props => props.$color}44;
  transition: all 0.4s ease;

  ${CommunityCard}:hover & {
    transform: scale(1.1) rotateY(10deg);
    box-shadow: 0 20px 60px -10px ${props => props.$color}66;
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 40px;
    border-radius: 20px;
  }
`;

const CardContent = styled.div`
  padding: 32px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const CardDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.6)' 
    : 'rgba(0, 0, 0, 0.6)'};
  margin: 0 0 20px 0;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'};

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.5)' 
    : 'rgba(0, 0, 0, 0.5)'};

  .icon {
    font-size: 14px;
    color: ${props => props.$color};
  }

  .value {
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1a1a1a'};
  }

  @media (max-width: 768px) {
    font-size: 12px;

    .icon {
      font-size: 13px;
    }
  }
`;

const ExploreButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)'};
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$color};
  transition: all 0.3s ease;

  .arrow {
    transition: transform 0.3s ease;
  }

  ${CommunityCard}:hover & {
    background: ${props => props.$color}22;

    .arrow {
      transform: translateX(4px);
    }
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 13px;
    border-radius: 10px;
  }
`;

const HotBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);

  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    font-size: 11px;
  }
`;

// ==========================================
// 主组件
// ==========================================

const CommunitySection = () => {
  const theme = useContext(ThemeContext);
  const intl = useIntl();

  const communities = [
    {
      id: 'image',
      icon: PictureOutlined,
      color: '#8b5cf6',
      hot: true,
      stats: {
        works: '120万+',
        creators: '58万+',
        views: '3.2亿+'
      }
    },
    {
      id: 'video',
      icon: VideoCameraOutlined,
      color: '#ec4899',
      hot: true,
      stats: {
        works: '85万+',
        creators: '42万+',
        views: '2.1亿+'
      }
    },
    {
      id: 'music',
      icon: CustomerServiceOutlined,
      color: '#f59e0b',
      hot: false,
      stats: {
        works: '62万+',
        creators: '31万+',
        views: '1.5亿+'
      }
    },
    {
      id: '3d',
      icon: BoxPlotOutlined,
      color: '#10b981',
      hot: false,
      stats: {
        works: '45万+',
        creators: '23万+',
        views: '9800万+'
      }
    },
    {
      id: 'voice',
      icon: SoundOutlined,
      color: '#3b82f6',
      hot: false,
      stats: {
        works: '38万+',
        creators: '19万+',
        views: '7200万+'
      }
    },
    {
      id: 'text',
      icon: FileTextOutlined,
      color: '#ef4444',
      hot: true,
      stats: {
        works: '95万+',
        creators: '51万+',
        views: '2.8亿+'
      }
    }
  ];

  const handleCommunityClick = (communityId) => {
    // 这里可以添加跳转逻辑
    console.log('Navigate to community:', communityId);
  };

  return (
    <StyledSection theme={theme}>
      <ContentWrapper>
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center' }}
        >
          <SectionTitle theme={theme}>
            {intl.formatMessage({ 
              id: 'home.community.title', 
              defaultMessage: '探索AI创作社区' 
            })}
          </SectionTitle>
          <SectionSubtitle theme={theme}>
            {intl.formatMessage({ 
              id: 'home.community.subtitle', 
              defaultMessage: '加入数百万创作者，分享你的AI杰作，获取灵感与反馈' 
            })}
          </SectionSubtitle>
        </motion.div>

        {/* 社区卡片网格 */}
        <Grid>
          {communities.map((community, index) => {
            const Icon = community.icon;
            return (
              <CommunityCard
                key={community.id}
                theme={theme}
                $color={community.color}
                onClick={() => handleCommunityClick(community.id)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                {community.hot && (
                  <HotBadge>
                    <FireOutlined />
                    {intl.formatMessage({ 
                      id: 'home.community.hot', 
                      defaultMessage: '热门' 
                    })}
                  </HotBadge>
                )}

                <CardHeader $color={community.color}>
                  <IconWrapper theme={theme} $color={community.color}>
                    <Icon />
                  </IconWrapper>
                </CardHeader>

                <CardContent>
                  <CardTitle theme={theme}>
                    {intl.formatMessage({ 
                      id: `home.community.${community.id}.title`, 
                      defaultMessage: `${community.id}社区` 
                    })}
                  </CardTitle>

                  <CardDescription theme={theme}>
                    {intl.formatMessage({ 
                      id: `home.community.${community.id}.description`, 
                      defaultMessage: '探索和分享精彩作品' 
                    })}
                  </CardDescription>

                  <StatsRow theme={theme}>
                    <StatItem theme={theme} $color={community.color}>
                      <FileTextOutlined className="icon" />
                      <span className="value">{community.stats.works}</span>
                      {intl.formatMessage({ 
                        id: 'home.community.stats.works', 
                        defaultMessage: '作品' 
                      })}
                    </StatItem>
                    <StatItem theme={theme} $color={community.color}>
                      <UserOutlined className="icon" />
                      <span className="value">{community.stats.creators}</span>
                      {intl.formatMessage({ 
                        id: 'home.community.stats.creators', 
                        defaultMessage: '创作者' 
                      })}
                    </StatItem>
                  </StatsRow>

                  <ExploreButton theme={theme} $color={community.color}>
                    <span>
                      {intl.formatMessage({ 
                        id: 'home.community.explore', 
                        defaultMessage: '探索社区' 
                      })}
                    </span>
                    <ArrowRightOutlined className="arrow" />
                  </ExploreButton>
                </CardContent>
              </CommunityCard>
            );
          })}
        </Grid>
      </ContentWrapper>
    </StyledSection>
  );
};

export default CommunitySection;
