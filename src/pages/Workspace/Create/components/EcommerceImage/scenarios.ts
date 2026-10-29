export type EcommerceGenMode = 'textToImage' | 'imageToImage';

export type EcommerceKleinMode = 'edit' | 'denoise';

export interface EcommerceScenario {
  id: string;
  title: string;
  description: string;
  tips: string[];
  genMode: EcommerceGenMode;
  /** 预填提示词，用户可改 */
  promptTemplate: string;
  aspectHint?: string;
  preferredKleinMode?: EcommerceKleinMode;
  tags?: string[];
}

export interface EcommerceCategory {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  scenarios: EcommerceScenario[];
}

export const ECOMMERCE_CATEGORIES: EcommerceCategory[] = [
  {
    id: 'product-display',
    title: '商品展示',
    subtitle: '商品长什么样、用在什么环境里',
    accent: '#c45c26',
    scenarios: [
      {
        id: 'white-bg-hero',
        title: '白底 / 棚拍主图',
        description: '自动抠图、纯白背景、控制前景占比，适配 Amazon / 淘宝 / 京东主图规范。',
        tips: [
          '上传供应商白底或实拍图',
          '目标背景 RGB(255,255,255)，主体占比建议 ≥85%',
          '建议用图生图精修模式保持商品细节',
        ],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['Amazon', '淘宝', '京东'],
        promptTemplate:
          'E-commerce product hero shot on pure white background RGB(255,255,255), clean studio lighting, product centered, occupying at least 85% of the frame, sharp edges, no props, no shadows on background, catalog photography, high detail',
      },
      {
        id: 'lifestyle',
        title: '生活场景图 Lifestyle',
        description: '将商品置入厨房、客厅、办公室、户外等真实使用环境，增强代入感。',
        tips: [
          '可按品类选择木质家居 / 暗调质感 / 户外运动等风格',
          '保持商品主体清晰可辨，场景勿抢戏',
        ],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '4:3',
        tags: ['场景', '种草'],
        promptTemplate:
          'Place this product naturally into a realistic lifestyle scene (kitchen / living room / office / outdoor as appropriate for the product). Soft natural light, authentic atmosphere, product remains the clear hero, commercial photography, shallow depth of field',
      },
      {
        id: 'flat-lay-detail',
        title: '平铺图 / 细节微距 / 多角度网格',
        description: '俯拍全貌、材质微距与多角度网格，帮助消费者建立完整产品认知。',
        tips: ['平铺适合服饰配件；微距强调材质纹理；网格可一次展示多视角'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['细节', '材质'],
        promptTemplate:
          'E-commerce product photography: clean flat-lay overview combined with close-up material macro details, optional multi-angle grid layout, even soft lighting, crisp texture, professional catalog style',
      },
      {
        id: 'infographic',
        title: '卖点信息图 / 对比图 / 尺寸规格图',
        description: '在图上标注核心功能、竞品差异或尺寸参照，提升详情页说服力。',
        tips: ['提示词中写明要强调的卖点与对比维度', '留出中英文案排版空间'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '3:4',
        tags: ['信息图', '对比'],
        promptTemplate:
          'E-commerce product infographic: keep the product accurate, add clean callout labels for key selling points, comparison vs competitor, and size reference scale. Minimal modern layout, readable typography space, white or soft-gray background, professional Amazon A+ style',
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
        title: 'AI 模特上身图',
        description: '上传服装平铺或商品图，AI 自然「穿」到虚拟模特上，可换姿势 / 肤色 / 体型。',
        tips: ['上传平铺或挂拍服装图效果更好', '可在提示词中指定模特性别、姿势、场景'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '3:4',
        tags: ['上身', '服饰'],
        promptTemplate:
          'Fashion e-commerce model wearing this garment naturally. Accurate fabric drape, fit and wrinkles, studio soft light, full-body or 3/4 shot, clean background, catalog look, consistent proportions',
      },
      {
        id: 'virtual-tryon',
        title: '虚拟试穿',
        description: '强调合身感、褶皱与垂坠，同一模特风格贯穿店铺目录。',
        tips: ['多件商品复用同一模特描述可保持店铺风格一致'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '3:4',
        tags: ['试穿', '合身'],
        promptTemplate:
          'Virtual try-on photo: this clothing fitted on a consistent fashion model, realistic wrinkles, fabric weight and drape, natural pose, boutique e-commerce quality, soft studio lighting',
      },
      {
        id: 'invisible-model',
        title: '隐形模特 / 挂拍',
        description: '商品保持立体形态但不露出人体，兼顾展示效果与合规（内衣、泳装等）。',
        tips: ['适合不便真人上身的品类', '强调立体感与版型'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '3:4',
        tags: ['合规', '立体'],
        promptTemplate:
          'Invisible mannequin / ghost mannequin product shot: garment keeps 3D volume and shape, no human body visible, clean white or soft studio background, professional apparel catalog photography',
      },
      {
        id: 'sku-recolor',
        title: '多 SKU 换色 / 换款',
        description: '同一版型不同颜色，无需逐一重拍，批量生成配色变体。',
        tips: ['在提示词中写明目标颜色或色号', '保持版型与光影一致'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['SKU', '换色'],
        promptTemplate:
          'Same product variant with a different colorway only. Keep exact shape, material, lighting and composition; change color cleanly and realistically for e-commerce SKU listing',
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
        title: '海报 / Banner / 信息流素材',
        description: '按平台调性规划背景与构图，预留促销文案空间，用于广告与封面。',
        tips: ['竖版适合抖音/小红书；横版适合 Banner', '提示词注明留白区域'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '9:16',
        tags: ['投放', 'Banner'],
        promptTemplate:
          'High-converting e-commerce ad creative featuring this product as hero. Bold composition, platform-ready marketing poster, clear negative space for promo headline, vibrant but premium look, social feed / banner style',
      },
      {
        id: 'ugc-share',
        title: '社媒种草图 / UGC 买家秀',
        description: '具有真实用户分享感的氛围图，用于小红书、Instagram 等内容铺垫。',
        tips: ['可弱化棚拍感，增加生活感与轻微不完美'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '3:4',
        tags: ['UGC', '小红书'],
        promptTemplate:
          'Authentic UGC buyer-share style photo of this product, casual smartphone aesthetic, natural indoor light, lifestyle unboxing / daily use vibe, slightly imperfect real-user feel, Instagram / Xiaohongshu ready',
      },
      {
        id: 'seasonal-gift',
        title: '季节营销 / 节日礼盒 / 杂志编辑风',
        description: '围绕大促、礼赠与品牌调性，快速产出季节化、风格化视觉。',
        tips: ['在提示词中写明节日或季节元素', '可偏杂志编辑排版感'],
        genMode: 'textToImage',
        aspectHint: '4:5',
        tags: ['节日', '大促'],
        promptTemplate:
          'Seasonal e-commerce campaign visual, festive gift-box mood, magazine editorial composition, premium packaging atmosphere, elegant typography space, holiday / Q4 promotion aesthetic',
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
        title: '直播间背景 / 背景板',
        description: '低干扰底图，为商品与主播留出清晰区域，统一直播间视觉。',
        tips: ['避免复杂图案抢主播注意力', '可按商品主色调协调背景'],
        genMode: 'textToImage',
        aspectHint: '16:9',
        tags: ['直播', '背景'],
        promptTemplate:
          'Clean live-streaming studio backdrop board, low visual noise, soft brand-color gradient, clear empty center zone for host and product, professional livestream set design, 16:9',
      },
      {
        id: 'live-overlay',
        title: '直播分层贴片',
        description: '利益点板、倒计时占位、讲解卡、应急静态画面，预留安全区。',
        tips: ['竖屏 1080×1920 或横屏 1920×1080', '边缘留安全区防裁切'],
        genMode: 'textToImage',
        aspectHint: '9:16',
        tags: ['贴片', '竖屏'],
        promptTemplate:
          'Livestream overlay graphic template: benefit callout panel, countdown placeholder, product talking-point card layout, safe margins for 9:16 vertical stream, clean modern UI layers, empty text regions',
      },
      {
        id: 'live-pedestal',
        title: '直播间产品展台 / 展示道具',
        description: '用白底图作参考，生成高级感展台与氛围，替代实体搭建。',
        tips: ['上传商品白底图，描述展台材质与灯光'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['展台', '道具'],
        promptTemplate:
          'Premium livestream product pedestal display for this item, luxury material stand, cinematic soft rim light, branded stage atmosphere, product clearly presented, commercial set design',
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
        title: '商品套图',
        description: '围绕同一商品成套输出主图、场景、细节、卖点等，保持视觉一致。',
        tips: ['一次生成后可再切场景补齐套图', '提示词保持同一品牌调性关键词'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['套图', '一致性'],
        promptTemplate:
          'Cohesive e-commerce product image set style for this item: hero, lifestyle, detail and selling-point friendly framing, consistent color grade and lighting language across shots, premium brand catalog',
      },
      {
        id: 'aplus-module',
        title: 'A+ 页面模块',
        description: '按平台模块尺寸生成品牌故事、功能标注、规格与对比展示。',
        tips: ['常见模块约 970×600', '预留标题与正文区块'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '16:9',
        tags: ['Amazon', 'A+'],
        promptTemplate:
          'Amazon A+ content module visual (about 970x600 feel): brand story header, feature callouts, specs and comparison layout with this product, wide banner composition, clean corporate e-commerce design',
      },
      {
        id: 'explode-unbox',
        title: '爆炸图 / 开箱流程图',
        description: '组件拆解或开箱步骤，建立专业感与购买信任。',
        tips: ['适合数码、家电、配件等有结构的商品'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '16:9',
        tags: ['爆炸图', '开箱'],
        promptTemplate:
          'Technical exploded-view or unboxing step flowchart of this product, clear component separation, numbered step space, instructional e-commerce diagram style, clean white background, professional trust-building visual',
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
        title: '多语言图片翻译与版式保留',
        description: '替换图中卖点文字为目标语言，尽量保留原排版与视觉结构。',
        tips: ['在提示词中写明目标语言', '上传含文案的原信息图效果更好'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '3:4',
        tags: ['多语言', '版式'],
        promptTemplate:
          'Localize this product marketing image: translate on-image copy to English (or specified target language), preserve original layout, typography hierarchy and visual structure as much as possible, clean readable text',
      },
      {
        id: 'market-aesthetic',
        title: '本地化审美与平台规范',
        description: '按目标市场审美与 Amazon / SHEIN / Temu / TikTok Shop 等调性生成场景。',
        tips: ['提示词写明目标国家与平台', '不要只做简单翻译'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['SHEIN', 'Temu', 'TikTok'],
        promptTemplate:
          'Adapt this product visual for the target market aesthetic and marketplace norms (Amazon / SHEIN / Temu / TikTok Shop). Local lifestyle context, culturally fitting color mood and composition, listing-ready commercial photo',
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
        title: '多平台尺寸一键适配',
        description: '同一商品视觉快速适配主图、详情、信息流等不同比例。',
        tips: ['先选好目标比例再生成', '可对同一参考图多次出不同尺寸'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['尺寸', '适配'],
        promptTemplate:
          'Reframe and regenerate this product image for the selected marketplace aspect ratio. Keep product accurate, balanced composition, platform listing safe margins, sharp commercial quality',
      },
      {
        id: 'batch-style-unify',
        title: '店铺风格统一 / 批量出图',
        description: '统一光影、背景与调色，让目录图看起来出自同一套视觉体系。',
        tips: ['在提示词中固定品牌色与背景描述'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['统一', '批量'],
        promptTemplate:
          'Unify this product photo into a consistent store visual system: same soft studio light, same background tone, same color grade and shadow style as a premium brand catalog series',
      },
      {
        id: 'compliance-fix',
        title: '主图合规预检修正',
        description: '修正杂乱背景、占比不足、边角裁切等问题，贴近平台硬性规范。',
        tips: ['白底主图优先；避免多余文字与水印'],
        genMode: 'imageToImage',
        preferredKleinMode: 'edit',
        aspectHint: '1:1',
        tags: ['合规', '预检'],
        promptTemplate:
          'Fix this listing image for marketplace compliance: pure white background, product centered with large subject ratio, remove clutter/watermarks/extra text, clean edges, Amazon/Taobao main-image ready',
      },
    ],
  },
];

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
