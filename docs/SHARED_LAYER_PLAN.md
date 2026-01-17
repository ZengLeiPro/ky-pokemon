# Shared Layer 重构方案

## 1. 项目背景

### 1.1 当前状态

**项目名称**: 关都传说：掌上对决 (Kanto Legends)

**技术栈**:
- 前端: React 19 + Zustand + TypeScript 5.8 + Vite 6
- 样式: Tailwind CSS
- 持久化: IndexedDB (idb) + LocalStorage
- 状态管理: Zustand + Immer

**当前架构**: 纯前端 Serverless Client-Side 应用，所有游戏逻辑和数据存储都在浏览器本地运行。

**现有文件结构**:
```
src/
├── components/          # React 组件
│   ├── stages/          # 游戏场景组件
│   └── ui/              # 通用 UI 组件
├── stores/              # Zustand 状态管理
│   ├── authStore.ts     # 用户认证状态
│   └── gameStore.ts     # 游戏核心状态
├── lib/                 # 工具库
│   ├── mechanics.ts     # 游戏机制（伤害计算、升级等）
│   └── storage.ts       # IndexedDB 封装
├── constants.ts         # 静态数据（招式表、种族数据、地图等）
├── types.ts             # TypeScript 类型定义
├── App.tsx              # 根组件
└── index.tsx            # 入口
```

### 1.2 目标

**短期目标**: 创建 `shared/` 层，将可复用的类型、Schema、常量和纯函数抽取出来，供前后端共享。

**长期目标**: 
- 后端服务（用户认证 JWT、数据持久化、排行榜等）
- 前后端共用同一套数据验证逻辑
- API 请求/响应类型安全

---

## 2. 当前代码分析

### 2.1 types.ts 分析

| 类型 | 归属 | 说明 |
|------|------|------|
| `StatName` | **Shared** | 六围属性名 |
| `BaseStats` | **Shared** | 种族值/个体值/努力值结构 |
| `PokemonType` | **Shared** | 18种属性类型 |
| `MoveCategory` | **Shared** | 招式分类（物理/特殊/状态） |
| `Move` | **Shared** | 招式定义 |
| `PokemonMove` | **Shared** | 宝可梦持有的招式（含PP） |
| `Pokemon` | **Shared** | 宝可梦完整数据结构 |
| `ViewState` | **Frontend** | UI 视图状态（前端路由概念） |
| `LogEntry` | **Frontend** | 战斗日志条目 |
| `ItemCategory` | **Shared** | 道具分类 |
| `InventoryItem` | **Frontend** | 背包道具（含 `effect` 函数，不可序列化） |
| `PokedexStatus` | **Shared** | 图鉴状态 |
| `Weather` | **Shared** | 天气系统 |
| `Evolution` | **Shared** | 进化数据 |
| `LearnsetMove` | **Shared** | 技能学习表条目 |
| `GymData` | **Shared** | 道馆数据 |
| `LocationData` | **Shared** | 地图位置数据 |
| `User` | **Shared** | 用户基础信息 |
| `UserCredentials` | **Shared** | 登录凭证 |
| `RegisterData` | **Shared** | 注册数据 |

### 2.2 constants.ts 分析

| 常量 | 归属 | 说明 |
|------|------|------|
| `TYPE_COLORS` | **Frontend** | UI 配色，后端不需要 |
| `TYPE_TRANSLATIONS` | **Shared** | 属性中文翻译，可用于后端日志/消息 |
| `MOVES` | **Shared** | 招式数据库 |
| `SPECIES_DATA` | **Shared** | 宝可梦种族数据 |
| `LOCATION_DATA` | **Shared** | 地图数据（后端需要验证位置合法性） |

### 2.3 lib/mechanics.ts 分析

