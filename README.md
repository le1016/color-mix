# Color Mixing Studio

简体中文的交互调色工作室。采用 React、TypeScript、Vite、CSS 和 Vitest，纯前端运行，无后端、数据库、外部字体或网络 API。

[在线调色](https://le1016.github.io/color-mix/) · [GitHub 仓库](https://github.com/le1016/color-mix)

## 本地运行

推荐 Node.js 24 LTS（也支持 22.12+ 的 22.x，以及 26+），npm。已提供 package-lock.json。

```powershell
git clone https://github.com/le1016/color-mix.git
cd color-mix
npm ci
npm run dev
```

打开终端显示的本地网址，通常是 http://localhost:5173。不要直接双击 index.html，开发模式由 Vite 提供模块服务。

```powershell
npm run test        # Vitest 单元测试
npm run test:watch  # 开发时监听测试
npm run typecheck   # 严格检查应用、配置和测试的 TypeScript 类型
npm run build      # 生产构建，输出到 dist/
npm run preview    # 本地查看生产构建，通常为 http://localhost:4173
```

dist/ 可由任何静态 HTTP 服务托管。首次安装需要访问 npm，应用运行期间无需网络 API。

## GitHub Pages 发布

项目已提供 `.github/workflows/pages.yml`。推送到 `main` 后会自动安装依赖、执行测试、检查类型、构建静态页面，再发布至 GitHub Pages；Pull Request 只执行验证。

首次发布时，在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**，然后在 Actions 页面执行该工作流或再次推送提交。实际网站地址以工作流的 deployment 输出为准。

`vite.config.ts` 的 `base: "./"` 使构建资源路径相对于页面，可用于仓库子路径。上传源码时排除 `node_modules`、`dist` 与本地环境文件，保留 `package-lock.json`。

参考：[Vite GitHub Pages 部署说明](https://vite.dev/guide/static-deploy#github-pages)、[Vite 相对路径构建](https://vite.dev/guide/build#relative-base)。

## 功能

- RGB 加色法与 CMY 减色法，切换即时生效，各自保留颜色列表和百分比；刷新恢复上次选择。
- 原生颜色选择器、HEX 输入、RGB 通道输入、八种预设色。添加颜色不设数量上限，已验证同时混合 10 色。
- 每色独立的 0–100% 滑块、数字输入和恢复至 100% 按钮；顶部重置只恢复当前模式的默认配方。
- 大面积实时预览、HEX / RGB / HSL、总颜色数量与实际参与混合数量、当前模式。支持复制三种格式。
- 保存、恢复和删除配方，保留最近 50 条历史。清空历史使用确认对话框，支持取消和 Escape。
- localStorage 持久化当前模式、两个调色列表及历史；损坏数据和存储失败提供提示。
- JSON 导入导出，保存原始 RGB 颜色、百分比、模式、结果、时间、数据格式版本与算法版本。
- 桌面三栏、平板两栏、手机单列；键盘操作、可见焦点、输入错误关联、消息播报和减弱动画设置。

HEX 支持带或不带 # 的六位格式，输入完整合法值后立即计算；三位缩写在离开输入框时展开。RGB 只接受 0–255 的整数，百分比接受 0–100 的有限数值。无效输入保留上次有效计算值，不会产生 NaN。

## 物理模型与边界

### RGB：线性光相加

先将归一化 sRGB 通道解码为线性 RGB，再计算 clamp(Σ(linearRGB × percentage / 100), 0, 1)，最后编码回 sRGB 并四舍五入为 8-bit 整数。不除以总强度，也不对 8-bit RGB 做平均。

红 + 绿 = 黄，红 + 蓝 = 品红，绿 + 蓝 = 青，三个光源全强度 = 白；无光源或全部为零 = 黑。红色 50% 的输出为 #BC0000（188），而非 #800000。

### CMY：理想滤色片透过率

以单位白光为背景，将每个输入的线性 RGB 通道看作透过率 T，计算 ∏(Tᵢ ^ amountᵢ)，其中 amount = percentage / 100，再编码回 sRGB。零用量滤色片直接跳过，包括 T = 0 的情况，避免 0^0。

青 + 黄 = 绿，青 + 品红 = 蓝，品红 + 黄 = 红，三个理想滤色片 = 黑；无滤色片或用量全部为零 = 白。

百分比代表简化模型的光学密度权重，不等同于实际颜料体积。纯色某通道 T 为 0 时，任何正用量都会完全吸收该通道，所以从 0% 到正用量可能发生跳变，这是当前理想模型的特性。使用非零通道的自定义颜色，可观察连续的密度变化。

真实颜料的光谱反射、吸收和散射尚未实现；CMY 不标注为真实颜料模型。

## JSON 配方与本地存储

参考 example-rgb-yellow.json 与 example-cmy-green.json，可直接通过界面导入。

| 字段 | 含义 |
| --- | --- |
| schemaVersion | 配方数据格式，当前 1 |
| algorithmVersion | 算法版本，当前 1.0.0 |
| id | 非空配方 ID |
| mode | rgb 或 cmy |
| components | 含唯一 id、color: {r,g,b}、percentage 的数组 |
| result | 混合结果 RGB；导入时重新计算并核对 |
| savedAt | ISO 日期时间 |

导入最大 1 MB，校验对象/数组结构、ID、模式、版本、RGB 整数范围、百分比范围、时间与结果一致性。完整校验成功后才替换相应模式的调色列表，失败不改动配方。导入后可点击保存，将其加入收藏。空颜色数组合法。

数据保存键为 color-mixing-studio:session:v1 和 color-mixing-studio:history:v1。数据按浏览器及访问源隔离；localhost 与 127.0.0.1、不同端口分别存储。导出 JSON 可用于跨浏览器和地址迁移。

## 代码结构与扩展

```text
src/
  algorithms/
    colorConversion.ts   HEX / RGB / HSL 和 sRGB 传递函数
    additive.ts          独立线性光加色算法
    subtractive.ts       独立理想透过率减色算法
    models.ts            统一 MixingModel 注册和版本
    pigment.ts           未来光谱颜料模型的类型契约
  components/
    ModeSelector.tsx     模式选择
    ColorInput.tsx       颜色输入与验证
    ColorCard.tsx        颜色卡片、强度与删除
    MixingPanel.tsx      预设与颜色列表
    ColorPreview.tsx     结果、复制、保存
    HistoryPanel.tsx     历史列表与恢复
    ModelInfo.tsx        模型说明
    Icon.tsx             轻量 SVG 图标
  hooks/useColorMixer.ts 模式、配方及历史状态
  types/color.ts         统一数据类型
  utils/
    presets.ts           预设与默认配方
    recipes.ts           快照、JSON 序列化与严格校验
    storage.ts           本地持久化与恢复
    browser.ts           文件导出与剪贴板
  App.tsx / main.tsx / index.css
tests/
  additive.test.ts / subtractive.test.ts / colorConversion.test.ts
  recipes.test.ts / storage.test.ts
```

算法及数据校验不依赖 React，可单独测试和替换。pigment.ts 预留颜料反射率、吸收/散射数据、浓度、比例、厚度与 D65 照明输入。后续 Kubelka–Munk 模型应通过光谱 → XYZ → sRGB 管线实现，并增加新的算法版本和数据迁移。后续 Canvas 色轮与渐变可作为独立组件加入，不影响核心算法；第一阶段使用原生色选器与 CSS 预览。

## 验证

2026-10-13：5 个测试文件，64 项 Vitest 测试通过；严格 TypeScript 检查和 Vite 生产构建通过。测试覆盖全部标准混色、半强度与分数密度、空配方、截断、零透过率、转换边界、非法 JSON、配方快照、本地恢复与最近 50 条限制。

浏览器验证覆盖实时输入、滑块、非法 HEX/RGB 输入、两模式配方保留、10 色混合、删除、历史恢复与刷新、取消清空、复制 HEX/RGB、JSON 导出、往返导入与错误文件提示。响应式截图与最后检查结果见 VERIFICATION.md。
