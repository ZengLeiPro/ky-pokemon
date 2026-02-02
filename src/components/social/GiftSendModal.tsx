import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSocialStore } from '@/stores/socialStore';
import type { Pokemon } from '@shared/types';

interface GiftSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendId: string;
  friendUsername: string;
}

export function GiftSendModal({ isOpen, onClose, friendId, friendUsername }: GiftSendModalProps) {
  const { playerParty: team, playerStorage: pcBox, inventory } = useGameStore();
  const { sendPokemonGift, sendItemGift, isLoading } = useSocialStore();

  const [giftType, setGiftType] = useState<'pokemon' | 'item'>('pokemon');
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const allPokemon: Pokemon[] = [...team, ...pcBox];
  const giftableItems = inventory.filter(item => item.category !== 'KEY_ITEMS' && item.quantity > 0);

  const selectedItem = giftableItems.find(i => i.id === selectedItemId);
  const maxQuantity = selectedItem?.quantity || 1;

  const handleSend = async () => {
    setError(null);

    if (giftType === 'pokemon') {
      if (!selectedPokemonId) {
        setError('请选择要赠送的宝可梦');
        return;
      }
      if (team.length <= 1 && team.some(p => p.id === selectedPokemonId)) {
        setError('队伍中至少需要保留1只宝可梦');
        return;
      }
      const success = await sendPokemonGift(friendId, selectedPokemonId, message || undefined);
      if (success) {
        onClose();
      } else {
        setError('发送失败，请重试');
      }
    } else {
      if (!selectedItemId) {
        setError('请选择要赠送的物品');
        return;
      }
      const success = await sendItemGift(friendId, selectedItemId, itemQuantity, message || undefined);
      if (success) {
        onClose();
      } else {
        setError('发送失败，请重试');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-black">赠送给 {friendUsername}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {/* 礼物类型选择 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setGiftType('pokemon')}
              className={`flex-1 py-2 rounded ${
                giftType === 'pokemon'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              宝可梦
            </button>
            <button
              onClick={() => setGiftType('item')}
              className={`flex-1 py-2 rounded ${
                giftType === 'item'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              物品
            </button>
          </div>

          {/* 宝可梦选择 */}
          {giftType === 'pokemon' && (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 mb-2">选择要赠送的宝可梦：</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {allPokemon.map(pokemon => {
                  const isInTeam = team.some(p => p.id === pokemon.id);
                  const isLastInTeam = isInTeam && team.length === 1;

                  return (
                    <button
                      key={pokemon.id}
                      onClick={() => !isLastInTeam && setSelectedPokemonId(pokemon.id)}
                      disabled={isLastInTeam}
                      className={`p-2 rounded border text-left flex items-center gap-2 ${
                        selectedPokemonId === pokemon.id
                          ? 'border-purple-500 bg-purple-50'
                          : isLastInTeam
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <img
                        src={pokemon.spriteUrl}
                        alt={pokemon.speciesName}
                        className="w-10 h-10 pixelated"
                      />
                      <div className="text-xs">
                        <div className="font-medium text-black">{pokemon.nickname || pokemon.speciesName}</div>
                        <div className="text-gray-500">Lv.{pokemon.level}</div>
                        {isInTeam && <div className="text-blue-500">队伍</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 物品选择 */}
          {giftType === 'item' && (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 mb-2">选择要赠送的物品：</p>
              {giftableItems.length === 0 ? (
                <p className="text-gray-400 text-center py-4">没有可赠送的物品</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {giftableItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setItemQuantity(1);
                        }}
                        className={`p-2 rounded border text-left ${
                          selectedItemId === item.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-black">{item.name}</div>
                        <div className="text-xs text-gray-500">×{item.quantity}</div>
                      </button>
                    ))}
                  </div>

                  {selectedItemId && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">数量：</span>
                      <input
                        type="number"
                        min={1}
                        max={maxQuantity}
                        value={itemQuantity}
                        onChange={e => setItemQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value))))}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                      <span className="text-sm text-gray-500">/ {maxQuantity}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 附言 */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 block mb-1">附言（可选）：</label>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={200}
              placeholder="写点什么..."
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            取消
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || (giftType === 'pokemon' ? !selectedPokemonId : !selectedItemId)}
            className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '发送中...' : '发送礼物'}
          </button>
        </div>
      </div>
    </div>
  );
}
