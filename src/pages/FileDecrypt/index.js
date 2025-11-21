import React, { useState } from 'react';
import { Layout, Typography, Upload, Input, Button, Card, Progress, message, Space, Divider, Tag, Table, Modal, Tooltip, Collapse, App, Alert } from 'antd';
import { 
  InboxOutlined, 
  LockOutlined, 
  SafetyCertificateOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import SimpleHeader from 'components/headers/simple';
import SecurityFeatures from './components/SecurityFeatures';
import CBCEncryptionDiagram from './components/CBCEncryptionDiagram';
import ChunkDecryptDiagram from './components/ChunkDecryptDiagram';
import {
  formatTime,
  formatSpeed,
  formatFileSize,
  getEllipsisFileName,
  readFileAsArrayBuffer,
  downloadFile,
  getRecommendedFileSize,
  decryptContent
} from '../../utils';

// 导入组件
import FileUploadSection from './components/UploadSection';
import FileListSectionComponent from './components/FileListSection';
import DecryptStepsComponent from './components/DecryptSteps';
import SecurityTipModalComponent from './components/SecurityTipModal';
import PasswordModalComponent from './components/PasswordModal';

// 导入样式
import {
  PageContainer,
  ContentWrapper,
  TopSection,
  DecryptCard,
  DecryptLayout,
  PageTitle
} from './styles/StyledComponents';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const FileDecryptPage = ({
  isVipUser = false
}) => {
  const intl = useIntl();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [fileProgress, setFileProgress] = useState(new Map());
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [securityTipVisible, setSecurityTipVisible] = useState(false);
  const [fileStats, setFileStats] = useState(new Map());
  const [maxFileSize] = useState(getRecommendedFileSize());

  // 处理文件选择
  const handleFileSelect = (info) => {
    const selectedFiles = info.fileList;
    
    // 检查是否为加密文件
    const invalidFiles = selectedFiles.filter(file => !file.name.endsWith('.encrypted'));
    if (invalidFiles.length > 0) {
      message.error(intl.formatMessage({ id: 'decrypt.message.invalidFile' }));
      return;
    }
    
    // 文件去重处理
    const uniqueFiles = selectedFiles.reduce((acc, current) => {
      const isDuplicate = acc.some(file => 
        file.name === current.name && 
        file.size === current.size &&
        file.lastModified === current.originFileObj?.lastModified
      );
      if (!isDuplicate) {
        acc.push(current);
      } else {
        message.warning(intl.formatMessage(
          { id: 'decrypt.message.duplicate' },
          { filename: current.name }
        ));
      }
      return acc;
    }, []);
    
    // 非会员大小限制检查
    if (!isVipUser) {
      const largeFiles = uniqueFiles.filter(file => file.size > 4 * 1024 * 1024 * 1024);
      if (largeFiles.length > 0) {
        Modal.warning({
          title: intl.formatMessage({ id: 'decrypt.message.oversizeTitle' }),
          content: (
            <div>
              <p>{intl.formatMessage({ id: 'decrypt.message.oversizeContent' })}</p>
              <ul>
                {largeFiles.map(file => (
                  <li key={file.uid}>{file.name} ({formatFileSize(file.size)})</li>
                ))}
              </ul>
              <p style={{ color: '#ff4d4f', marginTop: 16 }}>
                {intl.formatMessage({ id: 'decrypt.message.oversizeHint' })}
              </p>
            </div>
          ),
          okText: 'OK'
        });
        return;
      }
    }
    
    const newFiles = uniqueFiles.map(file => ({
      ...file,
      status: 'pending',
      progress: 0
    }));
    
    setFiles(newFiles);
  };

  // 处理文件选择状态变化
  const handleSelectionChange = (selectedRowKeys) => {
    setSelectedFiles(selectedRowKeys);
  };

  // 处理开始解密
  const handleStartDecrypt = () => {
    if (selectedFiles.length === 0) {
      message.error(intl.formatMessage({ id: 'decrypt.message.selectFile' }));
      return;
    }
    setPasswordModalVisible(true);
  };

  // 修改密码确认处理函数
  const handlePasswordConfirm = async () => {
    if (!password) {
      message.error(intl.formatMessage({ id: 'decrypt.message.enterPassword' }));
      return;
    }

    setPasswordModalVisible(false);
    setDecrypting(true);

    try {
      const selectedFileObjects = files.filter(file => selectedFiles.includes(file.uid));
      
      const hasFileSystemAccess = 'showSaveFilePicker' in window;
      
      for (const file of selectedFileObjects) {
        try {
          updateFileProgress(file.uid, 10);
          const fileContent = await readFileAsArrayBuffer(file.originFileObj);
          
          updateFileProgress(file.uid, 30);
          const decrypted = await decryptContent(
            fileContent, 
            password, 
            file.uid, 
            isVipUser,
            (fileUid, progress) => updateFileProgress(fileUid, progress)
          );
          updateFileProgress(file.uid, 80);
          
          const fileName = file.name.replace('.encrypted', '');
          const decryptedFile = new File([decrypted], fileName, {
            type: 'application/octet-stream',
            lastModified: Date.now()
          });

          if (hasFileSystemAccess && file.saveLocation) {
            try {
              const fileHandle = await file.saveLocation.getFileHandle(fileName, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(decryptedFile);
              await writable.close();
              updateFileProgress(file.uid, 100, 'success');
              message.success(intl.formatMessage(
                { id: 'decrypt.message.decryptSuccess' },
                { filename: fileName }
              ));
            } catch (error) {
              if (error.name === 'AbortError') {
                updateFileProgress(file.uid, 0, 'error');
                message.info(intl.formatMessage(
                  { id: 'decrypt.message.saveCancel' },
                  { filename: fileName }
                ));
              } else {
                throw error;
              }
            }
          } else {
            const url = URL.createObjectURL(decryptedFile);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            updateFileProgress(file.uid, 100, 'success');
            message.success(intl.formatMessage(
              { id: 'decrypt.message.downloadSuccess' },
              { filename: fileName }
            ));
          }
        } catch (error) {
          console.error('文件解密失败:', file.name, error);
          updateFileProgress(file.uid, 0, 'error', error.message);
          message.error(intl.formatMessage(
            { id: 'decrypt.message.decryptError' },
            { filename: file.name, error: error.message }
          ));
        }
      }

      setSelectedFiles([]);
      setPassword('');
    } catch (error) {
      console.error('批量解密失败:', error);
      message.error(intl.formatMessage({ id: 'decrypt.message.batchError' }));
    } finally {
      setDecrypting(false);
    }
  };

  // 清空文件列表
  const handleClearFiles = () => {
    setFiles([]);
    setFileProgress(new Map());
    setSelectedFiles([]);
    setFileStats(new Map());
  };

  // 更新文件进度
  const updateFileProgress = (fileUid, progress, status = 'decrypting', errorMessage = '') => {
    const now = Date.now();
    
    setFileProgress(prev => {
      const next = new Map(prev);
      next.set(fileUid, { progress, status, errorMessage });
      return next;
    });
    
    setFileStats(prev => {
      const stats = prev.get(fileUid) || {
        startTime: now,
        lastUpdateTime: now,
        lastProgress: 0,
        processedSize: 0,
        totalSize: files.find(f => f.uid === fileUid)?.size || 0
      };
      
      const timeElapsed = (now - stats.lastUpdateTime) / 1000;
      const progressDiff = progress - (stats.lastProgress || 0);
      const processedSize = (stats.totalSize * progress) / 100;
      const speed = timeElapsed > 0 ? (processedSize - stats.processedSize) / timeElapsed : 0;
      
      const remainingSize = stats.totalSize - processedSize;
      const remainingTime = speed > 0 ? remainingSize / speed : 0;
      
      const next = new Map(prev);
      next.set(fileUid, {
        ...stats,
        lastUpdateTime: now,
        lastProgress: progress,
        processedSize,
        speed,
        timeSpent: (now - stats.startTime) / 1000,
        remainingTime,
      });
      return next;
    });
    
    setFiles(prev => 
      prev.map(file => 
        file.uid === fileUid 
          ? { ...file, status, progress }
          : file
      )
    );
  };

  // 获取文件信息
  const getFileLocationInfo = (file) => {
    const lastModified = file.originFileObj?.lastModified ? new Date(file.originFileObj.lastModified) : null;
    
    return {
      name: file.name,
      size: formatFileSize(file.size),
      lastModified: lastModified ? lastModified.toLocaleString() : intl.formatMessage({ id: 'common.unknown' }),
      type: file.type || 'application/octet-stream'
    };
  };

  // 显示文件信息
  const handleShowFileInfo = (file) => {
    const fileInfo = getFileLocationInfo(file);
    
    Modal.info({
      title: intl.formatMessage({ id: 'decrypt.fileInfo.modal.title' }),
      width: 480,
      content: (
        <div style={{ 
          background: 'var(--ant-color-bg-container-disabled)', 
          padding: 16, 
          borderRadius: 8,
          marginTop: 16
        }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">{intl.formatMessage({ id: 'decrypt.fileInfo.name' })}：</Text>
              <Text copyable>{fileInfo.name}</Text>
            </div>
            <div>
              <Text type="secondary">{intl.formatMessage({ id: 'decrypt.fileInfo.size' })}：</Text>
              <Text>{fileInfo.size}</Text>
            </div>
            <div>
              <Text type="secondary">{intl.formatMessage({ id: 'decrypt.fileInfo.lastModified' })}：</Text>
              <Text>{fileInfo.lastModified}</Text>
            </div>
            <div>
              <Text type="secondary">{intl.formatMessage({ id: 'decrypt.fileInfo.type' })}：</Text>
              <Text>{fileInfo.type}</Text>
            </div>
          </Space>
        </div>
      ),
    });
  };

  return (
    <App>
      <PageContainer>
        <Helmet>
          <title>{intl.formatMessage({ id: 'page.decrypt.helmet.title' })}</title>
          <meta 
            name="description" 
            content={intl.formatMessage({ id: 'page.decrypt.helmet.description' })}
          />
        </Helmet>
        
        <SimpleHeader />
        
        <PageTitle>
          <Title level={2}>
            <LockOutlined /> {intl.formatMessage({ id: 'page.decrypt.title' })}
          </Title>
          <Text type="secondary" className="subtitle">
            {intl.formatMessage({ id: 'page.decrypt.subtitle' })}
          </Text>
        </PageTitle>

        <ContentWrapper>
          <TopSection>
            <DecryptCard
              title={
                <Space>
                  <LockOutlined style={{ color: '#1677ff' }} />
                  <span>{intl.formatMessage({ id: 'page.decrypt.title' })}</span>
                  {files.length > 0 && (
                    <Tag color="blue">{files.length} {intl.formatMessage({ id: 'common.files' })}</Tag>
                  )}
                </Space>
              }
            >
              <Button
                type="text"
                icon={<SafetyCertificateOutlined />}
                onClick={() => setSecurityTipVisible(true)}
                className="security-tip-btn"
              >
                {intl.formatMessage({ id: 'decrypt.security.modal.title' })}
              </Button>
              <DecryptLayout>
                <FileUploadSection
                  files={files}
                  maxFileSize={maxFileSize}
                  decrypting={decrypting}
                  selectedFiles={selectedFiles}
                  handleFileSelect={handleFileSelect}
                  handleStartDecrypt={handleStartDecrypt}
                  handleClearFiles={handleClearFiles}
                />

                <FileListSectionComponent
                  files={files}
                  selectedFiles={selectedFiles}
                  fileProgress={fileProgress}
                  fileStats={fileStats}
                  decrypting={decrypting}
                  handleSelectionChange={handleSelectionChange}
                  handleShowFileInfo={handleShowFileInfo}
                />
              </DecryptLayout>
            </DecryptCard>

            <SecurityFeatures />
            <DecryptStepsComponent />
          </TopSection>
        </ContentWrapper>

        <PasswordModalComponent
          visible={passwordModalVisible}
          password={password}
          onPasswordChange={setPassword}
          onOk={handlePasswordConfirm}
          onCancel={() => {
            setPasswordModalVisible(false);
            setPassword('');
          }}
          decrypting={decrypting}
        />

        <SecurityTipModalComponent
          visible={securityTipVisible}
          onClose={() => setSecurityTipVisible(false)}
          isVipUser={isVipUser}
        />
      </PageContainer>
    </App>
  );
};

export default FileDecryptPage; 