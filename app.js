const state = {
  data: null,
  selectedIssueId: null,
  topic: "all",
  search: "",
};

const els = {
  cadence: document.querySelector("#update-cadence"),
  lastUpdated: document.querySelector("#last-updated"),
  metricIssues: document.querySelector("#metric-issues"),
  metricArticles: document.querySelector("#metric-articles"),
  metricVerified: document.querySelector("#metric-verified"),
  metricCurrent: document.querySelector("#metric-current"),
  issueSelect: document.querySelector("#issue-select"),
  searchInput: document.querySelector("#search-input"),
  topicFilters: document.querySelector("#topic-filters"),
  resetFilters: document.querySelector("#reset-filters"),
  issueTitle: document.querySelector("#issue-title"),
  issueSummary: document.querySelector("#issue-summary"),
  articleList: document.querySelector("#article-list"),
  archiveList: document.querySelector("#archive-list"),
  searchLog: document.querySelector("#search-log"),
  zoteroStatus: document.querySelector("#zotero-status"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function getCurrentIssue() {
  return state.data.issues.find((issue) => issue.id === state.selectedIssueId) ?? state.data.issues[0];
}

function articleMatches(article) {
  const haystack = normalize([
    article.topic,
    article.titleZh,
    article.citation,
    article.pmid,
    article.doi,
    article.summaryZh,
    article.trackingQuestion,
  ].join(" "));
  const matchesTopic = state.topic === "all" || article.topic === state.topic;
  const matchesSearch = !state.search || haystack.includes(normalize(state.search));
  return matchesTopic && matchesSearch;
}

function renderMetrics() {
  const issues = state.data.issues;
  const articles = issues.flatMap((issue) => issue.articles);
  const verified = articles.filter((article) => article.pmid || (article.doi && article.doi !== "尚待確認"));
  els.cadence.textContent = state.data.site.updateCadence;
  els.lastUpdated.textContent = `最近更新：${state.data.site.updatedAt}`;
  els.metricIssues.textContent = issues.length;
  els.metricArticles.textContent = articles.length;
  els.metricVerified.textContent = verified.length;
  els.metricCurrent.textContent = issues[0]?.date ?? "--";
}

function renderIssueSelect() {
  els.issueSelect.innerHTML = state.data.issues
    .map((issue) => `<option value="${escapeHtml(issue.id)}">${escapeHtml(issue.date)}｜${escapeHtml(issue.status)}</option>`)
    .join("");
  els.issueSelect.value = state.selectedIssueId;
}

function renderTopicFilters() {
  const topics = [...new Set(getCurrentIssue().articles.map((article) => article.topic))].sort();
  const buttons = ["all", ...topics].map((topic) => {
    const label = topic === "all" ? "全部" : topic;
    return `<button class="chip" type="button" data-topic="${escapeHtml(topic)}" aria-pressed="${state.topic === topic}">${escapeHtml(label)}</button>`;
  });
  els.topicFilters.innerHTML = buttons.join("");
}

function renderArticles() {
  const issue = getCurrentIssue();
  const articles = issue.articles.filter(articleMatches);
  els.issueTitle.textContent = issue.title;
  els.issueSummary.textContent = issue.summary;

  if (!articles.length) {
    els.articleList.innerHTML = '<div class="empty-state">沒有符合目前篩選條件的文獻。</div>';
    return;
  }

  els.articleList.innerHTML = articles.map((article) => {
    const doi = article.doi && article.doi !== "尚待確認"
      ? `<a href="https://doi.org/${escapeHtml(article.doi)}" target="_blank" rel="noreferrer">DOI ${escapeHtml(article.doi)}</a>`
      : `<span>DOI 尚待確認</span>`;
    const journal = article.journalUrl
      ? `<a href="${escapeHtml(article.journalUrl)}" target="_blank" rel="noreferrer">Journal</a>`
      : "";

    return `
      <article class="article-card">
        <div class="article-topline">
          <span class="tag">${escapeHtml(article.topic)}</span>
          <span class="tag priority-${escapeHtml(article.priority)}">${escapeHtml(article.priority)}</span>
        </div>
        <h3>${escapeHtml(article.titleZh)}</h3>
        <p>${escapeHtml(article.summaryZh)}</p>
        <div class="citation">${escapeHtml(article.citation)}</div>
        <div class="article-links">
          <a href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noreferrer">PMID ${escapeHtml(article.pmid)}</a>
          ${doi}
          ${journal}
        </div>
        <div class="meaning-grid">
          <div class="meaning-box">
            <strong>臨床意義</strong>
            <span>${escapeHtml(article.clinicalMeaning)}</span>
          </div>
          <div class="meaning-box">
            <strong>研究意義</strong>
            <span>${escapeHtml(article.researchMeaning)}</span>
          </div>
        </div>
        <p><strong>可追蹤題目：</strong>${escapeHtml(article.trackingQuestion)}</p>
        <div class="path">${escapeHtml(article.obsidianPath)}</div>
      </article>
    `;
  }).join("");
}

function renderArchive() {
  els.archiveList.innerHTML = state.data.issues.map((issue) => `
    <article class="archive-card">
      <p class="eyebrow">${escapeHtml(issue.status)}</p>
      <h3>${escapeHtml(issue.date)}</h3>
      <p>${escapeHtml(issue.summary)}</p>
      <button class="button secondary" type="button" data-issue="${escapeHtml(issue.id)}">開啟此期</button>
    </article>
  `).join("");
}

function renderMethod() {
  const issue = getCurrentIssue();
  els.searchLog.innerHTML = issue.searchLog.map((entry) => `
    <div class="log-item">
      <p><strong>${escapeHtml(entry.source)}</strong></p>
      <p><code>${escapeHtml(entry.query)}</code></p>
      <p>執行日期：${escapeHtml(entry.executedAt)}</p>
      <p>命中筆數：${escapeHtml(entry.hits)}</p>
      <p>篩選理由：${escapeHtml(entry.screening)}</p>
    </div>
  `).join("");

  const zotero = issue.zotero;
  els.zoteroStatus.innerHTML = `
    <p><strong>匯入篇數：</strong>${escapeHtml(zotero.imported)}</p>
    <p><strong>略過重複：</strong>${escapeHtml(zotero.duplicatesSkipped)}</p>
    <p><strong>分類路徑：</strong>${escapeHtml(zotero.collections)}</p>
    <p><strong>Item keys 驗證：</strong>${zotero.itemKeysVerified ? "已驗證" : "未驗證"}</p>
    <p><strong>SQLite fallback：</strong>${escapeHtml(zotero.sqliteFallback)}</p>
    <p>${escapeHtml(zotero.note)}</p>
  `;
}

function renderAll() {
  renderMetrics();
  renderIssueSelect();
  renderTopicFilters();
  renderArticles();
  renderArchive();
  renderMethod();
}

async function init() {
  try {
    const response = await fetch("./data/alerts.json", { cache: "no-store" });
    state.data = await response.json();
  } catch (error) {
    if (!window.NEURO_ALERTS_DATA) throw error;
    state.data = window.NEURO_ALERTS_DATA;
  }
  state.selectedIssueId = state.data.issues[0]?.id;
  renderAll();

  els.issueSelect.addEventListener("change", (event) => {
    state.selectedIssueId = event.target.value;
    state.topic = "all";
    renderAll();
  });

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderArticles();
  });

  els.topicFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    state.topic = button.dataset.topic;
    renderTopicFilters();
    renderArticles();
  });

  els.archiveList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-issue]");
    if (!button) return;
    state.selectedIssueId = button.dataset.issue;
    state.topic = "all";
    state.search = "";
    els.searchInput.value = "";
    renderAll();
    document.querySelector("#current").scrollIntoView({ behavior: "smooth" });
  });

  els.resetFilters.addEventListener("click", () => {
    state.topic = "all";
    state.search = "";
    els.searchInput.value = "";
    renderTopicFilters();
    renderArticles();
  });
}

init().catch((error) => {
  els.articleList.innerHTML = `<div class="empty-state">資料載入失敗：${escapeHtml(error.message)}</div>`;
});
