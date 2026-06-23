import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Timeline, Spin, Typography, Tag, Modal, Upload, Progress, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import instance from 'api/axios';
import { CloseOutlined, BulbOutlined, CloudUploadOutlined } from '@ant-design/icons';
import FeedbackModalEntry from 'components/modals/FeedbackModalEntry';
import { checkCoreDeployPermission, uploadCoreJar } from 'api/coreDeploy';

const { Text } = Typography;

interface ProductLog {
  version: string;
  releaseDate: string;
  updateType: string;
  updateContent: string;
  remarks: string;
}

interface ProductLogModalProps {
  open: boolean;
  onClose: () => void;
}

interface PaginationResponse {
  data: ProductLog[];
  totalNum: number;
}

const FullScreenOverlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.2)'
    : 'rgba(255, 255, 255, 0.2)'};
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: ${props => props.visible ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1002;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(255, 255, 255, 0.3)'};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  box-shadow: 0 1px 20px ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.15)'
    : 'rgba(255, 255, 255, 0.15)'};
`;

const ScrollContainer = styled.div`
  width: 100%;
  height: calc(100% - 64px);
  overflow-y: auto;
  padding: 20px;
  margin-top: 64px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
    border-radius: 3px;
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const ActionButton = styled.button`
  position: fixed;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.6)'
    : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 14px;
  cursor: pointer;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 20px;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px ${props => props.theme.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(0, 0, 0, 0.1)'};
  z-index: 1003;
  padding: 0 16px;
  font-weight: 500;

  &:hover {
    background: ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const FeedbackButton = styled(ActionButton)`
  top: 12px;
  right: 64px;
`;

const DeployButton = styled(ActionButton)`
  bottom: 24px;
  right: 24px;
  top: auto;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(24, 144, 255, 0.85)'
    : 'rgba(24, 144, 255, 0.92)'};
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(24, 144, 255, 1);
    color: #fff;
  }
`;

const CloseButton = styled(ActionButton)`
  top: 12px;
  right: 12px;
  width: 40px;
  padding: 0;
  font-size: 20px;
  border-radius: 50%;
`;

const Title = styled.h1`
  text-align: center;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const StyledTimeline = styled(Timeline)`
  .ant-timeline-item-tail {
    border-inline-start: 2px solid ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)'};
  }

  .ant-timeline-item-content {
    margin-bottom: 32px;
  }
`;

const VersionTag = styled(Tag)`
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
`;

const DateText = styled(Text)`
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(0, 0, 0, 0.65)'};
  margin-left: 8px;
`;

const UpdateTypeTag = styled(Tag)`
  margin: 0 8px;
`;

const ContentWrapper = styled.div`
  margin-top: 8px;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(0, 0, 0, 0.01)'};
  border-radius: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  backdrop-filter: blur(4px);
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'};
`;

