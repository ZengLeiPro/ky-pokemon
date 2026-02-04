import { useMemo } from 'react';
import type { PixelPosition } from '../types';
import { TILE_SIZE } from '../constants';

interface UseCameraOptions {
  /** 玩家像素坐标 */
  playerPixelPosition: PixelPosition;
  /** 地图宽度（列数） */
  mapWidth: number;
  /** 地图高度（行数） */
  mapHeight: number;
  /** 视口宽度（像素） */
  viewportWidth: number;
  /** 视口高度（像素） */
  viewportHeight: number;
}

interface CameraResult {
  /** 镜头 X 偏移（CSS transform translateX 值，为负数） */
  cameraX: number;
  /** 镜头 Y 偏移（CSS transform translateY 值，为负数） */
  cameraY: number;
}

/**
 * 镜头 hook：计算镜头偏移使玩家居中，并钳制到地图边界。
 *
 * 镜头逻辑：
 * 1. 理想位置 = 玩家像素中心 - 视口半宽/半高
 * 2. 钳制在 [0, 地图像素尺寸 - 视口尺寸] 范围内
 * 3. 返回负值用于 CSS transform
 */
export function useCamera({
  playerPixelPosition,
  mapWidth,
  mapHeight,
  viewportWidth,
  viewportHeight,
}: UseCameraOptions): CameraResult {
  const cameraX = useMemo(() => {
    const mapPixelWidth = mapWidth * TILE_SIZE;
    // 玩家像素中心（瓦片中心）
    const playerCenterX = playerPixelPosition.x + TILE_SIZE / 2;
    // 理想偏移：让玩家处于视口中央
    const idealX = playerCenterX - viewportWidth / 2;
    // 钳制到地图边界
    const maxX = Math.max(0, mapPixelWidth - viewportWidth);
    const clampedX = Math.max(0, Math.min(idealX, maxX));
    return -clampedX;
  }, [playerPixelPosition.x, mapWidth, viewportWidth]);

  const cameraY = useMemo(() => {
    const mapPixelHeight = mapHeight * TILE_SIZE;
    const playerCenterY = playerPixelPosition.y + TILE_SIZE / 2;
    const idealY = playerCenterY - viewportHeight / 2;
    const maxY = Math.max(0, mapPixelHeight - viewportHeight);
    const clampedY = Math.max(0, Math.min(idealY, maxY));
    return -clampedY;
  }, [playerPixelPosition.y, mapHeight, viewportHeight]);

  return { cameraX, cameraY };
}
