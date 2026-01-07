import React from 'react';
import { Button, Space, Input, Select } from 'antd';
import { EditOutlined, SaveOutlined, GlobalOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  CareerSection,
  CareerItem,
  CareerFormItem,
  CareerFormGrid,
  CareerActions,
  SectionHeader,
  SectionTitle,
  EditButton
} from '../../styles';

const { Option } = Select;

export default function LanguagesSectionComponent({
  token,
  languages,
  isEditingLanguages,
  onEditToggle,
  onSave,
  onLanguageChange,
  onAddLanguage,
  onDeleteLanguage,
  variants
}) {
  const proficiencyLevels = ['母语', '熟练', '良好', '基础', '入门'];

  return (
    <CareerSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <GlobalOutlined className="icon" />
          语言能力
        </SectionTitle>
        {!isEditingLanguages ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑语言
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddLanguage}
            >
              添加
            </Button>
            <EditButton
              $token={token}
              type="primary"
              icon={<SaveOutlined />}
              onClick={onSave}
            >
              保存更改
            </EditButton>
          </Space>
        )}
      </SectionHeader>

      {languages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无语言能力，点击"编辑语言"添加
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {languages.map((item) => (
            <CareerItem key={item.id} $token={token}>
              {isEditingLanguages ? (
                <>
                  <CareerFormGrid $token={token}>
                    <CareerFormItem $token={token}>
                      <label>语言</label>
                      <Input
                        value={item.language}
                        onChange={(e) => onLanguageChange(item.id, 'language', e.target.value)}
                        placeholder="如：英语、日语"
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>听力</label>
                      <Select
                        value={item.listening}
                        onChange={(value) => onLanguageChange(item.id, 'listening', value)}
                        style={{ width: '100%' }}
                        size="small"
                      >
                        {proficiencyLevels.map(level => (
                          <Option key={level} value={level}>{level}</Option>
                        ))}
                      </Select>
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>口语</label>
                      <Select
                        value={item.speaking}
                        onChange={(value) => onLanguageChange(item.id, 'speaking', value)}
                        style={{ width: '100%' }}
                        size="small"
                      >
                        {proficiencyLevels.map(level => (
                          <Option key={level} value={level}>{level}</Option>
                        ))}
                      </Select>
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>阅读</label>
                      <Select
                        value={item.reading}
                        onChange={(value) => onLanguageChange(item.id, 'reading', value)}
                        style={{ width: '100%' }}
                        size="small"
                      >
                        {proficiencyLevels.map(level => (
                          <Option key={level} value={level}>{level}</Option>
                        ))}
                      </Select>
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>写作</label>
                      <Select
                        value={item.writing}
                        onChange={(value) => onLanguageChange(item.id, 'writing', value)}
                        style={{ width: '100%' }}
                        size="small"
                      >
                        {proficiencyLevels.map(level => (
                          <Option key={level} value={level}>{level}</Option>
                        ))}
                      </Select>
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>证书（可选）</label>
                      <Input
                        value={item.certificate || ''}
                        onChange={(e) => onLanguageChange(item.id, 'certificate', e.target.value)}
                        placeholder="如：CET-6、TOEFL"
                        size="small"
                      />
                    </CareerFormItem>
                  </CareerFormGrid>
                  <CareerActions $token={token}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeleteLanguage(item.id)}
                    >
                      删除
                    </Button>
                  </CareerActions>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: token.colorText, marginBottom: '8px' }}>
                      {item.language}
                      {item.certificate && (
                        <span style={{ fontSize: '12px', color: token.colorTextSecondary, marginLeft: '8px', fontWeight: 'normal' }}>
                          ({item.certificate})
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: token.colorTextSecondary }}>
                      <span>听力：{item.listening}</span>
                      <span>口语：{item.speaking}</span>
                      <span>阅读：{item.reading}</span>
                      <span>写作：{item.writing}</span>
                    </div>
                  </div>
                </div>
              )}
            </CareerItem>
          ))}
        </div>
      )}
    </CareerSection>
  );
}

