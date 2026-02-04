import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, GridPosition, MapData, NPCData, PixelPosition } from '../types';
import { DIRECTION_VECTORS, MOVE_DURATION, TILE_SIZE } from '../constants';

interface UseGridMovementOptions {
  /** 初始网格坐标 */
  initialPosition: GridPosition;
  /** 初始面朝方向 */
  initialDirection?: Direction;
  /** 地图数据（用于碰撞检测和边界判断） */
  mapData: MapData;
  /** NPC 列表（用于碰撞检测） */
  npcs?: NPCData[];
  /** 是否禁止移动（如对话中） */
  frozen?: boolean;
}

interface UseGridMovementResult {
  /** 当前网格坐标 */
  position: GridPosition;
  /** 当前像素坐标（用于渲染和动画过渡） */
  pixelPosition: PixelPosition;
  /** 当前面朝方向 */
  direction: Direction;
  /** 是否正在移动 */
  isMoving: boolean;
  /** 走路动画帧：0 = 静止, 1 = 左脚, 2 = 右脚 */
  walkFrame: number;
  /** 请求向指定方向移动一格 */
  requestMove: (dir: Direction) => void;
  /** 直接设置位置（如传送） */
  teleport: (pos: GridPosition, dir?: Direction) => void;
}

/**
 * 将网格坐标转换为像素坐标
 */
function gridToPixel(grid: GridPosition): PixelPosition {
  return { x: grid.x * TILE_SIZE, y: grid.y * TILE_SIZE };
}

/**
 * 检查目标格子是否可通行
 */
function canMoveTo(
  target: GridPosition,
  mapData: MapData,
  npcs: NPCData[],
): boolean {
  // 边界检查
  if (target.x < 0 || target.x >= mapData.width) return false;
  if (target.y < 0 || target.y >= mapData.height) return false;

  // 碰撞图检查
  if (mapData.collisionMap[target.y]?.[target.x]) return false;

  // NPC 占位检查
  const npcBlocking = npcs.some(
    (npc) => npc.position.x === target.x && npc.position.y === target.y,
  );
  if (npcBlocking) return false;

  return true;
}

/**
 * 网格移动 hook。
 *
 * 核心逻辑：
 * - 一次移动整一格，网格对齐（grid-snapped）
 * - 移动过程中通过 pixelPosition 做线性插值实现平滑动画
 * - 使用 requestAnimationFrame 驱动移动插值
 * - 支持连续按住方向键：移动完一格后如果方向键仍在按住，自动继续下一格
 * - walkFrame 在移动时交替切换（0 -> 1 -> 0 -> 2 -> 0 -> 1 ...）
 */
