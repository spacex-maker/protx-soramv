import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Tag, Button, message, Popconfirm, Empty, Pagination, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RollbackOutlined,
  EyeOutlined,
  CrownOutlined,
  FileTextOutlined,
  TrophyOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CommentOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { getMyApplications, withdrawApplication, RoleApplication } from 'api/community';
import dayjs from 'dayjs';
import styled, { keyframes, css } from 'styled-components';
import { communityModalMobileCss } from './communityModalStyled';
import { useCommunityModalProps } from './useCommunityModalProps';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PRIMARY = '#3b82f6';

const modalBodyScroll = css`
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
    border-radius: 3px;
  }
`;

const StyledModal = styled(Modal)`
  ${communityModalMobileCss}

  .ant-modal-body {
    padding: 0;
    max-height: 70vh;
    overflow-y: auto;
    ${modalBodyScroll}
  }
`;

const DetailModal = styled(Modal)`
  ${communityModalMobileCss}

  .ant-modal-body {
    padding: 0;
    max-height: 70vh;
    overflow-y: auto;
    ${modalBodyScroll}
  }
`;

const ModalInner = styled.div`
  padding: 20px 24px;

  @media (max-width: 768px) {
    padding: 12px 14px;
  }
`;

const ListHeader = styled.div`
  margin-bottom: 16px;

  .header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .title-block {
    .eyebrow {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: ${PRIMARY};
      margin-bottom: 4px;
    }

    .title {
      font-size: 15px;
      font-weight: 600;
      color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#111827')};
      line-height: 1.4;
    }

    .subtitle {
      font-size: 13px;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
      margin-top: 4px;
    }
  }

  .stat-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const StatChip = styled.div<{ $active?: boolean; $tone?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid
    ${(p) =>
      p.$active
        ? PRIMARY
        : p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(0,0,0,0.08)'};
  background: ${(p) =>
    p.$active
      ? p.theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(59, 130, 246, 0.08)'
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.04)'
        : '#f9fafb'};
  color: ${(p) =>
    p.$active
      ? PRIMARY
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.75)'
        : 'rgba(0,0,0,0.65)'};

  .count {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  ${(p) =>
    p.$tone &&
    css`
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${p.$tone};
      }
    `}
`;

const ApplicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ApplicationItem = styled.div<{ $status: number }>`
  position: relative;
  border-radius: 14px;
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff')};
  overflow: hidden;
  animation: ${fadeIn} 0.35s ease-out;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${(p) => {
      switch (p.$status) {
        case 0:
          return PRIMARY;
        case 1:
          return '#22c55e';
        case 2:
          return '#ef4444';
        case 3:
          return '#9ca3af';
        default:
          return PRIMARY;
      }
    }};
  }

  &:hover {
    border-color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.25)'};
    box-shadow: ${(p) =>
      p.theme.mode === 'dark'
        ? '0 4px 20px rgba(0,0,0,0.25)'
        : '0 4px 16px rgba(59,130,246,0.08)'};
    transform: translateY(-1px);
  }

  .item-body {
    padding: 14px 14px 14px 18px;
  }

  .item-head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 10px;
  }

  .role-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: ${PRIMARY};
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.1)'};
  }

  .role-meta {
    flex: 1;
    min-width: 0;

    .role-name {
      font-size: 15px;
      font-weight: 600;
      color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#111827')};
      line-height: 1.35;
      margin-bottom: 2px;
    }

    .role-code {
      font-size: 12px;
      font-family: ui-monospace, 'Cascadia Code', monospace;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'};
    }
  }

  .reason-box {
    padding: 10px 12px;
    border-radius: 8px;
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f3f4f6'};
    margin-bottom: 10px;

    .reason-label {
      font-size: 11px;
      font-weight: 600;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .reason-text {
      font-size: 13px;
      line-height: 1.55;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.72)'};
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .time-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 12px;
    color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  .item-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .item-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .item-actions {
      width: 100%;

      .ant-btn {
        flex: 1;
      }
    }
  }
`;

const StatusTag = styled(Tag)`
  border-radius: 6px;
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  margin: 0;
  flex-shrink: 0;
`;

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  gap: 12px;
  color: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'};
`;

const EmptyWrap = styled.div`
  padding: 40px 16px;
  text-align: center;
`;

const PaginationWrap = styled.div`
  padding: 16px 0 4px;
  display: flex;
  justify-content: center;

  .ant-pagination {
    font-size: 13px;
  }
`;

const DetailHero = styled.div<{ $status: number }>`
  padding: 20px 24px;
  background: ${(p) => {
    const dark = p.theme.mode === 'dark';
    switch (p.$status) {
      case 0:
        return dark
          ? 'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(59,130,246,0.06))'
          : 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))';
      case 1:
        return dark
          ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))'
          : 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))';
      case 2:
        return dark
          ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))';
      default:
        return dark ? 'rgba(255,255,255,0.04)' : '#f9fafb';
    }
  }};
  border-bottom: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};

  .hero-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .hero-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: ${PRIMARY};
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.12)'};
    flex-shrink: 0;
  }

  .hero-info {
    flex: 1;
    min-width: 0;

    .hero-name {
      font-size: 18px;
      font-weight: 700;
      color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#111827')};
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .hero-code {
      font-size: 12px;
      font-family: ui-monospace, monospace;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
    }
  }

  @media (max-width: 768px) {
    padding: 16px 14px;
  }
`;

const DetailBody = styled.div`
  padding: 20px 24px;

  @media (max-width: 768px) {
    padding: 14px;
  }
`;

const InfoBlock = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .block-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
    margin-bottom: 8px;

    .anticon {
      font-size: 13px;
      color: ${PRIMARY};
    }
  }

  .block-content {
    font-size: 14px;
    line-height: 1.7;
    color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.82)'};
    white-space: pre-wrap;
    word-break: break-word;
  }

  &.highlight .block-content {
    padding: 12px 14px;
    border-radius: 10px;
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.06)'};
    border: 1px solid
      ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'};
  }

  &.reject .block-content {
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)'};
    border: 1px solid
      ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)'};
    padding: 12px 14px;
    border-radius: 10px;
  }
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f9fafb'};
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .time-cell {
    .cell-label {
      font-size: 11px;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'};
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cell-value {
      font-size: 13px;
      font-weight: 500;
      color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#111827')};
      font-variant-numeric: tabular-nums;
    }
  }
`;

const ModalTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.12);
    color: ${PRIMARY};
    font-size: 16px;
  }

  .text {
    font-size: 16px;
    font-weight: 600;
  }
