import React, { useEffect, useState, useRef } from 'react';
import { Modal, Empty, Spin, message, Typography, theme, Tag, Image } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ClockCircleOutlined,
  CheckCircleFilled,
  FireOutlined,
  CrownOutlined,
  PictureOutlined,
} from '@ant-design/icons';
// 1. 修复：添加 css 导入
import styled, { keyframes, css } from 'styled-components';
import dayjs from 'dayjs';
import {
  listChannels,
  getAvailableChallenges,
  createPost,
  CommunityChannel,
  DailyChallenge,
} from 'api/community';
import { TaskDetail } from './types';
import PublishToCommunityMobile from './PublishToCommunityMobile';

const { Text, Title, Paragraph } = Typography;

// 2. 修复：定义丢失的 Props 接口
interface PublishToCommunityModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  taskDetail: TaskDetail | null;
  taskId?: number | null; // 添加 taskId 参数
}

// --- 苹果风高级动画 ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseSelection = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(0, 113, 227, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 113, 227, 0); }
  100% { box-shadow: 0 0 0 0px rgba(0, 113, 227, 0); }
`;

// --- 样式优化 ---
const StyledModalWrapper = styled.div`
  .ant-modal-content {
    padding: 0 !important;
    border-radius: 32px !important;
    overflow: hidden !important;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)'} !important;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .ant-modal-header {
    background: transparent !important;
    padding: 32px 40px 16px !important;
    border-bottom: none !important;
  }

  .ant-modal-footer {
    padding: 24px 40px 32px !important;
    border-top: none !important;
    background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'};
  }
`;

const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  padding: 0 40px;
`;

const CoverScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 0 40px 24px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const CoverItem = styled.div<{ $isSelected: boolean }>`
  flex: 0 0 110px;
  aspect-ratio: 1;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  transform: ${props => props.$isSelected ? 'scale(1.08)' : 'scale(1)'};
  border: 2px solid ${props => props.$isSelected ? '#0071e3' : 'transparent'};
  box-shadow: ${props => props.$isSelected ? '0 12px 24px rgba(0,0,0,0.15)' : 'none'};

  &:hover { transform: scale(1.05); }
`;

const ChannelScrollContainer = styled.div`
  position: relative;
  margin-bottom: 32px;
  &::before, &::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0; width: 40px; z-index: 2; pointer-events: none;
  }
  &::before { left: 0; background: linear-gradient(to right, ${props => props.theme.mode === 'dark' ? '#1c1c1e' : '#fff'}, transparent); }
  &::after { right: 0; background: linear-gradient(to left, ${props => props.theme.mode === 'dark' ? '#1c1c1e' : '#fff'}, transparent); }
`;

const ChannelScrollWrapper = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px 40px 30px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  &::-webkit-scrollbar { display: none; }
`;

const ChannelCard = styled.div<{ $isSelected: boolean; $themeColor?: string; $coverUrl?: string }>`
  flex: 0 0 280px;
  height: 360px;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  background: #000;
  scroll-snap-align: start;
  
  background-image: ${props => props.$coverUrl ? `url(${props.$coverUrl})` : `linear-gradient(210deg, ${props.$themeColor || '#1890ff'} 0%, #000 100%)`};
  background-size: cover;
  background-position: center;

  transform: ${props => props.$isSelected ? 'scale(1.02) translateY(-8px)' : 'scale(0.96)'};
  box-shadow: ${props => props.$isSelected ? '0 20px 40px rgba(0,0,0,0.3)' : '0 8px 20px rgba(0,0,0,0.1)'};
  
  ${props => props.$isSelected ? css`
    animation: ${pulseSelection} 2s infinite;
  ` : ''}

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%);
    z-index: 1;
  }
`;

const ChannelInnerContent = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ChallengeItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  margin: 0 40px 12px;
  padding: 12px;
  border-radius: 20px;
  background: ${props => props.$isSelected ? 'rgba(0, 113, 227, 0.08)' : 'rgba(128, 128, 128, 0.05)'};
  border: 1px solid ${props => props.$isSelected ? '#0071e3' : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover { background: rgba(0, 113, 227, 0.05); }
`;

const AnimatedChallengeList = styled.div`
  animation: ${fadeIn} 0.5s ease forwards;
`;

