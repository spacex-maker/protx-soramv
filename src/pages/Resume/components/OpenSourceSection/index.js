import React from 'react';
import { Button, Space, Input, Tag } from 'antd';
import { EditOutlined, SaveOutlined, GithubOutlined, PlusOutlined, DeleteOutlined, LinkOutlined, StarOutlined } from '@ant-design/icons';
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
  CareerFormItem,
  CareerFormGrid,
  CareerActions,
  SectionHeader,
  SectionTitle,
  EditButton
} from '../../styles';

const { TextArea } = Input;

export default function OpenSourceSectionComponent({
  token,
  openSource,
  isEditingOpenSource,
  onEditToggle,
  onSave,
  onOpenSourceChange,
  onAddOpenSource,
  onDeleteOpenSource,
  variants
}) {
  return (
    <CareerSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <GithubOutlined className="icon" />
          开源贡献
        </SectionTitle>
        {!isEditingOpenSource ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑贡献
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddOpenSource}
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

      {openSource.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无开源贡献，点击"编辑贡献"添加
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {openSource.map((item) => (
            <CareerItem key={item.id} $token={token}>
              {isEditingOpenSource ? (
                <>
                  <CareerFormGrid $token={token}>
                    <CareerFormItem $token={token}>
                      <label>项目名称</label>
                      <Input
                        value={item.name}
                        onChange={(e) => onOpenSourceChange(item.id, 'name', e.target.value)}
                        placeholder="请输入项目名称"
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>项目链接</label>
                      <Input
                        value={item.link}
                        onChange={(e) => onOpenSourceChange(item.id, 'link', e.target.value)}
                        placeholder="GitHub链接"
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>Star数</label>
                      <Input
                        type="number"
                        value={item.stars}
                        onChange={(e) => onOpenSourceChange(item.id, 'stars', parseInt(e.target.value) || 0)}
                        placeholder="Star数量"
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>角色</label>
                      <Input
                        value={item.role}
                        onChange={(e) => onOpenSourceChange(item.id, 'role', e.target.value)}
                        placeholder="如：Owner、Contributor"
                        size="small"
                      />
                    </CareerFormItem>
                  </CareerFormGrid>
                  <CareerFormItem $token={token}>
                    <label>项目描述</label>
                    <TextArea
                      value={item.description}
                      onChange={(e) => onOpenSourceChange(item.id, 'description', e.target.value)}
                      placeholder="请输入项目描述"
                      rows={3}
                      size="small"
                    />
                  </CareerFormItem>
                  <CareerFormItem $token={token}>
                    <label>贡献内容（每行一个）</label>
                    <TextArea
                      value={item.contributions?.join('\n') || ''}
                      onChange={(e) => onOpenSourceChange(item.id, 'contributions', e.target.value.split('\n').filter(c => c.trim()))}
                      placeholder="请输入贡献内容，每行一个"
                      rows={4}
                      size="small"
                    />
                  </CareerFormItem>
                  <CareerActions $token={token}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeleteOpenSource(item.id)}
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
                      <CareerPosition $token={token}>{item.role}</CareerPosition>
                    </div>
                  </CareerHeader>
                  <CareerMeta $token={token}>
                    {item.link && (
                      <CareerMetaItem $token={token}>
                        <LinkOutlined />
                        <a href={item.link} target="_blank" rel="noopener noreferrer">项目链接</a>
                      </CareerMetaItem>
                    )}
                    {item.stars !== undefined && (
                      <CareerMetaItem $token={token}>
                        <StarOutlined />
                        {item.stars} Stars
                      </CareerMetaItem>
                    )}
                  </CareerMeta>
                  {item.description && (
                    <CareerDescription $token={token}>
                      {item.description}
                    </CareerDescription>
                  )}
                  {item.contributions && item.contributions.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, color: token.colorText }}>贡献内容：</div>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {item.contributions.map((contribution, idx) => (
                          <li key={idx} style={{ marginBottom: 6, color: token.colorTextSecondary }}>
                            {contribution}
                          </li>
                        ))}
                      </ul>
                    </div>
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

