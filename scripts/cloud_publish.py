#!/usr/bin/env python3
"""Publish a verified daily neurology alert from GitHub Actions."""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ALERTS_JSON = ROOT / "data" / "alerts.json"
ALERTS_JS = ROOT / "data" / "alerts.js"
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
USER_AGENT = "NeurologyLiteratureAlert-GitHubActions/1.0 (a7662888@gmail.com)"
TAIPEI = timezone(timedelta(hours=8))

THEMES = {
    "dementia": {
        "label": "失智症",
        "query": (
            'dementia[Title/Abstract] OR "mild cognitive impairment"[Title/Abstract] '
            'OR "Alzheimer disease"[Title/Abstract] OR Alzheimer[Title/Abstract] '
            'OR "cognitive decline"[Title/Abstract]'
        ),
        "tracking": "dementia OR mild cognitive impairment OR Alzheimer disease OR cognitive decline",
    },
    "stroke": {
        "label": "腦中風",
        "query": (
            'stroke[Title/Abstract] OR "cerebral ischemia"[Title/Abstract] '
            'OR "intracerebral hemorrhage"[Title/Abstract] OR thrombectomy[Title/Abstract]'
        ),
        "tracking": "stroke OR cerebral ischemia OR intracerebral hemorrhage OR thrombectomy",
    },
    "parkinson": {
        "label": "巴金森氏症",
        "query": (
            '"Parkinson disease"[Title/Abstract] OR Parkinson[Title/Abstract] '
            'OR parkinsonism[Title/Abstract] OR "movement disorder"[Title/Abstract]'
        ),
        "tracking": "Parkinson disease OR parkinsonism OR movement disorder",
    },
    "neuroscience": {
        "label": "神經科學基礎",
        "query": (
            'neurodegeneration[Title/Abstract] OR neurodegenerative[Title/Abstract] '
            'OR "neural circuit"[Title/Abstract] OR synaptic[Title/Abstract]'
        ),
        "tracking": "neurodegeneration OR neural circuit OR synaptic",
    },
    "prevention": {
        "label": "政策公衛",
        "query": (
            '(prevention[Title/Abstract] OR preventive[Title/Abstract]) AND '
            '(dementia[Title/Abstract] OR stroke[Title/Abstract] '
            'OR Parkinson[Title/Abstract] OR neurodegeneration[Title/Abstract])'
        ),
        "tracking": "neurological disease prevention",
    },
}

HIGH_IMPACT = {
    "n engl j med": 100,
    "lancet neurol": 98,
    "lancet": 94,
    "nat med": 92,
    "jama neurol": 90,
    "nat neurosci": 88,
    "nature": 86,
    "brain": 82,
    "ann neurol": 82,
    "neurology": 80,
    "stroke": 78,
    "mov disord": 76,
    "alzheimers dement": 76,
    "j neurol neurosurg psychiatry": 74,
    "sci transl med": 74,
    "neuron": 72,
}

EXCLUDED_TYPES = {
    "comment",
    "editorial",
    "letter",
    "news",
    "newspaper article",
    "published erratum",
    "retracted publication",
    "retraction of publication",
}


def request_bytes(url: str, accept: str, attempts: int = 4) -> bytes:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(
                url,
                headers={"Accept": accept, "User-Agent": USER_AGENT},
            )
            with urllib.request.urlopen(request, timeout=45) as response:
                return response.read()
        except Exception as exc:
            last_error = exc
            if attempt < attempts:
                time.sleep(attempt * 3)
    raise RuntimeError(f"Request failed: {url}") from last_error


def request_json(url: str) -> dict:
    return json.loads(request_bytes(url, "application/json").decode("utf-8"))


def text_of(node: ET.Element, path: str) -> str:
    found = node.find(path)
    return "".join(found.itertext()).strip() if found is not None else ""


def normalize_title(value: str) -> str:
    return re.sub(r"[\W_]+", "", html.unescape(value), flags=re.UNICODE).casefold()