| 函数 | 归属 | 说明 |
|------|------|------|
| `MOVE_EFFECTS` | **Shared** | 招式附加效果表 |
| `TYPE_CHART` | **Shared** | 18x18 属性克制表 |
| `calculateStats()` | **Shared** | 能力值计算公式 |
| `createPokemon()` | **Shared** | 创建宝可梦实例 |
| `calculateDamage()` | **Shared** | 伤害计算公式 |
| `gainExperience()` | **Shared** | 经验获取与升级逻辑 |
| `checkEvolution()` | **Shared** | 进化检测 |
| `evolvePokemon()` | **Shared** | 执行进化 |

### 2.4 前端特有代码（不迁移）

| 文件/模块 | 说明 |
|-----------|------|
| `src/stores/*` | Zustand 状态管理，前端特有 |
| `src/lib/storage.ts` | IndexedDB 封装，前端特有 |
| `src/components/*` | React 组件 |
| `TYPE_COLORS` | UI 配色 |
| `ViewState`, `LogEntry` | 前端 UI 状态 |
| `InventoryItem.effect` | 含函数字段，不可序列化 |

---

## 3. 目标架构

### 3.1 目录结构

```
ky-pokemon/
├── shared/                      # 前后端共享代码
│   ├── types/                   # TypeScript 类型定义
│   │   ├── index.ts             # 统一导出
│   │   ├── pokemon.ts           # Pokemon, Move, BaseStats 等
│   │   ├── user.ts              # User, UserCredentials 等
│   │   └── game.ts              # Weather, LocationData 等
│   │
│   ├── schemas/                 # Zod 运行时验证
│   │   ├── index.ts             # 统一导出
│   │   ├── pokemon.schema.ts    # Pokemon 相关 Schema
│   │   ├── user.schema.ts       # 用户相关 Schema
│   │   └── api.schema.ts        # API 请求/响应 Schema
│   │
│   ├── constants/               # 静态数据
│   │   ├── index.ts             # 统一导出
│   │   ├── moves.ts             # MOVES 招式表
│   │   ├── species.ts           # SPECIES_DATA 种族数据
│   │   ├── type-chart.ts        # TYPE_CHART 属性克制表
│   │   └── locations.ts         # LOCATION_DATA 地图数据
│   │
│   └── utils/                   # 纯函数工具
│       ├── index.ts             # 统一导出
│       ├── stats.ts             # calculateStats
│       ├── damage.ts            # calculateDamage
│       ├── experience.ts        # gainExperience
│       ├── evolution.ts         # checkEvolution, evolvePokemon
│       └── pokemon-factory.ts   # createPokemon
│
├── src/                         # 前端代码
│   ├── types.ts                 # 前端特有类型（ViewState, LogEntry 等）
│   ├── constants.ts             # 前端特有常量（TYPE_COLORS 等）
│   ├── lib/
│   │   └── storage.ts           # IndexedDB（保留）
│   ├── stores/                  # Zustand stores
│   ├── components/              # React 组件
│   └── ...
│
└── server/                      # 后端代码（未来）
    └── ...
```

### 3.2 导入路径配置

**tsconfig.json 更新**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

**vite.config.ts 更新**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
```

---

## 4. 详细迁移计划

### 4.1 Phase 1: 基础设施 (预计 30 分钟)

**任务清单**:

1. **安装 Zod 依赖**
   ```bash
   npm install zod
   ```

2. **创建目录结构**
   ```bash
   mkdir -p shared/{types,schemas,constants,utils}
   ```

3. **更新 tsconfig.json**
   - 添加 `@shared/*` 路径别名
   - 确保 `include` 包含 `shared/**/*`

4. **更新 vite.config.ts**
   - 添加 `@shared` resolve alias

### 4.2 Phase 2: 类型迁移 (预计 45 分钟)

**文件: `shared/types/pokemon.ts`**
```typescript
// 从 src/types.ts 迁移
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
```

**文件: `shared/types/user.ts`**
```typescript
export interface User {
  id: string;
  username: string;
  createdAt: number;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export type RegisterData = UserCredentials;

// 后端扩展
export interface StoredUser extends User {
  passwordHash: string;
}
```

**文件: `shared/types/game.ts`**
```typescript
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
```

**文件: `shared/types/index.ts`**
```typescript
export * from './pokemon';
export * from './user';
export * from './game';
```

### 4.3 Phase 3: Schema 定义 (预计 60 分钟)

**文件: `shared/schemas/pokemon.schema.ts`**
```typescript
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
  ivs: BaseStatsSchema,
  evs: BaseStatsSchema,
  nature: z.string(),
  currentHp: z.number().int().min(0),
  maxHp: z.number().int().min(1),
  stats: BaseStatsSchema,
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
```

**文件: `shared/schemas/user.schema.ts`**
```typescript
import { z } from 'zod';

export const UsernameSchema = z
  .string()
  .min(2, '用户名至少2个字符')
  .max(20, '用户名最多20个字符')
  .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文');

export const PasswordSchema = z
  .string()
  .min(6, '密码至少6个字符')
  .max(100, '密码最多100个字符');

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: UsernameSchema,
  createdAt: z.number().int().positive(),
});

