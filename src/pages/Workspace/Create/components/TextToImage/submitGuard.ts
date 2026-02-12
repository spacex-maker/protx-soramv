// 模块级防重复提交状态，供 Desktop 和 Mobile 共用（解决 useBreakpoint 切换导致不同实例各自 useRef 的问题）
let isSubmitting = false;

export const checkAndSetSubmitting = (): boolean => {
  if (isSubmitting) return true;
  isSubmitting = true;
  return false;
};

export const clearSubmitting = () => {
  isSubmitting = false;
};
