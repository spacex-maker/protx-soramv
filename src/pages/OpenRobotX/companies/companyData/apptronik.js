// Apptronik - 深蓝/航天
const heroImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80';
const apolloImage = 'https://images.unsplash.com/photo-1531746795393-6cde5e4ee2d6?w=600&q=80';

export default {
  slug: 'apptronik',
  name: 'Apptronik',
  nameCn: '',
  region: '美国',
  tagline: 'Apollo 模块化人形 — 安全与重载',
  officialUrl: 'https://www.apptronik.com',
  theme: {
    primary: '#6366f1',
    heroOverlay: 'linear-gradient(to bottom, rgba(99,102,241,0.12), rgba(0,0,0,0.85))',
  },
  heroImage,
  aboutParagraphs: [
    'Apptronik 专注模块化人形机器人 Apollo，强调安全与重载能力。Apollo 面向物流、制造等场景，模块化设计便于适配不同任务与客户需求。',
    '与 NASA 等机构合作，推进人形机器人在太空与地面应用的标准与可靠性。产品适合重复性搬运与操作任务，兼顾安全与人机协作。',
  ],
  products: [
    {
      name: 'Apollo',
      description: '模块化人形机器人，强调安全与重载。适用于物流、制造等场景，可与人类协作，支持定制化模块。',
      image: apolloImage,
    },
  ],
  highlights: [
    '与 NASA 合作，探索人形机器人在太空与地面应用。',
    'Apollo 模块化设计便于适配不同负载与任务。',
    '强调安全与人机协作，适合工业与仓储。',
  ],
};
