import { useEffect, useState } from "react";
import { hexToRgb, rgbToHex } from "../algorithms/colorConversion";
import type { Color } from "../types/color";
export function ColorInput({
  color,
  id,
  index,
  onChange,
}: {
  color: Color;
  id: string;
  index: number;
  onChange: (color: Color) => void;
}) {
  const [hex, setHex] = useState(rgbToHex(color));
  const [rgb, setRgb] = useState([
    String(color.r),
    String(color.g),
    String(color.b),
  ]);
  useEffect(() => {
    setHex(rgbToHex(color));
    setRgb([String(color.r), String(color.g), String(color.b)]);
  }, [color]);
  const hexError = !hexToRgb(hex);
  const rgbError = rgb.some(
    (value) =>
      value.trim() === "" ||
      !Number.isInteger(Number(value)) ||
      Number(value) < 0 ||
      Number(value) > 255,
  );
  function changeHex(value: string) {
    setHex(value);
    const parsed = hexToRgb(value);
    // Commit full HEX immediately; expand shorthand on blur for natural typing.
    if (parsed && value.trim().replace(/^#/, "").length === 6) onChange(parsed);
  }
  function changeRgb(channel: number, value: string) {
    const next = [...rgb];
    next[channel] = value;
    setRgb(next);
    if (
      next.every(
        (v) =>
          v.trim() !== "" &&
          Number.isInteger(Number(v)) &&
          Number(v) >= 0 &&
          Number(v) <= 255,
      )
    ) {
      onChange({ r: Number(next[0]), g: Number(next[1]), b: Number(next[2]) });
    }
  }
  return (
    <div className="color-values">
      <div className="hex-field">
        <label htmlFor={`${id}-hex`}>HEX</label>
        <input
          id={`${id}-hex`}
          aria-label={`颜色 ${index} HEX`}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          value={hex}
          aria-invalid={hexError}
          aria-describedby={hexError ? `${id}-hex-error` : undefined}
          onChange={(event) => changeHex(event.target.value)}
          onBlur={() => {
            const parsed = hexToRgb(hex);
            if (parsed) {
              setHex(rgbToHex(parsed));
              onChange(parsed);
            }
          }}
        />
      </div>
      <div className="rgb-fields">
        {["R", "G", "B"].map((channel, i) => (
          <div className="rgb-field" key={channel}>
            <label htmlFor={`${id}-${channel}`}>{channel}</label>
            <input
              id={`${id}-${channel}`}
              aria-label={`颜色 ${index} ${channel}`}
              type="number"
              min={0}
              max={255}
              step={1}
              inputMode="numeric"
              value={rgb[i]}
              aria-invalid={rgbError}
              aria-describedby={rgbError ? `${id}-rgb-error` : undefined}
              onChange={(event) => changeRgb(i, event.target.value)}
            />
          </div>
        ))}
      </div>
      {hexError && (
        <p id={`${id}-hex-error`} className="input-error">
          请输入 3 位或 6 位 HEX，如 #FF8800。
        </p>
      )}
      {rgbError && (
        <p id={`${id}-rgb-error`} className="input-error">
          RGB 必须是 0–255 的整数；结果保留上次有效值。
        </p>
      )}
    </div>
  );
}
