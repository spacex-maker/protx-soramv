import React from 'react';
import {
  CrownOutlined,
  StarOutlined,
  SafetyOutlined,
  EyeOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

export const COMMUNITY_ROLE_PRIMARY = '#3b82f6';

export const ROLE_ICONS: Record<string, React.ReactNode> = {
  super_admin: <CrownOutlined />,
  community_manager: <StarOutlined />,
  content_curator: <SafetyOutlined />,
  moderator: <EyeOutlined />,
  challenge_reviewer: <TrophyOutlined />,
};

export const ROLE_COLORS: Record<string, string> = {
  super_admin: '#ef4444',
  community_manager: '#f59e0b',
  content_curator: '#3b82f6',
  moderator: '#22c55e',
  challenge_reviewer: '#8b5cf6',
};

export function parseRolePermissions(permissions: unknown): string[] {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions;
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