export const UserCredentialsSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
});

export const RegisterDataSchema = UserCredentialsSchema;

// 类型推导
export type UserInput = z.input<typeof UserSchema>;
export type UserCredentialsInput = z.input<typeof UserCredentialsSchema>;
```

**文件: `shared/schemas/api.schema.ts`**
```typescript
import { z } from 'zod';
import { UserSchema, UserCredentialsSchema, RegisterDataSchema } from './user.schema';
import { PokemonSchema } from './pokemon.schema';

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
export const SaveGameRequestSchema = z.object({
  team: z.array(PokemonSchema).max(6),
  pcBox: z.array(PokemonSchema),
  currentLocationId: z.string(),
  badges: z.array(z.string()),
  pokedex: z.record(z.string(), z.enum(['CAUGHT', 'SEEN', 'UNKNOWN'])),
});

// 类型推导
export type LoginRequest = z.input<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type SaveGameRequest = z.input<typeof SaveGameRequestSchema>;
```

**文件: `shared/schemas/index.ts`**
```typescript
export * from './pokemon.schema';
export * from './user.schema';
export * from './api.schema';
```

### 4.4 Phase 4: 常量迁移 (预计 30 分钟)

**文件: `shared/constants/type-chart.ts`**
```typescript
import type { PokemonType } from '../types';

// 完整的 18x18 属性克制表 (Gen 3+ 官方数据)
// 格式: TYPE_CHART[攻击属性][防御属性] = 倍率
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Normal: {
    Rock: 0.5, Ghost: 0, Steel: 0.5,
  },
  Fire: {
    Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2,
  },
  // ... (完整复制 mechanics.ts 中的 TYPE_CHART)
  // 此处省略，实际迁移时完整复制
};

export const getTypeEffectiveness = (
  moveType: PokemonType,
  targetTypes: PokemonType[]
): number => {
  let multiplier = 1.0;
  for (const tType of targetTypes) {
    const chart = TYPE_CHART[moveType];
    if (chart) {
      const effectiveness = chart[tType];
      if (effectiveness !== undefined) {
        multiplier *= effectiveness;
      }
    }
  }
  return multiplier;
};
```

**文件: `shared/constants/moves.ts`**
```typescript
import type { Move } from '../types';

export const MOVES: Record<string, Move> = {
  tackle: {
    id: 'tackle',
    name: '撞击',
    type: 'Normal',
    category: 'Physical',
    power: 40,
    accuracy: 100,
    ppMax: 35,
    description: '用整个身体撞向对手进行攻击。',
  },
  // ... (从 constants.ts 完整复制 MOVES)
};

// 招式附加效果
export const MOVE_EFFECTS: Record<string, {
  type: 'status' | 'weather' | 'heal';
  id: string;
  chance: number;
  value?: number;
}> = {
  ember: { type: 'status', id: 'BRN', chance: 0.1 },
  // ... (从 mechanics.ts 完整复制 MOVE_EFFECTS)
};
```

**文件: `shared/constants/species.ts`**
```typescript
import type { SpeciesData } from '../types';

