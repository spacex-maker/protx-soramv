import React from 'react';
import { Button, Space, Timeline, DatePicker, Input, Tag } from 'antd';
import { EditOutlined, SaveOutlined, FolderOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, LinkOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import {
  CareerSection,
  CareerTimeline,
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

export default function ProjectsSectionComponent({
  token,
  projects,
  isEditingProjects,
  onEditToggle,
  onSave,
  onProjectChange,
  onAddProject,
  onDeleteProject,
  variants
}) {
  return (
    <CareerSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <FolderOutlined className="icon" />
          项目经验
        </SectionTitle>
        {!isEditingProjects ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑项目
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddProject}
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

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无项目经验，点击"编辑项目"添加
        </div>
      ) : (
        <CareerTimeline $token={token}>
          {projects
            .sort((a, b) => {
              if (a.endDate === '至今') return -1;
              if (b.endDate === '至今') return 1;
              const dateA = new Date(a.endDate || a.startDate);
              const dateB = new Date(b.endDate || b.startDate);
              return dateB - dateA;
            })
            .map((item) => (
              <Timeline.Item key={item.id}>
                {isEditingProjects ? (
                  <CareerItem $token={token}>
                    <CareerFormGrid $token={token}>
                      <CareerFormItem $token={token}>
                        <label>项目名称</label>
                        <Input
                          value={item.name}
                          onChange={(e) => onProjectChange(item.id, 'name', e.target.value)}
                          placeholder="请输入项目名称"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>项目角色</label>
                        <Input
                          value={item.role}
                          onChange={(e) => onProjectChange(item.id, 'role', e.target.value)}
                          placeholder="请输入项目角色"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>开始时间</label>
                        <DatePicker
                          value={item.startDate ? dayjs(item.startDate, 'YYYY-MM') : null}
                          onChange={(date) => onProjectChange(item.id, 'startDate', date ? date.format('YYYY-MM') : '')}
                          picker="month"
                          style={{ width: '100%' }}
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>结束时间</label>
                        <Input
                          value={item.endDate}
                          onChange={(e) => onProjectChange(item.id, 'endDate', e.target.value)}
                          placeholder="如：2022-12 或 至今"
                          size="small"
                        />
                      </CareerFormItem>
                    </CareerFormGrid>
                    <CareerFormItem $token={token}>
                      <label>项目描述</label>
                      <TextArea
                        value={item.description}
                        onChange={(e) => onProjectChange(item.id, 'description', e.target.value)}
                        placeholder="请输入项目描述"
                        rows={3}
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>项目亮点（每行一个）</label>
                      <TextArea
                        value={item.highlights?.join('\n') || ''}
                        onChange={(e) => onProjectChange(item.id, 'highlights', e.target.value.split('\n').filter(h => h.trim()))}
                        placeholder="请输入项目亮点，每行一个"
                        rows={4}
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormItem $token={token}>
                      <label>技术栈（用逗号分隔）</label>
                      <Input
                        value={item.technologies?.join(', ') || ''}
                        onChange={(e) => onProjectChange(item.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                        placeholder="如：Java, Spring Boot, MySQL"
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerFormGrid $token={token}>
                      <CareerFormItem $token={token}>
                        <label>项目链接</label>
                        <Input
                          value={item.link || ''}
                          onChange={(e) => onProjectChange(item.id, 'link', e.target.value)}
                          placeholder="GitHub链接或项目地址"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>演示地址</label>
                        <Input
                          value={item.demo || ''}
                          onChange={(e) => onProjectChange(item.id, 'demo', e.target.value)}
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
                        onClick={() => onDeleteProject(item.id)}
                      >
                        删除
                      </Button>
                    </CareerActions>
                  </CareerItem>
                ) : (
                  <CareerItem $token={token}>
                    <CareerHeader>
                      <div>
                        <CareerCompany $token={token}>{item.name}</CareerCompany>
                        <CareerPosition $token={token}>{item.role}</CareerPosition>
                      </div>
                    </CareerHeader>
                    <CareerMeta $token={token}>
                      <CareerMetaItem $token={token}>
                        <CalendarOutlined />
                        {item.startDate} - {item.endDate}
                      </CareerMetaItem>
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
                    {item.description && (
                      <CareerDescription $token={token}>
                        {item.description}
                      </CareerDescription>
                    )}
                    {item.highlights && item.highlights.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: token.colorText }}>项目亮点：</div>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {item.highlights.map((highlight, idx) => (
                            <li key={idx} style={{ marginBottom: 6, color: token.colorTextSecondary }}>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.technologies && item.technologies.length > 0 && (
                      <CareerTechnologies $token={token}>
                        {item.technologies.map((tech, idx) => (
                          <Tag key={idx} color="blue">
                            {tech}
                          </Tag>
                        ))}
                      </CareerTechnologies>
                    )}
                  </CareerItem>
                )}
              </Timeline.Item>
            ))}
        </CareerTimeline>
      )}
    </CareerSection>
  );
}

