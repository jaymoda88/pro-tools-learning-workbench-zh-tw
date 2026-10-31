---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 21
tags: [pro-tools, audio, teaching]
created: 2026-10-31
status: complete
source_version: "2023.3"
source_pages: "461–490"
pdf_pages: "493–522"
---

# Ch21 — AAF／OMF／MXF 與交付文件：交換剪輯結構，也交代轉譯限制

> 跨軟體交付的重點是保住媒體、時間與可編輯餘裕；一個 AAF 檔案並不自動包含所有聲音與效果。

## 1. AAF、OMF、MXF 分別在交換什麼

AAF／OMF 用於交換 sequence、Track 與剪輯關係；媒體可被引用、複製或依選項封裝。MXF 是媒體封裝格式，本章的 OP-Atom MXF 也出現在 Avid 媒體工作流程。不要把 sequence 描述檔與實際 Audio／Video 檔案混成同一種東西。

| 交付物 | 主要用途 | 還需要核對 |
|---|---|---|
| AAF | 交換剪輯／Track／媒體關聯，支援本章所列進階資料 | 媒體是否一併帶出、對方支援哪些屬性 |
| OMF | 舊式跨系統 sequence 交換 | Multichannel／資料容量與應用相容限制 |
| OP-Atom MXF | Avid 相關 Audio／Video 媒體流程 | 媒體位置、sequence 引用與實際 format |
| Audio Mixdown | 提供可聽的完成結果 | 不是可重剪的全部來源結構 |
| Translation Notes | 說明轉譯錯誤、遺失與處理 | 不是可忽略的提示檔 |

匯入 AAF／OMF 可由 Import Session Data 或開啟 sequence 等方式進行。原書另有 MediaCentral Production Management（Ultimate）專用匯入／輸出流程；若不是該管理環境，不必為一般個人交付硬套那套步驟。

## 2. 接收剪輯師的 sequence：先看時間與媒體

確認 Session Sample Rate、Bit Depth、Timecode rate、起點與來源素材配置，再選要匯入的 source tracks。Audio／Video media 的 Link 或 Copy 可分開決定；unsupported video format 的 AAF，仍可能能取回其中 Audio，但這不表示該影像已被正常解碼。

AAF 可能帶有 polyphonic file 的其他 channel 關係，即使影片 Timeline 沒用到那些 channel。共享 storage 時它們可能很有價值；沒有共享時也可能產生 Missing Files。遇到這類提示，要先確認是不是未交付的 alternate channels，而不是盲目找同名替代檔。

| 接收檢查 | 為什麼重要 |
|---|---|
| Sequence start／Timecode rate | 決定與畫面的時間關係 |
| Link／Copy／Consolidate | 決定資料是否依賴原 storage |
| Handle size | 決定後續能否延伸剪點、重做 Fade |
| Track／channel layout | Stereo／Surround 是否被正確解讀 |
| Plug-In／Mute translation | 不同軟體的效果與 Automation 未必完全等價 |
| Markers | AAF 的 Marker 匯入可依本章條件選擇；OMF 不能一概類推 |

## 3. 輸出 AAF／OMF：先選 Track，再選保留方式

選取 Audio Tracks，執行 `File > Export > Selected Tracks as New AAF/OMF`，再決定 sequence 與媒體選項。原書說明，AAF 可把 Stereo／5.1／7.1 Track 依選項保留為 Multichannel 或 split-mono；OMF 的 Multichannel 會輸出成多條 Mono。交付前先跟接收端確認，而不是用自己最熟悉的設定猜對方能接。

| Audio Media Option | 結果 | 交付考量 |
|---|---|---|
| Link To Source Media | sequence 盡量引用原素材 | 若對方無法存取來源，就不是完整可用交付 |
| Copy From Source Media | 複製相關 Audio | 檔案量較大，但能帶走來源 |
| Consolidate From Source Media | 只帶使用範圍，加 Handle | 空間較省，但不要把可編輯餘裕砍光 |
| Sample Rate／Bit Depth conversion | 為接收端改規格 | SRC 與 dither 行為以此 dialog 的說明為準 |

## 4. Sample-accurate 到 Frame-accurate 的轉譯

Pro Tools 可 sample-accurate 編輯；許多 video editor 則以 frame boundary 編輯。`Quantize Edits to Frame Boundaries` 讓輸出 sequence 符合影像系統的 frame 格線；`Enforce Media Composer Compatibility` 會依本章規則啟用相容條件，也會影響 Sample Rate 等可選範圍。

這不是把你精細剪好的音訊任意丟掉：原書解釋，為了保留原本聽感，sequence 可擴展到 frame 邊界，配合額外一幀的 render 遮住不該聽見的延伸內容。理解這個目的，就不會看見輸出後 Clip 邊界改變就立即認定聲音一定移位。

> [!tip] 實務連結
> 交付後用對方的接收流程測一次最有價值：開一份乾淨工程匯回 AAF，與參考 Mix／畫面對照，檢查起點、片段、Fade、channel 與已知效果。這是驗證交換結果，不是要求所有軟體內部結構完全相同。

## 5. Translation Notes 要當成交接文件讀

本章的 Translation Notes 可能列出 parsing errors、missing renderings、Clip name truncation 等。缺少某段 effect rendering 時，Pro Tools 可能繞過不完整效果而匯入未處理 Audio；你會有聲音，但聲音不一定與剪輯端相同。保留 Notes 並逐項核對，才能分辨是可接受差異還是需要對方重 render。

## 6. 不一定需要 AAF：其他交付方式

`Selected Tracks as New Session` 用 Save Copy In 類型流程，把所選 Track 存成新 Session／Project；適合仍在 Pro Tools 內交接。`Export Session Info as Text` 則輸出 Session 資料：Audio files、Clips List、Markers、Plug-In list、Track EDL 等。Track EDL 可列事件與 Clip 起訖，能作工程清點與溝通依據。

| Text／交付選項 | 可提供的資訊 | 注意點 |
|---|---|---|
| Include Audio Files List | 媒體清單 | 不代表音檔已複製到交付包 |
| Include Clips List | Clip 與來源 file 對應 | 有助排查 Missing 與命名問題 |
| Include Markers／Plug-In List | 工作結構與處理器清單 | 不等於授權／installer 一併交付 |
| Track EDLs／Time Format | Track 編輯事件與對應時間 | 音樂用 Bars／Beats、後期用 Timecode 等需選對 |
| Fade Handling | Crossfade 的呈現方式 | 合併／省略等選擇影響報表解讀 |

Clip Group file 保存引用、相對位置、MIDI、適用 Warp／Sync／Loop 等資料，**不保存 Audio、Automation、Plug-Ins 或 Track routing**。要跨磁碟／跨系統使用，仍需把引用的 Audio 收齊；只傳 Clip Group 檔常是「對方看得到結構卻沒聲音」的原因。

> [!abstract] Takeaway
> 跨系統交付至少要檢查**sequence、media、time reference、channel layout、handles、translation notes**。只傳 AAF 不一定有聲音，只傳 Clip Group 更不等於帶了 Audio。若接收端仍是 Pro Tools，可考慮新 Session；要清點則另交 Text report。


## 原文定位

本篇依 2023.3 原文整理，操作名稱與版本限制以該版為準。來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=493|原書 p. 461–490／PDF p. 493–522]]。圖表與實務情境為原創教學整理；未逐句翻譯。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch21b-Import-Session-Data精準合併]]

下一篇：[[PT-Ch22-媒體管理與跨版本相容性]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-快速檢索]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #teaching
