# 近兩天神經科文獻速報 GitHub Pages

這是可直接部署到 GitHub Pages 的靜態網頁版本。

## 更新方式

1. 編輯 `data/alerts.json`。
2. 將最新期別加到 `issues` 陣列最前面。
3. 更新 `data/alerts.js`，格式為 `window.NEURO_ALERTS_DATA = <alerts.json 內容>;`，讓 `file://` 本機預覽也能載入資料。
4. 舊期不要刪除，頁面會自動出現在封存區。
5. 每篇文獻至少保留 `pmid` 或 `doi`，不確定欄位填入 `尚待確認`。

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
