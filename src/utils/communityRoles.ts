import { CommunityUserRole } from 'api/community';

export const CHALLENGE_MANAGE_ROLE_CODES = ['super_admin', 'community_manager'];

export function canManageDailyChallenge(roles: CommunityUserRole[]): boolean {
  return roles.some(
    (role) => !role.expired && CHALLENGE_MANAGE_ROLE_CODES.includes(role.roleCode)
  );
}
