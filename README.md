# Bookmark Master Pro

Bookmark Master Pro 是一个面向 Chrome / Microsoft Edge 的 Manifest V3 本地优先书签管理插件。当前版本为 **v0.1.0**，聚焦 Phase 1：轻量 Popup、全屏 Dashboard、Options 设置中心、Background 统一任务框架、书签读取与本地搜索。

## 产品原则

批量与危险操作必须遵循：**先扫描 → 再预览 → 再快照 → 再确认 → 再执行 → 可恢复**。

Popup 只承担轻量入口和快速状态展示，不运行去重、检测、分类等重任务；完整管理能力集中在全屏 Dashboard。

## 当前文件结构

```text
bookmark-master-pro/
├── manifest.json
├── README.md
├── package.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── dashboard/
│   ├── dashboard.html
│   ├── dashboard.css
│   ├── dashboard.js
│   └── routes/
│       ├── overview.js
│       ├── search.js
│       ├── organize.js
│       ├── cleanup.js
│       ├── health.js
│       ├── reports.js
│       ├── safety.js
│       └── settings.js
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js
├── background/
│   ├── service-worker.js
│   ├── router.js
│   ├── task-manager.js
│   └── handlers/
│       ├── bookmarks-handler.js
│       ├── search-handler.js
│       ├── dedup-handler.js
│       ├── health-handler.js
│       ├── organize-handler.js
│       ├── snapshot-handler.js
│       ├── recycle-handler.js
│       ├── settings-handler.js
│       └── report-handler.js
├── lib/
│   ├── constants.js
│   ├── storage.js
│   ├── db.js
│   ├── bookmarks.js
│   ├── deduplicator.js
│   ├── classifier.js
│   ├── health-checker.js
│   ├── search.js
│   ├── ai-search.js
│   ├── report-generator.js
│   ├── url-utils.js
│   ├── permissions.js
│   └── logger.js
└── tests/
    ├── deduplicator.test.js
    ├── classifier.test.js
    ├── url-utils.test.js
    └── storage.test.js
```

## Phase 1 开发计划与落地范围

1. **基础壳层**：Manifest V3、Popup、Dashboard、Options、Background Service Worker。
2. **轻量 Popup**：展示总书签数、缓存问题数、最近任务状态、快速搜索入口、当前页面收藏/标题编辑入口。
3. **Dashboard 工作台**：固定左侧菜单，包括总览、搜索、整理、清理、检测、报告、安全与恢复、设置。
4. **核心数据能力**：使用 `chrome.bookmarks` 读取书签树，扁平化为可搜索数据；设置保存在 `chrome.storage.local`。
5. **后台任务系统**：统一 `TaskManager`，支持 create/start/pause/resume/stop/get/list/persist/restore，进度优先写入 `chrome.storage.session`，失败时回退 `chrome.storage.local`。
6. **基础测试**：覆盖 URL 标准化、去重分组、分类建议、存储封装。


### Phase 1.5 backlog

Phase 1.5 backlog tracks docs-first follow-up specs for CI, smoke testing, safety documentation, logger cleanup, and task UI refresh work. See [docs/phase-1.5/README.md](docs/phase-1.5/README.md).

To seed GitHub issues from the Phase 1.5 specs, run:

```bash
chmod +x scripts/seed-phase-1.5-issues.sh
./scripts/seed-phase-1.5-issues.sh
```

`gh auth login` is required before running the script locally. The script is idempotent and skips existing issues with matching titles.

## 功能说明

### Popup

- 插件 Logo 和名称。
- 书签总数、重复/失效/吃灰问题数量。
- 快速搜索：输入关键词后打开 Dashboard 搜索页。
- 当前页面快捷收藏；已收藏时支持编辑标题。
- 打开 Dashboard、打开设置。
- 后台任务状态入口。

### Dashboard

- **总览**：书签总数、文件夹数、重复/失效/吃灰数量、最近快照/检测时间、健康分、推荐动作卡片。
- **搜索**：本地关键词、标题、URL、文件夹、域名筛选与排序，结果卡片显示标题、URL、路径、域名、添加时间和快捷操作占位。
- **整理**：Phase 1 提供分类建议预览，不直接移动。
- **清理**：Phase 1 提供去重扫描预览，不直接删除。
- **检测**：Phase 1 提供统一任务创建、开始、暂停、继续、停止状态流。
- **报告**：Phase 1 提供健康分和热门域名基础报告。
- **安全与恢复**：支持手动创建 IndexedDB 快照与快照列表；恢复将在 Phase 2 完成三次确认流程。
- **设置**：基础体验、数据安全、检测与代理、AI 能力、权限与隐私说明。

## 安装与加载

### Chrome

1. 打开 `chrome://extensions/`。
2. 启用右上角「开发者模式」。
3. 点击「加载已解压的扩展程序」。
4. 选择本仓库根目录 `Bookmark_Master_Pro`。

### Microsoft Edge

1. 打开 `edge://extensions/`。
2. 启用「开发人员模式」。
3. 点击「加载解压缩的扩展」。
4. 选择本仓库根目录 `Bookmark_Master_Pro`。

## 权限与隐私

- `bookmarks`：读取和管理书签树，用于搜索、整理、移动、删除与恢复。
- `history`：识别低频访问/吃灰书签；不会上传浏览历史。
- `storage` / `unlimitedStorage`：本地保存设置、快照、检测结果、回收站和操作日志。
- `proxy`：可选权限，仅用于链接检测。代理会影响浏览器全局流量，因此后续阶段只会在检测期间临时启用，并在检测结束或中断时清理。
- `host_permissions` (`http://*/*`, `https://*/*`)：仅用于对书签 URL 执行健康检测。
- API Key 只存储在本地。默认不启用 AI。
- 不上传用户书签到第三方，除非用户主动启用 AI 搜索；启用前必须提示候选书签标题和 URL 将发送给所配置的 API Provider。

## 开发命令

```bash
npm test
npm run validate:manifest
```

本项目当前使用原生 JavaScript 模块，无远程后端依赖。

## 后续阶段规划

### Phase 2：清理与安全

- 去重删除执行流：自动快照、影响预览、二次确认、删除进回收站、恢复。
- 快照重命名、删除、恢复，恢复前三次确认。
- 危险操作日志。

### Phase 3：健康检测

- 全量/增量检测、单条/批量重测。
- 暂停/继续/停止和 Service Worker 重启恢复。
- 失败原因分类。
- 直连、系统代理、自定义代理检测；代理使用必须 finally 清理。

### Phase 4：整理与报告

- 智能分类、自定义规则、文件夹树预览、批量移动预览。
- HTML / Markdown / JSON 报告导出。

### Phase 5：AI 能力

- 可选 AI 语义搜索、API 配置、预算控制、隐私提示、结果解释。

## 版本记录

### v0.1.0

- Manifest V3 基础扩展结构。
- 轻量 Popup 与全屏 Dashboard。
- 书签树读取、本地搜索、总览指标。
- Options 与 Dashboard 设置页。
- 统一 TaskManager 后台任务状态。
- IndexedDB 快照基础能力。
- 核心库基础测试。
