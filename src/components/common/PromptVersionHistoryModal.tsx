import React, { useEffect, useState } from 'react';
import { Modal, Typography, Button, Empty, Spin, message, Space, Tooltip } from 'antd';
import {
  HistoryOutlined,
  DeleteOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  HourglassOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';

const { Text, Paragraph } = Typography;

// ==========================================
// 样式组件定义
// ==========================================

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0;
    border-radius: 24px;
    overflow: hidden;
    background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.6);
  }
  .ant-modal-header { display: none; }
  .ant-modal-body {
    padding: 0;
  }

  @media (max-width: 768px) {
    .ant-modal-content {
      border-radius: 20px;
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};

  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1f1f1f'};
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1f1f1f'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 24px 32px;
  max-height: 70vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    }
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
    max-height: 75vh;
  }
`;

const VersionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VersionItem = styled.div`
  position: relative;
  padding: 20px;
  border-radius: 16px;
  border: 1.5px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  background: ${props => props.theme.mode === 'dark' ? 'linear-gradient(135deg, #1f1f1f 0%, #252525 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;

  /* 左侧装饰条 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.theme.mode === 'dark' ? 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)' : 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)'};
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'};
    background: ${props => props.theme.mode === 'dark' ? 'linear-gradient(135deg, #252525 0%, #2a2a2a 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.12)'};
    
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const VersionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
`;

const VersionHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
`;

const VersionTime = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'};
  padding: 5px 12px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  white-space: nowrap;
  
  .anticon {
    font-size: 12px;
    opacity: 0.8;
  }
`;

const VersionActions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  
  .ant-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const PromptContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VersionPrompt = styled.div`
  color: ${props => props.theme.mode === 'dark' ? '#e5e5e5' : '#1f1f1f'};
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  font-weight: 400;
  letter-spacing: 0.01em;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  position: relative;
  
  /* 提示词标签 - 使用 data-label 属性 */
  &::before {
    content: attr(data-label);
    position: absolute;
    top: -8px;
    left: 12px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const VersionNegativePrompt = styled.div`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'};
  font-size: 12px;
  line-height: 1.6;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  word-break: break-word;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'};
  position: relative;
  
  /* 反向提示词标签 - 使用 data-label 属性 */
  &::before {
    content: attr(data-label);
    position: absolute;
    top: -8px;
    left: 12px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
`;

const StatusBadge = styled.div<{ status?: number }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
  transition: all 0.2s;
  
  ${props => {
    const status = props.status ?? 0;
    if (status === 2) {
      // 成功
      return `
        background: ${props.theme.mode === 'dark' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)'};
        color: ${props.theme.mode === 'dark' ? '#34d399' : '#059669'};
        border: 1.5px solid ${props.theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'};
        box-shadow: 0 2px 8px ${props.theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'};
      `;
    } else if (status === 3 || status === 4) {
      // 失败或超时
      return `
        background: ${props.theme.mode === 'dark' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)'};
        color: ${props.theme.mode === 'dark' ? '#f87171' : '#dc2626'};
        border: 1.5px solid ${props.theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'};
        box-shadow: 0 2px 8px ${props.theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'};
      `;
    } else if (status === 1) {
      // 进行中
      return `
        background: ${props.theme.mode === 'dark' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)'};
        color: ${props.theme.mode === 'dark' ? '#60a5fa' : '#2563eb'};
        border: 1.5px solid ${props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'};
        box-shadow: 0 2px 8px ${props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'};
      `;
    } else {
      // 排队中
      return `
        background: ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'};
        color: ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
        border: 1.5px solid ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)'};
      `;
    }
  }}
`;

const ResultMessage = styled.div<{ status?: number }>`
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-word;
  font-weight: 400;
  position: relative;
  
  ${props => {
    const status = props.status ?? 0;
    if (status === 2) {
      // 成功
      return `
        background: ${props.theme.mode === 'dark' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.08) 100%)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(5, 150, 105, 0.04) 100%)'};
        color: ${props.theme.mode === 'dark' ? '#34d399' : '#059669'};
        border: 1px solid ${props.theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.2)'};
      `;
    } else if (status === 3 || status === 4) {
      // 失败或超时
      return `
        background: ${props.theme.mode === 'dark' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.08) 100%)' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)'};
        color: ${props.theme.mode === 'dark' ? '#f87171' : '#dc2626'};
        border: 1px solid ${props.theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)'};
      `;
    } else {
      return `
        background: ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'};
        color: ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
        border: 1px solid ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
      `;
    }
  }}
  
  /* 结果消息标签 - 使用 data-label 属性 */
  &::before {
    content: attr(data-label);
    position: absolute;
    top: -8px;
    left: 12px;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
    color: ${props => {
      const status = props.status ?? 0;
      if (status === 2) {
        return props.theme.mode === 'dark' ? '#34d399' : '#059669';
      } else if (status === 3 || status === 4) {
        return props.theme.mode === 'dark' ? '#f87171' : '#dc2626';
      }
      return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
    }};
    border: 1px solid ${props => {
      const status = props.status ?? 0;
      if (status === 2) {
        return props.theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)';
      } else if (status === 3 || status === 4) {
        return props.theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
      }
      return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }};
  }
`;

const EmptyContainer = styled.div`
  padding: 80px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const EmptyIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.theme.mode === 'dark' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 2px dashed ${props => props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
  
  .anticon {
    font-size: 48px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.4)'};
  }
`;

// ==========================================
// 类型定义
// ==========================================

export interface PromptVersion {
  id: number;
  userId: number;
  moduleType: string;
  prompt: string;
  negativePrompt?: string;
  taskId?: number;
  status?: number; // 0排队 1进行中 2成功 3失败 4超时
  resultMessage?: string; // 任务执行结果消息
  createTime: string;
  updateTime: string;
}

interface PromptVersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  moduleType: string; // 't2i' | 't2v' | 'i2v' 等
  onSelectPrompt?: (prompt: string, negativePrompt?: string) => void; // 选择提示词时的回调
}

// ==========================================
// 组件实现
// ==========================================

const PromptVersionHistoryModal: React.FC<PromptVersionHistoryModalProps> = ({
  open,
  onClose,
  moduleType,
  onSelectPrompt,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // 获取提示词版本列表
  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await instance.get<{
        success: boolean;
        data: PromptVersion[];
        message?: string;
      }>('/productx/sa-ai-models/prompt/versions', {
        params: { moduleType },
      });

      if (response.data.success && response.data.data) {
        setVersions(response.data.data);
      } else {
        message.error(response.data.message || '获取提示词版本失败');
      }
    } catch (error: any) {
      console.error('获取提示词版本列表失败:', error);
      message.error(
        error.response?.data?.message ||
        intl.formatMessage({
          id: 'prompt.version.fetch.error',
          defaultMessage: '获取提示词版本失败',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // 删除提示词版本
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发选择事件
    
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const response = await instance.post<{
        success: boolean;
        data: boolean;
        message?: string;
      }>(`/productx/sa-ai-models/prompt/version/${id}/delete`);

      if (response.data.success) {
        message.success(
          intl.formatMessage({
            id: 'prompt.version.delete.success',
            defaultMessage: '删除成功',
          })
        );
        // 从列表中移除
        setVersions(prev => prev.filter(v => v.id !== id));
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error: any) {
      console.error('删除提示词版本失败:', error);
      message.error(
        error.response?.data?.message ||
        intl.formatMessage({
          id: 'prompt.version.delete.error',
          defaultMessage: '删除失败',
        })
      );
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // 选择提示词
  const handleSelectPrompt = (version: PromptVersion) => {
    if (onSelectPrompt) {
      onSelectPrompt(version.prompt, version.negativePrompt);
      message.success(
        intl.formatMessage({
          id: 'prompt.version.select.success',
          defaultMessage: '已填入提示词',
        })
      );
      onClose();
    }
  };

  // 复制提示词
  const handleCopy = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发选择事件
    
    try {
      await navigator.clipboard.writeText(text);
      message.success(
        intl.formatMessage({
          id: 'prompt.version.copy.success',
          defaultMessage: '已复制到剪贴板',
        })
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'prompt.version.copy.error',
          defaultMessage: '复制失败',
        })
      );
    }
  };

  // 获取状态文本和图标
  const getStatusInfo = (status?: number) => {
    switch (status) {
      case 0:
        return {
          text: intl.formatMessage({
            id: 'prompt.version.status.queued',
            defaultMessage: '排队中',
          }),
          icon: <HourglassOutlined />,
        };
      case 1:
        return {
          text: intl.formatMessage({
            id: 'prompt.version.status.processing',
            defaultMessage: '进行中',
          }),
          icon: <LoadingOutlined />,
        };
      case 2:
        return {
          text: intl.formatMessage({
            id: 'prompt.version.status.success',
            defaultMessage: '成功',
          }),
          icon: <CheckCircleOutlined />,
        };
      case 3:
        return {
          text: intl.formatMessage({
            id: 'prompt.version.status.failed',
            defaultMessage: '失败',
          }),
          icon: <CloseCircleOutlined />,
        };
      case 4:
        return {
          text: intl.formatMessage({
            id: 'prompt.version.status.timeout',
            defaultMessage: '超时',
          }),
          icon: <CloseCircleOutlined />,
        };
      default:
        return null;
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return intl.formatMessage({
        id: 'prompt.version.time.justNow',
        defaultMessage: '刚刚',
      });
    } else if (minutes < 60) {
      return intl.formatMessage(
        {
          id: 'prompt.version.time.minutesAgo',
          defaultMessage: '{minutes} 分钟前',
        },
        { minutes }
      );
    } else if (hours < 24) {
      return intl.formatMessage(
        {
          id: 'prompt.version.time.hoursAgo',
          defaultMessage: '{hours} 小时前',
        },
        { hours }
      );
    } else if (days < 7) {
      return intl.formatMessage(
        {
          id: 'prompt.version.time.daysAgo',
          defaultMessage: '{days} 天前',
        },
        { days }
      );
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const [modalWidth, setModalWidth] = useState<number | string>(800);

  useEffect(() => {
    if (open) {
      fetchVersions();
      // 设置响应式宽度
      const updateWidth = () => {
        setModalWidth(window.innerWidth > 768 ? 800 : '90%');
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [open, moduleType]);

  return (
    <StyledModal
      open={open}
      onCancel={onClose}
      footer={null}
      width={modalWidth}
      destroyOnClose
      closable={false}
      maskClosable={true}
    >
      <ModalHeader>
        <HeaderTitle>
          <HistoryOutlined style={{ color: '#3b82f6' }} />
          <FormattedMessage
            id="prompt.version.title"
            defaultMessage="提示词版本历史"
          />
        </HeaderTitle>
        <CloseButton onClick={onClose}>
          <CloseOutlined />
        </CloseButton>
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : versions.length === 0 ? (
          <EmptyContainer>
            <EmptyIcon>
              <HistoryOutlined />
            </EmptyIcon>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ marginTop: 16 }}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 14,
                      color: 'inherit',
                    }}
                  >
                    <FormattedMessage
                      id="prompt.version.empty"
                      defaultMessage="暂无提示词版本记录"
                    />
                  </Text>
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    <FormattedMessage
                      id="prompt.version.empty.desc"
                      defaultMessage="开始生成图片后，提示词将自动保存到这里"
                    />
                  </div>
                </div>
              }
            />
          </EmptyContainer>
        ) : (
          <VersionList>
            {versions.map((version) => (
              <VersionItem
                key={version.id}
                onClick={() => handleSelectPrompt(version)}
              >
                <VersionHeader>
                  <VersionHeaderLeft>
                    <VersionTime>
                      <ClockCircleOutlined />
                      {formatTime(version.createTime)}
                    </VersionTime>
                    {version.status !== undefined && version.status !== null && (
                      <StatusBadge status={version.status}>
                        {getStatusInfo(version.status)?.icon}
                        {getStatusInfo(version.status)?.text}
                      </StatusBadge>
                    )}
                  </VersionHeaderLeft>
                  <VersionActions>
                    <Tooltip
                      title={intl.formatMessage({
                        id: 'prompt.version.copy.tooltip',
                        defaultMessage: '复制提示词',
                      })}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={(e) => handleCopy(version.prompt, e)}
                        style={{ 
                          color: '#3b82f6',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                        }}
                      />
                    </Tooltip>
                    <Tooltip
                      title={intl.formatMessage({
                        id: 'prompt.version.delete.tooltip',
                        defaultMessage: '删除',
                      })}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={deletingIds.has(version.id)}
                        onClick={(e) => handleDelete(version.id, e)}
                        danger
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      />
                    </Tooltip>
                  </VersionActions>
                </VersionHeader>
                <PromptContent>
                  <VersionPrompt
                    data-label={intl.formatMessage({
                      id: 'prompt.version.label.prompt',
                      defaultMessage: '提示词',
                    })}
                  >
                    {version.prompt}
                  </VersionPrompt>
                  {version.negativePrompt && (
                    <VersionNegativePrompt
                      data-label={intl.formatMessage({
                        id: 'prompt.version.label.negativePrompt',
                        defaultMessage: '反向提示词',
                      })}
                    >
                      {version.negativePrompt}
                    </VersionNegativePrompt>
                  )}
                </PromptContent>
                {(version.status !== undefined && version.status !== null) || version.resultMessage ? (
                  <StatusSection>
                    {version.resultMessage && (
                      <ResultMessage
                        status={version.status}
                        data-label={intl.formatMessage({
                          id: 'prompt.version.label.result',
                          defaultMessage: '执行结果',
                        })}
                      >
                        {version.resultMessage}
                      </ResultMessage>
                    )}
                  </StatusSection>
                ) : null}
              </VersionItem>
            ))}
          </VersionList>
        )}
      </ModalBody>
    </StyledModal>
  );
};

export default PromptVersionHistoryModal;

