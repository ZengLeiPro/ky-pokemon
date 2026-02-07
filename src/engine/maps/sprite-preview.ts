// ============================================================
// 精灵预览地图 - 10x8 开阔草地，用于测试角色外观
// ============================================================

import type { MapData } from '../types';

const W = 10;
const H = 8;

const row = (tile: string | null) => Array(W).fill(tile);
const nullRow = () => Array(W).fill(null);

export const spritePreviewMap: MapData = {
  id: 'sprite-preview',
  name: '精灵预览',
  width: W,
  height: H,

  layers: {
    ground: Array(H).fill(null).map(() => row('gym-floor')),
    objects: [
      // 行0: 上墙
      row('wall-top'),
      // 行1: 墙正面
      row('wall-front'),
      // 行2-6: 开放区域
      nullRow(),
      nullRow(),
      nullRow(),
      nullRow(),
      nullRow(),
      // 行7: 下墙
      row('wall-front'),
    ],
    overhead: Array(H).fill(null).map(() => nullRow()),
  },

  collisionMap: [
    // 行0: 上墙不可通行
    Array(W).fill(true),
    // 行1: 墙正面不可通行
    Array(W).fill(true),
    // 行2-6: 开放
    Array(W).fill(false),
    Array(W).fill(false),
    Array(W).fill(false),
    Array(W).fill(false),
    Array(W).fill(false),
    // 行7: 下墙不可通行
    Array(W).fill(true),
  ],

  spawns: {
    default: { x: 5, y: 4 },
  },

  npcs: [],

  interactions: [],
};
