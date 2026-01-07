import React from 'react';
import { Button, Space, Timeline, DatePicker, Select, Input } from 'antd';
import { EditOutlined, SaveOutlined, BookOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import {
  EducationSection,
  EducationTimeline,
  EducationItem,
  EducationHeader,
  EducationTitle,
  EducationSchool,
  EducationTime,
  EducationDescription,
  EducationActions,
  EducationFormItem,
  EducationFormGrid,
  SectionHeader,
  SectionTitle,
  EditButton
} from '../../styles';

export default function EducationSectionComponent({
  token,
  education,
  isEditingEducation,
  onEditToggle,
  onSave,
  onEducationChange,
  onAddEducation,
  onDeleteEducation,
  variants
}) {
  return (
    <EducationSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <BookOutlined className="icon" />
          教育经历
        </SectionTitle>
        {!isEditingEducation ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑教育
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddEducation}
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

      {education.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无教育经历，点击"编辑教育"添加
        </div>
      ) : (
        <EducationTimeline $token={token}>
          {education
            .sort((a, b) => {
              // 按结束时间倒序排列
              const dateA = new Date(a.endDate || a.startDate);
              const dateB = new Date(b.endDate || b.startDate);
              return dateB - dateA;
            })
            .map((item) => (
              <Timeline.Item key={item.id}>
                {isEditingEducation ? (
                  <EducationItem $token={token}>
                    <EducationFormGrid $token={token}>
                      <EducationFormItem $token={token}>
                        <label>学历</label>
                        <Select
                          value={item.degree}
                          onChange={(value) => onEducationChange(item.id, 'degree', value)}
                          style={{ width: '100%' }}
                          options={[
                            { value: '博士', label: '博士' },
                            { value: '硕士', label: '硕士' },
                            { value: '本科', label: '本科' },
                            { value: '专科', label: '专科' },
                            { value: '高中', label: '高中' }
                          ]}
                        />
                      </EducationFormItem>
                      <EducationFormItem $token={token}>
                        <label>专业</label>
                        <Input
                          value={item.major}
                          onChange={(e) => onEducationChange(item.id, 'major', e.target.value)}
                          placeholder="请输入专业名称"
                        />
                      </EducationFormItem>
                      <EducationFormItem $token={token} style={{ gridColumn: '1 / -1' }}>
                        <label>学校</label>
                        <Input
                          value={item.school}
                          onChange={(e) => onEducationChange(item.id, 'school', e.target.value)}
                          placeholder="请输入学校名称"
                        />
                      </EducationFormItem>
                      <EducationFormItem $token={token}>
                        <label>开始时间</label>
                        <DatePicker
                          picker="month"
                          value={item.startDate ? dayjs(item.startDate) : null}
                          onChange={(date) => onEducationChange(item.id, 'startDate', date ? date.format('YYYY-MM') : '')}
                          style={{ width: '100%' }}
                        />
                      </EducationFormItem>
                      <EducationFormItem $token={token}>
                        <label>结束时间</label>
                        <DatePicker
                          picker="month"
                          value={item.endDate ? dayjs(item.endDate) : null}
                          onChange={(date) => onEducationChange(item.id, 'endDate', date ? date.format('YYYY-MM') : '')}
                          style={{ width: '100%' }}
                        />
                      </EducationFormItem>
                      <EducationFormItem $token={token} style={{ gridColumn: '1 / -1' }}>
                        <label>描述</label>
                        <Input.TextArea
                          value={item.description}
                          onChange={(e) => onEducationChange(item.id, 'description', e.target.value)}
                          placeholder="请输入教育经历描述（如：主修课程、GPA、荣誉等）"
                          rows={2}
                        />
                      </EducationFormItem>
                    </EducationFormGrid>
                    <EducationActions>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteEducation(item.id)}
                      >
                        删除
                      </Button>
                    </EducationActions>
                  </EducationItem>
                ) : (
                  <EducationItem $token={token}>
                    <EducationHeader>
                      <div>
                        <EducationTitle $token={token}>
                          {item.degree} · {item.major}
                        </EducationTitle>
                        <EducationSchool $token={token}>
                          {item.school}
                        </EducationSchool>
                        <EducationTime $token={token}>
                          {item.startDate} - {item.endDate || '至今'}
                        </EducationTime>
                      </div>
                    </EducationHeader>
                    {item.description && (
                      <EducationDescription $token={token}>
                        {item.description}
                      </EducationDescription>
                    )}
                  </EducationItem>
                )}
              </Timeline.Item>
            ))}
        </EducationTimeline>
      )}
    </EducationSection>
  );
}

