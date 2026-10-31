---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 47
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1047–1051"
pdf_pages: "1079–1083"
source_version: "2023.3"
---

# Ch47a — Commit固定處理與交接

> Commit 把目前處理結果變成新的 Audio Track，讓修改、運算負擔與交接相依性各有清楚的邊界。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1079|Chapter 47，原書 p. 1047–1051／PDF p. 1079–1083]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## 先問：哪些處理要固定，哪些要繼續調？

Commit 從 source Track 產生新的 Audio Track，適合減少 Plug-In 負擔，或讓沒有相同 Plug-In 的合作對象也能聽到既定聲音。它可以用於 Audio、Auxiliary Input、Instrument，以及 MIDI output 指向 Instrument Plug-In 的 MIDI Track；不能直接把指向外部 MIDI 硬體的 MIDI Track 當成同一種離線 render。

| 處理內容 | Commit 結果 | 你要決定的事 |
|---|---|---|
| Clip Gain／Clip Effects | 固定成 Audio | 後續改素材增益時不再是原層級 |
| Elastic Audio／Melodyne | 固定成 Audio | 保留 source 才有原本細修彈性 |
| Inserts | 全部 render，或只到指定 Insert | EQ／Compressor 是否還要繼續調 |
| HEAT | Pre-Insert 時 render | 依實際 Pre／Post 位置確認 |
| Volume／Mute、Pan | 可選是否 render | 固定混音動作，或保留 automation |
| Sends、Group assignments | 可選複製 | 新 Track 是否接回原混音關係 |

> [!tip] 實務連結
> 虛擬鼓音源很吃資源，但你還想調鼓的 EQ。對音源 Insert 右鍵選 Commit Up To This Insert，就能先把樂器變成 Audio，讓後續混音處理保持可調。不必為了省 CPU，把尚未確定的整條混音鏈全部燒進去。

## Commit dialog 的每個選項都有交接意義

選 Track 後 `Track > Commit`，Mac Option+Shift+C；或對欲固定的最後一個 Insert 右鍵 `Commit Up To This Insert`。先選 Selected Tracks 還是 Edit Selection，才決定輸出範圍。啟用 Consolidate Clips 會產生單一連續 Clip；關閉則盡量保留來源邊界。

| 選項 | 開啟時 | 關閉時 |
|---|---|---|
| Consolidate Clips | 合成單一新 Clip | 保留各 Clip 邊界（處理尾韻可能改變） |
| Render Volume and Mute | 音量與靜音固定成 Audio，對應新 automation 回預設 | 複製原 automation 到新 Track |
| Render Pan | 固定 Pan 與可能的輸出 channel width | 複製 Pan automation |
| Copy Sends／Group Assignments | 新 Track 取得對應控制關係 | 需自行重接 |
| Offline | 以離線方式運算 | Real-time；可納入 Hardware Insert 處理 |

Source Tracks 可選 Hide and Make Inactive、Make Inactive、Delete、Do Nothing。初次交接用保留 source 的方案比較容易比對；Do Nothing 同時讓兩條 Track 都 active 時，播放前要處理重複聲音，避免把音量變大誤判成 Commit 更好聽。

> [!warning] Sends 並非所有組合都能原樣複製
> 若 render Pan 造成 channel width 改變且 FMP 未啟用，或 render Volume 同時遇到 pre-fader send，原書列有不能直接 copy send 的情況。先看 dialog 與實際 routing，別只勾「全部複製」就認定結果與 source 等價。

## 尾韻、Noise floor 與多路輸出

Commit 不一定在原 Clip 尾端立刻停。若 reverb／delay 還有訊號，會繼續 render，直到低於原書所列 −144 dBFS；若尾韻連到下一個 Clip，可能合成一段。刻意模擬底噪的 amp Plug-In 也可能把 render 邊界拉長。這不是自動「多出一段空白」，而是 source processing 的輸出還沒歸到停止條件。

一條 Track 若送到多個不同 channel width 的 output，而且有 render Pan，可能按各 width 產生不同新 Track；同 width 的多個路徑則不必各產一份。音源有 Auxiliary Output Sends 時，Commit 會詢問是否連帶處理接收那些 output 的 Track；多輸出鼓音源要連同接收軌一起思考。

### MIDI 與音訊輸出的練習

1. 選一條 Instrument Track，將 source 保留但設 inactive。
2. Commit 到音源 Insert，不固定後面的 EQ。
3. 比較新 Audio 的起點、尾韻與力度；確認 MIDI source 不再重複發聲。
4. 若多條 MIDI Track 共用一個 Instrument Plug-In，只選要 render 的那幾條，確認沒有把未選的演奏混進來。
5. 檢查新 Track 的 output、sends 與 automation，最後才整理命名。

## Rendered File Bit Depth

Processing preferences 的 Rendered File Bit Depth 可選 Always Use 32-bit 或 Follow Session Settings。原書建議 32-bit 以保留 render 的數值範圍；若跟隨 16／24-bit Session，有可能因從 floating-point 轉定點而 clipping。這是 render 檔案格式選擇，不代表你交付 final mix 一律要用相同 bit depth。

| 若你的目的是 | 建議先確認 |
|---|---|
| 省 CPU | source 是否 inactive、render 到哪個 Insert |
| 換機器繼續混 | 哪些 effects／automation 已固定，哪些還依賴 Plug-In |
| 交乾素材 | Volume／Pan／time-based processing 是否該 render |
| 交聽感固定版 | 尾韻、channel width 與 routing 是否完整 |

![[PT-Ch47-render-choice.png]]

> [!abstract] Takeaway
> Commit 的核心是選擇處理邊界。先定範圍、render 到哪個 Insert、Volume／Pan 是否固定，再安排 source 狀態。新 Audio 有聲音只是第一關；尾韻、sends、channel width 與 bit depth 才決定它能不能可靠交接。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch46-Melodyne整合與Audio轉MIDI]]

下一篇：[[PT-Ch47b-Freeze與TrackBounce的使用時機]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch47b-Freeze與TrackBounce的使用時機]]

跨章延伸：[[PT-Ch51a-PlugInInsert與SideChain]] · [[PT-Ch50a-混音Track與訊號流]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
