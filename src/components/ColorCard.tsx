import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { hexToRgb, rgbToHex } from "../algorithms/colorConversion";
import type { Color, MixingComponent, MixingMode } from "../types/color";
import { colorName } from "../utils/presets";
import { ColorInput } from "./ColorInput";
import { Icon } from "./Icon";
interface Props {
  component: MixingComponent;
  index: number;
  mode: MixingMode;
  onColor: (id: string, color: Color) => void;
  onPercentage: (id: string, percentage: number) => void;
  onDelete: (id: string) => void;
}
export function ColorCard({
  component,
  index,
  mode,
  onColor,
  onPercentage,
  onDelete,
}: Props) {
  const { id, color, percentage } = component;
  const [amount, setAmount] = useState(String(percentage));
  useEffect(() => setAmount(String(percentage)), [percentage]);
  const invalid =
    amount.trim() === "" ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) < 0 ||
    Number(amount) > 100;
  const hex = rgbToHex(color);
  const label = mode === "rgb" ? "光源强度" : "光学密度权重";
  return (
    <article
      className="color-card"
      style={{ "--swatch": hex } as CSSProperties}
      aria-label={`颜色 ${index} 控制卡片`}
    >
      <div className="color-card-heading">
        <label className="color-picker" style={{ backgroundColor: hex }}>
          <input
            type="color"
            value={hex}
            aria-label={`选择颜色 ${index}`}
            onChange={(event) => {
              const next = hexToRgb(event.target.value);
              if (next) onColor(id, next);
            }}
          />
          <span className="picker-mark" aria-hidden="true">
            ↗
          </span>
        </label>
        <div className="color-title">
          <h3>{colorName(color)}</h3>
          <span>COLOR {String(index).padStart(2, "0")}</span>
        </div>
        <button
          type="button"
          className="icon-button delete-button"
          aria-label={`删除颜色 ${index}`}
          title="删除颜色"
          onClick={() => onDelete(id)}
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
      <ColorInput
        color={color}
        id={id}
        index={index}
        onChange={(next) => onColor(id, next)}
      />
      <div className="amount-heading">
        <label htmlFor={`${id}-range`}>{label}</label>
        <div className="amount-controls">
          <div className="percentage-field">
            <input
              aria-label={`颜色 ${index} 百分比`}
              type="number"
              min={0}
              max={100}
              step="any"
              inputMode="decimal"
              value={amount}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-amount-error` : undefined}
              onChange={(event) => {
                const value = event.target.value;
                setAmount(value);
                if (
                  value.trim() !== "" &&
                  Number.isFinite(Number(value)) &&
                  Number(value) >= 0 &&
                  Number(value) <= 100
                )
                  onPercentage(id, Number(value));
              }}
            />
            <span>%</span>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={`重置颜色 ${index} ${label}为 100%`}
            title="重置为 100%"
            onClick={() => {
              setAmount("100");
              onPercentage(id, 100);
            }}
          >
            <Icon name="reset" size={14} />
          </button>
        </div>
      </div>
      <input
        id={`${id}-range`}
        aria-label={`颜色 ${index} ${label}`}
        className="amount-slider"
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={percentage}
        style={{ "--progress": `${percentage}%` } as CSSProperties}
        onChange={(event) => {
          setAmount(event.target.value);
          onPercentage(id, Number(event.target.value));
        }}
      />
      <div className="slider-labels">
        <span>0%</span>
        <span>100%</span>
      </div>
      {invalid && (
        <p id={`${id}-amount-error`} className="input-error">
          请输入 0–100 的百分比。
        </p>
      )}
    </article>
  );
}
