import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { SPECIES_DATA } from '../../constants';
import { SpeciesData } from '@shared/types';

const EvolutionView: React.FC = () => {
  const { evolution, advanceEvolutionStage, completeEvolution } = useGameStore();
  const { pokemon, targetSpeciesId, stage } = evolution;
  const [targetSpecies, setTargetSpecies] = useState<SpeciesData | null>(null);

  // 进化 BGM
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (targetSpeciesId && SPECIES_DATA[targetSpeciesId]) {
      setTargetSpecies(SPECIES_DATA[targetSpeciesId]);
    }
  }, [targetSpeciesId]);

  // 进入 ANIMATION 阶段时播放进化音乐
  useEffect(() => {
    if (stage === 'ANIMATION') {
      const audio = new Audio('/audio/evolution.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      bgmRef.current = audio;
    }
    if (stage === 'FINISHED') {
      // 停掉进化过程BGM，播放进化成功音乐
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
      const successAudio = new Audio('/audio/evolution-success.mp3');
      successAudio.volume = 0.5;
      successAudio.play().catch(() => {});
      bgmRef.current = successAudio;
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
        bgmRef.current = null;
      }
    };
  }, [stage]);

  if (!pokemon || !targetSpecies) return null;

  const handleClick = () => {
    if (stage === 'START') {
      advanceEvolutionStage('ANIMATION');
    } else if (stage === 'FINISHED') {
      // 停止音乐
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
        bgmRef.current = null;
      }
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

/**
 * 生成进化动画的形态闪烁关键帧。
 * 模拟原版宝可梦：旧形态剪影和新形态剪影交替出现，越来越快。
 */
function buildMorphKeyframes(duration: number) {
  // 0 ~ 0.06: 旧形态正常 → 变剪影
  const oldOpacity: number[] = [1, 1];
  const newOpacity: number[] = [0, 0];
  const times: number[] = [0, 0.06];

  // 0.09 开始交替闪烁，间隔越来越短
  let t = 0.09;
  let interval = 0.07; // 起始间隔 (~2.3s)
  let showOld = false; // 下一帧先显示新形态

  while (t < 0.90) {
    oldOpacity.push(showOld ? 1 : 0);
    newOpacity.push(showOld ? 0 : 1);
    times.push(Math.min(t, 0.90));
    t += interval;
    showOld = !showOld;
    interval *= 0.82; // 加速
    if (interval < 0.012) interval = 0.012; // 最快 ~0.4s
  }

  // 最后：新形态留下
  oldOpacity.push(0);
  newOpacity.push(1);
  times.push(1.0);

  return { oldOpacity, newOpacity, times };
}

const EVOLUTION_DURATION = 33; // 秒，匹配 BGM

// 进化动画子组件
const EvolutionAnimation: React.FC<{ fromSprite: string, toSprite: string, onComplete: () => void }> = ({ fromSprite, toSprite, onComplete }) => {
  const { oldOpacity, newOpacity, times } = buildMorphKeyframes(EVOLUTION_DURATION);

  useEffect(() => {
     const timer = setTimeout(onComplete, EVOLUTION_DURATION * 1000);
     return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
       {/* 光环背景：缓慢增强 */}
       <motion.div
         className="absolute w-96 h-96 bg-gradient-radial from-white via-blue-500 to-transparent opacity-0 rounded-full blur-3xl"
         animate={{
            opacity: [0, 0.3, 0.6, 0.9, 1, 0.8, 0],
            scale: [0.5, 0.8, 1.0, 1.3, 1.5, 1.2, 0.5]
         }}
         transition={{ duration: EVOLUTION_DURATION, times: [0, 0.05, 0.2, 0.6, 0.85, 0.93, 1] }}
       />

       {/* 粒子效果 */}
       {[...Array(15)].map((_, i) => (
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
                duration: 3,
                repeat: Math.floor(EVOLUTION_DURATION / 3),
                delay: Math.random() * 8
            }}
          />
       ))}

       {/* 进化前形态：正常 → 剪影 → 交替闪烁 → 消失 */}
       <motion.img
         src={fromSprite}
         className="absolute w-48 h-48 object-contain pixelated z-10"
         style={{ filter: 'brightness(0)' }}
         animate={{
            filter: [
                'brightness(1)',
                'brightness(0)',
                ...Array(times.length - 2).fill('brightness(0)'),
            ],
            opacity: oldOpacity,
         }}
         transition={{ duration: EVOLUTION_DURATION, times }}
       />

       {/* 进化后形态：隐藏 → 交替闪烁 → 留下（剪影） */}
       <motion.img
         src={toSprite}
         className="absolute w-48 h-48 object-contain pixelated z-10"
         initial={{ opacity: 0 }}
         style={{ filter: 'brightness(0)' }}
         animate={{ opacity: newOpacity }}
         transition={{ duration: EVOLUTION_DURATION, times }}
       />

       {/* 中段闪烁覆盖层 */}
       <motion.div
          className="absolute w-48 h-48 z-20 bg-white mix-blend-overlay"
          animate={{ opacity: [0, 0, 1, 0, 1, 0, 1, 0, 0] }}
          transition={{ duration: 8, delay: EVOLUTION_DURATION * 0.35, times: [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1] }}
       />

       {/* 最终白屏闪光 */}
       <motion.div
         className="fixed inset-0 bg-white z-50 pointer-events-none"
         initial={{ opacity: 0 }}
         animate={{ opacity: [0, 0, 1, 0] }}
         transition={{ duration: 2, delay: EVOLUTION_DURATION - 2, times: [0, 0.1, 0.5, 1] }}
       />
    </div>
  );
};

export default EvolutionView;
