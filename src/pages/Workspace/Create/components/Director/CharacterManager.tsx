import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  InboxOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import directorApi, { DirectorCharacter, DirectorProp } from 'api/director';
import { uploadImageToServer } from '../ImageToImage/utils';
import { normalizeUrl } from '../ImageToVideo/utils';
import CharacterProfileTemplateModal from './CharacterProfileTemplateModal';
import {
  AssetBody,
  AssetCard,
  AssetCover,
  AssetCoverPlaceholder,
  AssetDescription,
  AssetFooter,
  AssetLibraryCard,
  AssetName,
  AssetPromptTag,
  AssetRelationTag,
  AssetRelationTags,
  AssetSortBadge,
  BindAssetRow,
  BindAssetThumb,
} from './directorAssetCardStyles';
import { isDisplayableImageUrl } from './directorAssetUtils';

const { Text } = Typography;
const { TextArea } = Input;

export interface CharacterManagerProps {
  projectId: number;
  characters: DirectorCharacter[];
  props: DirectorProp[];
  characterPropMap: Record<number, number[]>;
  onCharactersChange?: () => void;
  onBindingsChange?: () => void;
}

type CharacterFormValues = {
  name: string;
  description?: string;
  referenceImageUrl?: string;
  promptSuffix?: string;
  sortOrder?: number;
};

