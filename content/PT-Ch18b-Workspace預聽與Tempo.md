---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 18
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "378–385"
pdf_pages: "410–417"
---

# Ch18 — Workspace 預聽：聽到的速度、輸出與匯入結果要一致

> 預聽不只是按播放：Audition Path、Timebase、Elastic Audio 與 Session Tempo 共同決定你聽到的結果。

## 1. Waveform 是概觀，不是檔案存在的唯一證據

Workspace 能在 Waveform column 顯示音訊概觀，資料可來自 file metadata 或 global waveform cache。若第一次看到某個音檔沒有 waveform，不必立刻認定音檔損壞：可能只是還沒有計算。選取檔案後用對應的 Calculate Waveform 工作產生概觀，並在 Task Manager 看背景任務。

Waveform 也能當作定位入口：按下波形內某位置，可從該處預聽。需要判斷 Attack、尾音或過門時，這比每次從檔案最前面聽起有效。

| 控制 | 功能 | 常見誤會 |
|---|---|---|
| Preview | 播放選定音檔 | 無聲不一定是沒內容，還要查 Audition Path |
| Waveform 內的預聽位置 | 從指定時間開始聽 | 不必從頭聽完才能判斷尾段 |
| Volume | Workspace 預聽音量 | 它不等於該檔案日後 Track 的 Fader 設定 |
| Meters | 顯示預聽訊號 | 有 meter 無聲時，要排查輸出路徑 |
| Audio Files Conform to Session Tempo | 決定符合條件素材是否跟 Session Tempo | 不是所有 Sample-Based 檔案都會被任意拉速 |
| Elastic Audio Plug-In | 選預聽與相關處理使用的算法 | 音樂素材的結果會受算法影響 |

> [!tip] 實務連結
> 音效庫可能有很大電平差。先把 Workspace 預聽音量放在合適位置，再逐一試聽；不要靠 Track Fader 去調整還沒匯入 Session 的素材。

## 2. Normal、Loop、Auto-Preview 各自減少不同操作

| Preview mode | 行為 | 適用情境 |
|---|---|---|
| Normal Preview | 播完所選音檔後停止 | 判斷單次 hit、完整語音或音效 |
| Loop Preview | 重複播放 | 聽 Loop 接點、持續比較音色 |
| Auto-Preview | 選新項目時自動預聽 | 快速掃過大量候選素材 |

Mac `Command+P` 是 Workspace 的 Preview 入口之一；Spacebar 是否控制檔案預聽，還要看 Browser menu 的 `Spacebar Toggles File Preview`。若 Spacebar 改去啟停 Session，先檢查這個選項與最前方視窗。快捷鍵的前提和按鍵本身同樣重要。

原書也提到，多於兩個 channel 的 interleaved files 在 Workspace 預聽時會依其規則處理；想確認每個離散聲道，應另檢查 channel 與 Audition Path，而不是只因 Stereo 監聽聽起來正常，就認定多聲道內容全部正確。

## 3. Sample-Based 與 Tick-Based 不是同一種速度邏輯

經 Elastic Audio 分析且具有 Tempo／Bars／Beats 資料的音檔，可被當作 Tick-Based 素材；REX／ACID 等本來就帶音樂節奏資訊。啟用 Conform to Session Tempo 後，符合條件的 Tick-Based 內容可用 Session 的速度預聽及匯入。Sample-Based、沒有偵測到 Tempo 的素材，則保持原本速度和 duration。

| 素材狀態 | 預聽的主要參考 | 你應確認的事 |
|---|---|---|
| Sample-Based，沒有已知 Tempo | 原始速度／duration | 不要假定 Conform 開了就一定跟拍 |
| Tick-Based、有 Tempo 的 Elastic Audio 分析 | Session Tempo（Conform 開啟時） | 選對 Elastic Audio 算法，聽有沒有處理痕跡 |
| REX／ACID | 檔案攜帶的音樂時間資訊與 import 設定 | 檢查是以 Clip Group 還是 Elastic Audio 等方式使用 |
| 已 Clear Elastic Analysis | 回到 Sample-Based 等原始解讀狀態 | 畫面時間／預聽速度可能與之前不同 |

MP3 不能直接成為原生 Elastic Audio 檔案，但可匯入 WAV／AIFF Session，轉成支援格式後再在 Elastic Audio-enabled Track 使用。這表示「能匯入」與「原檔格式直接支援某處理」是不同問題。

> [!warning] 預聽符合 Tempo，不等於所有匯入路徑都相同
> 從 Workspace、Finder 拖放或 Import Audio 使用的 preferences 可能不同。聽起來對拍後，仍應核對匯入設定與結果；Ch21 將再解釋 Conversion、Copy 與 Conform 的範圍。

## 4. Preview in Context：邊播 Session 邊比較素材

Preview in Context 讓你在 Session 播放時預聽候選檔案。對 Tick-Based 音樂素材而言，Tempo 符合與音樂位置的關係，能比單獨播放更直接顯示素材是否適合編曲。

如果預聽遇到 voice 資源問題，可查看 Operation preferences 的 `Reserve Voices For Preview In Context`。保留數量與所選 Audition Path 的 channel width 有關；被保留的 voices 便不能供 disk tracks 使用。這不是免費增加資源，而是在 Session 與預聽之間分配。

> [!tip] 實務連結
> 選鼓 Loop 時，先獨立預聽排除音色不合的，再在 Session 中比較 groove 與接點。當候選只剩少數，才花時間檢查 Elastic Audio 的音質與匯入後 Track 行為，流程會更有效率。

> [!abstract] Takeaway
> 先確定 Audition Path 與 Preview mode，再確認素材的 Timebase／Tempo 資訊。Conform 能幫音樂素材跟拍，但不能替代匯入後檢查。資源不足時，看 voices 配置；素材找不到時，接 [[PT-Ch18c-Relink與背景任務]]。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=410|原書 p. 378–385／PDF p. 410–417]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch18a-Workspace素材庫與搜尋]]

下一篇：[[PT-Ch18c-Relink與背景任務]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
