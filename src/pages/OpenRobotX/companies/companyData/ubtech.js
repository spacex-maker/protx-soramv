// 优必选 Ubtech - 蓝/教育
const heroImage = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80';
const walkerImage = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80';

export default {
  slug: 'ubtech',
  name: 'Ubtech',
  nameCn: '优必选科技',
  region: '中国',
  tagline: 'Walker · 教育与人形',
  officialUrl: 'https://www.ubtrobot.com',
  theme: {
    primary: '#3b82f6',
    heroOverlay: 'linear-gradient(to bottom, rgba(59,130,246,0.15), rgba(0,0,0,0.82))',
  },
  heroImage,
  aboutParagraphs: [
    '优必选科技（Ubtech）深耕教育机器人与人形机器人多年。Walker 人形机器人面向商用与教育场景，具备行走、抓取与基础交互能力。',
    '在教育市场积累了大量客户与内容，人形产品逐步进入工业与服务场景。2025 年人形机器人装机量市占略高于 5%，位居全球前列。',
  ],
  products: [
    {
      name: 'Walker',
      description: '人形机器人，面向商用与教育。支持行走、抓取与基础交互，可扩展编程与教学内容。',
      image: walkerImage,
    },
  ],
  highlights: [
    '2025 年人形机器人装机量市占略高于 5%。',
    '教育机器人业务成熟，人形产品向工业与服务延伸。',
    'Walker 系列持续迭代行走与操作能力。',
  ],
};
