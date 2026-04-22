// ============================================================
// 真新镇地图 - 18×15 户外场景（火红叶绿风格）
// ============================================================
//
// 布局概览：
//
//     0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
//  0  T  T  T  P  P  P  T  T  T  T  T  T  T  T  T  T  T  T   ← 北出口（通向 1 号道路）
//  1  T  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  T
//  2  T  .  .  R  R  R  .  .  .  .  .  .  R  R  R  .  .  T   ← 主角家屋顶上 / 小茂家屋顶上
//  3  T  .  .  R  R  R  .  .  .  .  .  .  R  R  R  .  .  T   ← 屋顶下（窗户）
//  4  T  .  .  W  D  W  .  .  .  .  .  .  W  D  W  .  .  T   ← 墙+门
//  5  T  .  .  P  P  P  .  .  .  .  .  .  P  P  P  .  .  T   ← 门前路
//  6  T  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  T
//  7  T  .  .  .  .  L  L  L  L  L  .  .  .  .  .  .  .  T   ← 研究所屋顶上
//  8  T  .  .  S  .  L  L  L  L  L  .  .  .  .  .  .  .  T   ← 屋顶下（招牌） + 路牌
//  9  T  .  .  .  .  L  L  D  L  L  .  .  .  .  .  .  .  T   ← 墙+门（门在 col 7）
// 10  T  .  .  .  .  P  P  P  P  P  .  .  .  .  .  .  .  T   ← 研究所门前路
// 11  T  f  .  .  .  .  .  .  .  .  .  .  .  .  .  .  f  T   ← 花
// 12  T  .  f  .  .  .  .  .  .  .  .  .  .  .  .  f  .  T
// 13  T  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  T   ← 沙滩
// 14  T  W  W  W  W  W  W  W  W  W  W  W  W  W  W  W  W  T   ← 水
//
// T = 树, R = 屋顶, W = 墙, D = 门, P = 路, L = 研究所部件, S = 路牌
// f = 花, ~ = 沙滩, W(row14) = 水, . = 草地
// ============================================================

import type { MapData } from '../types';

const G = 'pt-grass';   // 草地（所有 null ground 的默认填充）
const T = 'pt-tree';    // 树
const P = 'pt-path';    // 土路
const S = 'pt-sand';    // 沙滩
const WA = 'pt-water';  // 水

// 为了方便，声明地图 tile 的快捷别名（仅限本文件）
const FR = 'pt-flower-red';
const FY = 'pt-flower-yellow';
const SG = 'pt-sign';

// 主角家（红顶）
const HR_TL = 'home-roof-tl', HR_TM = 'home-roof-tm', HR_TR = 'home-roof-tr';
const HR_BL = 'home-roof-bl', HR_BM = 'home-roof-bm', HR_BR = 'home-roof-br';
const HW_L = 'home-wall-l', HW_D = 'home-door', HW_R = 'home-wall-r';

// 小茂家（绿顶）
const RR_TL = 'rival-roof-tl', RR_TM = 'rival-roof-tm', RR_TR = 'rival-roof-tr';
const RR_BL = 'rival-roof-bl', RR_BM = 'rival-roof-bm', RR_BR = 'rival-roof-br';
const RW_L = 'rival-wall-l', RW_D = 'rival-door', RW_R = 'rival-wall-r';

// 奥希德研究所
const LR_L = 'lab-roof-l', LR_ML = 'lab-roof-ml', LR_M = 'lab-roof-m';
const LR_MR = 'lab-roof-mr', LR_R = 'lab-roof-r';
const LR_BL = 'lab-roof-bl', LR_BML = 'lab-roof-bml', LR_BM = 'lab-roof-bm';
const LR_BMR = 'lab-roof-bmr', LR_BR = 'lab-roof-br';
const LW_L = 'lab-wall-l', LW_ML = 'lab-wall-ml', LW_D = 'lab-door';
const LW_MR = 'lab-wall-mr', LW_R = 'lab-wall-r';

const _ = null; // objects/overhead 层的空位

