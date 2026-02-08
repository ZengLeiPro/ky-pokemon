import type { JSX } from 'react';

/**
 * 瓦片 PNG 渲染 - 使用 Tuxemon 图块集提取的 16x16 像素图块
 * 每个图块由独立的 PNG 文件渲染，通过 CSS 缩放到目标尺寸
 */

// 所有可用的瓦片 ID 列表
const TILE_IDS = [
  'floor', 'floor-pattern',
  'wall-top', 'wall-front', 'wall-side-left', 'wall-side-right',
  'counter-left', 'counter-center', 'counter-right', 'counter-front',
  'pc-terminal', 'bench-left', 'bench-right', 'plant',
  'mat-top', 'mat-bottom', 'door-left', 'door-right',
  'healing-machine', 'trade-machine', 'bookshelf', 'statue',
  'gym-floor', 'gym-pattern', 'badge-display', 'arena-marker',
  'shop-floor', 'shop-counter-left', 'shop-counter-center',
  'shop-counter-right', 'shop-counter-front',
  'shelf-potions', 'shelf-pokeballs', 'cash-register', 'shop-sign',
  'pillar',
] as const;

/**
 * 创建单个瓦片的渲染函数
 */
function createTileRenderer(tileId: string): (size: number) => JSX.Element {
  const url = `/sprites/tiles/${tileId}.png`;
  return (size: number) => (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${url})`,
        backgroundSize: `${size}px ${size}px`,
        imageRendering: 'pixelated' as const,
      }}
    />
  );
}

/**
 * 瓦片渲染函数集合。
 * 每个渲染函数接收 size（像素）参数，返回对应瓦片的 PNG 渲染元素。
 */
export const tileRenderers: Record<string, (size: number) => JSX.Element> =
  Object.fromEntries(TILE_IDS.map((id) => [id, createTileRenderer(id)]));
