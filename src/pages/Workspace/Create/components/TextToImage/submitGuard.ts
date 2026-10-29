import { createSubmitLock } from '../shared/submitLock';

// 模块级防重复提交，供 Desktop 和 Mobile 共用
const lock = createSubmitLock();

export const checkAndSetSubmitting = (): boolean => lock.checkAndSet();

export const clearSubmitting = () => {
  lock.clear();
};
