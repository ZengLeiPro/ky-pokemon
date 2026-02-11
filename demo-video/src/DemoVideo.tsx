import React from "react";
import { useVideoConfig } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { linearTiming, springTiming } from "@remotion/transitions";
import { TitleScene } from "./components/scenes/TitleScene";
import { StarterScene } from "./components/scenes/StarterScene";
import { ExplorationScene } from "./components/scenes/ExplorationScene";
import { BattleScene } from "./components/scenes/BattleScene";
import { CollectionScene } from "./components/scenes/CollectionScene";
import { FeaturesScene } from "./components/scenes/FeaturesScene";
import { CTAScene } from "./components/scenes/CTAScene";
import "./styles.css";

const TRANSITION_DURATION = 15; // frames

export const DemoVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      {/* Scene 1: Title (5s = 150 frames) */}
      <TransitionSeries.Sequence durationInFrames={150 + TRANSITION_DURATION}>
        <TitleScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 2: Starter Selection (5s = 150 frames) */}
      <TransitionSeries.Sequence
        durationInFrames={150 + TRANSITION_DURATION * 2}
      >
        <StarterScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-left" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: TRANSITION_DURATION,
        })}
      />

      {/* Scene 3: Exploration (8s = 240 frames) */}
      <TransitionSeries.Sequence
        durationInFrames={240 + TRANSITION_DURATION * 2}
      >
        <ExplorationScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 4: Battle (10s = 300 frames) */}
      <TransitionSeries.Sequence
        durationInFrames={300 + TRANSITION_DURATION * 2}
      >
        <BattleScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 5: Collection (8s = 240 frames) */}
      <TransitionSeries.Sequence
        durationInFrames={240 + TRANSITION_DURATION * 2}
      >
        <CollectionScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={springTiming({
          config: { damping: 200 },
          durationInFrames: TRANSITION_DURATION,
        })}
      />

      {/* Scene 6: Features Showcase (8s = 240 frames) */}
      <TransitionSeries.Sequence
        durationInFrames={240 + TRANSITION_DURATION * 2}
      >
        <FeaturesScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Scene 7: CTA (5s = 150 frames) */}
      <TransitionSeries.Sequence durationInFrames={150 + TRANSITION_DURATION}>
        <CTAScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
