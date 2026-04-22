// ============================================================
// 真新镇场景组件 - 2D 户外漫游第一张地图
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { GameWorld } from '../components/GameWorld';
import { palletTownMap } from '../maps/pallet-town';

interface PalletTownSceneProps {
  /** 离开真新镇（回到 ROAM 菜单） */
  onExit: () => void;
}

/**
 * 真新镇完整场景。
 *
 * - 渲染 GameWorld，传入真新镇地图
 * - 任何 warp（北边出口）触发 onExit，回到 ROAM 菜单
 * - 顶部显示场景名称
 * - 进入时有淡入效果
 *
 * 暂未加 BGM（户外音乐留给后续实现）
 */
export function PalletTownScene({ onExit }: PalletTownSceneProps) {
  // 淡入控制
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // 场景切换：所有 warp 都视为"离开真新镇"
  const handleSceneChange = useCallback(
    (_sceneId: string, _spawnId: string) => {
      onExit();
    },
    [onExit],
  );

  // 特殊交互分发（目前无特殊交互，所有对话都是 message）
  const handleInteraction = useCallback((_type: string, _data: unknown) => {
    // 预留：后续接博士研究所入口、商店、宝可梦中心
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* 游戏世界 */}
      <GameWorld
        mapData={palletTownMap}
        initialSpawn="default"
        onSceneChange={handleSceneChange}
        onInteraction={handleInteraction}
      />

      {/* 场景名称条 - 顶部草绿色调 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
        style={{
          height: 36,
          background: 'linear-gradient(to bottom, rgba(20,60,20,0.55), rgba(20,60,20,0))',
        }}
      >
        <span
          className="text-white text-sm font-bold tracking-wider"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
        >
          真新镇 Pallet Town
        </span>
      </div>

      {/* 淡入遮罩 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#000',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      />
    </div>
  );
}
