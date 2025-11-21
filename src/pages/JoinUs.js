import React, { useState } from "react";
import tw from "twin.macro";
import styled from "styled-components";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import { SectionHeading } from "components/misc/Headings.js";
import { PrimaryButton } from "components/misc/Buttons.js";
import { motion } from "framer-motion";

const Container = tw.div`relative bg-gray-100 dark:bg-gray-900 pt-20`;
const Content = tw.div`
  max-w-screen-xl mx-auto 
  py-20 lg:py-24
  px-4 sm:px-6 lg:px-8
  bg-white dark:bg-gray-800
  shadow-sm
  rounded-lg
  my-8
`;

const HeadingRow = tw.div`flex flex-col items-center`;
const Heading = tw(SectionHeading)`text-gray-900 dark:text-gray-100 mb-8`;
const Description = tw.p`text-center text-gray-600 dark:text-gray-400 max-w-sm`;

const StepsContainer = tw.div`mt-12 flex flex-col items-center`;
const StepsRow = tw.div`mt-8 flex flex-col lg:flex-row items-center lg:items-stretch`;

const Step = styled.div`
  ${tw`w-full lg:w-1/3 mt-8 lg:mt-0 lg:mx-4 flex flex-col items-center`}
`;

const StepNumber = tw.div`
  w-16 h-16 
  rounded-full 
  bg-primary-500 dark:bg-primary-600
  text-white dark:text-gray-100 
  flex items-center justify-center 
  text-2xl font-bold
`;

const StepText = tw.div`mt-4 text-center`;
const StepHeading = tw.div`text-xl font-bold text-gray-900 dark:text-gray-100`;
const StepDescription = tw.div`mt-2 text-sm text-gray-600 dark:text-gray-400`;

const ActionButton = styled(PrimaryButton)`
  ${tw`mt-12`}
`;

const FormContainer = tw.div`
  w-full max-w-2xl mx-auto
  bg-white dark:bg-gray-800
  p-6 sm:p-8
  rounded-lg
  shadow-sm
`;
const Form = tw.form`mt-8 md:mt-10 text-sm flex flex-col`;
const InputGroup = tw.div`mt-8 first:mt-0`;
const FormLabel = tw.label`block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2`;
const Input = tw.input`
  w-full px-4 py-3 
  border border-gray-300 dark:border-gray-600 
  rounded-lg
  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25
  transition duration-200
  text-gray-900 dark:text-gray-100
  bg-white dark:bg-gray-700
  placeholder-gray-500 dark:placeholder-gray-400
`;
const Textarea = tw.textarea`
  w-full px-4 py-3 
  border border-gray-300 dark:border-gray-600
  rounded-lg
  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-25
  transition duration-200
  text-gray-900 dark:text-gray-100
  bg-white dark:bg-gray-700
  placeholder-gray-500 dark:placeholder-gray-400
  min-h-32 resize-none
`;
const ErrorText = tw.p`mt-2 text-sm text-red-600 dark:text-red-400`;
const BackButton = tw.button`
  px-6 py-2
  text-gray-600 dark:text-gray-400 
  hover:text-gray-800 dark:hover:text-gray-200
  font-medium
  transition duration-300
  focus:outline-none
  hover:bg-gray-100 dark:hover:bg-gray-700
  rounded-lg
`;
const ProgressBar = tw.div`
  w-full h-2 
  bg-gray-200 dark:bg-gray-700
  rounded-full 
  mt-8
`;
const ProgressIndicator = tw(motion.div)`
  h-full 
  bg-primary-500 dark:bg-primary-400
  rounded-full
`;

const StepTitle = tw.h3`text-xl font-bold text-gray-900 dark:text-gray-100 mb-6`;

const NextButton = tw(PrimaryButton)`
  px-8 py-2
  flex items-center
  shadow-md hover:shadow-lg
  transition duration-300
  bg-primary-500 dark:bg-primary-600
  hover:bg-primary-600 dark:hover:bg-primary-500
  text-white dark:text-gray-100
`;

const ButtonContainer = tw.div`
  flex justify-between items-center
  mt-12 mb-4
`;

