import React from "react";
import { Img } from "remotion";

interface PokemonSpriteProps {
  id: number;
  width?: number;
  height?: number;
  mirror?: boolean;
  style?: React.CSSProperties;
}

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
  id,
  width = 96,
  height = 96,
  mirror = false,
  style,
}) => {
  const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <Img
      src={url}
      width={width}
      height={height}
      style={{
        imageRendering: "pixelated",
        objectFit: "contain",
        transform: mirror ? "scaleX(-1)" : undefined,
        ...style,
      }}
    />
  );
};
