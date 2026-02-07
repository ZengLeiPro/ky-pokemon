// ============================================================
// 游戏世界主容器 - 整合所有子系统
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, MapData, NPCData, InteractionResult } from '../types';
import { TILE_SIZE } from '../constants';
import { useGridMovement } from '../hooks/useGridMovement';
import { useCamera } from '../hooks/useCamera';
import { useKeyboard } from '../hooks/useKeyboard';
import { useInteraction } from '../hooks/useInteraction';
import { TileMapRenderer } from './TileMapRenderer';
import { PlayerSprite } from './PlayerSprite';
import type { PlayerSpriteRenderer } from './PlayerSprite';
import { NPCSprite } from './NPCSprite';
import { VirtualJoystick } from './VirtualJoystick';
import { DialogBox } from './DialogBox';

interface GameWorldProps {
  /** 地图数据 */
  mapData: MapData;
  /** 初始出生点名称（对应 mapData.spawns 中的 key） */
  initialSpawn?: string;
  /** 场景切换回调 */
  onSceneChange?: (sceneId: string, spawnId: string) => void;
  /** 特殊交互回调（heal, open-pc, battle 等） */
  onInteraction?: (type: string, data: unknown) => void;
  /** 自定义玩家精灵渲染函数 */
  playerSpriteRenderer?: PlayerSpriteRenderer;
}

/**
 * 游戏世界主容器。
 *
 * 整合渲染层级：
 * ground tiles -> objects tiles -> NPCs -> Player -> overhead tiles -> Dialog
 *
 * 管理：
 * - 玩家移动（键盘 + 虚拟摇杆）
 * - 镜头跟随
 * - NPC 对话流程
 * - 场景切换（门/传送）
 * - 特殊交互回调
 */
