import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Gift } from 'lucide-react';
import { config } from '@/config';

const API_URL = `${config.apiUrl}/redeem`;

export default function RedeemCodeView() {
  const { setView, addLog } = useGameStore();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setMessage({ text: '请输入礼包码', type: 'error' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: '请先登录', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: trimmed }),
      });

      const result = await response.json();

      if (result.success) {
        // 兑换成功后重新加载存档以同步数据
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
        if (userId) {
          await useGameStore.getState().loadGame(userId);
        }
        addLog(`兑换成功：${result.data.description}！`, 'info');
        setMessage({ text: `兑换成功！获得了「${result.data.description}」`, type: 'success' });
        setCode('');
      } else {
        setMessage({ text: result.error || '兑换失败', type: 'error' });
      }
    } catch {
      setMessage({ text: '网络错误，请稍后再试', type: 'error' });
    } finally {
      setLoading(false);
    }
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
            onKeyDown={e => e.key === 'Enter' && !loading && handleRedeem()}
            placeholder="请输入礼包码..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center font-mono text-lg tracking-widest placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-orange-500 transition-colors"
            maxLength={30}
            disabled={loading}
          />

          <button
            onClick={handleRedeem}
            disabled={loading}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            {loading ? '兑换中...' : '兑换'}
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
          礼包码不区分大小写，每个码只能使用一次
        </p>
      </div>
    </div>
  );
}
