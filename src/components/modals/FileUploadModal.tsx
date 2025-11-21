import React from 'react';
import {Typography, Grid } from 'antd';

import DesktopFileUploadModal from './DesktopFileUploadModal';
import MobileFileUploadModal from './MobileFileUploadModal';

const { useBreakpoint } = Grid;

interface FileUploadModalProps {
  visible: boolean;
  uploadingFiles: Map<string, any>;
  isUploading: boolean;
  onStartUpload: (files: any[]) => void;
  onCancel: () => void;
  onDuplicateDecision: (fileName: string, action: string) => void;
  onRemoveFiles: (fileNames: string[]) => void;
  onAddFiles: (files: any[]) => void;
  onEncryptFiles: (files: any[], callback: (encryptedFiles: any[], originalFiles: any[]) => void) => void;
  onEncryptComplete: (encryptedFiles: any[], originalFiles: any[]) => void;
  onUploadComplete: () => void;
  existingFiles: any[];
  onPauseUpload: (taskId: string) => void;
  onResumeUpload: (taskId: string) => void;
  setUploadStates: React.Dispatch<React.SetStateAction<{
    files: Map<string, any>;
    isUploading: boolean;
  }>>;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  visible,
  uploadingFiles,
  isUploading,
  onStartUpload,
  onCancel,
  onDuplicateDecision,
  onRemoveFiles,
  onAddFiles,
  onEncryptFiles,
  onEncryptComplete,
  onUploadComplete,
  existingFiles = [],
  onPauseUpload,
  onResumeUpload,
  setUploadStates,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  // 过滤出待上传的文件
  const handleStartUpload = () => {
    const pendingFiles = Array.from(uploadingFiles.values())
      .filter(file => file.status === 'pending')
      .map(file => file.file);
    
    if (pendingFiles.length > 0) {
      onStartUpload(pendingFiles);
    }
  };

  const props = {
    visible,
    uploadingFiles,
    isUploading,
    onStartUpload: handleStartUpload,
    onCancel,
    onDuplicateDecision,
    onRemoveFiles,
    onAddFiles,
    onEncryptFiles,
    onEncryptComplete,
    onUploadComplete,
    existingFiles,
    onPauseUpload,
    onResumeUpload,
    setUploadStates,
  };

  if (isMobile) {
    return <MobileFileUploadModal {...props} />;
  }

  return <DesktopFileUploadModal {...props} />;
};

export default FileUploadModal; 