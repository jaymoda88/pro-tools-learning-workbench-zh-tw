# Mac 快捷鍵的版本證據

這個工作台原有 135 筆快捷鍵仍以 **Pro Tools 2023.3** 為基準。v1.3 另加入 **2026.4 已核對子集**，讓練習頁可以選擇版本，不把新手冊整份套用成「全部已更新」。

## 本次核對

| 項目 | 範圍 |
|---|---|
| 官方來源 | [Pro Tools Shortcuts Guide 2026.4](https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2026.4.pdf) |
| 核對日 | 2026-11-01 |
| 方法 | 閱讀 Action、Mac 欄及必要條件，使用保留欄位的文字擷取定位；不由 Windows 欄換算。 |
| 已核對 | 35 筆：Session／檔案 6、播放錄音 11、Edit Mode／Tool 6、選取／定位 7、Clip／Fade 3、Zoom 2。 |
| 尚未核對 | 原有 135 筆中的其餘 100 筆；不表示它們已變更，也不表示它們在新版必定相同。 |
| 實機 | 未進行逐鍵 Pro Tools 實機操作。 |

每筆結構化資料位於 `content/shortcut-evidence.json`，包含穩定 K 編號、實際按鍵、條件、短證據、印刷頁與 PDF 頁序、官方來源連結。

## 頁碼與閱讀注意

本次核對的 2026.4 頁段，**PDF 頁序 = 印刷頁碼 + 6**；2023.3 原索引則是加 5。2026.4 手冊共 92 頁，不能沿用舊版頁碼或以「同一功能沒有改名」推定按鍵已驗證。

| PDF 頁 | 印刷頁 | 已讀內容 |
|---:|---:|---|
| 27 | 21 | Playback、Loop Playback、Dynamic Transport |
| 28 | 22 | Recording、Loop Record、QuickPunch 與不可復原的丟棄 Take |
| 29 | 23 | Pre／Post-Roll；亦閱讀 Numeric Keypad Transport 的模式說明，但該區沒有納入本次 35 題。 |
| 31 | 25 | Edit Modes、主鍵盤數字與 F-key |
| 32 | 26 | Smart Tool、Cycle Tools、Tab to Transients 與 Clip-boundary 條件 |
| 33 | 27 | Session 起訖定位 |
| 39 | 33 | Horizontal Zoom 與維持垂直顯示的 Session Zoom |
| 46 | 40 | Create Fades 與不同 Crossfade 命令 |
| 52 | 46 | File menu 的 Session、Import Audio／Session Data、Bounce Mix |
| 54 | 48 | Separate Clip、Consolidate Clip |

## 題目如何使用證據

練習頁的 2026.4 模式只取 `status: verified` 且有對應既有 K 編號的子集。`macKey` 保留與原 135 筆相同的記號，以便回查；若官方另列替代鍵，本次不一定把所有替代方式都加入題目，但會在 note 說明。

`⌘.` 的 Stop and Discard Take 在 2026.4 仍明示 **not undoable**，因此資料另標 `hazard: not-undoable`。`Tab` 與 `⌥Tab` 必須連同 Tab to Transients 的開／關狀態一起學；單記按鍵會混淆瞬態與 Clip boundary 的定位。

原文 File menu 的 Import MIDI 字元在擷取中出現 l／I 可讀性疑義，沒有把這一列列為本次已核對題目。現有 K010 的 2023.3 資料不因此被改寫。

自訂鍵位、Keyboard Focus、鍵盤 layout、F-key／Fn 與 macOS 快捷鍵衝突，仍需在實際使用環境確認。`verified` 代表這次讀到的手冊證據相符，不是作業系統或 DAW 行為保證。
