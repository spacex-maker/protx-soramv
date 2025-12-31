import React from 'react';
import { Button, Space, Timeline, DatePicker, Input, Tag } from 'antd';
import { EditOutlined, SaveOutlined, BankOutlined, PlusOutlined, DeleteOutlined, EnvironmentOutlined, CalendarOutlined, ApartmentOutlined } from '@ant-design/icons';
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
  CareerResponsibilities,
  CareerAchievements,
  CareerTechnologies,
  CareerFormItem,
  CareerFormGrid,
  CareerActions,
  SectionHeader,
  SectionTitle,
  EditButton
} from '../../styles';

const { TextArea } = Input;

export default function CareerSectionComponent({
  token,
  career,
  isEditingCareer,
  onEditToggle,
  onSave,
  onCareerChange,
  onAddCareer,
  onDeleteCareer,
  variants
}) {
  return (
    <CareerSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <BankOutlined className="icon" />
          职业生涯
        </SectionTitle>
        {!isEditingCareer ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑履历
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddCareer}
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

      {career.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无工作经历，点击"编辑履历"添加
        </div>
      ) : (
        <CareerTimeline $token={token}>
          {career
            .sort((a, b) => {
              // 按结束时间倒序排列，"至今"排在最前面
              if (a.endDate === '至今') return -1;
              if (b.endDate === '至今') return 1;
              const dateA = new Date(a.endDate || a.startDate);
              const dateB = new Date(b.endDate || b.startDate);
              return dateB - dateA;
            })
            .map((item) => (
              <Timeline.Item key={item.id}>
                {isEditingCareer ? (
                  <CareerItem $token={token}>
                    <CareerFormGrid $token={token}>
                      <CareerFormItem $token={token}>
                        <label>公司名称</label>
                        <Input
                          value={item.company}
                          onChange={(e) => onCareerChange(item.id, 'company', e.target.value)}
                          placeholder="请输入公司名称"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>职位</label>
                        <Input
                          value={item.position}
                          onChange={(e) => onCareerChange(item.id, 'position', e.target.value)}
                          placeholder="请输入职位名称"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>工作地点</label>
                        <Input
                          value={item.location}
                          onChange={(e) => onCareerChange(item.id, 'location', e.target.value)}
                          placeholder="请输入工作地点"
                          prefix={<EnvironmentOutlined />}
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>部门</label>
                        <Input
                          value={item.department}
                          onChange={(e) => onCareerChange(item.id, 'department', e.target.value)}
                          placeholder="请输入部门名称"
                          prefix={<ApartmentOutlined />}
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>开始时间</label>
                        <DatePicker
                          picker="month"
                          value={item.startDate ? dayjs(item.startDate) : null}
                          onChange={(date) => onCareerChange(item.id, 'startDate', date ? date.format('YYYY-MM') : '')}
                          style={{ width: '100%' }}
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>结束时间</label>
                        <Input
                          value={item.endDate}
                          onChange={(e) => onCareerChange(item.id, 'endDate', e.target.value)}
                          placeholder="如：2022-06 或 至今"
                          prefix={<CalendarOutlined />}
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token} style={{ gridColumn: '1 / -1' }}>
                        <label>工作描述</label>
                        <TextArea
                          value={item.description}
                          onChange={(e) => onCareerChange(item.id, 'description', e.target.value)}
                          placeholder="请输入工作描述"
                          rows={2}
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token} style={{ gridColumn: '1 / -1' }}>
                        <label>主要职责（每行一项）</label>
                        <TextArea
                          value={item.responsibilities ? item.responsibilities.join('\n') : ''}
                          onChange={(e) => onCareerChange(item.id, 'responsibilities', e.target.value.split('\n').filter(line => line.trim()))}
                          placeholder="请输入主要职责，每行一项"
                          rows={3}
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token} style={{ gridColumn: '1 / -1' }}>
                        <label>主要成就（每行一项）</label>
                        <TextArea
                          value={item.achievements ? item.achievements.join('\n') : ''}
                          onChange={(e) => onCareerChange(item.id, 'achievements', e.target.value.split('\n').filter(line => line.trim()))}
                          placeholder="请输入主要成就，每行一项"
                          rows={2}
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token} style={{ gridColumn: '1 / -1' }}>
                        <label>使用技术（用逗号分隔）</label>
                        <Input
                          value={item.technologies ? item.technologies.join(', ') : ''}
                          onChange={(e) => onCareerChange(item.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                          placeholder="如：Java, Spring Boot, MySQL, Redis"
                        />
                      </CareerFormItem>
                    </CareerFormGrid>
                    <CareerActions $token={token}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteCareer(item.id)}
                      >
                        删除
                      </Button>
                    </CareerActions>
                  </CareerItem>
                ) : (
                  <CareerItem $token={token}>
                    <CareerHeader>
                      <div>
                        <CareerCompany $token={token}>
                          {item.company}
                        </CareerCompany>
                        <CareerPosition $token={token}>
                          {item.position}
                        </CareerPosition>
                        <CareerMeta $token={token}>
                          {item.location && (
                            <CareerMetaItem $token={token}>
                              <EnvironmentOutlined /> {item.location}
                            </CareerMetaItem>
                          )}
                          {item.department && (
                            <CareerMetaItem $token={token}>
                              <ApartmentOutlined /> {item.department}
                            </CareerMetaItem>
                          )}
                          <CareerMetaItem $token={token}>
                            <CalendarOutlined /> {item.startDate} - {item.endDate || '至今'}
                          </CareerMetaItem>
                        </CareerMeta>
                      </div>
                    </CareerHeader>
                    {item.description && (
                      <CareerDescription $token={token}>
                        {item.description}
                      </CareerDescription>
                    )}
                    {item.responsibilities && item.responsibilities.length > 0 && (
                      <CareerResponsibilities $token={token}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: token.colorText }}>主要职责：</div>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {item.responsibilities.map((resp, idx) => (
                            <li key={idx} style={{ marginBottom: 6, color: token.colorTextSecondary }}>
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </CareerResponsibilities>
                    )}
                    {item.achievements && item.achievements.length > 0 && (
                      <CareerAchievements $token={token}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: token.colorText }}>主要成就：</div>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {item.achievements.map((ach, idx) => (
                            <li key={idx} style={{ marginBottom: 6, color: token.colorTextSecondary }}>
                              {ach}
                            </li>
                          ))}
                        </ul>
                      </CareerAchievements>
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

