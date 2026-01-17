import type { Pokemon } from '../types';
import { SPECIES_DATA, findSpeciesKeyByPokedexId } from '../constants';
import { calculateStats } from './stats';

/**
 * 检查是否可进化
 */
export const checkEvolution = (
  pokemon: Pokemon,
  leveledUp: boolean = true
): { targetSpeciesId: string } | undefined => {
    if (!leveledUp) return undefined;

    const speciesKey = findSpeciesKeyByPokedexId(pokemon.speciesData.pokedexId);

    if (speciesKey && SPECIES_DATA[speciesKey].evolutions) {
        const evolutions = SPECIES_DATA[speciesKey].evolutions!;
        const evo = evolutions.find(e => e.level && pokemon.level >= e.level);

        if (evo) {
            return { targetSpeciesId: evo.targetSpeciesId };
        }
    }
    return undefined;
};

/**
 * 执行进化
 */
export const evolvePokemon = (
  pokemon: Pokemon,
  targetSpeciesKey: string
): Pokemon => {
    const data = SPECIES_DATA[targetSpeciesKey];
    if (!data) throw new Error(`Evolution target ${targetSpeciesKey} not found`);

    const newPokemon = { ...pokemon };
    
    newPokemon.speciesName = data.speciesName!;
    newPokemon.types = data.types!;
    newPokemon.baseStats = data.baseStats!;
    newPokemon.spriteUrl = data.spriteUrl;
    newPokemon.speciesData = {
        pokedexId: data.pokedexId!,
        catchRate: data.catchRate!
    };

    // Recalculate stats with new Base Stats
    // Keep IVs/EVs/Level same
    const { stats, maxHp } = calculateStats(newPokemon.baseStats, newPokemon.ivs, newPokemon.evs, newPokemon.level);
    
    // Adjust HP current based on max HP increase (or decrease? rarely happens)
    const hpDiff = maxHp - pokemon.maxHp;
    newPokemon.maxHp = maxHp;
    newPokemon.currentHp = Math.min(maxHp, Math.max(0, newPokemon.currentHp + hpDiff));
    newPokemon.stats = stats;

    return newPokemon;
};
