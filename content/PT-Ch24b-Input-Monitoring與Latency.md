---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 24
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "553–557"
pdf_pages: "585–589"
---

# Ch24 — Input Monitoring 與 Latency：演奏者聽到什麼，由路徑決定

> 監聽模式決定何時聽 Input、何時聽 disk；Latency 則取決於訊號走過的硬體、buffer 與處理，不是單靠 Fader 能解決。

## 1. Auto Input 與 Input Only 的根本差異

Auto Input 配合錄音狀態切換來源：停止時聽 Input，補錄播放到 Punch 前聽既有 Track，Punch 進入錄音時聽 Input，Punch out 後又回既有素材。Input Only 則固定聽輸入，即使正在播放，也不靠它來聽該 Track 既有的錄音。

| Transport／錄音狀態 | Auto Input 的監聽來源 | Input Only 的監聽來源 |
|---|---|---|
| 停止、Track 已 armed | Input | Input |
| Playback，尚未 Punch in | 既有 Track material | Input |
| Punch in、錄音中 | Input | Input |
| Punch out，繼續 Playback | 既有 Track material | Input |

這個表描述本章針對錄音 Track 的基本邏輯；還要同時考慮 TrackInput button、record enable 與硬體監聽。原書畫面中 TrackInput **綠色為 Input Only**，未亮為 Auto Input。Mac `Option+K` 切換 record-enabled Tracks 的相應監聽模式。

> [!warning] 原書 p. 554 有互換的 menu 文字
> 該頁「for Auto Input／for Input Only」下的兩個 menu 指令文字呈現對調；p. 555 與按鈕狀態的解釋則一致。本筆記以清楚的 **綠色＝Input Only、未亮＝Auto Input** 行為說明為準，不把該排版錯誤複製成教學步驟。

> [!tip] 實務連結
> 歌手要先聽前一句，再在補錄點唱進去，Auto Input 通常能提供連續上下文。若要在播放伴奏時一直調整麥克風輸入，Input Only 更直接。先把要聽的來源說清楚，再選模式。

## 2. Record／Play Faders 是監聽 mix 的管理

Pro Tools 可區分 record 與 playback fader levels；`Link Record and Play Faders` 打開時，不另外追蹤兩組音量，armed 狀態不會使 Fader 跳到另一個記憶值。這是工作上的電平便利，不等於把 Fader 當作 input preamp。

`Disable “Input” When Disarming Track (in “Stop”)` 可讓停止時解除 armed 的 Track 同時關掉 Input monitoring。這有助避免解除錄音後仍聽見 live input；但若你本來就刻意用 Track 當即時監聽，該 preference 也會影響你的流程。

| 你聽到的現象 | 先檢查 | 原因方向 |
|---|---|---|
| Playback 仍只聽見麥克風 | TrackInput／Input Only | 監聽來源仍是 live Input |
| 解除 armed 後麥克風還有聲 | Input monitoring 與相關 preference | armed 與 Input monitor 是不同狀態 |
| armed 後 Fader 值變了 | Record／Play Fader link | 可能切到另一組監聽值 |
| 聽到兩個略錯開的聲音 | Software 與 hardware direct monitor | 同一訊號走兩條不同延遲路徑 |

## 3. Buffer 越小，延遲通常越少，但即時負擔更高

Audio input 經 A/D、buffer、mixer／Plug-In，再由 D/A 出來，過程必然有時間成本。較大的 H/W Buffer Size 會增加相關 monitoring latency；降低 buffer 能縮短這部分等待，但可能降低可穩定錄音的 Track／processing 容量。

原書沒有要求「把 buffer 永遠設最小」。正確做法是為錄音選**可穩定工作的較低值**，降低錄音路徑的高延遲處理，再於混音時依資源需求改大。若某顆 Look-Ahead 或其他高延遲 Plug-In 已引入很多時間，單純改 buffer 不一定解決主因。

| 方案 | 好處 | 代價／條件 |
|---|---|---|
| 較低 H/W Buffer Size | Software monitoring 較即時 | 即時 CPU 壓力上升，須測穩定性 |
| 減少錄音／cue 路徑 Inserts | 避免額外處理延遲 | 錄音時的監聽音色可能較簡化 |
| Interface direct monitoring | 訊號繞過主要 software 路徑 | 需使用 interface mixer；效果配置依硬體 |
| Delay Compensation | 維持不同 processing 路徑間的對齊 | 不等於把所有 live input 延遲變成零 |
| Low Latency Monitoring | 依指定硬體／path 讓錄音監聽使用合適路徑 | 有軟體監聽、Inserts／Sends 與 Bounce 行為限制 |

## 4. Low Latency Monitoring 不是所有 interface 都適用的魔法

本章討論第三方 Core Audio／ASIO 等有 built-in mixer 的硬體監聽與 Pro Tools Low Latency Monitoring。對沒有內建 mixer 的設備，啟用相關 LLM 並不會憑空產生一條 direct monitor；原書甚至提醒，record-enabled Track 的 software monitoring 會被關掉，可能因此完全沒監聽。

相關 Track 需指派到 I/O Setup Output 頁設定的 Low Latency Monitoring Path；不是所有 Output 隨便選一個都適用。LLM 下 record-enabled／TrackInput-enabled Track 的 software monitoring、Inserts／Sends 有本章限制；`Allow Sends to persist during LLM` 能改變適用 Send 行為，必須按該版與硬體路徑確認。

> [!tip] 實務連結
> 用 audio interface 自己的 mixer 做 direct monitor 時，先只留一條清楚的 input-to-headphone 路徑，再逐步加 DAW 回放。避免同時開兩套 Input monitor，否則低延遲目標可能變成 comb filtering 或不自然的雙聲。

## 5. 錄音與 Bounce 的設定要分開

本章警告，Low Latency Monitoring 開啟時，Bounce Mix 對 Auxiliary Input／Instrument Tracks 有特殊限制；要完整包含這些內容，應先關閉 LLM 再 Bounce。外部輸入也不能靠 Bounce Mix 自動錄進來，需先錄到 Audio Track。

> [!abstract] Takeaway
> 先問「現在該聽 Input 還是 disk」，再問「這條路經過多少延遲」。Auto Input／Input Only 管來源，buffer／Plug-In／hardware monitor 管路徑。LLM 依賴正確硬體與配置；錄音用設定也應在正式 Bounce 前再檢查一次。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=585|原書 p. 553–557／PDF p. 585–589]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch24a-錄音準備與Record-Modes]]

下一篇：[[PT-Ch25a-Audio錄音與補錄範圍]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
