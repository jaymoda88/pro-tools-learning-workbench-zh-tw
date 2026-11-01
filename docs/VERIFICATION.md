# 驗證紀錄


## v1.3.1 單檔 HTML 與 ZIP 雙格式

2026-11-01，commit `5a264f7d7e5cb005b6847aa46a3318bb964f4664` 的 [整合 CI 通過](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41311371095)。既有資料、圖表 parser、DOM 行為、權利標記、生成檔新鮮度與 ZIP 封裝驗證均保留；新增以下檢查：

| 項目 | 證據與範圍 |
|---|---|
| 單檔自足性 | 初始 script／stylesheet 不依賴外部檔；全部 66 張 PNG、60 個字型逐位元等於多檔來源。 |
| 離線 DOM | 以 `file://` URL 執行並拒絕資源網路請求；搜尋、資源／版本、按鍵表、練習、圖片與署名可用。 |
| 圖表與公式 | 真正 KaTeX 產生公式 DOM，真正 Mermaid parser 接受語法；SVG 繪製在此 fixture 用替身，不宣稱視覺驗收。 |
| 授權入口 | 頁內含原始 LICENSE、NOTICE、CITATION 與兩份第三方授權全文；展開入口不破壞當前路由。 |
| 格式互通 | 不修改原始 PT_DATA；多檔版不載入內嵌資產，兩種形式共用同一套教材與操作邏輯。 |
| 下載包 | CI 附件另外當資料讀取，核對雙格式 SHA-256、126 個內嵌二進位資產、ZIP 161 筆 manifest 與無 PDF。 |

| 檔案 | Bytes | SHA-256 |
|---|---:|---|
| `pro-tools-workbench-v1.3.1.html` | 16,952,928 | `a3e74d1bac41131b646bf42e507d73711d3baa1807410732cee5b7d3b8eb921a` |
| `pro-tools-workbench-v1.3.1.zip` | 7,712,594 | `358e6c5d7c5621506ba975bd883398baedd9b62439ef536498b919d401c6c31c` |

[v1.3.1 Release](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/releases/tag/v1.3.1) 已發布；[main CI](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41311622413) 與 [Release workflow](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41311713744) 均成功。下載正式 HTML／ZIP 後，確認與通過 CI 的兩份檔案逐位元組相同，並各自以下載的 `provenance.sigstore.json` 執行 `gh attestation verify --repo ... --bundle ... --format json` 成功。

兩種格式的簽署身分皆為 `.github/workflows/release.yml`、`refs/tags/v1.3.1`、commit `d3ddbdea966b3b0b8f5a6d848379ea5a02ee6742`，signed subject 的兩個 digest 亦分別與上表相同。11,744-byte provenance bundle 的 SHA-256 為 `11490d1cafb50c88a03427d9dc2ed3f3acc297d8e2eeeb06d94addf61501845a`。

實際手機／桌面、列印、瀏覽器儲存政策與 Pro Tools 操作仍待驗收；`file://` 各檔案的進度不保證自動共用，建議匯出／匯入。

## v1.3 資源、版本與來源標記升級

2026-11-01，commit `814ac5fb6141a537f31ec0757c37f7ced44bd23e` 的 [整合 CI 已全部通過](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41304614329)。本地只做讀檔、AST／JSON／JavaScript 語法解析與產物靜態比對，沒有在本機執行專案 build／check／smoke 或瀏覽器；以下執行測試發生於 GitHub Actions。

| 項目 | 通過的檢查 | 仍有的限制 |
|---|---|---|
| 內容與連結 | 122 篇章節、10 頁參考／實作、66 章、135 筆按鍵；1,912 個文件連結、1,434 個官方 PDF 連結及 103 個圖片引用。 | 基礎仍依 2023.3；未逐鍵實機測試。 |
| 資源與路線 | 123 筆去重資源、6 條路線／24 個檢核；來源對照、URL、關聯及穩定 step ID。 | 影片／課程未逐一試看；保留原研究紀錄。 |
| 版本與按鍵證據 | 11 個版本節點／25 項導讀、35 筆 2026.4 Mac 按鍵；資料與原始證據一致。 | 其餘 100 筆未標為新版已驗證。 |
| DOM 行為 | 全部文章／參考與資源詳細路由、篩選／IME、新舊版本串連、路線進度遷移、雙版本題庫、待複習順序及避免重複計分。 | jsdom 不計算 CSS 或真實裝置排版。 |
| 網頁署名與複製 | 12 個浮水印節點、移除後恢復、文章來源；長文加註、短字串／程式碼／輸入框／按鍵複製保留原生行為。 | 真實瀏覽器 Clipboard 與列印仍待驗收。 |
| 圖解與內容指紋 | 132 份內容指紋、66 張 PNG 的來源 hash、署名 metadata、尺寸、既有標記重建冪等性及兩份網站位元組一致。 | 未逐張人工檢視；已抽看 Ch01、Ch06、Ch13、Ch50 的 footer 成品，沒有覆蓋原圖。 |
| 圖表與生成檔 | 隨附 Mermaid 真正 parser 接受 91 張圖；21 個數學區塊保留，兩份網站各 158 檔；重建後 Git 差異為零。 | 不等於 SVG／公式完整視覺驗收。 |
| ZIP | CI 封裝成功；另將下載包當資料讀取，核對 162 檔、manifest 的 161 筆大小與 SHA-256、CRC、權利文件及無 PDF。 | 正式 tag Release 及下載後簽章亦已驗證，見下方證據。 |

### v1.3 CI／發布證據

CI 預備包為 `pro-tools-workbench-v1.3.0.zip`，7,712,023 bytes，SHA-256：

```text
3f3e455ee8037e7c86684d4fbf967497a79428c00d80ebdb6084ec3df097b18e
```

正式 [v1.3.0 Release](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/releases/tag/v1.3.0) 已發布；[main CI](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41304817995) 與 [Release workflow](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41304907494) 均成功。正式 ZIP 與上述預備包逐位元組相同，下載後再次核對全部 manifest、checksum 與無 PDF。

正式附件包含 ZIP、`SHA256SUMS.txt` 及 11,619-byte `provenance.sigstore.json`。先以 `gh attestation verify ZIP --repo jaymoda88/pro-tools-learning-workbench-zh-tw` 通過，再以下載的 bundle 配合 `--bundle ... --format json` 獨立驗證。核對結果：

| 簽署欄位 | 已驗證值 |
|---|---|
| Source repository | `jaymoda88/pro-tools-learning-workbench-zh-tw` |
| Source commit | `bce88ce596647ce22803a7182e623ada138f6dc8` |
| Source ref | `refs/tags/v1.3.0` |
| Workflow | `.github/workflows/release.yml` |
| Issuer | `https://token.actions.githubusercontent.com` |
| Subject SHA-256 | 與上方 ZIP checksum 完全相同 |

`provenance.sigstore.json` 的 SHA-256 為 `ff402a318f138f578a32b3918e27539005d9f88a32b471761888e2acc2424da8`。雜湊驗完整性，GitHub Attestation 另驗建置來源；兩者都不是所有權裁定或防複製機制。

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
