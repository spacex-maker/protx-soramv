import React, { useRef, useState } from 'react';
import { Button, Modal, Tabs, Typography, message } from 'antd';
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

const Shell = styled.div<{ $accent: string }>`
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border-radius: 14px;
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e8ecf1')};
  border-top: 3px solid ${(p) => p.$accent};
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafbfc'};
  overflow: hidden;
  transition: border-top-color 0.2s ease;
`;

const StyledTabs = styled(Tabs)<{ $accent: string }>`
  && {
    .ant-tabs-nav {
      margin: 0;
      padding: 0 8px;
      background: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.72)'};
    }

    .ant-tabs-nav::before {
      border-bottom-color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1'};
    }

    .ant-tabs-tab {
      padding: 12px 14px;
      margin: 0 2px !important;
      font-size: 13px;
      font-weight: 600;
      color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : '#64748b')};
    }

    .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: ${(p) => p.$accent} !important;
    }

    .ant-tabs-ink-bar {
      background: ${(p) => p.$accent};
      height: 2px;
    }

    .ant-tabs-content-holder {
      padding: 0;
    }

    .ant-tabs-tabpane {
      outline: none;
    }
  }
`;

const TabLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const CountBadge = styled.span<{ $accent: string; $active?: boolean }>`
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  color: ${(p) =>
    p.$active
      ? p.$accent
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.55)'
        : '#64748b'};
  background: ${(p) =>
    p.$active
      ? `${p.$accent}18`
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : '#eef2f6'};
`;

const PanelBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 14px 14px 16px;
  min-height: 220px;
`;

const EmptyDropzone = styled.button<{ $accent: string; $dragging?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 180px;
  width: 100%;
  padding: 24px 16px;
  border-radius: 12px;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 12px;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
`;

const AssetCard = styled.div<{ $accent: string; $clickable?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  border-radius: 12px;
  overflow: hidden;
  background: ${(p) => (p.theme.mode === 'dark' ? '#141414' : '#fff')};
  border: 1px solid ${(p) => `${p.$accent}55`};
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};

  &:hover .preview-hover {
    opacity: 1;
  }
`;

const ThumbArea = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  min-height: 96px;
  background: #0f172a;
  overflow: hidden;
`;

const MetaFooter = styled.div`
  padding: 8px 10px 9px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
  border-top: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f6')};
  min-height: 42px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
`;

const MetaLine = styled.div`
  font-size: 11px;
  line-height: 1.3;
  color: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.72)' : '#475569')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
`;

const MetaLineStrong = styled(MetaLine)`
  font-size: 12px;
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
    font-size: 26px;
  }

  span {
    font-size: 12px;
    font-weight: 500;
  }
`;

