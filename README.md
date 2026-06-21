# 神經前沿｜每日文獻雷達

陳培豪（馬偕紀念醫院失智防治中心、神經科）維護的神經學與神經科學每日文獻摘要。

## 閱讀架構

- `Current`：以最新 issue 日期為基準，呈現最近 14 天的每日文獻速報。
- `Archived`：超過 Current 範圍的每日 issue，每 14 天自動組成一個封存期別。
- `專題策展`：讀取 `alerts.json` 頂層的 `features`；只有作者明確指定時才新增，不由每日排程自動生成。
- 搜尋記錄、Zotero 狀態與 Obsidian 路徑仍保留在資料層供稽核，但不顯示給一般讀者。

專題資料格式：

```json
{
  "id": "ad-att-2026",
  "kicker": "Alzheimer disease treatment",
  "title": "AD 新藥 ATT：2026 年文獻進展",
  "summary": "作者審定的專題摘要。",
  "publishedAt": "2026-07-01",
  "articlePmids": ["12345678"]
}
```

點閱統計目前不啟用。GitHub Pages 沒有可驗證的全站計數後端，因此前端不顯示本機假數字。

## 更新方式

1. 編輯 `data/alerts.json`。
2. 將最新期別加到 `issues` 陣列最前面。
3. 更新 `data/alerts.js`，格式為 `window.NEURO_ALERTS_DATA = <alerts.json 內容>;`，讓 `file://` 本機預覽也能載入資料。
4. 舊期不要刪除，頁面會自動出現在封存區。
5. 每篇文獻至少保留 `pmid` 或 `doi`，不確定欄位填入 `尚待確認`。

## 雲端自動發布

GitHub Actions 會在每日台北時間 `07:15` 預先喚醒 runner，等待至 `07:30` 發布；另於
`07:30`、`07:35`、`07:50`、`08:05`、`08:20`、`09:15`、`12:05` 冪等補漏。
排程在 GitHub 雲端執行，因此本機關機時仍會搜尋、摘要、建立雲端知識筆記並更新網站。

- 奇數日期：標記發布者為 `antigravity`
- 偶數日期：標記發布者為 `codex`
- 搜尋與驗證：PubMed E-utilities
- 去重：既有網站歷史中的 PMID、DOI、正規化標題
- 選文優先序：高影響力期刊 → 經維護的 IF>2 優先期刊清單 → 其他合格文獻
- 遞補範圍：最近 7 天尚未發布且通過識別碼驗證的候選文獻
- 摘要：GitHub Models，使用 workflow 內建 `GITHUB_TOKEN`，不需要另設 API key
- AI 摘要失敗時整個 workflow 失敗，不發布模板或半成品
- 雲端知識筆記：`knowledge-notes/YYYY/YYYY-MM-DD/<PMID>.md`
- 雲端更新網站；本機開機後由 Windows `12:30` 工作把雲端筆記同步進 Obsidian Vault
- Zotero 仍需本機與 Zotero Web API 可用時另外同步

`antigravity` 與 `codex` 是奇偶日責任標籤與提示詞規約。電腦關機時並非啟動桌面版 Agent，而是由 GitHub Actions 與 GitHub Models 執行同一套已驗證流程。

## GitHub Pages 設定

- 專用 repo：`https://github.com/a7662888/neurology-literature-alert`
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/`
- Public URL: `https://a7662888.github.io/neurology-literature-alert/`

## 本機預覽

```powershell
cd D:\secondbrain\docs
python -m http.server 8088
```

開啟 `http://127.0.0.1:8088/literature-alert/`。
