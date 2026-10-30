export type EcommerceKleinMode = 'edit' | 'denoise';

export type ScenarioFieldKind = 'choice' | 'multiChoice' | 'text';

export interface ScenarioFieldOption {
  value: string;
  label: string;
}

export interface ScenarioField {
  id: string;
  label: string;
  kind: ScenarioFieldKind;
  options?: ScenarioFieldOption[];
  defaultValue?: string | string[];
  placeholder?: string;
}

export interface ScenarioUploadSlot {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
}

export type ScenarioFieldValues = Record<string, string | string[]>;

export interface EcommerceWorkbenchNotes {
  outputQuality?: string;
  brandTone?: string;
  cropSafeZone?: string;
  batchVariant?: string;
}

export interface EcommerceCaseCompare {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}

export interface EcommerceScenario {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  /** 工作台右侧案例：生成前后对比 */
  caseCompare?: EcommerceCaseCompare;
  steps: string[];
  workloadHint?: string;
  workbenchNotes?: EcommerceWorkbenchNotes;
  tips: string[];
  tags?: string[];
  uploads: ScenarioUploadSlot[];
  fields: ScenarioField[];
  aspectRatio: string;
  kleinMode: EcommerceKleinMode;
  supportsOfficialModel?: boolean;
  buildPrompt: (values: ScenarioFieldValues) => string;
}

export function scenarioCoverPath(id: string): string {
  return `/ecommerce-cases/${id}.jpg`;
}

export interface EcommerceCategory {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  scenarios: EcommerceScenario[];
}

const S = (v: ScenarioFieldValues, k: string): string => String(v[k] ?? '');
const M = (v: ScenarioFieldValues, k: string): string => {
  const x = v[k];
  return Array.isArray(x) ? x.join(', ') : String(x ?? '');
};

const MARKET = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'taobao', label: '淘宝 / 天猫' },
  { value: 'jd', label: '京东' },
];

const SCENE = [
  { value: 'kitchen', label: '厨房' },
  { value: 'living', label: '客厅' },
  { value: 'office', label: '办公室' },
  { value: 'outdoor', label: '户外' },
];

const LIGHT = [
  { value: 'soft', label: '柔光' },
  { value: 'natural', label: '自然光' },
  { value: 'studio', label: '棚拍光' },
];

const MODEL_BODY = [
  { value: 'slim', label: '纤细' },
  { value: 'standard', label: '标准' },
  { value: 'plus', label: '大码' },
];

const MODEL_TONE = [
  { value: 'fair', label: '浅色肤' },
  { value: 'medium', label: '自然肤' },
  { value: 'deep', label: '深肤色' },
];

const PLATFORM = [
  { value: 'douyin', label: '抖音竖屏' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'banner', label: '横版 Banner' },
];

const LIVE_LAYOUT = [
  { value: 'center', label: '居中留白' },
  { value: 'left', label: '左侧主播区' },
  { value: 'right', label: '右侧商品区' },
];

const LANG = [
  { value: 'en', label: '英语' },
  { value: 'ja', label: '日语' },
  { value: 'de', label: '德语' },
  { value: 'es', label: '西班牙语' },
];

const MARKET_REGION = [
  { value: 'us', label: '北美' },
  { value: 'eu', label: '欧洲' },
  { value: 'sea', label: '东南亚' },
  { value: 'jp', label: '日本' },
];

const RATIO_TARGET = [
  { value: '1:1', label: '1:1 主图' },
  { value: '3:4', label: '3:4 详情' },
  { value: '9:16', label: '9:16 信息流' },
  { value: '16:9', label: '16:9 宽图' },
];

const productUpload: ScenarioUploadSlot = {
  id: 'product',
  label: '商品图',
  hint: '白底或实拍均可',
};

const garmentUpload: ScenarioUploadSlot = {
  id: 'garment',
  label: '服装 / 商品图',
  hint: '平铺或挂拍效果更好',
};

const brandRefUpload: ScenarioUploadSlot = {
  id: 'reference',
  label: '品牌 / 商品参考图',
  hint: '用于配色与风格参考',
};


const styleRefUpload: ScenarioUploadSlot = {
  id: 'styleRef',
  label: '场景 / 风格参考',
  hint: '可选：色调、道具与构图参考',
  optional: true,
};

const modelRefUpload: ScenarioUploadSlot = {
  id: 'modelRef',
  label: '模特参考图',
  hint: '可选：脸型、发型或姿态参考',
  optional: true,
};

const posterUpload: ScenarioUploadSlot = {
  id: 'poster',
  label: '含文案海报 / 信息图',
  hint: '需保留版式与文字层的原图',
};

