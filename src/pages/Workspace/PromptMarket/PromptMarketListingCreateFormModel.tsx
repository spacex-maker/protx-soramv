import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, InputNumber, Select, Switch, Row, Col,
  Divider, Button, Space, Typography, theme, message, Tag, Popover,
} from 'antd';
import {
  FileImageOutlined, RocketOutlined, CheckCircleOutlined,
  PlusOutlined, DeleteOutlined, PictureOutlined, PlayCircleOutlined, InfoCircleOutlined, FileTextOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';
import TaskSelectModal, { isVideoUrl } from './TaskSelectModal';
import PromptMarketFeeRuleModal from './PromptMarketFeeRuleModal';
import { base } from 'api/base';
import { useLocale } from 'contexts/LocaleContext';
import '../../../styles/modal-styles.css';

const { TextArea } = Input;

// 全圆弧：输入框药丸形 / 卡片大圆角
const ROUND_PILL = 9999;
const ROUND_PANEL = 16;

/** 从 tagNameI18n JSON 解析显示名，按当前语言优先：中文用 zh，非中文用 en */
const parseTagLabel = (
  tagNameI18n: string | Record<string, string> | undefined,
  lang?: string
): string => {
  if (!tagNameI18n) return '';
  try {
    const o = typeof tagNameI18n === 'string' ? JSON.parse(tagNameI18n) : tagNameI18n;
    const isZh = lang === 'zh';
    return (isZh ? (o?.zh || o?.en || o?.label) : (o?.en || o?.zh || o?.label)) || '';
  } catch {
    return String(tagNameI18n);
  }
};
const { Text } = Typography;

// 四种创作类型：对应后端 taskType 与 listingType
const LISTING_TYPE_OPTIONS = [
  { taskType: 't2i', listingType: 'IMAGE', label: '文生图', icon: <PictureOutlined /> },
  { taskType: 't2v', listingType: 'VIDEO', label: '文生视频', icon: <PlayCircleOutlined /> },
  { taskType: 'i2i', listingType: 'IMAGE', label: '图生图', icon: <PictureOutlined /> },
  { taskType: 'i2v', listingType: 'VIDEO', label: '图生视频', icon: <PlayCircleOutlined /> },
];

// ============================================================================
// 提示词效果图：仅从任务输出结果（resultUrls）中选择，不支持上传
// ============================================================================
const CoverImagePicker: React.FC<{
  imageUrl: string;
  resultUrls: string[];
  onImageChange: (url: string) => void;
  tipText: string;
  token: { colorPrimary?: string; colorTextSecondary?: string; colorBorder?: string };
}> = ({ imageUrl, resultUrls, onImageChange, tipText, token }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const urls = Array.isArray(resultUrls) ? resultUrls : [];
  const canChange = urls.length > 0;

  const content = (
    <div style={{ width: 240, maxHeight: 280, overflow: 'auto' }}>
      {urls.length === 0 ? (
        <div style={{ padding: 12, textAlign: 'center', color: token.colorTextSecondary, fontSize: 12 }}>该任务无输出图</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {urls.map((url) => (
            <div
              key={url}
              onClick={() => { onImageChange(url); setPopoverOpen(false); }}
              style={{
                aspectRatio: 1,
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                border: imageUrl === url ? `2px solid ${token.colorPrimary}` : '2px solid transparent',
              }}
            >
              {isVideoUrl(url) ? (
                <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
              ) : (
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="cover-preview-upload-wrap" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {imageUrl ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
          {isVideoUrl(imageUrl) ? (
            <video src={imageUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: ROUND_PANEL }} controls muted />
          ) : (
            <img src={imageUrl} alt="cover" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: ROUND_PANEL }} />
          )}
          {canChange && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, padding: 6, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', borderRadius: '0 0 8px 8px' }}>
              <Popover content={content} title="选择任务输出图" trigger="click" open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Button size="small" style={{ borderRadius: ROUND_PILL }}>点击更换</Button>
              </Popover>
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: token.colorTextSecondary }}>
          <PlusOutlined style={{ fontSize: 24 }} />
          <div style={{ marginTop: 8, fontSize: 12 }}>{tipText}</div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// C端 分享提示词表单
// ============================================================================

export interface PromptMarketListingCreateFormProps {
  isVisible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  t: (key: string) => string;
}

const LICENSE_OPTIONS = [
  { value: 1, label: '仅供学习 (不可商用)' },
  { value: 2, label: '允许商用 (可用于商业项目)' },
  { value: 3, label: '独家买断 (转让所有权)' },
];

const PromptMarketListingCreateFormModel: React.FC<PromptMarketListingCreateFormProps> = ({
  isVisible,
  onCancel,
  onFinish,
  t,
}) => {
  const { token } = theme.useToken();
  const { locale } = useLocale();
  const [form] = Form.useForm();
  const priceToken = Form.useWatch('priceToken', form);
  const buyoutPriceToken = Form.useWatch('buyoutPriceToken', form);

  const hasPaidPrice = Number(priceToken) > 0 || Number(buyoutPriceToken) > 0;

  const [taskSelectVisible, setTaskSelectVisible] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedTaskInfo, setSelectedTaskInfo] = useState<any>(null);
  const [tagOptions, setTagOptions] = useState<{ value: string; label: string }[]>([]);
  const [recommendTags, setRecommendTags] = useState<{ value: string; label: string }[]>([]);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [promptContent, setPromptContent] = useState('');
  const [feeRuleModalVisible, setFeeRuleModalVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCoverUrl('');
      setSelectedTaskInfo(null);
      setPromptExpanded(false);
      form.resetFields();
    }
  }, [isVisible, form]);

  // 弹窗打开时拉取标签库与热门标签，根据当前语言显示中文/英文
  useEffect(() => {
    if (!isVisible) return;
    const lang = locale || 'zh';
    const toOption = (item: { id?: number; tagCode?: string; tagNameI18n?: string }) => ({
      value: item.tagCode != null ? String(item.tagCode) : (item.id != null ? String(item.id) : ''),
      label: parseTagLabel(item.tagNameI18n, lang) || item.tagCode || String(item.id ?? ''),
    });
    const load = async () => {
      const [listRes, recommendRes] = await Promise.all([
        base.getPromptTagLibraryList(),
        base.getPromptTagLibraryRecommend(),
      ]);
      if (listRes?.success && Array.isArray(listRes?.data)) {
        const opts = listRes.data.map(toOption).filter((o: { value: string; label: string }) => o.value && o.label);
        setTagOptions(opts);
      }
      if (recommendRes?.success && Array.isArray(recommendRes?.data)) {
        const rec = recommendRes.data
          .map(toOption)
          .filter((o: { value: string; label: string }) => o.value && o.label)
          .slice(0, 8);
        setRecommendTags(rec);
      }
    };
    load();
  }, [isVisible, locale]);

  // 设置了查看价或买断价时强制隐藏提示词；全部免费则公开
  useEffect(() => {
    if (!isVisible) return;
    form.setFieldsValue({ isPromptHidden: hasPaidPrice });
  }, [isVisible, hasPaidPrice, form]);

  // 根据 taskType 得到 listingType（IMAGE / VIDEO）
  const getListingType = (taskType: string) => LISTING_TYPE_OPTIONS.find(o => o.taskType === taskType)?.listingType ?? 'IMAGE';

  // 选完任务后自动填充表单
  const handleTaskSelect = (task: any) => {
    const defaultCover = task.thumbnailUrl;
    const listingType = getListingType(task.taskType);
    
    setSelectedTaskInfo(task);
    setCoverUrl(defaultCover || '');
    
    form.setFieldsValue({
      originalTaskId: task.id,
      listingType,
      coverImageUrl: defaultCover,
      previewImages: typeof task.resultUrls === 'string' ? task.resultUrls : JSON.stringify(task.resultUrls || []),
      modelType: task.modelType || 'unknown',
      baseModelVersion: task.baseModelVersion || '1.0',
      parameterSnapshot: task.parameterSnapshot || '{}',
      title: '我的 AI 创意作品',
      tags: [],
    });
    
    setTaskSelectVisible(false);
    message.success('作品导入成功，请完善作品信息');
  };

  const renderSelectedTaskCard = () => {
    if (!selectedTaskInfo) return null;
    const previewUrl = coverUrl || selectedTaskInfo.thumbnailUrl;
    return (
      <div style={{
        background: token.colorFillAlter,
        padding: 12,
        borderRadius: ROUND_PANEL,
        border: `1px solid ${token.colorPrimaryBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <Space size={12}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: ROUND_PANEL,
            overflow: 'hidden',
            background: token.colorFillQuaternary,
            flexShrink: 0,
          }}>
            {previewUrl ? (
              isVideoUrl(previewUrl) ? (
                <video src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
              ) : (
                <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: token.colorTextSecondary,
              }}>
                <FileImageOutlined />
              </div>
            )}
          </div>
          <div>
            <div style={{ color: token.colorTextSecondary, fontSize: 12 }}>已关联源任务</div>
            <div style={{ fontWeight: 600 }}>{selectedTaskInfo.modelCode} (ID: {selectedTaskInfo.id})</div>
          </div>
          <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 16 }} />
        </Space>
        <Space size={8}>
          <Button
            size="small"
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => {
              try {
                const snap = selectedTaskInfo?.parameterSnapshot ?? form.getFieldValue('parameterSnapshot') ?? '{}';
                const obj = typeof snap === 'string' ? JSON.parse(snap) : snap;
                const text = obj?.prompt ?? selectedTaskInfo?.prompt ?? '';
                setPromptContent(text || '暂无提示词');
                setPromptExpanded(true);
              } catch {
                setPromptContent('暂无提示词');
                setPromptExpanded(true);
              }
            }}
          >
            提示词
          </Button>
          <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => {
            setSelectedTaskInfo(null);
            form.resetFields();
            setCoverUrl('');
            setPromptExpanded(false);
          }}>
            移除
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <>
      <Modal
        title={
            <Space>
                <RocketOutlined style={{ color: token.colorPrimary }} />
                <span>分享我的提示词</span>
            </Space>
        }
        open={isVisible}
        onCancel={onCancel}
        width={700}
        destroyOnClose
        maskClosable={false}
        centered
        footer={null}
        styles={{ mask: { backdropFilter: 'blur(4px)' } }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ 
            licenseType: 1, 
            priceToken: 0,
            buyoutPriceToken: 0,
            isPromptHidden: true,
          }}
        >
          {/* ==================== 隐藏域 (后端需要，前端不展示) ==================== */}
          <Form.Item name="userId" hidden><Input /></Form.Item>
          <Form.Item name="originalTaskId" hidden><Input /></Form.Item>
          <Form.Item name="listingType" hidden><Input /></Form.Item>
          <Form.Item name="parameterSnapshot" hidden><Input /></Form.Item>
          <Form.Item name="modelType" hidden><Input /></Form.Item>
          <Form.Item name="baseModelVersion" hidden><Input /></Form.Item>
          <Form.Item name="previewImages" hidden><Input /></Form.Item>
          <Form.Item name="status" hidden><InputNumber /></Form.Item>

          {/* ==================== 选择作品 ==================== */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>选择作品</div>
            {!selectedTaskInfo ? (
              <div
                onClick={() => setTaskSelectVisible(true)}
                style={{
                  height: 100,
                  border: `2px dashed ${token.colorBorder}`,
                  borderRadius: ROUND_PANEL,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: token.colorFillAlter,
                  color: token.colorTextDescription,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = token.colorPrimary)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = token.colorBorder)}
              >
                <FileImageOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                <div>从创作历史中导入</div>
              </div>
            ) : renderSelectedTaskCard()}
            {selectedTaskInfo && promptExpanded && (
              <div style={{ marginTop: 12, padding: 12, background: token.colorFillAlter, borderRadius: ROUND_PANEL, border: `1px solid ${token.colorBorder}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: token.colorText }}>作品提示词（仅可查看）</span>
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setPromptExpanded(false)}>收起</Button>
                </div>
                <pre style={{ margin: 0, padding: '12px', maxHeight: 200, overflow: 'auto', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: token.colorBgContainer, borderRadius: 8, border: `1px solid ${token.colorBorder}`, color: token.colorText, userSelect: 'text', cursor: 'default' }}>
                  {promptContent}
                </pre>
              </div>
            )}
          </div>

          {/* ==================== 2. 商品信息 (用户只需填这些) ==================== */}
          <div style={{ opacity: selectedTaskInfo ? 1 : 0.5, pointerEvents: selectedTaskInfo ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
             <Divider orientation="left" style={{ margin: '12px 0' }}><span style={{ fontSize: 12, color: '#999' }}>完善作品信息</span></Divider>
             
             <Row gutter={24}>
                {/* 左侧：文本信息 */}
                <Col span={15}>
                    <Form.Item label="作品标题" name="title" rules={[{ required: true, message: '起个好名字吧' }]}>
                        <Input placeholder="例如：赛博朋克风格-雨夜杀手" size="large" count={{ show: true, max: 30 }} style={{ borderRadius: ROUND_PILL }} />
                    </Form.Item>

                    <Form.Item label="作品描述" name="description" rules={[{ required: true, message: '请简单描述一下' }]}>
                        <TextArea 
                            rows={3} 
                            placeholder="描述一下画面内容、适用场景，或者给买家一些建议..." 
                            showCount 
                            maxLength={200} 
                            style={{ borderRadius: ROUND_PANEL }}
                        />
                    </Form.Item>

                    <Form.Item label="搜索标签" name="tags" tooltip="从标签库选择或输入自定义标签，逗号/空格分隔">
                        <Select
                            mode="tags"
                            style={{ width: '100%', borderRadius: ROUND_PILL }}
                            placeholder="选择或输入标签，如：二次元, 8k"
                            tokenSeparators={[',', ' ']}
                            options={tagOptions}
                        />
                    </Form.Item>
                    <div style={{ marginTop: -8, marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        {recommendTags.length > 0 ? (
                          <span style={{ fontSize: 12, color: token.colorTextSecondary }}>热门标签</span>
                        ) : (
                          <span />
                        )}
                        <Button type="link" size="small" style={{ padding: 0, height: 'auto', fontSize: 12 }} onClick={() => form.setFieldsValue({ tags: [] })}>
                          一键清空
                        </Button>
                      </div>
                      {recommendTags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {recommendTags.map((t) => (
                            <Tag
                              key={t.value}
                              style={{ cursor: 'pointer', margin: 0 }}
                              onClick={() => {
                                const current = form.getFieldValue('tags') || [];
                                const next = Array.isArray(current) ? [...current] : [];
                                if (!next.includes(t.value)) next.push(t.value);
                                form.setFieldsValue({ tags: next });
                              }}
                            >
                              {t.label}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                </Col>

                {/* 右侧：封面与价格 - 固定比例容器，图片/视频完整展示不裁剪 */}
                <Col span={9}>
                    <Form.Item label="提示词效果图" name="coverImageUrl">
                        <div
                          className="cover-preview-wrapper"
                          style={{
                            width: '100%',
                            aspectRatio: '3/4',
                            maxHeight: 200,
                            overflow: 'hidden',
                            borderRadius: ROUND_PANEL,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ position: 'absolute', inset: 0 }}>
                            <CoverImagePicker
                              imageUrl={coverUrl}
                              resultUrls={(() => {
                                const r = selectedTaskInfo?.resultUrls;
                                if (!r) return [];
                                if (Array.isArray(r)) return r;
                                try { return typeof r === 'string' ? JSON.parse(r) : []; } catch { return []; }
                              })()}
                              onImageChange={(url: string) => { setCoverUrl(url); form.setFieldsValue({ coverImageUrl: url }); }}
                              tipText="提示词效果图"
                              token={token}
                            />
                          </div>
                        </div>
                    </Form.Item>

                    <Form.Item
                          label={
                            <Space size={4}>
                              <span>查看价格</span>
                              <QuestionCircleOutlined
                                style={{ color: token.colorPrimary, cursor: 'pointer', fontSize: 14 }}
                                onClick={(e) => { e.preventDefault(); setFeeRuleModalVisible(true); }}
                              />
                            </Space>
                          }
                          name="priceToken"
                          rules={[{ required: true, message: '请设置查看价格' }]}
                          style={{ marginBottom: 12 }}
                        >
                            <InputNumber 
                                min={0} 
                                max={9999} 
                                style={{ width: '100%', borderRadius: ROUND_PILL }} 
                                size="large"
                                addonAfter="TOKEN"
                                placeholder="0 即免费查看"
                            />
                        </Form.Item>
                        <Form.Item
                          label="买断价格"
                          name="buyoutPriceToken"
                          tooltip="设置后其他用户可买断获得独家查看权；0 表示不支持买断"
                          style={{ marginBottom: 0 }}
                        >
                            <InputNumber
                                min={0}
                                max={99999}
                                style={{ width: '100%', borderRadius: ROUND_PILL }}
                                size="large"
                                addonAfter="TOKEN"
                                placeholder="0 即不支持买断"
                            />
                        </Form.Item>
                </Col>
             </Row>

             {/* 隐私设置：有价格时强制隐藏，不可关闭 */}
             <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: token.colorFillAlter, padding: '8px 16px', borderRadius: ROUND_PANEL }}>
                {!hasPaidPrice ? (
                  <span style={{ fontSize: 13, color: token.colorTextSecondary }}>
                    <span style={{ marginRight: 8 }}>✓</span>
                    免费作品无需隐藏提示词，所有人可直接查看
                  </span>
                ) : (
                  <span style={{ fontSize: 13 }}>
                    <span style={{ marginRight: 8 }}>🔒</span>
                    已设置价格，未购买用户将隐藏具体 Prompt（不可关闭）
                  </span>
                )}
                <Form.Item name="isPromptHidden" valuePropName="checked" hidden>
                  <Switch size="small" />
                </Form.Item>
             </div>

             <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: token.colorTextSecondary }}>
               <InfoCircleOutlined style={{ color: token.colorPrimary }} />
               <span>上架后立即在商城展示，其他用户购买即可为您赚取积分。</span>
             </div>

             {/* 底部：授权方式下拉（无文案）+ 立刻分享（全圆弧） */}
             <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${token.colorBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <Form.Item name="licenseType" style={{ marginBottom: 0 }}>
                  <Select options={LICENSE_OPTIONS} size="middle" className="license-select-pill" popupClassName="license-select-dropdown-pill" style={{ minWidth: 180 }} placeholder="授权方式" />
                </Form.Item>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  icon={<RocketOutlined />}
                  style={{
                    borderRadius: ROUND_PILL,
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  立刻分享
                </Button>
             </div>
          </div>
        </Form>
      </Modal>
      
      <TaskSelectModal
        visible={taskSelectVisible}
        onClose={() => setTaskSelectVisible(false)}
        onSelect={handleTaskSelect}
      />

      <PromptMarketFeeRuleModal
        open={feeRuleModalVisible}
        onClose={() => setFeeRuleModalVisible(false)}
      />
    </>
  );
};

export default PromptMarketListingCreateFormModel;