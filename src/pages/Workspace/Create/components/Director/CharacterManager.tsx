import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Space,
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
import directorApi, { DirectorCharacter } from 'api/director';
import { uploadImageToServer } from '../ImageToImage/utils';
import { normalizeUrl } from '../ImageToVideo/utils';
import CharacterProfileTemplateModal from './CharacterProfileTemplateModal';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const isDisplayableImageUrl = (url?: string | null): url is string => {
  if (!url?.trim()) return false;
  const u = url.trim();
  return (
    u.startsWith('http://') ||
    u.startsWith('https://') ||
    u.startsWith('data:') ||
    u.startsWith('//')
  );
};

export interface CharacterManagerProps {
  projectId: number;
  characters: DirectorCharacter[];
  onCharactersChange?: () => void;
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
  onCharactersChange,
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

  const openCreate = () => {
    setEditingCharacter(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: characters.length, referenceImageUrl: undefined });
    setImagePreviewUrl('');
    setModalOpen(true);
  };

  const openEdit = (character: DirectorCharacter) => {
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
    setModalOpen(true);
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

      if (res.success) {
        message.success(
          intl.formatMessage({
            id: editingCharacter ? 'director.characters.updated' : 'director.characters.created',
            defaultMessage: editingCharacter ? '角色已更新' : '角色已创建',
          })
        );
        setModalOpen(false);
        onCharactersChange?.();
      } else {
        message.error(
          res.message ||
            intl.formatMessage({
              id: 'director.characters.saveFailed',
              defaultMessage: '保存失败',
            })
        );
      }
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
      <Card
        title={intl.formatMessage({ id: 'director.characters.title', defaultMessage: '角色库' })}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
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
          <Row gutter={[16, 16]}>
            {characters.map((c) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={c.id}>
                <Card
                  size="small"
                  hoverable
                  cover={
                    isDisplayableImageUrl(c.referenceImageUrl) ? (
                      <div style={{ height: 160, overflow: 'hidden', background: '#f5f5f5' }}>
                        <img
                          src={normalizeUrl(c.referenceImageUrl)}
                          alt={c.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <Avatar size={64} icon={<UserOutlined />} />
                      </div>
                    )
                  }
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEdit(c)}
                    >
                      <FormattedMessage id="director.characters.edit" defaultMessage="编辑" />
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title={intl.formatMessage({
                        id: 'director.characters.deleteConfirm',
                        defaultMessage: '确定删除该角色？已绑定到剧集的关联也会被移除。',
                      })}
                      onConfirm={() => handleDelete(c.id)}
                      okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' })}
                      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deletingId === c.id}
                      >
                        <FormattedMessage id="director.characters.delete" defaultMessage="删除" />
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={c.name}
                    description={
                      <>
                        {c.description ? (
                          <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>
                            {c.description}
                          </Paragraph>
                        ) : (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <FormattedMessage
                              id="director.characters.noDescription"
                              defaultMessage="暂无人物设定"
                            />
                          </Text>
                        )}
                        {c.promptSuffix && (
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                            <FormattedMessage
                              id="director.characters.promptSuffixLabel"
                              defaultMessage="提示词"
                            />
                            ：{c.promptSuffix}
                          </Text>
                        )}
                      </>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

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
        width={560}
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
