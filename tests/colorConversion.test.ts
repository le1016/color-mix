import { describe, expect, it } from "vitest";
import {
  clamp,
  hexToRgb,
  hslToRgb,
  linearToRgb,
  linearToSrgb,
  rgbToHex,
  rgbToHsl,
  rgbToLinear,
  srgbToLinear,
} from "../src/algorithms/colorConversion";

describe("color conversion", () => {
  it.each(["#abcd", "#GG0000", "#1234567", "", "red", "#12 3456"])(
    "rejects %s",
    (hex) => expect(hexToRgb(hex)).toBeNull(),
  );
  it("parses full, short, and case-insensitive HEX", () => {
    expect(hexToRgb(" #f80 ")).toEqual({ r: 255, g: 136, b: 0 });
    expect(rgbToHex(hexToRgb("aAbBcC")!)).toBe("#AABBCC");
  });
  it("covers both transfer-function branches and their boundaries", () => {
    expect(srgbToLinear(0.04)).toBeCloseTo(0.04 / 12.92, 10);
    expect(srgbToLinear(0.04045)).toBeCloseTo(0.04045 / 12.92, 10);
    expect(srgbToLinear(0.5)).toBeCloseTo(0.21404114, 7);
    expect(linearToSrgb(0.003)).toBeCloseTo(12.92 * 0.003, 10);
    expect(linearToSrgb(0.0031308)).toBeCloseTo(12.92 * 0.0031308, 10);
    expect(linearToSrgb(0.5)).toBeCloseTo(0.73535698, 7);
  });
  it("round-trips every 8-bit channel through linear light", () => {
    for (let channel = 0; channel <= 255; channel++) {
      const rgb = { r: channel, g: channel, b: channel };
      expect(linearToRgb(rgbToLinear(rgb))).toEqual(rgb);
    }
  });
  it.each([
    [
      { r: 255, g: 0, b: 0 },
      { h: 0, s: 100, l: 50 },
    ],
    [
      { r: 0, g: 255, b: 0 },
      { h: 120, s: 100, l: 50 },
    ],
    [
      { r: 0, g: 0, b: 255 },
      { h: 240, s: 100, l: 50 },
    ],
    [
      { r: 255, g: 255, b: 255 },
      { h: 0, s: 0, l: 100 },
    ],
    [
      { r: 0, g: 0, b: 0 },
      { h: 0, s: 0, l: 0 },
    ],
  ])("RGB ↔ HSL for %j", (rgb, hsl) => {
    expect(rgbToHsl(rgb)).toEqual(hsl);
    expect(hslToRgb(hsl)).toEqual(rgb);
  });
  it("round-trips all HSL hue sectors and gray", () => {
    for (const hex of [
      "#ED5978",
      "#EABC50",
      "#8FDF7E",
      "#43DAD2",
      "#7075E3",
      "#D279EF",
      "#808080",
    ]) {
      const rgb = hexToRgb(hex)!;
      expect(hslToRgb(rgbToHsl(rgb))).toEqual(rgb);
    }
  });
  it("clamps bounds and never outputs invalid HEX for nonfinite input", () => {
    expect(clamp(NaN)).toBe(0);
    expect(rgbToHex({ r: 280, g: -1, b: NaN })).toBe("#FF0000");
    expect(hslToRgb({ h: -120, s: 100, l: 50 })).toEqual({
      r: 0,
      g: 0,
      b: 255,
    });
  });
});
