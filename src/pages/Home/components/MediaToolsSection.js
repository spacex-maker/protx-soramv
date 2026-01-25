import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useIntl } from 'react-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImageOutlined, VideoCameraOutlined, AudioOutlined } from '@ant-design/icons';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';
import BatchImageCompress from '../../../pages/Workspace/MediaTools/components/ImageCompress/BatchImageCompress';
import BatchVideoCompress from '../../../pages/Workspace/MediaTools/components/VideoCompress/BatchVideoCompress';
import BatchAudioCompress from '../../../pages/Workspace/MediaTools/components/AudioCompress/BatchAudioCompress';

const ToolsContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 30, 32, 0.6)' 
    : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 24px;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 20px 40px -10px rgba(0, 0, 0, 0.3)' 
    : '0 20px 40px -10px rgba(0, 0, 0, 0.05)'};

  /* 确保 BatchImageCompress 组件在主页上正确显示 */
  .workspace-container {
    height: auto !important;
    min-height: 600px;
    max-height: 900px;
  }

  @media (max-width: 768px) {
    padding: 24px 16px;
    border-radius: 16px;
  }
`;

const ToolsHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;

  .icon {
    font-size: 48px;
    color: #8338ec;
    margin-bottom: 16px;
    display: inline-block;
  }

  @media (max-width: 768px) {
    margin-bottom: 32px;
    
    .icon {
      font-size: 36px;
    }
  }
`;

const TabsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 32px;
  }
`;

const TabButton = styled(motion.button)`
  padding: 16px 32px;
  border: 2px solid ${props => props.active 
    ? props.color 
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  background: ${props => props.active 
    ? (props.theme.mode === 'dark' 
      ? `linear-gradient(135deg, ${props.color}22, ${props.color}11)` 
      : `linear-gradient(135deg, ${props.color}11, ${props.color}08)`)
    : (props.theme.mode === 'dark' ? 'rgba(30, 30, 32, 0.5)' : 'rgba(255, 255, 255, 0.5)')};
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.active 
    ? props.color 
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)')};
  box-shadow: ${props => props.active 
    ? `0 8px 24px -8px ${props.color}44` 
    : 'none'};
  position: relative;
  overflow: hidden;

  .icon {
    font-size: 24px;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.color};
    box-shadow: 0 12px 28px -8px ${props => props.color}33;

    .icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 14px;
    gap: 8px;

    .icon {
      font-size: 20px;
    }
  }
`;

const ContentArea = styled(motion.div)`
  position: relative;
  width: 100%;
`;

const ToolInfo = styled(motion.div)`
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.05)'};

  h3 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.color};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    .icon {
      font-size: 28px;
    }
  }

  p {
    font-size: 15px;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.65)' 
      : 'rgba(0, 0, 0, 0.65)'};
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 20px 16px;
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      gap: 8px;

      .icon {
        font-size: 24px;
      }
    }

    p {
      font-size: 14px;
    }
  }
`;

const MediaToolsSection = () => {
  const theme = useContext(ThemeContext);
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState('image');

  const tools = [
    {
      id: 'image',
      icon: FileImageOutlined,
      color: '#8338ec',
      title: intl.formatMessage({ 
        id: 'home.mediaTools.imageCompress.title', 
        defaultMessage: '图片压缩' 
      }),
      description: intl.formatMessage({ 
        id: 'home.mediaTools.imageCompress.description', 
        defaultMessage: '智能压缩图片大小，保持画质清晰，支持批量处理' 
      }),
      component: BatchImageCompress
    },
    {
      id: 'video',
      icon: VideoCameraOutlined,
      color: '#ff006e',
      title: intl.formatMessage({ 
        id: 'home.mediaTools.videoCompress.title', 
        defaultMessage: '视频压缩' 
      }),
      description: intl.formatMessage({ 
        id: 'home.mediaTools.videoCompress.description', 
        defaultMessage: '高效压缩视频文件，自定义分辨率和码率，支持多种格式' 
      }),
      component: BatchVideoCompress
    },
    {
      id: 'audio',
      icon: AudioOutlined,
      color: '#3a86ff',
      title: intl.formatMessage({ 
        id: 'home.mediaTools.audioCompress.title', 
        defaultMessage: '音频压缩' 
      }),
      description: intl.formatMessage({ 
        id: 'home.mediaTools.audioCompress.description', 
        defaultMessage: '优化音频文件大小，保持音质清晰，支持MP3、AAC等格式' 
      }),
      component: BatchAudioCompress
    }
  ];

  const activeTool = tools.find(tool => tool.id === activeTab);
  const ActiveComponent = activeTool?.component;

  return (
    <Section>
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle theme={theme}>
            {intl.formatMessage({ 
              id: 'home.mediaTools.title', 
              defaultMessage: '实用媒体工具' 
            })}
          </SectionTitle>
          <SectionSubtitle theme={theme}>
            {intl.formatMessage({ 
              id: 'home.mediaTools.subtitle', 
              defaultMessage: '在线使用，无需安装，轻松处理您的图片、视频和音频文件' 
            })}
          </SectionSubtitle>

          {/* 标签切换 */}
          <TabsWrapper>
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <TabButton
                  key={tool.id}
                  theme={theme}
                  color={tool.color}
                  active={activeTab === tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Icon className="icon" />
                  <span>{tool.title}</span>
                </TabButton>
              );
            })}
          </TabsWrapper>

          {/* 工具容器 */}
          <ToolsContainer theme={theme}>
            <AnimatePresence mode="wait">
              {activeTool && (
                <ContentArea
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ToolInfo theme={theme} color={activeTool.color}>
                    <h3>
                      <activeTool.icon className="icon" />
                      {activeTool.title}工具
                    </h3>
                    <p>{activeTool.description}</p>
                  </ToolInfo>
                  
                  {ActiveComponent && <ActiveComponent />}
                </ContentArea>
              )}
            </AnimatePresence>
          </ToolsContainer>
        </motion.div>
      </ContentWrapper>
    </Section>
  );
};

export default MediaToolsSection;

