import React, { useMemo } from 'react';
import type { LocationData } from '@shared/types';

interface BattleBackgroundProps {
  location: LocationData;
}

// 根据地点 ID 或关键词推断场景类型
type SceneType = 'forest' | 'cave' | 'water' | 'mountain' | 'city' | 'route' | 'electric' | 'ghost' | 'volcano' | 'ice' | 'indoor';

function getSceneType(location: LocationData): SceneType {
  const id = location.id;
  if (id.includes('forest') || id.includes('ilex') || id.includes('safari')) return 'forest';
  if (id.includes('cave') || id.includes('tunnel') || id.includes('mt-') || id === 'digletts-cave') return 'cave';
  if (id.includes('seafoam') || id.includes('whirl')) return 'ice';
  if (id.includes('island') || id.includes('ss-') || id === 'route-19' || id === 'route-20' || id === 'route-21') return 'water';
  if (id.includes('power-plant')) return 'electric';
  if (id.includes('pokemon-tower') || id.includes('sprout-tower')) return 'ghost';
  if (id.includes('cinnabar') && !id.includes('lab')) return 'volcano';
  if (id.includes('lab') || id.includes('game-corner') || id.includes('dojo') || id.includes('gym')) return 'indoor';
  if (id.includes('victory') || id.includes('route-23') || id.includes('moon')) return 'mountain';
  if (id.includes('city') || id.includes('town')) return 'city';
  return 'route';
}

// 场景类型对应的平台/地面颜色和装饰
const SCENE_CONFIGS: Record<SceneType, {
  platformColor: string;      // 我方站台
  enemyPlatformColor: string; // 敌方站台
  groundGradient: string;     // 地面渐变
  particles?: {               // 漂浮粒子
    color: string;
    count: number;
  };
}> = {
  forest: {
    platformColor: 'bg-green-900/50',
    enemyPlatformColor: 'bg-green-800/40',
    groundGradient: 'from-green-900/60 to-transparent',
    particles: { color: '#4CAF50', count: 4 },
  },
  cave: {
    platformColor: 'bg-purple-950/50',
    enemyPlatformColor: 'bg-purple-900/40',
    groundGradient: 'from-purple-950/60 to-transparent',
  },
  water: {
    platformColor: 'bg-blue-900/50',
    enemyPlatformColor: 'bg-blue-800/40',
    groundGradient: 'from-blue-900/60 to-transparent',
    particles: { color: '#90CAF9', count: 3 },
  },
  mountain: {
    platformColor: 'bg-stone-800/50',
    enemyPlatformColor: 'bg-stone-700/40',
    groundGradient: 'from-stone-900/60 to-transparent',
  },
  city: {
    platformColor: 'bg-slate-700/50',
    enemyPlatformColor: 'bg-slate-600/40',
    groundGradient: 'from-slate-800/60 to-transparent',
  },
  route: {
    platformColor: 'bg-emerald-900/40',
    enemyPlatformColor: 'bg-emerald-800/30',
    groundGradient: 'from-emerald-900/50 to-transparent',
    particles: { color: '#81C784', count: 3 },
  },
  electric: {
    platformColor: 'bg-yellow-900/40',
    enemyPlatformColor: 'bg-yellow-800/30',
    groundGradient: 'from-yellow-950/50 to-transparent',
    particles: { color: '#FFD600', count: 3 },
  },
  ghost: {
    platformColor: 'bg-indigo-950/50',
    enemyPlatformColor: 'bg-indigo-900/40',
    groundGradient: 'from-indigo-950/60 to-transparent',
    particles: { color: '#9575CD', count: 4 },
  },
  volcano: {
    platformColor: 'bg-red-950/50',
    enemyPlatformColor: 'bg-red-900/40',
    groundGradient: 'from-red-950/60 to-transparent',
    particles: { color: '#FF6B35', count: 3 },
  },
  ice: {
    platformColor: 'bg-cyan-900/50',
    enemyPlatformColor: 'bg-cyan-800/40',
    groundGradient: 'from-cyan-950/60 to-transparent',
    particles: { color: '#B3E5FC', count: 4 },
  },
  indoor: {
    platformColor: 'bg-slate-800/50',
    enemyPlatformColor: 'bg-slate-700/40',
    groundGradient: 'from-slate-900/60 to-transparent',
  },
};

const BattleBackground: React.FC<BattleBackgroundProps> = ({ location }) => {
  const sceneType = getSceneType(location);
  const sceneConfig = SCENE_CONFIGS[sceneType];
  const bgGradient = location.bgGradient || 'from-slate-800 via-slate-900 to-black';

  // 生成漂浮粒子的随机参数
  const floatingParticles = useMemo(() => {
    if (!sceneConfig.particles) return [];
    return Array.from({ length: sceneConfig.particles.count }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      top: 15 + Math.random() * 60,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 3,
    }));
  }, [sceneConfig.particles]);

  return (
    <>
      {/* 主背景渐变 - 使用地点的 bgGradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} z-0 pointer-events-none`} />

      {/* 场景氛围 - 底部地面光效 */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t ${sceneConfig.groundGradient} z-0 pointer-events-none`}
      />

      {/* 敌方站台 */}
      <div
        className={`absolute top-[25%] right-[-10%] w-48 h-12 ${sceneConfig.enemyPlatformColor} blur-md rounded-[100%] rotate-[-5deg]`}
      />

      {/* 我方站台 */}
      <div
        className={`absolute bottom-[28%] left-[-10%] w-64 h-16 ${sceneConfig.platformColor} blur-lg rounded-[100%] rotate-[5deg]`}
      />

      {/* 漂浮粒子 */}
      {floatingParticles.map((p) => (
        <div
          key={p.id}
          className="absolute z-0 pointer-events-none rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: sceneConfig.particles!.color,
            opacity: 0.4,
            animation: `env-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
};

export default BattleBackground;
