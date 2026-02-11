import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { FONT_FAMILY } from "../../styles/fonts";
import { THEME } from "../../data/types";
import { KANTO_LOCATIONS, TRAVEL_PATH } from "../../data/locations";
import { PokemonSprite } from "../shared/PokemonSprite";

export const ExplorationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Map scale factor for the right portion
  const mapScale = 1.4;
  const mapOffsetX = 60;
  const mapOffsetY = 80;

  // Travel dot animation
  const travelProgress = interpolate(frame, [70, 150], [0, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentTravelIndex = Math.min(
    Math.floor(travelProgress),
    TRAVEL_PATH.length - 2
  );
  const travelFrac = travelProgress - currentTravelIndex;

  const getLocationPos = (id: string) => {
    const loc = KANTO_LOCATIONS.find((l) => l.id === id);
    return loc
      ? { x: loc.x * mapScale + mapOffsetX, y: loc.y * mapScale + mapOffsetY }
      : { x: 0, y: 0 };
  };

  // Current travel dot position
  const fromPos = getLocationPos(TRAVEL_PATH[currentTravelIndex]);
  const toPos = getLocationPos(
    TRAVEL_PATH[Math.min(currentTravelIndex + 1, TRAVEL_PATH.length - 1)]
  );
  const dotX = interpolate(travelFrac, [0, 1], [fromPos.x, toPos.x]);
  const dotY = interpolate(travelFrac, [0, 1], [fromPos.y, toPos.y]);

  // Location info card
  const activeLocationIndex = Math.min(
    Math.floor(travelProgress),
    TRAVEL_PATH.length - 1
  );
  const activeLoc = KANTO_LOCATIONS.find(
    (l) => l.id === TRAVEL_PATH[activeLocationIndex]
  );

  const cardOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Wild encounter flash (frame 180-240)
  const encounterFlash =
    frame >= 180 && frame < 192
      ? interpolate(frame, [180, 185, 192], [0, 0.8, 0])
      : 0;

  const encounterTextOpacity = interpolate(frame, [192, 205], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pikachuScale =
    frame >= 195
      ? spring({
          frame: frame - 195,
          fps,
          config: { damping: 10, stiffness: 150 },
        })
      : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: THEME.slateDarker,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Left side: Map */}
      <div
        style={{
          flex: 1,
          position: "relative",
          padding: 60,
        }}
      >
        {/* Section title */}
        <div
          style={{
            opacity: headerOpacity,
            marginBottom: 30,
          }}
        >
          <h2
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              letterSpacing: 2,
            }}
          >
            探索关都地区
          </h2>
          <p style={{ fontSize: 18, color: "#64748b", marginTop: 8 }}>
            30+ 个地点等你探索
          </p>
        </div>

        {/* Map connections */}
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        >
          {KANTO_LOCATIONS.map((loc) =>
            loc.connections.map((connId) => {
              const target = KANTO_LOCATIONS.find((l) => l.id === connId);
              if (!target) return null;
              const nodeDelay =
                KANTO_LOCATIONS.indexOf(loc) * 6 +
                KANTO_LOCATIONS.indexOf(target) * 6;
              const lineOpacity = interpolate(
                frame,
                [nodeDelay + 10, nodeDelay + 25],
                [0, 0.3],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <line
                  key={`${loc.id}-${connId}`}
                  x1={loc.x * mapScale + mapOffsetX}
                  y1={loc.y * mapScale + mapOffsetY}
                  x2={target.x * mapScale + mapOffsetX}
                  y2={target.y * mapScale + mapOffsetY}
                  stroke={THEME.gbScreen}
                  strokeWidth={2}
                  opacity={lineOpacity}
                />
              );
            })
          )}
        </svg>

        {/* Map nodes */}
        {KANTO_LOCATIONS.map((loc, i) => {
          const nodeDelay = i * 6;
          const nodeOpacity = interpolate(
            frame,
            [nodeDelay, nodeDelay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const nodeScale = spring({
            frame: Math.max(0, frame - nodeDelay),
            fps,
            config: { damping: 12, stiffness: 150 },
          });

          const isActive = TRAVEL_PATH.includes(loc.id);
          const isPassed =
            TRAVEL_PATH.indexOf(loc.id) <= activeLocationIndex &&
            frame >= 70;

          return (
            <div
              key={loc.id}
              style={{
                position: "absolute",
                left: loc.x * mapScale + mapOffsetX - 6,
                top: loc.y * mapScale + mapOffsetY - 6,
                opacity: nodeOpacity,
                transform: `scale(${nodeScale})`,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: isPassed
                    ? THEME.gbScreen
                    : isActive
                      ? "#64748b"
                      : "#334155",
                  border: `2px solid ${isPassed ? THEME.gbLight : "#475569"}`,
                  boxShadow: isPassed
                    ? `0 0 12px ${THEME.gbScreen}88`
                    : "none",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 18,
                  top: -4,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isPassed ? THEME.gbScreen : "#94a3b8",
                  whiteSpace: "nowrap",
                }}
              >
                {loc.name}
              </span>
            </div>
          );
        })}

        {/* Travel dot */}
        {frame >= 70 && frame < 180 && (
          <div
            style={{
              position: "absolute",
              left: dotX - 8,
              top: dotY - 8,
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#fbbf24",
              boxShadow: "0 0 20px #fbbf2488, 0 0 40px #fbbf2444",
              zIndex: 10,
            }}
          />
        )}
      </div>

      {/* Right side: Location card + encounter */}
      <div
        style={{
          width: 600,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 60,
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Location info card */}
        {activeLoc && frame < 180 && (
          <div
            style={{
              opacity: cardOpacity,
              backgroundColor: "#1e293b",
              borderRadius: 20,
              padding: 36,
              border: "1px solid #334155",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 3,
                marginBottom: 8,
              }}
            >
              当前位置
            </div>
            <h3
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: "#fff",
                margin: 0,
                marginBottom: 12,
              }}
            >
              {activeLoc.name}
            </h3>
            <p
              style={{
                fontSize: 16,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 24,
              }}
            >
              {activeLoc.description}
            </p>
            {activeLoc.gymLeader && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#0f172a",
                  borderRadius: 12,
                  border: "1px solid #334155",
                }}
              >
                <span style={{ fontSize: 20 }}>⚔️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    道馆馆主: {activeLoc.gymLeader}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {activeLoc.badge}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wild encounter overlay */}
        {frame >= 192 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: encounterTextOpacity,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: "#fbbf24",
                fontWeight: 700,
                marginBottom: 20,
                letterSpacing: 2,
              }}
            >
              野生宝可梦出现了！
            </div>
            <div style={{ transform: `scale(${pikachuScale})` }}>
              <PokemonSprite id={25} width={200} height={200} />
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#F7D02C",
                marginTop: 16,
              }}
            >
              皮卡丘 Lv.12
            </div>
          </div>
        )}
      </div>

      {/* White flash overlay for encounter */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#fff",
          opacity: encounterFlash,
          pointerEvents: "none",
          zIndex: 20,
        }}
      />
    </div>
  );
};
