import { ALGORITHM_VERSION, mixingModels } from "../algorithms/models";
import type {
  Color,
  MixingComponent,
  MixingMode,
  SavedRecipe,
} from "../types/color";
import { createId } from "./presets";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("数据必须是 JSON 对象");
  return value as Record<string, unknown>;
}
export function validateMode(value: unknown): MixingMode {
  if (value !== "rgb" && value !== "cmy")
    throw new Error("混色模式必须是 rgb 或 cmy");
  return value;
}
function identifier(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 200)
    throw new Error("配方或颜色 ID 无效");
  return value;
}
export function validateColor(value: unknown): Color {
  const data = record(value);
  for (const channel of ["r", "g", "b"]) {
    const number = data[channel];
    if (
      typeof number !== "number" ||
      !Number.isInteger(number) ||
      number < 0 ||
      number > 255
    ) {
      throw new Error("RGB 通道必须是 0–255 的整数");
    }
  }
  return { r: data.r as number, g: data.g as number, b: data.b as number };
}
export function validateComponents(value: unknown): MixingComponent[] {
  if (!Array.isArray(value)) throw new Error("components 必须是颜色数组");
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    const data = record(item);
    const id = identifier(data.id);
    if (ids.has(id)) throw new Error("颜色 ID 不能重复");
    ids.add(id);
    const percentage = data.percentage;
    if (
      typeof percentage !== "number" ||
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      throw new Error("混合百分比必须是 0–100 的有限数值");
    }
    return { id, color: validateColor(data.color), percentage };
  });
}
export function createRecipe(
  mode: MixingMode,
  components: readonly MixingComponent[],
  now = new Date(),
): SavedRecipe {
  const snapshot = components.map((component) => ({
    ...component,
    color: { ...component.color },
  }));
  return {
    schemaVersion: 1,
    algorithmVersion: ALGORITHM_VERSION,
    id: createId(),
    mode,
    components: snapshot,
    result: mixingModels[mode].mix(snapshot),
    savedAt: now.toISOString(),
  };
}
export function validateRecipe(value: unknown): SavedRecipe {
  const data = record(value);
  if (data.schemaVersion !== 1)
    throw new Error("不支持此 JSON 数据版本（需要 schemaVersion: 1）");
  if (data.algorithmVersion !== ALGORITHM_VERSION)
    throw new Error(`不支持此算法版本（需要 ${ALGORITHM_VERSION}）`);
  const mode = validateMode(data.mode);
  const components = validateComponents(data.components);
  const result = validateColor(data.result);
  const calculated = mixingModels[mode].mix(components);
  if (
    ["r", "g", "b"].some(
      (key) => result[key as keyof Color] !== calculated[key as keyof Color],
    )
  ) {
    throw new Error("保存的结果与配方计算不一致，请检查文件");
  }
  if (
    typeof data.savedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T/.test(data.savedAt) ||
    !Number.isFinite(Date.parse(data.savedAt))
  ) {
    throw new Error("保存时间必须是有效的 ISO 日期时间");
  }
  return {
    schemaVersion: 1,
    algorithmVersion: ALGORITHM_VERSION,
    id: identifier(data.id),
    mode,
    components,
    result,
    savedAt: data.savedAt,
  };
}
export function parseRecipe(text: string): SavedRecipe {
  let data: unknown;
  try {
    data = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error("文件不是有效的 JSON");
  }
  return validateRecipe(data);
}
export function serializeRecipe(recipe: SavedRecipe): string {
  return JSON.stringify(recipe, null, 2);
}
