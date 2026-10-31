---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 45
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1033–1039"
pdf_pages: "1065–1071"
source_version: "2023.3"
---

# Ch45c — ElasticProperties與轉檔邊界

> 處理結果不對時，先查來源 Tempo、Meter 與 Event Sensitivity，別把錯誤 metadata 當成演算法音質不夠好。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1065|Chapter 45，原書 p. 1033–1039／PDF p. 1065–1071]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Elastic Properties 記錄的是來源與處理關係

選 Elastic Audio Track 上的 Clip，開 `Clip > Elastic Properties`；原書 Mac 快捷鍵是 **numeric keypad 的 Option+5**。Sample-based 與 tick-based Track 可見的欄位不同，並不是畫面缺了一半功能。

| 屬性 | 可見／可改條件 | 代表什麼 |
|---|---|---|
| Source Length | Tick-based | 來源以 Bars／Beats 表示的長度，可校正分析錯誤 |
| Source Tempo | Tick-based | 來源平均 Tempo，可輸入或用 ×2／1/2 修倍速誤判 |
| Meter | Tick-based | 分析不會自動算拍號，預設當作 4/4 |
| TCE Factor | Tick-based 為顯示；Sample-based 可改 | 相對原 source 的長度變化百分比 |
| Event Sensitivity | 對分析事件作篩選 | confidence 低的事件先被濾掉 |
| Input Gain | Elastic Audio 前的增益 | 處理時 clipping 的補救位置 |
| Pitch Shift | 依演算法支援 | 整個 Clip 的 semitones／cents 變調 |

若一個兩小節 Loop 被辨識成四小節，直接 conform 到 Session，結果會像變成半速或倍速。先修 Source Length／Source Tempo，才能讓後面的 Grid 與 Quantize 建立在正確時間尺度上。對 6/8 或 5/8 素材，也要確認 Meter 與 beat resolution；分析預設 4/4，不能當作它真的懂了你的拍號。

> [!tip] 實務連結
> 收到來源沒有標 BPM 的 Loop，先試聽判斷一拍與一小節，再與 Source Tempo 對照。×2／1/2 是修正 beat interpretation 的工具，不是一定要讓演奏突然快兩倍或慢一半。

## Event Sensitivity 篩選的不是音量門檻

Sensitivity 依 confidence 隱藏或保留偵測事件。降低它會先移除不明確的 transient；但重要的 kick 也可能比 hi-hat 更不明顯，所以要視需要先 Promote。REX slices 轉成 100% confidence 的 Event，原書指出 sensitivity 在 99% 至 1% 間不會過濾它們，0% 才會把所有 marker 也濾掉。

Reset 回復與 original file 相符的 event analysis，並把 sensitivity 回到 100%。這不是把所有已作的 mix 都重設；它作用於分析資料。Pro Tools 的 `.aan` 暫存位在 Rendered Files，未使用的暫存會在關閉 Session 時清理。

> [!warning] Clipping 應在 Elastic Audio 輸入前處理
> 若 TCE 造成 overload，降低 Elastic Properties 的 Input Gain，而不只把 Track Fader 拉低。後者可以讓最後輸出比較小，卻不能回頭修正前段處理已過載的結果。Real-Time 波形也只是近似顯示，判斷仍需看處理指示並聽實際播放。

## Pitch Shift 不是所有演算法都做同一件事

本章主要的 Clip-based pitch shifting 說明列 Polyphonic、Rhythmic 與 X-Form，範圍為 ±2 octaves。選完整 Clip 後，可在 Elastic Properties 直接調 semitones／cents，或到 Event Operations > Transpose。不能只選到一部分 Clip 就期待整段變調，也不能直接對 looped Clip 或 Clip Group 套用同一套命令。

| 需要 | 做法 | 留意 |
|---|---|---|
| 整段上／下移固定音程 | Pitch Shift／Transpose By | 選完整 Clip、確認演算法支援 |
| 改時間又像磁帶改 pitch | Varispeed | time 與 pitch 連動 |
| 回復原 pitch | `Clip > Remove Pitch Shift` | 與 Remove Warp 是不同命令 |
| 按調性移 MIDI note | Transpose In Key | 這是 MIDI 的功能，不是 Audio Clip 同樣可用 |

原書不同段落對 Elastic Audio 的 Transpose semitone 範圍有不一致文字（Ch45 主要描述 ±2 octaves，Ch48 的欄位說明另列更大範圍）；本篇不將兩者拼成一個無條件保證，操作以實際演算法與有效範圍為準。Monophonic 不提供本章列的獨立 pitch transposition；Varispeed 會把時間與 pitch 綁在一起。élastique Pro 的 Formant／Voicing 則另見前篇對應演算法。

## 跨 Track 搬動，可能順便 Commit

| 從哪裡 → 到哪裡 | 結果 |
|---|---|
| Real-Time EA → Rendered EA | 以目的 Track 演算法渲染 |
| Real-Time EA → 未啟用 EA | 以來源 Track 演算法渲染並 Commit |
| Rendered EA → Real-Time EA | 改以目的演算法即時處理 |
| Rendered EA → 未啟用 EA | Commit 至目的 Track |
| 一般 Audio → 已啟用 EA | 分析來源，再用目的 Track 演算法處理 |

若 Apply AudioSuite 到 Elastic Audio Clip，Pro Tools 會先 render Elastic Audio，再做 AudioSuite，最後對新的結果重新分析。這是處理邊界的改變：不是所有原來的調整都永遠維持為可自由切換的即時參數。

### 交接前的核對順序

1. 確認 Source Tempo／Length／Meter 不是倍速或拍號誤判。
2. 聽句首 transient、強拍與尾音，必要時回 Analysis 修 marker。
3. 檢查 clipping，從 Elastic Audio Input Gain 修正。
4. 確認要保留可變 Tempo 的即時來源，還是要 Commit 固定成 Audio。
5. 移到沒有 EA 的 Track 或用 AudioSuite 前，先理解這會觸發 render。

> [!tip] 實務連結
> 交檔給別的系統時，保留原始 Track，加上一份已 Commit 的聲音版本。對方即使不具備相同演算法，也能聽到目前 timing；自己則保留後續改拍號、速度與修 marker 的可能。

![[PT-Ch45-warp-map.png]]

> [!abstract] Takeaway
> 先修 metadata，再修 Warp。Sensitivity 不是 Threshold，Input Gain 是處理前增益；跨 Track 搬動與 AudioSuite 都可能把即時 Elastic Audio 固定成新的音訊。保持 source 與可交付聲音兩層資料，才能兼顧修改與交換。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch45b-Warp與Analysis的時間修正]]

下一篇：[[PT-Ch46-Melodyne整合與Audio轉MIDI]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch45a-ElasticAudio啟用與演算法]] · [[PT-Ch45b-Warp與Analysis的時間修正]]

跨章延伸：[[PT-Ch48a-Quantize與Groove的節奏整理]] · [[PT-Ch46-Melodyne整合與Audio轉MIDI]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
