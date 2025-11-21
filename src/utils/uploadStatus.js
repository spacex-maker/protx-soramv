import { 
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ClockCircleOutlined,
  PauseCircleFilled,
} from '@ant-design/icons';

/**
 * 获取上传状态图标
 * @param {string} status - 上传状态
 * @returns {React.ReactNode} 状态图标组件
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'success':
      return <CheckCircleFilled style={{ color: '#52c41a' }} />;
    case 'error':
      return <CloseCircleFilled style={{ color: '#ff4d4f' }} />;
    case 'uploading':
      return <LoadingOutlined style={{ color: '#1677ff' }} />;
    case 'creating':
      return <LoadingOutlined style={{ color: '#722ed1' }} />;
    case 'skipped':
      return <CloseCircleFilled style={{ color: '#8c8c8c' }} />;
    case 'pending':
      return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    case 'paused':
      return <PauseCircleFilled style={{ color: '#faad14' }} />;
    default:
      return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
  }
};

/**
 * 获取上传状态文本
 * @param {string} status - 上传状态
 * @param {boolean} isDuplicate - 是否为重复文件
 * @returns {string} 状态文本
 */
export const getStatusText = (status, isDuplicate) => {
  switch (status) {
    case 'pending': return isDuplicate ? '等待覆盖' : '等待上传';
    case 'uploading': return isDuplicate ? '覆盖中' : '上传中';
    case 'creating': return '创建文件记录';
    case 'success': return '上传成功';
    case 'error': return '上传失败';
    case 'skipped': return '已跳过';
    case 'paused': return '已暂停';
    default: return '未知状态';
  }
}; 