import type { ProductAnalysis } from "../types";

export function buildReportSummary(analysis: ProductAnalysis) {
  const topIssues = analysis.issueMap
    .slice(0, 3)
    .map((issue) => `${issue.issue} (${issue.count} grounded mention${issue.count === 1 ? "" : "s"})`)
    .join("; ");
  const suspiciousCount = analysis.categoryCounts.Suspicious + analysis.categoryCounts.Ghost;
  const unsupportedClaims = analysis.claimSignals.filter(
    (claim) => claim.status === "Unsupported" || claim.status === "Contradicted",
  );

  return [
    `GhostCart Trust Receipt`,
    `Product: ${analysis.product.title}`,
    `Category: ${analysis.product.category}`,
    `Platform: ${analysis.product.platform}`,
    `Analysis type: ${analysis.product.analysisMode || (analysis.product.id.startsWith("manual-") ? "User-provided reviews" : "Sample analysis")}`,
    `Reviews analyzed: ${analysis.reviews.length}`,
    `Verdict: ${analysis.finalVerdict}`,
    `Trust score: ${analysis.trustScore}/100`,
    `Review noise: ${analysis.averageSuspicion}/100`,
    `Grounded reviews: ${analysis.categoryCounts.Grounded}/${analysis.reviews.length}`,
    `Suspicious or ghost reviews: ${suspiciousCount}/${analysis.reviews.length}`,
    `Confidence: ${analysis.confidence}`,
    `Main buyer issues: ${topIssues || "No repeated grounded buyer issue emerged from this review set."}`,
    `Unsupported/contradicted claims: ${unsupportedClaims.length}`,
    `Summary: ${analysis.summary}`,
    `Note: GhostCart flags suspicious patterns and does not prove that a review is fake.`,
  ].join("\n");
}
