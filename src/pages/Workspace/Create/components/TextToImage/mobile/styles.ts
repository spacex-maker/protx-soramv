import styled from 'styled-components';

export const MobileContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 16px;
  background: transparent;
`;

export const MobileTitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e8e8e8'};
`;

export const MobileFormSection = styled.div`
  margin-bottom: 24px;
  
  .ant-form-item {
    margin-bottom: 16px;
  }
  
  .ant-form-item-label {
    padding-bottom: 4px;
    padding-top: 0;
    margin-bottom: 0;
    
    > label {
      font-size: 14px;
      font-weight: 500;
      height: auto;
      line-height: 1.5;
      margin: 0;
      padding: 0;
      
      > div {
        margin: 0;
        padding: 0;
      }
    }
  }
  
  .ant-input,
  .ant-select-selector {
    border-radius: 8px;
  }
  
  .ant-btn {
    border-radius: 8px;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
  }
`;

export const MobileResultSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e8e8e8'};
`;

export const MobileImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  margin-top: 16px;
  
  @media (max-width: 375px) {
    grid-template-columns: 1fr;
  }
`;

export const MobileImageWrapper = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  aspect-ratio: 1;
  
  .ant-image {
    width: 100%;
    height: 100%;
    display: block;
    
    .ant-image-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  
  &:hover {
    .mobile-image-actions {
      opacity: 1;
    }
  }
`;

export const MobileImageActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

export const MobileModelOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  .model-name {
    font-weight: 500;
    font-size: 14px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .model-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
  }
  
  .model-free {
    color: #52c41a;
    font-size: 12px;
    font-weight: 500;
  }
  
  .model-price {
    color: #1890ff;
    font-size: 12px;
    font-weight: 500;
  }
`;

export const MobileActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .ant-typography {
    font-size: 16px;
    font-weight: 500;
  }
`;


export const MobileDrawerContent = styled.div`
  padding: 8px 0;
  
  .ant-form-item {
    margin-bottom: 20px;
  }
  
  .ant-form-item-label {
    padding-bottom: 6px;
    
    label {
      font-size: 14px;
      font-weight: 500;
    }
  }
  
  .ant-input,
  .ant-select-selector {
    border-radius: 8px;
  }
  
  .ant-slider {
    margin: 12px 0;
  }
`;

// 移动端生成记录样式
export const MobileHistorySection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e8e8e8'};
`;

export const MobileHistoryTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  h4 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
  }
`;

export const MobileHistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  
  @media (max-width: 375px) {
    grid-template-columns: 1fr;
  }
`;

export const MobileHistoryCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 1px solid
    ${(props) =>
      props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e8e8e8'};
  transition: all 0.3s ease;
`;

export const MobileHistoryImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: ${(props) =>
    props.theme.mode === 'dark' ? '#0a0a0a' : '#f5f5f5'};
  
  .ant-image {
    width: 100%;
    height: 100%;
    display: block;
    
    .ant-image-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const MobileHistoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const MobileHistoryStatusBadge = styled.div<{ status: number }>`
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  ${(props) => {
    if (props.status === 2) {
      return `
        background: rgba(82, 196, 26, 0.2);
        color: #52c41a;
        border: 1px solid rgba(82, 196, 26, 0.3);
      `;
    } else if (props.status === 3) {
      return `
        background: rgba(255, 77, 79, 0.2);
        color: #ff4d4f;
        border: 1px solid rgba(255, 77, 79, 0.3);
      `;
    } else {
      return `
        background: rgba(24, 144, 255, 0.2);
        color: #1890ff;
        border: 1px solid rgba(24, 144, 255, 0.3);
      `;
    }
  }}
`;

export const MobileHistoryInfo = styled.div`
  padding: 10px;
`;

export const MobileHistoryModelName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => (props.theme.mode === 'dark' ? '#fff' : '#262626')};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MobileHistoryTime = styled.div`
  font-size: 10px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#8c8c8c' : '#8c8c8c')};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const MobileHistoryEmpty = styled.div`
  text-align: center;
  padding: 30px 20px;
  color: ${(props) => (props.theme.mode === 'dark' ? '#8c8c8c' : '#8c8c8c')};
`;

