---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 53
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1228–1243"
pdf_pages: "1260–1275"
source_version: "2023.3"
---

# Ch53d — WriteTo快照與Preview工作流

> 先 audition、再固定，是處理複雜 automation 的好方法；Write To、Snapshot、Preview 與 Capture 各自負責不同階段。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1260|Chapter 53，原書 p. 1228–1243／PDF p. 1260–1275]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Write To：把剛找到的值延伸到明確範圍

Studio／Ultimate 提供 Write Automation to Start、End、All、Next Breakpoint、Punch Point。這組動作通常在 transport 運行且參數正寫入時使用，不能把它與 stopped transport 的 Snapshot 編輯混為一談。只有 write-enabled 且符合起寫條件的參數會受影響。

| 命令 | 寫到哪裡 | 常見使用情境 |
|---|---|---|
| To Start | 向前到 Track／selection 起點 | 找到適合的值，回填段落開頭 |
| To End | 往後到 Track／selection 結尾 | 延續某場景設定 |
| To All | 整個 Track／selection | 整段套用固定狀態 |
| To Next Breakpoint | 到下一個既有 point | 不覆蓋後面已寫好的轉折 |
| To Punch Point | 回到本次開始寫入的位置 | 邊聽邊找值，之後回補這次 pass |

Write On Stop 可在有效 pass 結束時自動作同類操作；部分按鈕可用 Option-click 讓狀態跨 pass 保留。這很有效率，也很容易在忘記關閉時把後續 pass 送到更廣範圍。Write To 原則上作用於正在寫的 Track；Option+Shift-click 對應按鈕可限定選取 Track。

> [!warning] 未做 selection 時，All／Start／End 的範圍可能是整條 Track
> 不要把「現在正在看的一小段畫面」當成編輯邊界。動作前看 selection、playback、write-enable 與參數狀態，再看 warning；需要時先在複本練習。

## Snapshot：把一組控制狀態寫到選區

Snapshot 在某個時間位置或 selection 一次寫入多參數值，常用於場景切換、段落音色與多參數設定。先 enable 要變的 type、關掉要保留的 type，確保 playlist 已有有效 breakpoint，再設好控制並選 `Edit > Automation > Write to Current／Write to All Enabled`。

| 寫入位置 | 行為 | 先保護什麼 |
|---|---|---|
| Selection | 以該範圍套值，前後用 anchor 保護 | 需要保留的左右內容 |
| Cursor | 當前位置寫值，往後連到下一 point | 沒有下一點時可能維持到結尾 |
| 完全空 playlist | 可能改整條初始值 | 先在需要的邊界加點 |
| 既有 automation | 移游標時控制可能被讀取資料更新 | 暫時 Off／suspend 以保留準備的值 |

> [!tip] 實務連結
> 一場室內對話換成下一場室外，可能同時改 EQ、Reverb Send、Pan 等。Snapshot 能讓這些設定在明確場景範圍一致切換；但需要先界定哪些參數跟場景，哪些如人聲 rider 仍要保留原來變化。

用 Trim to Current／Trim to All Enabled 可把相對 delta 套成 snapshot，而非改成單一絕對值。這與 real-time Volume Trim 的操作思路相近，但仍要看所選命令支援範圍，不能把所有控制都當成普通 dB fader。

## Preview：先脫離曲線，安心 audition

Preview mode 讓 writable Track 上已啟用的控制，觸碰後進入 isolated state，暫時不讀也不寫原 playlist。你可以邊播邊試新值，直到滿意再 Punch Preview，才真正寫入。它是聲音設計與 automation 資料之間的緩衝區。

1. Track 設 Touch／Latch／Touch-Latch 等可寫模式。
2. 在 Automation window 開對 type，再開 Preview。
3. 觸碰或移動要試的控制，使其 isolated。
4. 播放試聽、與原 automation 比較。
5. 確定後按 Punch Preview，再按需要用 Write To 延伸。
6. 結束時檢查 Preview／Latch 等狀態，避免下一段仍在接管。

| Preview 操作 | Mac／方法 | 效果 |
|---|---|---|
| 暫停／恢復 Preview 比較 | Command-click Preview | 在 audition 與原 automation 間比較 |
| 所有 enabled controls 進 isolated | Option-click Preview | 比逐個碰更快 |
| 只對 selected Tracks | Option+Shift-click Preview | 限定範圍 |
| 讓某 Track 回到原曲線 | Command-click mode selector，或改 Read／Off 等 | 退出其 isolated 狀態 |
| Punch Preview | 點已亮的 Punch Preview | 讓試好的值開始寫入／prime |

Playback 中 Punch 會以 Latch 寫入；stopped transport 時 Punch 會 prime 值。Preview 的這個 priming 不要求另外開 Allow Latch Prime in Stop。尚未 Punch 前的 Write To 主要只作用於 isolated controls，且 Next Breakpoint 有特例；因此第一次用時，優先採選區與明確命令，不靠模糊「應該會套上」的推測。

## Capture：把一個位置的狀態帶到別處

Capture 暫存當前 automation values，Punch Capture 把它們套到其他位置。它不是 Copy Audio，也不是完整儲存一份 Session。一般系統可 capture 一組狀態；原書 ICON 支援最多 48 snapshots，屬特定控制器能力。

| 工具 | 保存／操作 | 目的 |
|---|---|---|
| Preview | 隔離控制並試聲音 | 還不改原曲線 |
| Capture | 暫存一組參數狀態 | 把狀態帶到另一位置 |
| Punch Capture | 寫入已 capture 狀態 | 在目的位置採用它 |
| Punch Preview | 寫入試聽後的 isolated 值 | 確認 audition 結果 |

通常 Capture 針對 actively writing、enabled controls；Option-click Capture 可以擷取所有合格控制，Option+Shift 限定選取 Track。Punch 的 scope 也有相應擴大方式，一般 Read／Off 與擴大操作的影響不同，操作前先核對哪些 Track 會被帶入 Latch。

> [!tip] 實務連結
> 已有 chorus 的 delay／EQ 狀態，想拿到下一個 chorus 先試，不必直接覆蓋。Capture → 到目的位置開 Preview → Punch Capture 載入試聽 → 再 Punch Preview，讓「取樣狀態」與「正式寫入」分開。

![[PT-Ch53-automation-modes.png]]

> [!abstract] Takeaway
> Write To 延伸正寫入的值，Snapshot 把狀態寫到選區，Preview 先 audition，Capture 把狀態搬到別處。所有快速命令都必須對照範圍與 enabled parameters；完成後回到可預期的 Read／保護狀態。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch53c-Breakpoint編輯與Trim整合]]

下一篇：[[PT-Ch53e-VCAAutomation與Coalesce]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch53a-Automation模式與資料層]] · [[PT-Ch53b-Automation錄寫與保護]] · [[PT-Ch53c-Breakpoint編輯與Trim整合]] · [[PT-Ch53e-VCAAutomation與Coalesce]]

跨章延伸：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch44a-ClipGain與音量整理]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
