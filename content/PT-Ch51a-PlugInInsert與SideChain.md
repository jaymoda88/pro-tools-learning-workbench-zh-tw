---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 51
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1147–1162"
pdf_pages: "1179–1194"
source_version: "2023.3"
---

# Ch51a — PlugInInsert與SideChain

> Insert 是串在訊號路上的處理；弄清楚順序、格式與旁路狀態，才能知道你比較的到底是哪一個聲音。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1179|Chapter 51，原書 p. 1147–1162／PDF p. 1179–1194]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Insert 在路上，Send 則把訊號分出去

Insert 把 Track 的訊號送進 processor，再直接回到同一條 Track，按 slot 順序串接。Audio、Auxiliary Input、Routing Folder、Instrument 的 Inserts 在 Fader 前，Master Fader 的在後；Mix window 從上往下，Edit window 從左往右。改順序就是改處理關係，不是單純整理畫面。

| 類型 | 運算／訊號位置 | 何時用 |
|---|---|---|
| Native Plug-In | Host CPU，即時處理 | 一般軟體混音與製作 |
| DSP Plug-In | 相應 DSP 硬體，即時處理 | HDX／受支援 Hybrid 系統 |
| AudioSuite | 離線渲染檔案 | 需要固定片段處理；見 Ch43 |
| Hardware I/O Insert | 實體 output → device → 對應 input | 外部 compressor、EQ 等 |

原書在多數段落列 A–J 共十個 Inserts；Ch50 的一處 Master Fader 描述仍寫五個，但同章後文與本章列十個。查實際 slot 請顯示 A–E 與 F–J，不把舊句當成全面限制。

> [!tip] 實務連結
> 去齒音放在大幅增亮的 EQ 前後，detector 收到的聲音不同；Compressor 放在 saturation 前後，控制 peak 的方式也不同。先說明自己要改的是輸入還是輸出，再決定順序，比照抄別人的 Plug-In chain 有用。

## Channel format 決定後面還能接什麼

| 格式 | 基本行為 | 限制與判斷 |
|---|---|---|
| Mono | Mono in／out | 一條聲道的處理 |
| Mono in／Stereo out | Mono source 產生 Stereo result | 此 slot 後的路徑已是 Stereo |
| Stereo／Multichannel | 多聲道聯合處理 | channel 控制通常連動，依 Plug-In 而異 |
| Multi-mono | 每 channel 一份 Mono processor | 預設 linked，可按需求解除 |

Mono Track 插入 mono-to-stereo Reverb 後，後面的 Insert 也要支援該 Stereo 路徑。Multi-mono 與真正 Stereo compressor 也不必然有一樣的 detector linking，即使兩邊顯示相同參數，也不能直接認定聲像反應完全一樣。

## Bypass 與 Inactive：聽感比較、資源管理分開做

Command-click Plug-In Insert button 可 Bypass，按鈕變藍；Multi-mono 只有部分 channel bypass 時可呈紫色。Command+Control-click 使 Insert inactive，保留 assignment、設定與 automation，但釋放相應資源。硬體 Insert 沒有相同的 Plug-In bypass control，需要設備自己的 bypass、No Insert 或 inactive。

| 目的 | 動作 | 代價／留意 |
|---|---|---|
| A/B 有無效果 | Bypass | 不等於釋放 CPU／DSP |
| 暫時不使用以省資源 | Inactive | 無法改／寫該 Plug-In automation |
| 暫時比較所選 Track 整套處理 | Shift+A | 不要誤認成刪除 Insert |
| 只比 EQ／Dynamics 等 | Shift+E／Shift+C；其他類型見快捷鍵頁 | 複合 Channel Strip 可能只旁路其中區塊 |
| 複製設定與 automation 到另一 slot | Option-drag | 覆蓋既有 Insert 會替換其 automation |

原書禁止錄音中新增、移除、搬動與複製 Plug-In。工程開啟時顯示 inactive，先查是否未安裝、格式不存在、資源不足或 DSP／Native substitution 不支援，不是所有斜體項目都代表使用者手動關掉。

## 找 Plug-In 與控制視窗

Insert selector 開啟後，直接打字、按 Tab 或選 Search 可搜尋，鍵入幾個字再用上下方向鍵、Return 載入。Display preferences 可按 Flat List、Category、Manufacturer 或兩者組合排列；Mixing preferences 可指定 Default EQ／Dynamics。Command-click selector 再選某 Plug-In 可標成 Favorite。

一般點 Plug-In button 打開 targeted window；Shift-click 開額外視窗，或關閉 Target 使目前視窗留著。多視窗時，Tab 與 preset 快捷鍵仍依 Target 決定焦點。滑鼠微調參數可 Command-drag，Option-click 回預設；按 Tab 移下一個數值欄，Shift+Tab 回上一欄。Numeric keypad Enter 確認後留在數值編輯，主鍵盤 Return 確認後離開編輯狀態。

> [!warning] 「換聲道數複製」不是無條件保留所有 channel automation
> 把 Multi-mono 從一種 width 搬到另一種 width，可能要求重新 link。若原來各 channel 已有不同 automation，先備份，再確認重新連動如何處理差異。拖在既有 Insert 上也會直接取代它，而不是自動插到前面。

## Side-chain：detector 聽什麼，與主音訊是兩條路

外部 Side-chain 以另一條 input／bus 作 Key Input，讓 processor 的觸發不只取決於自己的主音訊。先指定 Key Input，再在 Plug-In 內啟用 External Key；只選了路徑，不代表 detector 已切換。Key input 在本章的標準宿主控制中是 monophonic。

1. 將想觸發的 source Send 或 output 路由到指定 bus。
2. 在受控 Plug-In 的 Key Input selector 選同一條 bus。
3. 啟用 External Key，播放並開 Side-Chain Listen／Key Listen 確認 detector 真正收到的內容。
4. 必要時用 Side-chain filters 篩掉不該觸發的頻帶。
5. 關掉 Listen，調 Threshold、Attack、Release，聽主音訊的結果。

| 情況 | 檢查 |
|---|---|
| 選 Key Input 仍沒有動作 | External Key 是否已啟用、source Send 是否有 level |
| Kick 一來整條 Bass 都塌下去 | detector filter、threshold 與 release 是否符合節奏 |
| 兩路聽起來不對時 | Compensate Side Chains 與 delay reports |
| 想移除多輸出 Plug-In 卻不行 | 先取消其已指派的 output busses |

> [!tip] 實務連結
> 用 Kick 觸發 Bass 的 ducking，先確認你真的想讓 Bass 音量跟 Kick 的事件變化，而不是用 side-chain 代替低頻平衡。如果只有少數衝突，Clip Gain 或局部 automation 也可能更清楚。工具連得上只是開始，觸發節奏才是結果。

![[PT-Ch51-insert-paths.png]]

> [!abstract] Takeaway
> Insert 順序與 channel format 決定處理路徑；Bypass 作比較，Inactive 才是資源管理。Side-chain 要同時接對 Key Input、啟用 External Key 並試聽 detector。多輸出與 Multi-mono 結構在搬動時，連同 automation 一起檢查。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch50d-DelayCompensation與Dither]]

下一篇：[[PT-Ch51b-Preset與MultiMono控制]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch51b-Preset與MultiMono控制]] · [[PT-Ch51c-HardwareInsert與數位Clock]]

跨章延伸：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch52-DSPMode與低延遲錄音]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
