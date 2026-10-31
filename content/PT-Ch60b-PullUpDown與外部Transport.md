---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 60
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1356–1366"
pdf_pages: "1388–1398"
---

# Ch60b — PullUpDown與外部Transport

> 改 frame rate 標示、改影像走速、改 Audio sample clock 是不同操作；Pull Up/Down 要配合整個交付流程。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1388|原書 p. 1356–1366／PDF p. 1388–1398]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## Pull Up/Down改的是速度，不只是時間尺

原書支援名義 4%與額外 0.1%的組合，Audio 與 Video 可分開設定。所謂 4% pull-up 實際由 25/24 決定，約+4.1667%；pull-down 由 24/25 決定，為−4%。這兩個百分比不能當成完全對稱的±4%。

$$
r_{24\rightarrow25}=\frac{25}{24}\approx1.041667,\qquad
r_{25\rightarrow24}=\frac{24}{25}=0.96
$$

這裡只保留可用結論：把同樣內容更快播完，走速乘上大於 1 的比例；更慢則小於 1。實務要用哪個方向，取決於素材原先如何製作以及最終要達成的速度，不能只看檔案名稱寫 PAL 或 NTSC。

| 48kHz nominal sample rate | 手冊列出的實際 rate | 用途解讀 |
|---|---|---|
| None | 48000 | 原速 |
| +0.1% | 48048 | 小幅加速 |
| −0.1% | 47952 | 小幅減速，表中取整數 |
| +4.1667% | 50000 | 24→25 速度關係 |
| −4.0% | 46080 | 25→24 速度關係 |

Source-rate 與 Destination-rate 的 sample rate conversion 表方向不同：一個從「把來源當什麼 rate 讀」思考，一個從「輸出到什麼 rate」思考。原書 p.1374 分列兩表；不要直接把其中一列複製到另一個欄位。需要特定轉換時回原表核對。

> [!tip] 實務連結
> 收到「24fps 轉 25fps」任務，先問是改播放速度、保持時長做 frame conversion，還是歷史 telecine 流程的還原。這三種要求，不能只靠同一個 Pull Up 設定處理。

## Auto Match Pull Factors會跟隨既有狀態

在 Session Setup 的 Timecode Rate 選單啟用 Auto Match Pull Factors 後，改 frame rate 時，Pro Tools 會依現有 pull factor 調整 Audio 與 Video 速度，讓它們配合。這個開關預設未啟用，狀態跟 Session 保存；它是相對目前設定運算，不是每次都先清零。

Video Pull Up/Down 不會自動改 Timecode ruler。原書舉 24fps Video pull up 到 25fps，需要把 Session Frame Rate 也設 25，尺才與影像對齊。外接 video hardware 能支援哪些 pull direction，也跟 file format、rate、raster 及硬體有關；不能把 desktop Video Window 能播的選項當成硬體一定能輸出的選項。

## Online：告訴Pro Tools等外部位置

到 `Options > Transport Online`，或按 Transport 的 Online，Mac 也可用`Command+J`。按鈕閃爍是等待 Timecode，亮起才是收到 Timecode 並觸發。Timecode 已在 incoming 欄流動，但 Transport 沒 Online，仍可能不會照外部來源起播。

| Online Record 選項 | 從哪裡開始錄 | 用途 |
|---|---|---|
| Record Online at Timecode Lock | lock 到 Timecode 後開始 | 不以手動 insertion 為起點 |
| Record Online at Insertion/Selection | 在 insertion／selection 開始 | 有 selection 時依其長度錄 |

Freewheel 決定 Timecode 短暫掉訊號後如何繼續：Frames 可設 4–40，預設 8；None 在 LTC／VITC／Serial 仍有最少 4frames，MTC 則無；Jam Sync 可在收到起始 Timecode 後，即使後面完全中斷仍繼續播放。Jam Sync 能讓播放繼續，不保證沒有共同 clock 的兩套設備永遠不漂移。

## 生成Timecode：MTC和LTC要選對出口

沒 Sync X／SYNC HD 時，Pro Tools 只能生成 MTC：在 Peripherals > Synchronization 選 MTC Generator Port，Transport 顯示 Synchronization，開 GEN MTC 再播放。搭配同步硬體則可由硬體 LTC Out 或 MTC Out 送出。

| 情境 | 要做什麼 | 常見錯誤 |
|---|---|---|
| 無同步硬體送 MTC | 指定 MIDI output port，開 GEN MTC | 選錯到無設備的 port |
| Sync X／SYNC HD 送 LTC 及 MTC | 硬體接好、Enable、frame／clock 設定後開 GEN LTC | 只開 GEN MTC 卻期待硬體輸出 MTC |
| HD 系統切 GEN LTC | Mac `Command+Control+J` | 把它和 Online 快捷鍵混淆 |

原書說同步硬體在生成 LTC 時會輸出 MTC，僅開 GEN MTC 不會讓它依預期輸出。SYNC HD 在 video reference 與生成 timecode rate 不匹配時，frame edge 可能不對齊；變更 frame rate 後，部分 Timecode converter 還需重新啟動以辨識。

## MMC是遙控命令，不是取樣時鐘

MMC（MIDI Machine Control）可送 Locate 與 Transport。Pro Tools 可作 MMC Master，或收外部 MMC 控制；外部設備與 Pro Tools 之間另有 MTC 交換位置。本章採 open-loop communication，直接在被控制設備按 Transport，不會自動回報成 Pro Tools 相同動作。

| 組態 | 命令方向 | 另需處理 |
|---|---|---|
| Pro Tools 作 MMC Master | Pro Tools MIDI Out→外部 | 外部 MTC 回到指定 Reader Port |
| Pro Tools 跟隨 MMC | 外部 MMC→Pro Tools | MIDI Input Enable、Remote ID 與 MTC Generator |
| 9-pin remote track arm | MachineControl 架構 | 不是一般 MMC 功能 |

MMC ID 為 0–127；預設 127 是對所有 ID 廣播，設備很多時要避免誤控制。Machine Pre-roll 與 Minimum Sync Delay 都為設備 lock 留時間；要找到設備能穩定工作的最小值，不是越短越專業。House-sync 設備還要留足 frame/color-lock 時間。

> [!warning] 相同 frame 數，不等於相同實際 fps
> 29.97 Non-Drop 常被誤標成「30fps NTSC」。Pro Tools 若照真正 30fps 解讀 29.97，原書指出約每分鐘差 1.8frames。先查真實 rate，再談 offset；固定 offset 修不了持續累積的速度錯誤。

> [!abstract] Takeaway
> Pull Factor、Timecode Rate、Online、Timecode 生成與 MMC 各管一件事。速度轉換先確認原始／目標流程；外部遙控先確認命令、位置與 clock 的方向。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch60a-Synchronization與SessionSetup]]

下一篇：[[PT-Ch60c-Spot與TimeStamp定位音效]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch60a-Synchronization與SessionSetup]] · [[PT-Ch60c-Spot與TimeStamp定位音效]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch59 — Ambisonics]]

[[PT-00-功能目錄#Ch61 — Pro Tools MachineControl]]

標籤： #pro-tools #audio #study-note
