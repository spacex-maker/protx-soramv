import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { Button, Input, Progress, Slider, Tabs, Timeline, Typography, Modal } from 'antd';

const { Title } = Typography;

// ==========================================
// 页面布局样式
// ==========================================

export const PageBackground = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.$token.colorBgLayout};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  color: ${props => props.$token.colorText};
  overflow-x: hidden;
`;

export const ContentWrapper = styled.div`
  flex: 1;
  position: relative;
  padding-top: 120px;
  padding-bottom: 40px;
  padding-left: 16px;
  padding-right: 16px;
  width: 100%;

  @media (max-width: 768px) {
    padding-top: 200px;
  }
  
  &::before {
    content: '';
    position: fixed;
    top: -100px;
    right: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, ${props => props.$token.colorPrimaryBg} 0%, transparent 70%);
    opacity: 0.3;
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: fixed;
    bottom: -100px;
    left: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, ${props => props.$token.colorPrimaryBg} 0%, transparent 70%);
    opacity: 0.2;
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }
`;

export const MainContainer = styled(motion.div)`
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 768px) {
    gap: 32px;
  }
`;

// ==========================================
// 个人信息样式
// ==========================================

export const HeaderSection = styled(motion.div)`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 24px 0 32px 0;
  background: ${props => props.$token.colorBgLayout};
  margin-top: -24px;
  
  @media (max-width: 768px) {
    padding: 20px 0 24px 0;
    margin-top: -20px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      ${props => props.$token.colorPrimary} 0%, 
      ${props => props.$token.colorSuccess} 50%, 
      ${props => props.$token.colorPrimary} 100%);
  }
`;

export const HeaderEditButton = styled(Button)`
  position: absolute;
  top: 16px;
  right: 16px;
  border-radius: 50px !important;
  z-index: 10;
  height: 36px;
  padding: 0 20px;
  font-weight: 500;
  background: linear-gradient(135deg, ${props => props.$token?.colorPrimary || '#1890ff'} 0%, ${props => props.$token?.colorPrimary || '#1890ff'}dd 100%);
  border: none;
  color: #fff;
  box-shadow: 0 2px 8px ${props => props.$token?.colorPrimary || '#1890ff'}40;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, ${props => props.$token?.colorPrimary || '#1890ff'}dd 0%, ${props => props.$token?.colorPrimary || '#1890ff'} 100%);
    box-shadow: 0 4px 12px ${props => props.$token?.colorPrimary || '#1890ff'}60;
    transform: translateY(-1px);
    color: #fff !important;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
    height: 32px;
    padding: 0 16px;
    font-size: 13px;
  }
`;

export const AvatarContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.$token.colorPrimary} 0%, ${props => props.$token.colorSuccess} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: ${props => props.$token.colorBgElevated};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-icon {
    position: relative;
    z-index: 1;
    font-size: 32px;
    color: ${props => props.$token.colorPrimary};
  }
`;

export const PersonalInfoContent = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 16px;
  }
`;

export const PersonalInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 200px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

export const PersonalInfoRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const InfoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const InfoLabel = styled.span`
  font-size: 12px;
  color: ${props => props.$token.colorTextTertiary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const InfoValue = styled.span`
  font-size: 14px;
  color: ${props => props.$token.colorText};
  font-weight: 500;
`;

export const ContactInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  width: 100%;
`;

export const ContactItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.$token.colorBgContainer};
  border-radius: 16px;
  border: 1px solid ${props => props.$token.colorBorder};
  color: ${props => props.$token.colorTextSecondary};
  font-size: 13px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$token.colorPrimaryBg};
    border-color: ${props => props.$token.colorPrimary};
    color: ${props => props.$token.colorPrimary};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: ${props => props.$token.colorBgElevated};
  border-radius: 12px;
  border: 1px solid ${props => props.$token.colorBorder};
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
  
  /* 增加 Select 组件高度 */
  .ant-select-sm {
    height: 40px !important;
    max-width: 300px !important;
    
    .ant-select-selector {
      height: 40px !important;
      min-height: 40px !important;
      padding: 0 32px 0 16px !important;
      border-radius: 50px !important;
      display: flex !important;
      align-items: center !important;
    }
    
    .ant-select-selection-item {
      line-height: 40px !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
    }
    
    .ant-select-selection-placeholder {
      line-height: 40px !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
    }
    
    /* 调整下拉箭头位置 - 使用更具体的选择器 */
    .ant-select-selector .ant-select-selection-item,
    .ant-select-selector .ant-select-selection-placeholder {
      line-height: 40px !important;
    }
    
    .ant-select-arrow {
      position: absolute !important;
      top: 50% !important;
      right: 12px !important;
      transform: translateY(-50%) !important;
      margin-top: 0 !important;
      height: auto !important;
      line-height: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .ant-select-selection-search {
      line-height: 40px !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
    }
    
    .ant-select-selection-search-input {
      height: 40px !important;
      line-height: 40px !important;
      display: flex !important;
      align-items: center !important;
    }
  }
  
  /* 专门针对个人信息 Select 的箭头位置修复 */
  .personal-info-select.ant-select-sm {
    .ant-select-selector {
      position: relative !important;
    }
    
    .ant-select-arrow {
      position: absolute !important;
      top: 50% !important;
      right: 12px !important;
      margin-top: 0 !important;
      transform: translateY(-50%) !important;
      height: 14px !important;
      line-height: 14px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    /* 确保箭头图标垂直居中 */
    .ant-select-arrow .anticon {
      vertical-align: middle !important;
      display: inline-flex !important;
      align-items: center !important;
    }
  }
`;

export const SectionLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$token.colorText};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const EditableInput = styled(Input)`
  border-radius: 12px;
  max-width: 300px;
  margin: 4px 0;
  
  /* 增加输入框高度 */
  &.ant-input-sm,
  &.ant-input-affix-wrapper-sm {
    height: 40px !important;
    min-height: 40px !important;
    padding: 8px 16px !important;
    font-size: 14px !important;
  }
  
  /* 全圆弧设计 */
  &.ant-input,
  &.ant-input-affix-wrapper {
    border-radius: 50px !important;
  }
  
  /* 确保输入框有合适的高度 */
  input {
    height: 100% !important;
  }
`;

