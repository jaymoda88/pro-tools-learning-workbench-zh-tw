---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 18
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "385–398"
pdf_pages: "417–430"
---

# Ch18 — Relink 與 Task Manager：檔案找到了，Session 還要連對它

> Session 保存的是對媒體的引用；找不到聲音時，要修的是引用、儲存位置與背景任務，而不只是把檔名改得一樣。

## 1. 先分三種問題，避免用錯工具

| 狀況 | 真正問題 | 比較合適的處理 |
|---|---|---|
| 檔案存在，但在 Transfer volume | 所在儲存卷不適合當 Session 播放來源 | Copy and Relink 到 Performance volume |
| 檔案改位置／名稱，Session 找不到 | 原有 link 無法對上媒體 | 在 Relink window 找候選並確認 |
| 檔案在未掛載硬碟上 | 媒體實際 offline | 先掛載 volume，再 Relink |
| 複製、轉換、索引還在跑 | 背景工作未完成或失敗 | 看 Task Manager 的 Active／Paused Tasks |

Missing 與 Transfer 不一樣：前者還沒找到可用媒體，後者可能已知道檔案在哪裡，只是所在位置不適合直接播放。先看訊息文字與狀態，再選操作。

## 2. Copy and Relink 的重點是「改連到複本」

在 Workspace 聚焦目前 Session 或 Catalog，選擇媒體，再執行 `Copy and Relink Selected`。指定合適位置後，系統複製資料，並讓 Session／Catalog 指向新複本。這比單純在 Finder 複製更完整，因為它把檔案動作與 link 更新接在一起。

| 工作方法 | 是否產生複本 | Session 是否改用複本 |
|---|---|---|
| 單純在 Finder 複製檔案 | 是 | 不保證；原 Session 可能仍指向舊位置 |
| Copy and Relink | 是 | 由此工作流程更新連結到複本 |
| 單純重新命名候選檔 | 否 | 不保證辨識成功，也可能造成其他 link 問題 |
| 手動 Relink | 通常修引用；依具體操作而定 | 需挑對候選並 Commit Links |

> [!tip] 實務連結
> 接手 Session 後，若素材還散在下載資料夾、另一顆碟或外來媒體，先用完整收集流程整頓。表面上 Session 現在能播放，不代表拔掉外接碟後仍然能用。

## 3. 自動找最快，手動找最能檢查候選

開 Session 遇到 Missing Files，可先 Skip、Automatically Find and Relink，或 Manually Find and Relink。自動搜尋會找 Name、ID、Format、Length 等符合條件的媒體，能直接 Commit，但沒有逐項比對候選的機會。

原書提醒，Commit 過的 links 在保存 Session 後不能像一般編輯一樣 Undo；若要回到先前 link 狀態，需關閉且不保存再重開。因此不是每個「按下去能快速修好」的按鈕都適合無檢查執行。

手動 Relink 的基本順序如下：

1. 在 Missing Files 清單辨識缺少哪些素材。
2. 於 Areas to Search 限定可能的 volume／folder，而不是無差別掃所有來源。
3. 使用 Find Links／Find All Candidates 等功能找候選。
4. 檢查候選的名稱、ID、長度、格式與來源位置；同名不代表同一個 Take。
5. 確認無誤後再 `Commit Links`，並回 Session 檢查實際內容。

| 找候選時的線索 | 為什麼要一起看 |
|---|---|
| Name | 最直覺，但可能存在同名不同檔 |
| File ID／SMPTE ID | 用來辨識特定媒體身分 |
| Format／Length | 排除同名但規格、時長不同的檔案 |
| Directory／Volume | 確認不是連到臨時下載或舊備份 |
| 聲音與 Timeline 內容 | 技術條件相似，仍須確定是否正確 Take |

> [!warning] Force 或自動 Commit 不是素材內容驗證
> 尤其同名素材跨版本、跨備份存在時，先保留原 Session，再核對候選。連上錯檔可能比保持 Offline 更難發現，因為畫面會看起來已恢復正常。

## 4. Catalog 是引用集合，刪除時仍要讀清楚範圍

Catalog 把不同位置的素材整理成可搜尋集合；離線時仍可保有目錄描述。新增 Catalog item 不代表備份整份來源音檔，刪除 item 時則需區分只從 Catalog 移除 alias，還是同時刪除 disk 上原檔。

匯入 offline Catalog items 時，Pro Tools 可把相關工作保存為背景任務；等媒體 volume 掛載後，再繼續實際匯入。這讓大素材庫可以先組織、後補資料，但也意味著「我已拖進 Session」不一定等於「所有資料已在本機 Audio Files」。

## 5. Task Manager 讓檔案動作可見

`Window > Task Manager` 顯示 Active Tasks 與 Paused Tasks，涵蓋 copying、conversion、indexing 等工作。可暫停、恢復或取消；若工作失敗，Task window 會帶出相關訊息，而不是無聲地假裝已完成。

| 控制／狀態 | 意義 | 操作習慣 |
|---|---|---|
| Active Tasks | 目前排隊或進行中的背景工作 | 看 Progress，避免只看主視窗猜測 |
| Paused Tasks | 已暫停或未完成的工作 | 先讀原因再恢復 |
| Resume All | 恢復全部暫停工作 | 確認來源 volume 與磁碟空間已處理 |
| Pause During Playback | 播放／錄音時暫停背景任務 | 把系統資源優先留給即時 Audio |
| 關閉有 pending tasks 的 Session | 會詢問取消或完成 | 不要把關窗視為所有資料都已完成搬移 |

> [!tip] 實務連結
> 在錄音前，先讓大量素材複製和索引完成，或明確暫停背景工作；錄完再恢復。這是資源安排，不是因為 Workspace 本身會改變錄音音質。

> [!abstract] Takeaway
> Relink 前先分類：Missing、Transfer、Offline volume 或 pending task。Copy and Relink 同時處理複本與引用；手動找候選後才 Commit。Catalog 不是備份，Task Manager 也不是裝飾視窗：兩者都決定素材到底是否已可用。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=417|原書 p. 385–398／PDF p. 417–430]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch18b-Workspace預聽與Tempo]]

下一篇：[[PT-Ch19-Artist-Chat與Avid-Link協作入口]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
