---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 45
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1009–1022"
pdf_pages: "1041–1054"
source_version: "2023.3"
---

# Ch45a — ElasticAudio啟用與演算法

> Elastic Audio 讓 Audio 服從時間設計，但是否跟 Tempo 變速、用哪種演算法，是兩個要分開決定的問題。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1041|Chapter 45，原書 p. 1009–1022／PDF p. 1041–1054]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Sample-based 可以 Warp，Tick-based 才會自動跟 Tempo

Elastic Audio 先分析 audio file 的 transient events，再用 Event marker 作為時間操作參考。它能幫 Loop 對齊 Session Tempo、修正演奏 timing、做 remix，也能用明顯變速與變調創造特殊效果。啟用功能，不代表任何 Audio 一定自動跟著速度改變。

| Track 狀態 | 手動 Warp／Quantize | Session Tempo 改變時自動 TCE |
|---|---|---|
| Sample-based，未開 Elastic Audio | 一般 Clip 編輯 | 不會 |
| Sample-based，已開 Elastic Audio | 可以 | 不因 timebase 自動 conform |
| Tick-based，已開 Elastic Audio | 可以 | 會依 Tempo map conform |

在 Track 的 Elastic Audio Plug-In selector 選演算法即啟用。原有 Clip 會暫時灰掉，因為程式在分析；完成後回來。**分析以整個 source file 為單位**，即使只用其中一小段，也可能需要等完整來源分析，並非選區越短一定越快。

> [!tip] 實務連結
> 固定對畫面的 Foley 即使需要小幅拉長，仍可保留 sample-based；要跟編曲速度一起變的鼓 Loop，才用 tick-based。音訊能拉時間，與音訊應不應該受全曲 Tempo 影響，是製作決策而非同一顆開關。

## 先用一個 Loop 理解整個流程

1. 開 Workspace，先用 Preview 聽原速。
2. 打開 Audio Files Conform to Session Tempo，再 Preview，確認對到當前 Tempo 的結果。
3. 保持 Conform 開啟，把素材拖到 Tracks List，建立 tick-based、Elastic Audio-enabled Track。
4. 若空 Session 詢問是否匯入來源 Tempo，想維持 Session Tempo 就選 Don't Import。
5. 改變 Session Tempo，聽它是否跟著變；之後才開 Quantize、選 Elastic Audio Events 修節奏。

這條流程同時驗證音檔分析、Timebase 與 Conform 狀態，比一開始塞滿幾十個來源再排查容易。Preview 聽不到要先檢查 Audition Path，而不是馬上換演算法。

## 演算法是針對素材選擇，不是由新到舊排序

| 演算法 | 原書建議素材／用途 | 重要條件 |
|---|---|---|
| Polyphonic | 複雜 Loop、多樂器混音，一般用途 | 可調 Window 與 Follow；支援 Clip-based pitch shifting |
| Rhythmic | 明顯 attack 的打擊樂 | Decay Rate 決定拉伸後 transient 間填補音的衰減 |
| Monophonic | 人聲、Bass 等單音線條 | 分析音高，耗時較多；不支援本章舊式 Clip pitch transposition |
| Varispeed | tape-like speed／pitch 效果 | 時間與 pitch 連動，不能當成獨立保音高拉伸 |
| élastique Pro | 一般用途、較長素材或整曲 | 原書新增說明 Formant／Voicing 控制 |
| X-Form | Rendered TCE、需要考慮較高品質的輸出 | 只支援 Rendered；提供 Quality 與 Formant |

原書開啟 selector 的早期步驟列舉較少名稱，後續 p.1022 另有 élastique Pro；本表整合本章的實際內容，不將它遺漏。p.1035 的舊式 pitch 支援清單主要仍列 Polyphonic／Rhythmic／X-Form，實際控制請按所選演算法面板核對，別把所有模式的參數混在一起。

Polyphonic 的 Window 是分析時間窗，不是 Track Buffer。原書建議一般用途 30–40 ms、percussive 20 ms 或更低、pad／legato 60 ms 或更高。這些是試驗起點；聽 transient、尾音與 modulation artifact，比照抄數字重要。Rhythmic 的 Decay Rate 越大，越能聽到填在 transient 之間的聲音；太低可能像每一下迅速被收尾。

> [!warning] Monophonic 不代表「任意 Mono Track 都選它」
> Mono／Stereo 是 channel format，Monophonic 指音樂內容的單音特性。單聲道錄到整個鼓組或多個和弦樂器，依然不等於適合單音演算法。相反地，Stereo 錄音也可能包含主要單音線條。

## Real-Time 與 Rendered，先換計算方式，不急著固定來源

| 方式 | 改動後 | 系統負擔 | 資料位置 |
|---|---|---|---|
| Real-Time Processing | 立即反映 | 播放時 CPU 較重 | 即時依 source 處理 |
| Rendered Processing | Clip 暫時 offline，重新計算 | 播放較輕 | Session 的 Rendered Files 暫存 |
| Commit Elastic Audio | 產生正式新檔 | 不再依原 Track 的即時 Elastic Audio | Audio Files |

Rendered 每次依原始 source 重新算，避免多次改動造成疊代音質損失；它不是每次都拿上一個已拉伸的版本繼續拉。X-Form 只有 Rendered，不能直接視為 Native Insert 或一般 AudioSuite 使用。

關閉 Elastic Audio 時，Cancel 是維持原狀，Revert 是回原始 duration，Commit 才是保留處理結果寫成新檔；這個選擇會作用於 Track 的**全部 Playlist**。原書說 committed Clip 在可用來源範圍內還會包括前後 5 秒素材，不要把它當成能創造來源沒有的錄音。

> [!tip] 實務連結
> 編曲還在改 Tempo 時，用 Real-Time 保持回饋；CPU 不夠可先改 Rendered。等 timing 真正確定、準備交接，再 Commit。配樂含多個 cue 時，Tempo change 還可能改後面 cue 的 Timecode 位置，調速後要檢查整條 Timeline。

![[PT-Ch45-warp-map.png]]

> [!abstract] Takeaway
> Timebase 決定與 Tempo 的關係，演算法決定如何重建聲音，Processing mode 決定何時計算。先把三件事分開，才能知道灰掉是在分析、聲音怪是演算法不合，還是時間變了其實只是 tick-based 的正常反應。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch44b-ClipEffects與片段處理鏈]]

下一篇：[[PT-Ch45b-Warp與Analysis的時間修正]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch45b-Warp與Analysis的時間修正]] · [[PT-Ch45c-ElasticProperties與轉檔邊界]]

跨章延伸：[[PT-Ch48a-Quantize與Groove的節奏整理]] · [[PT-Ch46-Melodyne整合與Audio轉MIDI]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
