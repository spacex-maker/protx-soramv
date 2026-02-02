import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Section, SectionTitle, SectionSubtitle } from '../styles';
import { GlobalOutlined, RightOutlined, ApiOutlined, AimOutlined, DollarOutlined, TableOutlined, BarChartOutlined } from '@ant-design/icons';
import { Spin, Empty, Alert, Tabs, Table, Button, Segmented, Select } from 'antd';
import { getHumanoidRobotList } from '../../../api/openrobotx';

// 参数对比表：参数 key -> 中文标签（仅展示有意义的对比项）
const COMPARE_PARAMS = [
  { key: 'company', label: '公司' },
  { key: 'model', label: '型号' },
  { key: 'countryOrigin', label: '产地' },
  { key: 'heightCm', label: '高度 (cm)' },
  { key: 'weightKg', label: '体重 (kg)' },
  { key: 'totalDof', label: '总自由度 (DOF)' },
  { key: 'handDofPerHand', label: '手部自由度/手' },
  { key: 'totalPayloadKg', label: '全身负载 (kg)' },
  { key: 'armPayloadKg', label: '手臂负载 (kg)' },
  { key: 'walkingSpeedKmh', label: '行走速度 (km/h)' },
  { key: 'runningSpeedKmh', label: '奔跑速度 (km/h)' },
  { key: 'batteryLifeHours', label: '电池续航 (h)' },
  { key: 'batteryCapacityKwh', label: '电池容量 (kWh)' },
  { key: 'chargeTimeHours', label: '充电时间 (h)' },
  { key: 'priceUsd', label: '价格 (USD)' },
  { key: 'targetApplication', label: '目标应用' },
  { key: 'aiCoreModel', label: 'AI 核心' },
  { key: 'availabilityStatus', label: '可用状态' },
  { key: 'releaseDate', label: '发布/首发日期' },
  { key: 'actuatorType', label: '执行器类型' },
  { key: 'visionSystem', label: '视觉系统' },
  { key: 'computingPlatform', label: '计算平台' },
  { key: 'connectivity', label: '网络连接' },
  { key: 'officialWebsite', label: '官网' },
];

const getParamValue = (robot, key) => {
  const v = robot[key];
  if (v == null || v === '') return '—';
  if (typeof v === 'number' && (key === 'endToEndAi' || key === 'multimodalAi' || key === 'rosCompatibility' || key === 'fleetManagement' || key === 'speechSupport' || key === 'multilingualSupport' || key === 'modularDesign')) return v === 1 ? '是' : '否';
  return String(v);
};

// 看板：数值型指标，带归一化上限（多参数同一坐标系）
const DASHBOARD_METRICS = [
  { key: 'heightCm', label: '高度 (cm)', max: 200 },
  { key: 'weightKg', label: '体重 (kg)', max: 100 },
  { key: 'totalDof', label: '总自由度 (DOF)', max: 50 },
  { key: 'totalPayloadKg', label: '全身负载 (kg)', max: 30 },
  { key: 'walkingSpeedKmh', label: '行走速度 (km/h)', max: 10 },
  { key: 'batteryLifeHours', label: '电池续航 (h)', max: 10 },
  { key: 'batteryCapacityKwh', label: '电池容量 (kWh)', max: 3 },
];

const getNumericValue = (robot, key) => {
  const v = robot[key];
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

// 雷达图维度（需归一化 0–100，缺失用 0）
const RADAR_INDICATORS = [
  { key: 'heightCm', name: '身高', max: 200 },
  { key: 'weightKg', name: '体重', max: 100 },
  { key: 'totalDof', name: '自由度', max: 50 },
  { key: 'walkingSpeedKmh', name: '步行速度', max: 10 },
  { key: 'totalPayloadKg', name: '负载', max: 30 },
  { key: 'batteryLifeHours', name: '续航', max: 10 },
];

const addImageCompressSuffix = (url, width = 400) => {
  if (!url) return '';
  if (url.includes('imageMogr2') || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}imageMogr2/format/webp/quality/80/thumbnail/${width}x`;
};

const ACCENT = '#00d4aa';

const ListWrap = styled.div`
  margin-top: 48px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
`;

const CARD_HEIGHT = 200;

const ListRow = styled(motion(Link))`
  display: flex;
  align-items: stretch;
  height: ${CARD_HEIGHT}px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${ACCENT}40;
    .row-arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 280px;
  }
`;

const Thumb = styled.div`
  flex-shrink: 0;
  width: 280px;
  height: 100%;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 180px;
    img {
      height: 180px;
      object-fit: cover;
    }
  }
