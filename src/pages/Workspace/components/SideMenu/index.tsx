import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  CloudOutlined,
  StarOutlined,
  FolderOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CommentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LockOutlined,
  HistoryOutlined,
  CloudServerOutlined,
  EditOutlined,
  FileImageOutlined,
  ShoppingOutlined,
  CompassOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import AboutModal from 'components/modals/AboutModal';
import ProductLogModal from 'components/modals/ProductLogModal';
import { useNavigate } from 'react-router-dom';
import { CollapseTrigger, Overlay } from '../styles/StyledComponents';
import styled from 'styled-components';
import StorageInfo from './StorageInfo';

const { Sider } = Layout;

interface SideMenuProps {
  selectedKeys: string[];
  onSelect: (key: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const StyledSider = styled(Sider)<{ collapsed?: boolean }>`
  background: ${props => props.theme.mode === 'dark' 
    ? '#141414'
    : '#fff'} !important;
  border-right: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  height: calc(100vh - 64px);
  overflow: auto;
  z-index: 99;

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${props => props.theme.mode === 'dark' 
      ? '#141414'
      : '#fff'};
  }

  @media (max-width: 768px) {
    position: fixed !important;
    z-index: 999;
    height: 100vh !important;
    top: 0;
    left: 0;
    transition: all 0.2s ease-in-out;
    box-shadow: ${props => props.collapsed ? 'none' : '2px 0 8px rgba(0, 0, 0, 0.15)'};
    transform: ${props => props.collapsed ? 'translateX(-100%)' : 'translateX(0)'};
  }
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  border-inline-end: none !important;
  padding: 8px;
  
  .ant-menu-item {
    border-radius: 6px;
    margin: 4px 0 !important;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'} !important;
    }
    
    &.ant-menu-item-selected {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.06)'} !important;
    }
  }
`;

const BottomMenu = styled(Menu)`
  border-inline-end: none !important;
  padding: 8px;
  border-top: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  
  .ant-menu-item {
    border-radius: 6px;
    margin: 4px 0 !important;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'} !important;
    }
  }
`;

/** 社区按钮：全圆弧 + 炫彩渐变 */
const CommunityButton = styled.button<{ $collapsed?: boolean }>`
  margin: 8px;
  padding: ${props => props.$collapsed ? '10px' : '10px 20px'};
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${props => props.$collapsed ? 'auto' : 'calc(100% - 16px)'};
  min-height: 40px;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #f59e0b 75%, #3b82f6 100%);
  background-size: 300% 300%;
  animation: communityGradientShift 3s ease infinite;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.4), 0 0 24px rgba(139, 92, 246, 0.3), 0 0 16px rgba(236, 72, 153, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 16px rgba(59, 130, 246, 0.6), 0 0 32px rgba(139, 92, 246, 0.5), 0 0 24px rgba(236, 72, 153, 0.4);
  }
  &:active {
    transform: translateY(0);
  }

  @keyframes communityGradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

/** 充值按钮：全圆弧 + 炫彩渐变（与社区按钮同风格） */
const RechargeButton = styled.button<{ $collapsed?: boolean }>`
  margin: 8px;
  padding: ${props => props.$collapsed ? '10px' : '10px 20px'};
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${props => props.$collapsed ? 'auto' : 'calc(100% - 16px)'};
  min-height: 40px;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b 0%, #ec4899 25%, #8b5cf6 50%, #3b82f6 75%, #f59e0b 100%);
  background-size: 300% 300%;
  animation: rechargeGradientShift 3s ease infinite;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.4), 0 0 24px rgba(236, 72, 153, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.6), 0 0 32px rgba(236, 72, 153, 0.5);
  }
  &:active {
    transform: translateY(0);
  }

  @keyframes rechargeGradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const SideMenu: React.FC<SideMenuProps> = ({ selectedKeys, onSelect, collapsed, onCollapse }) => {
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isProductLogVisible, setIsProductLogVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      if (!mobile) {
        onCollapse(false);
      } else {
        onCollapse(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onCollapse]);

  const mainMenuItems = [
    {
      key: 'create',
      icon: <EditOutlined style={{ color: '#3b82f6' }} />,
      label: <FormattedMessage id="sidebar.create" defaultMessage="创作" />
    },
    // 暂时隐藏全部文件
    // {
    //   key: 'all',
    //   icon: <CloudOutlined style={{ color: '#3b82f6' }} />,
    //   label: <FormattedMessage id="sidebar.allFiles" />
    // },
    // 暂时隐藏收藏夹和文件夹
    // {
    //   key: 'starred',
    //   icon: <StarOutlined style={{ color: '#f59e0b' }} />,
    //   label: <FormattedMessage id="sidebar.starred" />
    // },
    // {
    //   key: 'folders',
    //   icon: <FolderOutlined style={{ color: '#10b981' }} />,
    //   label: <FormattedMessage id="sidebar.folders" />
    // },
    // 暂时隐藏垃圾桶
    // {
    //   key: 'trash',
    //   icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
    //   label: <FormattedMessage id="sidebar.trash" />
    // },
    // 暂时隐藏存储节点
    // {
    //   key: 'storageNodes',
    //   icon: <CloudServerOutlined style={{ color: '#8b5cf6' }} />,
    //   label: <FormattedMessage id="sidebar.storageNodes" defaultMessage="存储节点" />
    // },
    // 暂时隐藏加密工具
    // {
    //   key: 'decrypt',
    //   icon: <LockOutlined style={{ color: '#8b5cf6' }} />,
    //   label: <FormattedMessage id="sidebar.decrypt" />
    // },
    {
      key: 'promptMarket',
      icon: <ShoppingOutlined style={{ color: '#f59e0b' }} />,
      label: <FormattedMessage id="sidebar.promptMarket" defaultMessage="提示词商城" />
    },
    {
      key: 'channels',
      icon: <CompassOutlined style={{ color: '#8b5cf6' }} />,
      label: <FormattedMessage id="sidebar.channels" defaultMessage="生成频道" />
    },
    {
      key: 'dailyChallenge',
      icon: <TrophyOutlined style={{ color: '#f59e0b' }} />,
      label: <FormattedMessage id="sidebar.dailyChallenge" defaultMessage="每日挑战" />
    },
    {
      key: 'mediaTools',
      icon: <FileImageOutlined style={{ color: '#10b981' }} />,
      label: <FormattedMessage id="sidebar.mediaTools" defaultMessage="媒体工具" />
    },
    {
      key: 'embedding',
      icon: <CodeOutlined style={{ color: '#6366f1' }} />,
      label: <FormattedMessage id="sidebar.embedding" defaultMessage="向量模型" />
    }
  ];

  const bottomMenuItems = [
    {
      key: 'productLog',
      icon: <HistoryOutlined style={{ color: '#6b7280' }} />,
      label: <FormattedMessage id="sidebar.productLog" defaultMessage="产品日志" />
    },
    {
      key: 'feedback',
      icon: <CommentOutlined style={{ color: '#6b7280' }} />,
      label: <FormattedMessage id="sidebar.feedback" />
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined style={{ color: '#6b7280' }} />,
      label: <FormattedMessage id="sidebar.about" />
    }
  ];

  const handleMenuSelect = ({ key }: { key: string }) => {
    if (key === 'create') {
      navigate('/workspace/create');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'all') {
      navigate('/workspace/all');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'trash') {
      navigate('/workspace/trash');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'decrypt') {
      navigate('/workspace/decrypt');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'mediaTools') {
      navigate('/workspace/media-tools');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'promptMarket') {
      navigate('/workspace/prompt-market');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'channels') {
      navigate('/workspace/channels');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'dailyChallenge') {
      navigate('/workspace/daily-challenge');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'embedding') {
      navigate('/workspace/embedding');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'about') {
      setIsAboutVisible(true);
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }
    
    if (key === 'feedback') {
      navigate('/feedback');
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }

    if (key === 'productLog') {
      setIsProductLogVisible(true);
      if (isMobile) {
        onCollapse(true);
      }
      return;
    }
    
    onSelect(key);
    if (isMobile) {
      onCollapse(true);
    }
  };

  return (
    <>
      <StyledSider width={200} collapsed={collapsed}>
        <StyledMenu
          mode="inline"
          selectedKeys={selectedKeys}
          items={mainMenuItems}
          onSelect={handleMenuSelect}
        />
        <RechargeButton
          $collapsed={collapsed}
          onClick={() => {
            navigate('/workspace/recharge');
            if (isMobile) onCollapse(true);
          }}
        >
          <ThunderboltOutlined style={{ fontSize: 16 }} />
          {!collapsed && <span><FormattedMessage id="userMenu.recharge" defaultMessage="立即充值" /></span>}
        </RechargeButton>
        <CommunityButton
          $collapsed={collapsed}
          onClick={() => {
            navigate('/community');
            if (isMobile) onCollapse(true);
          }}
        >
          <TeamOutlined style={{ fontSize: 16 }} />
          {!collapsed && <span><FormattedMessage id="userMenu.community" defaultMessage="社区" /></span>}
        </CommunityButton>
        <BottomMenu
          mode="inline"
          selectedKeys={[]}
          items={bottomMenuItems}
          onSelect={handleMenuSelect}
        />
        {!collapsed && <StorageInfo />}
      </StyledSider>

      <CollapseTrigger
        onClick={() => onCollapse(!collapsed)}
        collapsed={collapsed}
      >
        {collapsed ? 
          <MenuUnfoldOutlined style={{ color: '#3b82f6' }} /> : 
          <MenuFoldOutlined style={{ color: '#3b82f6' }} />
        }
      </CollapseTrigger>

      <Overlay 
        visible={!collapsed && isMobile} 
        onClick={() => onCollapse(true)}
      />

      <AboutModal
        open={isAboutVisible}
        onClose={() => setIsAboutVisible(false)}
      />

      <ProductLogModal
        open={isProductLogVisible}
        onClose={() => setIsProductLogVisible(false)}
      />
    </>
  );
};

export default SideMenu; 