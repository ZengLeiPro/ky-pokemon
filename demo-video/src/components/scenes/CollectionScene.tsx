import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";
import { FONT_FAMILY } from "../../styles/fonts";
import { THEME, TYPE_COLORS } from "../../data/types";
import { POKEMON, POKEDEX_GRID } from "../../data/pokemon";
import { PokemonSprite } from "../shared/PokemonSprite";
import { TypeBadge } from "../shared/TypeBadge";

const STAT_LABELS = [
  { key: "hp", label: "HP", color: "#ef4444" },
  { key: "atk", label: "攻击", color: "#f97316" },
  { key: "def", label: "防御", color: "#eab308" },
  { key: "spa", label: "特攻", color: "#3b82f6" },
  { key: "spd", label: "特防", color: "#22c55e" },
  { key: "spe", label: "速度", color: "#a855f7" },
] as const;

const EVOLUTION_CHAIN = [
  POKEMON.charmander,
  POKEMON.charmeleon,
  POKEMON.charizard,
];

export const CollectionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pokedex stats counter
  const caughtCount = POKEDEX_GRID.filter((p) => p.caught).length;
  const counterValue = interpolate(frame, [20, 60], [0, caughtCount], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Detail card slide in
  const cardSpring = spring({
    frame: Math.max(0, frame - 65),
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const cardX = interpolate(cardSpring, [0, 1], [200, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Stats bar animation
  const statsProgress = spring({
    frame: Math.max(0, frame - 100),
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  // Evolution chain (frame 170+)
  const evoOpacity = interpolate(frame, [170, 185], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: THEME.slateDarker,
        display: "flex",
        fontFamily: FONT_FAMILY,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left side: Pokedex grid */}
      <div
        style={{
          flex: 1,
          padding: "50px 40px 50px 70px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ opacity: headerOpacity, marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              letterSpacing: 2,
            }}
          >
            宝可梦图鉴
          </h2>
          <p style={{ fontSize: 18, color: "#64748b", marginTop: 8 }}>
            捕获:{" "}
            <span style={{ color: "#22c55e", fontWeight: 700 }}>
              {Math.round(counterValue)}
            </span>{" "}
            / 遇见:{" "}
            <span style={{ color: "#3b82f6", fontWeight: 700 }}>
              {POKEDEX_GRID.length}
            </span>{" "}
            / 全部: 151
          </p>
        </div>

        {/* Grid - 5 columns x 4 rows */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            flex: 1,
          }}
        >
          {POKEDEX_GRID.map((entry, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const delay = row * 5 + col * 3 + 5;

            const cellOpacity = interpolate(
              frame,
              [delay, delay + 12],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const cellScale = interpolate(
              spring({
                frame: Math.max(0, frame - delay),
                fps,
                config: { damping: 12 },
              }),
              [0, 1],
              [0.7, 1]
            );

            // Highlight box on Charmander at frame 65
            const isHighlighted = entry.id === 4 && frame >= 65;

            return (
              <div
                key={entry.id}
                style={{
                  opacity: cellOpacity,
                  transform: `scale(${cellScale})`,
                  backgroundColor: isHighlighted
                    ? "#1e293b"
                    : "#0f172a",
                  borderRadius: 12,
                  border: `2px solid ${
                    isHighlighted
                      ? THEME.gbScreen
                      : entry.caught
                        ? "#22c55e33"
                        : "#1e293b"
                  }`,
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isHighlighted
                    ? `0 0 16px ${THEME.gbScreen}44`
                    : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    color: "#475569",
                    fontFamily: "monospace",
                    marginBottom: 2,
                  }}
                >
                  #{String(entry.id).padStart(3, "0")}
                </span>
                <Img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`}
                  width={56}
                  height={56}
                  style={{
                    imageRendering: "pixelated",
                    opacity: entry.caught ? 1 : 0.3,
                    filter: entry.caught ? "none" : "grayscale(1)",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: entry.caught ? "#e2e8f0" : "#475569",
                    marginTop: 2,
                  }}
                >
                  {entry.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Detail card */}
      <div
        style={{
          width: 560,
          padding: "50px 70px 50px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateX(${cardX}px)`,
          opacity: cardOpacity,
        }}
      >
        {/* Pokemon detail card */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: 24,
            padding: 36,
            border: "1px solid #334155",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top: Sprite + name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 16,
                backgroundColor: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${TYPE_COLORS.Fire}33`,
              }}
            >
              <PokemonSprite id={4} width={96} height={96} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  fontFamily: "monospace",
                  marginBottom: 4,
                }}
              >
                #004
              </div>
              <h3
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#fff",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                小火龙
              </h3>
              <div style={{ display: "flex", gap: 6 }}>
                <TypeBadge type="Fire" size="md" />
              </div>
            </div>
          </div>

          {/* Stats bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {STAT_LABELS.map((stat) => {
              const value =
                POKEMON.charmander.baseStats[
                  stat.key as keyof typeof POKEMON.charmander.baseStats
                ];
              const barWidth = interpolate(
                statsProgress,
                [0, 1],
                [0, (value / 160) * 100]
              );

              return (
                <div
                  key={stat.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#94a3b8",
                      textAlign: "right",
                    }}
                  >
                    {stat.label}
                  </span>
                  <span
                    style={{
                      width: 30,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "monospace",
                    }}
                  >
                    {Math.round(interpolate(statsProgress, [0, 1], [0, value]))}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 10,
                      backgroundColor: "#0f172a",
                      borderRadius: 5,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        backgroundColor: stat.color,
                        borderRadius: 5,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Evolution chain */}
          <div style={{ marginTop: 28, opacity: evoOpacity }}>
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              进化链
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {EVOLUTION_CHAIN.map((mon, idx) => {
                const evoDelay = 175 + idx * 15;
                const evoSpring = spring({
                  frame: Math.max(0, frame - evoDelay),
                  fps,
                  config: { damping: 12 },
                });
                const evoX = interpolate(evoSpring, [0, 1], [40, 0]);

                return (
                  <React.Fragment key={mon.id}>
                    {idx > 0 && (
                      <div
                        style={{
                          fontSize: 20,
                          color: "#475569",
                          opacity: evoSpring,
                        }}
                      >
                        →
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        opacity: evoSpring,
                        transform: `translateX(${evoX}px)`,
                      }}
                    >
                      <PokemonSprite id={mon.id} width={64} height={64} />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginTop: 4,
                        }}
                      >
                        {mon.name}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