`;

const ContentWrap = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 28px;
  gap: 12px;

  @media (max-width: 768px) {
    padding: 16px;
    margin-top: -48px;
    background: rgba(10, 14, 23, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 16px 16px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: none;
  }
`;

const RowHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
`;

const RowRegion = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  font-size: 10px;
  color: ${ACCENT};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${ACCENT}18;
  border-radius: 6px;
  flex-shrink: 0;
`;

const RowName = styled.h3`
  font-size: 19px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const RowSub = styled.span`
  font-size: 13px;
  color: #9aa0a6;
  display: block;
  margin-top: 2px;
`;

const RowDesc = styled.p`
  font-size: 13px;
  color: #b0b5ba;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RowMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
  font-size: 12px;
  color: #8b9096;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  span + span::before {
    content: '·';
    margin: 0 10px;
    color: rgba(255, 255, 255, 0.2);
  }
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const EnterLink = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${ACCENT};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  .row-arrow {
    opacity: 0.85;
    transition: opacity 0.2s, transform 0.2s;
  }
`;

const SpinWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 24px;
`;

const EmptyWrap = styled.div`
  padding: 48px 24px;
  text-align: center;
`;

const TabsWrap = styled.div`
  margin-top: 32px;
  .ant-tabs-nav {
    margin-bottom: 24px;
  }
  .ant-tabs-tab {
    color: #9aa0a6;
  }
  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #00d4aa;
  }
  .ant-tabs-ink-bar {
    background: #00d4aa;
  }
  .ant-tabs-nav::before {
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

const CompareCtaWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

const CompareTableWrap = styled.div`
  overflow-x: auto;
  margin-top: 16px;
  .ant-table {
    background: rgba(255, 255, 255, 0.02);
  }
  .ant-table-thead > tr > th {
    background: rgba(0, 212, 170, 0.08);
    color: #e8eaed;
    border-color: rgba(255, 255, 255, 0.08);
    font-weight: 600;
  }
  .ant-table-thead > tr > th:first-child {
    background: #0a0e17 !important;
    z-index: 2;
  }
  .ant-table-tbody > tr > td {
    background: rgba(255, 255, 255, 0.02);
    color: #b0b5ba;
    border-color: rgba(255, 255, 255, 0.06);
  }
  .ant-table-tbody > tr:hover > td {
    background: rgba(255, 255, 255, 0.04);
  }
  .ant-table-tbody > tr > td:first-child {
    color: #9aa0a6;
    font-weight: 500;
    white-space: nowrap;
    background: #0a0e17 !important;
    z-index: 1;
  }
  .ant-table-tbody > tr:hover > td:first-child {
    background: #0e131c !important;
  }
`;

const DashboardWrap = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  .chart-title {
    font-size: 14px;
    font-weight: 600;
    color: #e8eaed;
    margin-bottom: 16px;
  }
  .echarts-for-react {
    width: 100% !important;
  }
`;

const CHART_COLORS = ['#00d4aa', '#5ee7df', '#7dd3fc', '#a78bfa', '#f472b6', '#fb923c', '#facc15', '#4ade80'];

