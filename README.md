# Pro Tools 工作台

以工作任務為入口的 Pro Tools 2023.3 繁體中文互動知識庫：搜尋中文問題、查 Mac 快捷鍵，或按錄音、剪輯與混音流程找到對應分篇。

**整理與製作：許惟傑 Xue_hwcxx** · [GitHub @jaymoda88](https://github.com/jaymoda88)

原本的 [Obsidian 筆記倉庫](https://github.com/jaymoda88/pro-tools-2023.3-zh-tw-notes) 保留；這個 repo 提供獨立網站介面。

## v1.2 更新

| 項目 | 改善 |
|---|---|
| 內容閱讀 | 連結改成可讀標題，移除網站中的 tag 與外掛查詢殘留，來源 PDF 連結指向 Avid 官網。 |
| 索引 | 功能目錄、快速檢索、術語對照、原文疑義等 8 頁有獨立入口，可全文搜尋。 |
| 分篇導覽 | 工作流程、Bus、Send、Freeze 與 Monitoring 指向明確分篇。 |
| 搜尋與輸入 | 收斂「沒有聲音」「卡音」結果，支援「修音 人聲」，顯示命中摘錄，保護注音選字期間的焦點。 |
| 載入與主題 | 圖表與公式套件按需載入；首次跟隨系統主題，切換主題會重繪圖表。 |
| 維護 | 原始碼、靜態資源與生成網站分開；CI 比對生成檔、驗證 Mermaid 語法，再封裝 Release。 |

手機保留底部導覽、主要控制至少 44px 操作區與快捷鍵卡片；桌面提供側欄、正文與篇內目錄。設計參考見 [響應式設計規格](docs/RESPONSIVE-DESIGN.md)。

## 下載與使用

從 [最新 Release](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/releases/latest) 的 **Assets** 下載版本化網站 ZIP，解壓後開啟 `index.html`。`SHA256SUMS.txt` 提供下載校驗值。文章、搜尋、Mac 快捷鍵及原創圖解包含在包內；查閱 Avid 官方 PDF 需連線。

也可以下載 repository 後開啟 `dist/index.html`。若瀏覽器限制本機圖表，安裝 Node.js 20 以上並在 repo 執行：

```sh
npm start
```

開啟 `http://127.0.0.1:4173`。

[在 Codespaces 開啟](https://codespaces.new/jaymoda88/pro-tools-learning-workbench-zh-tw?quickstart=1)後，從 Ports 面板開啟 **4173 / Pro Tools 工作台**；未啟動時可在終端機執行 `npm start`。Codespaces 的實際啟動流程仍待驗收。

## 使用入口

| 需求 | 入口 |
|---|---|
| 不知道功能名稱 | 首頁任務、工作流程 |
| 已知問題或功能 | 全文搜尋；⌘K／Ctrl K |
| 系統性學習 | 八大主題、分篇、已讀進度 |
| 找功能與英文術語 | 功能與術語索引、快速檢索 |
| 查原文矛盾與版本條件 | 原文疑義頁及來源頁碼 |
| 查 Mac 按鍵 | 情境、modifier、字母及關鍵字篩選 |
| 回到常用文章 | 收藏、最近閱讀 |
| 搞懂功能差異 | 訊號路由、Commit／Freeze／Bounce 比較 |
| 換裝置接續 | 匯出／匯入學習紀錄 JSON |

收藏、進度與偏好留在目前瀏覽器，不會自動同步至 GitHub。目前未啟用 GitHub Pages；Release 是下載包，不代表已部署公開網站。

## 維護與 GitHub 流程

修改 `content/`、`src/` 或 `public/` 後，使用 Python 3.10+ 與 Node.js 20+：

```sh
npm ci --ignore-scripts
npm run build
npm run check
npm run package
```

建置只使用 Python 標準函式庫及已收錄的 markdown2，不需要另外安裝 Python 套件。jsdom 僅用於開發與 CI 驗證，網站執行時不會下載它。

| 路徑／功能 | 用途 |
|---|---|
| `content/` | 教學筆記與索引的內容來源。 |
| `src/` | 手寫 HTML、JavaScript、CSS。 |
| `public/` | 原創圖解與本地第三方前端套件。 |
| `dist/`、`site-dist/` | 自動生成的相同網站，不直接編輯。 |
| `scripts/build_data.py` | 轉換內容、連結與索引。 |
| `scripts/build_site.py` | 生成兩份網站並排除來源 PDF。 |
| `scripts/check.mjs` | 以 JSON 解析資料、核對來源覆蓋、連結與欄位。 |
| `scripts/smoke.mjs` | DOM 行為回歸檢查；不能證明實際畫面。 |
| `scripts/check-diagrams.mjs` | 使用隨網站收錄的 Mermaid 解析器檢查圖表。 |
| `scripts/package_release.py` | 生成固定 metadata 的 ZIP 與校驗檔。 |
| Actions | 重建、測試，並檢查提交的生成檔是否過期。 |
| 版本 tag | 通過相同驗證後自動建立含 ZIP 與 checksum 的 Release。 |
| Issues／PR | 提交內容更正或功能建議，再審查變更。 |

## 來源、權利與驗證範圍

內容對應 **2023.3**：66 章整理為 122 篇教學筆記、66 張原創圖解，以及 135 筆 Mac 快捷鍵。來源頁碼與軟體功能以該版文件為準，不推定新版行為。

- [Reference Guide 2023.3](https://resources.avid.com/SupportFiles/PT/Pro_Tools_Reference_Guide_2023.3.pdf)
- [Shortcuts Guide 2023.3](https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2023.3.pdf)
- [來源與權利範圍、歷史副本待處理事項](docs/COPYRIGHT.md)
- [已驗證與待驗收項目](docs/VERIFICATION.md)

本專案尚未選定開源／開放內容授權，原創部分目前保留權利；第三方套件保留原授權。原書 PDF 已從目前分支及新版封裝排除；這不會清除先前 Git 歷史與既有下載副本。快捷鍵資料核對、DOM 測試與 Mermaid 語法檢查，也不代表逐鍵實機測試或手機／桌面視覺驗收完成。
