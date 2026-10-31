---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 58
tags: [pro-tools, audio, study-note]
created: 2026-10-31
source_version: "2023.3"
status: complete
source_pages: "1315–1328"
pdf_pages: "1347–1360"
---

# Ch58b — Object控制與空間Automation

> Object Track 上同時存在普通 Output 與 Object Output，真正走哪一條，取決於 Bus/Object toggle 與控制模式。

來源：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1347|原書 p. 1315–1328／PDF p. 1347–1360]]。內容以 2023.3 為準；工程情境與自繪圖為本筆記的教學補充。

## 一個Track，兩種輸出角色

I/O Setup 完成 Object mapping 後，在 Edit／Mix Window 顯示 Object View，為 Mono／Stereo Audio、Auxiliary Input 或 Instrument Track 選可用的 Object Output Path。選單會考慮 channel width 與已被使用的指派，不能把某個灰色 Object 硬當成可用。

| Bus/Object toggle | Audio 往哪裡走 | Panning 在哪裡發生 |
|---|---|---|
| Bus | I/O View 中的一般 Output path | Pro Tools 把 7.1.2 Object Panner 轉成該 path 的分配 |
| Object | Object View 中選定的 Object path | Pro Tools 送 Audio，並把 Pan 轉為 metadata，由 Renderer 處理 |

Object 狀態時，I/O View 的普通 Track Output 會被略過。這是新手最常誤解的地方：你改了普通 Output，卻發現聲音沒照預期走，可能根本不是軟體忽略設定，而是目前 Track 走 Object route。

> [!tip] 實務連結
> 排查某個 Object 沒聲音時，依序看 toggle、Object path、Bus 的 Renderer mapping、Renderer input。不要同時亂改四個地方，否則會失去哪個改動真正有效的線索。

## Master、Record、Off/Bypass不是音量模式

Object Control Mode 管理 metadata 的角色。一般由一條 Track 當 Master 送位置控制；在 dubbing 工作流程，Recorder 端可用 Record 錄入其他系統傳來的 Pan 資料；Off/Bypass 允許同一 Object 的其他 Audio 供應者不要重複送 metadata。

| Mode | Audio／Metadata 角色 | 何時用 |
|---|---|---|
| Master | 控制 Object 並送 metadata | 主要 panner；ADM 要含此 Track 的 Object Pan 也需 Master |
| Record | 錄取 Master 來源的 Pan Automation | 重新錄製／dubber |
| Off/Bypass | 有 Object assignment，不送自己的位置 metadata | 多軌供同一 Object 但只留一個控制者 |

這與 Track Automation Read／Touch／Latch 等模式是兩套不同維度。Master 不是「正在寫 Automation」，Record 也不是讓 Audio Track 自動開始錄音。每一層各有設定；下一篇 ADM 輸出時還要檢查 Master 條件。

## 監聽Fold Down只能當粗略參考

完整 Atmos mix 應從 Renderer 監聽。Pro Tools 的 Bed/Object Fold Down Path 可在 Renderer 未連線時啟用，或設 Always Active 給耳機做粗略編輯參考；它以內建係數把內容 fold 到指定 channel format，**不是 Atmos 真正 render**。

可選的 Fold Down output 不能已映射成 Bed 或 Object；若之後把該 output 映射到 Renderer，它會自動失去 Fold Down 資格。這條監聽使用內部不可見 bus，不能照普通 path 方式指派 Master Fader 或 Edit Window Output Meter 來看它。

> [!warning] 不要用 Fold Down 來做 Atmos 空間判斷
> 「耳機有聲」只代表有粗略監聽，不代表 Height、Object spread 與正式 render 正確。需要評估 Atmos 的空間結果，必須回 Renderer 路線。

## Height、Size、Zone：把第三維加進既有Surround

7.0.2／7.1.2 與 Object Panner 提供 Theater 3D View。滾輪可旋轉房間觀看角度，往下捲到底可看 top-down。畫面 Pan 點大小在不同顯示模式有不同意義，別直接把視覺大小當成實際 Object Size 數值。

