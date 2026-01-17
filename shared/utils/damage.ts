import type { Pokemon, Move, Weather } from '../types';
import { getTypeEffectiveness } from '../constants/type-chart';

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  typeEffectiveness: number;
}

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

  let a = move.category === 'Physical' ? attacker.stats.atk : attacker.stats.spa;
  const d = move.category === 'Physical' ? defender.stats.def : defender.stats.spd;

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
