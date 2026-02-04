// ============================================================
// 道馆地图数据 - 14x12 经典道馆布局
// ============================================================

import type { MapData } from '../types';

/**
 * 道馆地图。
 *
 * 布局概览（14 列 x 12 行）：
 *
 *  行0:  墙壁顶部（全行）
 *  行1:  墙壁正面 | 徽章展示台 x2 | 道馆馆主站位 | 徽章展示台 x2 | 墙壁正面
 *  行2:  道馆地板，馆主前方有 arena-marker
 *  行3:  道馆地板，两侧有柱子(pillar)
 *  行4:  道馆地板，开阔对战区域
 *  行5:  道馆地板，中间有 arena-marker 标记
 *  行6:  道馆地板，两侧有训练师NPC
 *  行7:  道馆地板，开阔通道
 *  行8:  道馆地板，两侧有柱子
 *  行9:  道馆地板，接近门口
 *  行10: 地垫区域
 *  行11: 墙壁底部，中间是门
 *
 * 列索引:  0   1   2   3   4   5   6   7   8   9  10  11  12  13
 */
export const gymMap: MapData = {
  id: 'gym',
  name: '道馆',
  width: 14,
  height: 12,

  layers: {
    // --------------------------------------------------------
    // 地面层 - 全铺道馆地板，中间通道用 gym-pattern 装饰
    // --------------------------------------------------------
    ground: [
      // 行0
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行1
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行2
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行3
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行4
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行5
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行6
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行7
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行8
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行9
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-pattern', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行10
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
      // 行11
      ['gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor', 'gym-floor'],
    ],

    // --------------------------------------------------------
    // 物体层 - 墙壁、柱子、徽章展示台、arena-marker
    // --------------------------------------------------------
    objects: [
      // 行0: 墙壁顶部
      ['wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top'],
      // 行1: 墙壁正面 + 徽章展示台 + 馆主站位
      //  列:  0              1              2                3                4              5              6       7              8              9               10              11             12             13
      ['wall-front', 'wall-front', 'wall-front', 'badge-display', 'badge-display', null, null, null, null, 'badge-display', 'badge-display', 'wall-front', 'wall-front', 'wall-front'],
      // 行2: 馆主前方 arena-marker
      [null, null, null, null, null, null, 'arena-marker', null, null, null, null, null, null, null],
      // 行3: 两侧柱子
      [null, null, 'pillar', null, null, null, null, null, null, null, null, 'pillar', null, null],
      // 行4: 开阔对战区域
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行5: 中间 arena-marker
      [null, null, null, null, null, null, 'arena-marker', null, null, null, null, null, null, null],
      // 行6: 训练师NPC站位（NPC 由引擎渲染，此处留空）
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行7: 开阔通道
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行8: 两侧柱子
      [null, null, 'pillar', null, null, null, null, null, null, null, null, 'pillar', null, null],
      // 行9: 接近门口
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行10: 地垫区域
      [null, null, null, null, null, 'mat-top', 'mat-top', 'mat-top', 'mat-top', null, null, null, null, null],
      // 行11: 底部墙壁 + 门
      ['wall-front', 'wall-front', 'wall-front', 'wall-front', 'wall-front', 'wall-front', 'door-left', 'door-right', 'wall-front', 'wall-front', 'wall-front', 'wall-front', 'wall-front', 'wall-front'],
    ],

    // --------------------------------------------------------
    // 头顶层 - 留空
    // --------------------------------------------------------
    overhead: [
      // 行0
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行1
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行2
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行3
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行4
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行5
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行6
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行7
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行8
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行9
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行10
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      // 行11
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // --------------------------------------------------------
  // 碰撞图 - true = 不可通行
  // --------------------------------------------------------
  collisionMap: [
    // 行0: 墙壁顶部，全部不可通行
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    // 行1: 墙壁正面 + 徽章展示台不可通行，馆主站位 false（NPC 碰撞由引擎处理）
    [true, true, true, true, true, false, false, false, false, true, true, true, true, true],
    // 行2: arena-marker 可通行
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    // 行3: 柱子不可通行
    [false, false, true, false, false, false, false, false, false, false, false, true, false, false],
    // 行4: 开阔区域
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    // 行5: arena-marker 可通行
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    // 行6: 训练师站位 false（NPC 碰撞由引擎处理）
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    // 行7: 开阔通道
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    // 行8: 柱子不可通行
    [false, false, true, false, false, false, false, false, false, false, false, true, false, false],
    // 行9: 接近门口
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    // 行10: 地垫可通行
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    // 行11: 底部墙壁不可通行，门可通行
    [true, true, true, true, true, true, false, false, true, true, true, true, true, true],
  ],

  // --------------------------------------------------------
  // 出生点
  // --------------------------------------------------------
  spawns: {
    /** 默认出生点 - 地图中央 */
    default: { x: 7, y: 5 },
    /** 入口出生点 - 门口内侧 */
    entrance: { x: 6, y: 10 },
    /** 馆主对战区域 - 馆主前方 */
    'boss-arena': { x: 7, y: 3 },
  },

  // --------------------------------------------------------
  // NPC
  // --------------------------------------------------------
  npcs: [
    {
      id: 'gym-leader',
      name: '道馆馆主',
      position: { x: 7, y: 1 },
      direction: 'down',
      spriteId: 'gym-leader',
      dialog: [
        '我是这个道馆的馆主!',
        '既然你来挑战，那就来一场堂堂正正的对决吧!',
        '准备好了吗？',
      ],
      onInteract: 'battle-leader',
    },
    {
      id: 'trainer-1',
      name: '道馆训练师',
      position: { x: 3, y: 6 },
      direction: 'right',
      spriteId: 'trainer-male',
      dialog: ['你想挑战馆主？先过我这关!'],
      onInteract: 'battle-trainer',
    },
    {
      id: 'trainer-2',
      name: '道馆训练师',
      position: { x: 10, y: 6 },
      direction: 'left',
      spriteId: 'trainer-female',
      dialog: ['不要小看我!', '我可是道馆训练师!'],
      onInteract: 'battle-trainer',
    },
  ],

  // --------------------------------------------------------
  // 交互区域
  // --------------------------------------------------------
  interactions: [
    // 门口传送 - 左半
    {
      id: 'exit-door-left',
      position: { x: 6, y: 11 },
      type: 'warp',
      targetScene: 'outside',
      targetSpawn: 'gym-door',
    },
    // 门口传送 - 右半
    {
      id: 'exit-door-right',
      position: { x: 7, y: 11 },
      type: 'warp',
      targetScene: 'outside',
      targetSpawn: 'gym-door',
    },
  ],
};
