import React from 'react';
import { Avatar, Empty, Button, Tag } from 'antd';
import {
  UserOutlined,
  CrownOutlined,
  StarOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import dayjs from 'dayjs';
import type { CommunityUserRole } from 'api/community';
import {
  COMMUNITY_ROLE_PRIMARY,
  ROLE_ICONS,
  ROLE_COLORS,
  parseRolePermissions,
} from './communityRoleConstants';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  animation: ${fadeUp} 0.4s ease-out;
`;

const Hero = styled.div`
  position: relative;
  padding: 0 0 52px;
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? 'linear-gradient(145deg, rgba(59,130,246,0.45) 0%, rgba(30,58,138,0.65) 42%, rgba(15,23,42,0.95) 100%)'
      : 'linear-gradient(145deg, #3b82f6 0%, #2563eb 48%, #1d4ed8 100%)'};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        circle at 18% 15%,
        rgba(255, 255, 255, 0.14) 0%,
        transparent 42%
      ),
      radial-gradient(circle at 85% 8%, rgba(255, 255, 255, 0.1) 0%, transparent 38%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    right: -48px;
    top: -48px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    pointer-events: none;
  }

  .hero-toolbar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 52px 20px 24px;
  }

  .hero-title-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.22);
    flex-shrink: 0;
  }

  .hero-title-text {
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1.3;
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding: 0 28px;
  }

  .hero-text {
    flex: 1;
    min-width: 0;

    .eyebrow {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 6px;
    }

    .display-name {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      line-height: 1.25;
      margin-bottom: 4px;
      letter-spacing: -0.02em;
    }

    .handle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.78);
    }
  }

  .hero-avatar {
    flex-shrink: 0;
    border: 4px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
    background: ${(p) => (p.theme.mode === 'dark' ? '#1e293b' : '#fff')};
  }

  @media (max-width: 768px) {
    padding-bottom: 28px;

    .hero-toolbar {
      padding: 12px 48px 16px 14px;
    }

    .hero-inner {
      padding: 0 14px;
    }

    .hero-text .display-name {
      font-size: 19px;
    }
  }
`;

const Body = styled.div`
  padding: 24px 28px 28px;
  margin-top: 0;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc'};

  @media (max-width: 768px) {
    padding: 16px 14px 16px;
  }
