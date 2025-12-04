import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Input, Select, Button, Image, message } from 'antd';
import { UploadOutlined, DeleteOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import type { UploadFile, UploadProps } from 'antd';
import styled from 'styled-components';
import { base } from '../../../../../../api/base';

const { Option } = Select;

const NodeContainer = styled.div`
  min-width: 320px;
  background: ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 20px;
  overflow: visible;
  transition: border-color 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#52c41a' : '#52c41a'};
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
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#52c41a' : '#52c41a'};
`;

const Label = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? '#999' : '#666'};
  margin-bottom: 8px;
  font-weight: 500;
`;

const UploadArea = styled.div`
  .ant-upload-drag {
    border-radius: 12px;
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
    border: 1px dashed ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
    transition: all 0.2s;
    
    &:hover {
      border-color: #52c41a;
      background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#f0f0f0'};
    }
  }
`;

const ImagePreview = styled.div`
  margin-top: 10px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#444' : '#d9d9d9'};
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  
  .ant-image {
    width: 100%;
    display: block;
  }
  
  .ant-image-img {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: contain;
  }
`;

const ImageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
`;

const UrlInputSection = styled.div`
  margin-top: 10px;
`;

const StyledInput = styled(Input)`
  border-radius: 12px;
  border: none;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'};
  color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  
  &:focus {
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fff'};
    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
  border-radius: 12px;
  
  .ant-select-selector {
    border: none !important;
    border-radius: 12px !important;
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#fafafa'} !important;
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'} !important;
  }
  
  &:hover .ant-select-selector {
    background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'} !important;
  }
  
  &.ant-select-focused .ant-select-selector {
    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
  }
`;

const StyledHandle = styled(Handle)`
  width: 10px;
  height: 10px;
  background: #52c41a;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#2a2a2a' : '#fff'};
  
  &.react-flow__handle-right {
    right: -6px;
  }
  
  &.react-flow__handle-left {
    left: -6px;
  }
`;

interface ImageInputNodeData {
  label?: string;
  url?: string;
  fit?: string;
  nodeKey?: string;
  nodeConfig?: any;
  file?: File; // 文件引用，用于后续上传
}

const ImageInputNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as ImageInputNodeData;
  const { deleteElements } = useReactFlow();
  const [imageUrl, setImageUrl] = useState(nodeData?.url || '');
  const [fit, setFit] = useState(nodeData?.fit || 'contain');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 同步数据到节点
  useEffect(() => {
    if (nodeData) {
      if (imageUrl) {
        nodeData.url = imageUrl;
      }
      nodeData.fit = fit;
    }
  }, [imageUrl, fit, nodeData]);

  // 处理文件上传
  const handleUpload: UploadProps['customRequest'] = useCallback(async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      // 显示上传中状态
      message.loading({ content: '上传中...', key: 'upload', duration: 0 });
      
      // 调用后端接口上传图片
      const response = await base.uploadWorkflowImage(file as File);
      
      if (response.success && response.data) {
        const url = response.data;
        setImageUrl(url);
        
        // 节点数据中存储服务器返回的 URL
        if (nodeData) {
          nodeData.url = url;
        }
        
        onSuccess?.(url);
        message.success({ content: '图片上传成功', key: 'upload' });
      } else {
        onError?.(new Error(response.message || '上传失败'));
        message.error({ content: response.message || '图片上传失败', key: 'upload' });
      }
    } catch (error: any) {
      console.error('图片上传失败:', error);
      onError?.(error);
      message.error({ content: '图片上传失败: ' + (error.message || '未知错误'), key: 'upload' });
    }
  }, [nodeData]);

  // 处理文件列表变化
  const handleChange = useCallback((info: any) => {
    let newFileList = [...info.fileList];
    
    // 只保留最后一个文件
    newFileList = newFileList.slice(-1);
    
    // 文件上传由 customRequest 处理，这里只更新文件列表
    setFileList(newFileList);
    
    // 如果上传成功，URL 已经在 handleUpload 中设置了
    if (info.file.status === 'done' && info.file.response) {
      const url = info.file.response;
      setImageUrl(url);
      if (nodeData) {
        nodeData.url = url;
      }
    }
  }, [nodeData]);

  // 处理URL输入
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setImageUrl(value);
    if (nodeData) {
      nodeData.url = value;
    }
  }, [nodeData]);

  // 处理适配模式变化
  const handleFitChange = useCallback((value: string) => {
    setFit(value);
    if (nodeData) {
      nodeData.fit = value;
    }
  }, [nodeData]);

  // 清除图片
  const handleClear = useCallback(() => {
    setImageUrl('');
    setFileList([]);
    if (nodeData) {
      nodeData.url = '';
    }
    message.success('已清除图片');
  }, [nodeData]);

  // 预览图片
  const handlePreview = useCallback(() => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
      setPreviewVisible(true);
    }
  }, [imageUrl]);

  // 删除节点
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  }, [id, deleteElements]);

  return (
    <NodeContainer style={{ 
      borderColor: selected ? '#52c41a' : undefined,
    }}>
      <StyledHandle type="target" position={Position.Left} />
      
      <NodeContent>
        <IconContainer>
          <PictureOutlined style={{ fontSize: 24 }} />
        </IconContainer>
        
        {!imageUrl ? (
          <UploadArea className="nodrag">
            <Upload.Dragger
              name="file"
              accept="image/*"
              fileList={fileList}
              customRequest={handleUpload}
              onChange={handleChange}
              maxCount={1}
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              </p>
              <p className="ant-upload-text" style={{ color: '#666', marginTop: 8 }}>
                点击或拖拽图片到此区域上传
              </p>
              <p className="ant-upload-hint" style={{ color: '#999', fontSize: 12 }}>
                支持 JPG、PNG、GIF 等格式
              </p>
            </Upload.Dragger>
          </UploadArea>
        ) : (
          <>
            <ImagePreview className="nodrag">
              <Image
                src={imageUrl}
                alt="预览"
                preview={{
                  visible: previewVisible,
                  src: previewImage,
                  onVisibleChange: (visible) => setPreviewVisible(visible),
                }}
                style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }}
                loading="lazy"
                decoding="async"
              />
            </ImagePreview>
            <ImageActions>
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined />}
                onClick={handlePreview}
                style={{ color: '#52c41a' }}
                className="nodrag"
              >
                预览
              </Button>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleClear}
                className="nodrag"
              >
                清除
              </Button>
            </ImageActions>
          </>
        )}
        
        <UrlInputSection>
          <Label>或输入图片URL</Label>
          <StyledInput
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            prefix={<LinkOutlined style={{ color: '#52c41a' }} />}
            allowClear
            className="nodrag"
          />
        </UrlInputSection>
        
        <div style={{ marginTop: 10 }}>
          <Label>图片适配模式</Label>
          <StyledSelect
            value={fit}
            onChange={(value) => handleFitChange(value as string)}
            className="nodrag"
            popupClassName="nodrag"
          >
            <Option value="contain">包含（保持比例）</Option>
            <Option value="cover">覆盖（填充）</Option>
            <Option value="fill">填充（拉伸）</Option>
            <Option value="none">原始大小</Option>
            <Option value="scale-down">缩小适应</Option>
          </StyledSelect>
        </div>
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

// 使用 React.memo 优化性能，避免不必要的重渲染
export default React.memo(ImageInputNode);

