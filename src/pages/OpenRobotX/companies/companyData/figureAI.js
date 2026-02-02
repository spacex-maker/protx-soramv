// Figure AI - 科技蓝/白
const heroImage = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=80';
const figure03Image = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80';

export default {
  slug: 'figure-ai',
  name: 'Figure AI',
  nameCn: '',
  region: '美国',
  tagline: '通用人形 · Helix AI — 物流、制造与家庭',
  officialUrl: 'https://www.figure.ai',
  theme: {
    primary: '#0ea5e9',
    heroOverlay: 'linear-gradient(to bottom, rgba(14,165,233,0.2), rgba(0,0,0,0.8))',
  },
  heroImage,
  aboutParagraphs: [
    'Figure AI 专注通用人形机器人，面向物流、仓储、制造与家庭场景。自研 Helix 视觉-语言-动作大模型，支持从感知到执行的端到端控制，并持续从数据中学习新技能。',
    '2025 年初结束与 OpenAI 的合作，全面采用自研 AI。估值约 395 亿美元，目标 4 年内量产 10 万台。宝马等客户已签约，机器人将用于工厂物理作业与重复性劳动。',
    '2025 年 10 月发布 Figure 03，针对家庭与大规模制造重新设计：更高帧率视觉、掌心相机、触觉指尖与软质外观，兼顾安全与量产。',
  ],
  products: [
    {
      name: 'Figure 03',
      description: '第三代通用人形，面向家庭与量产。Helix 驱动，视觉与触觉升级，软质材料与无线充电，适配家庭安全标准。',
      image: figure03Image,
    },
    {
      name: 'Helix',
      description: '自研 VLA 大模型，视觉-语言-动作一体，可从人类演示与数据中持续学习，支持复杂多步任务。',
      image: 'https://images.unsplash.com/photo-1676299080923-6d17d2c73166?w=600&q=80',
    },
  ],
  highlights: [
    '2025 年 2 月洽谈新一轮融资，估值约 395 亿美元。',
    '与 OpenAI 合作终止，全面转向自研 Helix 模型。',
    'Helix 02 实现约 4 分钟自主洗碗机装卸，为人形机器人迄今最长复杂自主任务之一。',
    '宝马等客户签约，工厂部署进行中。',
  ],
};
