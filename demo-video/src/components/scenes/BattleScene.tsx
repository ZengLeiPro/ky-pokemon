import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { FONT_FAMILY } from "../../styles/fonts";
import { THEME } from "../../data/types";
import { PokemonSprite } from "../shared/PokemonSprite";
import { HPBar } from "../shared/HPBar";
import { TypeBadge } from "../shared/TypeBadge";

const MOVES = [
  { name: "火花", type: "Fire" as const, pp: "25/25" },
  { name: "抓", type: "Normal" as const, pp: "35/35" },
  { name: "叫声", type: "Normal" as const, pp: "40/40" },
  { name: "金属爪", type: "Steel" as const, pp: "35/35" },
];

export const BattleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: UI entrance (0-60)
  const enemyInfoY = interpolate(frame, [0, 30], [-80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enemyInfoOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const playerInfoY = interpolate(frame, [10, 40], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const playerInfoOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sprites fade in
  const spriteOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: Move selection (60-120)
  const movesPanelY = interpolate(frame, [60, 85], [120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const movesPanelOpacity = interpolate(frame, [60, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight "火花" at frame 100
  const moveHighlightOpacity = interpolate(frame, [95, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3: Attack animation (120-180)
  const attackLunge =
    frame >= 130 && frame <= 150
      ? interpolate(frame, [130, 140, 150], [0, 100, 0])
      : 0;
  const attackLungeY =
    frame >= 130 && frame <= 150
      ? interpolate(frame, [130, 140, 150], [0, -40, 0])
      : 0;

  // Fire flash
  const fireFlash =
    frame >= 138 && frame < 155
      ? interpolate(frame, [138, 143, 155], [0, 0.5, 0])
      : 0;

  // Damage shake on enemy
  const enemyShake =
    frame >= 145 && frame < 165
      ? Math.sin((frame - 145) * 1.5) * interpolate(frame, [145, 165], [8, 0])
      : 0;

  // Phase 4: HP decrease (165-195)
  const enemyHp = interpolate(frame, [165, 195], [100, 35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 5: Super effective text (195-230)
  const seScale =
    frame >= 195
      ? spring({
          frame: frame - 195,
          fps,
          config: { damping: 8, stiffness: 200 },
        })
      : 0;
  const seOpacity = interpolate(frame, [195, 205, 240, 255], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 6: Enemy faints (240-270)
  const enemyFaintY =
    frame >= 240
      ? interpolate(frame, [240, 265], [0, 120], {
          extrapolateRight: "clamp",
        })
      : 0;
  const enemyFaintOpacity =
    frame >= 240
      ? interpolate(frame, [240, 265], [1, 0], {
          extrapolateRight: "clamp",
        })
      : 1;

  // Victory text (265+)
  const victoryScale =
    frame >= 265
      ? spring({
          frame: frame - 265,
          fps,
          config: { damping: 10, stiffness: 100 },
        })
      : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, #1e293b 0%, #0f172a 50%, #000 100%)",
        }}
      />

      {/* Platform effects */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          right: "10%",
          width: 400,
          height: 60,
          background: "rgba(0,0,0,0.3)",
          borderRadius: "50%",
          filter: "blur(12px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "25%",
          left: "5%",
          width: 500,
          height: 80,
          background: "rgba(0,0,0,0.4)",
          borderRadius: "50%",
          filter: "blur(16px)",
        }}
      />

      {/* Enemy info panel - top left */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          opacity: enemyInfoOpacity,
          transform: `translateY(${enemyInfoY}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(8px)",
            padding: "16px 24px",
            borderRadius: 12,
            borderLeft: "4px solid #ef4444",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            width: 320,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
              皮卡丘
            </span>
            <span
              style={{ fontSize: 13, fontFamily: "monospace", color: "#f87171" }}
            >
              Lv.15
            </span>
          </div>
          <HPBar percent={enemyHp} width={270} height={10} />
          <div
            style={{
              textAlign: "right",
              fontSize: 11,
              color: "#64748b",
              fontFamily: "monospace",
              marginTop: 4,
            }}
          >
            {Math.round((enemyHp / 100) * 48)}/48
          </div>
        </div>
      </div>

      {/* Enemy sprite - top right */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 200,
          opacity: spriteOpacity * enemyFaintOpacity,
          transform: `translateX(${enemyShake}px) translateY(${enemyFaintY}px)`,
          zIndex: 5,
        }}
      >
        <PokemonSprite id={25} width={200} height={200} />
      </div>

      {/* Player sprite - bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 180,
          opacity: spriteOpacity,
          transform: `translateX(${attackLunge}px) translateY(${attackLungeY}px)`,
          zIndex: 5,
        }}
      >
        <PokemonSprite id={4} width={220} height={220} mirror />
      </div>

      {/* Player info panel - bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          right: 80,
          opacity: playerInfoOpacity,
          transform: `translateY(${playerInfoY}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(8px)",
            padding: "16px 24px",
            borderRadius: 12,
            borderRight: "4px solid #06b6d4",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            width: 340,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
                小火龙
              </span>
              <TypeBadge type="Fire" />
            </div>
            <span
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: "#22d3ee",
              }}
            >
              Lv.10
            </span>
          </div>
          <HPBar percent={78} width={290} height={10} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
              31/40
            </span>
            {/* EXP bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: "#64748b" }}>EXP</span>
              <div
                style={{
                  width: 100,
                  height: 4,
                  backgroundColor: "#1e293b",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    width: "60%",
                    height: "100%",
                    backgroundColor: "#3b82f6",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Move selection panel */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: `translateX(-50%) translateY(${movesPanelY}px)`,
          opacity: movesPanelOpacity,
          display: "flex",
          gap: 16,
          zIndex: 15,
        }}
      >
        {MOVES.map((move, i) => {
          const isHighlighted = i === 0 && frame >= 95;
          return (
            <div
              key={move.name}
              style={{
                width: 200,
                padding: "16px 20px",
                backgroundColor: isHighlighted ? "#1e293b" : "#0f172a",
                borderRadius: 14,
                border: `2px solid ${isHighlighted ? THEME.gbScreen : "#334155"}`,
                boxShadow: isHighlighted
                  ? `0 0 20px ${THEME.gbScreen}44`
                  : "0 4px 16px rgba(0,0,0,0.3)",
                opacity:
                  isHighlighted
                    ? 1
                    : interpolate(
                        moveHighlightOpacity,
                        [0, 1],
                        [1, 0.5]
                      ),
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}
                >
                  {move.name}
                </span>
                <TypeBadge type={move.type} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  fontFamily: "monospace",
                }}
              >
                PP {move.pp}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fire flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 65% 30%, #EE813088 0%, transparent 50%)",
          opacity: fireFlash,
          pointerEvents: "none",
          zIndex: 12,
        }}
      />

      {/* Super effective text */}
      {frame >= 195 && frame < 255 && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${seScale})`,
            opacity: seOpacity,
            zIndex: 20,
          }}
        >
          <div
            style={{
              padding: "12px 32px",
              backgroundColor: "#16a34a",
              borderRadius: 12,
              boxShadow: "0 0 40px #16a34a88",
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: 4,
              }}
            >
              效果拔群！
            </span>
          </div>
        </div>
      )}

      {/* Victory overlay */}
      {frame >= 265 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            zIndex: 25,
            transform: `scale(${victoryScale})`,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#fbbf24",
              textShadow: "0 0 40px #fbbf2466",
              letterSpacing: 12,
            }}
          >
            胜利！
          </span>
          <span
            style={{
              fontSize: 22,
              color: "#94a3b8",
              marginTop: 16,
              letterSpacing: 2,
            }}
          >
            获得了 180 经验值
          </span>
        </div>
      )}
    </div>
  );
};
