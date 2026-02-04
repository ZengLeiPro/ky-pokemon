import { useCallback, useMemo } from 'react';
import type {
  Direction,
  GridPosition,
  InteractionResult,
  InteractionZone,
  NPCData,
} from '../types';
import { DIRECTION_VECTORS } from '../constants';

interface UseInteractionOptions {
  /** 玩家网格坐标 */
  playerPosition: GridPosition;
  /** 玩家面朝方向 */
  playerDirection: Direction;
  /** 场景中的 NPC 列表 */
  npcs: NPCData[];
  /** 场景中的交互区域列表 */
  interactions: InteractionZone[];
}

interface UseInteractionResult {
  /** 玩家面前是否有可交互对象 */
  canInteract: boolean;
  /** 获取玩家面前一格的坐标 */
  facingPosition: GridPosition;
  /** 执行交互，返回交互结果；无可交互对象时返回 null */
  interact: () => InteractionResult | null;
}

/**
 * 交互 hook：检测玩家面前一格是否有 NPC 或交互区域。
 */
export function useInteraction({
  playerPosition,
  playerDirection,
  npcs,
  interactions,
}: UseInteractionOptions): UseInteractionResult {
  // 计算玩家面前一格的坐标
  const facingPosition = useMemo<GridPosition>(() => {
    const delta = DIRECTION_VECTORS[playerDirection];
    return {
      x: playerPosition.x + delta.x,
      y: playerPosition.y + delta.y,
    };
  }, [playerPosition.x, playerPosition.y, playerDirection]);

  // 查找面前位置的 NPC
  const facingNpc = useMemo(
    () =>
      npcs.find(
        (npc) =>
          npc.position.x === facingPosition.x &&
          npc.position.y === facingPosition.y,
      ) ?? null,
    [npcs, facingPosition.x, facingPosition.y],
  );

  // 查找面前位置的交互区域
  const facingZone = useMemo(
    () =>
      interactions.find(
        (zone) =>
          zone.position.x === facingPosition.x &&
          zone.position.y === facingPosition.y,
      ) ?? null,
    [interactions, facingPosition.x, facingPosition.y],
  );

  // 也检查玩家脚下的交互区域（踩上去触发的，如传送点）
  const standingZone = useMemo(
    () =>
      interactions.find(
        (zone) =>
          zone.position.x === playerPosition.x &&
          zone.position.y === playerPosition.y &&
          (zone.type === 'warp' || zone.type === 'door'),
      ) ?? null,
    [interactions, playerPosition.x, playerPosition.y],
  );

  const canInteract = facingNpc !== null || facingZone !== null;

  const interact = useCallback((): InteractionResult | null => {
    // 优先判断面前的 NPC
    if (facingNpc) {
      return { type: 'npc', npc: facingNpc };
    }
    // 再判断面前的交互区域
    if (facingZone) {
      return { type: 'zone', zone: facingZone };
    }
    // 最后检查脚下的传送/门区域
    if (standingZone) {
      return { type: 'zone', zone: standingZone };
    }
    return null;
  }, [facingNpc, facingZone, standingZone]);

  return { canInteract, facingPosition, interact };
}