export const SPECIES_DATA: Record<string, SpeciesData> = {
  bulbasaur: {
    pokedexId: 1,
    speciesName: '妙蛙种子',
    types: ['Grass', 'Poison'],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    catchRate: 45,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    learnset: [
      { moveId: 'tackle', level: 1 },
      { moveId: 'growl', level: 1 },
      { moveId: 'leechSeed', level: 7 },
      { moveId: 'vineWhip', level: 13 },
    ],
    evolutions: [{ targetSpeciesId: 'ivysaur', level: 16 }],
  },
  // ... (从 constants.ts 完整复制)
};

// 辅助函数
export const findSpeciesKeyByPokedexId = (pokedexId: number): string => {
  for (const [key, data] of Object.entries(SPECIES_DATA)) {
    if (data.pokedexId === pokedexId) {
      return key;
    }
  }
  return '';
};
```

**文件: `shared/constants/locations.ts`**
```typescript
import type { LocationData } from '../types';

export const LOCATION_DATA: Record<string, LocationData> = {
  // 从 constants.ts 复制 LOCATION_DATA
};
```

**文件: `shared/constants/index.ts`**
```typescript
export * from './type-chart';
export * from './moves';
export * from './species';
export * from './locations';
```

### 4.5 Phase 5: 工具函数迁移 (预计 60 分钟)

**文件: `shared/utils/stats.ts`**
```typescript
import type { BaseStats } from '../types';

/**
 * 计算宝可梦实际能力值（Gen 3+ 公式）
 */
export const calculateStats = (
  base: BaseStats,
  ivs: BaseStats,
  evs: BaseStats,
  level: number,
  natureModifier: Record<keyof BaseStats, number> = { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }
): { stats: BaseStats; maxHp: number } => {
  const calcStat = (statName: keyof BaseStats, isHp: boolean): number => {
    const b = base[statName];
    const i = ivs[statName];
    const e = evs[statName];

    if (isHp) {
      return Math.floor(((2 * b + i + Math.floor(e / 4)) * level) / 100) + level + 10;
    }
    const baseStat = Math.floor(((2 * b + i + Math.floor(e / 4)) * level) / 100) + 5;
    return Math.floor(baseStat * (natureModifier[statName] ?? 1));
  };

  const maxHp = calcStat('hp', true);

  return {
    maxHp,
    stats: {
      hp: maxHp,
      atk: calcStat('atk', false),
      def: calcStat('def', false),
      spa: calcStat('spa', false),
      spd: calcStat('spd', false),
      spe: calcStat('spe', false),
    },
  };
};
```

**文件: `shared/utils/damage.ts`**
```typescript
import type { Pokemon, Move, Weather } from '../types';
import { getTypeEffectiveness } from '../constants/type-chart';

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  typeEffectiveness: number;
}

/**
 * 计算伤害（Gen 3+ 公式）
 */
export const calculateDamage = (
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  weather: Weather = 'None',
  randomFactor?: number // 可选：用于测试时固定随机数
): DamageResult => {
  if (move.category === 'Status') {
    return { damage: 0, isCritical: false, typeEffectiveness: 1 };
  }

  let a = move.category === 'Physical' ? attacker.stats.atk : attacker.stats.spa;
  const d = move.category === 'Physical' ? defender.stats.def : defender.stats.spd;

  // 灼伤减半物攻
  if (attacker.status === 'BRN' && move.category === 'Physical') {
    a = Math.floor(a * 0.5);
  }

  // 天气影响
  let power = move.power;
  if (weather === 'Sunny') {
    if (move.type === 'Fire') power = Math.floor(power * 1.5);
    if (move.type === 'Water') power = Math.floor(power * 0.5);
  } else if (weather === 'Rain') {
    if (move.type === 'Water') power = Math.floor(power * 1.5);
    if (move.type === 'Fire') power = Math.floor(power * 0.5);
  }

  const levelFactor = (2 * attacker.level) / 5 + 2;
  const baseDamage = (levelFactor * power * (a / d)) / 50 + 2;

  // 暴击判定
  const critRoll = randomFactor ?? Math.random();
  const isCritical = critRoll < 0.0625;
  const critMod = isCritical ? 1.5 : 1.0;

  // 随机浮动 (85-100%)
  const randomMod = randomFactor !== undefined
    ? 1.0
    : (Math.floor(Math.random() * 16) + 85) / 100;

  // STAB 加成
  const stabMod = attacker.types.includes(move.type) ? 1.5 : 1.0;

  // 属性克制
  const typeMod = getTypeEffectiveness(move.type, defender.types);

  const damage = Math.floor(baseDamage * critMod * randomMod * stabMod * typeMod);

  return { damage, isCritical, typeEffectiveness: typeMod };
};
```

**文件: `shared/utils/experience.ts`**
```typescript
import type { Pokemon, BaseStats } from '../types';
import { SPECIES_DATA, MOVES, findSpeciesKeyByPokedexId } from '../constants';
import { calculateStats } from './stats';

