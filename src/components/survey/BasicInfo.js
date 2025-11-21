import React from "react";
import styled from "styled-components";
import {
  InputGroup,
  FormLabel,
  Input,
  ErrorText,
  StepTitle,
  Select
} from "./SurveyElements";

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const GenderSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
`;

const GenderButton = styled.button`
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid;
  transition: all 0.2s;
  font-size: 0.813rem;
  font-weight: ${props => props.isSelected ? '500' : '400'};
  background-color: ${props => props.isSelected ? '#3b82f6' : 'white'};
  border-color: ${props => props.isSelected ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.isSelected ? 'white' : '#4b5563'};

  &:hover {
    border-color: ${props => props.isSelected ? '#3b82f6' : '#93c5fd'};
    background-color: ${props => props.isSelected ? '#3b82f6' : '#f9fafb'};
  }
`;

const StatusSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.375rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatusButton = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: ${props => props.isSelected ? '500' : '400'};
  background-color: ${props => props.isSelected ? '#3b82f6' : 'white'};
  border-color: ${props => props.isSelected ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.isSelected ? 'white' : '#4b5563'};
  box-shadow: ${props => props.isSelected ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'};

  &:hover {
    border-color: ${props => props.isSelected ? '#3b82f6' : '#93c5fd'};
    background-color: ${props => props.isSelected ? '#3b82f6' : '#f9fafb'};
  }

  &:focus {
    outline: none;
  }

  @media (min-width: 640px) {
    font-size: 0.875rem;
  }
`;

const EducationSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
`;

const EducationButton = styled.button`
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid;
  transition: all 0.2s;
  font-size: 0.813rem;
  white-space: nowrap;
  font-weight: ${props => props.isSelected ? '500' : '400'};
  background-color: ${props => props.isSelected ? '#3b82f6' : 'white'};
  border-color: ${props => props.isSelected ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.isSelected ? 'white' : '#4b5563'};

  &:hover {
    border-color: ${props => props.isSelected ? '#3b82f6' : '#93c5fd'};
    background-color: ${props => props.isSelected ? '#3b82f6' : '#f9fafb'};
  }
`;

const BasicInfo = ({ formData, handleChange, errors }) => {
  const handleGenderSelect = (selectedGender) => {
    handleChange({
      target: {
        name: 'gender',
        value: selectedGender
      }
    });
  };

  const handleStatusSelect = (selectedStatus) => {
    handleChange({
      target: {
        name: 'currentStatus',
        value: selectedStatus
      }
    });
  };

  const handleEducationSelect = (selectedEducation) => {
    handleChange({
      target: {
        name: 'education',
        value: selectedEducation
      }
    });
  };

  const statusOptions = [
    { value: "在职", label: "在职" },
    { value: "离职", label: "离职" },
    { value: "应届生", label: "应届生" },
    { value: "在读", label: "在读" },
    { value: "实习", label: "实习" },
    { value: "其他", label: "其他" }
  ];

  const educationOptions = [
    { value: "高中", label: "高中" },
    { value: "专科", label: "专科" },
    { value: "本科", label: "本科" },
    { value: "硕士", label: "硕士" },
    { value: "博士", label: "博士" },
    { value: "其他", label: "其他" }
  ];

  return (
    <>
      <StepTitle>基本信息</StepTitle>
      
      <GridContainer>
        <InputGroup>
          <FormLabel>姓名</FormLabel>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入您的真实姓名"
          />
          {errors?.name && <ErrorText>{errors.name}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <FormLabel>英文名（选填）</FormLabel>
          <Input
            type="text"
            name="englishName"
            value={formData.englishName}
            onChange={handleChange}
            placeholder="请输入您的英文名"
          />
        </InputGroup>

        <InputGroup>
          <FormLabel>年龄</FormLabel>
          <Input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="请输入您的年龄"
            min="18"
            max="100"
          />
        </InputGroup>

        <InputGroup>
          <FormLabel>性别</FormLabel>
          <GenderSelector>
            {["男", "女", "其他"].map(gender => (
              <GenderButton
                key={gender}
                type="button"
                isSelected={formData.gender === gender}
                onClick={() => handleGenderSelect(gender)}
              >
                {gender}
              </GenderButton>
            ))}
          </GenderSelector>
          {errors?.gender && <ErrorText>{errors.gender}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <FormLabel>手机号码</FormLabel>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="请输入您的手机号码"
            pattern="[0-9]{11}"
          />
        </InputGroup>

        <InputGroup>
          <FormLabel>电子邮箱</FormLabel>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="请输入您的电子邮箱"
          />
        </InputGroup>

        <InputGroup>
          <FormLabel>最高学历</FormLabel>
          <EducationSelector>
            {educationOptions.map(({ value, label }) => (
              <EducationButton
                key={value}
                type="button"
                isSelected={formData.education === value}
                onClick={() => handleEducationSelect(value)}
              >
                {label}
              </EducationButton>
            ))}
          </EducationSelector>
          {errors?.education && <ErrorText>{errors.education}</ErrorText>}
        </InputGroup>

        <InputGroup>
          <FormLabel>毕业院校</FormLabel>
          <Input
            type="text"
            name="school"
            value={formData.school}
            onChange={handleChange}
            placeholder="请输入您的毕业院校"
          />
        </InputGroup>

        <InputGroup>
          <FormLabel>专业方向</FormLabel>
          <Input
            type="text"
            name="major"
            value={formData.major}
            onChange={handleChange}
            placeholder="请输入您的专业方向"
          />
        </InputGroup>

        <InputGroup>
          <FormLabel>当前状态</FormLabel>
          <StatusSelector>
            {statusOptions.map(({ value, label }) => (
              <StatusButton
                key={value}
                type="button"
                isSelected={formData.currentStatus === value}
                onClick={() => handleStatusSelect(value)}
              >
                {label}
              </StatusButton>
            ))}
          </StatusSelector>
          {errors?.currentStatus && <ErrorText>{errors.currentStatus}</ErrorText>}
        </InputGroup>
      </GridContainer>

      <InputGroup>
        <FormLabel>现居地址</FormLabel>
        <Input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="请输入您的现居地址"
          tw="col-span-2"
        />
      </InputGroup>
    </>
  );
};

export default BasicInfo; 