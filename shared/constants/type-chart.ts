import type { PokemonType } from '../types';

// 完整的 18x18 属性克制表 (Gen 3+ 官方数据)
// 格式: TYPE_CHART[攻击属性][防御属性] = 倍率
// 倍率: 0 = 无效, 0.5 = 效果不佳, 1 = 普通, 2 = 效果拔群
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Normal: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 0.5, Ghost: 0, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 1
  },
  Fire: {
    Normal: 1, Fire: 0.5, Water: 0.5, Grass: 2, Electric: 1, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2,
    Rock: 0.5, Ghost: 1, Dragon: 0.5, Steel: 2, Dark: 1, Fairy: 0.5
  },
  Water: {
    Normal: 1, Fire: 2, Water: 0.5, Grass: 0.5, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 2, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 2, Ghost: 1, Dragon: 0.5, Steel: 1, Dark: 1, Fairy: 0.5
  },
  Grass: {
    Normal: 1, Fire: 0.5, Water: 2, Grass: 0.5, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 0.5, Ground: 2, Flying: 0.5, Psychic: 1, Bug: 0.5,
    Rock: 2, Ghost: 1, Dragon: 0.5, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Electric: {
    Normal: 1, Fire: 1, Water: 2, Grass: 0.5, Electric: 0.5, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 0, Flying: 2, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 0.5, Steel: 1, Dark: 1, Fairy: 0.5
  },
  Ice: {
    Normal: 1, Fire: 0.5, Water: 0.5, Grass: 2, Electric: 1, Ice: 0.5,
    Fighting: 1, Poison: 1, Ground: 2, Flying: 2, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Fighting: {
    Normal: 2, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 2,
    Fighting: 1, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 0.5, Bug: 0.5,
    Rock: 2, Ghost: 0, Dragon: 1, Steel: 2, Dark: 2, Fairy: 0.5
  },
  Poison: {
    Normal: 1, Fire: 1, Water: 1, Grass: 2, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 0.5, Ground: 0.5, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 0.5, Ghost: 0.5, Dragon: 1, Steel: 0, Dark: 1, Fairy: 2
  },
  Ground: {
    Normal: 1, Fire: 2, Water: 1, Grass: 0.5, Electric: 2, Ice: 1,
    Fighting: 1, Poison: 2, Ground: 1, Flying: 0, Psychic: 1, Bug: 0.5,
    Rock: 2, Ghost: 1, Dragon: 1, Steel: 2, Dark: 1, Fairy: 0.5
  },
  Flying: {
    Normal: 1, Fire: 1, Water: 1, Grass: 2, Electric: 0.5, Ice: 1,
    Fighting: 2, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2,
    Rock: 0.5, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Psychic: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 2, Poison: 2, Ground: 1, Flying: 1, Psychic: 0.5, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 0, Fairy: 1
  },
  Bug: {
    Normal: 1, Fire: 0.5, Water: 1, Grass: 2, Electric: 1, Ice: 1,
    Fighting: 0.5, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 0.5, Dragon: 1, Steel: 0.5, Dark: 2, Fairy: 0.5
  },
  Rock: {
    Normal: 1, Fire: 2, Water: 1, Grass: 1, Electric: 1, Ice: 2,
    Fighting: 0.5, Poison: 1, Ground: 0.5, Flying: 2, Psychic: 1, Bug: 2,
    Rock: 1, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Ghost: {
    Normal: 0, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 2, Dragon: 1, Steel: 0.5, Dark: 2, Fairy: 0.5
  },
  Dragon: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Steel: 0.5, Dark: 1, Fairy: 0
  },
  Steel: {
    Normal: 1, Fire: 0.5, Water: 0.5, Grass: 0.5, Electric: 0.5, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 2, Ghost: 1, Dragon: 1, Steel: 0.5, Dark: 1, Fairy: 0.5
  },
  Dark: {
    Normal: 1, Fire: 1, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 0.5, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 2, Dragon: 1, Steel: 1, Dark: 0.5, Fairy: 0.5
  },
  Fairy: {
    Normal: 1, Fire: 0.5, Water: 1, Grass: 1, Electric: 1, Ice: 1,
    Fighting: 2, Poison: 0.5, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Steel: 0.5, Dark: 2, Fairy: 0.5
  }
};

export const TYPE_TRANSLATIONS: Record<PokemonType, string> = {
  Normal: '一般',
  Fire: '火',
  Water: '水',
  Grass: '草',
  Electric: '电',
  Ice: '冰',
  Fighting: '格斗',
  Poison: '毒',
  Ground: '地面',
  Flying: '飞行',
  Psychic: '超能',
  Bug: '虫',
  Rock: '岩石',
  Ghost: '幽灵',
  Dragon: '龙',
  Steel: '钢',
  Dark: '恶',
  Fairy: '妖精',
};

export const getTypeEffectiveness = (
  moveType: PokemonType,
  targetTypes: PokemonType[]
): number => {
  let multiplier = 1.0;
  for (const tType of targetTypes) {
    const chart = TYPE_CHART[moveType];
    if (chart) {
      const effectiveness = chart[tType];
      if (effectiveness !== undefined) {
        multiplier *= effectiveness;
      }
    }
  }
  return multiplier;
};