const LoadingWrapper = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const ProductLogModal: React.FC<ProductLogModalProps> = ({ open, onClose }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<ProductLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [canDeployCore, setCanDeployCore] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployUploading, setDeployUploading] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployFileList, setDeployFileList] = useState<UploadFile[]>([]);
  const [pendingDeployFile, setPendingDeployFile] = useState<File | null>(null);

  const fetchLogs = async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await instance.get('/productx/product-update-log/list', {
        params: {
          currentPage: page,
          pageSize
        }
      });

      if (response.data.success) {
        const { data, totalNum }: PaginationResponse = response.data.data;
        setTotal(totalNum);
        
        if (page === 1) {
          setLogs(data);
        } else {
          setLogs(prevLogs => [...prevLogs, ...data]);
        }
        
        setHasMore((page * pageSize) < totalNum);
      }
    } catch (error) {
      console.error('Failed to fetch product logs:', error);
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (open) {
      setCurrentPage(1);
      setHasMore(true);
      setLogs([]);
      fetchLogs(1);
      checkCoreDeployPermission().then(setCanDeployCore);
    } else {
      setCanDeployCore(false);
      setDeployModalOpen(false);
      setDeployFileList([]);
      setPendingDeployFile(null);
      setDeployProgress(0);
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLogs(nextPage);
    }
  }, [loading, loadingMore, hasMore, currentPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case '新功能':
        return 'success';
      case '优化':
        return 'processing';
      case '修复':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleDeployBeforeUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.jar')) {
      message.error(intl.formatMessage({
        id: 'productLog.deploy.invalidFile',
        defaultMessage: '只能上传 .jar 文件',
      }));
      return Upload.LIST_IGNORE;
    }
    setPendingDeployFile(file);
    setDeployFileList([{
      uid: '-1',
      name: file.name,
      status: 'done',
      size: file.size,
    }]);
    return false;
  };

  const handleDeployConfirm = async () => {
    if (!pendingDeployFile || deployUploading) return;
    setDeployUploading(true);
    setDeployProgress(0);
    try {
      const res = await uploadCoreJar(pendingDeployFile, setDeployProgress);
      if (res?.success) {
        message.success(
          res.message
            || intl.formatMessage({
              id: 'productLog.deploy.success',
              defaultMessage: 'JAR 已上传至 COS，请在产线服务器执行 deploy-core.sh',
            })
        );
        setDeployModalOpen(false);
        setDeployFileList([]);
        setPendingDeployFile(null);
      } else {
        message.error(res?.message || intl.formatMessage({
          id: 'productLog.deploy.failed',
          defaultMessage: '上传失败',
        }));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(
        err?.response?.data?.message
          || intl.formatMessage({
            id: 'productLog.deploy.failed',
            defaultMessage: '上传失败',
          })
      );
    } finally {
      setDeployUploading(false);
      setDeployProgress(0);
    }
  };

  return (
    <FullScreenOverlay visible={open}>
      <Header>
        <Title>
          <FormattedMessage id="productLog.title" defaultMessage="产品更新日志" />
        </Title>
        <FeedbackButton onClick={() => setIsFeedbackVisible(true)}>
          <BulbOutlined />
          <FormattedMessage id="productLog.feedback" defaultMessage="提需求" />
        </FeedbackButton>
        <CloseButton onClick={onClose}>
          <CloseOutlined />
        </CloseButton>
      </Header>
      <ScrollContainer ref={containerRef}>
        <ContentContainer>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <StyledTimeline>
                {logs.map((log, index) => (
                  <Timeline.Item key={index}>
                    <div>
                      <VersionTag color="blue">v{log.version}</VersionTag>
                      <DateText>{log.releaseDate}</DateText>
                      <UpdateTypeTag color={getUpdateTypeColor(log.updateType)}>
                        {log.updateType}
                      </UpdateTypeTag>
                    </div>
                    <ContentWrapper>
                      <Text style={{ color: 'inherit' }}>{log.updateContent}</Text>
                      {log.remarks && (
                        <div style={{ marginTop: 12 }}>
                          <Text type="secondary" style={{ opacity: 0.8 }}>{log.remarks}</Text>
                        </div>
                      )}
                    </ContentWrapper>
                  </Timeline.Item>
                ))}
              </StyledTimeline>
              {loadingMore && (
                <LoadingWrapper>
                  <Spin />
                </LoadingWrapper>
              )}
            </>
          )}
        </ContentContainer>
      </ScrollContainer>
      <FeedbackModalEntry
        open={isFeedbackVisible}
        onClose={() => setIsFeedbackVisible(false)}
      />

      {canDeployCore && (
        <DeployButton onClick={() => setDeployModalOpen(true)}>
          <CloudUploadOutlined />
          <FormattedMessage id="productLog.deploy" defaultMessage="发布更新" />
        </DeployButton>
      )}

      <Modal
        open={deployModalOpen}
        title={intl.formatMessage({ id: 'productLog.deployTitle', defaultMessage: '发布 Core 更新' })}
        okText={intl.formatMessage({ id: 'productLog.deployConfirm', defaultMessage: '上传并发布' })}
        cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
        confirmLoading={deployUploading}
        onOk={handleDeployConfirm}
        onCancel={() => {
          if (deployUploading) return;
          setDeployModalOpen(false);
          setDeployFileList([]);
          setPendingDeployFile(null);
        }}
        destroyOnClose
      >
        <Typography.Paragraph type="secondary">
          <FormattedMessage
            id="productLog.deployDesc"
            defaultMessage="上传 core JAR 到 COS 固定路径（deploy/core/core-0.0.1.jar），覆盖后请在产线服务器执行 scripts/deploy-core.sh 完成替换与重启。"
          />
        </Typography.Paragraph>
        <Upload.Dragger
          accept=".jar"
          maxCount={1}
          fileList={deployFileList}
          beforeUpload={handleDeployBeforeUpload}
          onRemove={() => {
            setDeployFileList([]);
            setPendingDeployFile(null);
          }}
          disabled={deployUploading}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">
            <FormattedMessage id="productLog.deployDropHint" defaultMessage="点击或拖拽 core JAR 到此处" />
          </p>
        </Upload.Dragger>
        {deployUploading && (
          <Progress percent={deployProgress} style={{ marginTop: 16 }} status="active" />
        )}
      </Modal>
    </FullScreenOverlay>
  );
};

export default ProductLogModal; 