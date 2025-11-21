import React from 'react';
import { Modal, Typography, Tooltip } from 'antd';
import { DeleteOutlined, WarningFilled } from '@ant-design/icons';
import { getEllipsisFileName, formatFileSize } from 'utils/format';
import type { FileModel } from 'models/file/FileModel';

const { Text } = Typography;

interface BatchDeleteModalProps {
  selectedItems: FileModel[];
  onConfirm: () => Promise<void>;
}

const BatchDeleteModal = ({ 
  selectedItems,
  onConfirm,
}: BatchDeleteModalProps) => {
  const maxDisplayItems = 5;
  const hasFolder = selectedItems.some(item => item.isDirectory);

  const modalConfig = {
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
        <span>确认删除 {selectedItems.length} 个{hasFolder ? '文件/文件夹' : '文件'}？</span>
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
            此操作将永久删除以下文件，且无法恢复
          </Text>
        </div>
        <div style={{ 
          maxHeight: '200px',
          overflow: 'auto',
          border: '1px solid var(--ant-color-border)',
          borderRadius: '8px'
        }}>
          {selectedItems.slice(0, maxDisplayItems).map(item => (
            <div key={item.id} style={{ 
              padding: '8px', 
              borderBottom: '1px solid var(--ant-color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Tooltip title={item.name}>
                <Text ellipsis style={{ maxWidth: '300px', marginRight: '16px' }}>
                  {getEllipsisFileName(item.name)}
                </Text>
              </Tooltip>
              <Text type="secondary" style={{ flexShrink: 0 }}>
                {item.isDirectory ? '-' : (item.size != null ? formatFileSize(item.size) : '未知大小')}
              </Text>
            </div>
          ))}
          {selectedItems.length > maxDisplayItems && (
            <div style={{ 
              padding: '8px', 
              borderTop: '1px solid var(--ant-color-border)',
              color: 'var(--ant-color-text-secondary)',
              textAlign: 'center'
            }}>
              还有 {selectedItems.length - maxDisplayItems} 个文件未显示
            </div>
          )}
        </div>
      </div>
    ),
    okText: '删除',
    okButtonProps: {
      danger: true,
    },
    cancelText: '取消',
    onOk: onConfirm,
  };

  return Modal.confirm(modalConfig);
};

export default BatchDeleteModal; 