// 波士顿动力 - 工业风、红/黑
const heroImage = 'https://images.unsplash.com/photo-1561557944-6e7860b2b3a3?w=1600&q=80';
const atlasImage = 'https://images.unsplash.com/photo-1531746795393-6cde5e4ee2d6?w=600&q=80';
const spotImage = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80';

export default {
  slug: 'boston-dynamics',
  name: 'Boston Dynamics',
  nameCn: '波士顿动力',
  region: '美国',
  tagline: 'Atlas · Spot · Stretch — 人形与四足机器人标杆',
  officialUrl: 'https://www.bostondynamics.com',
  theme: {
    primary: '#e63946',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.85))',
  },
  heroImage,
  aboutParagraphs: [
    '波士顿动力是全球人形与四足机器人领域的标杆企业，以高动态运动控制与自主行为闻名。Atlas 人形机器人、Spot 四足机器人和 Stretch 仓储机器人已进入汽车制造、物流、巡检与建筑等场景。',
    '客户包括 DHL、BP、马士基等。2024 年 Atlas 推出全电版本，具备 56 自由度、触觉传感与 360° 视野，支持 4 小时续航与自换电。Spot 具备 14kg 负载与 360° 感知，用于工厂巡检与科研。',
  ],
  products: [
    {
      name: 'Atlas',
      description: '全电人形机器人，1.9m 高、90kg，56 自由度，50kg 瞬时抓取。面向汽车制造与物流，支持自主搬运与操作。',
      image: atlasImage,
    },
    {
      name: 'Spot',
      description: '四足移动机器人，360° 感知、14kg 负载。用于工厂巡检、建筑工地与科研，可通过 Orbit 平台统一管理。',
      image: spotImage,
    },
    {
      name: 'Stretch',
      description: '仓储专用移动机械臂，针对卸货与码垛场景设计，提升仓库自动化效率。',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    },
  ],
  highlights: [
    '2024 年 Atlas 全电版发布，替代液压版本，续航与可维护性提升。',
    'Spot 已部署于 DHL、BP、马士基等企业的巡检与数据采集场景。',
    'Orbit 软件平台统一管理多台机器人，支持任务调度与数据分析。',
  ],
};
