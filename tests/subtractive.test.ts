import { describe, expect, it } from "vitest";
import { mixSubtractive } from "../src/algorithms/subtractive";
import {
  rgbToHex,
  rgbToLinear,
  linearToRgb,
} from "../src/algorithms/colorConversion";
import { createComponent } from "../src/utils/presets";

describe("ideal-filter subtractive mixing", () => {
  it.each([
    [["#00FFFF", "#FFFF00"], "#00FF00"],
    [["#00FFFF", "#FF00FF"], "#0000FF"],
    [["#FF00FF", "#FFFF00"], "#FF0000"],
    [["#00FFFF", "#FF00FF", "#FFFF00"], "#000000"],
  ])("%j → %s", (colors, expected) => {
    expect(
      rgbToHex(mixSubtractive(colors.map((hex) => createComponent(hex)))),
    ).toBe(expected);
  });
  it("zero amounts and no filters give white even for black filters", () => {
    expect(rgbToHex(mixSubtractive([]))).toBe("#FFFFFF");
    expect(
      rgbToHex(
        mixSubtractive([
          createComponent("#000000", 0),
          createComponent("#00FFFF", 0),
        ]),
      ),
    ).toBe("#FFFFFF");
  });
  it("zero transmission blocks a channel at any positive amount", () => {
    expect(rgbToHex(mixSubtractive([createComponent("#00FFFF", 0.01)]))).toBe(
      "#00FFFF",
    );
  });
  it("fractional density uses exponentiated linear transmission", () => {
    const filter = createComponent("#808080", 50);
    const transmission = rgbToLinear(filter.color).r ** 0.5;
    expect(mixSubtractive([filter])).toEqual(
      linearToRgb({ r: transmission, g: transmission, b: transmission }),
    );
    expect(rgbToHex(mixSubtractive([filter, filter]))).toBe("#808080");
  });
  it("multiple filters darken gray instead of averaging it", () => {
    expect(
      rgbToHex(
        mixSubtractive([
          createComponent("#808080"),
          createComponent("#808080"),
        ]),
      ),
    ).toBe("#3D3D3D");
  });
  it("white is neutral and the input remains immutable", () => {
    const inputs = [createComponent("#EAA060", 80), createComponent("#FFFFFF")];
    const original = structuredClone(inputs);
    expect(mixSubtractive(inputs)).toEqual(mixSubtractive(inputs.slice(0, 1)));
    expect(inputs).toEqual(original);
  });
});
