import React from 'react';
import TextToImageTaskDetailModal from 'pages/Workspace/Create/components/TextToImage/TaskDetailModal';
import { TaskDetailModal as ImageToImageTaskDetailModal } from 'pages/Workspace/Create/components/ImageToImage/History';
import TextToVideoTaskDetailModal from 'pages/Workspace/Create/components/TextToVideo/TaskDetailModal';
import ImageToVideoTaskDetailModal from 'pages/Workspace/Create/components/ImageToVideo/TaskDetailModal';

const WorkTaskDetailModals = ({ taskId, taskType, onClose }) => {
  if (taskId == null || !taskType) return null;

  switch (taskType) {
    case 't2i':
      return <TextToImageTaskDetailModal open taskId={taskId} onClose={onClose} />;
    case 'i2i':
      return <ImageToImageTaskDetailModal open taskId={taskId} onClose={onClose} />;
    case 't2v':
      return <TextToVideoTaskDetailModal open taskId={taskId} onClose={onClose} />;
    case 'i2v':
      return <ImageToVideoTaskDetailModal open taskId={taskId} onClose={onClose} />;
    default:
      return null;
  }
};

export default WorkTaskDetailModals;
