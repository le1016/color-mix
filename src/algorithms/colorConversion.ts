import type { Color, HslColor, LinearColor } from "../types/color";

/** Defensive normalization prevents nonfinite inputs from reaching screen output. */
export function clamp(value: number, min = 0, max = 1): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}
export function normalizeColor(color: Color): Color {
  return {
    r: Math.round(clamp(color.r, 0, 255)),
    g: Math.round(clamp(color.g, 0, 255)),
    b: Math.round(clamp(color.b, 0, 255)),
  };
}
export function srgbToLinear(channel: number): number {
  const c = clamp(channel);
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
export function linearToSrgb(channel: number): number {
  const c = clamp(channel);
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}
export function rgbToLinear(color: Color): LinearColor {
  return {
    r: srgbToLinear(color.r / 255),
    g: srgbToLinear(color.g / 255),
    b: srgbToLinear(color.b / 255),
  };
}
export function linearToRgb(color: LinearColor): Color {
  return {
    r: Math.round(linearToSrgb(color.r) * 255),
    g: Math.round(linearToSrgb(color.g) * 255),
    b: Math.round(linearToSrgb(color.b) * 255),
  };
}
/** Accept #RRGGBB / RRGGBB and #RGB / RGB; reject invalid input explicitly. */
export function hexToRgb(hex: string): Color | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const full =
    match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}
export function rgbToHex(color: Color): string {
  const { r, g, b } = normalizeColor(color);
  return `#${[r, g, b]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}
export function rgbToHsl(color: Color): HslColor {
  const normalized = normalizeColor(color);
  const [r, g, b] = [normalized.r, normalized.g, normalized.b].map(
    (c) => c / 255,
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return { h: 0, s: 0, l: l * 100 };
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h =
    max === r
      ? ((g - b) / delta) % 6
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  h = (h * 60 + 360) % 360;
  return { h, s: s * 100, l: l * 100 };
}
export function hslToRgb(color: HslColor): Color {
  const h = Number.isFinite(color.h) ? ((color.h % 360) + 360) % 360 : 0;
  const s = clamp(color.s / 100);
  const l = clamp(color.l / 100);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const values =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return {
    r: Math.round((values[0] + m) * 255),
    g: Math.round((values[1] + m) * 255),
    b: Math.round((values[2] + m) * 255),
  };
}
export function formatRgb(color: Color): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}
export function formatHsl(color: Color): string {
  const { h, s, l } = rgbToHsl(color);
  return `hsl(${Math.round(h) % 360}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}
export function relativeLuminance(color: Color): number {
  const c = rgbToLinear(color);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}
export function contrastText(color: Color): "#172421" | "#FFFFFF" {
  const luminance = relativeLuminance(color);
  const darkLuminance = relativeLuminance({ r: 23, g: 36, b: 33 });
  const darkContrast = (luminance + 0.05) / (darkLuminance + 0.05);
  const whiteContrast = 1.05 / (luminance + 0.05);
  return darkContrast >= whiteContrast ? "#172421" : "#FFFFFF";
}
