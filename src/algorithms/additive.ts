import type { Color, MixingComponent } from "../types/color";
import { clamp, linearToRgb, rgbToLinear } from "./colorConversion";

/** Add independent sources in linear light, without normalizing total intensity. */
export function mixAdditive(components: readonly MixingComponent[]): Color {
  const result = { r: 0, g: 0, b: 0 };
  for (const { color, percentage } of components) {
    const intensity = clamp(percentage / 100);
    const linear = rgbToLinear(color);
    result.r += linear.r * intensity;
    result.g += linear.g * intensity;
    result.b += linear.b * intensity;
  }
  return linearToRgb(result);
}
