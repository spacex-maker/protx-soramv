/**
 * 下载项的数据接口
 */
export interface DownloadItem {
  /** 唯一标识符 */
  id: string;
  /** 文件名 */
  filename: string;
  /** 下载状态：downloading-下载中, completed-已完成, error-错误 */
  status: 'downloading' | 'completed' | 'error';
  /** 下载进度（0-100） */
  progress: number;
  /** 已下载的字节数 */
  loadedBytes: number;
  /** 文件总字节数 */
  totalBytes: number;
  /** 下载速度（字节/秒） */
  speed: number;
}

/**
 * 下载管理器组件的属性接口
 */
export interface DownloadManagerProps {
  /** 下载项列表 */
  downloads: DownloadItem[];
  /** 取消下载的回调函数 */
  onCancel: (id: string) => void;
  /** 清除已完成下载的回调函数 */
  onClear: () => void;
  /** 折叠/展开面板的回调函数 */
  onCollapse?: (collapsed: boolean) => void;
}

/**
 * 单个下载项组件的属性接口
 */
export interface DownloadItemProps {
  /** 下载项数据 */
  download: DownloadItem;
  /** 取消下载的回调函数（可选） */
  onCancel?: (id: string) => void;
}

/**
 * 下载管理器头部组件的属性接口
 */
export interface DownloadHeaderProps {
  /** 正在下载的项目数量 */
  activeDownloads: number;
  /** 已完成的下载项目数量 */
  completedDownloads: number;
  /** 清除已完成下载的回调函数 */
  onClear: () => void;
  /** 最小化面板的回调函数 */
  onMinimize: () => void;
  /** 折叠/展开面板的回调函数 */
  onCollapse: () => void;
  /** 是否为移动设备 */
  isMobile: boolean;
  /** 是否展开（移动设备） */
  expanded: boolean;
  /** 是否折叠 */
  collapsed: boolean;
  /** 鼠标按下事件处理函数 */
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
}

/**
 * 下载列表组件的属性接口
 */
export interface DownloadListProps {
  /** 正在下载的项目列表 */
  activeDownloads: DownloadItem[];
  /** 已完成的下载项目列表 */
  completedDownloads: DownloadItem[];
  /** 取消下载的回调函数 */
  onCancel: (id: string) => void;
}

/**
 * 最小化状态下的下载气泡组件的属性接口
 */
export interface DownloadBubbleProps {
  /** 正在下载的项目数量 */
  activeDownloadsCount: number;
  /** 点击最小化按钮的回调函数 */
  onMinimize: () => void;
  /** 鼠标按下事件处理函数 */
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
} 