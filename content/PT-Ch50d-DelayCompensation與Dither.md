---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 50
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1136–1146"
pdf_pages: "1168–1178"
source_version: "2023.3"
---

# Ch50d — DelayCompensation與Dither

> Delay Compensation 對齊不同路徑，Dither 處理降 bit depth 的量化行為；兩者都在保護結果，卻各自有明確邊界。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1168|Chapter 50，原書 p. 1136–1146／PDF p. 1168–1178]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Delay Compensation：把路徑等到同一個時間

Plug-In、hardware insert 與 bus routing 可能帶來不同 delay。開 `Options > Delay Compensation`，Pro Tools 透過增加所需等待時間讓路徑對齊，不是把所有 processor 本身都變成 zero latency。混音播放通常應開啟；錄音監聽則有自動 low-latency 行為，必須另看 record／input-enabled Track。

| Session sample rate | 原書每 mixer channel 可用補償量 |
|---|---|
| 44.1／48 kHz | 16,383 samples |
| 88.2／96 kHz | 32,767 samples |
| 176.4／192 kHz | 65,534 samples |

System Delay 包含最長回報路徑與 mixer routing 延遲；Track 的 `dly` 顯示不一定就是完整 System Delay。檢查 Session Setup 的 System Delay，才能判斷整個工程離限制多遠。非 HD hardware 的 converter latency 也不是所有項目都能從這個數值看出。

## 三個欄位各自回答不同問題

| 欄位 | 問題 | 常見顏色／解讀 |
|---|---|---|
| dly | 這條 Track 回報了多少 Insert delay？ | Green 正常，Orange 為最長，Red 超限，Gray 回報旁路 |
| User Offset | 人工再加／減多少等待？ | 正值更晚、負值更早 |
| cmp | 系統實際補多少？ | Green 正常，Blue Audio Track 強制補償，Gray 停用，Red 超限 |

Toolbar 的 DLY 變紅，也可能代表 feedback loop 使補償無法成立，並非每次都是 CPU 不夠。滑鼠停在 indicator 看 tooltip，先排 routing 再改 buffer。補償超限時，原書指出該 Track 可能不再得到正確補償，需要減少 delay、render 某些 processing，或進行明確人工對齊。

> [!tip] 實務連結
> Parallel compression 一開聲音變薄，不一定是 Compressor 音色問題；先看 dry／wet 兩條路的 compensation 與 Plug-In delay report。若某 Plug-In 回報錯誤，User Offset 可用來修正，但應先量測，避免憑耳朵一邊亂 nudge、一邊又讓 ADC 補回去。

## Record-enable 為什麼突然改變時間？

Audio Track 進 record-enable／TrackInput 等狀態時，系統通常暫停該路的補償，讓演奏者少等；正常播放時再對齊其他 Track。需要固定 bus recording／dubbing 行為時，可 Command+Control-click `cmp` 強制保留補償，Audio Track 顯示藍色，但 live input 會因此多等相應時間。

| 情況 | 優先考量 | 可能操作 |
|---|---|---|
| 演奏者即時錄音 | 低監聽 latency | 保留自動 low-latency 行為，減高 delay Insert |
| 多層 bus-record／dubbing | 路徑一致對齊 | 依原書 override，再確認每層 |
| Aux 監聽外部來源 | 減少 input 等待 | 依需求 bypass Aux compensation |
| MIDI 虛擬音源錄音 | 演奏與 playback 對齊 | 系統會在錄完後調整 recorded MIDI 的 timing 關係 |

MIDI／Instrument record-enable 也會使接收它們的 Instrument／Aux 路徑進 low-latency 狀態。跨 ReWire client 的內部 latency 不保證全被 Pro Tools 知道，所以「ADC 開了」不等於所有外部軟硬體都已精準對齊。

> [!warning] Side-chain 補償的 Preferences 位置，原文有不一致
> Ch50 p.1139 寫 Operation tab，Ch51 p.1162 寫 Mixing tab。本筆記將 `Compensate Side Chains` 作為搜尋名稱；實際以 2023.3 Preferences 中該選項所在位置核對，不把兩個互斥路徑都當成唯一正解。

## 外部 Hardware Insert 要量的是回路差值

`Setup > I/O > H/W Insert Delay` 可輸入 milliseconds offset。原書建議開啟 ADC，建立清楚起點的測試聲，經 hardware insert 後 bus-record 到另一軌，放大比較來源與返回起點，將殘餘差值填入對應 I/O 的 offset。測試時外部設備先只傳 dry，避免 reverb 或 compressor attack 被誤當 latency。

| 測量項目 | 確認方式 | 不要混淆 |
|---|---|---|
| Source 起點 | 清楚 transient／短 tone | 聲音包絡不同可能難比較 |
| Return 起點 | 錄回後放大 waveform | 不用手拖到看起來對齊後才測 |
| 單位 | milliseconds 或 samples，依欄位 | sample 不等於 ms |
| 套用位置 | H/W Insert Delay 的對應 input | 只在該 I/O 作 insert 時有效 |

## Dither：降 bit depth 的取捨

降低 bit depth 可能產生與訊號相關的 quantization distortion，尤其在很小聲與 fade out。Dither 加入微量 random noise，讓失真不再以同樣相關的方式出現；換來的是 noise floor 與主觀低電平品質之間的取捨。Noise shaping 再把 noise 的頻譜分布移到較不敏感的區域，不是把噪音魔法般變不存在。

原書建議 final mixdown 目的 bit depth 低於 24-bit 時，在控制該 mix 的 Master Fader 插 dither；真正 Bounce 的細節接 Ch54。Import／Export 的降 bit-depth 路徑也可能由系統套用預設 noise-shaped dither，不能再毫無核對地多加一層。

> [!tip] 實務連結
> 匯出前先寫清楚 sample rate、bit depth、聲道與是否需要 final dither。Dither 應對準實際的 bit-depth reduction 步驟，而不是每條 Track、每一層 bus 都習慣性加一顆。

本章最後的 control surface 設定另分 Ethernet／EUCON 與 MIDI HUI：前者在 Peripherals > Ethernet Controllers 啟用 EUCON，後者在 MIDI Controllers 指定 Type、Receive From、Send To，並在 MIDI Input Devices 啟用相應 port。相同 port 不應給多個控制器重複占用。

![[PT-Ch50-routing.png]]

> [!abstract] Takeaway
> ADC 讓路徑等到同一時間，不消除演奏監聽等待；record-enable 會改變補償策略。外部 Insert 要量回路，Side-chain 要查對選項。Dither 則只對應降 bit depth 的那一步，先確認規格與系統已做的處理。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch50c-Submix效果回傳與耳機混音]]

下一篇：[[PT-Ch51a-PlugInInsert與SideChain]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch50b-Sends與混音視窗操作]] · [[PT-Ch50c-Submix效果回傳與耳機混音]]

跨章延伸：[[PT-Ch51a-PlugInInsert與SideChain]] · [[PT-Ch53a-Automation模式與資料層]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
