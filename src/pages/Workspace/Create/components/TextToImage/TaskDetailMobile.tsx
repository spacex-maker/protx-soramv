import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Tag, Image as AntImage, Spin, message, Button, Row, Col, Space } from 'antd';
import {
  CloseOutlined,
  ClockCircleOutlined,
  FileImageOutlined,
  RobotOutlined,
  CodeSandboxOutlined,
  DownloadOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  CalendarOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  FieldNumberOutlined,
  ThunderboltOutlined,
  FileJpgOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import instance from 'api/axios';
import { TaskDetail, TaskOutputFile } from './types';
import {
  likeModel,
  unlikeModel,
  favoriteModel,
  unfavoriteModel,
  getInteractionStatus,
  ModelInteractionResponse,
} from 'api/modelInteraction';
import PublishToCommunityModal from './PublishToCommunityModal';

const { Text, Title, Paragraph } = Typography;

// --- 动画 ---
const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const MobileContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.mode === 'dark' ? '#000' : '#f5f5f7'};
  z-index: 2000;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.3s ease-out;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const NavHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
`;

const IconButton = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  font-size: 18px;
`;

const HeroSection = styled.div<{ bgImage?: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  background-color: #000;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${props => props.bgImage});
    background-size: cover;
    background-position: center;
    filter: blur(40px) brightness(0.5);
    transform: scale(1.1);
  }
`;

const MainPoster = styled.img`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const InfoContent = styled.div`
  padding: 24px 20px;
  background: ${props => props.theme.mode === 'dark' ? '#000' : '#fff'};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  margin-top: -24px;
  position: relative;
  z-index: 2;
`;

const StatusBadge = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 100px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const ModelTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
`;

const ModelCode = styled.div`
  font-size: 13px;
  font-family: monospace;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
