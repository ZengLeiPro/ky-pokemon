/**
 * PNG Spritesheet 渲染工具
 *
 * Tuxemon NPC 精灵表格式:
 * - 尺寸: 48x128 像素
 * - 布局: 3列 x 4行, 每帧 16x32 像素
 * - 行: 0=下, 1=左, 2=右, 3=上
 * - 列: 0=走1, 1=站立, 2=走2
 *
 * Tuxemon 怪物精灵表格式:
 * - 尺寸: 128x88 像素
 * - 布局: 左=背面(64x64), 右=正面(64x64), 下方=菜单图标(24x24 x2)
 */

import type { JSX } from 'react';
import { Direction } from '../types';

// 方向到精灵表行的映射
const DIRECTION_TO_ROW: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

// 动画帧到精灵表列的映射
// 现有系统: 0=静止, 1=左脚, 2=右脚
// Tuxemon:  0=走1, 1=站立, 2=走2
const FRAME_TO_COL: Record<number, number> = {
  0: 1, // 静止 → 站立(列1)
  1: 0, // 左脚 → 走1(列0)
  2: 2, // 右脚 → 走2(列2)
};

// NPC 精灵表原始帧尺寸
const NPC_FRAME_WIDTH = 16;
const NPC_FRAME_HEIGHT = 32;
const NPC_SHEET_COLS = 3;
const NPC_SHEET_ROWS = 4;

/**
 * 渲染 NPC 风格的行走精灵帧
 * 适用于玩家角色和 NPC（都使用 Tuxemon 48x128 精灵表）
 */
export function renderSpriteFrame(
  spriteUrl: string,
  direction: Direction,
  frame: number,
  tileSize: number
): JSX.Element {
  const row = DIRECTION_TO_ROW[direction];
  const col = FRAME_TO_COL[frame] ?? 1;
  const scale = tileSize / NPC_FRAME_WIDTH; // 48/16 = 3

  return (
    <div
      style={{
        width: tileSize,
        height: tileSize * 2,
        backgroundImage: `url(${spriteUrl})`,
        backgroundPosition: `-${col * NPC_FRAME_WIDTH * scale}px -${row * NPC_FRAME_HEIGHT * scale}px`,
        backgroundSize: `${NPC_SHEET_COLS * NPC_FRAME_WIDTH * scale}px ${NPC_SHEET_ROWS * NPC_FRAME_HEIGHT * scale}px`,
        imageRendering: 'pixelated' as const,
      }}
    />
  );
}

/**
 * 渲染怪物战斗精灵
 * Tuxemon 怪物精灵表: 128x88, 左=背面(64x64), 右=正面(64x64)
 */
export function renderMonsterSprite(
  spriteUrl: string,
  facing: 'front' | 'back',
  size: number
): JSX.Element {
  const scale = size / 64;
  const offsetX = facing === 'front' ? 64 * scale : 0;

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${spriteUrl})`,
        backgroundPosition: `-${offsetX}px 0px`,
        backgroundSize: `${128 * scale}px ${88 * scale}px`,
        imageRendering: 'pixelated' as const,
      }}
    />
  );
}

/**
 * 渲染图块集中的单个图块
 * 图块集是大型 PNG 图片，每个图块 16x16
 */
export function renderTileFromSheet(
  tilesetUrl: string,
  tileCol: number,
  tileRow: number,
  sheetCols: number,
  sheetRows: number,
  tileSize: number
): JSX.Element {
  const scale = tileSize / 16;

  return (
    <div
      style={{
        width: tileSize,
        height: tileSize,
        backgroundImage: `url(${tilesetUrl})`,
        backgroundPosition: `-${tileCol * 16 * scale}px -${tileRow * 16 * scale}px`,
        backgroundSize: `${sheetCols * 16 * scale}px ${sheetRows * 16 * scale}px`,
        imageRendering: 'pixelated' as const,
      }}
    />
  );
}

/**
 * 图片预加载
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        })
    )
  );
}
