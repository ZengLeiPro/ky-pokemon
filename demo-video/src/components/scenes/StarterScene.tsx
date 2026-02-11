import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { FONT_FAMILY } from "../../styles/fonts";
import { THEME } from "../../data/types";
import { POKEMON } from "../../data/pokemon";
import { PokemonSprite } from "../shared/PokemonSprite";
import { TypeBadge } from "../shared/TypeBadge";

const STARTERS = [
  {
    key: "bulbasaur",
    bgFrom: "#10b981",
    bgTo: "#064e3b",
    borderColor: "#10b98180",
    textColor: "#6ee7b7",
  },
  {
    key: "charmander",
    bgFrom: "#f97316",
    bgTo: "#7c2d12",
    borderColor: "#f9731680",
    textColor: "#fdba74",
  },
  {
    key: "squirtle",
    bgFrom: "#3b82f6",
    bgTo: "#1e3a5f",
    borderColor: "#3b82f680",
    textColor: "#93c5fd",
  },
];

export const StarterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header text
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const headerY = interpolate(frame, [0, 20], [-30, 0], {
    extrapolateRight: "clamp",
  });

  // Selection highlight on Charmander at frame 90
  const highlightProgress = spring({
    frame: Math.max(0, frame - 85),
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const selectedIndex = frame >= 85 ? 1 : -1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: THEME.slateDarker,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle radial bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 30%, #1e293b 0%, #020617 70%)",
        }}
      />

      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          textAlign: "center",
          marginBottom: 60,
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#fff",
            margin: 0,
            letterSpacing: 4,
          }}
        >
          选择你的伙伴
        </h2>
        <p
          style={{
            fontSize: 20,
            color: "#94a3b8",
            marginTop: 12,
            letterSpacing: 2,
          }}
        >
          这将是你冒险旅程的第一位队友
        </p>
      </div>

      {/* Starter cards - horizontal layout */}
      <div
        style={{
          display: "flex",
          gap: 48,
          position: "relative",
          zIndex: 1,
        }}
      >
        {STARTERS.map((starter, i) => {
          const pokemon = POKEMON[starter.key];
          const delay = 20 + i * 12;

          const cardSpring = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 14, stiffness: 100 },
          });
          const cardY = interpolate(cardSpring, [0, 1], [80, 0]);
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

          const isSelected = selectedIndex === i;
          const selectedScale = isSelected
            ? interpolate(highlightProgress, [0, 1], [1, 1.08])
            : 1;

          // Glow pulse for selected card
          const glowOpacity = isSelected
            ? interpolate(
                Math.sin((frame - 85) * 0.2),
                [-1, 1],
                [0.3, 0.7]
              ) * highlightProgress
            : 0;

          return (
            <div
              key={starter.key}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px) scale(${selectedScale})`,
                width: 320,
                padding: 40,
                borderRadius: 24,
                background: `linear-gradient(135deg, ${starter.bgFrom}33 0%, ${starter.bgTo}66 100%)`,
                border: `2px solid ${isSelected ? starter.borderColor : "#ffffff15"}`,
                boxShadow: isSelected
                  ? `0 0 40px ${starter.bgFrom}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}`
                  : "0 8px 32px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* STARTER label */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#ffffff60",
                  textTransform: "uppercase",
                  letterSpacing: 4,
                  marginBottom: 8,
                }}
              >
                STARTER
              </span>

              {/* Sprite */}
              <div style={{ marginBottom: 20 }}>
                <PokemonSprite id={pokemon.id} width={140} height={140} />
              </div>

              {/* Name */}
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: starter.textColor,
                  marginBottom: 12,
                }}
              >
                {pokemon.name}
              </span>

              {/* Type badges */}
              <div style={{ display: "flex", gap: 6 }}>
                {pokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="md" />
                ))}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: -12,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: starter.bgFrom,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: highlightProgress,
                    transform: `scale(${highlightProgress})`,
                    boxShadow: `0 0 20px ${starter.bgFrom}88`,
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>
                    ✓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quote at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          opacity: interpolate(frame, [50, 70], [0, 0.5], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: "#475569",
            fontStyle: "italic",
            letterSpacing: 2,
          }}
        >
          "去吧！去创造属于你的宝可梦大师传奇！"
        </p>
      </div>
    </div>
  );
};