`;

const SectionBox = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8f9fa'};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  
  .icon-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const PromptText = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.8)' : '#374151'};
  word-break: break-word;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const InfoItem = styled.div`
  .label {
    font-size: 11px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#999'};
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .value {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#111'};
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 12px;
`;

const ImageCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  position: relative;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#eee'};
`;

const ActionFooter = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 100;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'};
  backdrop-filter: blur(20px);
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  display: flex;
  gap: 12px;
`;

const PrimaryAction = styled(Button)`
  flex: 1;
  height: 48px !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
  border: none !important;
  color: #fff !important;
`;

const SecondaryAction = styled(Button)`
  width: 48px;
  height: 48px !important;
  border-radius: 12px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
  border: none !important;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
`;

// 工具函数
const normalizeImageSource = (image: string): string => {
  if (!image) return '';
  const trimmed = image.trim();
  if (trimmed.startsWith('data:image') || /^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//') && typeof window !== 'undefined') return `${window.location.protocol}${trimmed}`;
  if (trimmed.startsWith('/') && typeof window !== 'undefined') return `${window.location.origin}${trimmed}`;
  return `data:image/png;base64,${trimmed}`;
};

interface TaskDetailMobileProps {
  open: boolean;
  onClose: () => void;
  taskId: number | null;
}

const TaskDetailMobile: React.FC<TaskDetailMobileProps> = ({ open, onClose, taskId }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);

  const fetchTaskDetail = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const response = await instance.get(`/productx/sa-ai-gen-task/${taskId}/detail`);
      if (response.data.success) {
        setTaskDetail(response.data.data);
        if (response.data.data.model?.id) {
          fetchInteraction(response.data.data.model.id);
        }
      }
    } catch (error) {
      message.error('Load failed');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const fetchInteraction = async (modelId: number) => {
    try {
      const res = await getInteractionStatus(modelId);
      setIsLiked(res.isLiked);
      setIsFavorited(res.isFavorited);
      setLikesCount(res.likesCount);
      setFavoritesCount(res.favoritesCount);
    } catch (e) {}
  };

  useEffect(() => {
    if (open && taskId) {
      fetchTaskDetail();
    } else {
      setTaskDetail(null);
    }
  }, [open, taskId, fetchTaskDetail]);

  const handleLike = async () => {
    if (!taskDetail?.model?.id || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = isLiked ? await unlikeModel(taskDetail.model.id) : await likeModel(taskDetail.model.id);
      setIsLiked(res.isLiked);
      setLikesCount(res.likesCount);
      message.success(isLiked ? 'Unliked' : 'Liked');
    } catch (e) {} finally { setLikeLoading(false); }
  };

  const handleFavorite = async () => {
    if (!taskDetail?.model?.id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      const res = isFavorited ? await unfavoriteModel(taskDetail.model.id) : await favoriteModel(taskDetail.model.id);
      setIsFavorited(res.isFavorited);
      setFavoritesCount(res.favoritesCount);
      message.success(isFavorited ? 'Removed' : 'Favorited');
    } catch (e) {} finally { setFavoriteLoading(false); }
  };

  if (!open) return null;

  if (loading && !taskDetail) {
    return (
      <MobileContainer>
        <NavHeader>
          <IconButton onClick={onClose}><ArrowLeftOutlined /></IconButton>
          <Text strong>Detail</Text>
          <div style={{ width: 36 }} />
        </NavHeader>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </div>
      </MobileContainer>
    );
  }

  const statusInfo = taskDetail?.status === 2 
    ? { color: '#52c41a', text: 'SUCCESS', icon: <CheckCircleOutlined /> }
    : taskDetail?.status === 3 
    ? { color: '#ff4d4f', text: 'FAILED', icon: <WarningOutlined /> }
    : { color: '#1890ff', text: 'PROCESSING', icon: <SyncOutlined spin /> };

  const coverImage = normalizeImageSource(taskDetail?.outputFiles?.[0]?.fileUrl || '');

  return (
    <MobileContainer>
      <NavHeader>
        <IconButton onClick={onClose}><ArrowLeftOutlined /></IconButton>
        <Text strong style={{ fontSize: 16 }}>{intl.formatMessage({ id: 'create.taskDetail.title', defaultMessage: '作品详情' })}</Text>
        <IconButton onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          message.success('Link copied');
        }}><ShareAltOutlined /></IconButton>
      </NavHeader>

      {taskDetail && (
        <>
          <HeroSection bgImage={coverImage}>
            <MainPoster src={coverImage} />
          </HeroSection>

          <InfoContent>
            <StatusBadge color={statusInfo.color}>
              {statusInfo.icon} {statusInfo.text}
            </StatusBadge>
            
            <ModelTitle>{taskDetail.modelName || 'Untitled'}</ModelTitle>
            <ModelCode><CodeSandboxOutlined /> {taskDetail.modelCode}</ModelCode>

            {taskDetail.model?.description && (
              <Paragraph style={{ color: 'rgba(128,128,128,0.8)', fontSize: 14 }}>
                {taskDetail.model.description}
              </Paragraph>
            )}

            <SectionBox>
              <SectionHeader>
                <div className="icon-title"><CodeSandboxOutlined style={{ color: '#3b82f6' }} /> Prompt</div>
                <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => {
                  navigator.clipboard.writeText(taskDetail.prompt);
                  message.success('Copied');
                }}>Copy</Button>
              </SectionHeader>
              <PromptText>{taskDetail.prompt}</PromptText>
            </SectionBox>

            <SectionBox>
              <SectionHeader>
                <div className="icon-title"><ThunderboltOutlined style={{ color: '#eab308' }} /> Parameters</div>
              </SectionHeader>
              <InfoGrid>
                <InfoItem>
                  <div className="label">Task Type</div>
                  <div className="value">{taskDetail.taskType.toUpperCase()}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Credits</div>
                  <div className="value">{taskDetail.creditsCost ?? 0} pts</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Resolution</div>
                  <div className="value">{taskDetail.model?.imageMaxResolution || '-'}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Date</div>
                  <div className="value">{new Date(taskDetail.createTime).toLocaleDateString()}</div>
                </InfoItem>
              </InfoGrid>
            </SectionBox>

            <SectionHeader>
              <div className="icon-title"><FileImageOutlined style={{ color: '#3b82f6' }} /> Outputs ({taskDetail.outputFiles?.length || 0})</div>
            </SectionHeader>
            <ImageGrid>
              {taskDetail.outputFiles?.map((file, idx) => (
                <ImageCard key={file.id}>
                  <AntImage 
                    src={normalizeImageSource(file.fileUrl)} 
                    width="100%" 
                    height="100%" 
                    style={{ objectFit: 'cover' }} 
                  />
                </ImageCard>
              ))}
            </ImageGrid>
          </InfoContent>

          <ActionFooter>
            <SecondaryAction onClick={handleLike} disabled={likeLoading}>
              {isLiked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            </SecondaryAction>
            <SecondaryAction onClick={handleFavorite} disabled={favoriteLoading}>
              {isFavorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            </SecondaryAction>
            <PrimaryAction onClick={() => setPublishModalVisible(true)}>
              Publish to Community
            </PrimaryAction>
          </ActionFooter>
        </>
      )}

      <PublishToCommunityModal
        open={publishModalVisible}
        onCancel={() => setPublishModalVisible(false)}
        onSuccess={fetchTaskDetail}
        taskDetail={taskDetail}
        taskId={taskId}
      />
    </MobileContainer>
  );
};

export default TaskDetailMobile;
