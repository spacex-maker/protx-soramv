import type { ModalProps } from 'antd';

/** 我的社区角色模态框：顶栏渐变铺满、无 body 边距 */
export function mergeUserRoleModalStyles(
  base?: ModalProps['styles'],
): ModalProps['styles'] {
  return {
    ...base,
    content: {
      ...base?.content,
      padding: 0,
      overflow: 'hidden',
    },
    body: {
      ...base?.body,
      padding: 0,
      margin: 0,
    },
    header: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      zIndex: 20,
      background: 'transparent',
      borderBottom: 'none',
      marginBottom: 0,
      padding: '14px 16px',
    },
  };
}
