import type { BaseStats } from '../types';

/**
 * 计算宝可梦实际能力值（Gen 3+ 公式）
 */
export const calculateStats = (
  base: BaseStats,
  ivs: BaseStats,
  evs: BaseStats,
  level: number,
  natureModifier: Record<keyof BaseStats, number> = { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }
): { stats: BaseStats; maxHp: number } => {
  const calcStat = (statName: keyof BaseStats, isHp: boolean): number => {
    const b = base[statName];
    const i = ivs[statName];
    const e = evs[statName];

    if (isHp) {
      return Math.floor(((2 * b + i + Math.floor(e / 4)) * level) / 100) + level + 10;
    }
    const baseStat = Math.floor(((2 * b + i + Math.floor(e / 4)) * level) / 100) + 5;
    return Math.floor(baseStat * (natureModifier[statName] ?? 1));
  };

  const maxHp = calcStat('hp', true);

  return {
    maxHp,
    stats: {
      hp: maxHp,
      atk: calcStat('atk', false),
      def: calcStat('def', false),
      spa: calcStat('spa', false),
      spd: calcStat('spd', false),
      spe: calcStat('spe', false),
    },
  };
};
