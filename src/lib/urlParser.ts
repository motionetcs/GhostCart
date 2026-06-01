import type { Platform } from "../types";

export function platformFromUrl(value: string): Platform | null {
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    if (host.includes("amazon.")) return "Amazon";
    if (host.includes("flipkart.")) return "Flipkart";
    if (host.includes("meesho.")) return "Meesho";
    if (host.includes("myntra.")) return "Myntra";
    if (host.includes("walmart.")) return "Walmart";
    if (host.includes("bestbuy.")) return "Best Buy";
    return "Other";
  } catch {
    return null;
  }
}

export function productHintFromUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const segments = url.pathname
      .split("/")
      .map((segment) => segment.replace(/[-_+]/g, " ").replace(/\.(html|php)$/i, "").trim())
      .filter((segment) => segment && !/^(dp|gp|p|product|itm|ip|shop|c)$/i.test(segment));
    const hint = segments.find((segment) => /[a-z]/i.test(segment) && segment.length > 3) || "";
    return hint
      .replace(/\b[A-Z0-9]{8,}\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}