export default () => {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    siteName: "",
    siteUrl: "",
    description: "",
    contactEmail: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.siteName) newErrors.siteName = "请输入网站名称";
      if (!formData.siteUrl) newErrors.siteUrl = "请输入网站地址";
    } else if (step === 2) {
      if (!formData.description) newErrors.description = "请输入网站描述";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setShowForm(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      console.log("表单数据：", formData);
      alert("申请已提交，我们会尽快审核！");
      setShowForm(false);
      setCurrentStep(1);
      setFormData({
        siteName: "",
        siteUrl: "",
        description: "",
        contactEmail: ""
      });
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <StepTitle>基本信息</StepTitle>
            <InputGroup>
              <FormLabel>网站名称</FormLabel>
              <Input
                type="text"
                name="siteName"
                placeholder="例如：我的个人博客"
                value={formData.siteName}
                onChange={handleChange}
              />
              {errors.siteName && <ErrorText>{errors.siteName}</ErrorText>}
            </InputGroup>
            <InputGroup>
              <FormLabel>网站地址</FormLabel>
              <Input
                type="url"
                name="siteUrl"
                placeholder="例如：https://www.example.com"
                value={formData.siteUrl}
                onChange={handleChange}
              />
              {errors.siteUrl && <ErrorText>{errors.siteUrl}</ErrorText>}
            </InputGroup>
          </>
        );
      case 2:
        return (
          <>
            <StepTitle>网站介绍</StepTitle>
            <InputGroup>
              <FormLabel>网站描述</FormLabel>
              <Textarea
                name="description"
                placeholder="请详细描述您的网站内容、特色和价值（至少 50 字）"
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </InputGroup>
          </>
        );
      case 3:
        return (
          <>
            <StepTitle>联系方式</StepTitle>
            <InputGroup>
              <FormLabel>联系邮箱</FormLabel>
              <Input
                type="email"
                name="contactEmail"
                placeholder="example@domain.com"
                value={formData.contactEmail}
                onChange={handleChange}
              />
              {errors.contactEmail && <ErrorText>{errors.contactEmail}</ErrorText>}
            </InputGroup>
          </>
        );
      default:
        return null;
    }
  };

  const steps = [
    {
      number: "1",
      heading: "提交申请",
      description: "填写您的网站信息，包括网站名称、URL、描述等基本信息。"
    },
    {
      number: "2",
      heading: "资质审核",
      description: "我们将对您提供的信息进行审核，确保符合平台规范。"
    },
    {
      number: "3",
      heading: "完成入驻",
      description: "审核通过后，您的网站将在我们的导航系统中展示。"
    }
  ];

  return (
    <Container>
      <Header />
      <Content>
        <HeadingRow>
          <Heading>网站入驻</Heading>
          <Description>
            加入我们的导航系统，让更多用户发现您的网站
          </Description>
        </HeadingRow>
        {!showForm ? (
          <StepsContainer>
            <StepsRow>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepNumber>{step.number}</StepNumber>
                  <StepText>
                    <StepHeading>{step.heading}</StepHeading>
                    <StepDescription>{step.description}</StepDescription>
                  </StepText>
                </Step>
              ))}
            </StepsRow>
            <ActionButton onClick={() => setShowForm(true)}>开始申请</ActionButton>
          </StepsContainer>
        ) : (
          <FormContainer>
            <ProgressBar>
              <ProgressIndicator
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </ProgressBar>
            <Form onSubmit={handleSubmit}>
              {renderFormStep()}
              <ButtonContainer>
                <BackButton 
                  type="button" 
                  onClick={handleBack}
                >
                  {currentStep === 1 ? (
                    <>
                      <span tw="mr-2">←</span>
                      返回
                    </>
                  ) : (
                    <>
                      <span tw="mr-2">←</span>
                      上一步
                    </>
                  )}
                </BackButton>
                {currentStep < 3 ? (
                  <NextButton 
                    type="button" 
                    onClick={handleNext}
                  >
                    下一步
                    <span tw="ml-2">→</span>
                  </NextButton>
                ) : (
                  <NextButton 
                    type="submit"
                  >
                    提交申请
                    <span tw="ml-2">→</span>
                  </NextButton>
                )}
              </ButtonContainer>
            </Form>
          </FormContainer>
        )}
      </Content>
      <Footer />
    </Container>
  );
}; 