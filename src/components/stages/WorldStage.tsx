// ============================================================
// 世界探索主 Stage - 2D 游戏世界的主入口
// 负责路由到不同的 2D 场景（宝可梦中心、道馆等）
// ============================================================

import React, { useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { PokemonCenterScene } from '@/engine/scenes/PokemonCenterScene';
import { GymScene } from '@/engine/scenes/GymScene';
import { WORLD_MAP } from '@/constants';
import type { GymData } from '@/types';

interface WorldStageProps {
  scene: 'POKEMON_CENTER' | 'GYM';
}

/**
 * 世界探索 Stage 组件。
 *
 * 根据传入的 scene 类型渲染对应的 2D 游戏场景，
 * 并将场景内的交互事件桥接到 gameStore 的状态管理方法。
 */
const WorldStage: React.FC<WorldStageProps> = ({ scene }) => {
  const { setView, healParty, addLog, startBattle, startGymBattle, playerLocationId } = useGameStore();

  // 获取当前位置信息，用于道馆数据
  const location = WORLD_MAP[playerLocationId];

  // ---- 宝可梦中心回调 ----

  const handlePokemonCenterExit = useCallback(() => {
    setView('ROAM');
  }, [setView]);

  const handleHealTeam = useCallback(() => {
    healParty();
    addLog('你的宝可梦已在宝可梦中心恢复健康！');
  }, [healParty, addLog]);

  const handleOpenPC = useCallback(() => {
    setView('PC_BOX');
  }, [setView]);

  const handleTrade = useCallback(() => {
    setView('TRADE');
  }, [setView]);

  // ---- 道馆回调 ----

  const handleGymExit = useCallback(() => {
    setView('ROAM');
  }, [setView]);

  const handleBattleTrainer = useCallback(() => {
    // 随机选择一个训练师宝可梦进行战斗（等级 20-25 的随机宝可梦）
    const trainerPokemon = ['machop', 'geodude', 'sandshrew', 'mankey', 'poliwag'];
    const randomSpecies = trainerPokemon[Math.floor(Math.random() * trainerPokemon.length)];
    startBattle(randomSpecies);
  }, [startBattle]);

  const handleBattleLeader = useCallback(() => {
    // 优先使用当前位置的道馆数据，否则使用默认的华蓝道馆数据
    const gymData: GymData = location?.gym ?? {
      leaderName: '小霞',
      badgeName: '蓝色徽章',
      badgeId: 'cascade-badge',
      description: '俏皮的人鱼公主。',
      pokemon: ['staryu', 'starmie'],
      level: 18,
    };
    startGymBattle(gymData);
  }, [startGymBattle, location]);

  // ---- 渲染 ----

  if (scene === 'POKEMON_CENTER') {
    return (
      <PokemonCenterScene
        onExit={handlePokemonCenterExit}
        onHealTeam={handleHealTeam}
        onOpenPC={handleOpenPC}
        onTrade={handleTrade}
      />
    );
  }

  if (scene === 'GYM') {
    return (
      <GymScene
        onExit={handleGymExit}
        onBattleTrainer={handleBattleTrainer}
        onBattleLeader={handleBattleLeader}
        gymName={location?.gym ? `${location.name}道馆` : '华蓝道馆'}
      />
    );
  }

  return null;
};

export default WorldStage;
