export interface UserModel {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAuthState {
  isAuthenticated: boolean;
  user: UserModel | null;
  token?: string;
} 