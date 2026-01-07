import React from 'react';
import { Button, Input } from 'antd';
import { EditOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  SummarySection as SummarySectionStyled,
  SectionTitle,
  EditButton,
  SectionHeader
} from '../../styles';

const { TextArea } = Input;

export default function SummarySectionComponent({
  token,
  summary,
  isEditingSummary,
  onEditToggle,
  onSave,
  onSummaryChange,
  variants
}) {
  return (
    <SummarySectionStyled $token={token} variants={variants}>
      <SectionHeader $token={token}>
        <SectionTitle level={2} $token={token}>
          <UserOutlined className="icon" />
          个人简介
        </SectionTitle>
        {!isEditingSummary ? (
          <EditButton
            $token={token}
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditToggle(true)}
          >
            编辑简介
          </EditButton>
        ) : (
          <EditButton
            $token={token}
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSave}
          >
            保存更改
          </EditButton>
        )}
      </SectionHeader>
      
      {isEditingSummary ? (
        <TextArea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="请输入个人简介"
          rows={6}
          style={{
            marginTop: 16,
            fontSize: 16,
            lineHeight: 1.8,
            borderRadius: '12px'
          }}
        />
      ) : (
        <div style={{ 
          fontSize: 16, 
          lineHeight: 1.8, 
          color: token.colorTextSecondary, 
          marginTop: 16,
          whiteSpace: 'pre-wrap'
        }}>
          {summary || '暂无个人简介，点击"编辑简介"添加'}
        </div>
      )}
    </SummarySectionStyled>
  );
}

