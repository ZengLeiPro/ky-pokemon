import React, { useEffect, useRef } from 'react';
import { useGameStore } from './stores/gameStore';
import { useAuthStore } from './stores/authStore';
import { useSocialStore } from './stores/socialStore';
import Header from './components/Header';
import MessageBox from './components/MessageBox';
import ControlPad from './components/ControlPad';
import NavigationDock from './components/NavigationDock';

// Stages
import BattleStage from './components/stages/BattleStage';
import SummaryView from './components/stages/SummaryView';
import DexView from './components/stages/DexView';
import PCBoxView from './components/stages/PCBoxView';
import ComputerView from './components/stages/ComputerView';
import StarterSelectionView from './components/stages/StarterSelectionView';
import MainStageSlider from './components/MainStageSlider';
import WorldStage from './components/stages/WorldStage';
import { SpritePreviewScene } from './engine/scenes/SpritePreviewScene';
import EvolutionView from './components/stages/EvolutionView';
import IntroVideoView from './components/IntroVideoView';

// Auth Views
import LoginView from './components/auth/LoginView';
import RegisterView from './components/auth/RegisterView';

// Social Views
import FriendsView from './components/social/FriendsView';
import ChatView from './components/social/ChatView';
import TradeView from './components/social/TradeView';
import GiftView from './components/social/GiftView';
import { PvPBattleView } from './components/social/PvPBattleView';
import RedeemCodeView from './components/stages/RedeemCodeView';

import { Toast, useToast } from './components/ui/Toast';
import CheatConsole from './components/CheatConsole';
import { config } from './config';

