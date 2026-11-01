# 單檔離線版

從 v1.3.1 起，Release 同時提供 ZIP 多檔版與 `pro-tools-workbench-v1.3.1.html` 單檔版。單檔版不需解壓，HTML 內含本套完整筆記、資源目錄、66 張水印 PNG，以及搜尋、互動圖表、Mermaid、KaTeX 和字型。原始第三方授權與 `LICENSE`、`NOTICE`、`CITATION` 內容也收在 HTML 的可展開區塊中。

影片、課程及 Avid 官方 PDF 仍以官方外部連結提供，須連線瀏覽；外站內容不包含在離線檔。單檔版與 ZIP／多檔版可能因 `file://` 儲存來源不同而使用不同的瀏覽器儲存空間，學習進度不保證自動共用。切換前請在舊版的設定匯出學習紀錄 JSON，再於新版匯入。

手機上的檔案預覽程式不一定允許 JavaScript。若預覽無法使用搜尋或互動功能，請將 HTML 下載到裝置並以瀏覽器開啟；不保證所有 iOS Files 或 Quick Look 預覽都支援完整互動。

ZIP 多檔版仍按需載入內容並保留獨立 PNG。這次發行只新增交付格式，不改網站圖形樣式或內容版本；v1.3.0 不會被覆蓋，其既有附件仍可使用。v1.3.1 提供 `pro-tools-workbench-v1.3.1.html`、`pro-tools-workbench-v1.3.1.zip`、`SHA256SUMS.txt`（列出兩種檔案）及 `provenance.sigstore.json`（簽署 HTML 與 ZIP）。

## 實際大小與驗證

| v1.3.1 格式 | 實際大小 |
|---|---:|
| 單檔 HTML | 16,952,928 bytes（16.95 MB） |
| 多檔資料夾 ZIP | 7,712,594 bytes（7.71 MB） |

MB 以 1,000,000 bytes 計算。單檔只收錄執行所需的套件，未收錄 ZIP 中未使用的 vendor 原始碼變體；功能、圖解與教材相同。

[整合 CI 已通過](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/actions/runs/41311371095)，包含兩種格式、PNG 與字型逐位元比對、完整授權、file URL 路由、搜尋、按鍵表與練習、真正的 KaTeX 公式 DOM 及 Mermaid parser。單檔測試禁止任何網路資源載入；Mermaid SVG 繪製採替身，沒有把 jsdom 當成實際瀏覽器畫面驗收。正式 Release 的簽章與下載核對另見 [驗證紀錄](VERIFICATION.md)；手機、桌面及列印的實際畫面仍待驗收。

## 核對正式檔案

正式 HTML 與 ZIP 均已完成下載後的 checksum 與 GitHub Attestation 驗證，簽章指向 `refs/tags/v1.3.1`。可自行使用 GitHub CLI 核對：

```sh
gh attestation verify pro-tools-workbench-v1.3.1.html -R jaymoda88/pro-tools-learning-workbench-zh-tw
gh attestation verify pro-tools-workbench-v1.3.1.zip -R jaymoda88/pro-tools-learning-workbench-zh-tw
```

簽章用於核對來源與檔案指紋，不是防複製或所有權裁定。
