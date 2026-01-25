import { useState } from 'react';
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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">发起交换</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* 交易对象 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                交易对象
              </label>
              <div className="p-2 bg-gray-100 rounded">
                {friendUsername}
              </div>
            </div>

            {/* 选择宝可梦 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择要交换的宝可梦
              </label>
              {selectedPokemon ? (
                <div
                  onClick={() => setShowPokemonSelect(true)}
                  className="p-3 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedPokemon.speciesName}</span>
                    <div>
                      <div className="font-medium">{selectedPokemon.nickname || selectedPokemon.speciesName}</div>
                      <div className="text-sm text-gray-500">Lv.{selectedPokemon.level}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowPokemonSelect(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  点击选择宝可梦
                </button>
              )}
            </div>

            {/* 求换类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                希望换到什么（可选）
              </label>
              <input
                type="text"
                value={requestedType}
                onChange={e => setRequestedType(e.target.value)}
                placeholder="例如：火属性、稀有限定等"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 附言 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                附言（可选，最多200字）
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="想对对方说的话..."
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 公开交换 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                公开交换（宝可梦中心可见）
              </label>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-2 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedPokemonId || isSubmitting}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isSubmitting ? '发送中...' : '发送交换请求'}
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
    </>
  );
}
