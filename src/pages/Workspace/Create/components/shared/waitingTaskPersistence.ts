import type { WaitingTask } from '../ImageToVideo/WaitingTaskQueue';

const STORAGE_PREFIX = 'create.waitingTaskQueue.';
const DISMISSED_PREFIX = 'create.waitingTaskDismissed.';

function storageKey(scope: string): string {
  return `${STORAGE_PREFIX}${scope}`;
}

function dismissedKey(scope: string): string {
  return `${DISMISSED_PREFIX}${scope}`;
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

/** 用户主动删除的任务 ID（localStorage，刷新后仍跳过 pending 恢复） */
export function loadDismissedTaskIds(scope: string): Set<string> {
  try {
    const raw = localStorage.getItem(dismissedKey(scope));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

export function persistDismissedTaskIds(scope: string, ids: Set<string>): void {
  try {
    if (!ids.size) {
      localStorage.removeItem(dismissedKey(scope));
      return;
    }
    localStorage.setItem(dismissedKey(scope), JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function addDismissedTaskId(scope: string, taskId: string): void {
  const ids = loadDismissedTaskIds(scope);
  ids.add(taskId);
  persistDismissedTaskIds(scope, ids);
}

export function clearDismissedTaskId(scope: string, taskId: string): void {
  const ids = loadDismissedTaskIds(scope);
  if (!ids.delete(taskId)) return;
  persistDismissedTaskIds(scope, ids);
}
