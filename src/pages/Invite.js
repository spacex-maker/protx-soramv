import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from 'components/headers/simple';
import { inviteApi } from 'api/invite';
import {
  Button,
  message,
  theme,
  Avatar,
  Tag,
  Modal,
  Skeleton,
  Pagination,
  Select,
  Empty,
  Input,
} from 'antd';
import {
  CopyOutlined,
  UserAddOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  QrcodeOutlined,
  WalletOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  ArrowLeftOutlined,
  LinkOutlined,
  TeamOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import dayjs from 'dayjs';

const PageLayout = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${(p) => p.$token.colorBgLayout};
  color: ${(p) => p.$token.colorText};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding-top: ${(p) => (p.$hasHero ? '0' : '80px')};
  overflow-x: hidden;
  position: relative;

  ${(p) =>
    !p.$hasHero &&
    `
    &::before,
    &::after {
      content: '';
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }

    &::before {
      width: 420px;
      height: 420px;
      top: 60px;
      right: -120px;
      background: ${p.$accent || p.$token.colorPrimary}22;
    }

    &::after {
      width: 360px;
      height: 360px;
      bottom: 80px;
      left: -100px;
      background: #6366f122;
    }
  `}
`;

const HeaderArea = styled.div`
  margin-bottom: 20px;

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: ${(p) => p.$token.colorTextSecondary};
    margin-bottom: 14px;
    cursor: pointer;
    padding: 6px 0;
    transition: color 0.2s ease;

    &:hover {
      color: ${(p) => p.$token.colorPrimary};
    }
  }

  h1 {
    margin: 0 0 6px;
    font-size: clamp(24px, 3.5vw, 32px);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: ${(p) => p.$token.colorText};
    line-height: 1.25;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${(p) => p.$token.colorTextSecondary};
    max-width: 640px;
    line-height: 1.65;
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 960px;
  width: 92%;
  margin: ${(p) => (p.$overlap ? '-64px' : '24px')} auto 72px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Panel = styled.section`
  background: ${(p) => p.$token.colorBgContainer};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};
  border-radius: 20px;
  padding: ${(p) => (p.$compact ? '16px 20px' : '22px 24px')};
  box-shadow: ${(p) =>
    p.$floating
      ? '0 24px 56px -28px rgba(0, 0, 0, 0.28)'
      : '0 8px 24px -12px rgba(0, 0, 0, 0.06)'};
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 20px;

  &:not(:last-child) {
    border-right: 1px solid ${(p) => p.$token.colorBorderSecondary};
  }

  @media (max-width: 640px) {
    padding: 4px 0;
    border-right: none !important;
    border-bottom: 1px solid ${(p) => p.$token.colorBorderSecondary};

    &:last-child {
      border-bottom: none;
    }
  }

  .icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 17px;
    background: ${(p) => (p.$highlight ? p.$token.colorPrimaryBg : p.$token.colorFillQuaternary)};
    color: ${(p) => (p.$highlight ? p.$token.colorPrimary : p.$token.colorTextSecondary)};
  }

  .meta {
    min-width: 0;

    .val {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: ${(p) => (p.$highlight ? p.$token.colorPrimary : p.$token.colorText)};
    }

    .lbl {
      margin-top: 2px;
      font-size: 12px;
      color: ${(p) => p.$token.colorTextTertiary};
    }
  }
`;

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${(p) => p.$token.colorBorderSecondary};

  .hint {
    font-size: 13px;
    color: ${(p) => p.$token.colorTextSecondary};
  }

  a {
    color: ${(p) => p.$accent || p.$token.colorPrimary};
    cursor: pointer;
    font-weight: 600;
  }
`;

const SharePanel = styled(Panel)`
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${(p) => p.$accent || p.$token.colorPrimary}, #6366f1);
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
      color: ${(p) => p.$token.colorText};

      .icon-wrap {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${(p) => p.$token.colorPrimaryBg};
        color: ${(p) => p.$token.colorPrimary};
      }
    }
  }
