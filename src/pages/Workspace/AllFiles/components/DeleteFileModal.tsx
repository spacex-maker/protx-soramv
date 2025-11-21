import React from 'react';
import { Modal, Typography, Tooltip } from 'antd';
import {
  DeleteOutlined,
  WarningFilled,
  FolderOutlined,
  FileImageOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { formatFileSize, getEllipsisFileName } from 'utils/format';
import type { FileModel } from 'models/file/FileModel';

const { Text } = Typography;

interface DeleteFileModalProps {
  record: FileModel;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  isImageFile: (filename: string) => boolean;
}

const DeleteFileModal = ({ 
  record,
  onConfirm,
  isDeleting,
  isImageFile,
}: DeleteFileModalProps) => {
  const fileName = record.name;
  const isFolder = record.isDirectory;

  const modalConfig = {
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
        <span>确认删除{isFolder ? '文件夹' : '文件'}</span>
      </div>
    ),
    icon: null,
    width: 520,
    content: (
      <div>
        <div style={{ 
          padding: '12px',
          background: 'var(--ant-color-error-bg)',
          border: '1px solid var(--ant-color-error-border)',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <Text type="danger">
            <WarningFilled style={{ marginRight: '8px' }} />
            此操作将永久删除该{isFolder ? '文件夹' : '文件'}，且无法恢复
          </Text>
        </div>
        <div style={{ 
          border: '1px solid var(--ant-color-border)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            borderBottom: '1px solid var(--ant-color-border)',
            background: 'var(--ant-color-bg-container-disabled)'
          }}>
            {isFolder ? (
              <FolderOutlined style={{ color: '#ffd591', fontSize: '24px', marginRight: '12px' }} />
            ) : isImageFile(record.name) ? (
              <FileImageOutlined style={{ color: '#85a5ff', fontSize: '24px', marginRight: '12px' }} />
            ) : (
              <FileOutlined style={{ color: '#91d5ff', fontSize: '24px', marginRight: '12px' }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={fileName}>
                <Text strong ellipsis>
                  {getEllipsisFileName(fileName)}
                </Text>
              </Tooltip>
            </div>
          </div>
          <div style={{ padding: '12px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">类型：</Text>
                <Text>{isFolder ? '文件夹' : record.extension ? `.${record.extension}` : '文件'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">大小：</Text>
                <Text>{isFolder ? '-' : (record.size != null ? formatFileSize(record.size) : '未知大小')}</Text>
              </div>
              {record.createTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">创建时间：</Text>
                  <Text>{record.createTime}</Text>
                </div>
              )}
              {record.updateTime && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">修改时间：</Text>
                  <Text>{record.updateTime}</Text>
                </div>
              )}
              {record.storagePath && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">存储路径：</Text>
                  <Text ellipsis style={{ maxWidth: '300px' }} title={record.storagePath}>
                    {record.storagePath}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    okText: '删除',
    okButtonProps: {
      danger: true,
      loading: isDeleting,
      disabled: isDeleting
    },
    cancelText: '取消',
    cancelButtonProps: {
      disabled: isDeleting
    },
    onOk: onConfirm,
  };

  return Modal.confirm(modalConfig);
};

export default DeleteFileModal; 