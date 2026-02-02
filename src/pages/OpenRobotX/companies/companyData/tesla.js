// Tesla - 红/灰 科技感
const heroImage = 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600&q=80';
const optimusImage = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80';

export default {
  slug: 'tesla',
  name: 'Tesla',
  nameCn: '特斯拉',
  region: '美国',
  tagline: 'Optimus 人形机器人 — 从工厂到量产',
  officialUrl: 'https://www.tesla.com',
  theme: {
    primary: '#cc0000',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.85))',
  },
  heroImage,
  aboutParagraphs: [
    '特斯拉将 Optimus 人形机器人列为长期战略产品，与电动车、储能并列。Optimus 采用类人比例与高分辨率相机，手部与脚部配备先进传感器，并复用特斯拉自动驾驶相关的神经网络与实时环境处理能力。',
    '计划率先在特斯拉工厂部署，承担抓取、搬运与产线辅助等任务，随后逐步扩大产量与场景。Gen-2 版本更轻、更灵活，在 We, Robot 等活动中展示与人群互动与递送物品等能力。',
  ],
  products: [
    {
      name: 'Optimus Gen-2',
      description: '人形机器人，约成人身高，高分辨率视觉与手足传感。神经网络支持自主抓取、搬运与导航，拟定价约 2–3 万美元。',
      image: optimusImage,
    },
  ],
  highlights: [
    '计划 2025 年底前在特斯拉工厂部署首批 Optimus。',
    'Gen-2 在 We, Robot 等活动展示递饮料、与观众互动等能力。',
    '与 FSD 等技术栈协同，强调规模化制造与成本控制。',
  ],
};
