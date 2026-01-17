import { z } from 'zod';

// 基础 Schema
export const StatNameSchema = z.enum(['hp', 'atk', 'def', 'spa', 'spd', 'spe']);

export const BaseStatsSchema = z.object({
  hp: z.number().int().min(1).max(255),
  atk: z.number().int().min(1).max(255),
  def: z.number().int().min(1).max(255),
  spa: z.number().int().min(1).max(255),
  spd: z.number().int().min(1).max(255),
  spe: z.number().int().min(1).max(255),
});

export const IvsSchema = z.object({
  hp: z.number().int().min(0).max(31),
  atk: z.number().int().min(0).max(31),
  def: z.number().int().min(0).max(31),
  spa: z.number().int().min(0).max(31),
  spd: z.number().int().min(0).max(31),
  spe: z.number().int().min(0).max(31),
});

export const EvsSchema = z.object({
  hp: z.number().int().min(0).max(255),
  atk: z.number().int().min(0).max(255),
  def: z.number().int().min(0).max(255),
  spa: z.number().int().min(0).max(255),
  spd: z.number().int().min(0).max(255),
  spe: z.number().int().min(0).max(255),
});

export const StatsSchema = z.object({
  hp: z.number().int().min(0).max(9999),
  atk: z.number().int().min(0).max(9999),
  def: z.number().int().min(0).max(9999),
  spa: z.number().int().min(0).max(9999),
  spd: z.number().int().min(0).max(9999),
  spe: z.number().int().min(0).max(9999),
});

export const PokemonTypeSchema = z.enum([
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Steel', 'Dark', 'Fairy',
]);

export const MoveCategorySchema = z.enum(['Physical', 'Special', 'Status']);

export const StatusConditionSchema = z.enum(['BRN', 'PAR', 'SLP', 'PSN', 'FRZ']);

export const MoveSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: PokemonTypeSchema,
  category: MoveCategorySchema,
  power: z.number().int().min(0).max(300),
  accuracy: z.number().int().min(0).max(100),
  ppMax: z.number().int().min(1).max(64),
  priority: z.number().int().min(-7).max(5).optional(),
  description: z.string().optional(),
});

export const PokemonMoveSchema = z.object({
  move: MoveSchema,
  ppCurrent: z.number().int().min(0),
});

export const PokemonSchema = z.object({
  id: z.string().uuid(),
  speciesName: z.string().min(1),
  nickname: z.string().optional(),
  level: z.number().int().min(1).max(100),
  types: z.array(PokemonTypeSchema).min(1).max(2),
  baseStats: BaseStatsSchema,
  ivs: IvsSchema,
  evs: EvsSchema,
  nature: z.string(),
  currentHp: z.number().int().min(0),
  maxHp: z.number().int().min(1),
  stats: StatsSchema,
  moves: z.array(PokemonMoveSchema).min(1).max(4),
  status: StatusConditionSchema.optional(),
  exp: z.number().int().min(0),
  nextLevelExp: z.number().int().min(1),
  spriteUrl: z.string().url().optional(),
  speciesData: z.object({
    pokedexId: z.number().int().min(1),
    catchRate: z.number().int().min(1).max(255),
  }),
});

// 类型推导
export type MoveInput = z.input<typeof MoveSchema>;
export type PokemonInput = z.input<typeof PokemonSchema>;
