import React from 'react';
import { createPortal } from 'react-dom';
import { Button, Tag, Typography } from 'antd';
import { CloseOutlined, SoundOutlined } from '@ant-design/icons';
import styled, { css } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { EngineModel } from './engineTypes';
import {
  formatEngineTokenCost,
  getEngineDescription,
  getEngineDisplayName,
  isPerCharUnit,
  isVideoUrl,
  modelCoverUrl,
} from './engineUtils';

const { Text, Paragraph } = Typography;

const ModalOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
  backdrop-filter: blur(8px);
  opacity: ${props => props.$open ? 1 : 0};
  visibility: ${props => props.$open ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Container = styled.div`
  width: 860px;
  max-width: 95vw;
  height: 560px;
  max-height: 90vh;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;

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

const VisualPanel = styled.div<{ $coverImage?: string | null; $isVideo?: boolean }>`
  flex: 0 0 42%;
  position: relative;
  background-color: ${props => props.theme.mode === 'dark' ? '#000' : '#f0f2f5'};
  overflow: hidden;

  ${props => props.$coverImage && !props.$isVideo && css`
    background-image: url(${props.$coverImage});
    background-size: cover;
    background-position: center;
  `}

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
  }
`;

const VisualPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(19, 194, 194, 0.3), rgba(131, 56, 236, 0.3));
  font-size: 64px;
  color: rgba(255, 255, 255, 0.5);
`;

const InfoPanel = styled.div`
  flex: 1;
  padding: 36px 32px 28px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const PriceBox = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(82, 196, 26, 0.12)' : 'rgba(82, 196, 26, 0.08)'};
  margin: 16px 0 20px;
  width: fit-content;

  .amount {
    font-size: 22px;
    font-weight: 700;
    color: #52c41a;
  }

  .unit {
    font-size: 13px;
    color: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#8c8c8c'};
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

interface EngineDetailModalProps {
  open: boolean;
  engine: EngineModel | null;
  locale: string;
  onClose: () => void;
  onSelect?: (engine: EngineModel) => void;
}

const EngineDetailModal: React.FC<EngineDetailModalProps> = ({
  open,
  engine,
  locale,
  onClose,
  onSelect,
}) => {
  if (typeof document === 'undefined') return null;

  const cover = engine ? modelCoverUrl(engine) : null;
  const isVideo = Boolean(cover && isVideoUrl(cover));
  const displayName = engine ? getEngineDisplayName(engine, locale) : '';
  const description = engine ? getEngineDescription(engine, locale) : undefined;
  const perChar = engine ? isPerCharUnit(engine.unit) : false;

  return createPortal(
    <ModalOverlay $open={open} onClick={onClose}>
      <Container onClick={e => e.stopPropagation()}>
        <CloseButton type="button" onClick={onClose} aria-label="close">
          <CloseOutlined />
        </CloseButton>

        <VisualPanel $coverImage={cover} $isVideo={isVideo}>
          {isVideo && cover ? (
            <video src={cover} autoPlay loop muted playsInline preload="metadata" />
          ) : !cover ? (
            <VisualPlaceholder>
              <SoundOutlined />
            </VisualPlaceholder>
          ) : null}
        </VisualPanel>

        <InfoPanel>
          <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            TTS Engine
          </Text>
          <Typography.Title level={3} style={{ margin: '8px 0 0' }}>
            {displayName}
          </Typography.Title>

          <MetaRow>
            {engine?.modelCode && (
              <Tag bordered={false} color="cyan">{engine.modelCode}</Tag>
            )}
            {engine?.companyName && (
              <Tag bordered={false}>{engine.companyName}</Tag>
            )}
            <Tag bordered={false} color="geekblue">Doubao TTS</Tag>
          </MetaRow>

          {engine && engine.tokenCost !== null && engine.tokenCost !== undefined && (
            <PriceBox>
              <span className="amount">{formatEngineTokenCost(engine)}</span>
              <span className="unit">Token</span>
              <span className="unit">
                {perChar ? (
                  <FormattedMessage id="create.model.price.perChar" defaultMessage="/字" />
                ) : (
                  <FormattedMessage id="create.model.price.perSecond" defaultMessage="/秒" />
                )}
              </span>
            </PriceBox>
          )}

          {description ? (
            <Paragraph style={{ marginBottom: 24, color: 'inherit', opacity: 0.85 }}>
              {description}
            </Paragraph>
          ) : (
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              <FormattedMessage id="create.speech.engineNoDesc" defaultMessage="高质量语音合成引擎，支持多音色与情感控制。" />
            </Paragraph>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', gap: 12 }}>
            {onSelect && engine && (
              <Button
                type="primary"
                size="large"
                icon={<SoundOutlined />}
                onClick={() => {
                  onSelect(engine);
                  onClose();
                }}
              >
                <FormattedMessage id="create.speech.useThisEngine" defaultMessage="使用此引擎" />
              </Button>
            )}
            <Button size="large" onClick={onClose}>
              <FormattedMessage id="common.close" defaultMessage="关闭" />
            </Button>
          </div>
        </InfoPanel>
      </Container>
    </ModalOverlay>,
    document.body,
  );
};

export default EngineDetailModal;
