import React from 'react';
import ImageToVideo from '../ImageToVideo';

/**
 * Seedance 图生视频独立页面
 * 复用 ImageToVideo，仅展示字节 Seedance 模型，使用独立路由 /workspace/create/seedance-video
 */
const SeedanceVideo: React.FC = () => {
  return <ImageToVideo seedancePage />;
};

export default SeedanceVideo;
