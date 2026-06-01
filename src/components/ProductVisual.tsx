import type { ProductDemo } from "../types";
import { MarketplaceLogo } from "./MarketplaceLogo";

const toneClasses: Record<ProductDemo["imageTone"], string> = {
  mint: "from-emerald-300/28 via-cyan-300/12 to-slate-950",
  cyan: "from-cyan-300/26 via-sky-400/12 to-slate-950",
  amber: "from-amber-300/28 via-lime-300/10 to-slate-950",
  rose: "from-rose-300/28 via-fuchsia-300/10 to-slate-950",
  violet: "from-violet-300/28 via-cyan-300/10 to-slate-950",
};

function ProductIllustration({ category }: { category: string }) {
  const value = category.toLowerCase();
  if (value.includes("earbud")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M62 34c-18 0-32 14-32 32s14 32 32 32 32-14 32-32-14-32-32-32Z" fill="#d9fff7" />
        <path d="M158 34c-18 0-32 14-32 32s14 32 32 32 32-14 32-32-14-32-32-32Z" fill="#d9fff7" />
        <path d="M73 70h28c11 0 19 8 19 19v15c0 8-6 14-14 14H93c-11 0-20-9-20-20V70Z" fill="#6ee7d8" />
        <path d="M147 70h-28c-11 0-19 8-19 19v15c0 8 6 14 14 14h13c11 0 20-9 20-20V70Z" fill="#77d9ff" />
        <path d="M55 61c8-10 22-10 31 0" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".45" />
        <path d="M134 61c8-10 22-10 31 0" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".45" />
      </svg>
    );
  }
  if (value.includes("charger")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <rect x="56" y="36" width="92" height="82" rx="18" fill="#dff7ff" />
        <rect x="76" y="20" width="14" height="28" rx="5" fill="#7dd3fc" />
        <rect x="115" y="20" width="14" height="28" rx="5" fill="#7dd3fc" />
        <rect x="78" y="70" width="47" height="13" rx="6" fill="#0f172a" opacity=".7" />
        <path d="M148 84c27 0 28 42 0 42h-22" stroke="#67e8f9" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M126 126h-18" stroke="#e0f2fe" strokeWidth="12" strokeLinecap="round" />
      </svg>
    );
  }
  if (value.includes("watch")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <rect x="82" y="12" width="56" height="126" rx="22" fill="#302a5c" />
        <rect x="66" y="35" width="88" height="80" rx="24" fill="#e8e2ff" />
        <rect x="78" y="47" width="64" height="56" rx="18" fill="#111827" />
        <path d="M90 78c10-22 23 16 39-7" stroke="#77d9ff" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="132" cy="64" r="5" fill="#5ff1c8" />
      </svg>
    );
  }
  if (value.includes("smartphone")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <rect x="78" y="12" width="64" height="126" rx="18" fill="#dff7ff" />
        <rect x="87" y="25" width="46" height="96" rx="12" fill="#0f172a" />
        <circle cx="110" cy="129" r="5" fill="#77d9ff" />
        <circle cx="125" cy="43" r="10" fill="#5ff1c8" />
        <circle cx="125" cy="43" r="4" fill="#0f172a" />
        <path d="M95 80h31M95 94h22" stroke="#77d9ff" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      </svg>
    );
  }
  if (value.includes("laptop stand")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M55 95h110" stroke="#fde68a" strokeWidth="13" strokeLinecap="round" />
        <path d="M79 95l28-52h48" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="96" y="36" width="77" height="12" rx="5" fill="#fef3c7" />
        <path d="M85 105h70" stroke="#111827" strokeWidth="8" strokeLinecap="round" opacity=".45" />
      </svg>
    );
  }
  if (value.includes("power bank")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <rect x="58" y="37" width="96" height="76" rx="18" fill="#d9fff7" />
        <rect x="154" y="63" width="10" height="24" rx="4" fill="#d9fff7" />
        <path d="M83 76h45" stroke="#0f172a" strokeWidth="9" strokeLinecap="round" opacity=".55" />
        <path d="M131 76h5" stroke="#5ff1c8" strokeWidth="9" strokeLinecap="round" />
        <path d="M77 105c16 15 53 15 67 0" stroke="#77d9ff" strokeWidth="6" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  if (value.includes("gaming mouse")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M79 75c0-34 18-58 42-58s42 24 42 58v16c0 30-18 49-42 49S79 121 79 91V75Z" fill="#e8e2ff" />
        <path d="M121 20v47" stroke="#111827" strokeWidth="5" strokeLinecap="round" opacity=".5" />
        <path d="M95 67h52" stroke="#a78bfa" strokeWidth="7" strokeLinecap="round" />
        <circle cx="121" cy="75" r="7" fill="#5ff1c8" />
        <path d="M96 104c15 13 36 13 51 0" stroke="#77d9ff" strokeWidth="6" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  if (value.includes("study lamp")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M73 117h80" stroke="#dff7ff" strokeWidth="12" strokeLinecap="round" />
        <path d="M112 112V71l31-31" stroke="#67e8f9" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M128 28h51l-10 28h-51z" fill="#dff7ff" />
        <path d="M137 62c-8 17-17 26-34 34" stroke="#fde68a" strokeWidth="6" strokeLinecap="round" opacity=".9" />
        <circle cx="89" cy="117" r="12" fill="#5ff1c8" opacity=".75" />
      </svg>
    );
  }
  if (value.includes("shaker")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M82 30h56l-7 104H89L82 30Z" fill="#d9fff7" />
        <rect x="78" y="18" width="64" height="18" rx="8" fill="#5ff1c8" />
        <path d="M91 70h37M94 92h30" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" opacity=".45" />
        <circle cx="110" cy="116" r="10" fill="#77d9ff" opacity=".8" />
      </svg>
    );
  }
  if (value.includes("shoe")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M55 92c28-6 45-28 66-44 13 22 27 33 52 39 11 3 16 12 12 22H55V92Z" fill="#e8e2ff" />
        <path d="M70 109h112" stroke="#77d9ff" strokeWidth="10" strokeLinecap="round" />
        <path d="M106 68l29 19M94 78l29 18" stroke="#111827" strokeWidth="5" strokeLinecap="round" opacity=".45" />
      </svg>
    );
  }
  if (value.includes("book")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M58 34h58c12 0 22 10 22 22v70H80c-12 0-22-10-22-22V34Z" fill="#fde68a" />
        <path d="M138 56c0-12 10-22 22-22h22v92h-44V56Z" fill="#fef3c7" />
        <path d="M79 62h36M79 78h42M79 94h30" stroke="#111827" strokeWidth="5" strokeLinecap="round" opacity=".45" />
      </svg>
    );
  }
  if (value.includes("kitchen") || value.includes("appliance")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M83 40h72l-11 89H94L83 40Z" fill="#dff7ff" />
        <rect x="93" y="20" width="52" height="24" rx="10" fill="#77d9ff" />
        <path d="M155 58h13c15 0 15 31-2 31h-14" stroke="#dff7ff" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M104 77c10-13 24 13 36 0" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" opacity=".5" />
      </svg>
    );
  }
  if (value.includes("backpack")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <path d="M70 47c0-23 17-38 40-38s40 15 40 38v78c0 10-8 18-18 18H88c-10 0-18-8-18-18V47Z" fill="#fed7aa" />
        <path d="M83 54h54v79H83z" fill="#f59e0b" opacity=".72" />
        <path d="M92 31c5-9 31-9 36 0" stroke="#78350f" strokeWidth="8" strokeLinecap="round" fill="none" opacity=".45" />
        <path d="M70 62c-16 10-22 38-13 57" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M150 62c16 10 22 38 13 57" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" fill="none" />
        <rect x="93" y="78" width="34" height="26" rx="9" fill="#111827" opacity=".62" />
      </svg>
    );
  }
  if (value.includes("skin")) {
    return (
      <svg viewBox="0 0 220 150" className="h-full w-full drop-shadow-2xl" aria-hidden="true">
        <rect x="82" y="46" width="56" height="86" rx="16" fill="#ffe4ed" />
        <rect x="93" y="23" width="34" height="28" rx="8" fill="#fb7185" />
        <path d="M104 15h12" stroke="#ffe4ed" strokeWidth="8" strokeLinecap="round" />
        <rect x="92" y="69" width="36" height="34" rx="10" fill="#111827" opacity=".55" />
        <path d="M96 85c10-14 23 14 33-2" stroke="#fecdd3" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="150" cy="57" r="10" fill="#fda4af" opacity=".8" />
        <circle cx="64" cy="100" r="13" fill="#f9a8d4" opacity=".75" />
      </svg>
    );
  }
  return null;
}

export function ProductVisual({ product, compact = false }: { product: ProductDemo; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br ${toneClasses[product.imageTone]} ${
        compact ? "h-40" : "h-60 md:h-72"
      }`}
      aria-label={product.imageLabel}
    >
      <div className="absolute inset-0 grid-mask opacity-70" />
      <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full border border-white/10 bg-white/5 blur-sm" />
      <div className="absolute inset-x-8 top-6 h-28 md:h-36">
        <ProductIllustration category={product.category} />
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2">
            <MarketplaceLogo platform={product.platform} compact />
          </div>
          <p className="max-w-[15rem] text-lg font-semibold leading-tight text-white">{product.imageLabel}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">rating</p>
          <p className="text-lg font-semibold text-white">{product.rating}</p>
        </div>
      </div>
      <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
        Trust scan source
      </div>
    </div>
  );
}
