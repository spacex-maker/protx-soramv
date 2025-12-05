import React from 'react';
import { Button } from 'antd';
import { SyncOutlined, BulbOutlined } from '@ant-design/icons';
import { Label, StyledTextArea } from '../styles';

interface PromptInputProps {
  prompt: string;
  originalPrompt: string | null;
  enhancingPrompt: boolean;
  onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEnhancePrompt: () => void;
  onRestorePrompt: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  originalPrompt,
  enhancingPrompt,
  onPromptChange,
  onEnhancePrompt,
  onRestorePrompt,
}) => {
  return (
    <div style={{ marginBottom: 12 }}>
      <Label style={{ marginBottom: 8 }}>
        <span>提示词</span>
        <div style={{ float: 'right', display: 'flex', gap: 6, alignItems: 'center' }}>
          {originalPrompt && (
            <Button 
              type="text" 
              size="small"
              icon={<SyncOutlined />}
              onClick={onRestorePrompt}
              className="nodrag"
              style={{ 
                fontSize: 11,
                height: 28,
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                borderRadius: 14,
                color: '#666',
              }}
            >
              恢复
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<BulbOutlined />}
            loading={enhancingPrompt}
            onClick={onEnhancePrompt}
            className="nodrag"
            style={{ 
              float: 'right',
              fontSize: 12,
              height: 28,
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              marginTop: -2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
            }}
          >
            {prompt.trim() ? 'AI 丰富提示词' : 'AI 生成提示词'}
          </Button>
        </div>
      </Label>
      <StyledTextArea
        value={prompt}
        onChange={onPromptChange}
        placeholder="输入运动引导描述...（可从上游提示词节点获取）"
        rows={2}
        maxLength={1500}
        showCount
        autoSize={{ minRows: 2, maxRows: 4 }}
        className="nodrag"
      />
    </div>
  );
};

