import { rgbToHex } from "../algorithms/colorConversion";
import type { SavedRecipe } from "../types/color";
import { serializeRecipe } from "./recipes";

export function downloadRecipe(recipe: SavedRecipe): void {
  const blob = new Blob([serializeRecipe(recipe)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `color-mixing-${recipe.mode}-${rgbToHex(recipe.result).slice(1)}-${recipe.savedAt.slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function copyText(value: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    /* Try the browser's legacy clipboard fallback. */
  }
  const previouslyFocused = document.activeElement;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.cssText = "position:fixed;left:-9999px;top:0";
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand("copy");
  textarea.remove();
  if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  if (!success) throw new Error("复制失败，请选择并手动复制数值。");
}
