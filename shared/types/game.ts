import type { PokemonType } from './pokemon.js';

export type Weather = 'Sunny' | 'Rain' | 'Sandstorm' | 'Hail' | 'None';

export type PokedexStatus = 'CAUGHT' | 'SEEN' | 'UNKNOWN';

export type ItemCategory = 'MEDICINE' | 'POKEBALLS' | 'KEY_ITEMS';

export interface GymData {
  leaderName: string;
  badgeName: string;
  badgeId: string;
  description: string;
  pokemon: string[];
  level: number;
}

export interface LegendaryEncounter {
  speciesId: string;           // 传说宝可梦 ID（如 'articuno'）
  level: number;               // 等级
  minBadges?: number;          // 最少需要的道馆徽章数
}

export interface LegendaryProgress {
  visibleOnMap?: boolean;      // 是否在地图上可见（用于显示提示）
  captured: boolean;           // 是否已捕获
  defeated: boolean;           // 是否已击败（击败后也会消失）
}

export interface LocationData {
  id: string;
  name: string;
  description: string;
  region: string;
  connections: string[];
  encounters?: string[];
  bgGradient?: string;  // 前端可选使用
  gym?: GymData;
  weatherRates?: Partial<Record<Weather, number>>;
  legendaryEncounter?: LegendaryEncounter;  // 传说宝可梦固定遭遇
}
