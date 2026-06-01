import type {
  ClaimSignal,
  IssueCluster,
  PatternInsight,
  ProductAnalysis,
  ProductDemo,
  QAQualitySignal,
  Review,
  ReviewAnalysis,
  ReviewCategory,
  ReviewFlag,
  Sentiment,
} from "../types";
import { clamp, jaccard, ngrams, percent, sentenceSnippet, tokenize, uniqueTokens } from "./text";

const GENERIC_PHRASES = [
  "amazing product",
  "highly recommended",
  "value for money",
  "great quality",
  "very useful",
  "must buy",
  "excellent product",
  "best product",
  "quality is nice",
  "premium quality",
];

const PROMOTIONAL_WORDS = [
  "premium",
  "magical",
  "advanced",
  "ultimate",
  "perfect",
  "flawless",
  "transform",
  "transformed",
  "revolutionary",
  "best",
  "awesome",
];

const POSITIVE_WORDS = [
  "good",
  "great",
  "excellent",
  "amazing",
  "best",
  "comfortable",
  "quick",
  "bright",
  "useful",
  "sturdy",
  "fine",
  "saved",
  "works",
  "premium",
  "recommended",
  "love",
  "smooth",
];

const NEGATIVE_WORDS = [
  "bad",
  "weak",
  "loose",
  "stopped",
  "broken",
  "disconnecting",
  "hot",
  "heats",
  "buzzing",
  "muffled",
  "drains",
  "irritated",
  "red",
  "leaked",
  "warning",
  "not",
  "slow",
  "scratch",
  "smell",
  "stings",
  "worries",
  "overstated",
];

const DEFECT_WORDS = [
  "stopped",
  "loose",
  "weak",
  "broke",
  "broken",
  "disconnect",
  "disconnecting",
  "drops",
  "hot",
  "heats",
  "buzzing",
  "muffled",
  "drains",
  "irritated",
  "leaked",
  "scratch",
  "scratches",
  "warning",
  "opened",
  "catches",
  "stings",
  "loses",
  "loose",
];

const TIME_RE = /\b(\d+\s*(?:day|days|week|weeks|month|months|minute|minutes|hour|hours)|one\s+(?:day|week|month)|two\s+(?:days|weeks|months)|three\s+(?:days|weeks|months)|after\s+\w+|for\s+\w+\s+(?:days|weeks|months))\b/i;
const MEASURE_RE = /\b(\d+(\.\d+)?\s?(?:w|watts|mah|hours?|hrs?|minutes?|mins?|days?|weeks?|months?|%|inch|inches|liter|litre|bpm|meter|m|mm|cm)|[0-9]+w)\b/i;
const COMPAT_RE = /\b(macbook|iphone|android|pixel|samsung|ipad|lenovo|hp|dell|ios|usb-c|laptop|phone|15\.6|16 inch)\b/i;
const DELIVERY_RE = /\b(delivery|box|packaging|arrived|return|replacement|window|damaged|wrong item)\b/i;
const SETUP_RE = /\b(pairing|paired|setup|install|app|bluetooth|permission|connected|connects|sync)\b/i;
const COMPARISON_RE = /\b(compared|than my old|versus|better than|worse than|compared with)\b/i;
const MEDIA_RE = /\b(photo|video|image|manual|box|in the box|unboxing)\b/i;
const BEFORE_AFTER_RE = /\b(after|before|first|then|later|from .* to|dropped from)\b/i;

