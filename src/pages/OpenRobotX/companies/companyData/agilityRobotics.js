// Agility Robotics - 绿/工业
const heroImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80';
const digitImage = 'https://images.unsplash.com/photo-1561557944-6e7860b2b3a3?w=600&q=80';

export default {
  slug: 'agility-robotics',
  name: 'Agility Robotics',
  nameCn: '',
  region: '美国',
  tagline: 'Digit 双足物流机器人 — 仓储与物料搬运',
  officialUrl: 'https://www.agilityrobotics.com',
  theme: {
    primary: '#22c55e',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.82))',
  },
  heroImage,
  aboutParagraphs: [
    'Agility Robotics 专注双足人形机器人 Digit，面向仓储与物料搬运。Digit 可站立行走、搬箱、与传送带协作，适合现有仓库动线，无需大规模改造。',
    '与亚马逊等企业合作，推进物流场景落地。俄勒冈新工厂投产后产能提升，旨在成为仓储人形机器人的主要供应商之一。',
  ],
  products: [
    {
      name: 'Digit',
      description: '双足人形机器人，专为仓库设计。可搬箱、与传送带配合、在人类环境中安全移动，适配现有物流流程。',
      image: digitImage,
    },
  ],
  highlights: [
    '俄勒冈新工厂扩产，满足更多客户试运行与采购需求。',
    '与亚马逊等合作，在真实仓库中测试与部署 Digit。',
    '强调与现有仓储系统的集成与 ROI。',
  ],
};
