import React from 'react';
import { PokemonType } from '../../types';
import { TYPE_COLORS, TYPE_TRANSLATIONS } from '../../constants';

interface TypeBadgeProps {
  type: PokemonType;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  return (
    <span 
      className="px-2 py-0.5 text-[10px] uppercase font-bold rounded text-white shadow-sm"
      style={{ backgroundColor: TYPE_COLORS[type] }}
    >
      {TYPE_TRANSLATIONS[type]}
    </span>
  );
};

export default TypeBadge;