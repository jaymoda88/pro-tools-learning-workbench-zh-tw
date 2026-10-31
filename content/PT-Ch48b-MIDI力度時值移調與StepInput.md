---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 48
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1072–1083"
pdf_pages: "1104–1115"
source_version: "2023.3"
---

# Ch48b — MIDI力度時值移調與StepInput

> MIDI 的 velocity、duration 與 pitch 是演奏資料；批次改動前先知道哪些相對關係要留下。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1104|Chapter 48，原書 p. 1072–1083／PDF p. 1104–1115]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Change Velocity：統一值，還是保留強弱關係？

Velocity 常影響音量，也可能控制 filter、sample layer、envelope 等音色，所以「velocity 加 20」不一定等於 Audio 加同樣 dB。有效 note velocity 範圍 1–127，超出會限制在邊界；原書例子 64×200% 結果是 127，再加也不會更大。

| 方法 | 對原強弱關係的影響 | 使用時機 |
|---|---|---|
| Set All To | 取消原差異 | 需要固定觸發力度 |
| Add／Subtract | 以固定量偏移 | 整體增加或減少 |
| Scale By | 保留比例，受 1–127 邊界限制 | 原本表情正確但整體太弱 |
| Change Smoothly | 依時間作 velocity 漸變 | 指定 crescendo／decrescendo |
| Change Smoothly by Percentage | 以比例作漸變 | 同時較多保留原表情 |
| Limit To／Randomize | 限範圍／加入偏移 | 控制強弱分布 |

原書 20% louder 的示例使用 Scale By 120%；這裡「louder」是 MIDI velocity 的縮放，不是等效聲壓計算。Randomize 在主要變更後作用；例如 Set All 64、Randomize 50%，原書結果範圍 48–80。Note Off velocity 是否被音源採用，需看該音源實作。

> [!tip] 實務連結
> 鼓的主拍與 ghost note 關係本來好，只是整體 sample layer 太輕，先用 Scale；若整段每一下都設 127，會把原本表情與音源層次一起抹掉。把 Velocity lane 和實際鼓聲一起聽，比只看數值高低更可靠。

## Change Duration：改的是 articulation

| 方法 | 結果 | 與其他方法的差別 |
|---|---|---|
| Set／Add／Subtract／Scale | 固定、加減或縮放 duration | 不等於一定對到下一個 note |
| Legato：Gap／Overlap | 以後續 note 作參考留縫或重疊 | 適合控制連奏 |
| Remove Overlap | 去掉同 pitch 的重疊 | 不會把所有不相鄰音都拉成 legato |
| Transform Sustain Pedal To Duration | 把 CC64 的持續效果轉成 note length | 可再選刪除 Sustain Pedal events |
| Change Continuously | 時值沿時間漸變 | 可按 ticks 或百分比 |

Option+P 開 Change Duration。要讓音更 staccato，原書示範 Scale By 50%；要消除音間空隙，用 Legato > Overlap，設 `0|000`。這些設定改變 MIDI note-off 時機，但音源若有長 release、one-shot sample 或忽略 note-off，聽感未必完全照 note rectangle 的長度終止。

Sustain Pedal 轉 duration 使用 CC64：64–127 視為 pedal down，0–63 視為 pedal up。轉換後若刪掉 pedal events，編輯會更單純；但先聽相同 pitch 重複、release 與真實鋼琴踏板共鳴行為，不能只用 note length 代表所有 pedal 物理聲學。

## Transpose：音程、音階與鼓鍵位分開

Option+T 開 Transpose。Transpose By 按 octaves／semitones；From and To 以兩個 pitch 的差定音程；All Notes To 把全部變同一 pitch；In Key 按 Key Signature ruler 的 scale steps。原書例子 C3 → F#3 是六個 semitones，In Key 輸入 −2 是下行兩個 scale steps，也就是三度關係。