export interface ExperienceGainResult {
  updatedPokemon: Pokemon;
  leveledUp: boolean;
  levelChanges?: { oldStats: BaseStats; newStats: BaseStats };
  learnedMoves: string[];
  evolutionCandidate?: { targetSpeciesId: string };
}

/**
 * 处理经验获取与升级
 */
export const gainExperience = (
  pokemon: Pokemon,
  amount: number
): ExperienceGainResult => {
  // 完整逻辑从 mechanics.ts 迁移
  // ... (省略具体实现，实际迁移时完整复制)
};
```

**文件: `shared/utils/evolution.ts`**
```typescript
import type { Pokemon } from '../types';
import { SPECIES_DATA, findSpeciesKeyByPokedexId } from '../constants';
import { calculateStats } from './stats';

/**
 * 检查是否可进化
 */
export const checkEvolution = (
  pokemon: Pokemon,
  leveledUp: boolean = true
): { targetSpeciesId: string } | undefined => {
  // 从 mechanics.ts 迁移
};

/**
 * 执行进化
 */
export const evolvePokemon = (
  pokemon: Pokemon,
  targetSpeciesKey: string
): Pokemon => {
  // 从 mechanics.ts 迁移
};
```

**文件: `shared/utils/pokemon-factory.ts`**
```typescript
import type { Pokemon, Move, BaseStats } from '../types';
import { SPECIES_DATA, MOVES } from '../constants';
import { calculateStats } from './stats';

/**
 * 创建宝可梦实例
 */
export const createPokemon = (
  speciesKey: string,
  level: number,
  moves: Move[] = [],
  customIvs?: Partial<BaseStats>
): Pokemon => {
  // 从 mechanics.ts 迁移，支持自定义 IV
};

/**
 * 生成随机 IV (0-31)
 */
export const generateRandomIvs = (): BaseStats => ({
  hp: Math.floor(Math.random() * 32),
  atk: Math.floor(Math.random() * 32),
  def: Math.floor(Math.random() * 32),
  spa: Math.floor(Math.random() * 32),
  spd: Math.floor(Math.random() * 32),
  spe: Math.floor(Math.random() * 32),
});
```

**文件: `shared/utils/index.ts`**
```typescript
export * from './stats';
export * from './damage';
export * from './experience';
export * from './evolution';
export * from './pokemon-factory';
```

### 4.6 Phase 6: 前端适配 (预计 45 分钟)

**更新 `src/types.ts`**:
```typescript
// 重新导出 shared 类型（保持向后兼容）
export * from '@shared/types';

// 前端特有类型
export type ViewState = 
  | 'ROAM' | 'BATTLE' | 'TEAM' | 'BAG' | 'PROFILE' 
  | 'DEX' | 'SUMMARY' | 'LOGIN' | 'REGISTER' | 'PC_BOX';

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
```

**更新 `src/constants.ts`**:
```typescript
// 重新导出 shared 常量
export * from '@shared/constants';

