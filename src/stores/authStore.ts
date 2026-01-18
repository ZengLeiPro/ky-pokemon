import { create } from 'zustand';
import { User, RegisterData, UserCredentials } from '../types';
import { useGameStore } from './gameStore';
import { config } from '../config';
import { useToast } from '../components/ui/Toast';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  error: string | null;
  token: string | null;

  register: (data: RegisterData) => Promise<boolean>;
  login: (credentials: UserCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  
  updateUsername: (newUsername: string) => Promise<boolean>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const API_URL = `${config.apiUrl}/auth`;

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  error: null,
  token: localStorage.getItem('token'),

  register: async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        set({ error: result.error });
        return false;
      }

      const { user, token } = result.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        currentUser: user,
        isAuthenticated: true,
        error: null,
        token
      });

      useGameStore.getState().loadGame(user.id);
      return true;
    } catch (err) {
      useToast.getState().show('注册失败，请检查网络连接', 'error');
      set({ error: '注册失败，请检查网络连接' });
      return false;
    }
  },

  login: async (credentials: UserCredentials) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!result.success) {
        set({ error: result.error });
        return false;
      }

      const { user, token } = result.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        currentUser: user,
        isAuthenticated: true,
        error: null,
        token
      });

      useGameStore.getState().loadGame(user.id);
      return true;
    } catch (err) {
      useToast.getState().show('登录失败，请检查网络连接', 'error');
      set({ error: '登录失败，请检查网络连接' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      currentUser: null,
      isAuthenticated: false,
      error: null,
      token: null
    });
    useGameStore.getState().resetGame();
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      get().logout();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      const result = await response.json();

      if (result.success && result.data?.user) {
        const user = result.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        
        set({
          currentUser: user,
          isAuthenticated: true,
          token
        });
        useGameStore.getState().loadGame(user.id);
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    }
  },

  clearError: () => {
    set({ error: null });
  },

  updateUsername: async (newUsername: string) => {
    const token = get().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newUsername })
      });

      const result = await response.json();

      if (result.success && result.data?.user) {
        const user = result.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        set({ currentUser: user, error: null });
        return true;
      } else {
        set({ error: result.error || '更新用户名失败' });
        return false;
      }
    } catch {
      useToast.getState().show('网络错误，请重试', 'error');
      set({ error: '网络错误，请重试' });
      return false;
    }
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    const token = get().token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const result = await response.json();

      if (result.success) {
        set({ error: null });
        return true;
      } else {
        set({ error: result.error || '更新密码失败' });
        return false;
      }
    } catch {
      useToast.getState().show('网络错误，请重试', 'error');
      set({ error: '网络错误，请重试' });
      return false;
    }
  }
}));
