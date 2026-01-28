import { create } from 'zustand';
import { config } from '@/config';
import type {
  Friend,
  FriendRequest,
  UserSearchResult,
  Message,
  Conversation,
  UnreadSummary,
  TradeRequest,
  BattleData,
  BattleChallenge
} from '../../shared/types/social';

const API_URL = config.apiUrl;
const getToken = () => localStorage.getItem('token');

type LoadBattleStateResult =
  | { success: true; battle: BattleData }
  | { success: false; error: string; status?: number };

interface SocialState {
  // 好友数据
  friends: Friend[];
  pendingRequests: FriendRequest[];
  searchResults: UserSearchResult[];

  // 聊天数据
  conversations: Conversation[];
  currentChatMessages: Message[];
  currentChatFriendId: string | null;
  unreadSummary: UnreadSummary;
  chatPollingInterval: number | null;

  // 交换数据
  receivedTradeRequests: TradeRequest[];
  sentTradeRequests: TradeRequest[];
  publicTradeRequests: TradeRequest[];

  // 对战数据
  pendingBattleChallenges: BattleChallenge[];
  activeBattle: BattleData | null;
  battlePollingInterval: number | null;
  stuckBattle: {
    id: string;
    challengerUsername: string;
    opponentUsername: string;
    status: string;
    isChallenger: boolean;
    createdAt: string;
  } | null;

  // 心跳
  heartbeatInterval: number | null;

  // 加载状态
  isLoading: boolean;
  error: string | null;

  // Actions - 好友
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (targetUserId: string) => Promise<boolean>;
  loadFriends: () => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  deleteFriend: (friendshipId: string) => Promise<boolean>;

  // Actions - 聊天
  loadConversations: () => Promise<void>;
  loadMessages: (friendId: string, before?: string) => Promise<void>;
  sendMessage: (friendId: string, content: string) => Promise<boolean>;
  markAsRead: (friendId: string) => Promise<void>;
  startChatPolling: () => void;
  stopChatPolling: () => void;
  setCurrentChat: (friendId: string | null) => void;

  // Actions - 交换
  loadReceivedTradeRequests: () => Promise<void>;
  loadSentTradeRequests: () => Promise<void>;
  loadPublicTradeRequests: () => Promise<void>;
  createTradeRequest: (data: {
    receiverId: string;
    pokemonId: string;
    requestedType?: string;
    message?: string;
    isPublic?: boolean;
  }) => Promise<boolean>;
  acceptTradeRequest: (requestId: string, pokemonId: string) => Promise<boolean>;
  confirmTradeRequest: (requestId: string) => Promise<boolean>;
  rejectTradeRequest: (requestId: string) => Promise<boolean>;
  cancelTradeRequest: (requestId: string) => Promise<boolean>;

  // Actions - 对战
  loadPendingBattleChallenges: () => Promise<void>;
  sendBattleChallenge: (opponentId: string) => Promise<boolean>;
  acceptBattleChallenge: (battleId: string) => Promise<boolean>;
  rejectBattleChallenge: (battleId: string) => Promise<boolean>;
  cancelBattleChallenge: (battleId: string) => Promise<boolean>;
  loadBattleState: (battleId: string) => Promise<LoadBattleStateResult>;
  submitBattleAction: (battleId: string, action: {
    type: 'move' | 'switch' | 'forfeit';
    moveIndex?: number;
    switchToIndex?: number;
  }) => Promise<boolean>;
  surrenderBattle: (battleId: string) => Promise<boolean>;
  startBattlePolling: () => void;
  stopBattlePolling: () => void;
  setActiveBattle: (battle: BattleData | null) => void;
  loadStuckBattle: () => Promise<void>;
  cleanupStuckBattle: () => Promise<boolean>;

  // 心跳
  startHeartbeat: () => void;
  stopHeartbeat: () => void;

  // Utilities
  clearSearchResults: () => void;
  clearError: () => void;
}

