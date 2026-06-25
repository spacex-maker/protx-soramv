import React, { useEffect, useState } from 'react';
import { Modal, Tag, Button, message, Popconfirm, Empty, Pagination, Card, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, RollbackOutlined, EyeOutlined, CrownOutlined } from '@ant-design/icons';
import { getMyApplications, withdrawApplication, RoleApplication } from 'api/community';
import dayjs from 'dayjs';
import styled, { keyframes } from 'styled-components';
import { communityModalMobileCss } from './communityModalStyled';
import { useCommunityModalProps } from './useCommunityModalProps';

const fadeIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const StyledModal = styled(Modal)`
  ${communityModalMobileCss}

  .ant-modal-body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)'};
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.2)'};
      border-radius: 3px;
      
      &:hover {
        background: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(0, 0, 0, 0.3)'};
      }
    }
  }
`;

const ApplicationCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 16px;
  animation: ${fadeIn} 0.3s ease-out;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.06)'};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : '#ffffff'};
  
  &:hover {
    box-shadow: 0 4px 12px ${props => props.theme.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.08)'};
    border-color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.12)'};
  }
  
  .ant-card-body {
    padding: 20px;
  }
`;

const RoleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  .role-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    
    .role-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      background: ${props => props.theme.mode === 'dark' 
        ? 'rgba(24, 144, 255, 0.2)' 
        : 'rgba(24, 144, 255, 0.1)'};
      color: #1890ff;
    }
    
    .role-details {
      flex: 1;
      
      .role-name {
        font-size: 18px;
        font-weight: 600;
        color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
        margin-bottom: 4px;
      }
      
      .role-code {
        font-size: 13px;
        color: ${props => props.theme.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.45)' 
          : 'rgba(0, 0, 0, 0.45)'};
        font-family: 'Monaco', 'Consolas', monospace;
      }
    }
  }
`;

const ApplicationInfo = styled.div`
  .info-item {
    margin-bottom: 12px;
    
    .label {
      font-size: 12px;
      color: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.45)' 
        : 'rgba(0, 0, 0, 0.45)'};
      margin-bottom: 4px;
    }
    
    .content {
      font-size: 14px;
      color: ${props => props.theme.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.85)' 
        : 'rgba(0, 0, 0, 0.85)'};
      line-height: 1.6;
    }
    
    &.reason {
      .content {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`;

const TimelineInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.06)'};
  margin-top: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .time-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.65)' 
      : 'rgba(0, 0, 0, 0.65)'};
    
    .icon {
      font-size: 14px;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.06)'};
`;

const StyledPagination = styled(Pagination)`
  margin-top: 24px;
  text-align: center;
