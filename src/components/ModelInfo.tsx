import type { MixingMode } from "../types/color";
import { Icon } from "./Icon";
export function ModelInfo({ mode }: { mode: MixingMode }) {
  return (
    <section className="model-info panel" aria-labelledby="model-heading">
      <div className="info-title">
        <Icon name="info" size={17} />
        <h2 id="model-heading">了解这次混色</h2>
      </div>
      {mode === "rgb" ? (
        <>
          <span className="model-tag">ADDITIVE / 加色法</span>
          <p>
            将颜色转换到线性光空间，再叠加各光源的强度。光越多，颜色越明亮。
          </p>
          <div className="model-example">
            <i style={{ backgroundColor: "#FF0000" }} />
            <span>+</span>
            <i style={{ backgroundColor: "#00FF00" }} />
            <span>=</span>
            <i style={{ backgroundColor: "#FFFF00" }} />
            <small>红光 + 绿光 = 黄光</small>
          </div>
          <details>
            <summary>算法与边界</summary>
            <p>
              在线性 RGB 中计算 Σ(T × 强度)，通道截断至 0–1，再编码为
              sRGB。无光源时为黑色；三原色全强度叠加为白色。
            </p>
          </details>
        </>
      ) : (
        <>
          <span className="model-tag">SUBTRACTIVE / 减色法</span>
          <p>
            从单位白光开始，让理想滤色片依次吸收光线。用量表示光学密度权重，不等同于颜料体积。
          </p>
          <div className="model-example">
            <i style={{ backgroundColor: "#00FFFF" }} />
            <span>+</span>
            <i style={{ backgroundColor: "#FFFF00" }} />
            <span>=</span>
            <i style={{ backgroundColor: "#00FF00" }} />
            <small>青 + 黄 = 绿</small>
          </div>
          <details>
            <summary>为什么少量纯色也会完全滤光？</summary>
            <p>
              模型计算 ∏Tᵢᵃᵢ。当通道透过率 T 为 0
              时，任何正权重都完全阻断该通道；权重为 0 则忽略滤色片。可用非零
              RGB 通道的自定义色观察连续变化。
            </p>
          </details>
        </>
      )}
      <p className="model-disclaimer">
        理论混色模型。真实颜料的光谱与散射行为，将在未来 Pigment Mixing
        模块中扩展。
      </p>
    </section>
  );
}