`;

const StepsTimeline = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 4px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .step {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    .num {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      color: ${(p) => p.$accent || p.$token.colorPrimary};
      background: ${(p) => p.$token.colorPrimaryBg};
      border: 2px solid ${(p) => p.$token.colorPrimaryBorder};
    }

    .text {
      font-size: 13px;
      font-weight: 600;
      color: ${(p) => p.$token.colorText};
      line-height: 1.4;
    }
  }

  .line {
    flex: 0 0 32px;
    height: 2px;
    margin: 0 8px;
    background: ${(p) => p.$token.colorBorderSecondary};

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const RewardShowcase = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: stretch;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .bridge {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;

    @media (max-width: 768px) {
      padding: 4px 0;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      color: ${(p) => p.$token.colorPrimary};
      background: ${(p) => p.$token.colorPrimaryBg};
      border: 1px dashed ${(p) => p.$token.colorPrimaryBorder};
      white-space: nowrap;
    }
  }
`;

const Card = styled.div`
  background: ${(p) => p.$token.colorBgContainer};
  border: 1px solid ${(p) => p.$token.colorBorderSecondary};
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.08);

  .card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    color: ${(p) => p.$token.colorText};
    margin-bottom: 20px;

    .icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${(p) => p.$token.colorPrimaryBg};
      color: ${(p) => p.$token.colorPrimary};
      font-size: 15px;
    }
  }
`;

const CodeDisplay = styled.div`
  text-align: center;
  padding: 28px 16px;
  border-radius: 18px;
  background: ${(p) => p.$token.colorFillQuaternary};
  border: 1px dashed ${(p) => p.$token.colorBorder};
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(p) => p.$token.colorPrimary};
    background: ${(p) => p.$token.colorPrimaryBg};
    transform: translateY(-1px);
  }

  .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${(p) => p.$token.colorTextTertiary};
    margin-bottom: 10px;
  }

  .code {
    font-family: 'SF Mono', 'Roboto Mono', ui-monospace, monospace;
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 800;
    letter-spacing: 0.1em;
    color: ${(p) => p.$token.colorText};
    word-break: break-all;
    line-height: 1.3;
  }

  .hint {
    margin-top: 10px;
    font-size: 11px;
    color: ${(p) => p.$token.colorTextTertiary};
  }
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;

  .ant-btn {
    flex: 1;
    min-width: 120px;
    height: 44px;
    font-weight: 600;
    border-radius: 12px;
  }
`;

const ClaimButton = styled(Button)`
  && {
    width: 100%;
    height: 48px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 15px;
    border: none;
    background: linear-gradient(135deg, ${(p) => p.$primary} 0%, #6366f1 100%);
    box-shadow: 0 8px 20px -6px ${(p) => p.$primary}66;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${(p) => p.$primary} 0%, #4f46e5 100%) !important;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.55;
    }
  }
`;

const HistoryCard = styled(Card)`
  padding: 24px 28px 20px;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${(p) => p.$token.colorText};
  }
`;

