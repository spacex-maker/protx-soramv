import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 32px;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`;

const Stage = styled.div`
  position: relative;
  width: min(92vw, 760px);
  height: min(72vh, 820px);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: pan-y;
  user-select: none;
`;

const StackCard = styled.div<{ $offset: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(88vw, 680px);
  max-height: min(68vh, 760px);
  transform: translate(-50%, -50%)
    translateX(${({ $offset }) => $offset * 76}px)
    scale(${({ $offset }) => Math.max(0.8, 1 - Math.abs($offset) * 0.055)})
    translateZ(${({ $offset }) => -Math.abs($offset) * 48}px);
  opacity: ${({ $offset }) => {
    const abs = Math.abs($offset);
    if (abs === 0) return 1;
    if (abs === 1) return 0.36;
    if (abs === 2) return 0.18;
    return 0;
  }};
  z-index: ${({ $offset }) => 30 - Math.abs($offset)};
  pointer-events: ${({ $offset }) => (Math.abs($offset) <= 2 ? 'auto' : 'none')};
  cursor: ${({ $offset }) => ($offset !== 0 ? 'pointer' : 'default')};
  transition:
    transform 0.42s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.35s ease,
    filter 0.35s ease;
  filter: ${({ $offset }) => (Math.abs($offset) > 0 ? 'brightness(0.92)' : 'none')};
  box-shadow: ${({ $offset }) =>
    $offset === 0
      ? '0 24px 64px rgba(0, 0, 0, 0.45)'
      : '0 8px 24px rgba(0, 0, 0, 0.25)'};

  img {
    display: block;
    width: 100%;
    max-height: min(68vh, 760px);
    object-fit: contain;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    pointer-events: none;
  }
`;

const NavBtn = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === 'left' ? 'left: 8px;' : 'right: 8px;')}
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  z-index: 40;
  transition: background 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.26);
  }

  &:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
    ${({ $side }) => ($side === 'left' ? 'left: 4px;' : 'right: 4px;')}
  }
`;

const Footer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.85);
`;

const Counter = styled.div`
  font-size: 14px;
  letter-spacing: 0.04em;
`;

const Dots = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? 10 : 7)}px;
  height: ${({ $active }) => ($active ? 10 : 7)}px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#fff' : 'rgba(255, 255, 255, 0.35)')};
  transition: all 0.25s ease;
`;

export interface PostStackImagePreviewProps {
  open: boolean;
  images: string[];
  currentIndex?: number;
  onChange?: (index: number) => void;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 48;

const PostStackImagePreview: React.FC<PostStackImagePreviewProps> = ({
  open,
  images,
  currentIndex: controlledIndex,
  onChange,
  onClose,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const currentIndex = controlledIndex ?? internalIndex;

  const setIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, next));
      if (onChange) {
        onChange(clamped);
      } else {
        setInternalIndex(clamped);
      }
    },
    [images.length, onChange]
  );

  useEffect(() => {
    if (open) {
      setInternalIndex(0);
    }
  }, [open, images]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(currentIndex - 1);
      if (e.key === 'ArrowRight') setIndex(currentIndex + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, currentIndex, onClose, setIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || images.length === 0) {
    return null;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) {
      setIndex(currentIndex + 1);
    } else {
      setIndex(currentIndex - 1);
    }
  };

  const content = (
    <Overlay
      role="dialog"
      aria-modal
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <CloseBtn type="button" aria-label="Close" onClick={onClose}>
        <CloseOutlined />
      </CloseBtn>

      <Stage onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {currentIndex > 0 && (
          <NavBtn
            type="button"
            $side="left"
            aria-label="Previous"
            onClick={() => setIndex(currentIndex - 1)}
          >
            <LeftOutlined />
          </NavBtn>
        )}

        {images.map((src, index) => {
          const offset = index - currentIndex;
          if (Math.abs(offset) > 2) return null;
          return (
            <StackCard
              key={`${src}-${index}`}
              $offset={offset}
              onClick={(e) => {
                e.stopPropagation();
                if (offset !== 0) {
                  setIndex(index);
                }
              }}
            >
              <img src={src} alt="" draggable={false} />
            </StackCard>
          );
        })}

        {currentIndex < images.length - 1 && (
          <NavBtn
            type="button"
            $side="right"
            aria-label="Next"
            onClick={() => setIndex(currentIndex + 1)}
          >
            <RightOutlined />
          </NavBtn>
        )}
      </Stage>

      {images.length > 1 && (
        <Footer>
          <Counter>
            {currentIndex + 1} / {images.length}
          </Counter>
          <Dots>
            {images.map((_, index) => (
              <Dot
                key={index}
                type="button"
                $active={index === currentIndex}
                aria-label={`Image ${index + 1}`}
                onClick={() => setIndex(index)}
              />
            ))}
          </Dots>
        </Footer>
      )}
    </Overlay>
  );

  return createPortal(content, document.body);
};

export default PostStackImagePreview;
