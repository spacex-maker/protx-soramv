import React from 'react';
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { Label, UploadArea, ImagePreview, FloatingReplaceButton, FloatingButton } from '../styles';
import { ImageToVideoNodeData } from '../types';

interface ImageUploadProps {
  id: string;
  originalImageUrl: string | null;
  isDragging: boolean;
  nodeData: ImageToVideoNodeData | null;
  onFileSelect: (file: File | null) => void;
  onDelete: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  id,
  originalImageUrl,
  isDragging,
  onDelete,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
}) => {
  return (
    <div style={{ marginBottom: 12 }}>
      <Label>参考图片</Label>
      {originalImageUrl ? (
        <ImagePreview className="nodrag">
          <img src={originalImageUrl} alt="参考图片" />
          <FloatingReplaceButton>
            <FloatingButton
              className="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="删除图片并断开连接"
            >
              <DeleteOutlined />
            </FloatingButton>
          </FloatingReplaceButton>
        </ImagePreview>
      ) : (
        <UploadArea
          $isDragging={isDragging}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => document.getElementById(`i2v-upload-${id}`)?.click()}
          className="nodrag"
        >
          <input
            id={`i2v-upload-${id}`}
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            style={{ display: 'none' }}
          />
          <InboxOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: '#999' }}>点击或拖拽上传</div>
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>支持 JPG, PNG, WebP</div>
        </UploadArea>
      )}
    </div>
  );
};

