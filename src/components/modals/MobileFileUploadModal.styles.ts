import styled from 'styled-components';
import { List } from 'antd';
import { theme } from 'antd';
import { createGlobalStyle } from 'styled-components';

type ThemeToken = ReturnType<typeof theme.useToken>['token'];

interface StyledProps {
  $token?: ThemeToken;
}

interface FileItemProps extends StyledProps {
  selected?: boolean;
}

export const MobileModalGlobalStyle = createGlobalStyle`
  .mobile-upload-modal {
    position: fixed !important;
    inset: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100vw !important;
    width: 100vw !important;
    height: 100vh !important;
    
    .ant-modal {
      position: fixed !important;
      margin: 0 !important;
      padding: 0 !important;
      max-width: 100vw !important;
      width: 100vw !important;
      height: 100vh !important;
      top: 0 !important;
      pointer-events: auto;
    }

    .ant-modal-content {
      height: 100vh;
      margin: 0;
      padding: 0;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      width: 100vw;
    }

    .ant-modal-wrap {
      position: fixed !important;
      inset: 0 !important;
      overflow: hidden !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .ant-modal-header {
      margin: 0;
      padding: 8px 12px;
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      
      .ant-modal-title {
        font-size: 16px;
        line-height: 1.4;
      }
    }

    .ant-modal-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      margin: 0;
      width: 100vw;
    }

    .ant-modal-footer {
      margin: 0;
      padding: 6px;
      position: sticky;
      bottom: 0;
      z-index: 10;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }
  }
`;

export const FileList = styled(List)`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  
  .ant-list-item {
    padding: 0;
    border: none;
  }
`;

export const DuplicateTag = styled.div<StyledProps>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 6px;
  background: ${props => props.$token?.colorWarningBg};
  border: 1px solid ${props => props.$token?.colorWarningBorder};
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  
  .anticon {
    font-size: 12px;
    color: ${props => props.$token?.colorWarning};
  }
`;

export const FileItem = styled.div<FileItemProps>`
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin: 4px 4px;
  background: ${props => props.selected ? props.$token?.colorPrimaryBg : props.$token?.colorBgContainer};
  border-radius: 10px;
  border: 1px solid ${props => props.selected ? props.$token?.colorPrimary : props.$token?.colorBorder};
  position: relative;
  box-shadow: ${props => props.selected ? 
    `0 4px 16px ${props.$token?.colorPrimary}20` : 
    `0 2px 8px ${props.$token?.colorBorder}20`
  };
`;

export const SelectIndicator = styled.div<StyledProps>`
  position: absolute;
  right: 12px;
  top: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.$token?.colorBgContainer};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transform: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px ${props => props.$token?.colorBgElevated}40;
  border: 1px solid ${props => props.$token?.colorBorder};
  
  .anticon {
    color: ${props => props.$token?.colorPrimary};
    font-size: 16px;
  }

  .ant-btn {
    padding: 0;
    border: none;
    background: transparent;
    
    &:hover, &:focus {
      background: transparent;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
`;

export const FileHeader = styled.div<StyledProps>`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  position: relative;
  min-height: 48px;
  
  .icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$token?.colorFillQuaternary};
    border-radius: 12px;
    color: ${props => props.$token?.colorTextSecondary};
    margin-top: 0;
  }
  
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 0;
  }
  
  .name {
    font-size: 14px;
    line-height: 1.4;
    color: ${props => props.$token?.colorText};
    font-weight: 500;
    margin-bottom: 4px;
    padding-right: 48px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    color: ${props => props.$token?.colorTextSecondary};
    font-size: 12px;
    line-height: 1.4;
    
    .size {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      background: ${props => props.$token?.colorFillQuaternary};
      border-radius: 4px;
    }

    .tags {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
  }
  
  .action-button {
    position: absolute;
    right: 0;
    top: 0;
    
    &:hover {
      background: transparent !important;
      opacity: 0.85;
    }
    
    &:active {
      transform: scale(0.9);
    }
  }
`;

export const FileProgress = styled.div<StyledProps>`
  margin-top: 8px;
  
  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    justify-content: space-between;
    
    .anticon {
      font-size: 16px;
    }
    
    .ant-typography {
      font-size: 14px;
      font-weight: 500;
    }

    .speed {
      font-size: 13px;
      color: ${props => props.$token?.colorTextSecondary};
      background: ${props => props.$token?.colorFillQuaternary};
      padding: 2px 8px;
      border-radius: 6px;
      margin-left: auto;
    }
  }
  
  .ant-progress {
    margin: 8px 0;
    
    .ant-progress-inner {
      background-color: ${props => props.$token?.colorFillQuaternary};
      border-radius: 6px;
      height: 8px;
    }

    .ant-progress-bg {
      border-radius: 6px;
      height: 8px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .progress-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: ${props => props.$token?.colorTextSecondary};
  }
`;

export const ActionBar = styled.div<StyledProps>`
  padding: 6px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 9;
  border-bottom: 1px solid ${props => props.$token?.colorBorderSecondary}40;

  .ant-space {
    width: 100%;
    display: flex !important;
    gap: 4px !important;
  }
  
  .ant-space-item {
    flex: 1;
    width: 0;
  }
  
  .ant-btn {
    width: 100%;
    height: 38px;
    border-radius: 6px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;

    .anticon {
      font-size: 16px;
      margin-right: 4px;
    }
  }

  .ant-upload {
    display: block;
    width: 100%;
    
    .ant-btn {
      width: 100%;
    }
  }
`;

export const UploadProgress = styled.div<StyledProps>`
  padding: 6px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 9;
  border-bottom: 1px solid ${props => props.$token?.colorBorderSecondary}40;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .title {
      font-size: 14px;
      color: ${props => props.$token?.colorText};
      font-weight: 600;
    }
    
    .speed {
      font-size: 12px;
      color: ${props => props.$token?.colorTextSecondary};
      background: ${props => props.$token?.colorFillQuaternary};
      padding: 2px 6px;
      border-radius: 4px;
    }
  }
  
  .ant-progress {
    margin-bottom: 12px;

    .ant-progress-inner {
      background-color: ${props => props.$token?.colorFillQuaternary};
      border-radius: 4px;
      height: 8px;
    }

    .ant-progress-bg {
      border-radius: 4px;
      height: 8px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
  
  .total {
    font-size: 13px;
    color: ${props => props.$token?.colorTextSecondary};
    display: flex;
    justify-content: space-between;
  }
`;

export const MobileFileName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 0;
  
  .file-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .icon {
    font-size: 16px;
    flex-shrink: 0;
  }
  
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
`;

export const MobileFileSize = styled.span`
  color: var(--ant-color-text-secondary);
  font-size: 12px;
`;

export const MobileProgressText = styled.span`
  color: var(--ant-color-text);
  font-size: 12px;
  white-space: nowrap;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

export const MobileStatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  .status-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .speed {
    font-size: 12px;
    color: var(--ant-color-text-secondary);
  }
`;

export const MobileTotalProgressText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  
  .uploaded {
    color: var(--ant-color-primary);
  }
  
  .total {
    color: var(--ant-color-text-secondary);
  }
`;

export const MobileDuplicateTag = styled.span`
  color: #faad14;
  font-size: 12px;
  margin-left: 8px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const MobileChunkUploadTag = styled(MobileDuplicateTag)`
  color: #1890ff;
`; 