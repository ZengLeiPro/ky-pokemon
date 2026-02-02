import { useEffect, useState } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';
import { BattleChallengeModal } from './BattleChallengeModal';
import { GiftSendModal } from './GiftSendModal';

export default function FriendsView() {
  const {
    friends,
    pendingRequests,
    pendingBattleChallenges,
    stuckBattle,
    searchResults,
    receivedGiftRequests,
    isLoading,
    error,
    searchUsers,
    sendFriendRequest,
    loadFriends,
    loadPendingRequests,
    loadPendingBattleChallenges,
    loadStuckBattle,
    loadReceivedGiftRequests,
    cleanupStuckBattle,
    acceptBattleChallenge,
    rejectBattleChallenge,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriend,
    clearSearchResults,
    clearError
  } = useSocialStore();

  const setView = useGameStore(s => s.setView);
  const gameMode = useGameStore(s => s.gameMode);
  const isCheatMode = gameMode === 'CHEAT';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'battles' | 'search'>('friends');
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [acceptingBattleId, setAcceptingBattleId] = useState<string | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftTargetFriend, setGiftTargetFriend] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
    loadPendingBattleChallenges();
    loadStuckBattle();
    loadReceivedGiftRequests();
    // 定期刷新好友列表获取最新在线状态
    const interval = setInterval(loadFriends, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
      setActiveTab('search');
    }
  };

  const handleStartChat = (odId: string) => {
    // 存储当前聊天对象的 ID，然后切换到聊天视图
    localStorage.setItem('currentChatFriendId', odId);
    setView('CHAT');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">好友</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('GIFT')}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 relative"
          >
            礼物
            {receivedGiftRequests.filter(g => g.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {receivedGiftRequests.filter(g => g.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setView('ROAM')}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            返回
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="搜索用户名..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          搜索
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => { setActiveTab('friends'); clearSearchResults(); }}
          className={`px-4 py-2 ${activeTab === 'friends' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          好友 ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 ${activeTab === 'requests' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          请求 ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('battles')}
          className={`px-4 py-2 ${activeTab === 'battles' ? 'border-b-2 border-red-500 font-bold' : ''} ${stuckBattle ? 'text-orange-600' : ''}`}
        >
          对战 {(pendingBattleChallenges.length > 0 || stuckBattle) && (
            <span className={stuckBattle ? 'text-orange-600' : ''}>
              ({pendingBattleChallenges.length}{stuckBattle ? '+1卡住' : ''})
            </span>
          )}
        </button>
        {searchResults.length > 0 && (
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 ${activeTab === 'search' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          >
            搜索结果
          </button>
        )}
      </div>

      {/* 作弊模式提示 */}
      {isCheatMode && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded">
          作弊模式下无法进行好友对战
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 好友列表 */}
      {activeTab === 'friends' && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <p className="text-gray-500 text-center py-8">还没有好友，快去搜索添加吧！</p>
          ) : (
            [...friends]
              .sort((a, b) => {
                if (a.isOnline && !b.isOnline) return -1;
                if (!a.isOnline && b.isOnline) return 1;
                return 0;
              })
              .map(friend => (
              <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  {friend.username}
                  {!friend.isOnline && (
                    <span className="text-xs text-gray-400">离线</span>
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartChat(friend.odId)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    聊天
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('battleFriendId', friend.odId);
                      setShowBattleModal(true);
                    }}
                    disabled={!friend.isOnline || isCheatMode}
                    className={`px-3 py-1 text-white text-sm rounded ${
                      friend.isOnline && !isCheatMode
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    title={isCheatMode ? '作弊模式下无法对战' : !friend.isOnline ? '对方不在线' : ''}
                  >
                    对战
                  </button>
                  <button
                    onClick={() => {
                      setGiftTargetFriend({ id: friend.odId, username: friend.username });
                      setShowGiftModal(true);
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    赠送
                  </button>
                  <button
                    onClick={() => deleteFriend(friend.id)}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 好友请求 */}
      {activeTab === 'requests' && (
        <div className="space-y-2">
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">没有待处理的好友请求</p>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <span className="font-medium">{req.fromUsername}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    接受
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(req.id)}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 搜索结果 */}
      {activeTab === 'search' && (
        <div className="space-y-2">
          {searchResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">没有找到用户</p>
          ) : (
            searchResults.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{user.username}</span>
                {user.isFriend ? (
                  <span className="text-green-600 text-sm">已是好友</span>
                ) : user.hasPendingRequest ? (
                  <span className="text-yellow-600 text-sm">请求已发送</span>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    添加好友
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 对战邀请 */}
      {activeTab === 'battles' && (
        <div className="space-y-2">
          {/* 卡住的对战 */}
          {stuckBattle && (
            <div className="p-3 bg-orange-100 border border-orange-300 rounded mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-orange-800">
                    你有一场卡住的对战
                  </div>
                  <div className="text-sm text-orange-600 mt-1">
                    {stuckBattle.isChallenger ? '你' : stuckBattle.challengerUsername} vs {stuckBattle.isChallenger ? stuckBattle.opponentUsername : '你'}
                    <span className="ml-2">({stuckBattle.status === 'pending' ? '等待接受' : '进行中'})</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(stuckBattle.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const success = await cleanupStuckBattle();
                    if (success) {
                      loadStuckBattle();
                    }
                  }}
                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                >
                  清理
                </button>
              </div>
            </div>
          )}

          {/* 收到的对战邀请 */}
          {pendingBattleChallenges.length === 0 && !stuckBattle ? (
            <p className="text-gray-500 text-center py-8">没有待处理的对战邀请</p>
          ) : (
            pendingBattleChallenges.map(challenge => (
              <div key={challenge.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div>
                  <div className="font-medium">{challenge.challengerUsername} 发起对战</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(challenge.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (acceptingBattleId) return;
                      setAcceptingBattleId(challenge.id);
                      const success = await acceptBattleChallenge(challenge.id, gameMode);
                      setAcceptingBattleId(null);

                      if (success) {
                        localStorage.setItem('currentBattleId', challenge.id);
                        setView('PVP_BATTLE');
                      }
                    }}
                    disabled={isLoading || acceptingBattleId === challenge.id || isCheatMode}
                    className={`px-3 py-1 text-white text-sm rounded ${isCheatMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} disabled:opacity-50`}
                    title={isCheatMode ? '作弊模式下无法对战' : ''}
                  >
                    {acceptingBattleId === challenge.id ? '接受中...' : isCheatMode ? '作弊模式' : '接受'}
                  </button>
                  <button
                    onClick={() => rejectBattleChallenge(challenge.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 对战弹窗 */}
      <BattleChallengeModal
        isOpen={showBattleModal}
        onClose={() => setShowBattleModal(false)}
        mode="challenge"
      />

      {/* 赠送弹窗 */}
      {giftTargetFriend && (
        <GiftSendModal
          isOpen={showGiftModal}
          onClose={() => {
            setShowGiftModal(false);
            setGiftTargetFriend(null);
          }}
          friendId={giftTargetFriend.id}
          friendUsername={giftTargetFriend.username}
        />
      )}
    </div>
  );
}
