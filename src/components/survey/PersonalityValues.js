import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const Container = styled.div`
  padding: 0.25rem;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: ${props => props.theme.mode === 'dark' ? '#1F2937' : 'white'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SectionHeading = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#F9FAFB' : '#1F2937'};
`;

const DimensionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#F9FAFB' : '#1F2937'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: #3B82F6;
    font-size: 0.75rem;
  }
`;

const MBTIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const MBTIOption = styled(motion.button)`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.isSelected ? '#3B82F6' : props.theme.mode === 'dark' ? '#4B5563' : '#E5E7EB'};
  border-radius: 0.5rem;
  background: ${props => props.isSelected 
    ? props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF'
    : props.theme.mode === 'dark' ? '#374151' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  ${props => props.isSelected && `
    box-shadow: 0 0 0 1px ${props.theme.mode === 'dark' ? '#1F2937' : 'white'},
                0 0 0 2px rgba(59, 130, 246, 0.3);
  `}

  &:hover {
    transform: translateY(-1px);
    border-color: #3B82F6;
  }
`;

const OptionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.isSelected ? '#3B82F6' : props.theme.mode === 'dark' ? '#F9FAFB' : '#1F2937'};
  margin-bottom: 0.125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    font-size: 0.75rem;
    opacity: 0.7;
  }
`;

const OptionDescription = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.mode === 'dark' ? '#D1D5DB' : '#6B7280'};
  line-height: 1.3;
`;

const ResultBox = styled(motion.div)`
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1rem;
  border: 1px solid #93C5FD;
`;

const ResultType = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E40AF;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ResultDescription = styled.div`
  color: #1E40AF;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const DetailsList = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.5);
  padding: 0.75rem;
  border-radius: 8px;
`;

const DetailTitle = styled.div`
  font-weight: 600;
  color: #1E40AF;
  font-size: 0.875rem;
  margin-bottom: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    font-size: 0.875rem;
  }
`;

const DetailContent = styled.div`
  color: #3B82F6;
  font-size: 0.75rem;
  line-height: 1.5;
