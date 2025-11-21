import styled from 'styled-components';
import { Card } from 'antd';

export const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--ant-color-bg-container);
  padding-top: 72px;
`;

export const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 88px auto 40px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin: 48px auto 24px;
    padding: 0 16px;
    gap: 16px;
  }
`;

export const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
`;

export const DecryptCard = styled(Card)`
  position: relative;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .ant-card-head {
    border-bottom: none;
  }
  
  .ant-card-body {
    padding: 24px;
  }

  .security-tip-btn {
    position: absolute;
    right: 24px;
    top: 16px;
    z-index: 1;
  }
`;

export const DecryptLayout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    grid-template-columns: 280px 1fr;
    gap: 16px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 240px 1fr;
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const StyledUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  .upload-area {
    width: 100%;
    
    .ant-upload-drag {
      padding: 16px;
      height: 240px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all 0.3s;
      
      @media (max-width: 1200px) {
        height: 220px;
        padding: 14px;
      }
      
      @media (max-width: 992px) {
        height: 200px;
        padding: 12px;
      }
      
      @media (max-width: 768px) {
        height: 180px;
      }
      
      @media (max-width: 576px) {
        height: 160px;
        padding: 10px;
      }
    }
    
    .ant-upload-drag-icon {
      margin: 0;
      transition: all 0.3s;
      
      .anticon {
        font-size: 36px;
        color: var(--ant-color-primary);
        
        @media (max-width: 992px) {
          font-size: 32px;
        }
        
        @media (max-width: 576px) {
          font-size: 28px;
        }
      }
    }
    
    .ant-upload-text {
      font-size: 16px;
      margin: 12px 0 8px;
      transition: all 0.3s;
      
      @media (max-width: 992px) {
        font-size: 14px;
        margin: 10px 0 6px;
      }
      
      @media (max-width: 576px) {
        font-size: 13px;
        margin: 8px 0 4px;
      }
    }
    
    .ant-upload-hint {
      font-size: 13px;
      padding: 0 16px;
      transition: all 0.3s;
      
      @media (max-width: 992px) {
        font-size: 12px;
        padding: 0 12px;
      }
      
      @media (max-width: 576px) {
        font-size: 11px;
        padding: 0 8px;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-direction: column;
    width: 100%;

    .ant-btn {
      width: 100%;
      height: 40px;
      font-size: 14px;
      
      @media (max-width: 992px) {
        height: 36px;
        font-size: 13px;
      }
      
      @media (max-width: 576px) {
        height: 32px;
        font-size: 12px;
      }
    }
  }
`;

export const StyledFileListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  .ant-table-wrapper {
    width: 100%;
    overflow-x: auto;
    
    .ant-table {
      min-width: 500px;
    }
    
    .ant-table-cell {
      background: transparent !important;
      
      @media (max-width: 992px) {
        padding: 12px 8px;
      }
      
      @media (max-width: 576px) {
        padding: 8px 6px;
      }
    }
    
    .file-info {
      .file-name {
        font-size: 14px;
        
        @media (max-width: 992px) {
          font-size: 13px;
        }
      }
      
      .file-size {
        font-size: 12px;
        
        @media (max-width: 992px) {
          font-size: 11px;
        }
      }
    }
    
    .progress {
      width: 160px;
      
      @media (max-width: 1200px) {
        width: 140px;
      }
      
      @media (max-width: 992px) {
        width: 120px;
      }
      
      @media (max-width: 768px) {
        width: 100px;
      }
    }
    
    .ant-tag {
      margin: 0;
      font-size: 12px;
      
      @media (max-width: 992px) {
        font-size: 11px;
        padding: 0 6px;
      }
    }
  }
`;

export const StyledStepsCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .ant-card-head {
    border-bottom: none;
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

export const StyledStepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const StyledStepItem = styled.div`
  background: var(--ant-color-bg-container-disabled);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: var(--ant-color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .step-icon {
    font-size: 32px;
    color: var(--ant-color-primary);
    margin-bottom: 16px;
  }
  
  h4 {
    margin: 0 0 12px;
    color: var(--ant-color-text);
    font-size: 16px;
  }
  
  p {
    margin: 0;
    color: var(--ant-color-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
`;

export const PageTitle = styled.div`
  text-align: center;
  margin: 0 auto;
  max-width: 800px;
  padding: 0 24px;

  .ant-typography {
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 16px;
    display: block;
  }

  @media (max-width: 768px) {
    padding: 0 16px;

    .subtitle {
      font-size: 14px;
    }
  }
`; 