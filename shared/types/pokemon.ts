export type StatName = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export type PokemonType = 
  | 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice'
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug'
  | 'Rock' | 'Ghost' | 'Dragon' | 'Steel' | 'Dark' | 'Fairy';

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

export type StatusCondition = 'BRN' | 'PAR' | 'SLP' | 'PSN' | 'FRZ';

export interface Pokemon {
  id: string;
  speciesName: string;
  nickname?: string;
  level: number;
  types: PokemonType[];
  baseStats: BaseStats;
  ivs: BaseStats;
  evs: BaseStats;
  nature: string;
  currentHp: number;
  maxHp: number;
  stats: BaseStats;
  moves: PokemonMove[];
  status?: StatusCondition;
  exp: number;
  nextLevelExp: number;
  spriteUrl?: string;
  speciesData: {
    pokedexId: number;
    catchRate: number;
  };
}

export interface Evolution {
  targetSpeciesId: string;
  level?: number;
  item?: string;
}

export interface LearnsetMove {
  moveId: string;
  level: number;
}

export interface SpeciesData {
  pokedexId: number;
  speciesName: string;
  types: PokemonType[];
  baseStats: BaseStats;
  catchRate: number;
  spriteUrl?: string;
  learnset?: LearnsetMove[];
  evolutions?: Evolution[];
}
