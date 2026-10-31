---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 44
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "985–992"
pdf_pages: "1017–1024"
source_version: "2023.3"
---

# Ch44a — ClipGain與音量整理

> Clip Gain 在 mixer 與 Plug-In 之前改變音量，適合先整理素材，再讓後面的 Compressor 在穩定的輸入條件下工作。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1017|Chapter 44，原書 p. 985–992／PDF p. 1017–1024]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## 為什麼不直接推 Track Fader？

一條人聲 Track 裡，有些句子貼近麥克風、有些句子較遠。若只用 Fader 補償，插在 Track 上的 Compressor 依然會收到忽大忽小的輸入。Clip Gain 是 pre-mixer、pre-fader，也在 Plug-In Insert 之前；先調它，就能同時改變後段處理器的輸入，而不是只改最後聽到的音量。

| 控制 | 作用對象 | 跟 Clip 移動？ | 常見用途 |
|---|---|---|---|
| Clip Gain | 素材本身的播放增益 | 是 | 整理不同句子、來源的相對輸入 |
| Volume Automation | Track 音量隨時間的變化 | 取決於 Automation Follows Edit 等編輯條件 | 混音內的人聲層次與段落走向 |
| Fader 靜態設定 | Track 當前整體音量 | 屬於 Track | 平衡整軌相對位置 |

Clip Gain 預設 0 dB，原書範圍 −144 dB 至 +36.0 dB。Static Clip Gain 讓整段使用同一個數值；Dynamic Clip Gain 則由 breakpoints 描述隨時間的變化。兩者可以透過同一個 Clip Gain fader 整體增減，並不需要先丟掉已有曲線。

> [!tip] 實務連結
> 整理人聲時，先把明顯過大的單字與過小的句尾拉近，讓 Compressor 不必同時負責「救每個字」與「塑造動態」。等壓縮後整體聽感穩定，再用 Track Volume Automation 做歌曲情緒走向。這是兩層控制的分工，並不是把所有動態磨平。

## 顯示、調整與快捷鍵

| 操作 | Mac | 說明 |
|---|---|---|
| 顯示 Clip Gain Info | Control+Shift+= | Clip 左下角 icon 與 static value |
| 顯示 Clip Gain Line | Control+Shift+- | 動態曲線；Track height 要 Small 或更大 |
| 游標處新增 breakpoint | Control+Shift+E | 用於局部 gain 修整 |
| 增／減所選 Clip Gain | Control+Shift+↑／↓ | 幅度由 Editing preferences 的 Nudge Clip Gain By 決定 |
| 清除所選 Gain | Control+Shift+B | 選區內回到 0 dB |

點 Clip Gain icon，再上下拖 fader，可快速改整段；按住 Command 讓調整更細。Dynamic Clip 不顯示單一 static value，因為它沒有一個能代表整段的固定值，並不是 gain 遺失了。Crossfade 裡可能看見前後 Clip 的兩條 gain line，各自沿 fade out／fade in 延伸。

## 用 breakpoint 改一個字，而不是改整句

Grabber 在 gain line 上點擊新增 breakpoint，上下拖改增益、左右拖改時間；Option-click 刪除。Pencil 可用 Free Hand、Line、Triangle、Square、Random 畫曲線，Parabolic 與 S-Curve 不適用 Clip Gain。Trim tool 則把所選 breakpoints 整體上下移動，保持原來增益差距。

1. 打開 Clip Gain Line，放大到看清楚要改的字。
2. 先在需要保留的左右位置建立邊界點。
3. 在問題片段內加點，上下調整，避免把整句一起抬高。
4. 聽接縫是否有突變；局部過快變化同樣可能不自然。
5. 若整段還需再增減，使用 Clip Gain fader 或 Trim，保留內部修整關係。

> [!warning] 複製 Clip Gain 有 Clip 邊界限制
> 可以 Copy Special／Cut Special Clip Gain，再貼到另一個單一 Clip；不能把跨多個 Clip 的 gain data 當成一條無邊界曲線直接貼。貼上的資料超出 Clip 尾端時仍跟該 Clip 關聯，之後拉長邊界可能又露出來。複製前先確認是整個 Clip，還是 Clip 內的局部選區。

## Bypass、Clear、Render 是三種不同的決定

| 指令 | 現在聽到什麼 | 原設定是否保留 | 後果 |
|---|---|---|---|
| Bypass Clip Gain | 暫以 0 dB 播放 | 保留 | 適合 A/B 比較 |
| Clear Clip Gain | 回到 0 dB | 清除所選設定 | 可以只對部分選區操作 |
| Render Clip Gain | 把變化寫成新音訊 | 新 Clip gain 回 0 dB | 現有聲音保留在音訊中 |

Render 常用在交付給不支援相同 Clip Gain 行為的流程；但要先確認 gain 是否只需暫時調整。與 AudioSuite 串接時，設定可能被保留或被先燒入，詳細組合見 Ch43，不能每次都一概認定 gain 會在 Render 後留著。

## Convert 與 Coalesce：搬家，或相加

Studio／Ultimate 可在 `Edit > Automation` 將 Clip Gain 轉成 Volume Automation，或反向轉回。Convert 把設定移到另一層；Coalesce 則把它合併進已存在的另一層。這會改變訊號鏈上的位置：同一條 dB 曲線放在 Compressor 前後，最終聲音不一定相同，因為壓縮器的觸發條件改了。

| 目的 | 選擇 | 核對項目 |
|---|---|---|
| 改成混音端可編輯音量曲線 | Convert Clip Gain to Volume Automation | 是否跨越 Plug-In 改變 gain staging |
| 把 Track 曲線帶著 Clip 一起走 | Convert Volume to Clip Gain | 其他 Track automation 是否另需保留 |
| 把兩層變成一層 | Coalesce 對應命令 | 合併後的 range 與 crossfade 結果 |

原書提醒，轉入 Volume Automation 的 Clip Gain 若超過 +12 dB，超出的值會損失；crossfade 中的 gain 也要按轉換後的曲線重新確認。不要在工程尾聲只看數值相同，就宣稱前後處理完全等價。

![[PT-Ch44-signal-order.png]]

> [!abstract] Takeaway
> Clip Gain 先整理輸入，Track Volume Automation 再塑造混音；Dynamic Clip Gain 仍能整體 Trim。Bypass 是比較，Clear 是清掉設定，Render 是寫成新音訊。Convert／Coalesce 跨越訊號鏈位置時，要重新聽 Compressor 與 crossfade 的結果。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch43-AudioSuite離線處理與Handles]]

下一篇：[[PT-Ch44b-ClipEffects與片段處理鏈]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch44b-ClipEffects與片段處理鏈]]

跨章延伸：[[PT-Ch43-AudioSuite離線處理與Handles]] · [[PT-Ch50a-混音Track與訊號流]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
