import { useEffect, useMemo, useState } from "react";
import { mixingModels } from "../algorithms/models";
import type {
  Color,
  MixingComponent,
  MixingMode,
  SavedRecipe,
} from "../types/color";
import { createComponent, defaultComponents } from "../utils/presets";
import { createRecipe } from "../utils/recipes";
import {
  loadStudio,
  prependHistory,
  saveHistory,
  saveSession,
} from "../utils/storage";

export function useColorMixer() {
  const [initial] = useState(loadStudio);
  const [session, setSession] = useState(initial.session);
  const [history, setHistory] = useState(initial.history);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const components = session.palettes[session.mode];
  const result = useMemo(
    () => mixingModels[session.mode].mix(components),
    [session.mode, components],
  );

  useEffect(() => {
    const warning = saveSession(session);
    if (warning) setStorageWarning(warning);
  }, [session]);
  useEffect(() => {
    const warning = saveHistory(history);
    if (warning) setStorageWarning(warning);
  }, [history]);

  function updateComponents(
    update: (current: MixingComponent[]) => MixingComponent[],
  ) {
    setSession((current) => ({
      ...current,
      palettes: {
        ...current.palettes,
        [current.mode]: update(current.palettes[current.mode]),
      },
    }));
  }
  function setMode(mode: MixingMode) {
    setSession((current) => ({ ...current, mode }));
  }
  function addColor(hex?: string) {
    updateComponents((current) => [
      ...current,
      createComponent(hex ?? (session.mode === "rgb" ? "#0000FF" : "#FF00FF")),
    ]);
  }
  function updateColor(id: string, color: Color) {
    updateComponents((current) =>
      current.map((component) =>
        component.id === id ? { ...component, color } : component,
      ),
    );
  }
  function updatePercentage(id: string, percentage: number) {
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100)
      return;
    updateComponents((current) =>
      current.map((component) =>
        component.id === id ? { ...component, percentage } : component,
      ),
    );
  }
  function deleteColor(id: string) {
    updateComponents((current) =>
      current.filter((component) => component.id !== id),
    );
  }
  function resetMode() {
    updateComponents(() => defaultComponents(session.mode));
  }
  function saveRecipe() {
    const recipe = createRecipe(session.mode, components);
    setHistory((current) => prependHistory(current, recipe));
  }
  function restoreRecipe(recipe: SavedRecipe) {
    setSession((current) => ({
      ...current,
      mode: recipe.mode,
      palettes: {
        ...current.palettes,
        [recipe.mode]: recipe.components.map((component) => ({
          ...component,
          color: { ...component.color },
        })),
      },
    }));
  }
  function deleteRecipe(id: string) {
    setHistory((current) => current.filter((recipe) => recipe.id !== id));
  }
  function clearHistory() {
    setHistory([]);
  }

  return {
    mode: session.mode,
    components,
    result,
    history,
    storageWarning,
    setMode,
    addColor,
    updateColor,
    updatePercentage,
    deleteColor,
    resetMode,
    saveRecipe,
    restoreRecipe,
    deleteRecipe,
    clearHistory,
    dismissStorageWarning: () => setStorageWarning(null),
  };
}
