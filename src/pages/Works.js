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
  Dropdown,
  Modal,
  message,
  Pagination,
  Space,
  Tooltip,
  Popconfirm,
  Image,
  Spin
} from "antd";
import { 
  AppstoreOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  StarOutlined,
  StarFilled,
  ReloadOutlined,
  CalendarOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from "@ant-design/icons";
import { useIntl } from 'react-intl';
import dayjs from "dayjs";
import instance from "api/axios";

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
    `}

    ${props => props.$viewMode === 'grid' && css`
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      padding: 20px;
      color: #fff;
    `}

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

    .work-actions {
      ${props => props.$viewMode === 'list' && css`
        display: flex;
        gap: 8px;
        margin-top: 12px;
      `}

      ${props => props.$viewMode === 'grid' && css`
        position: absolute;
        top: 12px;
        right: 12px;
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
      `}
    }

    &:hover .work-actions {
      opacity: 1;
    }
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    color: ${props => props.$token.colorText};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      background: #fff;
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    &.danger:hover {
      background: ${props => props.$token.colorErrorBg};
      color: ${props => props.$token.colorError};
    }
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

// ==========================================
// 2. 主组件
// ==========================================

const WorksPage = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const intl = useIntl();
  
  // 状态管理
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  
  // 筛选和搜索
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'image' | 'video' | 'audio'
  const [dateRange, setDateRange] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'name' | 'size'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    audios: 0,
    favorites: 0
  });

  // 模拟数据 - 实际应该从 API 获取
  const mockWorks = [
    {
      id: '1',
      title: 'AI生成的风景视频',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/400x225/4A90E2/ffffff?text=Video+1',
      url: 'https://example.com/video1.mp4',
      createdAt: dayjs().subtract(1, 'day'),
      size: 1024 * 1024 * 15, // 15MB
      duration: 30,
      isFavorite: false,
      model: 'Sora-1.0',
      tags: ['风景', '自然']
    },
    {
      id: '2',
      title: '城市夜景图片',
      type: 'image',
      thumbnail: 'https://via.placeholder.com/400x225/50C878/ffffff?text=Image+1',
      url: 'https://example.com/image1.jpg',
      createdAt: dayjs().subtract(2, 'days'),
      size: 1024 * 1024 * 2, // 2MB
      isFavorite: true,
      model: 'DALL-E-3',
      tags: ['城市', '夜景']
    },
    {
      id: '3',
      title: '抽象艺术视频',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/400x225/E94B3C/ffffff?text=Video+2',
      url: 'https://example.com/video2.mp4',
      createdAt: dayjs().subtract(3, 'days'),
      size: 1024 * 1024 * 20, // 20MB
      duration: 45,
      isFavorite: false,
      model: 'Sora-1.0',
      tags: ['抽象', '艺术']
    },
    {
      id: '4',
      title: '人物肖像图片',
      type: 'image',
      thumbnail: 'https://via.placeholder.com/400x225/9B59B6/ffffff?text=Image+2',
      url: 'https://example.com/image2.jpg',
      createdAt: dayjs().subtract(5, 'days'),
      size: 1024 * 1024 * 3, // 3MB
      isFavorite: false,
      model: 'Midjourney',
      tags: ['人物', '肖像']
    },
    {
      id: '5',
      title: '科幻场景视频',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/400x225/F39C12/ffffff?text=Video+3',
      url: 'https://example.com/video3.mp4',
      createdAt: dayjs().subtract(7, 'days'),
      size: 1024 * 1024 * 25, // 25MB
      duration: 60,
      isFavorite: true,
      model: 'Sora-1.0',
      tags: ['科幻', '未来']
    },
    {
      id: '6',
      title: '自然风光图片',
      type: 'image',
      thumbnail: 'https://via.placeholder.com/400x225/1ABC9C/ffffff?text=Image+3',
      url: 'https://example.com/image3.jpg',
      createdAt: dayjs().subtract(10, 'days'),
      size: 1024 * 1024 * 4, // 4MB
      isFavorite: false,
      model: 'DALL-E-3',
      tags: ['自然', '风光']
    },
    {
      id: '7',
      title: '背景音乐音频',
      type: 'audio',
      thumbnail: 'https://via.placeholder.com/400x225/FF6B6B/ffffff?text=Audio+1',
      url: 'https://example.com/audio1.mp3',
      createdAt: dayjs().subtract(4, 'days'),
      size: 1024 * 1024 * 5, // 5MB
      duration: 180,
      isFavorite: false,
      model: 'MusicGen',
      tags: ['音乐', '背景']
    },
    {
      id: '8',
      title: '环境音效',
      type: 'audio',
      thumbnail: 'https://via.placeholder.com/400x225/4ECDC4/ffffff?text=Audio+2',
      url: 'https://example.com/audio2.mp3',
      createdAt: dayjs().subtract(6, 'days'),
      size: 1024 * 1024 * 3, // 3MB
      duration: 120,
      isFavorite: true,
      model: 'AudioCraft',
      tags: ['音效', '环境']
    }
  ];

  // 加载作品列表
  const loadWorks = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际 API 调用
      // const response = await instance.get('/api/works', {
      //   params: {
      //     page: currentPage,
      //     pageSize,
      //     type: typeFilter,
      //     search: searchText,
      //     sortBy,
      //     sortOrder
      //   }
      // });
      
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWorks(mockWorks);
      setFilteredWorks(mockWorks);
      setTotal(mockWorks.length);
      
      // 更新统计数据
      setStats({
        total: mockWorks.length,
        images: mockWorks.filter(w => w.type === 'image').length,
        videos: mockWorks.filter(w => w.type === 'video').length,
        audios: mockWorks.filter(w => w.type === 'audio').length,
        favorites: mockWorks.filter(w => w.isFavorite).length
      });
    } catch (error) {
      message.error(intl.formatMessage({ 
        id: 'works.loadError', 
        defaultMessage: '加载作品失败，请稍后重试' 
      }));
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadWorks();
  }, [currentPage, pageSize]);

  // 筛选和搜索
  useEffect(() => {
    let filtered = [...works];

    // 类型筛选
    if (typeFilter !== 'all') {
      filtered = filtered.filter(work => work.type === typeFilter);
    }

    // 搜索
    if (searchText) {
      filtered = filtered.filter(work => 
        work.title.toLowerCase().includes(searchText.toLowerCase()) ||
        work.tags?.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // 日期筛选
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(work => {
        const workDate = work.createdAt;
        return workDate.isAfter(dateRange[0].startOf('day')) && 
               workDate.isBefore(dateRange[1].endOf('day'));
      });
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.diff(b.createdAt);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredWorks(filtered);
    setTotal(filtered.length);
  }, [works, typeFilter, searchText, dateRange, sortBy, sortOrder]);

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 切换收藏
  const toggleFavorite = async (workId) => {
    try {
      // TODO: API 调用
      setWorks(prev => prev.map(work => 
        work.id === workId 
          ? { ...work, isFavorite: !work.isFavorite }
          : work
      ));
      
      message.success(intl.formatMessage({ 
        id: 'works.favoriteUpdated', 
        defaultMessage: '收藏状态已更新' 
      }));
    } catch (error) {
      message.error(intl.formatMessage({ 
        id: 'works.favoriteError', 
        defaultMessage: '更新收藏失败' 
      }));
    }
  };

  // 下载作品
  const handleDownload = (work) => {
    // TODO: 实现下载逻辑
    message.info(intl.formatMessage({ 
      id: 'works.downloading', 
      defaultMessage: '正在下载...' 
    }));
  };

  // 分享作品
  const handleShare = (work) => {
    // TODO: 实现分享逻辑
    message.info(intl.formatMessage({ 
      id: 'works.sharing', 
      defaultMessage: '正在生成分享链接...' 
    }));
  };

  // 删除作品
  const handleDelete = async (workId) => {
    try {
      // TODO: API 调用
      setWorks(prev => prev.filter(work => work.id !== workId));
      message.success(intl.formatMessage({ 
        id: 'works.deleted', 
        defaultMessage: '作品已删除' 
      }));
    } catch (error) {
      message.error(intl.formatMessage({ 
        id: 'works.deleteError', 
        defaultMessage: '删除失败，请稍后重试' 
      }));
    }
  };

  // 预览作品
  const handlePreview = (work) => {
    Modal.info({
      title: work.title,
      width: 800,
      content: (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          {work.type === 'video' ? (
            <video 
              src={work.url} 
              controls 
              style={{ width: '100%', maxHeight: '500px' }}
            />
          ) : work.type === 'audio' ? (
            <audio 
              src={work.url} 
              controls 
              style={{ width: '100%' }}
            />
          ) : (
            <Image 
              src={work.url} 
              alt={work.title}
              style={{ maxHeight: '500px' }}
            />
          )}
        </div>
      ),
    });
  };

  // 渲染作品卡片
  const renderWorkCard = (work) => {
    const isVideo = work.type === 'video';
    const isAudio = work.type === 'audio';
    const isImage = work.type === 'image';
    
    return (
      <WorkCard
        key={work.id}
        $token={token}
        $viewMode={viewMode}
        $isFavorite={work.isFavorite}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => handlePreview(work)}
      >
        <div className="media-wrapper">
          {isVideo ? (
            <video 
              className="media-content"
              src={work.thumbnail}
              muted
              loop
              playsInline
              onMouseOver={e => e.currentTarget.play()}
              onMouseOut={e => e.currentTarget.pause()}
            />
          ) : (
            <img 
              className="media-content"
              src={work.thumbnail}
              alt={work.title}
              loading="lazy"
            />
          )}
          
          <div className="play-overlay">
            {(isVideo || isAudio) && <PlayCircleOutlined className="play-icon" />}
          </div>

          <Tag 
            className="type-badge"
            color={isVideo ? 'blue' : isAudio ? 'purple' : 'green'}
            icon={isVideo ? <VideoCameraOutlined /> : isAudio ? <AudioOutlined /> : <FileImageOutlined />}
          >
            {isVideo ? intl.formatMessage({ id: 'works.type.video', defaultMessage: '视频' }) : 
             isAudio ? intl.formatMessage({ id: 'works.type.audio', defaultMessage: '音频' }) :
                      intl.formatMessage({ id: 'works.type.image', defaultMessage: '图片' })}
          </Tag>

          <button 
            className="favorite-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(work.id);
            }}
          >
            {work.isFavorite ? <StarFilled /> : <StarOutlined />}
          </button>
        </div>

        <div className="card-content">
          <div>
            <div className="work-title">{work.title}</div>
            <div className="work-meta">
              <span className="meta-item">
                <CalendarOutlined />
                {work.createdAt.format('YYYY-MM-DD')}
              </span>
              {(isVideo || isAudio) && work.duration && (
                <span className="meta-item">
                  <PlayCircleOutlined />
                  {work.duration}秒
                </span>
              )}
              <span className="meta-item">
                {formatFileSize(work.size)}
              </span>
            </div>
          </div>

          <div className="work-actions">
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
              {intl.formatMessage({ id: 'works.description', defaultMessage: '管理和查看您生成的所有作品' })}
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
          <div className="stat-item">
            <div className="icon">
              <StarFilled />
            </div>
            <div className="content">
              <div className="label">{intl.formatMessage({ id: 'works.stats.favorites', defaultMessage: '收藏' })}</div>
              <div className="value">{stats.favorites}</div>
            </div>
          </div>
        </StatsBar>

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
              <Option value="size">{intl.formatMessage({ id: 'works.sort.size', defaultMessage: '按大小' })}</Option>
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
                showTotal={(total, range) => 
                  intl.formatMessage(
                    { id: 'works.pagination.total', defaultMessage: '共 {total} 项，显示第 {start}-{end} 项' },
                    { total, start: range[0], end: range[1] }
                  )
                }
              />
            </PaginationWrapper>
          </>
        )}
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