// ==========================================
// 技能栈样式
// ==========================================

export const SkillsSection = styled(motion.div)`
  background: ${props => props.$token.colorBgElevated};
  border-radius: 24px;
  border: 1px solid ${props => props.$token.colorBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 32px;
  position: relative;
`;

export const SkillsTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
    padding: 0 4px;
  }
  
  .ant-tabs-tab {
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      color: ${props => props.$token.colorPrimary};
    }
    
    .anticon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
  
  .ant-tabs-tab-active {
    background: ${props => props.$token.colorPrimaryBg};
    border-color: ${props => props.$token.colorPrimary};
    
    .ant-tabs-tab-btn {
      color: ${props => props.$token.colorPrimary};
      font-weight: 600;
    }
  }
  
  .ant-tabs-ink-bar {
    background: ${props => props.$token.colorPrimary};
    height: 3px;
    border-radius: 2px;
  }
  
  .ant-tabs-content-holder {
    padding-top: 8px;
  }
  
  .ant-tabs-tabpane {
    padding: 0;
  }
  
  @media (max-width: 768px) {
    .ant-tabs-nav {
      overflow-x: auto;
      overflow-y: hidden;
    }
    
    .ant-tabs-tab {
      padding: 10px 16px;
      font-size: 13px;
      white-space: nowrap;
    }
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${props => props.$token.colorBorder};
`;

export const SectionTitle = styled(Title)`
  margin: 0 !important;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.$token.colorText} !important;
  
  .icon {
    font-size: 28px;
    color: ${props => props.$token.colorPrimary};
  }
`;

export const SkillCategory = styled.div`
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SkillItem = styled(motion.div)`
  padding: 8px 12px;
  background: ${props => props.$token.colorBgContainer};
  border-radius: 8px;
  border: 1px solid ${props => props.$token.colorBorder};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

export const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

export const SkillName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$token.colorText};
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

export const SkillPercentage = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$color || props.$token.colorText};
  min-width: 40px;
  text-align: right;
`;

export const ProgressContainer = styled.div`
  position: relative;
  margin-top: 2px;
`;

export const CustomProgress = styled(Progress)`
  .ant-progress-bg {
    background: ${props => props.$color || props.$token.colorPrimary} !important;
    transition: width 0.6s ease;
  }
`;

export const CustomSlider = styled(Slider)`
  margin: 0;
  
  .ant-slider-track {
    background: ${props => props.$color || props.$token.colorPrimary} !important;
  }
  
  .ant-slider-handle {
    border-color: ${props => props.$color || props.$token.colorPrimary} !important;
  }
  
  .ant-slider-handle:hover,
  .ant-slider-handle:focus {
    border-color: ${props => props.$color || props.$token.colorPrimary} !important;
  }
`;

