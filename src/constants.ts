// 重新导出 shared 常量
export * from '@shared/constants';

// 前端特有常量
import type { PokemonType } from '@shared/types';

/** 精灵球图片映射 */
export const BALL_IMAGES: Record<string, string> = {
  pokeball: '/assets/balls/pokeball.png',
  greatball: '/assets/balls/greatball.png',
  ultraball: '/assets/balls/ultraball.png',
  levelball: '/assets/balls/levelball.png',
};

export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  Grass: '#7AC74C',
  Electric: '#F7D02C',
  Ice: '#96D9D6',
  Fighting: '#C22E28',
  Poison: '#A33EA1',
  Ground: '#E2BF65',
  Flying: '#A98FF3',
  Psychic: '#F95587',
  Bug: '#A6B91A',
  Rock: '#B6A136',
  Ghost: '#735797',
  Dragon: '#6F35FC',
  Steel: '#B7B7CE',
  Dark: '#705746',
  Fairy: '#D685AD',
};
