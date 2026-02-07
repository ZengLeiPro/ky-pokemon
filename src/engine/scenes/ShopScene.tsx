// ============================================================
// 商店场景组件
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { GameWorld } from '../components/GameWorld';
import { shopMap } from '../maps/shop';
import { useGameStore } from '@/stores/gameStore';
import { ShoppingBag } from 'lucide-react';

interface ShopSceneProps {
  /** 离开商店 */
  onExit: () => void;
}

/**
 * 商店完整场景。
 *
 * - 渲染 GameWorld，传入商店地图数据
 * - 处理场景切换（玩家走到门口 warp 时调用 onExit）
 * - 与柜台交互时弹出购物界面
 * - 顶部显示场景名称（暖色调标题条）
 * - 进入时有淡入效果
 */
export function ShopScene({ onExit }: ShopSceneProps) {
  const { buyItem, playerMoney } = useGameStore();

  // 淡入控制
  const [fadeIn, setFadeIn] = useState(true);
  // 商店菜单控制
  const [showShopMenu, setShowShopMenu] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // 场景切换：玩家踩到 warp 区域
  const handleSceneChange = useCallback(
    (_sceneId: string, _spawnId: string) => {
      onExit();
    },
    [onExit],
  );

  // 特殊交互分发
  const handleInteraction = useCallback(
    (type: string, _data: unknown) => {
      switch (type) {
        case 'open-shop':
          setShowShopMenu(true);
          break;
        default:
          break;
      }
    },
    [],
  );

  return (
    <div className="relative w-full h-full">
      {/* 游戏世界 */}
      <GameWorld
        mapData={shopMap}
        initialSpawn="entrance"
        onSceneChange={handleSceneChange}
        onInteraction={handleInteraction}
      />

      {/* 场景名称条 - 顶部暖色调 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
        style={{
          height: 36,
          background: 'linear-gradient(to bottom, rgba(60,40,10,0.65), rgba(60,40,10,0))',
        }}
      >
        <span
          className="text-white text-sm font-bold tracking-wider"
          style={{ textShadow: '0 1px 3px rgba(60,40,10,0.8)' }}
        >
          道具商店
        </span>
      </div>

      {/* 淡入遮罩 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: '#000',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      />

      {/* 商店购物界面 */}
      {showShopMenu && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div
            className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-fade-in-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag size={24} className="text-amber-500" />
                道具商店
              </h2>
              <button
                onClick={() => setShowShopMenu(false)}
                className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-xl transition-colors"
              >
                关闭
              </button>
            </div>

            <div className="p-4 bg-slate-800/30 border-b border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-medium">当前余额</span>
                <span className="text-2xl font-black text-amber-400 tracking-tight">¥{playerMoney}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 w-1 bg-amber-500 rounded-full"></div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">恢复类药品</h3>
                </div>
                <div className="space-y-3">
                  <ShopItem name="伤药" desc="恢复宝可梦 20 点 HP" price={300} accent="amber" onBuy={() => buyItem('potion', 300, 1)} />
                  <ShopItem name="好伤药" desc="恢复宝可梦 50 点 HP" price={700} accent="amber" onBuy={() => buyItem('super-potion', 700, 1)} />
                  <ShopItem name="超高级伤药" desc="恢复宝可梦 200 点 HP" price={1200} accent="amber" onBuy={() => buyItem('hyper-potion', 1200, 1)} />
                  <ShopItem name="全满药" desc="完全恢复宝可梦的 HP" price={2500} accent="amber" onBuy={() => buyItem('max-potion', 2500, 1)} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 w-1 bg-rose-500 rounded-full"></div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">捕获用精灵球</h3>
                </div>
                <div className="space-y-3">
                  <ShopItem name="精灵球" desc="用于捕获野生宝可梦的标准球" price={200} accent="rose" onBuy={() => buyItem('pokeball', 200, 1)} />
                  <ShopItem name="超级球" desc="比精灵球更容易捉到宝可梦" price={600} accent="rose" onBuy={() => buyItem('greatball', 600, 1)} />
                  <ShopItem name="高级球" desc="非常优秀的球，捕获率更高" price={1200} accent="rose" onBuy={() => buyItem('ultraball', 1200, 1)} />
                  <ShopItem name="等级球" desc="我方等级越高于对方，越容易捕捉" price={1000} accent="rose" onBuy={() => buyItem('levelball', 1000, 1)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 商品项组件 */
function ShopItem({ name, desc, price, accent, onBuy }: {
  name: string;
  desc: string;
  price: number;
  accent: 'amber' | 'rose';
  onBuy: () => void;
}) {
  const colorMap = {
    amber: {
      badge: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 shadow-amber-900/20',
    },
    rose: {
      badge: 'bg-rose-500/10 border-rose-500/20',
      text: 'text-rose-400',
      btn: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-rose-900/20',
    },
  };
  const colors = colorMap[accent];

  return (
    <div className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-white text-base">{name}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
        </div>
        <div className={`${colors.badge} px-3 py-1 rounded-full border`}>
          <span className={`text-sm font-black ${colors.text}`}>¥{price}</span>
        </div>
      </div>
      <button
        onClick={onBuy}
        className={`w-full ${colors.btn} text-white py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98]`}
      >
        购买
      </button>
    </div>
  );
}
