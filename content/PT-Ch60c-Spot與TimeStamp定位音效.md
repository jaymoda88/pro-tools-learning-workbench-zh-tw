---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 60
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1366–1374"
pdf_pages: "1398–1406"
---

# Ch60c — Spot與TimeStamp定位音效

> 讓音效跟畫面對齊，應該鎖定真正的 hit point，而不是勉強把整個檔案開頭搬到同一個時間。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1398|原書 p. 1366–1374／PDF p. 1398–1406]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## Spot Dialog是精確定位的工作台

Spot Mode 下用 Time Grabber 點 clip，或從 Clips List／Workspace 拖到 Track，可開 Spot Dialog。Start、Sync Point、End 等欄位可以顯示並輸入不同 Time Scale；Trim 工具使用時則是對起點或終點與 Duration 作精確修整。這和 Slip 模式憑滑鼠移位置的習慣不同。

| 欄位／工具 | 控制什麼 | 適合情境 |
|---|---|---|
| Start | clip 起點落在哪裡 | 明確的片段起始 |
| End | clip 結尾落在哪裡 | 截止點必須對畫面 |
| Sync Point | clip 內部某個事件 | 關門、撞擊等主要 hit 不在檔頭 |
| Trim Tool＋Spot | 開頭／結尾及 Duration | 長度要符合視覺事件 |
| Use Subframes | 1/100 frame 單位 | 超過整 frame 的 Audio 定位精度 |

手冊的 Subframe 是 frame 的百分之一，不是單一 sample。Timecode 輸入用句點分開 subframe；Current Time 欄沒有同樣的 subframe 量測可用。不要把兩個看似相同的 Timecode 欄位都當成相同解析度。

> [!tip] 實務連結
> 一個音效檔先是門軸吱聲，中間才砰一聲，最後有 reverb。把砰聲設 Sync Point，再對畫面門關上的 frame 做 Spot，能保留前面的預備動作與後面的尾音。

## 設定Sync Point後，定位的是事件

用 Selector 在 clip 內真正的事件位置點一下，選 `Clip > Identify Sync Point`。clip 底部會有小箭頭與垂直線；也可播放時按 Down Arrow 先捕捉位置，再建立 Sync Point。此後 Auto-Spot 會以該點為定位基準，而不是一定用 clip Start。

修剪 clip 時，未修過 Sync Point 本身，一般不會改其 Timecode 位置；若把素材修到越過該點，則要重新檢查。這個操作延伸 Ch41 的 Sync Point 概念，應與片段的時間意圖一起管理。

## Original與User Time Stamp：兩個時間記錄

| 類型 | 記錄的意義 | 何時使用 |
|---|---|---|
| Original Time Stamp | 原本錄音位置 | 回原始來源／錄製位置 |
| User Time Stamp | 使用者另訂的位置 | 不同 workprint 版本重新定位 |
| 當前 Timeline 位置 | clip 現在放在哪裡 | 現在的剪輯成果 |

三個位置可能不同。把 clip 移走，沒有讓 Original Time Stamp 變成現在的位置。要顯示可用 `View > Clip > Original Time Stamp`／`User Time Stamp`；重訂 User 值則到 Clips List menu 的 Time Stamp，可手輸、用 Current Timecode 或 Current Selection，也能依序替多 clip 批次設定。

## Capture與Auto-Spot要有可信位置來源

Spot Dialog 裡按 numeric keypad 的`=`或 Current Timecode 可捕捉 incoming location。LTC 需要來源正在跑；paused／crawl frame 的準確捕捉需 VITC 等可讀取靜止位置的方法，原文 VITC 限 SYNC HD。MachineControl 可用 serial timecode 提供位置。

| 命令 | 好處 | 前提 |
|---|---|---|
| Capture Timecode | 直接拿現在收到的位置 | incoming timecode 有效，格式正確 |
| Auto-Spot Clips | 點 clip 就放到目前外部位置 | VITC 或 MachineControl 等正確位置來源 |
| `+`／`−`後輸 frame 數 | 對 Spot 值做相對增減 | numeric keypad 與當前欄位 |

> [!warning] 在錯誤 frame rate 上精準輸入，只會精準地放錯
> 先確認 Session Timecode Rate 與媒體真實 rate，才輸 Spot。29.97 與 30 即使數字長得一樣，也會有累積誤差。

## 排查固定錯位與累積漂移

| 現象 | 先查 | 原因方向 |
|---|---|---|
| 每次固定晚幾 frame | offset、video monitor delay | 固定延遲 |
| 開頭對、尾端越來越偏 | clock、frame rate、pull factor | 走速不一致 |
| Pause 後抓不到穩定位置 | 是否只有 LTC、來源是否停止 | positional 資料來源限制 |
| 某 clip 每次 Auto-Spot 都差一段 | Sync Point 是否設過 | 定位基準不是 Start |
| 退出 Pro Tools 後 HD 設備 clock 跳動 | Loop Master 與 Avid Audio Server 行為 | 系統 clock 控制權切換 |

原文針對 Mac HD 系統描述：退出 Pro Tools 後，Loop／Clock Master 可能轉回 primary interface 的 Core Audio driver，導致同步輸出中斷；並列以停用 Avid Audio Server 避免的歷史做法。這屬特定系統維護，不應在所有 Mac 上照做。要採用前先看 p.1372、備份並核對自己的 driver 版本與 clock 拓樸。

> [!abstract] Takeaway
> 用 Sync Point 描述「哪一聲要對畫面」，用 Time Stamp 保存不同定位參考，再用 Spot 完成放置。先確認同步條件，最後才追求輸入數字的精度。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch60b-PullUpDown與外部Transport]]

下一篇：[[PT-Ch61a-MachineControl連接與Deck控制]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch60a-Synchronization與SessionSetup]] · [[PT-Ch60b-PullUpDown與外部Transport]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch59 — Ambisonics]]

[[PT-00-功能目錄#Ch61 — Pro Tools MachineControl]]

標籤： #pro-tools #audio #study-note
