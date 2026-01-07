export type StatName = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export type PokemonType = 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice' | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug' | 'Rock' | 'Ghost' | 'Dragon' | 'Steel' | 'Dark' | 'Fairy';

export type MoveCategory = 'Physical' | 'Special' | 'Status';

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number;
  accuracy: number;
  ppMax: number;
  priority?: number;
  description?: string;
}

export interface PokemonMove {
  move: Move;
  ppCurrent: number;
}

export interface Pokemon {
  id: string;
  speciesName: string;
  level: number;
  types: PokemonType[];
  baseStats: BaseStats;
  ivs: BaseStats;
  evs: BaseStats;
  nature: string; 
  
  // Dynamic State
  currentHp: number;
  maxHp: number;
  stats: BaseStats;
  moves: PokemonMove[];
  status?: 'BRN' | 'PAR' | 'SLP' | 'PSN' | 'FRZ';
  exp: number;
  nextLevelExp: number;
  
  // Metadata
  spriteUrl?: string;
}

// 增加新的视图状态
export type ViewState = 'ROAM' | 'BATTLE' | 'TEAM' | 'BAG' | 'PROFILE' | 'DEX' | 'SUMMARY';

export interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  type?: 'info' | 'combat' | 'urgent';
}

export type ItemCategory = 'MEDICINE' | 'POKEBALLS' | 'KEY_ITEMS';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  effect?: (target: Pokemon) => void;
}

export type PokedexStatus = 'CAUGHT' | 'SEEN' | 'UNKNOWN';

// 新增地图系统接口
export interface LocationData {
  id: string;
  name: string;
  description: string;
  region: string;
  connections: string[]; // IDs of other locations
  encounters?: string[]; // Potential wild pokemon IDs
  bgGradient?: string; // CSS gradient class
}
