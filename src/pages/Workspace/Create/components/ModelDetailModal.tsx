import React, { useEffect, useState, useCallback } from 'react';
import { Tag, Typography, message, Tooltip, Divider, Button } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  FileImageOutlined,
  DesktopOutlined,
  DesktopOutlined as DesktopIcon,
  MobileOutlined,
  TabletOutlined,
  VideoCameraOutlined,
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
  LoadingOutlined,
} from '@ant-design/icons';
import styled, { css } from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  likeModel,
  unlikeModel,
  favoriteModel,
  unfavoriteModel,
  getInteractionStatus,
  ModelInteractionResponse,
} from 'api/modelInteraction';
import { getModelDescription } from './modelUtils';

const { Text, Title, Paragraph } = Typography;

// --- 类型定义 (保持不变) ---
export interface ModelFamily {
  id: number;
  modelName: string;
  modelCode: string;
  description: string;
  descriptionEn?: string | null;
  imageDefaultResolution: string | null;
  imageMaxResolution: string | null;
  imageAspectRatios: string | null;
  imageFormats: string | null;
  supportControlnet: boolean;
  supportInpaint: boolean;
  supportReference: boolean;
  currency: string | null;
  outputPrice: number | null;
  companyCode?: string | null;
  releaseYear?: string | null;
  status?: boolean;
  coverImage?: string | null;
  likesCount?: number;
  favoritesCount?: number;
}

export interface Model {
  id: number;
  modelName: string;
  modelCode: string;
  description: string;
  descriptionEn?: string | null;
  imageDefaultResolution: string | null;
  imageMaxResolution: string | null;
  imageAspectRatios: string | null;
  imageFormats: string | null;
  supportControlnet: boolean;
  supportInpaint: boolean;
  supportReference: boolean;
  currency: string | null;
  outputPrice: number | null;
  coverImage: string | null;
  likesCount?: number;
  favoritesCount?: number;
}

export type ModelDetail = ModelFamily | Model;

// --- 工具函数 (保持不变) ---
const isFree = (outputPrice: number | null | undefined, currency: string | null | undefined, unit?: string | null | undefined): boolean => {
  if (outputPrice === null || outputPrice === undefined || outputPrice === 0) return true;
  if (!currency || currency.trim() === '') return true;
  if (unit !== undefined && (!unit || unit.trim() === '')) return true;
  return false;
};

const getAspectRatioOption = (ratio: string, intl: any) => {
  const ratioMap: { [key: string]: { labelKey: string; defaultLabel: string; icon: React.ReactNode } } = {
    '16:9': { labelKey: 'create.aspectRatio.16:9', defaultLabel: '16:9 (Landscape)', icon: <DesktopIcon /> },
    '9:16': { labelKey: 'create.aspectRatio.9:16', defaultLabel: '9:16 (Portrait)', icon: <MobileOutlined /> },
    '21:9': { labelKey: 'create.aspectRatio.21:9', defaultLabel: '21:9 (Cinema)', icon: <VideoCameraOutlined /> },
    '1:1': { labelKey: 'create.aspectRatio.1:1', defaultLabel: '1:1 (Square)', icon: <AppstoreOutlined /> },
    '4:3': { labelKey: 'create.aspectRatio.4:3', defaultLabel: '4:3 (Classic)', icon: <TabletOutlined /> },
    '3:4': { labelKey: 'create.aspectRatio.3:4', defaultLabel: '3:4 (Portrait Classic)', icon: <MobileOutlined /> },
  };
  const option = ratioMap[ratio];
  if (option) {
    return { label: intl.formatMessage({ id: option.labelKey, defaultMessage: option.defaultLabel }), value: ratio, icon: option.icon };
  }
  return { label: ratio, value: ratio, icon: <BorderOutlined /> };
};

// --- 新版样式组件 ---

const ModalOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
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
const VisualPanel = styled.div<{ coverImage?: string | null }>`
  flex: 0 0 40%;
  position: relative;
  background-color: ${props => props.theme.mode === 'dark' ? '#000' : '#f0f2f5'};
  overflow: hidden;

  /* 这种方式确保图片按比例填充且居中，类似电商详情页 */
  ${props => props.coverImage && css`
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
  model: ModelDetail | null;
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
      setLikesCount((model as any).likesCount || 0);
      setFavoritesCount((model as any).favoritesCount || 0);
    }
  }, [model?.id]);

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
    if (model?.coverImage) {
      const link = document.createElement('a');
      link.href = model.coverImage;
      link.download = `${model.modelName}-cover.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!model) return null;

  const coverImage = 'coverImage' in model && model.coverImage ? model.coverImage : null;
  const free = isFree(model.outputPrice, model.currency);

  return (
    <ModalOverlay open={open} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Container>
        {/* 左侧：视觉冲击区 */}
        <VisualPanel coverImage={coverImage}>
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
                  {model.outputPrice} {model.currency} 
                  <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>/ img</span>
                </PriceTag>
              )}
            </MetaRow>

            {/* 新的操作栏位置：紧跟标题，方便点击 */}
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

          {/* 功能与参数 - 紧凑型 Grid 布局 */}
          
          {/* 1. 核心能力 */}
          <SectionTitle>
            <CheckCircleOutlined /> 
            <FormattedMessage id="create.model.capabilities" defaultMessage="Capabilities" />
          </SectionTitle>
          <FeatureList>
             <FeatureTag>
                <CheckOutlined /> T2I (Text to Image)
             </FeatureTag>
             {model.supportControlnet && (
               <FeatureTag>
                 <CheckOutlined /> ControlNet
               </FeatureTag>
             )}
             {model.supportInpaint && (
               <FeatureTag>
                 <CheckOutlined /> Inpainting
               </FeatureTag>
             )}
             {model.supportReference && (
               <FeatureTag>
                 <CheckOutlined /> Reference
               </FeatureTag>
             )}
          </FeatureList>
          
          {/* 2. 技术参数 Grid */}
          <InfoGrid>
             {/* 分辨率卡片 */}
             {(model.imageDefaultResolution || model.imageMaxResolution) && (
               <InfoCard>
                 <DesktopOutlined className="card-icon" />
                 <span className="card-title">Resolution</span>
                 <div className="card-content">
                    {model.imageDefaultResolution && <div>Default: {model.imageDefaultResolution}</div>}
                    {model.imageMaxResolution && <div style={{ fontSize: 12, opacity: 0.7 }}>Max: {model.imageMaxResolution}</div>}
                 </div>
               </InfoCard>
             )}

             {/* 比例卡片 */}
             {model.imageAspectRatios && (
               <InfoCard>
                 <BorderOutlined className="card-icon" />
                 <span className="card-title">Aspect Ratios</span>
                 <div className="card-content" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {model.imageAspectRatios.split(',').slice(0, 3).map((r) => (
                      <Tag key={r} style={{ margin: 0, fontSize: 10 }}>{r}</Tag>
                    ))}
                    {model.imageAspectRatios.split(',').length > 3 && (
                      <Tag style={{ margin: 0, fontSize: 10 }}>+{model.imageAspectRatios.split(',').length - 3}</Tag>
                    )}
                 </div>
               </InfoCard>
             )}
          </InfoGrid>

          {/* 底部 - 格式支持 */}
          {model.imageFormats && (
            <div style={{ marginTop: 24 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                   <FileImageOutlined style={{ marginRight: 6 }}/>
                   Supported Formats: {model.imageFormats.split(',').join(', ').toUpperCase()}
                </Text>
            </div>
          )}

        </ContentPanel>
      </Container>
    </ModalOverlay>
  );
};

export default ModelDetailModal;