import {
  contrastText,
  formatHsl,
  formatRgb,
  rgbToHex,
} from "../algorithms/colorConversion";
import type { Color, MixingComponent, MixingMode } from "../types/color";
import { mixingModels } from "../algorithms/models";
import { colorName } from "../utils/presets";
import { Icon } from "./Icon";
interface Props {
  result: Color;
  components: MixingComponent[];
  mode: MixingMode;
  onCopy: (value: string, label: string) => void;
  onSave: () => void;
}
export function ColorPreview({
  result,
  components,
  mode,
  onCopy,
  onSave,
}: Props) {
  const hex = rgbToHex(result);
  const rgb = formatRgb(result);
  const activeCount = components.filter(
    (component) => component.percentage > 0,
  ).length;
  return (
    <section className="preview-panel" aria-labelledby="preview-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">02 / OUTPUT</span>
          <h2 id="preview-heading">此刻的色彩</h2>
        </div>
        <span className="live-label">
          <span />
          实时预览
        </span>
      </div>
      <div
        className="result-swatch"
        style={{ backgroundColor: hex, color: contrastText(result) }}
        aria-label={`混合结果 ${hex}`}
      >
        <div className="swatch-topline">
          <span>THE MIX</span>
          <span>
            {mode.toUpperCase()} / {components.length} COLORS
          </span>
        </div>
        <div className="swatch-center">
          <span className="swatch-plus" aria-hidden="true">
            +
          </span>
          <p>创造属于你的颜色</p>
        </div>
        <div className="swatch-bottomline">
          <span>{hex}</span>
          <span>{colorName(result)}</span>
        </div>
      </div>
      <div className="output-card panel">
        <div className="output-title">
          <div>
            <p className="field-caption">
              混合结果 <span>COLOR VALUES</span>
            </p>
            <h3 className="result-hex">{hex}</h3>
          </div>
          <button
            type="button"
            className="copy-primary"
            onClick={() => onCopy(hex, "HEX")}
            aria-label="复制 HEX"
          >
            <Icon name="copy" />
            复制 HEX
          </button>
        </div>
        <dl className="result-values">
          <div>
            <dt>RGB</dt>
            <dd>{rgb}</dd>
            <button
              type="button"
              className="icon-button"
              onClick={() => onCopy(rgb, "RGB")}
              aria-label="复制 RGB"
              title="复制 RGB"
            >
              <Icon name="copy" size={16} />
            </button>
          </div>
          <div>
            <dt>HSL</dt>
            <dd>{formatHsl(result)}</dd>
            <button
              type="button"
              className="icon-button"
              onClick={() => onCopy(formatHsl(result), "HSL")}
              aria-label="复制 HSL"
              title="复制 HSL"
            >
              <Icon name="copy" size={16} />
            </button>
          </div>
        </dl>
        <div className="result-meta">
          <span>
            <Icon name={mode === "rgb" ? "sun" : "layers"} size={15} />
            {mixingModels[mode].label}
          </span>
          <span>
            {activeCount} / {components.length} 色参与混合
          </span>
        </div>
        <button
          type="button"
          className="primary-button save-recipe"
          onClick={onSave}
        >
          <Icon name="save" />
          保存当前配方
          <Icon name="arrow" size={17} />
        </button>
      </div>
      <div className="recipe-strip">
        <span className="eyebrow">YOUR PALETTE</span>
        <div>
          {components.length ? (
            components.map((component, index) => (
              <span
                key={component.id}
                style={{
                  backgroundColor: rgbToHex(component.color),
                  opacity: component.percentage === 0 ? 0.25 : 1,
                }}
                title={`${index + 1}. ${rgbToHex(component.color)} · ${component.percentage}%`}
              />
            ))
          ) : (
            <small>等待添加颜色</small>
          )}
        </div>
      </div>
    </section>
  );
}
