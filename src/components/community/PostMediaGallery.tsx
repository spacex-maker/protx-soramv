import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { buildLoginPath } from 'utils/loginRedirect';
import PostShelfToggle from 'components/community/PostShelfToggle';
import { addTencentImageCompression } from 'pages/Community/ChallengeDetailPage/utils';
import {
  buildGalleryPlan,
  cssAspectRatio,
  ImageDimensions,
  parseGenerationDimensions,
} from 'utils/postGalleryLayout';

const GalleryRoot = styled.div<{ $columns: string; $rows: string; $gap: string; $count: number }>`
  display: grid;
  width: 100%;
  grid-template-columns: ${({ $columns }) => $columns};
  grid-template-rows: ${({ $rows }) => $rows};
  gap: ${({ $gap }) => $gap};

  @media (max-width: 768px) {
    ${({ $count }) => $count === 1 && `gap: 0;`}
    ${({ $count }) => $count === 2 && `grid-template-columns: 1fr 1fr; grid-template-rows: auto;`}
    ${({ $count }) => $count === 3 && `grid-template-columns: 1fr 1fr; grid-template-rows: auto auto;`}
    ${({ $count }) => $count >= 4 && $count <= 6 && `grid-template-columns: repeat(2, 1fr); grid-template-rows: auto;`}
    ${({ $count }) => $count >= 7 && `grid-template-columns: repeat(2, 1fr); grid-template-rows: auto;`}
  }
`;

const GalleryCell = styled.div<{
  $column: string;
  $row: string;
  $aspectRatio?: string;
  $single?: boolean;
  $maxHeightVh?: number;
  $delisted?: boolean;
}>`
  position: relative;
  grid-column: ${({ $column }) => $column};
  grid-row: ${({ $row }) => $row};
  border-radius: ${({ $single }) => ($single ? '24px' : '16px')};
  overflow: hidden;
  background: ${(p) => (p.theme.mode === 'dark' ? '#1f1f1f' : '#f8f8f8')};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-height: 0;
  min-width: 0;
  cursor: zoom-in;

  ${({ $aspectRatio, $single, $maxHeightVh }) => ($single && $maxHeightVh
    ? `
      max-height: min(${$maxHeightVh}vh, 920px);
      aspect-ratio: ${$aspectRatio || '4 / 3'};
    `
    : $aspectRatio
      ? `aspect-ratio: ${$aspectRatio};`
      : `aspect-ratio: 1; min-height: 160px;`)}

  .ant-image,
  .ant-image-img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .ant-image-img {
    object-fit: ${({ $single }) => ($single ? 'contain' : 'cover')};
    object-position: center;
    transition: transform 0.3s ease, filter 0.3s ease, opacity 0.3s ease;
  }

  &:hover .ant-image-img {
    transform: scale(${({ $single }) => ($single ? '1' : '1.02')});
  }

  &:hover .preview-mask {
    opacity: 1;
  }

  ${({ $delisted }) => $delisted && `
    .ant-image-img {
      filter: grayscale(100%);
      opacity: 0.55;
    }
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.12);
      pointer-events: none;
      z-index: 2;
    }
  `}

  @media (max-width: 768px) {
    border-radius: ${({ $single }) => ($single ? '16px' : '12px')};
    grid-column: auto !important;
    grid-row: auto !important;
    ${({ $single, $maxHeightVh }) => $single && `max-height: min(${($maxHeightVh || 70) - 4}vh, 640px);`}
  }
`;

const PreviewMask = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
`;

const IndexBadge = styled.span`
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 4;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  pointer-events: none;
`;

const HiddenPreviewHost = styled.div`
  display: none;
