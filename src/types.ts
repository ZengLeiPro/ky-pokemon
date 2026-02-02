// 重新导出 shared 类型（保持向后兼容）
export * from '@shared/types';
import { ItemCategory, Pokemon } from '@shared/types';

// 前端特有类型
export type ViewState =
  | 'ROAM'
  | 'BATTLE'
  | 'TEAM'
  | 'BAG'
  | 'PROFILE'
  | 'DEX'
  | 'SUMMARY'
  | 'LOGIN'
  | 'REGISTER'
  | 'PC_BOX'
  // 社交视图
  | 'FRIENDS'      // 好友列表
  | 'CHAT'         // 聊天界面
  | 'PVP_BATTLE'   // PvP 对战
  | 'TRADE'        // 交换界面
  | 'GIFT';        // 礼物界面

export interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  type?: 'info' | 'combat' | 'urgent';
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  effect?: (target: Pokemon) => void; // 函数字段，不可序列化
}

export interface EvolutionState {
  isEvolving: boolean;
  pokemon: Pokemon | null;
  targetSpeciesId: string | null;
  stage: 'START' | 'ANIMATION' | 'FINISHED';
}
