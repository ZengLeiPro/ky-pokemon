import type { JSX } from 'react';
import { palletTownTileRenderers } from './pallet-town-tiles';

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
  'bookshelf-top', 'healing-machine-top', 'trade-machine-top',
  'pc-terminal-top', 'shelf-potions-top', 'shelf-pokeballs-top',
  'cash-register-top',
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
 * 自定义瓦片渲染函数集合 - 使用内联 SVG 绘制（不依赖 PNG 资源）
 *
 * computer-fr / computer-fr-top：火红叶绿风格的宝可梦中心电脑（2 格高）
 *  - 上格 computer-fr-top：显示器（屏幕发蓝光 + 右上红色 LED）
 *  - 下格 computer-fr：基座（键盘区 + 软盘槽）
 */
const customTileRenderers: Record<string, (size: number) => JSX.Element> = {
  'computer-fr-top': (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated' as const, display: 'block' }}
    >
      {/* 机身外壳深色边框 */}
      <rect x="1" y="0" width="14" height="16" fill="#3a4150" />
      {/* 机身浅灰主色 */}
      <rect x="2" y="1" width="12" height="15" fill="#d6dce6" />
      {/* 机身高光 */}
      <rect x="2" y="1" width="12" height="1" fill="#eef1f6" />
      <rect x="2" y="2" width="1" height="13" fill="#eef1f6" />
      {/* 屏幕黑色边框 */}
      <rect x="3" y="3" width="10" height="9" fill="#0a1028" />
      {/* 屏幕深蓝底色 */}
      <rect x="4" y="4" width="8" height="7" fill="#1e3d80" />
      {/* 屏幕亮蓝光晕 */}
      <rect x="4" y="5" width="8" height="5" fill="#2e62b3" />
      {/* 屏幕左上角高光反射 */}
      <rect x="5" y="5" width="3" height="2" fill="#7ab6ea" />
      <rect x="5" y="5" width="2" height="1" fill="#c3ddf6" />
      {/* 屏幕扫描线 */}
      <rect x="4" y="7" width="8" height="1" fill="#1a3970" opacity="0.5" />
      <rect x="4" y="9" width="8" height="1" fill="#1a3970" opacity="0.5" />
      {/* 右上角红色 LED 指示灯 */}
      <rect x="13" y="4" width="1" height="1" fill="#ff2424" />
      {/* 机身底部通风槽 */}
      <rect x="4" y="13" width="8" height="1" fill="#8a909c" />
      <rect x="4" y="14" width="8" height="1" fill="#8a909c" />
    </svg>
  ),
  'computer-fr': (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated' as const, display: 'block' }}
    >
      {/* 机身外壳深色边框 */}
      <rect x="1" y="0" width="14" height="13" fill="#3a4150" />
      {/* 机身浅灰主色 */}
      <rect x="2" y="0" width="12" height="13" fill="#d6dce6" />
      {/* 机身左高光 */}
      <rect x="2" y="0" width="1" height="13" fill="#eef1f6" />
      {/* 键盘暗区背板 */}
      <rect x="3" y="1" width="10" height="4" fill="#5c6474" />
      {/* 键盘按键（三排） */}
      <rect x="4" y="2" width="8" height="1" fill="#a8aeba" />
      <rect x="4" y="3" width="8" height="1" fill="#a8aeba" />
      {/* 按键分隔线 */}
      <rect x="6" y="2" width="1" height="2" fill="#5c6474" />
      <rect x="9" y="2" width="1" height="2" fill="#5c6474" />
      {/* 软盘/读卡槽 */}
      <rect x="3" y="7" width="10" height="2" fill="#2a2f3a" />
      <rect x="4" y="7" width="1" height="2" fill="#4a5060" />
      {/* 软盘读取指示灯 */}
      <rect x="11" y="8" width="1" height="1" fill="#36d64a" />
      {/* 底部散热孔 */}
      <rect x="3" y="10" width="2" height="1" fill="#8a909c" />
      <rect x="6" y="10" width="2" height="1" fill="#8a909c" />
      <rect x="9" y="10" width="2" height="1" fill="#8a909c" />
      {/* 底部阴影 */}
      <rect x="2" y="12" width="12" height="1" fill="#5c6474" />
    </svg>
  ),
};

/**
 * 瓦片渲染函数集合。
 * 每个渲染函数接收 size（像素）参数，返回对应瓦片的 PNG/SVG 渲染元素。
 */
export const tileRenderers: Record<string, (size: number) => JSX.Element> = {
  ...Object.fromEntries(TILE_IDS.map((id) => [id, createTileRenderer(id)])),
  ...customTileRenderers,
  ...palletTownTileRenderers,
};
