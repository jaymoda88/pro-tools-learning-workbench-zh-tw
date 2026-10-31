---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 53
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1217–1227"
pdf_pages: "1249–1259"
source_version: "2023.3"
---

# Ch53c — Breakpoint編輯與Trim整合

> 編輯 automation 時，邊界點決定局部修整會不會牽動遠處；Cut 與 Delete 不是同一個聲音結果。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1249|Chapter 53，原書 p. 1217–1227／PDF p. 1249–1259]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Breakpoint 的上下與左右，各改一種維度

在對應 Track View 或 Automation Lane，用 Grabber／Pencil 點線加 breakpoint，上下拖改 value，左右拖改 time，Option-click 刪除。Volume 上下是 dB；Pan 依原書顯示方向，上方偏左、下方偏右；Mute 則是 switched states，不能套用一般連續 curve 的聽感直覺。

| 操作 | 結果 | 邊界注意 |
|---|---|---|
| 拖單點 | 改一個時間／值 | 左右相鄰點之間的 slope 也變 |
| 選多點再 Nudge | 整段早／晚移動 | 系統可加 anchor 保住選區內形狀 |
| Trim tool 拖選區 | 整段上／下修 | 選區前後通常建立 anchor |
| Option 配合 Trim | 抑制特定 anchor 建立 | 可能影響更外側銜接 |
| Command+Shift-drag 單點 | 垂直限制且較精細 | 避免意外改時間 |

> [!tip] 實務連結
> 人聲單句整體太小，先選該句加邊界再 Trim，比逐個 point 拉高容易保留騎乘形狀。修完聽句首與句尾，確定沒有因 anchor 位置把呼吸或下一句也帶高。

## 為什麼 Cut 後平穩，Delete 後卻出現長斜坡？

Cut automation 會在選區邊界留下 anchor，保留外側的值與 slope；Delete 直接移除點，原本前後的既存點會跨越空缺重新連線。如果本來前一點低、後一點高，刪中間一大段可能變成一條長 ramp。

| 方法 | 會留下什麼 | 適合 |
|---|---|---|
| Cut | 邊界 anchor，資料進剪貼簿 | 搬走局部資料又保住外側 |
| Delete | 移除所選點，兩側重新相連 | 想重新構成整段形狀 |
| Clear Special | 指定 type 的資料被清 | 不動 Audio／MIDI notes |
| Paste | 在目的邊界加 anchor | 保留附近原有 automation 關係 |

空 automation playlist 若只有初始值，與含實際時間點的 playlist 不同；無可複製 data 時，不能只靠選一個範圍就以為有一段曲線進剪貼簿。需要先建立有效點，或採 snapshot 流程。

> [!warning] 選到 Master View，可能不只改目前看見的曲線
> Audio 的 Blocks／Waveform、MIDI／Instrument 的 Blocks／Clips／Notes 是主要內容 view。跨多軌編輯時，只要有 Track 在 Master View，可能影響全部相關資料。若只想剪 Pan，讓操作明確限定該 automation type，或用 Special commands。

## Special commands 只搬控制，不搬聲音

Cut／Copy／Clear Special 可選 All Automation、Pan Automation 或目前顯示的 Plug-In Automation；Paste Special 提供 Merge、Repeat to Fill Selection，以及 To Current Automation Type。

| 想做什麼 | 命令思路 | 限制 |
|---|---|---|
| 複製 Reverb throw 曲線，不複製 Audio | Copy Special 相應 automation | 目的 Track 要有相應 Send／Plug-In |
| 每次 Loop 都套同一段變化 | Paste Special > Repeat to Fill Selection | 最後不足一段會截短 |
| 將 Left Pan curve 改貼 Right Pan | Paste Special > To Current Automation Type | 每軌 clipboard 限一種來源 playlist |
| 合併 MIDI controller | Merge | 不要推定 automation 與 MIDI CC 能互換 |

不能把 Audio automation 與 MIDI controller data 任意互貼；continuous controls 與 switched／stepped controls 也不能因數值範圍類似就當成同一種。目的 Track 沒有相應 Plug-In／Send 時，相關 data 可能被忽略。

## Group editing 與單獨例外

Track 是 active Edit Group 成員時，automation 編輯會連帶其他成員，即使其他 Track 沒顯示同一條 lane。要只改一條成員，Mac 按住 Control 執行操作，暫時 suppress grouped behavior。Multi-mono unlinked Plug-In 可在 lane 查看各 channel automation，但重新 link 可能改變資料的獨立性。

> [!tip] 實務連結
> 剪多麥鼓 automation 時 Group 能保持一致；但只修一支 room mic 的 pumping，要先暫時解除連動。畫面沒顯示其他成員曲線，不代表它們沒有被修改，這是編輯後比對的重要理由。

## Glide：在選區內從既有值過渡到新值

Studio／Ultimate 的 `Edit > Automation > Glide to Current／Glide to All Enabled／Glide Pan Only`，用選區長度決定 transition。先選範圍，再設想要的終點值，最後 Glide。若沒有 selection，行為不等於自動知道你的段落長度；它會用當前位置與後續資料關係處理。

| 方式 | Mac | 用途 |
|---|---|---|
| Glide to Current | Option+/ | 目前顯示 type 的過渡 |
| Glide to All Enabled | Option+Shift+/ | 多參數一起轉場 |
| Glide Pan Only | Control+Shift+/ | 只處理 Pan，避免動到其他已啟用類型 |

Glide 結尾後若沒有下一個 breakpoint，新值可能繼續到 Track 結尾。局部轉場前先保護右側內容，不要只盯選區裡好看的斜線。

## Trim 何時合併進主曲線？

Coalesce Trim Automation 有 After Every Pass、On Exiting Trim Mode、Manually 三種策略。前者每次停止即固定到 main，後兩者先保留獨立 Trim playlist，供比較、重修或清除。手動 `Track > Coalesce Trim Automation` 後，delta 合入 main，Trim points 清除、fader 回零。

| 策略 | 優點 | 代價 |
|---|---|---|
| After Every Pass | 操作後主曲線直接更新 | 不再保留獨立那次 Trim layer |
| On Exiting Trim Mode | 可先多次修整 | 離開模式時要知道會 commit |
| Manually | 最明確控制何時固定 | 需要自己管理未 coalesce 的 layer |

![[PT-Ch53-automation-modes.png]]

> [!abstract] Takeaway
> 局部修整先保護邊界。Cut 留 anchor，Delete 讓外側點跨空缺相連；Special commands 才能清楚只搬 automation。Group 與 Multi-mono 有自己的連動範圍，Trim coalesce 時機也要在編輯前決定。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch53b-Automation錄寫與保護]]

下一篇：[[PT-Ch53d-WriteTo快照與Preview工作流]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch53a-Automation模式與資料層]] · [[PT-Ch53b-Automation錄寫與保護]] · [[PT-Ch53d-WriteTo快照與Preview工作流]] · [[PT-Ch53e-VCAAutomation與Coalesce]]

跨章延伸：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch44a-ClipGain與音量整理]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
