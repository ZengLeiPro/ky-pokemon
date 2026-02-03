# 关都传说：掌上对决 (Kanto Legends)

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

这是一个基于 **React 19** + **Zustand** 开发的现代化宝可梦 RPG 网页游戏。项目包含前端游戏引擎（浏览器本地存档）以及可选的 Node.js 服务端（登录/云存档/好友/聊天/交换/PvP 等社交功能）。

## 🎮 核心玩法

- **硬核战斗系统**: 
  - 完整还原 Gen 3+ 伤害计算公式（基于种族值、个体值 IVs、努力值 EVs）
  - 严谨的回合制逻辑与属性克制系统
  - 包含暴击、STAB（属性一致加成）、随机浮动等深度机制
- **深度养成体验**:
  - **动态成长**: 击败敌人获得经验，基于三次函数曲线升级
  - **招式习得**: 升级自动领悟新技能，支持经典的"遗忘旧招式"机制
  - **进化形态**: 达到特定等级触发进化，属性与种族值实时变更
- **无缝探索**:
  - 沉浸式关都地区地图漫游（真新镇、常磐市等）
  - 随机暗雷遇敌与捕获系统
  - 实时背包管理与道具使用（伤药、精灵球等）

## 🏗️ 技术架构

本项目不仅仅是一个网页，更是一个运行在浏览器中的即时演算 RPG 引擎。

### 1. 核心技术栈
- **UI 框架**: React 19 (Hooks, Functional Components)
- **开发语言**: TypeScript 5.8 (全链路强类型约束)
- **构建工具**: Vite 6 (极速 HMR 与构建)
- **状态管理**: Zustand + Immer (不可变数据流)
- **持久化**: IndexedDB (idb)
- **样式方案**: Tailwind CSS (定制化 GameBoy 主题色板)

### 2. 架构设计亮点
- **单一数据源 (Single Source of Truth)**: 
  - 整个游戏世界（玩家、队伍、战斗状态）存储在单一的 Zustand Store 中。
  - UI 只是状态的纯映射，不持有复杂的局部逻辑。
- **逻辑与视图分离**:
  - 核心游戏逻辑（伤害计算、升级判定、进化链）封装在 `src/lib/mechanics.ts`，作为纯函数运行，与 React 组件完全解耦。
- **企业级持久化方案**:
  - 摒弃了简单的 LocalStorage，采用 **IndexedDB** 存储结构化游戏数据。
  - 配合 Zustand 中间件实现状态自动序列化，保障数据安全且无容量焦虑。
- **类型驱动开发**:
  - 针对宝可梦复杂的种族值、属性、招式数据结构建立了严格的 TS 类型定义，确保数值计算的绝对准确。

## 🚀 快速开始

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **启动开发环境（前端 + 服务端）**:
   ```bash
   npm run dev
   ```

> 服务端依赖与数据库：
> - `cd server && npm install`
> - 本地 PostgreSQL 可用 `docker compose -f server/docker-compose.yml up -d`
> - 服务端环境变量见 `server/.env`（生产环境务必修改 `JWT_SECRET`）

3. **构建生产版本**:
   ```bash
   npm run build
   ```

## 🗺️ 目录结构

```
src/
├── components/     # 视图层
│   ├── stages/     # 游戏核心场景 (BattleStage, RoamStage 等)
│   ├── ui/         # 通用 UI 组件 (HPBar, TypeBadge)
│   └── ...
├── stores/         # 状态层 (Zustand Store)
├── lib/            # 逻辑核心 (mechanics.ts 伤害公式, storage.ts 数据库封装)
├── constants.ts    # 静态数据库 (种族值表, 招式表, 属性克制表)
└── types.ts        # 类型定义
```

## ⚠️ 说明

- 单机游戏体验可仅运行前端（存档在浏览器 **IndexedDB**），清理浏览器缓存或数据可能会导致进度丢失。
- 若要使用登录/云存档/好友/聊天/交换/PvP 等功能，需要同时启动 `server/`。
