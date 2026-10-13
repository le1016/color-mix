import type { MixingMode, MixingModel } from "../types/color";
import { mixAdditive } from "./additive";
import { mixSubtractive } from "./subtractive";

export const ALGORITHM_VERSION = "1.0.0";
export const mixingModels: Record<MixingMode, MixingModel> = {
  rgb: {
    id: "rgb",
    label: "RGB 加色法",
    version: ALGORITHM_VERSION,
    mix: mixAdditive,
  },
  cmy: {
    id: "cmy",
    label: "CMY 减色法",
    version: ALGORITHM_VERSION,
    mix: mixSubtractive,
  },
};
