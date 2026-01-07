import React from 'react';
import { useGameStore } from './stores/gameStore';
import Header from './components/Header';
import MessageBox from './components/MessageBox';
import ControlPad from './components/ControlPad';
import NavigationDock from './components/NavigationDock';

// Stages
import BattleStage from './components/stages/BattleStage';
import RoamStage from './components/stages/RoamStage';
import TeamGrid from './components/stages/TeamGrid';
import BagView from './components/stages/BagView';
import ProfileView from './components/stages/ProfileView';
import SummaryView from './components/stages/SummaryView';
import DexView from './components/stages/DexView';

const App: React.FC = () => {
  const { view } = useGameStore();

  const renderStage = () => {
    switch (view) {
      case 'BATTLE':
        return <BattleStage />;
      case 'TEAM':
        return <TeamGrid />;
      case 'BAG':
        return <BagView />;
      case 'PROFILE':
        return <ProfileView />;
      case 'SUMMARY':
        return <SummaryView />;
      case 'DEX':
        return <DexView />;
      case 'ROAM':
      default:
        return <RoamStage />;
    }
  };

  // Determine footer Layout
  const showNavDock = ['ROAM', 'TEAM', 'BAG', 'PROFILE', 'DEX'].includes(view);
  const showMessageBox = view === 'ROAM' || view === 'BATTLE';
  const showControlPad = view === 'BATTLE';

  return (
    <div className="h-screen w-screen flex flex-col bg-black max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Top Header (HUD) */}
      <Header />

      {/* Main Viewport */}
      <main className="flex-grow relative overflow-hidden bg-slate-900">
        {renderStage()}
      </main>

      {/* Footer Area */}
      <div className="flex-shrink-0 z-30">
        {showMessageBox && <MessageBox />}
        {showControlPad && <ControlPad />}
        {showNavDock && <NavigationDock />}
      </div>
    </div>
  );
};

export default App;