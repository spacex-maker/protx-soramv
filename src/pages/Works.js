import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SimpleHeader from "components/headers/simple";
import { 
  Button, 
  Input, 
  Select, 
  Tag, 
  ConfigProvider,
  Empty,
  DatePicker,
  theme,
  message,
  Pagination,
  Tooltip,
  Popconfirm,
  Spin
} from "antd";
import { 
  AppstoreOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  SoundOutlined,
  ReloadOutlined,
  CalendarOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  InfoCircleOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useIntl } from 'react-intl';
import dayjs from "dayjs";
import instance from "api/axios";
import {
  buildFetchParams,
  filterWorks,
  sortWorks,
  paginateWorks,
  mapTaskToWork,
  isVideoUrl,
  MEDIA_TYPE_TASK_TYPES,
  CREATION_TASK_TYPES_PARAM,
  SOURCE_TAB_OPTIONS,
} from './Works/genTaskWorksUtils';
import WorkTaskDetailModals from './Works/WorkTaskDetailModals';
import WorkPreviewModal from './Works/WorkPreviewModal';

const { RangePicker } = DatePicker;
const { Option } = Select;

// ==========================================
// 1. 样式系统 (Styled System)
// ==========================================

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.$token.colorBgLayout};
  color: ${props => props.$token.colorText};
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
  padding-top: 80px; 
  padding-bottom: 40px;

  &::before {
    content: '';
    position: fixed;
    top: -10%;
    left: 20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${props => props.$token.colorPrimary}08 0%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 1400px;
  width: 95%;
  margin: 0 auto;
  position: relative;
  z-index: 10;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;

  .title-group {
    h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: ${props => props.$token.colorText};
      display: flex;
      align-items: center;
      gap: 12px;
    }
    p {
      color: ${props => props.$token.colorTextSecondary};
      margin: 0;
      font-size: 14px;
    }
  }

  .action-group {
    display: flex;
    gap: 12px;
    align-items: center;
  }
