import React, { useEffect, useState, useCallback } from 'react';
import { Tag, Typography, message, Tooltip, Button, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CheckOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  AppstoreOutlined,
  BorderOutlined,
  CloseOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  ShareAltOutlined,
  DownloadOutlined,
  CodeSandboxOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  FileImageOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import styled, { css } from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import { Model } from './types';
import { getModelDescription } from '../modelUtils';
import { getModelAspectRatios } from './utils';
import { getAspectRatioOption } from './utils';
import { normalizeUrl, isVideoUrl } from './utils';
import {
  likeModel,
  unlikeModel,
  favoriteModel,
  unfavoriteModel,
  getInteractionStatus,
  ModelInteractionResponse,
} from 'api/modelInteraction';

const { Text, Paragraph } = Typography;

// --- 工具函数 ---
const isFree = (tokenCost: number | null | undefined): boolean => {
  if (tokenCost === null || tokenCost === undefined || tokenCost === 0) return true;
  return false;
};

// --- 样式组件 ---

const ModalOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  opacity: ${props => props.open ? 1 : 0};
  visibility: ${props => props.open ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Container = styled.div`
  width: 900px;
  max-width: 95vw;
  height: 650px;
  max-height: 90vh;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  transform: scale(1);
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column;
    height: 90vh;
    overflow-y: auto;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#333'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
    transform: rotate(90deg);
  }
`;

// 左侧视觉区域
const VisualPanel = styled.div<{ coverImage?: string | null; isVideo?: boolean }>`
  flex: 0 0 40%;
  position: relative;
  background-color: ${props => props.theme.mode === 'dark' ? '#000' : '#f0f2f5'};
  overflow: hidden;

  /* 图片背景 */
  ${props => props.coverImage && !props.isVideo && css`
    background-image: url(${props.coverImage});
    background-size: cover;
    background-position: center;
  `}

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6) 100%);
  }

  @media (max-width: 768px) {
    flex: 0 0 250px;
    width: 100%;
  }

  /* 视频元素样式 */
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// 右侧内容区域
const ContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32px;
  overflow-y: auto;
  position: relative;

  /* 滚动条美化 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
    border-radius: 3px;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 24px;
`;

const ModelTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#1f1f1f'};
  line-height: 1.2;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const CodeTag = styled.span`
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f5f5f5'};
  color: ${props => props.theme.mode === 'dark' ? '#aaa' : '#666'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'transparent' : '#e0e0e0'};
`;

const PriceTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 13px;
`;

// 操作按钮栏
const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : '#f0f0f0'};
`;

// 主要信息卡片网格
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f9f9f9'};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#303030' : 'transparent'};

  .card-icon {
    font-size: 20px;
    color: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#096dd9'};
    margin-bottom: 4px;
  }
  
  .card-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => props.theme.mode === 'dark' ? '#888' : '#999'};
    font-weight: 600;
  }
  
  .card-content {
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.theme.mode === 'dark' ? '#eee' : '#333'};
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#333'};

  .anticon {
    color: #1890ff;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FeatureTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  font-size: 13px;
  color: ${props => props.theme.mode === 'dark' ? '#ccc' : '#555'};

  .anticon {
    color: #52c41a;
  }
`;

// --- 主组件 ---

interface ModelDetailModalProps {
  open: boolean;
  onClose: () => void;
  model: Model | null;
}

const ModelDetailModal: React.FC<ModelDetailModalProps> = ({ open, onClose, model }) => {
  const intl = useIntl();
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 获取交互状态
  const fetchInteractionStatus = useCallback(async () => {
    if (!model?.id) return;
    try {
      const response = await getInteractionStatus(model.id);
      setIsLiked(response.isLiked);
      setIsFavorited(response.isFavorited);
      setLikesCount(response.likesCount);
      setFavoritesCount(response.favoritesCount);
    } catch (error) {
      // 未登录或其他错误，使用默认值
      setIsLiked(false);
      setIsFavorited(false);
      setLikesCount(model.likesCount || 0);
      setFavoritesCount(model.favoritesCount || 0);
    }
  }, [model?.id, model?.likesCount, model?.favoritesCount]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // 获取交互状态
      fetchInteractionStatus();
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose, fetchInteractionStatus]);

  const handleLike = async () => {
    if (!model?.id || likeLoading) return;
    setLikeLoading(true);
    try {
      let response: ModelInteractionResponse;
      if (isLiked) {
        response = await unlikeModel(model.id);
        message.success(intl.formatMessage({ id: 'create.model.unliked', defaultMessage: '已取消喜欢' }));
      } else {
        response = await likeModel(model.id);
        message.success(intl.formatMessage({ id: 'create.model.liked', defaultMessage: '已喜欢' }));
      }
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '操作失败，请稍后重试' }));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!model?.id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      let response: ModelInteractionResponse;
      if (isFavorited) {
        response = await unfavoriteModel(model.id);
        message.success(intl.formatMessage({ id: 'create.model.unfavorited', defaultMessage: '已取消收藏' }));
      } else {
        response = await favoriteModel(model.id);
        message.success(intl.formatMessage({ id: 'create.model.favorited', defaultMessage: '已收藏' }));
      }
      setIsFavorited(response.isFavorited);
      setFavoritesCount(response.favoritesCount);
    } catch (error: any) {
      message.error(error?.response?.data?.message || intl.formatMessage({ id: 'common.error', defaultMessage: '操作失败，请稍后重试' }));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    const desc = getModelDescription(model, intl.locale || '');
    const shareData = { title: model?.modelName, text: desc, url: window.location.href };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success(intl.formatMessage({ id: 'create.model.linkCopied', defaultMessage: '链接已复制' }));
    }
  };

  const handleDownload = () => {
    const coverImage = (model as any)?.coverImage ? normalizeUrl((model as any).coverImage) : null;
    if (coverImage) {
      const link = document.createElement('a');
      link.href = coverImage;
      link.download = `${model?.modelName}-cover.${isVideoUrl(coverImage) ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!model) return null;

  const coverImage = (model as any)?.coverImage ? normalizeUrl((model as any).coverImage) : null;
  const isVideo = coverImage ? isVideoUrl(coverImage) : false;
  const free = isFree(model.tokenCost);
  const aspectRatios = getModelAspectRatios(model);

  return (
    <ModalOverlay open={open} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Container>
        {/* 左侧：视觉冲击区 */}
        <VisualPanel coverImage={coverImage} isVideo={isVideo}>
          {isVideo && coverImage ? (
            <video src={coverImage} autoPlay loop muted playsInline />
          ) : null}
          {coverImage && (
            <Button 
              shape="circle" 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10, border: 'none', background: 'rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(4px)' }}
            />
          )}
        </VisualPanel>

        {/* 右侧：信息交互区 */}
        <ContentPanel>
          <CloseButton onClick={onClose}>
            <CloseOutlined />
          </CloseButton>

          <HeaderSection>
            <ModelTitle>{model.modelName}</ModelTitle>
            <MetaRow>
              {model.modelCode && (
                <CodeTag>
                  <CodeSandboxOutlined style={{ marginRight: 4 }} />
                  {model.modelCode}
                </CodeTag>
              )}
              {free ? (
                <Tag color="success" style={{ borderRadius: 100, border: 'none', padding: '2px 10px' }}>
                  <FormattedMessage id="create.model.free" defaultMessage="Free" />
                </Tag>
              ) : (
                <PriceTag>
                  <DollarOutlined />
                  {model.tokenCost} Token
                  <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>{intl.formatMessage({ id: 'create.model.price.perSecond', defaultMessage: '/ sec' })}</span>
                </PriceTag>
              )}
            </MetaRow>

            {/* 操作栏 */}
            <ActionBar>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Tooltip title={intl.formatMessage({ id: 'create.model.like', defaultMessage: 'Like' })}>
                  <Button 
                    shape="circle" 
                    size="large" 
                    type={isLiked ? "primary" : "default"} 
                    danger={isLiked}
                    icon={likeLoading ? <LoadingOutlined /> : (isLiked ? <HeartFilled /> : <HeartOutlined />)} 
                    onClick={handleLike}
                    disabled={likeLoading}
                  />
                </Tooltip>
                <span style={{ fontSize: 12, color: '#999', minHeight: 18 }}>{likesCount > 0 ? likesCount : ''}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Tooltip title={intl.formatMessage({ id: 'create.model.favorite', defaultMessage: 'Favorite' })}>
                  <Button 
                    shape="circle" 
                    size="large" 
                    type={isFavorited ? "primary" : "default"} 
                    icon={favoriteLoading ? <LoadingOutlined /> : (isFavorited ? <StarFilled /> : <StarOutlined />)} 
                    onClick={handleFavorite}
                    disabled={favoriteLoading}
                    style={isFavorited ? { backgroundColor: '#faad14', borderColor: '#faad14' } : {}}
                  />
                </Tooltip>
                <span style={{ fontSize: 12, color: '#999', minHeight: 18 }}>{favoritesCount > 0 ? favoritesCount : ''}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Tooltip title={intl.formatMessage({ id: 'create.model.share', defaultMessage: 'Share' })}>
                  <Button shape="circle" size="large" icon={<ShareAltOutlined />} onClick={handleShare} />
                </Tooltip>
                <span style={{ fontSize: 12, color: 'transparent', minHeight: 18 }}>&nbsp;</span>
              </div>
            </ActionBar>

            {/* 描述文本 */}
            {getModelDescription(model, intl.locale || '') && (
              <Paragraph 
                type="secondary" 
                ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                style={{ fontSize: 14, lineHeight: 1.6 }}
              >
                {getModelDescription(model, intl.locale || '')}
              </Paragraph>
            )}
          </HeaderSection>

          {/* 功能与参数 */}
          
          {/* 1. 核心能力 */}
          <SectionTitle>
            <CheckCircleOutlined /> 
            <FormattedMessage id="create.model.capabilities" defaultMessage="Capabilities" />
          </SectionTitle>
          <FeatureList>
            <FeatureTag>
              <CheckOutlined /> {intl.formatMessage({ id: 'create.model.capability.t2v', defaultMessage: 'T2V (Text to Video)' })}
            </FeatureTag>
            {model.supportImg2video && (
              <FeatureTag>
                <CheckOutlined /> {intl.formatMessage({ id: 'create.model.capability.img2video', defaultMessage: 'Img2Video' })}
              </FeatureTag>
            )}
            {model.supportVideoEdit && (
              <FeatureTag>
                <CheckOutlined /> {intl.formatMessage({ id: 'create.model.capability.videoEdit', defaultMessage: 'Video Edit' })}
              </FeatureTag>
            )}
            {model.supportCharacterConsistency && (
              <FeatureTag>
                <CheckOutlined /> {intl.formatMessage({ id: 'create.model.capability.characterConsistency', defaultMessage: 'Character Consistency' })}
              </FeatureTag>
            )}
            {model.supportReference && (
              <FeatureTag>
                <CheckOutlined /> {intl.formatMessage({ id: 'create.model.capability.reference', defaultMessage: 'Reference' })}
              </FeatureTag>
            )}
            {model.supportCameraMotion && (
              <FeatureTag>
                <CheckOutlined /> {intl.formatMessage({ id: 'create.model.capability.cameraMotion', defaultMessage: 'Camera Motion' })}
              </FeatureTag>
            )}
          </FeatureList>
          
          {/* 2. 技术参数 Grid */}
          <InfoGrid>
            {/* 视频比例卡片 */}
            {aspectRatios.length > 0 && (
              <InfoCard>
                <BorderOutlined className="card-icon" />
                <span className="card-title">{intl.formatMessage({ id: 'create.model.aspectRatios', defaultMessage: 'Aspect Ratios' })}</span>
                <div className="card-content" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {aspectRatios.slice(0, 3).map((ratio) => {
                    const ratioOption = getAspectRatioOption(ratio, intl);
                    return (
                      <Tag key={ratio} style={{ margin: 0, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {ratioOption.icon}
                        {ratio}
                      </Tag>
                    );
                  })}
                  {aspectRatios.length > 3 && (
                    <Tag style={{ margin: 0, fontSize: 10 }}>+{aspectRatios.length - 3}</Tag>
                  )}
                </div>
              </InfoCard>
            )}

            {/* 分辨率卡片 */}
            {(model.videoDefaultResolution || model.videoMaxResolution) && (
              <InfoCard>
                <DesktopOutlined className="card-icon" />
                <span className="card-title">{intl.formatMessage({ id: 'create.model.resolution', defaultMessage: 'Resolution' })}</span>
                <div className="card-content">
                  {model.videoDefaultResolution && <div>{intl.formatMessage({ id: 'create.model.resolution.default', defaultMessage: 'Default' })}: {model.videoDefaultResolution}</div>}
                  {model.videoMaxResolution && <div style={{ fontSize: 12, opacity: 0.7 }}>{intl.formatMessage({ id: 'create.model.resolution.max', defaultMessage: 'Max' })}: {model.videoMaxResolution}</div>}
                </div>
              </InfoCard>
            )}

            {/* 时长卡片 */}
            {model.videoDuration && (
              <InfoCard>
                <ClockCircleOutlined className="card-icon" />
                <span className="card-title">{intl.formatMessage({ id: 'create.model.duration', defaultMessage: 'Duration' })}</span>
                <div className="card-content">
                  {intl.formatMessage({ id: 'create.model.resolution.max', defaultMessage: 'Max' })}: {model.videoDuration}s
                </div>
              </InfoCard>
            )}

            {/* 格式卡片 */}
            {model.videoFormats && (
              <InfoCard>
                <FileImageOutlined className="card-icon" />
                <span className="card-title">{intl.formatMessage({ id: 'create.model.formats', defaultMessage: 'Formats' })}</span>
                <div className="card-content" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {model.videoFormats.split(',').slice(0, 3).map((format) => (
                    <Tag key={format} style={{ margin: 0, fontSize: 10 }}>{format.toUpperCase()}</Tag>
                  ))}
                  {model.videoFormats.split(',').length > 3 && (
                    <Tag style={{ margin: 0, fontSize: 10 }}>+{model.videoFormats.split(',').length - 3}</Tag>
                  )}
                </div>
              </InfoCard>
            )}
          </InfoGrid>

          {/* 底部 - 其他信息 */}
          {(model.videoSupportStyle || model.videoQuality) && (
            <div style={{ marginTop: 24 }}>
              {model.videoSupportStyle && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                  <FormattedMessage id="create.video.style" defaultMessage="视频风格" />: {model.videoSupportStyle.split(',').join(', ')}
                </Text>
              )}
              {model.videoQuality && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  <FormattedMessage id="create.video.quality" defaultMessage="视频质量" />: {model.videoQuality.split(',').join(', ')}
                </Text>
              )}
            </div>
          )}

        </ContentPanel>
      </Container>
    </ModalOverlay>
  );
};

export default ModelDetailModal;

