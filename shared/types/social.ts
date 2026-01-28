import type { Pokemon } from './pokemon.js';

// ========== 好友系统类型 ==========

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friend {
  id: string;           // friendship ID
  odId: string;       // 好友的 user ID
  username: string;
  status: FriendshipStatus;
  isOnline: boolean;
  createdAt: string;
}

export interface FriendRequest {
  id: string;           // friendship ID
  fromUserId: string;
  fromUsername: string;
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

// ========== 聊天系统类型 ==========

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderUsername: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  isOwn: boolean;  // 是否是自己发送的
}

export interface Conversation {
  odId: string;
  username: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface UnreadSummary {
  totalUnread: number;
  byUser: Record<string, number>;
}

// ========== 交换系统类型 ==========

export type TradeStatus = 'pending' | 'accepted' | 'completed' | 'rejected' | 'cancelled';

export interface TradePokemonInfo {
  pokemonId: string;
  snapshot: Pokemon;
}

export interface TradeRequest {
  id: string;
  initiatorId: string;
  initiatorUsername: string;
  receiverId: string;
  receiverUsername: string;
  offeredPokemon: TradePokemonInfo;
  requestedType: string | null;
  status: TradeStatus;
  receiverPokemon: TradePokemonInfo | null;
  message: string | null;
  isPublic: boolean;
  createdAt: string;
}

export interface CreateTradeRequest {
  receiverId: string;
  pokemonId: string;
  requestedType?: string;
  message?: string;
  isPublic?: boolean;
}

export interface AcceptTradeRequest {
  pokemonId: string;
}

// ========== PvP 对战系统类型 ==========

export type BattleStatus = 'pending' | 'active' | 'finished' | 'cancelled';

export interface BattleAction {
  type: 'move' | 'switch' | 'forfeit';
  moveIndex?: number;       // 使用哪个招式（0-3）
  switchToIndex?: number;   // 换哪只宝可梦（队伍索引）
  timestamp: number;
}

export interface PokemonBattleState {
  currentHp: number;
  maxHp: number;
  status?: string;         // 状态异常
  ppUsed: number[];        // 每个招式已使用的PP
  statChanges: {           // 能力变化
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
}

export interface BattleState {
  challengerActive: number;      // 当前出战的宝可梦索引
  opponentActive: number;
  challengerTeamState: PokemonBattleState[];
  opponentTeamState: PokemonBattleState[];
  weather?: string;
  weatherTurns?: number;
}

export interface BattleChallenge {
  id: string;
  challengerId: string;
  challengerUsername: string;
  opponentId: string;
  opponentUsername: string;
  status: BattleStatus;
  createdAt: string;
}

export interface BattleData {
  id: string;
  challengerId: string;
  challengerUsername: string;
  opponentId: string;
  opponentUsername: string;
  status: BattleStatus;
  challengerTeam: Pokemon[];
  opponentTeam: Pokemon[] | null;
  currentState: BattleState | null;
  currentTurn: number;
  myActionSubmitted: boolean;
  opponentActionSubmitted: boolean;
  winnerId: string | null;
  isChallenger: boolean;  // 当前用户是否是挑战者
  finishReason?: string | null;  // 'normal' | 'surrender' | 'disconnect'
}

export interface TurnResult {
  turn: number;
  events: TurnEvent[];
}

export interface TurnEvent {
  type: 'move' | 'damage' | 'heal' | 'status' | 'switch' | 'faint' | 'weather';
  actor?: 'challenger' | 'opponent';
  message: string;
  data?: any;
}
