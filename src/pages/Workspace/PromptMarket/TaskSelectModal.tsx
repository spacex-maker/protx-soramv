import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Empty, Spin, Pagination, theme, Row, Col, Typography, Tooltip } from 'antd';
import { PictureOutlined, PlayCircleOutlined, CheckCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import instance from 'api/axios';
import TextToImageTaskDetailModal from 'pages/Workspace/Create/components/TextToImage/TaskDetailModal';
import { TaskDetailModal as ImageToImageTaskDetailModal } from 'pages/Workspace/Create/components/ImageToImage/History';
import TextToVideoTaskDetailModal from 'pages/Workspace/Create/components/TextToVideo/TaskDetailModal';
import ImageToVideoTaskDetailModal from 'pages/Workspace/Create/components/ImageToVideo/TaskDetailModal';

const { Text } = Typography;

// --- 类型定义 ---
export interface GenTaskRecord {
  id: number;
  taskType: string;
  modelName: string;
  modelCode: string;
  status: number;
  thumbnailUrl: string | null;
  resultUrls: string[] | null;
  createTime: string;
  [key: string]: any;
}

interface TaskDetailData {
  prompt?: string;
  seed?: number | null;
  version?: string | null;
  model?: { modelType?: string; modelCode?: string; releaseYear?: string; [key: string]: any };
  outputFiles?: { fileUrl: string; [key: string]: any }[];
  [key: string]: any;
}

export interface TaskSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (task: any) => void;
}

// --- 辅助配置 & 函数 ---
const TASK_TYPE_OPTIONS = [
  { taskType: 't2i', label: '文生图', icon: <PictureOutlined /> },
  { taskType: 't2v', label: '文生视频', icon: <PlayCircleOutlined /> },
  { taskType: 'i2i', label: '图生图', icon: <PictureOutlined /> },
  { taskType: 'i2v', label: '图生视频', icon: <PlayCircleOutlined /> },
];

export const isVideoUrl = (url: string) => /\.(mp4|webm|mov|ogg|mkv)(\?|$)/i.test(url || '');

const getPreviewUrl = (record: GenTaskRecord) =>
  record.thumbnailUrl ?? (Array.isArray(record.resultUrls) ? record.resultUrls[0] : null);

/** 腾讯云图片压缩后缀，与任务记录相关页面一致 */
const addImageCompressSuffix = (url: string | null | undefined, width = 400): string => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

