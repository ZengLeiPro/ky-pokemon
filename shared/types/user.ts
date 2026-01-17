export interface User {
  id: string;
  username: string;
  createdAt: number;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export type RegisterData = UserCredentials;

// 后端扩展
export interface StoredUser extends User {
  passwordHash: string;
}
