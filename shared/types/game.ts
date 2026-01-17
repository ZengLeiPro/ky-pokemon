import type { PokemonType } from './pokemon';

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
}
