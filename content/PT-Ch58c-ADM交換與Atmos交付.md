---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 58
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1329–1336"
pdf_pages: "1361–1368"
---

# Ch58c — ADM交換與Atmos交付

> ADM BWF 保存的不只多聲道 Audio，還有 Object、Pan 與 Program-level Metadata；交付前必須知道哪些內容真的被寫進去。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1361|原書 p. 1329–1336／PDF p. 1361–1368]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## 正確的ADM匯入入口

用 `File > Import > Session Data`選 `.wav (ADM BWF)`，可把 Audio 與 Dolby Atmos metadata 轉回 Track 及 Pan Automation。若只用 Import Audio 或把檔案拖進 Session，會只取得 Audio，甚至失去 Bed／channel order 資訊。它們都能開 WAV，不代表都能重建同一個 Atmos Session。

| 匯入選項 | 內容 | 何時特別重要 |
|---|---|---|
| Bed/Object Output Assignment | 原本的 Bed／Object 輸出指派 | 想重建路由 |
| Object Pan Data | Object metadata 轉成 Track Pan | 要保留聲音移動 |
| Add Bed/Object Group Name to I/O Setup | 把 group 名稱帶到 Output Bus | 僅 Pro Tools 管理 group 時可選 |
| Add Bed/Object Group Name to Track Name | 名稱前或後加入 group | 大量 Track 快速識別 |
| Replace Existing／Overlay New | 取代或疊加 Main playlist 媒體與 Pan | 決定是重建還是合併 |
| Do Not Import | 可不匯媒體而匯 Pan | 指定資料維度交換 |

Linked ADM 不先拆出一套新 media，開啟與檢視很快、也省空間，但 CPU 與 disk 需求較高。若各 clip 彼此離開原來的相對位置，效能會明顯惡化；整組一起挪動比各別散開負擔小。手冊建議快 SSD；遇到問題可用 Force to target session format 讓媒體轉為 Session 格式。

> [!tip] 實務連結
> 客戶只要確認 ADM 是否有正確的 Objects 與聲像，可先 link 檢查；若要深入剪輯、改版本，先評估轉換 media 的成本，避免一邊改得很碎一邊追查 disk 問題。

## ADM輸出：先列清楚會包含什麼

`File > Bounce Mix`選 `WAV (Dolby Atmos ADM BWF)`，一般 Audio 設定會由格式接手並灰掉，接著設定 Dolby Atmos 區域與 Offline。Bounce 顯示 Beds／Objects 數目，是根據 I/O Setup Bus 頁映射到 Renderer 的內容算出來。

| 要納入的內容 | 必要條件 | 常見漏失 |
|---|---|---|
| Bed／Object Audio | Bus active、Session 實際使用、已映射 Renderer | 只有 Output mapping，沒有 Renderer mapping |
| Object Pan Metadata | 對應 Track Object Control Mode 為 Master | Audio 有了，Pan 沒被寫入 |
| Bed/Object Groups | 依目前 I/O Setup 的 group assignment | 不受 Program-level metadata 來源選項取代 |
| Program-level metadata | 選 Factory／Connected／Previous 來源 | 誤用上一份 ADM 的設定 |

`I/O Setup`按鈕可跳去核對；`?`與 Report 提供 Included Renderer Mappings 報告，列 Bed、Object、Renderer input 與 group。這比只相信某個數字看起來合理更可靠。Bed 在 output 點取訊號，能把共用同一 output 的 bus 全部納入；Object 則分別形成唯一 Mono object channel。

## Program-level與動態Object Metadata分開選

Program-level metadata 是整個 master 固定的設定，包括 downmix、trim、front/back balance、binaural render mode 等；不是每秒改變的 Object 位置。它也可能實際影響 re-render 的聲音，而不只是供人閱讀的標籤。

| 來源 | 採用哪套資料 | 可用條件 |
|---|---|---|
| Factory Default | Dolby Renderer 預設 | 不倚賴既有連線或匯入檔 |
| Connected Renderer | 目前連線 Renderer 設定 | 必須真的連上 |
| Previous ADM File | 最近一次匯入 ADM 的 metadata | Session 匯入過 ADM；多份只保留最新一份 |

`Add FFOA`可寫 First Frame of Action 位置，是否要有應看交付要求；不能填在 Timeline 選取起點之前。Frame Rate 欄只是 Session Setup 值的顯示，不在 Bounce 內修改；高於 30fps 的部分情況會以 SD derivative 寫入，例如 48fps 顯示 24fps，且大於 30fps 的 drop-frame 不受支援。做特殊 frame rate 交付時要直接核對此段原文與收件規格，不能只看播放器顯示幾 fps。

## Re-render一次產出多個檢聽版本

2023.3 可 Offline 產生 7.1、5.1、2.0 與 binaural re-render，並可與 ADM master 放在同一次 Bounce。Re-render 可取 full mix，也可依 Bed、Object 或 Group 篩選；這跟 Bed/Object Fold Down Path 的粗略監聽不同。

操作順序是 Bounce Mix 選 Atmos 格式，保留或調整 Create Master File，勾 Create Re-Renders，進 Configure Re-Renders 設定要輸出的版本，再加進 Bounce。選 Interleaved 或 Multiple Mono，指定 Apply Program Level Metadata From，最後檢查輸出位置。

| 檔案型態 | 檔案／資料夾樣子 | 適合檢查什麼 |
|---|---|---|
| Interleaved re-render | `<Bounce Name>_<Re-Render name>.wav` | 每個版本一個檔案 |
| ADM master | `<Bounce Name>.wav` | Audio 加 metadata 的主交付 |
| Multi-Mono re-render | 每版本子資料夾，channel 名附在檔名 | 逐 channel 交付與核對 |

Composite Beds 允許不同 group 共用同一 bed output，卻在 re-render 時仍能按 group 分內容；目的在節省 channel 讓更多 Object 可用。它不代表可以略過 group 與 bus mapping 的整理。

> [!warning] 沒 Renderer 也能編輯，不表示可忽略 render 核聽
> Pro Tools 能記住上次 mapping，允許在離線狀態改路由、匯 ADM 與做部分工作；粗略 Fold Down 也能讓你聽見內容。正式確認 Atmos 成品，仍要驗證輸出檔案與正確 render 結果。

> [!abstract] Takeaway
> 用 Session Data 匯入 ADM，輸出前用 Report 核對實際映射。Audio、Object Pan、Groups、Program-level Metadata 各有納入條件；交付要把這四份清單都看過。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch58b-Object控制與空間Automation]]

下一篇：[[PT-Ch59-Ambisonics與格式轉換陷阱]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch58a-DolbyAtmos架構與Renderer連接]] · [[PT-Ch58b-Object控制與空間Automation]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch57 — Surround Panning and Mixing]]

[[PT-00-功能目錄#Ch59 — Ambisonics]]

標籤： #pro-tools #audio #study-note
