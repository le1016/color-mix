import { describe, expect, it } from "vitest";
import { mixAdditive } from "../src/algorithms/additive";
import { rgbToHex } from "../src/algorithms/colorConversion";
import { createComponent } from "../src/utils/presets";

describe("linear-light additive mixing", () => {
  it.each([
    [["#FF0000", "#00FF00"], "#FFFF00"],
    [["#FF0000", "#0000FF"], "#FF00FF"],
    [["#00FF00", "#0000FF"], "#00FFFF"],
    [["#FF0000", "#00FF00", "#0000FF"], "#FFFFFF"],
  ])("%j → %s", (colors, expected) => {
    expect(
      rgbToHex(mixAdditive(colors.map((hex) => createComponent(hex)))),
    ).toBe(expected);
  });
  it("zero intensities and no sources give black", () => {
    expect(rgbToHex(mixAdditive([]))).toBe("#000000");
    expect(rgbToHex(mixAdditive([createComponent("#FFFFFF", 0)]))).toBe(
      "#000000",
    );
  });
  it("50% red encodes linear 0.5 as sRGB 188, not 128", () => {
    expect(mixAdditive([createComponent("#FF0000", 50)])).toEqual({
      r: 188,
      g: 0,
      b: 0,
    });
  });
  it("adds gray light correctly and clips bright channels", () => {
    expect(
      rgbToHex(
        mixAdditive([createComponent("#808080"), createComponent("#808080")]),
      ),
    ).toBe("#B0B0B0");
    expect(
      rgbToHex(
        mixAdditive([createComponent("#FFFFFF"), createComponent("#FFFFFF")]),
      ),
    ).toBe("#FFFFFF");
  });
  it("supports more than ten sources without mutating them", () => {
    const sources = Array.from({ length: 16 }, () =>
      createComponent("#FF0000", 2),
    );
    const original = structuredClone(sources);
    expect(mixAdditive(sources).r).toBe(153);
    expect(sources).toEqual(original);
  });
  it("defends against invalid numeric inputs", () => {
    expect(
      rgbToHex(
        mixAdditive([
          { id: "x", color: { r: NaN, g: -2, b: Infinity }, percentage: NaN },
        ]),
      ),
    ).toBe("#000000");
  });
});
