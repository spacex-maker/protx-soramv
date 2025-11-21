import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Spin, Button, Result } from 'antd';
import { ReloadOutlined, WifiOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
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
      label: <FormattedMessage id="create.tab.textToImage" defaultMessage="文生图" />,
      children: <TextToImage />
    },
    {
      key: 'textToVideo',
      label: <FormattedMessage id="create.tab.textToVideo" defaultMessage="文生视频" />,
      children: <TextToVideo />
    },
    {
      key: 'imageToImage',
      label: <FormattedMessage id="create.tab.imageToImage" defaultMessage="图生图" />,
      children: <ImageToImage />
    },
    {
      key: 'imageToVideo',
      label: <FormattedMessage id="create.tab.imageToVideo" defaultMessage="图生视频" />,
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
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        tabBarStyle={{
          marginBottom: '20px',
          background: 'transparent'
        }}
      />
    </Content>
  );
};

export default Create;

