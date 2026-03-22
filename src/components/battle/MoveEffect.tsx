import React, { useMemo } from 'react';
import type { PokemonType } from '@shared/types';

interface MoveEffectProps {
  moveType: PokemonType;
  moveId: string;
  isPlayerAttack: boolean;
}

// 每种属性的视觉配置
const TYPE_EFFECTS: Record<string, {
  colors: string[];       // 粒子颜色
  shape: 'circle' | 'diamond' | 'star' | 'drop' | 'bolt' | 'leaf' | 'ring';
  particleCount: number;
  animation: string;      // 专属动画名
  glow: string;           // 光晕颜色
  impactColor: string;    // 命中闪光色
}> = {
  Fire: {
    colors: ['#FF6B35', '#FF4500', '#FFD700', '#FF8C00'],
    shape: 'circle',
    particleCount: 8,
    animation: 'fire-flicker',
    glow: 'rgba(255, 100, 0, 0.4)',
    impactColor: 'rgba(255, 100, 0, 0.6)',
  },
  Water: {
    colors: ['#4FC3F7', '#0288D1', '#B3E5FC', '#0277BD'],
    shape: 'drop',
    particleCount: 7,
    animation: 'water-wave',
    glow: 'rgba(33, 150, 243, 0.4)',
    impactColor: 'rgba(33, 150, 243, 0.6)',
  },
  Electric: {
    colors: ['#FFD600', '#FFF176', '#F9A825', '#FFFFFF'],
    shape: 'bolt',
    particleCount: 6,
    animation: 'electric-spark',
    glow: 'rgba(255, 214, 0, 0.5)',
    impactColor: 'rgba(255, 235, 59, 0.7)',
  },
  Grass: {
    colors: ['#4CAF50', '#81C784', '#2E7D32', '#A5D6A7'],
    shape: 'leaf',
    particleCount: 7,
    animation: 'leaf-swirl',
    glow: 'rgba(76, 175, 80, 0.4)',
    impactColor: 'rgba(76, 175, 80, 0.6)',
  },
  Ice: {
    colors: ['#B3E5FC', '#E1F5FE', '#4FC3F7', '#FFFFFF'],
    shape: 'diamond',
    particleCount: 8,
    animation: 'ice-crystal',
    glow: 'rgba(79, 195, 247, 0.4)',
    impactColor: 'rgba(179, 229, 252, 0.7)',
  },
  Fighting: {
    colors: ['#E65100', '#FF6D00', '#FFAB40', '#BF360C'],
    shape: 'star',
    particleCount: 6,
    animation: 'fire-flicker',
    glow: 'rgba(230, 81, 0, 0.4)',
    impactColor: 'rgba(255, 109, 0, 0.6)',
  },
  Poison: {
    colors: ['#9C27B0', '#CE93D8', '#7B1FA2', '#E1BEE7'],
    shape: 'circle',
    particleCount: 7,
    animation: 'particle-rise',
    glow: 'rgba(156, 39, 176, 0.4)',
    impactColor: 'rgba(156, 39, 176, 0.6)',
  },
  Ground: {
    colors: ['#8D6E63', '#A1887F', '#5D4037', '#D7CCC8'],
    shape: 'diamond',
    particleCount: 6,
    animation: 'fire-flicker',
    glow: 'rgba(141, 110, 99, 0.4)',
    impactColor: 'rgba(141, 110, 99, 0.6)',
  },
  Flying: {
    colors: ['#90CAF9', '#BBDEFB', '#E3F2FD', '#FFFFFF'],
    shape: 'circle',
    particleCount: 6,
    animation: 'leaf-swirl',
    glow: 'rgba(144, 202, 249, 0.4)',
    impactColor: 'rgba(144, 202, 249, 0.6)',
  },
  Psychic: {
    colors: ['#F06292', '#EC407A', '#FCE4EC', '#FF80AB'],
    shape: 'ring',
    particleCount: 5,
    animation: 'psychic-ring',
    glow: 'rgba(240, 98, 146, 0.4)',
    impactColor: 'rgba(236, 64, 122, 0.6)',
  },
  Bug: {
    colors: ['#8BC34A', '#9CCC65', '#558B2F', '#DCEDC8'],
    shape: 'circle',
    particleCount: 8,
    animation: 'leaf-swirl',
    glow: 'rgba(139, 195, 74, 0.3)',
    impactColor: 'rgba(139, 195, 74, 0.5)',
  },
  Rock: {
    colors: ['#795548', '#A1887F', '#4E342E', '#BCAAA4'],
    shape: 'diamond',
    particleCount: 5,
    animation: 'fire-flicker',
    glow: 'rgba(121, 85, 72, 0.4)',
    impactColor: 'rgba(121, 85, 72, 0.6)',
  },
  Ghost: {
    colors: ['#7E57C2', '#9575CD', '#4527A0', '#B39DDB'],
    shape: 'circle',
    particleCount: 6,
    animation: 'ghost-shadow',
    glow: 'rgba(126, 87, 194, 0.5)',
    impactColor: 'rgba(69, 39, 160, 0.6)',
  },
  Dragon: {
    colors: ['#5C6BC0', '#7986CB', '#283593', '#9FA8DA'],
    shape: 'star',
    particleCount: 7,
    animation: 'dragon-beam',
    glow: 'rgba(92, 107, 192, 0.5)',
    impactColor: 'rgba(63, 81, 181, 0.6)',
  },
  Dark: {
    colors: ['#37474F', '#546E7A', '#263238', '#78909C'],
    shape: 'circle',
    particleCount: 6,
    animation: 'ghost-shadow',
    glow: 'rgba(55, 71, 79, 0.5)',
    impactColor: 'rgba(38, 50, 56, 0.7)',
  },
  Steel: {
    colors: ['#B0BEC5', '#CFD8DC', '#78909C', '#FFFFFF'],
    shape: 'diamond',
    particleCount: 6,
    animation: 'ice-crystal',
    glow: 'rgba(176, 190, 197, 0.5)',
    impactColor: 'rgba(176, 190, 197, 0.7)',
  },
  Fairy: {
    colors: ['#F48FB1', '#F8BBD0', '#FF80AB', '#FCE4EC'],
    shape: 'star',
    particleCount: 8,
    animation: 'leaf-swirl',
    glow: 'rgba(244, 143, 177, 0.4)',
    impactColor: 'rgba(244, 143, 177, 0.6)',
  },
  Normal: {
    colors: ['#BDBDBD', '#E0E0E0', '#9E9E9E', '#FFFFFF'],
    shape: 'star',
    particleCount: 5,
    animation: 'fire-flicker',
    glow: 'rgba(189, 189, 189, 0.3)',
    impactColor: 'rgba(224, 224, 224, 0.5)',
  },
};

