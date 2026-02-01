import { useEffect, useState } from 'react';
import type { Pokemon } from '@shared/types/pokemon';

interface PokemonSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemonId: string) => void;
  title: string;
  team: Pokemon[];
  pcBox: Pokemon[];
  excludeIds?: string[];
}

export function PokemonSelectModal({
  isOpen,
  onClose,
  onSelect,
  title,
  team,
  pcBox,
  excludeIds = []
}: PokemonSelectModalProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'pc'>('team');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(null);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allPokemon = [
    ...team.map(p => ({ ...p, source: 'team' as const })),
    ...pcBox.map(p => ({ ...p, source: 'pc' as const }))
  ];

  const filteredPokemon = allPokemon.filter(p => !excludeIds.includes(p.id));

  const currentList = activeTab === 'team'
    ? filteredPokemon.filter(p => p.source === 'team')
    : filteredPokemon.filter(p => p.source === 'pc');

  const handleSelect = () => {
    if (selectedId) {
      onSelect(selectedId);
      onClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl p-5 max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
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

        {/* 标签页 */}
        <div className="flex gap-2 mb-4 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'team'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            队伍 ({team.length})
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'pc'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            电脑 ({pcBox.length})
          </button>
        </div>

        {/* 宝可梦列表 */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
          {currentList.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-500">
                {activeTab === 'team' ? '队伍中没有宝可梦' : '电脑中没有宝可梦'}
              </p>
            </div>
          ) : (
            currentList.map((pokemon, index) => {
              const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
              const isSelected = selectedId === pokemon.id;

              return (
                <div
                  key={pokemon.id}
                  onClick={() => setSelectedId(pokemon.id)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 animate-fade-in-up ${
                    isSelected
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-[1.01]'
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.005]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {/* 宝可梦图片 */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden transition-all ${
                      isSelected ? 'bg-white shadow-md' : 'bg-gradient-to-br from-slate-100 to-slate-200'
                    }`}>
                      {pokemon.spriteUrl ? (
                        <img
                          src={pokemon.spriteUrl}
                          alt={pokemon.speciesName}
                          className={`w-14 h-14 object-contain pixelated transition-transform ${isSelected ? 'scale-110' : ''}`}
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="text-2xl">{pokemon.speciesName}</span>
                      )}
                    </div>

                    {/* 宝可梦信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 truncate">
                          {pokemon.nickname || pokemon.speciesName}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Lv.{pokemon.level}
                        </span>
                      </div>

                      {/* HP 条 */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              hpPercent > 50 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              hpPercent > 20 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          {pokemon.currentHp}/{pokemon.maxHp}
                        </span>
                      </div>

                      {/* 类型和状态 */}
                      <div className="flex items-center gap-2">
                        {pokemon.types?.map((type: string) => (
                          <span key={type} className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                            {type}
                          </span>
                        ))}
                        {pokemon.status && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                            {pokemon.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 选中标记 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-blue-500 scale-100' : 'bg-slate-200 scale-90 opacity-0'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedId}
            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>选择</span>
          </button>
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
