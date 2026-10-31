---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 27
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "610–618"
pdf_pages: "642–650"
---

# Ch27 — DestructivePunch：連續檔與後期寫入的嚴格前提

> DestructivePunch 讓既有連續檔被局部重寫；它省去大量分段檔案的代價，是操作前必須確定資料與時間關係都正確。

## 1. 與 QuickPunch 最大的差別不是名字，而是舊資料消失

QuickPunch／TrackPunch 寫新檔並以 Clips 描述 Punch 範圍；DestructivePunch 直接改既有 Audio，維持單一連續檔。它在電影 dubbing、print masters 等需要一份持續更新輸出的工作有價值，但不適合把未知結果隨手試寫到唯一來源。

| 比較 | QuickPunch／TrackPunch | DestructivePunch |
|---|---|---|
| 舊素材 | 新 pass 保留不同來源 | Punch 區域被新資料永久取代 |
| 檔案組織 | 每次 pass 有新檔與 Clips | 一條準備好的連續檔持續更新 |
| 重新決定邊界 | 可用新 pass 的前後內容 | 不能假定舊被覆寫資料仍在 |
| 主要目的 | 音樂補錄、靈活保留 Take | 明確受控的後期／digital dubber 工作 |
| 2023.3 availability | QuickPunch 各系統／TrackPunch Ultimate | Ultimate |

> [!warning] 不要在唯一可用版本上試 DestructivePunch
> 本模式的目的就是替換資料。先建立可回復的來源複本，再驗證路由、檔案長度、Delay Compensation 與 Punch 範圍；一般 Undo 的想像不能取代素材備份。

## 2. 先準備符合條件的 continuous file

原書要求該 Track 有一個連續 Audio file，**從 Session beginning（sample 0）開始**，長度至少等於 DestructivePunch File Length preference。若不符合，可整理／Consolidate，或用 `Options > Prepare DPE Tracks` 準備。

| 前提 | 為什麼要有 | 檢查方式 |
|---|---|---|
| File 起點為 sample 0 | 保持可持續覆寫的共同座標 | 看檔案／Clip 與 Session beginning 對應 |
| 長度達設定要求 | 保證後續 Punch 都落在準備範圍 | 核對 DestructivePunch File Length |
| 連續 file | 不用在許多零散來源間猜寫入對象 | 依原書 Prepare DPE／Consolidate 流程 |
| 正確 Track width／路由 | 寫入對的 channel 與訊號 | 測試並回聽 |

`Prepare DPE Tracks` 會對已 DestructivePunch-enabled Tracks，從 Session 開始到設定長度整理成所需連續資料。原書亦提醒，非 0 dB Clip Gain 在這個準備過程會以其規則被 render；這不是只改一個旗標，可能已把 Clip 層級處理寫進檔案。

## 3. Mode、Track-enable、Record-enable 要逐層確認

停止 Transport，選 `Options > DestructivePunch`，Transport Record 顯示 DP。再把目標 Track 設為 DestructivePunch-enabled；Mac `Control-click` Record Enable 可切相關 enabled 狀態。要實際錄入，還要 Record-enable 與全域 Transport 狀態到位。

| 狀態線索 | 代表的層次 | 開始前的問題 |
|---|---|---|
| Transport 有 DP | 全域 mode | 我真的需要永久覆寫嗎？ |
| Track solid blue | DestructivePunch-enabled | 這條連續檔準備好了嗎？ |
| Blue／red flashing | 進入相關 ready 組合 | 哪些 Track 下一次會一起錄？ |
| Solid red | 實際錄音中 | 正在寫入的是正確訊號嗎？ |

可逐軌 Punch，也可讓多條已 enabled／armed 的 Track 一起 Punch。停止後 Track 與 Transport 是否仍保持 armed，依 Audio Track RecordLock／Transport RecordLock 的當前適用行為而定。

## 4. Delay Compensation 必須與原檔錄製條件一致

這是本章最重要的工程前提之一。若原檔錄製時 Delay Compensation 開啟，DestructivePunch 也應保持相同；原來關閉，就不要補錄時突然開啟。否則新寫入的片段可能無法與原資料保持 time-accurate alignment。

原書還要求為相關路徑檢查 Auto Low Latency 等行為，避免補錄時 processing path 改變。這與 Ch24「為演奏者盡量降低延遲」有不同目標：後期 print path 必須先保證**時間一致**，不是一律把所有 compensation／processing bypass 掉。

| 工作目標 | 你優先維持的東西 | 錯誤直覺 |
|---|---|---|
| 演奏者即時 monitoring | 可接受 latency 與穩定度 | 把所有後期 print 配置照搬到現場 |
| DestructivePunch 更新既有 print | 與原檔相同的 compensation／processing path | 為了「低延遲」任意換 path |
| 多層 Stem → Print master | 各層的時間與處理一致 | 覺得每層都有聲就一定對齊 |

> [!tip] 實務連結
> 要更新一小段 print master，先用短測試比較 Punch 前後的相位、transient 與 level。若 processing latency 在補錄前後改變，即使人耳暫時沒察覺，後續相加也可能出現問題。

## 5. 後期常見用途：先看你是否真的在該硬體工作流

原書提供 Film Dubbing／Mixing、Loading Dailies、Foley、Tracking／Overdubbing Music 與 HDX In-the-box Dubbing 範例。它們不是所有讀者都應套用的通用模板，而是顯示 mode／RecordLock／monitoring 如何跟工作目標對應。

| 工作 | 本章關鍵設定思路 | 適用條件 |
|---|---|---|
| Film dubbing／remote arming | Transport 可保持同步，逐 Stem Punch | 可能依賴 Ultimate、MachineControl、外部 synchronizer |
| Dailies，Timecode 不連續 | RecordLock 等待下一段 lock 後繼續 | 遠端同步行為與一般自由播放不同 |
| Foley | 停止／準備時避免開放 Input 造成聲響 | Mute Record-Armed Tracks While Stopped 等 monitoring preference |
| 音樂 overdub | 播放不停止，隨時讓某 Track 錄入 | 非破壞式 TrackPunch 通常更便於保留演奏 |
| HDX In-the-box dubbing | 串接 Stem／print paths 並保持 compensation | 原書限定相關 AAX DSP、HDX 路徑，不可套到所有 Native 系統 |

HDX 範例對 record-enabled／InputMonitoring-enabled 路徑使用 AAX DSP 等有嚴格要求。原書警告 AAX Native 在該特定 Punch 工作流中可能因 bypass／unbypass 造成 audible artifacts。這個警告不代表所有日常 Native Plug-In 錄音都不能用，而是限定此處的系統與路由情境。

> [!abstract] Takeaway
> DestructivePunch 先問三件事：**是否需要永久更新、continuous file 是否準備好、processing／compensation 是否與原檔一致**。電影／HDX 範例有明確硬體條件；一般音樂補錄不必為了看起來專業而使用破壞式流程。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=642|原書 p. 610–618／PDF p. 642–650]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch27a-QuickPunch與TrackPunch]]

下一篇：[[PT-Ch28-編輯前先分清Clip與資料]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
