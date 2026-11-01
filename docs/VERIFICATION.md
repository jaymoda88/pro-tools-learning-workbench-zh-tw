# 驗證紀錄

## v1.3 資源、版本與來源標記升級

目前已完成來源整理與程式整合的靜態檢查，**本版 CI、正式 Release 與 attestation 尚待確認**。此段不沿用 v1.2 的成功結果作為 v1.3 通過證據；後續應附上對應 commit、workflow 與發布驗證記錄。

| 項目 | 已整理或加入的範圍 | 本次尚待驗證 |
|---|---|---|
| 資源資料 | 124 筆整理紀錄去重為 123 筆；保留原研究日期、查核範圍與授權摘要。 | CI 的 JSON、URL 與關聯檢查；未逐一試看影片／課程。 |
| 學習路線 | 6 條路線、24 個實作檢核，以穩定 step ID 保存進度。 | 完成狀態、舊標題鍵遷移及匯出／匯入回歸。 |
| 版本導讀 | 11 個版本節點、25 項功能；來源為選讀的官方 PDF 與版本快照。 | 建置後資料／介面一致性與來源路由檢查。 |
| 新實作指南 | 新增 2026.4 錄音及混音／交付教學；原有 122 篇仍保留 2023.3 依據。 | 最終收錄數、章節連結與圖表解析。 |
| 新版 Mac 按鍵 | 35 筆對照 2026.4 的 Action、Mac 欄與條件；其餘 100 筆未改標為新版已驗證。 | 題庫切換、選項、錯題複習及持久化；未逐鍵實機測試。 |
| 搜尋與操作 | 全站搜尋納入資源與版本；練習頁提供翻卡與選擇題。 | DOM 回歸、注音選字與焦點；不等於實際排版通過。 |
| 網頁與列印署名 | 加入可見浮水印、文章來源及非商用提示。 | CI DOM 檢查及實際手機／桌面、列印可讀性。 |
| 長文複製 | 文章內單一選取超過 120 字元時附上純文字作者／來源；不改短字串、按鍵複製與包含程式碼／命令的選取。 | Clipboard fixture 與真實瀏覽器政策差異。 |
| PNG 標記 | Pixel 署名及 iTXt 作者／來源 hash；建置依賴 Pillow 13.0.0、Python 3.11+，CI 使用 3.12。 | 全部生成檔的標記／hash 檢查與最終視覺檢查。 |
| Release 完整性 | ZIP 外部 SHA-256 及包內逐檔 PROVENANCE.json；不對 manifest 自身做遞迴 hash。 | CI 封裝、逐檔比對及下載後的 checksum 核對。 |
| 簽署建置來源 | 預計使用 actions/attest@v4，為正式 Release ZIP 建立 GitHub Attestation。 | Workflow 簽署成功，以及 gh attestation verify 的實際結果。 |

來源查讀由 PDF 文字擷取與逐頁對照支持，並沒有把「網址可開啟」當作影片品質、完整授權或實機相容性的保證。先前獨立靜態審查發現的待複習跳題與進度鍵穩定性問題已納入修正範圍，仍須由本版回歸案例確認。

### v1.3 CI／發布證據

待補：本版生成物一致性、資料／DOM／Mermaid／權利標記測試、ZIP 與 manifest，以及正式 Release 的簽章驗證。未附成功紀錄前，不宣稱本版已通過上述執行驗證。

### 保護範圍

原創材料未授權商用，需作者書面許可；所學知識仍可用於讀者自己的工作。可見浮水印、PNG metadata、hash 與建置簽章不是 DRM，不證明著作權所有權，也不能阻止公開內容被複製、裁切或重寫。v1.2 等歷史原圖仍曾公開；詳見 [PROTECTION.md](PROTECTION.md)。


## v1.2 審查修正

已完成修正分支的 CI 整合驗證，實機畫面仍待驗收。此工作階段不執行 repository 的建置、check、smoke 或瀏覽器操作；本地僅讀取檔案、做 AST／JSON／JavaScript 語法解析與靜態比對。GitHub CI 的執行結果會另列，不與本地驗證混稱。

