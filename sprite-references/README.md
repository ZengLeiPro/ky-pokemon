# 素材方案 - 最终选定

## 选定方案概览

基于项目需求（非商用、中型完整游戏、风格统一优先），选定以下素材组合：

| 用途 | 素材源 | 数量 | 许可证 |
|------|--------|------|--------|
| NPC/角色行走 | Tuxemon | 207 个精灵表 (~68种+色彩变体) | CC-BY-SA |
| 地图图块 | Tuxemon | 75 套图块集 (16x16) | CC-BY-SA |
| 原创怪物 (战斗) | Tuxemon | 413 种 (64x64 正面+背面) | CC-BY-SA |
| 官方宝可梦 (战斗) | PokeAPI Gen III | 156 种 (64x64 正面+背面) | Fan use |
| 官方宝可梦 (动画) | PokeAPI Showdown | 386 种 (GIF 动画) | Fan use |
| 道具图标 | Tuxemon | 177 种 | CC-BY-SA |
| 静态物体 | Tuxemon | 23 种 | CC-BY-SA |

**Tuxemon 作为主力的核心理由**：所有素材由同一项目设计，风格天然统一协调。

---

## 目录结构

```
sprite-references/
├── README.md                          # 本文件
├── tuxemon/
│   ├── npcs/                          # 207 个 NPC 行走精灵表
│   │   ├── adventurer.png             # 冒险者 (含 5 种色彩变体)
│   │   ├── nurse.png                  # 护士 (可替代现有 nurse-joy)
│   │   ├── shopkeeper.png             # 店员 (可替代现有 shopkeeper)
│   │   ├── heroine.png                # 女主角 (可替代 trainer-female)
│   │   ├── girl1.png                  # 女孩
│   │   ├── boss.png                   # Boss (可替代 gym-leader)
│   │   └── ...                        # 更多角色
│   ├── monsters/                      # 413 个怪物战斗精灵表
│   │   ├── agnite-sheet.png           # 火属性恐龙
│   │   ├── bamboon-sheet.png          # 猴子怪物
│   │   ├── drokoro-sheet.png          # 紫色龙
│   │   ├── anu-sheet.png              # 狐狸
│   │   └── ...                        # 更多怪物
│   ├── tilesets/                      # 75 个图块集 PNG + 16 个 TSX 定义
│   │   ├── core_outdoor.png           # 核心室外图块 (592x1200, ~2775 图块)
│   │   ├── core_indoor_floors.png     # 室内地板
│   │   ├── core_indoor_walls.png      # 室内墙壁
│   │   ├── core_buildings.png         # 建筑物
│   │   ├── core_outdoor_nature.png    # 自然地形
│   │   ├── core_outdoor_water.png     # 水面
│   │   └── ...                        # 更多图块
│   ├── items/                         # 177 个道具图标
│   │   ├── potion.png
│   │   └── ...
│   └── objects/                       # 23 个静态物体精灵
│       └── ...
├── pokeapi/
│   ├── gen3-front/                    # 156 个 Gen III 正面精灵 (64x64)
│   │   ├── 1.png                      # 妙蛙种子
│   │   ├── 25.png                     # 皮卡丘
│   │   ├── 6.png                      # 喷火龙
│   │   ├── 150.png                    # 超梦
│   │   └── ...
│   ├── gen3-back/                     # 156 个 Gen III 背面精灵 (64x64)
│   │   └── ...
│   └── showdown-animated/             # 386 个 Showdown 动画精灵 (GIF)
│       └── ...
```

---

## 精灵技术规格

### Tuxemon NPC 行走精灵表

```
文件尺寸: 48 x 128 像素
单帧尺寸: 16 x 32 像素 (宽 x 高)
布局: 3 列 x 4 行 = 12 帧

     列 0        列 1        列 2
   (行走1)     (站立)      (行走2)
   +----------+----------+----------+
行0| 下-走1    | 下-站立   | 下-走2   |  朝下 (front/down)
   +----------+----------+----------+
行1| 左-走1    | 左-站立   | 左-走2   |  朝左 (left)
   +----------+----------+----------+
行2| 右-走1    | 右-站立   | 右-走2   |  朝右 (right)
   +----------+----------+----------+
行3| 上-走1    | 上-站立   | 上-走2   |  朝上 (back/up)
   +----------+----------+----------+

行走动画循环: 站立 -> 走1 -> 站立 -> 走2
```

**与现有系统对比**:
- 现有: 4方向 x 3帧 (帧0=静止, 帧1=左脚, 帧2=右脚)
- Tuxemon: 4方向 x 3帧 (列1=站立, 列0=走1, 列2=走2)
- 结论: 完全匹配，只需调整帧索引映射

### Tuxemon 怪物战斗精灵表

