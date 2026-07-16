import type { WaitingTask } from '../ImageToVideo/WaitingTaskQueue';

const STORAGE_PREFIX = 'create.waitingTaskQueue.';

function storageKey(scope: string): string {
  return `${STORAGE_PREFIX}${scope}`;
}

/** 持久化任务队列，页面刷新后可恢复轮询并重新拉取结果视频 */
export function loadPersistedWaitingTasks(scope: string): WaitingTask[] {
  try {
    const raw = sessionStorage.getItem(storageKey(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is WaitingTask =>
        item && typeof item === 'object' && typeof item.taskId === 'string' && item.taskId.length > 0
    );
  } catch {
    return [];
  }
}

export function persistWaitingTasks(scope: string, tasks: WaitingTask[]): void {
  try {
    if (!tasks.length) {
      sessionStorage.removeItem(storageKey(scope));
      return;
    }
    sessionStorage.setItem(storageKey(scope), JSON.stringify(tasks));
  } catch {
    // ignore quota / private mode
  }
}

export function removePersistedWaitingTask(scope: string, taskId: string): void {
  const next = loadPersistedWaitingTasks(scope).filter((t) => t.taskId !== taskId);
  persistWaitingTasks(scope, next);
}