`;

const DetailModal = styled(Modal)`
  ${communityModalMobileCss}

  .detail-section {
    margin-bottom: 20px;
    
    .label {
      font-size: 14px;
      font-weight: 600;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)'};
      margin-bottom: 8px;
    }
    
    .content {
      font-size: 14px;
      color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'};
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
`;

interface MyApplicationsModalProps {
  visible: boolean;
  onCancel: () => void;
}

const MyApplicationsModal: React.FC<MyApplicationsModalProps> = ({
  visible,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<RoleApplication | null>(null);
  const { isMobile, ...listModalProps } = useCommunityModalProps(700);
  const { isMobile: isDetailMobile, ...detailModalRest } = useCommunityModalProps(600);

  useEffect(() => {
    if (visible) {
      loadApplications();
    }
  }, [visible, currentPage, pageSize]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await getMyApplications({
        currentPage,
        pageSize,
      });
      setApplications(response.data || []);
      setTotal(response.totalNum || 0);
    } catch (error: any) {
      message.error(error?.response?.data?.message || '获取申请记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    try {
      await withdrawApplication(id);
      message.success('撤回成功');
      loadApplications();
    } catch (error: any) {
      message.error(error?.response?.data?.message || '撤回失败');
    }
  };

  const handleViewDetail = (record: RoleApplication) => {
    setSelectedApplication(record);
    setDetailVisible(true);
  };

  const getStatusTag = (status: number) => {
    const statusConfig: Record<number, { color: string; text: string; icon: React.ReactNode }> = {
      0: { color: 'processing', text: '待审核', icon: <ClockCircleOutlined /> },
      1: { color: 'success', text: '审核通过', icon: <CheckCircleOutlined /> },
      2: { color: 'error', text: '审核拒绝', icon: <CloseCircleOutlined /> },
      3: { color: 'default', text: '已撤回', icon: <RollbackOutlined /> },
    };
    const config = statusConfig[status] || { color: 'default', text: '未知', icon: null };
    return (
      <Tag color={config.color} icon={config.icon} style={{ fontSize: 13, padding: '4px 12px' }}>
        {config.text}
      </Tag>
    );
  };

  return (
    <>
      <StyledModal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CrownOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span>我的申请记录</span>
          </div>
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
        {...listModalProps}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <ClockCircleOutlined spin style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div>加载中...</div>
          </div>
        ) : applications.length === 0 ? (
          <Empty
            description="暂无申请记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '60px 0' }}
          >
            <Button type="primary" onClick={onCancel}>
              去申请角色
            </Button>
          </Empty>
        ) : (
          <>
            {applications.map((app) => (
              <ApplicationCard key={app.id} hoverable>
                <RoleHeader>
                  <div className="role-info">
                    <div className="role-icon">
                      <CrownOutlined />
                    </div>
                    <div className="role-details">
                      <div className="role-name">{app.roleName}</div>
                      <div className="role-code">{app.roleCode}</div>
                    </div>
                  </div>
                  {getStatusTag(app.status)}
                </RoleHeader>

                <ApplicationInfo>
                  <div className="info-item reason">
                    <div className="label">申请理由</div>
                    <div className="content">{app.applyReason}</div>
                  </div>

                  {app.reviewComment && (
                    <div className="info-item">
                      <div className="label">审核意见</div>
                      <div className="content">{app.reviewComment}</div>
                    </div>
                  )}
                </ApplicationInfo>

                <TimelineInfo>
                  <div className="time-item">
                    <ClockCircleOutlined className="icon" />
                    <span>申请于 {dayjs(app.createTime).format('MM-DD HH:mm')}</span>
                  </div>
                  {app.reviewTime && (
                    <div className="time-item">
                      <CheckCircleOutlined className="icon" />
                      <span>审核于 {dayjs(app.reviewTime).format('MM-DD HH:mm')}</span>
                    </div>
                  )}
                </TimelineInfo>

                <ActionButtons>
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(app)}
                    block
                  >
                    查看详情
                  </Button>
                  {app.canWithdraw && (
                    <Popconfirm
                      title="确认撤回申请？"
                      description="撤回后将无法恢复，需要重新申请"
                      onConfirm={() => handleWithdraw(app.id)}
                      okText="确认撤回"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        danger
                        icon={<RollbackOutlined />}
                        block
                      >
                        撤回申请
                      </Button>
                    </Popconfirm>
                  )}
                </ActionButtons>
              </ApplicationCard>
            ))}

            {total > pageSize && (
              <StyledPagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条申请`}
              />
            )}
          </>
        )}
      </StyledModal>

      {/* 申请详情模态框 */}
      <DetailModal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EyeOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span>申请详情</span>
          </div>
        }
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedApplication(null);
        }}
        footer={
          selectedApplication?.canWithdraw ? (
            <Space direction={isDetailMobile ? 'vertical' : 'horizontal'} style={{ width: isDetailMobile ? '100%' : undefined }}>
              <Button
                onClick={() => {
                  setDetailVisible(false);
                  setSelectedApplication(null);
                }}
                block={isDetailMobile}
              >
                关闭
              </Button>
              <Popconfirm
                title="确认撤回申请？"
                description="撤回后将无法恢复，需要重新申请"
                onConfirm={() => {
                  handleWithdraw(selectedApplication.id);
                  setDetailVisible(false);
                  setSelectedApplication(null);
                }}
                okText="确认撤回"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<RollbackOutlined />} block={isDetailMobile}>
                  撤回申请
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Button
              type="primary"
              block={isDetailMobile}
              onClick={() => {
                setDetailVisible(false);
                setSelectedApplication(null);
              }}
            >
              关闭
            </Button>
          )
        }
        {...detailModalRest}
      >
        {selectedApplication && (
          <div>
            {/* 角色信息卡片 */}
            <div style={{
              padding: 20,
              background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05))',
              borderRadius: 12,
              marginBottom: 24,
              border: '1px solid rgba(24, 144, 255, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'rgba(24, 144, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: '#1890ff',
                }}>
                  <CrownOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
                    {selectedApplication.roleName}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.65, fontFamily: 'Monaco, Consolas, monospace' }}>
                    {selectedApplication.roleCode}
                  </div>
                </div>
                {getStatusTag(selectedApplication.status)}
              </div>
            </div>

            <div className="detail-section">
              <div className="label">📝 申请理由</div>
              <div className="content">{selectedApplication.applyReason}</div>
            </div>

            {selectedApplication.experienceDescription && (
              <div className="detail-section">
                <div className="label">💼 相关经验</div>
                <div className="content">{selectedApplication.experienceDescription}</div>
              </div>
            )}

            {selectedApplication.contactInfo && (
              <div className="detail-section">
                <div className="label">📞 联系方式</div>
                <div className="content">{selectedApplication.contactInfo}</div>
              </div>
            )}

            <Divider />

            <div style={{
              display: 'grid',
              gridTemplateColumns: isDetailMobile ? '1fr' : '1fr 1fr',
              gap: 16,
              padding: '16px 0',
            }}>
              <div className="detail-section" style={{ marginBottom: 0 }}>
                <div className="label">⏰ 申请时间</div>
                <div className="content">
                  {dayjs(selectedApplication.createTime).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>

              {selectedApplication.reviewTime && (
                <div className="detail-section" style={{ marginBottom: 0 }}>
                  <div className="label">✅ 审核时间</div>
                  <div className="content">
                    {dayjs(selectedApplication.reviewTime).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                </div>
              )}
            </div>

            {selectedApplication.reviewComment && (
              <>
                <Divider />
                <div className="detail-section" style={{ marginBottom: 0 }}>
                  <div className="label">💬 审核意见</div>
                  <div className="content" style={{
                    padding: 12,
                    background: 'rgba(24, 144, 255, 0.05)',
                    borderRadius: 8,
                    border: '1px solid rgba(24, 144, 255, 0.1)',
                  }}>
                    {selectedApplication.reviewComment}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DetailModal>
    </>
  );
};

export default MyApplicationsModal;

