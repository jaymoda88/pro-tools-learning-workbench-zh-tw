# 署名、使用範圍與發布來源

本專案的保護措施用來讓作者、使用條件及正式來源容易辨識，並協助發現發布檔案被改動。它們不會把公開網站變成不可複製的內容。

整理與製作：**許惟傑 Xue_hwcxx** · [GitHub @jaymoda88](https://github.com/jaymoda88)。

## 原創材料的使用範圍

[LICENSE](../LICENSE) 與 [NOTICE.txt](../NOTICE.txt) 保留原創程式、教學解說、內容編排及自繪圖解的權利。商業再利用、轉售、付費散布、納入商業產品／付費內容服務，以及移除署名或浮水印，均須先取得作者書面同意。

這個範圍不包含快捷鍵事實、軟體功能、一般觀念或讀者學到的技能；讀者仍可將所學用於自己的音樂、創作與專業工作。Avid 文件、其他機構規範、第三方套件及外部學習資源，依各自的權利或授權，本專案不宣稱擁有它們。

## v1.3 的標記層次

| 層次 | 用途 | 限制 |
|---|---|---|
| 網頁可見浮水印 | 顯示作者、GitHub 帳號及非商用提示；保持介面可操作。 | 使用者掌握自己的瀏覽器，能修改頁面、CSS 或 JavaScript。自動恢復標記也不是不可移除。 |
| 文章與列印署名 | 在教學文章保留整理者、使用範圍與原筆記連結；列印樣式保留來源。 | 瀏覽器列印設定、截圖與重新排版會影響呈現，仍需實際畫面驗收。 |
| PNG 像素署名 | 把可見署名寫入新建置圖解的像素，而不只依賴 HTML 遮罩。 | 裁切、重繪或影像編修仍可能移除標記。 |
| PNG iTXt metadata | 記錄作者與來源 hash，協助比對圖檔來源。 | iTXt 是可讀的 metadata，不是加密、盲浮水印或不能移除的證明。 |
| 複製長文附來源 | 在文章內複製超過 120 個字元時，以純文字附上作者與來源。輸入框、短字串、「複製按鍵」操作，以及包含程式碼／命令片段的選取範圍，保留原生複製，不加這段來源。 | 剪貼簿政策可能限制此功能；一般複製仍應可用。它不阻止從原始碼或其他方式取用內容。 |
| Release 指紋 | `PROVENANCE.json` 記錄包內其他檔案的路徑、大小與 SHA-256；`SHA256SUMS.txt` 核對整個 ZIP。 | Manifest 不雜湊自身。雜湊可檢查內容一致性，但攻擊者也能為改動後的檔案重新計算雜湊。 |
| GitHub Artifact Attestation | 正式 Release 預計用 `actions/attest@v4` 簽署 ZIP 的建置來源，供使用者驗證。 | 必須等該次 Release workflow 簽署成功才有可驗證的紀錄；它不裁定著作權，也不限制複製。 |

原創 PNG 的標記由 `scripts/protect_assets.py` 與 Pillow 13.0.0 處理，建置需 Python 3.11 以上；CI 使用 Python 3.12。程式、PNG 像素及 metadata 的檢查結果，會另記在 [VERIFICATION.md](VERIFICATION.md)，不能只因檔案存在就宣稱完成驗證。

## 如何核對正式下載包

先從本 repository 的 [Releases](https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw/releases) 取得 ZIP 與 `SHA256SUMS.txt`，核對 ZIP 的 SHA-256。包內 `PROVENANCE.json` 可再用來檢查其他檔案的大小與 hash；它是完整性清單，本身不是 GitHub 的簽章。

當 v1.3.0 的來源簽章成功建立後，可使用已登入的 GitHub CLI：

```sh
gh attestation verify pro-tools-workbench-v1.3.0.zip \
  -R jaymoda88/pro-tools-learning-workbench-zh-tw
```

驗證時應確認 repository、workflow、版本 tag 與下載檔案相符。簽章的作用是把檔案 digest 與建置身分關聯，不能證明內容完全原創、所有權沒有爭議，或其他人無法製作副本。若尚未產生該版 attestation，請將它視為待驗證狀態，而不是略過錯誤後宣稱通過。

## 公開內容仍存在的限制

v1.2 等歷史版本已公開過原創圖解；本次升級不會追回歷史檔案或別人已下載的副本。新增的可見浮水印與 iTXt 也可能被移除。這些措施讓正常閱讀與轉貼更容易保留來源，但不能保證杜絕轉售、截圖、重新輸入或內容重寫。

因此這個版本使用權利聲明、可見署名及可核對的發布來源，而不宣稱以加密保護公開內容。若發現疑似未授權轉售，應保留來源、時間與對方內容等證據，再由作者決定後續處理方式。

## 設計參考

- [watermark-js-plus](https://github.com/zhensherlock/watermark-js-plus)：參考瀏覽器浮水印的標記思路。此專案只作設計靈感，未複製或打包該套件程式碼；本專案也未因此實作其全部功能。
- [GitHub Artifact Attestations 官方文件](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations)與 [actions/attest](https://github.com/actions/attest)：參考建置來源簽章及驗證方式。正式發布需要相應 workflow 權限，實際簽署與驗證狀態以該版記錄為準。
