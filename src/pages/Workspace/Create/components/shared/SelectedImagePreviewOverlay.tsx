import React, { useState } from 'react';
import { Button, Image } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import {
  InputImageContainer,
  OverlayActions,
} from '../ImageToVideo/styles';

interface SelectedImagePreviewOverlayProps {
  imageUrl: string;
  alt?: string;
  onRemove: (e: React.MouseEvent) => void;
  onReselect: (e: React.MouseEvent) => void;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

const SelectedImagePreviewOverlay: React.FC<SelectedImagePreviewOverlayProps> = ({
  imageUrl,
  alt = '',
  onRemove,
  onReselect,
  containerProps,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <InputImageContainer {...containerProps}>
      <img src={imageUrl} alt={alt} />
      <Image
        src={imageUrl}
        alt={alt}
        style={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          src: imageUrl,
        }}
      />
      <OverlayActions className="overlay-actions" style={{ gap: 8, flexWrap: 'wrap' }}>
        <Button
          type="default"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setPreviewOpen(true);
          }}
        >
          <FormattedMessage id="create.i2v.previewImage" defaultMessage="放大查看" />
        </Button>
        <Button type="primary" danger icon={<DeleteOutlined />} onClick={onRemove}>
          <FormattedMessage id="create.i2v.replaceImage" defaultMessage="更换图片" />
        </Button>
        <Button
          type="default"
          onClick={(e) => {
            e.stopPropagation();
            onReselect(e);
          }}
        >
          <FormattedMessage id="create.i2v.imagePicker.changeSource" defaultMessage="重新选择" />
        </Button>
      </OverlayActions>
    </InputImageContainer>
  );
};

export default SelectedImagePreviewOverlay;
