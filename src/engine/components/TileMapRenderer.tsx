// ============================================================
// 瓦片地图渲染组件
// ============================================================

import React from 'react';
import type { MapData } from '../types';
import { tileRenderers } from '../sprites/tiles';

interface TileMapRendererProps {
  /** 地图数据 */
  mapData: MapData;
  /** 渲染的层级 */
  layer: 'ground' | 'objects' | 'overhead';
  /** 瓦片像素大小 */
  tileSize: number;
}

/**
 * 瓦片地图渲染组件。
 * 将指定层级的瓦片数据渲染为绝对定位的 SVG 元素。
 * 使用 React.memo 优化，地图数据不变时不重渲染。
 */
const TileMapRenderer = React.memo(function TileMapRenderer({
  mapData,
  layer,
  tileSize,
}: TileMapRendererProps) {
  const tileLayer = mapData.layers[layer];
  if (!tileLayer) return null;

  const tiles: React.ReactNode[] = [];

  for (let row = 0; row < tileLayer.length; row++) {
    const rowData = tileLayer[row];
    if (!rowData) continue;

    for (let col = 0; col < rowData.length; col++) {
      const tileId = rowData[col];
      // 跳过空瓦片
      if (tileId === null || tileId === undefined) continue;

      const renderer = tileRenderers[tileId];
      if (!renderer) continue;

      tiles.push(
        <div
          key={`${layer}-${row}-${col}`}
          style={{
            position: 'absolute',
            left: col * tileSize,
            top: row * tileSize,
            width: tileSize,
            height: tileSize,
          }}
        >
          {renderer(tileSize)}
        </div>,
      );
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: mapData.width * tileSize,
        height: mapData.height * tileSize,
        // overhead 层需要在玩家上方
        zIndex: layer === 'overhead' ? 30 : layer === 'objects' ? 10 : 0,
        pointerEvents: 'none',
      }}
    >
      {tiles}
    </div>
  );
});

export { TileMapRenderer };
