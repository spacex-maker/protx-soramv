import React, { useState, useEffect } from 'react';
import { Modal, Empty, Spin, message, Typography, Tag, Button, Tabs, Pagination } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  CheckCircleFilled,
  PlusOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createPost, listChannels } from 'api/community';
import instance from 'api/axios';
import TextToImage from 'pages/Workspace/Create/components/TextToImage';
import TaskDetailModal from 'pages/Workspace/Create/components/TextToImage/TaskDetailModal';
import SubmitChallengeMobile from './SubmitChallengeMobile';

const { Text, Title } = Typography;

// --- 动画 ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseSelection = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(24, 144, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
  100% { box-shadow: 0 0 0 0px rgba(24, 144, 255, 0); }
`;

// --- 样式组件 ---
const ModalGlobalStyle = createGlobalStyle`
  .submit-challenge-modal-wrap {
    @media (max-width: 768px) {
      display: flex !important;
      align-items: flex-end !important;
      justify-content: center !important;
    }
  }

  .submit-challenge-modal {
    .ant-modal-content {
      padding: 0 !important;
      border-radius: 24px !important;
      overflow: hidden !important;
      background: ${props => props.theme.mode === 'dark' ? '#141416' : '#ffffff'} !important;
      border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
      
      @media (max-width: 768px) {
        border-radius: 20px 20px 0 0 !important;
      }
    }

    .ant-modal-body {
      padding: 0 !important;
    }

    .ant-modal-footer {
      padding: 24px 32px 32px !important;
      margin: 0 !important;
      border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'} !important;
      background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'};
      position: relative;
      z-index: 10;
      
      @media (max-width: 768px) {
        padding: 16px 20px calc(16px + env(safe-area-inset-bottom)) !important;
      }
    }

    .ant-modal-close {
      top: 24px !important;
      right: 24px !important;
      background: rgba(0, 0, 0, 0.2) !important;
      border-radius: 50% !important;
      color: #fff !important;
      backdrop-filter: blur(4px);
      z-index: 1010;
      
      &:hover {
        background: rgba(0, 0, 0, 0.4) !important;
        color: #fff !important;
      }

      @media (max-width: 768px) {
        top: 12px !important;
        right: 12px !important;
      }
    }

    /* 移动端本体尺寸修复 */
    @media (max-width: 768px) {
      top: 0 !important;
      margin: 0 !important;
      padding-bottom: 0 !important;
      max-width: 100vw !important;
    }
  }
`;

const StyledModal = styled(Modal)`
  .ant-tabs {
    .ant-tabs-nav {
      margin: 0 !important;
      padding: 8px 32px 0 !important;
      background: transparent !important;
      
      @media (max-width: 768px) {
        padding: 4px 16px 0 !important;
      }

      &::before {
        border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} !important;
      }
    }
    
    .ant-tabs-tab {
      padding: 12px 20px !important;
      margin: 0 4px 0 0 !important;
      border-radius: 12px 12px 0 0 !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      
      @media (max-width: 768px) {
        padding: 8px 12px !important;
        font-size: 14px !important;
      }
      
      .ant-tabs-tab-btn {
        color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.45)'} !important;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      &:hover {
        background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
        
        .ant-tabs-tab-btn {
          color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.75)'} !important;
        }
      }
      
      &.ant-tabs-tab-active {
        background: ${props => props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'} !important;
        border-bottom: 2px solid #3b82f6 !important;
        
        .ant-tabs-tab-btn {
          color: ${props => props.theme.mode === 'dark' ? '#60a5fa' : '#3b82f6'} !important;
        }
      }
    }
    
    .ant-tabs-ink-bar {
      display: none !important;
    }
    
    .ant-tabs-content-holder {
      padding: 0 !important;
    }
    
    .ant-tabs-tabpane {
      padding: 0 !important;
    }
  }
`;

const TopChallengeContainer = styled.div`
  position: relative;
  padding: 80px 32px 48px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1d4ed8 0%, #1e1b4b 100%)' 
    : 'linear-gradient(135deg, #3b82f6 0%, #dbeafe 100%)'};
  color: #fff;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 60px 20px 32px;
  }
// ... 之前的伪元素代码 ...
  .challenge-title {
    font-size: 40px;
    font-weight: 800;
    line-height: 1.1;
    margin: 0;
    color: #fff;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    @media (max-width: 768px) {
      font-size: 28px;
    }
  }

  .challenge-meta {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 16px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .meta-item {
// ... meta-item 内部样式 ...
    }
  }
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  padding: 0;
`;

const CoverScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 0 0 24px;
  overflow-x: auto;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { 
    background: rgba(128, 128, 128, 0.3); 
    border-radius: 3px;
  }
`;

