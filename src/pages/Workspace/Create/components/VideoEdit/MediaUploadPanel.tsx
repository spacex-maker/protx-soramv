import React, { useRef, useState } from 'react';
import { Button, Modal, Typography, message } from 'antd';
import {
  AudioOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileImageOutlined,
  InboxOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { MediaAsset, MAX_REF_AUDIOS, MAX_REF_IMAGES, MAX_REF_VIDEOS } from './constants';
import type { MediaAssetMeta } from './mediaAssetMeta';
import {
  buildMediaMeta,
  formatPreviewMetaItems,
  formatThumbMetaLines,
  readAudioDuration,
  readImageMeta,
  readVideoMeta,
} from './mediaAssetMeta';
import { SEEDANCE_REF_VIDEO_MIN_PIXELS } from './seedanceErrorMessage';

const { Text } = Typography;

type PreviewState = {
  kind: 'video' | 'image';
  url: string;
  title: string;
  fileName: string;
  meta?: MediaAssetMeta;
} | null;

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

const AssetCard = styled.div<{ $accent: string; $clickable?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 108px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
  border: 1px solid ${(p) => `${p.$accent}55`};
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};

  &:hover .preview-hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 96px;
  }
`;

const ThumbArea = styled.div`
  position: relative;
  width: 100%;
  height: 76px;
  background: #0f172a;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 68px;
  }
`;

const MetaFooter = styled.div`
  padding: 5px 6px 6px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
  border-top: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f6')};
  min-height: 34px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
`;

const MetaLine = styled.div`
  font-size: 9px;
  line-height: 1.25;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.72)' : '#475569')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
`;

const MetaLineStrong = styled(MetaLine)`
  font-size: 10px;
  font-weight: 600;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.88)' : '#0f172a')};
`;

const PreviewHover = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(15, 23, 42, 0.55);
  color: #fff;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;

  .anticon {
    font-size: 22px;
  }

  span {
    font-size: 11px;
    font-weight: 500;
  }
`;

const AddChip = styled.button<{ $accent: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 108px;
  min-height: 110px;
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
    width: 96px;
    min-height: 102px;
  }
`;

const PreviewMetaBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 10px 16px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
  border-bottom: 1px solid ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1')};
`;

const PreviewMetaItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;

  .label {
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#94a3b8')};
  }

  .value {
    color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.88)' : '#0f172a')};
    font-weight: 600;
    font-variant-numeric: tabular-nums;
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

function createAsset(file: File, meta?: MediaAssetMeta): MediaAsset {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    meta: meta || buildMediaMeta(file),
  };
}

function AssetMetaFooter({ meta }: { meta?: MediaAssetMeta }) {
  const { line1, line2 } = formatThumbMetaLines(meta);
  if (!line1 && !line2) {
    return (
      <MetaFooter>
        <MetaLine>—</MetaLine>
      </MetaFooter>
    );
  }
  return (
    <MetaFooter>
      {line1 ? <MetaLineStrong>{line1}</MetaLineStrong> : null}
      {line2 ? <MetaLine>{line2}</MetaLine> : null}
    </MetaFooter>
  );
}

