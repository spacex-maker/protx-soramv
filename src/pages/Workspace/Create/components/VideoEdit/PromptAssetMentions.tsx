import React, { useMemo } from 'react';
import { Mentions, Space, Typography } from 'antd';
import {
  AudioOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import type { MentionsProps } from 'antd';
import styled from 'styled-components';
import { MediaAsset } from './constants';

const { Text } = Typography;

/** 与全局 Input.borderRadius(20) / 其他生图模块提示词框一致的全圆弧样式 */
const StyledMentions = styled(Mentions)`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border-radius: 20px !important;
  overflow: hidden;

  &.ant-mentions,
  &.ant-mentions-focused,
  &:hover {
    border-radius: 20px !important;
  }

  textarea {
    border-radius: 20px !important;
    resize: none;
    max-width: 100%;
  }
`;

export interface PromptAssetMentionsProps
  extends Omit<MentionsProps, 'prefix' | 'options'> {
  videos: MediaAsset[];
  images: MediaAsset[];
  audios: MediaAsset[];
}

/**
 * Prompt 输入：键入 @ 弹出已上传素材快捷选择（插入 @视频1 / @图像1 / @音频1）
 */
const PromptAssetMentions: React.FC<PromptAssetMentionsProps> = ({
  videos,
  images,
  audios,
  ...rest
}) => {
  const intl = useIntl();

  const options = useMemo(() => {
    const list: Array<{
      key: string;
      value: string;
      label: React.ReactNode;
    }> = [];

    videos.forEach((asset, index) => {
      const tag = `视频${index + 1}`;
      list.push({
        key: `v-${asset.id}`,
        value: tag,
        label: (
          <Space size={8}>
            <VideoCameraOutlined style={{ color: '#13c2c2' }} />
            <span>@{tag}</span>
            <Text type="secondary" ellipsis style={{ maxWidth: 140, fontSize: 12 }}>
              {asset.file.name}
            </Text>
          </Space>
        ),
      });
    });

    images.forEach((asset, index) => {
      const tag = `图像${index + 1}`;
      list.push({
        key: `i-${asset.id}`,
        value: tag,
        label: (
          <Space size={8}>
            <FileImageOutlined style={{ color: '#722ed1' }} />
            <span>@{tag}</span>
            <Text type="secondary" ellipsis style={{ maxWidth: 140, fontSize: 12 }}>
              {asset.file.name}
            </Text>
          </Space>
        ),
      });
    });

    audios.forEach((asset, index) => {
      const tag = `音频${index + 1}`;
      list.push({
        key: `a-${asset.id}`,
        value: tag,
        label: (
          <Space size={8}>
            <AudioOutlined style={{ color: '#1890ff' }} />
            <span>@{tag}</span>
            <Text type="secondary" ellipsis style={{ maxWidth: 140, fontSize: 12 }}>
              {asset.file.name}
            </Text>
          </Space>
        ),
      });
    });

    if (list.length === 0) {
      return [];
    }

    return list;
  }, [videos, images, audios]);

  return (
    <StyledMentions
      rows={5}
      prefix="@"
      options={options}
      filterOption={(input, option) => {
        if (!option?.value) return false;
        const q = (input || '').toLowerCase();
        return String(option.value).toLowerCase().includes(q);
      }}
      notFoundContent={
        videos.length + images.length + audios.length === 0
          ? intl.formatMessage({
              id: 'create.videoEdit.mention.empty',
              defaultMessage: '请先上传参考视频 / 图片 / 音频',
            })
          : intl.formatMessage({
              id: 'create.videoEdit.mention.notFound',
              defaultMessage: '无匹配素材',
            })
      }
      placeholder={
        rest.placeholder ||
        intl.formatMessage({
          id: 'create.videoEdit.prompt.placeholder',
          defaultMessage: '描述如何参考 / 编辑 / 延长你上传的视频…',
        })
      }
      {...rest}
    />
  );
};

export default PromptAssetMentions;
