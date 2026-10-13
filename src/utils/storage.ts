import type { SavedRecipe, StudioSession } from "../types/color";
import { defaultSession } from "./presets";
import { validateComponents, validateMode, validateRecipe } from "./recipes";

export const HISTORY_LIMIT = 50;
export const SESSION_KEY = "color-mixing-studio:session:v1";
export const HISTORY_KEY = "color-mixing-studio:history:v1";
export type StorageAdapter = Pick<Storage, "getItem" | "setItem">;
export interface StoredStudio {
  session: StudioSession;
  history: SavedRecipe[];
  warning: string | null;
}

export function loadStudio(storage?: StorageAdapter): StoredStudio {
  const loaded: StoredStudio = {
    session: defaultSession(),
    history: [],
    warning: null,
  };
  try {
    storage ??= window.localStorage;
  } catch {
    loaded.warning = "浏览器无法访问本地存储，当前配方仍可使用和导出。";
    return loaded;
  }
  try {
    const raw = storage.getItem(SESSION_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data || data.schemaVersion !== 1 || !data.palettes)
        throw new Error("Invalid session");
      loaded.session = {
        mode: validateMode(data.mode),
        palettes: {
          rgb: validateComponents(data.palettes.rgb),
          cmy: validateComponents(data.palettes.cmy),
        },
      };
    }
  } catch {
    loaded.warning = "本地设置无法读取，已使用默认配方。";
  }
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (raw) {
      const data: unknown = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("Invalid history");
      const ids = new Set<string>();
      for (const entry of data) {
        try {
          const recipe = validateRecipe(entry);
          if (!ids.has(recipe.id)) {
            loaded.history.push(recipe);
            ids.add(recipe.id);
          }
        } catch {
          loaded.warning = "部分历史记录格式无效，已保留可用的记录。";
        }
        if (loaded.history.length === HISTORY_LIMIT) break;
      }
    }
  } catch {
    loaded.warning = "历史记录无法读取，当前配方仍可使用。";
  }
  return loaded;
}
function write(
  key: string,
  data: unknown,
  storage?: StorageAdapter,
): string | null {
  try {
    (storage ?? window.localStorage).setItem(key, JSON.stringify(data));
    return null;
  } catch {
    return "本地存储不可用或空间不足，修改仅保留在当前页面，请导出 JSON 备份。";
  }
}
export function saveSession(
  session: StudioSession,
  storage?: StorageAdapter,
): string | null {
  return write(SESSION_KEY, { schemaVersion: 1, ...session }, storage);
}
export function saveHistory(
  history: readonly SavedRecipe[],
  storage?: StorageAdapter,
): string | null {
  return write(HISTORY_KEY, history.slice(0, HISTORY_LIMIT), storage);
}
export function prependHistory(
  history: readonly SavedRecipe[],
  recipe: SavedRecipe,
): SavedRecipe[] {
  return [recipe, ...history].slice(0, HISTORY_LIMIT);
}
