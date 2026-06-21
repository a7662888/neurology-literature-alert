const CURRENT_DAYS = 14;

const state = {
  data: null,
  periods: [],
  activePeriodId: "current",
  selectedIssueId: null,
  topic: "all",
  search: "",
};

const topicLabels = {
  alzheimer: "阿茲海默症",
  biomarker: "生物標記",
  dementia: "失智症",
  stroke: "腦中風",
  parkinson: "巴金森氏症",
  neuroscience: "神經科學",
  prevention: "預防醫學",
};

const els = Object.fromEntries([
  "current-period", "update-cadence", "last-updated", "metric-days", "metric-articles",
  "metric-topics", "metric-verified", "period-kicker", "period-title", "period-summary",
  "return-current", "day-rail", "search-input", "topic-filters", "reset-filters",
  "issue-date", "issue-title", "issue-count", "article-list", "feature-list", "archive-list",
].map((id) => [id.replaceAll("-", "_"), document.querySelector(`#${id}`)]));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function parseDate(value) {
  return new Date(`${value}T00:00:00+08:00`);
}

function formatDate(value, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("zh-TW", options).format(parseDate(value));
}

function dateRangeLabel(issues) {
  if (!issues.length) return "尚無資料";
  const dates = issues.map((issue) => issue.date).sort();
  return `${formatDate(dates[0], { year: "numeric", month: "short", day: "numeric" })} – ${formatDate(dates.at(-1), { month: "short", day: "numeric" })}`;
}

function buildPeriods(issues) {
  const sorted = [...issues].sort((a, b) => b.date.localeCompare(a.date));
  if (!sorted.length) return [];
  const currentEnd = parseDate(sorted[0].date);
  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentStart.getDate() - (CURRENT_DAYS - 1));
  const current = sorted.filter((issue) => parseDate(issue.date) >= currentStart);
  const older = sorted.filter((issue) => parseDate(issue.date) < currentStart);
  const periods = [{ id: "current", type: "current", issues: current }];

  while (older.length) {
    const periodEnd = parseDate(older[0].date);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - (CURRENT_DAYS - 1));
    const grouped = older.filter((issue) => parseDate(issue.date) >= periodStart && parseDate(issue.date) <= periodEnd);
    periods.push({ id: `archive-${older[0].date}`, type: "archive", issues: grouped });
    older.splice(0, grouped.length);
  }
  return periods;
}

function activePeriod() {
  return state.periods.find((period) => period.id === state.activePeriodId) ?? state.periods[0];
}

function currentIssue() {
  const period = activePeriod();
  return period.issues.find((issue) => issue.id === state.selectedIssueId) ?? period.issues[0];
}

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("zh-Hant");
}

function articleMatches(article) {
  const haystack = normalize([
    article.topic, article.titleZh, article.citation, article.pmid, article.doi,
    article.summaryZh, article.clinicalMeaning, article.researchMeaning,
  ].join(" "));
  return (state.topic === "all" || article.topic === state.topic)
    && (!state.search || haystack.includes(normalize(state.search)));
}

function renderMetrics() {
  const current = state.periods[0]?.issues ?? [];
  const articles = current.flatMap((issue) => issue.articles);
  const topics = new Set(articles.map((article) => article.topic));
  const verified = articles.filter((article) => article.pmid && article.doi && article.doi !== "尚待確認");
  els.current_period.textContent = dateRangeLabel(current);
  els.update_cadence.textContent = state.data.site.updateCadence || "每日更新";
  els.last_updated.textContent = `資料更新 ${state.data.site.updatedAt}`;
  els.metric_days.textContent = current.length;
  els.metric_articles.textContent = articles.length;
  els.metric_topics.textContent = topics.size;
  els.metric_verified.textContent = verified.length;
}

function renderPeriodHeader() {
  const period = activePeriod();
  const isCurrent = period.type === "current";
  els.period_kicker.textContent = isCurrent ? "Current · 14 day briefing" : "Archived · biweekly issue";
  els.period_title.textContent = isCurrent ? "最近兩週文獻" : dateRangeLabel(period.issues);
  els.period_summary.textContent = `${period.issues.length} 個每日速報，共 ${period.issues.flatMap((issue) => issue.articles).length} 篇經識別碼驗證的文獻。`;
  els.return_current.classList.toggle("is-hidden", isCurrent);
}

function renderDayRail() {
  const issues = activePeriod().issues;
  els.day_rail.innerHTML = issues.map((issue) => {
    const active = issue.id === state.selectedIssueId;
    const weekday = formatDate(issue.date, { weekday: "short" });
    return `<button type="button" class="day-tab" data-issue="${escapeHtml(issue.id)}" aria-pressed="${active}">
      <span>${escapeHtml(weekday)}</span><strong>${escapeHtml(formatDate(issue.date))}</strong><small>${issue.articles.length} 篇</small>
    </button>`;
  }).join("");
}

function renderTopicFilters() {
  const topics = [...new Set(activePeriod().issues.flatMap((issue) => issue.articles.map((article) => article.topic)))].sort();
  els.topic_filters.innerHTML = ["all", ...topics].map((topic) => `
    <button class="chip" type="button" data-topic="${escapeHtml(topic)}" aria-pressed="${state.topic === topic}">
      ${escapeHtml(topic === "all" ? "全部" : (topicLabels[topic] || topic))}
    </button>`).join("");
}

