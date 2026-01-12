import React, { useEffect, useState } from 'react';
import { Modal, Tabs, Table, Tag, Button, Space, message, Image, Tooltip, Input, Select, Pagination } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, FileImageOutlined, SettingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { 
  getPendingPosts, 
  getMyReviewedPosts, 
  reviewPost, 
  ReviewPost, 
  PostReviewQueryRequest,
  listChannels,
  CommunityChannel 
} from 'api/community';
import PostReviewModal from './PostReviewModal';

const { Search } = Input;
const { Option } = Select;

const StyledModal = styled(Modal)`
  .ant-modal-body {
    padding: 16px;
    max-height: 75vh;
    overflow-y: auto;
  }
`;

const TableContainer = styled.div`
  .status-tag {
    &.pending {
      background: #fff7e6;
      border-color: #ffa940;
      color: #fa8c16;
    }
    &.approved {
      background: #f6ffed;
      border-color: #52c41a;
      color: #52c41a;
    }
    &.rejected {
      background: #fff1f0;
      border-color: #ff4d4f;
      color: #ff4d4f;
    }
  }

  .ant-image {
    border-radius: 4px;
    overflow: hidden;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

interface PostManageModalProps {
  visible: boolean;
  onCancel: () => void;
}

const PostManageModal: React.FC<PostManageModalProps> = ({ visible, onCancel }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingData, setPendingData] = useState<ReviewPost[]>([]);
  const [reviewedData, setReviewedData] = useState<ReviewPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ReviewPost | null>(null);
  
  // 分页状态
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [reviewedPage, setReviewedPage] = useState(1);
  const [reviewedTotal, setReviewedTotal] = useState(0);
  const pageSize = 10;

  // 筛选状态
  const [reviewedStatus, setReviewedStatus] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (visible) {
      loadChannels();
      loadPendingPosts();
    }
  }, [visible, pendingPage, selectedChannelId]);

  useEffect(() => {
    if (visible && activeTab === 'reviewed') {
      loadReviewedPosts();
    }
  }, [visible, activeTab, reviewedPage, reviewedStatus, selectedChannelId]);

  const loadChannels = async () => {
    try {
      const result = await listChannels();
      setChannels(result || []);
    } catch (error) {
      console.error('加载频道列表失败:', error);
    }
  };

  const loadPendingPosts = async () => {
    setLoading(true);
    try {
      const query: PostReviewQueryRequest = {
        currentPage: pendingPage,
        pageSize,
        channelId: selectedChannelId,
      };
      const result = await getPendingPosts(query);
      setPendingData(result.data || []);
      setPendingTotal(result.totalNum || 0);
    } catch (error: any) {
      message.error(error?.response?.data?.message || '加载待审核帖子失败');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewedPosts = async () => {
    setLoading(true);
    try {
      const query: PostReviewQueryRequest = {
        currentPage: reviewedPage,
        pageSize,
        status: reviewedStatus,
        channelId: selectedChannelId,
      };
      const result = await getMyReviewedPosts(query);
      setReviewedData(result.data || []);
      setReviewedTotal(result.totalNum || 0);
    } catch (error: any) {
      message.error(error?.response?.data?.message || '加载审核记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (post: ReviewPost) => {
    setSelectedPost(post);
    setReviewModalVisible(true);
  };

  const handleReviewSuccess = () => {
    setReviewModalVisible(false);
    setSelectedPost(null);
    loadPendingPosts();
    message.success('审核成功');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'reviewed') {
      loadReviewedPosts();
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag className="status-tag pending">待审核</Tag>;
      case 1:
        return <Tag className="status-tag approved">已通过</Tag>;
      case 9:
        return <Tag className="status-tag rejected">已拒绝</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const pendingColumns = [
    {
      title: '封面',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      width: 100,
      render: (coverUrl: string, record: ReviewPost) => {
        const imgUrl = coverUrl || record.mediaUrls?.[0];
        return imgUrl ? (
          <Image
            src={imgUrl}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={{ mask: <EyeOutlined /> }}
          />
        ) : (
          <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileImageOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
          </div>
        );
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: { showTitle: false },
      render: (title: string) => (
        <Tooltip title={title || '无标题'}>
          {title || <span style={{ color: '#bfbfbf' }}>无标题</span>}
        </Tooltip>
      ),
    },
    {
      title: '作者',
      dataIndex: 'userNickname',
      key: 'userNickname',
      width: 120,
      render: (nickname: string) => nickname || '未知用户',
    },
    {
      title: '频道',
      dataIndex: ['channel', 'name'],
      key: 'channelName',
      width: 120,
      render: (name: string) => name ? <Tag color="blue">{name}</Tag> : <span style={{ color: '#bfbfbf' }}>通用</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ReviewPost) => (
        <Button
          type="primary"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => handleReview(record)}
          style={{ borderRadius: 16 }}
        >
          审核
        </Button>
      ),
    },
  ];

  const reviewedColumns = [
    {
      title: '封面',
      dataIndex: 'coverUrl',
      key: 'coverUrl',
      width: 100,
      render: (coverUrl: string, record: ReviewPost) => {
        const imgUrl = coverUrl || record.mediaUrls?.[0];
        return imgUrl ? (
          <Image
            src={imgUrl}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={{ mask: <EyeOutlined /> }}
          />
        ) : (
          <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileImageOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
          </div>
        );
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: { showTitle: false },
      render: (title: string) => (
        <Tooltip title={title || '无标题'}>
          {title || <span style={{ color: '#bfbfbf' }}>无标题</span>}
        </Tooltip>
      ),
    },
    {
      title: '作者',
      dataIndex: 'userNickname',
      key: 'userNickname',
      width: 120,
      render: (nickname: string) => nickname || '未知用户',
    },
    {
      title: '频道',
      dataIndex: ['channel', 'name'],
      key: 'channelName',
      width: 120,
      render: (name: string) => name ? <Tag color="blue">{name}</Tag> : <span style={{ color: '#bfbfbf' }}>通用</span>,
    },
    {
      title: '审核结果',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: '审核意见',
      dataIndex: 'reviewComment',
      key: 'reviewComment',
      ellipsis: { showTitle: false },
      render: (comment: string) => (
        <Tooltip title={comment || '无'}>
          {comment || <span style={{ color: '#bfbfbf' }}>无</span>}
        </Tooltip>
      ),
    },
    {
      title: '审核时间',
      dataIndex: 'reviewTime',
      key: 'reviewTime',
      width: 150,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ReviewPost) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleReview(record)}
          style={{ borderRadius: 16 }}
        >
          查看
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span>
          <CloseCircleOutlined />
          待审核 ({pendingTotal})
        </span>
      ),
      children: (
        <TableContainer>
          <FilterBar>
            <Select
              placeholder="按频道筛选"
              style={{ width: 180 }}
              allowClear
              value={selectedChannelId}
              onChange={(value) => {
                setSelectedChannelId(value);
                setPendingPage(1);
              }}
            >
              {channels.map(channel => (
                <Option key={channel.id} value={channel.id}>{channel.name}</Option>
              ))}
            </Select>
          </FilterBar>
          <Table
            dataSource={pendingData}
            columns={pendingColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
          />
          {pendingTotal > 0 && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={pendingPage}
                pageSize={pageSize}
                total={pendingTotal}
                onChange={(page) => setPendingPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          )}
        </TableContainer>
      ),
    },
    {
      key: 'reviewed',
      label: (
        <span>
          <CheckCircleOutlined />
          我的审核记录
        </span>
      ),
      children: (
        <TableContainer>
          <FilterBar>
            <Select
              placeholder="按频道筛选"
              style={{ width: 180 }}
              allowClear
              value={selectedChannelId}
              onChange={(value) => {
                setSelectedChannelId(value);
                setReviewedPage(1);
              }}
            >
              {channels.map(channel => (
                <Option key={channel.id} value={channel.id}>{channel.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="审核结果"
              style={{ width: 150 }}
              allowClear
              value={reviewedStatus}
              onChange={(value) => {
                setReviewedStatus(value);
                setReviewedPage(1);
              }}
            >
              <Option value={1}>已通过</Option>
              <Option value={9}>已拒绝</Option>
            </Select>
          </FilterBar>
          <Table
            dataSource={reviewedData}
            columns={reviewedColumns}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
          />
          {reviewedTotal > 0 && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={reviewedPage}
                pageSize={pageSize}
                total={reviewedTotal}
                onChange={(page) => setReviewedPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          )}
        </TableContainer>
      ),
    },
  ];

  return (
    <>
      <StyledModal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SettingOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span>帖子管理</span>
          </div>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={1000}
        centered
        destroyOnClose
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={tabItems}
        />
      </StyledModal>

      {/* 审核模态框 */}
      <PostReviewModal
        visible={reviewModalVisible}
        post={selectedPost}
        onCancel={() => {
          setReviewModalVisible(false);
          setSelectedPost(null);
        }}
        onSuccess={handleReviewSuccess}
      />
    </>
  );
};

export default PostManageModal;

