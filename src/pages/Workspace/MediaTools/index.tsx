import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Space } from 'antd';
import { 
  FileImageOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  FileOutlined
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import ImageCompress from './components/ImageCompress';
import VideoCompress from './components/VideoCompress';
import AudioCompress from './components/AudioCompress';
import VideoConvert from './components/VideoConvert';

const { Content } = Layout;

// 样式化的 Tabs 组件
const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    
    &::before {
      border-bottom: 2px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};
    }
    
    @media (max-width: 768px) {
      margin-bottom: 0;
      padding: 0 8px;
    }
  }

  .ant-tabs-tab {
    padding: 12px 24px;
    margin: 0 4px;
    border-radius: 12px 12px 0 0;
    transition: all 0.3s ease;
    border: none;
    
    @media (max-width: 768px) {
      padding: 10px 12px;
      margin: 0 2px;
      border-radius: 8px 8px 0 0;
    }
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
    }

    .ant-tabs-tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 15px;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'};
      transition: all 0.3s ease;
      
      @media (max-width: 768px) {
        font-size: 13px;
        gap: 6px;
      }
    }

    .anticon {
      font-size: 18px;
      transition: all 0.3s ease;
      
      @media (max-width: 768px) {
        font-size: 16px;
      }
    }

    &.ant-tabs-tab-active {
      background: ${props => props.theme.mode === 'dark' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.08)'};
      
      .ant-tabs-tab-btn {
        color: #1890ff;
        font-weight: 600;
      }

      .anticon {
        color: #1890ff;
        transform: scale(1.1);
      }
    }
  }

  .ant-tabs-ink-bar {
    background: linear-gradient(90deg, #1890ff, #40a9ff);
    height: 3px;
    border-radius: 2px;
  }

  .ant-tabs-content-holder {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .ant-tabs-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .ant-tabs-tabpane {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const MediaTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('imageCompress');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 所有可用的工具 tab 定义
  const tabItems = [
    {
      key: 'imageCompress',
      label: (
        <Space>
          <FileImageOutlined />
          <FormattedMessage id="mediaTools.tab.imageCompress" defaultMessage="图片压缩" />
        </Space>
      ),
      children: <ImageCompress />
    },
    {
      key: 'videoCompress',
      label: (
        <Space>
          <VideoCameraOutlined />
          <FormattedMessage id="mediaTools.tab.videoCompress" defaultMessage="视频压缩" />
        </Space>
      ),
      children: <VideoCompress />
    },
    {
      key: 'audioCompress',
      label: (
        <Space>
          <SoundOutlined />
          <FormattedMessage id="mediaTools.tab.audioCompress" defaultMessage="音频压缩" />
        </Space>
      ),
      children: <AudioCompress />
    },
    {
      key: 'videoConvert',
      label: (
        <Space>
          <FileOutlined />
          <FormattedMessage id="mediaTools.tab.videoConvert" defaultMessage="视频转换" />
        </Space>
      ),
      children: <VideoConvert />
    }
  ];

  return (
    <Content style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: isMobile ? '12px' : '20px',
      background: 'transparent'
    }}>
      <StyledTabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        destroyOnHidden={true}
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      />
    </Content>
  );
};

export default MediaTools;
