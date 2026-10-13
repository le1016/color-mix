import type { Color, MixingComponent, MixingMode } from "../types/color";
import { PRESETS } from "../utils/presets";
import { ColorCard } from "./ColorCard";
import { Icon } from "./Icon";
import { ModeSelector } from "./ModeSelector";
interface Props {
  mode: MixingMode;
  components: MixingComponent[];
  onMode: (mode: MixingMode) => void;
  onAdd: (hex?: string) => void;
  onColor: (id: string, color: Color) => void;
  onPercentage: (id: string, percentage: number) => void;
  onDelete: (id: string) => void;
}
export function MixingPanel({
  mode,
  components,
  onMode,
  onAdd,
  onColor,
  onPercentage,
  onDelete,
}: Props) {
  return (
    <section className="input-panel panel" aria-labelledby="input-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / INPUT</span>
          <h2 id="input-heading">调配你的颜色</h2>
        </div>
        <span className="count-badge">{components.length} 色</span>
      </div>
      <ModeSelector mode={mode} onChange={onMode} />
      <div className="preset-section">
        <p className="field-caption">
          快速添加 <span>PRESETS</span>
        </p>
        <div className="presets">
          {PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.hex}
              className="preset-button"
              onClick={() => onAdd(preset.hex)}
              aria-label={`添加${preset.name}`}
              title={`添加${preset.name} ${preset.hex}`}
            >
              <span
                className="preset-swatch"
                style={{ backgroundColor: preset.hex }}
              />
              <span>{preset.short}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="color-list">
        {components.map((component, i) => (
          <ColorCard
            key={component.id}
            component={component}
            index={i + 1}
            mode={mode}
            onColor={onColor}
            onPercentage={onPercentage}
            onDelete={onDelete}
          />
        ))}
      </div>
      {components.length === 0 && (
        <div className="empty-colors">
          <Icon name="palette" size={28} />
          <p>从一种颜色开始</p>
          <small>
            {mode === "rgb"
              ? "没有光源时，结果为黑色。"
              : "没有滤色片时，结果为白色。"}
          </small>
        </div>
      )}
      <button
        type="button"
        className="add-color-button"
        onClick={() => onAdd()}
      >
        <Icon name="plus" />
        添加颜色
      </button>
      <p className="panel-footnote">每一种颜色，都有无限可能。</p>
    </section>
  );
}
