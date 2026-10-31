---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 63
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1450–1464"
pdf_pages: "1482–1496"
---

# Ch63b — Video剪輯效能與MOV交付

> Video 可以配合 Audio 一起剪、一起交付，但編輯邊界與輸出條件都要服從 frame，而不是 Audio sample。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1482|原書 p. 1450–1464／PDF p. 1482–1496]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## Video編輯：哪些能照Audio做，哪些不行

Ultimate 支援多 Video clip 與 playlist、多次 Undo、nondestructive trim／separate、shuffle／spot、clip group 等。Studio 可播放匯入的影片，甚至開某些 Ultimate Session 中的 main track 多段內容，但不能因此推定獲得完整 Video editing 能力。

| 常見操作 | Video 可用性 | 注意 |
|---|---|---|
| Cut／Copy／Paste／Clear、Duplicate／Repeat | Ultimate 可用 | 以 frame 邊界為單位 |
| Trim、Separate、Nudge、Spot | Ultimate 可用 | 不可剪半個 video frame |
| Audio＋Video 跨軌一起剪 | 可 | 貼上時 Video 對 frame，Audio 也可能被帶著微調位置 |
| Fades／AudioSuite／Pencil Repair | 不適用 Video | Audio 效果不能直接當影片轉場 |
| Consolidate／Strip Silence | 不適用 Video | 不用 Audio 檔案邏輯硬套 |
| Clip Groups 含 Audio＋Video | Ultimate 可用 | Audio 可有 fade，Video 本身不會因此有 fade |

Video 選取若包含某 frame 超過一半會納入該 frame，少於一半則不納入。貼上包含 video 的選取時，insertion 會靠最近 frame boundary；若同時貼 Audio 可能不在原先 sample 位置，Pro Tools 會警告。看見警告要核對 picture sync，不能直接習慣性按 OK。

## Insert Silence與Track Lock

Shuffle mode 下的 Insert Silence 會把後面 Video 往後移，插入指定長度空間；Slip／Grid／Spot 下則類似 Clear。它不是自動生成可交付的全新黑畫面檔，而是 Timeline 上的空間操作。

Video Track 可右鍵名稱設 Locked，避免整軌編輯；個別 clip 本身的 lock 是另一層。解開 Track 不會自動解除原本個別 clip 的 lock；反過來，Track 還鎖住時，即使解 clip 也不能自由編輯。

> [!tip] 實務連結
> 音訊 mix 階段通常把已確認 picture 鎖住；做 conform 改版時才開鎖並保存版本。這樣剪對白時比較不會把整段 picture 一起 Shuffle 走。

## Video Window與Universe：兩種觀看目的

`Window > Video`或 Mac `Command+9`開 Video Window。可改 Quarter、Half、Actual、Double、Full Screen；Stretch 會拉滿指定比例，Pillarbox/Letterbox 保持比例但留黑邊，後者可能增加 CPU 使用。直接在 Video Track scrub 只 scrub Video；在 Audio Track scrub、Video online 時，兩者可同步 scrub。

Video Universe 以每個 clip 中間 frame 做縮圖，方便長影片導航。上半部是 zoom：單擊把 clip 起點移到左邊、雙擊填滿視窗、拖多張 zoom 範圍；下半部是 selection：點起點、雙擊選整 clip、拖選多 clip。Option 配合拖可同時選範圍與 zoom。

| 操作 | 效果 | 用途 |
|---|---|---|
| Track Frames View | 顯示影格縮圖 | 找場景，但較耗資源 |
| Blocks View | 以色塊顯示 | mix 時保留邊界、降低負擔 |
| Universe | 多 clip 總覽 | 改版與跨段定位 |
| Timecode Overlay | 即時顯示 TC | Ultimate，設定 Size／Position／Color／Opacity |

## 掉frame先看報告，不要只升級電腦

Dropped Frames indicator 在播放掉 frame 時亮紅；停止後 tooltip 提供 Playback Duration、Dropped Frames、Disk Read Times 與可能原因。點一下可清，重新播放也會重設；Mac `Option+C`可清 clip 與 dropped-frame indicators。

