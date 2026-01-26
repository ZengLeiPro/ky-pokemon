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

  useEffect(() => {
    if (isOpen) {
      setSelectedId(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    console.log('PokemonSelectModal: isOpen is false, not rendering');
    return null;
  }
  console.log('PokemonSelectModal: isOpen is true, rendering...');
  console.log('team:', team.length, 'pcBox:', pcBox.length);

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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col shadow-2xl border-2 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 ${activeTab === 'team' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          >
            队伍 ({team.length})
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`px-4 py-2 ${activeTab === 'pc' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          >
            电脑 ({pcBox.length})
          </button>
        </div>

        {/* 宝可梦列表 */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {currentList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {activeTab === 'team' ? '队伍中没有宝可梦' : '电脑中没有宝可梦'}
            </p>
          ) : (
            currentList.map(pokemon => {
              const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
              const isSelected = selectedId === pokemon.id;

              return (
                <div
                  key={pokemon.id}
                  onClick={() => setSelectedId(pokemon.id)}
                  className={`p-3 rounded cursor-pointer border-2 ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-2xl">{pokemon.speciesName}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pokemon.nickname || pokemon.speciesName}</span>
                        <span className="text-xs text-gray-500">Lv.{pokemon.level}</span>
                      </div>
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${hpPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {pokemon.currentHp}/{pokemon.maxHp}
                          </span>
                        </div>
                      </div>
                      {pokemon.status && (
                        <span className="text-xs text-red-500">{pokemon.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedId}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            选择
          </button>
        </div>
      </div>
    </div>
  );
}
