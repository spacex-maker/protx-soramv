// Sanctuary AI - 紫/认知
const heroImage = 'https://images.unsplash.com/photo-1676299080923-6d17d2c73166?w=1600&q=80';
const phoenixImage = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80';

export default {
  slug: 'sanctuary-ai',
  name: 'Sanctuary AI',
  nameCn: '',
  region: '加拿大',
  tagline: 'Phoenix · 通用认知与多任务',
  officialUrl: 'https://www.sanctuary.ai',
  theme: {
    primary: '#8b5cf6',
    heroOverlay: 'linear-gradient(to bottom, rgba(139,92,246,0.15), rgba(0,0,0,0.82))',
  },
  heroImage,
  aboutParagraphs: [
    'Sanctuary AI 来自加拿大，主打通用认知人形机器人 Phoenix。Phoenix 面向多任务工作流，旨在实现接近人类的推理与操作能力，可适应多种场景与任务类型。',
    '强调「通用人工智能」与具身结合：不仅执行预设动作，还能理解任务、规划步骤并应对变化。适合需要灵活性与认知能力的商业与工业场景。',
  ],
  products: [
    {
      name: 'Phoenix',
      description: '通用认知人形机器人，支持多任务工作流与复杂推理。面向需要灵活性与认知能力的商业与工业场景。',
      image: phoenixImage,
    },
  ],
  highlights: [
    'Phoenix 主打通用认知与多任务，区别于单一任务机器人。',
    '强调推理、规划与适应性，与纯运动控制形成差异化。',
    '加拿大 AI 与机器人生态中的重要企业之一。',
  ],
};
