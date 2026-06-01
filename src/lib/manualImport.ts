import type { ManualImportInput, ProductDemo, Review } from "../types";

function inferCategory(title: string, category?: string) {
  const explicit = category?.trim();
  if (explicit) return explicit;
  const value = title.toLowerCase();
  if (value.includes("earbud") || value.includes("headphone")) return "Wireless Earbuds";
  if (value.includes("charger") || value.includes("usb")) return "USB-C Fast Charger";
  if (value.includes("phone") || value.includes("mobile")) return "Smartphone";
  if (value.includes("power bank") || value.includes("powerbank")) return "Power Bank";
  if (value.includes("stand")) return "Laptop Stand";
  if (value.includes("mouse")) return "Gaming Mouse";
  if (value.includes("lamp")) return "Study Lamp";
  if (value.includes("shoe") || value.includes("sneaker")) return "Shoes";
  if (value.includes("book")) return "Book";
  if (value.includes("kitchen") || value.includes("mixer") || value.includes("air fryer")) return "Kitchen Appliance";
  if (value.includes("watch")) return "Smartwatch";
  if (value.includes("backpack") || value.includes("bag")) return "Backpack";
  if (value.includes("skin") || value.includes("serum")) return "Skincare Serum";
  return "Marketplace Product";
}

function inferTags(title: string, claims: string) {
  const seed = `${title} ${claims}`.toLowerCase();
  const tags = new Set<string>();
  [
    "battery",
    "charging",
    "heating",
    "mic",
    "sound",
    "zipper",
    "fabric",
    "skin",
    "app",
    "sync",
    "delivery",
    "packaging",
    "compatibility",
  ].forEach((token) => {
    if (seed.includes(token)) tags.add(token);
  });
  inferCategory(title)
    .toLowerCase()
    .split(/\s+/)
    .forEach((token) => tags.add(token));
  return Array.from(tags);
}

function parseRating(block: string, fallback: number) {
  const match =
    block.match(/(?:rating|stars?)\s*[:\-]?\s*([1-5])(?:\s*\/\s*5)?/i) ||
    block.match(/^([1-5])\s*(?:star|\/5)/i);
  return match ? Number(match[1]) : fallback;
}

export function createManualProduct(input: ManualImportInput): ProductDemo {
  const safeTitle = input.title.trim() || "Manual Review Import";
  const category = inferCategory(safeTitle, input.category);
  const blocks = input.reviewsText
    .split(/\n\s*\n|---+/)
    .map((block) => block.trim())
    .filter(Boolean);

  const reviews: Review[] = (blocks.length ? blocks : [input.reviewsText])
    .filter(Boolean)
    .slice(0, 36)
    .map((block, index) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const rating = parseRating(block, index % 5 === 0 ? 5 : 3);
      const title = lines[0]?.replace(/^(title|review)\s*[:\-]\s*/i, "") || `Imported review ${index + 1}`;
      const body = lines.length > 1 ? lines.slice(1).join(" ") : block.replace(/(?:rating|stars?)\s*[:\-]?\s*[1-5](?:\s*\/\s*5)?/i, "");
      return {
        id: `manual-${index + 1}`,
        reviewer: `Imported ${index + 1}`,
        rating,
        title: title.slice(0, 80),
        body: body.trim() || title,
        verified: undefined,
      };
    });

  const sellerClaims = input.sellerClaims
    .split(/\n|,/)
    .map((claim) => claim.trim())
    .filter(Boolean);
  const averageRating = Number(input.averageRating);
  const calculatedRating = reviews.length ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)) : 0;

  return {
    id: `manual-${Date.now()}`,
    platform: input.platform,
    title: safeTitle,
    price: "Manual import",
    rating: Number.isFinite(averageRating) && averageRating > 0 ? averageRating : calculatedRating,
    reviewCount: reviews.length,
    category,
    tags: inferTags(safeTitle, input.sellerClaims),
    sellerClaims: sellerClaims.length ? sellerClaims : ["Manual import did not include seller claims"],
    bullets: ["Reviews were pasted manually and analyzed locally in the browser."],
    imageLabel: "manual import",
    imageTone: "mint",
    analysisMode: "User-provided reviews",
    reviews,
    qa: [],
    demoNote: "User-provided review analysis. No marketplace scraping was used.",
  };
}
