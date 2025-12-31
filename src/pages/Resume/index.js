import React, { useState, useEffect } from "react";
import { ConfigProvider, theme, message } from "antd";
import SimpleHeader from "components/headers/simple";
import dayjs from 'dayjs';

// 组件
import PersonalInfo from './components/PersonalInfo';
import SkillsSection from './components/SkillsSection';
import EducationSection from './components/EducationSection';
import CareerSection from './components/CareerSection';
import ProjectsSection from './components/ProjectsSection';
import CertificationsSection from './components/CertificationsSection';
import LanguagesSection from './components/LanguagesSection';
import AwardsSection from './components/AwardsSection';
import OpenSourceSection from './components/OpenSourceSection';
import PortfolioSection from './components/PortfolioSection';
import SummarySection from './components/SummarySection';
import ProficiencyRuler from './components/ProficiencyRuler';

// 样式
import {
  PageBackground,
  ContentWrapper,
  MainContainer,
  ResumeGlobalStyles
} from './styles';

// 常量和工具
import { 
  defaultSkills, 
  defaultPersonalInfo, 
  defaultEducation,
  defaultCareer,
  defaultProjects,
  defaultCertifications,
  defaultLanguages,
  defaultAwards,
  defaultOpenSource,
  defaultPortfolio,
  defaultSummary
} from './constants';
import { mergeSkills } from './utils';

