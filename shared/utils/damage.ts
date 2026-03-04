import type { Pokemon, Move, Weather } from '../types/index.js';
import { getTypeEffectiveness } from '../constants/type-chart.js';

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  typeEffectiveness: number;
}

/**
 * 根据能力等级（-6 ~ +6）获取倍率
 * 正版宝可梦的能力等级系统
 */
const getStatStageMod = (stage: number): number => {
  const clamped = Math.max(-6, Math.min(6, stage));
  if (clamped >= 0) return (2 + clamped) / 2;
  return 2 / (2 - clamped);
};

/**
 * 根据命中/闪避等级获取倍率
 */
const getAccuracyStageMod = (stage: number): number => {
  const clamped = Math.max(-6, Math.min(6, stage));
  if (clamped >= 0) return (3 + clamped) / 3;
  return 3 / (3 - clamped);
};

export { getStatStageMod, getAccuracyStageMod };

/**
 * 计算伤害（Gen 3+ 公式）
 */
export const calculateDamage = (
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  weather: Weather = 'None',
  randomFactor?: number // 可选：用于测试时固定随机数
): DamageResult => {
  if (move.category === 'Status') {
    return { damage: 0, isCritical: false, typeEffectiveness: 1 };
  }

  const atkStages = attacker.statStages;
  const defStages = defender.statStages;

  let a = move.category === 'Physical' ? attacker.stats.atk : attacker.stats.spa;
  let d = move.category === 'Physical' ? defender.stats.def : defender.stats.spd;

  // 应用能力等级修正
  if (atkStages) {
    const atkStage = move.category === 'Physical' ? atkStages.atk : atkStages.spa;
    a = Math.floor(a * getStatStageMod(atkStage));
  }
  if (defStages) {
    const defStage = move.category === 'Physical' ? defStages.def : defStages.spd;
    d = Math.floor(d * getStatStageMod(defStage));
  }

  // 灼伤减半物攻
  if (attacker.status === 'BRN' && move.category === 'Physical') {
    a = Math.floor(a * 0.5);
  }

  // 天气影响
  let power = move.power;
  if (weather === 'Sunny') {
    if (move.type === 'Fire') power = Math.floor(power * 1.5);
    if (move.type === 'Water') power = Math.floor(power * 0.5);
  } else if (weather === 'Rain') {
    if (move.type === 'Water') power = Math.floor(power * 1.5);
    if (move.type === 'Fire') power = Math.floor(power * 0.5);
  }

  const levelFactor = (2 * attacker.level) / 5 + 2;
  const baseDamage = (levelFactor * power * (a / d)) / 50 + 2;

  // 暴击判定
  const critRoll = randomFactor ?? Math.random();
  const isCritical = critRoll < 0.0625;
  const critMod = isCritical ? 1.5 : 1.0;

  // 随机浮动 (85-100%)
  const randomMod = randomFactor !== undefined
    ? 1.0
    : (Math.floor(Math.random() * 16) + 85) / 100;

  // STAB 加成
  const stabMod = attacker.types.includes(move.type) ? 1.5 : 1.0;

  // 属性克制
  const typeMod = getTypeEffectiveness(move.type, defender.types);

  const damage = Math.floor(baseDamage * critMod * randomMod * stabMod * typeMod);

  return { damage, isCritical, typeEffectiveness: typeMod };
};
