import React, { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';

type Phase = 'intro' | 'title';

const IntroVideoView: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('intro');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setView } = useGameStore();

  const enterGame = useCallback(() => {
    setView('ROAM');
  }, [setView]);

  const skipToTitle = useCallback(() => {
    setPhase('title');
  }, []);

  const handleVideoEnd = useCallback(() => {
    if (phase === 'intro') {
      setPhase('title');
    }
    // title 阶段视频结束不自动做什么，等玩家点击
  }, [phase]);

  return (
    <div
      className="w-full h-full relative bg-black flex items-center justify-center"
      onClick={phase === 'title' ? enterGame : undefined}
    >
      {phase === 'intro' ? (
        <>
          <video
            key="intro"
            ref={videoRef}
            src="/video/intro.mp4"
            autoPlay
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-contain"
          />
          {/* 跳过按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipToTitle();
            }}
            className="absolute top-4 right-4 px-4 py-2 bg-black/60 hover:bg-black/80 text-white/80 hover:text-white text-sm rounded-full backdrop-blur-sm transition-all border border-white/20"
          >
            跳过 →
          </button>
        </>
      ) : (
        <>
          <video
            key="title"
            src="/video/title.mp4"
            autoPlay
            playsInline
            loop
            className="w-full h-full object-contain"
          />
          {/* 点击任意处提示 */}
          <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
            <span className="text-white/70 text-sm animate-pulse">
              — 点击任意处开始游戏 —
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default IntroVideoView;