export const ECOMMERCE_CATEGORIES: EcommerceCategory[] = [
  {
    id: 'product-display',
    title: '商品展示',
    subtitle: '商品长什么样、用在什么环境里',
    accent: '#c45c26',
    scenarios: [
      {
        id: 'white-bg-hero',
        coverImage: scenarioCoverPath('white-bg-hero'),
        caseCompare: {
          beforeImage: '/ecommerce-cases/white-bg-hero-before.jpg',
          afterImage: '/ecommerce-cases/white-bg-hero-after.jpg',
          beforeLabel: '原图（供应商实拍）',
          afterLabel: '生成后（白底主图）',
          caption: '同款商品：杂乱实拍 → 纯白棚拍主图（主体≥85%）',
        },
        steps: ['上传商品图', '选择平台与主体占比', '生成白底主图'],
        workloadHint: '单 SKU 约 1–2 分钟',
        workbenchNotes: { outputQuality: '建议 2048px 方图', cropSafeZone: '主体居中，四边留 5% 安全区' },
        title: '白底 / 棚拍主图',
        description:
          '自动抠图、纯白背景、控制前景占比，适配 Amazon / 淘宝 / 京东主图规范。',
        tips: [
          '上传供应商白底或实拍图',
          '目标背景 RGB(255,255,255)，主体占比建议 ≥85%',
          '建议用图生图精修模式保持商品细节',
        ],
        tags: ['Amazon', '淘宝', '京东'],
        uploads: [productUpload],
        fields: [
          { id: 'marketplace', label: '目标平台', kind: 'choice', options: MARKET, defaultValue: 'amazon' },
          {
            id: 'subjectRatio',
            label: '主体占比',
            kind: 'choice',
            options: [
              { value: '85', label: '≥85%' },
              { value: '90', label: '≥90%' },
            ],
            defaultValue: '85',
          },
          {
            id: 'shadow',
            label: '背景阴影',
            kind: 'choice',
            options: [
              { value: 'none', label: '无阴影' },
              { value: 'soft', label: '轻微接触阴影' },
            ],
            defaultValue: 'none',
          },
          {
            id: 'outputQuality',
            label: '输出精细度',
            kind: 'choice',
            options: [
              { value: 'standard', label: '标准' },
              { value: 'high', label: '高细节' },
            ],
            defaultValue: 'high',
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `E-commerce product hero on pure white background RGB(255,255,255), ${S(v, 'marketplace')} listing style, product centered occupying at least ${S(v, 'subjectRatio')}% of frame, ${S(v, 'shadow') === 'none' ? 'no shadows on background' : 'subtle contact shadow only'}, sharp catalog photography, high detail, ${S(v, 'outputQuality') === 'high' ? 'ultra sharp edges' : 'clean catalog finish'}`,
      },
      {
        id: 'lifestyle',
        coverImage: scenarioCoverPath('lifestyle'),
        steps: ['上传商品图', '可选风格参考', '选场景与光线', '生成场景图'],
        workbenchNotes: { brandTone: '场景勿抢商品主体', cropSafeZone: '商品占画面 40–60%' },
        title: '生活场景图 Lifestyle',
        description: '将商品置入厨房、客厅、办公室、户外等真实使用环境，增强代入感。',
        tips: ['保持商品主体清晰可辨，场景勿抢戏'],
        tags: ['场景', '种草'],
        uploads: [productUpload, styleRefUpload],
        fields: [
          { id: 'scene', label: '场景类型', kind: 'choice', options: SCENE, defaultValue: 'living' },
          {
            id: 'mood',
            label: '氛围',
            kind: 'choice',
            options: [
              { value: 'warm', label: '温馨' },
              { value: 'minimal', label: '极简' },
              { value: 'premium', label: '质感暗调' },
            ],
            defaultValue: 'warm',
          },
          { id: 'light', label: '光线', kind: 'choice', options: LIGHT, defaultValue: 'natural' },
          {
            id: 'brandTone',
            label: '品牌调性',
            kind: 'choice',
            options: [
              { value: 'mass', label: '大众快消' },
              { value: 'premium', label: '轻奢质感' },
              { value: 'tech', label: '科技简洁' },
            ],
            defaultValue: 'mass',
          },
        ],
        aspectRatio: '4:3',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Place this product naturally into a realistic ${S(v, 'scene')} lifestyle scene, ${S(v, 'mood')} atmosphere, ${S(v, 'light')} lighting, ${S(v, 'brandTone')} brand tone, product remains the clear hero, commercial photography, shallow depth of field`,
      },
      {
        id: 'flat-lay-detail',
        coverImage: scenarioCoverPath('flat-lay-detail'),
        steps: ['上传商品', '选版式与背景', '生成平铺 / 微距 / 网格'],
        workbenchNotes: { outputQuality: '微距模式建议上传高清细节图' },
        title: '平铺图 / 细节微距 / 多角度网格',
        description: '俯拍全貌、材质微距与多角度网格，帮助消费者建立完整产品认知。',
        tips: ['平铺适合服饰配件；微距强调材质纹理'],
        tags: ['细节', '材质'],
        uploads: [productUpload],
        fields: [
          {
            id: 'layout',
            label: '版式',
            kind: 'choice',
            options: [
              { value: 'flatlay', label: '平铺全貌' },
              { value: 'macro', label: '材质微距' },
              { value: 'grid', label: '多角度网格' },
            ],
            defaultValue: 'flatlay',
          },
          {
            id: 'surface',
            label: '背景材质',
            kind: 'choice',
            options: [
              { value: 'white', label: '纯白' },
              { value: 'marble', label: '大理石' },
              { value: 'wood', label: '木质' },
            ],
            defaultValue: 'white',
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `E-commerce product photography: ${S(v, 'layout')} on ${S(v, 'surface')} background, even soft lighting, crisp texture, professional catalog style`,
      },
      {
        id: 'infographic',
        coverImage: scenarioCoverPath('infographic'),
        steps: ['上传商品图', '选信息图类型与留白', '生成可排版底图'],
        workbenchNotes: { cropSafeZone: '四周预留 12% 文案安全区', brandTone: '与 A+ 模块风格一致' },
        title: '卖点信息图 / 对比图 / 尺寸规格图',
        description: '在图上标注核心功能、竞品差异或尺寸参照，提升详情页说服力。',
        tips: ['留出中英文案排版空间'],
        tags: ['信息图', '对比'],
        uploads: [productUpload],
        fields: [
          {
            id: 'chartType',
            label: '信息图类型',
            kind: 'choice',
            options: [
              { value: 'selling', label: '卖点标注' },
              { value: 'compare', label: '对比图' },
              { value: 'size', label: '尺寸规格' },
            ],
            defaultValue: 'selling',
          },
          {
            id: 'langSpace',
            label: '文案留白',
            kind: 'choice',
            options: [
              { value: 'zh', label: '中文留白' },
              { value: 'en', label: '英文留白' },
              { value: 'both', label: '中英双语区' },
            ],
            defaultValue: 'both',
          },
          {
            id: 'sellingPoints',
            label: '核心卖点（可选）',
            kind: 'text',
            placeholder: '如：防水、轻量、24h 续航',
          },
          {
            id: 'cropSafeZone',
            label: '文案安全区',
            kind: 'choice',
            options: [
              { value: '12', label: '四边 12%' },
              { value: '18', label: '四边 18%' },
            ],
            defaultValue: '12',
          },
        ],
        aspectRatio: '3:4',
        kleinMode: 'edit',
        buildPrompt: (v) => {
          const extra = S(v, 'sellingPoints').trim();
          return `Product infographic (${S(v, 'chartType')}), keep product accurate, ${S(v, 'langSpace')} typography space, ${S(v, 'cropSafeZone')}% margin for copy, clean modern layout${extra ? `, emphasize: ${extra}` : ''}, professional Amazon A+ style`;
        },
      },
    ],
  },
  {
    id: 'model-tryon',
    title: '模特与试穿',
    subtitle: '替代约模特、搭影棚、拍上身',
    accent: '#b45309',
    scenarios: [
      {
        id: 'ai-model-wear',
        coverImage: scenarioCoverPath('ai-model-wear'),
        steps: ['上传服装图', '可选模特参考', '选体型 / 肤色 / 姿势', '生成上身图'],
        workbenchNotes: { outputQuality: '3:4 竖图适合详情页' },
        title: 'AI 模特上身图',
        description: '上传服装平铺或商品图，AI 自然「穿」到虚拟模特上，可换姿势 / 肤色 / 体型。',
        tips: ['上传平铺或挂拍服装图效果更好'],
        tags: ['上身', '服饰'],
        uploads: [garmentUpload],
        fields: [
          {
            id: 'gender',
            label: '模特性别',
            kind: 'choice',
            options: [
              { value: 'female', label: '女模' },
              { value: 'male', label: '男模' },
            ],
            defaultValue: 'female',
          },
          {
            id: 'pose',
            label: '姿势',
            kind: 'choice',
            options: [
              { value: 'standing', label: '站立' },
              { value: 'walking', label: '行走' },
              { value: '3_4', label: '3/4 身' },
            ],
            defaultValue: 'standing',
          },
          { id: 'body', label: '体型', kind: 'choice', options: MODEL_BODY, defaultValue: 'standard' },
          { id: 'tone', label: '肤色', kind: 'choice', options: MODEL_TONE, defaultValue: 'medium' },
        ],
        aspectRatio: '3:4',
        kleinMode: 'edit',
        supportsOfficialModel: true,
        buildPrompt: (v) =>
          `Fashion e-commerce ${S(v, 'gender')} model wearing this garment, ${S(v, 'pose')} pose, ${S(v, 'body')} body type, ${S(v, 'tone')} skin tone, accurate fabric drape, studio soft light, catalog look`,
      },
      {
        id: 'virtual-tryon',
        coverImage: scenarioCoverPath('virtual-tryon'),
        steps: ['上传服装', '可选模特参考', '设置合身与面料', '生成试穿图'],
        workbenchNotes: { brandTone: '同店建议固定模特风格' },
        title: '虚拟试穿',
        description: '强调合身感、褶皱与垂坠，同一模特风格贯穿店铺目录。',
        tips: ['多件商品复用同一模特描述可保持店铺风格一致'],
        tags: ['试穿', '合身'],
        uploads: [garmentUpload],
        fields: [
          {
            id: 'fit',
            label: '合身度',
            kind: 'choice',
            options: [
              { value: 'slim', label: '修身' },
              { value: 'regular', label: '标准' },
              { value: 'relaxed', label: '宽松' },
            ],
            defaultValue: 'regular',
          },
          {
            id: 'fabric',
            label: '面料表现',
            kind: 'multiChoice',
            options: [
              { value: 'wrinkles', label: '自然褶皱' },
              { value: 'drape', label: '垂坠感' },
              { value: 'stretch', label: '弹性贴合' },
            ],
            defaultValue: ['wrinkles', 'drape'],
          },
        ],
        aspectRatio: '3:4',
        kleinMode: 'edit',
        supportsOfficialModel: true,
        buildPrompt: (v) =>
          `Virtual try-on: clothing fitted on consistent fashion model, ${S(v, 'fit')} fit, emphasize ${M(v, 'fabric')}, boutique e-commerce quality, soft studio lighting`,
      },
      {
        id: 'invisible-model',
        coverImage: scenarioCoverPath('invisible-model'),
        steps: ['上传挂拍 / 平铺图', '选背景与立体度', '生成隐形模特图'],
        title: '隐形模特 / 挂拍',
        description: '商品保持立体形态但不露出人体，兼顾展示效果与合规（内衣、泳装等）。',
        tips: ['适合不便真人上身的品类'],
        tags: ['合规', '立体'],
        uploads: [garmentUpload],
        fields: [
          {
            id: 'bg',
            label: '背景',
            kind: 'choice',
            options: [
              { value: 'white', label: '纯白' },
              { value: 'gray', label: '浅灰' },
            ],
            defaultValue: 'white',
          },
          {
            id: 'volume',
            label: '立体程度',
            kind: 'choice',
            options: [
              { value: 'high', label: '强立体' },
              { value: 'medium', label: '适中' },
            ],
            defaultValue: 'high',
          },
        ],
        aspectRatio: '3:4',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Invisible mannequin ghost mannequin shot on ${S(v, 'bg')} background, ${S(v, 'volume')} 3D volume, no human body visible, professional apparel catalog`,
      },
      {
        id: 'sku-recolor',
        coverImage: scenarioCoverPath('sku-recolor'),
        steps: ['上传基准商品图（必填）', '填写目标色', '批量感换色输出'],
        workbenchNotes: { batchVariant: '同一光影下可连续换色出 SKU 系列' },
        title: '多 SKU 换色 / 换款',
        description: '同一版型不同颜色，无需逐一重拍，批量生成配色变体。',
        tips: ['保持版型与光影一致'],
        tags: ['SKU', '换色'],
        uploads: [productUpload],
        fields: [
          {
            id: 'targetColor',
            label: '目标颜色',
            kind: 'text',
            placeholder: '如：海军蓝 / #1E3A5F',
            defaultValue: 'navy blue',
          },
          {
            id: 'keepDetail',
            label: '保留细节',
            kind: 'choice',
            options: [
              { value: 'all', label: '纹理与光影' },
              { value: 'light', label: '仅光影' },
            ],
            defaultValue: 'all',
          },
          {
            id: 'batchVariant',
            label: '变体说明',
            kind: 'text',
            placeholder: '如：同款 4 色 — 藏青、米白、砖红',
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Same product variant recolored to ${S(v, 'targetColor')}, keep exact shape and ${S(v, 'keepDetail')}, realistic e-commerce SKU listing photo${S(v, 'batchVariant').trim() ? `, variant note: ${S(v, 'batchVariant').trim()}` : ''}`,
      },
    ],
  },
  {
    id: 'marketing',
    title: '营销与投放',
    subtitle: '面向「被点击」而非「被查看」',
    accent: '#dc2626',
    scenarios: [
      {
        id: 'ad-banner',
        coverImage: scenarioCoverPath('ad-banner'),
        steps: ['上传商品 hero', '选平台与留白', '生成投放底图'],
        workbenchNotes: { cropSafeZone: '按所选留白保留标题区', outputQuality: '9:16 适合信息流' },
        title: '海报 / Banner / 信息流素材',
        description: '按平台调性规划背景与构图，预留促销文案空间，用于广告与封面。',
        tips: ['竖版适合抖音/小红书；横版适合 Banner'],
        tags: ['投放', 'Banner'],
        uploads: [productUpload],
        fields: [
          { id: 'platform', label: '投放平台', kind: 'choice', options: PLATFORM, defaultValue: 'douyin' },
          {
            id: 'headlineSpace',
            label: '文案留白',
            kind: 'choice',
            options: [
              { value: 'top', label: '上方留白' },
              { value: 'bottom', label: '下方留白' },
              { value: 'side', label: '侧边留白' },
            ],
            defaultValue: 'top',
          },
          {
            id: 'promo',
            label: '促销氛围',
            kind: 'choice',
            options: [
              { value: 'flash', label: '大促爆款' },
              { value: 'premium', label: '高端质感' },
            ],
            defaultValue: 'flash',
          },
          {
            id: 'brandTone',
            label: '品牌语气',
            kind: 'choice',
            options: [
              { value: 'bold', label: '强促销' },
              { value: 'elegant', label: '克制高级' },
            ],
            defaultValue: 'bold',
          },
        ],
        aspectRatio: '9:16',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `High-converting ad creative for ${S(v, 'platform')}, product hero, ${S(v, 'promo')} look, ${S(v, 'brandTone')} visual tone, clear ${S(v, 'headlineSpace')} negative space for promo headline, vibrant commercial poster`,
      },
      {
        id: 'ugc-share',
        coverImage: scenarioCoverPath('ugc-share'),
        steps: ['上传商品', '选分享场景与拍摄感', '生成种草图'],
        title: '社媒种草图 / UGC 买家秀',
        description: '具有真实用户分享感的氛围图，用于小红书、Instagram 等内容铺垫。',
        tips: ['可弱化棚拍感，增加生活感'],
        tags: ['UGC', '小红书'],
        uploads: [productUpload],
        fields: [
          {
            id: 'vibe',
            label: '分享场景',
            kind: 'choice',
            options: [
              { value: 'unbox', label: '开箱' },
              { value: 'daily', label: '日常使用' },
              { value: 'desk', label: '桌面晒单' },
            ],
            defaultValue: 'daily',
          },
          {
            id: 'camera',
            label: '拍摄感',
            kind: 'choice',
            options: [
              { value: 'phone', label: '手机随拍' },
              { value: 'film', label: '胶片感' },
            ],
            defaultValue: 'phone',
          },
        ],
        aspectRatio: '3:4',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Authentic UGC ${S(v, 'vibe')} photo, ${S(v, 'camera')} aesthetic, natural indoor light, slightly imperfect real-user feel, Xiaohongshu / Instagram ready`,
      },
      {
        id: 'seasonal-gift',
        coverImage: scenarioCoverPath('seasonal-gift'),
        steps: ['上传品牌 / 商品参考', '选节日与风格', '生成季节视觉'],
        workbenchNotes: { brandTone: '礼盒与编辑风需统一色盘' },
        title: '季节营销 / 节日礼盒 / 杂志编辑风',
        description: '围绕大促、礼赠与品牌调性，快速产出季节化、风格化视觉。',
        tips: ['写明节日或季节元素'],
        tags: ['节日', '大促'],
        uploads: [brandRefUpload, productUpload],
        fields: [
          {
            id: 'season',
            label: '季节 / 节日',
            kind: 'choice',
            options: [
              { value: 'spring', label: '春季' },
              { value: 'summer', label: '夏季' },
              { value: 'q4', label: '双11 / 黑五' },
              { value: 'cny', label: '春节礼盒' },
            ],
            defaultValue: 'q4',
          },
          {
            id: 'style',
            label: '视觉风格',
            kind: 'choice',
            options: [
              { value: 'editorial', label: '杂志编辑' },
              { value: 'giftbox', label: '礼盒氛围' },
            ],
            defaultValue: 'giftbox',
          },
        ],
        aspectRatio: '4:5',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Seasonal e-commerce campaign (${S(v, 'season')}), ${S(v, 'style')} composition, premium packaging atmosphere, elegant typography space, holiday promotion aesthetic`,
      },
    ],
  },
  {
    id: 'livestream',
    title: '直播物料',
    subtitle: '围绕直播间视觉场的专项生图',
    accent: '#ea580c',
    scenarios: [
      {
        id: 'live-backdrop',
        coverImage: scenarioCoverPath('live-backdrop'),
        steps: ['上传品牌参考', '选构图与色调', '生成直播背景'],
        workbenchNotes: { cropSafeZone: '主播与商品区保持低纹理' },
        title: '直播间背景 / 背景板',
        description: '低干扰底图，为商品与主播留出清晰区域，统一直播间视觉。',
        tips: ['避免复杂图案抢主播注意力'],
        tags: ['直播', '背景'],
        uploads: [brandRefUpload],
        fields: [
          { id: 'layout', label: '构图', kind: 'choice', options: LIVE_LAYOUT, defaultValue: 'center' },
          {
            id: 'tone',
            label: '色调',
            kind: 'choice',
            options: [
              { value: 'brand', label: '品牌主色' },
              { value: 'neutral', label: '中性灰' },
              { value: 'warm', label: '暖色' },
            ],
            defaultValue: 'brand',
          },
        ],
        aspectRatio: '16:9',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Clean live-streaming studio backdrop, ${S(v, 'tone')} gradient, ${S(v, 'layout')} empty zone for host and product, low visual noise, professional 16:9 set design`,
      },
      {
        id: 'live-overlay',
        coverImage: scenarioCoverPath('live-overlay'),
        steps: ['上传品牌素材', '勾选贴片模块', '生成带安全区模板'],
        workbenchNotes: { cropSafeZone: '边缘 8% 防 OBS 裁切' },
        title: '直播分层贴片',
        description: '利益点板、倒计时占位、讲解卡、应急静态画面，预留安全区。',
        tips: ['边缘留安全区防裁切'],
        tags: ['贴片', '竖屏'],
        uploads: [brandRefUpload],
        fields: [
          {
            id: 'layers',
            label: '包含模块',
            kind: 'multiChoice',
            options: [
              { value: 'benefit', label: '利益点板' },
              { value: 'countdown', label: '倒计时位' },
              { value: 'card', label: '讲解卡' },
            ],
            defaultValue: ['benefit', 'card'],
          },
          {
            id: 'orientation',
            label: '画面方向',
            kind: 'choice',
            options: [
              { value: '9:16', label: '竖屏 9:16' },
              { value: '16:9', label: '横屏 16:9' },
            ],
            defaultValue: '9:16',
          },
          {
            id: 'cropSafeZone',
            label: '边缘安全区',
            kind: 'choice',
            options: [
              { value: '8', label: '8%' },
              { value: '12', label: '12%' },
            ],
            defaultValue: '8',
          },
        ],
        aspectRatio: '9:16',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Livestream overlay template (${S(v, 'orientation')}), modules: ${M(v, 'layers')}, ${S(v, 'cropSafeZone')}% safe margins, clean modern UI layers, empty text regions`,
      },
      {
        id: 'live-pedestal',
        coverImage: scenarioCoverPath('live-pedestal'),
        steps: ['上传商品白底图', '选展台材质与灯光', '生成直播展台'],
        title: '直播间产品展台 / 展示道具',
        description: '用白底图作参考，生成高级感展台与氛围，替代实体搭建。',
        tips: ['描述展台材质与灯光'],
        tags: ['展台', '道具'],
        uploads: [productUpload],
        fields: [
          {
            id: 'material',
            label: '展台材质',
            kind: 'choice',
            options: [
              { value: 'acrylic', label: '亚克力' },
              { value: 'marble', label: '大理石' },
              { value: 'metal', label: '金属' },
            ],
            defaultValue: 'marble',
          },
          { id: 'light', label: '灯光', kind: 'choice', options: LIGHT, defaultValue: 'soft' },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Premium livestream product pedestal, ${S(v, 'material')} stand, ${S(v, 'light')} rim light, product clearly presented, cinematic commercial set`,
      },
    ],
  },
  {
    id: 'detail-aplus',
    title: '详情页与 A+',
    subtitle: '成套视觉叙事与平台模块适配',
    accent: '#a16207',
    scenarios: [
      {
        id: 'product-set',
        coverImage: scenarioCoverPath('product-set'),
        steps: ['上传商品', '选本张套图类型', '生成并补齐系列'],
        workbenchNotes: { batchVariant: '固定 grade 可批量出套图' },
        title: '商品套图',
        description: '围绕同一商品成套输出主图、场景、细节、卖点等，保持视觉一致。',
        tips: ['一次生成后可再切场景补齐套图'],
        tags: ['套图', '一致性'],
        uploads: [productUpload],
        fields: [
          {
            id: 'shotType',
            label: '本张类型',
            kind: 'choice',
            options: [
              { value: 'hero', label: '主图' },
              { value: 'lifestyle', label: '场景' },
              { value: 'detail', label: '细节' },
              { value: 'feature', label: '卖点' },
            ],
            defaultValue: 'hero',
          },
          {
            id: 'grade',
            label: '调色',
            kind: 'choice',
            options: [
              { value: 'neutral', label: '中性真实' },
              { value: 'warm', label: '暖色品牌' },
              { value: 'cool', label: '冷色科技' },
            ],
            defaultValue: 'neutral',
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Cohesive e-commerce product set — ${S(v, 'shotType')} frame, ${S(v, 'grade')} color grade, consistent lighting language, premium brand catalog`,
      },
      {
        id: 'aplus-module',
        coverImage: scenarioCoverPath('aplus-module'),
        steps: ['上传商品', '选 A+ 模块类型', '生成宽屏模块图'],
        workbenchNotes: { outputQuality: '接近 970×600 视觉比例' },
        title: 'A+ 页面模块',
        description: '按平台模块尺寸生成品牌故事、功能标注、规格与对比展示。',
        tips: ['常见模块约 970×600'],
        tags: ['Amazon', 'A+'],
        uploads: [productUpload],
        fields: [
          {
            id: 'module',
            label: '模块类型',
            kind: 'choice',
            options: [
              { value: 'story', label: '品牌故事' },
              { value: 'features', label: '功能标注' },
              { value: 'compare', label: '对比展示' },
            ],
            defaultValue: 'features',
          },
        ],
        aspectRatio: '16:9',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Amazon A+ wide module (~970x600 feel): ${S(v, 'module')}, product accurate, clean corporate e-commerce banner layout`,
      },
      {
        id: 'explode-unbox',
        coverImage: scenarioCoverPath('explode-unbox'),
        steps: ['上传商品', '选爆炸图或开箱步骤', '生成说明图'],
        title: '爆炸图 / 开箱流程图',
        description: '组件拆解或开箱步骤，建立专业感与购买信任。',
        tips: ['适合数码、家电、配件'],
        tags: ['爆炸图', '开箱'],
        uploads: [productUpload],
        fields: [
          {
            id: 'diagram',
            label: '图解类型',
            kind: 'choice',
            options: [
              { value: 'exploded', label: '爆炸拆解' },
              { value: 'steps', label: '开箱步骤' },
            ],
            defaultValue: 'exploded',
          },
          {
            id: 'steps',
            label: '步骤数（开箱）',
            kind: 'choice',
            options: [
              { value: '3', label: '3 步' },
              { value: '4', label: '4 步' },
              { value: '5', label: '5 步' },
            ],
            defaultValue: '4',
          },
        ],
        aspectRatio: '16:9',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          S(v, 'diagram') === 'exploded'
            ? 'Technical exploded-view diagram of this product, clear component separation, white background, instructional trust-building visual'
            : `Unboxing flow diagram in ${S(v, 'steps')} numbered steps, clean instructional e-commerce style, white background`,
      },
    ],
  },
  {
    id: 'cross-border',
    title: '跨境本地化',
    subtitle: '让同一商品看起来属于不同市场',
    accent: '#0f766e',
    scenarios: [
      {
        id: 'multilang-layout',
        coverImage: scenarioCoverPath('multilang-layout'),
        steps: ['上传含文案海报（必填）', '选目标语言', '生成本地化版式'],
        workbenchNotes: { cropSafeZone: '严格模式保留文字框位置' },
        title: '多语言图片翻译与版式保留',
        description: '替换图中卖点文字为目标语言，尽量保留原排版与视觉结构。',
        tips: ['上传含文案的原信息图效果更好'],
        tags: ['多语言', '版式'],
        uploads: [posterUpload],
        fields: [
          { id: 'targetLang', label: '目标语言', kind: 'choice', options: LANG, defaultValue: 'en' },
          {
            id: 'preserve',
            label: '版式保留',
            kind: 'choice',
            options: [
              { value: 'strict', label: '严格保留' },
              { value: 'flex', label: '适度调整' },
            ],
            defaultValue: 'strict',
          },
          {
            id: 'outputQuality',
            label: '文字清晰度',
            kind: 'choice',
            options: [
              { value: 'sharp', label: '锐利可读' },
              { value: 'soft', label: '柔和印刷感' },
            ],
            defaultValue: 'sharp',
          },
        ],
        aspectRatio: '3:4',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Localize marketing image to ${S(v, 'targetLang')}, ${S(v, 'preserve')} layout and typography hierarchy, ${S(v, 'outputQuality')} text rendering, clean readable text`,
      },
      {
        id: 'market-aesthetic',
        coverImage: scenarioCoverPath('market-aesthetic'),
        steps: ['上传商品', '选市场与平台', '生成本地化场景'],
        title: '本地化审美与平台规范',
        description: '按目标市场审美与 Amazon / SHEIN / Temu / TikTok Shop 等调性生成场景。',
        tips: ['写明目标国家与平台'],
        tags: ['SHEIN', 'Temu', 'TikTok'],
        uploads: [productUpload],
        fields: [
          { id: 'region', label: '目标市场', kind: 'choice', options: MARKET_REGION, defaultValue: 'us' },
          {
            id: 'channel',
            label: '平台调性',
            kind: 'choice',
            options: [
              { value: 'amazon', label: 'Amazon' },
              { value: 'shein', label: 'SHEIN' },
              { value: 'temu', label: 'Temu' },
              { value: 'tiktok', label: 'TikTok Shop' },
            ],
            defaultValue: 'amazon',
          },
          {
            id: 'brandTone',
            label: '本地审美',
            kind: 'choice',
            options: [
              { value: 'lifestyle', label: '生活化' },
              { value: 'deal', label: '折扣直给' },
              { value: 'minimal', label: '极简' },
            ],
            defaultValue: 'lifestyle',
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Adapt product visual for ${S(v, 'region')} market and ${S(v, 'channel')} aesthetic, ${S(v, 'brandTone')} local aesthetic, local lifestyle context, listing-ready commercial photo`,
      },
    ],
  },
  {
    id: 'ops-efficiency',
    title: '运营提效',
    subtitle: '批量出图、多平台尺寸与合规修正',
    accent: '#475569',
    scenarios: [
      {
        id: 'multi-platform-size',
        coverImage: scenarioCoverPath('multi-platform-size'),
        steps: ['上传主视觉', '选目标比例与安全边距', '生成适配图'],
        workbenchNotes: { cropSafeZone: 'safe 模式保留平台裁切区' },
        title: '多平台尺寸一键适配',
        description: '同一商品视觉快速适配主图、详情、信息流等不同比例。',
        tips: ['先选好目标比例再生成'],
        tags: ['尺寸', '适配'],
        uploads: [productUpload],
        fields: [
          { id: 'targetRatio', label: '目标比例', kind: 'choice', options: RATIO_TARGET, defaultValue: '1:1' },
          {
            id: 'margin',
            label: '安全边距',
            kind: 'choice',
            options: [
              { value: 'tight', label: '紧凑' },
              { value: 'safe', label: '平台安全区' },
            ],
            defaultValue: 'safe',
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Reframe product image for ${S(v, 'targetRatio')} marketplace aspect, ${S(v, 'margin')} margins, keep product accurate, sharp commercial quality`,
      },
      {
        id: 'batch-style-unify',
        coverImage: scenarioCoverPath('batch-style-unify'),
        steps: ['上传待统一商品图', '设背景与品牌色', '批量统一风格'],
        workbenchNotes: { batchVariant: '适合一次上传多张后逐张生成', brandTone: '固定 brandHint 可系列化' },
        title: '店铺风格统一 / 批量出图',
        description: '统一光影、背景与调色，让目录图看起来出自同一套视觉体系。',
        tips: ['固定品牌色与背景描述'],
        tags: ['统一', '批量'],
        uploads: [productUpload],
        fields: [
          {
            id: 'bgTone',
            label: '背景色调',
            kind: 'choice',
            options: [
              { value: 'white', label: '纯白棚拍' },
              { value: 'warm-gray', label: '暖灰' },
              { value: 'brand', label: '品牌色渐变' },
            ],
            defaultValue: 'white',
          },
          {
            id: 'brandHint',
            label: '品牌色描述（可选）',
            kind: 'text',
            placeholder: '如：琥珀金 + 深炭灰',
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) => {
          const brand = S(v, 'brandHint').trim();
          return `Unify into store visual system: ${S(v, 'bgTone')} background, consistent soft studio light and color grade${brand ? `, brand colors ${brand}` : ''}, premium catalog series`;
        },
      },
      {
        id: 'compliance-fix',
        coverImage: scenarioCoverPath('compliance-fix'),
        steps: ['上传待检主图', '选平台与修正项', '生成合规图'],
        workbenchNotes: { outputQuality: '主图优先 1:1 高清' },
        title: '主图合规预检修正',
        description: '修正杂乱背景、占比不足、边角裁切等问题，贴近平台硬性规范。',
        tips: ['白底主图优先；避免多余文字与水印'],
        tags: ['合规', '预检'],
        uploads: [productUpload],
        fields: [
          { id: 'marketplace', label: '目标平台', kind: 'choice', options: MARKET, defaultValue: 'taobao' },
          {
            id: 'fixes',
            label: '修正项',
            kind: 'multiChoice',
            options: [
              { value: 'bg', label: '纯白背景' },
              { value: 'ratio', label: '主体占比' },
              { value: 'clutter', label: '去杂物/水印' },
              { value: 'crop', label: '边缘裁切' },
            ],
            defaultValue: ['bg', 'ratio', 'clutter'],
          },
        ],
        aspectRatio: '1:1',
        kleinMode: 'edit',
        buildPrompt: (v) =>
          `Fix listing image for ${S(v, 'marketplace')} compliance: apply ${M(v, 'fixes')}, product centered large subject ratio, clean edges, marketplace main-image ready`,
      },
    ],
  },
];

export function resolveScenarioAspect(scenario: EcommerceScenario, fieldValues?: ScenarioFieldValues): string {
  if (scenario.id === 'multi-platform-size' && fieldValues?.targetRatio) {
    return String(fieldValues.targetRatio);
  }
  if (scenario.id === 'live-overlay' && fieldValues?.orientation === '16:9') {
    return '16:9';
  }
  return scenario.aspectRatio;
}

export function findEcommerceScenario(scenarioId: string): {
  category: EcommerceCategory;
  scenario: EcommerceScenario;
} | null {
  for (const category of ECOMMERCE_CATEGORIES) {
    const scenario = category.scenarios.find((s) => s.id === scenarioId);
    if (scenario) return { category, scenario };
  }
  return null;
}