const ISSUE_TAXONOMY: Record<string, string[]> = {
  "Battery or charging drops": ["battery", "charging", "charge", "drains", "backup", "case", "usb-c", "port"],
  "Heating or electrical safety": ["hot", "heats", "warm", "temperature", "buzzing", "overnight", "socket"],
  "Mic or call quality": ["mic", "voice", "call", "muffled", "traffic", "outdoor"],
  "Sound or ANC mismatch": ["sound", "anc", "noise", "cancelling", "metro", "fan"],
  "Connectivity or app sync": ["pairing", "bluetooth", "sync", "app", "notifications", "disconnect"],
  "Size, fit, or comfort": ["fit", "tips", "strap", "wrist", "comfortable", "size"],
  "Zipper, stitching, or material": ["zipper", "stitching", "strap", "fabric", "seam", "pocket", "holder"],
  "Compatibility warning": ["compatible", "compatibility", "macbook", "laptop", "iphone", "android", "slow charger"],
  "Packaging, delivery, or return": ["packaging", "box", "leaked", "return", "replacement", "wrong item", "damaged"],
  "Skin irritation or smell": ["skin", "irritated", "red", "bumps", "smell", "scent", "stings", "fragrance"],
  "Unsupported performance claim": ["claim", "says", "listing", "medical", "100w", "noise cancelling", "safe"],
  "Camera, display, or sensor claim": ["camera", "display", "fingerprint", "sensor", "green tint", "dpi"],
  "Desk hardware stability": ["wobble", "unstable", "hinge", "pad", "typing", "sliding", "bent"],
  "Port, cable, or connector failure": ["usb-c", "port", "cable", "connector", "loose", "disconnect"],
  "Software or setup friction": ["software", "app", "antivirus", "setup", "reinstalling"],
  "Wireless charging issue": ["wireless charging", "wireless charger", "detecting", "case", "starting and stopping"],
};

const HIGH_SEVERITY_ISSUES = new Set([
  "Battery or charging drops",
  "Heating or electrical safety",
  "Skin irritation or smell",
  "Packaging, delivery, or return",
]);

const GHOST_TERMS_BY_CATEGORY: Record<string, string[]> = {
  charger: ["pillow", "fabric", "zipper", "bedsheet", "mattress", "queen", "skin", "serum", "dress", "shampoo"],
  earbuds: ["pillow", "bedsheet", "mattress", "zipper", "serum", "skin", "queen", "dress"],
  smartwatch: ["pillow", "bedsheet", "charger brick", "serum", "zipper", "fabric soft", "shampoo"],
  backpack: ["serum", "earbud", "anc", "smartwatch", "vitamin"],
  skincare: ["charger", "usb-c", "laptop", "earbud", "backpack", "zipper", "macbook"],
  smartphone: ["pillow", "bedsheet", "zipper", "serum", "lamp", "mouse", "backpack"],
  stand: ["serum", "skin", "earbud", "camera", "shampoo"],
  powerbank: ["serum", "skin", "zipper", "bedsheet", "mousepad"],
  mouse: ["serum", "skin", "bedsheet", "charger brick", "lamp head"],
  lamp: ["serum", "skin", "gaming mouse", "backpack", "earbud"],
};

interface SharedReviewSignals {
  tokens: string[][];
  repeatedPhraseMap: Map<string, number>;
  similarIds: Map<string, string[]>;
  dateCounts: Map<string, number>;
}

function textOf(review: Review) {
  return `${review.title} ${review.body}`;
}

function buildSharedSignals(reviews: Review[]): SharedReviewSignals {
  const tokens = reviews.map((review) => tokenize(textOf(review)));
  const repeatedPhraseMap = new Map<string, number>();
  const dateCounts = new Map<string, number>();

  reviews.forEach((review, index) => {
    ngrams(tokens[index], 3).forEach((phrase) => {
      repeatedPhraseMap.set(phrase, (repeatedPhraseMap.get(phrase) || 0) + 1);
    });
    if (review.date) dateCounts.set(review.date, (dateCounts.get(review.date) || 0) + 1);
  });

  const similarIds = new Map<string, string[]>();
  reviews.forEach((review, index) => {
    const matches: string[] = [];
    reviews.forEach((candidate, candidateIndex) => {
      if (review.id === candidate.id) return;
      const score = jaccard(tokens[index], tokens[candidateIndex]);
      if (score >= 0.44) matches.push(candidate.id);
    });
    similarIds.set(review.id, matches);
  });

  return { tokens, repeatedPhraseMap, similarIds, dateCounts };
}