const CoverItem = styled.div`
  flex: 0 0 120px;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  transform: ${props => props.$isSelected ? 'scale(1.05)' : 'scale(1)'};
  border: 3px solid ${props => props.$isSelected ? '#1890ff' : 'transparent'};
  box-shadow: ${props => props.$isSelected ? '0 8px 16px rgba(24, 144, 255, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
  ${props => props.$isSelected && css`
    animation: ${pulseSelection} 2s infinite;
  `}

  &:hover { 
    transform: scale(1.08); 
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  color: #1890ff;
  background: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  padding: 0 0 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

const TaskCard = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f5f5f5'};
  border: 2px solid ${props => props.$isSelected ? '#1890ff' : 'transparent'};
  box-shadow: ${props => props.$isSelected ? '0 6px 12px rgba(24, 144, 255, 0.3)' : '0 2px 6px rgba(0,0,0,0.08)'};
  ${props => props.$isSelected && css`
    animation: ${pulseSelection} 2s infinite;
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  }

  .task-image {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    background: #000;
  }

  .task-info {
    padding: 8px 10px;
  }

  .task-model {
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-time {
    font-size: 10px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .task-status {
    position: absolute;
    top: 6px;
    left: 6px;
    font-size: 9px;
    padding: 3px 6px;
    border-radius: 4px;
    font-weight: 600;
    background: rgba(82, 196, 26, 0.9);
    color: #fff;
    text-transform: uppercase;
  }

  .task-detail-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    z-index: 2;

    &:hover {
      background: rgba(24, 144, 255, 0.9);
      transform: scale(1.1);
      border-color: rgba(24, 144, 255, 1);
    }
  }

  &:hover .task-detail-btn {
    opacity: 1;
  }
`;

const EmptyStateContainer = styled.div`
  padding: 60px 0;
  text-align: center;
`;

const CreateNewButton = styled(Button)`
  border-radius: 16px !important;
  height: 48px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  margin-top: 20px !important;
`;

const AnimatedContent = styled.div`
  animation: ${fadeIn} 0.5s ease forwards;
`;

const TabContentWrapper = styled.div`
  max-height: 65vh;
  overflow-y: auto;
  padding: 24px 32px;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    max-height: 50vh;
  }
