import { describe, it, expect } from 'vitest';
import { PokemonSchema, UserCredentialsSchema } from '@shared/schemas';

describe('PokemonSchema', () => {
  it('should validate a valid Pokemon', () => {
    const validPokemon = {
      id: crypto.randomUUID(),
      speciesName: '皮卡丘',
      level: 25,
      types: ['Electric'],
      baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      nature: '勤奋',
      currentHp: 100,
      maxHp: 100,
      stats: { hp: 100, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
      moves: [
        {
          move: {
            id: 'tackle',
            name: '撞击',
            type: 'Normal',
            category: 'Physical',
            power: 40,
            accuracy: 100,
            ppMax: 35
          },
          ppCurrent: 35
        }
      ],
      exp: 1000,
      nextLevelExp: 2000,
      speciesData: {
        pokedexId: 25,
        catchRate: 190
      }
    };
    expect(() => PokemonSchema.parse(validPokemon)).not.toThrow();
  });

  it('should reject invalid level', () => {
    const invalidPokemon = {
      id: crypto.randomUUID(),
      speciesName: '皮卡丘',
      level: 150, // 超过100
      types: ['Electric'],
      baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      nature: '勤奋',
      currentHp: 100,
      maxHp: 100,
      stats: { hp: 100, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
      moves: [],
      exp: 1000,
      nextLevelExp: 2000,
      speciesData: {
        pokedexId: 25,
        catchRate: 190
      }
    };
    // Zod throws error when parsing fails
    expect(() => PokemonSchema.parse(invalidPokemon)).toThrow();
  });
});

describe('UserCredentialsSchema', () => {
  it('should reject short password', () => {
    expect(() => UserCredentialsSchema.parse({
      username: 'test_user',
      password: '123', // 小于6字符
    })).toThrow();
  });

  it('should validate valid credentials', () => {
    expect(() => UserCredentialsSchema.parse({
      username: 'valid_user',
      password: 'password123', 
    })).not.toThrow();
  });
});
