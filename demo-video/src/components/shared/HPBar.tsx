import React from "react";

interface HPBarProps {
  percent: number;
  width?: number;
  height?: number;
}

export const HPBar: React.FC<HPBarProps> = ({
  percent,
  width = 200,
  height = 12,
}) => {
  const color =
    percent > 50 ? "#22c55e" : percent > 20 ? "#eab308" : "#dc2626";

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#334155",
        borderRadius: 9999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          height: "100%",
          backgroundColor: color,
          borderRadius: 9999,
        }}
      />
    </div>
  );
};
