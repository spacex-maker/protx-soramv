import React from 'react';
import { Typography } from 'antd';
import { FileModel } from 'models/file/FileModel';
import { formatFileSize } from 'utils/format';
import styled from 'styled-components';

const { Text } = Typography;

const StyledFileSize = styled(Text)`
  font-size: 12px;
  color: var(--ant-color-text-secondary);
`;

interface FileSizeProps {
  file: FileModel;
}

const FileSize: React.FC<FileSizeProps> = ({ file }) => {
  return (
    <StyledFileSize>
      {file.isDirectory ? '-' : formatFileSize(file.size)}
    </StyledFileSize>
  );
};

export default FileSize; 