import React, { useState, useCallback } from 'react';
import { Input, Button, message } from 'antd';
import { DeleteOutlined, BulbOutlined, FileTextOutlined } from '@ant-design/icons';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import styled from 'styled-components';
import instance from 'api/axios';

const { TextArea } = Input;

const NodeContainer = styled.div`
  min-width: 280px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 20px;
  overflow: visible;
  transition: border-color 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#1890ff'};
  }
`;

const DeleteButtonWrapper = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${NodeContainer}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled(Button)`
  width: 100%;
  height: 100%;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ff4d4f;
  border: 1px solid #fff;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background 0.2s, transform 0.2s;
  
  &:hover {
    background: #ff7875;
    transform: scale(1.1);
  }
  
  .anticon {
    font-size: 12px;
  }
`;

const NodeIcon = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.mode === 'dark' ? '#1890ff' : '#1890ff'};
  pointer-events: none;
  user-select: none;
  z-index: 1;
`;

const NodeName = styled.div`
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 10px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#999'};
  pointer-events: none;
  user-select: none;
`;

const NodeContent = styled.div`
  padding: 12px;
  padding-top: 36px;
  
  /* 阻止在内容区域拖拽节点 */
  input, textarea, button, .ant-select, .ant-upload {
    pointer-events: auto;
  }
`;

const Label = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GenerateButton = styled(Button)`
  font-size: 11px;
  height: 24px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  }
`;

const StyledTextArea = styled(TextArea)`
  border: none;
  border-radius: 12px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  
  &:focus {
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  &::placeholder {
    color: ${props => props.theme.mode === 'dark' ? '#666' : '#bfbfbf'};
  }
`;

const NegativePromptSection = styled.div`
  margin-top: 10px;
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #1890ff;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  
  &.react-flow__handle-right {
    right: -6px;
  }
  
  &.react-flow__handle-left {
    left: -6px;
  }
`;

interface PromptInputNodeData {
  label?: string;
  text?: string;
  negative_prompt?: string;
  nodeKey?: string;
  nodeConfig?: any;
}

const PromptInputNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as PromptInputNodeData;
  const { deleteElements } = useReactFlow();
  const [text, setText] = useState(nodeData?.text || '');
  const [negativePrompt, setNegativePrompt] = useState(nodeData?.negative_prompt || '');
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    // 更新节点数据
    if (nodeData) {
      nodeData.text = value;
    }
  }, [nodeData]);

  const handleNegativePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNegativePrompt(value);
    // 更新节点数据
    if (nodeData) {
      nodeData.negative_prompt = value;
    }
  }, [nodeData]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  // AI生成提示词
  const handleGeneratePrompt = useCallback(async () => {
    setGeneratingPrompt(true);
    try {
      const requestData: any = {
        language: 'zh',
      };
      
      // 如果有基础提示词，则传递
      if (text.trim()) {
        requestData.basePrompt = text.trim();
      }
      
      const response = await instance.post('/productx/sa-ai-models/image/prompt/generate', requestData);

      if (response.data.success && response.data.data) {
        // 处理响应数据：可能是 { prompt: "..." } 或直接是字符串
        const generatedPrompt = 
          typeof response.data.data === 'string' 
            ? response.data.data 
            : response.data.data.prompt || response.data.data;
        
        if (generatedPrompt) {
          // 将生成的提示词填充到输入框
          setText(generatedPrompt);
          if (nodeData) {
            nodeData.text = generatedPrompt;
          }
          message.success('提示词生成成功！');
        } else {
          message.warning('未生成提示词，请重试');
        }
      } else {
        message.error(response.data.message || '提示词生成失败，请重试');
      }
    } catch (error: any) {
      console.error('生成提示词失败:', error);
      message.error(
        error.response?.data?.message || '提示词生成失败，请重试'
      );
    } finally {
      setGeneratingPrompt(false);
    }
  }, [text, nodeData]);

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#1890ff' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeIcon>
        <FileTextOutlined style={{ fontSize: 18 }} />
      </NodeIcon>
      
      <NodeContent>
        <Label>
          <span>提示词</span>
          <GenerateButton
            type="text"
            size="small"
            icon={<BulbOutlined />}
            loading={generatingPrompt}
            onClick={handleGeneratePrompt}
            className="nodrag"
          >
            {text.trim() ? 'AI 丰富提示词' : 'AI 生成提示词'}
          </GenerateButton>
        </Label>
        <StyledTextArea
          value={text}
          onChange={handleTextChange}
          placeholder="输入你的创意描述..."
          rows={3}
          maxLength={500}
          showCount
          autoSize={{ minRows: 3, maxRows: 6 }}
          className="nodrag"
        />
        
        <NegativePromptSection>
          <Label>负面提示词（可选）</Label>
          <StyledTextArea
            value={negativePrompt}
            onChange={handleNegativePromptChange}
            placeholder="描述不想要的内容..."
            rows={2}
            maxLength={200}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="nodrag"
          />
        </NegativePromptSection>
      </NodeContent>
      
      <StyledHandle type="source" position={Position.Right} />
      
      {nodeData?.label || nodeData?.nodeConfig?.nodeName ? (
        <NodeName>
          {nodeData?.label || nodeData?.nodeConfig?.nodeName}
        </NodeName>
      ) : null}
      
      <DeleteButtonWrapper>
        <DeleteButton
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          size="small"
        />
      </DeleteButtonWrapper>
    </NodeContainer>
  );
};

export default PromptInputNode;

