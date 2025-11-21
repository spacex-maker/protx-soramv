import React, { useState } from 'react';
import { Button, Card, Space, message, Typography } from 'antd';
import CryptoJS from 'crypto-js';

const { Text } = Typography;

const TestCrypto = () => {
  const [testResult, setTestResult] = useState('');
  const password = '123456';
  const testContent = 'Hello, this is a test content!';

  // 加密函数
  const encrypt = (content) => {
    try {
      // 1. 将内容转换为 WordArray
      const contentArray = CryptoJS.enc.Utf8.parse(content);
      
      // 2. 使用 AES 加密
      const encrypted = CryptoJS.AES.encrypt(contentArray, password, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // 3. 创建加密文件头标记
      const headerText = "MSTCRYPT";
      const headerBase64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(headerText));
      
      // 4. 合并头部和加密内容
      const encryptedContent = encrypted.toString();
      const finalContent = headerBase64 + encryptedContent;
      
      return finalContent;
    } catch (error) {
      console.error('加密错误:', error);
      throw error;
    }
  };

  // 解密函数
  const decrypt = (encryptedContent) => {
    try {
      // 1. 提取头部（前12个字符，因为"MSTCRYPT"的Base64编码长度为12）
      const headerBase64 = encryptedContent.slice(0, 12);
      const header = CryptoJS.enc.Base64.parse(headerBase64);
      const headerText = CryptoJS.enc.Utf8.stringify(header);
      
      // 2. 检查文件头
      if (headerText !== "MSTCRYPT") {
        throw new Error('不是有效的加密文件');
      }
      
      // 3. 提取加密内容
      const encryptedData = encryptedContent.slice(12);
      
      // 4. 解密内容
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData,
        password,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      // 5. 转换回字符串
      return CryptoJS.enc.Utf8.stringify(decrypted);
    } catch (error) {
      console.error('解密错误:', error);
      throw error;
    }
  };

  // 运行测试
  const runTest = () => {
    try {
      setTestResult('');
      let result = '测试开始...\n\n';
      
      // 1. 原始内容
      result += `原始内容: ${testContent}\n\n`;
      
      // 2. 加密
      const encrypted = encrypt(testContent);
      result += `加密后的内容: ${encrypted}\n\n`;
      
      // 3. 解密
      const decrypted = decrypt(encrypted);
      result += `解密后的内容: ${decrypted}\n\n`;
      
      // 4. 验证
      const isSuccess = testContent === decrypted;
      result += `测试结果: ${isSuccess ? '成功' : '失败'}\n`;
      if (isSuccess) {
        result += '加密和解密过程正确！';
        message.success('测试成功！');
      } else {
        result += '加密和解密结果不匹配！';
        message.error('测试失败！');
      }
      
      setTestResult(result);
    } catch (error) {
      const errorMsg = `测试出错: ${error.message}`;
      setTestResult(errorMsg);
      message.error(errorMsg);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="加密解密测试">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" onClick={runTest}>
            运行测试
          </Button>
          
          <div style={{ marginTop: 16 }}>
            <Text>测试密码: {password}</Text>
          </div>
          
          <pre style={{ 
            marginTop: 16,
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {testResult || '点击"运行测试"开始测试...'}
          </pre>
        </Space>
      </Card>
    </div>
  );
};

export default TestCrypto; 