| 項目 | 本次變更與證據範圍 |
|---|---|
| 官方來源 | 目前分支與 main／三個 tags 的可達歷史已移除兩份 Avid PDF；建置與封裝拒絕 PDF。 |
| 舊 Release | 已唯讀檢查 v1.0.0 ZIP，確認包含兩份 Avid PDF；舊 ZIP 已刪除，Release 保留草稿。同樣含 PDF 的舊 Actions artifact 也已刪除。詳見 COPYRIGHT.md。 |
| 內容與索引 | Builder 收錄全部章節來源及 8 個 PT-00 索引，使用獨立 reference 路由與標題。 |
| 分篇目標 | 工作流程／功能使用明確筆記 ID；靜態核對章節前綴與來源相符。 |
| 搜尋 | 收斂故障詞同義詞；多詞採每詞一組條件，提供實際正文摘錄及另列用途標籤。 |
| 注音輸入 | input、Enter、全域快捷鍵具 composition／229 guard，新增 DOM 回歸案例。 |
| 前端載入 | 初始 HTML 僅載入 data.js 與 app.js；Mermaid、KaTeX 只在正文需要時載入。 |
| 圖表 | 失敗時顯示訊息與原始碼；切換主題重繪；CI 使用隨附套件解析圖表語法。 |
| 主題 | 首次使用跟隨系統，保留舊偏好相容；CSS color-scheme 隨主題更新。 |
| 圖片與語言 | alt 改為繁中章節概念描述。圖內英文功能名與標籤依原始筆記規格保留；內文與 alt 提供中文脈絡。 |
| 建置與維護 | src／public 為來源，兩個 dist 為產出；UTF-8、動態數量、生成檔差異檢查與 bytecode 忽略。 |
| 授權說明 | 新增保留權利的 LICENSE 與 COPYRIGHT.md，未代替作者選擇開源授權。 |

### CI 狀態

2026-11-01：[修正分支 CI 全部通過](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41236088325)。資料檢查確認 122 篇文章、8 頁索引、66 章、135 筆快捷鍵、103 個圖片引用、1,896 個文件連結與 1,424 個官方 PDF 連結；91 個 Mermaid 圖表皆經真正的 parser 接受。DOM 行為回歸、兩份生成網站一致性、提交檔案新鮮度及 ZIP／checksum 封裝均通過。`scripts/check.mjs` 只以 JSON 解析 data.js；`smoke.mjs` 在 jsdom 中執行應用並以替身測試 lazy-load 的控制流程；`check-diagrams.mjs` 使用真正的 Mermaid parser。這些檢查不能取代視覺驗收、完整 SVG 排版驗證或 Pro Tools 實機操作。

## 尚待實機驗收

| 環境 | 待確認 |
|---|---|
| 320px、390px 手機 | 橫向溢出、底部遮擋、觸控篩選與複製。 |
| 768px 平板 | 側欄比例、英文名稱換行、虛擬鍵盤。 |
| 1280px、1440px 桌面 | 長文行寬、篇內目錄、比較表與圖解。 |
| iOS／繁中 IME | safe-area、旋轉、實際注音選字與鍵盤顯示時的滾動。 |
| 鍵盤／讀屏 | 焦點呈現、200% zoom、表格讀取順序與 inert 的實際行為。 |
| Dark mode／圖表 | 視覺對比、字體、SVG／公式完整排版與局部捲動。 |
| Codespaces | 前景 npm start、重新開啟環境與連接埠預覽。 |

瀏覽器操作未執行，也未改用其他方式操作瀏覽器。先前 Site 部署沒有成功，過時 hosting 設定已移除；這次不宣稱已部署網站。

## 先前版本紀錄

v1.1.0 曾通過 Node.js、資料／連結檢查及有限 DOM fixture；其 fixture 未計算 CSS 或實際觸控。這些歷史結果不代表 v1.2 自動通過。來源快捷鍵未改寫，仍未宣稱 135 筆全部逐鍵實機驗證。

## 歷史清理核對

2026-11-01 經擁有者確認，改寫既有 9 筆 commit，更新 main 與三個版本 tags。隔離鏡像的全部可達物件中，沒有兩份 PDF 的路徑或 blob；清理前後目前版本的 tree 完全相同，後續僅更新清理說明與既有 tag 的發布防護。遠端 refs 與下載附件另經 API 核對。這不代表 GitHub 快取或他人 clone／fork 已清除。

清理後的 main CI 已通過：[驗證紀錄](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41236770017)。重新從遠端 clone 的全部可達物件皆無 PDF，v1.0.0 Release 已無附件，舊含 PDF 的 Actions artifact 已不存在。v1.2.0 ZIP 的服務端 digest 與先前靜態檢查一致。但 GitHub 舊 SHA 的 PDF metadata 仍可讀取，平台端快取／舊物件清除尚未完成。
