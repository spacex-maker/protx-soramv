import React from 'react';
import { Button, Space, Timeline, DatePicker, Input, Select } from 'antd';
import { EditOutlined, SaveOutlined, TrophyOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, BankOutlined } from '@ant-design/icons';
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
  CareerFormItem,
  CareerFormGrid,
  CareerActions,
  SectionHeader,
  SectionTitle,
  EditButton
} from '../../styles';

const { TextArea } = Input;
const { Option } = Select;

export default function AwardsSectionComponent({
  token,
  awards,
  isEditingAwards,
  onEditToggle,
  onSave,
  onAwardChange,
  onAddAward,
  onDeleteAward,
  variants
}) {
  const awardLevels = ['国际级', '国家级', '省级', '市级', '公司级', '部门级', '校级', '院级'];

  return (
    <CareerSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <TrophyOutlined className="icon" />
          获奖经历
        </SectionTitle>
        {!isEditingAwards ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑奖项
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddAward}
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

      {awards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无获奖经历，点击"编辑奖项"添加
        </div>
      ) : (
        <CareerTimeline $token={token}>
          {awards
            .sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateB - dateA;
            })
            .map((item) => (
              <Timeline.Item key={item.id}>
                {isEditingAwards ? (
                  <CareerItem $token={token}>
                    <CareerFormGrid $token={token}>
                      <CareerFormItem $token={token}>
                        <label>奖项名称</label>
                        <Input
                          value={item.name}
                          onChange={(e) => onAwardChange(item.id, 'name', e.target.value)}
                          placeholder="请输入奖项名称"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>颁发机构</label>
                        <Input
                          value={item.issuer}
                          onChange={(e) => onAwardChange(item.id, 'issuer', e.target.value)}
                          placeholder="请输入颁发机构"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>获奖时间</label>
                        <DatePicker
                          value={item.date ? dayjs(item.date, 'YYYY-MM') : null}
                          onChange={(date) => onAwardChange(item.id, 'date', date ? date.format('YYYY-MM') : '')}
                          picker="month"
                          style={{ width: '100%' }}
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>奖项级别</label>
                        <Select
                          value={item.level}
                          onChange={(value) => onAwardChange(item.id, 'level', value)}
                          style={{ width: '100%' }}
                          size="small"
                        >
                          {awardLevels.map(level => (
                            <Option key={level} value={level}>{level}</Option>
                          ))}
                        </Select>
                      </CareerFormItem>
                    </CareerFormGrid>
                    <CareerFormItem $token={token}>
                      <label>奖项描述</label>
                      <TextArea
                        value={item.description || ''}
                        onChange={(e) => onAwardChange(item.id, 'description', e.target.value)}
                        placeholder="请输入奖项描述（可选）"
                        rows={3}
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerActions $token={token}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteAward(item.id)}
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
                        <CareerPosition $token={token}>{item.issuer}</CareerPosition>
                      </div>
                    </CareerHeader>
                    <CareerMeta $token={token}>
                      <CareerMetaItem $token={token}>
                        <CalendarOutlined />
                        {item.date}
                      </CareerMetaItem>
                      <CareerMetaItem $token={token}>
                        <TrophyOutlined />
                        {item.level}
                      </CareerMetaItem>
                    </CareerMeta>
                    {item.description && (
                      <CareerDescription $token={token}>
                        {item.description}
                      </CareerDescription>
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

