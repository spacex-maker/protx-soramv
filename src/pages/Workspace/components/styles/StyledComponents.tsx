import styled from 'styled-components';
import { Button, Input } from 'antd';

interface CollapseTriggerProps {
  collapsed?: boolean;
}

interface OverlayProps {
  visible?: boolean;
}

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  gap: 16px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  
  .ant-space {
    gap: 8px !important;
    
    @media (max-width: 768px) {
      gap: 4px !important;
    }
  }
  
  .action-button-text {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

export const RoundedButton = styled(Button)`
  @media (min-width: 769px) {
    border-radius: 20px;
    height: 36px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  @media (max-width: 768px) {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    min-width: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  transition: all 0.2s ease;
  
  &.ant-btn-default {
    background-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.02)'};
    color: var(--ant-color-text);
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.04)'};
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
  
  &.ant-btn-text {
    @media (min-width: 769px) {
      padding: 0 12px;
    }
    box-shadow: none;
    background: transparent;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)'};
    }
  }
  
  &.ant-btn-primary {
    background-color: #1677ff;
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 4px rgba(22, 119, 255, 0.2);
    
    &:hover {
      background-color: #4096ff;
      box-shadow: 0 4px 8px rgba(22, 119, 255, 0.3);
    }
    
    &:active {
      background-color: #0958d9;
      box-shadow: 0 2px 4px rgba(22, 119, 255, 0.2);
    }
    
    &.ant-btn-loading {
      opacity: 0.8;
      background-color: #4096ff;
    }
    
    .anticon {
      color: #ffffff;
    }
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  .anticon {
    font-size: 16px;
  }
`;

export const RoundedSearch = styled(Input.Search)`
  .ant-input {
    border-radius: 20px;
    padding-left: 16px;
  }
  
  .ant-input-group-addon {
    .ant-btn {
      border-radius: 0 20px 20px 0 !important;
    }
  }
`;

export const CollapseTrigger = styled.div<CollapseTriggerProps>`
  position: fixed;
  left: ${props => props.collapsed ? '0' : '200px'};
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  border-left: none;
  border-radius: 0 24px 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease-in-out;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fafafa'};
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

export const Overlay = styled.div<OverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 998;
  display: ${props => props.visible ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`; 