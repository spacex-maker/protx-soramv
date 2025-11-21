import { 
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
} from '@ant-design/icons';

/**
 * 获取文件图标组件
 * @param {string} filename - 文件名
 * @returns {React.ReactNode} 文件图标组件
 */
export const getFileIcon = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return <FileOutlined style={{ color: '#8c8c8c' }} className="icon" />;
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return <FilePdfOutlined style={{ color: '#ff4d4f' }} className="icon" />;
    case 'doc':
    case 'docx': return <FileWordOutlined style={{ color: '#1677ff' }} className="icon" />;
    case 'xls':
    case 'xlsx': return <FileExcelOutlined style={{ color: '#52c41a' }} className="icon" />;
    case 'ppt':
    case 'pptx': return <FilePptOutlined style={{ color: '#fa8c16' }} className="icon" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return <FileImageOutlined style={{ color: '#13c2c2' }} className="icon" />;
    case 'zip':
    case 'rar': return <FileZipOutlined style={{ color: '#722ed1' }} className="icon" />;
    case 'txt': return <FileTextOutlined style={{ color: '#8c8c8c' }} className="icon" />;
    case 'md': return <FileMarkdownOutlined style={{ color: '#1677ff' }} className="icon" />;
    default: return <FileOutlined style={{ color: '#8c8c8c' }} className="icon" />;
  }
}; 