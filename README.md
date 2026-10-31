# Pro Tools 工作台

以「現在要完成什麼工作」為入口的繁體中文 Pro Tools 互動知識庫。這是獨立網站版本，原本的 [Obsidian 筆記倉庫](https://github.com/jaymoda88/pro-tools-2023.3-zh-tw-notes) 保留。

## 怎麼開啟

### 直接在電腦使用

下載 repository（Code → Download ZIP）並解壓縮，開啟 `dist/index.html`。文章與搜尋資料已打包，不必先安裝程式。

若要完整預覽所有圖表或從本機網址使用，安裝 Node.js 20 以上後，在此資料夾執行：

```sh
npm start
```

開啟終端機顯示的 `http://127.0.0.1:4173`。

### 直接用 GitHub 預覽

[在 Codespaces 開啟工作台](https://codespaces.new/jaymoda88/pro-tools-workbench?quickstart=1)。建立後，環境會自動啟動伺服器；在 Ports 面板開啟 **4173 / Pro Tools 工作台**。如果伺服器未啟動，在 Codespaces 終端機執行 `npm start`。

### 下載獨立網站包

每次 main 更新後，**Actions → Check and package workbench → Artifacts → pro-tools-workbench-website** 可下載可直接開啟的網站包。這是私人 repository 的 artifact，不會自動公開發布。

## 你可以怎麼用

| 工作 | 入口 |
|---|---|
| 不知道功能叫什麼 | 首頁任務入口、工作流程導航 |
| 已知中文問題或英文功能 | 全文搜尋；⌘K／Ctrl K 快速進入 |
| 系統性學習 | 八大主題、章節分篇、已讀進度 |
| 查 Pro Tools 按鍵 | 135 筆 Mac 快捷鍵，依情境與鍵位篩選 |
| 回來讀到一半的文章 | 最近閱讀、收藏與進度 |
| 搞懂音訊路徑與處理選擇 | 互動訊號路由、Commit／Freeze／Bounce 比較 |
| 換電腦接續學習 | 匯出／匯入學習紀錄 JSON |

## GitHub 在這裡的角色

- **版本與回復**：介面、分類與內容的每次更新都可追溯。
- **Issues**：用內容更正與工作流程建議表單記錄實際需求。
- **Pull Request**：先檢查更正與介面變更，再合併。
- **Actions**：驗證 122 篇文章、135 筆快捷鍵、內部連結與附件；自動產出可下載網站包。
- **Codespaces**：在私人工作區執行預覽，省去本機安裝設定。

網站目前不開啟公開 GitHub Pages，也不把私人學習資料發布到公開網址。收藏、進度與偏好存於當前瀏覽器，不會同步上傳至 GitHub；要換裝置可用匯出／匯入。

## 維護

```sh
npm run check
```

- `dist/`：可直接使用的網站與資料。
- `content/`：原始教學內容與快捷鍵頁，作為結構化內容來源。
- `scripts/build_data.py`：重新產生網站資料，依檔內說明安裝需要的 Python 套件。
- `scripts/serve.mjs`：本地預覽伺服器，無需 npm dependencies。
- `docs/DESIGN.md`：參考專案與資訊架構。

## 來源與使用範圍

原書 66 章，整理為 122 篇繁中教學筆記與 66 張原創圖解；快捷鍵 135 筆以 Avid 官方 Mac 欄核對。內容對應 **2023.3**，不推定現行 Pro Tools 功能或支援規格。介面與資料核對不代表逐鍵實機測試。

- [Pro Tools Reference Guide 2023.3](https://resources.avid.com/SupportFiles/PT/Pro_Tools_Reference_Guide_2023.3.pdf)
- [Pro Tools Shortcuts Guide 2023.3](https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2023.3.pdf)

這是供個人學習使用的私人知識庫。Avid 來源文件的權利仍屬原權利人，未將原書內容另行授予開源授權。
