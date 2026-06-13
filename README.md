# 近兩天神經科文獻速報 GitHub Pages

這是可直接部署到 GitHub Pages 的靜態網頁版本。

## 更新方式

1. 編輯 `data/alerts.json`。
2. 將最新期別加到 `issues` 陣列最前面。
3. 更新 `data/alerts.js`，格式為 `window.NEURO_ALERTS_DATA = <alerts.json 內容>;`，讓 `file://` 本機預覽也能載入資料。
4. 舊期不要刪除，頁面會自動出現在封存區。
5. 每篇文獻至少保留 `pmid` 或 `doi`，不確定欄位填入 `尚待確認`。

## 雲端自動發布

GitHub Actions 會在每日台北時間 `07:30` 執行，並於 `08:15`、`09:15`、`12:05` 冪等補漏。
排程在 GitHub 雲端執行，因此本機關機時仍會搜尋、摘要、建立雲端知識筆記並更新網站。

- 奇數日期：標記發布者為 `antigravity`
- 偶數日期：標記發布者為 `codex`
- 搜尋與驗證：PubMed E-utilities
- 去重：既有網站歷史中的 PMID、DOI、正規化標題
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
