import * as fs from 'fs';
import * as path from 'path';

interface Pokemon {
  id: number;
  name: string;
  nameCN: string;
  types: string[];
  stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  catchRate: number;
  learnset: { moveId: string; level: number }[];
  evolution?: { targetId: number; targetName: string; level?: number; item?: string };
}

interface Move {
  id: string;
  name: string;
  nameCN: string;
  type: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  description: string;
}

const dataDir = path.join(process.cwd(), 'scripts', 'data');
const pokemon: Pokemon[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'gen1-pokemon.json'), 'utf-8'));
const moves: Move[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'gen1-moves.json'), 'utf-8'));

function generateMovesCode(): string {
  const lines: string[] = [];
  lines.push('export const MOVES: Record<string, Move> = {');

  for (const move of moves) {
    const desc = move.description.replace(/'/g, "\\'").replace(/\n/g, ' ');
    lines.push(`  '${move.id}': { id: '${move.id}', name: '${move.nameCN}', type: '${move.type}', category: '${move.category}', power: ${move.power}, accuracy: ${move.accuracy}, ppMax: ${move.pp}, description: '${desc}' },`);
  }

  lines.push('};');
  return lines.join('\n');
}

function generateSpeciesCode(): string {
  const lines: string[] = [];
  lines.push('export const SPECIES_DATA: Record<string, SpeciesData> = {');

  for (const p of pokemon) {
    const types = p.types.map((t) => `'${t}'`).join(', ');
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;

    lines.push(`  '${p.name}': {`);
    lines.push(`    pokedexId: ${p.id},`);
    lines.push(`    speciesName: '${p.nameCN}',`);
    lines.push(`    types: [${types}],`);
    lines.push(`    baseStats: { hp: ${p.stats.hp}, atk: ${p.stats.atk}, def: ${p.stats.def}, spa: ${p.stats.spa}, spd: ${p.stats.spd}, spe: ${p.stats.spe} },`);
    lines.push(`    catchRate: ${p.catchRate},`);
    lines.push(`    spriteUrl: '${spriteUrl}',`);

    if (p.learnset && p.learnset.length > 0) {
      const learnsetStr = p.learnset.map((l) => `{ moveId: '${l.moveId}', level: ${l.level} }`).join(', ');
      lines.push(`    learnset: [${learnsetStr}],`);
    }

    if (p.evolution) {
      if (p.evolution.level) {
        lines.push(`    evolutions: [{ targetSpeciesId: '${p.evolution.targetName}', level: ${p.evolution.level} }],`);
      } else if (p.evolution.item) {
        lines.push(`    evolutions: [{ targetSpeciesId: '${p.evolution.targetName}', item: '${p.evolution.item}' }],`);
      }
    }

    lines.push('  },');
  }

  lines.push('};');
  return lines.join('\n');
}

console.log('生成 MOVES 代码...');
const movesCode = generateMovesCode();

console.log('生成 SPECIES_DATA 代码...');
const speciesCode = generateSpeciesCode();

const outputPath = path.join(process.cwd(), 'scripts', 'data', 'generated-constants.ts');
fs.writeFileSync(
  outputPath,
  `// 自动生成的代码 - 请勿手动编辑
// 运行 npx tsx scripts/generate-constants.ts 重新生成

import { LocationData, Move, Pokemon, PokemonType, Evolution, LearnsetMove } from '../../src/types';

export const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: '#A8A77A',
  Fire: '#EE8130',
  Water: '#6390F0',
  Grass: '#7AC74C',
  Electric: '#F7D02C',
  Ice: '#96D9D6',
  Fighting: '#C22E28',
  Poison: '#A33EA1',
  Ground: '#E2BF65',
  Flying: '#A98FF3',
  Psychic: '#F95587',
  Bug: '#A6B91A',
  Rock: '#B6A136',
  Ghost: '#735797',
  Dragon: '#6F35FC',
  Steel: '#B7B7CE',
  Dark: '#705746',
  Fairy: '#D685AD',
};

export const TYPE_TRANSLATIONS: Record<PokemonType, string> = {
  Normal: '一般',
  Fire: '火',
  Water: '水',
  Grass: '草',
  Electric: '电',
  Ice: '冰',
  Fighting: '格斗',
  Poison: '毒',
  Ground: '地面',
  Flying: '飞行',
  Psychic: '超能',
  Bug: '虫',
  Rock: '岩石',
  Ghost: '幽灵',
  Dragon: '龙',
  Steel: '钢',
  Dark: '恶',
  Fairy: '妖精',
};

interface SpeciesData extends Partial<Pokemon> {
    pokedexId: number;
    catchRate: number;
    learnset?: LearnsetMove[];
    evolutions?: Evolution[];
}

${movesCode}

${speciesCode}
`,
  'utf-8'
);

console.log(`✅ 已生成: ${outputPath}`);
