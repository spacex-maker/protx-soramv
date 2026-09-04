import React, { useState } from 'react';
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Typography,
  message,
} from 'antd';
import {
  BankOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import directorApi, { DirectorBuilding } from 'api/director';
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
  AssetSortBadge,
} from './directorAssetCardStyles';
import {
  DIRECTOR_BUILDING_CATEGORIES,
  DIRECTOR_BUILDING_CATEGORY_I18N,
  DirectorBuildingCategory,
  isDisplayableImageUrl,
} from './directorAssetUtils';

const { Text } = Typography;
const { TextArea } = Input;

type BuildingFormValues = {
  name: string;
  description?: string;
  referenceImageUrl?: string;
  promptSuffix?: string;
  category?: DirectorBuildingCategory;
  sortOrder?: number;
};

export interface BuildingManagerProps {
  projectId: number;
  buildings: DirectorBuilding[];
  onBuildingsChange?: () => void;
}

const BuildingManager: React.FC<BuildingManagerProps> = ({
  projectId,
  buildings,
  onBuildingsChange,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<BuildingFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<DirectorBuilding | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const categoryOptions = DIRECTOR_BUILDING_CATEGORIES.map((value) => ({
    value,
    label: intl.formatMessage(DIRECTOR_BUILDING_CATEGORY_I18N[value]),
  }));

  const getCategoryLabel = (category?: string | null) => {
    const key = (category || 'exterior') as DirectorBuildingCategory;
    return intl.formatMessage(
      DIRECTOR_BUILDING_CATEGORY_I18N[key] || DIRECTOR_BUILDING_CATEGORY_I18N.exterior
    );
  };

  const openCreate = () => {
    setEditingBuilding(null);
    form.resetFields();
    form.setFieldsValue({
      sortOrder: buildings.length,
      category: 'exterior',
      referenceImageUrl: undefined,
    });
    setModalOpen(true);
  };

  const openEdit = (building: DirectorBuilding) => {
    setEditingBuilding(building);
    const imageUrl = building.referenceImageUrl || '';
    form.setFieldsValue({
      name: building.name,
      description: building.description || '',
      referenceImageUrl: imageUrl || undefined,
      promptSuffix: building.promptSuffix || '',
      category: (building.category as DirectorBuildingCategory) || 'exterior',
      sortOrder: building.sortOrder ?? 0,
    });
    setModalOpen(true);
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
        category: values.category || 'exterior',
        sortOrder: values.sortOrder ?? 0,
      };

      const res = editingBuilding
        ? await directorApi.updateBuilding(editingBuilding.id, body)
        : await directorApi.createBuilding(projectId, body);

      if (!res.success) {
        message.error(
          res.message ||
            intl.formatMessage({ id: 'director.buildings.saveFailed', defaultMessage: '保存失败' })
        );
        return;
      }

      message.success(
        intl.formatMessage({
          id: editingBuilding ? 'director.buildings.updated' : 'director.buildings.created',
          defaultMessage: editingBuilding ? '建筑已更新' : '建筑已创建',
        })
      );
      setModalOpen(false);
      onBuildingsChange?.();
    } catch {
      // validation
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (buildingId: number) => {
    setDeletingId(buildingId);
    try {
      const res = await directorApi.deleteBuilding(buildingId);
      if (res.success) {
        message.success(
          intl.formatMessage({ id: 'director.buildings.deleted', defaultMessage: '建筑已删除' })
        );
        onBuildingsChange?.();
      } else {
        message.error(
          res.message ||
            intl.formatMessage({ id: 'director.buildings.deleteFailed', defaultMessage: '删除失败' })
        );
      }
    } catch (e: unknown) {
      message.error(
        e instanceof Error
          ? e.message
          : intl.formatMessage({ id: 'director.buildings.deleteFailed', defaultMessage: '删除失败' })
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AssetLibraryCard
        title={intl.formatMessage({ id: 'director.buildings.title', defaultMessage: '建筑库' })}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 10 }}>
            <FormattedMessage id="director.buildings.add" defaultMessage="添加建筑" />
          </Button>
        }
      >
        {buildings.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({
              id: 'director.buildings.empty',
              defaultMessage: '暂无建筑，点击右上角添加第一个建筑对象',
            })}
          />
        ) : (
          <Row gutter={[16, 20]}>
            {buildings.map((item) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                <AssetCard>
                  <AssetCover className="asset-cover" $variant="square">
                    {isDisplayableImageUrl(item.referenceImageUrl) ? (
                      <img src={normalizeUrl(item.referenceImageUrl)} alt={item.name} />
                    ) : (
                      <AssetCoverPlaceholder>
                        <BankOutlined />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FormattedMessage
                            id="director.buildings.noReferenceImage"
                            defaultMessage="暂无参考图"
                          />
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
                        <FormattedMessage
                          id="director.buildings.noDescription"
                          defaultMessage="暂无建筑设定"
                        />
                      )}
                    </AssetDescription>
                    {item.promptSuffix ? (
                      <AssetPromptTag>
                        <FormattedMessage id="director.buildings.promptSuffixLabel" defaultMessage="提示词" />：
                        {item.promptSuffix}
                      </AssetPromptTag>
                    ) : null}
                  </AssetBody>

                  <AssetFooter>
                    <Button type="default" size="small" icon={<EditOutlined />} onClick={() => openEdit(item)}>
                      <FormattedMessage id="director.buildings.edit" defaultMessage="编辑" />
                    </Button>
                    <Popconfirm
                      title={intl.formatMessage({
                        id: 'director.buildings.deleteConfirm',
                        defaultMessage: '确定删除该建筑？',
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
                        <FormattedMessage id="director.buildings.delete" defaultMessage="删除" />
                      </Button>
                    </Popconfirm>
                  </AssetFooter>
                </AssetCard>
              </Col>
            ))}
          </Row>
        )}
      </AssetLibraryCard>

      <Modal
        title={
          editingBuilding
            ? intl.formatMessage(
                { id: 'director.buildings.editTitle', defaultMessage: '编辑建筑 · {name}' },
                { name: editingBuilding.name }
              )
            : intl.formatMessage({ id: 'director.buildings.createTitle', defaultMessage: '添加建筑' })
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
            label={intl.formatMessage({ id: 'director.buildings.name', defaultMessage: '建筑名称' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'director.buildings.nameRequired',
                  defaultMessage: '请输入建筑名称',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'director.buildings.namePlaceholder',
                defaultMessage: '例如：青石巷茶楼',
              })}
              maxLength={64}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label={intl.formatMessage({ id: 'director.buildings.category', defaultMessage: '分类' })}
          >
            <Select options={categoryOptions} />
          </Form.Item>

          <Form.Item
            name="description"
            label={intl.formatMessage({ id: 'director.buildings.description', defaultMessage: '建筑设定' })}
            extra={intl.formatMessage({
              id: 'director.buildings.descriptionHint',
              defaultMessage: '外观、结构、年代感、材质与空间氛围等，供剧本 Agent 与分镜参考',
            })}
          >
            <TextArea
              rows={3}
              placeholder={intl.formatMessage({
                id: 'director.buildings.descriptionPlaceholder',
                defaultMessage: '两层木结构茶楼，青瓦飞檐，临街悬挂红灯笼…',
              })}
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item name="referenceImageUrl" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'director.buildings.referenceImage', defaultMessage: '参考图' })}
            extra={intl.formatMessage({
              id: 'director.buildings.referenceImageHint',
              defaultMessage: '用于保持建筑视觉一致性；可本地上传，或从文生图 / 图生图记录中选用',
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
            label={intl.formatMessage({
              id: 'director.buildings.promptSuffix',
              defaultMessage: '生成提示词后缀',
            })}
          >
            <TextArea rows={2} maxLength={500} showCount />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label={intl.formatMessage({ id: 'director.buildings.sortOrder', defaultMessage: '排序' })}
          >
            <InputNumber min={0} max={9999} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BuildingManager;