`;

interface MyApplicationsModalProps {
  visible: boolean;
  onCancel: () => void;
}

const STATUS_CONFIG: Record<
  number,
  { color: string; text: string; icon: React.ReactNode; tone: string }
> = {
  0: { color: 'processing', text: '待审核', icon: <ClockCircleOutlined />, tone: PRIMARY },
  1: { color: 'success', text: '审核通过', icon: <CheckCircleOutlined />, tone: '#22c55e' },
  2: { color: 'error', text: '审核拒绝', icon: <CloseCircleOutlined />, tone: '#ef4444' },
  3: { color: 'default', text: '已撤回', icon: <RollbackOutlined />, tone: '#9ca3af' },
};

const MyApplicationsModal: React.FC<MyApplicationsModalProps> = ({ visible, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<RoleApplication | null>(null);
  const { isMobile, ...listModalProps } = useCommunityModalProps(720);
  const { isMobile: isDetailMobile, ...detailModalRest } = useCommunityModalProps(640);

  useEffect(() => {
    if (visible) {
      loadApplications();
    }
  }, [visible, currentPage, pageSize]);

  const statusStats = useMemo(() => {
    const stats = { pending: 0, approved: 0, rejected: 0, withdrawn: 0 };
    applications.forEach((app) => {
      if (app.status === 0) stats.pending += 1;
      else if (app.status === 1) stats.approved += 1;
      else if (app.status === 2) stats.rejected += 1;
      else if (app.status === 3) stats.withdrawn += 1;
    });
    return stats;
  }, [applications]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await getMyApplications({ currentPage, pageSize });
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

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedApplication(null);
  };

  const renderStatusTag = (status: number) => {
    const config = STATUS_CONFIG[status] || {
      color: 'default',
      text: '未知',
      icon: null,
      tone: PRIMARY,
    };
    return (
      <StatusTag color={config.color} icon={config.icon}>
        {config.text}
      </StatusTag>
    );
  };

  const listTitle = (
    <ModalTitleRow>
      <div className="icon-wrap">
        <FileTextOutlined />
      </div>
      <span className="text">我的申请记录</span>
    </ModalTitleRow>
  );

  const detailTitle = (
    <ModalTitleRow>
      <Button
        type="text"
        size="small"
        icon={<ArrowLeftOutlined />}
        onClick={closeDetail}
        style={{ marginRight: 4, marginLeft: -8 }}
      />
      <div className="icon-wrap">
        <EyeOutlined />
      </div>
      <span className="text">申请详情</span>
    </ModalTitleRow>
  );

  return (
    <>
      <StyledModal
        title={listTitle}
        open={visible && !detailVisible}
        onCancel={onCancel}
        footer={null}
        destroyOnClose
        {...listModalProps}
      >
        <ModalInner>
          {loading ? (
            <LoadingWrap>
              <Spin size="large" />
              <span>加载申请记录...</span>
            </LoadingWrap>
          ) : applications.length === 0 ? (
            <EmptyWrap>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>暂无申请记录</div>
                    <div style={{ fontSize: 13, opacity: 0.65 }}>提交角色申请后，可在此查看审核进度</div>
                  </div>
                }
              >
                <Button type="primary" onClick={onCancel} style={{ marginTop: 8 }}>
                  去申请角色
                </Button>
              </Empty>
            </EmptyWrap>
          ) : (
            <>
              <ListHeader>
                <div className="header-top">
                  <div className="title-block">
                    <div className="eyebrow">APPLICATION HISTORY</div>
                    <div className="title">共 {total} 条申请</div>
                    <div className="subtitle">点击卡片可查看完整申请内容</div>
                  </div>
                </div>
                <div className="stat-row">
                  <StatChip $tone={PRIMARY}>
                    <span className="dot" />
                    待审核 <span className="count">{statusStats.pending}</span>
                  </StatChip>
                  <StatChip $tone="#22c55e">
                    <span className="dot" />
                    已通过 <span className="count">{statusStats.approved}</span>
                  </StatChip>
                  <StatChip $tone="#ef4444">
                    <span className="dot" />
                    已拒绝 <span className="count">{statusStats.rejected}</span>
                  </StatChip>
                  {statusStats.withdrawn > 0 && (
                    <StatChip $tone="#9ca3af">
                      <span className="dot" />
                      已撤回 <span className="count">{statusStats.withdrawn}</span>
                    </StatChip>
                  )}
                </div>
              </ListHeader>

              <ApplicationList>
                {applications.map((app) => (
                  <ApplicationItem
                    key={app.id}
                    $status={app.status}
                    onClick={() => handleViewDetail(app)}
                  >
                    <div className="item-body">
                      <div className="item-head">
                        <div className="role-icon">
                          <CrownOutlined />
                        </div>
                        <div className="role-meta">
                          <div className="role-name">{app.roleName}</div>
                          <div className="role-code">{app.roleCode}</div>
                        </div>
                        {renderStatusTag(app.status)}
                      </div>

                      <div className="reason-box">
                        <div className="reason-label">
                          <FileTextOutlined /> 申请理由
                        </div>
                        <div className="reason-text">{app.applyReason}</div>
                      </div>

                      {app.reviewComment && app.status !== 0 && (
                        <div className="reason-box" style={{ marginBottom: 10 }}>
                          <div className="reason-label">
                            <CommentOutlined /> 审核意见
                          </div>
                          <div className="reason-text">{app.reviewComment}</div>
                        </div>
                      )}

                      <div className="item-footer">
                        <div className="time-meta">
                          <span>
                            <CalendarOutlined />
                            {dayjs(app.createTime).format('YYYY-MM-DD HH:mm')}
                          </span>
                          {app.reviewTime && (
                            <span>
                              <CheckCircleOutlined />
                              审核 {dayjs(app.reviewTime).format('MM-DD HH:mm')}
                            </span>
                          )}
                        </div>
                        <div
                          className="item-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(app)}
                          >
                            详情
                          </Button>
                          {app.canWithdraw && (
                            <Popconfirm
                              title="确认撤回申请？"
                              description="撤回后需重新提交申请"
                              onConfirm={() => handleWithdraw(app.id)}
                              okText="确认撤回"
                              cancelText="取消"
                              okButtonProps={{ danger: true }}
                            >
                              <Button danger size="small" icon={<RollbackOutlined />}>
                                撤回
                              </Button>
                            </Popconfirm>
                          )}
                        </div>
                      </div>
                    </div>
                  </ApplicationItem>
                ))}
              </ApplicationList>

              {total > pageSize && (
                <PaginationWrap>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    showTotal={(n) => `共 ${n} 条`}
                    size={isMobile ? 'small' : 'default'}
                  />
                </PaginationWrap>
              )}
            </>
          )}
        </ModalInner>
      </StyledModal>

      <DetailModal
        title={detailTitle}
        open={detailVisible}
        onCancel={closeDetail}
        destroyOnClose
        footer={
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexDirection: isDetailMobile ? 'column' : 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Button onClick={closeDetail} block={isDetailMobile}>
              返回列表
            </Button>
            {selectedApplication?.canWithdraw && (
              <Popconfirm
                title="确认撤回申请？"
                description="撤回后需重新提交申请"
                onConfirm={() => {
                  handleWithdraw(selectedApplication.id);
                  closeDetail();
                }}
                okText="确认撤回"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<RollbackOutlined />} block={isDetailMobile}>
                  撤回申请
                </Button>
              </Popconfirm>
            )}
          </div>
        }
        {...detailModalRest}
      >
        {selectedApplication && (
          <>
            <DetailHero $status={selectedApplication.status}>
              <div className="hero-row">
                <div className="hero-icon">
                  <CrownOutlined />
                </div>
                <div className="hero-info">
                  <div className="hero-name">{selectedApplication.roleName}</div>
                  <div className="hero-code">{selectedApplication.roleCode}</div>
                </div>
                {renderStatusTag(selectedApplication.status)}
              </div>
            </DetailHero>

            <DetailBody>
              <InfoBlock className="highlight">
                <div className="block-label">
                  <FileTextOutlined /> 申请理由
                </div>
                <div className="block-content">{selectedApplication.applyReason}</div>
              </InfoBlock>

              {selectedApplication.experienceDescription && (
                <InfoBlock>
                  <div className="block-label">
                    <TrophyOutlined /> 相关经验
                  </div>
                  <div className="block-content">
                    {selectedApplication.experienceDescription}
                  </div>
                </InfoBlock>
              )}

              {selectedApplication.contactInfo && (
                <InfoBlock>
                  <div className="block-label">
                    <PhoneOutlined /> 联系方式
                  </div>
                  <div className="block-content">{selectedApplication.contactInfo}</div>
                </InfoBlock>
              )}

              <InfoBlock style={{ marginBottom: 16 }}>
                <div className="block-label">
                  <CalendarOutlined /> 时间信息
                </div>
                <TimeGrid>
                  <div className="time-cell">
                    <div className="cell-label">
                      <ClockCircleOutlined /> 申请时间
                    </div>
                    <div className="cell-value">
                      {dayjs(selectedApplication.createTime).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                  </div>
                  {selectedApplication.reviewTime && (
                    <div className="time-cell">
                      <div className="cell-label">
                        <CheckCircleOutlined /> 审核时间
                      </div>
                      <div className="cell-value">
                        {dayjs(selectedApplication.reviewTime).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  )}
                </TimeGrid>
              </InfoBlock>

              {selectedApplication.reviewComment && (
                <InfoBlock className={selectedApplication.status === 2 ? 'reject' : 'highlight'}>
                  <div className="block-label">
                    <CommentOutlined /> 审核意见
                  </div>
                  <div className="block-content">{selectedApplication.reviewComment}</div>
                </InfoBlock>
              )}
            </DetailBody>
          </>
        )}
      </DetailModal>
    </>
  );
};

export default MyApplicationsModal;