export const useSocialStore = create<SocialState>()((set, get) => ({
  // 好友数据
  friends: [],
  pendingRequests: [],
  searchResults: [],

  // 聊天数据
  conversations: [],
  currentChatMessages: [],
  currentChatFriendId: null,
  unreadSummary: { totalUnread: 0, byUser: {} },
  chatPollingInterval: null,

  // 交换数据
  receivedTradeRequests: [],
  sentTradeRequests: [],
  publicTradeRequests: [],

  // 对战数据
  pendingBattleChallenges: [],
  activeBattle: null,
  battlePollingInterval: null,
  stuckBattle: null,

  // 心跳
  heartbeatInterval: null,

  // 加载状态
  isLoading: false,
  error: null,

  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${API_URL}/friend/search?query=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      if (data.success) {
        set({ searchResults: data.data });
      } else {
        set({ error: data.error });
      }
    } catch (e) {
      set({ error: '搜索失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  sendFriendRequest: async (targetUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/friend/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ targetUserId })
      });
      const data = await res.json();
      if (data.success) {
        // 更新搜索结果中的状态
        set(state => ({
          searchResults: state.searchResults.map(u =>
            u.id === targetUserId ? { ...u, hasPendingRequest: true } : u
          )
        }));
        return true;
      } else {
        set({ error: data.error });
        return false;
      }
    } catch (e) {
      set({ error: '发送请求失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  loadFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/friend/list`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ friends: data.data });
      } else {
        set({ error: data.error });
      }
    } catch (e) {
      set({ error: '加载好友列表失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadPendingRequests: async () => {
    try {
      const res = await fetch(`${API_URL}/friend/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ pendingRequests: data.data });
      }
    } catch (e) {
      console.error('加载好友请求失败', e);
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      const res = await fetch(`${API_URL}/friend/request/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        // 刷新列表
        get().loadFriends();
        get().loadPendingRequests();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '操作失败' });
      return false;
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    try {
      const res = await fetch(`${API_URL}/friend/request/${requestId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        get().loadPendingRequests();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '操作失败' });
      return false;
    }
  },

  deleteFriend: async (friendshipId: string) => {
    try {
      const res = await fetch(`${API_URL}/friend/${friendshipId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendshipId)
        }));
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '删除失败' });
      return false;
    }
  },

  // ========== 聊天相关方法 ==========

  loadConversations: async () => {
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ conversations: data.data });
      }
    } catch (e) {
      console.error('加载会话失败', e);
    }
  },

  loadMessages: async (friendId: string, before?: string) => {
    try {
      const url = new URL(`${API_URL}/chat/${friendId}/messages`);
      if (before) url.searchParams.set('before', before);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        if (before) {
          // 加载更多历史消息
          set(state => ({
            currentChatMessages: [...data.data, ...state.currentChatMessages]
          }));
        } else {
          set({ currentChatMessages: data.data });
        }
      }
    } catch (e) {
      console.error('加载消息失败', e);
    }
  },

  sendMessage: async (friendId: string, content: string) => {
    try {
      const res = await fetch(`${API_URL}/chat/${friendId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        set(state => ({
          currentChatMessages: [...state.currentChatMessages, data.data]
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error('发送消息失败', e);
      return false;
    }
  },

  markAsRead: async (friendId: string) => {
    try {
      await fetch(`${API_URL}/chat/${friendId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      // 更新本地未读数
      set(state => ({
        unreadSummary: {
          ...state.unreadSummary,
          totalUnread: state.unreadSummary.totalUnread - (state.unreadSummary.byUser[friendId] || 0),
          byUser: { ...state.unreadSummary.byUser, [friendId]: 0 }
        }
      }));
    } catch (e) {
      console.error('标记已读失败', e);
    }
  },

  startChatPolling: () => {
    const { chatPollingInterval } = get();
    if (chatPollingInterval) return;

    const poll = async () => {
      try {
        // 获取未读消息
        const res = await fetch(`${API_URL}/chat/poll`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const currentFriendId = get().currentChatFriendId;
          // 如果当前正在和某人聊天，更新消息列表
          const newMessages = data.data.filter(
            (m: Message) => m.senderId === currentFriendId
          );
          if (newMessages.length > 0) {
            set(state => ({
              currentChatMessages: [...state.currentChatMessages, ...newMessages]
            }));
            // 标记为已读
            get().markAsRead(currentFriendId!);
          }
          // 更新未读数
          get().loadConversations();
        }
      } catch (e) {
        console.error('轮询失败', e);
      }
    };

    const interval = window.setInterval(poll, 3000);
    set({ chatPollingInterval: interval });
  },

  stopChatPolling: () => {
    const { chatPollingInterval } = get();
    if (chatPollingInterval) {
      clearInterval(chatPollingInterval);
      set({ chatPollingInterval: null });
    }
  },

  setCurrentChat: (friendId: string | null) => {
    set({ currentChatFriendId: friendId });
    if (friendId) {
      get().loadMessages(friendId);
      get().markAsRead(friendId);
    } else {
      set({ currentChatMessages: [] });
    }
  },

  // ========== 交换相关方法 ==========

  loadReceivedTradeRequests: async () => {
    try {
      const res = await fetch(`${API_URL}/trade/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ receivedTradeRequests: data.data });
      }
    } catch (e) {
      console.error('加载收到的交换请求失败', e);
    }
  },

  loadSentTradeRequests: async () => {
    try {
      const res = await fetch(`${API_URL}/trade/sent`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ sentTradeRequests: data.data });
      }
    } catch (e) {
      console.error('加载发出的交换请求失败', e);
    }
  },

  loadPublicTradeRequests: async () => {
    try {
      const res = await fetch(`${API_URL}/trade/public`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ publicTradeRequests: data.data });
      }
    } catch (e) {
      console.error('加载公开交换请求失败', e);
    }
  },

  createTradeRequest: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/trade/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        get().loadSentTradeRequests();
        return true;
      }
      set({ error: result.error });
      return false;
    } catch (e) {
      set({ error: '发起交换失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  acceptTradeRequest: async (requestId: string, pokemonId: string) => {
    try {
      const res = await fetch(`${API_URL}/trade/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ pokemonId })
      });
      const data = await res.json();
      if (data.success) {
        get().loadReceivedTradeRequests();
        get().loadSentTradeRequests();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '接受交换失败' });
      return false;
    }
  },

  confirmTradeRequest: async (requestId: string) => {
    try {
      const res = await fetch(`${API_URL}/trade/${requestId}/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        get().loadSentTradeRequests();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '确认交换失败' });
      return false;
    }
  },

  rejectTradeRequest: async (requestId: string) => {
    try {
      const res = await fetch(`${API_URL}/trade/${requestId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        get().loadReceivedTradeRequests();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '拒绝交换失败' });
      return false;
    }
  },

  cancelTradeRequest: async (requestId: string) => {
    try {
      const res = await fetch(`${API_URL}/trade/${requestId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        get().loadSentTradeRequests();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '取消交换失败' });
      return false;
    }
  },

  // ========== 对战相关方法 ==========

  loadPendingBattleChallenges: async () => {
    try {
      const res = await fetch(`${API_URL}/battle/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ pendingBattleChallenges: data.data });
      }
    } catch (e) {
      console.error('加载对战邀请失败', e);
    }
  },

  sendBattleChallenge: async (opponentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/battle/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ opponentId })
      });
      const data = await res.json();
      if (data.success) {
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '发起对战失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  acceptBattleChallenge: async (battleId: string) => {
    try {
      const res = await fetch(`${API_URL}/battle/${battleId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        get().loadPendingBattleChallenges();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '接受对战失败' });
      return false;
    }
  },

  rejectBattleChallenge: async (battleId: string) => {
    try {
      const res = await fetch(`${API_URL}/battle/${battleId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        get().loadPendingBattleChallenges();
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '拒绝对战失败' });
      return false;
    }
  },

  cancelBattleChallenge: async (battleId: string) => {
    try {
      const res = await fetch(`${API_URL}/battle/${battleId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '取消对战失败' });
      return false;
    }
  },

  loadBattleState: async (battleId: string) => {
    try {
      const res = await fetch(`${API_URL}/battle/${battleId}/state`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        const battleData = data.data as BattleData;
        set({ activeBattle: battleData });
        return { success: true, battle: battleData };
      }

      return {
        success: false,
        error: data?.error || '加载对战状态失败',
        status: res.status
      };
    } catch (e) {
      console.error('加载对战状态失败', e);
      return { success: false, error: '加载对战状态失败' };
    }
  },

  submitBattleAction: async (battleId: string, action) => {
    try {
      const res = await fetch(`${API_URL}/battle/${battleId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(action)
      });
      const data = await res.json();
      if (data.success) {
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '提交行动失败' });
      return false;
    }
  },

  surrenderBattle: async (battleId: string) => {
    try {
      const res = await fetch(`${API_URL}/battle/${battleId}/surrender`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ activeBattle: null });
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '投降失败' });
      return false;
    }
  },

  startBattlePolling: () => {
    const { battlePollingInterval, activeBattle } = get();
    if (battlePollingInterval) return;
    if (!activeBattle) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/battle/${activeBattle.id}/state`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success) {
          const battleData = data.data as BattleData;
          set({ activeBattle: battleData });

          // 如果对战结束，清除轮询
          if (battleData.status === 'finished') {
            get().stopBattlePolling();
          }
        }
      } catch (e) {
        console.error('轮询对战状态失败', e);
      }
    };

    const interval = window.setInterval(poll, 1000); // 1秒轮询
    set({ battlePollingInterval: interval });
  },

  stopBattlePolling: () => {
    const { battlePollingInterval } = get();
    if (battlePollingInterval) {
      clearInterval(battlePollingInterval);
      set({ battlePollingInterval: null });
    }
  },

  setActiveBattle: (battle: BattleData | null) => {
    set({ activeBattle: battle });
    if (battle) {
      get().startBattlePolling();
    } else {
      get().stopBattlePolling();
    }
  },

  loadStuckBattle: async () => {
    try {
      const res = await fetch(`${API_URL}/battle/my-stuck`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ stuckBattle: data.data });
      }
    } catch (e) {
      console.error('加载卡住的对战失败', e);
    }
  },

  cleanupStuckBattle: async () => {
    try {
      const res = await fetch(`${API_URL}/battle/cleanup-stuck`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ stuckBattle: null });
        return true;
      }
      set({ error: data.error });
      return false;
    } catch (e) {
      set({ error: '清理对战失败' });
      return false;
    }
  },

  // ========== 心跳相关方法 ==========

  startHeartbeat: () => {
    const { heartbeatInterval } = get();
    if (heartbeatInterval) return;

    const beat = async () => {
      try {
        await fetch(`${API_URL}/presence/heartbeat`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      } catch (e) {
        console.error('心跳失败', e);
      }
    };

    // 立即发一次
    beat();
    const interval = window.setInterval(beat, 15000); // 15秒
    set({ heartbeatInterval: interval });
  },

  stopHeartbeat: () => {
    const { heartbeatInterval } = get();
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      set({ heartbeatInterval: null });
    }
  },

  // Utilities
  clearSearchResults: () => set({ searchResults: [] }),
  clearError: () => set({ error: null })
}));