export const EditButton = styled(Button)`
  border-radius: 50px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 20px;
  font-weight: 500;
  background: linear-gradient(135deg, ${props => props.$token?.colorPrimary || '#1890ff'} 0%, ${props => props.$token?.colorPrimary || '#1890ff'}dd 100%);
  border: none;
  color: #fff;
  box-shadow: 0 2px 8px ${props => props.$token?.colorPrimary || '#1890ff'}40;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, ${props => props.$token?.colorPrimary || '#1890ff'}dd 0%, ${props => props.$token?.colorPrimary || '#1890ff'} 100%);
    box-shadow: 0 4px 12px ${props => props.$token?.colorPrimary || '#1890ff'}60;
    transform: translateY(-1px);
    color: #fff !important;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    height: 32px;
    padding: 0 16px;
    font-size: 13px;
  }
`;

// ==========================================
// 教育信息样式
// ==========================================

export const EducationSection = styled(motion.div)`
  background: ${props => props.$token.colorBgElevated};
  border-radius: 24px;
  border: 1px solid ${props => props.$token.colorBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 32px;
  position: relative;
`;

export const EducationTimeline = styled(Timeline)`
  margin-top: 16px;
  
  .ant-timeline-item {
    padding-bottom: 16px;
  }
  
  .ant-timeline-item-content {
    margin-left: 24px;
  }
  
  .ant-timeline-item-head {
    background-color: ${props => props.$token.colorPrimary};
    border-color: ${props => props.$token.colorPrimary};
    width: 14px;
    height: 14px;
  }
  
  .ant-timeline-item-tail {
    border-left: 2px solid ${props => props.$token.colorBorder};
  }
`;

export const EducationItem = styled.div`
  background: ${props => props.$token.colorBgContainer};
  border-radius: 12px;
  border: 1px solid ${props => props.$token.colorBorder};
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

export const EducationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const EducationTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$token.colorText};
  margin-bottom: 4px;
`;

export const EducationSchool = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.$token.colorPrimary};
  margin-bottom: 8px;
`;

export const EducationTime = styled.div`
  font-size: 14px;
  color: ${props => props.$token.colorTextSecondary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const EducationDescription = styled.div`
  font-size: 14px;
  color: ${props => props.$token.colorTextSecondary};
  line-height: 1.6;
  margin-top: 12px;
`;

export const EducationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const EducationFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const EducationFormItem = styled.div`
  margin-bottom: 0;
  
  label {
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.$token.colorText};
  }
  
  /* 全圆弧输入框样式 */
  .ant-input,
  .ant-input-affix-wrapper,
  .ant-picker,
  .ant-select-selector,
  .ant-input-number,
  textarea.ant-input {
    border-radius: 50px !important;
    padding: 4px 14px !important;
    font-size: 13px;
    min-height: 32px !important;
  }
  
  .ant-picker {
    padding: 2px 14px !important;
    height: 32px !important;
  }
  
  .ant-select-selector {
    padding: 2px 14px !important;
    min-height: 32px !important;
  }
  
  .ant-input-affix-wrapper {
    padding: 2px 14px !important;
    min-height: 32px !important;
  }
  
  textarea.ant-input {
    border-radius: 20px !important;
    padding: 8px 14px !important;
    min-height: 60px !important;
  }
  
  /* Select 下拉框样式 */
  .ant-select {
    .ant-select-selector {
      border-radius: 50px !important;
    }
  }
  
  /* DatePicker 样式 */
  .ant-picker {
    border-radius: 50px !important;
  }
`;

// ==========================================
// 职业生涯样式
// ==========================================

export const CareerSection = styled(motion.div)`
  background: ${props => props.$token.colorBgElevated};
  border-radius: 24px;
  border: 1px solid ${props => props.$token.colorBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 32px;
  position: relative;
`;

export const CareerTimeline = styled(Timeline)`
  margin-top: 16px;
  
  .ant-timeline-item {
    padding-bottom: 16px;
  }
  
  .ant-timeline-item-content {
    margin-left: 24px;
  }
  
  .ant-timeline-item-head {
    background-color: ${props => props.$token.colorPrimary};
    border-color: ${props => props.$token.colorPrimary};
    width: 14px;
    height: 14px;
  }
  
  .ant-timeline-item-tail {
    border-left: 2px solid ${props => props.$token.colorBorder};
  }
`;

export const CareerItem = styled.div`
  background: ${props => props.$token.colorBgContainer};
  border-radius: 12px;
  border: 1px solid ${props => props.$token.colorBorder};
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.$token.colorPrimary};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

export const CareerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

export const CareerCompany = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$token.colorText};
  margin-bottom: 6px;
`;

export const CareerPosition = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$token.colorPrimary};
  margin-bottom: 12px;
`;

export const CareerMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-top: 8px;
`;

export const CareerMetaItem = styled.div`
  font-size: 14px;
  color: ${props => props.$token.colorTextSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  
  .anticon {
    color: ${props => props.$token.colorPrimary};
  }
`;

