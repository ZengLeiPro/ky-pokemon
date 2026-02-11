import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img } from "remotion";
import { FONT_FAMILY, TITLE_FONT } from "../../styles/fonts";
import { THEME } from "../../data/types";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title "关都传说" - spring scale entrance
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // GameBoy green accent line
  const lineWidth = interpolate(frame, [15, 55], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle "掌上对决"
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [30, 50], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const taglineOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background Pokemon silhouettes - slow drift
  const bgScale = interpolate(frame, [0, 150], [1.0, 1.15]);
  const bgOpacity = interpolate(frame, [0, 40], [0, 0.08], {
    extrapolateRight: "clamp",
  });

  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: (i * 173 + 50) % 1920,
    y: 1080 - ((frame * (0.5 + (i % 4) * 0.3) + i * 90) % 1200),
    size: 3 + (i % 3) * 2,
    opacity: interpolate(frame, [i * 3, i * 3 + 20], [0, 0.3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  }));

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
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${THEME.gbDarkest}44 0%, transparent 60%)`,
        }}
      />

      {/* Background Pokemon silhouettes */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: 120,
          opacity: bgOpacity,
          transform: `scale(${bgScale})`,
          filter: "brightness(0) invert(1)",
        }}
      >
        <Img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
          width={300}
          height={300}
          style={{ imageRendering: "pixelated" }}
        />
        <Img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png"
          width={300}
          height={300}
          style={{ imageRendering: "pixelated" }}
        />
        <Img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
          width={300}
          height={300}
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: THEME.gbScreen,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Main title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 900,
            fontFamily: TITLE_FONT,
            color: "#fff",
            textShadow: `0 0 60px ${THEME.gbScreen}66, 0 4px 0 ${THEME.gbDark}`,
            margin: 0,
            letterSpacing: 12,
          }}
        >
          关都传说
        </h1>
      </div>

      {/* Green accent line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: THEME.gbScreen,
          marginTop: 16,
          marginBottom: 16,
          borderRadius: 2,
          boxShadow: `0 0 20px ${THEME.gbScreen}88`,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: THEME.gbScreen,
            margin: 0,
            letterSpacing: 16,
            textShadow: `0 0 30px ${THEME.gbScreen}44`,
          }}
        >
          掌上对决
        </h2>
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 40,
        }}
      >
        <p
          style={{
            fontSize: 22,
            color: "#94a3b8",
            letterSpacing: 4,
            margin: 0,
          }}
        >
          初代 151 只宝可梦 · 回合制 RPG 对战
        </p>
      </div>
    </div>
  );
};
