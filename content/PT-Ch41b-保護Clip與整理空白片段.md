---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 41
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "950–957"
pdf_pages: "982–989"
source_version: "2023.3"
---

# Ch41b — 保護Clip與整理空白片段

> 整理素材時，位置保護、靜音判定與重複長度，分別解決三種不同問題。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=982|Chapter 41，原書 p. 950–957／PDF p. 982–989]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Edit Lock 與 Time Lock：鎖住什麼，要先想清楚

錄音剪好後，最怕一個不小心拖曳把同步關係破壞。Pro Tools 提供兩種 Clip lock；差異不在名字比較嚴格，而在你還希望允許哪些操作。

| 保護方式 | 不允許 | 仍可做的事 | Mac |
|---|---|---|---|
| Edit Lock | 搬動時間位置，以及切割、裁邊、刪除等編輯 | 複製後貼到別處，副本仍被鎖住；允許警告後可作部分編輯 | Command+L |
| Time Lock | 改變 Clip 時間位置 | 裁邊、切割、AudioSuite、刪除或換 Track 等不改時間的編輯 | Option+Control+L |

Edit Lock 的優先度高於 Time Lock。若 Clip 已 Edit-locked，不能直接再套 Time Lock；先解除再改。兩種 lock 在 Shuffle mode 都會使已鎖片段及其後片段不被前面的編輯推走。這也是有時 Shuffle 看似失效的原因：不是滑鼠壞掉，而是後面的保護點限制了可用空間。

> [!tip] 實務連結
> 剪完並對好畫面的音效，若還要調尾巴與處理聲音，可用 Time Lock；要避免整段誤刪，就用 Edit Lock。Time Lock 並不是「不能刪」，交接工程時要把這點寫進備註。

> [!warning] Lock 不等於對所有時間變動免疫
> 在 tick-based、Elastic Audio-enabled Track 上，被鎖 Clip 仍會依 Tempo change conform；原書則不允許再對它做 Quantize 或手動 Warp。要維持絕對時間位置，必須一起考慮 Track Timebase，不能只看鎖頭圖示。

## Strip Silence 是自動切段，不能取代聆聽

Strip Silence 依振幅判斷哪些範圍要保留，把長錄音整理成較小 Clip。它是 nondestructive editing：移除的是 Timeline 上的內容引用，原始 audio file 沒有因此刪掉。原書指出可用 Undo 或 Heal Separation 復原。

先選 Audio Clip，按 Command+U 開 `Edit > Strip Silence`。調整到預覽矩形正確涵蓋要保留的聲音，再按真正執行的按鈕。人聲換氣、手指滑弦與 reverb decay 都可能比 Threshold 小，必須用前後緩衝空間保護它們。

| 控制 | 作用 | 聽感上的確認 |
|---|---|---|
| Strip Threshold | 判定 silence 的振幅門檻，原書範圍 −96 至 0 dB | 弱音、尾韻有沒有被當作空白 |
| Minimum Strip Duration | 控制最短判定時間，原書範圍 0–4000 ms | 是否被切成大量碎小片段 |
| Clip Start Pad | 每段開頭額外保留的時間 | 呼吸、撥弦前音有沒有被切掉 |
| Clip End Pad | 每段尾端額外保留的時間 | 延音與殘響是否自然 |

| 執行按鈕 | 留下什麼 | 合適用途 |
|---|---|---|
| Strip | 保留有聲區，清除 silence | 切出對白、人聲樂句 |
| Extract | 保留被判為 silence 的區域，清除有聲區 | 擷取 room tone 或 ambience |
| Separate | 依偵測邊界分割 Clip | 想先分段，暫時不清掉素材 |
| Rename | 設定新 Clip 的名稱與流水號 | 大量音效或台詞片段命名 |

原書的 Minimum Strip Duration 英文描述容易讓人誤讀成「超過門檻的聲音算成靜音」；實際使用請以視窗預覽矩形與試聽核對切段，別僅依一句文字判斷。這裡不照搬有矛盾的語句。

### 可以直接跟做的整理流程

1. 在尚未刪改的 Playlist 或複本上框選需要整理的區域。
2. 開 Strip Silence，先調 Threshold，讓主要樂句被完整保留。
3. 增加必要的 Start Pad／End Pad，聽清楚句首與尾韻。
4. 用 Minimum Strip Duration 減少不必要的碎片。
5. 先用 Separate 檢查邊界，或確認後用 Strip 清掉空白。
6. 接著到 Ch32 檢查 fades 與接縫；「自動分好」不代表交付前不需聽。

> [!tip] 實務連結
> 要從外景對白裡找 room tone，Extract 正好做 Strip 的反向工作。但機械判定的「silence」可能有冷氣、車流或衣物聲，仍要選出適合補縫的段落；Threshold 只負責幫你縮小搜尋範圍。

## Insert Silence 不同於在 Clip 旁留下空白

`Edit > Insert Silence` 以選取長度為依據。Shuffle mode 會把後續內容向後推，Slip mode 通常清空目前選區而不推動後段，Grid mode 則如 Clear command。多軌選取時，是否顯示 Audio／MIDI 主內容，或全都在 automation view，會決定影響的是哪些資料。若選到 Conductor Ruler，Marker 等資料也可能被影響。

因此在整首歌插入空拍，應先確認哪些 Track、哪些 ruler 一起選取；如果只是去掉一句口水聲，不要無意間用 Shuffle 推動後面整首錄音。Clip 靜音則可用 `Edit > Mute/Unmute`，它保留素材，只使所選 Clip 不播放，與 Track Mute 是不同範圍。

## Duplicate、Repeat 與節拍長度

Duplicate 只把選取內容接到選區結尾，Repeat 則讓你輸入要重複的次數。Shuffle mode 會為新增內容推動後段，Slip mode 則可能覆蓋後續素材。若要整段維持可伸縮的循環關係，轉看 Ch42 的 Loop。

| 指令 | 適合情況 | Mac／要點 |
|---|---|---|
| Duplicate | 快速再接一份 | Command+D |
| Repeat | 一次建立指定數量 | `Edit > Repeat` |
| Duplicate and Extend | 複製後，讓選取同時包含原本與新增內容 | Command+Option+Control+Shift+D |

原書特別提醒，對音樂 Loop 使用 Bars/Beats 時，應用 Selector 明確框出拍點範圍，或直接輸入選區起訖。只用 Grabber 選整個 Audio Clip，可能因 sample rounding 產生數 tick 的偏差，重複久了才顯露出漂移。相反地，若工作本來就以 samples 為準，應換用非 Bars/Beats 的 Time Scale，確保複製的 sample 數正確。

> [!abstract] Takeaway
> Time Lock 保護時間位置，Edit Lock 同時保護編輯；Strip、Extract、Separate 留下的內容不同。重複音樂要先定準節拍選區，不能只把「看起來差不多一小節」的 Audio Clip 一直 Duplicate。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch41a-Clip放置與精準定位]]

下一篇：[[PT-Ch42-ClipLoop與Group的編排方法]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch41a-Clip放置與精準定位]]

跨章延伸：[[PT-Ch42-ClipLoop與Group的編排方法]] · [[PT-Ch45a-ElasticAudio啟用與演算法]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
