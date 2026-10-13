import { rgbToHex } from "../algorithms/colorConversion";
import { mixingModels } from "../algorithms/models";
import type { SavedRecipe } from "../types/color";
import { Icon } from "./Icon";
export function HistoryPanel({
  history,
  onRestore,
  onDelete,
  onClear,
}: {
  history: SavedRecipe[];
  onRestore: (recipe: SavedRecipe) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="history-panel panel" aria-labelledby="history-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">03 / COLLECTION</span>
          <h2 id="history-heading">色彩收藏</h2>
        </div>
        <span className="count-badge">{history.length} / 50</span>
      </div>
      <div className="history-toolbar">
        <span>最近保存的配方</span>
        <button
          type="button"
          className="text-button"
          onClick={onClear}
          disabled={history.length === 0}
        >
          清空
        </button>
      </div>
      {history.length === 0 ? (
        <div className="empty-history">
          <div className="empty-swatch-stack" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h3>留住灵感的颜色</h3>
          <p>
            保存你喜欢的配方，
            <br />
            下次从这里继续探索。
          </p>
        </div>
      ) : (
        <ol className="history-list">
          {history.map((recipe) => {
            const hex = rgbToHex(recipe.result);
            return (
              <li key={recipe.id} className="history-item">
                <button
                  type="button"
                  className="restore-recipe"
                  onClick={() => onRestore(recipe)}
                  aria-label={`恢复配方 ${hex} ${mixingModels[recipe.mode].label}`}
                  title="点击恢复配方"
                >
                  <span
                    className="history-swatch"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="history-details">
                    <strong>{hex}</strong>
                    <small>
                      {recipe.mode.toUpperCase()} · {recipe.components.length}{" "}
                      色
                    </small>
                    <time dateTime={recipe.savedAt}>
                      {new Intl.DateTimeFormat("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }).format(new Date(recipe.savedAt))}
                    </time>
                  </span>
                  <Icon name="arrow" size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button delete-button"
                  onClick={() => onDelete(recipe.id)}
                  aria-label={`删除配方 ${hex}`}
                  title="删除配方"
                >
                  <Icon name="trash" size={15} />
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <p className="history-note">
        <Icon name="history" size={13} />
        自动保留最近 50 条，存储于此浏览器
      </p>
    </section>
  );
}
