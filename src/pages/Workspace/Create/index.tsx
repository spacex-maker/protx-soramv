import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Spin, Button, Result, Space } from 'antd';
import { 
  ReloadOutlined, 
  WifiOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  SwapOutlined,
  FileImageOutlined,
  ApartmentOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { base } from '../../../api/base';
import TextToImage from './components/TextToImage';
import TextToVideo from './components/TextToVideo';
import ImageToImage from './components/ImageToImage';
import ImageToVideo from './components/ImageToVideo';
import Workflow from './components/Workflow';

// 路由路径到 Tab key 的映射
const pathToTabKey: Record<string, string> = {
  '/workspace/create/text-to-image': 'textToImage',
  '/workspace/create/text-to-video': 'textToVideo',
  '/workspace/create/image-to-image': 'imageToImage',
  '/workspace/create/image-to-video': 'imageToVideo',
  '/workspace/create/workflow': 'workflow',
};

// Tab key 到路由路径的映射
const tabKeyToPath: Record<string, string> = {
  'textToImage': '/workspace/create/text-to-image',
  'textToVideo': '/workspace/create/text-to-video',
  'imageToImage': '/workspace/create/image-to-image',
  'imageToVideo': '/workspace/create/image-to-video',
  'workflow': '/workspace/create/workflow',
};

const { Content } = Layout;

const BetaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  height: 18px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.2), rgba(235, 47, 150, 0.2));
  color: #722ed1;
  margin-left: 4px;
`;

interface CreationTypeSetting {
  key: string;
  enabled: boolean;
}

// 样式化的 Tabs 组件（分段控制器风格 + 内容区）
const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 20px;
    padding: 4px;
    background: ${p => p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
    border-radius: 12px;
    width: fit-content;
    max-width: 100%;
  }
  @media (max-width: 768px) {
    .ant-tabs-nav {
      margin-bottom: 16px;
      padding: 3px;
      border-radius: 10px;
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
    }
  }

  .ant-tabs-nav::before {
    display: none;
  }

  .ant-tabs-nav-list {
    gap: 2px;
    @media (max-width: 768px) {
      gap: 0;
      flex-wrap: nowrap;
      min-width: min-content;
    }
  }

  .ant-tabs-tab {
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 10px;
    transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;

    @media (max-width: 768px) {
      border-radius: 8px;
      flex: 0 0 auto;
    }
  }

  .ant-tabs-tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-weight: 500;
    font-size: 14px;
    color: ${p => p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
    border-radius: 10px;
    transition: inherit;
    outline: none;

    @media (max-width: 768px) {
      padding: 8px 14px;
      font-size: 13px;
      gap: 6px;
      border-radius: 8px;
    }
  }

  .ant-tabs-tab .anticon {
    font-size: 16px;
    opacity: 0.9;
    flex-shrink: 0;
    @media (max-width: 768px) {
      font-size: 15px;
    }
  }

  .ant-tabs-tab:hover:not(.ant-tabs-tab-active) .ant-tabs-tab-btn {
    color: ${p => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)')};
    background: ${p => (p.theme?.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')};
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    font-weight: 600;
    /* 渐变层在上、pill 在下，text-clip 才能正确透出渐变 */
    background: ${p => (p.theme?.mode === 'dark'
      ? 'linear-gradient(90deg, #69b1ff, #b37feb, #ff85c0), rgba(255,255,255,0.12)'
      : 'linear-gradient(90deg, #1890ff, #722ed1, #eb2f96), #fff')};
    background-size: 200% auto, 100% 100%;
    -webkit-background-clip: text, padding-box;
    background-clip: text, padding-box;
    -webkit-text-fill-color: transparent;
    color: transparent;
    box-shadow: ${p => (p.theme?.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.06)')};
    animation: tab-gradient-shift 3s ease infinite;
  }

  @keyframes tab-gradient-shift {
    0%, 100% { background-position: 0% 50%, 0% 50%; }
    50% { background-position: 100% 50%, 0% 50%; }
  }

  .ant-tabs-ink-bar {
    display: none;
  }

  .ant-tabs-content-holder {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }
`;