const PublishToCommunityModal: React.FC<PublishToCommunityModalProps> = ({
  open,
  onCancel,
  onSuccess,
  taskDetail,
  taskId,
}) => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [publishLoading, setPublishLoading] = useState(false);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined);
  const [availableChallenges, setAvailableChallenges] = useState<DailyChallenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | undefined>(undefined);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) loadChannels();
  }, [open]);

  useEffect(() => {
    const selectedChannel = channels.find(c => c.id === selectedChannelId);
    if (open && selectedChannel?.channelKey === 'daily-challenge') {
      loadAvailableChallenges();
    } else {
      setAvailableChallenges([]);
      setSelectedChallengeId(undefined);
    }
  }, [selectedChannelId, open, channels]);

  const loadChannels = async () => {
    try {
      const data = await listChannels();
      setChannels(data);
      const daily = data.find(c => c.channelKey === 'daily-challenge');
      if (daily) setSelectedChannelId(daily.id);
    } catch (error) {
      message.error(intl.formatMessage({ id: 'create.taskDetail.loadChannelsFailed' }));
    }
  };

  const loadAvailableChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const data = await getAvailableChallenges();
      setAvailableChallenges(data);
    } catch (error) {
      message.error(intl.formatMessage({ id: 'create.taskDetail.loadChallengesFailed' }));
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handlePublish = async () => {
    if (!taskDetail?.outputFiles?.length) return;
    if (!taskId) {
      message.error(intl.formatMessage({ id: 'create.taskDetail.taskIdRequired', defaultMessage: '任务ID不能为空' }));
      return;
    }
    setPublishLoading(true);
    try {
      const mediaUrls = taskDetail.outputFiles.map((file) => file.fileUrl);
      await createPost({
        title: taskDetail.modelName || undefined,
        mediaType: 'IMAGE',
        mediaUrls,
        coverUrl: mediaUrls[selectedCoverIndex],
        channelId: selectedChannelId,
        challengeId: selectedChallengeId,
        taskId: taskId, // 添加 taskId
      });
      message.success(intl.formatMessage({ id: 'create.taskDetail.publishSuccess' }));
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'create.taskDetail.publishFailed' }));
    } finally {
      setPublishLoading(false);
    }
  };

  if (isMobile) {
    return (
      <PublishToCommunityMobile 
        open={open}
        onCancel={onCancel}
        onSuccess={onSuccess}
        taskDetail={taskDetail}
      />
    );
  }

  return (
    <StyledModalWrapper>
      <Modal
        title={<Title level={3} style={{ margin: 0, fontWeight: 700 }}>{intl.formatMessage({ id: 'create.taskDetail.publish' })}</Title>}
        open={open}
        onCancel={onCancel}
        onOk={handlePublish}
        confirmLoading={publishLoading}
        width={940}
        centered
        okText={intl.formatMessage({ id: 'common.publish' })}
        okButtonProps={{
          style: { borderRadius: '20px', padding: '0 24px', height: '40px', fontWeight: 600, background: '#0071e3' }
        }}
        cancelButtonProps={{ style: { borderRadius: '20px', height: '40px' } }}
      >
        <div style={{ padding: '20px 0' }}>
          {/* 1. 封面选择 */}
          <SectionLabel>1. <FormattedMessage id="create.taskDetail.selectCover" /></SectionLabel>
          <CoverScrollContainer>
            {taskDetail?.outputFiles?.map((file, index: number) => (
              <CoverItem 
                key={file.id} 
                $isSelected={selectedCoverIndex === index}
                onClick={() => setSelectedCoverIndex(index)}
              >
                <img src={file.fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                {selectedCoverIndex === index && (
                  <div style={{ position: 'absolute', top: 8, right: 8, color: '#0071e3', background: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleFilled />
                  </div>
                )}
              </CoverItem>
            ))}
          </CoverScrollContainer>

          {/* 2. 频道选择 */}
          <SectionLabel>2. <FormattedMessage id="create.taskDetail.selectChannel" /></SectionLabel>
          <ChannelScrollContainer>
            <ChannelScrollWrapper ref={scrollWrapperRef}>
              {channels.map(channel => (
                <ChannelCard
                  key={channel.id}
                  $isSelected={selectedChannelId === channel.id}
                  $themeColor={channel.themeColor}
                  $coverUrl={channel.coverUrl}
                  onClick={() => setSelectedChannelId(channel.id)}
                >
                  <ChannelInnerContent>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                       {channel.isVipOnly && <Tag color="#FFD700" style={{ color: '#000', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: 10 }}>VIP</Tag>}
                    </div>
                    <Text strong style={{ color: '#fff', fontSize: 18, marginBottom: 4 }}>{channel.name}</Text>
                    {/* 修复：使用 Paragraph 替换 Text 来支持 ellipsis 的行数控制 */}
                    <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 0 }} ellipsis={{ rows: 2 }}>
                      {channel.description}
                    </Paragraph>
                  </ChannelInnerContent>
                  {selectedChannelId === channel.id && (
                    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 3 }}>
                      <CheckCircleFilled style={{ color: '#0071e3', fontSize: 32, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }} />
                    </div>
                  )}
                </ChannelCard>
              ))}
            </ChannelScrollWrapper>
          </ChannelScrollContainer>

          {/* 3. 挑战选择 */}
          {availableChallenges.length > 0 && (
            <AnimatedChallengeList>
              <SectionLabel>3. <FormattedMessage id="create.taskDetail.selectChallenge" /> (Required)</SectionLabel>
              {availableChallenges.map(challenge => (
                <ChallengeItem 
                  key={challenge.id} 
                  $isSelected={selectedChallengeId === challenge.id}
                  onClick={() => setSelectedChallengeId(challenge.id)}
                >
                  <Image src={challenge.coverUrl} width={60} height={60} preview={false} style={{ borderRadius: 12, marginRight: 16, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block' }}>{challenge.title}</Text>
                    {/* 修复：Text 不支持 size 属性，改用 style 或直接文字 */}
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {intl.formatMessage(
                        { id: 'create.taskDetail.daysLeft' },
                        { days: dayjs(challenge.endTime).diff(dayjs(), 'day') }
                      )}
                    </Text>
                  </div>
                  {selectedChallengeId === challenge.id && <CheckCircleFilled style={{ color: '#0071e3', fontSize: 20 }} />}
                </ChallengeItem>
              ))}
            </AnimatedChallengeList>
          )}
        </div>
      </Modal>
    </StyledModalWrapper>
  );
};

export default PublishToCommunityModal;