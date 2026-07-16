import React from 'react';
import { LoadingOutlined, ThunderboltOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { formatSpeed } from 'utils/format';

export interface AssetUploadProgress {
  overallPercent: number;
  currentFileName: string;
  currentIndex: number;
  totalCount: number;
  speed: number;
}

interface GenerateUploadButtonProps {
  disabled?: boolean;
  loading?: boolean;
  uploadProgress: AssetUploadProgress | null;
  onClick: () => void;
}

const ButtonRoot = styled.button<{ $disabled?: boolean; $uploading?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 8px 20px;
  border: none;
  border-radius: 24px;
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  overflow: hidden;
  background: ${(p) =>
    p.$disabled
      ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
  box-shadow: ${(p) =>
    p.$disabled ? 'none' : '0 8px 20px rgba(59, 130, 246, 0.28)'};
  opacity: ${(p) => (p.$disabled ? 0.72 : 1)};
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(59, 130, 246, 0.34);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ProgressTrack = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.12);
`;

const ProgressFill = styled.div<{ $percent: number }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(p) => Math.min(Math.max(p.$percent, 0), 100)}%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.32) 100%
  );
  transition: width 0.25s ease;
`;

const Shimmer = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.12) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-align: left;
  width: 100%;
  justify-content: center;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const MainLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
`;

const SubLabel = styled.span`
  font-size: 12px;
  line-height: 1.3;
  opacity: 0.88;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(100%, 280px);
`;

const IconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

function truncateFileName(name: string, max = 18): string {
  if (name.length <= max) return name;
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const base = name.slice(0, max - ext.length - 1);
  return `${base}…${ext}`;
}

const GenerateUploadButton: React.FC<GenerateUploadButtonProps> = ({
  disabled,
  loading,
  uploadProgress,
  onClick,
}) => {
  const isUploading = Boolean(uploadProgress);
  const isGenerating = Boolean(loading && !isUploading);
  const isDisabled = Boolean(disabled || loading);

  let icon: React.ReactNode = <ThunderboltOutlined />;
  let main: React.ReactNode = (
    <FormattedMessage id="create.videoEdit.generate" defaultMessage="开始生成" />
  );
  let sub: React.ReactNode = null;

  if (isUploading && uploadProgress) {
    icon = <CloudUploadOutlined />;
    main = (
      <FormattedMessage
        id="create.videoEdit.upload.progress"
        defaultMessage="上传素材 {percent}%"
        values={{ percent: uploadProgress.overallPercent }}
      />
    );
    sub = (
      <FormattedMessage
        id="create.videoEdit.upload.progressDetail"
        defaultMessage="{fileName} · {speed} · {current}/{total}"
        values={{
          fileName: truncateFileName(uploadProgress.currentFileName),
          speed: formatSpeed(uploadProgress.speed),
          current: uploadProgress.currentIndex,
          total: uploadProgress.totalCount,
        }}
      />
    );
  } else if (isGenerating) {
    icon = <LoadingOutlined spin />;
    main = (
      <FormattedMessage
        id="create.videoEdit.submitting"
        defaultMessage="正在提交生成任务..."
      />
    );
  }

  return (
    <ButtonRoot
      type="button"
      $disabled={isDisabled}
      $uploading={isUploading}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={isUploading || isGenerating}
    >
      {isUploading && uploadProgress ? (
        <>
          <ProgressTrack />
          <ProgressFill $percent={uploadProgress.overallPercent} />
          <Shimmer />
        </>
      ) : null}
      <Content>
        <IconWrap>{icon}</IconWrap>
        <TextBlock>
          <MainLabel>{main}</MainLabel>
          {sub ? <SubLabel>{sub}</SubLabel> : null}
        </TextBlock>
      </Content>
    </ButtonRoot>
  );
};

export default GenerateUploadButton;
