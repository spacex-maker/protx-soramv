import React from 'react';
import { Space, Button, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { FileModel } from 'models/file/FileModel';
import { isImageFile } from 'utils/format';

interface FileActionsProps {
  record: FileModel;
  isDeleting: boolean;
  onDownload: (record: FileModel) => void;
  onDelete: (record: FileModel) => void;
  onPreview: (record: FileModel) => void;
}

const FileActions: React.FC<FileActionsProps> = ({
  record,
  isDeleting,
  onDownload,
  onDelete,
  onPreview,
}) => {
  const menuItems: MenuProps['items'] = [
    !record.isDirectory ? {
      key: 'download',
      icon: <DownloadOutlined />,
      label: <FormattedMessage id="filelist.action.download" defaultMessage="下载" />,
      onClick: () => onDownload(record),
    } : null,
    (!record.isDirectory && isImageFile(record.name)) ? {
      key: 'preview',
      icon: <EyeOutlined />,
      label: <FormattedMessage id="filelist.action.preview" defaultMessage="预览" />,
      onClick: () => onPreview(record),
    } : null,
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: <FormattedMessage id="filelist.action.delete" defaultMessage="删除" />,
      onClick: () => onDelete(record),
      danger: true,
    }
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Space size={4}>
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={['click']}
        arrow={{ pointAtCenter: true }}
        disabled={isDeleting}
      >
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          loading={isDeleting}
          disabled={isDeleting}
        />
      </Dropdown>
    </Space>
  );
};

export default FileActions; 