`;

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const StatCard = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  background: ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff')};
  border: 1px solid
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)')};
  box-shadow: ${(p) =>
    p.theme.mode === 'dark' ? 'none' : '0 2px 12px rgba(0,0,0,0.04)'};
  text-align: center;
  position: relative;
  z-index: 1;

  .stat-value {
    font-size: 26px;
    font-weight: 800;
    line-height: 1.1;
    color: ${COMMUNITY_ROLE_PRIMARY};
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.03em;
  }

  .stat-label {
    font-size: 12px;
    margin-top: 4px;
    color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid
    ${(p) =>
      p.$primary
        ? 'transparent'
        : p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(0,0,0,0.08)'};
  background: ${(p) =>
    p.$primary
      ? `linear-gradient(135deg, ${COMMUNITY_ROLE_PRIMARY}, #2563eb)`
      : p.theme.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : '#f8fafc'};
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  text-align: left;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(p) =>
      p.$primary
        ? '0 8px 24px rgba(59,130,246,0.35)'
        : p.theme.mode === 'dark'
          ? '0 4px 16px rgba(0,0,0,0.3)'
          : '0 4px 16px rgba(0,0,0,0.08)'};
  }

  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    background: ${(p) =>
      p.$primary ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.12)'};
    color: ${(p) => (p.$primary ? '#fff' : COMMUNITY_ROLE_PRIMARY)};
  }

  .action-text {
    flex: 1;
    min-width: 0;

    .action-title {
      font-size: 14px;
      font-weight: 600;
      color: ${(p) =>
        p.$primary ? '#fff' : p.theme.mode === 'dark' ? '#fff' : '#111827'};
      margin-bottom: 2px;
    }

    .action-desc {
      font-size: 12px;
      color: ${(p) =>
        p.$primary
          ? 'rgba(255,255,255,0.8)'
          : p.theme.mode === 'dark'
            ? 'rgba(255,255,255,0.45)'
            : 'rgba(0,0,0,0.45)'};
    }
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;

  .section-left {
    .eyebrow {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${COMMUNITY_ROLE_PRIMARY};
      margin-bottom: 4px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#111827')};
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .section-badge {
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 20px;
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)'};
    color: ${COMMUNITY_ROLE_PRIMARY};
    font-weight: 600;
  }
`;

const RoleList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const RoleCard = styled.div<{ $color: string; $expired?: boolean }>`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid
    ${(p) =>
      p.$expired
        ? p.theme.mode === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.06)'
        : `${p.$color}35`};
  background: ${(p) =>
    p.theme.mode === 'dark'
      ? `linear-gradient(160deg, ${p.$color}14 0%, rgba(255,255,255,0.03) 42%, rgba(15,23,42,0.6) 100%)`
      : `linear-gradient(160deg, ${p.$color}0c 0%, #ffffff 38%, #f8fafc 100%)`};
  box-shadow: ${(p) =>
    p.theme.mode === 'dark'
      ? '0 4px 24px rgba(0,0,0,0.2)'
      : '0 4px 20px rgba(0,0,0,0.05)'};
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  opacity: ${(p) => (p.$expired ? 0.78 : 1)};

  &:hover {
    transform: translateY(-3px);
    border-color: ${(p) => p.$color}55;
    box-shadow: ${(p) =>
      p.theme.mode === 'dark'
        ? `0 12px 32px ${p.$color}25`
        : `0 12px 28px ${p.$color}18`};
  }

  .card-accent {
    height: 3px;
    background: linear-gradient(
      90deg,
      ${(p) => p.$color},
      ${(p) => p.$color}66 55%,
      transparent 100%
    );
  }

  .card-inner {
    padding: 18px 18px 16px;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .icon-ring {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: ${(p) => p.$color};
    background: ${(p) =>
      p.theme.mode === 'dark' ? `${p.$color}22` : `${p.$color}14`};
    border: 1px solid ${(p) => p.$color}35;
    box-shadow: 0 4px 16px ${(p) => p.$color}22;
  }

  .header-text {
    flex: 1;
    min-width: 0;
    padding-top: 2px;

    .name-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 6px;
    }

    .role-name {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.3;
      color: ${(p) => (p.theme.mode === 'dark' ? '#fff' : '#0f172a')};
      letter-spacing: -0.02em;
    }

    .role-code {
      display: inline-block;
      font-size: 11px;
      font-family: ui-monospace, 'Cascadia Code', monospace;
      padding: 3px 8px;
      border-radius: 6px;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'};
      background: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
      border: 1px solid
        ${(p) =>
          p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
    }
  }

  .status-pill {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;

    &.active {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }

    &.permanent {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.25);
    }

    &.expired {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.22);
    }

    &.limited {
      color: ${COMMUNITY_ROLE_PRIMARY};
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.22);
    }
  }

  .card-divider {
    height: 1px;
    margin: 14px 0 12px;
    background: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .validity {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: ${(p) =>
      p.theme.mode === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'};

    .anticon {
      font-size: 13px;
      opacity: 0.85;
    }

    strong {
      font-weight: 600;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.72)'};
      font-variant-numeric: tabular-nums;
    }
  }

  .permissions {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid
      ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')};

    .perm-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: ${(p) =>
        p.theme.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .perm-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .perm-chip {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 8px;
      color: ${(p) => p.$color};
      background: ${(p) =>
        p.theme.mode === 'dark' ? `${p.$color}18` : `${p.$color}10`};
      border: 1px solid ${(p) => p.$color}30;
      line-height: 1.4;
    }
  }

  @media (max-width: 768px) {
    .card-inner {
      padding: 14px;
    }

    .card-header {
      flex-wrap: wrap;
    }

    .status-pill {
      margin-left: 70px;
    }

    .card-footer {
      flex-direction: column;
      align-items: stretch;

      .ant-btn {
        width: 100%;
      }
    }
  }
`;

const EmptyWrap = styled.div`
  padding: 32px 16px;
  border-radius: 16px;
  background: ${(p) =>
    p.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'};
  border: 1px dashed
    ${(p) => (p.theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')};
`;

export interface UserRoleModalContentProps {
  userInfo: {
    avatar?: string;
    username?: string;
    nickname?: string;
  };
  roles: CommunityUserRole[];
  onApply: () => void;
  onApplications: () => void;
  onManage: () => void;
}

export const UserRoleModalTitle: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(59,130,246,0.12)',
        color: COMMUNITY_ROLE_PRIMARY,
        fontSize: 16,
      }}
    >
      <CrownOutlined />
    </div>
    <span style={{ fontSize: 16, fontWeight: 600 }}>我的社区角色</span>
  </div>
);

const UserRoleModalContent: React.FC<UserRoleModalContentProps> = ({
  userInfo,
  roles,
  onApply,
  onApplications,
  onManage,
}) => {
  const activeCount = roles.filter(
    (r) => !r.expiredTime || dayjs(r.expiredTime).isAfter(dayjs()),
  ).length;
  const officialCount = roles.filter((r) => r.isOfficial).length;

  return (
    <Wrap>
      <Hero>
        <div className="hero-toolbar">
          <div className="hero-title-icon">
            <CrownOutlined />
          </div>
          <span className="hero-title-text">我的社区角色</span>
        </div>
        <div className="hero-inner">
          <div className="hero-text">
            <div className="eyebrow">COMMUNITY IDENTITY</div>
            <div className="display-name">{userInfo.nickname || userInfo.username}</div>
            <div className="handle">@{userInfo.username}</div>
          </div>
          <Avatar
            src={userInfo.avatar}
            size={72}
            icon={<UserOutlined />}
            className="hero-avatar"
          >
            {!userInfo.avatar && userInfo.username?.[0]?.toUpperCase()}
          </Avatar>
        </div>
      </Hero>

      <Body>
        <StatRow>
          <StatCard>
            <div className="stat-value">{roles.length}</div>
            <div className="stat-label">全部角色</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">有效角色</div>
          </StatCard>
          <StatCard>
            <div className="stat-value">{officialCount}</div>
            <div className="stat-label">官方认证</div>
          </StatCard>
        </StatRow>

        <ActionGrid>
          <ActionCard type="button" $primary onClick={onApply}>
            <div className="action-icon">
              <PlusOutlined />
            </div>
            <div className="action-text">
              <div className="action-title">申请角色</div>
              <div className="action-desc">加入社区管理团队</div>
            </div>
          </ActionCard>
          <ActionCard type="button" onClick={onApplications}>
            <div className="action-icon">
              <FileTextOutlined />
            </div>
            <div className="action-text">
              <div className="action-title">我的申请记录</div>
              <div className="action-desc">查看审核进度与结果</div>
            </div>
          </ActionCard>
        </ActionGrid>

        <SectionHead>
          <div className="section-left">
            <div className="eyebrow">MY ROLES</div>
            <div className="section-title">
              <TeamOutlined />
              我的社区角色
            </div>
          </div>
          <span className="section-badge">{roles.length} 个角色</span>
        </SectionHead>

        {roles.length === 0 ? (
          <EmptyWrap>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>暂无社区角色</div>
                  <div style={{ fontSize: 13, opacity: 0.65 }}>
                    申请通过后，您的角色将展示在这里
                  </div>
                </div>
              }
            />
          </EmptyWrap>
        ) : (
          <RoleList>
            {roles.map((role) => {
              const icon = ROLE_ICONS[role.roleCode] || <StarOutlined />;
              const color = ROLE_COLORS[role.roleCode] || COMMUNITY_ROLE_PRIMARY;
              const isExpired = role.expiredTime
                ? dayjs(role.expiredTime).isBefore(dayjs())
                : false;
              const isPermanent = !role.expiredTime;
              const permissions = parseRolePermissions(role.permissions);
              const showManage =
                role.roleCode === 'community_manager' && !isExpired;

              const statusPillClass = isExpired
                ? 'expired'
                : isPermanent
                  ? 'permanent'
                  : 'limited';

              return (
                <RoleCard key={role.id} $color={color} $expired={isExpired}>
                  <div className="card-accent" />
                  <div className="card-inner">
                    <div className="card-header">
                      <div className="icon-ring">{icon}</div>
                      <div className="header-text">
                        <div className="name-row">
                          <span className="role-name">{role.roleName}</span>
                          {role.isOfficial && (
                            <Tag
                              color="gold"
                              icon={<SafetyCertificateOutlined />}
                              style={{ margin: 0, borderRadius: 6, fontSize: 11 }}
                            >
                              官方认证
                            </Tag>
                          )}
                        </div>
                        <span className="role-code">{role.roleCode}</span>
                      </div>
                      <span className={`status-pill ${statusPillClass}`}>
                        {isExpired ? (
                          <>
                            <CloseCircleOutlined /> 已过期
                          </>
                        ) : isPermanent ? (
                          <>
                            <CheckCircleOutlined /> 永久有效
                          </>
                        ) : (
                          <>
                            <CheckCircleOutlined /> 生效中
                          </>
                        )}
                      </span>
                    </div>

                    <div className="card-divider" />

                    <div className="card-footer">
                      <div className="validity">
                        <ClockCircleOutlined />
                        {isPermanent ? (
                          <span>该角色<strong>永久有效</strong></span>
                        ) : (
                          <span>
                            {isExpired ? '已于' : '有效期至'}
                            <strong>
                              {dayjs(role.expiredTime).format('YYYY-MM-DD HH:mm')}
                            </strong>
                          </span>
                        )}
                      </div>
                      {showManage && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<SettingOutlined />}
                          onClick={onManage}
                          style={{
                            borderRadius: 10,
                            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                          }}
                        >
                          帖子管理
                        </Button>
                      )}
                    </div>

                    {permissions.length > 0 && (
                      <div className="permissions">
                        <div className="perm-label">
                          <SafetyCertificateOutlined />
                          角色权限 · {permissions.length}
                        </div>
                        <div className="perm-tags">
                          {permissions.map((perm, index) => (
                            <span key={index} className="perm-chip">{perm}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </RoleCard>
              );
            })}
          </RoleList>
        )}
      </Body>
    </Wrap>
  );
};

export default UserRoleModalContent;
