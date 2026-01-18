import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { FileImageOutlined } from '@ant-design/icons';
import { Section, ContentWrapper, SectionTitle, SectionSubtitle } from '../styles';
import BatchImageCompress from '../../../pages/Workspace/MediaTools/components/ImageCompress/BatchImageCompress';

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

const MediaToolsSection = () => {
  const theme = useContext(ThemeContext);
  const intl = useIntl();

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
              defaultMessage: '在线使用，无需安装，轻松处理您的图片和视频文件' 
            })}
          </SectionSubtitle>

          <ToolsContainer theme={theme}>
            <ToolsHeader>
              <FileImageOutlined className="icon" />
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 600, 
                marginBottom: '8px',
                color: theme.mode === 'dark' ? '#fff' : '#1d1d1f'
              }}>
                {intl.formatMessage({ 
                  id: 'home.mediaTools.imageCompress.title', 
                  defaultMessage: '图片压缩工具' 
                })}
              </h3>
              <p style={{ 
                fontSize: '16px',
                color: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
              }}>
                {intl.formatMessage({ 
                  id: 'home.mediaTools.imageCompress.description', 
                  defaultMessage: '智能压缩图片大小，保持画质清晰，支持批量处理' 
                })}
              </p>
            </ToolsHeader>
            
            <BatchImageCompress />
          </ToolsContainer>
        </motion.div>
      </ContentWrapper>
    </Section>
  );
};

export default MediaToolsSection;

