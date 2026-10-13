import type { Color, MixingComponent } from "../types/color";
import { clamp, linearToRgb, rgbToLinear } from "./colorConversion";

/** Ideal independent filters on unit white light. Amount is optical-density weight. */
export function mixSubtractive(components: readonly MixingComponent[]): Color {
  const transmission = { r: 1, g: 1, b: 1 };
  for (const { color, percentage } of components) {
    const amount = clamp(percentage / 100);
    // Skip zero amounts explicitly, including zero-transmission filters: no 0^0.
    if (amount === 0) continue;
    const linear = rgbToLinear(color);
    transmission.r *= linear.r === 0 ? 0 : linear.r ** amount;
    transmission.g *= linear.g === 0 ? 0 : linear.g ** amount;
    transmission.b *= linear.b === 0 ? 0 : linear.b ** amount;
  }
  return linearToRgb(transmission);
}
