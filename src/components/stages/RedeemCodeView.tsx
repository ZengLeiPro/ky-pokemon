import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Gift } from 'lucide-react';
import { createPokemon } from '@/lib/mechanics';
import { produce } from 'immer';

// 礼包码奖励配置 —— 在这里添加新的礼包码
const REDEEM_CODES: Record<string, {
  description: string;
  rewards: {
    items?: Array<{ id: string; name: string; description: string; category: string; quantity: number }>;
    pokemon?: Array<{ speciesKey: string; level: number }>;
    money?: number;
  };
}> = {
  'LKY202650': {
    description: '楷言特别礼包',
    rewards: {
      pokemon: [
        { speciesKey: 'lugia', level: 50 },
      ],
    },
  },
};

export default function RedeemCodeView() {
  const { setView, addItem, addLog } = useGameStore();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [redeemedCodes, setRedeemedCodes] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('redeemedCodes');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleRedeem = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setMessage({ text: '请输入礼包码', type: 'error' });
      return;
    }

    if (trimmed !== trimmed.toUpperCase()) {
      setMessage({ text: '礼包码必须使用大写字母', type: 'error' });
      return;
    }

    if (redeemedCodes.has(trimmed)) {
      setMessage({ text: '这个礼包码已经使用过了', type: 'error' });
      return;
    }

    const reward = REDEEM_CODES[trimmed];
    if (!reward) {
      setMessage({ text: '无效的礼包码', type: 'error' });
      return;
    }

    // 发放物品奖励
    if (reward.rewards.items) {
      for (const item of reward.rewards.items) {
        addItem(item.id, item.quantity);
      }
    }

    // 发放宝可梦奖励
    if (reward.rewards.pokemon) {
      for (const p of reward.rewards.pokemon) {
        const newPokemon = createPokemon(p.speciesKey, p.level, []);
        useGameStore.setState(produce((state: any) => {
          if (state.playerParty.length < 6) {
            state.playerParty.push(newPokemon);
          } else {
            state.playerStorage.push(newPokemon);
          }
          state.pokedex[newPokemon.speciesData.pokedexId] = 'CAUGHT';
        }));
        addLog(`获得了 ${newPokemon.speciesName} (Lv.${p.level})！`, 'urgent');
      }
    }

    // 记录已兑换
    const newRedeemed = new Set(redeemedCodes);
    newRedeemed.add(trimmed);
    setRedeemedCodes(newRedeemed);
    localStorage.setItem('redeemedCodes', JSON.stringify([...newRedeemed]));

    addLog(`兑换成功：${reward.description}！`, 'info');
    setMessage({ text: `兑换成功！获得了「${reward.description}」`, type: 'success' });
    setCode('');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-orange-900 via-slate-900 to-amber-900 text-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift size={24} className="text-orange-400" />
          礼包码兑换
        </h1>
        <button
          onClick={() => setView('ROAM')}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold"
        >
          返回
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-sm mx-auto w-full">
        <div className="w-full bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-white/5">
          <p className="text-slate-400 text-sm text-center mb-4">
            输入礼包码获取奖励
          </p>

          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            placeholder="请输入礼包码..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center font-mono text-lg tracking-widest placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-orange-500 transition-colors"
            maxLength={30}
          />

          <button
            onClick={handleRedeem}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            兑换
          </button>

          {message && (
            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-900/50 text-red-300 border border-red-500/30'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        <p className="text-slate-500 text-xs text-center">
          礼包码必须使用大写字母，每个码只能使用一次
        </p>
      </div>
    </div>
  );
}
