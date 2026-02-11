import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { FONT_FAMILY } from "../../styles/fonts";
import { THEME } from "../../data/types";

interface Feature {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: "👥",
    title: "队伍管理",
    subtitle: "TEAM",
    description: "携带最多6只宝可梦组建最强队伍",
    accentColor: "#06b6d4",
  },
  {
    icon: "🎒",
    title: "背包系统",
    subtitle: "BAG",
    description: "药品、精灵球、关键道具分类管理",
    accentColor: "#f97316",
  },
  {
    icon: "📖",
    title: "宝可梦图鉴",
    subtitle: "POKÉDEX",
    description: "收集全部151只宝可梦的完整资料",
    accentColor: "#ef4444",
  },
  {
    icon: "⚔️",
    title: "道馆挑战",
    subtitle: "GYM",
    description: "挑战8位馆主，收集全部徽章",
    accentColor: "#a855f7",
  },
  {
    icon: "🌦️",
    title: "天气系统",
    subtitle: "WEATHER",
    description: "雨天、晴天、沙暴影响战斗属性",
    accentColor: "#22c55e",
  },
  {
    icon: "🤝",
    title: "社交功能",
    subtitle: "SOCIAL",
    description: "好友对战、宝可梦交换、实时聊天",
    accentColor: "#3b82f6",
  },
];

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each feature gets 40 frames
  const CARD_DURATION = 40;

  // Header
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

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
      {/* Background grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          textAlign: "center",
          marginBottom: 60,
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: "#fff",
            margin: 0,
            letterSpacing: 4,
          }}
        >
          丰富的游戏功能
        </h2>
        <p style={{ fontSize: 18, color: "#64748b", marginTop: 12 }}>
          完整的宝可梦冒险体验
        </p>
      </div>

      {/* Feature cards - 2 columns x 3 rows layout, animated staggered */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 380px)",
          gap: 24,
          position: "relative",
          zIndex: 1,
        }}
      >
        {FEATURES.map((feature, i) => {
          const startFrame = i * CARD_DURATION;
          const delay = 10 + i * 8;

          const cardSpring = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 14, stiffness: 100 },
          });
          const cardY = interpolate(cardSpring, [0, 1], [60, 0]);
          const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

          // Active pulse when it's this card's "turn"
          const isActive =
            frame >= startFrame && frame < startFrame + CARD_DURATION;
          const pulseOpacity = isActive
            ? interpolate(
                Math.sin((frame - startFrame) * 0.25),
                [-1, 1],
                [0.5, 1]
              )
            : 0;

          return (
            <div
              key={i}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                padding: 28,
                borderRadius: 20,
                backgroundColor: "#0f172a",
                border: `2px solid ${isActive ? feature.accentColor + "66" : "#1e293b"}`,
                boxShadow: isActive
                  ? `0 0 30px ${feature.accentColor}22`
                  : "0 4px 20px rgba(0,0,0,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Active glow background */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: feature.accentColor,
                  opacity: pulseOpacity,
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 36 }}>{feature.icon}</span>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#fff",
                        margin: 0,
                      }}
                    >
                      {feature.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        color: feature.accentColor,
                        fontFamily: "monospace",
                        letterSpacing: 2,
                      }}
                    >
                      {feature.subtitle}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#94a3b8",
                      margin: 0,
                      marginTop: 6,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
