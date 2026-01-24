import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { createPokemon, gainExperience, calculateStats } from '../lib/mechanics';
import { produce } from 'immer';
import { X, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { SPECIES_DATA, MOVES } from '../constants';

interface CheatCommand {
  name: string;
  description: string;
  execute: (args: string[]) => { success: boolean; message: string };
}

// 创建中文名到英文key的映射
const getSpeciesKeyByName = (nameOrKey: string): string | null => {
  const normalized = nameOrKey.toLowerCase().trim();

  // 先尝试直接作为key查找
  if (SPECIES_DATA[normalized]) {
    return normalized;
  }

  // 再尝试通过中文名查找
  for (const [key, data] of Object.entries(SPECIES_DATA)) {
    if (data.speciesName === nameOrKey) {
      return key;
    }
  }

  return null;
};

const CHEAT_COMMANDS: CheatCommand[] = [
  {
    name: 'add_money',
    description: '增加金钱 (用法: add_money 数值)',
    execute: (args) => {
      const currentState = useGameStore.getState();
      if (currentState.gameMode !== 'CHEAT') {
        return { success: false, message: '作弊指令仅在 CHEAT 模式下可用' };
      }

      const amount = parseInt(args[0]) || 10000;
      useGameStore.setState(produce((state: any) => {
        state.playerMoney += amount;
      }));
      return { success: true, message: `增加了 ¥${amount.toLocaleString()}！` };
    }
  },
  {
    name: 'heal_party',
    description: '恢复队伍HP和PP',
    execute: () => {
      const currentState = useGameStore.getState();
      if (currentState.gameMode !== 'CHEAT') {
        return { success: false, message: '作弊指令仅在 CHEAT 模式下可用' };
      }

      useGameStore.setState(produce((state: any) => {
        state.playerParty.forEach((p: any) => {
          p.currentHp = p.maxHp;
          p.moves.forEach((m: any) => m.ppCurrent = m.move.ppMax);
          delete p.status;
        });
        state.logs.push({
          id: crypto.randomUUID(),
          message: '作弊生效：队伍已完全恢复！',
          timestamp: Date.now(),
          type: 'urgent'
        });
      }));
      return { success: true, message: '队伍已完全恢复！' };
    }
  },
  {
    name: 'add_pokemon',
    description: '添加宝可梦 (用法: add_pokemon 物种名 等级)',
    execute: (args) => {
      const currentState = useGameStore.getState();
      if (currentState.gameMode !== 'CHEAT') {
        return { success: false, message: '作弊指令仅在 CHEAT 模式下可用' };
      }

      const nameOrKey = args[0];
      const level = Math.min(100, Math.max(1, parseInt(args[1]) || 5));

      if (!nameOrKey) {
        return { success: false, message: '请指定宝可梦物种名（中文或英文）！' };
      }

      const speciesKey = getSpeciesKeyByName(nameOrKey);
      if (!speciesKey) {
        return { success: false, message: `未找到宝可梦：${nameOrKey}（请使用中文名或英文名，如：小火龙 或 charmander）` };
      }

      try {
        const newPokemon = createPokemon(speciesKey, level, []);

        useGameStore.setState(produce((state: any) => {
          if (state.playerParty.length < 6) {
            state.playerParty.push(newPokemon);
          } else {
            state.playerStorage.push(newPokemon);
          }
          state.pokedex[newPokemon.speciesData.pokedexId!] = 'CAUGHT';
          state.logs.push({
            id: crypto.randomUUID(),
            message: `作弊生效：获得了 ${newPokemon.speciesName} (Lv.${level})！`,
            timestamp: Date.now(),
            type: 'urgent'
          });
        }));

        return { success: true, message: `获得了 ${newPokemon.speciesName} (Lv.${level})！` };
      } catch (e) {
        return { success: false, message: `创建宝可梦失败：${(e as Error).message}` };
      }
    }
  },
  {
    name: 'max_exp',
    description: '当前宝可梦升至满级',
    execute: () => {
      const currentState = useGameStore.getState();
      if (currentState.gameMode !== 'CHEAT') {
        return { success: false, message: '作弊指令仅在 CHEAT 模式下可用' };
      }

      useGameStore.setState(produce((state: any) => {
        state.playerParty.forEach((pokemon: any, index: number) => {
          if (pokemon.level >= 100) {
            return; // 已经满级
          }

          const targetLevel = 100;
          const currentTotalExp = Math.pow(pokemon.level, 3) + pokemon.exp;
          const targetTotalExp = Math.pow(targetLevel, 3); // 100级的总经验值
          const expNeeded = Math.max(0, targetTotalExp - currentTotalExp);

          if (expNeeded > 0) {
            const result = gainExperience(pokemon, expNeeded);
            state.playerParty[index] = result.updatedPokemon;

            // 确保等级不超过100
            if (state.playerParty[index].level > 100) {
              state.playerParty[index].level = 100;
              state.playerParty[index].exp = 0;
              state.playerParty[index].nextLevelExp = Math.pow(101, 3) - Math.pow(100, 3);
            }

            state.playerParty[index].currentHp = state.playerParty[index].maxHp;
            state.playerParty[index].moves.forEach((m: any) => m.ppCurrent = m.move.ppMax);

            state.logs.push({
              id: crypto.randomUUID(),
              message: `作弊生效：${state.playerParty[index].speciesName} 已升至 Lv.${state.playerParty[index].level}！`,
              timestamp: Date.now(),
              type: 'urgent'
            });
          }
        });
      }));

      return { success: true, message: '所有宝可梦已升至 100 级！' };
    }
  },
  {
    name: 'all_badges',
    description: '获得所有徽章',
    execute: () => {
      const currentState = useGameStore.getState();
      if (currentState.gameMode !== 'CHEAT') {
        return { success: false, message: '作弊指令仅在 CHEAT 模式下可用' };
      }

      const allBadges = ['badge-boulder', 'badge-cascade', 'badge-thunder', 'badge-rainbow', 'badge-soul', 'badge-marsh', 'badge-volcano', 'badge-earth'];
      useGameStore.setState(produce((state: any) => {
        state.badges = [...allBadges];
        state.logs.push({
          id: crypto.randomUUID(),
          message: '作弊生效：已获得所有徽章！',
          timestamp: Date.now(),
          type: 'urgent'
        });
      }));
      return { success: true, message: '已获得所有徽章！' };
    }
  },
  {
    name: 'all_items',
    description: '获得所有物品',
    execute: () => {
      const currentState = useGameStore.getState();
      if (currentState.gameMode !== 'CHEAT') {
        return { success: false, message: '作弊指令仅在 CHEAT 模式下可用' };
      }

      const items = [
        { id: 'potion', name: '伤药', qty: 50 },
        { id: 'super-potion', name: '好伤药', qty: 50 },
        { id: 'hyper-potion', name: '超高级伤药', qty: 50 },
        { id: 'max-potion', name: '全满药', qty: 50 },
        { id: 'pokeball', name: '精灵球', qty: 99 },
        { id: 'greatball', name: '超级球', qty: 99 },
        { id: 'ultraball', name: '高级球', qty: 99 },
        { id: 'masterball', name: '大师球', qty: 99 },
      ];

      useGameStore.setState(produce((state: any) => {
        items.forEach(item => {
          const existing = state.inventory.find((i: any) => i.id === item.id);
          if (existing) {
            existing.quantity += item.qty;
          } else {
            state.inventory.push({
              id: item.id,
              name: item.name,
              description: '',
              category: item.id.includes('ball') ? 'POKEBALLS' : 'MEDICINE',
              quantity: item.qty
            });
          }
        });
        state.logs.push({
          id: crypto.randomUUID(),
          message: '作弊生效：已获得所有物品！',
          timestamp: Date.now(),
          type: 'urgent'
        });
      }));
      return { success: true, message: '已获得所有物品！' };
    }
  },
  {
    name: 'teleport',
    description: '传送 (用法: teleport 地点ID)',
    execute: (args) => {
      const currentState = useGameStore.getState();
      if (currentState.gameMode !== 'CHEAT') {
        return { success: false, message: '作弊指令仅在 CHEAT 模式下可用' };
      }

      const locationId = args[0];
      useGameStore.getState().moveTo(locationId);
      return { success: true, message: `已传送到 ${locationId}` };
    }
  },
  {
    name: 'help',
    description: '显示所有指令',
    execute: () => {
      return { success: true, message: CHEAT_COMMANDS.map(c => `/${c.name} - ${c.description}`).join('\n') };
    }
  }
];

const CheatConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const gameMode = useGameStore((state) => state.gameMode);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const commandName = parts[0].toLowerCase().replace('/', '');
    const args = parts.slice(1);

    // Add command to output
    setOutput(prev => [...prev, `> ${trimmed}`]);

    if (gameMode !== 'CHEAT') {
      setOutput(prev => [...prev, `错误：请先在登录界面切换到 CHEAT 模式`]);
      return;
    }

    if (commandName === 'help' || commandName === '?') {
      const helpText = CHEAT_COMMANDS.map(c => `/${c.name} - ${c.description}`).join('\n');
      setOutput(prev => [...prev, helpText, '\n特殊指令：', '/宝可梦名_lv等级 - 将指定宝可梦设置到指定等级（支持中文/英文名）', '/宝可梦名_lv等级1 等级2 - 设置到等级1但接近等级2（高经验值）', '例如：/小火龙_lv35 或 /pikachu_lv20']);
      return;
    }

    // 检查是否是 宝可梦名_lv等级 格式的指令
    const lvMatch = commandName.match(/^(.+)_lv(\d+)$/);
    if (lvMatch) {
      const pokemonName = lvMatch[1];
      const targetLevel1 = parseInt(lvMatch[2]);
      const targetLevel2 = args[0] ? parseInt(args[0]) : null;

      // 验证等级
      if (targetLevel1 < 1 || targetLevel1 > 100) {
        setOutput(prev => [...prev, `错误：等级必须在 1-100 之间`]);
        return;
      }

      if (targetLevel2 !== null && (targetLevel2 < 1 || targetLevel2 > 100 || targetLevel2 <= targetLevel1 || targetLevel2 !== targetLevel1 + 1)) {
        setOutput(prev => [...prev, `错误：第二个等级必须是第一个等级+1（例如：5 6）`]);
        return;
      }

      // 查找宝可梦
      const speciesKey = getSpeciesKeyByName(pokemonName);
      if (!speciesKey) {
        setOutput(prev => [...prev, `错误：未找到宝可梦"${pokemonName}"（请使用中文名或英文名）`]);
        return;
      }

      const speciesData = SPECIES_DATA[speciesKey];
      const currentState = useGameStore.getState();
      const index = currentState.playerParty.findIndex((p: any) =>
        p.speciesData.pokedexId === speciesData.pokedexId
      );

      if (index === -1) {
        setOutput(prev => [...prev, `错误：队伍中未找到 ${speciesData.speciesName}`]);
        return;
      }

      useGameStore.setState(produce((state: any) => {
        const pokemon = state.playerParty[index];
        const currentTotalExp = Math.pow(pokemon.level, 3) + pokemon.exp;

        // 计算目标经验值
        let targetTotalExp;
        if (targetLevel2 !== null) {
          // 设置到 targetLevel1，但经验值接近 targetLevel2
          const level2BaseExp = Math.pow(targetLevel2, 3);
          targetTotalExp = level2BaseExp - 10; // 距离下一级还差10点经验
        } else {
          // 设置到 targetLevel1 的0经验
          targetTotalExp = Math.pow(targetLevel1, 3);
        }

        const expNeeded = targetTotalExp - currentTotalExp;

        if (expNeeded > 0) {
          // 需要增加经验
          const result = gainExperience(pokemon, expNeeded);
          state.playerParty[index] = result.updatedPokemon;
          state.playerParty[index].currentHp = state.playerParty[index].maxHp;
          state.playerParty[index].moves.forEach((m: any) => m.ppCurrent = m.move.ppMax);

          const levelInfo = targetLevel2 ? `Lv.${targetLevel1}(接近Lv.${targetLevel2})` : `Lv.${targetLevel1}`;
          state.logs.push({
            id: crypto.randomUUID(),
            message: `作弊生效：${result.updatedPokemon.speciesName} 已调整至 ${levelInfo}`,
            timestamp: Date.now(),
            type: 'urgent'
          });

          if (result.learnedMoves.length > 0) {
            state.logs.push({
              id: crypto.randomUUID(),
              message: `习得新技能：${result.learnedMoves.join(', ')}`,
              timestamp: Date.now(),
              type: 'urgent'
            });
          }

          if (result.evolutionCandidate) {
            state.logs.push({
              id: crypto.randomUUID(),
              message: `什么？ ${result.updatedPokemon.speciesName} 的样子...`,
              timestamp: Date.now(),
              type: 'urgent'
            });
            state.evolution = {
              isEvolving: true,
              pokemon: result.updatedPokemon,
              targetSpeciesId: result.evolutionCandidate.targetSpeciesId,
              stage: 'START'
            };
          }
        } else if (expNeeded < 0) {
          // 需要降级 - 直接设置等级和经验
          state.playerParty[index].level = targetLevel1;
          state.playerParty[index].exp = targetLevel2 !== null ? (Math.pow(targetLevel2, 3) - 10 - Math.pow(targetLevel1, 3)) : 0;
          state.playerParty[index].nextLevelExp = Math.pow(targetLevel1 + 1, 3);

          // 重新计算属性值
          const { stats, maxHp } = calculateStats(
            state.playerParty[index].baseStats,
            state.playerParty[index].ivs,
            state.playerParty[index].evs,
            targetLevel1
          );
          state.playerParty[index].stats = stats;
          state.playerParty[index].maxHp = maxHp;
          state.playerParty[index].currentHp = maxHp;

          // 重新设置技能（根据当前等级）
          const learnset = speciesData.learnset || [];
          const availableMoves = learnset
            .filter(l => l.level <= targetLevel1)
            .map(l => MOVES[l.moveId])
            .filter(m => !!m);

          const lastFourMoves = availableMoves.slice(-4);
          state.playerParty[index].moves = lastFourMoves.map((m: any) => ({
            move: m,
            ppCurrent: m.ppMax
          }));

          const levelInfo = targetLevel2 ? `Lv.${targetLevel1}(接近Lv.${targetLevel2})` : `Lv.${targetLevel1}`;
          state.logs.push({
            id: crypto.randomUUID(),
            message: `作弊生效：${speciesData.speciesName} 已调整至 ${levelInfo}，技能已更新`,
            timestamp: Date.now(),
            type: 'urgent'
          });
        } else {
          state.logs.push({
            id: crypto.randomUUID(),
            message: `${speciesData.speciesName} 已经是目标等级`,
            timestamp: Date.now(),
            type: 'urgent'
          });
        }
      }));

      const levelInfo = targetLevel2 ? `Lv.${targetLevel1}(接近Lv.${targetLevel2})` : `Lv.${targetLevel1}`;
      setOutput(prev => [...prev, `成功：${speciesData.speciesName} 已设置为 ${levelInfo}！`]);
      return;
    }

    const command = CHEAT_COMMANDS.find(c => c.name === commandName);
    if (!command) {
      setOutput(prev => [...prev, `未知指令：${commandName}\n输入 /help 查看所有指令`]);
      return;
    }

    const result = command.execute(args);
    setOutput(prev => [...prev, result.message]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    }
  };

  if (gameMode !== 'CHEAT') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          isOpen ? 'bg-slate-800 text-amber-400' : 'bg-slate-900 text-slate-400 hover:text-amber-400'
        } border border-slate-700 hover:border-amber-500/50`}
        title="作弊控制台"
      >
        <Terminal size={20} />
      </button>

      {/* Console Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 bg-slate-950/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-slate-300">作弊控制台</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition-colors"
                title="帮助"
              >
                {showHelp ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800 max-h-32 overflow-y-auto">
              <div className="text-xs text-slate-400 space-y-1">
                {CHEAT_COMMANDS.map(c => (
                  <div key={c.name} className="flex items-start gap-2">
                    <span className="text-amber-500 font-mono">/{c.name}</span>
                    <span className="text-slate-500">{c.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output */}
          <div className="h-40 overflow-y-auto px-3 py-2 space-y-1 bg-black/30 select-text">
            {output.length === 0 ? (
              <div className="text-xs text-slate-500 italic">
                输入 /help 查看可用指令
              </div>
            ) : (
              output.map((line, i) => (
                <div key={i} className={`text-xs font-mono whitespace-pre-wrap select-text cursor-text ${
                  line.startsWith('> ') ? 'text-slate-400' :
                  line.startsWith('错误') ? 'text-red-400' :
                  line.startsWith('未知') ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {line}
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 bg-slate-900 border-t border-slate-700">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入指令..."
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CheatConsole;
