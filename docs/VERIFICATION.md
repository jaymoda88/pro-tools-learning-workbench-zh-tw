# 驗證紀錄

## v1.2 審查修正

目前為整合驗證階段。此工作階段不執行 repository 的建置、check、smoke 或瀏覽器操作；本地僅讀取檔案、做 AST／JSON／JavaScript 語法解析與靜態比對。GitHub CI 的執行結果會另列，不與本地驗證混稱。

| 項目 | 本次變更與證據範圍 |
|---|---|
| 官方來源 | 目前分支移除兩份 Avid PDF；建置與封裝拒絕 PDF。舊 Git 歷史仍保留。 |
| 舊 Release | 已唯讀檢查 v1.0.0 ZIP，確認包含兩份 Avid PDF；已轉為草稿暫停公開下載並保留附件，詳見 COPYRIGHT.md。 |
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

待本次整合版本完成 CI 後更新。`scripts/check.mjs` 只以 JSON 解析 data.js；`smoke.mjs` 在 jsdom 中執行應用並以替身測試 lazy-load 的控制流程；`check-diagrams.mjs` 使用真正的 Mermaid parser。這些檢查不能取代視覺驗收、完整 SVG 排版驗證或 Pro Tools 實機操作。

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
