# 來源與權利範圍

整理與製作：許惟傑 Xue_hwcxx · [GitHub @jaymoda88](https://github.com/jaymoda88)。

原始學習筆記的許可範圍為個人翻譯與學習使用；目前沒有可確認的 Avid 原廠 PDF 公開再散布許可。網站、原始碼與網站包以連結開啟 Avid 官方文件：

- [Pro Tools Reference Guide 2023.3](https://resources.avid.com/SupportFiles/PT/Pro_Tools_Reference_Guide_2023.3.pdf)
- [Pro Tools Shortcuts Guide 2023.3](https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2023.3.pdf)

原創程式、教學整理與自繪圖解目前保留權利；這個修正沒有代替作者選擇 MIT、CC 或其他公開授權。第三方套件依各自附帶的授權文件，並不受本專案的權利保留聲明取代。

## 2026-11-01 歷史與下載清理

經擁有者確認，從 main 與 v1.0.0、v1.1.0、v1.2.0 tags 的可達歷史移除兩份 PDF。清理改寫了既有 9 筆 commit；目前網站的內容與程式維持相同。

| 位置 | 處理 |
|---|---|
| Git 歷史 | 移除兩份 PDF 的路徑與 blob，更新受影響的分支及 tags。 |
| v1.0.0 Release | 刪除已確認含 PDF 的 `pro-tools-workbench.zip`；Release 保留為草稿。 |
| 舊 Actions 封裝 | 刪除同樣含兩份 PDF 的舊網站 artifact。 |
| v1.1.0／v1.2.0 網站包 | 保留不含 PDF 的網站包與校驗檔。 |

原本 clone 的副本仍可能保留舊歷史，建議重新 clone，避免再次推回舊 commit 或 PDF。既有 GitHub 快取、他人的 clone／fork 或已下載檔案，無法由這次遠端 refs 更新保證一併刪除；若仍可透過舊網址存取，需另向 GitHub 處理快取副本。