const RobotCompareSection = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('intro');
  // 看板：当前选中的参数，切换后 X/Y 轴含义与数据随之变化
  const [selectedMetricKey, setSelectedMetricKey] = useState(DASHBOARD_METRICS[0].key);
  const [useNormalized, setUseNormalized] = useState(false); // 是否显示归一化 0–100
  // 横轴机器人多选：不选则显示全部
  const [selectedRobotIds, setSelectedRobotIds] = useState([]);
  // 横轴排序：默认(原序) / 升序 / 降序（按当前参数值）
  const [chartSortOrder, setChartSortOrder] = useState('default');

  const chartList = useMemo(() => {
    if (!list.length) return [];
    if (selectedRobotIds.length === 0) return list;
    return list.filter((r) => selectedRobotIds.includes(r.id));
  }, [list, selectedRobotIds]);

  // 单参数柱状图：切换参数后 X=机器人，Y=该参数（原始值或归一化），意义随参数变；横轴仅展示已选机器人，支持按当前参数排序
  const metricBarOption = useMemo(() => {
    if (!chartList.length) return null;
    const metric = DASHBOARD_METRICS.find((m) => m.key === selectedMetricKey) || DASHBOARD_METRICS[0];
    const getVal = (r) => {
      const v = getNumericValue(r, metric.key);
      if (v == null) return null;
      return useNormalized ? Math.min(100, (Number(v) / metric.max) * 100) : Number(v);
    };
    const sortedList =
      chartSortOrder === 'default'
        ? [...chartList]
        : [...chartList].sort((a, b) => {
            const va = getVal(a);
            const vb = getVal(b);
            const na = va == null ? -Infinity : Number(va);
            const nb = vb == null ? -Infinity : Number(vb);
            return chartSortOrder === 'asc' ? na - nb : nb - na;
          });
    const names = sortedList.map((r) => `${r.company} · ${r.model}`);
    const values = sortedList.map((r) => getVal(r));
    const hasData = values.some((v) => v != null && v > 0);
    if (!hasData) return null;
    const yAxisName = useNormalized ? '归一化 (0–100)' : metric.label;
    const yMin = useNormalized ? 0 : undefined;
    const yMax = useNormalized ? 100 : undefined;
    return {
      grid: { left: 64, right: 32, top: 24, bottom: 72 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(10, 14, 23, 0.95)',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#e8eaed' },
        formatter: (params) => {
          if (!params || !params.length) return '';
          const idx = params[0].dataIndex;
          const raw = getNumericValue(sortedList[idx], metric.key);
          const val = params[0].value;
          const rawStr = raw != null ? String(raw) : '—';
          return `<strong>${names[idx]}</strong><br/>${metric.label}: ${val != null ? (useNormalized ? `${Number(val).toFixed(1)}（原始值 ${rawStr}）` : rawStr) : '—'}`;
        },
      },
      xAxis: {
        type: 'category',
        data: names,
        name: '机器人',
        nameTextStyle: { color: '#9aa0a6', fontSize: 11 },
        axisLabel: { color: '#9aa0a6', rotate: names.length > 4 ? 18 : 0, fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisTick: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        name: yAxisName,
        nameTextStyle: { color: '#9aa0a6', fontSize: 11 },
        nameGap: 40,
        axisLabel: { color: '#9aa0a6' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          name: metric.label,
          data: values,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: ACCENT },
                { offset: 1, color: 'rgba(0, 212, 170, 0.5)' },
              ],
            },
          },
          barMaxWidth: 48,
        },
      ],
    };
  }, [chartList, selectedMetricKey, useNormalized, chartSortOrder]);

  const radarChartOption = useMemo(() => {
    if (!chartList.length) return null;
    const series = chartList.map((robot, i) => ({
      name: `${robot.company} · ${robot.model}`,
      value: RADAR_INDICATORS.map((ind) => {
        const v = getNumericValue(robot, ind.key);
        if (v == null) return 0;
        return Math.min(100, (Number(v) / ind.max) * 100);
      }),
      lineStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      areaStyle: { opacity: 0.15 },
    }));
    return {
      tooltip: {
        backgroundColor: 'rgba(10, 14, 23, 0.9)',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#e8eaed' },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#9aa0a6' },
      },
      radar: {
        indicator: RADAR_INDICATORS.map((ind) => ({ name: ind.name, max: 100 })),
        splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.04)'] } },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisName: { color: '#9aa0a6' },
      },
      series: [{ type: 'radar', data: series }],
    };
  }, [chartList]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHumanoidRobotList({ currentPage: 1, pageSize: 20 })
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data?.data) {
          setList(res.data.data);
        } else {
          setError(res.message || '加载失败');
          setList([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || '加载失败');
          setList([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <Section id="robot-compare">
      <SectionTitle
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        人形机器人参数对比
      </SectionTitle>
      <SectionSubtitle
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
      >
        主流人形机器人型号、自由度、负载、续航与 AI 能力一览，支持按公司与产地筛选。
      </SectionSubtitle>

      {loading && (
        <SpinWrap>
          <Spin size="large" />
        </SpinWrap>
      )}

      {!loading && error && (
        <EmptyWrap>
          <Alert type="warning" message={error} showIcon />
        </EmptyWrap>
      )}

      {!loading && !error && list.length === 0 && (
        <EmptyWrap>
          <Empty description="暂无机器人数据" />
        </EmptyWrap>
      )}

      {!loading && !error && list.length > 0 && (
        <TabsWrap>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'intro',
                label: '机器人介绍',
                children: (
                  <>
                    <CompareCtaWrap>
                      <Button
                        type="primary"
                        size="large"
                        icon={<TableOutlined />}
                        onClick={() => setActiveTab('compare')}
                        style={{ background: ACCENT, borderColor: ACCENT }}
                      >
                        参数对比
                      </Button>
                    </CompareCtaWrap>
                    <ListWrap>
                      {list.map((robot, i) => (
                        <ListRow
                          key={robot.id}
                          to={`/openrobotx/robots/${robot.id}`}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: Math.min(i * 0.04, 0.4) }}
                        >
                          <Thumb>
                            {robot.imageUrl ? (
                              <img
                                src={addImageCompressSuffix(robot.imageUrl, 400)}
                                alt={`${robot.company} ${robot.model}`}
                                loading="lazy"
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: 'rgba(0,212,170,0.12)' }} />
                            )}
                          </Thumb>
                          <ContentWrap>
                            <div>
                              <RowHeader>
                                {robot.countryOrigin && (
                                  <RowRegion>
                                    <GlobalOutlined /> {robot.countryOrigin}
                                  </RowRegion>
                                )}
                                <RowName>{robot.company} · {robot.model}</RowName>
                              </RowHeader>
                              {robot.targetApplication && (
                                <RowSub>{robot.targetApplication}</RowSub>
                              )}
                              {robot.highlightsNotes && (
                                <RowDesc>{robot.highlightsNotes}</RowDesc>
                              )}
                              <RowMeta>
                                {robot.totalDof != null && (
                                  <span><ApiOutlined /> {robot.totalDof} DOF</span>
                                )}
                                {robot.walkingSpeedKmh != null && (
                                  <span>步行 {robot.walkingSpeedKmh} km/h</span>
                                )}
                                {robot.totalPayloadKg != null && (
                                  <span>负载 {robot.totalPayloadKg} kg</span>
                                )}
                                {robot.batteryLifeHours != null && (
                                  <span>续航 {robot.batteryLifeHours}h</span>
                                )}
                                {robot.priceUsd && (
                                  <span><DollarOutlined /> {robot.priceUsd}</span>
                                )}
                              </RowMeta>
                            </div>
                            <BottomRow>
                              {robot.targetApplication && (
                                <span style={{ fontSize: 12, color: '#8b9096' }}>
                                  <AimOutlined /> {robot.targetApplication}
                                </span>
                              )}
                              <EnterLink>
                                查看参数
                                <RightOutlined className="row-arrow" />
                              </EnterLink>
                            </BottomRow>
                          </ContentWrap>
                        </ListRow>
                      ))}
                    </ListWrap>
                  </>
                ),
              },
              {
                key: 'compare',
                label: '参数对比',
                children: (
                  <CompareTableWrap>
                    <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: '#9aa0a6', fontSize: 13 }}>选择机器人：</span>
                      <Select
                        mode="multiple"
                        placeholder="选择要对比的机器人（不选则显示全部）"
                        value={selectedRobotIds.length > 0 ? selectedRobotIds : undefined}
                        onChange={setSelectedRobotIds}
                        options={list.map((r) => ({ label: `${r.company} · ${r.model}`, value: r.id }))}
                        allowClear
                        style={{ minWidth: 260 }}
                        maxTagCount="responsive"
                        popupMatchSelectWidth={false}
                        popupStyle={{ minWidth: 280 }}
                        dropdownStyle={{ background: '#1a1f2e', borderColor: 'rgba(255,255,255,0.1)' }}
                        optionStyle={{ background: 'transparent' }}
                      />
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                        {selectedRobotIds.length === 0 ? `当前显示全部 ${list.length} 台` : `已选 ${chartList.length} 台`}
                      </span>
                    </div>
                    <Table
                      dataSource={COMPARE_PARAMS.map((p) => ({
                        key: p.key,
                        param: p.label,
                        ...chartList.reduce((acc, r, i) => {
                          acc[`robot_${i}`] = getParamValue(r, p.key);
                          return acc;
                        }, {}),
                      }))}
                      columns={[
                        {
                          title: '参数',
                          dataIndex: 'param',
                          key: 'param',
                          width: 160,
                          fixed: 'left',
                        },
                        ...chartList.map((robot, i) => ({
                          title: `${robot.company} · ${robot.model}`,
                          dataIndex: `robot_${i}`,
                          key: `robot_${i}`,
                          ellipsis: true,
                          render: (val, row) => {
                            if (row.key === 'officialWebsite' && val && val !== '—') {
                              return (
                                <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>
                                  {val}
                                </a>
                              );
                            }
                            return val;
                          },
                        })),
                      ]}
                      pagination={false}
                      size="small"
                      scroll={{ x: 'max-content' }}
                    />
                  </CompareTableWrap>
                ),
              },
              {
                key: 'dashboard',
                label: '看板',
                children: (
                  <DashboardWrap>
                    <ChartCard style={{ gridColumn: '1 / -1' }}>
                      <div className="chart-title" style={{ marginBottom: 12 }}>
                        参数对比：切换参数后 X/Y 轴含义与数据随之变化
                      </div>
                      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#9aa0a6', fontSize: 13 }}>横轴机器人：</span>
                        <Select
                          mode="multiple"
                          placeholder="选择要对比的机器人（不选则显示全部）"
                          value={selectedRobotIds.length > 0 ? selectedRobotIds : undefined}
                          onChange={setSelectedRobotIds}
                          options={list.map((r) => ({ label: `${r.company} · ${r.model}`, value: r.id }))}
                          allowClear
                          style={{ minWidth: 260 }}
                          maxTagCount="responsive"
                          popupMatchSelectWidth={false}
                          popupStyle={{ minWidth: 280 }}
                          dropdownStyle={{ background: '#1a1f2e', borderColor: 'rgba(255,255,255,0.1)' }}
                          optionStyle={{ background: 'transparent' }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                          {selectedRobotIds.length === 0 ? `当前显示全部 ${list.length} 台` : `已选 ${selectedRobotIds.length} 台`}
                        </span>
                      </div>
                      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                        <Segmented
                          value={selectedMetricKey}
                          onChange={setSelectedMetricKey}
                          options={DASHBOARD_METRICS.map((m) => ({ label: m.label, value: m.key }))}
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        />
                        <Segmented
                          value={useNormalized ? 'normalized' : 'raw'}
                          onChange={(v) => setUseNormalized(v === 'normalized')}
                          options={[
                            { label: '原始值', value: 'raw' },
                            { label: '归一化 (0–100)', value: 'normalized' },
                          ]}
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        />
                        <Segmented
                          value={chartSortOrder}
                          onChange={setChartSortOrder}
                          options={[
                            { label: '默认', value: 'default' },
                            { label: '升序', value: 'asc' },
                            { label: '降序', value: 'desc' },
                          ]}
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        />
                      </div>
                      {metricBarOption && (
                        <ReactECharts option={metricBarOption} style={{ height: 340 }} notMerge />
                      )}
                      {!metricBarOption && chartList.length > 0 && (
                        <div style={{ color: '#9aa0a6', padding: 24, textAlign: 'center' }}>
                          当前参数暂无数据
                        </div>
                      )}
                    </ChartCard>
                    {radarChartOption && (
                      <ChartCard style={{ gridColumn: '1 / -1' }}>
                        <div className="chart-title">综合对比（雷达图，归一化）</div>
                        <ReactECharts option={radarChartOption} style={{ height: 380 }} notMerge />
                      </ChartCard>
                    )}
                  </DashboardWrap>
                ),
              },
            ]}
          />
        </TabsWrap>
      )}
    </Section>
  );
};

export default RobotCompareSection;
