---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 21
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "451–461"
pdf_pages: "483–493"
---

# Ch21 — Import Session Data：只合併需要的資料，保住既有混音

> Import Session Data 的威力在於把素材、Playlist、Plug-In 與 Automation 拆開選擇；合併前先說清楚哪些應保留，哪些才要替換。

## 1. 兩種常見情境，設定方向剛好不同

同一首歌收到新錄人聲，你可能想換 Audio playlist，保留目前的 EQ、Send 與 Automation。另一種情況則是喜歡舊案的 channel strip，想取它的 Plug-In 和設定，但保留新案演奏內容。兩者都可用 Import Session Data，但 Main Playlist Options 與 Track Data to Import 的組合不同。

| 目的 | Main Playlist 方向 | Track data 方向 |
|---|---|---|
| 換新版素材，保留現有混音 | Import／Replace 或合適 Overlay | 不匯入不想覆蓋的 mixer attributes |
| 只拿舊案 channel strip | Do Not Import | 選所需 Input／Output／Send／Insert／Plug-In attributes |
| 把整組新 Track 加進來 | Import as New Track | 選想帶的結構與資料 |
| 把來源對到既有 Track | 指定 Destination Track | 嚴格檢查每種 attribute 是否會替換目的資料 |

這裡不是建議一律使用某個 Preset，而是先把意圖拆成兩張清單：「保留什麼」與「替換什麼」。如果說不清楚，先不要一次勾完所有選項。

## 2. Import 前，先檢查 Source Properties 與媒體策略

`File > Import > Session Data` 選來源 Session。Source Properties 可看 Session type／start time／Bit Depth／Sample Rate 等。某些進階屬性選擇依原書版本為 Studio／Ultimate 提供；不要拿高階畫面假定每個 tier 都有同樣選項。

| Audio Media Option | 媒體處理 | 適合何時 |
|---|---|---|
| Link to Source Media (Where Possible) | 能引用就引用；不適合播放位置或需轉換時仍可能複製 | 來源位置穩定、明確使用共享素材 |
| Copy from Source Media | 複製相關來源 Audio files | 想讓目的工作有自己的資料 |
| Consolidate from Source Media | 只複製實際用到的範圍，加指定 Handle | 減少交付量，但仍保留可修剪餘裕 |
| Force to Target Session Format | 即使原本已符合，仍複製並轉成目的格式 | 想明確統一目的資料規格 |

Handle 是 Clip 前後多保留的來源時間。Handle 不足，之後想延長尾音、補 Crossfade 或修剪接點就受限。原書指出 Consolidate From Source Media 不適用匯入 Elastic Audio Tracks；遇到 unavailable 選項，不必一直重開 dialog，要先看內容型態。

> [!tip] 實務連結
> 留在同一台工作機、共享可靠 library 時，Link 可以省空間；要帶到別台電腦，Copy 與完整收集通常更容易驗證。選擇取決於資料生命週期，不是「哪個按鈕看起來最快」。

## 3. Timecode Mapping 與 Track Offset 要分兩層看

| 設定 | 定位邏輯 | 讀書範例的直覺 |
|---|---|---|
| Maintain Absolute Timecode Values | 保持來源絕對 Timecode | Session start 不同，內容相對於新 Session 的距離也可能不同 |
| Maintain Relative Timecode Values | 保持相對 Session start 的 offset | 來源開頭後一分鐘，目的也放在開頭後一分鐘 |
| Map Start Timecode To | 把來源起點映射到指定目的 Timecode | 明確指定兩個工程的對齊關係 |
| Track Offset | 在上述 mapping 外再加位移 | 別把額外 offset 誤認成替代 mapping |

原書舉 Relative 例：來源從 `01:00:00:00` 開始，Track 在 `01:01:00:00`；目的 Session 從 `02:00:00:00` 開始，該 Track 會放到 `02:01:00:00`。它保留的是一分鐘的相對距離，而非來源的絕對時碼。

SRC 也有 Source Sample Rate 與 conversion quality 等設定，可處理需要 speed correction 的工作；一般交換不要隨意把 Source rate 當作任意數值修改。若工程牽涉 film／video pull up／down，還要核對 Ch60 的同步設定。

## 4. Source Tracks 與 Matching Tracks

每條來源 Track 可選 Do Not Import、Import as New Track，或某條 Destination Track。`Matching Tracks` 以 **name、track type、channel format** 匹配；只有名字相近不夠。這對新版場景或同名歌曲 Track 的交接很方便，但不能取代人工檢查角色。

要把新 Vocal 匯入現有 Vocal，先核對 Mono／Stereo 與 Track type，再看 Track Data to Import。對到錯 Track 時，後面的精準屬性選擇仍可能精準地覆蓋了錯誤目標。

## 5. Track Data to Import：勾選就是授權替換該屬性

| Attribute 類型 | 匯入到既有 Track 的後果 |
|---|---|
| Main Volume／Pan／Mute Automation and Setting | 對應設定與 Automation 被來源取代 |
| Main／Send Output Assignments | 目的的路由指派被來源取代 |
| Plug-In Assignments | 目的 Plug-Ins 被移除，原設定／Automation 可能一併失去 |
| Plug-In Settings and Automation | 要配合匯入 Plug-In Assignments；未匯入 assignment 時沒有作用 |
| Alternate Playlists | 取回來源的 alternate playlists |
| Clip Gain／Clip Effects | 取回相關 Clip 層級設定 |
| Track Comments／Colors／Active State | 覆蓋或取回相應 Track 狀態 |
| Elastic Audio／Melodyne Track State | 可取回相應處理狀態，目的設定會受替換 |
| Include Instrument／MIDI output | 決定是否替換目的 MIDI output assignment |

若來源用了目的系統沒有的 Plug-In，原書指出它會出現在目的 Track 並成為 inactive；這不等於聲音已被印出，也不保證兩邊播放相同。

## 6. Main Playlist Options 決定素材怎麼合併

`Import – Replace Existing Playlists` 以來源取代目的主 Playlist；`Import – Overlay New On Existing Playlists` 保留不重疊部分，但重疊處會被修剪並用來源取代；`Do Not Import` 不帶主 Playlist，適合只拿 channel strip 設定。

Overlay 不是「所有東西都疊在一起不會消失」。它對重疊資料的處理有明確替換效果，做前必須保存可回復版本。Session-level Tempo／Meter／Key／Chord／Marker 等資料也有自己的匯入邏輯，不要把 Track 完成當作整個時間結構都核對完。

> [!warning] 常見交接事故
> 想更新 Audio，卻把 Volume Automation 和 Plug-In Assignments 一起勾進去；或者想拿 Plug-In，卻連來源 Playlist 一起取代。預防方法是先選 Main Playlist，再一類一類決定 Attributes。

> [!abstract] Takeaway
> Import Session Data 要同時回答四件事：**媒體從哪裡來、時間放哪裡、對到哪條 Track、哪些 attributes 可替換**。把這四層分開，才能更新演奏而保留混音，或重用混音而保留演奏。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=483|原書 p. 451–461／PDF p. 483–493]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch21a-Audio與MIDI匯入匯出]]

下一篇：[[PT-Ch21c-AAF-OMF與交付文件]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