def esearch(query: str, start: date, end: date, retmax: int = 100) -> tuple[int, list[str], str]:
    dated_query = f"({query}) AND ({start:%Y/%m/%d}:{end:%Y/%m/%d}[EDAT])"
    params = urllib.parse.urlencode(
        {
            "db": "pubmed",
            "retmode": "json",
            "retmax": retmax,
            "sort": "pub date",
            "term": dated_query,
            "email": "a7662888@gmail.com",
        }
    )
    result = request_json(EUTILS + "esearch.fcgi?" + params)["esearchresult"]
    return int(result.get("count", 0)), result.get("idlist", []), dated_query


def efetch(pmids: list[str]) -> list[dict]:
    if not pmids:
        return []
    rows = []
    for offset in range(0, len(pmids), 100):
        params = urllib.parse.urlencode(
            {
                "db": "pubmed",
                "retmode": "xml",
                "id": ",".join(pmids[offset : offset + 100]),
                "email": "a7662888@gmail.com",
            }
        )
        root = ET.fromstring(request_bytes(EUTILS + "efetch.fcgi?" + params, "application/xml"))
        for article in root.findall("./PubmedArticle"):
            ids = {
                node.attrib.get("IdType", "").lower(): (node.text or "").strip()
                for node in article.findall("./PubmedData/ArticleIdList/ArticleId")
            }
            authors = []
            for author in article.findall(".//AuthorList/Author"):
                last = text_of(author, "LastName")
                initials = text_of(author, "Initials")
                if last:
                    authors.append(f"{last} {initials}".strip())
            abstract_parts = []
            for node in article.findall(".//Abstract/AbstractText"):
                label = node.attrib.get("Label")
                value = "".join(node.itertext()).strip()
                if value:
                    abstract_parts.append(f"{label}: {value}" if label else value)
            publication_types = [
                "".join(node.itertext()).strip()
                for node in article.findall(".//PublicationTypeList/PublicationType")
            ]
            pub_date = (
                "-".join(
                    value
                    for value in (
                        text_of(article, ".//ArticleDate/Year"),
                        text_of(article, ".//ArticleDate/Month"),
                        text_of(article, ".//ArticleDate/Day"),
                    )
                    if value
                )
                or text_of(article, ".//JournalIssue/PubDate/Year")
            )
            rows.append(
                {
                    "pmid": text_of(article, ".//PMID"),
                    "doi": ids.get("doi", ""),
                    "title": html.unescape(text_of(article, ".//ArticleTitle")),
                    "authors": authors,
                    "journal": text_of(article, ".//Journal/Title"),
                    "journal_abbrev": text_of(article, ".//Journal/ISOAbbreviation"),
                    "pub_date": pub_date,
                    "publication_types": publication_types,
                    "abstract": html.unescape("\n\n".join(abstract_parts)),
                }
            )
        time.sleep(0.4)
    return rows


