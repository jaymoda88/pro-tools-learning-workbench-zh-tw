---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 51
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1163–1174"
pdf_pages: "1195–1206"
source_version: "2023.3"
---

# Ch51b — Preset與MultiMono控制

> Preset 儲存的是聲音設定，Plug-In Map 儲存的是控制器如何操作它；兩種檔案不能混用。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1195|Chapter 51，原書 p. 1163–1174／PDF p. 1195–1206]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## 把設定做成能查找的資料，而非只留在一份工程

Plug-In Settings menu 提供 Save、Save As、Copy、Paste、Import 等命令。`.tfx` 是宿主可辨識的 settings file，可存到 Session Folder 的 Plug-In Settings，或 Root Settings Folder。Session-level 設定方便交接，Root-level 方便日常跨工程使用；真正要搬走時，記得依賴的 settings 位置也要能找到。

| 命令 | 作用 | 風險／習慣 |
|---|---|---|
| Save Settings | 覆寫目前 preset | 想保留舊版先用 Save As |
| Save Settings As | 另存新名稱 | 把用途／來源命名清楚 |
| Copy／Paste Settings | 同類 Plug-In 之間複製參數 | 不等於整條 routing 或 automation |
| Import Settings | 從其他位置載入 `.tfx` | 必須是相符 Plug-In 的設定 |
| Set As User Default | 指定自己的初始設定 | 再設定 default 使用 User 而非 Factory |
| Lock Settings File | 防止 Save 覆寫該 preset | 修改時需另存版本 |

Mac Target Plug-In window 的 Command+Shift+S 儲存設定，Command+Shift+C／V 複製／貼設定。這組快捷鍵與主工程層的命令同名但作用範圍可能不同，先看 Target 與 focus，不能只背按鍵不看視窗。

> [!tip] 實務連結
> 常用的低延遲錄音 EQ，可先存成「Vocal Tracking Low Latency」；混音用的重處理再另存。Preset 應傳達工作目的，不是把某一次錄音的參數誤當成所有歌手的標準。

## 載入與比較：Next／Previous 會換掉未存修改

Plug-In Librarian 列出可用 presets，Next／Previous 逐個切換；Compare 在儲存版本與目前修改之間切換。若你改完未存，直接按 Next 可能失去那些暫存參數。想比較多組設定，可用 Settings Select dialog 逐項選，或指定 Increment Patch Every X Sec 自動試聽。

| 你在比較什麼 | 合適方法 | 需要先保留 |
|---|---|---|
| 同一 preset 修改前後 | Compare | 原 preset 與當前修改 |
| 多個不同 preset | Settings Select／Next／Previous | 想保留的當前聲音先 Save As |
| 處理有無 | Bypass | 注意輸出音量差 |
| 不同 Plug-In chain | Track Preset／複本等流程 | 單一 `.tfx` 不足以表達整條 chain |

Workspace 可以依 Kind > Is > Plug-In Settings File 搜尋；把 `.tfx` 拖到空 Insert 可同時載入相應 Plug-In 與設定，拖到已開 window 則改同一 Plug-In 的設定。不同名稱／類型的 Plug-In 不能因「都是 EQ」就互相讀取相同 `.tfx`。

## Multi-mono：link 只是同時操作，不是永久同一份聲音

Stereo 或 multichannel Track 上的 Multi-mono 會有 Master Link、各 channel 的 Link Enable 與 Channel Selector。預設連動，調一邊會帶其他 channel；解除 Master Link 可獨立改各邊，再按需求把部分 channel 連在一起。

| 設定狀態 | 調整／Preset 作用 | 何時需要 |
|---|---|---|
| Master Link 開啟 | 所有 channel 一起改 | 希望多聲道保持一致 |
| Master Link 關閉 | 可選單一 channel | 特定聲道有不同問題 |
| 部分 Link Enable | 只有選定 channel 連動 | 保留 LFE 等例外 |
| Unlinked 時 import／copy／paste／bypass | 只作用於當前所選 channel | 避免以為所有 channel 都更新 |

> [!warning] 重新 link 可能犧牲原本不同的 automation
> 連動前先核對哪個 channel 是現在的參考，以及原來各 channel 是否已寫不同曲線。多聲道 EQ 的數值看似回到一致，不代表各 channel 的歷史 automation 都仍完整保留。

## Plug-In Map：把重要參數放到順手的硬體位置

Map 針對支援的 control surface，以 `.pim` 匯出／匯入。它記錄 encoder、switch 或 Flip-mode fader 對應到哪個 automatable parameter，而不是 EQ cutoff 目前是多少。Map 按控制器類型與 Plug-In channel format 區別；某個 Stereo map 不代表自動適合 Mono／5.1。

1. 確認支援的 control surface 已在 Pro Tools 宣告，顯示 Map controls。
2. 打開 Plug-In，按 Learn，或從 Map Options 選 New Map。
3. 點要映射的 Plug-In parameter，再在控制器上轉對應 encoder 或按 switch。
4. 逐個安排常用參數，完成後離開 Learn。
5. 用 Save Map As 另存，必要時 Export Current Plug-In Map；多系統可 Export All。

| 檔案／設定 | 保存什麼 | 範圍 |
|---|---|---|
| `.tfx` | Plug-In 聲音參數 preset | 個別 Plug-In settings |
| `.pim` | Control surface parameter mapping | 系統 global preferences，可匯出 |
| User Default | Plug-In 初始聲音設定 | 新建 Plug-In instance 的起點 |
| Default Map | 預設控制配置 | 可能影響使用該 map 的多個 instance |

原書每 custom map 可有最多 200 pages；不用因上限大就做滿。把第一頁放最常改的參數，後面再放偶爾用的控制。Default Map 變更會傳到使用該 default 的 instance；匯入 map 也可能更新 default，不是只改你正在看的那一顆。

> [!tip] 實務連結
> EQ 第一頁可放 Frequency、Gain、Q 與 enable，Dynamics 第一頁放 Threshold、Ratio、Attack、Release。這是依工作頻率安排的示例，不是固定標準。跨工作室時帶一份 `.pim`，但先核對控制器類型，避免到場才發現 map 不相容。

## Bypass 群組與檢查

Track > Bypass Insert 可以按 All、A–E、F–J 或 EQ／Dynamics／Reverb／Delay／Modulation 類型旁路。Mac Shift+A 全部、Shift+2／3 分兩組、Shift+E／C／V／D／W 分類。複合 Channel Strip 可能只旁路符合該類別的一段；硬體控制器的 focus 也有獨立指示。

![[PT-Ch51-insert-paths.png]]

> [!abstract] Takeaway
> `.tfx` 管聲音，`.pim` 管硬體操作。切 preset 前先存修改，Multi-mono 要確認當前 channel 與 link 狀態；改 Default Map 可能傳播到多個 instance。快捷操作省下的是手勢，不應省掉範圍確認。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch51a-PlugInInsert與SideChain]]

下一篇：[[PT-Ch51c-HardwareInsert與數位Clock]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch51a-PlugInInsert與SideChain]] · [[PT-Ch51c-HardwareInsert與數位Clock]]

跨章延伸：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch52-DSPMode與低延遲錄音]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
