import instance from './axios';

export interface UserLevelPrivilege {
  privilegeCode: string;
  privilegeName: string;
  privilegeNameEn?: string;
  privilegeValue?: string;
  valueType?: string;
  description?: string;
}

export interface UserExpActionProgress {
  actionCode: string;
  name: string;
  nameEn?: string;
  category: string;
  expValue: number;
  dailyLimit: number;
  todayCount: number;
  icon?: string;
}

export interface UserLevelOverview {
  userId: number;
  currentLevel: number;
  levelName: string;
  levelNameEn?: string;
  badgeColor?: string;
  totalExp: number;
  nextLevelExp: number;
  expToNextLevel: number;
  progressPercent: number;
  loginStreak: number;
  privileges: UserLevelPrivilege[];
  actionProgress: UserExpActionProgress[];
}

export interface UserLevelConfigItem {
  levelNum: number;
  name: string;
  nameEn?: string;
  minExp: number;
  icon?: string;
  badgeColor?: string;
  description?: string;
  privileges: UserLevelPrivilege[];
}

export interface UserExpLogItem {
  id: number;
  actionCode: string;
  actionName?: string;
  expDelta: number;
  remark?: string;
  createTime: string;
}

export const getUserLevelOverview = async (): Promise<UserLevelOverview> => {
  const res = await instance.get('/productx/user/level/overview');
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed');
  return res.data.data;
};

export const getUserLevelConfigs = async (): Promise<UserLevelConfigItem[]> => {
  const res = await instance.get('/productx/user/level/configs');
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed');
  return res.data.data;
};

export const getUserExpLogs = async (limit = 30): Promise<UserExpLogItem[]> => {
  const res = await instance.get('/productx/user/level/exp-logs', { params: { limit } });
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed');
  return res.data.data;
};