const UserRow = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 14px 12px;
  margin: 0 -12px;
  border-radius: 12px;
  border-bottom: 1px solid ${(p) => p.$token.colorBorderSecondary};
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${(p) => p.$token.colorFillQuaternary};
  }

  .avatar-col {
    margin-right: 14px;
  }

  .info-col {
    flex: 1;
    min-width: 0;

    .name {
      font-weight: 600;
      font-size: 14px;
      color: ${(p) => p.$token.colorText};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date {
      font-size: 12px;
      color: ${(p) => p.$token.colorTextTertiary};
      margin-top: 2px;
    }
  }

  .reward-col {
    text-align: right;
    flex-shrink: 0;

    .amount {
      font-weight: 700;
      font-size: 15px;
      color: ${(p) => p.$token.colorSuccess};
    }
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid ${(p) => p.$token.colorBorderSecondary};
`;

const QrWrap = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  display: inline-block;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const ModalAmount = styled.div`
  text-align: center;
  padding: 24px 16px;
  border-radius: 16px;
  background: ${(p) => p.$token.colorFillQuaternary};
  margin-bottom: 16px;

  .label {
    font-size: 13px;
    color: ${(p) => p.$token.colorTextSecondary};
    margin-bottom: 8px;
  }

  .value {
    font-size: 36px;
    font-weight: 800;
    background: linear-gradient(135deg, ${(p) => p.$token.colorPrimary}, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const DualRewardCard = styled.div`
  padding: 24px 22px;
  border-radius: 20px;
  background: ${(p) =>
    p.$accent
      ? `linear-gradient(145deg, ${p.$token.colorBgContainer} 0%, ${p.$token.colorPrimaryBg}88 100%)`
      : p.$token.colorBgContainer};
  border: 1px solid ${(p) => (p.$accent ? p.$token.colorPrimaryBorder : p.$token.colorBorderSecondary)};
  box-shadow: ${(p) => (p.$accent ? `0 12px 32px -16px ${p.$accent || p.$token.colorPrimary}55` : '0 4px 16px -8px rgba(0,0,0,0.06)')};
  height: 100%;

  .role {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${(p) => (p.$accent ? p.$token.colorPrimary : p.$token.colorTextSecondary)};
    margin-bottom: 12px;
  }

  .amount {
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: ${(p) => (p.$accent ? p.$token.colorPrimary : p.$token.colorText)};
    line-height: 1.1;
  }

  .unit {
    font-size: 14px;
    font-weight: 600;
    margin-left: 6px;
    color: ${(p) => p.$token.colorTextSecondary};
  }

  .desc {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.55;
    color: ${(p) => p.$token.colorTextTertiary};
  }
`;

const AutoIssueBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border-radius: 14px;
  background: ${(p) => p.$token.colorSuccessBg};
  border: 1px solid ${(p) => p.$token.colorSuccessBorder};
  color: ${(p) => p.$token.colorText};
  font-size: 13px;
  line-height: 1.55;
`;

const resolveLocaleKeys = (locale) => {
  const raw = locale || 'zh_CN';
  const underscore = raw.includes('_') ? raw : raw.replace('-', '_');
  const dash = underscore.replace('_', '-');
  const short = underscore.split('_')[0];
  const shortRegion = underscore.split('_')[1];
  const keys = [underscore, dash, short];
  if (shortRegion) {
    keys.push(`${short}_${shortRegion.toUpperCase()}`, `${short}-${shortRegion.toUpperCase()}`);
  }
  keys.push('zh_CN', 'en_US');
  return [...new Set(keys)];
};

const pickLocalizedValue = (value, locale) => {
  if (value == null || value === '') return '';
  let obj = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return trimmed;
    try {
      obj = JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  if (typeof obj !== 'object' || Array.isArray(obj)) return String(obj);
  const keys = resolveLocaleKeys(locale);
  for (const key of keys) {
    if (obj[key]) return obj[key];
  }
  const first = Object.values(obj).find((v) => typeof v === 'string' && v);
  return first || '';
};

const normalizeUiConfig = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
};

const resolveBannerUrl = (data, uiConfig, locale) =>
  pickLocalizedValue(
    {
      zh_CN: data.bannerUrlZh,
      en_US: data.bannerUrlEn,
    },
    locale,
  ) || pickLocalizedValue(uiConfig.banner_url || uiConfig.bannerUrl, locale);

const TopHeroSection = styled.section`
  position: relative;
  width: 100%;
  min-height: clamp(360px, 52vh, 560px);
  overflow: hidden;
  isolation: isolate;

  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    transform: scale(1.02);
  }

  .overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.42) 0%, rgba(0, 0, 0, 0.08) 38%, rgba(0, 0, 0, 0.62) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.12) 55%, rgba(0, 0, 0, 0.25) 100%);
  }

  .accent-glow {
    position: absolute;
    inset: auto 0 0 0;
    height: 55%;
    background: linear-gradient(
      to top,
      ${(p) => p.$accent || '#6366f1'}55 0%,
      transparent 100%
    );
    pointer-events: none;
  }

  .bottom-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 120px;
    background: linear-gradient(to bottom, transparent, ${(p) => p.$token.colorBgLayout});
    pointer-events: none;
  }

  .inner {
    position: relative;
    z-index: 2;
    max-width: 1080px;
    width: 95%;
    margin: 0 auto;
    min-height: clamp(360px, 52vh, 560px);
    padding: 96px 0 72px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 16px;
  }

  .back-btn {
    position: absolute;
    top: 88px;
    left: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
    backdrop-filter: blur(12px);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(-2px);
    }
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #fff;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.24);
    backdrop-filter: blur(10px);
  }

  .title {
    margin: 0;
    font-size: clamp(30px, 5.5vw, 48px);
    font-weight: 800;
    color: #fff;
    line-height: 1.15;
    letter-spacing: -0.03em;
    max-width: 820px;
    text-shadow: 0 4px 32px rgba(0, 0, 0, 0.45);
  }

  .subtitle {
    margin: 0;
    font-size: clamp(15px, 2.2vw, 18px);
    color: rgba(255, 255, 255, 0.9);
    max-width: 640px;
    line-height: 1.6;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  }

  .reward-highlight {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 4px;
    padding: 10px 18px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    font-size: 15px;
    color: rgba(255, 255, 255, 0.92);

    b {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }

    .sep {
      opacity: 0.5;
      margin: 0 4px;
    }
  }

  @media (max-width: 768px) {
    min-height: clamp(300px, 44vh, 420px);

    .inner {
      min-height: clamp(300px, 44vh, 420px);
      padding: 88px 0 56px;
    }

    .back-btn {
      top: 80px;
    }

    .title {
      font-size: 26px;
    }

    .subtitle {
      font-size: 14px;
    }
  }
