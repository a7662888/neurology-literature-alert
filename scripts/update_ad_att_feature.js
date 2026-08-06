const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const alertsJsonPath = path.join(root, "data", "alerts.json");
const alertsJsPath = path.join(root, "data", "alerts.js");
const payload = JSON.parse(fs.readFileSync(alertsJsonPath, "utf8"));
const feature = (payload.features || []).find((item) => item.id === "ad-att-2026");

if (!feature) {
  throw new Error("Feature ad-att-2026 was not found.");
}

const legacyThemes = {
  "42273802": "療效幅度",
  "42128444": "療效幅度",
  "41215623": "真實世界",
  "42168764": "方法與證據邊界",
  "41390238": "治理／可近性",
  "42015330": "ARIA 安全",
  "10.64898/2026.01.23.26344739": "ARIA 安全",
  "41694525": "治理／可近性",
  "41787137": "治理／可近性",
  "41803942": "影像／生物標記",
  "10.31435/ijitss.1(49).2026.4885": "方法與證據邊界",
  "10.30978/unj2026-1-11": "方法與證據邊界",
  "10.18794/aams/218631": "方法與證據邊界",
  "10.22379/anc.1993": "治理／可近性",
  "42389420": "影像／生物標記",
  "42374501": "影像／生物標記"
};

