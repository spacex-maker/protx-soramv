import instance from 'api/axios';

export function buildWorkShareUrl(shareCode) {
  if (typeof window === 'undefined') {
    return `/works/s/${shareCode}`;
  }
  return `${window.location.origin}/works/s/${shareCode}`;
}

export async function createWorkShareLink(taskId) {
  const response = await instance.post(`/productx/sa-ai-gen-task/${taskId}/share`);
  return response.data;
}

export async function fetchPublicWorkShare(shareCode) {
  const response = await instance.get(`/productx/sa-ai-gen-task/share/${encodeURIComponent(shareCode)}`);
  return response.data;
}
