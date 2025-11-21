import React from 'react';
import { Table, Space, Tag, Progress, Button, Tooltip, Divider, Typography } from 'antd';
import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { formatFileSize, formatSpeed, formatTime, getEllipsisFileName } from '../../../utils';
import { StyledFileListSection } from '../styles/StyledComponents';

const { Text } = Typography;

const FileListSection = ({
  files,
  selectedFiles,
  fileProgress,
  fileStats,
  decrypting,
  handleSelectionChange,
  handleShowFileInfo
}) => {
  const intl = useIntl();

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return intl.formatMessage({ id: 'decrypt.fileList.status.pending' });
      case 'decrypting': return intl.formatMessage({ id: 'decrypt.fileList.status.decrypting' });
      case 'success': return intl.formatMessage({ id: 'decrypt.fileList.status.success' });
      case 'error': return intl.formatMessage({ id: 'decrypt.fileList.status.error' });
      default: return intl.formatMessage({ id: 'common.unknown' });
    }
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'decrypt.fileList.column.name' }),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockOutlined className="file-icon" />
          <div className="file-info">
            <Tooltip title={text}>
              <Text className="file-name">
                {getEllipsisFileName(text)}
              </Text>
            </Tooltip>
            <div className="file-size">
              {formatFileSize(record.size)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: intl.formatMessage({ id: 'decrypt.fileList.column.status' }),
      key: 'status',
      width: 280,
      render: (_, record) => {
        const fileStatus = fileProgress.get(record.uid) || { progress: 0, status: 'pending' };
        const stats = fileStats.get(record.uid);
        
        if (fileStatus.status === 'pending') {
          return <Tag>{intl.formatMessage({ id: 'decrypt.fileList.status.pending' })}</Tag>;
        }
        
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space align="center" size={8} style={{ width: '100%' }}>
              <Progress
                percent={fileStatus.progress}
                size="small"
                status={
                  fileStatus.status === 'error' ? 'exception' :
                  fileStatus.status === 'success' ? 'success' :
                  'active'
                }
                style={{ flex: 1, minWidth: 100, maxWidth: 160 }}
              />
              {fileStatus.status === 'error' && fileStatus.errorMessage ? (
                <Tooltip title={fileStatus.errorMessage}>
                  <Tag 
                    color="error" 
                    style={{ cursor: 'pointer' }}
                  >
                    {intl.formatMessage({ id: 'decrypt.fileList.status.error' })}
                  </Tag>
                </Tooltip>
              ) : (
                <Tag color={
                  fileStatus.status === 'success' ? 'success' :
                  fileStatus.status === 'error' ? 'error' :
                  fileStatus.status === 'decrypting' ? 'processing' :
                  'default'
                }>
                  {getStatusText(fileStatus.status)}
                </Tag>
              )}
            </Space>
            {(fileStatus.status === 'decrypting' || fileStatus.status === 'success') && stats && (
              <div style={{ fontSize: '12px', color: 'var(--ant-color-text-secondary)' }}>
                <Space split={<Divider type="vertical" style={{ margin: '0 4px' }} />}>
                  {fileStatus.status === 'decrypting' && <span>{intl.formatMessage({ id: 'common.speed' })}: {formatSpeed(stats.speed)}</span>}
                  <span>{intl.formatMessage({ id: 'common.timeSpent' })}: {formatTime(stats.timeSpent)}</span>
                  {fileStatus.status === 'decrypting' && <span>{intl.formatMessage({ id: 'common.remaining' })}: {formatTime(stats.remainingTime)}</span>}
                </Space>
              </div>
            )}
          </Space>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'decrypt.fileList.column.actions' }),
      key: 'action',
      width: 180,
      render: (_, record) => {
        const fileStatus = fileProgress.get(record.uid) || { progress: 0, status: 'pending' };
        return (
          <Space size={4}>
            <Tooltip title={intl.formatMessage({ id: 'decrypt.fileList.action.info' })}>
              <Button
                type="text"
                size="small"
                icon={<InfoCircleOutlined />}
                onClick={() => handleShowFileInfo(record)}
              >
                {intl.formatMessage({ id: 'decrypt.fileList.action.info' })}
              </Button>
            </Tooltip>
          </Space>
        );
      },
    }
  ];

  return (
    <StyledFileListSection>
      <Table
        rowSelection={{
          selectedRowKeys: selectedFiles,
          onChange: handleSelectionChange,
          getCheckboxProps: (record) => ({
            disabled: record.status !== 'pending' || decrypting,
          }),
        }}
        columns={columns}
        dataSource={files}
        rowKey="uid"
        pagination={false}
        size="middle"
        locale={{
          emptyText: intl.formatMessage({ id: 'decrypt.fileList.empty' })
        }}
      />
    </StyledFileListSection>
  );
};

export default FileListSection; 