import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clipboard,
  Download,
  FileWarning,
  Flag,
  Info,
  ListChecks,
  MessageSquareText,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProductAnalysis, ReviewAnalysis } from "../types";
import { CategoryPill, Pill, VerdictPill } from "./Badges";
import { ProductVisual } from "./ProductVisual";
import { ScoreRing } from "./ScoreRing";
import { buildReportSummary } from "../lib/report";

const categoryColors: Record<string, string> = {
  Grounded: "#5ff1c8",
  Suspicious: "#ffcf66",
  Ghost: "#ff6f91",
  Unclear: "#b8c2d6",
};

const sentimentColors: Record<string, string> = {
  Positive: "#5ff1c8",
  Neutral: "#b8c2d6",
  Negative: "#ff6f91",
  Mixed: "#ffcf66",
};

const tabs = [
  { id: "receipt", label: "Trust Receipt", icon: ShieldCheck },
  { id: "issues", label: "Buyer Issues", icon: ListChecks },
  { id: "reviews", label: "Review X-Ray", icon: Radar },
  { id: "claims", label: "Claims + Q&A", icon: FileWarning },
] as const;

type TabId = (typeof tabs)[number]["id"];

function MetricCard({
  label,
  value,
  detail,
  tone = "info",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "good" | "watch" | "risk" | "info";
}) {
  const toneClass = {
    good: "text-ghost-mint",
    watch: "text-ghost-amber",
    risk: "text-ghost-rose",
    info: "text-ghost-cyan",
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/62">{detail}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink/95 px-3 py-2 text-xs text-white shadow-soft">
      <p className="font-medium">{label || payload[0].name}</p>
      <p className="text-white/65">{payload[0].value}</p>
    </div>
  );
}