`;

const Toolbar = styled.div`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .search-input {
    flex: 1;
    min-width: 200px;
    max-width: 400px;
  }

  .filter-group {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .view-toggle {
    display: flex;
    gap: 4px;
    background: ${props => props.$token.colorBgLayout};
    padding: 4px;
    border-radius: 8px;
    border: 1px solid ${props => props.$token.colorBorderSecondary};
  }

  @media (max-width: 768px) {
    padding: 16px;
    
    .search-input {
      width: 100%;
      max-width: 100%;
    }
  }
`;

const ViewToggleButton = styled.button`
  padding: 6px 12px;
  border: none;
  background: ${props => props.$active ? props.$token.colorPrimary : 'transparent'};
  color: ${props => props.$active ? '#fff' : props.$token.colorTextSecondary};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: ${props => props.$active ? props.$token.colorPrimary : props.$token.colorBgLayout};
    color: ${props => props.$active ? '#fff' : props.$token.colorText};
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  .stat-item {
    flex: 1;
    min-width: 150px;
    background: ${props => props.$token.colorBgContainer};
    border: 1px solid ${props => props.$token.colorBorderSecondary};
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;

    &:hover {
      border-color: ${props => props.$token.colorPrimary}40;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background: ${props => props.$token.colorPrimary}15;
      color: ${props => props.$token.colorPrimary};
    }

    .content {
      flex: 1;
      
      .label {
        font-size: 12px;
        color: ${props => props.$token.colorTextSecondary};
        margin-bottom: 4px;
      }
      
      .value {
        font-size: 20px;
        font-weight: 700;
        color: ${props => props.$token.colorText};
      }
    }
  }
`;

const WorksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const WorksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

const WorkCard = styled(motion.div)`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  ${props => props.$viewMode === 'grid' ? css`
    aspect-ratio: 16/9;
  ` : css`
    display: flex;
    height: 200px;
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.$token.colorPrimary}40;
  }

  .media-wrapper {
    position: relative;
    width: 100%;
    height: ${props => props.$viewMode === 'grid' ? '100%' : '200px'};
    background: ${props => props.$token.colorBgLayout};
    overflow: hidden;
    flex-shrink: 0;

    ${props => props.$viewMode === 'list' && css`
      width: 300px;
    `}

    @media (max-width: 768px) {
      ${props => props.$viewMode === 'list' && css`
        width: 150px;
      `}
    }

    .media-content {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;

      .play-icon {
        font-size: 48px;
        color: #fff;
      }
    }

    &:hover .play-overlay {
      opacity: 1;
    }

    .type-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 2;
    }

    .favorite-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 2;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      &:hover {
        background: #fff;
        transform: scale(1.1);
      }

      .anticon {
        font-size: 18px;
        color: ${props => props.$isFavorite ? '#ff4d4f' : props.$token.colorTextSecondary};
      }
    }
  }

  .card-content {
    ${props => props.$viewMode === 'list' && css`
      flex: 1;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    `}

    ${props => props.$viewMode === 'grid' && css`
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.35) 55%, transparent);
      padding: 16px;
      color: #fff;
      z-index: 2;
    `}

    .work-info {
      min-width: 0;
    }

    .work-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: ${props => props.$viewMode === 'grid' ? '#fff' : props.$token.colorText};
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .work-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      font-size: 12px;
      color: ${props => props.$viewMode === 'grid' ? 'rgba(255, 255, 255, 0.8)' : props.$token.colorTextSecondary};

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .work-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 5;
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 10px;
    opacity: ${props => props.$viewMode === 'list' ? 1 : 0};
    transition: opacity 0.25s ease;
    pointer-events: ${props => props.$viewMode === 'list' ? 'auto' : 'none'};

    ${props => props.$viewMode === 'grid' ? css`
      background: rgba(0, 0, 0, 0.52);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.12);
    ` : css`
      background: ${props.$token.colorBgContainer};
      border: 1px solid ${props.$token.colorBorderSecondary};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    `}
  }

  &:hover .work-actions {
    opacity: 1;
    pointer-events: auto;
  }

  .work-actions .action-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;

    ${props => props.$viewMode === 'grid' ? css`
      background: rgba(255, 255, 255, 0.14);
      color: rgba(255, 255, 255, 0.92);

      &:hover {
        background: rgba(255, 255, 255, 0.28);
        color: #fff;
      }

      &.danger {
        color: #ffb4b4;
      }

      &.danger:hover {
        background: rgba(255, 77, 79, 0.42);
        color: #fff;
      }
    ` : css`
      background: ${props.$token.colorFillSecondary};
      color: ${props.$token.colorTextSecondary};

      &:hover {
        background: ${props.$token.colorPrimaryBg};
        color: ${props.$token.colorPrimary};
      }

      &.danger:hover {
        background: ${props.$token.colorErrorBg};
        color: ${props.$token.colorError};
      }
    `}
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    font-size: 64px;
    color: ${props => props.$token.colorTextTertiary};
    margin-bottom: 24px;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
    margin-bottom: 8px;
  }

  .empty-description {
    font-size: 14px;
    color: ${props => props.$token.colorTextSecondary};
    margin-bottom: 24px;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
`;

const SourceTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SourceTab = styled.button`
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid ${props => props.$active ? props.$token.colorPrimary : props.$token.colorBorderSecondary};
  background: ${props => props.$active ? props.$token.colorPrimary : props.$token.colorBgContainer};
  color: ${props => props.$active ? '#fff' : props.$token.colorText};
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    color: ${props => props.$active ? '#fff' : props.$token.colorPrimary};
  }
`;

const AudioPreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.15), rgba(19, 194, 194, 0.12));
  color: ${props => props.$token.colorPrimary};

  .anticon {
    font-size: 42px;
  }

  span {
    font-size: 12px;
    opacity: 0.75;
    max-width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// ==========================================
// 2. 主组件
// ==========================================

const WorksPage = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [sourceTab, setSourceTab] = useState('all');
  const [detailTask, setDetailTask] = useState(null);
  const [previewWork, setPreviewWork] = useState(null);
  
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    audios: 0,
  });

  const hasClientFilter = !!(searchText || dateRange);

  const fetchStats = async () => {
    try {
      const requests = [
        { key: 'total', params: { currentPage: 1, pageSize: 1, taskTypes: CREATION_TASK_TYPES_PARAM, successOnly: true } },
        { key: 'images', params: { currentPage: 1, pageSize: 1, taskTypes: MEDIA_TYPE_TASK_TYPES.image, successOnly: true } },
        { key: 'videos', params: { currentPage: 1, pageSize: 1, taskTypes: MEDIA_TYPE_TASK_TYPES.video, successOnly: true } },
        { key: 'audios', params: { currentPage: 1, pageSize: 1, taskTypes: MEDIA_TYPE_TASK_TYPES.audio, successOnly: true } },
      ];
      const results = await Promise.all(
        requests.map(({ params }) => instance.get('/productx/sa-ai-gen-task/my-tasks/page', { params })),
      );
      setStats({
        total: results[0]?.data?.data?.total || 0,
        images: results[1]?.data?.data?.total || 0,
        videos: results[2]?.data?.data?.total || 0,
        audios: results[3]?.data?.data?.total || 0,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const loadWorks = async () => {
    setLoading(true);
    try {
      if (hasClientFilter) {
        const params = buildFetchParams({ sourceTab, typeFilter, currentPage: 1, pageSize: 500 });
        const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', { params });
        if (response.data.success && response.data.data) {
          const mapped = (response.data.data.records || []).map((task) => mapTaskToWork(task, intl));
          setWorks(mapped);
        }
      } else {
        const params = buildFetchParams({ sourceTab, typeFilter, currentPage, pageSize });
        const response = await instance.get('/productx/sa-ai-gen-task/my-tasks/page', { params });
        if (response.data.success && response.data.data) {
          const mapped = (response.data.data.records || []).map((task) => mapTaskToWork(task, intl));
          setWorks(mapped);
          setTotal(response.data.data.total || 0);
        }
      }
      fetchStats();
    } catch (error) {
      message.error(intl.formatMessage({ 
        id: 'works.loadError', 
        defaultMessage: '加载作品失败，请稍后重试' 
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorks();
  }, [currentPage, pageSize, sourceTab, typeFilter, hasClientFilter]);

  useEffect(() => {
    let next = filterWorks(works, { searchText, dateRange });
    next = sortWorks(next, sortBy, sortOrder);

    if (hasClientFilter) {
      setTotal(next.length);
      next = paginateWorks(next, currentPage, pageSize);
    }

    setFilteredWorks(next);
  }, [works, searchText, dateRange, sortBy, sortOrder, currentPage, pageSize, hasClientFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sourceTab, typeFilter, searchText, dateRange, sortBy, sortOrder]);

  const handleDownload = (work) => {
    if (!work.url) {
      message.warning(intl.formatMessage({ id: 'works.noDownloadUrl', defaultMessage: '暂无可下载文件' }));
      return;
    }
    const link = document.createElement('a');
    link.href = work.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const handleShare = async (work) => {
    if (!work.url) {
      message.warning(intl.formatMessage({ id: 'works.noShareUrl', defaultMessage: '暂无可分享链接' }));
      return;
    }
    try {
      await navigator.clipboard.writeText(work.url);
      message.success(intl.formatMessage({ id: 'works.linkCopied', defaultMessage: '链接已复制' }));
    } catch {
      message.info(work.url);
    }
  };

  const handleDelete = async (workId) => {
    try {
      const response = await instance.delete(`/productx/sa-ai-gen-task/${workId}`);
      if (response.data.success) {
        setWorks((prev) => prev.filter((work) => work.id !== workId));
        message.success(intl.formatMessage({ 
          id: 'works.deleted', 
          defaultMessage: '作品已删除' 
        }));
        fetchStats();
      } else {
        message.error(response.data.message || intl.formatMessage({ 
          id: 'works.deleteError', 
          defaultMessage: '删除失败，请稍后重试' 
        }));
      }
    } catch (error) {
      message.error(intl.formatMessage({ 
        id: 'works.deleteError', 
        defaultMessage: '删除失败，请稍后重试' 
      }));
    }
  };

  const handlePreview = (work) => {
    setPreviewWork(work);
  };

  const renderWorkCard = (work) => {
    const isVideo = work.type === 'video';
    const isAudio = work.type === 'audio';
    const previewIsVideo = isVideo && work.thumbnail && isVideoUrl(work.thumbnail);
    
    return (
      <WorkCard
        key={work.id}
        $token={token}
        $viewMode={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => handlePreview(work)}
      >
        <div className="media-wrapper">
          {isAudio ? (
            <AudioPreview $token={token}>
              <SoundOutlined />
              <span title={work.voiceName || work.title}>{work.voiceName || work.title}</span>
            </AudioPreview>
          ) : isVideo && previewIsVideo ? (
            <video 
              className="media-content"
              src={work.thumbnail}
              muted
              loop
              playsInline
              onMouseOver={e => e.currentTarget.play()}
              onMouseOut={e => e.currentTarget.pause()}
            />
          ) : work.thumbnail ? (
            <img 
              className="media-content"
              src={work.thumbnail}
              alt={work.title}
              loading="lazy"
            />
          ) : (
            <AudioPreview $token={token}>
              <PictureOutlined />
              <span>{work.title}</span>
            </AudioPreview>
          )}
          
          <div className="play-overlay">
            {(isVideo || isAudio) && <PlayCircleOutlined className="play-icon" />}
          </div>

          <Tag 
            className="type-badge"
            color={isVideo ? 'blue' : isAudio ? 'purple' : 'green'}
            icon={isVideo ? <VideoCameraOutlined /> : isAudio ? <AudioOutlined /> : <FileImageOutlined />}
          >
            {work.taskTypeLabel}
          </Tag>
        </div>

        <div className="work-actions">
          {work.taskType !== 't2a' && (
            <Tooltip title={intl.formatMessage({ id: 'works.detail', defaultMessage: '详情' })}>
              <button 
                className="action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailTask({ id: work.id, taskType: work.taskType });
                }}
              >
                <InfoCircleOutlined />
              </button>
            </Tooltip>
          )}
          <Tooltip title={intl.formatMessage({ id: 'works.preview', defaultMessage: '预览' })}>
            <button 
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(work);
              }}
            >
              <EyeOutlined />
            </button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: 'works.download', defaultMessage: '下载' })}>
            <button 
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(work);
              }}
            >
              <DownloadOutlined />
            </button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: 'works.share', defaultMessage: '分享' })}>
            <button 
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleShare(work);
              }}
            >
              <ShareAltOutlined />
            </button>
          </Tooltip>
          <Popconfirm
            title={intl.formatMessage({ id: 'works.deleteConfirm', defaultMessage: '确定要删除这个作品吗？' })}
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(work.id);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={intl.formatMessage({ id: 'works.delete', defaultMessage: '删除' })}>
              <button 
                className="action-btn danger"
                onClick={(e) => e.stopPropagation()}
              >
                <DeleteOutlined />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>

        <div className="card-content">
          <div className="work-info">
            <div className="work-title">{work.title}</div>
            <div className="work-meta">
              <span className="meta-item">
                <CalendarOutlined />
                {work.createdAt.format('YYYY-MM-DD')}
              </span>
              {work.model && (
                <span className="meta-item">{work.model}</span>
              )}
              {work.voiceName && (
                <span className="meta-item">
                  <SoundOutlined />
                  {work.voiceName}
                </span>
              )}
              {work.creditsCost != null && (
                <span className="meta-item">
                  {work.creditsCost} Token
                </span>
              )}
            </div>
          </div>
        </div>
      </WorkCard>
    );
  };

  return (
    <PageLayout $token={token}>
      <SimpleHeader />
      
      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader $token={token}>
          <div className="title-group">
            <h1>
              <AppstoreOutlined style={{ color: token.colorPrimary }} />
              {intl.formatMessage({ id: 'works.title', defaultMessage: '我的作品' })}
            </h1>
            <p>
              {intl.formatMessage({ id: 'works.description', defaultMessage: '集中查看文生图、文生视频、图生图、图生视频与语音生成的全部记录' })}
            </p>
          </div>
          <div className="action-group">
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadWorks}
              loading={loading}
            >
              {intl.formatMessage({ id: 'works.refresh', defaultMessage: '刷新' })}
            </Button>
          </div>
        </PageHeader>

        {/* 统计栏 */}
        <StatsBar $token={token}>
          <div className="stat-item">
            <div className="icon">
              <AppstoreOutlined />
            </div>
            <div className="content">
              <div className="label">{intl.formatMessage({ id: 'works.stats.total', defaultMessage: '全部作品' })}</div>
              <div className="value">{stats.total}</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="icon">
              <FileImageOutlined />
            </div>
            <div className="content">
              <div className="label">{intl.formatMessage({ id: 'works.stats.images', defaultMessage: '图片' })}</div>
              <div className="value">{stats.images}</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="icon">
              <VideoCameraOutlined />
            </div>
            <div className="content">
              <div className="label">{intl.formatMessage({ id: 'works.stats.videos', defaultMessage: '视频' })}</div>
              <div className="value">{stats.videos}</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="icon">
              <AudioOutlined />
            </div>
            <div className="content">
              <div className="label">{intl.formatMessage({ id: 'works.stats.audios', defaultMessage: '音频' })}</div>
              <div className="value">{stats.audios}</div>
            </div>
          </div>
        </StatsBar>

        <SourceTabs>
          {SOURCE_TAB_OPTIONS.map((tab) => (
            <SourceTab
              key={tab.key}
              type="button"
              $token={token}
              $active={sourceTab === tab.key}
              onClick={() => setSourceTab(tab.key)}
            >
              {tab.key === 'all'
                ? intl.formatMessage({ id: 'works.source.all', defaultMessage: '全部来源' })
                : intl.formatMessage({
                  id: `works.source.${tab.key}`,
                  defaultMessage: tab.key,
                })}
            </SourceTab>
          ))}
        </SourceTabs>

        {/* 工具栏 */}
        <Toolbar $token={token}>
          <Input
            className="search-input"
            placeholder={intl.formatMessage({ id: 'works.search.placeholder', defaultMessage: '搜索作品...' })}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          
          <div className="filter-group">
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
            >
              <Option value="all">{intl.formatMessage({ id: 'works.filter.all', defaultMessage: '全部类型' })}</Option>
              <Option value="image">{intl.formatMessage({ id: 'works.filter.image', defaultMessage: '图片' })}</Option>
              <Option value="video">{intl.formatMessage({ id: 'works.filter.video', defaultMessage: '视频' })}</Option>
              <Option value="audio">{intl.formatMessage({ id: 'works.filter.audio', defaultMessage: '音频' })}</Option>
            </Select>

            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={[
                intl.formatMessage({ id: 'works.date.start', defaultMessage: '开始日期' }),
                intl.formatMessage({ id: 'works.date.end', defaultMessage: '结束日期' })
              ]}
              style={{ width: 240 }}
            />

            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 120 }}
            >
              <Option value="date">{intl.formatMessage({ id: 'works.sort.date', defaultMessage: '按日期' })}</Option>
              <Option value="name">{intl.formatMessage({ id: 'works.sort.name', defaultMessage: '按名称' })}</Option>
              <Option value="model">{intl.formatMessage({ id: 'works.sort.model', defaultMessage: '按模型' })}</Option>
            </Select>

            <Button
              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 
                intl.formatMessage({ id: 'works.sort.asc', defaultMessage: '升序' }) : 
                intl.formatMessage({ id: 'works.sort.desc', defaultMessage: '降序' })}
            </Button>
          </div>

          <div className="view-toggle">
            <ViewToggleButton
              $token={token}
              $active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <AppstoreOutlined />
              {intl.formatMessage({ id: 'works.view.grid', defaultMessage: '网格' })}
            </ViewToggleButton>
            <ViewToggleButton
              $token={token}
              $active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <UnorderedListOutlined />
              {intl.formatMessage({ id: 'works.view.list', defaultMessage: '列表' })}
            </ViewToggleButton>
          </div>
        </Toolbar>

        {/* 作品列表 */}
        {loading && filteredWorks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredWorks.length === 0 ? (
          <EmptyState $token={token}>
            <div className="empty-icon">📭</div>
            <div className="empty-title">
              {intl.formatMessage({ id: 'works.empty.title', defaultMessage: '暂无作品' })}
            </div>
            <div className="empty-description">
              {intl.formatMessage({ id: 'works.empty.description', defaultMessage: '开始创建您的第一个作品吧！' })}
            </div>
            <Button 
              type="primary"
              onClick={() => navigate('/workspace')}
            >
              {intl.formatMessage({ id: 'works.empty.action', defaultMessage: '去创作' })}
            </Button>
          </EmptyState>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <WorksGrid>
                {filteredWorks.map(work => renderWorkCard(work))}
              </WorksGrid>
            ) : (
              <WorksList>
                {filteredWorks.map(work => renderWorkCard(work))}
              </WorksList>
            )}

            <PaginationWrapper>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(totalCount, range) => 
                  intl.formatMessage(
                    { id: 'works.pagination.total', defaultMessage: '共 {total} 项，显示第 {start}-{end} 项' },
                    { total: totalCount, start: range[0], end: range[1] }
                  )
                }
              />
            </PaginationWrapper>
          </>
        )}

        <WorkTaskDetailModals
          taskId={detailTask?.id}
          taskType={detailTask?.taskType}
          onClose={() => setDetailTask(null)}
        />

        <WorkPreviewModal
          open={!!previewWork}
          work={previewWork}
          onClose={() => setPreviewWork(null)}
          onDownload={handleDownload}
          onShare={handleShare}
          intl={intl}
        />
      </ContentContainer>
    </PageLayout>
  );
};

const WorksPageWrapper = () => {
  const customTheme = {
    token: {
      colorPrimary: '#0070f3',
      borderRadius: 12,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Button: { borderRadius: 12 },
      Input: { borderRadius: 8 },
      Select: { borderRadius: 8 },
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <WorksPage />
    </ConfigProvider>
  );
};

export default WorksPageWrapper;