```
文件尺寸: 128 x 88 像素
布局:
+--------------------+--------------------+
|    背面 (Back)      |    正面 (Front)     |   上方 64x64
|     64 x 64        |     64 x 64        |
+----------+---------+----------+---------+
| 菜单图标1 | 菜单图标2|                     |   下方 24x24
| 24x24    | 24x24   |                     |
+----------+---------+--------------------+

front_rect: (64, 0, 64, 64)  -- 右上角
back_rect:  (0, 0, 64, 64)   -- 左上角
menu1_rect: (0, 64, 24, 24)  -- 左下
menu2_rect: (24, 64, 24, 24) -- 左下偏右
```

### PokeAPI Gen III 精灵

```
格式: PNG, 透明背景
尺寸: 64x64 像素
内容: 每个文件一只宝可梦，按图鉴编号命名 (1.png ~ 386.png)
gen3-front/: 正面战斗形态
gen3-back/:  背面战斗形态 (己方视角)
```

### 图块集

```
格式: PNG
单图块: 16x16 像素
核心图块集:
  - core_outdoor.png       (592x1200) -- 室外地形、道路、植被
  - core_outdoor_nature.png           -- 自然地形补充
  - core_outdoor_water.png            -- 水面/河流
  - core_buildings.png                -- 建筑物外观
  - core_indoor_floors.png            -- 室内地板
  - core_indoor_walls.png             -- 室内墙壁
  - core_indoor_stairs.png            -- 楼梯
  - core_set pieces.png               -- 家具/设备
TSX 文件: Tiled 编辑器兼容的图块定义 (含碰撞/交互属性)
```

---

## 现有 NPC 到 Tuxemon 精灵的映射建议

| 现有 NPC (SVG) | 建议替换为 Tuxemon 精灵 | 文件名 |
|---------------|----------------------|--------|
| nurse-joy (乔伊小姐) | nurse | `nurse.png` |
| shopkeeper (商店店员) | shopkeeper | `shopkeeper.png` |
| gym-leader (道馆馆主) | boss | `boss.png` / `boss_*.png` |
| trainer-male (男训练师) | adventurer | `adventurer.png` |
| trainer-female (女训练师) | heroine | `heroine.png` |
| old-man (老人) | oldman / gramps | 需确认具体文件名 |
| 主角 (玩家) | adventurer / heroine / girl1 | 可多套方案 |

---

## 主角方案建议

Tuxemon 中适合作为主角的精灵:

| 精灵 | 风格 | 适合性 |
|------|------|--------|
| `adventurer.png` | 男性冒险者，蓝衣 | 经典男主角 |
| `heroine.png` | 女性英雄，金发蓝衣 | 经典女主角 |
| `girl1.png` | 女孩，棕发绿衣 | 清新女主角 |
| `catgirl.png` | 猫耳女孩 | 特色角色 |

每个精灵都有多种颜色变体（如 `adventurer_red.png`, `adventurer_green.png` 等），
可以让玩家选择配色。

---

## 技术适配要点

将项目从 SVG 渲染切换到 PNG 精灵表，需要修改以下模块:

### 1. 精灵表加载器 (新增)
```
需要实现:
- 加载 PNG 精灵表
- 按照上述布局裁剪为单帧
- 缓存已裁剪的帧图像
```

### 2. 渲染组件修改
```
PlayerSprite.tsx  -- 从 SVG 渲染改为 spritesheet 帧渲染
NPCSprite.tsx     -- 同上
tiles.tsx         -- 从 SVG 渲染改为 tileset 图块渲染
```

### 3. 缩放适配
```
素材原始: 16x16 (图块), 16x32 (NPC)
项目 TILE_SIZE: 48px
缩放倍率: 3x
渲染方式: CSS image-rendering: pixelated + transform: scale(3)
或 Canvas: context.imageSmoothingEnabled = false
```

### 4. 动画帧映射
```
现有帧序列:  [0=静止, 1=左脚, 2=右脚]
Tuxemon 列:  [0=走1, 1=站立, 2=走2]
映射关系:    现有帧0 -> 列1, 现有帧1 -> 列0, 现有帧2 -> 列2
```

---

## 许可证汇总

| 素材源 | 许可证 | 要求 |
|--------|--------|------|
| Tuxemon | CC-BY-SA 3.0/4.0 | 署名 + 相同方式共享 |
| PokeAPI sprites | CC0 (仓库) / The Pokemon Company (图片) | 非商用 fan game |
| Showdown sprites | Smogon 社区创作 | 非商用 |

本项目为非商用项目，以上所有素材均可合法使用。
如项目发布，需在致谢中包含:
- Tuxemon 项目: https://github.com/Tuxemon/Tuxemon
- PokeAPI: https://github.com/PokeAPI/sprites
- Smogon / Pokemon Showdown 社区
