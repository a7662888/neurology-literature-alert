const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[char]));

const params = new URLSearchParams(window.location.search);
const featureId = params.get("id");
const data = window.NEURO_ALERTS_DATA ?? {};
const feature = (data.features ?? []).find((item) => item.id === featureId);
const hero = document.querySelector("#feature-hero");
const content = document.querySelector("#feature-content");

function sourceLinks(article) {
  const links = [];
  if (article.pmid) {
    links.push('<a href="https://pubmed.ncbi.nlm.nih.gov/' + escapeHtml(article.pmid) + '/" target="_blank" rel="noreferrer">PMID ' + escapeHtml(article.pmid) + "</a>");
  }
  if (article.doi) {
    links.push('<a href="https://doi.org/' + escapeHtml(article.doi) + '" target="_blank" rel="noreferrer">DOI</a>');
  }
  return links.join("");
}

function renderHighlights(items = []) {
  if (!items.length) return "";
  const cards = items.map((item) => [
    '<article class="feature-highlight">',
    "<strong>", escapeHtml(item.value), "</strong>",
    "<span>", escapeHtml(item.label), "</span>",
    "<p>", escapeHtml(item.note), "</p>",
    "</article>"
  ].join("")).join("");
  return '<section class="feature-highlights" aria-label="專題關鍵數字">' + cards + "</section>";
}

function renderTakeaways(items = []) {
  if (!items.length) return "";
  const cards = items.map((item) => [
    '<article class="takeaway-card">',
    '<p class="eyebrow">', escapeHtml(item.label), "</p>",
    "<h3>", escapeHtml(item.title), "</h3>",
    "<p>", escapeHtml(item.body), "</p>",
    "</article>"
  ].join("")).join("");
  return [
    '<section class="feature-takeaways" aria-labelledby="takeaways-title">',
    '<div class="section-heading"><p class="eyebrow">Clinical reading map</p>',
    '<h2 id="takeaways-title">先讀這四句</h2></div>',
    '<div class="takeaway-grid">', cards, "</div>",
    "</section>"
  ].join("");
}

function renderFilters(articles = []) {
  const themes = [...new Set(articles.map((article) => article.theme).filter(Boolean))];
  const choices = [["all", "全部"], ["new", "本次新增"], ...themes.map((theme) => [theme, theme])];
  const buttons = choices.map(([value, label], index) => [
    '<button type="button" class="feature-filter', index === 0 ? " is-active" : "",
    '" data-filter="', escapeHtml(value), '" aria-pressed="', index === 0 ? "true" : "false", '">',
    escapeHtml(label), "</button>"
  ].join("")).join("");
  return [
    '<div class="feature-toolbox" role="search" aria-label="文獻篩選">',
    '<div class="feature-filter-row" role="group" aria-label="依主題篩選">', buttons, "</div>",
    '<label class="feature-search"><span>搜尋證據卡</span>',
    '<input id="feature-search-input" type="search" placeholder="藥名、PMID、ARIA、PET…" autocomplete="off" /></label>',
    '<p id="feature-filter-status" class="feature-filter-status"></p>',
    "</div>"
  ].join("");
}

