# 手機與桌面設計規格

整理與製作：**許惟傑 Xue_hwcxx** · [GitHub @jaymoda88](https://github.com/jaymoda88)

這是一個要在錄音工作途中快速回查、也要能長時間閱讀的工作台。手機用來找按鍵和接續閱讀；桌面提供分類、正文和篇內導覽的分工。兩者使用相同內容與進度資料。

## 指定設計參考與實際採用

| 參考 | 讀取範圍 | 採用方式 |
|---|---|---|
| [design-master](https://github.com/huangserva/skill-prompt-generator/tree/main/.claude/skills/design-master) | `skill.md`、[modern-minimal principles](https://github.com/huangserva/skill-prompt-generator/blob/main/design-logic/modern-minimal/principles.md)、[constraints](https://github.com/huangserva/skill-prompt-generator/blob/main/design-logic/modern-minimal/constraints.md) | 建立清楚層級、8px 節奏、少量語意色、克制的邊框與圓角。這是設計參考，沒有宣稱執行上游素材資料庫或生成器。 |
| [Awesome-PPT-Design-Skills](https://github.com/software-ai-life/Awesome-PPT-Design-Skills) | [futuristic-tech-editorial-ppt-skill](https://github.com/software-ai-life/Awesome-PPT-Design-Skills/tree/main/futuristic-tech-editorial-ppt-skill) 的 Skill、style-system、QA checklist | 白底、graphite 文字、blue 重點、對齊網格與平面處理。把簡報的層級原則轉成網站布局。 |
| [open-design](https://github.com/nexu-io/open-design) | [Design Systems 說明](https://github.com/nexu-io/open-design/tree/main/design-systems)、[Apple-inspired 繁中規格](https://github.com/nexu-io/open-design/blob/main/design-systems/apple/DESIGN-zh-tw.md) | 用一致的 tokens 管理表面、文字、選取狀態與間距；依閱讀、工具、手機操作調整資訊密度。該套件是 Apple 風格參考，並非官方 HIG。 |

上游內容未整份複製到此 repository；以上連結用來追溯設計依據。

## 視覺決策

| 項目 | 規格 | 理由 |
|---|---|---|
| 工作區背景 | `#F7F9FC` | 與白色正文表面分層，長時間閱讀仍清楚。 |
| 正文表面 | `#FFFFFF` | 讓文章、圖解和按鍵的色彩有穩定背景。 |
| 主要文字 | `#2B2B2B` | 對應 editorial 參考中的 graphite。 |
| 次要文字 | `#596274` | 保留來源、條件等小字的可讀性。 |
| 操作藍 | `#2455C8` | 比簡報參考的 signal blue 深，支援較小的操作文字。 |
| 選取底色 | `#EDF2FF` | 讓分類、目前頁面與按鍵選取共用同一語意。 |
| Dark mode | 深藍灰表面＋`#F0F3F8` 文字＋`#A8C5FF` 重點 | 延續同一層級，按鈕前景色同步調整。 |
| 字體 | 系統 sans-serif，繁中隨平台字體 fallback | 離線可用，避免遠端字體載入造成文字閃動。 |
| 正文字級 | 預設 18px，可調 16–24px，行高 1.7 | 長篇繁中與英文功能名稱混排需要足夠呼吸空間。 |
| 表格與工具文字 | 約 14–16px | 保留桌面的比較效率；手機轉為單列或卡片。 |
| 邊界與圓角 | 細邊框，常用 6–8px 圓角，無大面積裝飾陰影 | 強調操作與內容關係，減少視覺干擾。 |

主要結構是任務入口、工作情境、Mac 按鍵和訊號路徑。章節編號仍用於來源定位；介面不要求使用者先記得檔名。首頁任務卡代表可執行的工作，文章清單維持可掃讀的列狀布局。

## 裝置布局

| 寬度 | 導覽與閱讀 | 快捷鍵與工具 |
|---|---|---|
| 320–359px | 單欄任務卡；底部六個入口；正文滿寬；已讀按鈕獨立一列 | 快捷鍵卡片，保留功能、Mac 按鍵、必要條件、來源四欄資訊。 |
| 360–760px | 任務兩欄；搜尋置頂；底部導覽；側欄可開關；篇內目錄可收合 | 搜尋與情境篩選直式堆疊，虛擬鍵盤可收合，按鍵五欄換行。 |
| 761–1279px | 固定側欄；主內容保留操作密度；篇內目錄可收合 | 多欄比較表與實體鍵盤式布局；不足寬度的表格局部捲動。 |
| ≥1280px | 固定側欄＋正文＋篇內目錄，長文有閱讀行寬限制 | 保留快捷鍵表格與並排比較資訊。 |

主要按鈕、輸入框、按鍵與手機導覽至少有 44px 高的操作區域。輸入文字為 16px，減少手機輸入時自動放大。底部操作區保留 safe-area 空間；頁尾及提示訊息避開底部導覽。正文中的 code、公式和寬表格各自捲動。手機路由圖保留可讀節點尺寸，只在圖解區域左右捲動，並提供滑動提示。

## 操作與可及性

- 側欄開啟時，焦點移至關閉按鈕；背景內容和底部導覽設為 `inert`。
- Tab 在開啟的側欄內循環；Escape 關閉後回到導覽開關。
- 目前入口具有 `aria-current`；收藏、已讀、按鍵篩選具有對應的狀態標記。
- 原有跳到內容、可見焦點、減少動態偏好和原生 `dialog` 行為保留。
- 重要條件以文字呈現，顏色輔助辨識。快捷鍵卡片保留來源連結與複製操作。

## 刻意調整的規範

PPT 的 16:9 畫布、固定投影片尺寸與超大標題不適合長篇網站，所以只採用對齊、色彩和層級原則。繁中正文使用 1.7 行高，優先滿足混排閱讀；手機也不強行保留桌面的 12 欄網格。快捷鍵在桌面用表格比較，在手機保留完整欄位並重排為卡片。

## 驗證狀態

程式驗證涵蓋兩種裝置分支、每一篇閱讀路由、快捷鍵資料完整性、收藏／已讀／字級／主題儲存，以及手機側欄關閉與 Escape 焦點。這些是 DOM fixture 測試，不能證明實際渲染結果。

尚待以真實瀏覽器驗收 320px、390px、768px、1280px、1440px 的首頁、長文、快捷鍵與工具頁，並檢查 iOS safe-area、觸控捲動、200% zoom、Dark mode 及讀屏表格行為。完整記錄見 [VERIFICATION.md](VERIFICATION.md)。
