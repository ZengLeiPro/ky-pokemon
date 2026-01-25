import type { Pokemon, Move } from '../../../shared/types/pokemon';
import type { BattleState, BattleAction, TurnResult, TurnEvent, PokemonBattleState } from '../../../shared/types/social';

// 从 shared/utils/damage.ts 复用的伤害计算逻辑
export interface DamageResult {
  damage: number;
  isCritical: boolean;
  typeEffectiveness: number;
}

// 伤害计算（简化版，复用游戏内逻辑）
function calculateDamage(
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  weather: string = 'None'
): DamageResult {
  if (move.category === 'Status') {
    return { damage: 0, isCritical: false, typeEffectiveness: 1 };
  }

  let a = move.category === 'Physical' ? attacker.stats.atk : attacker.stats.spa;
  const d = move.category === 'Physical' ? defender.stats.def : defender.stats.spd;

  // 灼伤减半物攻
  if (attacker.status === 'BRN' && move.category === 'Physical') {
    a = Math.floor(a * 0.5);
  }

  // 天气影响
  let power = move.power;
  if (weather === 'Sunny') {
    if (move.type === 'Fire') power = Math.floor(power * 1.5);
    if (move.type === 'Water') power = Math.floor(power * 0.5);
  } else if (weather === 'Rain') {
    if (move.type === 'Water') power = Math.floor(power * 1.5);
    if (move.type === 'Fire') power = Math.floor(power * 0.5);
  }

  const levelFactor = (2 * attacker.level) / 5 + 2;
  const baseDamage = (levelFactor * power * (a / d)) / 50 + 2;

  // 暴击判定 (1/16 概率)
  const critRoll = Math.random();
  const isCritical = critRoll < 0.0625;
  const critMod = isCritical ? 1.5 : 1.0;

  // 随机浮动 (85-100%)
  const randomMod = (Math.floor(Math.random() * 16) + 85) / 100;

  // STAB 加成
  const stabMod = attacker.types.includes(move.type) ? 1.5 : 1.0;

  // 属性克制（简化版）
  const typeMod = getTypeEffectiveness(move.type, defender.types);

  const damage = Math.floor(baseDamage * critMod * randomMod * stabMod * typeMod);

  return { damage, isCritical, typeEffectiveness: typeMod };
}

