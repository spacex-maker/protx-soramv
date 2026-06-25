import {
  UserOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  WalletOutlined,
  ContainerOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserAddOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  TeamOutlined,
  HeartOutlined,
  EditOutlined,
} from '@ant-design/icons';

/** 桌面/移动端用户菜单分组（与 UserMenu 一致） */
export function getUserMenuGroups(intl) {
  return [
    {
      title: intl.formatMessage({ id: 'userMenu.group.account', defaultMessage: '账户设置' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.profile', defaultMessage: '个人中心' }), icon: <UserOutlined />, path: '/profile' },
        { label: intl.formatMessage({ id: 'userMenu.item.settings', defaultMessage: '系统设置' }), icon: <SettingOutlined />, path: '/settings' },
        { label: intl.formatMessage({ id: 'userMenu.item.security', defaultMessage: '安全设置' }), icon: <SafetyCertificateOutlined />, path: '/security' },
        { label: intl.formatMessage({ id: 'userMenu.item.privacy', defaultMessage: '隐私偏好' }), icon: <LockOutlined />, path: '/privacy-preferences' },
      ],
    },
    {
      title: intl.formatMessage({ id: 'userMenu.group.assets', defaultMessage: '资产与订单' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.wallet', defaultMessage: '我的钱包' }), icon: <WalletOutlined />, path: '/billing' },
        { label: intl.formatMessage({ id: 'userMenu.item.subscription', defaultMessage: '订阅管理' }), icon: <CreditCardOutlined />, path: '/subscription' },
        { label: intl.formatMessage({ id: 'userMenu.item.orders', defaultMessage: '订单记录' }), icon: <FileTextOutlined />, path: '/orders' },
      ],
    },
    {
      title: intl.formatMessage({ id: 'userMenu.group.workspace', defaultMessage: '工作台' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.works', defaultMessage: '我的作品' }), icon: <ContainerOutlined />, path: '/works' },
        { label: intl.formatMessage({ id: 'userMenu.item.myPrompts', defaultMessage: '我的提示词' }), icon: <EditOutlined />, path: '/workspace/my-prompts' },
        { label: intl.formatMessage({ id: 'userMenu.item.saved', defaultMessage: '收藏与喜欢' }), icon: <HeartOutlined />, path: '/community/saved' },
        { label: intl.formatMessage({ id: 'userMenu.item.community', defaultMessage: '社区' }), icon: <TeamOutlined />, path: '/community' },
        { label: intl.formatMessage({ id: 'userMenu.item.notifications', defaultMessage: '消息通知' }), icon: <BellOutlined />, path: '/notifications' },
      ],
    },
    {
      title: intl.formatMessage({ id: 'userMenu.group.support', defaultMessage: '支持' }),
      items: [
        { label: intl.formatMessage({ id: 'userMenu.item.help', defaultMessage: '帮助中心' }), icon: <QuestionCircleOutlined />, path: '/help' },
        { label: intl.formatMessage({ id: 'userMenu.item.invite', defaultMessage: '邀请好友' }), icon: <UserAddOutlined />, path: '/invite' },
        { label: intl.formatMessage({ id: 'userMenu.item.feedback', defaultMessage: '反馈建议' }), icon: <MessageOutlined />, path: '/feedback' },
        { label: intl.formatMessage({ id: 'userMenu.item.about', defaultMessage: '关于我们' }), icon: <InfoCircleOutlined />, path: '/about' },
      ],
    },
  ];
}
