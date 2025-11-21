import React from 'react';
import { Space, Grid } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { FileModel } from 'models/file/FileModel';
import { RoundedButton } from '../../components/styles/StyledComponents';

interface BatchOperationsProps {
  selectedRowKeys: React.Key[];
  filteredFiles: FileModel[];
  handleBatchDownloadWithCheck: (files: FileModel[]) => void;
  handleBatchDeleteSafely: (files: FileModel[]) => void;
  isBatchDeleting: boolean;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedRowKeys,
  filteredFiles,
  handleBatchDownloadWithCheck,
  handleBatchDeleteSafely,
  isBatchDeleting
}) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // 如果没有选中任何项，则不显示批量操作按钮
  if (selectedRowKeys.length === 0) {
    return null;
  }

  return (
    <Space size={8}>
      <RoundedButton
        icon={<DownloadOutlined />}
        onClick={() => handleBatchDownloadWithCheck(filteredFiles)}
      >
        {screens.md && <FormattedMessage id="filelist.action.batchDownload" />}
      </RoundedButton>
      <RoundedButton
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleBatchDeleteSafely(filteredFiles)}
        loading={isBatchDeleting}
        disabled={isBatchDeleting}
      >
        {screens.md && <FormattedMessage id="filelist.action.batchDelete" />}
      </RoundedButton>
      <span className="d-none d-md-inline">
        <FormattedMessage 
          id="filelist.selected" 
          values={{ count: selectedRowKeys.length }} 
        />
      </span>
    </Space>
  );
};

export default BatchOperations; 