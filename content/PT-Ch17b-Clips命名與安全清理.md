---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 17
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "336–346"
pdf_pages: "368–378"
---

# Ch17 — Clips 命名與安全清理：Remove 和 Delete 差在哪裡

> 清理 Session 時最重要的不是清掉多少項，而是知道自己移除的是 Clip reference，還是硬碟上真正的錄音檔。

## 1. Rename 可能只改 Clip，也可能動到實體檔名

選 Clips List 內的項目，從 menu 或右鍵選 `Rename`。若選的是 whole-file audio clip，dialog 會讓你選擇只改 Clip 名，或連 disk file 一起改。這個選擇十分重要：Clip 是 Session 內的編輯單位，disk file 則可能被其他 Session 引用。

原書的 Clip Info 也能顯示 Instances、Rating、File Name、Start／Sync／End／Duration、Time Stamp 等。它讓你在改名之前先檢查來源與使用情況；不是所有顯示資訊都能在 Name dialog 直接編輯。

| 動作 | 改變對象 | 不應誤解成 |
|---|---|---|
| Rename 一般 Clip | Clip 名稱 | 重新錄製或產生一個完整新 Audio file |
| Rename whole-file，僅 Clip | Session 中的 Clip 名稱 | 硬碟檔案也同步改名 |
| Rename whole-file，含 disk file | 實體來源檔與 Clip | 只有畫面顯示改變 |
| Auto Rename | 後續衍生 Clip 的 root name／編號／suffix 規則 | 把所有 parent files 都批次改名 |
| Batch Rename | 選定 Clip／Track 的命名批次處理 | 每個 Clip Group 內部的項目都會處理 |

> [!tip] 實務連結
> 接手 Session 後，可以先把 Track 名改得清楚，再針對 Clip 命名。若原始 Audio files 還供別的工作使用，改 disk file 名之前必須把影響範圍弄清楚；只為了自己好辨識，通常不用動到共同素材的實體檔名。

## 2. Batch Rename 的處理順序是固定的

原書提供四類命名工作：Replace、Trim、Add、Numbering，而且**由上到下依序套用**。先替換、再裁字、再加文字、最後編號。這表示同一套設定不是四個彼此獨立的開關，後一階段拿到的是前一階段已處理的結果。

| 階段 | 可做什麼 | 範例思路（教學示例） |
|---|---|---|
| Replace | 尋找與取代，必要時用 Regular Expressions | 把角色縮寫換成統一名稱 |
| Trim | 從開頭、結尾或指定範圍裁字 | 移除固定長度的舊前綴 |
| Add | Prefix、Insert at Index、Suffix | 補上樂器角色或版本資訊 |
| Numbering | 起始值、位數、間隔、分隔字元或 A–Z | 依指定順序建立可排序序號 |

Batch Clip Rename 的 `Process Order` 可選 Timeline Order（由左到右、由上到下）或 Clips List Sort Order。這影響編號指派，不只是顯示順序。你若先按名稱排序再編號，結果不一定符合演奏時間；需要時間順序時就明確選 Timeline Order。

原書也提供五個 Preset 按鈕，`Command-click` 寫入、普通點擊取回；可透過 Librarian menu 保存 `.ptpreset`。一套可重複命名流程，應把處理順序與 numbering order 一起保存，而不是只記住 Prefix。

> [!warning] Batch Clip Rename 的範圍有限
> 原書指出，Clip Groups 及其內含 Clips 會被忽略。執行前先確認選到的是哪些資料類型，不要以為畫面上全選，就代表每個內層名稱都改到了。

## 3. Regular Expressions：只使用能理解的 pattern

原書用 `\.dup\d+` 移除 Track／Clip 名裡由 duplication 產生的 `.dup1`、`.dup2` 等尾段。`\.` 表示字面上的點、`\d` 是 digit、`+` 表示一個或更多。用空的 Replace 就會把匹配部分移除。

```text
Find:    \.dup\d+
Replace: （留空）
```

這個片段直接對應原書的命名工作流程。需要留意 `.` 與 `\.` 不同：前者在 regex 中代表任意單一字元，後者才是字面上的點。原書的表格有部分排版／文字例子不夠精準，實作時應以明確解釋的 `.dup` 範例為主，不盲抄不確定的 pattern。

| Pattern 概念 | 含義 | 為什麼重要 |
|---|---|---|
| `.` | 任意單一字元 | 若想找真正的句點，不能直接用它 |
| `\.` | 字面句點 | 適合 `.dup` 這類名稱片段 |
| `\d` | 單一 digit | 搭配 `+` 取得一串數字 |
| `[abc]` | a、b、c 其中一個 | 控制允許匹配的字元集合 |
| `[^abc]` | 非 a／b／c 的一個字元 | 排除特定字元 |

> [!tip] 實務連結
> 批次改名先用少量選取測試輸出是否符合預期，再處理整批。尤其同時啟用 Trim、Add 與 Numbering，先看「每一階段作用後的名稱」，比一次打開所有選項容易抓錯。

## 4. Auto-Created 是身分，命名會改變保留方式

剪輯、Trimming、Separate 等操作可能產生 auto-created Clips。關掉 Show > Auto-Created 只讓清單乾淨；若要保留某個特別重要的片段，原書建議替它命名，命名後會提升為 user-defined Clip。

這也提醒我們：「自動產生」不是「沒有價值」。有些重要剪輯決定正是從 auto-created 片段開始；保留策略應跟工作狀態一起決定。

## 5. Clear dialog：最後再分清 Remove 與 Delete

從 Clips List 選不需要的 Clips，選 `Clear`。可以先用 Select > Unused 或 Unused Except Whole Files 找候選，但「unused」只代表目前 Session 的相關使用狀態，不代表其他 Session 沒有使用來源檔案。

| 選擇 | 結果 | 風險與適用條件 |
|---|---|---|
| Remove | 從這份 Session 移除 Clip | 不等於刪除硬碟來源 Audio file |
| Delete（whole-file audio） | 永久刪除硬碟 Audio file | 可能影響引用同一來源的其他工作；無法 Undo |
| Automatically select all unused clips | 忽略原本選取，重新囊括全部 unused（包括 whole files） | 不要以為只有剛才點到的少數項目會受影響 |
| Option-click Delete（Mac） | 省略後續每個檔案的重複警告 | 原書稱 power delete；這會擴大誤刪後果，不是一般整理的必要步驟 |

> [!warning] Clear 不能 Undo；Delete 更會動到實體素材
> 這是本章最該停下來確認的地方。Remove 與 Delete 不是同義字。也不要把「Unused」解讀為「永遠沒人需要」；它不是跨所有工程的使用狀態掃描。

> [!abstract] Takeaway
> 先辨識 Clip 與 parent file，再命名；Batch Rename 依 Replace → Trim → Add → Numbering 套用。清理最後才做，並在 Clear dialog 讀清 Remove／Delete。回 [[PT-Ch17a-Clips-List搜尋與素材辨識]] 可先確認你找到的到底是哪個素材。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=368|原書 p. 336–346／PDF p. 368–378]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch17a-Clips-List搜尋與素材辨識]]

下一篇：[[PT-Ch18a-Workspace素材庫與搜尋]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