export default function Resume() {
  const { token } = theme.useToken();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState(defaultSkills);
  const [activeSkillTab, setActiveSkillTab] = useState('core');
  const [personalInfo, setPersonalInfo] = useState(defaultPersonalInfo);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [isEditingCareer, setIsEditingCareer] = useState(false);
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [isEditingCertifications, setIsEditingCertifications] = useState(false);
  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [isEditingOpenSource, setIsEditingOpenSource] = useState(false);
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [education, setEducation] = useState(defaultEducation);
  const [career, setCareer] = useState(defaultCareer);
  const [projects, setProjects] = useState(defaultProjects);
  const [certifications, setCertifications] = useState(defaultCertifications);
  const [languages, setLanguages] = useState(defaultLanguages);
  const [awards, setAwards] = useState(defaultAwards);
  const [openSource, setOpenSource] = useState(defaultOpenSource);
  const [portfolio, setPortfolio] = useState(defaultPortfolio);
  const [summary, setSummary] = useState(defaultSummary);

  // 数据加载
  useEffect(() => {
    const savedSkills = localStorage.getItem('resume-skills');
    const savedInfo = localStorage.getItem('resume-info');
    const savedEducation = localStorage.getItem('resume-education');
    const savedCareer = localStorage.getItem('resume-career');
    const savedProjects = localStorage.getItem('resume-projects');
    const savedCertifications = localStorage.getItem('resume-certifications');
    const savedLanguages = localStorage.getItem('resume-languages');
    const savedAwards = localStorage.getItem('resume-awards');
    const savedOpenSource = localStorage.getItem('resume-opensource');
    const savedPortfolio = localStorage.getItem('resume-portfolio');
    const savedSummary = localStorage.getItem('resume-summary');
    
    try {
      const parsedSkills = savedSkills ? JSON.parse(savedSkills) : null;
      setSkills(mergeSkills(parsedSkills, defaultSkills));
    } catch (e) {
      console.error('Failed to parse saved skills:', e);
      setSkills(defaultSkills);
    }
    
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo);
        setPersonalInfo({ ...defaultPersonalInfo, ...parsedInfo });
      } catch (e) {
        console.error('Failed to parse saved info:', e);
        setPersonalInfo(defaultPersonalInfo);
      }
    }

    if (savedEducation) {
      try {
        setEducation(JSON.parse(savedEducation));
      } catch (e) {
        console.error('Failed to parse saved education:', e);
      }
    }

    if (savedCareer) {
      try {
        setCareer(JSON.parse(savedCareer));
      } catch (e) {
        console.error('Failed to parse saved career:', e);
      }
    }

    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error('Failed to parse saved projects:', e);
      }
    }

    if (savedCertifications) {
      try {
        setCertifications(JSON.parse(savedCertifications));
      } catch (e) {
        console.error('Failed to parse saved certifications:', e);
      }
    }

    if (savedLanguages) {
      try {
        setLanguages(JSON.parse(savedLanguages));
      } catch (e) {
        console.error('Failed to parse saved languages:', e);
      }
    }

    if (savedAwards) {
      try {
        setAwards(JSON.parse(savedAwards));
      } catch (e) {
        console.error('Failed to parse saved awards:', e);
      }
    }

    if (savedOpenSource) {
      try {
        setOpenSource(JSON.parse(savedOpenSource));
      } catch (e) {
        console.error('Failed to parse saved opensource:', e);
      }
    }

    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (e) {
        console.error('Failed to parse saved portfolio:', e);
      }
    }

    if (savedSummary) {
      try {
        setSummary(savedSummary);
      } catch (e) {
        console.error('Failed to parse saved summary:', e);
      }
    }
  }, []);

  // 保存数据
  const handleSave = () => {
    localStorage.setItem('resume-skills', JSON.stringify(skills));
    localStorage.setItem('resume-info', JSON.stringify(personalInfo));
    localStorage.setItem('resume-education', JSON.stringify(education));
    localStorage.setItem('resume-career', JSON.stringify(career));
    localStorage.setItem('resume-projects', JSON.stringify(projects));
    localStorage.setItem('resume-certifications', JSON.stringify(certifications));
    localStorage.setItem('resume-languages', JSON.stringify(languages));
    localStorage.setItem('resume-awards', JSON.stringify(awards));
    localStorage.setItem('resume-opensource', JSON.stringify(openSource));
    localStorage.setItem('resume-portfolio', JSON.stringify(portfolio));
    localStorage.setItem('resume-summary', summary);
    setIsEditing(false);
    setIsEditingInfo(false);
    setIsEditingEducation(false);
    setIsEditingCareer(false);
    setIsEditingProjects(false);
    setIsEditingCertifications(false);
    setIsEditingLanguages(false);
    setIsEditingAwards(false);
    setIsEditingOpenSource(false);
    setIsEditingPortfolio(false);
    setIsEditingSummary(false);
    message.success('简历已保存！');
  };

  // 个人信息处理
  const handleInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 技能处理
  const handleSkillPercentageChange = (category, index, percentage) => {
    const newSkills = { ...skills };
    newSkills[category][index].percentage = percentage;
    setSkills(newSkills);
  };

  // 教育信息处理
  const handleEducationChange = (id, field, value) => {
    setEducation(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddEducation = () => {
    const newId = Math.max(...education.map(e => e.id), 0) + 1;
    setEducation(prev => [
      {
        id: newId,
        degree: '本科',
        major: '',
        school: '',
        startDate: dayjs().format('YYYY-MM'),
        endDate: dayjs().format('YYYY-MM'),
        description: ''
      },
      ...prev
    ]);
  };

  const handleDeleteEducation = (id) => {
    setEducation(prev => prev.filter(item => item.id !== id));
    message.success('教育经历已删除');
  };

  // 职业生涯处理
  const handleCareerChange = (id, field, value) => {
    setCareer(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddCareer = () => {
    const newId = Math.max(...career.map(c => c.id), 0) + 1;
    setCareer(prev => [
      {
        id: newId,
        company: '',
        position: '',
        location: '',
        department: '',
        startDate: dayjs().format('YYYY-MM'),
        endDate: '至今',
        description: '',
        responsibilities: [],
        achievements: [],
        technologies: []
      },
      ...prev
    ]);
  };

  const handleDeleteCareer = (id) => {
    setCareer(prev => prev.filter(item => item.id !== id));
    message.success('工作经历已删除');
  };

  // 项目经验处理
  const handleProjectChange = (id, field, value) => {
    setProjects(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddProject = () => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    setProjects(prev => [
      {
        id: newId,
        name: '',
        description: '',
        role: '',
        startDate: dayjs().format('YYYY-MM'),
        endDate: '至今',
        technologies: [],
        highlights: [],
        link: '',
        demo: ''
      },
      ...prev
    ]);
  };

  const handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(item => item.id !== id));
    message.success('项目已删除');
  };

  // 证书处理
  const handleCertificationChange = (id, field, value) => {
    setCertifications(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddCertification = () => {
    const newId = Math.max(...certifications.map(c => c.id), 0) + 1;
    setCertifications(prev => [
      {
        id: newId,
        name: '',
        issuer: '',
        issueDate: dayjs().format('YYYY-MM'),
        expiryDate: '',
        credentialId: '',
        description: ''
      },
      ...prev
    ]);
  };

  const handleDeleteCertification = (id) => {
    setCertifications(prev => prev.filter(item => item.id !== id));
    message.success('证书已删除');
  };

  // 语言能力处理
  const handleLanguageChange = (id, field, value) => {
    setLanguages(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddLanguage = () => {
    const newId = Math.max(...languages.map(l => l.id), 0) + 1;
    setLanguages(prev => [
      {
        id: newId,
        language: '',
        listening: '基础',
        speaking: '基础',
        reading: '基础',
        writing: '基础',
        certificate: ''
      },
      ...prev
    ]);
  };

  const handleDeleteLanguage = (id) => {
    setLanguages(prev => prev.filter(item => item.id !== id));
    message.success('语言已删除');
  };

  // 获奖经历处理
  const handleAwardChange = (id, field, value) => {
    setAwards(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddAward = () => {
    const newId = Math.max(...awards.map(a => a.id), 0) + 1;
    setAwards(prev => [
      {
        id: newId,
        name: '',
        issuer: '',
        date: dayjs().format('YYYY-MM'),
        level: '公司级',
        description: ''
      },
      ...prev
    ]);
  };

  const handleDeleteAward = (id) => {
    setAwards(prev => prev.filter(item => item.id !== id));
    message.success('奖项已删除');
  };

  // 开源贡献处理
  const handleOpenSourceChange = (id, field, value) => {
    setOpenSource(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddOpenSource = () => {
    const newId = Math.max(...openSource.map(o => o.id), 0) + 1;
    setOpenSource(prev => [
      {
        id: newId,
        name: '',
        description: '',
        link: '',
        contributions: [],
        stars: 0,
        role: 'Contributor'
      },
      ...prev
    ]);
  };

  const handleDeleteOpenSource = (id) => {
    setOpenSource(prev => prev.filter(item => item.id !== id));
    message.success('开源项目已删除');
  };

  // 作品集处理
  const handlePortfolioChange = (id, field, value) => {
    setPortfolio(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAddPortfolio = () => {
    const newId = Math.max(...portfolio.map(p => p.id), 0) + 1;
    setPortfolio(prev => [
      {
        id: newId,
        name: '',
        description: '',
        technologies: [],
        link: '',
        demo: '',
        screenshot: '',
        category: 'Web应用'
      },
      ...prev
    ]);
  };

  const handleDeletePortfolio = (id) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
    message.success('作品已删除');
  };

  // 个人简介处理
  const handleSummaryChange = (value) => {
    setSummary(value);
  };

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <ConfigProvider theme={{ token }}>
      <ResumeGlobalStyles />
      <PageBackground $token={token}>
        <SimpleHeader />
        <ProficiencyRuler token={token} />
        <ContentWrapper $token={token}>
          <MainContainer
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 个人信息 */}
            <PersonalInfo
              token={token}
              personalInfo={personalInfo}
              isEditingInfo={isEditingInfo}
              onEditToggle={setIsEditingInfo}
              onInfoChange={handleInfoChange}
              onSave={handleSave}
              variants={itemVariants}
            />

            {/* 技能栈 */}
            <SkillsSection
              token={token}
              skills={skills}
              isEditing={isEditing}
              activeSkillTab={activeSkillTab}
              onTabChange={setActiveSkillTab}
              onEditToggle={setIsEditing}
              onSave={handleSave}
              onSkillPercentageChange={handleSkillPercentageChange}
              variants={itemVariants}
            />

            {/* 教育信息 */}
            <EducationSection
              token={token}
              education={education}
              isEditingEducation={isEditingEducation}
              onEditToggle={setIsEditingEducation}
              onSave={handleSave}
              onEducationChange={handleEducationChange}
              onAddEducation={handleAddEducation}
              onDeleteEducation={handleDeleteEducation}
              variants={itemVariants}
            />

            {/* 职业生涯 */}
            <CareerSection
              token={token}
              career={career}
              isEditingCareer={isEditingCareer}
              onEditToggle={setIsEditingCareer}
              onSave={handleSave}
              onCareerChange={handleCareerChange}
              onAddCareer={handleAddCareer}
              onDeleteCareer={handleDeleteCareer}
              variants={itemVariants}
            />

            {/* 项目经验 */}
            <ProjectsSection
              token={token}
              projects={projects}
              isEditingProjects={isEditingProjects}
              onEditToggle={setIsEditingProjects}
              onSave={handleSave}
              onProjectChange={handleProjectChange}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
              variants={itemVariants}
            />

            {/* 证书/资质 */}
            <CertificationsSection
              token={token}
              certifications={certifications}
              isEditingCertifications={isEditingCertifications}
              onEditToggle={setIsEditingCertifications}
              onSave={handleSave}
              onCertificationChange={handleCertificationChange}
              onAddCertification={handleAddCertification}
              onDeleteCertification={handleDeleteCertification}
              variants={itemVariants}
            />

            {/* 语言能力 */}
            <LanguagesSection
              token={token}
              languages={languages}
              isEditingLanguages={isEditingLanguages}
              onEditToggle={setIsEditingLanguages}
              onSave={handleSave}
              onLanguageChange={handleLanguageChange}
              onAddLanguage={handleAddLanguage}
              onDeleteLanguage={handleDeleteLanguage}
              variants={itemVariants}
            />

            {/* 获奖经历 */}
            <AwardsSection
              token={token}
              awards={awards}
              isEditingAwards={isEditingAwards}
              onEditToggle={setIsEditingAwards}
              onSave={handleSave}
              onAwardChange={handleAwardChange}
              onAddAward={handleAddAward}
              onDeleteAward={handleDeleteAward}
              variants={itemVariants}
            />

            {/* 开源贡献 */}
            <OpenSourceSection
              token={token}
              openSource={openSource}
              isEditingOpenSource={isEditingOpenSource}
              onEditToggle={setIsEditingOpenSource}
              onSave={handleSave}
              onOpenSourceChange={handleOpenSourceChange}
              onAddOpenSource={handleAddOpenSource}
              onDeleteOpenSource={handleDeleteOpenSource}
              variants={itemVariants}
            />

            {/* 作品集 */}
            <PortfolioSection
              token={token}
              portfolio={portfolio}
              isEditingPortfolio={isEditingPortfolio}
              onEditToggle={setIsEditingPortfolio}
              onSave={handleSave}
              onPortfolioChange={handlePortfolioChange}
              onAddPortfolio={handleAddPortfolio}
              onDeletePortfolio={handleDeletePortfolio}
              variants={itemVariants}
            />

            {/* 个人简介 */}
            <SummarySection
              token={token}
              summary={summary}
              isEditingSummary={isEditingSummary}
              onEditToggle={setIsEditingSummary}
              onSave={handleSave}
              onSummaryChange={handleSummaryChange}
              variants={itemVariants}
            />
          </MainContainer>
        </ContentWrapper>
      </PageBackground>
    </ConfigProvider>
  );
}

