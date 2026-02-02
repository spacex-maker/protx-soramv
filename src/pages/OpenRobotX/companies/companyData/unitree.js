// Unitree 宇树 - 青绿/极客风
const heroImage = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&q=80';
const g1Image = 'https://images.unsplash.com/photo-1531746795393-6cde5e4ee2d6?w=600&q=80';

export default {
  slug: 'unitree',
  name: 'Unitree Robotics',
  nameCn: '宇树科技',
  region: '中国',
  tagline: 'G1 · H1 — 高性价比与快速迭代',
  officialUrl: 'https://www.unitree.com',
  theme: {
    primary: '#00d4aa',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,212,170,0.12), rgba(0,0,0,0.85))',
  },
  heroImage,
  aboutParagraphs: [
    '宇树科技（Unitree Robotics）是全球人形与四足机器人出货量领先的企业之一，以高性价比与快速迭代著称。G1、H1 等人形产品与 Go2、B2 等四足产品覆盖开发者、科研与商业场景。',
    '2025 年全球人形机器人装机量中，宇树市占率约 27%，仅次于智元。产品具备动态运动能力（如立定跳远、复杂地形行走），可选 Nvidia Isaac AI、LiDAR 与深度相机，电池可换、续航约 2 小时。',
  ],
  products: [
    {
      name: 'G1',
      description: '人形机器人，约 35kg，动态运动能力强。可选灵巧手，支持 LiDAR 与深度相机，定价约 1.6–6.7 万美元。',
      image: g1Image,
    },
    {
      name: 'H1',
      description: '人形机器人，面向科研与商业。高自由度、高负载，配合 Isaac AI 与仿真，适合算法与场景开发。',
      image: 'https://images.unsplash.com/photo-1561557944-6e7860b2b3a3?w=600&q=80',
    },
  ],
  highlights: [
    '2025 年人形机器人装机量市占约 27%，全球前列。',
    'G1 等产品已量产交付，开发者与科研客户广泛。',
    '成本与迭代速度优势明显，与特斯拉 Optimus 等形成差异化。',
  ],
};