function renderArticle(article, index) {
  const id = "paper-" + (index + 1);
  const sourceLabel = article.sourceBatch === "2026-08-06" ? "2026-08-06 新增" : "既有策展";
  const detailOpen = article.featured ? " open" : "";
  const searchText = [
    article.titleZh, article.title, article.summaryZh, article.theme, article.pmid, article.doi
  ].filter(Boolean).join(" ").toLowerCase();
  const badges = [
    article.theme ? '<span class="theme-badge">' + escapeHtml(article.theme) + "</span>" : "",
    "<span>" + escapeHtml(article.evidenceLevel) + "</span>",
    "<span>" + escapeHtml(article.articleType) + "</span>",
    "<span>" + escapeHtml(article.pages) + "</span>",
    article.verificationStatus ? '<span class="verification-badge">' + escapeHtml(article.verificationStatus) + "</span>" : "",
    '<span class="source-badge">' + escapeHtml(sourceLabel) + "</span>"
  ].join("");
  const findings = (article.keyFindings ?? []).map((finding) => "<p>" + escapeHtml(finding) + "</p>").join("");
  return [
    '<article class="feature-article" data-theme="', escapeHtml(article.theme || ""),
    '" data-source="', escapeHtml(article.sourceBatch || ""),
    '" data-search="', escapeHtml(searchText), '" aria-labelledby="', id, '">',
    '<div class="feature-article-index">', String(index + 1).padStart(2, "0"), "</div><div>",
    '<div class="feature-badges">', badges, "</div>",
    '<h2 id="', id, '">', escapeHtml(article.titleZh), "</h2>",
    '<p class="original-title">', escapeHtml(article.title), "</p>",
    '<p class="feature-summary">', escapeHtml(article.summaryZh), "</p>",
    '<details class="feature-detail"', detailOpen, '><summary>重點、臨床意義與限制</summary>',
    '<div class="feature-findings">', findings, "</div>",
    '<div class="feature-meaning"><div><strong>臨床／研究意義</strong><p>', escapeHtml(article.clinicalMeaning),
    "</p></div><div><strong>閱讀限制</strong><p>", escapeHtml(article.limitations), "</p></div></div></details>",
    '<p class="citation">', escapeHtml(article.citation), '</p><div class="article-links">',
    sourceLinks(article), "</div></div></article>"
  ].join("");
}

function bindFilters() {
  const buttons = [...document.querySelectorAll(".feature-filter")];
  const input = document.querySelector("#feature-search-input");
  const cards = [...document.querySelectorAll(".feature-article")];
  const status = document.querySelector("#feature-filter-status");
  let activeFilter = "all";

  const apply = () => {
    const query = (input?.value || "").trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesFilter = activeFilter === "all"
        || (activeFilter === "new" && card.dataset.source === "2026-08-06")
        || card.dataset.theme === activeFilter;
      const matchesQuery = !query || card.dataset.search.includes(query);
      card.hidden = !(matchesFilter && matchesQuery);
      if (!card.hidden) visible += 1;
    });
    if (status) status.textContent = "顯示 " + visible + "／" + cards.length + " 篇";
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      apply();
    });
  });
  input?.addEventListener("input", apply);
  apply();
}

if (!feature) {
  document.title = "找不到專題｜神經前線";
  hero.innerHTML = '<p class="eyebrow">Curated feature</p><h1>找不到這個專題</h1>';
  content.innerHTML = '<div class="empty-state">專題可能尚未發布，或網址不完整。<br><a href="./#features">返回專題策展</a></div>';
} else {
  document.title = feature.title + "｜神經前線";
  hero.innerHTML = [
    '<p class="eyebrow">', escapeHtml(feature.kicker || "Curated feature"), "</p>",
    "<h1>", escapeHtml(feature.title), "</h1>",
    '<p class="feature-lead">', escapeHtml(feature.subtitle || feature.summary), "</p>",
    '<div class="feature-byline"><span>策展與全文解讀</span><strong>陳培豪</strong><span>',
    escapeHtml(feature.publishedAt), " 發布・", escapeHtml(feature.updatedAt), " 更新</span></div>"
  ].join("");

  const overview = (feature.sections ?? []).map((section) => [
    '<section class="feature-overview"><p class="eyebrow">',
    escapeHtml(section.kicker || "Synthesis"), "</p><h2>", escapeHtml(section.title),
    "</h2><p>", escapeHtml(section.body), "</p></section>"
  ].join("")).join("");
  const articles = (feature.articles ?? []).map(renderArticle).join("");

  content.innerHTML = [
    renderHighlights(feature.highlights),
    '<aside class="evidence-note"><strong>證據邊界</strong><p>',
    escapeHtml(feature.evidenceNote), "</p></aside>",
    renderTakeaways(feature.takeaways),
    '<div class="feature-overviews">', overview, "</div>",
    '<section class="feature-papers" aria-labelledby="papers-title">',
    '<p class="eyebrow">Cross-period evidence cards</p>',
    '<h2 id="papers-title">', feature.articles.length, " 篇跨期證據卡</h2>",
    renderFilters(feature.articles),
    '<div class="feature-article-list">', articles, "</div></section>"
  ].join("");
  bindFilters();
}
