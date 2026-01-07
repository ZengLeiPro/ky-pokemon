import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { BriefcaseMedical, Zap, Key } from 'lucide-react';
import { ItemCategory } from '../../types';

const BagView: React.FC = () => {
  const { inventory } = useGameStore();
  const [activeTab, setActiveTab] = useState<ItemCategory>('MEDICINE');

  const filteredItems = inventory.filter(item => item.category === activeTab);

  const tabs = [
    { id: 'MEDICINE', label: '药品', icon: BriefcaseMedical },
    { id: 'POKEBALLS', label: '精灵球', icon: Zap },
    { id: 'KEY_ITEMS', label: '重要', icon: Key },
  ] as const;

  return (
    <div className="h-full bg-slate-950 flex flex-col">
      {/* Header - Simplified */}
      <div className="bg-slate-900 p-4 shadow-lg border-b border-slate-800">
         <h2 className="text-xl font-bold text-white tracking-wider">背包</h2>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-slate-900/50">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ItemCategory)}
                className={`flex-1 py-3 rounded-lg flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-slate-700 text-cyan-400 shadow-inner' 
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700/50'
                }`}
            >
                <tab.icon size={18} />
                {tab.label}
            </button>
        ))}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredItems.length === 0 ? (
            <div className="text-center text-slate-600 mt-10 font-mono">
                该分类下没有道具。
            </div>
        ) : (
            filteredItems.map(item => (
                <div key={item.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex items-start gap-4 active:scale-[0.99] transition-transform">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400 shrink-0">
                        {/* Placeholder for item icon */}
                        <div className="w-6 h-6 rounded-full bg-slate-700/50 border border-slate-600"></div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-slate-200">{item.name}</h3>
                            <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-cyan-400">
                                x{item.quantity}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default BagView;