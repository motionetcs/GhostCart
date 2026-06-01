# GhostCart PPT And Demo Video Storyboard

Use this as a direct slide plan for a hackathon pitch deck or a 3-4 minute demo video.

Recommended slide style:
- Use a split layout: product screenshot on the left, short text on the right.
- Keep each slide to 3-5 bullets.
- Use large headings and minimal paragraphs.
- For the video, show the live app for the flow slides and use the voiceover notes below.

Preview URLs for screenshots:

```text
https://ghostcart-tau.vercel.app/
https://motionetcs.github.io/GhostCart/
```

Local preview URL:

```text
http://localhost:5174/
```

## Slide 1: Title

Visual:
- Full screenshot of the GhostCart hero.
- Highlight the main buttons: Analyze Reviews and Paste Product URL.

Slide text:
- GhostCart
- Review Trust Analysis for Online Shopping
- See the review patterns behind the rating.

Speaker notes:
GhostCart is a trust layer for online shopping. It helps buyers inspect the quality of product reviews before trusting the rating.

## Slide 2: The Problem

Visual:
- Screenshot or simple graphic showing a product rating with many reviews.
- Add small callouts: repeated praise, vague reviews, product mismatch, unsupported claims.

Slide text:
- Star ratings are easy to manipulate.
- Buyers waste time reading hundreds of reviews.
- Fake-looking review noise hides real buyer issues.
- Generic five-star reviews can bury useful warnings.

Speaker notes:
Most shoppers depend on ratings, but ratings alone do not show whether the reviews are specific, repeated, promotional, or even related to the product.

## Slide 3: Our Solution

Visual:
- Screenshot of the analyzer panel.
- Use arrows: Product URL -> Reviews -> Analysis -> Report.

Slide text:
- Paste a product URL.
- Paste or import review text.
- Analyze suspicious patterns.
- Get an explainable trust report.

Speaker notes:
GhostCart focuses on the real user flow: paste a product link, import the reviews, and receive a dashboard that explains trust signals instead of just summarizing reviews.

## Slide 4: Core User Flow

Visual:
- Four-step horizontal flow.
- Use app screenshots for each step if possible.

Slide text:
1. Paste product URL
2. Paste or import reviews
3. Analyze review-risk signals
4. Read/export the report

Speaker notes:
The whole app is built around a practical shopping workflow. It does not pretend to scrape restricted marketplaces. It guides the user into a reliable review-text analysis flow.

## Slide 5: Product URL Detection

Visual:
- Screenshot of Product URL mode.
- Screenshot after Amazon or Flipkart URL detection.

Slide text:
- Detects marketplace from URL.
- Supports Amazon, Flipkart, Meesho, Myntra, Walmart, Best Buy, and other stores.
- Auto-fills product source and title hints.
- Shows clear error state for invalid URLs.

Speaker notes:
The URL step makes the experience feel like a real shopping tool. It recognizes the marketplace and then asks the user to paste or import reviews for analysis.

## Slide 6: Review Paste And Import

Visual:
- Screenshot of Review Text mode.
- Show Import Reviews, Clear Input, and Analyze Reviews buttons.

Slide text:
- Paste raw review text.
- Upload text or CSV files.
- Add optional product claims and rating.
- Clear empty/error states.

Speaker notes:
Users can paste copied reviews or import a review export. GhostCart can work with messy text because it parses review blocks and extracts ratings when available.

## Slide 7: Analysis Methodology

Visual:
- Screenshot of Methodology section.
- Optional diagram: Review text -> Signals -> Score.

Slide text:
- Experience grounding
- Similarity clusters
- Product mismatch
- Seller claim support
- Q&A quality signals

Speaker notes:
The scoring is explainable. GhostCart rewards reviews with real usage context and flags repeated language, thin detail, promotional wording, category mismatch, and unsupported seller claims.

## Slide 8: Premium Result Dashboard

Visual:
- Screenshot of the dashboard Trust Receipt tab.
- Highlight score cards: Overall Trust, Review-risk, Human-like Reviews, Confidence.

Slide text:
- Trust score out of 100
- Review-risk score
- Human-like review percentage
- Suspicious review percentage
- Confidence level

Speaker notes:
The dashboard gives a fast executive summary for buyers. Instead of reading every review manually, the user can immediately see whether the review set deserves trust.

## Slide 9: Buyer Issue Map

Visual:
- Screenshot of Buyer Issues tab.
- Highlight repeated issue cards.

Slide text:
- Extracts repeated grounded buyer problems.
- Filters out low-trust review noise.
- Shows severity and warning context.
- Helps buyers know what to check before purchase.

Speaker notes:
This is the most practical part for shoppers. GhostCart turns review chaos into a buyer issue map, showing things like charging drops, poor mic quality, durability problems, or product mismatch.

## Slide 10: Review X-Ray