const Create: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(new Set(['textToImage', 'textToVideo', 'imageToImage', 'imageToVideo', 'workflow']));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  
  // 根据当前路由获取 activeTab
  const activeTab = pathToTabKey[location.pathname] || 'textToImage';
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 切换 Tab 时更新路由
  const handleTabChange = (key: string) => {
    const path = tabKeyToPath[key];
    if (path) {
      navigate(path);
    }
  };

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
        
        // 如果当前选中的 tab 被禁用，则导航到第一个启用的 tab
        const currentTab = pathToTabKey[location.pathname] || 'textToImage';
        if (enabled.size > 0 && !enabled.has(currentTab)) {
          const firstEnabled = settings.find(s => s.enabled);
          if (firstEnabled && tabKeyToPath[firstEnabled.key]) {
            navigate(tabKeyToPath[firstEnabled.key], { replace: true });
          }
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
  }, []);

  // Tab 内容用 useMemo 固定引用，避免切换时被当作新组件而重新挂载
  const tabContentMap = React.useMemo(() => ({
    textToImage: <TextToImage />,
    textToVideo: <TextToVideo />,
    imageToImage: <ImageToImage />,
    imageToVideo: <ImageToVideo />,
    workflow: <Workflow />,
  }), []);

  const loadingPlaceholder = React.useMemo(() => (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
      <Spin size="large" />
    </div>
  ), []);

  // 所有可用的 tab 定义（label 每次渲染可新，children 用稳定引用）
  const allTabItems = [
    {
      key: 'textToImage',
      label: (
        <Space>
          <PictureOutlined />
          <FormattedMessage id="create.tab.textToImage" defaultMessage="文生图" />
        </Space>
      ),
      children: loading ? loadingPlaceholder : tabContentMap.textToImage,
    },
    {
      key: 'textToVideo',
      label: (
        <Space>
          <VideoCameraOutlined />
          <FormattedMessage id="create.tab.textToVideo" defaultMessage="文生视频" />
        </Space>
      ),
      children: loading ? loadingPlaceholder : tabContentMap.textToVideo,
    },
    {
      key: 'imageToImage',
      label: (
        <Space>
          <SwapOutlined />
          <FormattedMessage id="create.tab.imageToImage" defaultMessage="图生图" />
        </Space>
      ),
      children: loading ? loadingPlaceholder : tabContentMap.imageToImage,
    },
    {
      key: 'imageToVideo',
      label: (
        <Space>
          <FileImageOutlined />
          <FormattedMessage id="create.tab.imageToVideo" defaultMessage="图生视频" />
        </Space>
      ),
      children: loading ? loadingPlaceholder : tabContentMap.imageToVideo,
    },
    {
      key: 'workflow',
      label: (
        <Space>
          <ApartmentOutlined />
          <FormattedMessage id="create.tab.workflow" defaultMessage="工作流" />
          <BetaBadge>
            <FormattedMessage id="create.tab.workflow.badge" defaultMessage="Beta" />
          </BetaBadge>
        </Space>
      ),
      children: loading ? loadingPlaceholder : tabContentMap.workflow,
    },
  ];

  // 根据设置过滤显示的 tab
  const tabItems = allTabItems.filter(item => enabledTypes.has(item.key));

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
      padding: isMobile ? '12px' : '20px',
      background: 'transparent'
    }}>
      <StyledTabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        destroyInactiveTabPane={false}
        tabBarExtraContent={
          <Button
            type="link"
            icon={<QuestionCircleOutlined />}
            onClick={() => navigate('/feedback')}
            style={{ marginLeft: 8 }}
          >
            <FormattedMessage id="create.feedback" defaultMessage="问题反馈" />
          </Button>
        }
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