function PreviewMetaPanel({ meta, intl }: { meta?: MediaAssetMeta; intl: ReturnType<typeof useIntl> }) {
  const items = formatPreviewMetaItems(meta);
  if (!items.length) return null;

  const labelFor = (key: string) => {
    switch (key) {
      case 'resolution':
        return intl.formatMessage({
          id: 'create.videoEdit.meta.resolution',
          defaultMessage: '分辨率',
        });
      case 'ratio':
        return intl.formatMessage({
          id: 'create.videoEdit.meta.ratio',
          defaultMessage: '比例',
        });
      case 'size':
        return intl.formatMessage({
          id: 'create.videoEdit.meta.size',
          defaultMessage: '大小',
        });
      case 'duration':
        return intl.formatMessage({
          id: 'create.videoEdit.meta.duration',
          defaultMessage: '时长',
        });
      default:
        return key;
    }
  };

  return (
    <PreviewMetaBar>
      {items.map((item) => (
        <PreviewMetaItem key={item.key}>
          <span className="label">{labelFor(item.key)}</span>
          <span className="value">{item.value}</span>
        </PreviewMetaItem>
      ))}
    </PreviewMetaBar>
  );
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
  const [draggingKind, setDraggingKind] = useState<Kind | null>(null);
  const [preview, setPreview] = useState<PreviewState>(null);

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
      hintDefault: '必填 · 最多 3 段 · mp4/mov · 分辨率≥854×480',
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

  const addFiles = async (
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
    const candidates: File[] = [];
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
      candidates.push(file);
    });

    if (!candidates.length) return;

    const newAssets: MediaAsset[] = [];
    for (const file of candidates) {
      try {
        if (kind === 'video') {
          const videoMeta = await readVideoMeta(file);
          if (videoMeta.pixels > 0 && videoMeta.pixels < SEEDANCE_REF_VIDEO_MIN_PIXELS) {
            message.warning(
              intl.formatMessage(
                {
                  id: 'create.videoEdit.upload.videoResolutionLow',
                  defaultMessage:
                    '「{name}」分辨率过低（{width}×{height}），像素数需 ≥ {min}（如 854×480）',
                },
                {
                  name: file.name,
                  width: videoMeta.width,
                  height: videoMeta.height,
                  min: SEEDANCE_REF_VIDEO_MIN_PIXELS,
                }
              ),
              5
            );
            continue;
          }
          newAssets.push(
            createAsset(
              file,
              buildMediaMeta(file, {
                width: videoMeta.width,
                height: videoMeta.height,
                duration: videoMeta.duration,
              })
            )
          );
        } else if (kind === 'image') {
          const imageMeta = await readImageMeta(file);
          newAssets.push(
            createAsset(
              file,
              buildMediaMeta(file, {
                width: imageMeta.width,
                height: imageMeta.height,
              })
            )
          );
        } else if (kind === 'audio') {
          const duration = await readAudioDuration(file);
          newAssets.push(createAsset(file, buildMediaMeta(file, { duration })));
        } else {
          newAssets.push(createAsset(file));
        }
      } catch {
        newAssets.push(createAsset(file));
      }
    }

    if (newAssets.length) {
      onChange([...current, ...newAssets]);
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
                    {slot.assets.map((asset, index) => {
                      const canPreview = slot.kind === 'video' || slot.kind === 'image';
                      const label = `@${slot.tagPrefix}${index + 1}`;

                      const openPreview = () => {
                        if (slot.kind === 'video' || slot.kind === 'image') {
                          setPreview({
                            kind: slot.kind,
                            url: asset.previewUrl,
                            title: label,
                            fileName: asset.file.name,
                            meta: asset.meta,
                          });
                        }
                      };

                      return (
                        <AssetCard
                          key={asset.id}
                          $accent={slot.accent}
                          $clickable={canPreview}
                          role={canPreview ? 'button' : undefined}
                          tabIndex={canPreview ? 0 : undefined}
                          onClick={openPreview}
                          onKeyDown={(e) => {
                            if (!canPreview) return;
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openPreview();
                            }
                          }}
                        >
                          <ThumbArea>
                            <TagBadge $accent={slot.accent}>{label}</TagBadge>
                            <RemoveBtn
                              size="small"
                              type="text"
                              icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAt(slot.assets, index, slot.onChange);
                              }}
                            />
                            {canPreview && (
                              <PreviewHover className="preview-hover">
                                {slot.kind === 'video' ? <PlayCircleOutlined /> : <EyeOutlined />}
                                <span>
                                  <FormattedMessage
                                    id="create.videoEdit.preview"
                                    defaultMessage="预览"
                                  />
                                </span>
                              </PreviewHover>
                            )}
                            {slot.kind === 'video' && (
                              <video
                                src={asset.previewUrl}
                                muted
                                playsInline
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                  const el = e.currentTarget;
                                  if (el.currentTime < 0.1) {
                                    el.currentTime = 0.1;
                                  }
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            )}
                            {slot.kind === 'image' && (
                              <img
                                src={asset.previewUrl}
                                alt={label}
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
                                  style={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.85)',
                                    maxWidth: 88,
                                  }}
                                >
                                  {asset.file.name}
                                </Text>
                              </div>
                            )}
                          </ThumbArea>
                          <AssetMetaFooter meta={asset.meta} />
                        </AssetCard>
                      );
                    })}
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

      <Modal
        title={
          preview ? (
            <div>
              <div>
                {preview.kind === 'video' ? (
                  <FormattedMessage id="create.video.preview" defaultMessage="视频预览" />
                ) : (
                  <FormattedMessage id="create.videoEdit.imagePreview" defaultMessage="图片预览" />
                )}
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 13, fontWeight: 400 }}>
                  {preview.title}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }} ellipsis>
                {preview.fileName}
              </Text>
            </div>
          ) : null
        }
        open={Boolean(preview)}
        onCancel={() => setPreview(null)}
        footer={null}
        destroyOnClose
        centered
        width={Math.min(880, typeof window !== 'undefined' ? window.innerWidth - 32 : 880)}
        styles={{ body: { padding: 0 } }}
      >
        {preview ? (
          <>
            <PreviewMetaPanel meta={preview.meta} intl={intl} />
            {preview.kind === 'video' ? (
              <video
                key={preview.url}
                src={preview.url}
                controls
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  display: 'block',
                  background: '#000',
                }}
              />
            ) : (
              <img
                src={preview.url}
                alt={preview.title}
                style={{
                  width: '100%',
                  maxHeight: '70vh',
                  display: 'block',
                  objectFit: 'contain',
                  background: '#0f172a',
                }}
              />
            )}
          </>
        ) : null}
      </Modal>
    </PanelGrid>
  );
};

export default MediaUploadPanel;
