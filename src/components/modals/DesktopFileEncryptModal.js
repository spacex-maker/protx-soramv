import React, { useState } from 'react';
import { Modal, Input, Table, Space, Typography, Button, message, Progress, Alert, Tooltip, Tag } from 'antd';
import { 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  SafetyCertificateOutlined,
  WarningOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import CryptoJS from 'crypto-js';
import { getEllipsisFileName } from '../../utils/format';

const { Text, Paragraph } = Typography;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    min-height: 520px;
    display: flex;
    flex-direction: column;
  }

  .ant-modal-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
  }

  .ant-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
`;

const SecurityTips = styled.div`
  margin-bottom: 24px;
  
  .ant-alert {
    margin-bottom: 16px;
  }
  
  .security-features {
    background: var(--ant-color-primary-bg);
    border-radius: 8px;
    padding: 16px;
    
    .ant-typography {
      color: var(--ant-color-text-secondary);
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

const PasswordInput = styled.div`
  margin-bottom: 24px;
  
  .ant-input-affix-wrapper {
    &:hover, &:focus {
      z-index: 0;
    }
  }
`;

const NoFormSpace = styled(Space)`
  &[role="presentation"] {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
`;

const FileItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
`;

const ProgressWrapper = styled.div`
  margin-top: 4px;
  width: 100%;
`;

const PasswordTip = styled(Text)`
  color: #ff4d4f !important;
  display: flex;
  align-items: center;
  gap: 4px;
  
  .anticon {
    font-size: 14px;
  }
`;

const EncryptedTag = styled(Tag)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  
  .anticon {
    font-size: 12px;
  }
`;

const SecurityCard = styled.div`
  background: var(--ant-color-primary-bg);
  border-radius: 12px;
  overflow: hidden;
  
  .header {
    padding: 16px;
    background: var(--ant-color-primary-1);
    border-bottom: 1px solid var(--ant-color-primary-3);
    
    .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--ant-color-text);
      display: flex;
      align-items: center;
      gap: 8px;
      
      .anticon {
        color: var(--ant-color-primary);
      }
    }
  }
  
  .content {
    padding: 16px;
    
    .feature-group {
      &:not(:last-child) {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px dashed var(--ant-color-split);
      }
      
      .group-title {
        font-weight: 500;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--ant-color-text);
        
        .anticon {
          color: var(--ant-color-primary);
        }
      }
      
      .feature-list {
        margin: 0;
        padding-left: 24px;
        
        li {
          color: var(--ant-color-text-secondary);
          margin-bottom: 8px;
          line-height: 1.5;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          &.warning {
            color: #ff4d4f;
            
            .anticon {
              color: #ff4d4f;
            }
          }
        }
      }
    }
  }
`;

const DesktopFileEncryptModal = ({
  visible,
  files,
  onCancel,
  onEncryptComplete,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [progress, setProgress] = useState(new Map());

  // 加密单个文件
  const encryptFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // 更新加密进度
          setProgress(prev => new Map(prev).set(file.name, {
            status: 'encrypting',
            percent: 30
          }));

          // 1. 创建校验块（将密码本身加密作为校验块）
          const validationContent = CryptoJS.AES.encrypt(
            "VALID",  // 固定的校验字符串
            password  // 使用相同的密码
          ).toString();

          // 2. 将文件内容转换为 WordArray
          const contentArray = CryptoJS.lib.WordArray.create(e.target.result);
          
          // 3. 加密文件内容
          const encryptedContent = CryptoJS.AES.encrypt(contentArray, password).toString();
          
          // 4. 创建加密文件头标记
          const headerText = "MSTCRYPT";
          const headerBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(headerText));
          
          // 5. 合并头部、校验块和加密内容
          // 格式：MSTCRYPT + 校验块长度(4字节) + 校验块 + 加密内容
          const validationLength = validationContent.length.toString().padStart(4, '0');
          const finalContent = headerBase64 + validationLength + validationContent + encryptedContent;

          // 6. 创建新的加密文件
          const encryptedBlob = new Blob([finalContent], { type: 'application/encrypted' });
          const encryptedFile = new File([encryptedBlob], `${file.name}.encrypted`, {
            type: 'application/encrypted',
            lastModified: new Date()
          });

          // 更新进度为完成
          setProgress(prev => new Map(prev).set(file.name, {
            status: 'completed',
            percent: 100
          }));

          resolve(encryptedFile);
        } catch (error) {
          console.error('加密过程出错:', error);
          setProgress(prev => new Map(prev).set(file.name, {
            status: 'error',
            percent: 0
          }));
          reject(error);
        }
      };

      reader.onerror = () => {
        setProgress(prev => new Map(prev).set(file.name, {
          status: 'error',
          percent: 0
        }));
        reject(new Error('文件读取失败'));
      };

      // 开始读取文件
      setProgress(prev => new Map(prev).set(file.name, {
        status: 'reading',
        percent: 10
      }));
      reader.readAsArrayBuffer(file);
    });
  };

  // 检查文件是否已加密
  const checkEncrypted = (fileName) => {
    return fileName.toLowerCase().endsWith('.encrypted');
  };

  // 处理加密所有文件
  const handleEncrypt = async () => {
    if (!password) {
      message.error('请输入加密密码');
      return;
    }

    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      message.error('密码长度至少为6位');
      return;
    }

    // 检查是否有已加密的文件
    const encryptedFiles = Array.from(files).filter(file => checkEncrypted(file.name));
    if (encryptedFiles.length > 0) {
      Modal.confirm({
        title: '文件可能已加密',
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
        content: (
          <div>
            <p>以下文件可能已经过加密：</p>
            <ul>
              {encryptedFiles.map(file => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
            <p style={{ color: '#ff4d4f', marginTop: 16 }}>
              <WarningOutlined /> 重复加密的文件在解密时需要按照加密顺序反向解密多次
            </p>
            <p>是否继续加密这些文件？</p>
          </div>
        ),
        okText: '继续加密',
        cancelText: '取消',
        onOk: () => encryptFiles(),
      });
    } else {
      encryptFiles();
    }
  };

  // 执行加密操作
  const encryptFiles = async () => {
    try {
      setEncrypting(true);
      
      // 保存原始文件列表的副本
      const originalFilesList = Array.from(files);
      
      // 初始化进度
      const initialProgress = new Map();
      originalFilesList.forEach(file => {
        initialProgress.set(file.name, {
          status: 'pending',
          percent: 0
        });
      });
      setProgress(initialProgress);

      // 并行加密所有文件
      const encryptPromises = originalFilesList.map(file => encryptFile(file));
      const encryptedFiles = await Promise.all(encryptPromises);

      // 调用完成回调，确保同时传递加密后的文件和原始文件
      onEncryptComplete(encryptedFiles, originalFilesList);
      message.success('文件加密完成');
      
      // 清理状态
      setPassword('');
      setConfirmPassword('');
      onCancel();
    } catch (error) {
      console.error('加密失败:', error);
      message.error('加密失败: ' + (error.message || '未知错误'));
    } finally {
      setEncrypting(false);
    }
  };

  const columns = [
    {
      title: '文件列表',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const fileProgress = progress.get(record.name);
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = record.size;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
          value /= 1024;
          unitIndex++;
        }
        const fileSize = `${value.toFixed(2)} ${units[unitIndex]}`;
        
        return (
          <FileItemWrapper>
            <FileNameRow>
              <Tooltip title={text}>
                <Text ellipsis style={{ flex: 1 }}>{getEllipsisFileName(text)}</Text>
              </Tooltip>
              {checkEncrypted(text) && (
                <Tooltip title="此文件可能已经过加密，重复加密需要多次解密">
                  <EncryptedTag color="warning">
                    <WarningOutlined />
                    已加密
                  </EncryptedTag>
                </Tooltip>
              )}
            </FileNameRow>
            <FileMetaRow>
              <span>{fileSize}</span>
              <span>•</span>
              <span>{!fileProgress ? '等待加密' : 
                fileProgress.status === 'reading' ? '准备中...' :
                fileProgress.status === 'encrypting' ? '加密中...' :
                fileProgress.status === 'completed' ? '加密完成' :
                fileProgress.status === 'error' ? '加密失败' : '等待加密'
              }</span>
            </FileMetaRow>
            {fileProgress && (
              <ProgressWrapper>
                <Progress
                  percent={fileProgress.percent}
                  size="small"
                  status={
                    fileProgress.status === 'error' ? 'exception' :
                    fileProgress.status === 'completed' ? 'success' :
                    'active'
                  }
                />
              </ProgressWrapper>
            )}
          </FileItemWrapper>
        );
      }
    }
  ];

  return (
    <StyledModal
      title={
        <Space>
          <LockOutlined />
          <span>加密文件</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={encrypting}>
          取消
        </Button>,
        <Button
          key="encrypt"
          type="primary"
          onClick={handleEncrypt}
          loading={encrypting}
          icon={<LockOutlined />}
        >
          开始加密
        </Button>
      ]}
      width={600}
      maskClosable={false}
      closable={!encrypting}
      keyboard={false}
      getContainer={() => document.body}
    >
      <SecurityTips>
        <SecurityCard>
          <div className="header">
            <div className="title">
              <SafetyCertificateOutlined />
              AI2OBJ 安全加密
            </div>
          </div>
          <div className="content">
            <div className="feature-group">
              <div className="group-title">
                <SafetyCertificateOutlined />
                基础安全特性
              </div>
              <ul className="feature-list">
                <li>使用业界标准的 AES 加密算法，为您的文件提供强大的加密保护</li>
                <li>加密过程完全在浏览器端进行，原始文件不会上传，确保数据安全</li>
              </ul>
            </div>
            
            <div className="feature-group">
              <div className="group-title">
                <LockOutlined />
                双重加密功能
              </div>
              <ul className="feature-list">
                <li>支持多重加密：您可以对同一文件进行多次加密，每次使用不同的密码</li>
                <li>双人加密示例：您和好友可以分别使用自己的密码对文件进行加密，这样需要两个人同时使用各自的密码才能解密</li>
                <li className="warning">
                  <Space align="start">
                    <WarningOutlined />
                    <span>解密时需要按照加密的相反顺序进行，比如好友先加密、您后加密，那么解密时您需要先解密，然后再由好友解密</span>
                  </Space>
                </li>
              </ul>
            </div>
          </div>
        </SecurityCard>
      </SecurityTips>

      <PasswordInput>
        <NoFormSpace 
          direction="vertical" 
          style={{ width: '100%' }} 
          role="presentation" 
          onSubmit={(e) => e.preventDefault()}
        >
          <Input.Password
            placeholder="请输入加密密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            type="text"
            role="presentation"
          />
          <Input.Password
            placeholder="请确认加密密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            autoComplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            type="text"
            role="presentation"
          />
          <PasswordTip type="danger">
            <SafetyCertificateOutlined />
            请记住您的加密密码，文件解密时需要使用相同的密码
          </PasswordTip>
        </NoFormSpace>
      </PasswordInput>

      <Table
        dataSource={Array.from(files).map(file => ({
          key: file.name,
          name: file.name,
          size: file.size
        }))}
        columns={columns}
        pagination={false}
        size="small"
      />
    </StyledModal>
  );
};

export default DesktopFileEncryptModal; 