| 控制 | 功能 | 操作提醒 |
|---|---|---|
| Height Mode | FreeForm 或 Wedge／Sphere／Ceiling 等自動高度 | 自動模式可由既有水平 Pan 衍生高度 |
| Height Enable | 開關 Height | 手動 FreeForm 下啟用相應控制 |
| Height | 上下位置 | 可 Automation |
| Zones | 限制參與的 speaker 區域 | All、Front、Rear 與其他 Zone Mask |
| Size | Object／元素的空間大小 | 不是 Track Volume，也不是視窗縮放 |
| Speaker Snap | Dolby Atmos 的 speaker 吸附行為 | 不等於點 speaker 圖示跳到位置 |

Mac 在 Object Output selector 或 Pan 點上 `Command-click` 可切換 Bus／Object；`Shift+scroll`可改 Size。Automation View 的 Pan 點：Bus Read 為綠、Object Read 為橘、任何寫入模式為紅、Off 為黃、Object off/bypassed 為灰。Renderer Connection indicator 綠色代表連線成功，淡黃代表未連上或中斷。

## 既有Surround Automation怎麼帶進Atmos

`Auto-Height Overrides Height Automation`可讓選定 auto-height 模式覆蓋原本 Height Automation，由 Front／Rear／F/R 資料生成新高度。好處是 5.1／7.1 remix 不必把所有軌跡重新畫一次，但**這仍是動態推算，並非已經把新 Height 資料固定寫好**。

用 `Edit > Automation > Coalesce Pan Guide Automation`可把推算結果 commit 為 Height Automation。跨較舊版本交換時尤其要注意：原書針對 Pro Tools HD12.8.2 與 12.8／12.8.1 交換，要求先 Coalesce 以確保結果。

| 任務 | 命令／設定 | 留意 |
|---|---|---|
| 固化自動 Height | Coalesce Pan Guide Automation | 先選對 Track 與 Auto-Height Mode |
| 舊 Dolby Panner Plug-In 轉 Track Pan | Duplicate Dolby Atmos Plug-in automation to track pan automation | 複製後兩份不會永久雙向同步 |
| Track Pan 帶給舊 Plug-In 工作流程 | Duplicate track pan automation to Dolby Atmos Plug-in automation | 目的 Plug-In 必須存在 |
| 防止意外寫 Bus/Object toggle | 在 Automation Window 停用相應寫入 | toggle 是可自動化的路由改變 |

複製 Automation 後兩份會各自存在，之後改其中一份不會自動更新另一份。移除 Plug-In 會失去其內的 Automation；要確保主要資料留在正確位置。

## Dubbing：Audio與Metadata一起Punch

手冊的大型 mix-stage 例子是多台 HDX 播放、另一台 HDX 作 Recorder，全部與 Renderer 溝通。Recorder 的 Object Control 設 Record，依需求啟用 Link Object and Audio Recording；如此 Object metadata 與 Audio 的 punch in／out 可一起動作。Operation Preferences 可用 Enable Automation in Record 與 PEC/Direct Style Input Monitoring，配合 DestructivePunch、TrackPunch 或 QuickPunch。

PEC 代表聽 disk 播放，Direct 代表聽 Input，顯示會用 P／D；這不是單純換個圖示，而是回錄時判斷現在監聽哪個來源的關鍵。Group 中的 Object Controls 屬性可讓 Object Control mode 與 Bus/Object toggle 跟組一起操作；不需要整組切換時，先檢查 Group 是否在連動。

> [!abstract] Takeaway
> 先查 Track 是否走 Bus 或 Object，再查誰是 metadata 的 Master，最後看 Automation 寫入與監聽來源。Atmos 的 Audio、Panning、Control Mode 與 Automation 是四個互相連動、但不能混為一談的層次。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch58a-DolbyAtmos架構與Renderer連接]]

下一篇：[[PT-Ch58c-ADM交換與Atmos交付]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章其他篇：[[PT-Ch58a-DolbyAtmos架構與Renderer連接]] · [[PT-Ch58c-ADM交換與Atmos交付]]

[[PT-00-索引]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

[[PT-00-功能目錄#Ch57 — Surround Panning and Mixing]]

[[PT-00-功能目錄#Ch59 — Ambisonics]]

標籤： #pro-tools #audio #study-note
