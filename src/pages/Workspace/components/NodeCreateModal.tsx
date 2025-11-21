import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Form, Input, message, Spin, Empty, Select, InputNumber, Button, Tooltip, Row, Col, Slider } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { ReloadOutlined, SortAscendingOutlined, CheckCircleFilled, CloseCircleFilled, ClockCircleFilled } from '@ant-design/icons';
import { 
  getActiveCloudProviders, 
  createUserStorageNode, 
  getStorageRegions,
  type CloudProvider, 
  type StorageRegion
} from 'services/storageService';

interface NodeCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin-top: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
`;

const RegionCard = styled.div<{ $isSelected: boolean }>`
  padding: 16px;
  border: 1px solid ${props => {
    if (props.$isSelected) {
      return props.theme.mode === 'dark' ? '#177ddc' : '#1890ff';
    }
    return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#d9d9d9';
  }};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.$isSelected) {
      return props.theme.mode === 'dark' ? 'rgba(23, 125, 220, 0.1)' : '#e6f7ff';
    }
    return props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#fff';
  }};
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    border-color: ${props => props.theme.mode === 'dark' ? '#177ddc' : '#1890ff'};
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#f5f5f5'};
  }
`;

const RegionCardContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  width: 100%;
`;

const RegionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const RegionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const RegionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const RegionName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RegionCode = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
`;

const RegionCodeTag = styled.span`
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
`;

const RegionLatencyBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const SortButton = styled(Button as any)<{ $active: boolean }>`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.$active ? (props.theme.mode === 'dark' ? '#177ddc' : '#1890ff') : 'inherit'} !important;
  border-color: ${props => props.$active ? (props.theme.mode === 'dark' ? '#177ddc' : '#1890ff') : ''} !important;
  background: ${props => props.$active ? (props.theme.mode === 'dark' ? 'rgba(23, 125, 220, 0.1)' : '#e6f7ff') : ''} !important;
  
  .anticon {
    font-size: 16px;
  }
`;

const RetryButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  transition: all 0.3s ease;
  margin-left: 8px;

  &:hover {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
    color: ${props => props.theme.mode === 'dark' ? '#177ddc' : '#1890ff'};
  }
`;


type RegionLatencyStatus = 'testing' | 'success' | 'error' | 'unavailable';

interface RegionLatencyState {
  status: RegionLatencyStatus;
  latency?: number;
}

const StyledSelect = styled(Select as any)`
  .ant-select-selector {
    border-radius: 999px !important;
    height: 32px !important;
  }
  
  .ant-select-selection-item {
    display: flex;
    align-items: center;
    line-height: 30px !important;
  }
  
  .ant-select-selection-placeholder {
    line-height: 30px !important;
  }
`;

const StyledInput = styled(Input as any)`
  border-radius: 999px !important;
  height: 32px !important;
  
  &.ant-input {
    height: 32px !important;
    line-height: 30px !important;
  }
`;

const QuickSelectButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const QuickSelectButton = styled(Button as any)`
  border-radius: 6px;
  height: 32px;
`;

const SliderContainer = styled.div`
  margin-bottom: 16px;
  padding: 0 4px;
`;

const StorageInputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ProviderOptionContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProviderIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
`;

const RegionLatency = styled.div<{ $status?: RegionLatencyStatus }>`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => {
    switch (props.$status) {
      case 'success':
        return props.theme.mode === 'dark' ? '#95de64' : '#52c41a';
      case 'error':
      case 'unavailable':
        return props.theme.mode === 'dark' ? '#ff7875' : '#ff4d4f';
      case 'testing':
      default:
        return props.theme.mode === 'dark' ? '#faad14' : '#fa8c16';
    }
  }};
`;

const LatencyDot = styled.span<{ $status?: RegionLatencyStatus }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background: ${props => {
    switch (props.$status) {
      case 'success':
        return '#52c41a';
      case 'error':
      case 'unavailable':
        return '#ff4d4f';
      case 'testing':
      default:
        return '#faad14';
    }
  }};
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
`;

const SelectedRegionBox = styled.div`
  padding: 12px 20px;
  background: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 999px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
`;

