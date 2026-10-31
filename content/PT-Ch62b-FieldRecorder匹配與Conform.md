---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 62
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1418–1430"
pdf_pages: "1450–1462"
---

# Ch62b — FieldRecorder匹配與Conform

> Match 不是找「聽起來相似」的聲音，而是依 Timecode 與 Metadata 找同時錄下的其他 channel，再把原剪輯套回去。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1450|原書 p. 1418–1430／PDF p. 1450–1462]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## 替換一段：保留剪輯、Fade與Track Automation

Timeline 選到 Mono clip 或其中一部分，右鍵 `Matching Field Recorder Channels`，選對應來源；Mac 用 Selector 時也可 `Command+Option-click`開此選單，`Command+Option+Up/Down`循環匹配項。第一回可能顯示背景搜尋，等完成後重開選單才看得到結果。

替換會把原 clip 的 fade 套到新來源，Track 既有 Automation 不變。典型例子是保留 picture editor 的對白剪接，將 guide 換成同 take 的 lav 或 boom。這個功能的「其他 channel」原則上是同時錄製，不是拿另一個表演 take 自動對口型。

> [!tip] 實務連結
> 先 duplicate guide 保留參考，再用匹配來源替換。遇到 lav 衣服摩擦，就切回同 take 的 boom；你要比較的是不同 mic 的錄音品質，而不是重新建立每個 edit。

## ANY／ALL如何影響你找到什麼

Match Timecode Plus 條件可在 Match Criteria 設定。原書的基本條件包含同時錄製、Timecode 範圍至少重疊、指定 criteria 符合，而且 metadata 已保存。若現場資料不完整，可以調整 criteria，但放寬越多，越需要人工確認。

| Criteria | 能排除什麼 | 使用提醒 |
|---|---|---|
| Scene／Scene and Take | 不同拍攝段落 | Take 必須配 Scene 一起 match |
| Shoot Date／File Creation Date | 不同日期的重複編號 | 日期來源可能不同 |
| Sound Roll／Tape 及交叉 match | 不同媒體來源 | 欄位對應可能在交接時互換 |
| First X Characters in File Name | 用命名前綴補救 | 長度太短易撞名 |
| Channel Name／Number | 找特定 mic／channel | 可能缺失或重複 |

ANY 表示選定條件任一符合即可，ALL 要全部符合。先 ANY 找廣，再 ALL 縮小是原書提供的策略；但 Timecode 與資料來源的核對仍不能省。匹配也可參考 Original Time Stamp 與 Sound Roll Timecode，交叉 Roll／Tape 時可能再交叉對應兩種時間欄。

## Search Areas：不必先把整天錄音全匯進Session

預設會找 Session 的 Audio Files。右鍵 Guide Track 選 Select Areas to Search，可加資料夾／drive，Save & Index 保存並建立索引；新加資料後要重新 Index，否則「硬碟明明有檔」仍可能找不到。

| 狀況 | 處理 | 原因 |
|---|---|---|
| 新錄音剛複製進資料夾 | Save & Index | 搜尋需先認識新增資料 |
| 已選 parent folder，不能再加 subfolder | 保留 parent 範圍 | 避免重疊搜尋位置 |
| 灰色斜體路徑 | 確認 drive 在線、位置沒變 | 原書用此標缺失搜尋資料夾 |
| 搜得素材需轉換 | 匯入會用 WAV | 保留 Field Recorder metadata，不依 Session file type 改 |

> [!warning] 先縮小資料範圍，再放寬條件
> 指向一整顆多年錄音硬碟，又用 Timecode Only，會得到大量時間相同但內容無關的候選。用拍攝日／Sound Roll 資料夾限制範圍，比事後從數百個結果逐個猜更可靠。

## Expand Channels to New Tracks：把整段剪輯展成多麥軌

要一次取得同一段剪輯的所有 mic，在 clip、selection 或整條 Mono guide 上叫出 `Expand Channels to New Tracks`。可按 Match Criteria 或 Timecode Only。新軌保留剪輯與 fade；找不到該 channel 對應的片段會留 gap，這是資料匹配結果，不是 Pro Tools 隨機漏錄。

| 方法 | 會找到什麼 | 風險 |
|---|---|---|
| By Match Criteria | 符合你條件的 unique channel | 條件過嚴可能少結果 |
| By Timecode Only | 同時段來源，較不依 channel naming | 容易把不相關同時間資料也納入 |
| Naming by Channel Name | 以 Boom／Lav 等分軌 | 同名重複要以數字區別 |
| Naming by Channel Number | 依 A1／A2 等分軌 | mic 換 channel 時需留意 |
| Name & Number | 同時使用兩種識別 | 名稱較長，但可減少混淆 |

例如 Guide.A1 的 Boom 可成為 Guide.A1.Boom；重複名字會出現`.2`、`.3`。不要以為每一條新軌都能逐字當成唯一 mic 身份，先看 Channel Name 與 Number 在各 take 是否一致。

## 演唱會Guide的Conform流程

原書例子是 Pro Tools 追 Timecode 錄多軌並同時 print guide，picture editor 剪 guide 和 video，再回 AAF／OMF。交回至少 2frames handles；Pro Tools 匯 AAF 與原始未剪錄音，再將 edited guide relink 到原始未剪 guide，最後 By Timecode Only 展開，讓各音軌跟 picture edit 走。

Workspace 裡對 edited guide 選 Relink Selected Items，把原始未剪 guide 放 Candidates，核對並 Commit Links。若原 guide 不存在，原書允許用起訖時間相同的其他 source，但要先確保 time relation 正確。這個 Relink 不是一般「挑一個同名檔」就能忽略來源的動作。

## 為什麼拍攝端的命名紀律也屬音訊後製

原文後段區分 Film／Telecine 與 Video／Fully Non-Linear 流程。Film 由 shootlist、sound log、clapboard、FLEx 把 keycode、location timecode 與 telecine timecode 對起來；數位 video 則要求 camera 與 recorder 共用正確 production timecode，媒體名稱逐字保留。無論流程新舊，核心都是讓「picture 剪到的那段」能回溯原始錄音。

| 階段 | 要保留的關係 | 一旦斷掉的後果 |
|---|---|---|
| 拍攝 | Scene／Take／Roll／Timecode | 無法可靠辨認錄音 |
| 同步與剪輯 | Video 片段對應 raw audio | Guide 可能只剩混音參考 |
| AAF／OMF 交接 | Edit 與 metadata 對應 | 自動 match 減少、需手動救援 |
| Pro Tools conform | guide edit 對到 raw mic | 替換後要核對 lip sync 與 fade |

> [!abstract] Takeaway
> Match Criteria 決定「哪些候選可信」，Search Areas 決定「去哪裡找」，Expand 決定「如何把結果排成可混的軌」。先保存 guide，再換 mic，最後逐段確認同步與空缺。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch62a-FieldRecorder素材與Metadata]]

下一篇：[[PT-Ch63a-Video匯入與AVE設定]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch62a-FieldRecorder素材與Metadata]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch61 — Pro Tools MachineControl]]

[[PT-00-功能目錄#Ch63 — Working with Video in Pro Tools]]

標籤： #pro-tools #audio #study-note
