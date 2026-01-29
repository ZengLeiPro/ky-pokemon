import { useEffect, useState } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';
import type { Friend } from '@shared/types';

interface BattleChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'challenge' | 'pending'; // challenge: 发起对战, pending: 待处理的对战邀请
  friend?: Friend;
  battleId?: string;
}

export function BattleChallengeModal({
  isOpen,
  onClose,
  mode,
  friend,
  battleId
}: BattleChallengeModalProps) {
  const {
    friends,
    pendingBattleChallenges,
    sendBattleChallenge,
    acceptBattleChallenge,
    rejectBattleChallenge,
    loadPendingBattleChallenges,
    loadFriends,
    isLoading,
    error
  } = useSocialStore();

  const setView = useGameStore(s => s.setView);

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      loadPendingBattleChallenges();
      if (friend) {
        setSelectedFriendId(friend.odId);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChallenge = async () => {
    if (!selectedFriendId) return;
    const newBattleId = await sendBattleChallenge(selectedFriendId);
    if (newBattleId) {
      onClose();
      setSelectedFriendId(null);
      // 发起方也进入对战等待页面
      localStorage.setItem('currentBattleId', newBattleId);
      setView('PVP_BATTLE');
    }
  };

  const handleAccept = async (battleId: string) => {
    setActionLoading(battleId);
    const success = await acceptBattleChallenge(battleId);
    setActionLoading(null);
    if (success) {
      onClose();
    }
  };

  const handleReject = async (battleId: string) => {
    setActionLoading(battleId);
    const success = await rejectBattleChallenge(battleId);
    setActionLoading(null);
    if (success) {
      loadPendingBattleChallenges();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {mode === 'challenge' ? '发起对战' : '对战邀请'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        {/* 模式：待处理的对战邀请 */}
        {mode === 'pending' && (
          <div className="space-y-3">
            {pendingBattleChallenges.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                暂没有待处理的对战邀请
              </p>
            ) : (
              pendingBattleChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  className="bg-gray-800 p-3 rounded flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-white">
                      {challenge.challengerUsername} 发起对战
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(challenge.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(challenge.id)}
                      disabled={actionLoading === challenge.id}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-500 disabled:opacity-50"
                    >
                      接受
                    </button>
                    <button
                      onClick={() => handleReject(challenge.id)}
                      disabled={actionLoading === challenge.id}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 disabled:opacity-50"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 模式：发起对战 */}
        {mode === 'challenge' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">
              选择一位好友发起对战
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  还没有好友，快去添加吧！
                </p>
              ) : (
                [...friends]
                  .sort((a, b) => {
                    if (a.isOnline && !b.isOnline) return -1;
                    if (!a.isOnline && b.isOnline) return 1;
                    return 0;
                  })
                  .map(friendItem => (
                  <button
                    key={friendItem.id}
                    onClick={() => friendItem.isOnline && setSelectedFriendId(friendItem.odId)}
                    disabled={!friendItem.isOnline}
                    className={`w-full p-3 rounded flex items-center justify-between ${
                      !friendItem.isOnline
                        ? 'bg-gray-800 opacity-50 cursor-not-allowed'
                        : selectedFriendId === friendItem.odId
                          ? 'bg-blue-900 border border-blue-500'
                          : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        friendItem.isOnline ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      {friendItem.username}
                      {!friendItem.isOnline && (
                        <span className="text-xs text-gray-400">离线</span>
                      )}
                    </span>
                    {selectedFriendId === friendItem.odId && (
                      <span className="text-blue-400">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleChallenge}
                disabled={!selectedFriendId || isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50"
              >
                {isLoading ? '发送中...' : '发起挑战'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
