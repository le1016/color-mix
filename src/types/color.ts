/** Screen RGB channels are integers in [0, 255]. */
export interface Color {
  r: number;
  g: number;
  b: number;
}
/** Linear RGB channels are in [0, 1]. */
export interface LinearColor {
  r: number;
  g: number;
  b: number;
}
export interface HslColor {
  h: number;
  s: number;
  l: number;
}
export type MixingMode = "rgb" | "cmy";
export interface MixingComponent {
  id: string;
  color: Color;
  percentage: number;
}
export interface MixingModel {
  id: MixingMode;
  label: string;
  version: string;
  mix: (components: readonly MixingComponent[]) => Color;
}
export interface StudioSession {
  mode: MixingMode;
  palettes: Record<MixingMode, MixingComponent[]>;
}
export interface SavedRecipe {
  schemaVersion: 1;
  algorithmVersion: string;
  id: string;
  mode: MixingMode;
  components: MixingComponent[];
  result: Color;
  savedAt: string;
}
