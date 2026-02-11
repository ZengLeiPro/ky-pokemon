import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";
import { FONT_FAMILY, TITLE_FONT } from "../../styles/fonts";
import { THEME } from "../../data/types";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main CTA text entrance
  const ctaScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
  });
  const ctaOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Brand badge
  const badgeSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const badgeY = interpolate(badgeSpring, [0, 1], [40, 0]);

  // Starter sprites
  const spriteDelay = [40, 50, 60];
  const spriteSpring = spriteDelay.map((d) =>
    spring({
      frame: Math.max(0, frame - d),
      fps,
      config: { damping: 14, stiffness: 100 },
    })
  );

  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 97 + 30) % 1920,
    baseY: 1080 - ((frame * (0.4 + (i % 5) * 0.2) + i * 55) % 1200),
    size: 2 + (i % 4) * 1.5,
    opacity: 0.15 + (i % 3) * 0.1,
  }));

  // Bottom glow
  const glowPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.6]
  );

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
      {/* Background radial gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, ${THEME.gbDarkest}66 0%, transparent 50%)`,
        }}
      />

      {/* Animated background glow */}
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 400,
          background: `radial-gradient(ellipse, ${THEME.gbScreen}22 0%, transparent 70%)`,
          opacity: glowPulse,
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.baseY,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: THEME.gbScreen,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Pokeball icon */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background:
              "linear-gradient(to bottom, #ef4444 50%, #fff 50%)",
            border: "4px solid #334155",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#fff",
              border: "3px solid #334155",
            }}
          />
        </div>
      </div>

      {/* Main CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            fontFamily: TITLE_FONT,
            color: "#fff",
            margin: 0,
            letterSpacing: 6,
            textShadow: `0 0 40px ${THEME.gbScreen}44`,
          }}
        >
          立即开始你的冒险
        </h1>
      </div>

      {/* Starter Pokemon */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 48,
          alignItems: "flex-end",
        }}
      >
        {[1, 4, 7].map((id, i) => (
          <div
            key={id}
            style={{
              opacity: spriteSpring[i],
              transform: `translateY(${interpolate(
                spriteSpring[i],
                [0, 1],
                [30, 0]
              )}px)`,
            }}
          >
            <Img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
              width={100}
              height={100}
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        ))}
      </div>

      {/* Brand */}
      <div
        style={{
          opacity: badgeSpring,
          transform: `translateY(${badgeY}px)`,
          marginTop: 48,
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "12px 32px",
            backgroundColor: "#0f172a",
            borderRadius: 12,
            border: `1px solid ${THEME.gbScreen}44`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: THEME.gbScreen,
              letterSpacing: 6,
            }}
          >
            关都传说：掌上对决
          </span>
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#475569",
            marginTop: 16,
            letterSpacing: 2,
          }}
        >
          React + TypeScript · 浏览器即玩
        </p>
      </div>
    </div>
  );
};
