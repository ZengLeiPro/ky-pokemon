// ============================================================
// 玩家精灵组件
// ============================================================

import React from 'react';
import type { JSX } from 'react';
import type { Direction, PixelPosition } from '../types';
import { getPlayerSprite as defaultGetPlayerSprite } from '../sprites/player';

export type PlayerSpriteRenderer = (direction: Direction, frame: number, size: number) => JSX.Element;

interface PlayerSpriteProps {
  /** 当前像素坐标 */
  pixelPosition: PixelPosition;
  /** 面朝方向 */
  direction: Direction;
  /** 走路动画帧 (0=静止, 1=左脚, 2=右脚) */
  walkFrame: number;
  /** 瓦片像素大小 */
  tileSize: number;
  /** 自定义精灵渲染函数（用于精灵预览等场景） */
  spriteRenderer?: PlayerSpriteRenderer;
}

/**
 * 玩家精灵组件。
 * 使用 CSS absolute positioning 配合 transform 实现流畅的像素级移动。
 */
const PlayerSprite = React.memo(function PlayerSprite({
  pixelPosition,
  direction,
  walkFrame,
  tileSize,
  spriteRenderer,
}: PlayerSpriteProps) {
  const render = spriteRenderer ?? defaultGetPlayerSprite;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: tileSize,
        height: tileSize,
        // 使用 transform 实现流畅移动（GPU 加速）
        transform: `translate(${pixelPosition.x}px, ${pixelPosition.y}px)`,
        willChange: 'transform',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      {render(direction, walkFrame, tileSize)}
    </div>
  );
});

export { PlayerSprite };
