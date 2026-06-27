import React from 'react';
import { Button, Space, Typography } from 'antd';
import { ArrowRightOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  I2iOfficialPlay,
  resolvePlayDescription,
  resolvePlayDisplayName,
  resolveOfficialPlayImageUrl,
  OFFICIAL_PLAY_THUMB_IMAGE_WIDTH,
} from './officialPlayTypes';

const { Text } = Typography;

const BANNER_REF_WIDTH = 120;

const refThumbCss = `
  width: ${BANNER_REF_WIDTH}px;
  aspect-ratio: 3 / 4;
  height: auto;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 8px;
`;

const Banner = styled.div`
  border: 1px solid
    ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.45)' : 'rgba(59, 130, 246, 0.35)'};
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.06)'};
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
`;

const RefRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;

  img {
    ${refThumbCss}
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'var(--ant-color-fill-quaternary, #f5f5f5)'};
    border: 1px solid
      ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
  }

  .placeholder {
    ${refThumbCss}
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'var(--ant-color-fill-quaternary, #f5f5f5)'};
    border: 1px solid
      ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
  }

  .arrow {
    color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.35)' : 'var(--ant-color-text-tertiary, #999)'};
  }
`;

export interface OfficialPlaySelectedBannerProps {
  play: I2iOfficialPlay;
  onChangePlay: () => void;
  onClear: () => void;
}

const OfficialPlaySelectedBanner: React.FC<OfficialPlaySelectedBannerProps> = ({
  play,
  onChangePlay,
  onClear,
}) => {
  const intl = useIntl();
  const locale = intl.locale || 'zh';

  return (
    <Banner>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
        <Space direction="vertical" size={2}>
          <Text strong>
            {play.coverEmoji} {resolvePlayDisplayName(play, locale)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {resolvePlayDescription(play, locale)}
          </Text>
        </Space>
        <Space size="small">
          <Button size="small" icon={<SwapOutlined />} onClick={onChangePlay}>
            <FormattedMessage id="create.i2i.official.change" defaultMessage="更换玩法" />
          </Button>
          <Button size="small" icon={<CloseOutlined />} onClick={onClear}>
            <FormattedMessage id="create.i2i.official.clear" defaultMessage="自由创作" />
          </Button>
        </Space>
      </Space>

      {(play.referenceBeforeImage || play.referenceAfterImage) && (
        <RefRow>
          {play.referenceBeforeImage ? (
            <img
              src={resolveOfficialPlayImageUrl(
                play.referenceBeforeImage,
                OFFICIAL_PLAY_THUMB_IMAGE_WIDTH
              )}
              alt="before"
            />
          ) : (
            <div className="placeholder" />
          )}
          <ArrowRightOutlined className="arrow" />
          {play.referenceAfterImage ? (
            <img
              src={resolveOfficialPlayImageUrl(
                play.referenceAfterImage,
                OFFICIAL_PLAY_THUMB_IMAGE_WIDTH
              )}
              alt="after"
            />
          ) : (
            <div className="placeholder" />
          )}
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
            <FormattedMessage
              id="create.i2i.official.refHint"
              defaultMessage="效果对照参考"
            />
          </Text>
        </RefRow>
      )}
    </Banner>
  );
};

export default OfficialPlaySelectedBanner;