export function useGridMovement({
  initialPosition,
  initialDirection = 'down',
  mapData,
  npcs = [],
  frozen = false,
}: UseGridMovementOptions): UseGridMovementResult {
  const [position, setPosition] = useState<GridPosition>(initialPosition);
  const [pixelPosition, setPixelPosition] = useState<PixelPosition>(
    gridToPixel(initialPosition),
  );
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [isMoving, setIsMoving] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);

  // 用 ref 持有最新状态，避免在 rAF 回调中读到过期值
  const positionRef = useRef(initialPosition);
  const isMovingRef = useRef(false);
  const frozenRef = useRef(frozen);
  const pendingDirectionRef = useRef<Direction | null>(null);
  const walkStepRef = useRef(0); // 递增计数，用于交替左右脚

  // 移动动画相关
  const moveStartTimeRef = useRef(0);
  const moveStartPixelRef = useRef<PixelPosition>({ x: 0, y: 0 });
  const moveTargetGridRef = useRef<GridPosition>({ x: 0, y: 0 });
  const moveTargetPixelRef = useRef<PixelPosition>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // 同步 frozen prop 到 ref
  frozenRef.current = frozen;

  /**
   * 移动动画帧回调
   */
  const animateMove = useCallback((timestamp: number) => {
    const elapsed = timestamp - moveStartTimeRef.current;
    const progress = Math.min(elapsed / MOVE_DURATION, 1);

    // 线性插值计算当前像素位置
    const startPx = moveStartPixelRef.current;
    const targetPx = moveTargetPixelRef.current;
    const currentX = startPx.x + (targetPx.x - startPx.x) * progress;
    const currentY = startPx.y + (targetPx.y - startPx.y) * progress;

    setPixelPosition({ x: currentX, y: currentY });

    if (progress < 1) {
      // 动画未完成，继续下一帧
      rafRef.current = requestAnimationFrame(animateMove);
    } else {
      // 动画完成：对齐到目标格子
      const targetGrid = moveTargetGridRef.current;
      positionRef.current = targetGrid;
      setPosition(targetGrid);
      setPixelPosition(targetPx);
      isMovingRef.current = false;
      setIsMoving(false);
      setWalkFrame(0);

      // 检查是否有待处理的方向（连续按住方向键）
      const pendingDir = pendingDirectionRef.current;
      if (pendingDir && !frozenRef.current) {
        // 延迟到下一微任务，确保状态已更新
        queueMicrotask(() => {
          startMoveInternal(pendingDir);
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 内部启动移动（不检查 frozen，由调用方保证）
   */
  const startMoveInternal = useCallback(
    (dir: Direction) => {
      if (isMovingRef.current) return;

      const current = positionRef.current;
      const delta = DIRECTION_VECTORS[dir];
      const target: GridPosition = {
        x: current.x + delta.x,
        y: current.y + delta.y,
      };

      // 无论能否移动，都更新朝向
      setDirection(dir);

      // 碰撞检测
      if (!canMoveTo(target, mapData, npcs)) {
        return;
      }

      // 开始移动
      isMovingRef.current = true;
      setIsMoving(true);

      // 更新走路动画帧（交替 1, 2, 1, 2 ...）
      walkStepRef.current += 1;
      setWalkFrame(walkStepRef.current % 2 === 1 ? 1 : 2);

      // 记录动画起止点
      const startPixel = gridToPixel(current);
      const targetPixel = gridToPixel(target);
      moveStartPixelRef.current = startPixel;
      moveTargetGridRef.current = target;
      moveTargetPixelRef.current = targetPixel;
      moveStartTimeRef.current = performance.now();

      // 启动动画
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(animateMove);
    },
    [mapData, npcs, animateMove],
  );

  /**
   * 请求向指定方向移动一格。
   * 如果当前正在移动中，会记录为待处理方向，移动完成后自动执行。
   */
  const requestMove = useCallback(
    (dir: Direction) => {
      // 始终更新待处理方向（支持移动中切换方向）
      pendingDirectionRef.current = dir;

      if (frozenRef.current) return;

      if (!isMovingRef.current) {
        startMoveInternal(dir);
      }
      // 如果正在移动，pending 方向会在移动完成后被消费
    },
    [startMoveInternal],
  );

  /**
   * 传送：直接设置位置，无动画
   */
  const teleport = useCallback((pos: GridPosition, dir?: Direction) => {
    // 取消进行中的动画
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    isMovingRef.current = false;
    positionRef.current = pos;
    pendingDirectionRef.current = null;
    walkStepRef.current = 0;

    setPosition(pos);
    setPixelPosition(gridToPixel(pos));
    setIsMoving(false);
    setWalkFrame(0);
    if (dir) setDirection(dir);
  }, []);

  // 方向键松开时清除待处理方向
  // 这个 effect 监听外部 frozen 变化来停止移动
  useEffect(() => {
    if (frozen) {
      pendingDirectionRef.current = null;
    }
  }, [frozen]);

  // 组件卸载时清理动画
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return {
    position,
    pixelPosition,
    direction,
    isMoving,
    walkFrame,
    requestMove,
    teleport,
  };
}