// 简化版属性克制表
function getTypeEffectiveness(attackType: string, defendTypes: string[]): number {
  const effectiveness: Record<string, Record<string, number>> = {
    Fire: { Grass: 2, Water: 0.5, Fire: 0.5, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
    Water: { Fire: 2, Grass: 0.5, Water: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Ground: 2, Rock: 2, Flying: 0.5, Bug: 0.5, Poison: 0.5, Steel: 0.5 },
    Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Ice: { Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5 },
    Fighting: { Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Ghost: 0, Bug: 0.5, Fairy: 0.5 },
    Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
    Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Rock: 2, Steel: 2, Flying: 0 },
    Flying: { Grass: 2, Fighting: 2, Bug: 2, Electric: 0.5, Rock: 0.5, Steel: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
    Bug: { Grass: 2, Psychic: 2, Dark: 2, Fire: 0.5, Fighting: 0.5, Flying: 0.5, Poison: 0.5, Ghost: 0.5, Steel: 0.5, Rock: 0.5, Fairy: 0.5 },
    Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
    Ghost: { Psychic: 2, Ghost: 2, Normal: 0, Dark: 0.5 },
    Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
    Dark: { Psychic: 2, Ghost: 2, Fighting: 0.5, Dark: 0.5, Fairy: 0.5 },
    Steel: { Ice: 2, Rock: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
    Fairy: { Fighting: 2, Dragon: 2, Dark: 2, Poison: 0.5, Steel: 0.5 },
    Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 }
  };

  let total = 1;
  for (const defType of defendTypes) {
    const typeMap = effectiveness[attackType];
    if (typeMap && typeMap[defType] !== undefined) {
      total *= typeMap[defType];
    }
  }
  return total;
}

// 获取宝可梦的速度（考虑状态和道具等）
function getSpeed(pokemon: Pokemon, state: PokemonBattleState): number {
  let spe = pokemon.stats.spe;

  // 麻痹减半速度
  if (pokemon.status === 'PAR') {
    spe = Math.floor(spe * 0.5);
  }

  // 能力变化
  const statMod = state.statChanges.spe;
  if (statMod > 0) {
    spe = Math.floor(spe * (2 + statMod) / 2);
  } else if (statMod < 0) {
    spe = Math.floor(spe * 2 / (2 - statMod));
  }

  return spe;
}

export interface ProcessTurnResult {
  newState: BattleState;
  result: TurnResult;
  winnerId: string | null;
}

// 处理一个回合的对战逻辑
export function processTurn(
  state: BattleState,
  challengerTeam: Pokemon[],
  opponentTeam: Pokemon[],
  challengerAction: BattleAction,
  opponentAction: BattleAction,
  currentTurn: number
): ProcessTurnResult {
  const events: TurnEvent[] = [];
  let winnerId: string | null = null;
  let challengerAlive: boolean;
  let opponentAlive: boolean;

  // 获取当前出战的宝可梦
  const challengerPokemon = challengerTeam[state.challengerActive];
  const opponentPokemon = opponentTeam[state.opponentActive];

  // 检查是否有人已经输了
  const challengerAlive = state.challengerTeamState[state.challengerActive].currentHp > 0;
  const opponentAlive = state.opponentTeamState[state.opponentActive].currentHp > 0;

  if (!challengerAlive || !opponentAlive) {
    // 处理已经分出胜负的情况
    if (!challengerAlive && !opponentAlive) {
      events.push({ type: 'faint', actor: 'challenger', message: '双方宝可梦同时倒下！' });
      events.push({ type: 'faint', actor: 'opponent', message: '' });
      winnerId = null; // 平局
    } else if (!challengerAlive) {
      events.push({ type: 'faint', actor: 'challenger', message: `${challengerPokemon.nickname || challengerPokemon.speciesName} 倒下了！` });
      winnerId = opponentTeam[0] ? 'opponent' : null; // 简单处理
    } else {
      events.push({ type: 'faint', actor: 'opponent', message: `${opponentPokemon.nickname || opponentPokemon.speciesName} 倒下了！` });
      winnerId = challengerTeam[0] ? 'challenger' : null;
    }

    return {
      newState: state,
      result: { turn: currentTurn, events },
      winnerId
    };
  }

  // 准备行动队列
  type ActionItem = { action: BattleAction; team: 'challenger' | 'opponent'; pokemon: Pokemon; state: PokemonBattleState };
  const actions: ActionItem[] = [
    { action: challengerAction, team: 'challenger', pokemon: challengerPokemon, state: state.challengerTeamState[state.challengerActive] },
    { action: opponentAction, team: 'opponent', pokemon: opponentPokemon, state: state.opponentTeamState[state.opponentActive] }
  ];

  // 排序：投降优先，然后是换人，最后按优先度和速度
  actions.sort((a, b) => {
    // 投降最优先
    if (a.action.type === 'forfeit') return -1;
    if (b.action.type === 'forfeit') return 1;

    // 换人优先于招式
    if (a.action.type === 'switch' && b.action.type !== 'switch') return -1;
    if (b.action.type === 'switch' && a.action.type !== 'switch') return 1;

    // 比较招式优先度
    const moveA = a.action.moveIndex !== undefined ? a.pokemon.moves[a.action.moveIndex]?.move : null;
    const moveB = b.action.moveIndex !== undefined ? b.pokemon.moves[b.action.moveIndex]?.move : null;
    const priorityA = moveA?.priority || 0;
    const priorityB = moveB?.priority || 0;

    if (priorityA !== priorityB) return priorityB - priorityA;

    // 比较速度
    const speedA = getSpeed(a.pokemon, a.state);
    const speedB = getSpeed(b.pokemon, b.state);

    // 速度相同则随机
    if (speedA === speedB) {
      return Math.random() < 0.5 ? -1 : 1;
    }

    return speedB - speedA;
  });

  // 执行行动
  const executedActions: string[] = [];
  const newState = JSON.parse(JSON.stringify(state)) as BattleState;

  for (const action of actions) {
    if (executedActions.includes(action.team)) continue; // 已行动的队伍跳过

    switch (action.action.type) {
      case 'forfeit':
        events.push({
          type: 'status',
          actor: action.team,
          message: action.team === 'challenger'
            ? `${challengerPokemon.nickname || challengerPokemon.speciesName} 投降了！`
            : `${opponentPokemon.nickname || opponentPokemon.speciesName} 投降了！`
        });
        winnerId = action.team === 'challenger' ? 'opponent' : 'challenger';
        break;

      case 'switch': {
        const newIndex = action.action.switchToIndex!;
        const targetTeam = action.team === 'challenger' ? challengerTeam : opponentTeam;
        const targetState = action.team === 'challenger' ? newState.challengerTeamState : newState.opponentState;

        // 检查目标宝可梦是否可用
        if (newIndex >= targetTeam.length || newState[action.team === 'challenger' ? 'challengerTeamState' : 'opponentTeamState'][newIndex].currentHp <= 0) {
          events.push({
            type: 'status',
            actor: action.team,
            message: '没有可用的宝可梦！'
          });
          continue;
        }

        // 换人
        if (action.team === 'challenger') {
          newState.challengerActive = newIndex;
        } else {
          newState.opponentActive = newIndex;
        }

        const switchedPokemon = targetTeam[newIndex];
        events.push({
          type: 'switch',
          actor: action.team,
          message: `${switchedPokemon.nickname || switchedPokemon.speciesName} 出战！`
        });
        break;
      }

      case 'move': {
        const moveIndex = action.action.moveIndex!;
        const move = action.pokemon.moves[moveIndex];

        if (!move) {
          events.push({
            type: 'status',
            actor: action.team,
            message: '没有这个招式！'
          });
          continue;
        }

        if (move.ppCurrent <= 0) {
          events.push({
            type: 'status',
            actor: action.team,
            message: `${move.move.name} 的 PP 不足！`
          });
          continue;
        }

        // 状态异常导致无法行动
        if (action.pokemon.status === 'SLP') {
          const wakeUp = Math.random() < 0.33;
          if (!wakeUp) {
            events.push({
              type: 'status',
              actor: action.team,
              message: `${action.pokemon.nickname || action.pokemon.speciesName} 还在睡觉！`
            });
            break;
          }
        }

        if (action.pokemon.status === 'FRZ') {
          const thaw = Math.random() < 0.2;
          if (!thaw) {
            events.push({
              type: 'status',
              actor: action.team,
              message: `${action.pokemon.nickname || action.pokemon.speciesName} 冻住了！`
            });
            break;
          }
        }

        // 执行招式
        const target = action.team === 'challenger' ? opponentPokemon : challengerPokemon;
        const targetState = action.team === 'challenger'
          ? newState.opponentTeamState[newState.opponentActive]
          : newState.challengerTeamState[newState.challengerActive];

        // 减少 PP
        if (action.team === 'challenger') {
          newState.challengerTeamState[newState.challengerActive].ppUsed[moveIndex]++;
        } else {
          newState.opponentTeamState[newState.opponentActive].ppUsed[moveIndex]++;
        }

        events.push({
          type: 'move',
          actor: action.team,
          message: `${action.pokemon.nickname || action.pokemon.speciesName} 使用了 ${move.move.name}！`
        });

        // 计算伤害
        if (move.move.category !== 'Status') {
          const damageResult = calculateDamage(action.pokemon, target, move.move, newState.weather);
          const actualDamage = Math.min(damageResult.damage, targetState.currentHp);

          targetState.currentHp -= actualDamage;

          events.push({
            type: 'damage',
            actor: action.team === 'challenger' ? 'opponent' : 'challenger',
            message: `造成了 ${actualDamage} 点伤害！`,
            data: { damage: actualDamage, critical: damageResult.isCritical, effectiveness: damageResult.typeEffectiveness }
          });

          // 检查是否倒下
          if (targetState.currentHp <= 0) {
            targetState.currentHp = 0;
            events.push({
              type: 'faint',
              actor: action.team === 'challenger' ? 'opponent' : 'challenger',
              message: `${target.nickname || target.speciesName} 倒下了！`
            });
          }
        }
        break;
      }
    }

    executedActions.push(action.team);
  }

  // 处理天气回合
  if (newState.weather && newState.weather !== 'None') {
    newState.weatherTurns = (newState.weatherTurns || 0) + 1;

    // 天气持续 5 回合后消失
    if (newState.weatherTurns > 5) {
      events.push({
        type: 'weather',
        message: `${newState.weather} 天气结束了！`
      });
      newState.weather = 'None';
      newState.weatherTurns = 0;
    }
  }

  // 检查胜负
  challengerAlive = newState.challengerTeamState.some((s) => s.currentHp > 0);
  opponentAlive = newState.opponentTeamState.some((s) => s.currentHp > 0);

  if (!challengerAlive && !opponentAlive) {
    events.push({ type: 'faint', message: '平局！' });
  } else if (!challengerAlive) {
    events.push({ type: 'faint', message: '挑战者输了！' });
    winnerId = 'opponent';
  } else if (!opponentAlive) {
    events.push({ type: 'faint', message: '挑战者赢了！' });
    winnerId = 'challenger';
  }

  return {
    newState,
    result: { turn: currentTurn, events },
    winnerId
  };
}
