import React, { useEffect, useState } from 'react';
import { Modal, Select, Empty, Spin, message, Typography, theme, Tag, Image, Radio } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ClockCircleOutlined,
  CheckCircleFilled,
  FireOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs'; // 建议使用 dayjs 处理日期格式化
import {
  listChannels,
  getAvailableChallenges,
  createPost,
  CommunityChannel,
  DailyChallenge,
} from 'api/community';
import { TaskDetail } from './types';

const { Text, Title, Paragraph } = Typography;
const { useToken } = theme;

// 封面选择器样式
const CoverSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
`;

const CoverItem = styled.div<{ $isSelected: boolean }>`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.$isSelected ? '#1890ff' : 'transparent'};
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f5f5f5'};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.$isSelected ? '#1890ff' : '#40a9ff'};
    transform: scale(1.05);
  }
`;

const SelectedOverlay = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
`;

interface PublishToCommunityModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  taskDetail: TaskDetail | null;
}

const PublishToCommunityModal: React.FC<PublishToCommunityModalProps> = ({
  open,
  onCancel,
  onSuccess,
  taskDetail,
}) => {
  const intl = useIntl();
  const { token } = useToken(); // 获取 Ant Design 全局 Token
  const [publishLoading, setPublishLoading] = useState(false);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined);
  const [availableChallenges, setAvailableChallenges] = useState<DailyChallenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | undefined>(undefined);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0); // 选中的封面索引

  // 加载频道列表
  useEffect(() => {
    if (open) {
      loadChannels();
    }
  }, [open]);

  // 当选择每日挑战频道时，加载挑战列表
  useEffect(() => {
    if (open && selectedChannelId) {
      const selectedChannel = channels.find(c => c.id === selectedChannelId);
      if (selectedChannel?.channelKey === 'daily-challenge') {
        loadAvailableChallenges();
        // 重置封面选择为第一张
        setSelectedCoverIndex(0);
      } else {
        setAvailableChallenges([]);
        setSelectedChallengeId(undefined);
        setSelectedCoverIndex(0);
      }
    }
  }, [selectedChannelId, open, channels]);

  const loadChannels = async () => {
    try {
      const data = await listChannels();
      setChannels(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '加载频道失败' }));
    }
  };

  const loadAvailableChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const data = await getAvailableChallenges();
      setAvailableChallenges(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '加载挑战列表失败' }));
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handlePublish = async () => {
    if (!taskDetail || !taskDetail.outputFiles || taskDetail.outputFiles.length === 0) {
      message.warning(intl.formatMessage({ id: 'create.taskDetail.noOutputs', defaultMessage: '没有可发布的输出文件' }));
      return;
    }

    // 如果选择了每日挑战频道，必须选择挑战
    const selectedChannel = channels.find(c => c.id === selectedChannelId);
    if (selectedChannel?.channelKey === 'daily-challenge' && !selectedChallengeId) {
      message.warning(intl.formatMessage({ id: 'create.taskDetail.selectChallengeRequired', defaultMessage: '请选择挑战' }));
      return;
    }

    setPublishLoading(true);
    try {
      const mediaUrls = taskDetail.outputFiles.map(file => file.fileUrl);
      // 如果是每日挑战，使用用户选择的封面；否则使用默认逻辑
      const isDailyChallenge = selectedChannel?.channelKey === 'daily-challenge';
      const coverUrl = isDailyChallenge 
        ? mediaUrls[selectedCoverIndex] || mediaUrls[0]
        : taskDetail.model?.coverImage || mediaUrls[0];

      await createPost({
        title: taskDetail.modelName || undefined,
        mediaType: 'IMAGE',
        mediaUrls,
        coverUrl,
        prompt: taskDetail.prompt || undefined,
        negativePrompt: undefined,
        modelKey: taskDetail.modelCode || undefined,
        generationParams: taskDetail.model ? JSON.stringify({
          imageMaxResolution: taskDetail.model.imageMaxResolution,
          imageFormats: taskDetail.model.imageFormats,
          imageAspectRatios: taskDetail.model.imageAspectRatios,
        }) : undefined,
        channelId: selectedChannelId,
        challengeId: selectedChallengeId,
      });

      message.success(intl.formatMessage({ id: 'create.taskDetail.publishSuccess', defaultMessage: '发布成功，等待审核' }));
      handleCancel();
      onSuccess();
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '发布失败' }));
    } finally {
      setPublishLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedChannelId(undefined);
    setSelectedChallengeId(undefined);
    setAvailableChallenges([]);
    setSelectedCoverIndex(0);
    onCancel();
  };

  // 辅助函数：计算剩余天数
  const getDaysLeft = (endTime: string | number) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <Modal
      title={<FormattedMessage id="create.taskDetail.publish" defaultMessage="发布到社区" />}
      open={open}
      onCancel={handleCancel}
      onOk={handlePublish}
      confirmLoading={publishLoading}
      okText={intl.formatMessage({ id: 'common.publish', defaultMessage: '发布' })}
      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
      width={600}
      centered
    >
      {/* 频道选择部分 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8, fontSize: 14 }}>
          <FormattedMessage id="create.taskDetail.selectChannel" defaultMessage="选择频道" />
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal', marginLeft: 8 }}>
            (可选)
          </Text>
        </Title>
        <Select
          style={{ width: '100%' }}
          placeholder={intl.formatMessage({ id: 'create.taskDetail.selectChannelPlaceholder', defaultMessage: '请选择频道' })}
          value={selectedChannelId}
          onChange={setSelectedChannelId}
          allowClear
          size="large"
        >
          {channels.map(channel => (
            <Select.Option key={channel.id} value={channel.id}>
              {channel.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* 挑战选择区域 - 仅当选择每日挑战频道时显示 */}
      {selectedChannelId && channels.find(c => c.id === selectedChannelId)?.channelKey === 'daily-challenge' && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 12, fontSize: 14 }}>
            <FireOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
            <FormattedMessage id="create.taskDetail.selectChallenge" defaultMessage="当前挑战" />
            <Text type="danger" style={{ fontSize: 12, fontWeight: 'normal', marginLeft: 8 }}>
              * 必选
            </Text>
          </Title>

          {loadingChallenges ? (
            <div style={{ textAlign: 'center', padding: '40px', background: token.colorBgLayout, borderRadius: token.borderRadiusLG }}>
              <Spin tip="加载挑战中..." />
            </div>
          ) : availableChallenges.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({ id: 'create.taskDetail.noAvailableChallenges', defaultMessage: '暂无可用的挑战' })} 
              style={{ margin: '20px 0', padding: '20px', background: token.colorBgLayout, borderRadius: token.borderRadiusLG }}
            />
          ) : (
            <div style={{ 
              maxHeight: '380px', 
              overflowY: 'auto', 
              paddingRight: 4, 
            }}>
              {availableChallenges.map(challenge => {
                const isSelected = selectedChallengeId === challenge.id;
                const daysLeft = getDaysLeft(challenge.endTime);
                
                return (
                  <div
                    key={challenge.id}
                    onClick={() => setSelectedChallengeId(challenge.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      marginBottom: 12,
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? token.colorPrimary : token.colorBorderSecondary}`,
                      borderRadius: token.borderRadiusLG,
                      background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
                      transition: 'all 0.3s ease',
                      padding: 0, // 去除内边距，让图片贴边
                      overflow: 'hidden', // 防止图片溢出圆角
                      position: 'relative',
                      height: 110, // 固定高度确保整齐
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = token.colorPrimaryHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = token.colorBorderSecondary;
                    }}
                  >
                    {/* 左侧封面图 - 占满左边 */}
                    <div style={{ 
                      width: 140, 
                      flexShrink: 0,
                      position: 'relative',
                      background: token.colorFillAlter,
                    }}>
                      {challenge.coverUrl ? (
                        <img
                          src={challenge.coverUrl}
                          alt={challenge.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: token.colorTextQuaternary
                        }}>
                          <FireOutlined style={{ fontSize: 24 }} />
                        </div>
                      )}
                    </div>

                    {/* 右侧内容区域 */}
                    <div style={{ 
                      flex: 1, 
                      minWidth: 0, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      padding: '12px 16px', // 内容区补回 Padding
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <Text strong style={{ 
                          fontSize: 15, 
                          color: isSelected ? token.colorPrimary : token.colorText,
                          width: '90%',
                        }} ellipsis>
                          {challenge.title}
                        </Text>
                      </div>
                      
                      <Paragraph 
                        type="secondary" 
                        style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.4, flex: 1 }} 
                        ellipsis={{ rows: 2 }} 
                      >
                        {challenge.description || intl.formatMessage({ id: 'common.noDescription', defaultMessage: '暂无描述' })}
                      </Paragraph>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {daysLeft <= 3 ? (
                           <Tag color="error" bordered={false} style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
                             <ClockCircleOutlined /> 
                             <FormattedMessage id="challenge.daysLeft" defaultMessage="仅剩 {days} 天" values={{ days: daysLeft }} />
                           </Tag>
                        ) : (
                           <Tag color="default" bordered={false} style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
                             <ClockCircleOutlined /> 
                             <FormattedMessage id="challenge.daysLeftNormal" defaultMessage="{days} 天后结束" values={{ days: daysLeft }} />
                           </Tag>
                        )}
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(challenge.endTime).format('MM-DD')}
                        </Text>
                      </div>
                    </div>

                    {/* 选中状态图标 */}
                    {isSelected && (
                      <div style={{ 
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#fff',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <CheckCircleFilled style={{ fontSize: 20, color: token.colorPrimary }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 封面选择区域 - 仅当选择每日挑战频道时显示 */}
      {selectedChannelId && 
       channels.find(c => c.id === selectedChannelId)?.channelKey === 'daily-challenge' &&
       taskDetail?.outputFiles && 
       taskDetail.outputFiles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 12, fontSize: 14 }}>
            <FormattedMessage id="create.taskDetail.selectCover" defaultMessage="选择封面" />
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal', marginLeft: 8 }}>
              (可选)
            </Text>
          </Title>
          <CoverSelector>
            {taskDetail.outputFiles.map((file, index) => {
              const isSelected = selectedCoverIndex === index;
              return (
                <CoverItem
                  key={file.id}
                  $isSelected={isSelected}
                  onClick={() => setSelectedCoverIndex(index)}
                >
                  <Image
                    src={file.fileUrl}
                    alt={`Cover ${index + 1}`}
                    preview={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {isSelected && (
                    <SelectedOverlay>
                      <CheckOutlined />
                    </SelectedOverlay>
                  )}
                </CoverItem>
              );
            })}
          </CoverSelector>
        </div>
      )}

      <div style={{ 
        padding: '12px 16px', 
        background: token.colorFillAlter, 
        borderRadius: token.borderRadius,
        color: token.colorTextSecondary,
        fontSize: 12,
        lineHeight: 1.5,
        textAlign: 'center'
      }}>
        <FormattedMessage id="create.taskDetail.publishTip" defaultMessage="发布后作品将进入审核状态，审核通过后会在社区中展示" />
      </div>
    </Modal>
  );
};

export default PublishToCommunityModal;