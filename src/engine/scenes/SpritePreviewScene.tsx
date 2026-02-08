// ============================================================
// 精灵预览场景 - 用于对比不同角色精灵方案
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { GameWorld } from '../components/GameWorld';
import { spritePreviewMap } from '../maps/sprite-preview';
import { getPlayerSprite as getOriginal } from '../sprites/player';
import { getPlayerSprite as getV1 } from '../sprites/player-v1';
import { getPlayerSprite as getV2 } from '../sprites/player-v2';
import { getPlayerSprite as getV3 } from '../sprites/player-v3';
import { getPlayerSprite as getV4 } from '../sprites/player-v4';
import { getPlayerSprite as getV5 } from '../sprites/player-v5';
import type { PlayerSpriteRenderer } from '../components/PlayerSprite';
import { TILE_SIZE } from '../constants';
import type { Direction } from '../types';

const VARIANTS: { label: string; renderer: PlayerSpriteRenderer }[] = [
  { label: '冒险者', renderer: getOriginal },
  { label: '女主角', renderer: getV1 },
  { label: '女孩', renderer: getV2 },
  { label: '猫女', renderer: getV3 },
  { label: '红色', renderer: getV4 },
  { label: '绿色', renderer: getV5 },
];

const DIRECTIONS: Direction[] = ['down', 'left', 'up', 'right'];
const FRAMES = [0, 1, 2];

interface SpritePreviewSceneProps {
  onExit: () => void;
}

export function SpritePreviewScene({ onExit }: SpritePreviewSceneProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeRenderer = useMemo(
    () => VARIANTS[activeIndex].renderer,
    [activeIndex],
  );

  const handleSceneChange = useCallback(() => {
    // 预览地图没有传送点，忽略
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* 游戏世界 */}
      <GameWorld
        mapData={spritePreviewMap}
        initialSpawn="default"
        onSceneChange={handleSceneChange}
        playerSpriteRenderer={activeRenderer}
      />

      {/* 顶部标题栏 */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-black/70 backdrop-blur-sm">
        <button
          onClick={onExit}
          className="text-xs text-slate-300 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg"
        >
          返回
        </button>
        <span className="text-xs text-slate-300 font-bold tracking-wide">
          精灵预览
        </span>
        <div className="w-12" />
      </div>

      {/* 底部切换栏 */}
      <div className="absolute bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-3 pointer-events-none">
        {/* 方案切换按钮组 */}
        <div className="flex gap-2 pointer-events-auto">
          {VARIANTS.map((v, i) => (
            <button
              key={v.label}
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                i === activeIndex
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* 精灵缩略预览 */}
        <div className="flex gap-4 bg-slate-900/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-slate-700/50 pointer-events-auto">
          {VARIANTS.map((v, vi) => (
            <div
              key={v.label}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
                vi === activeIndex ? 'opacity-100' : 'opacity-40'
              }`}
              onClick={() => setActiveIndex(vi)}
            >
              <span className="text-[9px] text-slate-400 font-mono">{v.label}</span>
              <div className="flex gap-0.5">
                {DIRECTIONS.map((dir) => (
                  <div key={dir} className="flex flex-col gap-0.5">
                    {FRAMES.map((frame) => (
                      <div key={frame} style={{ width: TILE_SIZE * 0.45, height: TILE_SIZE * 0.9, overflow: 'hidden' }}>
                        {v.renderer(dir, frame, TILE_SIZE * 0.45)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
