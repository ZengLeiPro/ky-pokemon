import { create } from 'zustand';
import { User, RegisterData, UserCredentials } from '../types';
import { useGameStore } from './gameStore';

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

const API_URL = 'http://localhost:3001/api/auth';

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
    console.warn('Backend API for updateUsername not implemented yet');
    return false;
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    console.warn('Backend API for updatePassword not implemented yet');
    return false;
  }
}));
