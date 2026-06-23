import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';
import SimpleHeader from "components/headers/simple";
import { message } from 'antd';
import { Helmet } from 'react-helmet';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useLocation } from 'react-router-dom';
import SideMenu from './components/SideMenu';
import AllFiles from './AllFiles';
import Starred from './Starred';
import Folders from './Folders';
import Trash from './Trash';
import StorageNodes from './StorageNodes';
import Create from './Create';
import MediaTools from './MediaTools';
import PromptMarket from './PromptMarket';
import Channels from './Channels';
import DailyChallenge from './DailyChallenge';
import Recharge from './Recharge';
import FileDecryptPage from '../FileDecrypt';
import Embedding from './Embedding';

const { Content, Sider } = Layout;

/** 内容区：与主题一致的背景，避免滚动到底部时出现分隔线 */
const ContentLayout = styled(Layout)`
  transition: margin-left 0.2s;
  height: 100%;
  overflow: auto;
  background: ${props => props.theme?.mode === 'dark' ? '#0a0a0a' : '#f5f7fa'} !important;
`;

const CloudDrivePage = () => {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState(['create']);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 769);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const intl = useIntl();

  // Add login check
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (!storedUserInfo) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 根据 URL 路径设置菜单选中状态
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/workspace/create')) {
      setSelectedKeys(['create']);
    } else if (path === '/workspace/all') {
      setSelectedKeys(['all']);
    } else if (path === '/workspace/trash') {
      setSelectedKeys(['trash']);
    } else if (path === '/workspace/decrypt') {
      setSelectedKeys(['decrypt']);
    } else if (path === '/workspace/media-tools') {
      setSelectedKeys(['mediaTools']);
    } else if (path === '/workspace/storage-nodes') {
      setSelectedKeys(['storageNodes']);
    } else if (path === '/workspace/prompt-market') {
      setSelectedKeys(['promptMarket']);
    } else if (path === '/workspace/channels') {
      setSelectedKeys(['channels']);
    } else if (path.startsWith('/workspace/daily-challenge')) {
      setSelectedKeys(['dailyChallenge']);
    } else if (path === '/workspace/recharge') {
      setSelectedKeys(['recharge']);
    } else if (path === '/workspace/embedding') {
      setSelectedKeys(['embedding']);
    } else if (path === '/workspace') {
      setSelectedKeys(['create']);
    }
  }, [location.pathname]);

  const handleMenuSelect = (key) => {
    setSelectedKeys([key]);
  };

  // 根据选中的菜单项渲染对应的内容
  const renderContent = () => {
    switch (selectedKeys[0]) {
      case 'create':
        return <Create />;
      case 'all':
        return <AllFiles />;
      case 'starred':
        return <Starred />;
      case 'folders':
        return <Folders />;
      case 'trash':
        return <Trash />;
      case 'decrypt':
        return <FileDecryptPage />;
      case 'storageNodes':
        return <StorageNodes />;
      case 'mediaTools':
        return <MediaTools />;
      case 'promptMarket':
        return <PromptMarket />;
      case 'channels':
        return <Channels />;
      case 'dailyChallenge':
        return <DailyChallenge />;
      case 'recharge':
        return <Recharge />;
      case 'embedding':
        return <Embedding />;
      default:
        return <Create />;
    }
  };

  return (
    <>
      <Helmet>
        <title>工作台 - AI2OBJ</title>
        <meta name="description" content="AI2OBJ 工作台 - 使用 AI 技术生成高质量视频" />
      </Helmet>
      <Layout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
        <SimpleHeader />
        <Layout style={{ marginTop: 64, height: 'calc(100vh - 64px)' }}>
          <SideMenu
            selectedKeys={selectedKeys}
            onSelect={handleMenuSelect}
            collapsed={collapsed}
            onCollapse={setCollapsed}
          />
          <ContentLayout style={{
            marginLeft: isMobile ? 0 : (collapsed ? 80 : 200)
          }}>
            {renderContent()}
          </ContentLayout>
        </Layout>
      </Layout>
    </>
  );
};

export default CloudDrivePage;