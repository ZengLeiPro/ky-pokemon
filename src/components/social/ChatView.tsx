import { useEffect, useState, useRef } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';
import { useToast } from '@/components/ui/Toast';
import { TradeRequestModal } from './TradeRequestModal';
import { BattleChallengeModal } from './BattleChallengeModal';

export default function ChatView() {
  const {
    friends,
    currentChatMessages,
    currentChatFriendId,
    conversations,
    loadConversations,
    loadFriends,
    setCurrentChat,
    sendMessage,
    startChatPolling,
    stopChatPolling,
    createTradeRequest,
    isLoading
  } = useSocialStore();

  const { playerParty, playerStorage, setView } = useGameStore();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFriends();
    loadConversations();
    startChatPolling();

    // 检查是否从好友列表跳转过来
    const friendId = localStorage.getItem('currentChatFriendId');
    if (friendId) {
      setCurrentChat(friendId);
      localStorage.removeItem('currentChatFriendId');
    }

    return () => stopChatPolling();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !currentChatFriendId || isSending) return;

    setIsSending(true);
    const success = await sendMessage(currentChatFriendId, inputValue.trim());
    if (success) {
      setInputValue('');
    } else {
      useToast.getState().show('消息发送失败，请重试', 'error');
    }
    setIsSending(false);
  };

  const currentFriend = friends.find(f => f.friendUserId === currentChatFriendId);

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('FRIENDS')}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            返回好友
          </button>
          {currentFriend && (
            <span className="font-bold">{currentFriend.username}</span>
          )}
        </div>
        <button
          onClick={() => setView('ROAM')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          返回游戏
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧会话列表 */}
        <div className="w-full md:w-64 border-r overflow-y-auto">
          <div className="p-2 text-sm font-bold text-gray-500 border-b">会话</div>
          {conversations.map(conv => (
            <div
              key={conv.friendUserId}
              onClick={() => setCurrentChat(conv.friendUserId)}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                currentChatFriendId === conv.friendUserId ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{conv.username}</span>
                {conv.unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.lastMessage && (
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              )}
            </div>
          ))}
        </div>

        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col">
          {currentChatFriendId ? (
            <>
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentChatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        msg.isOwn
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      if (currentChatFriendId && currentFriend) {
                        setShowBattleModal(true);
                      } else {
                        alert('请先选择一个好友');
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    发起对战
                  </button>
                  <button
                    onClick={() => {
                      if (currentChatFriendId) {
                        setShowTradeModal(true);
                      } else {
                        alert('请先选择一个好友');
                      }
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    发起交换
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="输入消息..."
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSending || !inputValue.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    发送
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              选择一个好友开始聊天
            </div>
          )}
        </div>
      </div>

      {/* 发起交换弹窗 */}
      {currentChatFriendId && currentFriend && (
        <TradeRequestModal
          isOpen={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          onSubmit={async (data) => {
            const success = await createTradeRequest(data);
            if (success) {
              setShowTradeModal(false);
            }
            return success;
          }}
          friendId={currentChatFriendId}
          friendUsername={currentFriend.username}
          team={playerParty}
          pcBox={playerStorage}
        />
      )}

      {/* 发起对战弹窗 */}
      {currentChatFriendId && currentFriend && (
        <BattleChallengeModal
          isOpen={showBattleModal}
          onClose={() => setShowBattleModal(false)}
          mode="challenge"
          friend={currentFriend}
        />
      )}
    </div>
  );
}
