import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleHelp,
  ClipboardList,
  FileText,
  FileUp,
  Link as LinkIcon,
  Lock,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldQuestion,
  ShoppingBag,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { Pill } from "./components/Badges";
import { ProductCard } from "./components/ProductCard";
import { ProductVisual } from "./components/ProductVisual";
import { MarketplaceLogo } from "./components/MarketplaceLogo";
import { demoProducts, winningDemoProduct } from "./data/products";
import { analyzeProduct } from "./lib/analysis";
import { createManualProduct } from "./lib/manualImport";
import { searchProductsCatalog, suggestedSearches } from "./lib/search";
import { platformFromUrl, productHintFromUrl } from "./lib/urlParser";
import type { ManualImportInput, Platform, ProductDemo } from "./types";

type EntryMode = "search" | "link" | "manual";

const supportedPlatforms: Platform[] = ["Amazon", "Flipkart", "Meesho", "Myntra", "Walmart", "Best Buy", "Other"];

const defaultManualText = `Rating: 5
Amazing product, value for money, highly recommended.

Rating: 2
Used it for two weeks. The charging case became loose and the left side stopped charging.

Rating: 4
Works fine with my phone, but the mic is weak outdoors during calls.`;

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Review Trust Split",
    copy: "See how many reviews look grounded, suspicious, ghost-like, or unclear.",
  },
  {
    icon: ClipboardList,
    title: "Real Buyer Issue Map",
    copy: "GhostCart extracts repeated buyer problems from reviews that look grounded in real experience.",
  },
  {
    icon: Zap,
    title: "Suspicious Cluster Detection",
    copy: "Find repeated phrases, paid-style praise, burst timing, and copy-paste patterns.",
  },
  {
    icon: ShieldQuestion,
    title: "Ghost Review Detection",
    copy: "Flag reviews that may not belong to the current product category.",
  },
];

const faqs = [
  {
    q: "Does GhostCart guarantee a review is fake?",
    a: "No. GhostCart flags suspicious patterns and explains the evidence. It does not make absolute accusations.",
  },
  {
    q: "Can it fetch Amazon or Flipkart reviews directly?",
    a: "GhostCart does not rely on fragile or restricted scraping. It detects the marketplace from a URL, then asks you to paste or import review text for a reliable analysis.",
  },
  {
    q: "Why do I need to paste reviews?",
    a: "Most marketplaces restrict automated review access. Pasting reviews keeps the tool reliable, transparent, and based on the exact text you want checked.",
  },
  {
    q: "Can I analyze reviews from any website?",
    a: "Yes. Use the manual analyzer for reviews from any store, marketplace, forum, or CSV/text export.",
  },
  {
    q: "What does a high review-risk score mean?",
    a: "It means the review set has patterns such as repetition, thin detail, promotional wording, product mismatch, or unsupported claims. It is a signal to inspect more carefully.",
  },
  {
    q: "What makes a review look more human?",
    a: "Specific context, usage duration, balanced pros and cons, product-specific details, and realistic limitations usually improve trust.",
  },
  {
    q: "What makes it different from a review summarizer?",
    a: "A summarizer compresses reviews. GhostCart evaluates trust signals, suspicious clusters, review mismatch, unsupported claims, and grounded buyer issues.",
  },
  {
    q: "Can sellers use this?",
    a: "Yes. Sellers can use the same signals to find low-quality review patterns, unsupported claims, and buyer issues that need clearer product copy or support.",
  },
  {
    q: "Is my data stored?",
    a: "This version runs deterministic analysis in the browser UI and does not require an account for basic use. Do not paste private or personal information into review text.",
  },
  {
    q: "Why are star ratings not enough?",
    a: "A high rating can hide repeated promotional praise, product mismatch, vague five-star text, and unresolved buyer issues. Pattern quality matters.",
  },
  {
    q: "What are the limitations?",
    a: "GhostCart surfaces evidence from pasted or sample reviews. It does not access private marketplace systems, prove intent, or replace human judgment.",
  },
];

