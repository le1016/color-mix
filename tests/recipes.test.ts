import { describe, expect, it } from "vitest";
import {
  createRecipe,
  parseRecipe,
  serializeRecipe,
  validateComponents,
  validateRecipe,
} from "../src/utils/recipes";
import { createComponent } from "../src/utils/presets";

const makeRecipe = () =>
  createRecipe(
    "rgb",
    [createComponent("#FF0000"), createComponent("#00FF00")],
    new Date("2026-10-13T00:00:00.000Z"),
  );
describe("recipe JSON validation", () => {
  it("exports and imports every field losslessly", () => {
    const recipe = makeRecipe();
    expect(parseRecipe(serializeRecipe(recipe))).toEqual(recipe);
    expect(parseRecipe("\uFEFF" + serializeRecipe(recipe))).toEqual(recipe);
  });
  it("takes an independent snapshot", () => {
    const inputs = [createComponent("#FF0000")];
    const recipe = createRecipe("rgb", inputs);
    inputs[0].color.r = 0;
    inputs[0].percentage = 0;
    expect(recipe.components[0].color.r).toBe(255);
    expect(recipe.components[0].percentage).toBe(100);
  });
  it.each([
    null,
    [],
    {},
    { ...makeRecipe(), mode: "pigment" },
    { ...makeRecipe(), schemaVersion: 2 },
    { ...makeRecipe(), algorithmVersion: "99" },
    { ...makeRecipe(), savedAt: "tomorrow" },
    { ...makeRecipe(), id: "" },
    { ...makeRecipe(), result: { r: 0, g: 0, b: 0 } },
  ])("rejects malformed or inconsistent metadata %#", (data) =>
    expect(() => validateRecipe(data)).toThrow(),
  );
  it.each([-1, 101, NaN, Infinity, "50", null])(
    "rejects percentage %s",
    (percentage) => {
      expect(() =>
        validateComponents([
          { id: "a", color: { r: 0, g: 255, b: 0 }, percentage },
        ]),
      ).toThrow();
    },
  );
  it.each([-1, 256, 0.5, NaN, Infinity, "100", null])(
    "rejects channel %s",
    (r) => {
      expect(() =>
        validateComponents([
          { id: "a", color: { r, g: 255, b: 0 }, percentage: 50 },
        ]),
      ).toThrow();
    },
  );
  it("rejects duplicate IDs, nonarrays, and invalid JSON", () => {
    const input = createComponent("#FFFFFF");
    expect(() => validateComponents([input, input])).toThrow();
    expect(() => validateComponents({})).toThrow();
    expect(() => parseRecipe("{ broken")).toThrow("JSON");
  });
  it("allows empty and more-than-ten-color recipes", () => {
    expect(validateRecipe(createRecipe("cmy", [])).result).toEqual({
      r: 255,
      g: 255,
      b: 255,
    });
    expect(
      validateRecipe(
        createRecipe(
          "rgb",
          Array.from({ length: 12 }, () => createComponent("#123456")),
        ),
      ).components,
    ).toHaveLength(12);
  });
});
