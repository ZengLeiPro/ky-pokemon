import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { Users, Backpack, BookOpen, UserCircle, Map, LucideIcon, Cross, Swords, X } from 'lucide-react';
import { ViewState } from '../types';

interface NavItem {
  id: ViewState;
  label: string;
  icon: LucideIcon;
  color: string;
  isMain?: boolean;
}

const NavigationDock: React.FC = () => {
  const { view, setView } = useGameStore();
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭探索菜单
  useEffect(() => {
    if (!showExploreMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowExploreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExploreMenu]);

  // Navigation Items Config
  // Inserted ROAM in the middle as the primary action
  const navItems: NavItem[] = [
    { id: 'TEAM', label: '队伍', icon: Users, color: 'text-rose-400' },
    { id: 'BAG', label: '背包', icon: Backpack, color: 'text-amber-400' },
    { id: 'ROAM', label: '冒险', icon: Map, color: 'text-white', isMain: true },
    { id: 'DEX', label: '图鉴', icon: BookOpen, color: 'text-emerald-400' },
    { id: 'PROFILE', label: '卡片', icon: UserCircle, color: 'text-blue-400' },
  ];

  return (
    <div className="h-24 bg-slate-950 border-t border-slate-800 pb-6 px-2 relative z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-5 h-full items-end">
        {navItems.map((item) => {
          const isActive = view === item.id;

          if (item.isMain) {
            return (
              <div key={item.id} className="relative" ref={menuRef}>
                {/* 探索菜单弹出层 */}
                {showExploreMenu && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-44 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up z-[60]">
                    {/* 关闭按钮 */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">探索目的地</span>
                      <button
                        onClick={() => setShowExploreMenu(false)}
                        className="text-slate-500 hover:text-white p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    {/* 冒险（回到 ROAM） */}
                    <button
                      onClick={() => {
                        setView('ROAM');
                        setShowExploreMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 active:bg-slate-700 transition-colors"
                    >
                      <Map size={16} className="text-emerald-400" />
                      <span className="text-sm font-bold text-slate-200">野外冒险</span>
                    </button>
                    {/* 宝可梦中心 */}
                    <button
                      onClick={() => {
                        setView('POKEMON_CENTER');
                        setShowExploreMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 active:bg-slate-700 transition-colors border-t border-slate-800/50"
                    >
                      <Cross size={16} className="text-indigo-400" />
                      <span className="text-sm font-bold text-slate-200">宝可梦中心</span>
                    </button>
                    {/* 道馆 */}
                    <button
                      onClick={() => {
                        setView('GYM');
                        setShowExploreMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 active:bg-slate-700 transition-colors border-t border-slate-800/50"
                    >
                      <Swords size={16} className="text-rose-400" />
                      <span className="text-sm font-bold text-slate-200">道馆挑战</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (view === 'ROAM') {
                      // 在 ROAM 视图下长按或点击弹出探索菜单
                      setShowExploreMenu((prev) => !prev);
                    } else {
                      // 非 ROAM 视图下直接跳转回 ROAM
                      setView('ROAM');
                      setShowExploreMenu(false);
                    }
                  }}
                  className="relative group flex flex-col items-center justify-end gap-1 h-full pb-2 w-full"
                >
                  {/* Floating Main Button */}
                  <div className={`
                      absolute -top-6 w-16 h-16 rounded-full flex items-center justify-center
                      shadow-[0_0_15px_rgba(16,185,129,0.4)] border-4 border-slate-950 transition-all duration-300
                      ${isActive ? 'bg-emerald-500 scale-110' : 'bg-slate-800 hover:bg-slate-700'}
                  `}>
                      <item.icon size={28} className="text-white fill-current" strokeWidth={2.5} />
                  </div>
                  <span className={`text-[10px] font-bold tracking-widest mt-10 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {item.label}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="flex flex-col items-center justify-center gap-1.5 pb-2 active:scale-95 transition-transform h-full"
            >
              <div className={`
                p-2 rounded-xl transition-all duration-300
                ${isActive ? 'bg-slate-800 shadow-lg ring-1 ring-white/10' : 'bg-transparent'}
              `}>
                <item.icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`${isActive ? item.color : 'text-slate-600 group-hover:text-slate-400'}`}
                />
              </div>
              <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationDock;