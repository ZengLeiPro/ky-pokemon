import { getPlayerSprite as getOriginal } from './player';
import { getPlayerSprite as getV1 } from './player-v1';
import { getPlayerSprite as getV2 } from './player-v2';
import { getPlayerSprite as getV3 } from './player-v3';
import { getPlayerSprite as getV4 } from './player-v4';
import { getPlayerSprite as getV5 } from './player-v5';
import { getPlayerSprite as getV6 } from './player-v6';
import type { PlayerSpriteRenderer } from '../components/PlayerSprite';

export const SPRITE_VARIANTS: { label: string; renderer: PlayerSpriteRenderer }[] = [
  { label: '冒险者', renderer: getOriginal },
  { label: '女主角', renderer: getV1 },
  { label: '女孩', renderer: getV2 },
  { label: '猫女', renderer: getV3 },
  { label: '红色', renderer: getV4 },
  { label: '绿色', renderer: getV5 },
  { label: '小智', renderer: getV6 },
];

export function getRendererByIndex(index: number): PlayerSpriteRenderer {
  return SPRITE_VARIANTS[index]?.renderer ?? SPRITE_VARIANTS[0].renderer;
}
