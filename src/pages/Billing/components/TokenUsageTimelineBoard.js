import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import ReactECharts from 'echarts-for-react';
import {
  Button,
  DatePicker,
  Empty,
  Select,
  Spin,
  Statistic,
  Timeline,
  Tag,
  theme,
  message,
} from 'antd';
import {
  LineChartOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useIntl } from 'react-intl';
import dayjs from 'dayjs';
import instance from 'api/axios';
import {
  buildDailyTokenTrend,
  getChangeTypeMap,
  getQuickDateRange,
  summarizeTokenRecords,
} from '../billingUtils';

const BoardCard = styled.div`
  background: ${props => props.$token.colorBgContainer};
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  padding: 20px 22px 24px;
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;

  .title-block {
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: ${props => props.$token.colorText};
      display: flex;
      align-items: center;
      gap: 10px;
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: ${props => props.$token.colorTextSecondary};
    }
  }

  .controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  background: ${props => props.$token.colorFillQuaternary};
  border: 1px solid ${props => props.$token.colorBorderSecondary};

  .label {
    font-size: 12px;
    color: ${props => props.$token.colorTextSecondary};
    margin-bottom: 6px;
  }
`;

const ChartWrap = styled.div`
  margin-bottom: 20px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${props => props.$token.colorBorderSecondary};
  background: ${props => props.$token.colorBgLayout};
  padding: 8px 8px 0;
`;

const TimelineSection = styled.div`
  h3 {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
  }

  .ant-timeline-item-content {
    min-height: auto;
  }
`;

const TimelineItemBody = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;

  .main {
    min-width: 0;
  }

  .type {
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.$token.colorText};
  }

  .remark {
    margin-top: 4px;
    font-size: 12px;
    color: ${props => props.$token.colorTextSecondary};
    word-break: break-word;
  }

  .time {
    font-size: 12px;
    color: ${props => props.$token.colorTextQuaternary};
    white-space: nowrap;
  }

  .amount {
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$income ? props.$token.colorSuccess : props.$token.colorError};
    white-space: nowrap;
  }
