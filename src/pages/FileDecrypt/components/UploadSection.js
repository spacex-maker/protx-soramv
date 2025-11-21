import React from 'react';
import { Upload, Button, message } from 'antd';
import { InboxOutlined, LockOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { formatFileSize } from '../../../utils';
import { StyledUploadSection } from '../styles/StyledComponents';

const { Dragger } = Upload;

const UploadSection = ({
  files,
  maxFileSize,
  decrypting,
  selectedFiles,
  handleFileSelect,
  handleStartDecrypt,
  handleClearFiles
}) => {
  const intl = useIntl();
  
  return (
    <StyledUploadSection>
      <div className="upload-area">
        <Dragger
          accept=".encrypted"
          beforeUpload={() => false}
          onChange={handleFileSelect}
          showUploadList={false}
          multiple={true}
          openFileDialogOnClick={true}
          customRequest={() => {}}
          fileList={files}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {intl.formatMessage({ id: 'decrypt.upload.dragText' })}
          </p>
          <p className="ant-upload-hint">
            {intl.formatMessage(
              { id: 'decrypt.upload.hint' },
              { maxSize: formatFileSize(maxFileSize) }
            )}
          </p>
        </Dragger>
      </div>

      <div className="action-buttons">
        <Button
          type="primary"
          icon={<LockOutlined />}
          onClick={handleStartDecrypt}
          loading={decrypting}
          disabled={selectedFiles.length === 0}
        >
          {intl.formatMessage({ id: 'decrypt.upload.button.decrypt' })}
        </Button>
        {files.length > 0 && (
          <Button
            danger
            onClick={handleClearFiles}
            disabled={decrypting}
          >
            {intl.formatMessage({ id: 'decrypt.upload.button.clear' })}
          </Button>
        )}
      </div>
    </StyledUploadSection>
  );
};

export default UploadSection; 