const AddChip = styled.button<{ $accent: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 148px;
  border-radius: 12px;
  border: 1.5px dashed ${(p) => `${p.$accent}88`};
  background: ${(p) => `${p.$accent}0a`};
  cursor: pointer;
  color: ${(p) => p.$accent};
  font-size: 12px;

  &:hover {
    background: ${(p) => `${p.$accent}16`};
    border-color: ${(p) => p.$accent};
  }
`;

const PreviewMetaBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 10px 16px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
  border-bottom: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8ecf1')};
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
  top: 8px;
  left: 8px;
  z-index: 2;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.$accent};
  color: #fff;
`;

const RemoveBtn = styled(Button)`
  && {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 2;
    width: 26px;
    height: 26px;
    min-width: 26px;
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
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.4;
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
  /** 覆盖默认上限（Seedance 2.5 为 30/10/10） */
  maxImages?: number;
  maxVideos?: number;
  maxAudios?: number;
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

function PreviewMetaPanel({
  meta,
  intl,
}: {
  meta?: MediaAssetMeta;
  intl: ReturnType<typeof useIntl>;
}) {
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
  maxImages = MAX_REF_IMAGES,
  maxVideos = MAX_REF_VIDEOS,
  maxAudios = MAX_REF_AUDIOS,
}) => {
  const intl = useIntl();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [activeKind, setActiveKind] = useState<Kind>('video');
  const [draggingKind, setDraggingKind] = useState<Kind | null>(null);
  const [preview, setPreview] = useState<PreviewState>(null);

  const slots: SlotConfig[] = [
    {
      kind: 'video',
      accent: '#13c2c2',
      max: maxVideos,
      assets: videos,
      onChange: onVideosChange,
      icon: <VideoCameraOutlined style={{ fontSize: 15 }} />,
      titleId: 'create.videoEdit.upload.videos',
      titleDefault: '参考视频',
      addId: 'create.videoEdit.upload.addVideo',
      addDefault: '上传视频',
      hintId: 'create.videoEdit.upload.videoHint',
      hintDefault: `必填 · 最多 ${maxVideos} 段 · mp4/mov · 分辨率≥854×480`,
      accept: 'video/mp4,video/quicktime,video/*',
      tagPrefix: '视频',
      required: true,
    },
    {
      kind: 'image',
      accent: '#722ed1',
      max: maxImages,
      assets: images,
      onChange: onImagesChange,
      icon: <FileImageOutlined style={{ fontSize: 15 }} />,
      titleId: 'create.videoEdit.upload.images',
      titleDefault: '参考图片',
      addId: 'create.videoEdit.upload.addImage',
      addDefault: '上传图片',
      hintId: 'create.videoEdit.upload.imageHint',
      hintDefault: `可选 · 最多 ${maxImages} 张 · jpg/png/webp`,
      accept: 'image/*',
      tagPrefix: '图像',
    },
    {
      kind: 'audio',
      accent: '#1890ff',
      max: maxAudios,
      assets: audios,
      onChange: onAudiosChange,
      icon: <AudioOutlined style={{ fontSize: 15 }} />,
      titleId: 'create.videoEdit.upload.audios',
      titleDefault: '参考音频',
      addId: 'create.videoEdit.upload.addAudio',
      addDefault: '上传音频',
      hintId: 'create.videoEdit.upload.audioHint',
      hintDefault: `可选 · 最多 ${maxAudios} 段 · mp3/wav`,
      accept: 'audio/mpeg,audio/wav,audio/mp3,audio/*',
      tagPrefix: '音频',
    },
  ];

  const activeSlot = slots.find((s) => s.kind === activeKind) || slots[0];

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
    Array.from(files)
      .slice(0, remain)
      .forEach((file) => {
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

  const renderSlotBody = (slot: SlotConfig) => {
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
      <PanelBody>
        {empty ? (
          <EmptyDropzone
            type="button"
            $accent={slot.accent}
            $dragging={dragging}
            onClick={() => inputRef.current?.click()}
            {...bindDrop}
          >
            <InboxOutlined style={{ fontSize: 36, color: slot.accent }} />
            <Text style={{ fontSize: 15, fontWeight: 600 }}>
              <FormattedMessage id={slot.addId} defaultMessage={slot.addDefault} />
            </Text>
            <Hint type="secondary" style={{ marginTop: 0, textAlign: 'center', maxWidth: 420 }}>
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
                        icon={<DeleteOutlined style={{ fontSize: 12 }} />}
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
                            gap: 8,
                            padding: '32px 12px 12px',
                            background:
                              'linear-gradient(180deg, rgba(24,144,255,0.2), transparent)',
                          }}
                        >
                          <AudioOutlined style={{ fontSize: 28, color: '#69c0ff' }} />
                          <Text
                            ellipsis
                            style={{
                              fontSize: 12,
                              color: 'rgba(255,255,255,0.85)',
                              maxWidth: '90%',
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
                  <PlusOutlined style={{ fontSize: 18 }} />
                  <FormattedMessage id={slot.addId} defaultMessage={slot.addDefault} />
                </AddChip>
              )}
            </FilledRow>
            <Hint type="secondary">
              <FormattedMessage id={slot.hintId} defaultMessage={slot.hintDefault} />
            </Hint>
          </>
        )}

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
      </PanelBody>
    );
  };

  return (
    <Shell $accent={activeSlot.accent}>
      <StyledTabs
        $accent={activeSlot.accent}
        activeKey={activeKind}
        onChange={(key) => setActiveKind(key as Kind)}
        items={slots.map((slot) => {
          const active = slot.kind === activeKind;
          return {
            key: slot.kind,
            label: (
              <TabLabel>
                <span style={{ color: active ? slot.accent : undefined }}>{slot.icon}</span>
                <FormattedMessage id={slot.titleId} defaultMessage={slot.titleDefault} />
                <CountBadge $accent={slot.accent} $active={active}>
                  {slot.assets.length}/{slot.max}
                  {slot.required ? (
                    <span style={{ marginLeft: 4, opacity: 0.85 }}>
                      ·{' '}
                      <FormattedMessage
                        id="create.videoEdit.upload.required"
                        defaultMessage="必填"
                      />
                    </span>
                  ) : null}
                </CountBadge>
              </TabLabel>
            ),
            children: renderSlotBody(slot),
          };
        })}
      />

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
    </Shell>
  );
};

export default MediaUploadPanel;
