import styled from 'styled-components';

export type ShotStudioTab = 'script' | 'visual' | 'video';

export const StudioSection = styled.div`
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.015);
  margin-bottom: 12px;

  .dark & {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }
`;

export const StudioSectionTitle = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
`;

export const FramePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

export const FrameSlotLabel = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);

  .dark & {
    color: rgba(255, 255, 255, 0.65);
  }
`;

export const FrameMedia = styled.div<{ $aspectRatio: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
  border-radius: 8px;
  overflow: hidden;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;

  .dark & {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
  }

  img,
  .ant-image,
  .ant-image-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ant-image {
    width: 100%;
    height: 100%;
  }
`;

export const FrameEmpty = styled.div`
  text-align: center;
  padding: 10px 8px;
`;

export const FrameActions = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const toCssAspectRatio = (ratio?: string) => {
  if (!ratio?.includes(':')) return '16 / 9';
  const [w, h] = ratio.split(':');
  return `${Number(w) || 16} / ${Number(h) || 9}`;
};

export const isDisplayableImageUrl = (url?: string | null): url is string =>
  !!url && (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:'));
