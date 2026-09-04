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
  Select,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import directorApi, { DirectorCharacter, DirectorProp } from 'api/director';
import { normalizeUrl } from '../ImageToVideo/utils';
import DirectorReferenceImageField from './DirectorReferenceImageField';
import {
  AssetBody,
  AssetCard,
  AssetCategoryBadge,
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
import {
  DIRECTOR_PROP_CATEGORIES,
  DIRECTOR_PROP_CATEGORY_I18N,
  DirectorPropCategory,
  isDisplayableImageUrl,
} from './directorAssetUtils';

const { Text } = Typography;
const { TextArea } = Input;

type PropFormValues = {
  name: string;
  description?: string;
  referenceImageUrl?: string;
  promptSuffix?: string;
  category?: DirectorPropCategory;
  sortOrder?: number;
};

export interface PropManagerProps {
  projectId: number;
  props: DirectorProp[];
  characters: DirectorCharacter[];
  propCharacterMap: Record<number, number[]>;
  onPropsChange?: () => void;
  onBindingsChange?: () => void;
}

const PropManager: React.FC<PropManagerProps> = ({
  projectId,
  props,
  characters,
  propCharacterMap,
  onPropsChange,
  onBindingsChange,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<PropFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<DirectorProp | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>([]);
  const [bindLoading, setBindLoading] = useState(false);

  const characterNameMap = React.useMemo(
    () => Object.fromEntries(characters.map((c) => [c.id, c.name])),
    [characters]
  );

  const categoryOptions = DIRECTOR_PROP_CATEGORIES.map((value) => ({
    value,
    label: intl.formatMessage(DIRECTOR_PROP_CATEGORY_I18N[value]),
  }));

  const getCategoryLabel = (category?: string | null) => {
    const key = (category || 'general') as DirectorPropCategory;
    return intl.formatMessage(
      DIRECTOR_PROP_CATEGORY_I18N[key] || DIRECTOR_PROP_CATEGORY_I18N.general
    );
  };

  const openCreate = () => {
    setEditingProp(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: props.length, category: 'general', referenceImageUrl: undefined });
    setSelectedCharacterIds([]);
    setModalOpen(true);
  };

  const openEdit = async (prop: DirectorProp) => {
    setEditingProp(prop);
    const imageUrl = prop.referenceImageUrl || '';
    form.setFieldsValue({
      name: prop.name,
      description: prop.description || '',
      referenceImageUrl: imageUrl || undefined,
      promptSuffix: prop.promptSuffix || '',
      category: (prop.category as DirectorPropCategory) || 'general',
      sortOrder: prop.sortOrder ?? 0,
    });
    setSelectedCharacterIds(propCharacterMap[prop.id] || []);
    setModalOpen(true);
    setBindLoading(true);
    try {
      const res = await directorApi.listPropCharacters(prop.id);
      if (res.success) {
        setSelectedCharacterIds((res.data || []).map((c: DirectorCharacter) => c.id));
      }
    } catch {
      // keep map fallback
    } finally {
      setBindLoading(false);
    }
  };

  const savePropBindings = async (propId: number) => {
    const bindRes = await directorApi.bindPropCharacters(propId, { characterIds: selectedCharacterIds });
    if (!bindRes.success) {
      message.warning(bindRes.message || intl.formatMessage({ id: 'director.props.bindFailed', defaultMessage: '道具已保存，但角色绑定失败' }));
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
        category: values.category || 'general',
        sortOrder: values.sortOrder ?? 0,
      };

      const res = editingProp
        ? await directorApi.updateProp(editingProp.id, body)
        : await directorApi.createProp(projectId, body);

      if (!res.success) {
        message.error(res.message || intl.formatMessage({ id: 'director.props.saveFailed', defaultMessage: '保存失败' }));
        return;
      }

      const propId = editingProp?.id ?? res.data?.id;
      if (propId) {
        await savePropBindings(propId);
      }

      message.success(
        intl.formatMessage({
          id: editingProp ? 'director.props.updated' : 'director.props.created',
          defaultMessage: editingProp ? '道具已更新' : '道具已创建',
        })
      );
      setModalOpen(false);
      onPropsChange?.();
    } catch {
      // validation
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (propId: number) => {
    setDeletingId(propId);
    try {
      const res = await directorApi.deleteProp(propId);
      if (res.success) {
        message.success(intl.formatMessage({ id: 'director.props.deleted', defaultMessage: '道具已删除' }));
        onPropsChange?.();
        onBindingsChange?.();
      } else {
        message.error(res.message || intl.formatMessage({ id: 'director.props.deleteFailed', defaultMessage: '删除失败' }));
      }
    } catch (e: unknown) {
      message.error(
        e instanceof Error
          ? e.message
          : intl.formatMessage({ id: 'director.props.deleteFailed', defaultMessage: '删除失败' })
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AssetLibraryCard
        title={intl.formatMessage({ id: 'director.props.title', defaultMessage: '道具库' })}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 10 }}>
            <FormattedMessage id="director.props.add" defaultMessage="添加道具" />
          </Button>
        }
      >
        {props.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({
              id: 'director.props.empty',
              defaultMessage: '暂无道具，点击右上角添加第一个道具',
            })}
          />
        ) : (
          <Row gutter={[16, 20]}>
            {props.map((item) => {
              const linkedCharacterIds = propCharacterMap[item.id] || [];
              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                  <AssetCard>
                    <AssetCover className="asset-cover" $variant="square">
                      {isDisplayableImageUrl(item.referenceImageUrl) ? (
                        <img src={normalizeUrl(item.referenceImageUrl)} alt={item.name} />
                      ) : (
                        <AssetCoverPlaceholder>
                          <ToolOutlined />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <FormattedMessage id="director.props.noReferenceImage" defaultMessage="暂无参考图" />
                          </Text>
                        </AssetCoverPlaceholder>
                      )}
                      {typeof item.sortOrder === 'number' ? (
                        <AssetSortBadge>#{item.sortOrder + 1}</AssetSortBadge>
                      ) : null}
                      <AssetCategoryBadge>{getCategoryLabel(item.category)}</AssetCategoryBadge>
                    </AssetCover>

                    <AssetBody>
                      <AssetName>{item.name}</AssetName>
                      <AssetDescription>
                        {item.description || (
                          <FormattedMessage id="director.props.noDescription" defaultMessage="暂无道具设定" />
                        )}
                      </AssetDescription>
                      {item.promptSuffix ? (
                        <AssetPromptTag>
                          <FormattedMessage id="director.props.promptSuffixLabel" defaultMessage="提示词" />：
                          {item.promptSuffix}
                        </AssetPromptTag>
                      ) : null}
                      {linkedCharacterIds.length > 0 ? (
                        <AssetRelationTags>
                          {linkedCharacterIds.slice(0, 3).map((characterId) => (
                            <AssetRelationTag key={characterId}>
                              {characterNameMap[characterId] || `#${characterId}`}
                            </AssetRelationTag>
                          ))}
                          {linkedCharacterIds.length > 3 ? (
                            <AssetRelationTag>+{linkedCharacterIds.length - 3}</AssetRelationTag>
                          ) : null}
                        </AssetRelationTags>
                      ) : null}
                    </AssetBody>

                    <AssetFooter>
                      <Button type="default" size="small" icon={<EditOutlined />} onClick={() => openEdit(item)}>
                        <FormattedMessage id="director.props.edit" defaultMessage="编辑" />
                      </Button>
                      <Popconfirm
                        title={intl.formatMessage({
                          id: 'director.props.deleteConfirm',
                          defaultMessage: '确定删除该道具？与角色的绑定关系也会被移除。',
                        })}
                        onConfirm={() => handleDelete(item.id)}
                        okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确定' })}
                        cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
                      >
                        <Button
                          type="default"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          loading={deletingId === item.id}
                        >
                          <FormattedMessage id="director.props.delete" defaultMessage="删除" />
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
          editingProp
            ? intl.formatMessage(
                { id: 'director.props.editTitle', defaultMessage: '编辑道具 · {name}' },
                { name: editingProp.name }
              )
            : intl.formatMessage({ id: 'director.props.createTitle', defaultMessage: '添加道具' })
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        destroyOnClose
        width={600}
        okText={intl.formatMessage({ id: 'common.save', defaultMessage: '保存' })}
        cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
        footer={
          editingProp
            ? undefined
            : (_, { OkBtn }) => <OkBtn />
        }
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'director.props.name', defaultMessage: '道具名称' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'director.props.nameRequired', defaultMessage: '请输入道具名称' }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'director.props.namePlaceholder',
                defaultMessage: '例如：古铜钥匙',
              })}
              maxLength={64}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={intl.formatMessage({ id: 'director.props.category', defaultMessage: '分类' })}
          >
            <Select options={categoryOptions} />
          </Form.Item>

          <Form.Item
            name="description"
            label={intl.formatMessage({ id: 'director.props.description', defaultMessage: '道具设定' })}
            extra={intl.formatMessage({
              id: 'director.props.descriptionHint',
              defaultMessage: '外观、用途、剧情作用等，供剧本 Agent 与分镜参考',
            })}
          >
            <TextArea
              rows={3}
              placeholder={intl.formatMessage({
                id: 'director.props.descriptionPlaceholder',
                defaultMessage: '开启地下室的门，表面有蛇形纹路…',
              })}
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item name="referenceImageUrl" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'director.props.referenceImage', defaultMessage: '参考图' })}
            extra={intl.formatMessage({
              id: 'director.props.referenceImageHint',
              defaultMessage: '用于保持道具视觉一致性；可本地上传，或从文生图 / 图生图记录中选用',
            })}
          >
            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) => prev.referenceImageUrl !== cur.referenceImageUrl}
            >
              {() => (
                <DirectorReferenceImageField
                  value={form.getFieldValue('referenceImageUrl')}
                  onChange={(url) => form.setFieldsValue({ referenceImageUrl: url })}
                />
              )}
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="promptSuffix"
            label={intl.formatMessage({ id: 'director.props.promptSuffix', defaultMessage: '生成提示词后缀' })}
          >
            <TextArea rows={2} maxLength={500} showCount />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label={intl.formatMessage({ id: 'director.props.sortOrder', defaultMessage: '排序' })}
          >
            <InputNumber min={0} max={9999} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'director.props.bindCharacters', defaultMessage: '关联角色' })}
            extra={intl.formatMessage({
              id: 'director.props.bindCharactersHint',
              defaultMessage: '勾选使用该道具的角色，便于 Agent 与分镜创作时引用。',
            })}
          >
            {bindLoading && editingProp ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Spin />
              </div>
            ) : characters.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={intl.formatMessage({
                  id: 'director.props.noCharactersHint',
                  defaultMessage: '请先在「资产管理」中创建角色',
                })}
              />
            ) : (
              <Checkbox.Group
                style={{ width: '100%' }}
                value={selectedCharacterIds}
                onChange={(vals) => setSelectedCharacterIds(vals as number[])}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  {characters.map((c) => (
                    <BindAssetRow key={c.id} htmlFor={`bind-prop-char-${c.id}`}>
                      <Checkbox id={`bind-prop-char-${c.id}`} value={c.id} />
                      <BindAssetThumb>
                        {isDisplayableImageUrl(c.referenceImageUrl) ? (
                          <img src={normalizeUrl(c.referenceImageUrl)} alt={c.name} />
                        ) : (
                          <Avatar size={40} style={{ backgroundColor: '#3b82f6' }}>
                            {c.name?.charAt(0)}
                          </Avatar>
                        )}
                      </BindAssetThumb>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text strong style={{ display: 'block', marginBottom: 4 }}>
                          {c.name}
                        </Text>
                      </div>
                    </BindAssetRow>
                  ))}
                </Space>
              </Checkbox.Group>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PropManager;
