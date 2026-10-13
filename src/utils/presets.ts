import { hexToRgb, rgbToHex } from "../algorithms/colorConversion";
import type {
  Color,
  MixingComponent,
  MixingMode,
  StudioSession,
} from "../types/color";

export const PRESETS = [
  { name: "红色", hex: "#FF0000", short: "红" },
  { name: "绿色", hex: "#00FF00", short: "绿" },
  { name: "蓝色", hex: "#0000FF", short: "蓝" },
  { name: "青色", hex: "#00FFFF", short: "青" },
  { name: "品红", hex: "#FF00FF", short: "品红" },
  { name: "黄色", hex: "#FFFF00", short: "黄" },
  { name: "黑色", hex: "#000000", short: "黑" },
  { name: "白色", hex: "#FFFFFF", short: "白" },
] as const;
export function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
export function colorName(color: Color): string {
  return (
    PRESETS.find((preset) => preset.hex === rgbToHex(color))?.name ?? "自定义色"
  );
}
export function createComponent(
  hex: string,
  percentage = 100,
): MixingComponent {
  const color = hexToRgb(hex);
  if (!color) throw new Error("颜色格式无效");
  return { id: createId(), color, percentage };
}
export function defaultComponents(mode: MixingMode): MixingComponent[] {
  return (mode === "rgb" ? ["#FF0000", "#00FF00"] : ["#00FFFF", "#FFFF00"]).map(
    (hex) => createComponent(hex),
  );
}
export function defaultSession(): StudioSession {
  return {
    mode: "rgb",
    palettes: { rgb: defaultComponents("rgb"), cmy: defaultComponents("cmy") },
  };
}
