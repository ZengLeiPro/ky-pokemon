import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { SPECIES_DATA } from '../../constants';
import { SpeciesData } from '@shared/types';

const EvolutionView: React.FC = () => {
  const { evolution, advanceEvolutionStage, completeEvolution } = useGameStore();
  const { pokemon, targetSpeciesId, stage } = evolution;
  const [targetSpecies, setTargetSpecies] = useState<SpeciesData | null>(null);

  useEffect(() => {
    if (targetSpeciesId && SPECIES_DATA[targetSpeciesId]) {
      setTargetSpecies(SPECIES_DATA[targetSpeciesId]);
    }
  }, [targetSpeciesId]);

  if (!pokemon || !targetSpecies) return null;

  const handleClick = () => {
    if (stage === 'START') {
      advanceEvolutionStage('ANIMATION');
    } else if (stage === 'FINISHED') {
      completeEvolution();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4" onClick={handleClick}>
      <AnimatePresence mode="wait">
        {stage === 'START' && (
           <motion.div 
             key="start"
             className="text-center w-full max-w-md"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
           >
             <div className="relative w-48 h-48 mx-auto mb-12">
               <img src={pokemon.spriteUrl} alt={pokemon.speciesName} className="w-full h-full object-contain pixelated" />
             </div>
             <div className="bg-slate-800 border-4 border-slate-600 rounded-lg p-6 text-white text-xl font-bold shadow-2xl">
               什么？ <span className="text-yellow-400">{pokemon.speciesName}</span> 的样子......
               <div className="text-sm text-slate-400 mt-4 animate-pulse">（点击屏幕继续）</div>
             </div>
           </motion.div>
        )}

        {stage === 'ANIMATION' && (
          <EvolutionAnimation 
             fromSprite={pokemon.spriteUrl || ''} 
             toSprite={targetSpecies.spriteUrl || ''}
             onComplete={() => advanceEvolutionStage('FINISHED')}
          />
        )}

        {stage === 'FINISHED' && (
           <motion.div 
             key="finished"
             className="text-center w-full max-w-md"
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
           >
             <div className="relative w-48 h-48 mx-auto mb-12">
                <motion.div
                  initial={{ filter: 'brightness(2)' }}
                  animate={{ filter: 'brightness(1)' }}
                  transition={{ duration: 1.5 }}
                >
                  <img src={targetSpecies.spriteUrl} alt={targetSpecies.speciesName} className="w-full h-full object-contain pixelated" />
                </motion.div>
                
                {/* 庆祝粒子 */}
                <motion.div 
                   className="absolute inset-0 rounded-full border-4 border-yellow-200 opacity-0"
                   animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                />
             </div>
             <div className="bg-slate-800 border-4 border-yellow-500 rounded-lg p-6 text-white text-xl font-bold shadow-2xl">
               恭喜！你的 {pokemon.speciesName} 进化成了 <span className="text-yellow-400">{targetSpecies.speciesName}</span>！
               <div className="text-sm text-slate-400 mt-4 animate-pulse">（点击屏幕完成）</div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 进化动画子组件
const EvolutionAnimation: React.FC<{ fromSprite: string, toSprite: string, onComplete: () => void }> = ({ fromSprite, toSprite, onComplete }) => {
  useEffect(() => {
     const timer = setTimeout(onComplete, 5000); // 5秒动画
     return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
       {/* 强烈的光环背景 */}
       <motion.div 
         className="absolute w-96 h-96 bg-gradient-radial from-white via-blue-500 to-transparent opacity-0 rounded-full blur-3xl"
         animate={{ 
            opacity: [0, 0.8, 1, 0.8, 0],
            scale: [0.5, 1.2, 1.5, 1.2, 0.5]
         }}
         transition={{ duration: 5, times: [0, 0.2, 0.5, 0.8, 1] }}
       />

       {/* 粒子效果 */}
       {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ 
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
            }}
            transition={{ 
                duration: 2, 
                repeat: 2, 
                delay: Math.random() * 2 
            }}
          />
       ))}

       {/* 进化前形态：渐变黑 -> 快速闪烁 -> 消失 */}
       <motion.img
         src={fromSprite}
         className="absolute w-48 h-48 object-contain pixelated z-10"
         animate={{
            filter: [
                'brightness(1)', 
                'brightness(0)', // 变剪影
                'brightness(0)',
                'brightness(0)',
                'brightness(0)', 
            ],
            opacity: [1, 1, 1, 0, 0] // 最后时刻消失
         }}
         transition={{ duration: 5, times: [0, 0.2, 0.8, 0.85, 1] }}
       />
       
       {/* 进化后形态：初始隐藏 -> 快速闪烁出现 -> 定格 */}
       <motion.img
         src={toSprite}
         className="absolute w-48 h-48 object-contain pixelated z-10"
         initial={{ opacity: 0, filter: 'brightness(0)' }}
         animate={{ 
            opacity: [0, 0, 0, 1, 1],
            filter: [
                'brightness(0)', 
                'brightness(0)', 
                'brightness(0)', 
                'brightness(0)', // 依然是剪影
            ]
         }}
         transition={{ duration: 5, times: [0, 0.2, 0.8, 0.85, 1] }}
       />

       {/* 闪烁覆盖层 (模拟 morphing 闪烁) */}
       <motion.div
          className="absolute w-48 h-48 z-20 bg-white mix-blend-overlay"
          animate={{ opacity: [0, 0, 1, 0, 1, 0, 1, 0] }}
          transition={{ duration: 3, delay: 1.5, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1] }}
       />
       
       {/* 最终白屏闪光 */}
       <motion.div
         className="fixed inset-0 bg-white z-50 pointer-events-none"
         initial={{ opacity: 0 }}
         animate={{ opacity: [0, 0, 1, 0] }}
         transition={{ duration: 1, delay: 4, times: [0, 0.1, 0.5, 1] }}
       />
    </div>
  );
};

export default EvolutionView;