const SelectedRegionName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
`;

const SelectedRegionCode = styled.div`
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
`;

const NodeCreateModal: React.FC<NodeCreateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>(undefined);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [creating, setCreating] = useState(false);
  const [regions, setRegions] = useState<StorageRegion[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [nodeName, setNodeName] = useState<string>('');
  const [regionLatencies, setRegionLatencies] = useState<Record<number, RegionLatencyState>>({});
  const [sortByLatency, setSortByLatency] = useState(false);
  const [storageLimitGB, setStorageLimitGB] = useState<number>(10); // 默认10GB，用于Slider
  const intl = useIntl();
  const mountedRef = useRef<boolean>(true);

  // 默认值常量
  const DEFAULT_CREDENTIAL_ID = 1;
  const DEFAULT_NODE_TYPE = 'STANDARD';
  const DEFAULT_STORAGE_LIMIT = 10737418240; // 10GB
  const PING_TIMEOUT = 5000;
  const GB_TO_BYTES = 1073741824; // 1GB = 1073741824 bytes

  // 加载提供商列表
  useEffect(() => {
    if (open) {
      loadProviders();
      form.resetFields();
      form.setFieldsValue({
        nodeType: DEFAULT_NODE_TYPE,
        storageLimit: DEFAULT_STORAGE_LIMIT,
      });
      setSelectedProviderId(undefined);
      setSelectedRegionId(undefined);
      setRegions([]);
      setNodeName('');
      setRegionLatencies({});
      setSortByLatency(false);
      setStorageLimitGB(10); // 重置为10GB
    }
  }, [open]);

  // 当选择云厂商时，加载地域列表
  useEffect(() => {
    if (selectedProviderId) {
      loadRegions(selectedProviderId);
    } else {
      setRegions([]);
      setSelectedRegionId(undefined);
      setRegionLatencies({});
      setSortByLatency(false);
    }
  }, [selectedProviderId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProviders = async () => {
    setLoadingProviders(true);
    try {
      const response = await getActiveCloudProviders();
      if (response.success && response.data) {
        setProviders(response.data);
      } else {
        message.error(response.message || intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadProvidersFailed', defaultMessage: '获取云厂商列表失败' }));
      }
    } catch (error) {
      console.error('加载云厂商列表失败:', error);
      message.error(intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadProvidersFailed', defaultMessage: '加载云厂商列表失败' }));
    } finally {
      setLoadingProviders(false);
    }
  };

  const loadRegions = async (providerId: number) => {
    setLoadingRegions(true);
    try {
      const response = await getStorageRegions(providerId);
      if (response.success && response.data) {
        setRegions(response.data);
      } else {
        message.error(response.message || intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadRegionsFailed', defaultMessage: '获取地域列表失败' }));
      }
    } catch (error) {
      console.error('加载地域列表失败:', error);
      message.error(intl.formatMessage({ id: 'cloudDrive.nodeCreate.loadRegionsFailed', defaultMessage: '加载地域列表失败' }));
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleProviderChange = (providerId: number | undefined) => {
    if (providerId !== undefined) {
      setSelectedProviderId(providerId);
    }
  };

  const handleRegionSelect = (regionId: number) => {
    setSelectedRegionId(regionId);
  };

  const runLatencyTest = useCallback(async (region: StorageRegion) => {
    if (!region?.id) {
      return;
    }

    if (!region.pingEndpoint) {
      setRegionLatencies(prev => ({
        ...prev,
        [region.id]: { status: 'unavailable' },
      }));
      return;
    }

    setRegionLatencies(prev => ({
      ...prev,
      [region.id]: { status: 'testing' },
    }));

    const fetchOptions: RequestInit = {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
    };

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    if (controller) {
      fetchOptions.signal = controller.signal;
    }

    const pingUrl = region.pingEndpoint.includes('?')
      ? `${region.pingEndpoint}&_ping=${Date.now()}`
      : `${region.pingEndpoint}?_ping=${Date.now()}`;

    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
      controller?.abort();
    }, PING_TIMEOUT);

    try {
      await fetch(pingUrl, fetchOptions);
      if (!mountedRef.current) {
        return;
      }
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const latency = Math.max(1, Math.round(endTime - startTime));
      setRegionLatencies(prev => ({
        ...prev,
        [region.id]: { status: 'success', latency },
      }));
    } catch {
      if (!mountedRef.current) {
        return;
      }
      setRegionLatencies(prev => ({
        ...prev,
        [region.id]: { status: 'error' },
      }));
    } finally {
      clearTimeout(timeoutId);
    }
  }, [PING_TIMEOUT]);

  useEffect(() => {
    if (!regions || regions.length === 0) {
      setRegionLatencies({});
      return;
    }
    regions.forEach(region => {
      runLatencyTest(region);
    });
  }, [regions, runLatencyTest]);

  const sortedRegions = React.useMemo(() => {
    if (!sortByLatency) {
      return regions;
    }
    return [...regions].sort((a, b) => {
      const latencyA = regionLatencies[a.id]?.latency;
      const latencyB = regionLatencies[b.id]?.latency;
      
      // 如果都有延迟数据，按延迟升序排序
      if (latencyA !== undefined && latencyB !== undefined) {
        return latencyA - latencyB;
      }
      
      // 有延迟数据的排前面
      if (latencyA !== undefined) return -1;
      if (latencyB !== undefined) return 1;
      
      // 都没有延迟数据，保持原序
      return 0;
    });
  }, [regions, regionLatencies, sortByLatency]);

  const renderLatencyText = (state?: RegionLatencyState) => {
    if (!state) {
      return intl.formatMessage({ id: 'cloudDrive.nodeCreate.pingTesting', defaultMessage: '延迟测试中...' });
    }
    switch (state.status) {
      case 'success':
        return intl.formatMessage(
          { id: 'cloudDrive.nodeCreate.pingLatency', defaultMessage: '延迟 {value} ms' },
          { value: state.latency ?? '--' }
        );
      case 'error':
        return intl.formatMessage({ id: 'cloudDrive.nodeCreate.pingFailed', defaultMessage: '延迟测试失败' });
      case 'unavailable':
        return intl.formatMessage({ id: 'cloudDrive.nodeCreate.pingUnavailable', defaultMessage: '暂不支持延迟测试' });
      case 'testing':
      default:
        return intl.formatMessage({ id: 'cloudDrive.nodeCreate.pingTesting', defaultMessage: '延迟测试中...' });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedProviderId) {
        message.warning(intl.formatMessage({ id: 'cloudDrive.nodeCreate.selectProviderRequired', defaultMessage: '请先选择云厂商' }));
        return;
      }

      if (!selectedRegionId) {
        message.warning(intl.formatMessage({ id: 'cloudDrive.nodeCreate.selectRegionRequired', defaultMessage: '请先选择地域' }));
        return;
      }

      const values = await form.validateFields();
      
      const selectedProvider = providers.find(p => p.id === selectedProviderId);
      
      setCreating(true);
      const response = await createUserStorageNode({
        providerId: selectedProviderId,
        regionId: selectedRegionId,
        credentialId: DEFAULT_CREDENTIAL_ID,
        nodeName: nodeName || (selectedProvider ? `${selectedProvider.providerName}节点` : '新节点'),
        nodeType: values.nodeType || DEFAULT_NODE_TYPE,
        storageLimit: values.storageLimit || DEFAULT_STORAGE_LIMIT,
      });

      if (response.success) {
        message.success(intl.formatMessage({ id: 'cloudDrive.nodeCreate.success', defaultMessage: '存储节点创建成功' }));
        onSuccess();
        onClose();
        form.resetFields();
        setSelectedProviderId(undefined);
        setSelectedRegionId(undefined);
        setRegions([]);
        setNodeName('');
      } else {
        message.error(response.message || intl.formatMessage({ id: 'cloudDrive.nodeCreate.failed', defaultMessage: '创建存储节点失败' }));
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setCreating(false);
    }
  };

  const selectedProvider = providers.find(p => p.id === selectedProviderId);
  const selectedRegion = regions.find(r => r.id === selectedRegionId);

  return (
    <Modal
      title={<FormattedMessage id="cloudDrive.nodeCreate.title" defaultMessage="新增存储节点" />}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={creating}
      destroyOnClose
      width={700}
      okText={intl.formatMessage({ id: 'common.confirm', defaultMessage: '确认' })}
      cancelText={intl.formatMessage({ id: 'common.cancel', defaultMessage: '取消' })}
    >
      <Spin spinning={loadingProviders}>
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <FormattedMessage id="cloudDrive.nodeCreate.selectProvider" defaultMessage="选择云厂商" />
                <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
              </div>
              <StyledSelect
                placeholder={intl.formatMessage({ id: 'cloudDrive.nodeCreate.selectProviderPlaceholder', defaultMessage: '请选择云厂商' })}
                value={selectedProviderId}
                onChange={(value: number) => handleProviderChange(value)}
                loading={loadingProviders}
                style={{ width: '100%' }}
                getPopupContainer={(triggerNode: HTMLElement) => {
                  const container = triggerNode?.parentElement;
                  return container || document.body;
                }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{
                  borderRadius: '12px',
                }}
                notFoundContent={
                  providers.length === 0 ? (
                    <Empty 
                      description={intl.formatMessage({ id: 'cloudDrive.nodeCreate.noProviders', defaultMessage: '暂无可用云厂商' })} 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : null
                }
                optionLabelProp="label"
              >
                {providers.map(provider => (
                  <Select.Option 
                    key={provider.id} 
                    value={provider.id}
                    label={
                      <ProviderOptionContent>
                        {provider.iconImg && (
                          <ProviderIcon 
                            src={provider.iconImg} 
                            alt={provider.providerName}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span>{provider.providerName}</span>
                      </ProviderOptionContent>
                    }
                  >
                    <ProviderOptionContent>
                      {provider.iconImg && (
                        <ProviderIcon 
                          src={provider.iconImg} 
                          alt={provider.providerName}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{provider.providerName}</span>
                    </ProviderOptionContent>
                  </Select.Option>
                ))}
              </StyledSelect>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <FormattedMessage id="cloudDrive.nodeCreate.nodeName" defaultMessage="节点名称" />
              </div>
              <StyledInput 
                placeholder={intl.formatMessage({ 
                  id: 'cloudDrive.nodeCreate.nodeNamePlaceholder', 
                  defaultMessage: '留空将使用默认名称' 
                })}
                value={nodeName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  if (value.length <= 50) {
                    setNodeName(value);
                  }
                }}
                autoComplete="off"
              />
              {nodeName.length > 0 && nodeName.length >= 50 && (
                <div style={{ marginTop: 4, fontSize: 12, color: '#ff4d4f' }}>
                  {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nameMaxLength', defaultMessage: '节点名称不能超过50个字符' })}
                </div>
              )}
            </Col>
          </Row>

          {selectedProviderId && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <FormattedMessage id="cloudDrive.nodeCreate.selectRegion" defaultMessage="选择地域" />
                  <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
                </div>
                <Tooltip title={intl.formatMessage({ id: 'cloudDrive.nodeCreate.sortByLatency', defaultMessage: '按延迟排序' })}>
                  <SortButton 
                    size="small" 
                    type="text" 
                    $active={sortByLatency}
                    onClick={() => setSortByLatency(!sortByLatency)}
                    icon={<SortAscendingOutlined />}
                  >
                    {intl.formatMessage({ id: 'common.latency', defaultMessage: '延迟' })}
                  </SortButton>
                </Tooltip>
              </div>
              <Spin spinning={loadingRegions}>
                {regions.length === 0 ? (
                  <Empty 
                    description={intl.formatMessage({ id: 'cloudDrive.nodeCreate.noRegions', defaultMessage: '暂无可用地域' })} 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <RegionGrid>
                    {sortedRegions.map(region => {
                      const isSelected = selectedRegionId === region.id;
                      const latencyState = regionLatencies[region.id];
                      return (
                        <RegionCard
                          key={region.id}
                          $isSelected={isSelected}
                          onClick={() => handleRegionSelect(region.id)}
                        >
                          <RegionInfo>
                            <RegionHeader>
                              <RegionName>{region.regionName}</RegionName>
                            </RegionHeader>
                            <RegionCode>{region.regionCode}</RegionCode>
                          </RegionInfo>
                          <RegionLatencyBox>
                            <RegionLatency $status={latencyState?.status}>
                              <LatencyDot $status={latencyState?.status} />
                              <span>{renderLatencyText(latencyState)}</span>
                            </RegionLatency>
                            {latencyState?.status === 'error' && (
                              <Tooltip title={intl.formatMessage({ id: 'common.retry', defaultMessage: '重试' })}>
                                <RetryButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    runLatencyTest(region);
                                  }}
                                >
                                  <ReloadOutlined />
                                </RetryButton>
                              </Tooltip>
                            )}
                          </RegionLatencyBox>
                        </RegionCard>
                      );
                    })}
                  </RegionGrid>
                )}
              </Spin>
            </div>
          )}

          {selectedRegion && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                <FormattedMessage id="cloudDrive.nodeCreate.selectedRegion" defaultMessage="已选地域" />
              </div>
              <SelectedRegionBox>
                <SelectedRegionName>{selectedRegion.regionName}</SelectedRegionName>
                <SelectedRegionCode>{selectedRegion.regionCode}</SelectedRegionCode>
              </SelectedRegionBox>
            </div>
          )}

          <Form.Item
            name="nodeType"
            label={<FormattedMessage id="cloudDrive.nodeCreate.nodeType" defaultMessage="节点类型" />}
            initialValue={DEFAULT_NODE_TYPE}
          >
            <StyledSelect
              getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentElement || document.body}
              dropdownStyle={{
                borderRadius: '12px',
              }}
            >
              <Select.Option value="STANDARD">
                {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nodeType.standard', defaultMessage: '标准存储' })}
              </Select.Option>
              <Select.Option value="LOW_FREQ">
                {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nodeType.lowFreq', defaultMessage: '低频存储' })}
              </Select.Option>
              <Select.Option value="ARCHIVE">
                {intl.formatMessage({ id: 'cloudDrive.nodeCreate.nodeType.archive', defaultMessage: '归档存储' })}
              </Select.Option>
            </StyledSelect>
          </Form.Item>

          <Form.Item
            name="storageLimit"
            label={<FormattedMessage id="cloudDrive.nodeCreate.storageLimit" defaultMessage="存储限制" />}
            initialValue={DEFAULT_STORAGE_LIMIT}
            rules={[
              { required: true, message: intl.formatMessage({ id: 'cloudDrive.nodeCreate.storageLimitRequired', defaultMessage: '请输入存储限制' }) },
              { type: 'number', min: GB_TO_BYTES, message: intl.formatMessage({ id: 'cloudDrive.nodeCreate.storageLimitMin', defaultMessage: '存储限制不能小于1GB' }) }
            ]}
          >
            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.storageLimit !== currentValues.storageLimit} noStyle>
              {({ getFieldValue }) => {
                const storageLimit = getFieldValue('storageLimit');
                const currentGB = storageLimit ? Math.round(storageLimit / GB_TO_BYTES) : storageLimitGB;
                return (
                  <div>
                    <QuickSelectButtons>
                      {[1, 10, 100, 1000].map((gb) => (
                        <QuickSelectButton
                          key={gb}
                          type={currentGB === gb ? 'primary' : 'default'}
                          onClick={() => {
                            const bytes = gb * GB_TO_BYTES;
                            setStorageLimitGB(gb);
                            form.setFieldsValue({ storageLimit: bytes });
                          }}
                        >
                          {gb} GB
                        </QuickSelectButton>
                      ))}
                    </QuickSelectButtons>
                    
                    <SliderContainer>
                      <Slider
                        min={1}
                        max={1000}
                        step={1}
                        value={currentGB}
                        onChange={(value: number) => {
                          setStorageLimitGB(value);
                          form.setFieldsValue({ storageLimit: value * GB_TO_BYTES });
                        }}
                        tooltip={{
                          formatter: (value?: number) => `${value} GB`
                        }}
                      />
                    </SliderContainer>
                    
                    <StorageInputContainer>
                      <InputNumber
                        style={{ flex: 1 }}
                        min={1}
                        max={10000}
                        step={1}
                        value={currentGB}
                        onChange={(value: number | null) => {
                          if (value !== null && value >= 1) {
                            setStorageLimitGB(value);
                            form.setFieldsValue({ storageLimit: value * GB_TO_BYTES });
                          }
                        }}
                        formatter={(value) => {
                          if (value === undefined || value === null) return '';
                          return `${value} GB`;
                        }}
                        parser={(value: string | undefined) => {
                          if (!value || typeof value !== 'string') return 0;
                          const num = parseFloat(value.replace(/[^\d.]/g, ''));
                          if (isNaN(num) || num <= 0) return 1;
                          return Math.min(10000, Math.max(1, num));
                        }}
                        placeholder={intl.formatMessage({ 
                          id: 'cloudDrive.nodeCreate.storageLimitPlaceholder', 
                          defaultMessage: '请输入存储限制（GB）' 
                        })}
                      />
                    </StorageInputContainer>
                  </div>
                );
              }}
            </Form.Item>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default NodeCreateModal;
