import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { config } from '@/config';
import { Gift, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface RedeemReward {
  items?: Array<{ id: string; name: string; description: string; category: string; quantity: number }>;
  money?: number;
}

interface RedeemResult {
  description: string;
  rewards: RedeemReward;
}

const RedeemCodeView: React.FC = () => {
  const { setView, loadGame, gameMode } = useGameStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('请输入兑换码');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim(), mode: gameMode }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setCode('');

        // Reload game data to reflect new items/money
        const userId = localStorage.getItem('userId');
        if (userId) {
          await loadGame(userId);
        }
      } else {
        setError(data.error || '兑换失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <button
          onClick={() => setView('ROAM')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-700/50"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">返回</span>
        </button>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Gift size={20} className="text-amber-400" />
          礼包码兑换
        </h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 gap-6">
        {/* Input Card */}
        <div className="w-full max-w-sm bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              输入兑换码
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) handleRedeem();
              }}
              placeholder="请输入礼包码..."
              className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-widest placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              maxLength={30}
              autoFocus
              disabled={loading}
            />
          </div>

          <button
            onClick={handleRedeem}
            disabled={loading || !code.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                兑换中...
              </>
            ) : (
              <>
                <Gift size={18} />
                兑换
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-sm bg-red-900/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
            <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="w-full max-w-sm bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={22} className="text-emerald-400" />
              <h3 className="text-lg font-bold text-emerald-300">兑换成功!</h3>
            </div>

            <p className="text-emerald-200 font-medium mb-3">{result.description}</p>

            <div className="space-y-2">
              {result.rewards.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2"
                >
                  <span className="text-slate-200 text-sm">{item.name}</span>
                  <span className="text-amber-400 text-sm font-mono">x{item.quantity}</span>
                </div>
              ))}

              {result.rewards.money && (
                <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2">
                  <span className="text-slate-200 text-sm">金钱</span>
                  <span className="text-yellow-400 text-sm font-mono">+${result.rewards.money.toLocaleString()}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-3 text-center">
              奖励已发放至背包
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="w-full max-w-sm text-center text-xs text-slate-500 leading-relaxed">
          <p>每个兑换码每位玩家只能使用一次</p>
          <p className="mt-1">兑换成功后奖励将直接添加到背包中</p>
        </div>
      </div>
    </div>
  );
};

export default RedeemCodeView;