`;

const MAX_FETCH_PAGES = 20;
const PAGE_SIZE = 100;

const fetchTokenUsageRecords = async (dateRange, intl) => {
  const paramsBase = {
    pageSize: PAGE_SIZE,
    coinType: 'TOKEN',
    orderBy: 'createTime',
    isDesc: true,
    createTimeStart: dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    createTimeEnd: dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss'),
  };

  let currentPage = 1;
  let allRecords = [];
  let total = 0;

  while (currentPage <= MAX_FETCH_PAGES) {
    const response = await instance.get('/productx/user-account-change-log/list', {
      params: { ...paramsBase, currentPage },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || intl.formatMessage({ id: 'billing.tokenBoard.fetchError', defaultMessage: '获取 Token 使用记录失败' }));
    }

    const { data = [], totalNum = 0 } = response.data.data || {};
    allRecords = allRecords.concat(data);
    total = totalNum;

    if (allRecords.length >= total || data.length < PAGE_SIZE) {
      break;
    }
    currentPage += 1;
  }

  return allRecords;
};

const TokenUsageTimelineBoard = () => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [quickPreset, setQuickPreset] = useState('30');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const changeTypeMap = useMemo(() => getChangeTypeMap(intl), [intl]);

  const quickDateOptions = useMemo(() => ([
    { value: 'today', label: intl.formatMessage({ id: 'billing.filter.today', defaultMessage: '今天' }) },
    { value: 'week', label: intl.formatMessage({ id: 'billing.filter.thisWeek', defaultMessage: '本周' }) },
    { value: 'month', label: intl.formatMessage({ id: 'billing.filter.thisMonth', defaultMessage: '本月' }) },
    { value: '7', label: intl.formatMessage({ id: 'billing.filter.days7', defaultMessage: '近7天' }) },
    { value: '30', label: intl.formatMessage({ id: 'billing.filter.days30', defaultMessage: '近30天' }) },
    { value: '90', label: intl.formatMessage({ id: 'billing.filter.days90', defaultMessage: '近3个月' }) },
  ]), [intl]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTokenUsageRecords(dateRange, intl);
      setRecords(data);
    } catch (error) {
      console.error(error);
      setRecords([]);
      message.error(error.message || intl.formatMessage({ id: 'billing.tokenBoard.fetchError', defaultMessage: '获取 Token 使用记录失败' }));
    } finally {
      setLoading(false);
    }
  }, [dateRange, intl]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const summary = useMemo(() => summarizeTokenRecords(records), [records]);
  const dailyTrend = useMemo(() => buildDailyTokenTrend(records, dateRange), [records, dateRange]);

  const chartOption = useMemo(() => {
    const dates = dailyTrend.map(item => item.date.slice(5));
    const consumed = dailyTrend.map(item => Number(item.consumed.toFixed(4)));
    const gained = dailyTrend.map(item => Number(item.gained.toFixed(4)));

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: [
          intl.formatMessage({ id: 'billing.tokenBoard.consumed', defaultMessage: '消耗' }),
          intl.formatMessage({ id: 'billing.tokenBoard.gained', defaultMessage: '获得' }),
        ],
        bottom: 0,
      },
      grid: {
        left: 12,
        right: 12,
        top: 24,
        bottom: 48,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { color: token.colorTextSecondary, fontSize: 11 },
        axisLine: { lineStyle: { color: token.colorBorderSecondary } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: token.colorTextSecondary, fontSize: 11 },
        splitLine: { lineStyle: { color: token.colorBorderSecondary, type: 'dashed' } },
      },
      series: [
        {
          name: intl.formatMessage({ id: 'billing.tokenBoard.consumed', defaultMessage: '消耗' }),
          type: 'bar',
          stack: 'total',
          barMaxWidth: 18,
          itemStyle: { color: token.colorError, borderRadius: [4, 4, 0, 0] },
          data: consumed,
        },
        {
          name: intl.formatMessage({ id: 'billing.tokenBoard.gained', defaultMessage: '获得' }),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 2, color: token.colorSuccess },
          itemStyle: { color: token.colorSuccess },
          data: gained,
        },
      ],
    };
  }, [dailyTrend, intl, token]);

  const timelineItems = useMemo(() => records.slice(0, 20).map((record) => {
    const amount = parseFloat(record.amount);
    const isIncome = amount > 0;
    const config = changeTypeMap[record.changeType] || {
      label: record.changeType,
      color: 'default',
    };

    return {
      color: isIncome ? token.colorSuccess : token.colorError,
      children: (
        <TimelineItemBody $token={token} $income={isIncome}>
          <div className="main">
            <div className="type">
              <Tag color={config.color} bordered={false} style={{ marginRight: 8 }}>
                {config.label}
              </Tag>
              <span className="amount">
                {isIncome ? '+' : '-'}
                {Math.abs(amount).toFixed(4)} Token
              </span>
            </div>
            {record.remark && <div className="remark">{record.remark}</div>}
            <div className="time">{dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>
        </TimelineItemBody>
      ),
    };
  }), [records, changeTypeMap, token]);

  const applyQuickPreset = (preset) => {
    setDateRange(getQuickDateRange(preset));
    setQuickPreset(preset);
  };

  return (
    <BoardCard $token={token}>
      <BoardHeader $token={token}>
        <div className="title-block">
          <h2>
            <ThunderboltOutlined style={{ color: token.colorWarning }} />
            {intl.formatMessage({ id: 'billing.tokenBoard.title', defaultMessage: 'Token 使用看板' })}
          </h2>
          <p>
            {intl.formatMessage({
              id: 'billing.tokenBoard.description',
              defaultMessage: '查看选定时间段内的 Token 消耗趋势与最近使用记录',
            })}
          </p>
        </div>
        <div className="controls">
          <Select
            value={quickPreset || undefined}
            onChange={(value) => value && applyQuickPreset(value)}
            style={{ width: 120 }}
            options={quickDateOptions}
            allowClear={!!quickPreset}
            onClear={() => setQuickPreset(null)}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(value) => {
              setDateRange(value || [dayjs().subtract(30, 'day'), dayjs()]);
              setQuickPreset(null);
            }}
            allowClear={false}
            style={{ width: 260 }}
          />
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadRecords}>
            {intl.formatMessage({ id: 'billing.button.refresh', defaultMessage: '刷新' })}
          </Button>
        </div>
      </BoardHeader>

      <Spin spinning={loading}>
        <SummaryGrid>
          <SummaryItem $token={token}>
            <div className="label">
              {intl.formatMessage({ id: 'billing.tokenBoard.consumed', defaultMessage: '消耗' })}
            </div>
            <Statistic
              value={summary.consumed}
              precision={4}
              suffix="Token"
              valueStyle={{ color: token.colorError, fontSize: 22, fontWeight: 700 }}
            />
          </SummaryItem>
          <SummaryItem $token={token}>
            <div className="label">
              {intl.formatMessage({ id: 'billing.tokenBoard.gained', defaultMessage: '获得' })}
            </div>
            <Statistic
              value={summary.gained}
              precision={4}
              suffix="Token"
              valueStyle={{ color: token.colorSuccess, fontSize: 22, fontWeight: 700 }}
            />
          </SummaryItem>
          <SummaryItem $token={token}>
            <div className="label">
              {intl.formatMessage({ id: 'billing.tokenBoard.netChange', defaultMessage: '净变动' })}
            </div>
            <Statistic
              value={summary.gained - summary.consumed}
              precision={4}
              suffix="Token"
              valueStyle={{
                color: summary.gained - summary.consumed >= 0 ? token.colorSuccess : token.colorError,
                fontSize: 22,
                fontWeight: 700,
              }}
            />
          </SummaryItem>
          <SummaryItem $token={token}>
            <div className="label">
              {intl.formatMessage({ id: 'billing.tokenBoard.count', defaultMessage: '记录数' })}
            </div>
            <Statistic
              value={summary.count}
              valueStyle={{ fontSize: 22, fontWeight: 700 }}
            />
          </SummaryItem>
        </SummaryGrid>

        <ChartWrap $token={token}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 0', color: token.colorTextSecondary, fontSize: 13 }}>
            <LineChartOutlined />
            {intl.formatMessage({ id: 'billing.tokenBoard.dailyTrend', defaultMessage: '每日 Token 使用趋势' })}
          </div>
          {records.length > 0 ? (
            <ReactECharts option={chartOption} style={{ height: 280 }} notMerge />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({ id: 'billing.tokenBoard.empty', defaultMessage: '该时间段暂无 Token 使用记录' })}
              style={{ padding: '48px 0' }}
            />
          )}
        </ChartWrap>

        <TimelineSection $token={token}>
          <h3>
            {intl.formatMessage({ id: 'billing.tokenBoard.recentTimeline', defaultMessage: '最近使用记录' })}
          </h3>
          {timelineItems.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({ id: 'billing.tokenBoard.empty', defaultMessage: '该时间段暂无 Token 使用记录' })}
            />
          )}
        </TimelineSection>
      </Spin>
    </BoardCard>
  );
};

export default TokenUsageTimelineBoard;