// --- 主组件 ---
const TaskSelectModal: React.FC<TaskSelectModalProps> = ({ visible, onClose, onSelect }) => {
  const { token } = theme.useToken();
  
  // 状态
  const [selectedTaskType, setSelectedTaskType] = useState<string>('t2i'); // 默认选中第一个，减少用户操作
  const [tasks, setTasks] = useState<GenTaskRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null); // 当前查看详情的任务 ID
  const [pagination, setPagination] = useState({ current: 1, pageSize: 9, total: 0 }); // pageSize 9 适配 3列布局

  // 数据请求
  const fetchTasks = useCallback(
    async (page: number = 1, pageSize: number = 9) => {
      if (!selectedTaskType) return;
      setLoading(true);
      try {
        const res = await instance.get<any>('/productx/sa-ai-gen-task/my-tasks/page', {
          params: { currentPage: page, pageSize, taskType: selectedTaskType, successOnly: true },
        });
        if (res.data.success && res.data.data) {
          setTasks(res.data.data.records || []);
          setPagination({
            current: res.data.data.current,
            pageSize: res.data.data.size,
            total: res.data.data.total,
          });
        }
      } catch (e: any) {
        // 生产环境建议用 message.error，这里保持静默或打log
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [selectedTaskType]
  );

  useEffect(() => {
    if (visible) fetchTasks(1, pagination.pageSize);
  }, [visible, selectedTaskType, fetchTasks]);

  // 选择逻辑
  const handleSelectTask = async (record: GenTaskRecord) => {
    setSelectingId(record.id);
    try {
      const res = await instance.get<{ success: boolean; data?: TaskDetailData }>(
        `/productx/sa-ai-gen-task/${record.id}/detail`
      );
      const detail = res.data?.data;
      
      // 数据标准化处理
      const modelType = detail?.model?.modelType ?? '';
      const baseModelVersion = detail?.model?.releaseYear ?? detail?.version ?? '1.0';
      const rawUrls = record.resultUrls;
      const urls: string[] = Array.isArray(rawUrls)
        ? rawUrls
        : (typeof rawUrls === 'string' && rawUrls)
          ? JSON.parse(rawUrls)
          : [];
          
      const firstUrl = urls?.[0] ?? null;
      const coverUrl = record.thumbnailUrl ?? firstUrl;
      
      // 构建参数快照
      const parameterSnapshot = detail
        ? JSON.stringify({
            prompt: detail.prompt,
            seed: detail.seed,
            version: detail.version,
            ...(detail.model && { modelCode: detail.model.modelCode }),
          })
        : '{}';

      onSelect({
        id: record.id,
        taskType: record.taskType,
        modelCode: record.modelCode,
        modelName: record.modelName,
        modelType,
        baseModelVersion,
        thumbnailUrl: coverUrl,
        resultUrls: JSON.stringify(urls),
        parameterSnapshot,
        createTime: record.createTime,
      });
      onClose();
    } catch (e: any) {
      console.error(e);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          从创作库导入
          <span style={{ fontSize: 12, color: token.colorTextSecondary, fontWeight: 400, marginLeft: 8 }}>
            选择一个满意的作品生成商品
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800} // 稍微加宽，为了更好的网格展示
      centered
      destroyOnClose
      bodyStyle={{ padding: '20px 24px 24px' }}
    >
      {/* 1. 分类胶囊导航 (Pills Navigation) */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {TASK_TYPE_OPTIONS.map((opt) => {
          const isSelected = selectedTaskType === opt.taskType;
          return (
            <div
              key={opt.taskType}
              onClick={() => setSelectedTaskType(opt.taskType)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                cursor: 'pointer',
                background: isSelected ? token.colorPrimary : token.colorFillAlter,
                color: isSelected ? '#fff' : token.colorText,
                fontWeight: isSelected ? 500 : 400,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                border: `1px solid ${isSelected ? token.colorPrimary : 'transparent'}`,
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = token.colorFillSecondary;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = token.colorFillAlter;
              }}
            >
              {opt.icon}
              {opt.label}
            </div>
          );
        })}
      </div>

      {/* 2. 网格展示区 (Gallery Grid) */}
      <div style={{ minHeight: 300 }}>
        <Spin spinning={loading} tip="加载创作记录...">
          {!loading && tasks.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="空空如也，快去创作你的第一个 AI 作品吧" 
              style={{ margin: '60px 0' }}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {tasks.map((record) => {
                const previewUrl = getPreviewUrl(record);
                const isVideo = isVideoUrl(previewUrl || '');
                const isProcessing = selectingId === record.id;
                const isDisabled = record.status !== 2; // 假设 2 是成功

                return (
                  <Col span={8} key={record.id}>
                    <div
                      onClick={() => !isDisabled && !isProcessing && handleSelectTask(record)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingTop: '100%', // 1:1 正方形卡片
                        borderRadius: 12,
                        overflow: 'hidden',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        border: `2px solid transparent`,
                        transition: 'all 0.2s',
                        background: token.colorFillQuaternary,
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled) {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                            e.currentTarget.style.borderColor = token.colorPrimary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled) {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {/* 图片/视频容器 (Absolute 撑满) */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        {previewUrl ? (
                          isVideo ? (
                            <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                          ) : (
                            <img src={addImageCompressSuffix(previewUrl, 400)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="task" loading="lazy" />
                          )
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: token.colorTextQuaternary }}>
                             <PictureOutlined style={{ fontSize: 32 }} />
                          </div>
                        )}
                        
                        {/* 选中时的加载遮罩 */}
                        {isProcessing && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                <Spin />
                            </div>
                        )}
                      </div>

                      {/* 视频角标 */}
                      {isVideo && (
                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                           <PlayCircleOutlined /> Video
                        </div>
                      )}

                      {/* 详情按钮：毛玻璃小图标，与视频角标风格一致 */}
                      <Tooltip title="查看详情">
                        <div
                          onClick={(e) => { e.stopPropagation(); setDetailTaskId(record.id); }}
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 11,
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.7)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                          }}
                        >
                          <InfoCircleOutlined style={{ fontSize: 14 }} />
                        </div>
                      </Tooltip>

                      {/* 底部信息遮罩 (Glassmorphism + Gradient) */}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        width: '100%', 
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        padding: '24px 10px 10px',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end'
                      }}>
                         <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {record.taskType === 't2i' || record.taskType === 'i2i' ? <PictureOutlined /> : <PlayCircleOutlined />}
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {record.modelCode}
                            </span>
                         </div>
                         <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                            {record.createTime.split(' ')[0]} {/* 只显示日期 */}
                         </div>
                      </div>

                      {/* 失败状态遮罩 */}
                      {record.status !== 2 && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                              生成中/失败
                          </div>
                      )}
                      
                      {/* 选中勾选标记 (Hover 时可增强提示，与详情按钮错开：详情在左上，勾选保留在左下或右上) */}
                      <div className="select-badge" style={{ position: 'absolute', bottom: 48, left: 8, opacity: 0, transition: 'opacity 0.2s' }}>
                          <CheckCircleFilled style={{ color: token.colorPrimary, fontSize: 20, background: '#fff', borderRadius: '50%' }} />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </Spin>
      </div>

      {/* 3. 分页 */}
      {pagination.total > pagination.pageSize && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger={false}
            size="small"
            onChange={(page) => fetchTasks(page, pagination.pageSize)}
          />
        </div>
      )}

      {/* 各模块原始任务详情模态框：按任务类型渲染对应组件 */}
      {detailTaskId != null && selectedTaskType === 't2i' && (
        <TextToImageTaskDetailModal
          open={true}
          taskId={detailTaskId}
          onClose={() => setDetailTaskId(null)}
        />
      )}
      {detailTaskId != null && selectedTaskType === 'i2i' && (
        <ImageToImageTaskDetailModal
          open={true}
          taskId={detailTaskId}
          onClose={() => setDetailTaskId(null)}
        />
      )}
      {detailTaskId != null && selectedTaskType === 't2v' && (
        <TextToVideoTaskDetailModal
          open={true}
          taskId={detailTaskId}
          onClose={() => setDetailTaskId(null)}
        />
      )}
      {detailTaskId != null && selectedTaskType === 'i2v' && (
        <ImageToVideoTaskDetailModal
          open={true}
          taskId={detailTaskId}
          onClose={() => setDetailTaskId(null)}
        />
      )}
    </Modal>
  );
};

export default TaskSelectModal;