// ... 保持其他样式不变 ...
`;

const CreateModeContainer = styled.div`
  padding: 24px 0;
  
  .embedded-creator {
    padding: 0 32px;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px 0 0;
  margin-top: 16px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'};
  
  .ant-pagination {
    .ant-pagination-item {
      border-radius: 8px;
      
      &.ant-pagination-item-active {
        border-color: #3b82f6;
        background: #3b82f6;
        
        a {
          color: #fff;
        }
      }
    }
    
    .ant-pagination-prev,
    .ant-pagination-next {
      border-radius: 8px;
    }
  }
`;

const SubmitChallengeModal = ({ open, onCancel, onSuccess, challenge }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('select');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState(null);

  // 加载用户的生成历史
  useEffect(() => {
    if (open) {
      setCurrentPage(1);
      loadUserTasks(1);
      setActiveTab('select'); // 重置为选择标签
      setSelectedTask(null);
      setSelectedTaskId(null);
    }
  }, [open]);

  const loadUserTasks = async (page = 1) => {
    setLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', {
        params: {
          currentPage: page,
          pageSize: pageSize,
          taskType: 't2i', // 只查询文本生成图片类型的任务
        },
      });

      if (response.data.success && response.data.data) {
        const tasksData = response.data.data.records || [];
        // 只显示已完成的任务（status: 2 表示成功）
        const completedTasks = tasksData.filter(
          task => task.status === 2 && task.resultUrls && task.resultUrls.length > 0
        );
        setTasks(completedTasks);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      message.error(intl.formatMessage({ id: 'challenge.loadTasksFailed', defaultMessage: '加载作品失败' }));
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTaskId(task.id);
    setSelectedTask(task);
    setSelectedCoverIndex(0); // 重置封面选择
  };

  const handleSubmit = async () => {
    if (!selectedTask || !challenge) {
      message.warning(intl.formatMessage({ id: 'challenge.selectTaskFirst', defaultMessage: '请先选择要提交的作品' }));
      return;
    }

    setPublishLoading(true);
    try {
      const mediaUrls = selectedTask.resultUrls || [];
      
      // 获取每日挑战频道ID
      const channels = await listChannels();
      const challengeChannel = channels.find(c => c.channelKey === 'daily-challenge');

      // 只需要传递taskId，后端会自动从任务中获取prompt、negativePrompt、modelKey、generationParams等字段
      await createPost({
        title: selectedTask.modelName || challenge.title,
        mediaType: 'IMAGE',
        mediaUrls,
        coverUrl: mediaUrls[selectedCoverIndex],
        channelId: challengeChannel?.id,
        challengeId: challenge.id,
        taskId: selectedTask.id, // 传递taskId，后端自动关联查询
      });

      message.success(intl.formatMessage({ id: 'challenge.submitSuccess', defaultMessage: '提交成功！' }));
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('Submit failed:', error);
      message.error(
        error?.response?.data?.message || 
        intl.formatMessage({ id: 'challenge.submitFailed', defaultMessage: '提交失败，请重试' })
      );
    } finally {
      setPublishLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'select') {
      // 切换回选择标签时，重新加载任务列表
      loadUserTasks(currentPage);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadUserTasks(page);
    setSelectedTask(null);
    setSelectedTaskId(null);
  };

  if (isMobile) {
    return (
      <SubmitChallengeMobile 
        open={open} 
        onCancel={onCancel} 
        onSuccess={onSuccess} 
        challenge={challenge} 
      />
    );
  }

  const handleViewTaskDetail = (e, taskId) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发选择
    setViewingTaskId(taskId);
    setTaskDetailModalVisible(true);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}${intl.formatMessage({ id: 'time.minutesAgo', defaultMessage: '分钟前' })}`;
    if (diffHours < 24) return `${diffHours}${intl.formatMessage({ id: 'time.hoursAgo', defaultMessage: '小时前' })}`;
    if (diffDays < 7) return `${diffDays}${intl.formatMessage({ id: 'time.daysAgo', defaultMessage: '天前' })}`;
    return date.toLocaleDateString();
  };

  const tabItems = [
    {
      key: 'select',
      label: (
        <span>
          <AppstoreOutlined />
          <FormattedMessage id="challenge.tab.selectWork" defaultMessage="选择作品" />
        </span>
      ),
      children: (
        <TabContentWrapper>
          <AnimatedContent>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
              </div>
            ) : tasks.length > 0 ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    <FormattedMessage id="challenge.selectWorkHint" defaultMessage="从你的历史作品中选择一个提交到挑战" />
                  </Text>
                </div>
                <TaskGrid>
                  {tasks.map(task => {
                    const coverImage = task.thumbnailUrl || (task.resultUrls && task.resultUrls[0]);
                    return (
                      <TaskCard
                        key={task.id}
                        $isSelected={selectedTaskId === task.id}
                        onClick={() => handleTaskSelect(task)}
                      >
                        {coverImage && (
                          <img src={coverImage} alt={task.modelName} className="task-image" />
                        )}
                        <div className="task-status">
                          <FormattedMessage id="status.completed" defaultMessage="已完成" />
                        </div>
                        {selectedTaskId === task.id && (
                          <CheckIcon>
                            <CheckCircleFilled />
                          </CheckIcon>
                        )}
                        <div 
                          className="task-detail-btn"
                          onClick={(e) => handleViewTaskDetail(e, task.id)}
                          title={intl.formatMessage({ id: 'common.viewDetail', defaultMessage: '查看详情' })}
                        >
                          <EyeOutlined />
                        </div>
                        <div className="task-info">
                          <div className="task-model">{task.modelName || task.modelCode || 'AI Generated'}</div>
                          <div className="task-time">
                            <ClockCircleOutlined style={{ fontSize: '10px' }} />
                            {formatTime(task.createTime)}
                          </div>
                        </div>
                      </TaskCard>
                    );
                  })}
                </TaskGrid>

                {total > pageSize && (
                  <PaginationWrapper>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={total}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showTotal={(total) => intl.formatMessage(
                        { id: 'common.totalItems', defaultMessage: '共 {total} 个作品' },
                        { total }
                      )}
                    />
                  </PaginationWrapper>
                )}

                {selectedTask && selectedTask.resultUrls && selectedTask.resultUrls.length > 1 && (
                  <div style={{ marginTop: '32px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '24px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <SectionLabel>
                          <FormattedMessage id="challenge.selectCover" defaultMessage="选择封面" />
                        </SectionLabel>
                        <CoverScrollContainer>
                          {selectedTask.resultUrls.map((url, index) => (
                            <CoverItem
                              key={index}
                              $isSelected={selectedCoverIndex === index}
                              onClick={() => setSelectedCoverIndex(index)}
                            >
                              <img src={url} alt={`Cover ${index + 1}`} />
                              {selectedCoverIndex === index && (
                                <CheckIcon>
                                  <CheckCircleFilled />
                                </CheckIcon>
                              )}
                            </CoverItem>
                          ))}
                        </CoverScrollContainer>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        paddingTop: '28px', 
                        flexShrink: 0,
                        minWidth: '120px'
                      }}>
                        <Button
                          type="primary"
                          size="large"
                          onClick={handleSubmit}
                          loading={publishLoading}
                          disabled={!selectedTask}
                          style={{ 
                            borderRadius: '12px', 
                            padding: '0 32px', 
                            height: '44px', 
                            fontWeight: 600,
                            fontSize: '15px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            border: 'none',
                            minWidth: '120px',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          {intl.formatMessage({ id: 'common.submit', defaultMessage: '提交' })}
                        </Button>
                        <Button
                          size="large"
                          onClick={onCancel}
                          style={{ 
                            borderRadius: '12px', 
                            height: '44px',
                            padding: '0 24px',
                            minWidth: '120px'
                          }}
                        >
                          {intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyStateContainer>
                <Empty
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        <FormattedMessage id="challenge.noWorks" defaultMessage="还没有可提交的作品" />
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        <FormattedMessage id="challenge.createFirstHint" defaultMessage="切换到【创建作品】标签开始创作！" />
                      </Text>
                    </div>
                  }
                />
              </EmptyStateContainer>
            )}
          </AnimatedContent>
        </TabContentWrapper>
      ),
    },
    {
      key: 'create',
      label: (
        <span>
          <ThunderboltOutlined />
          <FormattedMessage id="challenge.tab.createWork" defaultMessage="创建作品" />
        </span>
      ),
      children: (
        <CreateModeContainer>
          <div className="embedded-creator">
            <TextToImage />
          </div>
        </CreateModeContainer>
      ),
    },
  ];

  return (
    <>
      <ModalGlobalStyle />
      <StyledModal
        className="submit-challenge-modal"
        wrapClassName="submit-challenge-modal-wrap"
        title={null}
        open={open}
        onCancel={onCancel}
        onOk={activeTab === 'select' && (!selectedTask || !selectedTask.resultUrls || selectedTask.resultUrls.length <= 1) ? handleSubmit : undefined}
        confirmLoading={publishLoading}
        width={activeTab === 'create' ? 1400 : 1100}
        centered
        okText={intl.formatMessage({ id: 'common.submit', defaultMessage: '提交' })}
        footer={activeTab === 'create' ? null : (selectedTask && selectedTask.resultUrls && selectedTask.resultUrls.length > 1 ? null : undefined)}
        okButtonProps={activeTab === 'select' && (!selectedTask || !selectedTask.resultUrls || selectedTask.resultUrls.length <= 1) ? {
          disabled: !selectedTask,
          style: { 
            borderRadius: '12px', 
            padding: '0 32px', 
            height: '44px', 
            fontWeight: 600,
            fontSize: '15px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            border: 'none',
            position: 'relative',
            zIndex: 11
          }
        } : undefined}
        cancelButtonProps={{ 
          style: { 
            borderRadius: '12px', 
            height: '44px',
            padding: '0 24px'
          } 
        }}
      >
        {challenge && (
          <TopChallengeContainer>
            <div className="challenge-header">
              <div className="challenge-badge">
                <FormattedMessage id="challenge.currentChallenge" defaultMessage="当前挑战" />
              </div>
              
              <h1 className="challenge-title">{challenge.title}</h1>

              <div className="challenge-meta">
                {challenge.requiredModel && (
                  <div className="meta-item">
                    <ThunderboltOutlined style={{ color: '#fbbf24' }} />
                    <span>
                      <FormattedMessage id="challenge.requiredModel" defaultMessage="要求模型" />: {challenge.requiredModel}
                    </span>
                  </div>
                )}
                <div className="meta-item">
                  <AppstoreOutlined style={{ color: '#60a5fa' }} />
                  <span>Daily Challenge</span>
                </div>
              </div>
            </div>
          </TopChallengeContainer>
        )}

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          style={{ marginTop: '0', paddingBottom: '20px' }}
        />
      </StyledModal>

      <TaskDetailModal
        open={taskDetailModalVisible}
        onClose={() => {
          setTaskDetailModalVisible(false);
          setViewingTaskId(null);
        }}
        taskId={viewingTaskId}
      />
    </>
  );
};

export default SubmitChallengeModal;