function detectSentiment(text: string): { sentiment: Sentiment; positive: number; negative: number } {
  const tokens = tokenize(text);
  const positive = tokens.filter((token) => POSITIVE_WORDS.includes(token)).length;
  const negative = tokens.filter((token) => NEGATIVE_WORDS.includes(token)).length;

  if (positive >= 2 && negative >= 2) return { sentiment: "Mixed", positive, negative };
  if (negative > positive) return { sentiment: "Negative", positive, negative };
  if (positive > negative) return { sentiment: "Positive", positive, negative };
  return { sentiment: "Neutral", positive, negative };
}

function productKeywordHits(product: ProductDemo, text: string) {
  const productTerms = uniqueTokens(
    `${product.title} ${product.category} ${product.tags.join(" ")} ${product.sellerClaims.join(" ")} ${product.bullets.join(" ")}`,
  );
  const reviewTokens = new Set(tokenize(text));
  return productTerms.filter((token) => reviewTokens.has(token));
}

function genericPhrasesIn(text: string) {
  const normalized = text.toLowerCase();
  return GENERIC_PHRASES.filter((phrase) => normalized.includes(phrase));
}

function promotionalDensity(text: string) {
  const tokens = tokenize(text);
  if (!tokens.length) return 0;
  return tokens.filter((token) => PROMOTIONAL_WORDS.includes(token)).length / tokens.length;
}

function productNameRepeats(product: ProductDemo, text: string) {
  const titleTokens = uniqueTokens(product.title).filter((token) => token.length > 4);
  const reviewTokens = tokenize(text);
  const counts = titleTokens.map((token) => reviewTokens.filter((reviewToken) => reviewToken === token).length);
  return Math.max(0, ...counts);
}

function mismatchTerms(product: ProductDemo, text: string) {
  const category = product.category.toLowerCase();
  const key =
    category.includes("charger") ? "charger" :
    category.includes("earbud") ? "earbuds" :
    category.includes("watch") ? "smartwatch" :
    category.includes("smartphone") ? "smartphone" :
    category.includes("stand") ? "stand" :
    category.includes("power bank") ? "powerbank" :
    category.includes("mouse") ? "mouse" :
    category.includes("lamp") ? "lamp" :
    category.includes("backpack") ? "backpack" :
    category.includes("skin") || category.includes("serum") ? "skincare" :
    "";
  if (!key) return [];
  const normalized = text.toLowerCase();
  return GHOST_TERMS_BY_CATEGORY[key].filter((term) => normalized.includes(term));
}

function listingEchoScore(product: ProductDemo, text: string) {
  const textTokens = uniqueTokens(text);
  const claimTokens = uniqueTokens(`${product.sellerClaims.join(" ")} ${product.bullets.join(" ")}`);
  const overlap = jaccard(textTokens, claimTokens);
  const exactClaimHit = product.sellerClaims.some((claim) => {
    const core = claim
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 4)
      .slice(0, 4)
      .join(" ");
    return core && text.toLowerCase().includes(core);
  });
  return exactClaimHit ? Math.max(overlap, 0.36) : overlap;
}

