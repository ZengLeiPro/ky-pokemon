import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SPECIES_DATA } from '../../constants';
import TypeBadge from '../ui/TypeBadge';
import { Search, Disc } from 'lucide-react';

const DexView: React.FC = () => {
  const { pokedex } = useGameStore();

  // Sort species by pokedexId
  const sortedSpecies = Object.values(SPECIES_DATA).sort((a, b) => (a.pokedexId || 999) - (b.pokedexId || 999));

  // Count
  const caughtCount = Object.values(pokedex).filter(status => status === 'CAUGHT').length;
  const seenCount = Object.values(pokedex).filter(status => status !== 'UNKNOWN').length;

  return (
    <div className="h-full bg-slate-950 flex flex-col" style={{ touchAction: 'pan-y' }}>
      {/* Header */}
      <div className="bg-slate-900 p-4 shadow-lg border-b border-slate-800 z-10">
         <div className="flex justify-between items-end mb-2">
            <h2 className="text-xl font-bold text-white tracking-wider">宝可梦图鉴</h2>
            <div className="text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400">捕获: {caughtCount}</span>
                <span className="mx-2">/</span>
                <span>遇见: {seenCount}</span>
            </div>
         </div>
         {/* Search Bar Placeholder */}
         <div className="relative">
             <input 
                type="text" 
                placeholder="搜索宝可梦..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
             />
             <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
         </div>
      </div>

      {/* Dex List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedSpecies.map((species) => {
            const status = pokedex[species.pokedexId!] || 'UNKNOWN';
            const isUnknown = status === 'UNKNOWN';
            
            return (
                <div key={species.pokedexId} className={`relative overflow-hidden rounded-xl border ${isUnknown ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-900 border-slate-800 hover:border-slate-700'} transition-colors group`}>
                    
                    {/* Status Indicator Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'CAUGHT' ? 'bg-emerald-500' : status === 'SEEN' ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>

                    <div className="flex items-center p-3 pl-5 gap-4">
                        {/* ID */}
                        <span className="font-mono text-xs text-slate-600 font-bold">
                            #{String(species.pokedexId).padStart(3, '0')}
                        </span>

                        {/* Sprite & Info */}
                        {isUnknown ? (
                            <div className="flex-1 flex items-center gap-4 opacity-50">
                                <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center text-slate-700 font-mono text-lg font-bold">
                                    ?
                                </div>
                                <span className="text-slate-600 text-sm font-bold tracking-wider">----------</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-slate-800/80 rounded-lg flex items-center justify-center shadow-inner">
                                    <img 
                                        src={species.spriteUrl} 
                                        alt={species.speciesName} 
                                        className={`w-10 h-10 object-contain pixelated ${status === 'SEEN' ? 'brightness-0 opacity-50' : ''}`} 
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-200 font-bold text-sm tracking-wide">{species.speciesName}</span>
                                        {status === 'CAUGHT' && <Disc size={14} className="text-emerald-500" />}
                                    </div>
                                    {status === 'CAUGHT' && (
                                        <div className="flex gap-1 mt-1">
                                            {species.types!.map(t => <TypeBadge key={t} type={t} />)}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            );
        })}

        {/* Padding for bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default DexView;