import { renderSpriteFrame } from './spritesheet';
import type { Direction } from '../types';

const SPRITE_URL = '/sprites/player/girl1.png';

export function getPlayerSprite(
  direction: Direction,
  frame: number,
  size: number
) {
  return renderSpriteFrame(SPRITE_URL, direction, frame, size);
}
