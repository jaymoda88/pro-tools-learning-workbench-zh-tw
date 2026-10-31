---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 66
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1492–1495"
pdf_pages: "1524–1527"
---

# Ch66b — Satellite擷取與DigitalCut

> 一次把 Audio 錄進 Pro Tools、Video 錄進 Media Composer，必須先把訊號路徑與錄製控制接好；Linked Transport 本身不會替你搬運媒體。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1524|原書 p. 1492–1495／PDF p. 1524–1527]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## Capture要分清Audio和Video實際進哪台

使用 video peripheral 時，deck 的 Video output 接 Media Composer peripheral，Audio output 接 Pro Tools interface。兩台共享適當 clock／video reference，Pro Tools Track Input 與 Record Enable 設定好，Media Composer Capture Tools 也配置好，才能在同一次播放中各錄自己的內容。

若走 FireWire 1394，Audio 與 Video 是同一串流，原書要求先一起 capture 進 Media Composer，再把 Audio export 到 Pro Tools，不能想成把同條 FireWire 的 Audio 分到另一台普通 Audio Input 就自然同步。

| Capture 路線 | Audio 存在哪裡 | Video 存在哪裡 | 重點 |
|---|---|---|---|
| 分離 Audio interface＋video peripheral | Pro Tools | Media Composer | 共同 reference 與設定匹配 |
| 1394 單一串流 | 先 Media Composer | Media Composer | 之後以 AAF／Audio 交換 |
| Telecine 29.97 進 24fps project | 依原文先 Media Composer | Media Composer | 再 export Audio 回 Pro Tools |
| EDL 重建／Re-digitize | 先 Media Composer | Media Composer | 重新擷取後以 AAF 給 Pro Tools |

原書指出，1394 控制 device 的技術限制可造成最多約 3/4frame 的 Audio sync 差異。這是特定歷史介面流程，不能用「一次錄所以一定 sample-accurate」帶過。

> [!tip] 實務連結
> 正式 capture 前，先錄一小段能看出清楚畫面事件與瞬態的內容，核對起點、長段走速與兩邊檔案位置。這是依原文同步條件延伸的工程檢查。

## Capture前的短檢查

| 項目 | 檢查內容 | 少了會怎樣 |
|---|---|---|
| Clock Master／Reference | 同步器與 video 來源同源 | 漂移或 frame edge 不對齊 |
| Frame／Play Rate／Pull | 依 Ch66a 對照 | Audio 時長與 picture 不符 |
| Audio Input／Track arm | 訊號實際進正確 Track | 有 Video、沒錄到 Audio |
| Media Composer sequence／Capture Tools | 正確 project 與來源 | 擷取到錯規格或錯位置 |
| Transport／Link | 兩台狀態可聯動 | 只有一端開始 |

Capture 完成後，clip 出現在 Media Composer Record Monitor／Timeline，Audio 出現在 Pro Tools Timeline。原書的 EDL Manager 與 Re-digitize 工作流程都把 Audio 先留在 Media Composer，再以 AAF 引用或嵌入 media 送 Pro Tools；現代無帶工作也應維持同樣「知道檔案真正在哪裡」的思路。

## Layback到Tape：Digital Cut由哪台控制

用 Media Composer `Output > Digital Cut`，把 picture 與 Pro Tools Audio 回錄外部 deck。9-pin deck control 接在 Media Composer，不是同時讓另一台 Pro Tools 也搶控制。若 SDI／1394 要求 Audio 與 Video 合成單一 stream，先把 Audio 交給 Media Composer，或用正確外部設備合成，再回錄；Satellite 並不自動把兩條實體輸出變成同一串流。

1. 確認兩台 linked、Audio 與 Video outputs 接到 deck 正確 inputs。
2. 外部 deck 設 Remote，裝對媒體，確認可用的既有 timecode／control track。
3. 將要輸出的 sequence 開在 Record Monitor，進 Digital Cut。
4. 決定 Entire Sequence 或明確 In／Out。
5. 選 Local 手動啟錄，或 Remote 讓 Media Composer 控制；再選 Sequence Time、Record Deck Time 或 Mark In Time 作起錄基準。
6. 指定 Source Track 與 Record Track，先按黃色 Preview 核對內容與位置。
7. 確認後 Record，監控 Dropped Frames 與結果。

| 起錄選項 | 以什麼位置為準 | 何時要特別小心 |
|---|---|---|
| Sequence Time | sequence 本身 Timecode | 需與 Tape 對應位置一致 |
| Record Deck Time | deck 目前停的位置 | 不要忘記先 Cue 對位置 |
| Mark In Time | 指定的 record in 地址 | in/out 與所選 Tracks 要核對 |

`Stop on Dropped Frames`可在未正確錄下時停止；`Add Black At Tail`補尾端黑畫面。原書建議 Layback 前 render 所有 effects，減少掉 frame。24p／23.976 Satellite 模式只支援相應 24／23.976 output，不支援該段提到的 29.97 加速輸出；Symphony Universal Mastering 也不屬支援功能。

> [!warning] 先 Preview，再碰正式媒體
> Digital Cut 是實際寫回外部媒體。Source Track 決定送什麼，Record Track 決定寫到哪裡，Local／Remote 決定由誰開始；三者任何一個看錯都可能錄錯位置或內容。

原文也提醒先錄幾秒 black 確保 Tape 格式正確；特定 Mojo DX／Nitris DX 的非 FireWire output，建議 Real Time Output Mode 以取得較佳 A/V sync。這些是 2023.3 手冊保留的設備條件，不是所有現代 file delivery 都需要的步驟。

> [!abstract] Takeaway
> Capture 與 Layback 先畫出實體 Audio／Video 流向，Transport 再配合。1394／SDI 單串流限制、Digital Cut 起錄依據與 Track 指派，必須在正式錄製前逐項確認。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch66a-MediaComposerSatellite與同步設定]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch66a-MediaComposerSatellite與同步設定]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch65 — Pro Tools Video Satellite]]

標籤： #pro-tools #audio #study-note
