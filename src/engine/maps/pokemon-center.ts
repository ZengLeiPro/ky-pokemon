// ============================================================
// 宝可梦中心地图数据 - 12x10 经典室内布局
// ============================================================

import type { MapData } from '../types';

/**
 * 宝可梦中心地图。
 *
 * 布局概览（12 列 x 10 行）：
 *
 *  行0: 墙壁顶部（全行）
 *  行1: 墙壁正面 | 书架 | 空 | 治愈机器 | 柜台(左中右) | 空 | 植物 | 墙壁正面
 *  行2: 地板，柜台正面对应位置有 counter-front
 *  行3: 地板，中间区域开阔
 *  行4: 地板，PC 终端在左侧墙边
 *  行5: 地板，长椅在右侧区域
 *  行6: 地板，开阔区域
 *  行7: 地板，地垫引导到门口
 *  行8: 地板，地垫下半
 *  行9: 墙壁底部，中间是门
 *
 * 列索引:  0   1   2   3   4   5   6   7   8   9  10  11
 */
export const pokemonCenterMap: MapData = {
  id: 'pokemon-center',
  name: '宝可梦中心',
  width: 12,
  height: 10,

  layers: {
    // --------------------------------------------------------
    // 地面层 - 全铺地板
    // --------------------------------------------------------
    ground: [
      // 行0
      ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
      // 行1
      ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
      // 行2
      ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
      // 行3
      ['floor', 'floor', 'floor', 'floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor', 'floor', 'floor', 'floor'],
      // 行4
      ['floor', 'floor', 'floor', 'floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor', 'floor', 'floor', 'floor'],
      // 行5
      ['floor', 'floor', 'floor', 'floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor', 'floor', 'floor', 'floor'],
      // 行6
      ['floor', 'floor', 'floor', 'floor', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor-pattern', 'floor', 'floor', 'floor', 'floor'],
      // 行7
      ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
      // 行8
      ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
      // 行9
      ['floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
    ],

    // --------------------------------------------------------
    // 物体层 - 墙壁、家具、设备
    // --------------------------------------------------------
    objects: [
      // 行0: 墙壁顶部
      ['wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top', 'wall-top'],
      // 行1: 墙壁正面 + 家具设备
      //  列:  0            1           2     3                  4               5                6               7      8      9        10          11
      ['wall-front', 'bookshelf', null, 'healing-machine', 'counter-left', 'counter-center', 'counter-right', null, null, 'plant', null, 'wall-front'],
      // 行2: 柜台正面 + 地板
      [null, null, null, null, 'counter-front', 'counter-front', 'counter-front', null, null, null, null, null],
      // 行3: 开阔地板
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行4: 左侧 PC 终端
      [null, 'pc-terminal', null, null, null, null, null, null, null, null, null, null],
      // 行5: 右侧长椅
      [null, null, null, null, null, null, null, null, null, 'bench-left', 'bench-right', null],
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
    // 头顶层 - 墙壁悬挑 / 装饰（大部分为空）
    // --------------------------------------------------------
    overhead: [
      // 行0
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行1
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行2
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行3
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行4
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行5
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行6
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行7
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行8
      [null, null, null, null, null, null, null, null, null, null, null, null],
      // 行9
      [null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // --------------------------------------------------------
  // 碰撞图 - true = 不可通行
  // --------------------------------------------------------
  collisionMap: [
    // 行0: 墙壁顶部，全部不可通行
    [true, true, true, true, true, true, true, true, true, true, true, true],
    // 行1: 墙壁正面 + 家具设备，全部不可通行（乔伊小姐站在 (5,1) 但 NPC 碰撞由引擎处理，此处设 false）
    [true, true, false, true, true, false, true, false, false, true, false, true],
    // 行2: 柜台正面不可通行，其余可通行
    [false, false, false, false, true, true, true, false, false, false, false, false],
    // 行3: 开阔地板
    [false, false, false, false, false, false, false, false, false, false, false, false],
    // 行4: PC 终端不可通行
    [false, true, false, false, false, false, false, false, false, false, false, false],
    // 行5: 长椅不可通行
    [false, false, false, false, false, false, false, false, false, true, true, false],
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
      id: 'nurse-joy',
      name: '乔伊小姐',
      position: { x: 5, y: 1 },
      direction: 'down',
      spriteId: 'nurse-joy',
      dialog: [
        '欢迎来到宝可梦中心!',
        '让我帮你的宝可梦恢复体力吧!',
        '...好了! 你的宝可梦已经完全恢复了!',
      ],
      onInteract: 'heal',
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
      targetSpawn: 'pokemon-center-door',
    },
    // 门口传送 - 右半
    {
      id: 'exit-door-right',
      position: { x: 6, y: 9 },
      type: 'warp',
      targetScene: 'outside',
      targetSpawn: 'pokemon-center-door',
    },
    // PC 终端交互
    {
      id: 'pc-terminal',
      position: { x: 1, y: 4 },
      type: 'item',
      message: '宝可梦存储系统已启动...',
      onInteract: 'open-pc',
    },
  ],
};
