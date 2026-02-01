import { useEffect, useState } from 'react';
import type { Pokemon } from '@shared/types/pokemon';

interface TradeAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  myPokemon: Pokemon;
  theirPokemon: Pokemon;
  myUsername: string;
  theirUsername: string;
}

export function TradeAnimation({
  isOpen,
  onComplete,
  myPokemon,
  theirPokemon,
  myUsername,
  theirUsername
}: TradeAnimationProps) {
  const [phase, setPhase] = useState<'intro' | 'pokeballs' | 'exchange' | 'reveal' | 'complete'>('intro');

  useEffect(() => {
    if (!isOpen) {
      setPhase('intro');
      return;
    }

    // 动画时间线
    const timeline = [
      { phase: 'intro' as const, delay: 0 },
      { phase: 'pokeballs' as const, delay: 1500 },
      { phase: 'exchange' as const, delay: 3000 },
      { phase: 'reveal' as const, delay: 4500 },
      { phase: 'complete' as const, delay: 6500 }
    ];

    const timers: NodeJS.Timeout[] = [];

    timeline.forEach(({ phase, delay }) => {
      const timer = setTimeout(() => setPhase(phase), delay);
      timers.push(timer);
    });

    // 完成后回调
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 8000);
    timers.push(completeTimer);

    return () => timers.forEach(t => clearTimeout(t));
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* 背景 */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          phase === 'intro' ? 'bg-black' : 'bg-gradient-to-b from-indigo-900 via-purple-900 to-black'
        }`}
      />

      {/* 星星背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* 连接线条 */}
      {(phase === 'pokeballs' || phase === 'exchange') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`h-1 bg-gradient-to-r from-cyan-400 via-white to-pink-400 transition-all duration-1000 ${
            phase === 'exchange' ? 'w-64 animate-pulse' : 'w-32'
          }`} />
        </div>
      )}

      {/* 主内容区域 */}
      <div className="relative z-10 w-full max-w-4xl px-8">
        {/* 介绍阶段 */}
        {phase === 'intro' && (
          <div className="text-center animate-fade-in">
            <div className="text-4xl font-bold text-white mb-4 animate-pulse">
              交换开始！
            </div>
            <div className="text-xl text-gray-300">
              {myUsername} ⇄ {theirUsername}
            </div>
          </div>
        )}

        {/* 精灵球阶段 */}
        {(phase === 'pokeballs' || phase === 'exchange') && (
          <div className="flex items-center justify-between">
            {/* 左边 - 我的精灵球 */}
            <div className={`flex flex-col items-center transition-all duration-1000 ${
              phase === 'exchange' ? 'translate-x-32 opacity-0' : ''
            }`}>
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-white border-4 border-gray-800 shadow-2xl animate-bounce-slow">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-gray-800" />
                </div>
                {/* 发光效果 */}
                <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
              </div>
              <div className="mt-4 text-cyan-400 font-bold">{myPokemon.nickname || myPokemon.speciesName}</div>
              <div className="text-sm text-gray-400">Lv.{myPokemon.level}</div>
            </div>

            {/* 右边 - 对方的精灵球 */}
            <div className={`flex flex-col items-center transition-all duration-1000 ${
              phase === 'exchange' ? '-translate-x-32 opacity-0' : ''
            }`}>
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-white border-4 border-gray-800 shadow-2xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-gray-800" />
                </div>
                {/* 发光效果 */}
                <div className="absolute inset-0 rounded-full bg-pink-400/30 animate-ping" style={{ animationDelay: '0.3s' }} />
              </div>
              <div className="mt-4 text-pink-400 font-bold">{theirPokemon.nickname || theirPokemon.speciesName}</div>
              <div className="text-sm text-gray-400">Lv.{theirPokemon.level}</div>
            </div>
          </div>
        )}

        {/* 揭示阶段 */}
        {phase === 'reveal' && (
          <div className="flex items-center justify-between">
            {/* 左边 - 获得对方的宝可梦 */}
            <div className="flex flex-col items-center animate-slide-in-left">
              <div className="relative">
                <div className="w-32 h-32 flex items-center justify-center">
                  <img
                    src={theirPokemon.spriteUrl}
                    alt={theirPokemon.speciesName}
                    className="w-full h-full object-contain pixelated animate-float"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                {/* 闪光效果 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent animate-shine" />
              </div>
              <div className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                <span className="text-white font-bold">获得了 {theirPokemon.nickname || theirPokemon.speciesName}！</span>
              </div>
            </div>

            {/* 中间 - 交换完成图标 */}
            <div className="flex flex-col items-center animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mt-2 text-yellow-400 font-bold">交换成功！</div>
            </div>

            {/* 右边 - 送出我的宝可梦 */}
            <div className="flex flex-col items-center animate-slide-in-right">
              <div className="relative">
                <div className="w-32 h-32 flex items-center justify-center opacity-60">
                  <img
                    src={myPokemon.spriteUrl}
                    alt={myPokemon.speciesName}
                    className="w-full h-full object-contain pixelated animate-float"
                    style={{ imageRendering: 'pixelated', animationDelay: '0.5s' }}
                  />
                </div>
              </div>
              <div className="mt-4 px-4 py-2 bg-gray-700/80 rounded-full">
                <span className="text-gray-300">送出了 {myPokemon.nickname || myPokemon.speciesName}</span>
              </div>
            </div>
          </div>
        )}

        {/* 完成阶段 */}
        {phase === 'complete' && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <div className="inline-block p-6 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl border border-yellow-500/50">
                <img
                  src={theirPokemon.spriteUrl}
                  alt={theirPokemon.speciesName}
                  className="w-40 h-40 object-contain pixelated mx-auto animate-bounce-slow"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              恭喜获得 {theirPokemon.nickname || theirPokemon.speciesName}！
            </div>
            <div className="text-gray-400 mb-6">
              来自 {theirUsername} 的礼物
            </div>
            <div className="text-sm text-gray-500 animate-pulse">
              点击任意位置继续...
            </div>
          </div>
        )}
      </div>

      {/* 点击关闭（完成阶段） */}
      {phase === 'complete' && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={onComplete}
        />
      )}

      {/* 自定义动画样式 */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-shine { animation: shine 1.5s ease-in-out infinite; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-float { animation: float 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-bounce-slow { animation: bounce-slow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