| 模式 | 適合 | 不該直接套用 |
|---|---|---|
| By／From and To | 整段換 key、固定音程 | 忘記排除 drum Track |
| All Notes To | 固定同一個 drum articulation 或觸發鍵位 | 保留旋律輪廓 |
| In Key | 依音階度數變化 | Audio Clip 的 pitch shifting |

Audio 上只有完整選取、已啟用支援演算法的 Elastic Audio Clip 能使用對應轉調；不能把 MIDI 的全部模式推定到 Audio。詳見 Ch45 的演算法與 pitch 範圍說明。

## Select／Split Notes：先選對事件，再批次改

可依 Pitch、Top／Bottom、Velocity、Duration、Position 篩選。Top／Bottom 適合抽出和弦的最高或最低音；原書把 start time 相差 32 ppq ticks 內的音視為同一 chord 的判定範圍。若音符本來是琶音、時間拉得開，不能假設一定被當作同一 chord。

| Action | 產物 | 使用情境 |
|---|---|---|
| Select Notes | 只選符合條件的 note | 單獨量化 hi-hat |
| Split to Clipboard | 符合條件資料進剪貼簿 | 貼往既有 Track |
| Split to A New Track | 合成新 MIDI／Instrument Track | 抽旋律或 Bass |
| Split to A New Track per Pitch | 每個 pitch 各建 Track | MIDI 鼓拆成各鼓件 |

Copy 保留 source，Cut 則搬走；Include All Continuous MIDI Data 會包括 controller，且原書說其範圍可能是整條 Track，不只時間選區。拆鼓前應先確認自己要的是 note data，還是連 pitch bend、aftertouch 等都一起複製。

## Input Quantize 與 Step Input

Input Quantize 在錄 MIDI 當下自動套設定，但原始 performance 資訊仍可用 Restore Performance 取回。Step Input 則不是即時演奏錄音，而是每次彈 note／chord，按指定步長前進。啟用後先前 record-armed Track 會解除 armed，Default Thru Instrument 也暫停，目的地由 Step Input 的 Destination 決定。

| Step Input 控制 | 功能 | 原書數值例 |
|---|---|---|
| Step Increment | 相鄰輸入事件的間距 | 八分音符 480 ticks |
| Note Length | 實際 note duration 占步長比例 | $0.8\times480=384\text{ ticks}$ |
| Tuplet | 不規則分割 | 八分三連音：$\frac{480}{3}\times2=320\text{ ticks}$ |
| Use Input Velocity／Set Velocity To | 採演奏力度或固定值 | 依你要保留的表情決定 |
| Next Step／Undo Step | 沒按住 note 時前進休止／回刪 | 按住 note 時變成 Increment／Decrement 長度 |

按住鍵盤上的 note，再按 Increment，可把其他時值加到同一 note。啟用 Numeric Keypad Shortcuts 後，keypad 的 1、2、4、5、6、7、8 對應 whole 至 64th（依表中順序），3 切 Tuplet、`.` 為 dotted、Enter 前進、0 Undo Step。這套只在 Step Input 且相關選項開啟時成立，不能當成全域 transport 快捷鍵。

> [!warning] Flatten Performance 會改變 Restore 的基準
> Flatten 不是一般 Audio render，而是把目前 MIDI performance 指定為新的 restore state。若還想隨時回到最初錄音的 timing／velocity，先別對該屬性 Flatten。

![[PT-Ch48-quantize.png]]

> [!abstract] Takeaway
> Velocity 是演奏強度資料，Duration 是 articulation，Transpose 要區分 chromatic 與 scale step。先用 Select／Split 篩出對象，再改參數；Input Quantize 可還原，Flatten 卻會重定義還原基準。Step Input 讓步長與音長分開，是精確編程的關鍵。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch48a-Quantize與Groove的節奏整理]]

下一篇：[[PT-Ch49-HEAT的音色與資源管理]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch48a-Quantize與Groove的節奏整理]]

跨章延伸：[[PT-Ch45a-ElasticAudio啟用與演算法]] · [[PT-Ch53a-Automation模式與資料層]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