// 前端特有常量
import type { PokemonType } from '@shared/types';

export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  // ...
};
```

**更新 `src/lib/mechanics.ts`**:
```typescript
// 重新导出 shared 工具函数
export * from '@shared/utils';

// 如果有前端特有的封装，可以在这里添加
```

---

## 5. 验证清单

### 5.1 类型安全验证

- [ ] 所有 shared 模块 `npm run build` 无类型错误
- [ ] 前端项目 `npm run build` 无类型错误
- [ ] VS Code 智能提示正常工作

### 5.2 功能验证

- [ ] 游戏正常启动
- [ ] 战斗伤害计算正确
- [ ] 升级经验计算正确
- [ ] 进化流程正常
- [ ] 用户注册/登录正常

### 5.3 Schema 验证测试

创建测试文件 `tests/shared/schemas.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { PokemonSchema, UserCredentialsSchema } from '@shared/schemas';

describe('PokemonSchema', () => {
  it('should validate a valid Pokemon', () => {
    const validPokemon = {
      id: crypto.randomUUID(),
      speciesName: '皮卡丘',
      level: 25,
      // ... 完整数据
    };
    expect(() => PokemonSchema.parse(validPokemon)).not.toThrow();
  });

  it('should reject invalid level', () => {
    const invalidPokemon = {
      // ... level: 150 (超过100)
    };
    expect(() => PokemonSchema.parse(invalidPokemon)).toThrow();
  });
});

describe('UserCredentialsSchema', () => {
  it('should reject short password', () => {
    expect(() => UserCredentialsSchema.parse({
      username: 'test',
      password: '123', // 小于6字符
    })).toThrow();
  });
});
```

---

## 6. 风险与注意事项

### 6.1 潜在风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 循环依赖 | 编译失败 | 严格遵循依赖方向：types → constants → utils |
| 路径别名问题 | 导入失败 | 同时配置 tsconfig.json 和 vite.config.ts |
| 大文件拆分遗漏 | 运行时错误 | 迁移后立即运行完整测试 |

### 6.2 迁移顺序依赖

```
1. types/      (无依赖)
2. constants/  (依赖 types)
3. schemas/    (依赖 types)
4. utils/      (依赖 types + constants)
5. 前端适配    (依赖 shared/*)
```

### 6.3 向后兼容策略

在 `src/types.ts` 和 `src/constants.ts` 中重新导出 shared 内容，确保现有组件无需修改导入路径即可工作。

---

## 7. 执行时间估算

| Phase | 任务 | 预计时间 |
|-------|------|----------|
| 1 | 基础设施配置 | 30 分钟 |
| 2 | 类型迁移 | 45 分钟 |
| 3 | Schema 定义 | 60 分钟 |
| 4 | 常量迁移 | 30 分钟 |
| 5 | 工具函数迁移 | 60 分钟 |
| 6 | 前端适配 | 45 分钟 |
| 7 | 测试验证 | 30 分钟 |
| **总计** | | **约 5 小时** |

---

## 8. 后续扩展

### 8.1 后端集成准备

shared 层建立后，后端可以直接使用：

```typescript
// server/src/routes/auth.ts
import { LoginRequestSchema, LoginResponseSchema } from '@shared/schemas';
import type { User } from '@shared/types';

app.post('/api/login', async (req, res) => {
  const parsed = LoginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }
  // ...
});
```

### 8.2 Monorepo 演进（可选）

如果项目规模增长，可考虑使用 pnpm workspace 或 turborepo：

```
packages/
├── shared/        # @ky-pokemon/shared
├── frontend/      # @ky-pokemon/frontend
└── backend/       # @ky-pokemon/backend
```

---

## 附录：快速执行命令

```bash
# 1. 安装依赖
npm install zod

# 2. 创建目录
mkdir -p shared/{types,schemas,constants,utils}

# 3. 创建入口文件
touch shared/{types,schemas,constants,utils}/index.ts

# 4. 验证构建
npm run build
```
