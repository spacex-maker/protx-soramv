import React from 'react';
import { Pagination, Grid } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import { FileModel } from 'models/file/FileModel';
import BatchOperations from './BatchOperations';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface FileListFooterProps {
  isDark: boolean;
  selectedRowKeys: React.Key[];
  filteredFiles: FileModel[];
  handleBatchDownloadWithCheck: (files: FileModel[]) => void;
  handleBatchDeleteSafely: (files: FileModel[]) => void;
  isBatchDeleting: boolean;
  pagination: PaginationState;
  onPageChange: (page: number, pageSize: number) => void;
}

const FileListFooter: React.FC<FileListFooterProps> = ({
  isDark,
  selectedRowKeys,
  filteredFiles,
  handleBatchDownloadWithCheck,
  handleBatchDeleteSafely,
  isBatchDeleting,
  pagination,
  onPageChange
}) => {
  const intl = useIntl();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  return (
    <div style={{ 
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      background: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(1px)',
      WebkitBackdropFilter: 'blur(1px)',
      borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}`,
      padding: '12px 0',
      zIndex: 10,
      marginTop: '-60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container-fluid px-0" style={{ flex: 1 }}>
        <div className="row align-items-center" style={{ margin: 0 }}>
          <div className="col ps-3" style={{ minHeight: '32px' }}>
            <BatchOperations
              selectedRowKeys={selectedRowKeys}
              filteredFiles={filteredFiles}
              handleBatchDownloadWithCheck={handleBatchDownloadWithCheck}
              handleBatchDeleteSafely={handleBatchDeleteSafely}
              isBatchDeleting={isBatchDeleting}
            />
          </div>
          <div className="col-auto pe-3">
            <Pagination 
              {...pagination}
              onChange={onPageChange}
              showTotal={(total) => intl.formatMessage(
                { id: 'filelist.total' },
                { total }
              )}
              size={screens.md ? 'default' : 'small'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileListFooter; 