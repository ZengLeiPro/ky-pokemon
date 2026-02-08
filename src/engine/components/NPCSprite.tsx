// ============================================================
// NPC 精灵组件
// ============================================================

import React from 'react';
import type { NPCData } from '../types';
import { getNPCSprite } from '../sprites/npcs';

interface NPCSpriteProps {
  /** NPC 数据 */
  npc: NPCData;
  /** 瓦片像素大小 */
  tileSize: number;
}

/**
 * NPC 精灵组件。
 * 渲染在固定网格位置，不会移动。
 */
const NPCSprite = React.memo(function NPCSprite({
  npc,
  tileSize,
}: NPCSpriteProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: npc.position.x * tileSize,
        top: npc.position.y * tileSize - tileSize,
        width: tileSize,
        height: tileSize * 2,
        zIndex: 15,
        pointerEvents: 'none',
      }}
    >
      {getNPCSprite(npc.spriteId, npc.direction, tileSize)}
    </div>
  );
});

export { NPCSprite };
