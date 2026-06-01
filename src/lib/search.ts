import type { Platform, ProductDemo } from "../types";

const aliases: Record<string, string[]> = {
  earbuds: ["earbud", "earbuds", "buds", "airpods", "earphone", "earphones", "headphones", "headset"],
  charger: ["charger", "charging", "adapter", "usb", "usb-c", "type-c", "cable", "100w", "gan"],
  smartphone: ["smartphone", "phone", "mobile", "camera phone", "android", "5g"],
  stand: ["laptop stand", "stand", "desk stand", "ergonomic", "aluminum stand"],
  powerbank: ["power bank", "powerbank", "battery bank", "portable charger", "20000mah"],
  mouse: ["gaming mouse", "mouse", "dpi", "rgb mouse"],
  lamp: ["study lamp", "lamp", "desk lamp", "led lamp", "wireless charger"],
  smartwatch: ["smartwatch", "smart watch", "watch", "fitness", "health", "tracker"],
  backpack: ["backpack", "bag", "laptop bag", "rucksack", "office bag", "travel bag"],
  skincare: ["skincare", "skin", "serum", "vitamin", "cream", "brightening"],
  shaker: ["protein shaker", "shaker", "bottle", "gym bottle", "protein bottle"],
  shoes: ["shoes", "shoe", "sneaker", "sneakers", "running shoes"],
  books: ["book", "books", "novel", "paperback", "hardcover"],
  kitchen: ["kitchen", "appliance", "mixer", "air fryer", "blender", "toaster"],
};

function clean(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigrams(value: string) {
  const normalized = clean(value).replace(/\s+/g, "");
  if (normalized.length <= 1) return [normalized];
  return Array.from({ length: normalized.length - 1 }, (_, index) => normalized.slice(index, index + 2));
}

function dice(left: string, right: string) {
  const a = bigrams(left);
  const b = bigrams(right);
  if (!a.length || !b.length) return 0;
  const remaining = [...b];
  let matches = 0;
  a.forEach((item) => {
    const index = remaining.indexOf(item);
    if (index >= 0) {
      matches += 1;
      remaining.splice(index, 1);
    }
  });
  return (2 * matches) / (a.length + b.length);
}

function productTokens(product: ProductDemo) {
  return clean(`${product.title} ${product.category} ${product.tags.join(" ")} ${product.sellerClaims.join(" ")}`).split(" ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(haystack: string, phrase: string) {
  const normalized = clean(phrase);
  if (!normalized) return false;
  return new RegExp(`(^|\\s)${escapeRegExp(normalized)}($|\\s)`, "i").test(haystack);
}

function aliasBucket(queryTerm: string) {
  const exact = Object.entries(aliases).find(([bucket, words]) => bucket === queryTerm || words.includes(queryTerm));
  if (exact) return exact[0];

  const contained = Object.entries(aliases).find(([, words]) =>
    words.some((word) => word.length >= 5 && queryTerm.length >= 5 && (word.includes(queryTerm) || queryTerm.includes(word))),
  );
  if (contained) return contained[0];

  return Object.entries(aliases).find(([, words]) => words.some((word) => dice(queryTerm, word) > 0.5))?.[0];
}

function productCategoryBucket(product: ProductDemo) {
  const category = product.category.toLowerCase();
  if (category.includes("earbud")) return "earbuds";
  if (category.includes("fast charger")) return "charger";
  if (category.includes("smartphone")) return "smartphone";
  if (category.includes("smartwatch")) return "smartwatch";
  if (category.includes("backpack")) return "backpack";
  if (category.includes("skincare")) return "skincare";
  if (category.includes("laptop stand")) return "stand";
  if (category.includes("power bank")) return "powerbank";
  if (category.includes("gaming mouse")) return "mouse";
  if (category.includes("study lamp")) return "lamp";
  if (category.includes("shaker")) return "shaker";
  if (category.includes("shoe")) return "shoes";
  if (category.includes("book")) return "books";
  if (category.includes("kitchen") || category.includes("appliance")) return "kitchen";
  return aliasBucket(clean(product.category).split(" ")[0]) || aliasBucket(product.tags[0] || "");
}

export function scoreProductForQuery(product: ProductDemo, query: string) {
  const normalized = clean(query);
  if (!normalized) return 1;
  const tokens = productTokens(product);
  const haystack = tokens.join(" ");
  const terms = normalized.split(" ").filter(Boolean);
  const categoryBucket = productCategoryBucket(product);

  return terms.reduce((score, term) => {
    const queryBucket = aliasBucket(term);
    if (queryBucket && queryBucket === categoryBucket) return score + 34;
    if (containsPhrase(haystack, term)) return score + 18;
    if (queryBucket && aliases[queryBucket]?.some((word) => containsPhrase(haystack, word))) return score + 24;
    const bestFuzzy = Math.max(0, ...tokens.map((token) => dice(term, token)));
    if (bestFuzzy > 0.55) return score + Math.round(bestFuzzy * 18);
    return score;
  }, 0);
}

export function searchProductsCatalog(products: ProductDemo[], query: string, platforms: Platform[]) {
  const allowed = new Set(platforms);
  const normalized = clean(query);
  const phraseBuckets = new Set(
    Object.entries(aliases)
      .filter(([bucket, words]) => containsPhrase(normalized, bucket) || words.some((word) => containsPhrase(normalized, word)))
      .map(([bucket]) => bucket),
  );
  const queryBuckets = phraseBuckets.size
    ? phraseBuckets
    : new Set(
        normalized
          .split(" ")
          .map((term) => aliasBucket(term))
          .filter(Boolean),
      );
  const scored = products
    .map((product) => ({ product, score: allowed.has(product.platform) ? scoreProductForQuery(product, query) : 0 }))
    .filter((item) => item.score > 0)
    .filter((item) => !queryBuckets.size || queryBuckets.has(productCategoryBucket(item.product)))
    .sort((a, b) => b.score - a.score || b.product.reviewCount - a.product.reviewCount);

  return scored
    .map((item) => item.product);
}

export const suggestedSearches = [
  "wireless earbuds",
  "USB-C charger",
  "smartphone",
  "smart watch",
  "power bank",
  "laptop backpack",
  "gaming mouse",
  "study lamp",
  "skincare serum",
  "protein shaker",
  "running shoes",
  "books",
  "kitchen appliance",
];