// SVG 粒子形状
function ParticleShape({ shape, color, size }: { shape: string; color: string; size: number }) {
  const s = size;
  switch (shape) {
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <polygon points="10,0 20,10 10,20 0,10" fill={color} />
        </svg>
      );
    case 'star':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <polygon points="10,0 12.5,7.5 20,7.5 14,12.5 16,20 10,15 4,20 6,12.5 0,7.5 7.5,7.5" fill={color} />
        </svg>
      );
    case 'drop':
      return (
        <svg width={s} height={s} viewBox="0 0 20 24">
          <path d="M10,0 Q15,12 15,16 A5,5 0 0,1 5,16 Q5,12 10,0Z" fill={color} />
        </svg>
      );
    case 'bolt':
      return (
        <svg width={s} height={s * 1.2} viewBox="0 0 16 20">
          <polygon points="9,0 4,9 8,9 6,20 12,8 8,8" fill={color} />
        </svg>
      );
    case 'leaf':
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <ellipse cx="10" cy="10" rx="4" ry="9" fill={color} transform="rotate(30 10 10)" />
          <line x1="10" y1="2" x2="10" y2="18" stroke={color} strokeWidth="0.8" opacity="0.5" />
        </svg>
      );
    case 'ring':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2.5" />
        </svg>
      );
    case 'circle':
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill={color} />
        </svg>
      );
  }
}

const MoveEffect: React.FC<MoveEffectProps> = ({ moveType, isPlayerAttack }) => {
  const config = TYPE_EFFECTS[moveType] || TYPE_EFFECTS.Normal;

  // 生成随机粒子参数（useMemo 保证动画期间不变）
  const particles = useMemo(() => {
    return Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      color: config.colors[i % config.colors.length],
      size: 12 + Math.random() * 10,
      delay: i * 0.06,
      // 随机散布在起始区域
      startX: (Math.random() - 0.5) * 30,
      startY: (Math.random() - 0.5) * 20,
      duration: 0.5 + Math.random() * 0.3,
    }));
  }, [config.particleCount, config.colors]);

  // 攻击方向：玩家攻击从左下到右上，敌方攻击从右上到左下
  const originX = isPlayerAttack ? '20%' : '80%';
  const originY = isPlayerAttack ? '65%' : '25%';
  const targetX = isPlayerAttack ? '75%' : '25%';
  const targetY = isPlayerAttack ? '20%' : '70%';

  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {/* 全屏属性色调光晕 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${targetX} ${targetY}, ${config.glow}, transparent 60%)`,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* 飞行粒子 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: originX,
            top: originY,
            marginLeft: p.startX,
            marginTop: p.startY,
            animation: `${isPlayerAttack ? 'projectile-to-enemy' : 'projectile-to-player'} ${p.duration}s ease-in-out ${p.delay}s both`,
          }}
        >
          <div
            style={{
              animation: `${config.animation} ${p.duration}s ease-in-out ${p.delay}s both`,
              filter: `drop-shadow(0 0 4px ${p.color})`,
            }}
          >
            <ParticleShape shape={config.shape} color={p.color} size={p.size} />
          </div>
        </div>
      ))}

      {/* 命中闪光 */}
      <div
        className="absolute"
        style={{
          left: targetX,
          top: targetY,
          transform: 'translate(-50%, -50%)',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${config.impactColor}, transparent 70%)`,
          animation: 'impact-flash 0.5s ease-out 0.35s both',
        }}
      />
    </div>
  );
};

export default MoveEffect;
