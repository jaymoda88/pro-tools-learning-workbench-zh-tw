---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 25
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "570–577"
pdf_pages: "602–609"
---

# Ch25 — Loop Takes、Alternate Takes 與 Digital Source

> 反覆錄音不難，難的是保留可比較的 Takes、找回正確版本，並讓數位來源在共同時脈下可靠寫入。

## 1. Audio Loop Record 與 Loop Playback 分開設定

`Options > Loop Record` 讓同一範圍反覆錄音；Record button 會顯示 loop 標記。範圍至少 **1 秒**，而 Loop Playback 的最短範圍是 500 ms，兩者不要混用。

先設 Start／End、armed Track、必要 Pre-Roll，再啟動 Record。原書說明 Pre-Roll 在第一次進入 Loop 前提供上下文，之後繼續循環，不是每圈都重新播放整段前置。若啟用自動產生 Playlist 的相關 preference，也可把不同 pass 保存到新 playlists，方便 Ch33 Comping。

| 行為 | 原書的 Audio Loop Record 規則 | 工作意義 |
|---|---|---|
| 反覆同一段 | 每次產生可比較的 Takes | 保持節奏與選取範圍一致 |
| 停在一圈前半、尚未過中點 | 該未完成 Take 被丟棄 | 不要以為任何剛唱到的片段必然留下 |
| 停在一圈後半、已過中點 | 停止時 Track 保留該 Take | 仍應回聽確認尾段與整段可用性 |
| Loop Playback 開啟 | 只循環聽，不代表開始錄 | 想錄要用正確 Record mode |

> [!tip] 實務連結
> 需要保住某個特別好的半圈演奏時，不要依賴停止時的中點規則猜資料狀態。完成一圈、停止後立即檢查，或改用清楚的新 Playlist 錄製流程。

## 2. Alternate Takes 不是任意名稱相似的 Clip

Alternate Takes 依 Matching Criteria 尋找可替換的來源。原書建議以 Track ID（或 Track Name）及 Clip Start 等條件識別相關 Takes。從所選範圍右鍵的 Matches，或 Mac `Command-click` 的 Alternates menu 可選其他 Take；先確認範圍，才不會換到錯的段落。

| Matching criteria 思路 | 能幫你做什麼 | 風險 |
|---|---|---|
| Track ID | 找同一條 Track 錄的內容 | 跨工程／不同來源時未必適合 |
| Track Name | 以名稱角色對應 | 同名不等於內容相同 |
| Clip Start／其他時間條件 | 限定同位置的 Takes | 範圍沒對好，候選可能不同 |
| 組合條件 | 精確縮小可替換素材 | 條件太窄也可能找不到有效 Take |

可把 alternate takes 展開到新 Playlists 或新 Tracks。前者適合同一角色的 comp；後者適合並排聽、編輯或做不同處理。展開是工作展示方式的改變，不表示每個片段都需要另外複製完整 Audio。

## 3. Digital Source：首先要決定誰提供 Clock

數位輸入必須符合 interface 支援格式，例如適用的 AES／EBU、S/PDIF、ADAT 等，並設定正確的 Sample Rate 與 Clock Source。數位裝置不是只插線就必然同步；錯誤的 clock／format 會造成問題，即使表面上有 meter。

| 檢查項 | 為什麼重要 | 錄音前怎麼看 |
|---|---|---|
| Digital format | 實體接頭不等於資料格式必定相同 | 依兩端設備文件確認 |
| Session Sample Rate | 目標資料的時間基準 | 核對來源與 Session |
| Clock Source | 決定同步參考 | 明確指定同步來源，避免兩套獨立時脈 |
| Input Path | 決定寫入哪個數位 channel | 別把 enclosure／card 的同名來源混淆 |
| Playback 驗證 | 檢查內容與瑕疵 | 聽 click、dropout 與錯速，檢查時長 |

本章有 HD I/O／HD interfaces 等專屬數位 I/O 名稱；例如 enclosure 標記是為了和可選 Digital card 的來源區分。使用第三方 interface 時，應把概念對到自己的硬體設定，不能照抄不存在的選單。

> [!warning] 數位 transfer 不靠 Track Fader 修 input clipping
> 原書的直接 digital transfer 流程指出不需像 analog preamp 那樣設定 Input level；但這不代表上游來源不可能已經失真，或不需要檢查資料品質。若來源已削波，進 Pro Tools 才拉小播放音量不會修復原本 waveform。

## 4. Half-Speed Recording 是特殊聲音工作流程

Pro Tools 可半速播放與錄音，概念類似 tape deck 的 half-speed；錄下內容回到正常速度播放時，會有對應速度／音高結果。這不是一般錄音品質的增強選項，也不等於不改音高的 time-stretch。

若目的是學習難句，使用 Half-Speed Playback 即可；若想製作特殊效果，才明確使用 Half-Speed Recording，並保留正常版本作比較。操作前先核對 Session 狀態與錄音模式，避免把預期的正常 Take 錄成特殊速度結果。

> [!abstract] Takeaway
> Audio Loop Record 要注意一秒範圍與停止時的半圈規則；Alternate Takes 依 matching criteria 找版本；Digital Source 必須先解決 format、Sample Rate 與 Clock。想保留可比較演奏，讓 Playlist／Take 命名和錄音模式從一開始就一致。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=602|原書 p. 570–577／PDF p. 602–609]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch25a-Audio錄音與補錄範圍]]

下一篇：[[PT-Ch26a-MIDI錄音與Merge-Replace]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
