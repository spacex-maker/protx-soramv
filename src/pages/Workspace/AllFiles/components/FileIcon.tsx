import React from 'react';
import { theme } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import { FileModel } from 'models/file/FileModel';
import { isImageFile } from 'utils/format';
import styled from 'styled-components';

const { useToken } = theme;

const IconWrapper = styled.div`
  margin-right: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

interface FileIconProps {
  file: FileModel;
}

const FileIcon: React.FC<FileIconProps> = ({ file }) => {
  const { token } = useToken();

  if (file.isDirectory) {
    return (
      <IconWrapper>
        <FolderOutlined style={{ color: token.colorPrimary }} />
      </IconWrapper>
    );
  }
  
  if (isImageFile(file.name)) {
    return (
      <IconWrapper>
        <FileImageOutlined style={{ color: token.colorInfo }} />
      </IconWrapper>
    );
  }
  
  return (
    <IconWrapper>
      <FileOutlined />
    </IconWrapper>
  );
};

export default FileIcon; 