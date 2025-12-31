import React from 'react';
import { Button, Space, Input, Tag, Select } from 'antd';
import { EditOutlined, SaveOutlined, AppstoreOutlined, PlusOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  CareerSection,
  CareerItem,
  CareerHeader,
  CareerCompany,
  CareerPosition,
  CareerMeta,
  CareerMetaItem,
  CareerDescription,
  CareerTechnologies,
  CareerFormItem,
  CareerFormGrid,
  CareerActions,
  SectionHeader,
  SectionTitle,
  EditButton
} from '../../styles';

const { TextArea } = Input;
const { Option } = Select;

export default function PortfolioSectionComponent({
  token,
  portfolio,
  isEditingPortfolio,
  onEditToggle,
  onSave,
  onPortfolioChange,
  onAddPortfolio,
  onDeletePortfolio,
  variants
}) {
  const categories = ['Web应用', '移动应用', '桌面应用', '中间件', '工具库', '其他'];

  return (
    <CareerSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <AppstoreOutlined className="icon" />
          作品集
        </SectionTitle>
        {!isEditingPortfolio ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑作品
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddPortfolio}
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

      {portfolio.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无作品，点击"编辑作品"添加
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {portfolio.map((item) => (
            <CareerItem key={item.id} $token={token}>
              {isEditingPortfolio ? (
                <>
                  <CareerFormGrid $token={token}>
                    <CareerFormItem $token={token}>
                      <label>作品名称</label>
                      <Input
                        value={item.name}
                        onChange={(e) => onPortfolioChange(item.id, 'name', e.target.value)}
                        placeholder="请输入作品名称"
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>作品分类</label>
                      <Select
                        value={item.category}
                        onChange={(value) => onPortfolioChange(item.id, 'category', value)}
                        style={{ width: '100%' }}
                        size="small"
                      >
                        {categories.map(cat => (
                          <Option key={cat} value={cat}>{cat}</Option>
                        ))}
                      </Select>
                    </CareerFormItem>
                  </CareerFormGrid>
                  <CareerFormItem $token={token}>
                    <label>作品描述</label>
                    <TextArea
                      value={item.description}
                      onChange={(e) => onPortfolioChange(item.id, 'description', e.target.value)}
                      placeholder="请输入作品描述"
                      rows={3}
                      size="small"
                    />
                  </CareerFormItem>
                  <CareerFormItem $token={token}>
                    <label>技术栈（用逗号分隔）</label>
                    <Input
                      value={item.technologies?.join(', ') || ''}
                      onChange={(e) => onPortfolioChange(item.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      placeholder="如：Java, Spring Boot, Vue.js"
                      size="small"
                    />
                  </CareerFormItem>
                  <CareerFormGrid $token={token}>
                    <CareerFormItem $token={token}>
                      <label>项目链接</label>
                      <Input
                        value={item.link || ''}
                        onChange={(e) => onPortfolioChange(item.id, 'link', e.target.value)}
                        placeholder="GitHub链接或项目地址"
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>演示地址</label>
                      <Input
                        value={item.demo || ''}
                        onChange={(e) => onPortfolioChange(item.id, 'demo', e.target.value)}
                        placeholder="在线演示地址"
                        size="small"
                      />
                    </CareerFormItem>
                  </CareerFormGrid>
                  <CareerActions $token={token}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeletePortfolio(item.id)}
                    >
                      删除
                    </Button>
                  </CareerActions>
                </>
              ) : (
                <>
                  <CareerHeader>
                    <div>
                      <CareerCompany $token={token}>{item.name}</CareerCompany>
                      {item.category && (
                        <CareerPosition $token={token}>{item.category}</CareerPosition>
                      )}
                    </div>
                  </CareerHeader>
                  {item.description && (
                    <CareerDescription $token={token} style={{ marginTop: 8 }}>
                      {item.description}
                    </CareerDescription>
                  )}
                  {item.technologies && item.technologies.length > 0 && (
                    <CareerTechnologies $token={token} style={{ marginTop: 12 }}>
                      {item.technologies.map((tech, idx) => (
                        <Tag key={idx} color="blue">
                          {tech}
                        </Tag>
                      ))}
                    </CareerTechnologies>
                  )}
                  {(item.link || item.demo) && (
                    <CareerMeta $token={token} style={{ marginTop: 12 }}>
                      {item.link && (
                        <CareerMetaItem $token={token}>
                          <LinkOutlined />
                          <a href={item.link} target="_blank" rel="noopener noreferrer">项目链接</a>
                        </CareerMetaItem>
                      )}
                      {item.demo && (
                        <CareerMetaItem $token={token}>
                          <LinkOutlined />
                          <a href={item.demo} target="_blank" rel="noopener noreferrer">演示地址</a>
                        </CareerMetaItem>
                      )}
                    </CareerMeta>
                  )}
                </>
              )}
            </CareerItem>
          ))}
        </div>
      )}
    </CareerSection>
  );
}