export const CareerDescription = styled.div`
  font-size: 14px;
  color: ${props => props.$token.colorTextSecondary};
  line-height: 1.7;
  margin-top: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: ${props => props.$token.colorFillQuaternary};
  border-radius: 8px;
  border-left: 3px solid ${props => props.$token.colorPrimary};
`;

export const CareerResponsibilities = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: ${props => props.$token.colorFillTertiary};
  border-radius: 8px;
  
  ul {
    li {
      line-height: 1.8;
    }
  }
`;

export const CareerAchievements = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: ${props => props.$token.colorSuccessBg};
  border-radius: 8px;
  border-left: 3px solid ${props => props.$token.colorSuccess};
  
  ul {
    li {
      line-height: 1.8;
    }
  }
`;

export const CareerTechnologies = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  /* 技术标签全圆弧样式 */
  .ant-tag {
    border-radius: 50px !important;
    padding: 6px 16px !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
    height: auto !important;
    margin: 0 !important;
    border: none !important;
  }
`;

export const CareerFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CareerFormItem = styled.div`
  margin-bottom: 0;
  
  label {
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.$token.colorText};
  }
  
  /* 全圆弧输入框样式 */
  .ant-input,
  .ant-input-affix-wrapper,
  .ant-picker,
  .ant-select-selector,
  .ant-input-number,
  textarea.ant-input {
    border-radius: 50px !important;
    padding: 4px 14px !important;
    font-size: 13px;
    min-height: 32px !important;
  }
  
  .ant-picker {
    padding: 2px 14px !important;
    height: 32px !important;
  }
  
  .ant-select-selector {
    padding: 2px 14px !important;
    min-height: 32px !important;
  }
  
  .ant-input-affix-wrapper {
    padding: 2px 14px !important;
    min-height: 32px !important;
  }
  
  textarea.ant-input {
    border-radius: 20px !important;
    padding: 8px 14px !important;
    min-height: 60px !important;
  }
  
  /* Select 下拉框样式 */
  .ant-select {
    .ant-select-selector {
      border-radius: 50px !important;
    }
  }
  
  /* DatePicker 样式 */
  .ant-picker {
    border-radius: 50px !important;
  }
`;

export const CareerActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${props => props.$token.colorBorder};
`;

// ==========================================
// 个人简介样式
// ==========================================

export const SummarySection = styled(motion.div)`
  background: ${props => props.$token.colorBgElevated};
  border-radius: 24px;
  border: 1px solid ${props => props.$token.colorBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 32px;
`;

// ==========================================
// 技能看板样式
// ==========================================

export const DashboardModal = styled(Modal)`
  .ant-modal-content {
    background: ${props => props.$token.colorBgElevated};
    border-radius: 16px;
  }

  .ant-modal-header {
    background: ${props => props.$token.colorBgElevated};
    border-bottom: 1px solid ${props => props.$token.colorBorder};
    border-radius: 16px 16px 0 0;
    
    .ant-modal-title {
      color: ${props => props.$token.colorText};
      font-size: 18px;
      font-weight: 600;
    }
  }

  .ant-modal-body {
    padding: 24px;
    background: ${props => props.$token.colorBgElevated};
  }

  .ant-tabs {
    .ant-tabs-tab {
      color: ${props => props.$token.colorTextSecondary};
      
      &:hover {
        color: ${props => props.$token.colorPrimary};
      }
    }

    .ant-tabs-tab-active {
      .ant-tabs-tab-btn {
        color: ${props => props.$token.colorPrimary};
      }
    }

    .ant-tabs-ink-bar {
      background: ${props => props.$token.colorPrimary};
    }

    .ant-tabs-content-holder {
      background: ${props => props.$token.colorBgElevated};
    }
  }
`;

export const ChartContainer = styled.div`
  width: 100%;
  padding: 16px;
  background: ${props => props.$token.colorBgContainer};
  border-radius: 12px;
  border: 1px solid ${props => props.$token.colorBorder};
  margin-top: 16px;
`;

export const ChartTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$token.colorText};
  margin-bottom: 16px;
  text-align: center;
`;

// ==========================================
// 全局样式 - 修复 Select 箭头位置
// ==========================================

export const ResumeGlobalStyles = createGlobalStyle`
  /* 修复个人信息 Select 箭头位置 */
  .personal-info-select.ant-select-sm .ant-select-arrow {
    top: 50% !important;
    right: 12px !important;
    margin-top: 0 !important;
    transform: translateY(-50%) !important;
    height: 14px !important;
    line-height: 14px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: absolute !important;
  }
  
  .personal-info-select.ant-select-sm .ant-select-arrow .anticon {
    vertical-align: middle !important;
    display: inline-flex !important;
    align-items: center !important;
    line-height: 1 !important;
  }
`;

