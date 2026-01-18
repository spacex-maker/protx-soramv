import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { formatSize } from './utils';

// 样式组件
interface OverlayImageProps {
  $width: number;
  $containerWidth: number;
  $containerHeight: number;
}

interface SliderHandleProps {
  $left: number;
}

const CompareContainer = styled.div`
  position: relative;
  max-width: 90%;
  height: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  z-index: 1;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;

  img {
    width: auto;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    display: block;
    border-radius: 8px;
    pointer-events: none;
    object-fit: contain;
  }
`;

const OverlayImage = styled.div<OverlayImageProps>`
  position: absolute;
  top: 0;
  left: 0;
  height: ${props => props.$containerHeight > 0 ? `${props.$containerHeight}px` : '100%'};
  width: ${props => props.$width}%;
  overflow: hidden;
  border-right: 2px solid #fff;
  background: transparent;
  border-radius: 8px 0 0 8px;

  img {
    width: ${props => props.$containerWidth}px;
    height: ${props => props.$containerHeight}px;
    max-width: none;
    max-height: none;
    object-fit: contain;
    display: block;
    border-radius: 8px 0 0 8px;
  }
`;

const SliderHandle = styled.div<SliderHandleProps>`
  position: absolute;
  top: 50%;
  left: ${props => props.$left}%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  z-index: 10;
  color: #333;

  &::after {
    content: '';
    position: absolute;
    top: -100vh;
    bottom: -100vh;
    left: 50%;
    width: 2px;
    background: rgba(255,255,255,0.5);
    transform: translateX(-50%);
    pointer-events: none;
    z-index: -1;
  }
`;

const CompareWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 90%;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const LabelBadge = styled.div`
  padding: 6px 12px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  max-width: 100%;
  &.original { align-self: flex-start; }
  &.compressed { align-self: flex-end; }
  
  @media (min-width: 640px) {
    white-space: nowrap;
  }
  
  @media (max-width: 640px) {
    align-self: stretch !important;
  }
`;

export interface ImageCompareProps {
  originalImage: string;
  compressedImage: string;
  originalSize: number;
  compressedSize: number;
}

const ImageCompare: React.FC<ImageCompareProps> = ({
  originalImage,
  compressedImage,
  originalSize,
  compressedSize
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundImgRef = useRef<HTMLImageElement>(null);
  const originalImgRef = useRef<HTMLImageElement>(null);
  const [containerDim, setContainerDim] = useState({ w: 0, h: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [compressedDimensions, setCompressedDimensions] = useState({ width: 0, height: 0 });

  const updateImageDimensions = () => {
    if (backgroundImgRef.current) {
      // 获取图片的实际渲染尺寸（不是自然尺寸）
      const img = backgroundImgRef.current;
      const actualWidth = img.clientWidth || img.offsetWidth;
      const actualHeight = img.clientHeight || img.offsetHeight;
      
      if (actualWidth > 0 && actualHeight > 0) {
        setContainerDim({ w: actualWidth, h: actualHeight });
      }
    }
  };

  const updateImageNaturalDimensions = () => {
    // 获取原始图片的自然尺寸
    if (originalImgRef.current) {
      const img = originalImgRef.current;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    }
    
    // 获取压缩后图片的自然尺寸
    if (backgroundImgRef.current && compressedImage) {
      const img = backgroundImgRef.current;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setCompressedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    } else if (backgroundImgRef.current && !compressedImage) {
      // 如果还没有压缩后的图片，使用原始图片尺寸作为压缩后的尺寸
      const img = backgroundImgRef.current;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setCompressedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  useEffect(() => {
    // 图片加载完成后更新尺寸
    updateImageDimensions();
    updateImageNaturalDimensions();
    
    // 监听窗口大小变化
    const handleResize = () => {
      updateImageDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 使用 ResizeObserver 监听容器尺寸变化
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateImageDimensions();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [originalImage, compressedImage]);

  return (
    <CompareWrapper>
      <LabelContainer>
        <LabelBadge className="original">
          <FormattedMessage id="imageCompress.original" defaultMessage="原图" /> ({formatSize(originalSize)})
          {originalDimensions.width > 0 && originalDimensions.height > 0 && (
            <> · {originalDimensions.width}×{originalDimensions.height}</>
          )}
        </LabelBadge>
        <LabelBadge className="compressed">
          <FormattedMessage id="imageCompress.compressed" defaultMessage="压缩后" /> ({formatSize(compressedSize)})
          {compressedDimensions.width > 0 && compressedDimensions.height > 0 && (
            <> · {compressedDimensions.width}×{compressedDimensions.height}</>
          )}
        </LabelBadge>
      </LabelContainer>
      
      <CompareContainer
        ref={containerRef}
        onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
        onClick={handleMouseMove}
      >
        <img
          ref={backgroundImgRef}
          src={compressedImage || originalImage || ''}
          alt="Background"
          onLoad={() => {
            updateImageDimensions();
            updateImageNaturalDimensions();
          }}
        />

        <OverlayImage
          $width={sliderPos}
          $containerWidth={containerDim.w}
          $containerHeight={containerDim.h}
        >
          <img 
            ref={originalImgRef}
            src={originalImage || ''} 
            alt="Overlay"
            onLoad={updateImageNaturalDimensions}
          />
        </OverlayImage>

        <SliderHandle $left={sliderPos}>
          <ArrowLeftOutlined style={{ fontSize: 10, marginRight: 2 }} />
          <ArrowRightOutlined style={{ fontSize: 10, marginLeft: 2 }} />
        </SliderHandle>
      </CompareContainer>
    </CompareWrapper>
  );
};

export default ImageCompare;

