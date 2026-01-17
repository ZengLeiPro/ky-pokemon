import type { Pokemon, Move, BaseStats } from '../types';
import { SPECIES_DATA, MOVES } from '../constants';
import { calculateStats } from './stats';

/**
 * 创建宝可梦实例
 */
export const createPokemon = (
  speciesKey: string,
  level: number,
  moves: Move[] = [],
  customIvs?: Partial<BaseStats>
): Pokemon => {
    const data = SPECIES_DATA[speciesKey];

    if (!data) throw new Error(`Species ${speciesKey} not found`);

    const ivs: BaseStats = { 
      hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31,
      ...customIvs 
    }; 
    const evs: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    const { stats, maxHp } = calculateStats(data.baseStats!, ivs, evs, level);

    // If no moves provided, try to populate from learnset up to current level
    let initialMoves = moves;
    if (moves.length === 0 && data.learnset) {
        const learnedMoves = data.learnset
            .filter(l => l.level <= level)
            .map(l => MOVES[l.moveId])
            .filter(m => !!m); // Filter out undefined moves if any
        
        // Take last 4 moves
        initialMoves = learnedMoves.slice(-4);
    }
    
    // If still no moves (e.g. data missing), fallback to tackle
    if (initialMoves.length === 0) {
        initialMoves = [MOVES.tackle];
    }

    return {
        id: crypto.randomUUID(),
        speciesName: data.speciesName!,
        level,
        types: data.types!,
        baseStats: data.baseStats!,
        ivs,
        evs,
        nature: '勤奋',
        currentHp: maxHp,
        maxHp,
        stats,
        moves: initialMoves.map(m => ({ move: m, ppCurrent: m.ppMax })),
        spriteUrl: data.spriteUrl,
        exp: 0,
        nextLevelExp: Math.pow(level + 1, 3), // Simplified Cubic exp curve
        speciesData: {
            pokedexId: data.pokedexId,
            catchRate: data.catchRate
        }
    };
};

/**
 * 生成随机 IV (0-31)
 */
export const generateRandomIvs = (): BaseStats => ({
  hp: Math.floor(Math.random() * 32),
  atk: Math.floor(Math.random() * 32),
  def: Math.floor(Math.random() * 32),
  spa: Math.floor(Math.random() * 32),
  spd: Math.floor(Math.random() * 32),
  spe: Math.floor(Math.random() * 32),
});
