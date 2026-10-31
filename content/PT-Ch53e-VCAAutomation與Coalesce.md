---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 53
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1244–1247"
pdf_pages: "1276–1279"
source_version: "2023.3"
---

# Ch53e — VCAAutomation與Coalesce

> VCA 的變化與成員原本的 automation 可以共存；Coalesce 才把兩層正式合成成員自己的資料。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1276|Chapter 53，原書 p. 1244–1247／PDF p. 1276–1279]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## VCA 不混 Audio，卻會影響成員的最終控制值

Ch50 已區分 VCA 與 Aux：VCA 改的是 Group member 的控制，不是接收一條 summed audio。到了 Automation，VCA Master 的 Volume、Volume Trim、Mute 都可記成曲線；成員還能保有自己原來的 Volume／Mute data。播放時你聽到的是這些控制貢獻一起作用的結果。

| 資料層 | 作用 | 顯示 |
|---|---|---|
| Member Track main automation | 各 source 自己的變化 | 可編輯的原曲線 |
| VCA Master automation | 一組成員的共同變化 | VCA 的獨立 playlist |
| Composite playlist | 兩者合成的實際狀態 | 結果檢視，不能直接當原曲線改 |
| Coalesced member data | 把 VCA 貢獻寫進成員 | 之後可不再依該 VCA |

`View > Automation > Composite Playlist` 可在成員查看 composite Volume／Mute。原曲線沒看見新點，不代表 VCA 沒有作用；它可能還在上層 VCA playlist，成員 fader 與 Composite 會顯示目前實際狀態。

> [!tip] 實務連結
> 每軌鼓的相對音量已調好，可用 Drum VCA 在副歌整組抬高，而不逐軌再寫一次。之後若混音師希望只收到每個成員自己的 automation，再 Coalesce；在此之前保留兩層，修改整組變化更清楚。

## 想讓某個成員不受這次 VCA pass 影響

原書提供排除方式：VCA 進可寫模式，欲排除的 member Track 也進 Write，而其他要納入的成員不要進寫入。開始 pass 後移動 VCA，系統會在被排除 member 上寫出抵銷 VCA 的相應變化。這不是把該成員永遠從 Group 移除，而是為該 pass 產生抵銷資料。

| 想做的事情 | 方法取向 | 後續管理 |
|---|---|---|
| 這次 pass 排除一條 source | 按原書建立抵銷 member automation | 記得它已有補償曲線 |
| 長期不要由該 VCA 控制 | 從 Group membership 移除 | 既有 VCA 貢獻可能 coalesce |
| 只改單條 member 音量 | 直接寫 member curve | 與 VCA 貢獻相加評估 |
| 查看實際值 | Composite Playlist | 不在 composite 直接畫新 data |

> [!warning] 排除不代表沒有寫入資料
> 這個流程會在 member 寫出抵銷 VCA 的 automation。之後若又大改 VCA 曲線，原來的抵銷也可能不再表達相同創作意圖。把例外 Track 命名或備註清楚，避免幾天後忘了為什麼它的曲線反向移動。

## Coalesce 有多種觸發方式

| 操作 | 結果 | VCA／source 保留情況 |
|---|---|---|
| Track > Coalesce VCA Master Automation | Volume／Mute 貢獻寫進所有成員 | VCA 保留，但 fader 回零、mute 回 unmuted，原 VCA automation 清除 |
| 刪除 VCA Master | 將貢獻固定到成員 | VCA 刪除；原書警告此動作不可 Undo |
| 從 VCA Group 移除一個 member | 只將該成員的貢獻固定 | 其他成員與 VCA 保留 |
| Duplicate member，取消 Group Assignments | 複本取得 coalesced 結果 | 原 member 不變 |
| 只 coalesce Edit selection | 只固定指定時間區域 | 選區外維持原結構 |

想試一次 coalesced 結果，Duplicate member 並取消 Group Assignments，通常比直接刪 VCA 更容易比較。它保留原結構，又能產生不依賴該 Group 的複本；但兩者同時播放會重複聲音，請分別 A/B。

### 只固定一個段落

1. 選 VCA Master，建立明確 Edit selection。
2. Mac 按住 Control，再選 `Track > Coalesce VCA Master Automation`，或在相應右鍵命令操作。
3. 核對 member 在該範圍的 composite Volume／Mute 已寫入自身資料。
4. 檢查選區內 VCA 已回預設，而外側仍保留原 automation。
5. 聽邊界是否連續，並確認不需再額外套一次相同 offset。

這是「把兩層變成一層」的資料整理，目的應是交接或確定結構，不是音色特效。原書說 coalesced Track 應維持與原 VCA 結構相同的播放效果；若聽到明顯變大／變小，先查重複播放、Group membership 與已固定的 automation 是否又被加上第二次。

> [!tip] 實務連結
> 交接給只想管理逐軌曲線的混音工程，先另存版本，再 Coalesce。保留原 VCA 版本能讓你之後快速回到「整組 + 各軌」的分層工作，而不必從許多已合併曲線重新猜出當初的 Group 意圖。

![[PT-Ch53-automation-modes.png]]

> [!abstract] Takeaway
> VCA automation 與 member automation 是兩層資料，Composite 顯示實際結果。Coalesce 把上層貢獻固定到成員；刪除 VCA、移除成員或複製時，也可能觸發合併。先留版本、再固定，避免把創作層次過早壓成一條曲線。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch53d-WriteTo快照與Preview工作流]]

下一篇：[[PT-Ch54-Mixdown與交付檔案]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch53a-Automation模式與資料層]] · [[PT-Ch53b-Automation錄寫與保護]] · [[PT-Ch53c-Breakpoint編輯與Trim整合]] · [[PT-Ch53d-WriteTo快照與Preview工作流]]

跨章延伸：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch44a-ClipGain與音量整理]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
