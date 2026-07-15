import React, { useRef } from 'react';
import { Button, Typography, message } from 'antd';
import {
  AudioOutlined,
  DeleteOutlined,
  FileImageOutlined,
  InboxOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { MediaAsset, MAX_REF_AUDIOS, MAX_REF_IMAGES, MAX_REF_VIDEOS } from './constants';

const { Text } = Typography;

const PanelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div<{ $accent: string }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;
  min-height: 168px;
  border-radius: 14px;
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e8ecf1')};
  border-top: 3px solid ${(p) => p.$accent};
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafbfc'};
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px 8px;
`;

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#0f172a')};
`;

const CountBadge = styled.span<{ $accent: string }>`
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  color: ${(p) => p.$accent};
  background: ${(p) => `${p.$accent}18`};
`;

const PanelBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 10px 10px;
  min-height: 0;
`;

const EmptyDropzone = styled.button<{ $accent: string; $dragging?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 108px;
  width: 100%;
  padding: 14px 10px;
  border-radius: 10px;
  border: 1.5px dashed
    ${(p) =>
      p.$dragging
        ? p.$accent
        : p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.16)'
          : '#d0d7de'};
  background: ${(p) =>
    p.$dragging
      ? `${p.$accent}12`
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.02)'
        : '#fff'};
  cursor: pointer;
  color: inherit;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: ${(p) => p.$accent};
    background: ${(p) => `${p.$accent}0d`};
  }
`;

const FilledRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
  max-width: 100%;
`;

const PreviewTile = styled.div<{ $accent: string }>`
  position: relative;
  width: 86px;
  height: 108px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background: #0f172a;
  border: 1px solid ${(p) => `${p.$accent}55`};

  @media (max-width: 768px) {
    width: 72px;
    height: 92px;
  }
`;

const AddChip = styled.button<{ $accent: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 86px;
  height: 108px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1.5px dashed ${(p) => `${p.$accent}88`};
  background: ${(p) => `${p.$accent}0a`};
  cursor: pointer;
  color: ${(p) => p.$accent};
  font-size: 11px;

  &:hover {
    background: ${(p) => `${p.$accent}16`};
    border-color: ${(p) => p.$accent};
  }

  @media (max-width: 768px) {
    width: 72px;
    height: 92px;
  }
`;

const TagBadge = styled.span<{ $accent: string }>`
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 2;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  background: ${(p) => p.$accent};
  color: #fff;
`;

const RemoveBtn = styled(Button)`
  && {
    position: absolute;
    top: 3px;
    right: 3px;
    z-index: 2;
    width: 22px;
    height: 22px;
    min-width: 22px;
    padding: 0;
    background: rgba(15, 23, 42, 0.55);
    color: #fff;
    border: none;

    &:hover {
      background: rgba(239, 68, 68, 0.9) !important;
      color: #fff !important;
    }
  }
`;

const Hint = styled(Text)`
  && {
    display: block;
    margin-top: 6px;
    font-size: 11px;
    line-height: 1.35;
  }
`;

type Kind = 'video' | 'image' | 'audio';

interface SlotConfig {
  kind: Kind;
  accent: string;
  max: number;
  assets: MediaAsset[];
  onChange: (next: MediaAsset[]) => void;
  icon: React.ReactNode;
  titleId: string;
  titleDefault: string;
  addId: string;
  addDefault: string;
  hintId: string;
  hintDefault: string;
  accept: string;
  tagPrefix: string;
  required?: boolean;
}

export interface MediaUploadPanelProps {
  videos: MediaAsset[];
  images: MediaAsset[];
  audios: MediaAsset[];
  onVideosChange: (next: MediaAsset[]) => void;
  onImagesChange: (next: MediaAsset[]) => void;
  onAudiosChange: (next: MediaAsset[]) => void;
}

function createAsset(file: File): MediaAsset {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

const MediaUploadPanel: React.FC<MediaUploadPanelProps> = ({
  videos,
  images,
  audios,
  onVideosChange,
  onImagesChange,
  onAudiosChange,
}) => {
  const intl = useIntl();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [draggingKind, setDraggingKind] = React.useState<Kind | null>(null);

  const slots: SlotConfig[] = [
    {
      kind: 'video',
      accent: '#13c2c2',
      max: MAX_REF_VIDEOS,
      assets: videos,
      onChange: onVideosChange,
      icon: <VideoCameraOutlined style={{ color: '#13c2c2', fontSize: 15 }} />,
      titleId: 'create.videoEdit.upload.videos',
      titleDefault: '参考视频',
      addId: 'create.videoEdit.upload.addVideo',
      addDefault: '上传视频',
      hintId: 'create.videoEdit.upload.videoHint',
      hintDefault: '必填 · 最多 3 段 · mp4/mov',
      accept: 'video/mp4,video/quicktime,video/*',
      tagPrefix: '视频',
      required: true,
    },
    {
      kind: 'image',
      accent: '#722ed1',
      max: MAX_REF_IMAGES,
      assets: images,
      onChange: onImagesChange,
      icon: <FileImageOutlined style={{ color: '#722ed1', fontSize: 15 }} />,
      titleId: 'create.videoEdit.upload.images',
      titleDefault: '参考图片',
      addId: 'create.videoEdit.upload.addImage',
      addDefault: '上传图片',
      hintId: 'create.videoEdit.upload.imageHint',
      hintDefault: '可选 · 最多 9 张 · jpg/png/webp',
      accept: 'image/*',
      tagPrefix: '图像',
    },
    {
      kind: 'audio',
      accent: '#1890ff',
      max: MAX_REF_AUDIOS,
      assets: audios,
      onChange: onAudiosChange,
      icon: <AudioOutlined style={{ color: '#1890ff', fontSize: 15 }} />,
      titleId: 'create.videoEdit.upload.audios',
      titleDefault: '参考音频',
      addId: 'create.videoEdit.upload.addAudio',
      addDefault: '上传音频',
      hintId: 'create.videoEdit.upload.audioHint',
      hintDefault: '可选 · 最多 3 段 · mp3/wav',
      accept: 'audio/mpeg,audio/wav,audio/mp3,audio/*',
      tagPrefix: '音频',
    },
  ];

  const inputRefFor = (kind: Kind) => {
    if (kind === 'video') return videoInputRef;
    if (kind === 'image') return imageInputRef;
    return audioInputRef;
  };

  const addFiles = (
    files: FileList | null,
    kind: Kind,
    current: MediaAsset[],
    max: number,
    onChange: (next: MediaAsset[]) => void
  ) => {
    if (!files || files.length === 0) return;
    const remain = max - current.length;
    if (remain <= 0) {
      message.warning(
        intl.formatMessage(
          { id: 'create.videoEdit.upload.maxReached', defaultMessage: '最多上传 {max} 个文件' },
          { max }
        )
      );
      return;
    }
    const accepted: File[] = [];
    Array.from(files).slice(0, remain).forEach((file) => {
      if (kind === 'video' && !file.type.startsWith('video/')) {
        message.warning(
          intl.formatMessage({
            id: 'create.videoEdit.upload.videoType',
            defaultMessage: '请上传视频文件（mp4/mov）',
          })
        );
        return;
      }
      if (kind === 'image' && !file.type.startsWith('image/')) {
        message.warning(
          intl.formatMessage({
            id: 'create.videoEdit.upload.imageType',
            defaultMessage: '请上传图片文件',
          })
        );
        return;
      }
      if (kind === 'audio' && !file.type.startsWith('audio/')) {
        message.warning(
          intl.formatMessage({
            id: 'create.videoEdit.upload.audioType',
            defaultMessage: '请上传音频文件（mp3/wav）',
          })
        );
        return;
      }
      accepted.push(file);
    });
    if (accepted.length) {
      onChange([...current, ...accepted.map(createAsset)]);
    }
  };

  const removeAt = (
    list: MediaAsset[],
    index: number,
    onChange: (next: MediaAsset[]) => void
  ) => {
    const target = list[index];
    if (target?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
    }
    onChange(list.filter((_, i) => i !== index));
  };

  const setDragging = (kind: Kind | null) => {
    setDraggingKind(kind);
  };

  return (
    <PanelGrid>
      {slots.map((slot) => {
        const inputRef = inputRefFor(slot.kind);
        const empty = slot.assets.length === 0;
        const dragging = draggingKind === slot.kind;

        const bindDrop = {
          onDragOver: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(slot.kind);
          },
          onDragLeave: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragging(null);
            }
          },
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(null);
            addFiles(e.dataTransfer.files, slot.kind, slot.assets, slot.max, slot.onChange);
          },
        };

        return (
          <Panel key={slot.kind} $accent={slot.accent}>
            <PanelHeader>
              <PanelTitle>
                {slot.icon}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <FormattedMessage id={slot.titleId} defaultMessage={slot.titleDefault} />
                </span>
              </PanelTitle>
              <CountBadge $accent={slot.accent}>
                {slot.assets.length}/{slot.max}
                {slot.required ? (
                  <span style={{ marginLeft: 4, opacity: 0.85 }}>
                    ·{' '}
                    <FormattedMessage id="create.videoEdit.upload.required" defaultMessage="必填" />
                  </span>
                ) : null}
              </CountBadge>
            </PanelHeader>

            <PanelBody>
              {empty ? (
                <EmptyDropzone
                  type="button"
                  $accent={slot.accent}
                  $dragging={dragging}
                  onClick={() => inputRef.current?.click()}
                  {...bindDrop}
                >
                  <InboxOutlined style={{ fontSize: 26, color: slot.accent }} />
                  <Text style={{ fontSize: 13, fontWeight: 500 }}>
                    <FormattedMessage id={slot.addId} defaultMessage={slot.addDefault} />
                  </Text>
                  <Hint type="secondary">
                    <FormattedMessage id={slot.hintId} defaultMessage={slot.hintDefault} />
                  </Hint>
                </EmptyDropzone>
              ) : (
                <>
                  <FilledRow {...bindDrop}>
                    {slot.assets.map((asset, index) => (
                      <PreviewTile key={asset.id} $accent={slot.accent}>
                        <TagBadge $accent={slot.accent}>
                          @{slot.tagPrefix}
                          {index + 1}
                        </TagBadge>
                        <RemoveBtn
                          size="small"
                          type="text"
                          icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                          onClick={() => removeAt(slot.assets, index, slot.onChange)}
                        />
                        {slot.kind === 'video' && (
                          <video
                            src={asset.previewUrl}
                            muted
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        {slot.kind === 'image' && (
                          <img
                            src={asset.previewUrl}
                            alt={`${slot.tagPrefix}-${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        {slot.kind === 'audio' && (
                          <div
                            style={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              padding: '28px 6px 8px',
                              background:
                                'linear-gradient(180deg, rgba(24,144,255,0.2), transparent)',
                            }}
                          >
                            <AudioOutlined style={{ fontSize: 22, color: '#69c0ff' }} />
                            <Text
                              ellipsis
                              style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', maxWidth: 72 }}
                            >
                              {asset.file.name}
                            </Text>
                          </div>
                        )}
                      </PreviewTile>
                    ))}
                    {slot.assets.length < slot.max && (
                      <AddChip
                        type="button"
                        $accent={slot.accent}
                        onClick={() => inputRef.current?.click()}
                      >
                        <PlusOutlined style={{ fontSize: 16 }} />
                        <FormattedMessage id={slot.addId} defaultMessage={slot.addDefault} />
                      </AddChip>
                    )}
                  </FilledRow>
                  <Hint type="secondary">
                    <FormattedMessage id={slot.hintId} defaultMessage={slot.hintDefault} />
                  </Hint>
                </>
              )}
            </PanelBody>

            <input
              ref={inputRef}
              type="file"
              accept={slot.accept}
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                addFiles(e.target.files, slot.kind, slot.assets, slot.max, slot.onChange);
                e.target.value = '';
              }}
            />
          </Panel>
        );
      })}
    </PanelGrid>
  );
};

export default MediaUploadPanel;
