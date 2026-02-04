// ============================================================
// 宝可梦中心场景组件
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { GameWorld } from '../components/GameWorld';
import { pokemonCenterMap } from '../maps/pokemon-center';

interface PokemonCenterSceneProps {
  /** 离开宝可梦中心 */
  onExit: () => void;
  /** 治愈队伍 */
  onHealTeam: () => void;
  /** 打开 PC 箱 */
  onOpenPC: () => void;
  /** 打开交换界面 */
  onTrade: () => void;
}

/**
 * 宝可梦中心完整场景。
 *
 * - 渲染 GameWorld，传入宝可梦中心地图数据
 * - 处理场景切换（玩家走到门口 warp 时调用 onExit）
 * - 处理特殊交互（治愈、PC 等）
 * - 顶部显示场景名称（半透明条）
 * - 进入时有淡入效果
 */
export function PokemonCenterScene({
  onExit,
  onHealTeam,
  onOpenPC,
  onTrade,
}: PokemonCenterSceneProps) {
  // 淡入控制
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    // 短暂延迟后移除淡入遮罩
    const timer = setTimeout(() => setFadeIn(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // 场景切换：玩家踩到 warp 区域
  const handleSceneChange = useCallback(
    (_sceneId: string, _spawnId: string) => {
      onExit();
    },
    [onExit],
  );

  // 特殊交互分发
  const handleInteraction = useCallback(
    (type: string, _data: unknown) => {
      switch (type) {
        case 'heal':
          onHealTeam();
          break;
        case 'open-pc':
          onOpenPC();
          break;
        case 'open-trade':
          onTrade();
          break;
        default:
          break;
      }
    },
    [onHealTeam, onOpenPC, onTrade],
  );

  return (
    <div className="relative w-full h-full">
      {/* 游戏世界 */}
      <GameWorld
        mapData={pokemonCenterMap}
        initialSpawn="entrance"
        onSceneChange={handleSceneChange}
        onInteraction={handleInteraction}
      />

      {/* 场景名称条 - 顶部半透明 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
        style={{
          height: 36,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))',
        }}
      >
        <span
          className="text-white text-sm font-bold tracking-wider"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          宝可梦中心
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
