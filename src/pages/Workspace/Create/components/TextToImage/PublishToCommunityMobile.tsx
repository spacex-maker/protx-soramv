import React, { useEffect, useState } from 'react';
import { Typography, Tag, Image, Spin, message, Button } from 'antd';
import {
  CheckCircleFilled,
  ThunderboltOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import dayjs from 'dayjs';
import {
  listChannels,
  getAvailableChallenges,
  createPost,
  CommunityChannel,
  DailyChallenge,
} from 'api/community';
import { TaskDetail } from './types';

const { Text, Paragraph } = Typography;

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
  z-index: 3000;
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
  margin-right: 12px;
`;

const SectionContainer = styled.div`
  padding: 20px 16px;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CoverScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  &::-webkit-scrollbar { display: none; }
`;

const CoverItem = styled.div<{ $isSelected: boolean }>`
  flex: 0 0 100px;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 2px solid ${props => props.$isSelected ? '#3b82f6' : 'transparent'};
  
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const ChannelCard = styled.div<{ $isSelected: boolean; $themeColor?: string; $coverUrl?: string }>`
  height: 120px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  background: #000;
  border: 2px solid ${props => props.$isSelected ? '#3b82f6' : 'transparent'};
  
  background-image: ${props => props.$coverUrl ? `url(${props.$coverUrl})` : `linear-gradient(135deg, ${props.$themeColor || '#3b82f6'} 0%, #000 100%)`};
  background-size: cover;
  background-position: center;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.7) 100%);
  }
`;

const ChannelInfo = styled.div`
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  color: #fff;
`;

const ChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChallengeCard = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1c1c1e' : '#fff'};
  border-radius: 16px;
  border: 2px solid ${props => props.$isSelected ? '#3b82f6' : 'transparent'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const ActionFooter = styled.div`
  position: sticky;
  bottom: 0;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: ${props => props.theme.mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'};
  backdrop-filter: blur(20px);
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
`;

const PublishButton = styled(Button)`
  width: 100%;
  height: 50px !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
  border: none !important;
  color: #fff !important;
`;

interface PublishToCommunityMobileProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  taskDetail: TaskDetail | null;
  taskId?: number | null; // 添加 taskId 参数
}

const PublishToCommunityMobile: React.FC<PublishToCommunityMobileProps> = ({
  open,
  onCancel,
  onSuccess,
  taskDetail,
  taskId,
}) => {
  const intl = useIntl();
  const [publishLoading, setPublishLoading] = useState(false);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined);
  const [availableChallenges, setAvailableChallenges] = useState<DailyChallenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | undefined>(undefined);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0);

  useEffect(() => {
    if (open) {
      loadChannels();
    }
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
    try {
      const data = await getAvailableChallenges();
      setAvailableChallenges(data);
    } catch (error) {
      message.error(intl.formatMessage({ id: 'create.taskDetail.loadChallengesFailed' }));
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

  if (!open) return null;

  return (
    <MobileContainer>
      <NavHeader>
        <IconButton onClick={onCancel}><ArrowLeftOutlined /></IconButton>
        <Text strong style={{ fontSize: 16 }}>{intl.formatMessage({ id: 'create.taskDetail.publish' })}</Text>
      </NavHeader>

      <SectionContainer>
        <SectionTitle>1. <FormattedMessage id="create.taskDetail.selectCover" /></SectionTitle>
        <CoverScroll>
          {taskDetail?.outputFiles?.map((file, index) => (
            <CoverItem 
              key={file.id} 
              $isSelected={selectedCoverIndex === index}
              onClick={() => setSelectedCoverIndex(index)}
            >
              <img src={file.fileUrl} alt="" />
              {selectedCoverIndex === index && (
                <div style={{ position: 'absolute', top: 6, right: 6, color: '#3b82f6', background: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleFilled />
                </div>
              )}
            </CoverItem>
          ))}
        </CoverScroll>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>2. <FormattedMessage id="create.taskDetail.selectChannel" /></SectionTitle>
        <ChannelGrid>
          {channels.map(channel => (
            <ChannelCard
              key={channel.id}
              $isSelected={selectedChannelId === channel.id}
              $themeColor={channel.themeColor}
              $coverUrl={channel.coverUrl}
              onClick={() => setSelectedChannelId(channel.id)}
            >
              <ChannelInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text strong style={{ color: '#fff', fontSize: 16 }}>{channel.name}</Text>
                  {channel.isVipOnly && <Tag color="#FFD700" style={{ color: '#000', border: 'none', borderRadius: '4px', fontWeight: 800, fontSize: 10 }}>VIP</Tag>}
                </div>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 0 }} ellipsis={{ rows: 1 }}>
                  {channel.description}
                </Paragraph>
              </ChannelInfo>
              {selectedChannelId === channel.id && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <CheckCircleFilled style={{ color: '#3b82f6', fontSize: 24 }} />
                </div>
              )}
            </ChannelCard>
          ))}
        </ChannelGrid>
      </SectionContainer>

      {availableChallenges.length > 0 && (
        <SectionContainer>
          <SectionTitle>3. <FormattedMessage id="create.taskDetail.selectChallenge" /> (Required)</SectionTitle>
          <ChallengeList>
            {availableChallenges.map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                $isSelected={selectedChallengeId === challenge.id}
                onClick={() => setSelectedChallengeId(challenge.id)}
              >
                <img src={challenge.coverUrl} style={{ width: 50, height: 50, borderRadius: 10, marginRight: 12, objectFit: 'cover' }} alt="" />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', fontSize: 14 }}>{challenge.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {intl.formatMessage(
                      { id: 'create.taskDetail.daysLeft' },
                      { days: dayjs(challenge.endTime).diff(dayjs(), 'day') }
                    )}
                  </Text>
                </div>
                {selectedChallengeId === challenge.id && <CheckCircleFilled style={{ color: '#3b82f6', fontSize: 20 }} />}
              </ChallengeCard>
            ))}
          </ChallengeList>
        </SectionContainer>
      )}

      <ActionFooter>
        <PublishButton 
          loading={publishLoading} 
          onClick={handlePublish}
        >
          {intl.formatMessage({ id: 'common.publish' })}
        </PublishButton>
      </ActionFooter>
    </MobileContainer>
  );
};

export default PublishToCommunityMobile;
