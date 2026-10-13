import { describe, expect, it } from "vitest";
import { defaultSession, createComponent } from "../src/utils/presets";
import { createRecipe } from "../src/utils/recipes";
import {
  HISTORY_KEY,
  SESSION_KEY,
  loadStudio,
  prependHistory,
  saveHistory,
  saveSession,
} from "../src/utils/storage";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}
describe("local persistence", () => {
  it("restores each mode independently and preserves history across reloads", () => {
    const storage = memoryStorage();
    const session = defaultSession();
    session.mode = "cmy";
    session.palettes.rgb[0].percentage = 35;
    session.palettes.cmy[0].percentage = 77;
    const history = [createRecipe("cmy", session.palettes.cmy)];
    expect(saveSession(session, storage)).toBeNull();
    expect(saveHistory(history, storage)).toBeNull();
    const restored = loadStudio(storage);
    expect(restored.session).toEqual(session);
    expect(restored.history).toEqual(history);
    expect(restored.warning).toBeNull();
  });
  it("keeps the newest 50 entries", () => {
    let history = [] as ReturnType<typeof createRecipe>[];
    for (let i = 0; i < 60; i++)
      history = prependHistory(
        history,
        createRecipe("rgb", [createComponent("#FF0000", i)]),
      );
    const storage = memoryStorage();
    saveHistory(history, storage);
    expect(loadStudio(storage).history).toHaveLength(50);
    expect(history[0].components[0].percentage).toBe(59);
    expect(history[49].components[0].percentage).toBe(10);
  });
  it("recovers from invalid settings and keeps valid history entries", () => {
    const storage = memoryStorage();
    storage.setItem(SESSION_KEY, "{broken");
    const valid = createRecipe("rgb", []);
    storage.setItem(HISTORY_KEY, JSON.stringify([null, valid, valid]));
    const loaded = loadStudio(storage);
    expect(loaded.session.mode).toBe("rgb");
    expect(loaded.history).toEqual([valid]);
    expect(loaded.warning).not.toBeNull();
  });
  it("reports unavailable or full storage instead of crashing", () => {
    const storage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
    };
    expect(loadStudio(storage).warning).not.toBeNull();
    expect(saveSession(defaultSession(), storage)).not.toBeNull();
    expect(saveHistory([], storage)).not.toBeNull();
  });
});
