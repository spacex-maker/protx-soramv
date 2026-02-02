// 智元 Agibot - 橙/工业
const heroImage = 'https://images.unsplash.com/photo-1561557944-6e7860b2b3a3?w=1600&q=80';
const lingxiImage = 'https://images.unsplash.com/photo-1531746795393-6cde5e4ee2d6?w=600&q=80';

export default {
  slug: 'agibot',
  name: 'Agibot',
  nameCn: '智元机器人',
  region: '中国',
  tagline: '灵犀 · 深度强化学习 — 运动、交互与作业',
  officialUrl: 'https://www.agibot.com',
  theme: {
    primary: '#f97316',
    heroOverlay: 'linear-gradient(to bottom, rgba(249,115,22,0.15), rgba(0,0,0,0.85))',
  },
  heroImage,
  aboutParagraphs: [
    '智元机器人（Agibot）是人形机器人市场占有率领先的中国企业之一，已交付超 5000 台。灵犀系列采用深度强化学习，具备运动、交互与作业能力，在制造与场景落地上表现突出。',
    '2025 年全球人形机器人装机量中，智元市占约 31%，居首位。产品面向工业与商用场景，强调成本控制与规模化交付能力。',
  ],
  products: [
    {
      name: '灵犀 X2',
      description: '人形机器人，深度强化学习驱动。具备运动控制、人机交互与作业能力，面向制造与物流等场景。',
      image: lingxiImage,
    },
  ],
  highlights: [
    '2025 年人形机器人装机量市占约 31%，全球第一。',
    '已交付超 5000 台，制造与供应链能力强。',
    '灵犀系列持续迭代运动与作业能力。',
  ],
};
