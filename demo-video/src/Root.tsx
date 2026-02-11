import React from "react";
import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";

// Total duration:
// 7 scenes: 150 + 150 + 240 + 300 + 240 + 240 + 150 = 1470 frames base
// Plus transition overlap compensation: each scene gets extra frames, but
// TransitionSeries automatically handles the math. The total composition
// duration = sum of all sequence durations - sum of all transition durations.
// = (150+15) + (150+30) + (240+30) + (300+30) + (240+30) + (240+30) + (150+15) - 6*15
// = 165 + 180 + 270 + 330 + 270 + 270 + 165 - 90 = 1560
const TOTAL_FRAMES = 1560;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DemoVideo"
      component={DemoVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
