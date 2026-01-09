import React, { useState, useEffect } from 'react';
import { Modal, Empty, Spin, message, Typography, Tag, Button, Tabs, Pagination } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createPost, listChannels } from 'api/community';
import instance from 'api/axios';
import TextToImage from 'pages/Workspace/Create/components/TextToImage';
import TaskDetailModal from 'pages/Workspace/Create/components/TextToImage/TaskDetailModal';

const { Text } = Typography;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MobileContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.mode === 'dark' ? '#000' : '#f5f5f7'};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
  padding: 40px 20px 24px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1d4ed8 0%, #1e1b4b 100%)' 
    : 'linear-gradient(135deg, #3b82f6 0%, #dbeafe 100%)'};
  color: #fff;
  position: relative;
`;

const CloseIcon = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
`;

const ChallengeBadge = styled.div`
  display: inline-flex;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const ChallengeTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 12px 0;
  color: #fff;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
`;

const StyledTabs = styled(Tabs)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .ant-tabs-nav {
    margin: 0 !important;
    background: ${props => props.theme.mode === 'dark' ? '#141416' : '#fff'};
    padding: 0 16px;
    border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#222' : '#eee'};
  }

  .ant-tabs-content-holder {
    flex: 1;
    overflow-y: auto;
  }
`;

const ContentPadding = styled.div`
  padding: 20px 16px;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const TaskCard = styled.div`
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#1c1c1e' : '#fff'};
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid ${props => props.$isSelected ? '#3b82f6' : 'transparent'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  .task-img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  .task-info {
    padding: 8px 10px;
  }

  .task-name {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .view-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
`;

const SelectionOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #3b82f6;
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#86868b' : '#86868b'};
  text-transform: uppercase;
  margin: 24px 0 12px;
`;

const CoverScrollContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 4px 0 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const CoverItem = styled.div`
  flex: 0 0 100px;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 3px solid ${props => props.$isSelected ? '#3b82f6' : 'transparent'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CheckIconMini = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
`;

const Footer = styled.div`
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: ${props => props.theme.mode === 'dark' ? '#1c1c1e' : '#fff'};
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#222' : '#eee'};
  display: flex;
  gap: 12px;
`;

const SubmitButton = styled(Button)`
  flex: 1;
  height: 50px !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
  border: none !important;
  color: #fff !important;

  &:disabled {
    background: #ccc !important;
    opacity: 0.5;
  }
`;

const SubmitChallengeMobile = ({ open, onCancel, onSuccess, challenge }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('select');

  useEffect(() => {
    if (open && activeTab === 'select') {
      loadUserTasks(1);
    }
  }, [open, activeTab]);

  const loadUserTasks = async (page = 1) => {
    setLoading(true);
    try {
      const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', {
        params: { currentPage: page, pageSize: 10, taskType: 't2i' },
      });
      if (response.data.success) {
        setTasks(response.data.data.records.filter(t => t.status === 2));
        setTotal(response.data.data.total);
        setCurrentPage(page);
        // 如果当前选中的任务不再这一页，保持选中状态但重置封面索引是不对的
        // 这里我们简单处理：切换页面时不自动清空选中，但如果选中了新任务会重置封面索引
      }
    } catch (e) {
      message.error(intl.formatMessage({ id: 'challenge.loadFailed', defaultMessage: '加载失败' }));
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setSelectedCoverIndex(0); // 选中新任务时重置封面
  };

  const handleSubmit = async () => {
    if (!selectedTask || publishLoading) return;
    setPublishLoading(true);
    try {
      const channels = await listChannels();
      const channel = channels.find(c => c.channelKey === 'daily-challenge');
      await createPost({
        title: selectedTask.modelName || challenge.title,
        mediaType: 'IMAGE',
        mediaUrls: selectedTask.resultUrls,
        coverUrl: selectedTask.resultUrls[selectedCoverIndex],
        modelKey: selectedTask.modelCode,
        channelId: channel?.id,
        challengeId: challenge.id,
      });
      message.success(intl.formatMessage({ id: 'challenge.submitSuccess' }));
      onSuccess?.();
      onCancel();
    } catch (e) {
      message.error(e.response?.data?.message || 'Submit failed');
    } finally {
      setPublishLoading(false);
    }
  };

  if (!open) return null;

  const tabItems = [
    {
      key: 'select',
      label: (
        <span><AppstoreOutlined /><FormattedMessage id="challenge.tab.selectWork" /></span>
      ),
      children: (
        <ContentPadding>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div>
          ) : tasks.length > 0 ? (
            <>
              <TaskGrid>
                {tasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    $isSelected={selectedTask?.id === task.id}
                    onClick={() => handleTaskSelect(task)}
                  >
                    <img className="task-img" src={task.thumbnailUrl || task.resultUrls[0]} alt="" />
                    <div className="task-info">
                      <div className="task-name">{task.modelName || 'AI Generated'}</div>
                    </div>
                    <div className="view-btn" onClick={(e) => {
                      e.stopPropagation();
                      setViewingTaskId(task.id);
                      setTaskDetailVisible(true);
                    }}>
                      <EyeOutlined />
                    </div>
                    {selectedTask?.id === task.id && (
                      <SelectionOverlay><CheckCircleFilled /></SelectionOverlay>
                    )}
                  </TaskCard>
                ))}
              </TaskGrid>

              {selectedTask && selectedTask.resultUrls && selectedTask.resultUrls.length > 1 && (
                <>
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
                        <img src={url} alt="" />
                        {selectedCoverIndex === index && (
                          <CheckIconMini>
                            <CheckCircleFilled />
                          </CheckIconMini>
                        )}
                      </CoverItem>
                    ))}
                  </CoverScrollContainer>
                </>
              )}

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Pagination 
                  simple 
                  current={currentPage} 
                  total={total} 
                  pageSize={10} 
                  onChange={loadUserTasks} 
                />
              </div>
            </>
          ) : (
            <Empty />
          )}
        </ContentPadding>
      )
    },
    {
      key: 'create',
      label: (
        <span><ThunderboltOutlined /><FormattedMessage id="challenge.tab.createWork" /></span>
      ),
      children: (
        <div style={{ padding: '10px' }}>
          <TextToImage />
        </div>
      )
    }
  ];

  return (
    <MobileContainer>
      <Header>
        <CloseIcon onClick={onCancel}><CloseOutlined /></CloseIcon>
        <ChallengeBadge>
          <FormattedMessage id="challenge.currentChallenge" defaultMessage="当前挑战" />
        </ChallengeBadge>
        <ChallengeTitle>{challenge?.title}</ChallengeTitle>
        <MetaRow>
          {challenge?.requiredModel && (
            <MetaItem>
              <ThunderboltOutlined style={{ color: '#fbbf24' }} />
              {challenge.requiredModel}
            </MetaItem>
          )}
          <MetaItem>Daily Challenge</MetaItem>
        </MetaRow>
      </Header>

      <StyledTabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={tabItems}
        centered
      />

      {activeTab === 'select' && (
        <Footer>
          <SubmitButton 
            disabled={!selectedTask} 
            loading={publishLoading}
            onClick={handleSubmit}
          >
            <FormattedMessage id="common.submit" defaultMessage="提交作品" />
          </SubmitButton>
        </Footer>
      )}

      <TaskDetailModal
        open={taskDetailVisible}
        onClose={() => {
          setTaskDetailVisible(false);
          setViewingTaskId(null);
        }}
        taskId={viewingTaskId}
      />
    </MobileContainer>
  );
};

export default SubmitChallengeMobile;
