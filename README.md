# 关都传说：掌上对决 (Kanto Legends)

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

这是一个基于 React 19 + Zustand 开发的宝可梦网页游戏。项目完全运行在浏览器端，无需后端服务。

## 🎮 游戏特色

- **完整战斗系统**: 
  - 回合制战斗逻辑
  - 属性克制系统 (火克草, 水克火等)
  - 伤害计算公式 (基于种族值、等级、招式威力)
  - 暴击与属性加成提示
- **RPG 养成要素**:
  - **等级系统**: 击败野生宝可梦获得经验值并升级
  - **招式学习**: 升级后自动领悟新招式（满4招自动替换旧招式）
  - **进化系统**: 达到特定等级自动进化（如 小火龙 Lv.16 -> 火恐龙）
  - **自动存档**: 游戏进度实时保存到浏览器本地
- **探索与收集**:
  - 关都地区地图移动 (真新镇、1号道路、常磐市等)
  - 随机遇敌机制
  - 捕捉野生宝可梦并扩充队伍

## 🛠️ 技术栈

- **Core**: React 19, TypeScript
- **Build**: Vite 6
- **State Management**: Zustand + Immer
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 🚀 快速开始

1. 安装依赖:
   ```bash
   npm install
   ```

2. 启动开发服务器:
   ```bash
   npm run dev
   ```

3. 构建生产版本:
   ```bash
   npm run build
   ```

## 🗺️ 目录结构

```
src/
├── components/     # UI 组件 (战斗场景, 控制板, 菜单等)
├── stores/         # 全局状态管理 (Zustand)
├── lib/            # 核心游戏逻辑 (伤害计算, 升级, 进化)
├── types.ts        # TypeScript 类型定义
└── constants.ts    # 静态数据 (宝可梦种族值, 招式数据, 地图信息)
```

## ⚠️ 注意事项

- 本项目为**纯前端应用**，后续会改造为全栈。
- 当前游戏数据（存档）存储在浏览器的 LocalStorage 中，清理缓存会丢失进度。
