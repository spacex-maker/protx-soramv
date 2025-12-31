import React from 'react';
import { Button, Space, Timeline, DatePicker, Input } from 'antd';
import { EditOutlined, SaveOutlined, SafetyCertificateOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, BankOutlined } from '@ant-design/icons';
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

export default function CertificationsSectionComponent({
  token,
  certifications,
  isEditingCertifications,
  onEditToggle,
  onSave,
  onCertificationChange,
  onAddCertification,
  onDeleteCertification,
  variants
}) {
  return (
    <CareerSection $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <SafetyCertificateOutlined className="icon" />
          证书/资质
        </SectionTitle>
        {!isEditingCertifications ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑证书
          </EditButton>
        ) : (
          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={onAddCertification}
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

      {certifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: token.colorTextSecondary }}>
          暂无证书/资质，点击"编辑证书"添加
        </div>
      ) : (
        <CareerTimeline $token={token}>
          {certifications
            .sort((a, b) => {
              const dateA = new Date(a.issueDate);
              const dateB = new Date(b.issueDate);
              return dateB - dateA;
            })
            .map((item) => (
              <Timeline.Item key={item.id}>
                {isEditingCertifications ? (
                  <CareerItem $token={token}>
                    <CareerFormGrid $token={token}>
                      <CareerFormItem $token={token}>
                        <label>证书名称</label>
                        <Input
                          value={item.name}
                          onChange={(e) => onCertificationChange(item.id, 'name', e.target.value)}
                          placeholder="请输入证书名称"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>颁发机构</label>
                        <Input
                          value={item.issuer}
                          onChange={(e) => onCertificationChange(item.id, 'issuer', e.target.value)}
                          placeholder="请输入颁发机构"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>获得时间</label>
                        <DatePicker
                          value={item.issueDate ? dayjs(item.issueDate, 'YYYY-MM') : null}
                          onChange={(date) => onCertificationChange(item.id, 'issueDate', date ? date.format('YYYY-MM') : '')}
                          picker="month"
                          style={{ width: '100%' }}
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>有效期至</label>
                        <Input
                          value={item.expiryDate || ''}
                          onChange={(e) => onCertificationChange(item.id, 'expiryDate', e.target.value)}
                          placeholder="如：2024-03 或 永久有效"
                          size="small"
                        />
                      </CareerFormItem>
                      <CareerFormItem $token={token}>
                        <label>证书编号</label>
                        <Input
                          value={item.credentialId || ''}
                          onChange={(e) => onCertificationChange(item.id, 'credentialId', e.target.value)}
                          placeholder="请输入证书编号（可选）"
                          size="small"
                        />
                      </CareerFormItem>
                    </CareerFormGrid>
                    <CareerFormItem $token={token}>
                      <label>证书描述</label>
                      <TextArea
                        value={item.description || ''}
                        onChange={(e) => onCertificationChange(item.id, 'description', e.target.value)}
                        placeholder="请输入证书描述（可选）"
                        rows={3}
                        size="small"
                      />
                    </CareerFormItem>
                    <CareerActions $token={token}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteCertification(item.id)}
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
                        {item.issueDate}
                        {item.expiryDate && ` - ${item.expiryDate}`}
                      </CareerMetaItem>
                      {item.credentialId && (
                        <CareerMetaItem $token={token}>
                          <BankOutlined />
                          编号：{item.credentialId}
                        </CareerMetaItem>
                      )}
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

