import React, { useState } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import { SectionHeading } from "components/misc/Headings.js";
import { PrimaryButton } from "components/misc/Buttons.js";
import { motion } from "framer-motion";

// 导入新组件
import BasicInfo from "components/survey/BasicInfo";
import PersonalityValues from "components/survey/PersonalityValues";
import StartupExperience from "components/survey/StartupExperience";
import TechnicalSkills from "components/survey/TechnicalSkills";
import WorkPreferences from "components/survey/WorkPreferences";
import CareerGoals from "components/survey/CareerGoals";
import OtherInfo from "components/survey/OtherInfo";

// 样式组件定义
const Container = tw.div`min-h-screen bg-gray-100`;
const Content = tw.div`max-w-screen-xl mx-auto pt-20 pb-12 lg:pt-24 lg:pb-16`;
const HeadingRow = tw.div`flex flex-col items-center mb-8`;
const Heading = tw(SectionHeading)`text-3xl sm:text-4xl font-black tracking-wide text-center`;
const Description = tw.p`mt-2 text-sm md:text-base font-medium text-gray-600 text-center max-w-lg`;

const FormContainer = tw.div`w-full max-w-2xl mx-auto mt-8`;
const Form = tw.form`bg-white rounded-lg shadow-sm p-4 sm:p-6`;
const ButtonContainer = tw.div`
  flex justify-between items-center 
  mt-8 px-4
`;

const NavButton = styled.button`
  ${tw`
    flex items-center justify-center
    px-6 py-2
    font-medium text-sm
    rounded-lg
    transition-all duration-300
    focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
  `}
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    color: white;
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  ` : `
    background: ${props.theme.mode === 'dark' ? '#374151' : 'white'};
    color: ${props.theme.mode === 'dark' ? '#D1D5DB' : '#4B5563'};
    border: 1px solid ${props.theme.mode === 'dark' ? '#4B5563' : '#E5E7EB'};
    &:hover:not(:disabled) {
      border-color: #3B82F6;
      color: #3B82F6;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}
`;

const ButtonIcon = styled.span`
  ${tw`inline-flex items-center`}
  ${props => props.position === 'left' ? tw`mr-2` : tw`ml-2`}
`;

const ProgressBar = tw.div`w-full h-1 bg-gray-200 rounded-full mb-6`;
const ProgressIndicator = styled(motion.div)`
  ${tw`h-full bg-primary-500 rounded-full`}
`;

export default () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // 基本信息
    name: "",
    age: "",
    gender: "",
    contact: "",
    education: "",
    employmentStatus: "",
    
    // 创业经历
    startupExperience: "",
    workExperience: "",
    workPreference: "",
    
    // 性格与价值观
    mbtiType: "",
    enneagramType: "",
    coreValues: [],
    stressResponse: "",
    
    // 技术能力
    programmingLanguages: "",
    frameworks: "",
    databases: "",
    cloudPlatforms: "",
    
    // ... 其他字段 ...
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? 
        (checked ? 
          [...(prev[name] || []), value] : 
          (prev[name] || []).filter(item => item !== value)
        ) : 
        value
    }));
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfo formData={formData} handleChange={handleChange} errors={errors} />;
      case 2:
        return <PersonalityValues formData={formData} handleChange={handleChange} />;
      case 3:
        return <StartupExperience formData={formData} handleChange={handleChange} />;
      case 4:
        return <TechnicalSkills formData={formData} handleChange={handleChange} />;
      case 5:
        return <WorkPreferences formData={formData} handleChange={handleChange} />;
      case 6:
        return <CareerGoals formData={formData} handleChange={handleChange} />;
      case 7:
        return <OtherInfo formData={formData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/partner-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("调查问卷提交成功！");
        setCurrentStep(1);
        setFormData({});
      }
    } catch (error) {
      console.error("提交失败：", error);
      alert("提交失败，请稍后重试");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const isLastStep = currentStep === 7;
  const isStepValid = true; // Assuming all steps are valid for now

  return (
    <Container>
      <Header />
      <Content>
        <HeadingRow>
          <Heading>合作伙伴信息收集</Heading>
          <Description>
            帮助我们更好地了解您，为您安排合适的工作内容
          </Description>
        </HeadingRow>

        <FormContainer>
          <ProgressBar>
            <ProgressIndicator
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / 7) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </ProgressBar>
          
          <Form onSubmit={handleSubmit}>
            {renderFormStep()}
            
            <ButtonContainer>
              <NavButton
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                <ButtonIcon position="left">←</ButtonIcon>
                上一步
              </NavButton>
              
              <NavButton
                type="button"
                variant="primary"
                onClick={handleNextStep}
                disabled={!isStepValid}
              >
                {isLastStep ? '提交' : '下一步'}
                {!isLastStep && <ButtonIcon position="right">→</ButtonIcon>}
              </NavButton>
            </ButtonContainer>
          </Form>
        </FormContainer>
      </Content>
      <Footer />
    </Container>
  );
};