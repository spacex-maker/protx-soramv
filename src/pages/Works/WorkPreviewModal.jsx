import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Tag } from 'antd';
import {
  CloseOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  SoundOutlined,
} from '@ant-design/icons';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Shell = styled(motion.div)`
  width: min(1100px, 96vw);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: #0a0a0a;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 32px 64px rgba(0, 0, 0, 0.55);
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const TitleBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h3`
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.16);
    transform: rotate(90deg);
  }
`;

const Stage = styled.div`
  position: relative;
  flex: 1;
  min-height: 280px;
  max-height: calc(92vh - 160px);
  background:
    radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.12), transparent 45%),
    #050505;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
    opacity: 0.35;
  }
`;

const PreviewImage = styled.img`
  position: relative;
  z-index: 1;
  max-width: 100%;
  max-height: calc(92vh - 160px);
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  animation: ${fadeIn} 0.35s ease;
`;

const PreviewVideo = styled.video`
  position: relative;
  z-index: 1;
  width: 100%;
  max-height: calc(92vh - 160px);
  object-fit: contain;
  border-radius: 8px;
  background: #000;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  outline: none;
`;

const AudioStage = styled.div`
  position: relative;
  z-index: 1;
  width: min(560px, 90%);
  padding: 32px 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.18), rgba(19, 194, 194, 0.12));
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;

  .audio-icon {
    font-size: 48px;
    color: #69c0ff;
    margin-bottom: 16px;
  }

  .audio-title {
    color: rgba(255, 255, 255, 0.88);
    font-size: 15px;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  audio {
    width: 100%;
    height: 40px;
  }
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  ${props => props.$alignRight && css`
    margin-left: auto;
  `}

  @media (max-width: 640px) {
    width: 100%;

    .ant-btn {
      flex: 1;
    }
  }
`;

const WorkPreviewModal = ({
  open,
  work,
  onClose,
  onDownload,
  onShare,
  intl,
}) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (typeof document === 'undefined') return null;

  const typeIcon = work?.type === 'video'
    ? <VideoCameraOutlined />
    : work?.type === 'audio'
      ? <SoundOutlined />
      : <FileImageOutlined />;

  const typeColor = work?.type === 'video' ? 'blue' : work?.type === 'audio' ? 'purple' : 'green';

  return createPortal(
    <AnimatePresence>
      {open && work && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <Shell
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <TopBar>
              <TitleBlock>
                <Title title={work.title}>{work.title}</Title>
                <MetaRow>
                  <Tag color={typeColor} icon={typeIcon} style={{ margin: 0, border: 'none' }}>
                    {work.taskTypeLabel}
                  </Tag>
                  {work.model && <MetaChip>{work.model}</MetaChip>}
                  {work.voiceName && (
                    <MetaChip>
                      <SoundOutlined />
                      {work.voiceName}
                    </MetaChip>
                  )}
                  <MetaChip>
                    <CalendarOutlined />
                    {work.createdAt?.format('YYYY-MM-DD HH:mm')}
                  </MetaChip>
                  {work.creditsCost != null && (
                    <MetaChip>{work.creditsCost} Token</MetaChip>
                  )}
                </MetaRow>
              </TitleBlock>
              <CloseBtn type="button" onClick={onClose} aria-label="Close">
                <CloseOutlined />
              </CloseBtn>
            </TopBar>

            <Stage>
              {work.type === 'video' && work.url && (
                <PreviewVideo src={work.url} controls autoPlay playsInline preload="metadata" />
              )}
              {work.type === 'image' && (work.url || work.thumbnail) && (
                <PreviewImage src={work.url || work.thumbnail} alt={work.title} />
              )}
              {work.type === 'audio' && work.url && (
                <AudioStage>
                  <div className="audio-icon"><SoundOutlined /></div>
                  {work.voiceName && (
                    <div className="audio-title">
                      {intl.formatMessage({ id: 'create.speech.voice', defaultMessage: '音色' })}: {work.voiceName}
                    </div>
                  )}
                  <audio src={work.url} controls autoPlay preload="metadata" />
                </AudioStage>
              )}
            </Stage>

            <BottomBar>
              <MetaChip style={{ background: 'transparent', border: 'none', paddingLeft: 0 }}>
                {work.prompt?.trim() ? work.prompt.slice(0, 80) + (work.prompt.length > 80 ? '…' : '') : work.title}
              </MetaChip>
              <ActionGroup $alignRight>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => onDownload?.(work)}
                >
                  {intl.formatMessage({ id: 'works.download', defaultMessage: '下载' })}
                </Button>
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={() => onShare?.(work)}
                >
                  {intl.formatMessage({ id: 'works.share', defaultMessage: '分享' })}
                </Button>
              </ActionGroup>
            </BottomBar>
          </Shell>
        </Overlay>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default WorkPreviewModal;
