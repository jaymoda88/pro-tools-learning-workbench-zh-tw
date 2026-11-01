# Pro Tools 工作台

以工作任務為入口的繁體中文 Pro Tools 學習工作台：讀觀念、找資源、比對版本，並把常用 Mac 按鍵練成操作習慣。

**整理與製作：許惟傑 Xue_hwcxx** · [GitHub @jaymoda88](https://github.com/jaymoda88)

原本的 [Obsidian 筆記倉庫](https://github.com/jaymoda88/pro-tools-2023.3-zh-tw-notes) 保留。這個 repo 提供獨立網站；各篇標示自己的來源版本，不把舊教學一律改標成新版。

## v1.3 升級

| 入口 | 內容與使用方式 |
|---|---|
| 學習資源 | 124 筆整理紀錄去除重複後得到 123 筆資源，依語言、類型、費用、程度與主題篩選。 |
| 實作路線 | 6 條路線、24 個實作檢核，把基礎筆記、影片／文件與自己的 Session 串起來。完成紀錄使用穩定 step ID 保存。 |
| 版本差異 | 11 個版本節點、25 項功能導讀，附適用條件、練習與官方來源頁碼，涵蓋 2023.6 至 2026.4.1。 |
| 2026.4 實作指南 | 新增錄音，以及混音／交付的實作指南；各自說明來源版本及與既有筆記的關係。 |
| Mac 按鍵練習 | 翻卡、選擇測驗、待複習題庫；可用 2023.3 全部 135 筆，或 2026.4 已對照原文的 35 筆子集。 |
| 全站搜尋 | 同時搜尋筆記、索引、學習資源與版本功能，直接進入對應頁。 |
| 署名與來源 | 網頁／列印署名、圖解像素標記、複製長文來源、Release 檔案指紋及發布來源驗證。詳見 [保護機制](docs/PROTECTION.md)。 |

**版本範圍：**原有 122 篇教學與 135 筆快捷鍵仍以 2023.3 為基準。2026.4 快捷鍵另核對了 35 筆，其餘 100 筆未標成新版已驗證；文件比對也不等於逐鍵實機測試。資源的查核欄沿用 2026-11-01 的原整理紀錄，影片、課程與素材授權未逐一重新試用或審核。

閱讀既有章節時，可接到相關新版功能及 2026.4 實作指南；新版導讀也連回對應的基礎觀念，並各自保留來源版本。

手機提供底部導覽、主要控制至少 44px 操作區與單欄／卡片布局；桌面保留側欄、正文與篇內目錄。實際畫面驗收狀態見 [VERIFICATION.md](docs/VERIFICATION.md)。

## 下載與使用

從 [最新 Release](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/releases/latest) 的 **Assets** 下載版本化網站 ZIP，解壓後開啟 `index.html`。教學、搜尋、練習與原創圖解包含在包內；影片、課程及官方 PDF 需連線查閱。

`SHA256SUMS.txt` 可核對整個 ZIP；包內 `PROVENANCE.json` 列出其他檔案的 SHA-256。正式 Release 的 GitHub Attestation 完成後，可依 [保護機制文件](docs/PROTECTION.md)核對發布來源。雜湊與簽章不會限制檔案被複製。

也可以下載 repository 後開啟 `dist/index.html`。若瀏覽器限制本機圖表，安裝 Node.js 20 以上，在 repo 執行：

```sh
npm start
```

開啟 `http://127.0.0.1:4173`。

[在 Codespaces 開啟](https://codespaces.new/jaymoda88/pro-tools-learning-workbench-zh-tw?quickstart=1)後，從 Ports 面板開啟 **4173 / Pro Tools 工作台**。Codespaces 的實際啟動流程仍待驗收。

## 怎麼找內容

| 需求 | 入口 |
|---|---|
| 從零錄一段聲音 | 首頁任務、第一個 Session 學習路線、錄音實作指南 |
| 找繁中影片或練習素材 | 學習資源：語言／類型／程度篩選 |
| 跟上新版 | 版本差異；功能條目會連回可先學的 2023.3 觀念 |
| 熟悉快捷鍵 | 先查按鍵表，再到翻卡或測驗；必要條件與文件版本一起學 |
| 找英文功能名或原文疑義 | 全站搜尋、術語索引與原文疑義頁 |
| 整理一條操作流程 | 6 條學習路線及各步檢核 |
| 換裝置接續 | 設定中的學習紀錄 JSON 匯出／匯入 |

收藏、已讀、路線進度與練習紀錄保存在目前瀏覽器，不會自動同步至 GitHub。目前未啟用 GitHub Pages；Release 是下載包，不表示網站已部署到公開網址。

## 維護與 GitHub 流程

修改 `content/`、`src/` 或 `public/` 後，使用 **Python 3.11+** 與 **Node.js 20+**。PNG 署名建置需要 `Pillow==13.0.0`；CI 使用 Python 3.12。建置已不是零 Python 套件依賴。

macOS／Linux 可建立獨立環境後執行：

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-build.txt
npm ci --ignore-scripts
npm run build
npm run check
npm run package
```

Windows 請使用對應的虛擬環境啟用方式。jsdom 僅用於開發與 CI 驗證，網站執行時不會下載它。

| 路徑／功能 | 用途 |
|---|---|
| `content/` | 教學、索引、資源、版本導讀及快捷鍵證據。 |
| `src/` | 手寫介面與署名／來源標記。 |
| `public/` | 原創圖解及本地第三方前端套件。 |
| `dist/`、`site-dist/` | 自動生成的網站，請勿直接編輯。 |
| `scripts/build_data.py` | 生成內容與索引；載入學習資料。 |
| `scripts/protect_assets.py` | 為圖解產生像素署名及 PNG 來源 metadata。 |
| `scripts/build_site.py` | 生成兩份網站並排除來源 PDF。 |
| `scripts/check*.mjs`、`scripts/smoke.mjs` | 資料、權利標記、Mermaid 與 DOM 行為檢查。 |
| `scripts/package_release.py` | 生成 ZIP、逐檔 manifest 與外部校驗檔。 |
| Actions／版本 tag | 重建、檢查生成檔是否過期、封裝與發布；正式 tag Release 預計建立來源簽章。 |
| Issues／PR | 提交內容更正或功能建議，再審查變更。 |

## 來源與使用範圍

原有基礎教材涵蓋 66 章、122 篇教學、66 張原創圖解與 135 筆 Mac 快捷鍵。新版補充、版本條件與 35 筆快捷鍵證據分開維護。

- [資源來源與查核限制](docs/RESOURCES.md)
- [版本差異與原文範圍](docs/VERSION-BRIDGE.md)
- [快捷鍵版本證據](docs/SHORTCUT-VERSIONS.md)
- [署名、非商用與發布驗證](docs/PROTECTION.md)
- [來源文件、歷史清理與平台快取限制](docs/COPYRIGHT.md)
- [驗證結果與待驗收項目](docs/VERIFICATION.md)

原創程式、教學解說、編排與自繪圖解保留所有權利；商業再利用、轉售或整合為付費內容服務，須先取得作者書面同意，詳見 [LICENSE](LICENSE)。這不禁止讀者將學會的知識用在自己的創作或專業工作。第三方文件、工具與資源保留各自權利。

浮水印不是 DRM。公開內容仍能被複製、截圖或重寫，metadata 與浮水印也可能被移除；v1.2 等歷史版本的原圖仍曾公開。來源指紋與簽章可協助核對發布來源，但不證明所有權，也不承諾阻止未授權使用。
