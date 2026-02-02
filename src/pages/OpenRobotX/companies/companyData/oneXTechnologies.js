// 1X Technologies - 柔和/家用
const heroImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80';
const neoImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';

export default {
  slug: '1x-technologies',
  name: '1X Technologies',
  nameCn: '',
  region: '挪威',
  tagline: 'NEO 家用具身智能 — 柔性驱动与 1X World Model',
  officialUrl: 'https://www.1x.tech',
  theme: {
    primary: '#a78bfa',
    heroOverlay: 'linear-gradient(to bottom, rgba(167,139,250,0.15), rgba(0,0,0,0.8))',
  },
  heroImage,
  aboutParagraphs: [
    '1X Technologies 来自挪威，主打家用与消费级人形机器人。NEO 于 2025 年 10 月发布，定位为「首款面向消费者的家用型人形机器人」，可折叠衣物、整理货架、收拾空间，并在不熟悉任务时由 1X 专家远程指导学习。',
    'NEO 采用 1X World Model 作为认知核心：从视频预训练到动作生成，减少对大规模机器人数据集的依赖。机身轻量、柔性驱动、静音设计，适合家庭环境。获 OpenAI 等投资，2025 年计划量产数千台。',
  ],
  products: [
    {
      name: 'NEO',
      description: '家用具身智能机器人，支持叠衣、整理、收纳等任务。柔性驱动与触觉设计，静音运行，支持 1X 专家远程指导学习。',
      image: neoImage,
    },
    {
      name: '1X World Model',
      description: '从视频到动作的认知模型，结合互联网规模视频与 NEO 的具身设计，支持在新任务上泛化。',
      image: 'https://images.unsplash.com/photo-1676299080923-6d17d2c73166?w=600&q=80',
    },
  ],
  highlights: [
    '2025 年 10 月 NEO 正式发布，开放预订（约 200 美元定金）。',
    '1X World Model 采用视频预训练 + 文本条件动作生成，区别于传统 VLA。',
    '获 OpenAI 等投资，2025 年量产数千台 NEO。',
  ],
};
