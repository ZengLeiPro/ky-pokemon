// ============================================================
// 商店地图数据 - 12x10 经典室内商店布局
// ============================================================

import type { MapData } from '../types';

/**
 * 商店地图。
 *
 * 布局概览（12 列 x 10 行）：
 *
 *  行0: 墙壁顶部（全行）
 *  行1: 墙壁正面 | 药品货架 | 空 | 收银台 | 柜台(左中右) | 空 | 精灵球货架 | 墙壁正面
 *  行2: 地板，柜台正面对应位置有 shop-counter-front
 *  行3: 地板，中间区域开阔
 *  行4: 地板，左侧商品货架
 *  行5: 地板，右侧商品货架
 *  行6: 地板，开阔区域
 *  行7: 地板，地垫引导到门口
 *  行8: 地板，地垫下半
 *  行9: 墙壁底部，中间是门
 *
 * 列索引:  0   1   2   3   4   5   6   7   8   9  10  11
 */
export const shopMap: MapData = {
  id: 'shop',
  name: '道具商店',
  width: 12,
  height: 10,

  layers: {
    // --------------------------------------------------------
    // 地面层 - 全铺商店木质地板
    // --------------------------------------------------------
    ground: [
      // 行0
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行1
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行2
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行3
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行4
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行5
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行6
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行7
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行8
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
      // 行9
      ['shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor', 'shop-floor'],
    ],

    // --------------------------------------------------------
    // 物体层 - 墙壁、货架、柜台、收银台
    // --------------------------------------------------------
    objects: [
      // 行0: 墙壁顶部（货架/收银台位置用 -top 瓦片替代 wall-top，形成完整 2 格高物体）
      ['wall-top', 'shelf-potions-top', 'wall-top', 'cash-register-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'shelf-pokeballs-top', 'wall-top'],
      // 行1: 墙壁正面 + 货架 + 柜台 + 收银台
      //  列:  0            1                2     3                     4                     5                      6                     7      8      9        10                11
      ['wall-front', 'shelf-potions', null, 'cash-register', 'shop-counter-left', 'shop-counter-center', 'shop-counter-right', null, null, 'plant', 'shelf-pokeballs', 'wall-front'],
      // 行2: 柜台正面 + 地板
      [null, null, null, null, 'shop-counter-front', 'shop-counter-front', 'shop-counter-front', null, null, null, null, null],
      // 行3: 开阔地板
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行4: 开阔地板（悬浮货架已移除）
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行5: 地板
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行6: 开阔地板
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行7: 地垫上半
      [null, null, null, null, null, 'mat-top', 'mat-top', null, null, null, null, null],
      // 行8: 地垫下半
      [null, null, null, null, null, 'mat-bottom', 'mat-bottom', null, null, null, null, null],
      // 行9: 底部墙壁 + 门
      ['wall-front', 'wall-front', 'wall-front', 'wall-front', 'wall-front', 'door-left', 'door-right', 'wall-front', 'wall-front', 'wall-front', 'wall-front', 'wall-front'],
    ],

    // --------------------------------------------------------
    // 头顶层 - 留空
    // --------------------------------------------------------
    overhead: [
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // --------------------------------------------------------
  // 碰撞图 - true = 不可通行
  // --------------------------------------------------------
  collisionMap: [
    // 行0: 墙壁顶部，全部不可通行
    [true, true, true, true, true, true, true, true, true, true, true, true],
    // 行1: 墙壁正面 + 货架 + 柜台，店员站位 (5,1) 设为 false（NPC 碰撞由引擎处理）
    [true, true, false, true, true, false, true, false, false, true, true, true],
    // 行2: 柜台正面不可通行，其余可通行
    [false, false, false, false, true, true, true, false, false, false, false, false],
    // 行3: 开阔地板
    [false, false, false, false, false, false, false, false, false, false, false, false],
    // 行4: 开阔地板
    [false, false, false, false, false, false, false, false, false, false, false, false],
    // 行5: 地板
    [false, false, false, false, false, false, false, false, false, false, false, false],
    // 行6: 开阔地板
    [false, false, false, false, false, false, false, false, false, false, false, false],
    // 行7: 地垫可通行
    [false, false, false, false, false, false, false, false, false, false, false, false],
    // 行8: 地垫可通行
    [false, false, false, false, false, false, false, false, false, false, false, false],
    // 行9: 底部墙壁不可通行，门可通行
    [true, true, true, true, true, false, false, true, true, true, true, true],
  ],

  // --------------------------------------------------------
  // 出生点
  // --------------------------------------------------------
  spawns: {
    /** 默认出生点 - 地图中央 */
    default: { x: 5, y: 5 },
    /** 入口出生点 - 门口内侧 */
    entrance: { x: 5, y: 8 },
  },

  // --------------------------------------------------------
  // NPC
  // --------------------------------------------------------
  npcs: [
    {
      id: 'shopkeeper',
      name: '店员',
      position: { x: 5, y: 1 },
      direction: 'down',
      spriteId: 'shopkeeper',
      dialog: [
        '欢迎光临道具商店!',
        '我们这里有各种药品和精灵球哦!',
        '请到柜台前选购吧!',
      ],
      onInteract: 'open-shop',
    },
  ],

  // --------------------------------------------------------
  // 交互区域
  // --------------------------------------------------------
  interactions: [
    // 门口传送 - 左半
    {
      id: 'exit-door-left',
      position: { x: 5, y: 9 },
      type: 'warp',
      targetScene: 'outside',
      targetSpawn: 'shop-door',
    },
    // 门口传送 - 右半
    {
      id: 'exit-door-right',
      position: { x: 6, y: 9 },
      type: 'warp',
      targetScene: 'outside',
      targetSpawn: 'shop-door',
    },
    // 柜台正面交互 - 购物
    {
      id: 'counter-shop-left',
      position: { x: 4, y: 2 },
      type: 'item',
      message: '欢迎光临! 请问需要什么道具呢?',
      onInteract: 'open-shop',
    },
    {
      id: 'counter-shop-center',
      position: { x: 5, y: 2 },
      type: 'item',
      message: '欢迎光临! 请问需要什么道具呢?',
      onInteract: 'open-shop',
    },
    {
      id: 'counter-shop-right',
      position: { x: 6, y: 2 },
      type: 'item',
      message: '欢迎光临! 请问需要什么道具呢?',
      onInteract: 'open-shop',
    },
  ],
};