const CharacterManager: React.FC<CharacterManagerProps> = ({
  projectId,
  characters,
  props,
  characterPropMap,
  onCharactersChange,
  onBindingsChange,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<CharacterFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<DirectorCharacter | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateInitial, setTemplateInitial] = useState({ description: '', promptSuffix: '' });
  const [selectedPropIds, setSelectedPropIds] = useState<number[]>([]);
  const [bindLoading, setBindLoading] = useState(false);

  const propNameMap = React.useMemo(
    () => Object.fromEntries(props.map((p) => [p.id, p.name])),
    [props]
  );

  const openCreate = () => {
    setEditingCharacter(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: characters.length, referenceImageUrl: undefined });
    setImagePreviewUrl('');
    setSelectedPropIds([]);
    setModalOpen(true);
  };

  const openEdit = async (character: DirectorCharacter) => {
    setEditingCharacter(character);
    const imageUrl = character.referenceImageUrl || '';
    form.setFieldsValue({
      name: character.name,
      description: character.description || '',
      referenceImageUrl: imageUrl || undefined,
      promptSuffix: character.promptSuffix || '',
      sortOrder: character.sortOrder ?? 0,
    });
    setImagePreviewUrl(isDisplayableImageUrl(imageUrl) ? normalizeUrl(imageUrl) : '');
    setSelectedPropIds(characterPropMap[character.id] || []);
    setModalOpen(true);
    setBindLoading(true);
    try {
      const res = await directorApi.listCharacterProps(character.id);
      if (res.success) {
        setSelectedPropIds((res.data || []).map((p: DirectorProp) => p.id));
      }
    } catch {
      // keep map fallback
    } finally {
      setBindLoading(false);
    }
  };

  const resolveUploadFile = (file: unknown): File | null => {
    if (file instanceof File) return file;
    if (file && typeof file === 'object' && 'originFileObj' in file) {
      const origin = (file as { originFileObj?: File }).originFileObj;
      return origin instanceof File ? origin : null;
    }
    return null;
  };

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const uploadFile = resolveUploadFile(file);
    if (!uploadFile) {
      onError?.(new Error('无效的文件'));
      return;
    }
    if (!uploadFile.type.startsWith('image/')) {
      message.error(
        intl.formatMessage({
          id: 'director.characters.uploadInvalidType',
          defaultMessage: '请选择图片文件',
        })
      );
      onError?.(new Error('invalid type'));
      return;
    }
    if (uploadFile.size > 30 * 1024 * 1024) {
      message.error(
        intl.formatMessage({
          id: 'director.characters.uploadTooLarge',
          defaultMessage: '图片大小不能超过 30MB',
        })
      );
      onError?.(new Error('too large'));
      return;
    }

    setUploading(true);
    const hideLoading = message.loading(
      intl.formatMessage({
        id: 'director.characters.uploading',
        defaultMessage: '上传中…',
      }),
      0
    );
    try {
      const url = await uploadImageToServer(uploadFile);
      setImagePreviewUrl(normalizeUrl(url));
      form.setFieldsValue({ referenceImageUrl: url });
      onSuccess?.(url);
      message.success(
        intl.formatMessage({
          id: 'director.characters.uploadSuccess',
          defaultMessage: '参考图上传成功',
        })
      );
    } catch (e: unknown) {
      onError?.(e as Error);
      message.error(
        e instanceof Error
          ? e.message
          : intl.formatMessage({
              id: 'director.characters.uploadFailed',
              defaultMessage: '参考图上传失败',
            })
      );
    } finally {
      hideLoading();
      setUploading(false);
    }
  };

  const openTemplateModal = () => {
    setTemplateInitial({
      description: form.getFieldValue('description') || '',
      promptSuffix: form.getFieldValue('promptSuffix') || '',
    });
    setTemplateModalOpen(true);
  };

  const handleRemoveImage = () => {
    setImagePreviewUrl('');
    form.setFieldsValue({ referenceImageUrl: undefined });
  };

  const saveCharacterProps = async (characterId: number) => {
    const bindRes = await directorApi.bindCharacterProps(characterId, { propIds: selectedPropIds });
    if (!bindRes.success) {
      message.warning(
        bindRes.message ||
          intl.formatMessage({ id: 'director.characters.bindFailed', defaultMessage: '角色已保存，但道具绑定失败' })
      );
      return false;
    }
    onBindingsChange?.();
    return true;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const body = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        referenceImageUrl: values.referenceImageUrl?.trim() || undefined,
        promptSuffix: values.promptSuffix?.trim() || undefined,
        sortOrder: values.sortOrder ?? 0,
      };

      const res = editingCharacter
        ? await directorApi.updateCharacter(editingCharacter.id, body)
        : await directorApi.createCharacter(projectId, body);

      if (!res.success) {
        message.error(
          res.message ||
            intl.formatMessage({
              id: 'director.characters.saveFailed',
              defaultMessage: '保存失败',
            })
        );
        return;
      }

      const characterId = editingCharacter?.id ?? res.data?.id;
      if (characterId) {
        await saveCharacterProps(characterId);
      }

      message.success(
        intl.formatMessage({
          id: editingCharacter ? 'director.characters.updated' : 'director.characters.created',
          defaultMessage: editingCharacter ? '角色已更新' : '角色已创建',
        })
      );
      setModalOpen(false);
      onCharactersChange?.();
    } catch {
      // validation error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (characterId: number) => {
    setDeletingId(characterId);
    try {
      const res = await directorApi.deleteCharacter(characterId);
      if (res.success) {
        message.success(
          intl.formatMessage({
            id: 'director.characters.deleted',
            defaultMessage: '角色已删除',
          })
        );
        onCharactersChange?.();
        onBindingsChange?.();
      } else {
        message.error(
          res.message ||
            intl.formatMessage({
              id: 'director.characters.deleteFailed',
              defaultMessage: '删除失败',
            })
        );
      }
    } catch (e: unknown) {
      message.error(
        e instanceof Error
          ? e.message
          : intl.formatMessage({
              id: 'director.characters.deleteFailed',
              defaultMessage: '删除失败',
            })
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AssetLibraryCard
        title={intl.formatMessage({ id: 'director.characters.title', defaultMessage: '角色库' })}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 10 }}>
            <FormattedMessage id="director.characters.add" defaultMessage="添加角色" />
          </Button>
        }
      >
        {characters.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({
              id: 'director.characters.empty',
              defaultMessage: '暂无角色，点击右上角添加第一个角色',
            })}
          />
        ) : (
          <Row gutter={[16, 20]}>
            {characters.map((c) => {
              const linkedPropIds = characterPropMap[c.id] || [];
              return (
              <Col xs={24} sm={12} lg={8} xl={6} key={c.id}>
                <AssetCard>
                  <AssetCover className="asset-cover">
                    {isDisplayableImageUrl(c.referenceImageUrl) ? (
                      <img src={normalizeUrl(c.referenceImageUrl)} alt={c.name} />
                    ) : (
                      <AssetCoverPlaceholder>
                        <UserOutlined />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FormattedMessage
                            id="director.characters.noReferenceImage"
                            defaultMessage="暂无参考图"
                          />
                        </Text>
                      </AssetCoverPlaceholder>
                    )}
                    {typeof c.sortOrder === 'number' ? (
                      <AssetSortBadge>#{c.sortOrder + 1}</AssetSortBadge>
                    ) : null}
                  </AssetCover>

                  <AssetBody>
                    <AssetName>{c.name}</AssetName>
                    <AssetDescription>
                      {c.description || (
                        <FormattedMessage
                          id="director.characters.noDescription"
                          defaultMessage="暂无人物设定"
                        />
                      )}
                    </AssetDescription>
                    {c.promptSuffix ? (
                      <AssetPromptTag>
                        <FormattedMessage
                          id="director.characters.promptSuffixLabel"
                          defaultMessage="提示词"
                        />
                        ：{c.promptSuffix}
                      </AssetPromptTag>
                    ) : null}
                    {linkedPropIds.length > 0 ? (
                      <AssetRelationTags>
                        {linkedPropIds.slice(0, 3).map((propId) => (
                          <AssetRelationTag key={propId}>
                            {propNameMap[propId] || `#${propId}`}
                          </AssetRelationTag>
                        ))}
                        {linkedPropIds.length > 3 ? (
                          <AssetRelationTag>+{linkedPropIds.length - 3}</AssetRelationTag>
                        ) : null}
                      </AssetRelationTags>
                    ) : null}
                  </AssetBody>

                  <AssetFooter>
                    <Button
                      type="default"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(c)}
                    >
                      <FormattedMessage id="director.characters.edit" defaultMessage="编辑" />
                    </Button>
                    <Popconfirm
                      title={intl.formatMessage({
                        id: 'director.characters.deleteConfirm',
                        defaultMessage: '确定删除该角色？已绑定到剧集的关联也会被移除。',
                      })}
                      onConfirm={() => handleDelete(c.id)}
                      okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' })}
                      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
                    >
                      <Button
                        type="default"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deletingId === c.id}
                      >
                        <FormattedMessage id="director.characters.delete" defaultMessage="删除" />
                      </Button>
                    </Popconfirm>
                  </AssetFooter>
                </AssetCard>
              </Col>
            );
            })}
          </Row>
        )}
      </AssetLibraryCard>

      <Modal
        title={
          editingCharacter
            ? intl.formatMessage(
                { id: 'director.characters.editTitle', defaultMessage: '编辑角色 · {name}' },
                { name: editingCharacter.name }
              )
            : intl.formatMessage({ id: 'director.characters.createTitle', defaultMessage: '添加角色' })
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        destroyOnClose
        width={600}
        okText={intl.formatMessage({ id: 'common.save', defaultMessage: '保存' })}
        cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'director.characters.name', defaultMessage: '角色名' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'director.characters.nameRequired',
                  defaultMessage: '请输入角色名',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'director.characters.namePlaceholder',
                defaultMessage: '例如：林小雨',
              })}
              maxLength={64}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>
                  {intl.formatMessage({
                    id: 'director.characters.description',
                    defaultMessage: '人物设定',
                  })}
                </span>
                <Button type="link" size="small" icon={<FormOutlined />} onClick={openTemplateModal}>
                  <FormattedMessage
                    id="director.characters.template.open"
                    defaultMessage="模板设定"
                  />
                </Button>
              </Space>
            }
            extra={intl.formatMessage({
              id: 'director.characters.descriptionHint',
              defaultMessage: '性格、背景、外貌特征等，供剧本 Agent 与分镜参考',
            })}
          >
            <TextArea
              rows={4}
              placeholder={intl.formatMessage({
                id: 'director.characters.descriptionPlaceholder',
                defaultMessage: '25岁女记者，短发，冷静理性，常穿米色风衣…',
              })}
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item name="referenceImageUrl" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: 'director.characters.referenceImage',
              defaultMessage: '参考形象图',
            })}
            extra={intl.formatMessage({
              id: 'director.characters.referenceImageHint',
              defaultMessage: '用于保持角色视觉一致性，可上传定妆照或概念图',
            })}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {imagePreviewUrl ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={imagePreviewUrl}
                    alt="reference"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                  />
                  <Button
                    size="small"
                    danger
                    style={{ marginTop: 8 }}
                    onClick={handleRemoveImage}
                  >
                    <FormattedMessage id="director.characters.removeImage" defaultMessage="移除图片" />
                  </Button>
                </div>
              ) : (
                <Upload.Dragger
                  accept="image/*"
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={uploading}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    <FormattedMessage
                      id="director.characters.uploadHint"
                      defaultMessage="点击或拖拽上传参考图"
                    />
                  </p>
                  <p className="ant-upload-hint">JPG / PNG / WebP</p>
                </Upload.Dragger>
              )}
            </Space>
          </Form.Item>

          <Form.Item
            name="promptSuffix"
            label={intl.formatMessage({
              id: 'director.characters.promptSuffix',
              defaultMessage: '生成提示词后缀',
            })}
            extra={intl.formatMessage({
              id: 'director.characters.promptSuffixHint',
              defaultMessage: '追加到文生图/图生视频 prompt，确保角色外观一致',
            })}
          >
            <TextArea
              rows={2}
              placeholder={intl.formatMessage({
                id: 'director.characters.promptSuffixPlaceholder',
                defaultMessage: 'short black hair, beige trench coat, realistic anime style',
              })}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'director.characters.bindProps', defaultMessage: '关联道具' })}
            extra={intl.formatMessage({
              id: 'director.characters.bindPropsHint',
              defaultMessage: '勾选该角色使用或持有的道具，便于 Agent 与分镜创作时引用。',
            })}
          >
            {bindLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Spin />
              </div>
            ) : props.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={intl.formatMessage({
                  id: 'director.characters.noPropsHint',
                  defaultMessage: '请先在「资产管理」中创建道具',
                })}
              />
            ) : (
              <Checkbox.Group
                style={{ width: '100%' }}
                value={selectedPropIds}
                onChange={(vals) => setSelectedPropIds(vals as number[])}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  {props.map((p) => (
                    <BindAssetRow key={p.id} htmlFor={`bind-char-prop-${p.id}`}>
                      <Checkbox id={`bind-char-prop-${p.id}`} value={p.id} />
                      <BindAssetThumb>
                        {isDisplayableImageUrl(p.referenceImageUrl) ? (
                          <img src={normalizeUrl(p.referenceImageUrl)} alt={p.name} />
                        ) : (
                          <Avatar size={40} style={{ backgroundColor: '#722ed1' }}>
                            {p.name?.charAt(0)}
                          </Avatar>
                        )}
                      </BindAssetThumb>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>
                          {p.name}
                        </Text>
                      </div>
                    </BindAssetRow>
                  ))}
                </Space>
              </Checkbox.Group>
            )}
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label={intl.formatMessage({
              id: 'director.characters.sortOrder',
              defaultMessage: '排序',
            })}
          >
            <InputNumber min={0} max={9999} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <CharacterProfileTemplateModal
        open={templateModalOpen}
        initialDescription={templateInitial.description}
        initialPromptSuffix={templateInitial.promptSuffix}
        onCancel={() => setTemplateModalOpen(false)}
        onApply={({ description, promptSuffix }) => {
          form.setFieldsValue({
            description,
            ...(promptSuffix !== undefined ? { promptSuffix } : {}),
          });
          setTemplateModalOpen(false);
          message.success(
            intl.formatMessage({
              id: 'director.characters.template.applied',
              defaultMessage: '模板已应用到人物设定',
            })
          );
        }}
      />
    </>
  );
};

export default CharacterManager;
