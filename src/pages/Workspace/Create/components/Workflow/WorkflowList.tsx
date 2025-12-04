import React, { useState, useEffect, useCallback } from 'react';
import { Card, List, Button, Space, Input, message, Modal, Tag, Empty, Spin } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined, 
  EyeOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { base } from '../../../../../api/base';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const ListContainer = styled.div`
  padding: 24px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'};
  min-height: 600px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
  
  .ant-card-body {
    padding: 20px;
  }
`;

const WorkflowTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WorkflowMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  font-size: 14px;
`;

const ActionButtons = styled(Space)`
  margin-top: 16px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const EmptyContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
`;

interface WorkflowItem {
  id: number;
  name: string;
  description?: string;
  status: number;
  runCount: number;
  likeCount: number;
  forkCount: number;
  createTime: string;
  updateTime: string;
  coverUrl?: string;
}

const WorkflowList: React.FC<{ onSelectWorkflow?: (id: number) => void; onCreateNew?: () => void }> = ({ 
  onSelectWorkflow,
  onCreateNew 
}) => {
  const intl = useIntl();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载工作流列表
  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base.getMyWorkflowList({
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        keyword: keyword || undefined,
      });

      if (response.success && response.data) {
        // 后端返回的数据结构是 { data: [...], totalNum: ... }
        const list = response.data.data || response.data.list || [];
        const total = response.data.totalNum || response.data.total || 0;
        
        console.log('工作流列表数据:', { list, total, fullResponse: response });
        
        setWorkflows(list);
        setPagination(prev => ({
          ...prev,
          total: total,
        }));
      } else {
        message.error(response.message || '获取工作流列表失败');
      }
    } catch (error) {
      console.error('获取工作流列表失败:', error);
      message.error('获取工作流列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, keyword]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // 删除工作流
  const handleDelete = useCallback((id: number, name: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工作流"${name}"吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await base.deleteWorkflow(id);
          if (response.success) {
            message.success('删除成功');
            loadWorkflows();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除工作流失败:', error);
          message.error('删除工作流失败');
        }
      },
    });
  }, [loadWorkflows]);

  // 运行工作流
  const handleRun = useCallback(async (id: number) => {
    try {
      const response = await base.runWorkflow(id, {});
      if (response.success) {
        message.success('工作流运行成功');
      } else {
        message.error(response.message || '运行失败');
      }
    } catch (error) {
      console.error('运行工作流失败:', error);
      message.error('运行工作流失败');
    }
  }, []);

  // 获取状态标签
  const getStatusTag = (status: number) => {
    const statusMap = {
      1: { text: '草稿', color: 'default' },
      2: { text: '已发布', color: 'success' },
      3: { text: '已下架', color: 'warning' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[1];
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // 格式化时间
  const formatTime = (time: string) => {
    if (!time) return '-';
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ListContainer>
      <Header>
        <Search
          placeholder="搜索工作流名称或描述"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          style={{ maxWidth: 400, width: '100%' }}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          onSearch={() => loadWorkflows()}
        />
        {onCreateNew && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={onCreateNew}
          >
            <FormattedMessage id="workflow.createNew" defaultMessage="新建工作流" />
          </Button>
        )}
      </Header>

      <Spin spinning={loading}>
        {workflows.length === 0 ? (
          <EmptyContainer>
            <Empty
              description={
                <span style={{ color: '#999' }}>
                  {keyword ? '没有找到匹配的工作流' : '还没有工作流，点击"新建工作流"开始创建'}
                </span>
              }
            />
          </EmptyContainer>
        ) : (
          <List
            dataSource={workflows}
            rowKey={(item) => item.id || `workflow-${item.name}-${item.createTime || Date.now()}`}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 个工作流`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
              },
            }}
            renderItem={(item) => (
              <List.Item>
                <StyledCard
                  onClick={() => onSelectWorkflow && onSelectWorkflow(item.id)}
                  style={{ width: '100%' }}
                >
                  <WorkflowTitle>
                    {item.name}
                    {getStatusTag(item.status)}
                  </WorkflowTitle>
                  
                  {item.description && (
                    <div style={{ 
                      color: '#666', 
                      marginTop: 8, 
                      marginBottom: 12,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.description}
                    </div>
                  )}

                  <WorkflowMeta>
                    <span>运行次数: {item.runCount || 0}</span>
                    <span>点赞: {item.likeCount || 0}</span>
                    <span>引用: {item.forkCount || 0}</span>
                    <span>创建时间: {formatTime(item.createTime)}</span>
                    <span>更新时间: {formatTime(item.updateTime)}</span>
                  </WorkflowMeta>

                  <ActionButtons>
                    <Button
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWorkflow && onSelectWorkflow(item.id);
                      }}
                    >
                      <FormattedMessage id="workflow.edit" defaultMessage="编辑" />
                    </Button>
                    <Button
                      icon={<PlayCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRun(item.id);
                      }}
                    >
                      <FormattedMessage id="workflow.run" defaultMessage="运行" />
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id, item.name);
                      }}
                    >
                      <FormattedMessage id="workflow.delete" defaultMessage="删除" />
                    </Button>
                  </ActionButtons>
                </StyledCard>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </ListContainer>
  );
};

export default WorkflowList;

