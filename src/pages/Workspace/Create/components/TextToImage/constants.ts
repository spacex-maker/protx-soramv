/**
 * 文生图模块常量：按模型类型区分的配置，避免在组件内重复创建
 */

/** Volc Seedream 尺寸与宽高比 -> 像素映射 */
export const VOLC_SEEDREAM_SIZE_ASPECT_MAP: Record<string, Record<string, string>> = {
  '2K': {
    '1:1': '2048x2048',
    '4:3': '2304x1728',
    '3:4': '1728x2304',
    '16:9': '2560x1440',
    '9:16': '1440x2560',
    '3:2': '2496x1664',
    '2:3': '1664x2496',
    '21:9': '3024x1296',
  },
  '4K': {
    '1:1': '4096x4096',
    '4:3': '4704x3520',
    '3:4': '3520x4704',
    '16:9': '5504x3040',
    '9:16': '3040x5504',
    '3:2': '4992x3328',
    '2:3': '3328x4992',
    '21:9': '6240x2656',
  },
};

export const VOLC_SEEDREAM_ASPECT_RATIOS = [
  '1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9',
];

export const VOLC_SEEDREAM_SIZES = ['2K', '4K'];

/** 火山 Seedream 图生图参考图限制（官方：≤10MB，常见图片格式） */
export const VOLC_SEEDREAM_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const VOLC_SEEDREAM_UPLOAD_ACCEPT =
  'image/jpeg,image/png,image/webp,image/bmp,image/tiff,image/gif';
export const VOLC_SEEDREAM_UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif'];

/** API 异步模型固定比例（与 /image/generate/text/async 一致） */
export const API_ASPECT_RATIOS = [
  '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9', 'auto',
];

/** 文生图提示词最大字数 */
export const T2I_PROMPT_MAX_LENGTH = 5000;

export const API_IMAGE_FORMATS = ['png', 'jpg'] as const;

export {
  MODEL_SELECT_FIELD_HEIGHT,
  MODEL_SELECT_FIELD_BORDER_RADIUS,
  MODEL_SELECT_FIELD_BORDER_RADIUS_MOBILE,
  MODEL_SELECT_FIELD_PADDING,
  MODEL_SELECT_FIELD_HEIGHT_COMPACT,
  MODEL_SELECT_FIELD_BORDER_RADIUS_COMPACT,
  MODEL_SELECT_FIELD_PADDING_COMPACT,
} from '../shared/modelSelectFieldTokens';
