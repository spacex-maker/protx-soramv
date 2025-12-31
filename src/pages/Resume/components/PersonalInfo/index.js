import React from 'react';
import { Button, Input, Typography, Select } from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  GithubOutlined, 
  LinkedinOutlined,
  WechatOutlined,
  GlobalOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  HeaderSection,
  HeaderEditButton,
  AvatarContainer,
  ContactInfo,
  ContactItem,
  EditableInput,
  PersonalInfoContent,
  PersonalInfoLeft,
  PersonalInfoRight,
  InfoRow,
  InfoItem,
  InfoLabel,
  InfoValue,
  InfoSection,
  SectionLabel
} from '../../styles';

const { Title, Text } = Typography;
const { Option } = Select;

export default function PersonalInfo({ 
  token, 
  personalInfo, 
  isEditingInfo, 
  onEditToggle, 
  onInfoChange, 
  onSave,
  variants 
}) {
  return (
    <HeaderSection $token={token} variants={variants}>
      <HeaderEditButton
        $token={token}
        type={isEditingInfo ? "primary" : "default"}
        icon={isEditingInfo ? <SaveOutlined /> : <EditOutlined />}
        onClick={() => {
          if (isEditingInfo) {
            onSave();
          } else {
            onEditToggle(true);
          }
        }}
      >
        {isEditingInfo ? '保存' : '编辑'}
      </HeaderEditButton>
      
      <PersonalInfoContent>
        {/* 左侧：头像和基本信息 */}
        <PersonalInfoLeft>
          <AvatarContainer $token={token}>
            <UserOutlined className="avatar-icon" />
          </AvatarContainer>
          {isEditingInfo ? (
            <>
              <EditableInput
                value={personalInfo.name}
                onChange={(e) => onInfoChange('name', e.target.value)}
                placeholder="姓名"
                style={{ marginTop: 16, marginBottom: 8, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}
              />
              <EditableInput
                value={personalInfo.title}
                onChange={(e) => onInfoChange('title', e.target.value)}
                placeholder="职位"
                style={{ marginBottom: 12, textAlign: 'center' }}
              />
            </>
          ) : (
            <>
              <Title level={1} style={{ margin: '16px 0 8px 0', color: token.colorText, fontSize: 24 }}>
                {personalInfo.name}
              </Title>
              <Text style={{ fontSize: 15, color: token.colorTextSecondary }}>
                {personalInfo.title}
              </Text>
            </>
          )}
        </PersonalInfoLeft>

        {/* 右侧：详细信息 */}
        <PersonalInfoRight>
          {/* 基本信息 */}
          <InfoSection $token={token}>
            <SectionLabel $token={token}>
              <UserOutlined />
              基本信息
            </SectionLabel>
            <InfoRow>
              <InfoItem>
                <InfoLabel $token={token}>年龄</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    value={personalInfo.age}
                    onChange={(e) => onInfoChange('age', e.target.value)}
                    placeholder="年龄"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.age || '-'}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel $token={token}>性别</InfoLabel>
                {isEditingInfo ? (
                  <Select
                    value={personalInfo.gender}
                    onChange={(value) => onInfoChange('gender', value)}
                    size="small"
                    style={{ maxWidth: '300px', width: '100%' }}
                    className="personal-info-select"
                  >
                    <Option value="男">男</Option>
                    <Option value="女">女</Option>
                    <Option value="其他">其他</Option>
                  </Select>
                ) : (
                  <InfoValue $token={token}>{personalInfo.gender || '-'}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel $token={token}>工作年限</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    value={personalInfo.experience}
                    onChange={(e) => onInfoChange('experience', e.target.value)}
                    placeholder="工作年限"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.experience || '-'}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel $token={token}>所在城市</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    value={personalInfo.location}
                    onChange={(e) => onInfoChange('location', e.target.value)}
                    placeholder="所在城市"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.location || '-'}</InfoValue>
                )}
              </InfoItem>
            </InfoRow>
          </InfoSection>

          {/* 联系方式 */}
          <InfoSection $token={token}>
            <SectionLabel $token={token}>
              <PhoneOutlined />
              联系方式
            </SectionLabel>
            <InfoRow>
              <InfoItem>
                <InfoLabel $token={token}>邮箱</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    prefix={<MailOutlined />}
                    value={personalInfo.email}
                    onChange={(e) => onInfoChange('email', e.target.value)}
                    placeholder="邮箱"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.email || '-'}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel $token={token}>电话</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    prefix={<PhoneOutlined />}
                    value={personalInfo.phone}
                    onChange={(e) => onInfoChange('phone', e.target.value)}
                    placeholder="电话"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.phone || '-'}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel $token={token}>微信</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    prefix={<WechatOutlined />}
                    value={personalInfo.wechat}
                    onChange={(e) => onInfoChange('wechat', e.target.value)}
                    placeholder="微信"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.wechat || '-'}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel $token={token}>地址</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    prefix={<EnvironmentOutlined />}
                    value={personalInfo.address}
                    onChange={(e) => onInfoChange('address', e.target.value)}
                    placeholder="详细地址"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.address || '-'}</InfoValue>
                )}
              </InfoItem>
            </InfoRow>
          </InfoSection>

          {/* 职业信息 */}
          <InfoSection $token={token}>
            <SectionLabel $token={token}>
              <CalendarOutlined />
              职业信息
            </SectionLabel>
            <InfoRow>
              <InfoItem>
                <InfoLabel $token={token}>期望薪资</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    prefix={<DollarOutlined />}
                    value={personalInfo.expectedSalary}
                    onChange={(e) => onInfoChange('expectedSalary', e.target.value)}
                    placeholder="期望薪资"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.expectedSalary || '-'}</InfoValue>
                )}
              </InfoItem>
              <InfoItem>
                <InfoLabel $token={token}>到岗时间</InfoLabel>
                {isEditingInfo ? (
                  <EditableInput
                    prefix={<CheckCircleOutlined />}
                    value={personalInfo.availability}
                    onChange={(e) => onInfoChange('availability', e.target.value)}
                    placeholder="到岗时间"
                    size="small"
                  />
                ) : (
                  <InfoValue $token={token}>{personalInfo.availability || '-'}</InfoValue>
                )}
              </InfoItem>
            </InfoRow>
          </InfoSection>

          {/* 社交链接 */}
          <InfoSection $token={token}>
            <SectionLabel $token={token}>
              <GlobalOutlined />
              社交链接
            </SectionLabel>
            {isEditingInfo ? (
              <InfoRow>
                <InfoItem>
                  <InfoLabel $token={token}>GitHub</InfoLabel>
                  <EditableInput
                    prefix={<GithubOutlined />}
                    value={personalInfo.github}
                    onChange={(e) => onInfoChange('github', e.target.value)}
                    placeholder="GitHub"
                    size="small"
                  />
                </InfoItem>
                <InfoItem>
                  <InfoLabel $token={token}>LinkedIn</InfoLabel>
                  <EditableInput
                    prefix={<LinkedinOutlined />}
                    value={personalInfo.linkedin}
                    onChange={(e) => onInfoChange('linkedin', e.target.value)}
                    placeholder="LinkedIn"
                    size="small"
                  />
                </InfoItem>
                <InfoItem>
                  <InfoLabel $token={token}>个人博客</InfoLabel>
                  <EditableInput
                    prefix={<FileTextOutlined />}
                    value={personalInfo.blog}
                    onChange={(e) => onInfoChange('blog', e.target.value)}
                    placeholder="个人博客"
                    size="small"
                  />
                </InfoItem>
                <InfoItem>
                  <InfoLabel $token={token}>个人网站</InfoLabel>
                  <EditableInput
                    prefix={<GlobalOutlined />}
                    value={personalInfo.website}
                    onChange={(e) => onInfoChange('website', e.target.value)}
                    placeholder="个人网站"
                    size="small"
                  />
                </InfoItem>
              </InfoRow>
            ) : (
              <ContactInfo>
                {personalInfo.github && (
                  <ContactItem $token={token} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <GithubOutlined />
                    <span>{personalInfo.github}</span>
                  </ContactItem>
                )}
                {personalInfo.linkedin && (
                  <ContactItem $token={token} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <LinkedinOutlined />
                    <span>{personalInfo.linkedin}</span>
                  </ContactItem>
                )}
                {personalInfo.blog && (
                  <ContactItem $token={token} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <FileTextOutlined />
                    <span>{personalInfo.blog}</span>
                  </ContactItem>
                )}
                {personalInfo.website && (
                  <ContactItem $token={token} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <GlobalOutlined />
                    <span>{personalInfo.website}</span>
                  </ContactItem>
                )}
              </ContactInfo>
            )}
          </InfoSection>
        </PersonalInfoRight>
      </PersonalInfoContent>
    </HeaderSection>
  );
}

