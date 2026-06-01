# GhostCart

GhostCart is a privacy-conscious review trust analyzer for online shopping. Shoppers paste a product URL, paste or import reviews, and get an explainable dashboard that shows the review patterns behind the rating.

## Separate Product Description

GhostCart helps online shoppers decide whether product reviews are useful, repetitive, promotional, mismatched, or grounded in real buyer experience. It does not claim to prove that a review is fake. Instead, it turns pasted marketplace reviews into a clear trust report with review-risk scoring, repeated phrase clusters, buyer issue extraction, seller-claim support checks, and a copyable summary for quick decisions.

Short pitch:

```text
GhostCart is a review trust layer for online shopping. Paste a product URL, paste or import reviews, and get an explainable dashboard that reveals suspicious patterns, real buyer issues, and claim-support gaps before you buy.
```

## Real Product Name

The official product name is **GhostCart**.

Canonical GitHub repository:

```text
https://github.com/motionetcs/GhostCart
```

GitHub Pages deployment:

```text
https://motionetcs.github.io/GhostCart/
```

Vercel deployment:

```text
https://ghostcart-tau.vercel.app/
```

## Core Flow

1. Paste a product URL.
2. Paste or import review text.
3. Analyze review-risk signals.
4. Read, copy, print, or export the report.

## What It Detects

- Repeated praise and low-detail reviews
- Promotional or paid-style wording
- Product-category mismatch
- Unsupported seller claims
- Real buyer issue clusters
- Q&A answers that do not actually answer buyer questions

## Product Features

- URL detection for Amazon, Flipkart, Meesho, Myntra, Walmart, Best Buy, and other stores
- Manual review paste/import flow
- Example report search
- Dashboard-level trust report
- Buyer issue map
- Review X-Ray tab
- Claims and Q&A analysis
- Copyable report summary
- Print and JSON export
- Mobile-responsive layout

## PPT And Video Storyboard

Open this route after starting the app:

```text
http://localhost:5174/ppt-video-storyboard.html
```

Live storyboard routes:

```text
https://ghostcart-tau.vercel.app/ppt-video-storyboard.html
https://motionetcs.github.io/GhostCart/ppt-video-storyboard.html
```

The source files are also in `docs/`.

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
npm run analyze:demo
```

## Deployment

This repo includes a GitHub Pages workflow at `.github/workflows/deploy.yml` and a Vercel config at `vercel.json`.

On every push to `main`, GitHub Actions:

1. Installs dependencies with `npm ci`.
2. Runs TypeScript checks.
3. Builds the Vite app.
4. Deploys `dist/` to GitHub Pages.

Vercel uses the same production build:

```text
npm run build
dist/
```

Live Vercel app:

```text
https://ghostcart-tau.vercel.app/
```

## Note

GhostCart flags suspicious review patterns. It does not prove that a review is fake and does not replace human judgment.
