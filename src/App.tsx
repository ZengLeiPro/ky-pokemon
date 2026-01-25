import React, { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { useAuthStore } from './stores/authStore';
import Header from './components/Header';
import MessageBox from './components/MessageBox';
import ControlPad from './components/ControlPad';
import NavigationDock from './components/NavigationDock';

// Stages
import BattleStage from './components/stages/BattleStage';
import SummaryView from './components/stages/SummaryView';
import DexView from './components/stages/DexView';
import PCBoxView from './components/stages/PCBoxView';
import StarterSelectionView from './components/stages/StarterSelectionView';
import MainStageSlider from './components/MainStageSlider';
import EvolutionView from './components/stages/EvolutionView';

// Auth Views
import LoginView from './components/auth/LoginView';
import RegisterView from './components/auth/RegisterView';

// Social Views
import FriendsView from './components/social/FriendsView';
import ChatView from './components/social/ChatView';
import TradeView from './components/social/TradeView';
import { PvPBattleView } from './components/social/PvPBattleView';

import { Toast } from './components/ui/Toast';
import CheatConsole from './components/CheatConsole';

const App: React.FC = () => {
  const { view, setView, hasSelectedStarter, isGameLoading, evolution } = useGameStore();
  const { isAuthenticated, checkAuth, currentUser } = useAuthStore();

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
    if (!isAuthenticated && view !== 'LOGIN' && view !== 'REGISTER') {
      setView('LOGIN');
    }
  }, [isAuthenticated, view, setView]);

  const renderStage = () => {
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
      case 'FRIENDS':
        return <FriendsView />;
      case 'CHAT':
        return <ChatView />;
      case 'TRADE':
        return <TradeView />;
      case 'PVP_BATTLE': {
        // 从 localStorage 获取当前对战 ID
        const battleId = localStorage.getItem('currentBattleId');
        if (battleId) {
          localStorage.removeItem('currentBattleId');
          return <PvPBattleView battleId={battleId} />;
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
  const isChoosingStarter = isAuthenticated && !hasSelectedStarter;
  const showNavDock = !isChoosingStarter && ['ROAM', 'TEAM', 'BAG', 'PROFILE', 'DEX'].includes(view);
  const showMessageBox = !isChoosingStarter && (view === 'ROAM' || view === 'BATTLE');
  const showControlPad = !isChoosingStarter && view === 'BATTLE';
  const showHeader = !isChoosingStarter && !['FRIENDS', 'CHAT', 'PVP_BATTLE', 'TRADE'].includes(view);

  const renderContent = () => {
    // 认证页面使用全屏布局，无需 Header 和 Footer
    if (view === 'LOGIN' || view === 'REGISTER') {
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
