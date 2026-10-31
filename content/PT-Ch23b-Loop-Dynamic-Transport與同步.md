---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 23
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "522–533"
pdf_pages: "554–565"
---

# Ch23 — Loop、Dynamic Transport 與外部同步

> Loop 決定重複哪段，Play Start Marker 決定先從哪裡聽；外部同步再把這個時間關係擴展到其他設備。

## 1. Playback mode 不要與 Record mode 混淆

| Mode | 工作方式 | 典型用途 |
|---|---|---|
| Normal | 從指定位置正常播放 | 一般聆聽 |
| Half-Speed | 半速播放；Mac 可 Shift+Spacebar | 聽難辨識的演奏或細節 |
| Prime for Playback | 先準備好播放狀態，再真正啟動 | 降低大量 Track 開始播放前等待的不確定性 |
| Loop Playback | 反覆播放所選範圍 | 檢查節奏與接點 |
| Dynamic Transport | Play Start Marker 與 Timeline selection 可分開 | 從 Loop 尾端附近開始聽跨接點 |

Loop Playback 要有至少 **500 ms** 的 selection；沒有範圍就正常播放。它不會自動打開 Loop Record：Audio Loop Record 的選取長度要求與錄音行為另見 Ch24／Ch25。

> [!tip] 實務連結
> 檢查四小節 Loop 是否能自然接回開頭，不必每次聽完全部四小節。先保留 Loop 範圍，再把播放起點移到結尾之前；這正是 Dynamic Transport 的價值。

## 2. Dynamic Transport：分開三件時間資訊

`Options > Dynamic Transport`，或 Mac `Command+Control+P` 切換。開啟時會自動關閉 Link Timeline and Edit Selection，並啟用 Loop Playback。Center Playhead 與 Dynamic Transport 不能同時使用；切換其中一個會影響另一個。

| 元素 | 在 Dynamic Transport 的角色 | 操作直覺 |
|---|---|---|
| Timeline Selection Start／End | Loop 或播放範圍的界線 | 決定重複哪段 |
| Play Start Marker | 開始 playback 的位置 | 可以放在 Loop 結尾前，快速聽接點 |
| Edit selection | 當下編輯範圍 | 可保持與 Timeline 不同 |
| Playhead | 目前播放位置 | 會受相關 Follow preference 影響 |

`Play Start Marker Follows Timeline Selection` 決定 selection 改變時 Marker 是否跟著移。`Dynamic Transport Follows Timeline Selection During Playback` 決定播放中改範圍時 Playhead 是否立即跳到新起點。前者控制起播標記，後者控制正在走的播放位置；名字相近，影響時機不同。

## 3. Separate Play／Stop keys 是有代價的配置

在 Operation preferences 選 Numeric Keypad Mode `Transport`，再啟用 `Use Separate Play and Stop Keys`，keypad Enter 可開始播放、0 停止。這會改變 Enter 原本加入 Memory Location 的用法；原書提供 period 後 Enter 的替代方式。

> [!warning] 輸入裝置與快捷鍵前提要一起記
> 小鍵盤功能不是鍵盤上方數字列的完整替代；筆電缺少獨立 numeric keypad 時，先用 menu／畫面控制，不要照抄完整鍵盤的按鍵後認為軟體故障。

## 4. MIDI Beat Clock：讓外部節奏設備跟著 Session

`Setup > MIDI > MIDI Beat Clock` 可啟用 clock，再選接收設備。它用於支援 MIDI Beat Clock 的 drum machine、sequencer、arpeggiator 或 Plug-In；不要把它與用 Timecode 定位的 MTC 等機制混為一談。Mac 也可透過 Audio MIDI Setup 的 IAC Driver，把 Beat Clock 送給同機的其他 MIDI application。

| 同步問題 | 本章做法 | 限制 |
|---|---|---|
| 外部設備速度不跟 | 開啟 Beat Clock，檢查設備是否接收 | 裝置本身也要設定正確 |
| 速度對，但聲音固定偏晚 | 量測每個 port 的 latency，設定 negative Sample Offset | 不是所有時間差都由同一個 port 造成 |
| 要量測偏移 | 錄回外部設備的節奏，從 Grid 到 transient 看 sample 差 | MIDI 不是 sample-accurate，應做多次量測 |
| 同機程式間連接 | 設 IAC ports 並於 Beat Clock 選擇 | MIDI 連通不等於 Audio 已回到 Pro Tools |

原書量測方法是讓外部設備演奏容易辨識的節奏，錄到 Audio Track；以 Grid 參考點與 Tab to Transients 取得偏移範圍，Main Time Scale 改 Samples，讀 selection length，再以負值填入 Sample Offset。多次量測取適合的平均，並把結果另行記錄，方便其他 Session 重建。

## 5. Ableton Link：同一個區域網路內共同維持音樂時間

本章支援 Ableton Link，用 LAN／WLAN 讓同機或不同裝置上的 Link-enabled applications 成為 peers。它協調 beat、Tempo、phase，以及支援時的 start／stop。原書列出範圍 `20–999 BPM`，這是此文件描述，不推定所有應用的可用範圍都完全相同。

| Link 控制 | 用途 | 注意點 |
|---|---|---|
| Link button | 加入／離開 Link session；啟用為藍色 | 所有 peers 要在可互通的本地網路 |
| Start/Stop Sync | 是否交換啟停訊息 | 其他應用也需支援並啟用 |
| Number of Connected Peers | 顯示其他連線應用數 | 不是 Audio channel 數，也不是串流音訊數 |
| Launch Quantize | 決定加入已開始 session 時，按哪個音樂週期起播 | 第一個開始的 peer 與加入中的行為不同 |
| Beat Cycle Position | 顯示目前音樂週期進度 | 用來理解 Quantize 的等待位置 |

Pro Tools 要跟隨 Link 的 Tempo 變動，原書建議以 Tick-Based Tracks 配合 Elastic Audio；Conductor 若持續由 Tempo track 控制，可能覆蓋外部 peer 的 Tempo 變更，因此應切到 Manual Tempo 等合適模式。**Link 不是音訊傳輸工具**：兩台機器跟拍，不代表聲音會自動送到同一個介面。

> [!abstract] Takeaway
> Loop、播放起點和 Edit 範圍可以分開。外部硬體用適當 Beat Clock 與 offset；Link-enabled apps 可在本地網路共享音樂時間。先確定誰控制 Tempo，再處理 Audio 路徑，不要把同步當作聲音傳輸。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=554|原書 p. 522–533／PDF p. 554–565]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch23a-播放位置與選取範圍]]

下一篇：[[PT-Ch24a-錄音準備與Record-Modes]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