const newArticles = [
  {
    pmid: "42506306",
    doi: "10.3390/medsci14030337",
    titleZh: "四個第 III 期計畫的統合分析：平均減緩存在，但幅度有限且藥物間異質",
    title: "Pharmacological and Clinical Heterogeneity of Anti-Amyloid Monoclonal Antibodies in Early Alzheimer's Disease: A Systematic Review and Meta-Analysis of Randomized Trials.",
    summaryZh: "六組比較、四個第 III 期試驗、共 7,695 人的統合分析顯示，抗類澱粉單株抗體在 CDR-SB 的合併平均差為 -0.42 分；結果主要由 lecanemab 與 donanemab 試驗帶動。",
    keyFindings: [
      "CDR-SB 合併平均差 -0.42（95% CI -0.59 至 -0.25；I²=78%）。",
      "ARIA-E 風險比 10.1（95% CI 7.8–13.0）；多數事件由試驗規定 MRI 偵測。",
      "統計上顯著的減緩接近早期 AD 所報最小臨床重要差異的下界。"
    ],
    clinicalMeaning: "最穩健的跨試驗結論不是「改善認知」，而是平均減緩惡化；決策需把有限平均效益與 ARIA、輸注及監測負擔放在同一張表上。",
    limitations: "類別層級統合混合不同抗體與試驗；異質性高，且只有四個第 III 期計畫，不能取代個別藥物與個別病人的效益風險判斷。",
    citation: "Medical Sciences. 2026-06-23. PMID: 42506306.",
    evidenceLevel: "系統性回顧／統合分析",
    articleType: "第 III 期 RCT 統合",
    pages: "全文",
    theme: "療效幅度",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: true
  },
  {
    pmid: "42332768",
    doi: "10.1186/s13195-026-02095-4",
    titleZh: "美國 EHR 目標試驗模擬：Lecanemab 的效益訊號伴隨更多醫療利用",
    title: "Real-world effectiveness of monoclonal antibody lecanemab versus acetylcholinesterase inhibitors in Alzheimer's disease: a target trial emulation.",
    summaryZh: "TriNetX 以 1:1 傾向分數配對比較 lecanemab 與乙醯膽鹼酯酶抑制劑，各納入 589 人；結果屬探索性關聯，不能視為隨機比較。",
    keyFindings: [
      "BPSD HR 0.52（95% CI 0.36–0.77），急診 HR 0.66（0.51–0.85）。",
      "住院 HR 1.31（1.03–1.67），類固醇使用 HR 2.19（1.55–3.10）。",
      "一年治療持續率相近：53.4% 對 52.5%；影像異常診斷約為對照的五倍。"
    ],
    clinicalMeaning: "真實世界的「效果」與醫療系統的主動監測、ARIA 處置相互纏繞；除認知量表外，住院、急診、藥物與照護使用也應成為成效指標。",
    limitations: "回溯性 EHR、非隨機、缺少一致的 amyloid 生物標記與量表資料；殘餘混雜與監測偏差無法排除。",
    citation: "Alzheimer's Research & Therapy. 2026-06-22. PMID: 42332768.",
    evidenceLevel: "同儕審查・摘要核實",
    articleType: "目標試驗模擬",
    pages: "摘要",
    theme: "真實世界",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: true
  },
  {
    pmid: "42434897",
    doi: "10.1177/13872877261466097",
    titleZh: "二十二個隨機試驗的 ARIA 網絡統合：風險具有藥物差異與 APOE 基因劑量效應",
    title: "Comparative risk of amyloid-related imaging abnormalities with anti-amyloid-β monoclonal antibodies: A systematic review and penalized likelihood network meta-analysis of randomized trials.",
    summaryZh: "納入 22 個第 II／III 期隨機試驗、最多 23,120 人，使用懲罰概似網絡統合處理稀少事件，比較不同抗體的 ARIA 風險。",
    keyFindings: [
      "ARIA-E 合併盛行率 6.8%，ARIA-H 15.8%；相對安慰劑 OR 分別為 7.93 與 1.87。",
      "Donanemab 與 aducanumab 的 ARIA-E 排名最高，其後為 gantenerumab 與 lecanemab。",
      "APOE ε4 攜帶與 ARIA-E（OR 2.28）及 ARIA-H（OR 2.07）相關，純合子呈較強風險。"
    ],
    clinicalMeaning: "APOE 與基準 MRI 不只是法規勾選欄位，而是決定監測強度與共享決策內容的核心風險分層工具。",
    limitations: "跨試驗 MRI 序列、追蹤頻率、ARIA 定義與納入標準不一致；網絡排名是間接比較，不能當作頭對頭結論。",
    citation: "Journal of Alzheimer's Disease. 2026-07-11. PMID: 42434897.",
    evidenceLevel: "系統性回顧／網絡統合",
    articleType: "隨機試驗安全性統合",
    pages: "摘要",
    theme: "ARIA 安全",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: true
  },
  {
    pmid: "42449395",
    doi: "10.1186/s13195-026-02141-1",
    titleZh: "南韓單中心導入：ARIA 可管理，但輸注容量成為真正瓶頸",
    title: "Real-world safety and implementation challenges of lecanemab therapy for Alzheimer's disease in South Korea: a single-center experience.",
    summaryZh: "首爾 Asan Medical Center 共有 112 人開始 lecanemab；研究把安全事件與實施容量放在同一個真實世界框架中評估。",
    keyFindings: [
      "輸注反應 41/112（37%），多為輕至中度。",
      "在至少四次輸注且完成至少一次 MRI 的 105 位風險集病人中，20 人（19%）發生 ARIA。",
      "計畫啟動九個月後，等待時間最長達 20 週。"
    ],
    clinicalMeaning: "即使單一病人的 ARIA 可以處理，整體服務仍可能被輸注椅、MRI、判讀與追蹤容量限制；ATT 是照護路徑，不只是藥物處方。",
    limitations: "單一高量能轉診中心、追蹤期短；ARIA 分母為完成足夠輸注與 MRI 者，不能直接套用為所有啟動者的發生率。",
    citation: "Alzheimer's Research & Therapy. 2026-07-14. PMID: 42449395.",
    evidenceLevel: "同儕審查・摘要核實",
    articleType: "單中心真實世界世代",
    pages: "摘要",
    theme: "治理／可近性",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: true
  },
  {
    pmid: "42533763",
    doi: "10.1111/ggi.70698",
    titleZh: "J-ADNI 治療窗口：MCI 階段保有資格的時間明顯長於輕度失智",
    title: "Therapeutic Time Window of Disease-Modifying Therapy for Early Alzheimer's Disease in Japanese Individuals: Analysis Based on J-ADNI Study.",
    summaryZh: "以 J-ADNI amyloid 陽性資料估計持續符合治療資格的時間；lecanemab 分析 129 人、donanemab 分析 143 人。",
    keyFindings: [
      "24 個月時 lecanemab 資格保留機率：MCI 69%，輕度失智 38%。",
      "24 個月時 donanemab 資格保留機率：MCI 81%，輕度失智 52%。",
      "較高基準 MMSE 對兩藥皆預測較長窗口；CDR-GS 對 donanemab 組有額外預測力。"
    ],
    clinicalMeaning: "診斷與生物標記確認若延遲，病人可能在服務排程完成前退出資格範圍；縮短轉診與檢查週期是治療效益的一部分。",
    limitations: "J-ADNI 次級分析與資格演算法，不是實際接受藥物的追蹤；樣本小，且標示與給付條件會隨地區改變。",
    citation: "Geriatrics & Gerontology International. Online 2026-07-31. PMID: 42533763.",
    evidenceLevel: "同儕審查・全文",
    articleType: "縱向資格窗口分析",
    pages: "全文",
    theme: "治理／可近性",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: true
  },
  {
    pmid: "42535277",
    doi: "10.1002/alz.71705",
    titleZh: "Lecanemab 下的 p-tau217 軌跡：三個月可見下降，但尚不能當停換藥開關",
    title: "Heterogeneity in plasma p-tau217 response and its association with cognitive trajectories under lecanemab treatment.",
    summaryZh: "前瞻性真實世界研究追蹤 153 位早期 AD 病人，描繪 lecanemab 治療後 plasma p-tau217 的時間動態與認知軌跡關聯。",
    keyFindings: [
      "p-tau217 自三個月起顯著下降，三至六個月降幅最大，其後趨於平台。",
      "較大幅下降群的 CDR-SB 軌跡較佳。",
      "高血壓與較弱的生物標記反應相關。"
    ],
    clinicalMeaning: "p-tau217 有望成為早期藥效動態指標，協助辨認反應異質性；目前較適合補充評估與研究，而非單獨決定停藥或換藥。",
    limitations: "觀察性關聯不能證明 p-tau217 是臨床效益的有效替代終點；追蹤時間、治療選擇與共病仍可能影響結果。",
    citation: "Alzheimer's & Dementia. Online 2026-07-31. PMID: 42535277.",
    evidenceLevel: "同儕審查・全文",
    articleType: "前瞻性真實世界世代",
    pages: "全文",
    theme: "影像／生物標記",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: true
  },
  {
    pmid: "42490986",
    doi: "10.1002/trc2.70300",
    titleZh: "六個月真實世界 PET：MCI 階段的 amyloid 下降速度快於失智階段",
    title: "Six-month real-world amyloid PET outcomes after lecanemab: Greater amyloid reduction at the MCI stage than in dementia.",
    summaryZh: "89 位接受 lecanemab 的病人中，50 位進入主要 PET 分析；以 Centiloid 比較 MCI 與失智階段的早期清除速度。",
    keyFindings: [
      "校正後 MCI 約 -2.34 CL/月，失智階段約 -0.72 CL/月。",
      "50 人中 9 人（18%）轉為 amyloid-negative，MCI 階段較常見。",
      "研究同時觀察到 MCI 組較有利的短期認知與功能軌跡。"
    ],
    clinicalMeaning: "早期開始可能帶來更快的生物標記反應，但 amyloid 清除速度仍不等同個別病人的臨床獲益。",
    limitations: "主要分析僅 50 人、無未治療對照、追蹤短；PET 轉陰與長期功能結果的關係尚未確立。",
    citation: "Alzheimer's & Dementia: Translational Research & Clinical Interventions. 2026. PMID: 42490986.",
    evidenceLevel: "同儕審查・全文",
    articleType: "真實世界 PET 世代",
    pages: "全文",
    theme: "影像／生物標記",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42507054",
    doi: "10.1007/s11604-026-02054-x",
    titleZh: "Donanemab 真實世界 serial PET：二十人皆下降，八成五視覺判讀轉陰",
    title: "Serial amyloid PET demonstrates marked reduction in amyloid burden following donanemab treatment: a real-world cohort study.",
    summaryZh: "連續 20 位接受 donanemab 且有治療前後 amyloid PET 的病人，使用 Centiloid、SUVr 與視覺判讀評估清除。",
    keyFindings: [
      "所有 20 人的 Centiloid 均下降。",
      "17/20（85%）在視覺判讀由 amyloid-positive 轉為 negative。",
      "不同示蹤劑組的量化指標均顯示顯著下降。"
    ],
    clinicalMeaning: "結果支持 serial PET 可顯示 donanemab 的標的作用；是否值得常規重複掃描，仍需連結臨床結果、成本與治療停止策略。",
    limitations: "單中心、回溯、只有 20 人且無對照；PET 轉陰不能直接解讀為認知改善。",
    citation: "Japanese Journal of Radiology. Online 2026-07-27. PMID: 42507054.",
    evidenceLevel: "同儕審查・全文",
    articleType: "小型真實世界 PET 世代",
    pages: "全文",
    theme: "影像／生物標記",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42449771",
    doi: "10.3390/diagnostics16131989",
    titleZh: "Centiloid 的臨床位置：診斷、治療起始與監測不能混成同一門檻",
    title: "The Centiloid Scale in Amyloid PET Imaging: Current Role in Alzheimer's Disease Diagnosis, Treatment Planning, and Monitoring During Anti-Amyloid Therapy: A Clinical Perspective.",
    summaryZh: "臨床觀點整合 Centiloid 的診斷、治療規劃與縱向監測角色，特別討論 10–30 CL 灰區與不同軟體平台。",
    keyFindings: [
      "<10 CL 可支持 amyloid-negative，>30 CL 為高確信 amyloid-positive。",
      "24–30 CL 被專家共識提出作為治療起始參考區間。",
      "同一病人的縱向監測宜維持相同量化平台。"
    ],
    clinicalMeaning: "Centiloid 可提升跨示蹤劑溝通，但門檻必須放回臨床表型與視覺判讀；目前不宜把單一數字做成自動處方開關。",
    limitations: "屬臨床觀點與共識整合；治療門檻尚未由前瞻性策略試驗驗證，軟體間差異仍可能影響數值。",
    citation: "Diagnostics. 2026-06-26. PMID: 42449771.",
    evidenceLevel: "同儕審查・全文",
    articleType: "臨床觀點綜述",
    pages: "全文",
    theme: "影像／生物標記",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42440686",
    doi: "10.3389/fphar.2026.1868789",
    titleZh: "FAERS 比較 Lecanemab 與 Donanemab：可做訊號偵測，不能算發生率",
    title: "Comparison of safety of lecanemab and donanemab: a real-world disproportionality analysis using the FDA adverse event reporting system.",
    summaryZh: "分析至 2025 年第四季的 3,640 份主要疑似藥物報告，比較兩藥不良事件通報型態與發生時間。",
    keyFindings: [
      "Lecanemab 2,602 份、donanemab 1,038 份報告。",
      "Lecanemab 的 ARIA-H 通報不成比例訊號較強，donanemab 的 ARIA-E 較強。",
      "中位通報發生時間分別為 46 天與 31 天。"
    ],
    clinicalMeaning: "上市後資料能提早產生監測假說，提醒前幾個月的密集觀察；不能據此比較哪一藥『比較安全』。",
    limitations: "自發通報有重複、漏報、刺激通報與缺乏暴露分母；不成比例訊號不代表真實發生率或因果。",
    citation: "Frontiers in Pharmacology. 2026-06-22. PMID: 42440686.",
    evidenceLevel: "同儕審查・全文",
    articleType: "藥物警戒不成比例分析",
    pages: "全文",
    theme: "ARIA 安全",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42339400",
    doi: "10.1002/trc2.70274",
    titleZh: "把十八個月差異外推到十多年：Lecanemab 長期進展模擬",
    title: "Simulation of long-term lecanemab treatment effect on Alzheimer's disease progression.",
    summaryZh: "以 ADNI 與 NACC 自然史模型套用 CLARITY AD 的 37% time-delay 假設，將 CDR-SB 差異轉換為到達重度 AD 的時間。",
    keyFindings: [
      "自然病程模型估計從 AD-MCI 到重度 AD 約 11.5–13.7 年。",
      "假設持續治療，延後重度 AD 2.5–3.7 年；納入停藥後為 2.0–3.0 年。",
      "數值是模型推估，不是病人實際追蹤結果。"
    ],
    clinicalMeaning: "時間延後比量表分數容易溝通，但只能以情境分析呈現；共享決策時必須明確說明假設。",
    limitations: "長期外推高度依賴固定治療效應、自然史資料與停藥假設；不宜標示為已觀察到的多年獲益。",
    citation: "Alzheimer's & Dementia: Translational Research & Clinical Interventions. 2026. PMID: 42339400.",
    evidenceLevel: "同儕審查・全文",
    articleType: "疾病進展模擬",
    pages: "全文",
    theme: "療效幅度",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42417051",
    doi: "10.1177/13872877261466695",
    titleZh: "生物標記記憶門診的資格漏斗：五年 479 人僅 16% 符合 Lecanemab",
    title: "Eligibility for lecanemab therapy in a biomarker defined memory clinic cohort: A five-year analysis.",
    summaryZh: "單一三級記憶門診回顧 2021–2025 年接受 AD 生物標記檢查的 479 位 MCI 或失智病人，以 2026 年適當使用條件估算資格。",
    keyFindings: [
      "整體符合資格 16%；主要排除原因為生物標記陰性 41% 與疾病過晚 31%。",
      "APOE ε4/ε4 與其他安全原因各排除約 6%。",
      "2025 子群的估計資格率為 32%，反映更聚焦的轉診與較少病程延誤。"
    ],
    clinicalMeaning: "從『疑似 AD』到實際可治療是一個快速縮小的漏斗；服務規劃要估算完成 biomarker、MRI 與遺傳風險評估後的真實分母。",
    limitations: "單一三級、已接受 biomarker 檢查的選擇性世代；不代表一般人口或台灣整體門診的資格率。",
    citation: "Journal of Alzheimer's Disease. 2026-07-08. PMID: 42417051.",
    evidenceLevel: "同儕審查・摘要核實",
    articleType: "記憶門診橫斷世代",
    pages: "摘要",
    theme: "治理／可近性",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42426158",
    doi: "10.1038/s41598-026-61640-1",
    titleZh: "歐洲記憶門診病人態度：支持可近性，不等同願意承擔個人風險",
    title: "Attitudes of specialist memory-clinic patients with early symptomatic Alzheimer's disease towards lecanemab: results from a multicenter survey in Europe.",
    summaryZh: "281 位早期症狀性 AD 病人在閱讀效益、ARIA 與 APOE ε4/ε4 風險的簡短說明後，回答治療與核准態度。",
    keyFindings: [
      "81.9% 支持自己接受治療，91.8% 支持歐盟核准。",
      "在 APOE ε4/ε4 情境下，個人治療支持降為 61.2%，核准支持為 76.5%。",
      "支持『允許選擇』持續高於『自己接受』。"
    ],
    clinicalMeaning: "共享決策需分開詢問對治療可近性的價值判斷與個人接受風險的意願，不能把一般支持度當成同意治療。",
    limitations: "匿名便利樣本、無完整回覆率、二分題目且未驗證；不可推廣至所有病人或國家。",
    citation: "Scientific Reports. 2026-07-09. PMID: 42426158.",
    evidenceLevel: "同儕審查・全文",
    articleType: "多中心橫斷問卷",
    pages: "全文",
    theme: "治理／可近性",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42384109",
    doi: "10.1007/s00415-026-13924-9",
    titleZh: "以 NNT／NNH 重讀 Lecanemab 與 Donanemab：需要相同時間窗與終點才可比較",
    title: "Number needed to treat and harm for lecanemab and donanemab in early Alzheimer disease.",
    summaryZh: "短篇評論以 NNT 與 NNH 重新表達兩個樞紐試驗的效益與傷害，提醒絕對風險比相對減緩更適合共享決策。",
    keyFindings: [
      "文章屬既有試驗資料的再表達，不是新的頭對頭試驗。",
      "NNT／NNH 會隨終點定義、基準風險與追蹤時間改變。",
      "本地自動下載的同名 PDF 實為另一篇 donanemab 分析，因此本卡只採用已核實的書目資訊。"
    ],
    clinicalMeaning: "可用絕對差異向病人說明效益與傷害，但比較兩藥前必須統一分母、時間窗與事件定義。",
    limitations: "PubMed 無摘要，本次未取得正確全文；不轉述未直接核對的 NNT／NNH 數值。",
    citation: "Journal of Neurology. 2026-07-01. PMID: 42384109.",
    evidenceLevel: "同儕審查・書目核實",
    articleType: "短篇評論",
    pages: "未取得全文",
    theme: "療效幅度",
    sourceBatch: "2026-08-06",
    verificationStatus: "僅書目",
    featured: false
  },
  {
    pmid: "42349081",
    doi: "10.1016/j.tjpad.2026.100628",
    titleZh: "Donanemab 的外推缺口：排除抗凝血者後的『較安全』不能推回一般族群",
    title: "The generalizability gap: anticoagulant exclusions and the \"Enhanced Safety\" of donanemab in the EU-eligible population.",
    summaryZh: "評論聚焦歐盟適用族群排除抗凝血病人後，安全性估計與一般臨床族群之間的外推落差。",
    keyFindings: [
      "較嚴格標示可降低治療族群的觀察風險，卻同時縮小適用人口。",
      "試驗或標示內的安全性不能無條件外推至抗凝血與較高腦血管風險者。",
      "此文主要提供一般化與政策方法學問題。"
    ],
    clinicalMeaning: "評估『可治療多少人』時，必須把抗凝血、微出血與腦血管共病明確放入資格漏斗，而非只引用整體試驗發生率。",
    limitations: "評論文章，未提供新的比較性病人層級資料；本次僅核對書目與可取得內容。",
    citation: "The Journal of Prevention of Alzheimer's Disease. 2026-06-25. PMID: 42349081.",
    evidenceLevel: "同儕審查・評論",
    articleType: "一般化評論",
    pages: "評論",
    theme: "方法與證據邊界",
    sourceBatch: "2026-08-06",
    verificationStatus: "部分核實",
    featured: false
  },
  {
    pmid: "42468989",
    doi: "10.1136/bmj-2026-100318",
    titleZh: "Lecanemab 初始使用簡化的政策訊號：便利性可能改變服務量，而非改變效益證據",
    title: "Alzheimer's drug lecanemab: FDA approves easier initial use, with \"huge implications\" for UK.",
    summaryZh: "BMJ 新聞報導聚焦美國核准較便利的初始使用方式，以及其對英國服務規劃可能帶來的影響。",
    keyFindings: [
      "這是政策與法規新聞，不是療效或安全性比較研究。",
      "給藥便利性可能改變需求、輸注量與可近性。",
      "任何地區的實際採用仍取決於當地標示、給付與照護容量。"
    ],
    clinicalMeaning: "流程簡化可能放大治療需求，服務端應同步估算 MRI、藥事、輸注與緊急處置容量。",
    limitations: "PubMed 無摘要且屬新聞報導；本卡不據此推論臨床效益或台灣法規。",
    citation: "BMJ. 2026-07-17. PMID: 42468989.",
    evidenceLevel: "新聞・書目核實",
    articleType: "政策／法規新聞",
    pages: "未取得全文",
    theme: "治理／可近性",
    sourceBatch: "2026-08-06",
    verificationStatus: "僅書目",
    featured: false
  },
  {
    pmid: "42520782",
    doi: "",
    titleZh: "早期 AD 抗類澱粉治療建議：選案、生物標記與 ARIA 流程仍是共同核心",
    title: "Anti-Amyloid Therapies for Early Alzheimer's Disease: Evidence-Based Recommendations.",
    summaryZh: "敘述性建議整合 lecanemab 與 donanemab 的樞紐試驗、適當使用建議與真實世界安全考量。",
    keyFindings: [
      "適用範圍聚焦 amyloid 確認的 MCI 或輕度 AD dementia。",
      "APOE ε4 風險溝通與 MRI 監測是兩藥共同的照護基礎。",
      "長期結果、比較效果與公平可近性仍不確定。"
    ],
    clinicalMeaning: "可作為流程核對清單的背景資料，但實際處方仍需依所在地核准標示、專業指引與個別風險。",
    limitations: "敘述性建議、無 DOI，非正式系統性指引或頭對頭證據；部分『臨床有意義』措辭需與統合證據並讀。",
    citation: "South Dakota Medicine. 2026-01. PMID: 42520782.",
    evidenceLevel: "同儕審查・摘要核實",
    articleType: "敘述性實務建議",
    pages: "摘要",
    theme: "方法與證據邊界",
    sourceBatch: "2026-08-06",
    verificationStatus: "已核實",
    featured: false
  },
  {
    pmid: "42538794",
    doi: "10.1093/brain/awag265",
    titleZh: "真實世界 Lecanemab 世代的統計力、ARIA 偵測與納入標準：跨研究比較須先校準",
    title: "Statistical power, amyloid-related imaging abnormality ascertainment and inclusion criteria in lecanemab cohorts.",
    summaryZh: "Brain 的短篇評論聚焦 lecanemab 世代研究中樣本數、ARIA 偵測方式與納入標準如何改變表面結果。",
    keyFindings: [
      "ARIA 發生率會受 MRI 場強、序列、掃描時點與判讀規則影響。",
      "低事件數與不同納入門檻會限制風險因子分析的統計力。",
      "跨中心比較前應先報告監測方案與可評估分母。"
    ],
    clinicalMeaning: "同一個 ARIA 百分比若缺乏掃描方案與分母，臨床可比性很低；專題中的各世代數字因此分開呈現。",
    limitations: "PubMed 無摘要，本次未取得全文；卡片只保留題名可支持的方法學訊息，不轉述未核實結果。",
    citation: "Brain. 2026-08-01. PMID: 42538794.",
    evidenceLevel: "同儕審查・書目核實",
    articleType: "方法學評論",
    pages: "未取得全文",
    theme: "方法與證據邊界",
    sourceBatch: "2026-08-06",
    verificationStatus: "僅書目",
    featured: false
  }
];

