import React from "react";
import { TYPE_COLORS, TYPE_NAMES_CN, type PokemonType } from "../../data/types";

interface TypeBadgeProps {
  type: PokemonType;
  size?: "sm" | "md";
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = "sm" }) => {
  const fontSize = size === "sm" ? 10 : 13;
  const px = size === "sm" ? 8 : 12;
  const py = size === "sm" ? 2 : 4;

  return (
    <span
      style={{
        display: "inline-block",
        fontSize,
        fontWeight: 700,
        color: "#fff",
        backgroundColor: TYPE_COLORS[type],
        padding: `${py}px ${px}px`,
        borderRadius: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {TYPE_NAMES_CN[type]}
    </span>
  );
};
