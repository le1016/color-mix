import type { MixingMode } from "../types/color";
import { Icon } from "./Icon";
export function ModeSelector({
  mode,
  onChange,
}: {
  mode: MixingMode;
  onChange: (mode: MixingMode) => void;
}) {
  return (
    <fieldset className="mode-selector">
      <legend className="field-caption">
        混色模型 <span>MIXING MODEL</span>
      </legend>
      <div className="mode-options">
        <label className={`mode-option ${mode === "rgb" ? "selected" : ""}`}>
          <input
            className="sr-only"
            type="radio"
            name="mixing-mode"
            value="rgb"
            checked={mode === "rgb"}
            onChange={() => onChange("rgb")}
          />
          <Icon name="sun" size={19} />
          <span>
            <strong>RGB 加色法</strong>
            <small>光的叠加</small>
          </span>
        </label>
        <label className={`mode-option ${mode === "cmy" ? "selected" : ""}`}>
          <input
            className="sr-only"
            type="radio"
            name="mixing-mode"
            value="cmy"
            checked={mode === "cmy"}
            onChange={() => onChange("cmy")}
          />
          <Icon name="layers" size={19} />
          <span>
            <strong>CMY 减色法</strong>
            <small>理想滤色片</small>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
