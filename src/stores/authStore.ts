import { create } from 'zustand';
import { User, RegisterData, UserCredentials } from '../types';

// 简单的密码哈希函数（仅用于演示，生产环境应使用后端+bcrypt）
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  register: (data: RegisterData) => boolean;
  login: (credentials: UserCredentials) => boolean;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
  updateUsername: (newUsername: string) => boolean;
  updatePassword: (oldPassword: string, newPassword: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  error: null,

  register: (data: RegisterData) => {
    try {
      // 获取现有用户
      const usersJson = localStorage.getItem('pokemon-users');
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      // 检查用户名是否已存在
      if (users.some(u => u.username === data.username)) {
        set({ error: '用户名已存在' });
        return false;
      }

      // 创建新用户
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        username: data.username,
        passwordHash: simpleHash(data.password),
        createdAt: Date.now()
      };

      // 保存用户
      users.push(newUser);
      localStorage.setItem('pokemon-users', JSON.stringify(users));

      // 自动登录
      const { passwordHash, ...userWithoutPassword } = newUser;
      localStorage.setItem('pokemon-current-user', JSON.stringify(userWithoutPassword));

      set({
        currentUser: userWithoutPassword,
        isAuthenticated: true,
        error: null
      });

      return true;
    } catch (err) {
      set({ error: '注册失败，请重试' });
      return false;
    }
  },

  login: (credentials: UserCredentials) => {
    try {
      const usersJson = localStorage.getItem('pokemon-users');
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(
        u => u.username === credentials.username &&
             u.passwordHash === simpleHash(credentials.password)
      );

      if (!user) {
        set({ error: '用户名或密码错误' });
        return false;
      }

      const { passwordHash, ...userWithoutPassword } = user;
      localStorage.setItem('pokemon-current-user', JSON.stringify(userWithoutPassword));

      set({
        currentUser: userWithoutPassword,
        isAuthenticated: true,
        error: null
      });

      return true;
    } catch (err) {
      set({ error: '登录失败，请重试' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('pokemon-current-user');
    set({
      currentUser: null,
      isAuthenticated: false,
      error: null
    });
  },

  checkAuth: () => {
    try {
      const userJson = localStorage.getItem('pokemon-current-user');
      if (userJson) {
        const user = JSON.parse(userJson);
        set({
          currentUser: user,
          isAuthenticated: true
        });
      }
    } catch (err) {
      localStorage.removeItem('pokemon-current-user');
    }
  },

  clearError: () => {
    set({ error: null });
  },

  updateUsername: (newUsername: string) => {
    try {
      const { currentUser } = get();
      if (!currentUser) return false;

      const usersJson = localStorage.getItem('pokemon-users');
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      if (users.some(u => u.username === newUsername && u.id !== currentUser.id)) {
        set({ error: '用户名已存在' });
        return false;
      }

      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        localStorage.setItem('pokemon-users', JSON.stringify(users));
        
        const updatedUser = { ...currentUser, username: newUsername };
        localStorage.setItem('pokemon-current-user', JSON.stringify(updatedUser));
        set({ currentUser: updatedUser, error: null });
        return true;
      }
      return false;
    } catch (err) {
      set({ error: '更新用户名失败' });
      return false;
    }
  },

  updatePassword: (oldPassword: string, newPassword: string) => {
    try {
      const { currentUser } = get();
      if (!currentUser) return false;

      const usersJson = localStorage.getItem('pokemon-users');
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex === -1) return false;

      if (users[userIndex].passwordHash !== simpleHash(oldPassword)) {
        set({ error: '旧密码错误' });
        return false;
      }

      users[userIndex].passwordHash = simpleHash(newPassword);
      localStorage.setItem('pokemon-users', JSON.stringify(users));
      set({ error: null });
      return true;
    } catch (err) {
      set({ error: '更新密码失败' });
      return false;
    }
  }
}));
