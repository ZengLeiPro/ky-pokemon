import { describe, it, expect } from 'vitest';
import { gainExperience, checkEvolution, evolvePokemon, calculateStats } from '../src/lib/mechanics';
import { Pokemon, BaseStats } from '../src/types';
import { SPECIES_DATA } from '../src/constants';

// Mock helper to create a Pokemon
function createPokemon(speciesId: string, level: number): Pokemon {
  const data = SPECIES_DATA[speciesId];
  if (!data) throw new Error(`Species ${speciesId} not found`);
  
  const ivs: BaseStats = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  const evs: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const { stats, maxHp } = calculateStats(data.baseStats!, ivs, evs, level);

  return {
    id: 'test-mon',
    speciesName: data.speciesName || speciesId,
    level,
    currentHp: maxHp,
    maxHp: maxHp,
    stats,
    moves: [],
    exp: 0, // Current level progress (0 means just leveled up)
    nextLevelExp: Math.pow(level + 1, 3),
    ivs,
    evs,
    types: data.types || ['Normal'],
    baseStats: data.baseStats || { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
    nature: 'Bold',
    speciesData: {
        pokedexId: data.pokedexId || 1,
        catchRate: data.catchRate || 45
    }
  };
}

describe('Evolution System', () => {
  it('should evolve Charmander to Charmeleon at level 16', () => {
    // 1. Create Charmander at level 15
    let charmander = createPokemon('charmander', 15);
    
    // 2. Gain enough XP to reach level 16
    // Level 15 -> 3375 XP
    // Level 16 -> 4096 XP
    // Diff = 721
    const { updatedPokemon: leveledUpPokemon, leveledUp } = gainExperience(charmander, 721);
    
    expect(leveledUpPokemon.level).toBe(16);
    expect(leveledUp).toBe(true);

    // 3. Check for evolution (pass leveledUp=true)
    const evolution = checkEvolution(leveledUpPokemon, true);
    
    expect(evolution).toBeDefined();
    expect(evolution?.targetSpeciesId).toBe('charmeleon');
    expect(SPECIES_DATA[evolution!.targetSpeciesId].speciesName).toBe('火恐龙');
  });

  it('should NOT evolve Charmander at level 15', () => {
    let charmander = createPokemon('charmander', 14);
    
    // Gain XP to reach 15 (not 16)
    const { updatedPokemon: leveledUpPokemon, leveledUp } = gainExperience(charmander, 1000); // 14->15
    
    // Ensure it leveled up but didn't reach evolution level
    expect(leveledUpPokemon.level).toBe(15);
    expect(leveledUp).toBe(true);

    const evolution = checkEvolution(leveledUpPokemon, true);
    // At level 15, Charmander does not evolve (needs 16)
    expect(evolution).toBeUndefined();
  });

  it('should evolve Charmeleon to Charizard at level 36', () => {
    let charmeleon = createPokemon('charmeleon', 35);
    
    // Gain XP to reach 36
    const { updatedPokemon: leveledUpPokemon } = gainExperience(charmeleon, 5000);
    expect(leveledUpPokemon.level).toBe(36);

    const evolution = checkEvolution(leveledUpPokemon, true);
    
    expect(evolution).toBeDefined();
    expect(evolution?.targetSpeciesId).toBe('charizard');
    expect(SPECIES_DATA[evolution!.targetSpeciesId].speciesName).toBe('喷火龙');
  });

  it('should update stats correctly after evolution', () => {
    // 1. Create Charmander at level 16
    const charmander = createPokemon('charmander', 16);
    const preEvoStats = charmander.stats;

    // 2. Evolve to Charmeleon
    const charmeleon = evolvePokemon(charmander, 'charmeleon');

    // 3. Verify Species Change
    expect(charmeleon.speciesName).toBe('火恐龙');
    expect(charmeleon.speciesData.pokedexId).toBe(5);

    // 4. Verify Stats Increase
    // At Level 16 (Neutral Nature, 31 IV, 0 EV):
    // HP = ((2*Base + 31 + 0)*16)/100 + 16 + 10
    // Stat = ((2*Base + 31 + 0)*16)/100 + 5
    
    // Charmander (Base HP 39): ((78+31)*16)/100 + 26 = 17.44 + 26 = 43
    // Charmeleon (Base HP 58): ((116+31)*16)/100 + 26 = 23.52 + 26 = 49
    
    expect(charmeleon.stats.hp).toBeGreaterThan(preEvoStats.hp);
    expect(charmeleon.stats.atk).toBeGreaterThan(preEvoStats.atk);
    
    // Specific checks for deterministic results (assuming IV=31)
    // Charmander SpA (Base 60): ((120+31)*16)/100 + 5 = 24.16 + 5 = 29
    // Charmeleon SpA (Base 80): ((160+31)*16)/100 + 5 = 30.56 + 5 = 35
    expect(charmeleon.stats.spa).toBe(35);
  });
});
