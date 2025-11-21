import React, { memo, useMemo, useState, useContext } from 'react';
import type { FC } from 'react';
import { Table, Space, Button, Typography, TablePaginationConfig, theme, Pagination, Grid, Modal, Input, Image, Dropdown, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import { ThemeContext } from 'styled-components';
import styled from 'styled-components';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { FileModel } from 'models/file/FileModel';
import type { ColumnsType } from 'antd/es/table';
import { RoundedButton } from '../../components/styles/StyledComponents';
import { FormattedMessage, useIntl } from 'react-intl';
import FileItem from './FileItem';
import { formatFileSize, isImageFile } from 'utils/format';
import NewFolderModal from './NewFolderModal';
import FileListFooter from './FileListFooter';
import { useColumns } from './hooks/useColumns';
import FileActions from './FileActions';

const { Text } = Typography;
const { useToken } = theme;

interface PreviewImageType {
  visible: boolean;
  url: string;
  title: string;
  key: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface FileListProps {
  loading: boolean;
  filteredFiles: FileModel[];
  searchText: string;
  handleFolderClick: (record: FileModel) => void;
  handlePreview: (record: FileModel) => void;
  handleDelete: (record: FileModel) => void;
  handleBatchDelete: (files: FileModel[]) => void;
  handleBatchDownload: (files: FileModel[]) => void;
  selectedRowKeys: React.Key[];
  onSelectChange: (selectedRowKeys: React.Key[]) => void;
  onDownload: (record: FileModel) => void;
  pagination: PaginationState;
  onPageChange: (page: number, pageSize: number) => void;
  newFolderModalVisible: boolean;
  setNewFolderModalVisible: (visible: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: () => void;
  previewImage: PreviewImageType;
  handlePreviewClose: () => void;
  currentParentId: number;
  setLoading: (loading: boolean) => void;
  setFiles: (files: FileModel[]) => void;
  setFilteredFiles: (files: FileModel[]) => void;
  setSearchText: (text: string) => void;
  setPagination: (pagination: PaginationState) => void;
}

interface ThemedTableProps {
  theme?: {
    mode?: 'dark' | 'light';
  };
}

const TableWrapper = styled.div`
  .ant-table-row {
    transition: all 0.3s ease;
    
    &:hover {
      background-color: ${props => props.theme.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.02)'} !important;
    }
  }

  .ant-table-cell {
    padding: 12px 8px !important;
    border-bottom: 1px solid ${props => props.theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.04)'} !important;
      
    &:first-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }
    
    &:last-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  }
`;

const FileList: FC<FileListProps> = memo(({
  loading,
  filteredFiles,
  handleFolderClick,
  handlePreview,
  handleDelete,
  handleBatchDelete,
  handleBatchDownload,
  selectedRowKeys,
  onSelectChange,
  onDownload,
  pagination,
  onPageChange,
  newFolderModalVisible,
  setNewFolderModalVisible,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  previewImage,
  handlePreviewClose,
  currentParentId,
  setLoading,
  setFiles,
  setFilteredFiles,
  setSearchText,
  setPagination,
}) => {
  const { token } = useToken();
  const screens = Grid.useBreakpoint();
  const themeContext = useContext(ThemeContext as React.Context<any>);
  const isDark = themeContext?.mode === 'dark';
  const intl = useIntl();
  
  const [deletingIds, setDeletingIds] = useState<React.Key[]>([]);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  const handleDeleteSafely = async (record: FileModel) => {
    if (deletingIds.includes(record.id)) return;
    try {
      setDeletingIds(prev => [...prev, record.id]);
      await handleDelete(record);
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== record.id));
    }
  };

  const handleBatchDeleteSafely = async (files: FileModel[]) => {
    if (isBatchDeleting) return;
    try {
      setIsBatchDeleting(true);
      await handleBatchDelete(files);
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [filteredFiles]);

  const columns = useColumns({
    handlers: {
      onFolderClick: handleFolderClick,
      onPreview: handlePreview,
      onDelete: handleDeleteSafely,
      onDownload: onDownload,
    },
    deletingIds,
    currentParentId,
    setLoading,
    setFiles,
    setFilteredFiles,
    setSearchText,
    setPagination,
    pagination,
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: FileModel) => ({
      disabled: record.isDirectory,
    }),
  };

  const handleBatchDownloadWithCheck = (files: FileModel[]) => {
    const downloadableFiles = files.filter(file => 
      selectedRowKeys.includes(file.id) && !file.isDirectory
    );
    
    if (downloadableFiles.length === 0) {
      message.warning('请选择要下载的文件（不支持文件夹下载）');
      return;
    }

    handleBatchDownload(downloadableFiles);
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate'
    }}>

      
      <div style={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          overflow: 'auto',
          WebkitMask: 'linear-gradient(to bottom, black calc(100% - 60px), transparent 100%)',
          mask: 'linear-gradient(to bottom, black calc(100% - 60px), transparent 100%)'
        }}>
          <TableWrapper>
            <Table<FileModel>
              rowSelection={rowSelection}
              columns={columns}
              dataSource={sortedFiles}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 800, y: 'calc(100% - 8px)' }}
              tableLayout="fixed"
              rowClassName={(record) => record.isDirectory ? 'folder-row' : ''}
            />
          </TableWrapper>
        </div>
      </div>

      <FileListFooter
        isDark={isDark}
        selectedRowKeys={selectedRowKeys}
        filteredFiles={filteredFiles}
        handleBatchDownloadWithCheck={handleBatchDownloadWithCheck}
        handleBatchDeleteSafely={handleBatchDeleteSafely}
        isBatchDeleting={isBatchDeleting}
        pagination={pagination}
        onPageChange={onPageChange}
      />
      
      <NewFolderModal
        visible={newFolderModalVisible}
        onClose={() => setNewFolderModalVisible(false)}
        onCreateFolder={handleCreateFolder}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
      />

      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewImage.visible,
          src: previewImage.url,
          title: previewImage.title,
          onVisibleChange: (visible) => {
            if (!visible) handlePreviewClose();
          }
        }}
      />
    </div>
  );
});

export default FileList;