function App() {
  const [entryMode, setEntryMode] = useState<EntryMode>("search");
  const [query, setQuery] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(supportedPlatforms);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDemo | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState("");
  const [urlNotice, setUrlNotice] = useState("");
  const [searchError, setSearchError] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualNotice, setManualNotice] = useState("");
  const [manualInput, setManualInput] = useState<ManualImportInput>({
    title: "Imported wireless earbuds",
    category: "Wireless Earbuds",
    platform: "Other",
    averageRating: "",
    sellerClaims: "Long battery life, noise cancelling calls, fast USB-C charging",
    reviewsText: defaultManualText,
  });

  const analysis = useMemo(() => (selectedProduct ? analyzeProduct(selectedProduct) : null), [selectedProduct]);
  const results = useMemo(() => searchProductsCatalog(demoProducts, query, platforms), [query, platforms]);
  const previewAnalysis = useMemo(() => analyzeProduct(winningDemoProduct), []);

  useEffect(() => {
    if (selectedProduct) {
      window.setTimeout(() => document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [selectedProduct]);

  function togglePlatform(platform: Platform) {
    setPlatforms((current) => {
      if (current.includes(platform) && current.length > 1) return current.filter((item) => item !== platform);
      if (current.includes(platform)) return current;
      return [...current, platform];
    });
  }

  function handleSearch(event?: FormEvent) {
    event?.preventDefault();
    if (!query.trim()) {
      setSearchError("Type a product name, paste a link, or choose a sample category to start the scan.");
      setSelectedProduct(null);
      return;
    }
    setSearchError("");
    setEntryMode("search");
    setHasSearched(true);
    setSelectedProduct(null);
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function quickSearch(nextQuery: string) {
    setQuery(nextQuery);
    setSearchError("");
    setEntryMode("search");
    setHasSearched(true);
    setSelectedProduct(null);
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function handleUrlScan(event: FormEvent) {
    event.preventDefault();
    setUrlError("");
    setUrlNotice("");
    const platform = platformFromUrl(urlValue);
    if (!platform) {
      setUrlError("Paste a valid http or https product URL. GhostCart will never crash or attempt fragile marketplace scraping.");
      setSelectedProduct(null);
      return;
    }
    const hint = productHintFromUrl(urlValue);
    setManualInput((current) => ({
      ...current,
      title: hint || current.title,
      platform,
    }));
    setUrlNotice(
      `Detected ${platform}. GhostCart cannot directly fetch reviews from this marketplace in your current environment. Paste reviews below and we will analyze the review-risk signals.`,
    );
    setManualNotice(`Detected ${platform} URL. Paste or import the reviews you want analyzed; no restricted scraping will be attempted.`);
    setEntryMode("manual");
    setHasSearched(false);
    setSelectedProduct(null);
    window.setTimeout(() => scrollToId("scan-panel"), 50);
  }

  function handleManualScan(event: FormEvent) {
    event.preventDefault();
    setManualError("");
    if (manualInput.reviewsText.trim().length < 20) {
      setManualError("Paste at least one review with enough text to analyze.");
      return;
    }
    setHasSearched(false);
    setSelectedProduct(createManualProduct(manualInput));
  }

  async function handleReviewFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setManualInput((current) => ({
      ...current,
      reviewsText: text,
    }));
    setManualNotice(`Imported ${file.name}. Review text is ready for analysis.`);
    setManualError("");
    event.target.value = "";
  }

  function resetAnalysis() {
    setSelectedProduct(null);
    setQuery("");
    setUrlValue("");
    setUrlError("");
    setUrlNotice("");
    setSearchError("");
    setManualError("");
    setManualNotice("");
    setHasSearched(false);
    setEntryMode("search");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  function clearManualInput() {
    setManualInput((current) => ({
      ...current,
      title: "",
      category: "",
      averageRating: "",
      sellerClaims: "",
      reviewsText: "",
    }));
    setManualNotice("Input cleared. Paste reviews or import a text/CSV file to begin.");
    setManualError("");
  }

  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openManualAnalyzer() {
    setEntryMode("manual");
    setSelectedProduct(null);
    window.setTimeout(() => scrollToId("scan-panel"), 50);
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/72 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={resetAnalysis}
            className="flex items-center gap-3 text-left"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-ghost-mint/30 bg-ghost-mint/12 text-ghost-mint">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-white">GhostCart</span>
              <span className="block text-xs text-white/48">Review X-Ray</span>
            </span>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" onClick={() => scrollToId("results")} className="rounded-lg px-3 py-2 text-sm text-white/58 transition hover:bg-white/5 hover:text-white">
              Products
            </button>
            <button type="button" onClick={openManualAnalyzer} className="rounded-lg px-3 py-2 text-sm text-white/58 transition hover:bg-white/5 hover:text-white">
              Manual Analyzer
            </button>
            <a href="#methodology" className="rounded-lg px-3 py-2 text-sm text-white/58 transition hover:bg-white/5 hover:text-white">
              Methodology
            </a>
            <a href="#privacy" className="rounded-lg px-3 py-2 text-sm text-white/58 transition hover:bg-white/5 hover:text-white">
              Privacy
            </a>
            <a href="#faq" className="rounded-lg px-3 py-2 text-sm text-white/58 transition hover:bg-white/5 hover:text-white">
              FAQ
            </a>
          </div>
        </nav>
        <div className="border-t border-white/10 px-4 pb-3 pt-3 md:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => scrollToId("results")}
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70"
            >
              Products
            </button>
            <button
              type="button"
              onClick={openManualAnalyzer}
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70"
            >
              Manual Analyzer
            </button>
            <a href="#methodology" className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70">
              Methodology
            </a>
            <a href="#privacy" className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70">
              Privacy
            </a>
            <a href="#faq" className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70">
              FAQ
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 grid-mask opacity-45" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-5 flex flex-wrap gap-2">
                <Pill className="border-ghost-mint/25 bg-ghost-mint/10 text-ghost-mint">Marketplace trust layer</Pill>
                <Pill className="border-white/10 bg-white/5 text-white/64">URL, paste, and import analysis</Pill>
              </div>
              <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[1.02] text-white md:text-6xl">
                See the review patterns behind the rating.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
                GhostCart helps shoppers spot repetitive, generic, promotional, and low-trust review signals before they buy.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/48">
                A trust layer for online shopping. It flags suspicious patterns; it does not prove a review is fake.
              </p>

              <div className="mt-8 grid gap-4 sm:flex">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ghost-mint"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Analyze a product
                </button>
                <button
                  type="button"
                  onClick={openManualAnalyzer}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-ghost-cyan/30 bg-ghost-cyan/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-ghost-cyan/18"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Paste reviews
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(winningDemoProduct)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Try sample analysis
                </button>
                <button
                  type="button"
                  onClick={() => scrollToId("methodology")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/15 px-5 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white"
                >
                  View Methodology
                </button>
              </div>
              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
                {[
                  [`${demoProducts.length}`, "sample analyses"],
                  ["100+", "review signals"],
                  ["0", "fragile scraping"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
                    <p className="font-display text-2xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-xs text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              id="scan-panel"
              className="premium-panel rounded-lg p-4 sm:p-5"
            >
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  { id: "search", label: "Search", icon: Search },
                  { id: "link", label: "Link", icon: LinkIcon },
                  { id: "manual", label: "Manual", icon: Upload },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const active = entryMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setEntryMode(mode.id as EntryMode)}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition ${
                      active ? "bg-white text-ink shadow-soft" : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {entryMode === "search" ? (
                <form onSubmit={handleSearch} className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Marketplace product search</span>
                    <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 focus-within:border-ghost-mint/55">
                      <Search className="h-5 w-5 text-white/36" aria-hidden="true" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="earbuds, charger, phone, power bank, shoes, blender"
                        className="w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => quickSearch(item)}
                        className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-ghost-cyan/35 hover:bg-ghost-cyan/10 hover:text-white"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {searchError ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
                      <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      {searchError}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {supportedPlatforms.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          platforms.includes(platform)
                            ? "border-ghost-mint/35 bg-ghost-mint/12 text-ghost-mint"
                            : "border-white/10 bg-white/5 text-white/55 hover:text-white"
                        }`}
                      >
                        {platforms.includes(platform) ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                        <MarketplaceLogo platform={platform} compact />
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ghost-mint px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Show matched products
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              ) : null}

              {entryMode === "link" ? (
                <form onSubmit={handleUrlScan} className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Product link</span>
                    <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 focus-within:border-ghost-cyan/55">
                      <LinkIcon className="h-5 w-5 text-white/36" aria-hidden="true" />
                      <input
                        value={urlValue}
                        onChange={(event) => setUrlValue(event.target.value)}
                        placeholder="https://www.amazon.com/product/..."
                        className="w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                  </label>
                  {urlError ? (
                    <div className="flex items-start gap-2 rounded-lg border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-50">
                      <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      {urlError}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                      <Lock className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      URL mode detects the marketplace safely. If reviews cannot be fetched directly, paste or import review text for analysis.
                    </div>
                  )}
                  {urlNotice ? (
                    <div className="flex items-start gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-50">
                      <Check className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      {urlNotice}
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ghost-cyan"
                  >
                    Analyze Product URL
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              ) : null}

              {entryMode === "manual" ? (
                <form onSubmit={handleManualScan} className="grid gap-4">
                  {manualNotice ? (
                    <div className="flex items-start gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                      <FileText className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      {manualNotice}
                    </div>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-white/74">Product title</span>
                      <input
                        value={manualInput.title}
                        onChange={(event) => setManualInput((current) => ({ ...current, title: event.target.value }))}
                        className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-ghost-mint/55"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-white/74">Marketplace</span>
                      <select
                        value={manualInput.platform}
                        onChange={(event) => setManualInput((current) => ({ ...current, platform: event.target.value as Platform }))}
                        className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-ghost-mint/55"
                      >
                        {supportedPlatforms.map((platform) => (
                          <option key={platform}>{platform}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-white/74">Product category</span>
                      <input
                        value={manualInput.category}
                        onChange={(event) => setManualInput((current) => ({ ...current, category: event.target.value }))}
                        placeholder="Wireless earbuds, shoes, book, kitchen appliance"
                        className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none placeholder:text-white/30 focus:border-ghost-mint/55"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-white/74">Avg. rating</span>
                      <input
                        value={manualInput.averageRating}
                        onChange={(event) => setManualInput((current) => ({ ...current, averageRating: event.target.value }))}
                        inputMode="decimal"
                        placeholder="4.2"
                        className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none placeholder:text-white/30 focus:border-ghost-mint/55"
                      />
                    </label>
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Seller claims</span>
                    <textarea
                      value={manualInput.sellerClaims}
                      onChange={(event) => setManualInput((current) => ({ ...current, sellerClaims: event.target.value }))}
                      rows={2}
                      className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-ghost-mint/55"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Pasted reviews</span>
                    <textarea
                      value={manualInput.reviewsText}
                      onChange={(event) => setManualInput((current) => ({ ...current, reviewsText: event.target.value }))}
                      rows={7}
                      placeholder="Paste multiple reviews. Separate reviews with blank lines, CSV rows, or --- dividers."
                      className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-ghost-mint/55"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                      <FileUp className="h-4 w-4" aria-hidden="true" />
                      Import text/CSV
                      <input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={handleReviewFile} className="sr-only" />
                    </label>
                    <button
                      type="button"
                      onClick={clearManualInput}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Clear Input
                    </button>
                  </div>
                  {manualError ? (
                    <div className="rounded-lg border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-50">{manualError}</div>
                  ) : null}
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ghost-mint px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Analyze Reviews
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              ) : null}
            </motion.div>
          </div>
        </section>

        {analysis ? <AnalysisDashboard analysis={analysis} onBack={() => setSelectedProduct(null)} /> : null}

        <section id="results" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-mint">Sample analyses</p>
              <h2 className="font-display mt-2 text-3xl font-semibold text-white">
                {hasSearched ? `Matched sample analyses for "${query || "all products"}"` : "Public sample analyses"}
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Smart fuzzy search catches typos like "easrbnuds" and shows clearly labeled sample analysis templates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProduct(winningDemoProduct)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Try Sample Analysis
            </button>
          </div>
          {hasSearched && results.length === 0 ? (
            <div className="mb-6 rounded-lg border border-amber-300/25 bg-amber-300/10 p-5">
              <h3 className="font-display text-lg font-semibold text-amber-50">No matching sample analysis found</h3>
              <p className="mt-2 text-sm leading-6 text-amber-50/80">
                Try another category or switch to manual review analysis for your exact product.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => quickSearch(item)}
                    className="rounded-full border border-amber-200/25 bg-black/15 px-3 py-1.5 text-xs font-medium text-amber-50 transition hover:bg-amber-200/10"
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={openManualAnalyzer}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                >
                  Paste reviews manually
                </button>
              </div>
            </div>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(hasSearched ? results : demoProducts).map((product) => (
              <ProductCard key={product.id} product={product} onAnalyze={setSelectedProduct} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="glass rounded-lg p-5">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-ghost-mint/25 bg-ghost-mint/10 text-ghost-mint">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{feature.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-mint">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Paste reviews, get a second opinion before buying.</h2>
              <p className="mt-4 text-base leading-7 text-white/64">
                GhostCart checks whether reviews are specific, varied, balanced, and useful. Repeated praise, thin detail,
                and promotional wording reduce confidence.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["1", "Detect source", "Paste a product URL or choose a sample category. GhostCart identifies the source without fragile scraping."],
                ["2", "Import reviews", "Paste bulk review text or import a text/CSV file from your own export or copied review list."],
                ["3", "Read the receipt", "Review trust score, risk signals, repeated wording, buyer issues, and a copyable report."],
              ].map(([step, title, copy]) => (
                <article key={step} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                  <p className="grid h-9 w-9 place-items-center rounded-lg bg-ghost-mint text-sm font-bold text-ink">{step}</p>
                  <h3 className="mt-4 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Before buying", "Check whether a highly rated product has repeated low-detail praise or unresolved buyer issues."],
              ["After shortlisting", "Compare categories like earbuds, skincare, power banks, shoes, books, and kitchen appliances."],
              ["Seller audits", "Use the same signals to spot weak claim support, vague reviews, and recurring customer pain points."],
            ].map(([title, copy]) => (
              <article key={title} className="glass rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ghost-cyan">Why it matters</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Fake-looking review noise wastes buyer time.</h2>
            <p className="mt-4 text-base leading-7 text-white/64">
              Star ratings compress too much. GhostCart asks whether reviews look grounded in real product experience,
              then separates buyer evidence from generic praise, repeated clusters, ghost reviews, and unsupported seller claims.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Marketplace trust", "Flags fake-looking reviews, paid-style patterns, and low-evidence praise."],
              ["Content slop", "Catches generic Q&A answers and review text that does not answer real buyer questions."],
              ["Consumer protection", "Surfaces long-term defects, mismatch, safety risk, and return friction."],
              ["Reliable public flow", "Works with pasted reviews, text/CSV imports, sample analyses, and validated product links without hidden APIs."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="glass grid gap-8 rounded-lg p-5 md:grid-cols-[0.9fr_1.1fr] md:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-amber">Sample preview</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">The result is an explainable Trust Receipt.</h2>
              <p className="mt-4 text-sm leading-6 text-white/62">
                Open a sample analysis to see repeated five-star praise, grounded battery complaints, a weak ANC claim,
                and a buyer issue map that separates useful evidence from review noise.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-[13rem_1fr]">
              <ProductVisual product={winningDemoProduct} compact />
              <div className="grid gap-3">
                <div className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-sm text-white/50">Preview score</p>
                  <p className="mt-1 text-3xl font-semibold text-ghost-amber">{previewAnalysis.trustScore}/100</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{previewAnalysis.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(winningDemoProduct)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ghost-mint"
                >
                  Open Trust Receipt
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="methodology" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-mint">Methodology</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Explainable signals, not black-box accusations.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Experience grounding", "Rewards time used, device details, defect context, setup notes, measurements, and before/after evidence."],
                ["Similarity clusters", "Uses normalized tokens, repeated n-grams, and Jaccard overlap to flag copy-pattern review noise."],
                ["Product mismatch", "Checks whether review text mentions an unrelated product category, creating a ghost-review risk signal."],
                ["Claim support", "Compares seller claims with grounded buyer evidence and Q&A quality signals."],
              ].map(([title, copy]) => (
                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="glass grid gap-6 rounded-lg p-5 md:grid-cols-[0.72fr_1.28fr] md:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-cyan">Privacy</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Privacy-conscious by design.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Local pattern analysis", "Review text is analyzed for pattern detection in the app flow. Basic use does not require an account."],
                ["No restricted scraping", "Marketplace URLs are validated and categorized, but GhostCart does not pretend to fetch reviews where reliable access is unavailable."],
                ["Paste carefully", "Do not paste private information, order IDs, phone numbers, addresses, or personal data into review text."],
                ["No exposed secrets", "The app uses deterministic local logic and no required paid API keys for the core analysis."],
              ].map(([title, copy]) => (
                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-ghost-mint" aria-hidden="true" />
                    <h3 className="font-semibold text-white">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-ghost-cyan">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Honest trust analysis for real shopping decisions.</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-lg border border-white/10 bg-white/[0.045] p-4 open:bg-white/[0.065]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-white">
                  <span className="flex items-center gap-3">
                    <CircleHelp className="h-5 w-5 text-ghost-cyan" aria-hidden="true" />
                    {faq.q}
                  </span>
                  <span className="text-white/35 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-white/62">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/45 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3">
          <FileText className="h-4 w-4" aria-hidden="true" />
          GhostCart flags review-risk patterns. It is not legal proof of fake reviews or a replacement for human judgment.
        </div>
      </footer>
    </div>
  );
}

export default App;