/** 18 列 × 15 行 */
export const palletTownMap: MapData = {
  id: 'pallet-town',
  name: '真新镇',
  width: 18,
  height: 15,

  layers: {
    // ----------------------------------------------------
    // 地面层 - 草地 / 路 / 沙滩 / 水
    // ----------------------------------------------------
    ground: [
      // row 0 - 顶边：两侧树下也铺草，中间 3 格是通往 1 号道路的土路
      [G, G, G, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G],
      // row 1
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      // row 2~4 草地（屋顶/墙会盖在 objects 层上）
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      // row 5 - 两家门前土路（同行其余草地）
      [G, G, G, P, P, P, G, G, G, G, G, G, P, P, P, G, G, G],
      // row 6
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      // row 7~9 研究所区域草地
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      // row 10 - 研究所门前土路
      [G, G, G, G, G, P, P, P, P, P, G, G, G, G, G, G, G, G],
      // row 11~12 草地带花
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
      // row 13 沙滩
      [G, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, G],
      // row 14 海
      [G, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, WA, G],
    ],

    // ----------------------------------------------------
    // 物体层 - 树、房屋、路牌、花等
    // ----------------------------------------------------
    objects: [
      // row 0 - 顶边树墙（除中间 3 格出口外全是树）
      [T, T, T, _, _, _, T, T, T, T, T, T, T, T, T, T, T, T],
      // row 1
      [T, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, T],
      // row 2 - 房屋屋顶顶行
      [T, _, _, HR_TL, HR_TM, HR_TR, _, _, _, _, _, _, RR_TL, RR_TM, RR_TR, _, _, T],
      // row 3 - 房屋屋顶底行（带窗）
      [T, _, _, HR_BL, HR_BM, HR_BR, _, _, _, _, _, _, RR_BL, RR_BM, RR_BR, _, _, T],
      // row 4 - 墙+门
      [T, _, _, HW_L, HW_D, HW_R, _, _, _, _, _, _, RW_L, RW_D, RW_R, _, _, T],
      // row 5 - 门前土路（空 objects）
      [T, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, T],
      // row 6
      [T, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, T],
      // row 7 - 研究所屋顶顶行
      [T, _, _, _, _, LR_L, LR_ML, LR_M, LR_MR, LR_R, _, _, _, _, _, _, _, T],
      // row 8 - 研究所屋顶底行 + 路牌
      [T, _, _, SG, _, LR_BL, LR_BML, LR_BM, LR_BMR, LR_BR, _, _, _, _, _, _, _, T],
      // row 9 - 研究所墙+门
      [T, _, _, _, _, LW_L, LW_ML, LW_D, LW_MR, LW_R, _, _, _, _, _, _, _, T],
      // row 10 - 门前土路
      [T, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, T],
      // row 11 - 花
      [T, FR, _, _, _, _, _, _, _, _, _, _, _, _, _, _, FY, T],
      // row 12 - 花
      [T, _, FY, _, _, _, _, _, _, _, _, _, _, _, _, FR, _, T],
      // row 13 - 沙滩无物体
      [T, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, T],
      // row 14 - 水（水的碰撞由 collisionMap 管，不需额外 object）
      [T, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, T],
    ],

    // ----------------------------------------------------
    // 头顶层 - 暂时全空（树冠阴影可后续用）
    // ----------------------------------------------------
    overhead: Array.from({ length: 15 }, () => Array(18).fill(null)),
  },

  // ----------------------------------------------------
  // 碰撞图 - true = 不可通行
  // ----------------------------------------------------
  collisionMap: [
    // row 0 - 树墙 + 中间 3 格出口可通行
    [true, true, true, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true],
    // row 1
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    // row 2 - 主角家 + 小茂家屋顶
    [true, false, false, true, true, true, false, false, false, false, false, false, true, true, true, false, false, true],
    // row 3
    [true, false, false, true, true, true, false, false, false, false, false, false, true, true, true, false, false, true],
    // row 4 - 墙+门（门碰撞：关着的）
    [true, false, false, true, true, true, false, false, false, false, false, false, true, true, true, false, false, true],
    // row 5 - 门前路
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    // row 6
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    // row 7 - 研究所屋顶
    [true, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, true],
    // row 8 - 屋顶底 + 路牌
    [true, false, false, true, false, true, true, true, true, true, false, false, false, false, false, false, false, true],
    // row 9 - 墙+门
    [true, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, true],
    // row 10 - 门前路
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    // row 11 - 花（可踩）
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    // row 12
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    // row 13 - 沙滩可通行
    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
    // row 14 - 水不可通行
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  ],

  // ----------------------------------------------------
  // 出生点
  // ----------------------------------------------------
  spawns: {
    /** 默认：玩家从 ROAM 进入时站在研究所门前 */
    default: { x: 7, y: 10 },
    /** 主角家门前 */
    'home-door': { x: 4, y: 5 },
    /** 小茂家门前 */
    'rival-door': { x: 13, y: 5 },
    /** 研究所门前 */
    'lab-door': { x: 7, y: 10 },
    /** 北边出口（1 号道路入口）内侧 */
    'north-gate': { x: 4, y: 1 },
  },

  // ----------------------------------------------------
  // NPC（第一版先不放，空列表）
  // ----------------------------------------------------
  npcs: [],

  // ----------------------------------------------------
  // 交互区域
  // ----------------------------------------------------
  interactions: [
    // 北边出口 - 踩上三格任何一格都退出到 ROAM 菜单
    // 使用 warp 但 targetScene 为占位值，Scene 组件会把任何 warp 都当作"退出"
    { id: 'north-gate-1', position: { x: 3, y: 0 }, type: 'warp', targetScene: 'exit', targetSpawn: 'default' },
    { id: 'north-gate-2', position: { x: 4, y: 0 }, type: 'warp', targetScene: 'exit', targetSpawn: 'default' },
    { id: 'north-gate-3', position: { x: 5, y: 0 }, type: 'warp', targetScene: 'exit', targetSpawn: 'default' },

    // 主角家门（按交互键触发对话）
    {
      id: 'home-door',
      position: { x: 4, y: 4 },
      type: 'door',
      message: '妈妈说：「出门走走吧！家里的事我来照看！」（还不能进家里哦）',
    },

    // 小茂家门
    {
      id: 'rival-door',
      position: { x: 13, y: 4 },
      type: 'door',
      message: '门口贴着小茂写的字条：「我去当训练家了，别来烦我！」（还不能进去）',
    },

    // 研究所门
    {
      id: 'lab-door',
      position: { x: 7, y: 9 },
      type: 'door',
      message: '研究所大门紧闭。奥希德博士好像在忙。（房间内部敬请期待）',
    },

    // 路牌
    {
      id: 'town-sign',
      position: { x: 3, y: 8 },
      type: 'sign',
      message: '真新镇 PALLET TOWN —— 一切从纯白开始。',
    },
  ],
};
