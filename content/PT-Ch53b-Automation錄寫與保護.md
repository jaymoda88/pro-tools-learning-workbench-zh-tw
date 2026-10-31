---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 53
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1202–1216"
pdf_pages: "1234–1248"
source_version: "2023.3"
---

# Ch53b — Automation錄寫與保護

> 可靠的 automation pass 要同時開啟參數、Track mode 與正確的操作焦點，保護也要選對是停寫還是停讀。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1234|Chapter 53，原書 p. 1202–1216／PDF p. 1234–1248]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## 開始寫入前，先檢查三層開關

`Window > Automation` 決定全域哪些 type 能寫，Track Automation Mode 決定該軌的寫入規則，Plug-In 還要啟用自己的個別參數。少一層，推 fader 或轉 knob 都可能只是在暫時 audition，不會留下資料。

| 層級 | 檢查 | 例子 |
|---|---|---|
| 全域 type | Automation window 是否 enabled | Volume、Pan、Plug-In、Send level |
| Track mode | 是否可寫 | Touch／Latch／Write |
| Plug-In parameter | Auto dialog 是否加入該控制 | Filter cutoff 已加入，resonance 尚未加入 |
| Safe／Suspend | 是否受保護 | 參數看似 enabled，仍不允許覆寫 |
| Transport | 目前是播放／錄音、設定是否允許 | 錄音中寫 automation 需 Enable Automation in Record |

### 第一個可以驗證的 pass

1. 選一條 Track，在 Automation window 只開必要 type。
2. 先在明確範圍播放，使用 Touch 修一小段。
3. 放手後聽 AutoMatch 是否自然回原曲線。
4. 停止並顯示相應 automation lane，核對實際留下的資料。
5. 確認後再擴大到更多 Track 與參數。

原書新 Track 預設 Read，且每個參數起初只有一個初始 breakpoint。若沒有真正寫入或手動增加 point，調 fader 可能只是改整條初始值。要固定起始位置，可寫短 pass 或在後面手動加 breakpoint。

> [!tip] 實務連結
> 第一次寫 vocal ride，先只開 Volume，不把 Plug-In、Pan、Send 都一起 armed。讓操作只回答一個問題，能減少「本來只想改音量，怎麼 delay 設定也變了」的排查成本。

## Send 與 Plug-In 的啟用方式

Send automation 包括 level、mute、pan（有相應 channel format 時）。在 Automation window 開對 type，再於 Send window 或 expanded view 寫。Copy to Send（Studio／Ultimate 相關工作）可將 Track 當前值或完整 automation playlist 複製到指定 Send，適合先建立與 main mix 一致的 cue，再分開調。

| Plug-In 操作 | Mac | 作用 |
|---|---|---|
| 啟用單一 parameter | Command+Option+Control-click 該控制 | 將它加入 automation |
| 啟用全部 parameter | Command+Option+Control-click Auto button | 整顆可用參數都啟用 |
| 指定參數清單 | 點 Auto，選控制並 Add | 有意識選擇要寫的對象 |
| 保護已有 Plug-In automation | Safe button | 防止被新 pass 覆寫 |

自動將新 Plug-In 控制全部 auto-enabled 的偏好可省事，但在大工程也會擴大 Write pass 的影響面。開啟之前先建立自己的寫入與保護習慣。

## AutoMatch、Latch Prime 與 AutoJoin

AutoMatch 讓正在寫的控制回到既有 automation。Studio／Ultimate 可從 Automation window 觸發全體、指定 type，或 Command-click Track Automation Mode selector 作用於該 Track。它不是刪掉剛寫的整段，而是在此刻結束接管並回到原控制值。

Latch Prime 允許 transport stopped 時先調好要寫的控制，播放一開始就以該值寫。需開 Allow Latch Prime in Stop，並使用 Latch／Touch-Latch；調好後 mode indicator 轉為 primed 狀態。停止後通常離開 prime。AutoJoin 用於重播到前次停止點時繼續寫，Join 則手動重新接入。

| 工具 | 解決的問題 | 不是什麼 |
|---|---|---|
| AutoMatch | 現在停止接管並回原曲線 | Undo 整次 pass |
| Latch Prime | 播放前先準備第一個寫入值 | 只有按 Play 後才可轉控制 |
| AutoJoin | 再經前次停止點時續寫 | 任意位置永遠自動寫 |
| Automation Safe | 指定 Output／Send／Plug-In 不被覆寫 | 所有 automation 永久關閉 |

> [!warning] AutoJoin 要從 marker 之前重播
> 原書用 AutoJoin indicator 標出前次 pass 停止處；要經過該點才觸發自動續寫。若一開始就在後面播放，不能期待它自己回補前段。

## Suspend 的語意要看作用位置

Automation window 裡關掉某 type 的 write enable，通常讓它在 writable Track 上仍讀既有資料、不再寫；Edit window 對 control name 的 suspend 可同時停止讀寫，行為像該 control 的 Off。全域 Suspend 也有更廣泛的影響。這些按鈕不能只當成同一種「暫時別錄」。

| 想達到的狀態 | 優先檢查 | 檢查結果 |
|---|---|---|
| 保留播放，只不寫 Volume | Automation window 的 Volume enable | 曲線仍可讀 |
| 暫用手動值，不讀該參數 | 該 control 的 suspend／Track Off 等 | 不再被曲線拉回 |
| 只保護某顆 Plug-In | Automation Safe | 其他參數仍可寫 |
| 連 Trim 都要暫停 | Trim 相應 Suspend 操作 | 看黃色狀態與模式 |

## 刪除與減點

Option-click 單一 breakpoint 可刪掉它；用 Selector 框住範圍按 Delete 可刪多點。Control+Delete 清所選 Track 範圍內所有 automation playlists，範圍遠比目前看到的一條線大。Cut 和 Delete 有不同邊界行為，下一篇再詳談。

Smooth and Thin Data After Pass 可在每次 pass 後自動整理，Degree of Thinning 控強度；也可用 `Edit > Automation > Thin／Thin All` 手動減點。保留重要 cue 與轉折，減點前後聽一次，不是點越少越專業。

Pencil 可以畫 Free Hand、Line、Triangle、Square、Random，後三者節奏參考 Grid；Parabolic 與 S-Curve 在這裡不提供。MIDI CC 是離散 steps，Pencil Tool Resolution 可設 1–100 ms；較密資料換來較高控制解析度，也增加傳輸量。

![[PT-Ch53-automation-modes.png]]

> [!abstract] Takeaway
> 全域 type、Track mode、Plug-In parameter 三層都對，automation 才會留下來。AutoMatch 結束接管，Latch Prime 準備起寫，AutoJoin 接續上一段；Safe、停寫與停讀要分清楚。最後看 lane 驗證，不只憑 knob 動過就認定成功。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch53a-Automation模式與資料層]]

下一篇：[[PT-Ch53c-Breakpoint編輯與Trim整合]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch53a-Automation模式與資料層]] · [[PT-Ch53c-Breakpoint編輯與Trim整合]] · [[PT-Ch53d-WriteTo快照與Preview工作流]] · [[PT-Ch53e-VCAAutomation與Coalesce]]

跨章延伸：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch44a-ClipGain與音量整理]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