const App: React.FC = () => {
  const { view, setView, hasSelectedStarter, isGameLoading, evolution } = useGameStore();
  const { isAuthenticated, checkAuth, currentUser } = useAuthStore();

  // 用于保存当前 PvP 对战 ID，防止重新渲染时丢失
  const pvpBattleIdRef = useRef<string | null>(null);

  // 开发预览模式：URL 带 ?preview=<scene> 可以跳过登录直接看某个 2D 场景
  // 例如：http://localhost:3001/?preview=pallet-town
  const previewScene = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('preview')
    : null;
  if (previewScene === 'pallet-town') {
    return (
      <div className="h-screen w-screen bg-black overflow-hidden relative">
        <WorldStage scene="PALLET_TOWN" />
      </div>
    );
  }

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auto-Save Logic
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: NodeJS.Timeout;

    const unsubscribe = useGameStore.subscribe((state) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            useGameStore.getState().saveGame(currentUser.id);
        }, 2000);
    });

    return () => {
        unsubscribe();
        clearTimeout(timeoutId);
    };
  }, [currentUser]);

  useEffect(() => {
    if (!isAuthenticated && view !== 'LOGIN' && view !== 'REGISTER' && view !== 'INTRO') {
      setView('LOGIN');
    }
  }, [isAuthenticated, view, setView]);

  // 心跳管理：登录后启动，登出后停止
  useEffect(() => {
    if (isAuthenticated) {
      useSocialStore.getState().startHeartbeat();
    } else {
      useSocialStore.getState().stopHeartbeat();
    }
    return () => useSocialStore.getState().stopHeartbeat();
  }, [isAuthenticated]);

  // 离开 PVP_BATTLE 视图时清除 battleId
  useEffect(() => {
    if (view !== 'PVP_BATTLE') {
      pvpBattleIdRef.current = null;
    }
  }, [view]);

  // 每日大师球结算（一次性活动：2026-05-04 北京时间 15:30 后）
  // 任何登录用户都能触发，后端用唯一约束保证全局只发放一次
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const SESSION_KEY = 'masterBallChecked_2026-05-04';
    if (sessionStorage.getItem(SESSION_KEY) === 'done') return;

    let cancelled = false;
    const tryGrant = async () => {
      if (cancelled) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${config.apiUrl}/pokedex/grant-daily-master-ball`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (!json.success) return;
        const data = json.data;
        if (!data) return;

        if (data.status === 'pending') {
          // 还没到 15:30，安排在 15:30 时再试
          const wait = Math.max(1000, data.startsAt - Date.now() + 500);
          setTimeout(tryGrant, wait);
          return;
        }
        if (data.status === 'expired' || data.status === 'no_winner' || data.status === 'no_save') {
          sessionStorage.setItem(SESSION_KEY, 'done');
          return;
        }
        if (data.status === 'granted') {
          sessionStorage.setItem(SESSION_KEY, 'done');
          if (data.winner?.userId === currentUser.id) {
            alert(`🎉 恭喜！你是今日排行榜第一名（捕获 ${data.winner.caughtCount} 只）！\n获得了一个【大师球】，请刷新页面查看～`);
          } else {
            useToast.getState().show(`今日排行榜第一名 ${data.winner?.username} 获得了大师球！`, 'info');
          }
          return;
        }
        if (data.status === 'already_granted') {
          sessionStorage.setItem(SESSION_KEY, 'done');
          // 不打扰，只在中奖者本人是当前用户时提示
          if (data.winner?.userId === currentUser.id) {
            useToast.getState().show(`你已获得今日大师球（排行榜第一名），请检查背包`, 'success');
          }
          return;
        }
      } catch (e) {
        // 网络失败，60 秒后重试
        setTimeout(tryGrant, 60_000);
      }
    };
    // 进入游戏后稍等 2 秒再触发，让其他初始化先跑完
    const initTimer = setTimeout(tryGrant, 2000);
    return () => {
      cancelled = true;
      clearTimeout(initTimer);
    };
  }, [isAuthenticated, currentUser]);

  const renderStage = () => {
    // INTRO 视频页面优先于初始宝可梦选择
    if (view === 'INTRO') {
      return <IntroVideoView />;
    }

    if (isAuthenticated && !hasSelectedStarter) {
      return <StarterSelectionView />;
    }

    switch (view) {
      case 'LOGIN':
        return <LoginView />;
      case 'REGISTER':
        return <RegisterView />;
      case 'BATTLE':
        return <BattleStage />;
      case 'SUMMARY':
        return <SummaryView />;
      case 'PC_BOX':
        return <PCBoxView />;
      case 'COMPUTER':
        return <ComputerView />;
      case 'FRIENDS':
        return <FriendsView />;
      case 'CHAT':
        return <ChatView />;
      case 'TRADE':
        return <TradeView />;
      case 'GIFT':
        return <GiftView />;
      case 'REDEEM_CODE':
        return <RedeemCodeView />;
      case 'POKEMON_CENTER':
        return <WorldStage scene="POKEMON_CENTER" />;
      case 'GYM':
        return <WorldStage scene="GYM" />;
      case 'SHOP':
        return <WorldStage scene="SHOP" />;
      case 'PALLET_TOWN':
        return <WorldStage scene="PALLET_TOWN" />;
      case 'SPRITE_PREVIEW':
        return <SpritePreviewScene onExit={() => setView('ROAM')} />;
      case 'PVP_BATTLE': {
        // 从 localStorage 获取当前对战 ID（仅首次）
        const storedBattleId = localStorage.getItem('currentBattleId');
        if (storedBattleId) {
          pvpBattleIdRef.current = storedBattleId;
          localStorage.removeItem('currentBattleId');
        }
        // 使用 ref 中保存的 battleId
        if (pvpBattleIdRef.current) {
          return <PvPBattleView battleId={pvpBattleIdRef.current} />;
        }
        return <FriendsView />;
      }
      case 'TEAM':
      case 'BAG':
      case 'PROFILE':
      case 'ROAM':
      default:
        return <MainStageSlider />;
    }
  };

  // Determine footer Layout
  // 2D 场景视图列表（不显示 Header、导航栏等 UI 元素）
  const scene2DViews = ['POKEMON_CENTER', 'GYM', 'SHOP', 'SPRITE_PREVIEW'];
  const isChoosingStarter = isAuthenticated && !hasSelectedStarter;
  const showNavDock = !isChoosingStarter && ['ROAM', 'TEAM', 'BAG', 'PROFILE', 'DEX'].includes(view);
  // 对战画面在 BattleStage 内部自带火红风格日志面板，不再使用外部 MessageBox
  const showMessageBox = !isChoosingStarter && view === 'ROAM' && !scene2DViews.includes(view);
  const showControlPad = !isChoosingStarter && view === 'BATTLE' && !scene2DViews.includes(view);
  const showHeader = !isChoosingStarter && !['FRIENDS', 'CHAT', 'PVP_BATTLE', 'TRADE', 'GIFT', 'REDEEM_CODE', ...scene2DViews].includes(view);

  const renderContent = () => {
    // 认证页面使用全屏布局，无需 Header 和 Footer
    if (view === 'LOGIN' || view === 'REGISTER' || view === 'INTRO') {
      return (
        <div className="h-screen w-screen bg-black">
          {renderStage()}
        </div>
      );
    }

    if (isAuthenticated && isGameLoading) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center flex-col gap-4">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-cyan-400 font-bold tracking-widest animate-pulse">正在读取存档...</div>
            </div>
        );
    }

    return (
      <div className="h-screen w-screen flex flex-col bg-black max-w-md mx-auto shadow-2xl overflow-hidden relative">
        {/* Top Header (HUD) */}
        {showHeader && <Header />}

        {/* Main Viewport */}
        <main className="flex-grow relative overflow-hidden bg-slate-900 z-10">
          {renderStage()}
          {evolution.isEvolving && <EvolutionView />}
        </main>

        {/* Footer Area */}
        <div className="flex-shrink-0 z-20">
          {showMessageBox && <MessageBox />}
          {showControlPad && <ControlPad />}
          {showNavDock && <NavigationDock />}
        </div>
      </div>
    );
  };

  return (
    <>
      <Toast />
      <CheatConsole />
      {renderContent()}
    </>
  );
};

export default App;
