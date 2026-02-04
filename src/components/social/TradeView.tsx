import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocialStore } from '@/stores/socialStore';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import type { TradeRequest } from '../../../shared/types/social';
import type { Pokemon } from '@shared/types/pokemon';
import { TradeAnimation } from './TradeAnimation';

export default function TradeView() {
  const {
    receivedTradeRequests,
    sentTradeRequests,
    publicTradeRequests,
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

  const { playerParty: team, playerStorage: pcBox, setView, loadGame } = useGameStore();
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'public'>('received');
  const [selectingForRequest, setSelectingForRequest] = useState<TradeRequest | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 交换动画状态
  const [showTradeAnimation, setShowTradeAnimation] = useState(false);
  const [tradeAnimationData, setTradeAnimationData] = useState<{
    myPokemon: Pokemon;
    theirPokemon: Pokemon;
    myUsername: string;
    theirUsername: string;
  } | null>(null);

  // 确认中状态
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // 跟踪之前的请求状态，用于检测完成的交换
  const prevReceivedRequestsRef = useRef<TradeRequest[]>([]);
  // 已显示动画的请求ID集合，避免重复显示
  const shownAnimationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    loadReceivedTradeRequests();
    loadSentTradeRequests();
    loadPublicTradeRequests();

    const animationIds = shownAnimationIdsRef.current;

    // 轮询机制：每3秒刷新一次请求列表
    const pollInterval = setInterval(() => {
      loadReceivedTradeRequests();
      loadSentTradeRequests();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      animationIds.clear();
    };
  }, []);

  // 检测接收方的请求是否从 accepted 变为 completed
  useEffect(() => {
    // 始终更新之前的请求状态，避免动画结束后误判
    const prevRequests = prevReceivedRequestsRef.current;
    prevReceivedRequestsRef.current = receivedTradeRequests;

    // 正在显示动画时不检测新的动画
    if (showTradeAnimation) return;

    for (const req of receivedTradeRequests) {
      // 找到之前状态为 accepted 的请求
      const prevReq = prevRequests.find(p => p.id === req.id);

      // 如果之前是 accepted，现在是 completed，且没有显示过动画
      if (
        prevReq &&
        prevReq.status === 'accepted' &&
        req.status === 'completed' &&
        !shownAnimationIdsRef.current.has(req.id) &&
        req.receiverPokemon
      ) {
        // 标记已显示
        shownAnimationIdsRef.current.add(req.id);

        // 接收方视角：我提供 receiverPokemon，获得 offeredPokemon
        setTradeAnimationData({
          myPokemon: req.receiverPokemon.snapshot,
          theirPokemon: req.offeredPokemon.snapshot,
          myUsername: req.receiverUsername,
          theirUsername: req.initiatorUsername
        });
        setShowTradeAnimation(true);
        break;
      }
    }
  }, [receivedTradeRequests, showTradeAnimation]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rejected':
      case 'cancelled': return 'text-gray-500 bg-gray-100';
      default: return '';
    }
  };

  // 显示所有宝可梦列表
  const allPokemon = [...team, ...pcBox];
  const [selectedPokemonId, setSelectedPokemonId] = useState<string | null>(null);

  const handleStartSelect = (request: TradeRequest) => {
    setSelectingForRequest(request);
    setSelectedPokemonId(null);
  };

  const handleConfirmSelect = async () => {
    if (!selectingForRequest || !selectedPokemonId) return;

    const success = await acceptTradeRequest(selectingForRequest.id, selectedPokemonId);
    if (success) {
      setSuccessMessage('已接受交换，等待对方确认');
      loadReceivedTradeRequests();
      loadSentTradeRequests();
    }
    setSelectingForRequest(null);
    setSelectedPokemonId(null);
  };

  // 处理确认交换（带动画）
  const handleConfirmTrade = async (req: TradeRequest) => {
    if (!req.receiverPokemon) return;

    // 先标记已显示，防止轮询检测逻辑重复触发
    shownAnimationIdsRef.current.add(req.id);

    setConfirmingId(req.id);

    const success = await confirmTradeRequest(req.id);

    if (success) {
      // 设置动画数据并显示动画
      setTradeAnimationData({
        myPokemon: req.offeredPokemon.snapshot,
        theirPokemon: req.receiverPokemon.snapshot,
        myUsername: req.initiatorUsername,
        theirUsername: req.receiverUsername
      });
      setShowTradeAnimation(true);
    } else {
      // 如果失败，移除标记
      shownAnimationIdsRef.current.delete(req.id);
    }

    setConfirmingId(null);
  };

  const handleAnimationComplete = useCallback(() => {
    setShowTradeAnimation(false);
    setTradeAnimationData(null);
    setSuccessMessage('交换完成！');
    loadSentTradeRequests();
    loadReceivedTradeRequests();
    // 刷新玩家数据，更新宝可梦列表
    if (currentUser?.id) {
      loadGame(currentUser.id);
    }
  }, [currentUser?.id, loadSentTradeRequests, loadReceivedTradeRequests, loadGame]);

  return (
    <>
      {/* 交换动画 */}
      {tradeAnimationData && (
        <TradeAnimation
          isOpen={showTradeAnimation}
          onComplete={handleAnimationComplete}
          myPokemon={tradeAnimationData.myPokemon}
          theirPokemon={tradeAnimationData.theirPokemon}
          myUsername={tradeAnimationData.myUsername}
          theirUsername={tradeAnimationData.theirUsername}
        />
      )}

      <div className={`min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="p-4 max-w-4xl mx-auto">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-6 animate-slide-down">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">交换中心</h1>
            </div>
            <button
              onClick={() => setView('ROAM')}
              className="px-4 py-2 bg-white rounded-xl shadow hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-slate-600 font-medium"
            >
              返回游戏
            </button>
          </div>

          {/* 成功提示 */}
          <div className={`transition-all duration-500 overflow-hidden ${successMessage ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>

          {/* 错误提示 */}
          <div className={`transition-all duration-500 overflow-hidden ${error ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-xl shadow-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>

          {/* 宝可梦选择面板 */}
          <div className={`transition-all duration-500 overflow-hidden ${selectingForRequest ? 'max-h-[500px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
            {selectingForRequest && (
              <div className="p-5 bg-white rounded-2xl shadow-xl border-2 border-blue-400 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">
                      选择要与 <span className="text-blue-600">{selectingForRequest.offeredPokemon.snapshot.speciesName}</span> 交换的宝可梦
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectingForRequest(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {allPokemon.map((pokemon, index) => {
                    const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
                    const isSelected = selectedPokemonId === pokemon.id;
                    const isExcluded = selectingForRequest.offeredPokemon.pokemonId === pokemon.id;

                    return (
                      <div
                        key={pokemon.id}
                        onClick={() => !isExcluded && setSelectedPokemonId(pokemon.id)}
                        className={`p-3 rounded-xl cursor-pointer border-2 transition-all duration-300 animate-fade-in-up ${
                          isExcluded
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                            {pokemon.spriteUrl ? (
                              <img
                                src={pokemon.spriteUrl}
                                alt={pokemon.speciesName}
                                className="w-10 h-10 object-contain pixelated"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <span className="text-xl">{pokemon.speciesName}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800 truncate">{pokemon.nickname || pokemon.speciesName}</span>
                              <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Lv.{pokemon.level}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${hpPercent}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{pokemon.currentHp}/{pokemon.maxHp}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-scale-in">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setSelectingForRequest(null)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmSelect}
                    disabled={!selectedPokemonId}
                    className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    确认选择
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 标签页 */}
          <div className="flex gap-2 mb-4 bg-white rounded-xl p-1.5 shadow-sm animate-slide-down" style={{ animationDelay: '100ms' }}>
            {[
              { key: 'received', label: '收到的请求', count: receivedTradeRequests.length, color: 'yellow' },
              { key: 'sent', label: '发出的请求', count: sentTradeRequests.length, color: 'blue' },
              { key: 'public', label: '公开交换', count: publicTradeRequests.length, color: 'purple' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${tab.color === 'yellow' ? 'from-yellow-400 to-amber-500' : tab.color === 'blue' ? 'from-blue-400 to-blue-600' : 'from-purple-400 to-purple-600'} text-white shadow-md`
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* 收到的请求 */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedTradeRequests.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-lg">没有收到的交换请求</p>
                </div>
              ) : (
                receivedTradeRequests.map((req, index) => (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold">
                          {req.initiatorUsername[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">{req.initiatorUsername}</span>
                          <span className="text-slate-500 ml-2">发起交换</span>
                          <p className="text-sm text-slate-400">
                            {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusClass(req.status)}`}>
                        {getStatusText(req.status)}
                      </span>
                    </div>

                    {/* 交换内容展示 */}
                    <div className="flex items-center gap-4 mb-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 mb-2">TA 提供</p>
                        <div className="inline-block p-3 bg-white rounded-xl shadow-sm">
                          {req.offeredPokemon.snapshot.spriteUrl ? (
                            <img
                              src={req.offeredPokemon.snapshot.spriteUrl}
                              alt={req.offeredPokemon.snapshot.speciesName}
                              className="w-16 h-16 object-contain pixelated mx-auto"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center text-2xl">
                              {req.offeredPokemon.snapshot.speciesName}
                            </div>
                          )}
                          <p className="text-sm font-medium text-slate-800 mt-1">{req.offeredPokemon.snapshot.speciesName}</p>
                          <p className="text-xs text-slate-500">Lv.{req.offeredPokemon.snapshot.level}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 mb-2">你将提供</p>
                        {req.status === 'pending' ? (
                          <div className="inline-block p-3 border-2 border-dashed border-slate-300 rounded-xl">
                            <div className="w-16 h-16 flex items-center justify-center text-slate-400">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">点击下方选择</p>
                          </div>
                        ) : (
                          <div className="inline-block p-3 bg-white rounded-xl shadow-sm">
                            {req.receiverPokemon?.snapshot.spriteUrl ? (
                              <img
                                src={req.receiverPokemon.snapshot.spriteUrl}
                                alt={req.receiverPokemon.snapshot.speciesName}
                                className="w-16 h-16 object-contain pixelated mx-auto"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center text-2xl">
                                {req.receiverPokemon?.snapshot.speciesName || '-'}
                              </div>
                            )}
                            <p className="text-sm font-medium text-slate-800 mt-1">{req.receiverPokemon?.snapshot.speciesName || '-'}</p>
                            <p className="text-xs text-slate-500">Lv.{req.receiverPokemon?.snapshot.level}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {req.message && (
                      <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg italic">
                        "{req.message}"
                      </p>
                    )}

                    {req.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStartSelect(req)}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl"
                        >
                          选择宝可梦接受交换
                        </button>
                        <button
                          onClick={() => rejectTradeRequest(req.id)}
                          className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
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
            <div className="space-y-4">
              {sentTradeRequests.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-lg">没有发出的交换请求</p>
                </div>
              ) : (
                sentTradeRequests.map((req, index) => (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {req.receiverUsername[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="text-slate-500">向</span>
                          <span className="font-bold text-slate-800 ml-1">{req.receiverUsername}</span>
                          <span className="text-slate-500 ml-1">发起</span>
                          <p className="text-sm text-slate-400">
                            {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusClass(req.status)}`}>
                        {getStatusText(req.status)}
                      </span>
                    </div>

                    {/* 交换内容展示 */}
                    <div className="flex items-center gap-4 mb-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 mb-2">你提供</p>
                        <div className="inline-block p-3 bg-white rounded-xl shadow-sm">
                          {req.offeredPokemon.snapshot.spriteUrl ? (
                            <img
                              src={req.offeredPokemon.snapshot.spriteUrl}
                              alt={req.offeredPokemon.snapshot.speciesName}
                              className="w-16 h-16 object-contain pixelated mx-auto"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center text-2xl">
                              {req.offeredPokemon.snapshot.speciesName}
                            </div>
                          )}
                          <p className="text-sm font-medium text-slate-800 mt-1">{req.offeredPokemon.snapshot.speciesName}</p>
                          <p className="text-xs text-slate-500">Lv.{req.offeredPokemon.snapshot.level}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          req.status === 'accepted' ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`}>
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 mb-2">对方将提供</p>
                        {req.receiverPokemon ? (
                          <div className="inline-block p-3 bg-white rounded-xl shadow-sm">
                            {req.receiverPokemon.snapshot.spriteUrl ? (
                              <img
                                src={req.receiverPokemon.snapshot.spriteUrl}
                                alt={req.receiverPokemon.snapshot.speciesName}
                                className="w-16 h-16 object-contain pixelated mx-auto"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center text-2xl">
                                {req.receiverPokemon.snapshot.speciesName}
                              </div>
                            )}
                            <p className="text-sm font-medium text-slate-800 mt-1">{req.receiverPokemon.snapshot.speciesName}</p>
                            <p className="text-xs text-slate-500">Lv.{req.receiverPokemon.snapshot.level}</p>
                          </div>
                        ) : (
                          <div className="inline-block p-3 border-2 border-dashed border-slate-300 rounded-xl">
                            <div className="w-16 h-16 flex items-center justify-center text-slate-400">
                              <svg className="w-8 h-8 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">等待选择...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {req.status === 'accepted' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleConfirmTrade(req)}
                          disabled={confirmingId === req.id}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {confirmingId === req.id ? (
                            <>
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>确认中...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>确认交换</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => cancelTradeRequest(req.id)}
                          className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
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
            <div className="space-y-4">
              {publicTradeRequests.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-lg">暂无公开交换</p>
                </div>
              ) : (
                publicTradeRequests.map((req, index) => (
                  <div
                    key={req.id}
                    className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          {req.initiatorUsername[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">{req.initiatorUsername}</span>
                          <span className="text-slate-500 ml-2">的交换</span>
                          <p className="text-sm text-slate-400">
                            {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-slate-500 mb-2">提供</p>
                        <div className="inline-block p-3 bg-white rounded-xl shadow-sm">
                          {req.offeredPokemon.snapshot.spriteUrl ? (
                            <img
                              src={req.offeredPokemon.snapshot.spriteUrl}
                              alt={req.offeredPokemon.snapshot.speciesName}
                              className="w-16 h-16 object-contain pixelated mx-auto"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center text-2xl">
                              {req.offeredPokemon.snapshot.speciesName}
                            </div>
                          )}
                          <p className="text-sm font-medium text-slate-800 mt-1">{req.offeredPokemon.snapshot.speciesName}</p>
                        </div>
                      </div>
                      {req.requestedType && (
                        <>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </div>
                          <div className="flex-1 text-center">
                            <p className="text-xs text-slate-500 mb-2">求换</p>
                            <div className="inline-block px-4 py-3 bg-white rounded-xl shadow-sm">
                              <p className="text-sm font-medium text-purple-600">{req.requestedType}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {req.message && (
                      <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg italic">
                        "{req.message}"
                      </p>
                    )}

                    <button
                      onClick={() => alert('公开交换功能开发中')}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl"
                    >
                      我要交换
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 全局动画样式 */}
      <style>{`
        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-slide-down { animation: slide-down 0.5s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </>
  );
}
