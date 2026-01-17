import React, { useRef, useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { ViewState } from '@/types';

import TeamGrid from './stages/TeamGrid';
import BagView from './stages/BagView';
import RoamStage from './stages/RoamStage';
import DexView from './stages/DexView';
import ProfileView from './stages/ProfileView';

const TAB_ORDER: ViewState[] = ['TEAM', 'BAG', 'ROAM', 'DEX', 'PROFILE'];

const MainStageSlider: React.FC = () => {
  const { view, setView } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const currentIndex = TAB_ORDER.indexOf(view);
  const isTabActive = currentIndex !== -1;

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
        updateWidth();
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const { offset, velocity } = info;

    if (offset.x < -swipeThreshold || velocity.x < -500) {
      if (currentIndex < TAB_ORDER.length - 1) {
        setView(TAB_ORDER[currentIndex + 1]);
      }
    } else if (offset.x > swipeThreshold || velocity.x > 500) {
      if (currentIndex > 0) {
        setView(TAB_ORDER[currentIndex - 1]);
      }
    }
  };

  if (!isTabActive) return null;

  return (
    <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-slate-900 relative"
    >
      <motion.div
        className="flex h-full"
        style={{ 
            width: `${TAB_ORDER.length * 100}%`,
            touchAction: 'pan-y'
        }}
        initial={false}
        animate={{ x: `-${currentIndex * (100 / TAB_ORDER.length)}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
        drag={containerWidth > 0 ? "x" : false}
        dragConstraints={{ 
            left: -((TAB_ORDER.length - 1) * containerWidth), 
            right: 0 
        }}
        dragElastic={0.2}
        dragDirectionLock
        onDragEnd={handleDragEnd}
      >
        {TAB_ORDER.map((tabView, index) => {
          const shouldRender = Math.abs(currentIndex - index) <= 1;

          return (
            <div 
                key={tabView} 
                className="h-full flex-shrink-0 overflow-hidden relative"
                style={{ width: `${100 / TAB_ORDER.length}%` }}
            >
              {shouldRender ? (
                <StageRenderer view={tabView} />
              ) : (
                <div className="w-full h-full bg-slate-900 animate-pulse" />
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

const StageRenderer: React.FC<{ view: ViewState }> = ({ view }) => {
    switch (view) {
        case 'TEAM': return <TeamGrid />;
        case 'BAG': return <BagView />;
        case 'ROAM': return <RoamStage />;
        case 'DEX': return <DexView />;
        case 'PROFILE': return <ProfileView />;
        default: return null;
    }
};

export default MainStageSlider;
