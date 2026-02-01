import { useState, useEffect } from 'react';
import type { Pokemon } from '@shared/types/pokemon';
import { PokemonSelectModal } from './PokemonSelectModal';

interface TradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    receiverId: string;
    pokemonId: string;
    requestedType?: string;
    message?: string;
    isPublic?: boolean;
  }) => Promise<boolean>;
  friendId: string;
  friendUsername: string;
  team: Pokemon[];
  pcBox: Pokemon[];
}

export function TradeRequestModal({
  isOpen,
  onClose,
  onSubmit,
  friendId,
  friendUsername,
  team,
  pcBox
}: TradeRequestModalProps) {
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);
  const [requestedType, setRequestedType] = useState('');
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showPokemonSelect, setShowPokemonSelect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 延迟显示以触发动画
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPokemon = [...team, ...pcBox].find(p => p.id === selectedPokemonId);

  const handleSubmit = async () => {
    if (!selectedPokemonId) {
      alert('请选择要交换的宝可梦');
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      receiverId: friendId,
      pokemonId: selectedPokemonId,
      requestedType: requestedType || undefined,
      message: message || undefined,
      isPublic
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
          isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
        }`}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">发起交换</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5">
            {/* 交易对象 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                交易对象
              </label>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {friendUsername[0].toUpperCase()}
                </div>
                <span className="font-medium text-slate-800">{friendUsername}</span>
              </div>
            </div>

            {/* 选择宝可梦 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                选择要交换的宝可梦
              </label>
              {selectedPokemon ? (
                <div
                  onClick={() => setShowPokemonSelect(true)}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl cursor-pointer hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                      {selectedPokemon.spriteUrl ? (
                        <img
                          src={selectedPokemon.spriteUrl}
                          alt={selectedPokemon.speciesName}
                          className="w-14 h-14 object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="text-3xl">{selectedPokemon.speciesName}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{selectedPokemon.nickname || selectedPokemon.speciesName}</div>
                      <div className="text-sm text-slate-500">Lv.{selectedPokemon.level}</div>
                      <div className="flex gap-1 mt-1">
                        {selectedPokemon.types?.map((type: string) => (
                          <span key={type} className="text-xs px-2 py-0.5 bg-white/80 rounded-full text-slate-600">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowPokemonSelect(true)}
                  className="w-full p-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="font-medium">点击选择宝可梦</span>
                  </div>
                </button>
              )}
            </div>

            {/* 求换类型 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                希望换到什么（可选）
              </label>
              <input
                type="text"
                value={requestedType}
                onChange={e => setRequestedType(e.target.value)}
                placeholder="例如：火属性、稀有限定等"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* 附言 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                附言（可选，最多200字）
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="想对对方说的话..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            {/* 公开交换 */}
            <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isPublic ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                }`}>
                  {isPublic && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="hidden"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">公开交换</span>
                  <p className="text-xs text-slate-500">宝可梦中心的其他玩家也可以看到</p>
                </div>
              </label>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedPokemonId || isSubmitting}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/25 hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>发送中...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>发送交换请求</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 宝可梦选择弹窗 */}
      <PokemonSelectModal
        isOpen={showPokemonSelect}
        onClose={() => setShowPokemonSelect(false)}
        onSelect={(pokemonId) => {
          setSelectedPokemonId(pokemonId);
          setShowPokemonSelect(false);
        }}
        title="选择要交换的宝可梦"
        team={team}
        pcBox={pcBox}
      />

      {/* 动画样式 */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
      `}</style>
    </>
  );
}
