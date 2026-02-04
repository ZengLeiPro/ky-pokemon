import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SPECIES_DATA, MOVES, TYPE_COLORS, TYPE_TRANSLATIONS } from '../../constants';
import TypeBadge from '../ui/TypeBadge';
import { Search, Disc, X, ChevronRight } from 'lucide-react';
import { SpeciesData } from '@shared/types';

const DexView: React.FC = () => {
  const { pokedex } = useGameStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sort species by pokedexId
  const sortedSpecies = Object.values(SPECIES_DATA).sort((a, b) => (a.pokedexId || 999) - (b.pokedexId || 999));

  // Count
  const caughtCount = Object.values(pokedex).filter(status => status === 'CAUGHT').length;
  const seenCount = Object.values(pokedex).filter(status => status !== 'UNKNOWN').length;

  const filteredSpecies = sortedSpecies.filter(species => {
      if (!debouncedSearch) return true;

      const term = debouncedSearch.trim().toLowerCase();
      const status = pokedex[species.pokedexId!] || 'UNKNOWN';
      
      // 匹配 ID (例如 "1", "001")
      if (String(species.pokedexId).includes(term)) return true;
      
      // 匹配名称 (仅当已遇见时)
      if (status !== 'UNKNOWN' && species.speciesName?.toLowerCase().includes(term)) {
          return true;
      }

      return false;
  });

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
                placeholder="搜索宝可梦 (名称或编号)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
             />
             <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
         </div>
      </div>

      {/* Dex List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSpecies.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
                <p>未找到相关宝可梦</p>
            </div>
        ) : filteredSpecies.map((species) => {
            const status = pokedex[species.pokedexId!] || 'UNKNOWN';
            const isUnknown = status === 'UNKNOWN';
            
            return (
                <div 
                    key={species.pokedexId} 
                    onClick={() => {
                        if (status === 'CAUGHT') {
                            setSelectedSpecies(species);
                        }
                    }}
                    className={`relative overflow-hidden rounded-xl border ${isUnknown ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-900 border-slate-800 hover:border-slate-700'} ${status === 'CAUGHT' ? 'cursor-pointer active:scale-[0.98] hover:bg-slate-800' : ''} transition-all group`}
                >
                    
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

      {/* Detail Modal */}
      {selectedSpecies && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedSpecies(null)}>
             <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div className="bg-slate-800 p-4 flex justify-between items-start shrink-0">
                      <div>
                          <div className="text-2xl font-bold text-white flex items-center gap-2">
                              {selectedSpecies.speciesName}
                              <span className="text-slate-500 text-sm font-mono">#{String(selectedSpecies.pokedexId).padStart(3, '0')}</span>
                          </div>
                          <div className="flex gap-1 mt-1">
                              {selectedSpecies.types?.map((t: any) => <TypeBadge key={t} type={t} />)}
                          </div>
                      </div>
                      <button onClick={() => setSelectedSpecies(null)} className="text-slate-400 hover:text-white p-1">
                          <X size={24} />
                      </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {/* Sprite */}
                      <div className="flex justify-center bg-slate-800/30 rounded-xl py-4 border border-slate-800/50">
                          <img src={selectedSpecies.spriteUrl} alt={selectedSpecies.speciesName} className="w-32 h-32 pixelated drop-shadow-xl" />
                      </div>
                      
                      {/* Base Stats */}
                      <div>
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                              种族值统计
                          </h3>
                          <div className="space-y-2 bg-slate-800/30 p-3 rounded-xl border border-slate-800/50">
                              {[
                                  { label: 'HP', key: 'hp', color: 'bg-emerald-500' },
                                  { label: '攻击', key: 'atk', color: 'bg-amber-500' },
                                  { label: '防御', key: 'def', color: 'bg-amber-600' },
                                  { label: '特攻', key: 'spa', color: 'bg-indigo-500' },
                                  { label: '特防', key: 'spd', color: 'bg-indigo-600' },
                                  { label: '速度', key: 'spe', color: 'bg-pink-500' },
                              ].map((stat) => {
                                  const val = selectedSpecies.baseStats?.[stat.key] || 0;
                                  const percent = Math.min(100, (val / 160) * 100);
                                  return (
                                      <div key={stat.key} className="flex items-center text-xs">
                                          <span className="w-8 text-slate-400 font-bold">{stat.label}</span>
                                          <span className="w-8 text-right font-mono text-slate-200 mr-2">{val}</span>
                                          <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                              <div className={`h-full rounded-full ${stat.color} shadow-[0_0_10px_rgba(0,0,0,0.3)]`} style={{ width: `${percent}%` }}></div>
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>

                      {/* Evolutions */}
                      {selectedSpecies.evolutions && selectedSpecies.evolutions.length > 0 && (
                          <div>
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
                                  进化链
                              </h3>
                              <div className="space-y-2">
                                  {selectedSpecies.evolutions.map((evo: any, idx: number) => {
                                      const targetKey = evo.targetSpeciesId;
                                      const targetData = SPECIES_DATA[targetKey];
                                      if(!targetData) return null;

                                      return (
                                          <div key={idx} className="flex items-center gap-3 bg-slate-800 border border-slate-700 p-3 rounded-xl">
                                              <div className="flex flex-col items-center min-w-[3rem]">
                                                  <span className="text-[10px] text-slate-500 uppercase">Lv.{evo.level}</span>
                                                  <ChevronRight size={16} className="text-slate-600 my-1" />
                                              </div>
                                              <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700">
                                                      <img src={targetData.spriteUrl} className="w-8 h-8 pixelated" />
                                                  </div>
                                                  <span className="font-bold text-slate-200">{targetData.speciesName}</span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}

                      {/* Learnset */}
                      {selectedSpecies.learnset && selectedSpecies.learnset.length > 0 && (
                          <div>
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                                  可习得招式
                              </h3>
                              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
                                  <table className="w-full text-xs text-left">
                                      <thead className="bg-slate-900/50 text-slate-500 border-b border-slate-700">
                                          <tr>
                                              <th className="p-3 font-medium">Lv</th>
                                              <th className="p-3 font-medium">招式</th>
                                              <th className="p-3 font-medium">属性</th>
                                              <th className="p-3 font-medium text-right">威力</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-700/50">
                                          {selectedSpecies.learnset.map((learn: any, idx: number) => {
                                              const move = MOVES[learn.moveId];
                                              if(!move) return null;
                                              return (
                                                  <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                                      <td className="p-3 font-mono text-emerald-400 font-bold">{learn.level}</td>
                                                      <td className="p-3 font-bold text-slate-200">{move.name}</td>
                                                      <td className="p-3">
                                                          <span 
                                                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                                                            style={{ backgroundColor: TYPE_COLORS[move.type] }}
                                                          >
                                                              {TYPE_TRANSLATIONS[move.type]}
                                                          </span>
                                                      </td>
                                                      <td className="p-3 text-slate-400 text-right font-mono">{move.category === 'Status' ? '-' : move.power}</td>
                                                  </tr>
                                              )
                                          })}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                  </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default DexView;