function pushFlag(flags: ReviewFlag[], label: string, explanation: string, severity: ReviewFlag["severity"]) {
  flags.push({ label, explanation, severity });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsKeyword(text: string, keyword: string) {
  const pattern = escapeRegExp(keyword).replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${pattern}\\b`, "i").test(text);
}

function analyzeReview(
  product: ProductDemo,
  review: Review,
  index: number,
  shared: SharedReviewSignals,
): ReviewAnalysis {
  const text = textOf(review);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const flags: ReviewFlag[] = [];
  const evidence: string[] = [];
  const similarReviewIds = shared.similarIds.get(review.id) || [];
  const repeatedPhrases = ngrams(shared.tokens[index], 3)
    .filter((phrase) => (shared.repeatedPhraseMap.get(phrase) || 0) > 1)
    .slice(0, 5);
  const genericPhrases = genericPhrasesIn(text);
  const mismatches = mismatchTerms(product, text);
  const hits = productKeywordHits(product, text);
  const { sentiment, positive, negative } = detectSentiment(text);
  const echoScore = listingEchoScore(product, text);
  const promoDensity = promotionalDensity(text);
  const repeatCount = productNameRepeats(product, text);
  const sameDateCount = review.date ? shared.dateCounts.get(review.date) || 0 : 0;
  const defectHits = DEFECT_WORDS.filter((word) => text.toLowerCase().includes(word));

  let grounding = 12;
  if (TIME_RE.test(text)) {
    grounding += 13;
    evidence.push("Mentions a timeframe of use.");
  }
  if (MEASURE_RE.test(text)) {
    grounding += 11;
    evidence.push("Includes a number, measurement, or duration.");
  }
  if (hits.length) {
    grounding += Math.min(22, hits.length * 5);
    evidence.push(`Mentions product-specific detail: ${hits.slice(0, 4).join(", ")}.`);
  }
  if (defectHits.length) {
    grounding += 13;
    evidence.push(`Names a concrete defect or experience: ${Array.from(new Set(defectHits)).slice(0, 3).join(", ")}.`);
  }
  if (COMPAT_RE.test(text)) {
    grounding += 8;
    evidence.push("Mentions compatibility or a specific device.");
  }
  if (DELIVERY_RE.test(text)) {
    grounding += 6;
    evidence.push("Mentions delivery, box, return, or replacement context.");
  }
  if (SETUP_RE.test(text)) {
    grounding += 6;
    evidence.push("Mentions setup, pairing, app, or connection behavior.");
  }
  if (COMPARISON_RE.test(text)) {
    grounding += 7;
    evidence.push("Compares against another product or baseline.");
  }
  if (MEDIA_RE.test(text)) {
    grounding += 5;
    evidence.push("Mentions media, manual, or box evidence.");
  }
  if (BEFORE_AFTER_RE.test(text)) {
    grounding += 6;
    evidence.push("Describes a before/after or change over time.");
  }
  if (words.length > 38) grounding += 7;
  if (review.verified) grounding += 5;
  if (review.date) grounding += 2;

  let suspicion = 8;
  if (genericPhrases.length) {
    suspicion += 22;
    pushFlag(
      flags,
      "Generic praise",
      `Uses low-evidence praise such as "${genericPhrases[0]}".`,
      genericPhrases.length > 1 ? "medium" : "low",
    );
  }
  if (promoDensity > 0.11) {
    suspicion += 11;
    pushFlag(flags, "Promotional wording", "Language leans polished or marketing-like without much buyer context.", "medium");
  }
  if (repeatedPhrases.length) {
    suspicion += 16;
    pushFlag(flags, "Repeated phrase cluster", `Shares repeated wording with other reviews: "${repeatedPhrases[0]}".`, "medium");
  }
  if (similarReviewIds.length) {
    suspicion += 14;
    pushFlag(flags, "Near-duplicate structure", "Token overlap suggests this review resembles other reviews in the set.", "medium");
  }
  if (mismatches.length) {
    suspicion += 58;
    pushFlag(flags, "Possible ghost review", `Mentions terms that do not fit this product: ${mismatches.slice(0, 3).join(", ")}.`, "high");
  }
  if (review.rating >= 5 && words.length < 14) {
    suspicion += 18;
    pushFlag(flags, "Extreme rating with little detail", "A five-star review gives very little product-specific evidence.", "medium");
  }
  if (review.rating <= 1 && words.length < 16) {
    suspicion += 14;
    pushFlag(flags, "Low rating with little detail", "A one-star review gives limited evidence for the complaint.", "low");
  }
  if (review.rating >= 4 && (sentiment === "Negative" || (sentiment === "Mixed" && negative > positive))) {
    suspicion += 20;
    pushFlag(flags, "Sentiment-star mismatch", "The text contains negative signals that conflict with a high star rating.", "medium");
  }
  if (review.rating <= 2 && sentiment === "Positive") {
    suspicion += 18;
    pushFlag(flags, "Sentiment-star mismatch", "The text sounds positive despite a low star rating.", "medium");
  }
  if (!review.verified) {
    suspicion += 5;
    pushFlag(flags, "Verification unavailable", "Missing verified-purchase context is a weak risk signal, not proof of a problem.", "low");
  }
  if (sameDateCount >= 3 && review.rating >= 4 && (genericPhrases.length || repeatedPhrases.length)) {
    suspicion += 12;
    pushFlag(flags, "Review burst signal", "Multiple positive reviews with similar signals appeared on the same date.", "medium");
  }
  if (echoScore > 0.33 && grounding < 58) {
    suspicion += 13;
    pushFlag(flags, "Listing echo", "The review appears to mirror seller-copy terms more than lived product use.", "medium");
  }
  if (repeatCount >= 3) {
    suspicion += 8;
    pushFlag(flags, "Keyword stuffing", "The product name or core product terms are repeated unusually often.", "low");
  }

  const productMatch = mismatches.length ? 0 : clamp(35 + hits.length * 13);
  const clusterOriginality = clamp(100 - repeatedPhrases.length * 12 - similarReviewIds.length * 12);
  const listingIndependence = clamp(100 - echoScore * 120);
  const starConsistency =
    (review.rating >= 4 && sentiment === "Negative") || (review.rating <= 2 && sentiment === "Positive") ? 35 : 92;
  const timingCredibility = clamp((review.verified ? 78 : 58) + (review.date ? 8 : 0) - (sameDateCount >= 3 ? 15 : 0));
  const languageNaturalness = clamp(94 - genericPhrases.length * 13 - promoDensity * 80 - repeatCount * 3);
  const groundednessScore = clamp(grounding - genericPhrases.length * 5 - mismatches.length * 16);

  let trustScore = clamp(
    groundednessScore * 0.25 +
      productMatch * 0.2 +
      clusterOriginality * 0.15 +
      listingIndependence * 0.15 +
      starConsistency * 0.1 +
      timingCredibility * 0.1 +
      languageNaturalness * 0.05,
  );

  if (mismatches.length) trustScore = Math.min(trustScore, 24);
  if (words.length < 8 && !mismatches.length) trustScore = Math.min(trustScore, 52);

  const suspicionScore = clamp(Math.max(suspicion, 100 - trustScore + genericPhrases.length * 2));
  let category: ReviewCategory = "Unclear";
  if (mismatches.length && suspicionScore >= 65) category = "Ghost";
  else if (trustScore >= 65 && groundednessScore >= 42) category = "Grounded";
  else if (suspicionScore >= 58 && groundednessScore < 42) category = "Suspicious";

  const detailQuality = groundednessScore >= 68 ? "High" : groundednessScore >= 38 ? "Medium" : "Low";
  const riskLevel = suspicionScore >= 68 || category === "Ghost" ? "High" : suspicionScore >= 42 ? "Medium" : "Low";

  if (!flags.length && category === "Grounded") {
    pushFlag(flags, "Grounded buyer evidence", "Review contains concrete product-use details and does not resemble nearby review noise.", "low");
  }

  return {
    review,
    suspicionScore: Math.round(suspicionScore),
    groundednessScore: Math.round(groundednessScore),
    trustScore: Math.round(trustScore),
    category,
    sentiment,
    detailQuality,
    riskLevel,
    flags,
    evidence: evidence.slice(0, 5),
    similarReviewIds,
    repeatedPhrases,
  };
}

function timeframeFrom(text: string) {
  const match = text.match(TIME_RE);
  return match?.[0];
}

function extractIssueMap(reviewAnalyses: ReviewAnalysis[]): IssueCluster[] {
  const sourceReviews = reviewAnalyses.filter(
    (item) => item.category === "Grounded" || (item.category === "Unclear" && item.trustScore >= 58),
  );
  const issueBuckets = new Map<string, { reviews: ReviewAnalysis[]; snippets: string[]; timeframes: string[] }>();

  sourceReviews.forEach((analysis) => {
    const text = `${analysis.review.title} ${analysis.review.body}`.toLowerCase();
    const shouldUse = analysis.sentiment === "Negative" || analysis.sentiment === "Mixed" || analysis.review.rating <= 3;
    if (!shouldUse) return;

    Object.entries(ISSUE_TAXONOMY).forEach(([issue, keywords]) => {
      if (!keywords.some((keyword) => containsKeyword(text, keyword))) return;
      const bucket = issueBuckets.get(issue) || { reviews: [], snippets: [], timeframes: [] };
      bucket.reviews.push(analysis);
      bucket.snippets.push(sentenceSnippet(analysis.review.body, 135));
      const timeframe = timeframeFrom(analysis.review.body);
      if (timeframe) bucket.timeframes.push(timeframe);
      issueBuckets.set(issue, bucket);
    });
  });

  return Array.from(issueBuckets.entries())
    .map(([issue, bucket]) => {
      const count = new Set(bucket.reviews.map((item) => item.review.id)).size;
      const severity = HIGH_SEVERITY_ISSUES.has(issue) && count >= 1 ? "High" : count >= 3 ? "High" : count >= 2 ? "Medium" : "Low";
      const timeframe = bucket.timeframes[0];
      return {
        issue,
        count,
        severity,
        timeframe,
        snippets: Array.from(new Set(bucket.snippets)).slice(0, 3),
        buyerWarning:
          severity === "High"
            ? `Do not trust the star rating alone. Check ${issue.toLowerCase()} complaints before buying.`
            : `Worth checking if this issue matters for your use case.`,
      } satisfies IssueCluster;
    })
    .sort((a, b) => {
      const severityWeight = { High: 3, Medium: 2, Low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity] || b.count - a.count;
    })
    .slice(0, 8);
}

function analyzeClaims(product: ProductDemo, reviews: ReviewAnalysis[]): ClaimSignal[] {
  return product.sellerClaims.map((claim) => {
    const claimTokens = uniqueTokens(claim).filter((token) => token.length > 3);
    const groundedMentions = reviews.filter((analysis) => {
      const text = textOf(analysis.review).toLowerCase();
      return analysis.category === "Grounded" && claimTokens.some((token) => text.includes(token));
    });
    const contradictionSnippets = reviews
      .filter((analysis) => {
        const text = textOf(analysis.review).toLowerCase();
        return (
          claimTokens.some((token) => text.includes(token)) &&
          (text.includes("not") || text.includes("weak") || text.includes("overstated") || text.includes("worries") || text.includes("off"))
        );
      })
      .map((analysis) => sentenceSnippet(analysis.review.body, 135))
      .slice(0, 3);

    let status: ClaimSignal["status"] = "Unsupported";
    if (contradictionSnippets.length) status = "Contradicted";
    else if (groundedMentions.length >= 2) status = "Supported";
    else if (groundedMentions.length === 1) status = "Weakly supported";

    return {
      claim,
      status,
      groundedMentions: groundedMentions.length,
      contradictionSnippets,
      explanation:
        status === "Supported"
          ? "Multiple grounded reviews mention this claim area."
          : status === "Weakly supported"
            ? "Only one grounded review appears to support this claim."
            : status === "Contradicted"
              ? "Grounded buyer text raises friction with this claim."
              : "No strong grounded review support was found in the review set.",
    };
  });
}

function analyzeQA(product: ProductDemo): QAQualitySignal[] {
  return (product.qa || []).map((qa) => {
    const answer = qa.answer.toLowerCase();
    const question = qa.question.toLowerCase();
    const asksYesNo = /^(does|do|can|will|is|are|has|have)\b/.test(question);
    const generic = ["as per", "premium", "all compatible", "specification", "best", "advanced"].some((term) =>
      answer.includes(term),
    );
    const avoidsYesNo = asksYesNo && !/\b(yes|no|fits|does not|do not|cannot|can)\b/.test(answer);
    const risk = generic && avoidsYesNo ? "High" : generic || avoidsYesNo ? "Medium" : "Low";
    return {
      question: qa.question,
      answer: qa.answer,
      risk,
      reason:
        risk === "High"
          ? "Answer repeats broad seller language and avoids the compatibility question."
          : risk === "Medium"
            ? "Answer is partially useful but still generic."
            : "Answer provides direct buyer-use context.",
    };
  });
}

function buildPatternInsights(
  reviews: ReviewAnalysis[],
  issueMap: IssueCluster[],
  claimSignals: ClaimSignal[],
  repetitionScore: number,
): PatternInsight[] {
  const total = reviews.length || 1;
  const grounded = reviews.filter((item) => item.category === "Grounded").length;
  const suspicious = reviews.filter((item) => item.category === "Suspicious").length;
  const ghost = reviews.filter((item) => item.category === "Ghost").length;
  const genericReviews = reviews.filter((item) => item.flags.some((flag) => flag.label === "Generic praise")).length;
  const burstReviews = reviews.filter((item) => item.flags.some((flag) => flag.label === "Review burst signal")).length;
  const contradictedClaims = claimSignals.filter((claim) => claim.status === "Contradicted").length;

  return [
    {
      title: "Grounded buyer evidence",
      value: `${percent(grounded, total)}%`,
      detail: `${grounded} of ${total} reviews include concrete product-use signals.`,
      tone: grounded / total >= 0.5 ? "good" : "watch",
    },
    {
      title: "Suspicious review noise",
      value: `${percent(suspicious, total)}%`,
      detail: `${suspicious} reviews look generic, repeated, promotional, or low-evidence.`,
      tone: suspicious / total >= 0.35 ? "risk" : "watch",
    },
    {
      title: "Possible ghost reviews",
      value: `${ghost}`,
      detail: ghost ? "Some reviews appear to discuss another product category." : "No strong product-mismatch signal found.",
      tone: ghost ? "risk" : "good",
    },
    {
      title: "Repeated wording",
      value: `${repetitionScore}/100`,
      detail: genericReviews || burstReviews ? "Repeated praise and burst timing are visible in the review set." : "No major copy-pattern cluster dominates the review set.",
      tone: repetitionScore > 45 ? "risk" : repetitionScore > 22 ? "watch" : "good",
    },
    {
      title: "Real buyer issue map",
      value: `${issueMap.length}`,
      detail: issueMap.length ? "Issues were extracted only from grounded or high-confidence review text." : "No repeated grounded buyer issues found.",
      tone: issueMap.some((issue) => issue.severity === "High") ? "risk" : "info",
    },
    {
      title: "Unsupported claims",
      value: `${claimSignals.filter((claim) => claim.status === "Unsupported" || claim.status === "Contradicted").length}`,
      detail: contradictedClaims ? "At least one seller claim is contradicted by buyer evidence." : "Some claims lack strong support in grounded reviews.",
      tone: contradictedClaims ? "risk" : "watch",
    },
  ];
}

function categoryCounts(reviews: ReviewAnalysis[]) {
  return reviews.reduce<Record<ReviewCategory, number>>(
    (acc, item) => {
      acc[item.category] += 1;
      return acc;
    },
    { Grounded: 0, Suspicious: 0, Ghost: 0, Unclear: 0 },
  );
}

function sentimentCounts(reviews: ReviewAnalysis[]) {
  return reviews.reduce<Record<Sentiment, number>>(
    (acc, item) => {
      acc[item.sentiment] += 1;
      return acc;
    },
    { Positive: 0, Neutral: 0, Negative: 0, Mixed: 0 },
  );
}

function confidenceFor(reviewCount: number) {
  if (reviewCount >= 10) return "High";
  if (reviewCount >= 5) return "Medium";
  return "Low";
}

function verdict(score: number, ghostPct: number) {
  if (score >= 78 && ghostPct < 8) return "Low review-risk" as const;
  if (score >= 50) return "Mixed review signals" as const;
  return "High review-risk" as const;
}

export function analyzeProduct(product: ProductDemo): ProductAnalysis {
  const shared = buildSharedSignals(product.reviews);
  const reviews = product.reviews.map((review, index) => analyzeReview(product, review, index, shared));
  const counts = categoryCounts(reviews);
  const sentiments = sentimentCounts(reviews);
  const total = reviews.length || 1;
  const averageSuspicion = Math.round(reviews.reduce((sum, item) => sum + item.suspicionScore, 0) / total);
  const averageGroundedness = Math.round(reviews.reduce((sum, item) => sum + item.groundednessScore, 0) / total);
  const repetitionScore = clamp(
    Math.round(
      reviews.reduce((sum, item) => sum + item.repeatedPhrases.length * 8 + item.similarReviewIds.length * 10, 0) / total,
    ),
  );
  const reviewDetailQuality = clamp(averageGroundedness);
  const issueMap = extractIssueMap(reviews);
  const claimSignals = analyzeClaims(product, reviews);
  const qaSignals = analyzeQA(product);
  const unsupportedClaimCount = claimSignals.filter(
    (claim) => claim.status === "Unsupported" || claim.status === "Contradicted",
  ).length;
  const qaRiskScore = qaSignals.reduce((sum, qa) => sum + (qa.risk === "High" ? 30 : qa.risk === "Medium" ? 15 : 4), 0);
  const highIssues = issueMap.filter((issue) => issue.severity === "High").length;
  const mediumIssues = issueMap.filter((issue) => issue.severity === "Medium").length;
  const issuePenalty = clamp(highIssues * 18 + mediumIssues * 8 + issueMap.length * 3);
  const groundedPct = percent(counts.Grounded, total);
  const suspiciousPct = percent(counts.Suspicious, total);
  const ghostPct = percent(counts.Ghost, total);
  const suspiciousClusterPenalty = clamp(suspiciousPct * 0.65 + repetitionScore * 0.35);
  const ghostPenalty = clamp(ghostPct * 1.25);
  const trustScore = Math.round(
    clamp(
      groundedPct * 0.4 +
        (100 - issuePenalty) * 0.25 +
        (100 - suspiciousClusterPenalty) * 0.2 +
        (100 - ghostPenalty) * 0.15 -
        unsupportedClaimCount * 3 -
        qaRiskScore * 0.08,
    ),
  );
  const finalVerdict = verdict(trustScore, ghostPct);
  const patternInsights = buildPatternInsights(reviews, issueMap, claimSignals, repetitionScore);

  const summary =
    product.reviews.length < 3
      ? "There is not enough review data for a confident product-level pattern read. Paste more reviews for a stronger signal."
      : finalVerdict === "Low review-risk"
      ? "Most review evidence looks grounded, with manageable suspicious noise."
      : finalVerdict === "Mixed review signals"
        ? "The product has useful buyer evidence, but suspicious review noise should be separated from real issues."
        : "The review set contains heavy trust noise, product mismatch, repeated low-detail praise, or unsupported claims.";

  return {
    product,
    reviews,
    trustScore,
    averageSuspicion,
    averageGroundedness,
    categoryCounts: counts,
    sentimentCounts: sentiments,
    repetitionScore,
    reviewDetailQuality,
    unsupportedClaimCount,
    qaRiskScore,
    confidence: confidenceFor(product.reviews.length),
    finalVerdict: product.reviews.length < 3 ? "Not enough review data" : finalVerdict,
    summary,
    issueMap,
    claimSignals,
    qaSignals,
    patternInsights,
  };
}
