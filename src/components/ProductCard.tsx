import { ArrowRight, ScanLine, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { ProductAnalysis, ProductDemo } from "../types";
import { analyzeProduct } from "../lib/analysis";
import { ProductVisual } from "./ProductVisual";
import { ScoreRing } from "./ScoreRing";
import { VerdictPill } from "./Badges";
import { MarketplaceLogo } from "./MarketplaceLogo";

export function ProductCard({
  product,
  onAnalyze,
}: {
  product: ProductDemo;
  onAnalyze: (product: ProductDemo) => void;
}) {
  const analysis: ProductAnalysis = analyzeProduct(product);
  const riskTone =
    analysis.finalVerdict === "High review-risk" || analysis.finalVerdict === "Not enough review data"
      ? "text-ghost-amber"
      : "text-ghost-mint";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="premium-panel grid gap-5 rounded-lg p-4 transition duration-300 hover:-translate-y-1 hover:border-ghost-cyan/28 hover:shadow-glow"
    >
      <ProductVisual product={product} compact />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <MarketplaceLogo platform={product.platform} compact />
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              {product.analysisMode || "Sample analysis"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-white/60">
              <Star className="h-3.5 w-3.5 fill-ghost-amber text-ghost-amber" aria-hidden="true" />
              {product.rating} · {product.reviewCount.toLocaleString()} reviews
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug text-white">{product.title}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white">
              {product.price}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              {analysis.categoryCounts.Grounded} grounded reviews
            </span>
          </div>
        </div>
        <ScoreRing score={analysis.trustScore} label="trust" size="small" />
      </div>
      <div className="grid gap-3 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <VerdictPill verdict={analysis.finalVerdict} />
          <span className={`text-sm font-medium ${riskTone}`}>
            {analysis.categoryCounts.Suspicious + analysis.categoryCounts.Ghost} risky reviews flagged
          </span>
        </div>
        <p className="text-sm leading-6 text-white/66">{analysis.summary}</p>
        <button
          type="button"
          onClick={() => onAnalyze(product)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ghost-mint focus:outline-none focus:ring-2 focus:ring-ghost-mint/60"
        >
          <ScanLine className="h-4 w-4" aria-hidden="true" />
          Analyze Reviews
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  );
}
