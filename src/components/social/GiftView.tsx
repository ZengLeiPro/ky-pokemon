import { useEffect, useState } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';

export default function GiftView() {
  const {
    receivedGiftRequests,
    sentGiftRequests,
    loadReceivedGiftRequests,
    loadSentGiftRequests,
    acceptGiftRequest,
    rejectGiftRequest,
    cancelGiftRequest,
    isLoading,
    error,
    clearError
  } = useSocialStore();

  const { setView, loadGame } = useGameStore();
  const userId = localStorage.getItem('userId');

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    loadReceivedGiftRequests();
    loadSentGiftRequests();

    const interval = setInterval(() => {
      loadReceivedGiftRequests();
      loadSentGiftRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAccept = async (giftId: string) => {
    const success = await acceptGiftRequest(giftId);
    if (success && userId) {
      await loadGame(userId);
    }
  };

  const pendingReceived = receivedGiftRequests.filter(g => g.status === 'pending');

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">礼物</h1>
        <button
          onClick={() => setView('FRIENDS')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          返回
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 ${activeTab === 'received' ? 'border-b-2 border-green-500 font-bold' : ''}`}
        >
          收到的 ({pendingReceived.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 ${activeTab === 'sent' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          发出的 ({sentGiftRequests.filter(g => g.status === 'pending').length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 收到的礼物 */}
      {activeTab === 'received' && (
        <div className="space-y-3">
          {pendingReceived.length === 0 ? (
            <p className="text-gray-500 text-center py-8">没有收到的礼物</p>
          ) : (
            pendingReceived.map(gift => (
              <div key={gift.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-green-800">
                      来自 {gift.senderUsername}
                    </div>

                    {gift.giftType === 'pokemon' && gift.giftPokemon && (
                      <div className="flex items-center gap-3 mt-2 p-2 bg-white rounded">
                        <img
                          src={gift.giftPokemon.snapshot.spriteUrl}
                          alt={gift.giftPokemon.snapshot.speciesName}
                          className="w-12 h-12 pixelated"
                        />
                        <div>
                          <div className="font-medium">
                            {gift.giftPokemon.snapshot.nickname || gift.giftPokemon.snapshot.speciesName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Lv.{gift.giftPokemon.snapshot.level}
                          </div>
                        </div>
                      </div>
                    )}

                    {gift.giftType === 'item' && (
                      <div className="mt-2 p-2 bg-white rounded">
                        <span className="font-medium">{gift.giftItemName || gift.giftItemId}</span>
                        <span className="text-gray-500"> ×{gift.giftItemQuantity}</span>
                      </div>
                    )}

                    {gift.message && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        "{gift.message}"
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(gift.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleAccept(gift.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      接受
                    </button>
                    <button
                      onClick={() => rejectGiftRequest(gift.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 发出的礼物 */}
      {activeTab === 'sent' && (
        <div className="space-y-3">
          {sentGiftRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">没有发出的礼物</p>
          ) : (
            sentGiftRequests.map(gift => (
              <div
                key={gift.id}
                className={`p-4 rounded-lg border ${
                  gift.status === 'pending'
                    ? 'bg-blue-50 border-blue-200'
                    : gift.status === 'accepted'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      送给 {gift.receiverUsername}
                    </div>

                    {gift.giftType === 'pokemon' && gift.giftPokemon && (
                      <div className="flex items-center gap-3 mt-2 p-2 bg-white rounded">
                        <img
                          src={gift.giftPokemon.snapshot.spriteUrl}
                          alt={gift.giftPokemon.snapshot.speciesName}
                          className="w-12 h-12 pixelated"
                        />
                        <div>
                          <div className="font-medium">
                            {gift.giftPokemon.snapshot.nickname || gift.giftPokemon.snapshot.speciesName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Lv.{gift.giftPokemon.snapshot.level}
                          </div>
                        </div>
                      </div>
                    )}

                    {gift.giftType === 'item' && (
                      <div className="mt-2 p-2 bg-white rounded">
                        <span className="font-medium">{gift.giftItemName || gift.giftItemId}</span>
                        <span className="text-gray-500"> ×{gift.giftItemQuantity}</span>
                      </div>
                    )}

                    {gift.message && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        "{gift.message}"
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        gift.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : gift.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : gift.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {gift.status === 'pending' && '等待接受'}
                        {gift.status === 'accepted' && '已接受'}
                        {gift.status === 'rejected' && '已拒绝'}
                        {gift.status === 'cancelled' && '已取消'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(gift.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {gift.status === 'pending' && (
                    <button
                      onClick={() => cancelGiftRequest(gift.id)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 disabled:opacity-50 ml-4"
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