Visual:
- Screenshot of Review X-Ray tab.
- Highlight suspicious review cards and flags.

Slide text:
- Classifies reviews as Grounded, Suspicious, Ghost, or Unclear.
- Shows risk and groundedness scores per review.
- Flags repeated phrases and low-detail praise.
- Keeps human judgment in the loop.

Speaker notes:
GhostCart does not accuse a review of being fake. It explains why a review looks risky so the user can inspect evidence before deciding.

## Slide 11: Claims And Q&A

Visual:
- Screenshot of Claims + Q&A tab.

Slide text:
- Compares seller claims against review evidence.
- Marks claims as supported, weakly supported, unsupported, or contradicted.
- Flags generic Q&A answers.
- Surfaces mismatch between marketing and buyer experience.

Speaker notes:
This connects reviews back to the product listing. If the seller claims long battery life or noise cancelling, GhostCart checks whether grounded reviews support or contradict those claims.

## Slide 12: Report Summary

Visual:
- Screenshot of Report Summary modal.
- Highlight Copy Report, Print Report, Download JSON.

Slide text:
- Shareable trust receipt
- Copy report
- Print report
- Export JSON
- Useful for buyers, sellers, and judges

Speaker notes:
Every analysis can become a clean report. This makes the app useful beyond browsing: buyers can save evidence, sellers can audit listings, and judges can quickly understand the result.

## Slide 13: Example Reports

Visual:
- Screenshot of Explore Example Reports section.
- Show earbuds or charger result card.

Slide text:
- 14 example product reports
- Realistic review sets
- Search by category
- Empty/no-match state included

Speaker notes:
The examples are secondary. They are included to show how the scoring behaves across product categories like earbuds, chargers, phones, shoes, skincare, books, and kitchen appliances.

## Slide 14: Privacy And Reliability

Visual:
- Screenshot of Privacy section.

Slide text:
- No account needed for basic use.
- No restricted scraping.
- Review text is analyzed in the app flow.
- Users are warned not to paste private data.

Speaker notes:
GhostCart is honest about limitations. It avoids fragile marketplace scraping and focuses on transparent analysis of the review text the user provides.

## Slide 15: Impact

Visual:
- Before/after comparison.
- Before: star rating and review noise.
- After: trust score, buyer issues, suspicious clusters.

Slide text:
- Helps buyers make safer decisions.
- Saves time reading reviews.
- Surfaces hidden product risks.
- Encourages better seller transparency.

Speaker notes:
The impact is simple: GhostCart helps shoppers see what ratings hide. It turns review noise into explainable signals.

## Slide 16: Closing

Visual:
- Clean screenshot of dashboard or hero.

Slide text:
- GhostCart
- Review trust, explained.
- Paste URL -> Import Reviews -> Analyze -> Report

Speaker notes:
GhostCart is not just a review summarizer. It is a practical review trust analyzer built for real shopping decisions.

## 3-Minute Video Script

Opening:
Hi, this is GhostCart, a review trust analyzer for online shopping. The problem is that star ratings are easy to trust but hard to verify. Reviews can be repetitive, promotional, vague, or even unrelated to the product.

Demo flow:
I start by pasting a product URL. GhostCart detects the marketplace and moves me into the review analysis flow. Since marketplaces often restrict direct review access, the app asks me to paste or import the reviews I want checked.

Now I paste a few reviews and add optional seller claims like battery life or noise cancelling. When I click Analyze Reviews, GhostCart builds a full trust dashboard.

Dashboard:
The dashboard shows an overall trust score, review-risk score, human-like review percentage, suspicious review share, and confidence level. The Buyer Issues tab extracts repeated grounded problems from real-looking reviews. The Review X-Ray tab shows which reviews look suspicious and explains the signals. The Claims + Q&A tab compares seller claims with buyer evidence.

Report:
Finally, I can open a report summary, copy it, print it, or export JSON. This gives shoppers a shareable trust receipt before buying.

Closing:
GhostCart does not claim to prove fake reviews. It flags suspicious patterns and explains the evidence, helping buyers make better decisions from the reviews they already see.

## Screenshot Checklist

Capture these screenshots for PPT:
- Hero with Analyze Reviews and Paste Product URL buttons.
- Product URL mode before and after URL detection.
- Review Text mode with pasted reviews.
- Dashboard Trust Receipt tab.
- Buyer Issues tab.
- Review X-Ray tab.
- Claims + Q&A tab.
- Report Summary modal.
- Example Reports search result.
- Privacy section.

## Short Pitch

GhostCart is a review trust layer for online shopping. Users paste a product URL, paste or import reviews, and get an explainable trust dashboard. It flags suspicious review patterns, repeated phrases, generic praise, product mismatch, unsupported seller claims, and grounded buyer issues. It helps shoppers understand the review quality behind a rating before they buy.
