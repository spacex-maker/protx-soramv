import styled, { css, keyframes } from 'styled-components';
import { Modal } from 'antd';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const StyledModal = styled(Modal)`
  .ant-modal-content {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0;
    height: 85vh;
    display: flex;
    flex-direction: column;
  }

  .ant-modal-header, .ant-modal-footer {
    display: none;
  }

  .ant-modal-body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

export const HeaderSection = styled.div<{ $bg: string }>`
  padding: 24px 32px;
  background: ${props => props.$bg};
  border-radius: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
  margin-bottom: 20px;
`;

export const HeaderTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
`;

export const CloseButton = styled.div<{ $hoverBg: string }>`
  cursor: pointer;
  padding: 8px 18px;
  background: ${props => props.$hoverBg}88;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: ${props => props.$hoverBg};
    transform: scale(1.05);
  }
`;

export const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ScrollableContent = styled.div<{ $scrollbar: string }>`
  flex: 1;
  overflow-y: auto;
  padding: 10px 4px 40px 4px;
  background: transparent;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 24px;
  align-content: start;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.$scrollbar}66;
    border-radius: 10px;
  }
`;

export const CardContainer = styled.div<{ $selected?: boolean; $bgContainer: string; $primary: string }>`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  background: ${props => props.$bgContainer};
  aspect-ratio: 3 / 4.2;
  border: 3px solid transparent;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  animation: ${fadeInUp} 0.5s ease-out backwards;
  contain: layout paint;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
    border-color: ${props => props.$primary}66;

    .card-image:not(video) { transform: scale(1.06); }
    .detail-btn { opacity: 1; transform: translate(-50%, -50%); }
  }

  ${props => props.$selected && css`
    border-color: ${props.$primary};
    transform: translateY(-4px);
    box-shadow: 0 10px 25px ${props.$primary}44;
  `}
`;

export const CardImageLayer = styled.div<{ $url: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$url});
  background-size: cover;
  background-position: center;
  transition: transform 0.4s ease;
`;

/** 悬停前不设置 src，避免弹窗打开时并发拉取多路视频 */
export const CardVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #0a0a0a;
  transform: translateZ(0);
  contain: layout paint;
`;

export const TopBadges = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  pointer-events: none;
`;

export const TagBadge = styled.div<{ $bg?: string; $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.$bg || 'rgba(0,0,0,0.72)'};
  color: ${props => props.$color || '#fff'};
`;

export const SelectIndicator = styled.div<{ $primary: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid #fff;
`;

export const CardContentGlass = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 2;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: none;
`;

export const ModelTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

export const PriceTag = styled.span<{ $isFree?: boolean }>`
  color: ${props => props.$isFree ? '#52c41a' : '#ffd700'};
  font-weight: 800;
  font-size: 12px;
`;

export const DetailButtonOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -40%);
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
  z-index: 3;
`;

export const GlassButton = styled.button`
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;

  &:hover {
    background: rgba(0, 0, 0, 0.72);
  }
`;
