# 開發與維護

一般讀者可直接使用 [Release](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/releases/latest)，操作方式見 [使用指南](USAGE.md)。本文件適用修改教材、介面或封裝流程的維護者。

## 環境與安裝

| 相依項目 | 用途與版本 |
|---|---|
| Node.js | 20 以上；CI 使用 22。提供本機伺服器、資料／DOM 檢查。 |
| Python | 3.11 以上；CI 使用 3.12。負責內容建置、圖解署名與封裝。 |
| Pillow | `requirements-build.txt` 固定為 13.0.0，僅用於建置時處理 PNG。 |
| jsdom | `package-lock.json` 固定版本；僅供開發與 CI 的 DOM 檢查。 |

markdown2 已收錄於 `scripts/vendor/`。網站執行時使用隨附 Mermaid／KaTeX，不需從 CDN 下載程式；元件與授權見 [第三方說明](THIRD_PARTY.md)。

以下指令在 repo 根目錄執行，適用 macOS／Linux：

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-build.txt
npm ci --ignore-scripts
```

Windows 需使用對應的虛擬環境啟用方式，並確保 npm scripts 使用的 `python3` 命令可用。跨平台與實機驗證範圍以 [VERIFICATION.md](VERIFICATION.md) 為準。

## 本機預覽、建置與封裝

| 指令 | 行為 |
|---|---|
| `npm start` | 提供既有 `dist/`，開啟 `http://127.0.0.1:4173`。不會自動重建。 |
| `npm run build` | 依 `content/` 生成資料，再由 `src/`、`public/` 建置相同的 `dist/` 與 `site-dist/`。 |
| `npm run check` | 檢查資料／引用、學習資料、署名與指紋、DOM 行為、Mermaid 語法及兩份生成網站一致性。 |
| `npm run package` | 依 package 版本產生資料夾 ZIP、單檔 HTML 與 `SHA256SUMS.txt`。 |
| `npm run check:single` | 檢查已封裝的單檔 HTML；需先執行 package。 |

修改內容或介面後，完整驗證順序為：

```sh
npm run build
npm run check
npm run package
npm run check:single
```

生成檔應隨來源一起提交。CI 會重新建置並用 Git 差異及未追蹤檔案檢查 `dist/`、`site-dist/` 是否過期；只修改手寫來源而漏提交產出會失敗。

DOM 測試不計算真實裝置排版。單檔測試使用真正 KaTeX 及 Mermaid parser，SVG 繪製則採替身；不能把它們當作手機、桌面、列印或 Pro Tools 實機測試。

## 目錄與程式分工

| 路徑 | 用途 |
|---|---|
| `content/` | 章節、索引與實作 Markdown，以及資源、版本導讀、快捷鍵證據 JSON。 |
| `src/` | 手寫 HTML、CSS、應用與署名模組。 |
| `public/assets/` | 原創 PNG；已標記的檔案會原樣複製，避免重複增加 footer。 |
| `public/vendor/` | 隨網站分發的前端套件、字型與授權文件。 |
| `dist/`、`site-dist/` | 同一份來源生成的相同網站；不直接手改。 |
| `scripts/build_data.py` | 將內容轉為網站資料、連結與索引；匯入資源目錄。 |
| `scripts/build_resources.py` | 驗證並載入資源與學習路線。 |
| `scripts/protect_assets.py` | 為新圖解加入底部署名與 PNG 來源 metadata。 |
| `scripts/build_site.py` | 組裝網站、排除 PDF、正規化檔案權限與驗證產出。 |
| `scripts/build_single_file.py` | 將網站執行期資產組成單檔 HTML，保留內嵌授權全文。 |
| `scripts/package_release.py` | 生成可重現 ZIP、逐檔 manifest、HTML 與外部 checksum。 |
| `scripts/check*.mjs`、`scripts/smoke.mjs` | 資料、連結、來源指紋、離線資產與 DOM 回歸。 |
| `docs/` | 使用、設計、來源、維護、驗證與各版發布說明。 |
| `.github/workflows/` | 檢查、生成檔差異、封裝、簽署與發布。 |

新增內容須保留明確來源版本，不把基礎教材整批改標為新版。學習路線 step ID 與筆記 ID 應保持穩定，以免破壞連結或學習紀錄。頁碼與按鍵條件依各版本來源核對，詳見 [版本依據](VERSION-BRIDGE.md) 與 [快捷鍵證據](SHORTCUT-VERSIONS.md)。

## GitHub Actions 與 Release

一般 CI 會重建、驗證既有應用與單檔版，並上傳網站封裝及生成網站的 review artifact。`npm run package` 本身不產生 GitHub 簽章。

正式發布前，須同步 `package.json`、`package-lock.json` 與 `CITATION.cff` 的版本，準備 `docs/releases/vX.Y.Z.md`，通過檢查後再建立相符的新版本 tag。Release workflow 只在新 tag 建立時執行，並核對 tag 與 package 版本。

| 正式附件 | 來源 |
|---|---|
| `pro-tools-workbench-vX.Y.Z.html` | 單檔網站。 |
| `pro-tools-workbench-vX.Y.Z.zip` | 多檔網站、LICENSE、CITATION 與逐檔 PROVENANCE manifest。 |
| `SHA256SUMS.txt` | 同時列出 HTML 與 ZIP 的 SHA-256。 |
| `provenance.sigstore.json` | Release workflow 用 GitHub Artifact Attestation 簽署兩種格式後保存的 bundle。 |

正式 workflow 會各自驗證 HTML 與 ZIP 的 attestation，再建立 Release。下載核對與 signed repo／tag／commit／digest 證據見 [驗證紀錄](VERIFICATION.md)；簽章及浮水印的作用與限制見 [PROTECTION.md](PROTECTION.md)。

## Codespaces

Repo 包含 `.devcontainer/devcontainer.json`，設定 Node.js 22 容器與 4173 轉發埠；`postCreateCommand` 執行 build／check，`postStartCommand` 執行 `npm start`。

目前設定未明列完整的 Python／Pillow 與 npm 相依套件安裝步驟，首次建立可能需要依前述環境安裝段落手動補足，再執行建置及預覽。Codespaces 啟動流程仍待實際驗收；不將設定檔存在視為已能自動啟動。
