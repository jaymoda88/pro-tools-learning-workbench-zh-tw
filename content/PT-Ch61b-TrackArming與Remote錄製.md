---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 61
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1391–1407"
pdf_pages: "1423–1439"
---

# Ch61b — TrackArming與Remote錄製

> 遠端錄音最重要的是明確指定「哪個 Track、哪段時間、由誰執行 Punch」，因為錯誤命令可能真的覆寫外部媒體。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1423|原書 p. 1391–1407／PDF p. 1423–1439]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## Machine Track Arming與Profile

`Window > Machine Track Arming`顯示外部機器的 Track arm、Record Protocol 與 Record Mode。支援的 deck 可由 MachineControl 識別並載入 profile；不認得的機器可用 generic／自訂 profile，但應先在非重要媒體驗證 record 行為。

`Setup > Machine Track Arming Profiles`可以 Identify Machine、改 Track 按鈕名稱、重新對應 Track、設定 byte code 與保存 profile。名稱只是方便辨識，真正 arm 哪個 Track 由機器協定與 mapping 決定。原書 p.1403–1404 列 Machine ID 與特殊 48-track profile；查機器識別應回該表，不要因名字相近就套上。

| Profile 元素 | 作用 | 要驗證什麼 |
|---|---|---|
| Machine ID | 告訴 Pro Tools 目前是哪類設備 | deck 可能設成模擬另一機器 |
| Track Name | 按鈕顯示名稱 | 人類看得懂，不改底層 channel 本質 |
| Track Mapping／Byte Code | arm 命令實際指向 | 按 Vox 別 arm 到 Video／Timecode |
| Saved Profile | 重用配置 | 在同機型／firmware 仍先測試 |

## Record Protocol與Record Mode是兩個選擇

| Protocol | Punch 由誰決定 | 精度與限制 |
|---|---|---|
| Auto Edit | 先下載 in/out 與 roll 點，由 deck 執行 | 支援時可 frame-accurate，較不受 CPU 即時命令延遲影響 |
| Punch In/Out | Pro Tools 在過程中送 Punch 命令 | serial 延遲無法保證 frame-accurate，原書說通常約 2–3frames 範圍 |

| Mode | 改哪些內容 | 典型用途 |
|---|---|---|
| Insert | 替換選定 Track，保留其他內容 | 對已有 Video master 做 Audio layback |
| Assemble | 連 Audio、Video、Timecode、control track 等一起寫 | 空白帶起錄或接續節目 |

> [!warning] Assemble 不是普通「錄進去」
> 本章說 Assemble 會 arm 全部 Track，可能破壞 edit-out 後既有內容，不適合把 Audio 回錄到 Video master。先用可拋棄媒體熟悉模式，再操作重要母帶。

有 Timeline selection 時錄選取範圍，pre/post-roll 不屬錄音範圍；沒 selection 只有 insertion 時，錄音持續到手動停止。跨 midnight 的 selection 還要確認 deck 能處理該邊界。

## 先Rehearse，再正式Layback

Deck Control 的 Edit Preview／Rehearse 會讓 arm tracks 聽 Input 而不真正寫帶，Record 與 arm 按鈕顯示黃色。設定好範圍與 Tracks 後，選 Transport = Machine、Online、Record、Play，先核對 cue 位置與素材，再關 preview 做正式 layback。

這個 Rehearse 能力不能直接套到 Pro Tools 作 Remote Emulation 的情境：原書明確指出該模式不支援 Preview Edit 與 Rehearse。角色改變，支援命令也改變。

## 把Pro Tools當deck：Full Remote與Chase LTC

Remote Emulation 在 Peripherals 啟用 9-Pin Remote、選 Port 與 Machine Type，Transport 打開 Remote。預設模擬 Sony BVW-75，也可依 controller 選其他 profile。Clock Master 選同步器、Clock Ref 選 Video Reference；沒有 Chase LTC 時 Positional Reference 用 Generate，有 Chase LTC 則用 LTC。

| 組態 | Pro Tools 如何動 | 何時考慮 |
|---|---|---|
| Full Remote，Delay After Play = 0 | 收 Play 就定位並播放，可作 Timecode master | 以 Pro Tools 為位置輸出核心 |
| Full Remote，有 Delay After Play | 等待外部機器穩定／對齊再鎖 | 起播常 nudge／bump 不穩 |
| Remote/LTC Chase | 收 Track／Record 指令，播放追 incoming LTC | 避免來回找帶、位置由 LTC 決定 |
| Local | 忽略一般遠端 Transport 指令 | 本機獨立操作 |

Remote 模式 Audio 只支援正向 1x 播放，不支援 reverse 或 varispeed Audio。Auto Edit 指令轉成 Pro Tools Timeline selection 再錄所有 armed tracks；Punch In/Out 要求 QuickPunch 或相應 TrackPunch 配置、足夠 voices，而且要先在 Pro Tools 手動設好模式，不會因外部命令就自動把資源補齊。

## Track arming與Paddle例外

`Ignore Track Arming`讓 Pro Tools 忽略外部 arm 命令，適合 controller 同時管理其他機器但不希望誤 arm 本機。支援的 paddle 可在 Local mode 送 Input monitoring、Record Enable／Safe、Solo 與 Solo Mute；需要 Allow Track Arm Commands in Local Mode，並同時配置 Deck Control 與 Remote ports。這是受支援裝置的特例，不代表 Local 完全接受所有 remote 指令。

| 問題 | 優先檢查 | 不要直接做 |
|---|---|---|
| arm 錯 Track | profile、byte code、mapping | 反覆拿 master 試錄 |
| 起播時來回找位置 | reference 與 Delay After Play | 一味把 delay 設 0 |
| 收到 Punch 但沒錄 | QuickPunch／TrackPunch、arm、voices | 以為命令本身包含全部設定 |
| Remote 後本機 Play 失效 | 是否仍在 Remote | 誤判程式當機 |
| Local 卻仍有 Track 被 arm | paddle 與 Allow Track Arm Commands | 忽略特例設定 |

## Mac查表與線材圖入口

| 動作（Transport = Machine 時依條件使用） | Mac |
|---|---|
| Rewind／Fast Forward | `Shift+<`／`Shift+>` |
| Shuttle Back／Forward | `Option+,`／`Option+.` |
| 切 Transport Master | `Command+\` |
| All buttons off／unthread | `Command+.` |
| Cue 到 selection in／out | `Command+Left`／`Command+Right` |
| Cue 到 selection in／out minus preroll | `Option+Left`／`Option+Right` |

原文 p.1405–1407 包含 Controller／Controlled adapter 與 Mac 兩種 cable pinout。已視讀圖面，兩種 Mac 線不相同：Serial Control 為 mini DIN-8 到 D-sub9 male；Remote 為到 female，還有 shield 處理。圖面連到[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1438|Mac cable pinout原圖]]。本筆記不重畫容易誤讀的電氣接線圖，原創圖只示角色關係。

> [!abstract] Takeaway
> Protocol 決定 Punch 怎麼執行，Mode 決定改哪些內容，Profile 決定 arm 哪一軌。三者分清，先 Rehearse 能做的流程，再用正確角色錄音。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch61a-MachineControl連接與Deck控制]]

下一篇：[[PT-Ch62a-FieldRecorder素材與Metadata]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch61a-MachineControl連接與Deck控制]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch60 — Working with Synchronization]]

[[PT-00-功能目錄#Ch62 — Working with Field Recorders in Pro Tools]]

標籤： #pro-tools #audio #study-note
