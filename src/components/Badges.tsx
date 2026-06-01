import type { FinalVerdict, ReviewCategory } from "../types";
import type { ReactNode } from "react";

const categoryStyles: Record<ReviewCategory, string> = {
  Grounded: "border-emerald-300/30 bg-emerald-300/12 text-emerald-100",
  Suspicious: "border-amber-300/30 bg-amber-300/12 text-amber-100",
  Ghost: "border-rose-300/35 bg-rose-300/12 text-rose-100",
  Unclear: "border-slate-300/20 bg-slate-300/10 text-slate-100",
};

const verdictStyles: Record<FinalVerdict, string> = {
  "Low review-risk": "border-emerald-300/30 bg-emerald-300/12 text-emerald-100",
  "Mixed review signals": "border-cyan-300/30 bg-cyan-300/12 text-cyan-100",
  "High review-risk": "border-rose-300/35 bg-rose-300/12 text-rose-100",
  "Not enough review data": "border-amber-300/30 bg-amber-300/12 text-amber-100",
};

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function CategoryPill({ category }: { category: ReviewCategory }) {
  return <Pill className={categoryStyles[category]}>{category}</Pill>;
}

export function VerdictPill({ verdict }: { verdict: FinalVerdict }) {
  return <Pill className={verdictStyles[verdict]}>{verdict}</Pill>;
}
