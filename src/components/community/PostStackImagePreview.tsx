import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { ZoomInOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { buildLoginPath } from 'utils/loginRedirect';

const TopBar = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2001;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
`;

const OriginalBtn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.12)')};
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`;

const ModeHint = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.25);
`;

export interface PostStackImagePreviewProps {
  open: boolean;
  images: string[];
  /** 未压缩的原图 URL，与 images 索引一一对应 */
  originalImages?: string[];
  currentIndex?: number;
  onChange?: (index: number) => void;
  onClose: () => void;
  /** 未登录跳转登录页后，登录成功应回到的地址 */
  loginReturnTo?: string;
  /** 登录回跳后自动进入原图模式 */
  initialShowOriginal?: boolean;
}

const PostStackImagePreview: React.FC<PostStackImagePreviewProps> = ({
  open,
  images,
  originalImages,
  currentIndex = 0,
  onChange,
  onClose,
  loginReturnTo,
  initialShowOriginal = false,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [showOriginal, setShowOriginal] = useState(false);

  const originals = originalImages && originalImages.length === images.length
    ? originalImages
    : images;

  useEffect(() => {
    if (!open) {
      setShowOriginal(false);
      return;
    }
    if (initialShowOriginal && localStorage.getItem('token')) {
      setShowOriginal(true);
    } else if (!initialShowOriginal) {
      setShowOriginal(false);
    }
  }, [open, initialShowOriginal]);

  useEffect(() => {
    setShowOriginal(false);
  }, [currentIndex]);

  const handleViewOriginal = useCallback(() => {
    if (!localStorage.getItem('token')) {
      message.warning(
        intl.formatMessage({
          id: 'post.viewOriginal.loginRequired',
          defaultMessage: '登录后可查看原图',
        })
      );
      navigate(buildLoginPath(
        loginReturnTo || `${window.location.pathname}${window.location.search}`
      ));
      return;
    }
    setShowOriginal(true);
  }, [intl, navigate, loginReturnTo]);

  const sliderImages = useMemo(() => {
    const urls = showOriginal ? originals : images;
    return urls.map((src, index) => ({
      src,
      key: `${showOriginal ? 'original' : 'preview'}-${index}-${src}`,
    }));
  }, [showOriginal, originals, images]);

  if (!images.length) {
    return null;
  }

  return (
    <PhotoSlider
      images={sliderImages}
      visible={open}
      onClose={onClose}
      index={currentIndex}
      onIndexChange={(index) => onChange?.(index)}
      maskOpacity={0.88}
      bannerVisible={images.length > 1}
      overlayRender={() => (
        <TopBar>
          <OriginalBtn type="button" $active={showOriginal} onClick={handleViewOriginal}>
            <ZoomInOutlined />
            <FormattedMessage id="post.viewOriginal" defaultMessage="原图" />
          </OriginalBtn>
          {showOriginal ? (
            <ModeHint>
              <FormattedMessage id="post.preview.originalMode" defaultMessage="原图模式" />
            </ModeHint>
          ) : null}
        </TopBar>
      )}
    />
  );
};

export default PostStackImagePreview;
