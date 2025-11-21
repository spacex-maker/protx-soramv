import { useState } from 'react';
import { message, Modal } from 'antd';
import { deleteFile, loadFiles } from 'services/fileService';
import { isImageFile } from 'utils/format';
import DeleteFileModal from '../AllFiles/components/DeleteFileModal';
import BatchDeleteModal from '../AllFiles/components/BatchDeleteModal';

export const useFileOperations = (
  currentParentId, 
  pagination, 
  setPagination,
  setFiles,
  setFilteredFiles,
  setSearchText,
  setLoading,
  nodeId
) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [previewImage, setPreviewImage] = useState({
    visible: false,
    url: '',
    title: '',
    key: 0
  });
  const [modalDeletingId, setModalDeletingId] = useState(null);

  const handleDelete = (record) => {
    DeleteFileModal({
      record,
      onConfirm: async () => {
        try {
          setModalDeletingId(record.id);
          setLoading(true);
          await deleteFile(record, nodeId);
          message.success('删除成功');
          // 刷新文件列表
          await loadFiles(
            currentParentId,
            { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination },
            nodeId
          );
        } catch (error) {
          message.error('删除失败: ' + (error.message || '未知错误'));
        } finally {
          setModalDeletingId(null);
          setLoading(false);
        }
      },
      isDeleting: modalDeletingId === record.id,
      isImageFile
    });
  };

  const handleBatchDelete = (filteredFiles) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    const selectedItems = filteredFiles.filter(file => selectedRowKeys.includes(file.id));

    BatchDeleteModal({
      selectedItems,
      onConfirm: async () => {
        try {
          setLoading(true);
          await Promise.all(selectedItems.map(item => deleteFile(item, nodeId)));
          
          message.success(`成功删除 ${selectedItems.length} 个文件`);
          setSelectedRowKeys([]);
          
          // 刷新文件列表
          await loadFiles(
            currentParentId,
            { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination },
            nodeId
          );
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败: ' + (error.message || '未知错误'));
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handlePreview = (file) => {
    if (!file.downloadUrl) {
      message.error('无法预览，下载链接不存在');
      return;
    }
    
    if (!isImageFile(file.name)) {
      message.error('此文件类型不支持预览');
      return;
    }
    
    setPreviewImage({
      visible: true,
      url: file.downloadUrl,
      title: file.name,
      key: file.id
    });
  };

  const handlePreviewClose = () => {
    setPreviewImage(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    previewImage,
    setPreviewImage,
    handleDelete,
    modalDeletingId,
    handleBatchDelete,
    handlePreview,
    handlePreviewClose,
    handleSelectChange
  };
}; 