`;

const ValueTagsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ValueTag = styled(motion.button)`
  position: relative;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  text-align: center;
  transition: all 0.2s;
  background: ${props => props.isSelected 
    ? props.theme.mode === 'dark' 
      ? 'rgba(59, 130, 246, 0.1)'
      : '#EFF6FF'
    : 'transparent'
  };
  color: ${props => props.isSelected 
    ? '#3B82F6'
    : props.theme.mode === 'dark' 
      ? '#D1D5DB'
      : '#4B5563'
  };
  border: 1px solid ${props => props.isSelected 
    ? '#3B82F6' 
    : props.theme.mode === 'dark' 
      ? '#4B5563' 
      : '#E5E7EB'
  };
  
  &:hover {
    border-color: #3B82F6;
    transform: translateY(-1px);
    background: ${props => props.isSelected 
      ? props.theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.15)'
        : '#EFF6FF'
      : props.theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.05)'
        : 'rgba(59, 130, 246, 0.05)'
    };
  }

  ${props => props.isSelected && `
    &::after {
      content: '✓';
      position: absolute;
      top: -0.5rem;
      right: -0.5rem;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      border: 2px solid ${props.theme.mode === 'dark' ? '#1F2937' : 'white'};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    &:hover {
      border-color: ${props => props.theme.mode === 'dark' ? '#4B5563' : '#E5E7EB'};
      transform: none;
      background: transparent;
    }
  }
`;

const ValueDescription = styled.p`
  font-size: 0.75rem;
  color: ${props => props.isSelected 
    ? props.theme.mode === 'dark'
      ? '#93C5FD'
      : '#3B82F6'
    : props.theme.mode === 'dark'
      ? '#9CA3AF'
      : '#6B7280'
  };
  margin-top: 0.25rem;
  transition: color 0.2s;
`;

const SelectedValuesCount = styled.span`
  font-size: 0.75rem;
  color: ${props => props.isMax ? '#EF4444' : '#3B82F6'};
  margin-left: 0.5rem;
`;

const StressResponseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StressOption = styled(motion.button)`
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: left;
  transition: all 0.2s;
  border: 1px solid ${props => props.isSelected ? '#3B82F6' : props.theme.mode === 'dark' ? '#4B5563' : '#E5E7EB'};
  background: ${props => props.isSelected 
    ? props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF'
    : props.theme.mode === 'dark' ? '#374151' : 'white'};
`;

const PersonalityValues = ({ formData, handleChange }) => {
  const mbtiOptions = [
    {
      dimension: 'EI',
      options: [
        { value: 'E', title: '外向 (E)', desc: '从外部世界获取能量，喜欢社交互动' },
        { value: 'I', title: '内向 (I)', desc: '从内心世界获取能量，需要独处时间' }
      ]
    },
    {
      dimension: 'SN',
      options: [
        { value: 'S', title: '感觉 (S)', desc: '关注具体事实和细节，相信经验' },
        { value: 'N', title: '直觉 (N)', desc: '关注可能性和创意，相信直觉' }
      ]
    },
    {
      dimension: 'TF',
      options: [
        { value: 'T', title: '思维 (T)', desc: '基于逻辑和客观标准做决定' },
        { value: 'F', title: '情感 (F)', desc: '基于价值观和他人感受做决定' }
      ]
    },
    {
      dimension: 'JP',
      options: [
        { value: 'J', title: '判断 (J)', desc: '喜欢计划和确定性，追求完成' },
        { value: 'P', title: '知觉 (P)', desc: '喜欢灵活和自发性，保持开放' }
      ]
    }
  ];

  const getMBTIType = () => {
    const { mbtiE, mbtiS, mbtiT, mbtiJ } = formData;
    if (!mbtiE || !mbtiS || !mbtiT || !mbtiJ) return '';
    
    return (
      (mbtiE === 'true' ? 'E' : 'I') +
      (mbtiS === 'true' ? 'S' : 'N') +
      (mbtiT === 'true' ? 'T' : 'F') +
      (mbtiJ === 'true' ? 'J' : 'P')
    );
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      'INTJ': '建筑师 - 富有想象力和战略性的思考者',
      'INTP': '逻辑学家 - 富有创新精神的发明家',
      'ENTJ': '指挥官 - 大胆、富有想象力的领导者',
      'ENTP': '辩论家 - 聪明好奇的思想家',
      'INFJ': '提倡者 - 安静而神秘的理想主义者',
      'INFP': '调停者 - 诗意而善良的理想主义者',
      'ENFJ': '主人公 - 富有魅力和鼓舞人心的领导者',
      'ENFP': '竞选者 - 热情、创造性和社交能手',
      'ISTJ': '物流师 - 实际和注重事实的个人',
      'ISFJ': '守卫者 - 非常专注和温暖的守护者',
      'ESTJ': '总经理 - 出色的管理者',
      'ESFJ': '执政官 - 极具同情心的管理者',
      'ISTP': '鉴赏家 - 大胆而实际的实验家',
      'ISFP': '探险家 - 灵活和富有魅力的艺术家',
      'ESTP': '企业家 - 聪明、精力充沛的感知者',
      'ESFP': '表演者 - 自发的、精力充沛的表演者'
    };
    return descriptions[type] || '';
  };

  const getTypeDetails = (type) => {
    const details = {
      'INTJ': {
        strengths: [
          "战略性思维",
          "独立性强",
          "创新能力",
          "分析能力出色",
          "追求完美"
        ],
        workStyle: [
          "偏好独立工作",
          "注重效率",
          "善于规划",
          "重视逻辑和系统",
          "追求持续改进"
        ],
        teamRole: [
          "战略规划者",
          "问题解决者",
          "系统架构师",
          "创新推动者"
        ],
        growthAreas: [
          "增强情感表达",
          "提升团队协作",
          "培养耐心",
          "接受不完美"
        ],
        careerPaths: [
          "技术架构师",
          "战略顾问",
          "数据科学家",
          "研究员",
          "项目经理"
        ]
      },
      'INTP': {
        strengths: [
          "逻辑思维强",
          "创新能力",
          "解决复杂问题",
          "适应力强",
          "追求知识"
        ],
        workStyle: [
          "独立思考",
          "灵活机动",
          "注重理论",
          "探索可能性",
          "重视自主"
        ],
        teamRole: [
          "创新者",
          "分析专家",
          "知识贡献者",
          "问题解决者"
        ],
        growthAreas: [
          "提高执行力",
          "加强沟通",
          "注意细节",
          "时间管理"
        ],
        careerPaths: [
          "软件工程师",
          "研究员",
          "数据分析师",
          "系统设计师",
          "技术作家"
        ]
      },
      'ENTJ': {
        strengths: [
          "领导能力强",
          "决策果断",
          "组织能力强",
          "战略思维",
          "追求效率"
        ],
        workStyle: [
          "目标导向",
          "高效执行",
          "善于委派",
          "注重结果",
          "追求卓越"
        ],
        teamRole: [
          "团队领导者",
          "战略制定者",
          "变革推动者",
          "决策者"
        ],
        growthAreas: [
          "提高同理心",
          "倾听他人",
          "情感管理",
          "耐心培养"
        ],
        careerPaths: [
          "企业高管",
          "创业者",
          "管理咨询",
          "项目总监",
          "商业策略师"
        ]
      },
      'ENTP': {
        strengths: [
          "创新思维",
          "适应力强",
          "解决问题",
          "思维敏捷",
          "善于辩论"
        ],
        workStyle: [
          "灵活多变",
          "创意导向",
          "挑战常规",
          "探索新机会",
          "重视自由"
        ],
        teamRole: [
          "创新者",
          "思想领袖",
          "变革推动者",
          "问题解决者"
        ],
        growthAreas: [
          "提高执行力",
          "加强细节关注",
          "完成项目",
          "情感管理"
        ],
        careerPaths: [
          "创业者",
          "创新顾问",
          "产品经理",
          "市场策略师",
          "商业开发"
        ]
      },
      'INFJ': {
        strengths: [
          "洞察力强",
          "同理心强",
          "创造力强",
          "组织能力好",
          "追求意义"
        ],
        workStyle: [
          "注重和谐",
          "追求完美",
          "重视意义",
          "关注长远",
          "善于倾听"
        ],
        teamRole: [
          "和谐促进者",
          "愿景规划者",
          "团队辅导者",
          "创意贡献者"
        ],
        growthAreas: [
          "接受批评",
          "设立界限",
          "决策果断",
          "降低期望"
        ],
        careerPaths: [
          "人力资源",
          "职业顾问",
          "作家编辑",
          "心理咨询师",
          "培训师"
        ]
      },
      'INFP': {
        strengths: [
          "创造力强",
          "同理心强",
          "适应力强",
          "价值观坚定",
          "追求理想"
        ],
        workStyle: [
          "独立工作",
          "富有创意",
          "关注价值",
          "追求理想",
          "重视真实"
        ],
        teamRole: [
          "创意者",
          "价值观守护者",
          "和谐促进者",
          "个性化辅导者"
        ],
        growthAreas: [
          "提高执行力",
          "接受现实",
          "时间管理",
          "处理冲突"
        ],
        careerPaths: [
          "作家",
          "艺术家",
          "心理咨询师",
          "培训师",
          "设计师"
        ]
      },
      'ENFJ': {
        strengths: [
          "领导能力强",
          "沟通能力强",
          "同理心强",
          "组织能力好",
          "激励他人"
        ],
        workStyle: [
          "团队合作",
          "关注成长",
          "追求和谐",
          "善于激励",
          "重视发展"
        ],
        teamRole: [
          "团队领导者",
          "教练导师",
          "激励者",
          "和谐促进者"
        ],
        growthAreas: [
          "自我关注",
          "设立界限",
          "处理批评",
          "决策客观"
        ],
        careerPaths: [
          "培训讲师",
          "人力资源",
          "市场营销",
          "教育工作者",
          "公关顾问"
        ]
      },
      'ENFP': {
        strengths: [
          "创造力强",
          "热情洋溢",
          "适应力强",
          "人际关系好",
          "激发创新"
        ],
        workStyle: [
          "灵活多变",
          "充满热情",
          "关注可能",
          "激发创意",
          "追求新意"
        ],
        teamRole: [
          "创意激发者",
          "团队活力源",
          "变革推动者",
          "人际关系者"
        ],
        growthAreas: [
          "提高专注度",
          "完成细节",
          "时间管理",
          "坚持目标"
        ],
        careerPaths: [
          "创意总监",
          "市场营销",
          "公关顾问",
          "创业者",
          "培训讲师"
        ]
      },
      'ISTJ': {
        strengths: [
          "责任心强",
          "组织能力强",
          "注重细节",
          "可靠稳重",
          "逻辑思维"
        ],
        workStyle: [
          "系统化工作",
          "注重规范",
          "重视传统",
          "追求稳定",
          "关注细节"
        ],
        teamRole: [
          "执行者",
          "规范维护者",
          "质量把控者",
          "流程优化者"
        ],
        growthAreas: [
          "提高灵活性",
          "接受变化",
          "创新思维",
          "表达情感"
        ],
        careerPaths: [
          "财务管理",
          "项目管理",
          "质量管理",
          "运营管理",
          "行政管理"
        ]
      },
      'ISFJ': {
        strengths: [
          "责任心强",
          "关注细节",
          "乐于助人",
          "忠诚可靠",
          "有耐心"
        ],
        workStyle: [
          "井然有序",
          "注重实践",
          "关注他人",
          "追求稳定",
          "乐于服务"
        ],
        teamRole: [
          "支持者",
          "维护者",
          "协调者",
          "服务者"
        ],
        growthAreas: [
          "表达需求",
          "接受变化",
          "设立界限",
          "创新思维"
        ],
        careerPaths: [
          "行政助理",
          "人力资源",
          "客户服务",
          "医护工作",
          "教育工作"
        ]
      },
      'ESTJ': {
        strengths: [
          "组织能力强",
          "执行力强",
          "责任心强",
          "决策果断",
          "重视效率"
        ],
        workStyle: [
          "系统管理",
          "注重效率",
          "遵循规范",
          "目标导向",
          "重视结构"
        ],
        teamRole: [
          "管理者",
          "执行者",
          "决策者",
          "规范制定者"
        ],
        growthAreas: [
          "提高灵活性",
          "倾听他人",
          "情感管理",
          "接受新ideas"
        ],
        careerPaths: [
          "项目经理",
          "运营总监",
          "财务主管",
          "行政管理",
          "销售经理"
        ]
      },
      'ESFJ': {
        strengths: [
          "人际关系好",
          "组织能力强",
          "责任心强",
          "关注细节",
          "乐于助人"
        ],
        workStyle: [
          "团队合作",
          "注重和谐",
          "按部就班",
          "重视传统",
          "服务导向"
        ],
        teamRole: [
          "团队协调者",
          "关系维护者",
          "服务提供者",
          "支持者"
        ],
        growthAreas: [
          "独立决策",
          "处理冲突",
          "接受变化",
          "创新思维"
        ],
        careerPaths: [
          "人力资源",
          "客户服务",
          "市场营销",
          "行政管理",
          "社区管理"
        ]
      },
      'ISTP': {
        strengths: [
          "实践能力强",
          "问题解决力强",
          "灵活机动",
          "冷静理性",
          "动手能力强"
        ],
        workStyle: [
          "独立工作",
          "注重效率",
          "灵活应变",
          "关注实践",
          "重视逻辑"
        ],
        teamRole: [
          "技术专家",
          "问题解决者",
          "危机处理者",
          "实践者"
        ],
        growthAreas: [
          "长期规划",
          "情感表达",
          "人际交往",
          "遵循规范"
        ],
        careerPaths: [
          "技术专家",
          "工程师",
          "数据分析师",
          "系统管理员",
          "技术支持"
        ]
      },
      'ISFP': {
        strengths: [
          "艺术感知力",
          "适应力强",
          "同理心强",
          "观察力强",
          "实践能力强"
        ],
        workStyle: [
          "灵活自由",
          "注重体验",
          "关注当下",
          "重视价值",
          "追求和谐"
        ],
        teamRole: [
          "创意贡献者",
          "和谐促进者",
          "实践者",
          "支持者"
        ],
        growthAreas: [
          "长期规划",
          "决策果断",
          "表达主见",
          "时间管理"
        ],
        careerPaths: [
          "设计师",
          "艺术家",
          "摄影师",
          "室内设计师",
          "手工艺人"
        ]
      },
      'ESTP': {
        strengths: [
          "行动力强",
          "适应力强",
          "解决问题",
          "谈判能力强",
          "现实主义"
        ],
        workStyle: [
          "灵活机动",
          "注重实效",
          "善于应变",
          "关注当下",
          "追求刺激"
        ],
        teamRole: [
          "行动者",
          "谈判者",
          "问题解决者",
          "资源整合者"
        ],
        growthAreas: [
          "长期规划",
          "细节关注",
          "情感管理",
          "耐心等待"
        ],
        careerPaths: [
          "销售经理",
          "创业者",
          "项目经理",
          "危机处理",
          "运动教练"
        ]
      },
      'ESFP': {
        strengths: [
          "人际关系好",
          "适应力强",
          "表现力强",
          "实践能力强",
          "乐观积极"
        ],
        workStyle: [
          "团队合作",
          "注重氛围",
          "灵活多变",
          "关注体验",
          "享受当下"
        ],
        teamRole: [
          "活力带动者",
          "团队协调者",
          "实践者",
          "氛围营造者"
        ],
        growthAreas: [
          "长期规划",
          "专注力",
          "决策果断",
          "时间管理"
        ],
        careerPaths: [
          "市场营销",
          "公关顾问",
          "活动策划",
          "销售代表",
          "表演艺术"
        ]
      }
    };
    
    return details[type] || {
      strengths: ["暂无详细信息"],
      workStyle: ["暂无详细信息"],
      teamRole: ["暂无详细信息"],
      growthAreas: ["暂无详细信息"],
      careerPaths: ["暂无详细信息"]
    };
  };

  const currentType = getMBTIType();

  const coreValues = [
    {
      value: "创新",
      description: "追求新思路和创造性解决方案"
    },
    {
      value: "诚信",
      description: "保持高度的职业道德和诚实可信"
    },
    {
      value: "团队合作",
      description: "重视协作和集体智慧"
    },
    {
      value: "追求卓越",
      description: "始终追求最高标准的工作质量"
    },
    {
      value: "开放包容",
      description: "接纳不同观点和多元化思维"
    },
    {
      value: "持续学习",
      description: "保持学习热情和成长意愿"
    },
    {
      value: "责任担当",
      description: "勇于承担责任和面对挑战"
    },
    {
      value: "客户导向",
      description: "以客户需求为中心思考和行动"
    },
    {
      value: "工作生活平衡",
      description: "追求健康和可持续的工作方式"
    },
    {
      value: "激情",
      description: "保持对工作的热爱和积极态度"
    }
  ];

  const MAX_VALUES = 5;
  const selectedCount = formData.coreValues?.length || 0;

  const stressResponses = [
    {
      id: "problem_solving",
      title: "问题解决型",
      description: "遇到压力时，倾向于直面问题并寻找解决方案"
    },
    {
      id: "support_seeking",
      title: "寻求支持型",
      description: "在压力下会寻求他人建议和帮助"
    },
    {
      id: "self_reflection",
      title: "自我反思型",
      description: "通过独处和思考来应对压力"
    },
    {
      id: "action_oriented",
      title: "行动导向型",
      description: "通过具体行动和计划来缓解压力"
    }
  ];

  return (
    <Container>
      <Title>性格与价值观</Title>

      <Section>
        <SectionTitle>
          <span>🧠</span>
          <SectionHeading>MBTI 性格类型</SectionHeading>
        </SectionTitle>
        
        {mbtiOptions.map(({ dimension, options }) => (
          <div key={dimension}>
            <DimensionTitle>
              {dimension === 'EI' && '能量来源'}
              {dimension === 'SN' && '信息获取'}
              {dimension === 'TF' && '决策方式'}
              {dimension === 'JP' && '生活方式'}
              <span>({dimension})</span>
            </DimensionTitle>
            <MBTIGrid>
              {options.map((option) => (
                <MBTIOption
                  key={option.value}
                  isSelected={formData[`mbti${dimension[0]}`] === (option.value === dimension[0]).toString()}
                  onClick={() => handleChange({
                    target: {
                      name: `mbti${dimension[0]}`,
                      value: (option.value === dimension[0]).toString()
                    }
                  })}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <OptionTitle isSelected={formData[`mbti${dimension[0]}`] === (option.value === dimension[0]).toString()}>
                    {option.value}
                    <span>({option.title})</span>
                  </OptionTitle>
                  <OptionDescription>{option.desc}</OptionDescription>
                </MBTIOption>
              ))}
            </MBTIGrid>
          </div>
        ))}

        {currentType && (
          <ResultBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultType>
              <span>{currentType}</span>
              <span style={{ fontSize: '1rem', color: '#3B82F6' }}>
                {getTypeDescription(currentType)}
              </span>
            </ResultType>
            
            <DetailsList>
              <DetailItem>
                <DetailTitle>
                  <i className="bi bi-star"></i>
                  性格优势
                </DetailTitle>
                <DetailContent>
                  {getTypeDetails(currentType).strengths.map((strength, index) => (
                    <span key={index} style={{ marginRight: '0.75rem' }}>
                      • {strength}
                    </span>
                  ))}
                </DetailContent>
              </DetailItem>

              <DetailItem>
                <DetailTitle>
                  <i className="bi bi-gear"></i>
                  工作风格
                </DetailTitle>
                <DetailContent>
                  {getTypeDetails(currentType).workStyle.map((style, index) => (
                    <span key={index} style={{ marginRight: '0.75rem' }}>
                      • {style}
                    </span>
                  ))}
                </DetailContent>
              </DetailItem>

              <DetailItem>
                <DetailTitle>
                  <i className="bi bi-people"></i>
                  团队角色
                </DetailTitle>
                <DetailContent>
                  {getTypeDetails(currentType).teamRole.map((role, index) => (
                    <span key={index} style={{ marginRight: '0.75rem' }}>
                      • {role}
                    </span>
                  ))}
                </DetailContent>
              </DetailItem>

              <DetailItem>
                <DetailTitle>
                  <i className="bi bi-arrow-up-circle"></i>
                  成长方向
                </DetailTitle>
                <DetailContent>
                  {getTypeDetails(currentType).growthAreas.map((area, index) => (
                    <span key={index} style={{ marginRight: '0.75rem' }}>
                      • {area}
                    </span>
                  ))}
                </DetailContent>
              </DetailItem>

              <DetailItem>
                <DetailTitle>
                  <i className="bi bi-briefcase"></i>
                  适合的职业方向
                </DetailTitle>
                <DetailContent>
                  {getTypeDetails(currentType).careerPaths.map((path, index) => (
                    <span key={index} style={{ marginRight: '0.75rem' }}>
                      • {path}
                    </span>
                  ))}
                </DetailContent>
              </DetailItem>
            </DetailsList>
          </ResultBox>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <span>💎</span>
          <SectionHeading>
            核心价值观
            <SelectedValuesCount isMax={selectedCount >= MAX_VALUES}>
              ({selectedCount}/{MAX_VALUES})
            </SelectedValuesCount>
          </SectionHeading>
        </SectionTitle>
        
        <ValueDescription>
          请选择最能代表你的{MAX_VALUES}个核心价值观，这些价值观将帮助我们更好地了解你的工作理念。
        </ValueDescription>

        <ValueTagsContainer>
          {coreValues.map(({ value, description }) => (
            <ValueTag
              key={value}
              isSelected={formData.coreValues?.includes(value)}
              onClick={() => {
                if (!formData.coreValues?.includes(value) && selectedCount >= MAX_VALUES) {
                  return;
                }
                handleChange({
                  target: {
                    name: 'coreValues',
                    value: value,
                    type: 'checkbox',
                    checked: !formData.coreValues?.includes(value)
                  }
                });
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={!formData.coreValues?.includes(value) && selectedCount >= MAX_VALUES}
              title={description}
            >
              {value}
              <ValueDescription>{description}</ValueDescription>
            </ValueTag>
          ))}
        </ValueTagsContainer>
      </Section>

      <Section>
        <SectionTitle>
          <span>🎯</span>
          <SectionHeading>压力应对方式</SectionHeading>
        </SectionTitle>
        <StressResponseGrid>
          {stressResponses.map(response => (
            <StressOption
              key={response.id}
              isSelected={formData.stressResponse === response.id}
              onClick={() => handleChange({
                target: {
                  name: 'stressResponse',
                  value: response.id
                }
              })}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <OptionTitle isSelected={formData.stressResponse === response.id}>
                {response.title}
              </OptionTitle>
              <OptionDescription>
                {response.description}
              </OptionDescription>
            </StressOption>
          ))}
        </StressResponseGrid>
      </Section>
    </Container>
  );
};

export default PersonalityValues; 