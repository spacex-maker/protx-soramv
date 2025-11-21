import CryptoJS from 'crypto-js';

/**
 * 解密单个数据块
 * @param {ArrayBuffer} chunk - 数据块
 * @param {string} password - 解密密码
 * @returns {Uint8Array} 解密后的数据
 */
export const decryptChunk = async (chunk, password) => {
  try {
    // 1. 将 ArrayBuffer 转换为字符串
    const decoder = new TextDecoder();
    const content = decoder.decode(chunk);
    
    // 2. 提取并验证头部（前12个字符）
    const headerBase64 = content.slice(0, 12);
    const header = CryptoJS.enc.Base64.parse(headerBase64);
    const headerText = CryptoJS.enc.Utf8.stringify(header);
    
    if (headerText !== "MSTCRYPT") {
      throw new Error('不是有效的加密文件');
    }
    
    // 3. 提取校验块长度（4字节）
    const validationLength = parseInt(content.slice(12, 16));
    if (isNaN(validationLength) || validationLength <= 0) {
      throw new Error('文件格式错误');
    }
    
    // 4. 提取校验块
    const validationContent = content.slice(16, 16 + validationLength);
    
    // 5. 验证密码
    try {
      const decryptedValidation = CryptoJS.AES.decrypt(validationContent, password).toString(CryptoJS.enc.Utf8);
      if (decryptedValidation !== "VALID") {
        throw new Error('密码错误，请确认后重试');
      }
    } catch (error) {
      throw new Error('密码错误，请确认后重试');
    }
    
    // 6. 提取并解密文件内容
    const encryptedData = content.slice(16 + validationLength);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
    
    // 7. 转换为二进制
    const result = new Uint8Array(decrypted.sigBytes);
    const words = decrypted.words;
    
    for (let i = 0; i < decrypted.sigBytes; i++) {
      result[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return result;
  } catch (error) {
    console.error('解密错误:', error);
    throw new Error(error.message || '密码错误，请确认后重试');
  }
};

/**
 * 解密大文件
 * @param {ArrayBuffer} content - 文件内容
 * @param {string} password - 解密密码
 * @param {string} fileUid - 文件唯一标识
 * @param {number} chunkSize - 分块大小（默认10MB）
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Blob>} 解密后的文件内容
 */
export const decryptLargeFile = async (content, password, fileUid, chunkSize = 10 * 1024 * 1024, onProgress) => {
  const chunks = Math.ceil(content.byteLength / chunkSize);
  const decryptedChunks = [];
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, content.byteLength);
    const chunk = content.slice(start, end);
    
    // 解密当前块
    const decryptedChunk = await decryptChunk(chunk, password);
    decryptedChunks.push(decryptedChunk);
    
    // 更新进度
    const progress = Math.round((i + 1) / chunks * 100);
    if (onProgress) {
      onProgress(fileUid, progress);
    }
  }
  
  return new Blob(decryptedChunks);
};

/**
 * 解密文件内容
 * @param {ArrayBuffer} content - 文件内容
 * @param {string} password - 解密密码
 * @param {string} fileUid - 文件唯一标识
 * @param {boolean} isVipUser - 是否是VIP用户
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Uint8Array|Blob>} 解密后的文件内容
 */
export const decryptContent = async (content, password, fileUid, isVipUser, onProgress) => {
  try {
    if (isVipUser && content.byteLength > 2 * 1024 * 1024 * 1024) {
      return await decryptLargeFile(content, password, fileUid, 10 * 1024 * 1024, onProgress);
    } else {
      return await decryptChunk(content, password);
    }
  } catch (error) {
    console.error('解密错误:', error);
    throw new Error('密码错误，请确认后重试');
  }
}; 