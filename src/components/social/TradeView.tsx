import { useEffect, useState } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';

export default function TradeView() {
  const {
    receivedTradeRequests,
    sentTradeRequests,
    publicTradeRequests,
    isLoading,
    error,
    loadReceivedTradeRequests,
    loadSentTradeRequests,
    loadPublicTradeRequests,
    acceptTradeRequest,
    rejectTradeRequest,
    cancelTradeRequest,
    confirmTradeRequest,
    clearError
  } = useSocialStore();

  const setView = useGameStore(s => s.setView);
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'public'>('received');

  useEffect(() => {
    loadReceivedTradeRequests();
    loadSentTradeRequests();
    loadPublicTradeRequests();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '等待回应';
      case 'accepted': return '待确认';
      case 'completed': return '已完成';
      case 'rejected': return '已拒绝';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'accepted': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'rejected':
      case 'cancelled': return 'text-gray-500';
      default: return '';
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">交换中心</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('ROAM')}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            返回游戏
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 标签页 */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 ${activeTab === 'received' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          收到的请求 ({receivedTradeRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 ${activeTab === 'sent' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          发出的请求 ({sentTradeRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-4 py-2 ${activeTab === 'public' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          公开交换 ({publicTradeRequests.length})
        </button>
      </div>

      {/* 收到的请求 */}
      {activeTab === 'received' && (
        <div className="space-y-3">
          {receivedTradeRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">没有收到的交换请求</p>
          ) : (
            receivedTradeRequests.map(req => (
              <div key={req.id} className="p-4 bg-yellow-50 rounded border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-medium">{req.initiatorUsername}</span> 发起交换
                    <p className="text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm ${getStatusClass(req.status)}`}>
                    {getStatusText(req.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">TA 提供:</span>
                    <div className="px-3 py-1 bg-green-100 rounded text-sm">
                      {req.offeredPokemon.snapshot.speciesName}
                    </div>
                  </div>
                  <span className="text-gray-400">⇄</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">你将提供:</span>
                    {req.status === 'pending' ? (
                      <button
                        onClick={() => {
                          // 存储当前选择的交换请求ID，弹出选择宝可梦弹窗
                          localStorage.setItem('pendingTradeRequestId', req.id);
                          // 跳转到选择宝可梦界面（这里暂时用 alert）
                          alert(`请从背包/电脑中选择一只宝可梦与 ${req.offeredPokemon.snapshot.speciesName} 交换`);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        选择宝可梦
                      </button>
                    ) : (
                      <div className="px-3 py-1 bg-blue-100 rounded text-sm">
                        {req.receiverPokemon?.snapshot.speciesName || '-'}
                      </div>
                    )}
                  </div>
                </div>

                {req.message && (
                  <p className="text-sm text-gray-600 mb-3 italic">"{req.message}"</p>
                )}

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        localStorage.setItem('pendingTradeRequestId', req.id);
                        alert('请从背包/电脑中选择宝可梦');
                      }}
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      接受交换
                    </button>
                    <button
                      onClick={() => rejectTradeRequest(req.id)}
                      className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 发出的请求 */}
      {activeTab === 'sent' && (
        <div className="space-y-3">
          {sentTradeRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">没有发出的交换请求</p>
          ) : (
            sentTradeRequests.map(req => (
              <div key={req.id} className="p-4 bg-blue-50 rounded border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-medium">向 {req.receiverUsername} 发起</span>
                    <p className="text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm ${getStatusClass(req.status)}`}>
                    {getStatusText(req.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">你提供:</span>
                    <div className="px-3 py-1 bg-green-100 rounded text-sm">
                      {req.offeredPokemon.snapshot.speciesName}
                    </div>
                  </div>
                  <span className="text-gray-400">⇄</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">对方将提供:</span>
                    {req.receiverPokemon ? (
                      <div className="px-3 py-1 bg-blue-100 rounded text-sm">
                        {req.receiverPokemon.snapshot.speciesName}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">等待对方选择...</span>
                    )}
                  </div>
                </div>

                {req.status === 'accepted' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmTradeRequest(req.id)}
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      确认交换
                    </button>
                    <button
                      onClick={() => cancelTradeRequest(req.id)}
                      className="px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 公开交换 */}
      {activeTab === 'public' && (
        <div className="space-y-3">
          {publicTradeRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无公开交换</p>
          ) : (
            publicTradeRequests.map(req => (
              <div key={req.id} className="p-4 bg-purple-50 rounded border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-medium">{req.initiatorUsername}</span> 的交换
                    <p className="text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">提供:</span>
                    <div className="px-3 py-1 bg-green-100 rounded text-sm">
                      {req.offeredPokemon.snapshot.speciesName}
                    </div>
                  </div>
                  {req.requestedType && (
                    <>
                      <span className="text-gray-400">⇄</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">求换:</span>
                        <div className="px-3 py-1 bg-yellow-100 rounded text-sm">
                          {req.requestedType}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {req.message && (
                  <p className="text-sm text-gray-600 mb-3 italic">"{req.message}"</p>
                )}

                <button
                  onClick={() => {
                    localStorage.setItem('publicTradeRequestId', req.id);
                    alert('请从背包/电脑中选择宝可梦参与交换');
                  }}
                  className="px-4 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  我要交换
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