| 報告／症狀 | 優先方向 | 可做的調整 |
|---|---|---|
| Disk too slow | 檔案 bandwidth／儲存 | 快 drive、本機 drive、分開 Audio 與 Video |
| 無 common clock | Audio／Video reference | 正確 common reference，別只加 offset |
| 編碼不利 AVE | Codec | 改低 bandwidth Intra Frame 工作檔 |
| CPU／GPU 不足 | 解析度、engine setting、處理配置 | 降 raster／quality，檢查 GPU 選項 |
| Frames View 遲鈍 | 縮圖繪製 | 換 Blocks 或隱藏 Video Track |

Operation Preferences 的 Enable GPU 把 Video processing 放 GPU，通常有利，但慢 GPU 配置可能關掉反而較穩；Prevent Tearing 依賴 GPU 選項。Play Start Latency 1–5 可給慢系統更多準備時間。先確保 engine rate/raster 跟檔案相配，再用 1080、低 bandwidth DNxHD LB／SQ 等工作素材，通常比直接在大 mix 裡硬播高規格長 GOP 更好管理。

## Video Sync Offset修的是監看鏈固定延遲

到 `Setup > Video Sync Offset`輸入補償。Projector、display decoder 可能晚一或數 frame；調好後除非 monitor chain 改變，一般不必每個 Session 亂改。這與 Satellite start offset、Session Start 及 clip Spot 是不同用途，下一章群會再區分。

## MOV Bounce與舊QuickTime流程分開

原文 p.1459–1461 的 `Bounce to QuickTime Movie`限 macOS Mojave 及更早，或有 QuickTime 的 Windows。現代 Mac 讀這份 2023.3 手冊時，應看 p.1462 起的 Bounce Mix to MOV 流程，不能照舊 QuickTime Settings 對話框尋找不存在的按鈕。

在有 Video 的 Session，開 Bounce Mix 選 MOV。確認要播的 Video 是 main online track、Audio sources 可聽、Mix Source 正確、範圍已選，再決定 PCM／AAC 與 Video settings。原文此處 menu 路徑的措辭與其他章有差異，實際以 File 下 Bounce Mix 入口為準，不把錯字延伸成另一個功能。

| Video 選項 | 意義 | 限制 |
|---|---|---|
| Include Video | 是否帶畫面 | 關閉後只把 Audio 放 MOV |
| Same as Source | 盡量保留同 codec／compression 來源 | DNxHD/HR 或 ProRes 等；範圍內 codec 條件須相同 |
| Transcode | 轉選定 codec | codec 可用性依 engine rate/raster |
| Include Timecode Overlay | 把 TC 燒進交付影像 | 依 Session Overlay Settings |

可轉碼 DNxHD、DNxHR、Apple ProRes、H.264、H.265；不同 compression 對應 bandwidth，H.264／H.265 可選 CBR 或 VBR Single Pass。PCM 支援所有可用 sample rate／bit depth／channel width；AAC 限定單一 stem、支援 Mono／Stereo／5.1／7.1 及 44.1／48／88.2／96kHz。AAC 的 CBR 以 bitrate 選，VBR 以 quality 選。

> [!warning] 交付畫面的色彩也要重看
> Transcode 使用 Video Track 選定 color space；手冊說 Same as Source 只以 YCbCr709 輸出，unsupported space 也可能回退 709 並通知。不要以為只替換 Audio，就保證每種輸出路線都完整保留原 color handling。

> [!abstract] Takeaway
> Video edit 要守 frame boundary，效能排查要看掉 frame 報告，MOV 交付要核對主 Video、Audio source、codec 與 color space。固定 monitor 延遲用 Video Sync Offset，走速錯誤仍要回 clock／rate 處理。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch63a-Video匯入與AVE設定]]

下一篇：[[PT-Ch64-SatelliteLink多機同步]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch63a-Video匯入與AVE設定]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch62 — Working with Field Recorders in Pro Tools]]

[[PT-00-功能目錄#Ch64 — Satellite Link]]

標籤： #pro-tools #audio #study-note
