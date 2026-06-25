import { useMemo } from 'react';
import { Grid } from 'antd';
import type { ModalProps } from 'antd';

const MOBILE_MODAL_WIDTH = 'calc(100vw - 24px)';
const MOBILE_BODY_MAX = 'calc(100dvh - 112px)';
const DESKTOP_BODY_MAX = 'min(70vh, 560px)';

export function useIsCommunityMobile(): boolean {
  const screens = Grid.useBreakpoint();
  return !screens.md;
}

export function useCommunityModalProps(
  desktopWidth: number = 600,
  options?: { bodyMaxHeight?: string },
): Pick<ModalProps, 'width' | 'centered' | 'style' | 'styles'> & { isMobile: boolean } {
  const isMobile = useIsCommunityMobile();

  const modalProps = useMemo(() => {
    const bodyMaxHeight = isMobile
      ? MOBILE_BODY_MAX
      : options?.bodyMaxHeight ?? DESKTOP_BODY_MAX;

    return {
      width: isMobile ? MOBILE_MODAL_WIDTH : desktopWidth,
      centered: true,
      style: {
        maxWidth: MOBILE_MODAL_WIDTH,
        top: isMobile ? 12 : undefined,
        paddingBottom: isMobile ? 0 : undefined,
      },
      styles: {
        content: { overflow: 'hidden' },
        body: {
          maxHeight: bodyMaxHeight,
          overflowY: 'auto' as const,
          overflowX: 'hidden' as const,
          padding: isMobile ? '12px 14px' : undefined,
          WebkitOverflowScrolling: 'touch' as const,
        },
        header: isMobile ? { padding: '12px 16px' } : undefined,
        footer: isMobile ? { padding: '10px 16px' } : undefined,
      },
    };
  }, [isMobile, desktopWidth, options?.bodyMaxHeight]);

  return { ...modalProps, isMobile };
}
