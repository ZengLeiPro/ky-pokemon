import { loadFont } from "@remotion/google-fonts/NotoSansSC";
import { loadFont as loadTitleFont } from "@remotion/google-fonts/ZCOOLKuaiLe";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
});

const { fontFamily: titleFontFamily } = loadTitleFont("normal", {
  weights: ["400"],
});

export const FONT_FAMILY = fontFamily;
export const TITLE_FONT = titleFontFamily;
