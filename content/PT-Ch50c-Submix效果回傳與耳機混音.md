---
type: study-note
source: "Pro Tools Reference Guide 2023.3（Avid）"
chapter: 50
tags: [pro-tools, audio, workflow, study-note]
created: 2026-10-31
status: complete
source_pages: "1128–1135"
pdf_pages: "1160–1167"
source_version: "2023.3"
---

# Ch50c — Submix效果回傳與耳機混音

> Submix 把多個來源送到共同處理點；先分清是取代原聲的串接，還是與原聲並存的效果回傳。

原文：[[Pro_Tools_Reference_Guide_2023.3.pdf#page=1160|Chapter 50，原書 p. 1128–1135／PDF p. 1160–1167]]。內容依 **2023.3** 文件消化重組；下文未標為原書數值的練習情境與圖解均為筆記補充。

## Discrete Submix 與 Send／Return 的根本差別

如果鼓組 source 的 output 全進 Drum Aux，聲音是經 Aux 之後才到主輸出；若 source 仍直達主輸出，又額外 Send 到 Reverb Aux，就有 dry 與 wet 兩條路。兩者都用 bus，卻是不同的混音 topology。

| 結構 | Source main output | Aux input | 適合用途 |
|---|---|---|---|
| Discrete submix | 指到共同 bus | 同一條 bus | Bus compression、群組 EQ |
| Internal send／return | 繼續到 main mix | 接各 source 的 send bus | 共同 Reverb／Delay |
| External send／return | 繼續到 main mix | 接外部設備 Audio return | 外部效果器 |
| Cue mix | 依主混音需要 | 視設計選 Aux 或直接 output | 歌手／樂手監聽 |

> [!tip] 實務連結
> 要做 drum bus Compressor，將 source output 指向 bus，避免原鼓又直接去 master、形成另一條未處理音量。如果是刻意的 parallel compression，才保留 dry 與 compressed 兩路，並重新檢查 level 與 latency alignment。

## 建一個真正會發聲的 Drum Submix

1. 將欲納入的 Audio Track outputs 指到相同 Stereo bus。
2. 建 Stereo Aux，input 指同一條 bus，output 指 main mix。
3. 在 source 保留各鼓的 Pan 與相對 level。
4. 在 Aux 插入 bus processing，再調 Aux fader 作整組輸出控制。
5. 視需要把 Aux Solo Safe，避免 source solo 時 return 被系統 implicit mute。

`Command-click Solo` 是 Mac 的 Solo Safe；如果要暫時只 Solo Group 裡其中一個成員，原書使用 Control-click Solo。兩者 modifier 不同，目的也不同。

## 共用 Reverb：乾濕比例由兩條路決定

把每條 source 的 Send 指到 Reverb bus，建立 Aux 接收，Plug-In wet/dry 設 100% wet。Source main output 是 dry，Aux return 是 wet；每軌 Send level 決定送多少進同一個空間，Aux fader 控制整體回傳量。這樣不用每條 Track 都掛一顆 Reverb，也能讓多個來源共用同一空間。

| 如果發現 | 先檢查 | 可能原因 |
|---|---|---|
| 開 Reverb Aux 後 dry 也變大 | wet/dry 是否 100% wet | Aux 又送回一份 dry |
| Solo source，Reverb 消失 | Aux 是否 Solo Safe | Return 被 implicit mute |
| 主 Fader 拉低，效果不減 | Send 是否 PRE | Send 不跟主 level |
| 送了但聽不到 | Send level、bus、Aux input/output | 其中一路斷線或仍在 −INF |

Mono send 也可以接 Mono Aux，再用 mono-in／stereo-out 的 time-domain Plug-In 產生 Stereo return。這是效果產生新的 Stereo 信息，不是單把 Mono 音檔換成兩條一樣聲音就自動變寬。

> [!warning] Mono 路由請使用專用 Mono bus
> 原書提醒，把兩個無關 Mono 訊號塞進同一 Stereo bus 的左右 sub-path，可能影響 Delay Compensation；Stereo path 要保持成對一致。Ch52 的 DSP Mode 自動傳播也有相同的路由考量。

## 外部效果器還有實體回程

External Send 的目的地是 audio interface output，設備 output 則接回 interface input，再由 Aux input 接收。這與 Hardware Insert 的對應 I/O pairing 不同：Send／return 可以自己安排不同 output／input，但要由你明確建立回程、level、Clock 與 latency 的設計。

1. Source main output 保留到主混音。
2. Send output 指向接設備的實體 output。
3. 建 Aux，input 指設備返回的實體 input。
4. Aux output 回 main mix，確認沒有 feedback loop。
5. 設外部設備 wet/dry，避免意外返回多餘 dry；以試聽確認尾韻與延遲。

## Cue Mix：同一首歌，不同聽者有不同平衡

耳機 mix 的核心是 routing 到獨立 output；不是把 main mix volume 整體轉大。可以為不同樂手建立獨立 Send balance，用 Aux／Master Fader 控制各 cue path。原書示例也提供先用 unity、post-fader 與 FMP 複製主混音，再個別調樂手的 Send。

| 需求 | 設計取向 | 取捨 |
|---|---|---|
| 快速跟主混音相同 | Post-fader、unity、FMP | 主混音改動會一起影響 |
| 與 control room 獨立 | Pre-fader balance | 需要另外管理 cue levels |
| 低 latency 錄音監聽 | 避免高 delay Inserts | 音色處理與即時回饋需取捨 |
| 整體 cue volume | Aux 或對應 output 的 Master Fader | 不能誤指 main mix output |

> [!tip] 實務連結
> 錄音時歌手需要自己的 voice 與少量 reverb，不一定需要完整 mastering chain。原書建議 record Track 與 cue Aux／Master 避免不必要 Insert delay；把高 latency mix processing 暫時移出 live monitoring，往往比單純把 H/W Buffer 拉到最小更有效。

![[PT-Ch50-routing.png]]

> [!abstract] Takeaway
> Output bus 的 submix 是主要訊號路，Send／return 是額外平行路。Return 設 100% wet、確認 Solo Safe、cue 使用獨立 output，再檢查 live input 的 latency。把拓樸接對，才有資格談效果量與音色。

## 相關

%% PT-NAV-BEGIN %%

上一篇：[[PT-Ch50b-Sends與混音視窗操作]]

下一篇：[[PT-Ch50d-DelayCompensation與Dither]]

按任務閱讀：[[PT-00-工作流程導航]]

%% PT-NAV-END %%


同章分篇：[[PT-Ch50a-混音Track與訊號流]] · [[PT-Ch50b-Sends與混音視窗操作]] · [[PT-Ch50d-DelayCompensation與Dither]]

跨章延伸：[[PT-Ch51a-PlugInInsert與SideChain]] · [[PT-Ch53a-Automation模式與資料層]]

[[PT-00-索引]] · [[PT-00-快速檢索]] · [[PT-00-功能目錄]] · [[PT-00-Mac快捷鍵]]

標籤： #pro-tools #audio #workflow
