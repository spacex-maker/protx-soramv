import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Space } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { 
  FileImageOutlined,
  VideoCameraOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import ImageCompress from './components/ImageCompress';
import VideoTools from './components/VideoTools';
import AudioTools from './components/AudioTools';
import {
  AudioToolMode,
  LEGACY_AUDIO_TAB_TO_MODE,
  resolveAudioToolMode,
} from './components/AudioTools/types';
import {
  VideoToolMode,
  LEGACY_VIDEO_TAB_TO_MODE,
  resolveVideoToolMode,
} from './components/VideoTools/types';
import { logMediaToolUsage } from './utils/mediaToolUsageLog';

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

const MEDIA_TOOL_TAB_KEYS = [
  'imageCompress',
  'audioTools',
  'videoTools',
] as const;

type MediaToolTabKey = typeof MEDIA_TOOL_TAB_KEYS[number];

const resolveTabKey = (value: string | null): MediaToolTabKey => {
  if (value === 'audioCompress' || value === 'audioConvert') {
    return 'audioTools';
  }
  if (value === 'videoCompress' || value === 'videoConvert') {
    return 'videoTools';
  }
  if (value && MEDIA_TOOL_TAB_KEYS.includes(value as MediaToolTabKey)) {
    return value as MediaToolTabKey;
  }
  return 'imageCompress';
};

const AUDIO_TOOL_CODE_MAP: Record<AudioToolMode, 'audio_compress' | 'audio_convert' | 'audio_clip'> = {
  compress: 'audio_compress',
  convert: 'audio_convert',
  clip: 'audio_clip',
};

const VIDEO_TOOL_CODE_MAP: Record<VideoToolMode, 'video_compress' | 'video_convert' | 'video_clip'> = {
  compress: 'video_compress',
  convert: 'video_convert',
  clip: 'video_clip',
};

const MediaTools: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<MediaToolTabKey>(() => resolveTabKey(searchParams.get('tab')));
  const [audioToolMode, setAudioToolMode] = useState<AudioToolMode>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && LEGACY_AUDIO_TAB_TO_MODE[tabParam]) {
      return LEGACY_AUDIO_TAB_TO_MODE[tabParam];
    }
    return resolveAudioToolMode(searchParams.get('mode'));
  });
  const [videoToolMode, setVideoToolMode] = useState<VideoToolMode>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && LEGACY_VIDEO_TAB_TO_MODE[tabParam]) {
      return LEGACY_VIDEO_TAB_TO_MODE[tabParam];
    }
    return resolveVideoToolMode(searchParams.get('mode'));
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');

    if (tabParam && LEGACY_AUDIO_TAB_TO_MODE[tabParam]) {
      const mode = LEGACY_AUDIO_TAB_TO_MODE[tabParam];
      setActiveTab('audioTools');
      setAudioToolMode(mode);
      setSearchParams({ tab: 'audioTools', mode }, { replace: true });
      return;
    }

    if (tabParam && LEGACY_VIDEO_TAB_TO_MODE[tabParam]) {
      const mode = LEGACY_VIDEO_TAB_TO_MODE[tabParam];
      setActiveTab('videoTools');
      setVideoToolMode(mode);
      setSearchParams({ tab: 'videoTools', mode }, { replace: true });
      return;
    }

    const tabFromUrl = resolveTabKey(tabParam);
    setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));

    if (tabFromUrl === 'audioTools') {
      const modeFromUrl = resolveAudioToolMode(searchParams.get('mode'));
      setAudioToolMode((prev) => (prev === modeFromUrl ? prev : modeFromUrl));

      if (!searchParams.get('mode')) {
        setSearchParams({ tab: 'audioTools', mode: modeFromUrl }, { replace: true });
      }
    }

    if (tabFromUrl === 'videoTools') {
      const modeFromUrl = resolveVideoToolMode(searchParams.get('mode'));
      setVideoToolMode((prev) => (prev === modeFromUrl ? prev : modeFromUrl));

      if (!searchParams.get('mode')) {
        setSearchParams({ tab: 'videoTools', mode: modeFromUrl }, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  const handleAudioToolModeChange = (mode: AudioToolMode) => {
    setAudioToolMode(mode);
    setSearchParams({ tab: 'audioTools', mode }, { replace: true });
  };

  const handleVideoToolModeChange = (mode: VideoToolMode) => {
    setVideoToolMode(mode);
    setSearchParams({ tab: 'videoTools', mode }, { replace: true });
  };

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
      key: 'audioTools',
      label: (
        <Space>
          <SoundOutlined />
          <FormattedMessage id="mediaTools.tab.audioTools" defaultMessage="音频工具" />
        </Space>
      ),
      children: (
        <AudioTools
          mode={audioToolMode}
          onModeChange={handleAudioToolModeChange}
        />
      ),
    },
    {
      key: 'videoTools',
      label: (
        <Space>
          <VideoCameraOutlined />
          <FormattedMessage id="mediaTools.tab.videoTools" defaultMessage="视频工具" />
        </Space>
      ),
      children: (
        <VideoTools
          mode={videoToolMode}
          onModeChange={handleVideoToolModeChange}
        />
      ),
    },
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
        onChange={(key) => {
          const nextTab = resolveTabKey(key);
          setActiveTab(nextTab);

          if (nextTab === 'audioTools') {
            setSearchParams({ tab: 'audioTools', mode: audioToolMode }, { replace: true });
            logMediaToolUsage({ toolCode: AUDIO_TOOL_CODE_MAP[audioToolMode], action: 'tab_view' });
            return;
          }

          if (nextTab === 'videoTools') {
            setSearchParams({ tab: 'videoTools', mode: videoToolMode }, { replace: true });
            logMediaToolUsage({ toolCode: VIDEO_TOOL_CODE_MAP[videoToolMode], action: 'tab_view' });
            return;
          }

          setSearchParams({ tab: nextTab }, { replace: true });
          if (nextTab === 'imageCompress') {
            logMediaToolUsage({ toolCode: 'image_compress', action: 'tab_view' });
          }
        }}
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
