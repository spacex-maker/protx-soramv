import React from 'react';
import { Modal, Button, List, Space, Typography, Tooltip } from 'antd';
import {
  WarningOutlined,
  FileOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

const StyledModal = styled(Modal)`
  .ant-modal-body {
    max-height: 60vh;
    overflow-y: auto;
  }
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ant-color-border);

  &:last-child {
    border-bottom: none;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;

  .file-name {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .file-details {
    color: var(--ant-color-text-secondary);
    font-size: 12px;
  }
`;

const WarningIcon = styled(WarningOutlined)`
  color: var(--ant-color-warning);
  font-size: 20px;
`;

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DuplicateFilesModal = ({
  visible,
  duplicateFiles,
  onCancel,
  onSkip,
  onOverwrite,
}) => {
  return (
    <StyledModal
      title={
        <Space>
          <WarningIcon />
          <span>检测到重复文件</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="skip" onClick={onSkip}>
          全部跳过
        </Button>,
        <Button key="overwrite" type="primary" onClick={onOverwrite}>
          全部覆盖
        </Button>,
      ]}
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Space align="start">
          <InfoCircleOutlined style={{ color: 'var(--ant-color-info)' }} />
          <Text>
            以下文件在目标文件夹中已存在同名文件，请选择处理方式：
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              - 跳过：保留目标文件夹中的文件，不上传新文件
              <br />
              - 覆盖：使用新文件替换目标文件夹中的同名文件
            </Text>
          </Text>
        </Space>
      </div>

      <List
        dataSource={duplicateFiles}
        renderItem={(file) => (
          <FileItem>
            <FileOutlined style={{ fontSize: 24, color: 'var(--ant-color-text-secondary)' }} />
            <FileInfo>
              <div className="file-name">
                <Text>{file.name}</Text>
              </div>
              <div className="file-details">
                <Space split="•">
                  <span>大小：{formatBytes(file.size)}</span>
                  <span>修改时间：{new Date(file.lastModified).toLocaleString()}</span>
                </Space>
              </div>
              {file.existingFile && (
                <div className="file-details" style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    已存在文件：{formatBytes(file.existingFile.size)}
                    {file.existingFile.lastModified && 
                      ` • ${new Date(file.existingFile.lastModified).toLocaleString()}`
                    }
                  </Text>
                </div>
              )}
            </FileInfo>
            <Tooltip title="此文件将根据您的选择被跳过或覆盖">
              <WarningIcon />
            </Tooltip>
          </FileItem>
        )}
      />
    </StyledModal>
  );
};

export default DuplicateFilesModal; 