import { renderSpriteFrame } from './spritesheet';
import type { Direction } from '../types';

const SPRITE_URL = '/sprites/player/ash.png?v=2';

export function getPlayerSprite(
  direction: Direction,
  frame: number,
  size: number
) {
  return renderSpriteFrame(SPRITE_URL, direction, frame, size);
}
