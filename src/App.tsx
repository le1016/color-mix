import { useEffect, useRef, useState } from "react";
import { ColorPreview } from "./components/ColorPreview";
import { HistoryPanel } from "./components/HistoryPanel";
import { Icon } from "./components/Icon";
import { MixingPanel } from "./components/MixingPanel";
import { ModelInfo } from "./components/ModelInfo";
import { useColorMixer } from "./hooks/useColorMixer";
import { copyText, downloadRecipe } from "./utils/browser";
import { createRecipe, parseRecipe } from "./utils/recipes";
import type { SavedRecipe } from "./types/color";

type Notice = { message: string; error: boolean };
export default function App() {
  const mixer = useColorMixer();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const clearDialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), notice.error ? 8000 : 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  function notify(message: string, error = false) {
    setNotice({ message, error });
  }
  async function copy(value: string, label: string) {
    try {
      await copyText(value);
      notify(`已复制 ${label}：${value}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "复制失败", true);
    }
  }
  function restore(recipe: SavedRecipe) {
    mixer.restoreRecipe(recipe);
    notify("已恢复配方，继续调色吧。");
  }
  async function importFile(file: File) {
    setImporting(true);
    try {
      if (file.size > 1024 * 1024) throw new Error("JSON 文件应小于 1 MB。");
      const recipe = parseRecipe(await file.text());
      mixer.restoreRecipe(recipe);
      notify("配方导入成功。可点击「保存当前配方」加入收藏。");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "导入失败，请检查文件。",
        true,
      );
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <a
            className="brand"
            href="#studio"
            aria-label="Color Mixing Studio 首页"
          >
            <span className="brand-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              Color Mixing <strong>Studio</strong>
              <small>让颜色相遇，让灵感发生。</small>
            </span>
          </a>
          <div className="header-actions">
            <span className="studio-badge">
              <span />
              本地调色工作室
            </span>
            <button
              type="button"
              className="button button-small"
              onClick={() => {
                mixer.resetMode();
                notify("当前模式已恢复默认配方。");
              }}
            >
              <Icon name="reset" size={15} />
              重置配方
            </button>
          </div>
        </div>
      </header>
      <main id="studio" className="studio-shell">
        <div className="intro">
          <div>
            <p className="eyebrow">A LITTLE EXPERIMENT. A NEW COLOR.</p>
            <h1>
              把色彩的可能，调出来<span>。</span>
            </h1>
            <p>选择颜色，调整比例，探索光与色的每一次相遇。</p>
          </div>
          <div className="intro-index">
            <span>COLOR LAB</span>
            <strong>
              001<span>—</span>
            </strong>
          </div>
        </div>
        {mixer.storageWarning && (
          <div className="storage-warning" role="alert">
            <Icon name="info" />
            <span>{mixer.storageWarning}</span>
            <button
              type="button"
              className="icon-button"
              aria-label="关闭存储提示"
              onClick={mixer.dismissStorageWarning}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        <div className="studio-grid">
          <MixingPanel
            mode={mixer.mode}
            components={mixer.components}
            onMode={mixer.setMode}
            onAdd={mixer.addColor}
            onColor={mixer.updateColor}
            onPercentage={mixer.updatePercentage}
            onDelete={mixer.deleteColor}
          />
          <ColorPreview
            result={mixer.result}
            components={mixer.components}
            mode={mixer.mode}
            onCopy={copy}
            onSave={() => {
              mixer.saveRecipe();
              notify("配方已加入色彩收藏。");
            }}
          />
          <aside className="side-panel">
            <HistoryPanel
              history={mixer.history}
              onRestore={restore}
              onDelete={mixer.deleteRecipe}
              onClear={() => {
                clearDialog.current?.showModal();
                cancelButton.current?.focus();
              }}
            />
            <ModelInfo mode={mixer.mode} />
            <section
              className="file-panel panel"
              aria-labelledby="file-heading"
            >
              <div className="info-title">
                <Icon name="download" size={17} />
                <h2 id="file-heading">带走你的配方</h2>
              </div>
              <p>以 JSON 保存原始颜色、比例与结果，随时回来继续创作。</p>
              <div className="file-buttons">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    downloadRecipe(createRecipe(mixer.mode, mixer.components));
                    notify("配方 JSON 已导出。");
                  }}
                >
                  <Icon name="download" size={16} />
                  导出 JSON
                </button>
                <button
                  type="button"
                  className="button"
                  disabled={importing}
                  onClick={() => fileInput.current?.click()}
                >
                  <Icon name="upload" size={16} />
                  {importing ? "正在导入…" : "导入 JSON"}
                </button>
              </div>
              <input
                ref={fileInput}
                className="sr-only"
                tabIndex={-1}
                type="file"
                accept=".json,application/json"
                aria-label="选择配方 JSON 文件"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importFile(file);
                }}
              />
            </section>
          </aside>
        </div>
        <footer className="app-footer">
          <span>
            Color Mixing Studio <span className="footer-dot">·</span>{" "}
            为好奇心而设计
          </span>
          <span>
            LINEAR LIGHT <span className="footer-dot">/</span> ALGORITHM V1.0.0
          </span>
        </footer>
      </main>
      <div
        className={`toast ${notice ? "visible" : ""} ${notice?.error ? "error" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <>
            <Icon name={notice.error ? "info" : "check"} size={18} />
            <span>{notice.message}</span>
            <button
              type="button"
              className="icon-button"
              aria-label="关闭消息"
              onClick={() => setNotice(null)}
            >
              <Icon name="close" size={16} />
            </button>
          </>
        )}
      </div>
      <dialog
        ref={clearDialog}
        className="confirmation-dialog"
        aria-labelledby="clear-title"
        aria-describedby="clear-description"
      >
        <div className="dialog-icon">
          <Icon name="trash" size={24} />
        </div>
        <h2 id="clear-title">清空色彩收藏？</h2>
        <p id="clear-description">
          将删除此浏览器中的 {mixer.history.length}{" "}
          条历史记录。当前调色配方会保留，此操作无法撤销。
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            ref={cancelButton}
            className="button"
            onClick={() => clearDialog.current?.close()}
          >
            保留收藏
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={() => {
              mixer.clearHistory();
              clearDialog.current?.close();
              notify("历史记录已清空。");
            }}
          >
            确认清空
          </button>
        </div>
      </dialog>
    </>
  );
}
