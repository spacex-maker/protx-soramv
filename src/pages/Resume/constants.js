import React from 'react';
import {
  CodeOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ToolOutlined,
  ApiOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

// 默认技能数据 - Java生态全技术栈
export const defaultSkills = {
  // 核心语言与JVM
  core: [
    { name: 'Java', percentage: 90, iconType: 'CodeOutlined' },
    { name: 'Java 8/11/17', percentage: 88, iconType: 'CodeOutlined' },
    { name: 'JVM调优', percentage: 75, iconType: 'CodeOutlined' },
    { name: '多线程/并发', percentage: 85, iconType: 'CodeOutlined' },
    { name: '设计模式', percentage: 80, iconType: 'CodeOutlined' },
    { name: '数据结构与算法', percentage: 82, iconType: 'CodeOutlined' }
  ],
  // Spring生态
  spring: [
    { name: 'Spring Framework', percentage: 88, iconType: 'ApiOutlined' },
    { name: 'Spring Boot', percentage: 92, iconType: 'ApiOutlined' },
    { name: 'Spring MVC', percentage: 85, iconType: 'ApiOutlined' },
    { name: 'Spring Security', percentage: 80, iconType: 'ApiOutlined' },
    { name: 'Spring Data JPA', percentage: 82, iconType: 'ApiOutlined' },
    { name: 'Spring Transaction', percentage: 78, iconType: 'ApiOutlined' },
    { name: 'Spring AOP', percentage: 75, iconType: 'ApiOutlined' },
    { name: 'Spring Cache', percentage: 70, iconType: 'ApiOutlined' }
  ],
  // 微服务与分布式
  microservice: [
    { name: 'Spring Cloud', percentage: 75, iconType: 'CloudOutlined' },
    { name: 'Spring Cloud Gateway', percentage: 70, iconType: 'CloudOutlined' },
    { name: 'Spring Cloud Alibaba', percentage: 65, iconType: 'CloudOutlined' },
    { name: 'Nacos', percentage: 68, iconType: 'CloudOutlined' },
    { name: 'Sentinel', percentage: 60, iconType: 'CloudOutlined' },
    { name: 'Dubbo', percentage: 55, iconType: 'CloudOutlined' },
    { name: 'Seata', percentage: 50, iconType: 'CloudOutlined' },
    { name: '分布式事务', percentage: 65, iconType: 'CloudOutlined' }
  ],
  // 关系型数据库
  rdbms: [
    { name: 'MySQL', percentage: 90, iconType: 'DatabaseOutlined' },
    { name: 'PostgreSQL', percentage: 75, iconType: 'DatabaseOutlined' },
    { name: 'Oracle', percentage: 60, iconType: 'DatabaseOutlined' },
    { name: 'SQL Server', percentage: 50, iconType: 'DatabaseOutlined' },
    { name: 'MyBatis', percentage: 88, iconType: 'DatabaseOutlined' },
    { name: 'MyBatis-Plus', percentage: 80, iconType: 'DatabaseOutlined' },
    { name: 'Hibernate', percentage: 65, iconType: 'DatabaseOutlined' },
    { name: 'JPA', percentage: 70, iconType: 'DatabaseOutlined' }
  ],
  // NoSQL数据库
  nosql: [
    { name: 'Redis', percentage: 85, iconType: 'DatabaseOutlined' },
    { name: 'MongoDB', percentage: 60, iconType: 'DatabaseOutlined' },
    { name: 'Elasticsearch', percentage: 65, iconType: 'DatabaseOutlined' },
    { name: 'Solr', percentage: 50, iconType: 'DatabaseOutlined' },
    { name: 'Cassandra', percentage: 40, iconType: 'DatabaseOutlined' },
    { name: 'Neo4j', percentage: 35, iconType: 'DatabaseOutlined' }
  ],
  // 消息队列
  mq: [
    { name: 'RabbitMQ', percentage: 75, iconType: 'ApiOutlined' },
    { name: 'Kafka', percentage: 70, iconType: 'ApiOutlined' },
    { name: 'RocketMQ', percentage: 65, iconType: 'ApiOutlined' },
    { name: 'ActiveMQ', percentage: 55, iconType: 'ApiOutlined' },
    { name: 'Pulsar', percentage: 40, iconType: 'ApiOutlined' }
  ],
  // 缓存与性能
  cache: [
    { name: 'Redis缓存', percentage: 85, iconType: 'DatabaseOutlined' },
    { name: 'Caffeine', percentage: 60, iconType: 'DatabaseOutlined' },
    { name: 'EhCache', percentage: 50, iconType: 'DatabaseOutlined' },
    { name: 'Memcached', percentage: 45, iconType: 'DatabaseOutlined' }
  ],
  // 前端技术
  frontend: [
    { name: 'Vue.js', percentage: 60, iconType: 'CodeOutlined' },
    { name: 'React', percentage: 50, iconType: 'CodeOutlined' },
    { name: 'JavaScript/TypeScript', percentage: 65, iconType: 'CodeOutlined' },
    { name: 'HTML/CSS', percentage: 70, iconType: 'CodeOutlined' },
    { name: 'jQuery', percentage: 55, iconType: 'CodeOutlined' },
    { name: 'Ajax', percentage: 70, iconType: 'CodeOutlined' }
  ],
  // 测试框架
  testing: [
    { name: 'JUnit', percentage: 80, iconType: 'SafetyCertificateOutlined' },
    { name: 'TestNG', percentage: 65, iconType: 'SafetyCertificateOutlined' },
    { name: 'Mockito', percentage: 70, iconType: 'SafetyCertificateOutlined' },
    { name: 'PowerMock', percentage: 55, iconType: 'SafetyCertificateOutlined' },
    { name: 'JMeter', percentage: 60, iconType: 'SafetyCertificateOutlined' },
    { name: 'Postman', percentage: 75, iconType: 'SafetyCertificateOutlined' }
  ],
  // 构建工具
  build: [
    { name: 'Maven', percentage: 85, iconType: 'ToolOutlined' },
    { name: 'Gradle', percentage: 70, iconType: 'ToolOutlined' },
    { name: 'Ant', percentage: 40, iconType: 'ToolOutlined' }
  ],
  // CI/CD与DevOps
  devops: [
    { name: 'Git', percentage: 90, iconType: 'ToolOutlined' },
    { name: 'Jenkins', percentage: 75, iconType: 'ToolOutlined' },
    { name: 'GitLab CI', percentage: 65, iconType: 'ToolOutlined' },
    { name: 'Docker', percentage: 80, iconType: 'CloudOutlined' },
    { name: 'Kubernetes', percentage: 60, iconType: 'CloudOutlined' },
    { name: 'Docker Compose', percentage: 70, iconType: 'CloudOutlined' },
    { name: 'Helm', percentage: 45, iconType: 'CloudOutlined' }
  ],
  // 监控与日志
  monitoring: [
    { name: 'Prometheus', percentage: 60, iconType: 'ToolOutlined' },
    { name: 'Grafana', percentage: 55, iconType: 'ToolOutlined' },
    { name: 'ELK Stack', percentage: 65, iconType: 'ToolOutlined' },
    { name: 'Logback/Log4j', percentage: 80, iconType: 'ToolOutlined' },
    { name: 'SkyWalking', percentage: 50, iconType: 'ToolOutlined' },
    { name: 'Zipkin', percentage: 45, iconType: 'ToolOutlined' }
  ],
  // Web服务器与网关
  webserver: [
    { name: 'Nginx', percentage: 70, iconType: 'ToolOutlined' },
    { name: 'Tomcat', percentage: 85, iconType: 'ToolOutlined' },
    { name: 'Jetty', percentage: 50, iconType: 'ToolOutlined' },
    { name: 'Undertow', percentage: 45, iconType: 'ToolOutlined' },
    { name: 'Apache', percentage: 40, iconType: 'ToolOutlined' }
  ],
  // 开发工具
  tools: [
    { name: 'IntelliJ IDEA', percentage: 95, iconType: 'ToolOutlined' },
    { name: 'Eclipse', percentage: 70, iconType: 'ToolOutlined' },
    { name: 'VS Code', percentage: 65, iconType: 'ToolOutlined' },
    { name: 'Jira', percentage: 70, iconType: 'ToolOutlined' },
    { name: 'Confluence', percentage: 60, iconType: 'ToolOutlined' },
    { name: 'Swagger/OpenAPI', percentage: 75, iconType: 'ToolOutlined' }
  ],
  // 其他框架与工具
  other: [
    { name: 'Netty', percentage: 65, iconType: 'ApiOutlined' },
    { name: 'Quartz', percentage: 70, iconType: 'ToolOutlined' },
    { name: 'XXL-Job', percentage: 60, iconType: 'ToolOutlined' },
    { name: 'Shiro', percentage: 55, iconType: 'SafetyCertificateOutlined' },
    { name: 'JWT', percentage: 75, iconType: 'SafetyCertificateOutlined' },
    { name: 'OAuth2', percentage: 60, iconType: 'SafetyCertificateOutlined' },
    { name: 'WebSocket', percentage: 65, iconType: 'ApiOutlined' },
    { name: 'gRPC', percentage: 50, iconType: 'ApiOutlined' }
  ]
};

// 技能分类配置
export const skillCategories = [
  { key: 'core', title: '核心语言与JVM', icon: <CodeOutlined />, defaultIconType: 'CodeOutlined' },
  { key: 'spring', title: 'Spring生态', icon: <ApiOutlined />, defaultIconType: 'ApiOutlined' },
  { key: 'microservice', title: '微服务与分布式', icon: <CloudOutlined />, defaultIconType: 'CloudOutlined' },
  { key: 'rdbms', title: '关系型数据库', icon: <DatabaseOutlined />, defaultIconType: 'DatabaseOutlined' },
  { key: 'nosql', title: 'NoSQL数据库', icon: <DatabaseOutlined />, defaultIconType: 'DatabaseOutlined' },
  { key: 'mq', title: '消息队列', icon: <ApiOutlined />, defaultIconType: 'ApiOutlined' },
  { key: 'cache', title: '缓存与性能', icon: <DatabaseOutlined />, defaultIconType: 'DatabaseOutlined' },
  { key: 'frontend', title: '前端技术', icon: <CodeOutlined />, defaultIconType: 'CodeOutlined' },
  { key: 'testing', title: '测试框架', icon: <SafetyCertificateOutlined />, defaultIconType: 'SafetyCertificateOutlined' },
  { key: 'build', title: '构建工具', icon: <ToolOutlined />, defaultIconType: 'ToolOutlined' },
  { key: 'devops', title: 'CI/CD与DevOps', icon: <CloudOutlined />, defaultIconType: 'CloudOutlined' },
  { key: 'monitoring', title: '监控与日志', icon: <ToolOutlined />, defaultIconType: 'ToolOutlined' },
  { key: 'webserver', title: 'Web服务器与网关', icon: <ToolOutlined />, defaultIconType: 'ToolOutlined' },
  { key: 'tools', title: '开发工具', icon: <ToolOutlined />, defaultIconType: 'ToolOutlined' },
  { key: 'other', title: '其他框架与工具', icon: <ApiOutlined />, defaultIconType: 'ApiOutlined' }
];

// 熟练度等级数据
export const proficiencyLevels = [
  { 
    level: '入门', 
    color: '#ff7875', 
    range: '0-29%',
    description: '刚接触该技术，了解基本概念和语法，能够阅读简单的代码示例，需要大量文档和帮助才能完成基础任务。'
  },
  { 
    level: '熟悉', 
    color: '#ffa940', 
    range: '30-49%',
    description: '掌握基本语法和常用API，能够独立完成简单的功能开发，理解基本的编程模式和最佳实践，遇到问题会查阅文档解决。'
  },
  { 
    level: '熟练', 
    color: '#52c41a', 
    range: '50-69%',
    description: '能够熟练使用该技术完成中等复杂度的项目，理解核心原理和设计思想，能够解决常见问题，具备一定的代码优化能力。'
  },
  { 
    level: '精通', 
    color: '#1890ff', 
    range: '70-89%',
    description: '深入理解技术原理和底层机制，能够设计和实现复杂系统，具备架构设计能力，能够指导他人，解决疑难问题，有丰富的实战经验。'
  },
  { 
    level: '专家', 
    color: '#722ed1', 
    range: '90-100%',
    description: '对该技术有深入的研究和理解，能够进行技术创新和优化，具备架构设计和技术选型能力，能够解决复杂的技术难题，是该领域的权威专家。'
  }
];

// 默认个人信息
export const defaultPersonalInfo = {
  name: '张三',
  title: '高级Java开发工程师',
  age: '28',
  gender: '男',
  location: '北京市',
  experience: '5年',
  email: 'zhangsan@example.com',
  phone: '+86 138-0000-0000',
  wechat: 'wx_zhangsan',
  github: 'github.com/zhangsan',
  linkedin: 'linkedin.com/in/zhangsan',
  blog: 'blog.example.com',
  website: 'www.example.com',
  address: '北京市朝阳区',
  expectedSalary: '25-35K',
  availability: '随时到岗'
};

// 默认教育信息
export const defaultEducation = [
  {
    id: 1,
    degree: '本科',
    major: '计算机科学与技术',
    school: '清华大学',
    startDate: '2015-09',
    endDate: '2019-06',
    description: '主修课程：数据结构、算法设计、操作系统、计算机网络、数据库系统等。GPA: 3.8/4.0'
  },
  {
    id: 2,
    degree: '硕士',
    major: '软件工程',
    school: '北京大学',
    startDate: '2019-09',
    endDate: '2022-06',
    description: '研究方向：分布式系统、微服务架构。参与多个企业级项目开发，发表论文2篇。'
  }
];

// 默认职业生涯信息
export const defaultCareer = [
  {
    id: 1,
    company: '阿里巴巴集团',
    position: '高级Java开发工程师',
    location: '杭州市',
    startDate: '2022-07',
    endDate: '至今',
    department: '技术部 - 核心业务组',
    description: '负责核心业务系统的架构设计与开发，参与微服务改造项目，优化系统性能，提升用户体验。',
    responsibilities: [
      '负责核心业务模块的设计与开发，使用Spring Cloud微服务架构',
      '优化系统性能，将接口响应时间从500ms降低至150ms',
      '参与技术选型，引入Redis缓存和消息队列提升系统吞吐量',
      '指导初级开发人员，进行代码审查和技术分享'
    ],
    achievements: [
      '主导完成微服务架构改造，系统可用性提升至99.9%',
      '优化数据库查询性能，QPS提升3倍',
      '获得公司年度优秀员工称号'
    ],
    technologies: ['Java', 'Spring Cloud', 'Redis', 'MySQL', 'Kafka', 'Docker']
  },
  {
    id: 2,
    company: '腾讯科技',
    position: 'Java开发工程师',
    location: '深圳市',
    startDate: '2020-03',
    endDate: '2022-06',
    department: '微信事业群 - 支付业务组',
    description: '参与微信支付相关业务系统的开发与维护，负责高并发场景下的系统优化。',
    responsibilities: [
      '参与支付系统的开发与维护，处理日均千万级交易量',
      '优化支付接口性能，支持高并发场景',
      '参与系统重构，提升代码质量和可维护性',
      '负责线上问题排查和故障处理'
    ],
    achievements: [
      '完成支付系统重构，代码覆盖率提升至85%',
      '优化支付流程，支付成功率提升2%',
      '参与技术分享，获得团队认可'
    ],
    technologies: ['Java', 'Spring Boot', 'MyBatis', 'MySQL', 'RabbitMQ', 'Elasticsearch']
  },
  {
    id: 3,
    company: '字节跳动',
    position: 'Java开发工程师（实习）',
    location: '北京市',
    startDate: '2019-07',
    endDate: '2019-09',
    department: '抖音事业部 - 推荐算法组',
    description: '参与推荐系统后端开发，学习大规模分布式系统设计。',
    responsibilities: [
      '参与推荐系统后端API开发',
      '学习分布式系统设计原理',
      '参与代码审查和技术讨论'
    ],
    achievements: [
      '完成推荐接口开发，支持日均百万级请求',
      '学习并实践了分布式系统设计'
    ],
    technologies: ['Java', 'Spring Boot', 'MongoDB', 'Kafka']
  }
];

// 默认项目经验
export const defaultProjects = [
  {
    id: 1,
    name: '电商平台微服务架构改造',
    description: '负责将单体应用拆分为微服务架构，使用Spring Cloud技术栈，提升系统可扩展性和可维护性。',
    role: '技术负责人',
    startDate: '2022-01',
    endDate: '2022-12',
    technologies: ['Java', 'Spring Cloud', 'Docker', 'Kubernetes', 'Redis', 'MySQL'],
    highlights: [
      '系统拆分为15个微服务，服务间通过RESTful API和消息队列通信',
      '引入服务注册与发现、配置中心、网关等组件',
      '系统可用性从99.5%提升至99.9%',
      '支持日均千万级订单处理'
    ],
    link: 'https://github.com/example/ecommerce-platform',
    demo: 'https://demo.example.com'
  },
  {
    id: 2,
    name: '高并发支付系统',
    description: '设计并开发支持高并发的支付系统，处理峰值QPS达到10万+，保证支付成功率99.9%以上。',
    role: '核心开发',
    startDate: '2021-06',
    endDate: '2021-12',
    technologies: ['Java', 'Spring Boot', 'Redis', 'RabbitMQ', 'MySQL', 'Elasticsearch'],
    highlights: [
      '采用分布式锁和消息队列保证数据一致性',
      '实现支付幂等性，防止重复支付',
      '优化数据库查询，响应时间从200ms降至50ms',
      '支持多种支付方式：支付宝、微信、银联'
    ],
    link: '',
    demo: ''
  }
];

// 默认证书/资质
export const defaultCertifications = [
  {
    id: 1,
    name: 'Oracle Certified Professional, Java SE 11 Developer',
    issuer: 'Oracle',
    issueDate: '2021-03',
    expiryDate: '2024-03',
    credentialId: 'OCP-123456',
    description: 'Java SE 11 专业认证，证明在Java开发方面的专业能力。'
  },
  {
    id: 2,
    name: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services',
    issueDate: '2022-06',
    expiryDate: '2025-06',
    credentialId: 'AWS-SA-789012',
    description: 'AWS解决方案架构师认证，掌握云架构设计能力。'
  },
  {
    id: 3,
    name: 'PMP项目管理专业人士认证',
    issuer: 'PMI',
    issueDate: '2020-09',
    expiryDate: '2023-09',
    credentialId: 'PMP-345678',
    description: '项目管理专业人士认证，具备项目管理能力。'
  }
];

// 默认语言能力
export const defaultLanguages = [
  {
    id: 1,
    language: '中文',
    listening: '母语',
    speaking: '母语',
    reading: '母语',
    writing: '母语'
  },
  {
    id: 2,
    language: '英语',
    listening: '熟练',
    speaking: '良好',
    reading: '熟练',
    writing: '良好',
    certificate: 'CET-6'
  },
  {
    id: 3,
    language: '日语',
    listening: '基础',
    speaking: '基础',
    reading: '基础',
    writing: '基础',
    certificate: 'N3'
  }
];

// 默认获奖经历
export const defaultAwards = [
  {
    id: 1,
    name: '公司年度优秀员工',
    issuer: '阿里巴巴集团',
    date: '2022-12',
    level: '公司级',
    description: '在微服务架构改造项目中表现突出，获得年度优秀员工称号。'
  },
  {
    id: 2,
    name: '技术创新奖',
    issuer: '腾讯科技',
    date: '2021-08',
    level: '部门级',
    description: '在支付系统性能优化项目中，提出创新方案，获得技术创新奖。'
  },
  {
    id: 3,
    name: '优秀毕业生',
    issuer: '北京大学',
    date: '2022-06',
    level: '校级',
    description: '研究生期间成绩优异，获得优秀毕业生称号。'
  }
];

// 默认开源贡献
export const defaultOpenSource = [
  {
    id: 1,
    name: 'Spring Cloud Alibaba',
    description: '为Spring Cloud Alibaba项目贡献代码，主要参与Nacos配置中心相关功能开发。',
    link: 'https://github.com/alibaba/spring-cloud-alibaba',
    contributions: [
      '修复Nacos配置刷新bug',
      '优化配置监听机制',
      '添加配置加密功能'
    ],
    stars: 15000,
    role: 'Contributor'
  },
  {
    id: 2,
    name: 'My Personal Tools',
    description: '个人维护的工具库，包含常用的Java工具类和工具方法。',
    link: 'https://github.com/example/my-tools',
    contributions: [
      '维护工具库',
      '添加新功能',
      '修复bug'
    ],
    stars: 120,
    role: 'Owner'
  }
];

// 默认作品集
export const defaultPortfolio = [
  {
    id: 1,
    name: '在线教育平台',
    description: '基于Spring Cloud微服务架构的在线教育平台，支持课程管理、在线学习、考试系统等功能。',
    technologies: ['Java', 'Spring Cloud', 'Vue.js', 'MySQL', 'Redis'],
    link: 'https://github.com/example/edu-platform',
    demo: 'https://demo.example.com/edu',
    screenshot: '',
    category: 'Web应用'
  },
  {
    id: 2,
    name: '分布式任务调度系统',
    description: '基于Quartz和Zookeeper的分布式任务调度系统，支持任务动态添加、监控和管理。',
    technologies: ['Java', 'Quartz', 'Zookeeper', 'Spring Boot'],
    link: 'https://github.com/example/task-scheduler',
    demo: '',
    screenshot: '',
    category: '中间件'
  },
  {
    id: 3,
    name: '个人博客系统',
    description: '使用Spring Boot和Vue.js开发的个人博客系统，支持文章管理、评论、标签等功能。',
    technologies: ['Java', 'Spring Boot', 'Vue.js', 'MySQL'],
    link: 'https://github.com/example/blog',
    demo: 'https://blog.example.com',
    screenshot: '',
    category: 'Web应用'
  }
];

// 默认个人简介
export const defaultSummary = '拥有5年以上Java开发经验，专注于企业级应用开发。擅长Spring生态系统、微服务架构设计和高并发系统优化。具备丰富的项目实战经验，熟悉分布式系统、消息队列、缓存等中间件技术。注重代码质量和团队协作，持续学习新技术，追求技术卓越。';

