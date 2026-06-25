import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const MARGIN = 12;
const HEADER_SAFE_TOP = 56;
const DRAG_HANDLE_OFFSET = 36;

const Wrapper = styled.div`
  position: fixed;
  top: ${(props) => props.$top}px;
  right: ${(props) => props.$right}px;
  z-index: ${(props) => props.$zIndex || 100};
  transition: ${(props) => (props.$isDragging ? 'none' : 'all 0.2s ease')};
  user-select: none;
  max-width: calc(100vw - ${MARGIN * 2}px);
  box-sizing: border-box;

  > *:not([data-drag-handle]) {
    pointer-events: ${(props) => (props.$isDragging ? 'none' : 'auto')};
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: -${DRAG_HANDLE_OFFSET}px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 28px;
  cursor: ${(props) => (props.$isDragging ? 'grabbing' : 'grab')};
  z-index: 10;
  background: ${(props) =>
    props.$isDragging ? 'rgba(24, 144, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)'};
  transition: background 0.2s;
  border-radius: 14px 14px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  pointer-events: auto;
  touch-action: none;

  &:hover {
    background: rgba(24, 144, 255, 0.2);
  }

  &::before {
    content: '⋮⋮';
    color: ${(props) => (props.$isDragging ? '#1890ff' : 'rgba(0, 0, 0, 0.35)')};
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 2px;
  }

  @media (max-width: 768px) {
    width: 64px;
    height: 24px;
    top: -28px;
  }
`;

function getHandleOffset(viewportWidth) {
  return viewportWidth <= 768 ? 28 : DRAG_HANDLE_OFFSET;
}

function clampPosition(pos, size, viewport) {
  const handleOffset = getHandleOffset(viewport.width);
  const minTop = HEADER_SAFE_TOP + handleOffset;
  const maxRight = Math.max(MARGIN, viewport.width - size.width - MARGIN);
  const maxTop = Math.max(minTop, viewport.height - size.height - MARGIN);

  return {
    top: Math.min(Math.max(pos.top, minTop), maxTop),
    right: Math.min(Math.max(pos.right, MARGIN), maxRight),
  };
}

function getDefaultPosition(size, viewport) {
  const isNarrow = viewport.width <= 768;
  if (isNarrow) {
    return clampPosition(
      {
        top: viewport.height - size.height - MARGIN - 16,
        right: MARGIN,
      },
      size,
      viewport,
    );
  }
  return clampPosition({ top: 100, right: 40 }, size, viewport);
}

/**
 * 可拖动的悬浮卡片容器（支持触摸/窄屏边界约束）
 */
const DraggableFloatingCard = ({ children, zIndex = 100 }) => {
  const wrapperRef = useRef(null);
  const positionRef = useRef({ top: 100, right: 40 });
  const [position, setPosition] = useState({ top: 100, right: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragStartRef = useRef(null);
  const initializedRef = useRef(false);

  const measureSize = useCallback(() => {
    const el = wrapperRef.current;
    const viewportWidth = window.innerWidth;
    const width = el?.offsetWidth ?? Math.min(280, viewportWidth - MARGIN * 2);
    const bodyHeight = el?.offsetHeight ?? 64;
    const handleOffset = getHandleOffset(viewportWidth);
    return { width: Math.max(width, 48), height: bodyHeight + handleOffset };
  }, []);

  const measureAndClamp = useCallback(
    (pos) => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      return clampPosition(pos, measureSize(), viewport);
    },
    [measureSize],
  );

  const applyPosition = useCallback(
    (pos) => {
      const next = measureAndClamp(pos);
      positionRef.current = next;
      setPosition(next);
    },
    [measureAndClamp],
  );

  useEffect(() => {
    const syncPosition = () => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        applyPosition(getDefaultPosition(measureSize(), viewport));
        return;
      }
      applyPosition(positionRef.current);
    };

    requestAnimationFrame(syncPosition);
    window.addEventListener('resize', syncPosition);

    const el = wrapperRef.current;
    let ro;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => syncPosition());
      ro.observe(el);
    }

    return () => {
      window.removeEventListener('resize', syncPosition);
      if (ro) ro.disconnect();
    };
  }, [applyPosition, measureSize]);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    setIsDragging(true);
    setHasMoved(false);
    dragStartRef.current = {
      x: e.clientX - (window.innerWidth - positionRef.current.right),
      y: e.clientY - positionRef.current.top,
      startX: e.clientX,
      startY: e.clientY,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return undefined;

    const onMove = (e) => {
      const start = dragStartRef.current;
      if (!start) return;

      if (
        Math.abs(e.clientX - start.startX) > 5 ||
        Math.abs(e.clientY - start.startY) > 5
      ) {
        setHasMoved(true);
      }

      const newRight = window.innerWidth - e.clientX + start.x;
      const newTop = e.clientY - start.y;
      applyPosition({ top: newTop, right: newRight });
    };

    const onUp = () => {
      setTimeout(() => {
        setIsDragging(false);
        setHasMoved(false);
        dragStartRef.current = null;
      }, 100);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [isDragging, applyPosition]);

  return (
    <Wrapper
      ref={wrapperRef}
      $top={position.top}
      $right={position.right}
      $isDragging={isDragging || hasMoved}
      $zIndex={zIndex}
    >
      <DragHandle
        data-drag-handle="true"
        $isDragging={isDragging}
        onPointerDown={handlePointerDown}
        title="拖动以移动位置"
      />
      {children}
    </Wrapper>
  );
};

export default DraggableFloatingCard;
