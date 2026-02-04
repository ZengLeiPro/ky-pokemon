// ============================================================
// 道馆场景组件
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { GameWorld } from '../components/GameWorld';
import { gymMap } from '../maps/gym';

interface GymSceneProps {
  /** 离开道馆 */
  onExit: () => void;
  /** 触发训练师对战 */
  onBattleTrainer: () => void;
  /** 触发馆主对战 */
  onBattleLeader: () => void;
  /** 道馆名称，默认 "华蓝道馆" */
  gymName?: string;
}

/**
 * 道馆完整场景。
 *
 * - 渲染 GameWorld，传入道馆地图数据
 * - 处理场景切换（玩家走到门口 warp 时调用 onExit）
 * - 处理特殊交互（训练师对战、馆主对战）
 * - 顶部显示道馆名称（深色调标题条，营造严肃氛围）
 * - 进入时有淡入效果
 */
export function GymScene({
  onExit,
  onBattleTrainer,
  onBattleLeader,
  gymName = '华蓝道馆',
}: GymSceneProps) {
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
        case 'battle-trainer':
          onBattleTrainer();
          break;
        case 'battle-leader':
          onBattleLeader();
          break;
        default:
          break;
      }
    },
    [onBattleTrainer, onBattleLeader],
  );

  return (
    <div className="relative w-full h-full">
      {/* 游戏世界 */}
      <GameWorld
        mapData={gymMap}
        initialSpawn="entrance"
        onSceneChange={handleSceneChange}
        onInteraction={handleInteraction}
      />

      {/* 场景名称条 - 顶部深色调，营造严肃道馆氛围 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
        style={{
          height: 36,
          background: 'linear-gradient(to bottom, rgba(30,20,50,0.75), rgba(30,20,50,0))',
        }}
      >
        <span
          className="text-white text-sm font-bold tracking-wider"
          style={{ textShadow: '0 1px 4px rgba(60,40,100,0.8)' }}
        >
          {gymName}
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