`;

const InviteSystem = () => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [inviteHistory, setInviteHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrVisible, setQrVisible] = useState(false);
  const [claimVisible, setClaimVisible] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inviteApi.getDashboard();
      if (!res.success) {
        message.error(res.message || intl.formatMessage({ id: 'invite.claim.failed' }));
        return;
      }
      const data = res.data || {};
      const locale = intl.locale || 'zh_CN';
      const uiConfig = normalizeUiConfig(data.uiConfig);
      const inviteLink = data.inviteLink?.startsWith('http')
        ? data.inviteLink
        : `${window.location.origin}${data.inviteLink || `/signup?inviteCode=${data.inviteCode}`}`;

      setInviteData({
        code: data.inviteCode,
        link: inviteLink,
        inviterReward:
          data.registerRewardInviter ??
          data.ruleConfig?.registerRewardInviter ??
          0,
        inviteeReward:
          data.registerRewardInvitee ??
          data.ruleConfig?.registerRewardInvitee ??
          0,
        autoIssueOnRegister:
          data.autoIssueOnRegister ??
          data.ruleConfig?.autoIssueOnRegister ??
          true,
        activityExpired: Boolean(data.activityExpired),
        activityTitle: pickLocalizedValue(data.activityDisplayName || data.activityTitle, locale),
        bannerUrl: resolveBannerUrl(data, uiConfig, locale),
        shareTitle: pickLocalizedValue(uiConfig.share_title || uiConfig.shareTitle, locale),
        btnText: pickLocalizedValue(uiConfig.btn_text || uiConfig.btnText, locale),
        themeColor: typeof uiConfig.theme_color === 'string'
          ? uiConfig.theme_color
          : (typeof uiConfig.themeColor === 'string' ? uiConfig.themeColor : null),
        stats: {
          totalInvites: data.totalInvites || 0,
          totalReward: Number(data.totalReward || data.totalRewardPoints || 0),
          availableReward: Number(data.availableReward || data.pendingRewardPoints || 0),
        },
      });
    } catch (error) {
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'invite.claim.failed' }));
    } finally {
      setLoading(false);
    }
  }, [intl]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await inviteApi.getHistory({ page, pageSize, status: statusFilter });
      if (!res.success) return;
      const pageData = res.data || {};
      setInviteHistory(
        (pageData.records || []).map((item) => ({
          id: item.id,
          username: item.username || `User_${item.id}`,
          avatar: item.avatar,
          date: item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm') : '-',
          status: item.status,
          reward: item.rewardPoints || 0,
          inviteeReward: item.inviteeRewardPoints || 0,
          rewardIssued: item.rewardIssued,
          inviteeRewardIssued: item.inviteeRewardIssued,
        }))
      );
      setTotal(pageData.total || 0);
    } catch (error) {
      console.error(error);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopy = (text, msgId = 'invite.copy.success', prefix = '') => {
    const payload = prefix ? `${prefix}\n${text}` : text;
    navigator.clipboard.writeText(payload);
    message.success(intl.formatMessage({ id: msgId }));
  };

  const handleClaim = async () => {
    if (!inviteData || inviteData.stats.availableReward <= 0) {
      message.warning(intl.formatMessage({ id: 'invite.claim.noReward' }));
      return;
    }
    setClaimLoading(true);
    try {
      const res = await inviteApi.claimRewards();
      if (res.success) {
        message.success(
          intl.formatMessage(
            { id: 'invite.claim.success' },
            { amount: res.data || inviteData.stats.availableReward }
          )
        );
        await fetchInitialData();
        await fetchHistory();
        setClaimVisible(false);
      } else {
        message.error(res.message || intl.formatMessage({ id: 'invite.claim.failed' }));
      }
    } catch (error) {
      message.error(error.response?.data?.message || intl.formatMessage({ id: 'invite.claim.failed' }));
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading || !inviteData) {
    return (
      <PageLayout $token={token} $accent={token.colorPrimary}>
        <SimpleHeader />
        <Skeleton.Image active style={{ width: '100%', height: 'min(52vh, 520px)', borderRadius: 0 }} />
        <ContentContainer $overlap>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} active paragraph={{ rows: 1 }} />
            ))}
          </div>
          <Card $token={token} style={{ padding: 32 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </ContentContainer>
      </PageLayout>
    );
  }

  const accentColor = inviteData.themeColor || token.colorPrimary;
  const hasHero = Boolean(inviteData.bannerUrl);

  const steps = [
    { titleId: 'invite.step1.title' },
    { titleId: 'invite.step2.title' },
    { titleId: 'invite.step3.title' },
  ];

  return (
    <PageLayout $token={token} $accent={accentColor} $hasHero={hasHero}>
      <SimpleHeader />

      {hasHero && (
        <TopHeroSection $token={token} $accent={accentColor}>
          <img className="bg" src={inviteData.bannerUrl} alt={inviteData.activityTitle || 'invite activity'} loading="eager" />
          <div className="overlay" aria-hidden />
          <div className="accent-glow" aria-hidden />
          <div className="bottom-fade" aria-hidden />
          <div className="inner">
            <div className="back-btn" onClick={() => navigate(-1)} role="button" tabIndex={0}>
              <ArrowLeftOutlined />
              <FormattedMessage id="common.back" defaultMessage="返回" />
            </div>
            <h1 className="title">
              {inviteData.activityTitle || intl.formatMessage({ id: 'invite.title.line1', defaultMessage: '邀请好友' })}
            </h1>
            <div className="reward-highlight">
              <span><FormattedMessage id="invite.reward.youShort" defaultMessage="您" /> <b>+{inviteData.inviterReward}</b></span>
              <span className="sep">·</span>
              <span><FormattedMessage id="invite.reward.friendShort" defaultMessage="好友" /> <b>+{inviteData.inviteeReward}</b></span>
              <span>Token</span>
            </div>
            {inviteData.autoIssueOnRegister && (
              <p className="subtitle">
                <FormattedMessage id="invite.reward.autoIssueShort" defaultMessage="注册成功后 Token 自动入账" />
              </p>
            )}
          </div>
        </TopHeroSection>
      )}

      <ContentContainer
        $overlap={hasHero}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {!hasHero && (
        <HeaderArea $token={token}>
          <div className="back-btn" onClick={() => navigate(-1)} role="button" tabIndex={0}>
            <ArrowLeftOutlined />
            <FormattedMessage id="common.back" defaultMessage="返回" />
          </div>
          <h1>
            {inviteData.activityTitle ? (
              inviteData.activityTitle
            ) : (
              <>
                <FormattedMessage id="invite.title.line1" /> · <FormattedMessage id="invite.title.line2" />
              </>
            )}
          </h1>
          <p>
            <FormattedMessage
              id="invite.reward.heroLine"
              defaultMessage="邀请 +{inviter} · 好友 +{invitee} Token"
              values={{ inviter: inviteData.inviterReward, invitee: inviteData.inviteeReward }}
            />
          </p>
        </HeaderArea>
        )}

        {inviteData.activityExpired && (
          <AutoIssueBanner $token={token} style={{ borderColor: token.colorWarningBorder, background: token.colorWarningBg }}>
            <ClockCircleFilled style={{ color: token.colorWarning, marginTop: 2, flexShrink: 0 }} />
            <FormattedMessage
              id="invite.activity.expired"
              defaultMessage="当前邀请活动已结束，页面展示为历史配置；延长活动时间后新邀请才会发放奖励。"
            />
          </AutoIssueBanner>
        )}

        {!hasHero && (
          <>
            <RewardShowcase $token={token}>
              <DualRewardCard $token={token} $accent={accentColor} style={{ borderColor: `${accentColor}44` }}>
                <div className="role">
                  <UserAddOutlined />
                  <FormattedMessage id="invite.reward.youGet" defaultMessage="您邀请成功可获得" />
                </div>
                <div>
                  <span className="amount">+{inviteData.inviterReward}</span>
                  <span className="unit"> Token</span>
                </div>
              </DualRewardCard>
              <div className="bridge">
                <span className="pill">
                  <SwapOutlined />
                  <FormattedMessage id="invite.reward.bothWaysShort" defaultMessage="双向到账" />
                </span>
              </div>
              <DualRewardCard $token={token}>
                <div className="role">
                  <GiftOutlined />
                  <FormattedMessage id="invite.reward.friendGets" defaultMessage="好友注册可获得" />
                </div>
                <div>
                  <span className="amount">+{inviteData.inviteeReward}</span>
                  <span className="unit"> Token</span>
                </div>
              </DualRewardCard>
            </RewardShowcase>
            {inviteData.autoIssueOnRegister && (
              <AutoIssueBanner $token={token}>
                <CheckCircleFilled style={{ color: token.colorSuccess, marginTop: 2, flexShrink: 0 }} />
                <FormattedMessage id="invite.reward.autoIssueShort" defaultMessage="注册成功后 Token 自动入账" />
              </AutoIssueBanner>
            )}
          </>
        )}

        <Panel $token={token} $floating={hasHero}>
          <StatsRow>
            <StatItem $token={token}>
              <div className="icon"><UserAddOutlined /></div>
              <div className="meta">
                <div className="val">{inviteData.stats.totalInvites}</div>
                <div className="lbl"><FormattedMessage id="invite.stats.totalInvites" /></div>
              </div>
            </StatItem>
            <StatItem $token={token} $highlight>
              <div className="icon"><ThunderboltOutlined /></div>
              <div className="meta">
                <div className="val">{inviteData.stats.availableReward}</div>
                <div className="lbl"><FormattedMessage id="invite.stats.pendingTokens" defaultMessage="待领取 Token" /></div>
              </div>
            </StatItem>
            <StatItem $token={token}>
              <div className="icon"><WalletOutlined /></div>
              <div className="meta">
                <div className="val">{inviteData.stats.totalReward}</div>
                <div className="lbl"><FormattedMessage id="invite.stats.totalReward" /></div>
              </div>
            </StatItem>
          </StatsRow>
          <PanelFooter $token={token} $accent={accentColor}>
            {inviteData.autoIssueOnRegister ? (
              <a onClick={() => navigate('/billing')} style={{ marginLeft: 'auto' }}>
                <FormattedMessage id="invite.goBilling" defaultMessage="前往财务中心" />
                {!hasHero && (
                  <>
                    {' · '}
                    <FormattedMessage id="invite.billing.linkHintShort" defaultMessage="查看邀请入账" />
                  </>
                )}
              </a>
            ) : inviteData.stats.availableReward > 0 ? (
              <ClaimButton
                type="primary"
                $primary={accentColor}
                icon={<GiftOutlined />}
                onClick={() => setClaimVisible(true)}
                style={{ width: 'auto', marginLeft: 'auto', minWidth: 148 }}
              >
                <FormattedMessage id="invite.claimNow" />
              </ClaimButton>
            ) : (
              <span className="hint" style={{ marginLeft: 'auto' }}>
                <FormattedMessage id="invite.claim.noReward" defaultMessage="暂无可领取奖励" />
              </span>
            )}
          </PanelFooter>
        </Panel>

        <SharePanel $token={token} $accent={accentColor}>
          <div className="panel-head">
            <h2>
              <span className="icon-wrap"><LinkOutlined /></span>
              <FormattedMessage id="invite.share.title" defaultMessage="分享邀请" />
            </h2>
          </div>

          <CodeDisplay
            $token={token}
            onClick={() => handleCopy(inviteData.code)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCopy(inviteData.code)}
          >
            <div className="code">{inviteData.code || '—'}</div>
            <div className="hint">
              <FormattedMessage id="invite.copyCodeHint" defaultMessage="点击邀请码即可复制" />
            </div>
          </CodeDisplay>

          <ActionRow>
            <Button
              type="primary"
              size="large"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(inviteData.code)}
              style={{ background: accentColor, boxShadow: `0 8px 20px -6px ${accentColor}66` }}
            >
              <FormattedMessage id="invite.copyCode" />
            </Button>
            <Button size="large" icon={<QrcodeOutlined />} onClick={() => setQrVisible(true)}>
              <FormattedMessage id="invite.viewQrcode" />
            </Button>
          </ActionRow>

          <Input
            size="large"
            readOnly
            value={inviteData.link}
            prefix={<LinkOutlined style={{ color: token.colorTextTertiary }} />}
            suffix={
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(inviteData.link, 'invite.copy.success', inviteData.shareTitle || '')}
              >
                {inviteData.btnText || intl.formatMessage({ id: 'invite.copyLink', defaultMessage: '复制链接' })}
              </Button>
            }
            style={{ borderRadius: 12 }}
          />
        </SharePanel>

        <Panel $token={token} $compact>
          <StepsTimeline $token={token} $accent={accentColor}>
            {steps.map((step, i) => (
              <React.Fragment key={step.titleId}>
                {i > 0 && <div className="line" aria-hidden />}
                <div className="step">
                  <div className="num">{i + 1}</div>
                  <div className="text">
                    <FormattedMessage id={step.titleId} />
                  </div>
                </div>
              </React.Fragment>
            ))}
          </StepsTimeline>
        </Panel>

        <HistoryCard $token={token}>
          <ListHeader $token={token}>
            <h3>
              <TeamOutlined style={{ color: token.colorPrimary }} />
              <FormattedMessage id="invite.history.title" />
            </h3>
            <Select
              value={statusFilter}
              size="small"
              style={{ width: 110, borderRadius: 8 }}
              options={[
                { value: 'all', label: intl.formatMessage({ id: 'invite.filter.all' }) },
                { value: 'active', label: intl.formatMessage({ id: 'invite.filter.active' }) },
                { value: 'pending', label: intl.formatMessage({ id: 'invite.filter.pending' }) },
              ]}
              onChange={(v) => {
                setPage(1);
                setStatusFilter(v);
              }}
            />
          </ListHeader>

          {inviteHistory.length > 0 ? (
            inviteHistory.map((item, index) => (
              <UserRow
                key={item.id}
                $token={token}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="avatar-col">
                  <Avatar
                    src={item.avatar}
                    style={{
                      backgroundColor: item.status === 'active' ? token.colorPrimaryBg : token.colorFillSecondary,
                      color: item.status === 'active' ? token.colorPrimary : token.colorTextSecondary,
                    }}
                  >
                    {item.username.charAt(0).toUpperCase()}
                  </Avatar>
                </div>
                <div className="info-col">
                  <div className="name">{item.username}</div>
                  <div className="date">{item.date}</div>
                </div>
                <div className="reward-col">
                  <div className="amount">+{item.reward} Token</div>
                  <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {item.status === 'active' || item.rewardIssued ? (
                      <Tag color="success" bordered={false} style={{ margin: 0, fontSize: 11 }}>
                        <CheckCircleFilled style={{ marginRight: 4 }} />
                        <FormattedMessage id="invite.status.inviterCredited" defaultMessage="您的奖励已到账" />
                      </Tag>
                    ) : (
                      <Tag color="warning" bordered={false} style={{ margin: 0, fontSize: 11 }}>
                        <ClockCircleFilled style={{ marginRight: 4 }} />
                        <FormattedMessage id="invite.status.pending" />
                      </Tag>
                    )}
                    {item.inviteeReward > 0 && (
                      <Tag color={item.inviteeRewardIssued ? 'processing' : 'default'} bordered={false} style={{ margin: 0, fontSize: 11 }}>
                        <FormattedMessage
                          id="invite.status.inviteeReward"
                          defaultMessage="好友 +{amount} Token"
                          values={{ amount: item.inviteeReward }}
                        />
                        {item.inviteeRewardIssued ? ' ✓' : ''}
                      </Tag>
                    )}
                  </div>
                </div>
              </UserRow>
            ))
          ) : (
            <Empty description={intl.formatMessage({ id: 'invite.history.empty' })} style={{ margin: '32px 0' }} />
          )}

          {total > pageSize && (
            <PaginationWrapper $token={token}>
              <Pagination
                simple
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={setPage}
                size="small"
              />
            </PaginationWrapper>
          )}
        </HistoryCard>
      </ContentContainer>

      <Modal
        title={intl.formatMessage({ id: 'invite.claim.title' })}
        open={claimVisible}
        onCancel={() => setClaimVisible(false)}
        footer={[
          <Button key="back" onClick={() => setClaimVisible(false)}>
            <FormattedMessage id="invite.withdraw.cancel" />
          </Button>,
          <Button key="submit" type="primary" loading={claimLoading} onClick={handleClaim}>
            <FormattedMessage id="invite.claim.confirm" />
          </Button>,
        ]}
        centered
        width={420}
        destroyOnClose
      >
        <ModalAmount $token={token}>
          <div className="label">
            <FormattedMessage id="invite.stats.availableReward" />
          </div>
          <div className="value">{inviteData.stats.availableReward} Token</div>
        </ModalAmount>
        <p style={{ fontSize: 13, color: token.colorTextTertiary, margin: 0, lineHeight: 1.6 }}>
          <FormattedMessage id="invite.claim.note" />
        </p>
      </Modal>

      <Modal
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={null}
        centered
        width={340}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <h3 style={{ marginBottom: 20, fontWeight: 700 }}>
            <FormattedMessage id="invite.qrcode.title" />
          </h3>
          <QrWrap>
            <QRCodeSVG value={inviteData.link} size={200} level="M" includeMargin />
          </QrWrap>
          <p style={{ fontSize: 12, color: token.colorTextTertiary, margin: '16px 0 8px', wordBreak: 'break-all' }}>
            {inviteData.link}
          </p>
          <Button type="primary" icon={<CopyOutlined />} onClick={() => handleCopy(inviteData.link, 'invite.copy.success', inviteData.shareTitle || '')} block style={{ borderRadius: 10, background: accentColor }}>
            <FormattedMessage id="invite.copyLink" />
          </Button>
        </div>
      </Modal>
    </PageLayout>
  );
};

const InvitePage = () => <InviteSystem />;

export default InvitePage;