function ReviewCard({ analysis }: { analysis: ReviewAnalysis }) {
  const topFlag = analysis.flags[0];
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <CategoryPill category={analysis.category} />
            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                analysis.riskLevel === "High"
                  ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
                  : analysis.riskLevel === "Medium"
                    ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                    : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
              }`}
            >
              {analysis.riskLevel} risk
            </span>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              {analysis.detailQuality} detail
            </span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
              {analysis.review.rating} star
            </span>
            {analysis.review.verified === true ? (
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                Verified context
              </span>
            ) : null}
          </div>
          <h4 className="text-base font-semibold text-white">{analysis.review.title}</h4>
          <p className="mt-1 text-xs text-white/45">
            {analysis.review.reviewer}
            {analysis.review.date ? ` · ${analysis.review.date}` : ""}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right text-xs">
          <div className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">
            <p className="text-white/45">Risk</p>
            <p className="text-lg font-semibold text-ghost-amber">{analysis.suspicionScore}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">
            <p className="text-white/45">Grounded</p>
            <p className="text-lg font-semibold text-ghost-mint">{analysis.groundednessScore}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/72">{analysis.review.body}</p>
      {topFlag ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/18 p-3">
          <div className="flex items-start gap-2">
            <Flag className="mt-0.5 h-4 w-4 text-ghost-amber" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">{topFlag.label}</p>
              <p className="mt-1 text-sm leading-5 text-white/62">{topFlag.explanation}</p>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {analysis.flags.slice(1, 4).map((flag) => (
          <span key={flag.label} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/62">
            {flag.label}
          </span>
        ))}
        {analysis.repeatedPhrases.slice(0, 2).map((phrase) => (
          <span key={phrase} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
            "{phrase}"
          </span>
        ))}
      </div>
    </article>
  );
}

function exportAnalysis(analysis: ProductAnalysis) {
  const payload = {
    product: {
      title: analysis.product.title,
      platform: analysis.product.platform,
      category: analysis.product.category,
    },
    trustScore: analysis.trustScore,
    verdict: analysis.finalVerdict,
    categoryCounts: analysis.categoryCounts,
    issueMap: analysis.issueMap,
    claimSignals: analysis.claimSignals,
    generatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ghostcart-trust-receipt.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function printReport() {
  window.print();
}

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back below for browsers or automated sessions that block Clipboard API writes.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function ReportSummary({
  analysis,
  onClose,
}: {
  analysis: ProductAnalysis;
  onClose: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const report = buildReportSummary(analysis);

  async function copyReport() {
    const copied = await copyText(report);
    setCopyStatus(copied ? "copied" : "failed");
    window.setTimeout(() => setCopyStatus("idle"), 1800);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="premium-panel max-h-[86vh] w-full max-w-3xl overflow-auto rounded-lg p-5 shadow-glow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ghost-mint">Report summary</p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-white">Shareable GhostCart receipt</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Clean judge-friendly summary generated from the current analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
        <pre className="mt-5 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/28 p-4 text-sm leading-6 text-white/78">
          {report}
        </pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyReport}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ghost-mint px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white"
          >
            <Clipboard className="h-4 w-4" aria-hidden="true" />
            {copyStatus === "copied" ? "Copied" : copyStatus === "failed" ? "Copy failed" : "Copy Report"}
          </button>
          <button
            type="button"
            onClick={printReport}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <FileWarning className="h-4 w-4" aria-hidden="true" />
            Print Report
          </button>
          <button
            type="button"
            onClick={() => exportAnalysis(analysis)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}

export function AnalysisDashboard({
  analysis,
  onBack,
}: {
  analysis: ProductAnalysis;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("receipt");
  const [showReport, setShowReport] = useState(false);
  const generatedAt = useMemo(() => new Date().toLocaleString(), [analysis.product.id]);
  const analysisMode = analysis.product.analysisMode || (analysis.product.id.startsWith("manual-") ? "User-provided reviews" : "Sample analysis");
  const splitData = useMemo(
    () =>
      Object.entries(analysis.categoryCounts).map(([name, value]) => ({
        name,
        value,
      })),
    [analysis],
  );
  const sentimentData = useMemo(
    () =>
      Object.entries(analysis.sentimentCounts).map(([name, value]) => ({
        name,
        value,
      })),
    [analysis],
  );
  const suspiciousReviews = analysis.reviews.filter((item) => item.category === "Suspicious" || item.category === "Ghost");
  const totalReviews = Math.max(analysis.reviews.length, 1);
  const suspiciousPct = Math.round(((analysis.categoryCounts.Suspicious + analysis.categoryCounts.Ghost) / totalReviews) * 100);
  const humanLikePct = Math.round((analysis.categoryCounts.Grounded / totalReviews) * 100);

  useEffect(() => {
    setActiveTab("receipt");
  }, [analysis.product.id]);

  return (
    <section id="analysis" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {showReport ? <ReportSummary analysis={analysis} onClose={() => setShowReport(false)} /> : null}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/10"
        >
          Analyze another product
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ghost-mint"
          >
            <Clipboard className="h-4 w-4" aria-hidden="true" />
            Report Summary
          </button>
          <button
            type="button"
            onClick={printReport}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-ghost-cyan/40 hover:bg-ghost-cyan/10"
          >
            <FileWarning className="h-4 w-4" aria-hidden="true" />
            Print Report
          </button>
          <button
            type="button"
            onClick={() => exportAnalysis(analysis)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-ghost-cyan/40 hover:bg-ghost-cyan/10"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export JSON
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="grid gap-6 lg:sticky lg:top-6 lg:self-start">
          <ProductVisual product={analysis.product} />
          <div className="glass rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill className="border-white/10 bg-white/5 text-white/70">{analysis.product.platform}</Pill>
              <VerdictPill verdict={analysis.finalVerdict} />
              <Pill className="border-cyan-300/25 bg-cyan-300/10 text-cyan-100">{analysis.confidence} confidence</Pill>
              <Pill className="border-ghost-mint/25 bg-ghost-mint/10 text-ghost-mint">{analysisMode}</Pill>
            </div>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-white">{analysis.product.title}</h2>
            <div className="mt-4 grid gap-2 text-sm text-white/62 sm:grid-cols-2">
              <p>Category: {analysis.product.category}</p>
              <p>Reviews analyzed: {analysis.reviews.length}</p>
              <p>Rating supplied: {analysis.product.rating || "Not supplied"}</p>
              <p>Generated: {generatedAt}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/64">{analysis.summary}</p>
            {analysis.product.demoNote ? (
              <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                {analysis.product.demoNote}
              </div>
            ) : null}
            <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
              This analysis flags suspicious patterns. It does not prove a review is fake.
            </div>
            <div className="mt-5 flex items-center justify-center">
              <ScoreRing score={analysis.trustScore} label="trust score" caption="GhostCart" />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="glass rounded-lg p-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-white text-ink"
                        : "border border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "receipt" ? (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard label="Overall trust" value={`${analysis.trustScore}/100`} detail="Weighted trust score across review-risk, detail, repetition, claims, and issues." tone={analysis.trustScore > 70 ? "good" : "watch"} />
                <MetricCard label="Review-risk" value={`${analysis.averageSuspicion}/100`} detail="Average suspicious-pattern score across analyzed reviews." tone={analysis.averageSuspicion > 58 ? "risk" : "watch"} />
                <MetricCard label="Human-like reviews" value={`${humanLikePct}%`} detail="Share of reviews with grounded, product-specific buyer context." tone={humanLikePct > 55 ? "good" : "watch"} />
                <MetricCard label="Suspicious reviews" value={`${suspiciousPct}%`} detail="Share flagged as suspicious or product-mismatched." tone={suspiciousPct > 35 ? "risk" : "info"} />
                <MetricCard label="Detail quality" value={`${analysis.reviewDetailQuality}/100`} detail="Usage details, limitations, product fit, measurements, and context." tone={analysis.reviewDetailQuality > 62 ? "good" : "watch"} />
                <MetricCard label="Confidence" value={analysis.confidence} detail="Based on review count, available context, and review detail density." tone={analysis.confidence === "High" ? "good" : "info"} />
              </div>
              <div className="premium-panel rounded-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-ghost-cyan">Final recommendation</p>
                    <h3 className="font-display mt-2 text-2xl font-semibold text-white">{analysis.finalVerdict}</h3>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/66">{analysis.summary}</p>
                  </div>
                  <VerdictPill verdict={analysis.finalVerdict} />
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="glass rounded-lg p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-ghost-mint" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-white">Review Trust Split</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={splitData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
                          {splitData.map((entry) => (
                            <Cell key={entry.name} fill={categoryColors[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {splitData.map((entry) => (
                      <div key={entry.name} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/70">
                        <span style={{ color: categoryColors[entry.name] }}>●</span> {entry.name}: {entry.value}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-lg p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-ghost-cyan" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-white">Sentiment Distribution</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sentimentData}>
                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis hide allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {sentimentData.map((entry) => (
                            <Cell key={entry.name} fill={sentimentColors[entry.name]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm leading-6 text-white/62">
                    Sentiment is cross-checked against star rating so glowing text with no detail, or negative text paired with high stars, becomes visible.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {analysis.patternInsights.map((insight) => (
                  <MetricCard key={insight.title} label={insight.title} value={insight.value} detail={insight.detail} tone={insight.tone} />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "issues" ? (
            <div className="grid gap-6">
              <div className="glass rounded-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-ghost-mint" aria-hidden="true" />
                      <h3 className="text-xl font-semibold text-white">Real Buyer Issue Map</h3>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                      Stop reading hundreds of reviews. GhostCart extracts repeated problems from reviews that look grounded in real product experience.
                    </p>
                  </div>
                  <Pill className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
                    Suspicious reviews excluded
                  </Pill>
                </div>
              </div>
              {analysis.issueMap.length ? (
                <div className="grid gap-4">
                  {analysis.issueMap.map((issue) => (
                    <article key={issue.issue} className="glass rounded-lg p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{issue.issue}</h4>
                          <p className="mt-1 text-sm text-white/50">
                            {issue.count} grounded mention{issue.count === 1 ? "" : "s"}
                            {issue.timeframe ? ` · common timeframe: ${issue.timeframe}` : ""}
                          </p>
                        </div>
                        <Pill
                          className={
                            issue.severity === "High"
                              ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
                              : issue.severity === "Medium"
                                ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                                : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                          }
                        >
                          {issue.severity} severity
                        </Pill>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {issue.snippets.map((snippet) => (
                          <blockquote key={snippet} className="rounded-lg border border-white/10 bg-black/18 p-3 text-sm leading-6 text-white/70">
                            "{snippet}"
                          </blockquote>
                        ))}
                      </div>
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-ghost-amber" aria-hidden="true" />
                        <p className="text-sm leading-6 text-amber-50">{issue.buyerWarning}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-white/66">
                  No repeated grounded buyer issue emerged from this review set.
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "reviews" ? (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Suspicious" value={`${analysis.categoryCounts.Suspicious}`} detail="Generic, repeated, paid-style, or low-evidence reviews." tone="watch" />
                <MetricCard label="Ghost" value={`${analysis.categoryCounts.Ghost}`} detail="Reviews that may not belong to this product." tone={analysis.categoryCounts.Ghost ? "risk" : "good"} />
                <MetricCard label="Repeated clusters" value={`${analysis.repetitionScore}/100`} detail="N-gram and token-overlap repetition across reviews." tone={analysis.repetitionScore > 45 ? "risk" : "info"} />
              </div>

              {suspiciousReviews.length ? (
                <div className="glass rounded-lg p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-ghost-amber" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-white">Suspicious Cluster Highlights</h3>
                  </div>
                  <div className="grid gap-3">
                    {suspiciousReviews.slice(0, 4).map((item) => (
                      <div key={item.review.id} className="rounded-lg border border-white/10 bg-black/18 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <CategoryPill category={item.category} />
                          <p className="text-sm font-semibold text-white">{item.review.title}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/62">{item.flags[0]?.explanation || "Review needs human checking."}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4">
                {analysis.reviews.map((review) => (
                  <ReviewCard key={review.review.id} analysis={review} />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "claims" ? (
            <div className="grid gap-6">
              <div className="glass rounded-lg p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-ghost-cyan" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white">Unsupported Seller Claims</h3>
                </div>
                <div className="grid gap-3">
                  {analysis.claimSignals.map((claim) => (
                    <div key={claim.claim} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{claim.claim}</p>
                          <p className="mt-1 text-sm leading-6 text-white/62">{claim.explanation}</p>
                        </div>
                        <Pill
                          className={
                            claim.status === "Supported"
                              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                              : claim.status === "Contradicted"
                                ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
                                : "border-amber-300/25 bg-amber-300/10 text-amber-100"
                          }
                        >
                          {claim.status}
                        </Pill>
                      </div>
                      {claim.contradictionSnippets.length ? (
                        <div className="mt-3 grid gap-2">
                          {claim.contradictionSnippets.map((snippet) => (
                            <p key={snippet} className="rounded-lg border border-rose-300/15 bg-rose-300/10 p-3 text-sm leading-6 text-rose-50">
                              "{snippet}"
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-lg p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-ghost-violet" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white">Q&A Quality Signals</h3>
                </div>
                {analysis.qaSignals.length ? (
                  <div className="grid gap-3">
                    {analysis.qaSignals.map((qa) => (
                      <div key={qa.question} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{qa.question}</p>
                            <p className="mt-2 text-sm leading-6 text-white/66">{qa.answer}</p>
                            <p className="mt-2 text-sm text-white/45">{qa.reason}</p>
                          </div>
                          <Pill
                            className={
                              qa.risk === "High"
                                ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
                                : qa.risk === "Medium"
                                  ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                                  : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                            }
                          >
                            {qa.risk} risk
                          </Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-ghost-mint" aria-hidden="true" />
                    <p className="text-sm leading-6 text-white/64">No Q&A data was included for this product.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
