import React from 'react';
import dayjs from 'dayjs';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ReloadOutlined,
  WalletOutlined,
} from '@ant-design/icons';

export const getQuickDateRange = (preset) => {
  const end = dayjs();
  const p = typeof preset === 'string' && /^\d+$/.test(preset) ? parseInt(preset, 10) : preset;

  if (p === 'today') {
    return [dayjs().startOf('day'), dayjs().endOf('day')];
  }
  if (p === 'week') {
    return [dayjs().startOf('week'), end];
  }
  if (p === 'month') {
    return [dayjs().startOf('month'), end];
  }
  if (p === 'year') {
    return [dayjs().startOf('year'), end];
  }
  if (typeof p === 'number') {
    return [dayjs().subtract(p, 'day'), end];
  }
  return [dayjs().subtract(30, 'day'), end];
};

export const getChangeTypeMap = (intl) => ({
  DEPOSIT: { label: intl.formatMessage({ id: 'billing.type.deposit', defaultMessage: '充值' }), color: 'green', icon: <ArrowUpOutlined /> },
  WITHDRAWAL: { label: intl.formatMessage({ id: 'billing.type.withdrawal', defaultMessage: '提现' }), color: 'red', icon: <ArrowDownOutlined /> },
  TRANSFER: { label: intl.formatMessage({ id: 'billing.type.transfer', defaultMessage: '转账' }), color: 'blue', icon: <CreditCardOutlined /> },
  REFUND: { label: intl.formatMessage({ id: 'billing.type.refund', defaultMessage: '退款' }), color: 'cyan', icon: <ReloadOutlined /> },
  PAYMENT: { label: intl.formatMessage({ id: 'billing.type.payment', defaultMessage: '支付' }), color: 'purple', icon: <DollarOutlined /> },
  FROZEN: { label: intl.formatMessage({ id: 'billing.type.frozen', defaultMessage: '资金冻结' }), color: 'orange', icon: <BankOutlined /> },
  FEE: { label: intl.formatMessage({ id: 'billing.type.fee', defaultMessage: '手续费' }), color: 'default', icon: <DollarOutlined /> },
  REWARD: { label: intl.formatMessage({ id: 'billing.type.reward', defaultMessage: '奖励' }), color: 'gold', icon: <WalletOutlined /> },
  ADJUSTMENT: { label: intl.formatMessage({ id: 'billing.type.adjustment', defaultMessage: '调整' }), color: 'default', icon: <CreditCardOutlined /> },
  AI_MODEL_FEE: { label: intl.formatMessage({ id: 'billing.type.aiModelFee', defaultMessage: '模型调用' }), color: 'blue', icon: <CreditCardOutlined /> },
  PROMPT_MARKET_PURCHASE: { label: intl.formatMessage({ id: 'billing.type.promptMarketPurchase', defaultMessage: '提示词购买' }), color: 'volcano', icon: <CreditCardOutlined /> },
  PROMPT_MARKET_INCOME: { label: intl.formatMessage({ id: 'billing.type.promptMarketIncome', defaultMessage: '提示词收入' }), color: 'green', icon: <WalletOutlined /> },
});

export const buildDailyTokenTrend = (records, dateRange) => {
  const start = dateRange[0].startOf('day');
  const end = dateRange[1].startOf('day');
  const map = {};

  let current = start;
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const key = current.format('YYYY-MM-DD');
    map[key] = { date: key, consumed: 0, gained: 0 };
    current = current.add(1, 'day');
  }

  records.forEach((record) => {
    const day = dayjs(record.createTime).format('YYYY-MM-DD');
    if (!map[day]) return;
    const amount = parseFloat(record.amount);
    if (Number.isNaN(amount)) return;
    if (amount < 0) {
      map[day].consumed += Math.abs(amount);
    } else {
      map[day].gained += amount;
    }
  });

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
};

export const summarizeTokenRecords = (records) => {
  return records.reduce((acc, record) => {
    const amount = parseFloat(record.amount);
    if (Number.isNaN(amount)) return acc;
    if (amount < 0) {
      acc.consumed += Math.abs(amount);
    } else {
      acc.gained += amount;
    }
    acc.count += 1;
    return acc;
  }, { consumed: 0, gained: 0, count: 0 });
};
