import React from "react";
import styled from "styled-components";

// 基础样式组件
const StepTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.75rem;
`;

const InputGroup = styled.div`
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.813rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.375rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const Tip = styled.div`
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  padding: 0.625rem;
  margin-bottom: 1rem;
  font-size: 0.813rem;
  color: #1e40af;
  border-radius: 0.25rem;
`;

const SkillGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SkillCheckbox = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.813rem;
  color: #4b5563;
  user-select: none;
  
  &:hover {
    border-color: #93c5fd;
    color: #2563eb;
    transform: translateY(-1px);
  }

  input {
    display: none;
  }

  ${props => props.checked && `
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
    color: white;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
  `}
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const RadioLabel = styled(SkillCheckbox)``;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.75rem;
`;

const CategoryLabel = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.75rem 0 0.375rem 0;
  
  &:first-of-type {
    margin-top: 0;
  }

  &::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 3px;
    background-color: #93c5fd;
    border-radius: 50%;
    margin-right: 0.375rem;
  }

  &::after {
    content: '';
    display: inline-block;
    height: 1px;
    flex-grow: 1;
    background: linear-gradient(to right, #e5e7eb 50%, transparent);
    margin-left: 0.5rem;
  }
`;

const NumberInput = styled.div`
  position: relative;
  width: 120px;

  input {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: all 0.2s;
    appearance: none;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }

  &::after {
    content: '年';
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const SalaryOption = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.813rem;
  color: #4b5563;
  background: white;
  user-select: none;
  width: 100%;
  
  input {
    display: none;
  }

  ${props => props.checked && `
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
    color: white;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.1);
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const SalaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StartupExperience = ({ formData, handleChange }) => {
  const industryOptions = [
    {
      category: "技术",
      options: [
        "人工智能",
        "区块链",
        "云计算",
        "物联网",
        "机器人",
        "元宇宙",
        "Web3",
        "量子计算"
      ]
    },
    {
      category: "企服",
      options: [
        "SaaS服务",
        "企业软件",
        "数据服务",
        "协同办公",
        "网络安全",
        "DevOps",
        "API服务"
      ]
    },
    {
      category: "消费",
      options: [
        "电子商务",
        "社交平台",
        "短视频",
        "在线教育",
        "生活服务",
        "内容创作",
        "游戏娱乐"
      ]
    },
    {
      category: "前沿",
      options: [
        "新能源",
        "智能制造",
        "生物科技",
        "医疗健康",
        "智慧城市",
        "绿色科技",
        "航空航天"
      ]
    },
    {
      category: "产业",
      options: [
        "金融科技",
        "教育科技",
        "地产科技",
        "零售科技",
        "农业科技",
        "文化创意",
        "体育科技"
      ]
    }
  ];

  const roleOptions = [
    {
      category: "技术",
      options: [
        "技术负责人",
        "架构师",
        "前端开发",
        "后端开发",
        "全栈开发",
        "移动开发",
        "算法工程师",
        "DevOps",
        "测试开发",
        "安全工程师",
        "数据工程师"
      ]
    },
    {
      category: "产品",
      options: [
        "产品负责人",
        "产品经理",
        "产品运营",
        "数据分析",
        "用户研究",
        "项目经理",
        "业务分析",
        "产品策划"
      ]
    },
    {
      category: "设计",
      options: [
        "UI设计师",
        "UX设计师",
        "交互设计师",
        "视觉设计师",
        "平面设计师",
        "品牌设计师",
        "3D设计师",
        "动效设计师"
      ]
    },
    {
      category: "运营",
      options: [
        "运营总监",
        "内容运营",
        "用户运营",
        "活动运营",
        "社区运营",
        "新媒体运营",
        "电商运营",
        "增长运营",
        "数据运营"
      ]
    },
    {
      category: "市场",
      options: [
        "市场总监",
        "品牌营销",
        "渠道拓展",
        "商务合作",
        "公关策划",
        "销售",
        "市场策划",
        "广告投放"
      ]
    },
    {
      category: "人力",
      options: [
        "HR总监",
        "招聘专员",
        "人才发展",
        "培训经理",
        "绩效管理",
        "员工关系",
        "薪酬福利"
      ]
    },
    {
      category: "财务",
      options: [
        "财务总监",
        "财务经理",
        "会计",
        "出纳",
        "税务专员",
        "审计专员",
        "风控"
      ]
    },
    {
      category: "法务",
      options: [
        "法务总监",
        "法务经理",
        "合规专员",
        "知识产权",
        "合同管理",
        "律师"
      ]
    },
    {
      category: "行政",
      options: [
        "行政总监",
        "行政经理",
        "前台",
        "文秘",
        "采购",
        "资产管理",
        "商务助理"
      ]
    }
  ];

  const handleRoleChange = (role) => {
    const currentRoles = formData.preferredRoles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    handleChange({
      target: {
        name: 'preferredRoles',
        value: newRoles
      }
    });
  };

  return (
    <>
      <StepTitle>创业经历</StepTitle>
      
      <Tip>
        详细的创业经历有助于我们更好地了解您的背景和专长。
      </Tip>

      <Card>
        <InputGroup>
          <FormLabel>创业项目经历</FormLabel>
          <TextArea
            name="startupExperience"
            value={formData.startupExperience}
            onChange={handleChange}
            placeholder="请简要描述：项目名称、角色、职责、成果..."
            rows={3}
          />
        </InputGroup>

        <InputGroup>
          <FormLabel>感兴趣的创业领域</FormLabel>
          {industryOptions.map(category => (
            <div key={category.category}>
              <CategoryLabel>{category.category}</CategoryLabel>
              <SkillGrid>
                {category.options.map(option => (
                  <SkillCheckbox 
                    key={option}
                    checked={formData.interestedIndustries?.includes(option)}
                  >
                    <input
                      type="checkbox"
                      name="interestedIndustries"
                      value={option}
                      checked={formData.interestedIndustries?.includes(option)}
                      onChange={handleChange}
                    />
                    {option}
                  </SkillCheckbox>
                ))}
              </SkillGrid>
            </div>
          ))}
        </InputGroup>
      </Card>

      <Card>
        <TwoColumnGrid>
          <InputGroup>
            <FormLabel>工作经验</FormLabel>
            <NumberInput>
              <input
                type="number"
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                min="0"
                max="50"
                placeholder="0"
              />
            </NumberInput>
          </InputGroup>

          <InputGroup>
            <FormLabel>工作节奏偏好</FormLabel>
            <RadioGroup>
              {["全职", "兼职", "灵活"].map(option => (
                <RadioLabel 
                  key={option}
                  checked={formData.workPreference === option}
                >
                  <input
                    type="radio"
                    name="workPreference"
                    value={option}
                    checked={formData.workPreference === option}
                    onChange={handleChange}
                  />
                  {option}
                </RadioLabel>
              ))}
            </RadioGroup>
          </InputGroup>
        </TwoColumnGrid>

        <InputGroup>
          <FormLabel>期望担任的角色</FormLabel>
          {roleOptions.map(category => (
            <div key={category.category}>
              <CategoryLabel>{category.category}</CategoryLabel>
              <SkillGrid>
                {category.options.map(role => (
                  <SkillCheckbox 
                    key={role}
                    checked={formData.preferredRoles?.includes(role)}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRoleChange(role);
                    }}
                  >
                    {role}
                  </SkillCheckbox>
                ))}
              </SkillGrid>
            </div>
          ))}
        </InputGroup>

        <InputGroup>
          <FormLabel>期望月收入范围</FormLabel>
          <SalaryGrid>
            {[
              "10k以下",
              "10k-20k",
              "20k-30k",
              "30k-50k",
              "50k+"
            ].map(option => (
              <SalaryOption 
                key={option}
                checked={formData.expectedSalary === option}
              >
                <input
                  type="radio"
                  name="expectedSalary"
                  value={option}
                  checked={formData.expectedSalary === option}
                  onChange={handleChange}
                />
                {option}
              </SalaryOption>
            ))}
          </SalaryGrid>
        </InputGroup>
      </Card>
    </>
  );
};

export default StartupExperience; 