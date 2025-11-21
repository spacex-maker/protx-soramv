export interface FileModel {
  id: number;
  userId: number;
  parentId: number | null;
  isDirectory: boolean;
  name: string;
  extension: string | null;
  size: number;
  tag: string | null;
  storagePath: string;
  hash: string | null;
  mimeType: string | null;
  storageType: 'LOCAL' | 'COS';
  downloadUrl: string | null;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  version: number;
  status: 'ACTIVE' | 'DELETED' | 'RECYCLED';
  createTime: string;
  updateTime: string;
}