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
  if (article.pmid) links.push(`<a href="https://pubmed.ncbi.nlm.nih.gov/${escapeHtml(article.pmid)}/" target="_blank" rel="noreferrer">PMID ${escapeHtml(article.pmid)}</a>`);
  if (article.doi) links.push(`<a href="https://doi.org/${escapeHtml(article.doi)}" target="_blank" rel="noreferrer">DOI</a>`);
  return links.join("");
}

if (!feature) {
  document.title = "找不到專題｜神經前線";
  hero.innerHTML = `<p class="eyebrow">Curated feature</p><h1>找不到這個專題</h1>`;
  content.innerHTML = `<div class="empty-state">專題可能尚未發布，或網址不完整。<br><a href="./#features">返回專題策展</a></div>`;
} else {
  document.title = `${feature.title}｜神經前線`;
  hero.innerHTML = `<p class="eyebrow">${escapeHtml(feature.kicker || "Curated feature")}</p>
    <h1>${escapeHtml(feature.title)}</h1><p class="feature-lead">${escapeHtml(feature.subtitle || feature.summary)}</p>
    <div class="feature-byline"><span>策展與全文解讀</span><strong>陳培豪</strong><span>${escapeHtml(feature.publishedAt)} 發布・${escapeHtml(feature.updatedAt)} 更新</span></div>`;

  const overview = (feature.sections ?? []).map((section) => `<section class="feature-overview"><p class="eyebrow">${escapeHtml(section.kicker || "Synthesis")}</p><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`).join("");
  const articles = (feature.articles ?? []).map((article, index) => `<article class="feature-article">
    <div class="feature-article-index">${String(index + 1).padStart(2, "0")}</div>
    <div>
      <div class="feature-badges"><span>${escapeHtml(article.evidenceLevel)}</span><span>${escapeHtml(article.articleType)}</span><span>${escapeHtml(article.pages)}</span></div>
      <h2>${escapeHtml(article.titleZh)}</h2><p class="original-title">${escapeHtml(article.title)}</p>
      <p class="feature-summary">${escapeHtml(article.summaryZh)}</p>
      <div class="feature-findings">${(article.keyFindings ?? []).map((finding) => `<p>${escapeHtml(finding)}</p>`).join("")}</div>
      <div class="feature-meaning"><div><strong>臨床／研究意義</strong><p>${escapeHtml(article.clinicalMeaning)}</p></div><div><strong>閱讀限制</strong><p>${escapeHtml(article.limitations)}</p></div></div>
      <p class="citation">${escapeHtml(article.citation)}</p><div class="article-links">${sourceLinks(article)}</div>
    </div>
  </article>`).join("");
  content.innerHTML = `<aside class="evidence-note"><strong>證據邊界</strong><p>${escapeHtml(feature.evidenceNote)}</p></aside>${overview}<section class="feature-papers"><p class="eyebrow">Full-text reading notes</p><h2>8 篇逐篇解讀</h2>${articles}</section>`;
}