const legacyArticles = (feature.articles || [])
  .filter((article) => article.sourceBatch !== "2026-08-06")
  .map((article) => {
    const key = article.pmid || article.doi;
    return {
      ...article,
      theme: article.theme || legacyThemes[key] || "方法與證據邊界",
      sourceBatch: article.sourceBatch || "2026-07-15",
      verificationStatus: article.verificationStatus || (article.evidenceLevel && article.evidenceLevel.includes("前印本") ? "前印本" : "已核實"),
      featured: Boolean(article.featured)
    };
  });

feature.kicker = "Anti-amyloid treatment · Living evidence map";
feature.title = "AD 新藥 ATT：Lecanemab 與 Donanemab 的真實世界考驗";
feature.subtitle = "從「能否清除 amyloid」走向「誰適合、何時開始、如何監測、系統能否承接」：跨期整合 34 篇證據。";
feature.summary = "跨期整合 34 篇文獻與政策資料，其中 18 篇為 2026-08-06 更新；以療效幅度、真實世界、ARIA 安全、影像與生物標記、治理與可近性、方法學邊界六條主線重整。";
feature.updatedAt = "2026-08-06";
feature.evidenceNote = "本專題是作者指定題目的跨期精讀與證據策展，不是系統性回顧。共 34 張證據卡：16 篇既有策展＋18 篇本次更新。文內明確區分全文／摘要已核實、前印本與僅書目資料；觀察性研究使用「相關」措辭，模擬值不當作已觀察長期效益，FAERS 訊號不當作發生率。";
feature.highlights = [
  { value: "34", label: "跨期證據卡", note: "16 篇既有＋18 篇本次更新" },
  { value: "-0.42", label: "CDR-SB 合併平均差", note: "95% CI -0.59 至 -0.25；4 個第 III 期計畫" },
  { value: "10.1×", label: "ARIA-E 合併風險比", note: "需與 MRI 偵測策略及個人風險並讀" },
  { value: "16%", label: "單一記憶門診資格率", note: "479 人 biomarker-defined 世代，不外推一般人口" }
];
feature.takeaways = [
  {
    label: "Benefit",
    title: "平均效果是減緩惡化，不是逆轉",
    body: "統合證據支持 lecanemab／donanemab 所在的抗體類別可減慢早期 AD 的平均下降，但幅度有限；個別病人是否感受到差異仍不確定。"
  },
  {
    label: "Timing",
    title: "真正稀缺的是治療窗口",
    body: "MCI 階段的 PET 反應與資格保留較佳；診斷、生物標記、MRI 與轉診延遲都可能讓病人離開適用範圍。"
  },
  {
    label: "Safety",
    title: "ARIA 必須用分母與偵測方式解讀",
    body: "APOE ε4、基準微出血、抗凝血與 MRI 規格共同塑造風險；不同中心的百分比不可直接排行榜式比較。"
  },
  {
    label: "Monitoring",
    title: "PET／p-tau217 是監測線索，不是自動停換藥按鈕",
    body: "生物標記可顯示標的作用與反應異質性，但尚未驗證為個別病人臨床效益的充分替代終點。"
  }
];
feature.sections = [
  {
    kicker: "Bottom line",
    title: "ATT 已從藥物問題，變成一條高密度照護路徑",
    body: "2026 年八月的跨期證據把焦點從「amyloid 能否清除」移到「誰能及時進入、誰承擔較高風險、監測如何落地、系統是否有容量」。臨床上最重要的不是把兩藥排成單一勝負，而是建立可稽核的選案、風險溝通、MRI、輸注、ARIA 處置與追蹤流程。"
  },
  {
    kicker: "Efficacy",
    title: "療效方向一致，平均幅度有限；長期『省下幾年』仍是模型",
    body: "四個第 III 期計畫的統合分析顯示 CDR-SB 平均差 -0.42 分，主要由 lecanemab 與 donanemab 帶動，但異質性高。疾病進展模擬可把差異轉成 2.0–3.7 年的情境估計，卻不能寫成已觀察結果。共享決策宜同時呈現平均差、絕對風險、時間窗與不確定性。"
  },
  {
    kicker: "Real world",
    title: "真實世界訊號同時包含效益、監測與醫療利用",
    body: "美國目標試驗模擬在配對後觀察到較少 BPSD 與急診，但住院與類固醇使用較多，顯示主動監測與 ARIA 處置會進入成效數據。中國、南韓與日本資料則補上東亞族群的 ARIA、服務容量與資格窗口；這些研究提高可移植性，但都不能取代隨機試驗。"
  },
  {
    kicker: "Safety",
    title: "ARIA 不是一個固定百分比，而是基因、MRI 與納入標準共同生成的結果",
    body: "22 個隨機試驗的網絡統合支持 APOE ε4 基因劑量效應與藥物間差異；真實世界研究又顯示 MRI 場強、序列、掃描時點與分母定義會改變表面發生率。FAERS 只能提示通報訊號，不能推算真實發生率或因果。"
  },
  {
    kicker: "Window & biomarkers",
    title: "越早開始的訊號正在累積，但 PET 與 p-tau217 尚未成為處方開關",
    body: "MCI 階段的 lecanemab amyloid 清除較快，J-ADNI 也顯示兩年後仍符合資格的機率高於輕度失智。p-tau217 三個月可見下降並與較佳 CDR-SB 軌跡相關；serial PET 亦可追蹤清除。但這些生物標記尚不能單獨證明個別病人的臨床獲益或決定停換藥。"
  },
  {
    kicker: "Implementation",
    title: "真正的可近性由資格漏斗、等待時間與基礎設施決定",
    body: "單一 biomarker-defined 記憶門診五年世代僅 16% 符合 lecanemab 條件；南韓中心在九個月內等待時間拉長至 20 週。藥價之外，診斷、APOE、MRI、輸注椅、神經放射判讀、急性處置與照護者時間共同決定 ATT 能否安全擴張。"
  }
];
feature.articles = [...newArticles, ...legacyArticles];

fs.writeFileSync(alertsJsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
fs.writeFileSync(
  alertsJsPath,
  "window.NEURO_ALERTS_DATA = " + JSON.stringify(payload, null, 2) + ";\n",
  "utf8"
);

console.log("Updated ad-att-2026:", {
  articles: feature.articles.length,
  newArticles: feature.articles.filter((article) => article.sourceBatch === "2026-08-06").length,
  themes: [...new Set(feature.articles.map((article) => article.theme))]
});
