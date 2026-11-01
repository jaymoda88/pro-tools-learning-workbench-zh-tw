# 2023.3 → 2026.4 版本差異導覽

這份導覽幫助已讀過原筆記的人，找到較新版工作流程需要補上的部分。原有 122 篇章節教學仍以 **2023.3** 為基準；新增內容是經來源核對的差異導讀，沒有把原文版本標籤直接改成 2026。

資料查核快照：**2026-11-01**。來源為使用者提供的 Avid 官方 PDF 與官方相容性／Release Notes 頁。網站與 Release 僅收錄自行改寫的重點、練習與官方連結，不含原廠 PDF。

## 內容範圍

`content/updates.json` 收錄 **11 個版本節點、25 項差異**：

| 版本 | 選讀主題 |
|---|---|
| 2023.6 | Track Markers；Immersive Track／Path widths 與 Atmos Bed 的區別。 |
| 2023.9 | Sketch 的 Clip／Scene 工作方式；Plug-In Insert 重排。 |
| 2023.12 | Dolby Atmos Internal Renderer；I/O Path Color Coding。 |
| 2024.3 | MIDI Plug-ins；Melodyne／Clip Effects 浮動視窗。 |
| 2024.6 | RX Spectral Editor 與 ARA 整合資格；Import Session Data 屬性篩選。 |
| 2024.10 | 匯入選取與 Destination 分離；MIDI Playlists；Instrument Input Monitoring／MIDI Delay Compensation。 |
| 2025.6 | Splice；Transcription；Playlist 操作延伸。 |
| 2025.10 | Workspace 轉錄；SoundFlow；Pan Automation 保留與舊版回存風險。 |
| 2025.12 | macOS 的 Audio Vivid 整合。 |
| 2026.4 | Track Pinning；Render 後保留 Transcription；MPEG-H；Immersive Panner。 |
| 2026.4.1 | M5 支援與修正版的資格區分。 |

每個主題包含：用途說明、適合的工作情境、短練習、完成檢核、方案／平台條件、對應舊版教學，以及可直達官方 PDF 頁面的來源。

## 來源定位

PDF 的 `pdfPage` 是檔案檢視器的實際頁序，從 1 開始；`printedPage` 是該頁印出的頁尾頁碼。兩者分開保存，不用固定偏移量換算，因為不同文件與部分文件內的頁序不一定相同。

官方 PDF 連結格式為：

```text
https://resources.avid.com/SupportFiles/PT/Whats_New_in_Pro_Tools_<version>.pdf#page=<physical-page>
```

- 10 份 What's New 文件的所選功能頁已實際抽取並閱讀，並保留準確的實際頁序與頁尾頁碼。
- Mac Read Me 2026.4 的相容性快照與已知問題另列在 `compatibilityNotes`；沒有將舊 Read Me 中的系統調整命令搬進教學。
- 2026.4.1 的資訊來自 Avid [Release Notes](https://kb.avid.com/pkb/articles/en_US/Knowledge/Pro-Tools-2026-4-Release-Notes)及[System Requirements](https://kb.avid.com/pkb/articles/compatibility/Pro-Tools-System-Requirements)，由專案的當日官方網頁查核提供；這個修正版沒有假造一本本地 PDF。

## 需要保留的界線

- 這是重要差異選讀，不是每個版本全部功能的逐項清單。工具名稱保持英文，教學解說使用繁體中文。
- `latestVerified` 是帶日期的查核快照，不是永久的「最新版」宣告。安裝前仍須核對目前的相容性、外掛與 Audio Interface 條件。
- M5 支援屬於 **2026.4.1**，不能把它標在 2026.4 基礎版上。
- Transcription、MPEG-H、Immersive Panner 等保留實際方案限制；Track Pinning 不誤標為 Studio／Ultimate 專屬。
- 新 Immersive Panner 不適用 Dolby Atmos Renderers 或一般 Pro Tools mixer；較寬 Track format 也不等於較寬 Atmos Bed。
- 支援某個第三方整合，不代表外掛完整授權、訂閱或所有素材已附贈。相關限制直接寫在主題內。
- 短練習是根據來源設計的學習建議，未宣稱已在 Pro Tools、M5 Mac 或任何硬體組合中實機操作。

## 靜態驗證

本次只做檔案與資料層驗證：JSON 可解析、版本／功能 ID 唯一、所有教學 ID 存在、來源只使用官方 HTTPS 網址、PDF 頁序在實際文件範圍內，且每個已引用頁序重新以該 PDF 的單頁抽取核對。沒有執行網站的 build、check、smoke 或瀏覽器。
