import { z } from 'zod';
import { UserSchema, UserCredentialsSchema, RegisterDataSchema } from './user.schema.js';
import { PokemonSchema } from './pokemon.schema.js';

// 通用 API 响应包装
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

// 认证相关
export const LoginRequestSchema = UserCredentialsSchema;
export const LoginResponseSchema = ApiResponseSchema(
  z.object({
    user: UserSchema,
    token: z.string(),
  })
);

export const RegisterRequestSchema = RegisterDataSchema;
export const RegisterResponseSchema = LoginResponseSchema;

// 游戏数据相关
const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['MEDICINE', 'POKEBALLS', 'KEY_ITEMS']),
  quantity: z.number().int().min(0),
});

export const SaveGameRequestSchema = z.object({
  team: z.array(PokemonSchema).min(0).max(6),
  pcBox: z.array(PokemonSchema),
  currentLocationId: z.string(),
  badges: z.array(z.string()),
  pokedex: z.record(z.string(), z.enum(['CAUGHT', 'SEEN', 'UNKNOWN'])),
  inventory: z.array(InventoryItemSchema).optional(),
  money: z.number().int().min(0).optional(),
  playTime: z.number().int().min(0).optional(),
  mode: z.enum(['NORMAL', 'CHEAT']).optional().default('NORMAL')
});

// 类型推导
export type LoginRequest = z.input<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SaveGameRequest = z.input<typeof SaveGameRequestSchema>;
