import { useState } from 'react';
import { message } from 'antd';
import { cosService } from 'services/cos';
import instance from 'api/axios';
import { loadFiles } from 'services/fileService';

export const useFolderOperations = (
  currentParentId, 
  userInfo, 
  currentPath, 
  pagination, 
  setPagination, 
  setFiles, 
  setFilteredFiles, 
  setSearchText, 
  setLoading,
  setCurrentParentId,
  setCurrentFolder,
  nodeId
) => {
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [pathHistory, setPathHistory] = useState([]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.error('文件夹名称不能为空');
      return;
    }
    
    try {
      setCreatingFolder(true);
      const fullPath = userInfo ? `${userInfo.username}/${currentPath}${newFolderName}/` : '';
      
      // 1. 先在对象存储创建文件夹
      await cosService.createFolder(fullPath, null, nodeId);
      
      // 2. 调用后端接口保存信息
      const response = await instance.post('/productx/file-storage/create-directory', {
        parentId: currentParentId,
        isDirectory: true,
        name: newFolderName,
        size: 0,
        storagePath: fullPath,
        visibility: 'PRIVATE',
        nodeId: nodeId
      });
      
      if (response.data && response.data.success) {
        message.success('文件夹创建成功');
        setNewFolderModalVisible(false);
        setNewFolderName('');
        
        // 刷新文件列表
        await loadFiles(
          currentParentId, 
          { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination },
          nodeId
        );
      } else {
        throw new Error(response.data.message || '创建文件夹失败');
      }
    } catch (error) {
      console.error('创建文件夹失败:', error);
      message.error('创建文件夹失败: ' + (error.message || '未知错误'));
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFolderClick = async (folder) => {
    try {
      console.log('进入文件夹 - ID:', folder.id, '名称:', folder.name);
      
      const newHistory = [...pathHistory, {
        id: folder.id,
        name: folder.name
      }];
      
      const newPath = newHistory.map(p => p.name).join('/') + '/';
      
      setPathHistory(newHistory);
      setCurrentParentId(folder.id);
      setCurrentFolder(folder);
      
      // 重置分页到第一页
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      await loadFiles(
        folder.id,
        { 
          setLoading, 
          setFiles, 
          setFilteredFiles, 
          setSearchText, 
          setPagination, 
          pagination: {
            ...pagination,
            currentPage: 1
          }
        },
        nodeId
      );
    } catch (error) {
      console.error('Failed to navigate to folder:', error);
      message.error('打开文件夹失败: ' + (error.message || '未知错误'));
    }
  };

  const handlePathClick = async (index) => {
    try {
      const targetPath = pathHistory[index];
      if (!targetPath?.id) {
        throw new Error('无效的路径');
      }
      
      const newHistory = pathHistory.slice(0, index + 1);
      const newPath = newHistory.map(p => p.name).join('/') + '/';
      
      setPathHistory(newHistory);
      setCurrentParentId(targetPath.id);
      setCurrentFolder(targetPath);
      
      await loadFiles(
        targetPath.id,
        { setLoading, setFiles, setFilteredFiles, setSearchText, setPagination, pagination },
        nodeId
      );
    } catch (error) {
      console.error('Failed to navigate to path:', error);
      message.error('导航失败: ' + (error.message || '未知错误'));
    }
  };

  const handleHomeClick = async (rootDirectoryId) => {
    try {
      setPathHistory([]);
      setCurrentParentId(rootDirectoryId || 0);
      setCurrentFolder(null);
      
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
      
      await loadFiles(
        rootDirectoryId || 0,
        { 
          setLoading, 
          setFiles, 
          setFilteredFiles, 
          setSearchText, 
          setPagination, 
          pagination: {
            ...pagination,
            currentPage: 1
          }
        },
        nodeId
      );
    } catch (error) {
      console.error('Failed to navigate to home:', error);
      message.error('返回主页失败: ' + (error.message || '未知错误'));
    }
  };

  return {
    newFolderModalVisible,
    setNewFolderModalVisible,
    newFolderName,
    setNewFolderName,
    creatingFolder,
    pathHistory,
    setPathHistory,
    handleCreateFolder,
    handleFolderClick,
    handlePathClick,
    handleHomeClick
  };
}; 