import { css } from 'styled-components';

/** 社区相关 Modal 移动端通用样式（配合 useCommunityModalProps） */
export const communityModalMobileCss = css`
  @media (max-width: 768px) {
    .ant-modal {
      max-width: calc(100vw - 24px) !important;
      margin: 12px auto !important;
    }

    .ant-modal-body {
      padding: 12px 14px !important;
      max-height: calc(100dvh - 112px) !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch;
    }

    .ant-modal-header {
      padding: 12px 16px !important;
    }

    .ant-modal-footer {
      padding: 10px 16px !important;
    }

    .ant-steps-horizontal {
      .ant-steps-item-title {
        font-size: 13px !important;
      }
    }
  }
`;
