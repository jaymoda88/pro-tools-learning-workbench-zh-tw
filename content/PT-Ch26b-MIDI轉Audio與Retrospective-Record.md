---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 26
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "594–599"
pdf_pages: "626–631"
---

# Ch26 — MIDI 轉 Audio、Step Input 與 Retrospective Record

> 保留 MIDI 是保留演奏可編輯性，錄成 Audio 是保留當下聲音；兩者都留下，才兼顧修改與可靠交付。

## 1. Step Input 與 MIDI Keyboard 是不同的輸入工具

Step Input 讓你用 MIDI keyboard 或發 Note data 的控制器，逐步輸入音符，而不用即時把整段演奏一次彈對。MIDI Keyboard window 則把電腦鍵盤變成可演奏／錄 MIDI 的入口，也能搭配 Step Input。它們解決的是輸入方法，不會替你決定音源、MIDI Output 或 Audio routing。

| 方法 | 適合何時 | 還需配置 |
|---|---|---|
| 即時 MIDI recording | 想保留原始演奏 timing／velocity | Controller、Input、Thru、音源與 Merge 模式 |
| Step Input | 精準輸入無法即時彈出的音列／節奏 | Step／duration 等編輯設定，深入見 MIDI Editing |
| MIDI Keyboard window | 沒有外接 keyboard，先測試或簡單輸入 | 最前方輸入焦點與音源目的地 |
| Retrospective Record | 已在 playback 演奏但沒按 Record | 必須先符合 buffer 捕捉條件 |

> [!tip] 實務連結
> 先用 MIDI Keyboard 確認音源能發聲，再排查外接鍵盤，是把「音源路徑」和「實體控制器」分開測試的方法。若內建鍵盤能響，外接鍵盤不響，問題就更可能在 Input Devices／port／channel。

## 2. System Exclusive：資料備份與音符演奏不是同一種工作

SysEx 可攜帶硬體 patch 等裝置專屬資料。原書流程是先讓裝置的 MIDI OUT 接回 interface IN，在 MIDI Input Filter 選適當的 System Exclusive 設定，再錄到 MIDI Track。送回時則用正確 MIDI Output 接目標裝置並播放。

這是資料傳輸，所以要依硬體手冊確認 dump／receive 模式、device ID 與可接受速度等；Pro Tools 裡看到一段 MIDI Clip，不代表接收硬體已正確重建 patch。原書也指出，MIDI Thru 對 SysEx 轉送有小於 256 bytes 的條件，不應拿一般即時 Thru 當作所有大型 SysEx dump 的保證。

| SysEx 工作檢查 | 為什麼要做 |
|---|---|
| 正確的 Input／Output device | 避免把資料送到另一台硬體 |
| Input Filter | 避免被排除而錄不到 |
| 硬體 dump／receive 設定 | 有 MIDI 線不等於兩端已進入資料模式 |
| 保存副本與核對回存結果 | 不靠一次播放的畫面判斷備份成功 |

## 3. Instrument Plug-In 錄成 Audio 的 Bus 流程

原書的核心做法很直接：Instrument Track 輸出到一個 Bus，再由 Audio Track 的 Input 接同一個 Bus。Audio Track 的 Output 再送主監聽，armed 後錄下 instrument 的聲音。

1. 建立 Instrument Track，插入 instrument Plug-In。
2. 錄好或輸入 MIDI 演奏；也可以同時錄 MIDI 與 Audio。
3. 建立同 channel width 的 Audio Track，例如 Stereo 音源就接 Stereo Audio Track。
4. Instrument Audio Output 指到指定 Bus；Audio Input 指到同一 Bus。
5. Audio Output 指主監聽，armed Audio Track，選起點／range。
6. 啟動錄音，結束後檢查聲音與範圍，再避免兩個版本同時重複播放。

| 路由項目 | 應設成什麼 | 常見錯誤 |
|---|---|---|
| Instrument MIDI Output | 對應的 instrument Plug-In／硬體音源 | 有 notes，卻送到其他音源 |
| Instrument Audio Output | 選定 Bus | 仍只到 Main Output，Audio Track 接不到 |
| Audio Track Input | 同一個 Bus | Bus 名稱相近但不同 pair |
| Audio Track Output | 正常 monitoring path | 把回錄訊號送回同一個 Bus 形成回授 |
| Track width | 音源與 Bus／Audio Track 相符 | Mono／Stereo 配置不符合預期 |

> [!warning] 錄 MIDI 不會自動保存 Plug-In 聲音
> 接收端沒有同一音源／Preset／sample library 時，可能聽到不同結果。交付 Audio render 能保存當下聲音；保留 MIDI 與處理資訊則讓未來仍可重做。

## 4. 外部 MIDI 音源的回錄

外部音源的 Audio output 先回 interface。可經目前監聽的 Instrument／Auxiliary Input，再用 Bus 到 Audio Track；也可讓 Audio Track 直接選相同 hardware Input。原書指出後者避開額外 bussing 的相關 latency，但要避免原監聽 Track 和錄音 Track 同時輸出造成重複監聽。

在這裡，時序誤差可能來自 MIDI device response、MIDI timing、Audio conversion 與 routing。先錄一段清楚的節奏確認 offset，再大量回錄，比把所有音源一次印完後才發現固定偏移可靠。

## 5. Retrospective Record：找回沒有按錄音的 MIDI

Retrospective Record 會把符合條件的 MIDI 演奏保存在 buffer，之後寫到 Track，並對齊原本在 Timeline 演奏的時間。它不是無條件從任何時候、任何裝置恢復所有演奏的時間機器。

原書 p. 598 明確列出預先捕捉條件，兩者滿足其一：

- Session 至少有一條 MIDI／Instrument Track，且 MIDI preferences 的 Default Thru Instrument 不為 None；或
- 任一 MIDI／Instrument Track 已 record-enabled，MIDI Input 對你的 instrument 或 All。

接著開始 Session playback，跟著演奏；需要保留時執行 `Event > Retrospective Record`，Mac 為 `Option+Shift+Z`，把演奏寫到對應 record-enabled Track。原書圖示把事件放回原演奏時間；本篇使用介面常見的 Event menu 名稱，原書該處步驟寫成 Events。

| 行為 | 本章規則 | 意義 |
|---|---|---|
| Playback 中套用 Retrospective Record | 可以 | 不必先停下才保留靈感 |
| Track 已有 MIDI data | 新演奏會 merge 進既有資料 | 注意重疊音符，不是取代全部既有演奏 |
| 不符合捕捉前提 | 不保證有 buffer 可恢復 | 要先配置可用 MIDI／Thru 路徑 |
| 錄到 Audio | 不屬於此功能的 MIDI buffer | 沒按 Audio Record 的麥克風聲音不能靠它找回 |

> [!tip] 實務連結
> 編曲時可以先準備一條 instrument、指定好 Input 與 Thru，讓試彈有一條清楚路徑。想到好句子但忘了按 Record，Retrospective Record 才有符合條件的演奏可保留。

> [!abstract] Takeaway
> Step Input 改輸入方式，SysEx 傳硬體資料，Bus recording 固定音源聲音。Retrospective Record 能救符合前提、跟著 playback 演奏的 MIDI；先建立正確輸入路徑，比事後期待奇蹟重要。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=626|原書 p. 594–599／PDF p. 626–631]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch26a-MIDI錄音與Merge-Replace]]

下一篇：[[PT-Ch27a-QuickPunch與TrackPunch]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