export function GameWorld({
  mapData,
  initialSpawn,
  onSceneChange,
  onInteraction,
  playerSpriteRenderer,
}: GameWorldProps) {
  // 容器 ref，用于测量视口尺寸
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // 对话状态
  const [dialogActive, setDialogActive] = useState(false);
  const [dialogTexts, setDialogTexts] = useState<string[]>([]);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogSpeaker, setDialogSpeaker] = useState<string | undefined>();
  const [dialogCallback, setDialogCallback] = useState<string | undefined>();
  const dialogNpcRef = useRef<NPCData | null>(null);

  // 摇杆方向
  const joystickDirRef = useRef<Direction | null>(null);

  // 计算初始出生点
  const spawnPos =
    (initialSpawn && mapData.spawns[initialSpawn]) ??
    mapData.spawns['default'] ??
    { x: 1, y: 1 };

  // 玩家移动
  const {
    position: playerPosition,
    pixelPosition: playerPixelPosition,
    direction: playerDirection,
    isMoving: playerIsMoving,
    walkFrame,
    requestMove,
    clearPending,
    teleport,
  } = useGridMovement({
    initialPosition: spawnPos,
    mapData,
    npcs: mapData.npcs,
    frozen: dialogActive,
  });

  // 键盘输入
  const { pressedDirection, interactPressed, resetInteract } = useKeyboard();

  // 镜头
  const { cameraX, cameraY } = useCamera({
    playerPixelPosition,
    mapWidth: mapData.width,
    mapHeight: mapData.height,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
  });

  // 交互检测
  const { interact } = useInteraction({
    playerPosition,
    playerDirection,
    npcs: mapData.npcs,
    interactions: mapData.interactions,
  });

  // ---- 视口尺寸响应式 ----
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ---- 键盘驱动移动 ----
  useEffect(() => {
    if (dialogActive) return;
    if (pressedDirection) {
      requestMove(pressedDirection);
    } else {
      clearPending();
    }
  }, [pressedDirection, dialogActive, requestMove, clearPending]);

  // ---- 摇杆驱动移动（使用 requestAnimationFrame 轮询） ----
  useEffect(() => {
    if (dialogActive) return;

    let rafId: number;
    const poll = () => {
      const dir = joystickDirRef.current;
      if (dir) {
        requestMove(dir);
      }
      rafId = requestAnimationFrame(poll);
    };
    rafId = requestAnimationFrame(poll);

    return () => cancelAnimationFrame(rafId);
  }, [dialogActive, requestMove]);

  // ---- 处理交互结果 ----
  const handleInteractionResult = useCallback(
    (result: InteractionResult) => {
      if (result.type === 'npc' && result.npc) {
        const npc = result.npc;
        dialogNpcRef.current = npc;
        setDialogTexts(npc.dialog);
        setDialogIndex(0);
        setDialogSpeaker(npc.name);
        setDialogCallback(npc.onInteract);
        setDialogActive(true);
      } else if (result.type === 'zone' && result.zone) {
        const zone = result.zone;
        if (
          (zone.type === 'door' || zone.type === 'warp') &&
          zone.targetScene &&
          zone.targetSpawn
        ) {
          // 场景切换
          onSceneChange?.(zone.targetScene, zone.targetSpawn);
        } else if (zone.message) {
          // 标牌 / 物品交互（显示提示信息）
          setDialogTexts([zone.message]);
          setDialogIndex(0);
          setDialogSpeaker(undefined);
          setDialogCallback(zone.onInteract);
          setDialogActive(true);
          dialogNpcRef.current = null;
        } else if (zone.onInteract) {
          // 无提示信息但有回调的交互区域，直接触发
          onInteraction?.(zone.onInteract, { zone });
        }
      }
    },
    [onSceneChange],
  );

  // ---- 键盘交互键 ----
  useEffect(() => {
    if (!interactPressed) return;
    resetInteract();

    if (dialogActive) {
      // 对话中的交互由 DialogBox 内部处理
      return;
    }

    const result = interact();
    if (result) {
      handleInteractionResult(result);
    }
  }, [interactPressed, resetInteract, dialogActive, interact, handleInteractionResult]);

  // ---- 脚下传送检测（玩家到达新格子时检查） ----
  useEffect(() => {
    if (playerIsMoving || dialogActive) return;

    const zone = mapData.interactions.find(
      (z) =>
        z.position.x === playerPosition.x &&
        z.position.y === playerPosition.y &&
        (z.type === 'warp' || z.type === 'door') &&
        z.targetScene &&
        z.targetSpawn,
    );

    if (zone && zone.targetScene && zone.targetSpawn) {
      onSceneChange?.(zone.targetScene, zone.targetSpawn);
    }
  }, [playerPosition.x, playerPosition.y, playerIsMoving, dialogActive, mapData.interactions, onSceneChange]);

  // ---- 摇杆方向变化 ----
  const handleJoystickDirection = useCallback((dir: Direction | null) => {
    joystickDirRef.current = dir;
    if (!dir) {
      clearPending();
    }
  }, [clearPending]);

  // ---- 摇杆 A 按钮 ----
  const handleJoystickInteract = useCallback(() => {
    if (dialogActive) {
      // 对话中不通过摇杆推进（DialogBox 自己处理点击）
      return;
    }

    const result = interact();
    if (result) {
      handleInteractionResult(result);
    }
  }, [dialogActive, interact, handleInteractionResult]);

  // ---- 对话推进 ----
  const handleDialogAdvance = useCallback(() => {
    setDialogIndex((prev) => prev + 1);
  }, []);

  // ---- 对话关闭 ----
  const handleDialogClose = useCallback(() => {
    setDialogActive(false);

    // 触发 NPC 交互回调
    if (dialogCallback) {
      onInteraction?.(dialogCallback, {
        npc: dialogNpcRef.current,
      });
    }

    // 清理
    dialogNpcRef.current = null;
    setDialogCallback(undefined);
  }, [dialogCallback, onInteraction]);

  const tileSize = TILE_SIZE;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        overflow: 'hidden',
        backgroundColor: '#101828',
        touchAction: 'none',
      }}
    >
      {/* 地图容器（随镜头移动） */}
      <div
        style={{
          position: 'absolute',
          width: mapData.width * tileSize,
          height: mapData.height * tileSize,
          transform: `translate(${cameraX}px, ${cameraY}px)`,
          willChange: 'transform',
        }}
      >
        {/* 地面层 */}
        <TileMapRenderer mapData={mapData} layer="ground" tileSize={tileSize} />

        {/* 物体层 */}
        <TileMapRenderer mapData={mapData} layer="objects" tileSize={tileSize} />

        {/* NPC 精灵 */}
        {mapData.npcs.map((npc) => (
          <NPCSprite key={npc.id} npc={npc} tileSize={tileSize} />
        ))}

        {/* 玩家精灵 */}
        <PlayerSprite
          pixelPosition={playerPixelPosition}
          direction={playerDirection}
          walkFrame={walkFrame}
          tileSize={tileSize}
          spriteRenderer={playerSpriteRenderer}
        />

        {/* 头顶层（渲染在玩家上方） */}
        <TileMapRenderer mapData={mapData} layer="overhead" tileSize={tileSize} />
      </div>

      {/* 对话框（固定在视口内） */}
      {dialogActive && (
        <DialogBox
          texts={dialogTexts}
          currentIndex={dialogIndex}
          speakerName={dialogSpeaker}
          onAdvance={handleDialogAdvance}
          onClose={handleDialogClose}
        />
      )}

      {/* 虚拟摇杆（固定在视口底部） */}
      <VirtualJoystick
        onDirectionChange={handleJoystickDirection}
        onInteract={handleJoystickInteract}
      />
    </div>
  );
}