`;

export interface PostMediaGalleryProps {
  urls: string[];
  delisted?: boolean;
  postId?: number;
  postStatus?: number;
  canModerate?: boolean;
  onShelfStatusChange?: (postId: number, status: number) => void;
  generationParams?: string | Record<string, unknown> | null;
  /** 登录回跳后自动打开原图预览 */
  initialPreview?: { open: boolean; index: number } | null;
}

const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({
  urls,
  delisted = false,
  postId,
  postStatus,
  canModerate = false,
  onShelfStatusChange,
  generationParams,
  initialPreview = null,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [previewState, setPreviewState] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });

  const promptLoginForOriginal = useCallback((returnTo: string) => {
    message.warning(
      intl.formatMessage({
        id: 'post.viewOriginal.loginRequired',
        defaultMessage: '登录后可查看原图',
      })
    );
    navigate(buildLoginPath(returnTo));
  }, [intl, navigate]);

  const openOriginalPreview = useCallback(
    (index: number) => {
      if (!localStorage.getItem('token')) {
        const returnTo = postId
          ? `/community/post/${postId}?previewOpen=1&previewIndex=${index}&viewOriginal=1`
          : `${window.location.pathname}${window.location.search}`;
        promptLoginForOriginal(returnTo);
        return;
      }
      setPreviewState({ open: true, index });
    },
    [promptLoginForOriginal, postId]
  );

  useEffect(() => {
    if (!initialPreview?.open) return;
    if (!localStorage.getItem('token')) return;
    setPreviewState({ open: true, index: initialPreview.index ?? 0 });
  }, [initialPreview?.open, initialPreview?.index]);

  const fallbackDimensions = useMemo(
    () => parseGenerationDimensions(generationParams),
    [generationParams]
  );

  const [dimensionsMap, setDimensionsMap] = useState<Record<number, ImageDimensions>>({});

  const dimensionsList = useMemo(
    () => urls.map((_, index) => dimensionsMap[index] || fallbackDimensions || null),
    [urls, dimensionsMap, fallbackDimensions]
  );

  const plan = useMemo(
    () => buildGalleryPlan(urls.length, dimensionsList),
    [urls.length, dimensionsList]
  );

  const handleImageLoad = useCallback((index: number, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    setDimensionsMap((prev) => {
      const existing = prev[index];
      if (existing && existing.width === img.naturalWidth && existing.height === img.naturalHeight) {
        return prev;
      }
      return { ...prev, [index]: { width: img.naturalWidth, height: img.naturalHeight } };
    });
  }, []);

  if (!urls.length) return null;

  return (
    <>
      <GalleryRoot
        $columns={plan.gridTemplateColumns}
        $rows={plan.gridTemplateRows}
        $gap={plan.gap}
        $count={urls.length}
      >
        {urls.map((url, index) => {
          const cell = plan.cells[index] || { gridColumn: '1', gridRow: `${index + 1}` };
          const dimensions = dimensionsList[index];
          const aspectRatio = cssAspectRatio(dimensions);
          const isSingle = urls.length === 1;

          return (
            <GalleryCell
              key={`${url}-${index}`}
              $column={cell.gridColumn}
              $row={cell.gridRow}
              $aspectRatio={aspectRatio}
              $single={isSingle}
              $maxHeightVh={plan.singleMaxHeightVh}
              $delisted={delisted}
              onClick={() => openOriginalPreview(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openOriginalPreview(index);
                }
              }}
            >
              <Image
                src={addTencentImageCompression(url, { quality: 30 })}
                alt={`Creation ${index + 1}`}
                loading={index < 4 ? 'eager' : 'lazy'}
                preview={false}
                onLoad={(e) => handleImageLoad(index, e)}
              />
              <PreviewMask className="preview-mask">
                <FormattedMessage id="post.viewOriginal" defaultMessage="原图" />
              </PreviewMask>
              {urls.length > 1 && (
                <IndexBadge>
                  {index + 1}/{urls.length}
                </IndexBadge>
              )}
              {canModerate && index === 0 && postId != null && (
                <PostShelfToggle
                  postId={postId}
                  status={postStatus}
                  onStatusChange={onShelfStatusChange}
                />
              )}
            </GalleryCell>
          );
        })}
      </GalleryRoot>

      <HiddenPreviewHost aria-hidden>
        <Image.PreviewGroup
          preview={{
            visible: previewState.open,
            current: previewState.index,
            onVisibleChange: (visible) => {
              if (!visible) {
                setPreviewState((prev) => ({ ...prev, open: false }));
              }
            },
            onChange: (current) => {
              setPreviewState((prev) => ({ ...prev, index: current }));
            },
          }}
        >
          {urls.map((url) => (
            <Image key={url} src={url} />
          ))}
        </Image.PreviewGroup>
      </HiddenPreviewHost>
    </>
  );
};

export default PostMediaGallery;
