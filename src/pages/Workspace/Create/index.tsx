import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Spin, Button, Result, Space } from 'antd';
import { 
  ReloadOutlined, 
  WifiOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  SwapOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { base } from '../../../api/base';
import TextToImage from './components/TextToImage';
import TextToVideo from './components/TextToVideo';
import ImageToImage from './components/ImageToImage';
import ImageToVideo from './components/ImageToVideo';

const { Content } = Layout;

interface CreationTypeSetting {
  key: string;
  enabled: boolean;
}

// 样式化的 Tabs 组件
const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    
    &::before {
      border-bottom: 2px solid ${props => props.theme.mode === 'dark' ? '#333' : '#f0f0f0'};
    }
  }

  .ant-tabs-tab {
    padding: 12px 24px;
    margin: 0 4px;
    border-radius: 12px 12px 0 0;
    transition: all 0.3s ease;
    border: none;
    
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
    }

    .anticon {
      font-size: 18px;
      transition: all 0.3s ease;
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
    overflow: auto;
  }
`;

const Create: React.FC = () => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<string>('textToImage');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(new Set(['textToImage', 'textToVideo', 'imageToImage', 'imageToVideo']));

  // 获取创作类型设置
  const fetchCreationTypeSettings = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await base.getCreationTypeSettings();
      
      if (response.success === true && response.data) {
        const settings = response.data as CreationTypeSetting[];
        const enabled = new Set(
          settings.filter(setting => setting.enabled).map(setting => setting.key)
        );
        setEnabledTypes(enabled);
        
        // 如果当前选中的 tab 被禁用，则选中第一个启用的 tab
        if (enabled.size > 0) {
          setActiveTab(prevTab => {
            if (!enabled.has(prevTab)) {
              const firstEnabled = settings.find(s => s.enabled);
              return firstEnabled ? firstEnabled.key : prevTab;
            }
            return prevTab;
          });
        }
      } else {
        // 如果返回的数据格式不正确，显示错误
        setLoadError(true);
      }
    } catch (error) {
      console.error('Failed to fetch creation type settings:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreationTypeSettings();
  }, [intl]);

  // 所有可用的 tab 定义
  const allTabItems = [
    {
      key: 'textToImage',
      label: (
        <Space>
          <PictureOutlined />
          <FormattedMessage id="create.tab.textToImage" defaultMessage="文生图" />
        </Space>
      ),
      children: <TextToImage />
    },
    {
      key: 'textToVideo',
      label: (
        <Space>
          <VideoCameraOutlined />
          <FormattedMessage id="create.tab.textToVideo" defaultMessage="文生视频" />
        </Space>
      ),
      children: <TextToVideo />
    },
    {
      key: 'imageToImage',
      label: (
        <Space>
          <SwapOutlined />
          <FormattedMessage id="create.tab.imageToImage" defaultMessage="图生图" />
        </Space>
      ),
      children: <ImageToImage />
    },
    {
      key: 'imageToVideo',
      label: (
        <Space>
          <FileImageOutlined />
          <FormattedMessage id="create.tab.imageToVideo" defaultMessage="图生视频" />
        </Space>
      ),
      children: <ImageToVideo />
    }
  ];

  // 根据设置过滤显示的 tab
  const tabItems = allTabItems.filter(item => enabledTypes.has(item.key));

  // 加载中状态
  if (loading) {
    return (
      <Content style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
        background: 'transparent'
      }}>
        <Spin size="large" />
      </Content>
    );
  }

  // 加载失败，显示网络错误提示
  if (loadError) {
    return (
      <Content style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
        background: 'transparent'
      }}>
        <Result
          icon={<WifiOutlined style={{ color: '#ff4d4f' }} />}
          title={
            <FormattedMessage 
              id="create.network.error.title" 
              defaultMessage="网络连接异常" 
            />
          }
          subTitle={
            <FormattedMessage 
              id="create.network.error.description" 
              defaultMessage="无法加载创作类型配置，请检查网络连接后刷新页面重试" 
            />
          }
          extra={
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => {
                fetchCreationTypeSettings();
              }}
            >
              <FormattedMessage 
                id="create.network.error.refresh" 
                defaultMessage="刷新页面" 
              />
            </Button>
          }
        />
      </Content>
    );
  }

  // 没有可用的 tab
  if (tabItems.length === 0) {
    return (
      <Content style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
        background: 'transparent'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FormattedMessage 
            id="create.noAvailableTabs" 
            defaultMessage="暂无可用的创作类型" 
          />
        </div>
      </Content>
    );
  }

  return (
    <Content style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: '20px',
      background: 'transparent'
    }}>
      <StyledTabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
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

export default Create;