function renderArticles() {
  const issue = currentIssue();
  if (!issue) return;
  const articles = issue.articles.filter(articleMatches);
  els.issue_date.textContent = formatDate(issue.date, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  els.issue_title.textContent = "每日文獻速報";
  els.issue_count.textContent = `${articles.length} 篇`;

  if (!articles.length) {
    els.article_list.innerHTML = '<div class="empty-state">沒有符合目前篩選條件的文獻。</div>';
    return;
  }

  els.article_list.innerHTML = articles.map((article, index) => {
    const label = topicLabels[article.topic] || article.topic;
    const journal = article.citation?.split(". ").at(-2) || "Journal";
    return `<article class="article-card" data-pmid="${escapeHtml(article.pmid)}">
      <div class="article-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="article-content">
        <div class="article-topline"><span class="tag">${escapeHtml(label)}</span><span class="journal-label">${escapeHtml(journal)}</span></div>
        <h4>${escapeHtml(article.titleZh)}</h4>
        <p class="article-deck">${escapeHtml(article.summaryZh)}</p>
        <details>
          <summary>展開臨床與研究解讀</summary>
          <div class="detail-body">
            <div class="meaning-grid">
              <div><strong>臨床意義</strong><p>${escapeHtml(article.clinicalMeaning)}</p></div>
              <div><strong>研究意義</strong><p>${escapeHtml(article.researchMeaning)}</p></div>
            </div>
            <p class="citation">${escapeHtml(article.citation)}</p>
          </div>
        </details>
        <div class="article-links">
          <a href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noreferrer">PubMed · ${escapeHtml(article.pmid)}</a>
          <a href="https://doi.org/${escapeHtml(article.doi)}" target="_blank" rel="noreferrer">DOI ↗</a>
        </div>
      </div>
    </article>`;
  }).join("");
}

function renderFeatures() {
  const features = state.data.features ?? [];
  if (!features.length) {
    els.feature_list.innerHTML = `<div class="feature-empty"><span>F</span><div><h3>下一個深度專題，從一個問題開始</h3><p>例如「AD 新藥 ATT：2026 年文獻進展」。專題僅在作者指定後建立，跨期整合證據，不由每日排程自動生成。</p></div></div>`;
    return;
  }
  els.feature_list.innerHTML = features.map((feature) => `<article class="feature-card">
    <p class="eyebrow">${escapeHtml(feature.kicker || "Feature")}</p><h3>${escapeHtml(feature.title)}</h3>
    <p>${escapeHtml(feature.summary)}</p>
    <div class="feature-meta"><span>${escapeHtml(feature.publishedAt || "籌備中")}</span>
    <a href="./feature.html?id=${encodeURIComponent(feature.id)}">閱讀完整專題 <span aria-hidden="true">→</span></a></div>
  </article>`).join("");
}

function renderArchive() {
  const archived = state.periods.filter((period) => period.type === "archive");
  if (!archived.length) {
    els.archive_list.innerHTML = '<div class="empty-state">資料累積滿 14 天後，雙週期別會自動出現在這裡。</div>';
    return;
  }
  els.archive_list.innerHTML = archived.map((period, index) => {
    const articles = period.issues.flatMap((issue) => issue.articles);
    return `<article class="archive-card">
      <span class="archive-number">${String(index + 1).padStart(2, "0")}</span>
      <div><p class="eyebrow">Biweekly issue</p><h3>${escapeHtml(dateRangeLabel(period.issues))}</h3>
      <p>${period.issues.length} 日 · ${articles.length} 篇文獻</p></div>
      <button class="button ghost" type="button" data-period="${escapeHtml(period.id)}">開啟期別</button>
    </article>`;
  }).join("");
}

function renderReader() {
  renderPeriodHeader();
  renderDayRail();
  renderTopicFilters();
  renderArticles();
}

function selectPeriod(periodId) {
  state.activePeriodId = periodId;
  state.selectedIssueId = activePeriod().issues[0]?.id;
  state.topic = "all";
  state.search = "";
  els.search_input.value = "";
  renderReader();
}

function bindEvents() {
  els.day_rail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-issue]");
    if (!button) return;
    state.selectedIssueId = button.dataset.issue;
    renderDayRail();
    renderArticles();
  });
  els.search_input.addEventListener("input", (event) => { state.search = event.target.value; renderArticles(); });
  els.topic_filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    state.topic = button.dataset.topic;
    renderTopicFilters();
    renderArticles();
  });
  els.reset_filters.addEventListener("click", () => {
    state.topic = "all"; state.search = ""; els.search_input.value = ""; renderTopicFilters(); renderArticles();
  });
  els.archive_list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-period]");
    if (!button) return;
    selectPeriod(button.dataset.period);
    document.querySelector("#current").scrollIntoView({ behavior: "smooth" });
  });
  els.return_current.addEventListener("click", () => selectPeriod("current"));
}

async function init() {
  try {
    const response = await fetch("./data/alerts.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
  } catch (error) {
    if (!window.NEURO_ALERTS_DATA) throw error;
    state.data = window.NEURO_ALERTS_DATA;
  }
  state.periods = buildPeriods(state.data.issues ?? []);
  state.selectedIssueId = state.periods[0]?.issues[0]?.id;
  renderMetrics();
  renderReader();
  renderFeatures();
  renderArchive();
  bindEvents();
}

init().catch((error) => {
  els.article_list.innerHTML = `<div class="empty-state">資料載入失敗：${escapeHtml(error.message)}</div>`;
});