def article_score(row: dict) -> int:
    journal = f"{row['journal_abbrev']} {row['journal']}".lower()
    score = max((value for key, value in HIGH_IMPACT.items() if key in journal), default=20)
    types = " ".join(row["publication_types"]).lower()
    if "randomized controlled trial" in types:
        score += 18
    if "meta-analysis" in types or "systematic review" in types:
        score += 12
    if row["abstract"]:
        score += min(len(row["abstract"]) // 500, 8)
    return score


def citation(row: dict) -> str:
    authors = ", ".join(row["authors"][:3])
    if len(row["authors"]) > 3:
        authors += ", et al."
    title = row["title"].rstrip(".")
    return f"{authors}. {title}. {row['journal_abbrev'] or row['journal']}. {row['pub_date']}."


def generate_summaries_via_gemini(title: str, abstract: str, theme_label: str) -> dict | None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    
    prompt = f"""
你是一位專業的神經醫學專家。請閱讀以下文獻的英文標題與摘要，並生成繁體中文（台灣醫學術語，禁止使用簡體字）的精確內容。

標題：{title}
主題：{theme_label}
摘要：{abstract}

請輸出以下三個部分，並嚴格遵循 JSON 格式返回，不要包含任何 markdown 語法（例如 ```json 標記或反引號）：
{{
  "summaryZh": "以繁體中文撰寫的學術摘要，簡述研究設計、對象、核心發現與主要結果（約 2-3 句）",
  "clinicalMeaning": "此研究對失智症防治、腦中風或神經科臨床診斷與治療的具體臨床意義（約 1-2 句）",
  "researchMeaning": "此研究在學術上的研究價值，說明後續監測與審讀的關鍵點（約 1-2 句）"
}}
"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            text = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return json.loads(text)
    except Exception as exc:
        print(f"Gemini API call failed for '{title}': {exc}")
        return None


def build_article(row: dict, run_date: date) -> dict:
    theme = row["themes"][0]
    label = THEMES[theme]["label"]
    basis = "PubMed abstract" if row["abstract"] else "PubMed metadata"
    types = "、".join(row["publication_types"][:2]) or "期刊文獻"
    
    gemini_data = generate_summaries_via_gemini(row["title"], row["abstract"], label)
    
    if gemini_data and "summaryZh" in gemini_data:
        summary_zh = gemini_data["summaryZh"]
        clinical_meaning = gemini_data["clinicalMeaning"]
        research_meaning = gemini_data["researchMeaning"]
    else:
        summary_zh = (
            f"本篇為 {label} 主題之{types}，由 {basis} 自動收錄。"
            "本速報不自動推導原文未明列的效果量或因果結論；完整方法、結果與限制仍需全文核對。"
        )
        clinical_meaning = "此為背景自動收錄項目；臨床應用前須核對全文、研究設計、族群與效果量。"
        research_meaning = f"可納入「{label}」研究監測與後續全文審讀清單。"
        
    return {
        "topic": theme,
        "priority": "high" if row["score"] >= 75 else "medium",
        "titleZh": row["title"],
        "citation": citation(row),
        "pmid": row["pmid"],
        "doi": row["doi"],
        "sourceUrl": f"https://pubmed.ncbi.nlm.nih.gov/{row['pmid']}/",
        "journalUrl": f"https://doi.org/{row['doi']}",
        "summaryZh": summary_zh,
        "clinicalMeaning": clinical_meaning,
        "researchMeaning": research_meaning,
        "trackingQuestion": THEMES[theme]["tracking"],
        "obsidianPath": f"E:\\OneDrive\\Obsidian Vault\\05-知識庫\\文獻\\{run_date.year}\\{row['pmid']}-{label}自動文獻.md",
    }


def run_date_from_environment(override: str | None) -> date:
    if override:
        return date.fromisoformat(override)
    return datetime.now(TAIPEI).date()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date")
    parser.add_argument("--top", type=int, default=5)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    run_date = run_date_from_environment(args.date)
    publisher = "codex" if run_date.day % 2 == 0 else "antigravity"
    payload = json.loads(ALERTS_JSON.read_text(encoding="utf-8"))
    if any(issue.get("date") == run_date.isoformat() for issue in payload.get("issues", [])):
        print(f"Issue {run_date.isoformat()} already exists.")
        return 0

    known_pmids = set()
    known_dois = set()
    known_titles = set()
    existing_dates = []
    for issue in payload.get("issues", []):
        try:
            existing_dates.append(date.fromisoformat(issue["date"]))
        except (KeyError, ValueError):
            pass
        for article in issue.get("articles", []):
            if article.get("pmid"):
                known_pmids.add(str(article["pmid"]).strip())
            if article.get("doi"):
                known_dois.add(str(article["doi"]).strip().lower())
            title = article.get("title") or article.get("titleZh")
            if title:
                known_titles.add(normalize_title(str(title)))

    previous_date = max(existing_dates) if existing_dates else run_date - timedelta(days=2)
    search_start = min(previous_date, run_date - timedelta(days=1))
    rows_by_pmid: dict[str, dict] = {}
    search_log = []

    for theme, config in THEMES.items():
        count, pmids, exact_query = esearch(config["query"], search_start, run_date)
        search_log.append(
            {
                "source": "PubMed E-utilities",
                "query": exact_query,
                "executedAt": run_date.isoformat(),
                "hits": str(count),
                "screening": (
                    "排除既有 PMID、DOI、正規化標題、評論、社論、信件、撤稿與缺少可驗證 DOI 者；"
                    "依主題相關性、文章類型及期刊排序。"
                ),
            }
        )
        new_pmids = [pmid for pmid in pmids if pmid not in known_pmids]
        for row in efetch(new_pmids):
            doi = row["doi"].lower()
            title = normalize_title(row["title"])
            if row["pmid"] in known_pmids or doi in known_dois or title in known_titles:
                continue
            if row["pmid"] not in rows_by_pmid:
                row["themes"] = [theme]
                rows_by_pmid[row["pmid"]] = row
            elif theme not in rows_by_pmid[row["pmid"]]["themes"]:
                rows_by_pmid[row["pmid"]]["themes"].append(theme)
        time.sleep(0.4)

    eligible = []
    for row in rows_by_pmid.values():
        types = {value.lower() for value in row["publication_types"]}
        # PubMed may label publisher research briefings as generic journal
        # articles. Require authors and an abstract so they are not mistaken
        # for the underlying original research.
        if (
            types & EXCLUDED_TYPES
            or not row["doi"]
            or not row["title"]
            or not row["authors"]
            or not row["abstract"]
        ):
            continue
        row["score"] = article_score(row)
        eligible.append(row)
    eligible.sort(key=lambda row: (row["score"], row["pmid"]), reverse=True)

    selected = []
    per_theme: dict[str, int] = {}
    for row in eligible:
        primary = row["themes"][0]
        if per_theme.get(primary, 0) >= 2:
            continue
        selected.append(row)
        per_theme[primary] = per_theme.get(primary, 0) + 1
        if len(selected) >= args.top:
            break

    print("Selected PMIDs:", ",".join(row["pmid"] for row in selected) or "none")
    if args.dry_run:
        return 0

    issue = {
        "id": run_date.isoformat(),
        "date": run_date.isoformat(),
        "title": f"{run_date.isoformat()} 神經科文獻速報",
        "status": "current",
        "publisher": publisher,
        "summary": (
            f"本期由 GitHub Actions 背景排程收錄 {len(selected)} 篇經 PubMed PMID/DOI 驗證且通過歷史去重的神經科新文獻。"
            "內容為 metadata/abstract 層級，全文效果量與臨床結論尚待人工審讀。"
        ),
        "searchLog": search_log,
        "zotero": {
            "imported": 0,
            "duplicatesSkipped": 0,
            "collections": f"每日文獻/{run_date.year}/{run_date.isoformat()}",
            "itemKeysVerified": False,
            "sqliteFallback": "disabled",
            "note": "雲端發布不寫入 Zotero；本機開機後由同步流程補齊 Obsidian/Zotero。",
        },
        "articles": [build_article(row, run_date) for row in selected],
    }
    for old_issue in payload.get("issues", []):
        old_issue["status"] = "archived"
    payload["issues"] = [issue, *payload.get("issues", [])]
    payload["site"]["updatedAt"] = datetime.now(TAIPEI).isoformat(timespec="seconds")
    payload["site"]["updateCadence"] = "每日 07:30（Asia/Taipei）；GitHub Actions 雲端發布，12:00 補漏。"

    ALERTS_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ALERTS_JS.write_text(
        "window.NEURO_ALERTS_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )

    output = os.environ.get("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as handle:
            handle.write(f"issue_date={run_date.isoformat()}\n")
            handle.write(f"publisher={publisher}\n")
            handle.write(f"article_count={len(selected)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
