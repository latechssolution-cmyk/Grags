# GRAGS — Client Brief Reconciliation PRD

**Purpose:** The client's brief (Website Dev doc + Meta Pixel doc) was written without visibility into the current codebase — it reads like a list of assumptions, not a verified bug list. This PRD reconciles every client ask against what's *actually* in the code today (verified by reading `graggs-cinematic-luxe-main/src`, `netlify/functions`, and `index.html`), so we build only what's really missing instead of re-doing work that already exists.

Legend: ✅ Already done (verify only) · ⚠️ Partially done / needs adjustment · ❌ Missing, real work · ❓ Needs a decision from the client (spec is ambiguous or contradicts itself)

---

## 0. Big picture finding

The client's core complaint — *"the admin panel is not properly integrated with the live site"* — is **mostly false today**. `productStore`, `orderStore`, `settingsStore`, and `journalStore` all fetch from and POST to MongoDB via Netlify functions (`netlify/functions/*.cjs`) on every read/write, not just localStorage. Likewise, several of the "missing" features the brief describes (per-color/size stock, per-product size charts, product reviews feeding the homepage, individual journal article pages, the Google Drive image bug, journal keywords→SEO) **are already built**.

This means the client is likely working from an old snapshot of the site, or from a generic AI-generated audit that was never actually run against this codebase. The real work is narrower and more surgical than the brief implies — mostly: SEO metadata gaps, checkout pricing-rule mismatches, header UX additions (mega-menu, multi-location), and a couple of genuinely missing admin controls.

---

## 1. Admin ↔ Live Site Sync (Brief §5)

**Status: ✅ Mechanism already exists for all 4 stores.**

| Store | Backed by MongoDB? | Evidence |
|---|---|---|
| Products | Yes | `src/store/productStore.ts` — `fetch("/.netlify/functions/products")` + POST/PUT/DELETE |
| Orders | Yes | `src/store/orderStore.ts` — same pattern |
| Settings (contact, WhatsApp, bank details, collections, coupons) | Yes | `src/store/settingsStore.ts` |
| Journal | Yes | `src/store/journalStore.ts` |

**What could still be causing the client's "changes don't reflect" experience:**
- All failed writes are swallowed with `.catch(err => console.error(...))` — if `MONGODB_URI` isn't set in Netlify's environment (see `netlify/functions/utils/db.cjs`, which explicitly throws if the env var is missing), every admin save silently fails to persist server-side while still looking successful in the admin UI (because it also writes to localStorage first). **This is the most likely real root cause.**
- Action: verify `MONGODB_URI` is actually set in the Netlify site's environment variables (not just `.env.example` locally), and add a visible error toast when a MongoDB sync fails (currently only logged to console, invisible to the admin).

**Real work:** ⚠️ Add user-facing save-failure feedback across all admin tabs (currently only Orders has toast feedback); confirm production env vars. Not a rebuild — a reliability/observability fix.

---

## 2. Checkout Flow (Brief §5.5)

File: `src/pages/CheckoutPage.tsx`, `src/store/orderStore.ts`

| Ask | Status | Notes |
|---|---|---|
| COD + Bank Transfer as payment methods | ✅ | Both implemented |
| Bank Transfer receipt screenshot upload | ✅ | Required before submit (`receiptRequired`) |
| Admin-editable bank account details | ✅ | Settings tab, shown at checkout when BT selected |
| Auto-delete receipt after admin confirms + email sends | ✅ | `Admin.tsx` `handleStatusChange`: on successful email + status→Confirmed, `receiptImage` is cleared |
| Standard (3–5 day) + Express (1–2 day) shipping | ✅ | Express is correctly BT-only, flat +PKR 250, no coupon stacking issue |
| "Bank Transfer = free delivery" tag/note | ✅ **Done.** Badge now reads "Free Delivery" instead of "Save PKR 200"; Bank Transfer Standard shipping is unconditionally free regardless of order value. |
| COD free above Rs 2,999 | ✅ **Done.** Client corrected the threshold from Rs 3,000 → **Rs 2,999**, and specified the missing fee: COD orders at/below Rs 2,999 now carry a flat **PKR 200** delivery charge; above that, COD ships free. Implemented in `CheckoutPage.tsx` (`COD_FREE_SHIPPING_THRESHOLD`, `COD_SHIPPING_FEE`), reflected in both the shipping-method cost display and the totals breakdown. |
| Asterisks on required fields | ❌ Not yet done — still open, not part of this round's request |
| Block proceeding until required fields filled | ⚠️ Unchanged — native HTML `required` still covers this; custom messaging still open |
| Postal code optional | ❌ Not yet done — still open, not part of this round's request |
| Stripe | ✅ **Resolved.** Client confirmed Stripe is not needed — the heading in the original brief was a leftover, no Stripe work planned. |

**Implemented shipping/payment rule (as of this round):**
- Bank Transfer → Standard shipping always free, regardless of order value.
- COD → Standard shipping free when `subtotal > 2,999`; a flat PKR 200 delivery charge when `subtotal ≤ 2,999`.
- Express → unchanged, Bank Transfer only, flat +PKR 250, no discount stacking.
- The threshold/fee are currently hardcoded constants in `CheckoutPage.tsx` (matching the existing `EXPRESS_SHIPPING_COST` pattern) rather than admin-editable settings — flag if you'd like these made editable later the same way bank account details are.

**Still open, not part of this round:** asterisks on required fields; postal code optional.

---

## 3. Reviews (Brief §5.6)

**Status: ✅ Fully implemented already, end to end.**

- `ProductDetail.tsx` has a working "Write a Review" form (name, star rating, optional text) → calls `addReview()` from `productStore.ts`, which persists to MongoDB.
- `ReviewsSection.tsx` (homepage) pulls `products.flatMap(p => p.reviews)`, sorts newest-first, and rotates through them automatically — falling back to curated testimonials only when zero real reviews exist yet.

**Real work:** None. Recommend just a manual test pass (submit a review on a product page, confirm it appears on the homepage within one refresh) to close this out with the client.

---

## 4. Product Keywords / SEO (Brief §5.7)

| Ask | Status |
|---|---|
| Keywords field per product in admin | ✅ `ProductForm` has an "SEO Keywords" input, comma-separated |
| Wired to the live site for SEO | ✅ `ProductDetail.tsx` passes `product.keywords` into `useSEO()`, which sets a `<meta name="keywords">` tag |

**Real work:** None — already connected correctly.

---

## 5. Google Search Appearance (Brief §5.8)

File: `index.html`, `src/hooks/useSEO.ts`

| Ask | Status |
|---|---|
| Homepage title: "Grags — Modern Tailoring, Pakistan \| Premium Menswear" | ❌ Current title is `Grags` (index.html:6) and OG title is `Grags — Wear The Unique`. Needs literal copy swap — trivial. |
| Homepage meta description (client's exact copy) | ❌ Current description is the old brand copy. Trivial swap. |
| Per-collection unique title/description | ❌ **Real gap.** `useSEO()` is only called from `ProductDetail.tsx` and `JournalArticlePage.tsx`. `CollectionPage.tsx` and `CategoryPage.tsx` never call it, so every collection/category page inherits the static homepage `<title>`/description from `index.html`. This is the one SEO item that's genuine, scoped work: wire `useSEO()` into both pages using each collection's `title`/`subtitle` (already stored in `settingsStore`'s `Collection` type) to build a unique title + description per page. |
| Transparent-background logo for Google/social preview | ❓ Needs verification, not necessarily a code fix. `public/logo.png` (used as `og:image`) already appears to be a light/transparent-background asset in this repo — it's the same file used site-wide with a `dark:invert` CSS class, which only makes sense if it's transparent. The "dark background" the client sees in live Google results is more likely a **stale Google cache** (Google hasn't recrawled since a previous dark-background version was indexed) than a current code bug. **Action: after deploying the title/meta changes, submit the homepage + logo URL for re-indexing in Google Search Console rather than assuming the asset itself needs re-exporting.** If it's still wrong after a fresh crawl, re-export `logo.png` as true transparent PNG at that point. |
| "GRAGS" → "Grags" in search results | ⚠️ Depends on the title tag fix above (Google mostly renders whatever the `<title>` says) — bundled into item 1. |

---

## 6. Header (Brief §5.9)

Files: `src/components/AnnouncementBar.tsx` (the persistent top strip — this **is** the header's WhatsApp/Track Order/Store Location row), `src/components/Navbar.tsx`, `src/store/settingsStore.ts`

| Ask | Status |
|---|---|
| WhatsApp, Track Order, Store Location — consistent formatting | ✅ Already consistent (all Title Case, same icon+label pattern) in `AnnouncementBar.tsx`. Client's brief may be describing an older layout. |
| Admin-editable WhatsApp number | ✅ `settings.whatsappNumber`, already wired into the header |
| Admin-editable Track Order link | ✅ `settings.trackOrderUrl`, already wired into the header |
| Store Location(s) with Google Maps integration | ⚠️ **Partial.** A single `storeLocation` string + one `googleMapsUrl` exists and is already wired into the header's "Store Location" popup — but it's **one location only**. Client explicitly wants multiple locations supported. **Real gap: need to change `storeLocation`/`googleMapsUrl` from single strings to an array of `{ name, address, googleMapsUrl }` in `settingsStore.ts`, update the admin Settings tab to manage a list, and update the `AnnouncementBar` popup to list all of them.** |
| Header updates when admin panel changes settings (client says only footer updates today) | ✅ Already fixed / not reproducible in current code — both `Footer.tsx` and `AnnouncementBar.tsx`/`Navbar.tsx` read from the same `useSettings()` hook, which fetches from MongoDB on mount. If this is still visibly broken in production, it's the same root cause as Item 1 (env var / silent save failure), not a separate header-specific bug. |
| Admin-editable header promo line | ✅ **Done.** Added `announcementText` to `settingsStore.ts`, a new "Header Announcement Line" field in the Admin Settings tab, and rendering as a second line under the existing Track Order/WhatsApp/Store Location row in `AnnouncementBar.tsx` (hidden entirely when left blank). Syncs the same way every other setting does (MongoDB via `netlify/functions/settings.cjs`, schemaless so no backend change needed). |
| Mega-menu / dropdown per collection (Diners.pk-style) | ❌ **Real gap.** `Navbar.tsx`'s desktop nav (`navLinks`) is a flat list of static links (`New In`, `Summer`, `Winter`, `Tops`, `Bottoms`, `Essentials`, `Heritage`, `Journals`, `About Us`) with no dropdown behavior at all. The `settingsStore.Collection` type already has a `sections` array (sub-groupings) built for exactly this purpose (currently only used on `CollectionPage.tsx` as in-page anchors) — this is the natural data source for a hover/click mega-menu. Needs real UI work: a `NavigationMenu`-based dropdown (the `@radix-ui/react-navigation-menu` dependency is already installed but unused) showing each collection's sections on hover/click. |

---

## 7. Individual Color/Size Stock (Brief §5.10)

**Status: ✅ Already fully implemented, front-to-back.**

- Admin: `ProductForm` has a full stock-by-size×color grid (`variantStock`, keyed `"${color}|${size}"`), falling back to the overall `stock` field when a cell is left blank.
- Storefront: `ProductDetail.tsx` calls `getVariantStock(product, color, size)` to disable out-of-stock size buttons and to block "Add to Cart" (`getVariantStock(...) <= 0` check on line 369) for the selected combination.
- Per-product size chart: ✅ both a table builder (`sizeChart.headers`/`rows`) and an image upload (`sizeChartImage`, which takes priority if set) already exist in `ProductForm`, and are rendered on the product page via the `SizeGuide` component.
- Generic/global size chart under Settings, which the client wants removed: **not found anywhere in the current Settings tab** — it may have already been removed in a previous pass, or the client is recalling an old version. Nothing to delete.

**Real work:** None — recommend a quick regression test only (verify a product with 2 colors × 3 sizes correctly blocks out-of-stock combos in the cart).

---

## 8. Journal Management (Brief §5.11)

Files: `src/pages/JournalPage.tsx`, `src/pages/JournalArticlePage.tsx`, `src/store/journalStore.ts`

| Ask | Status |
|---|---|
| Individual page per journal entry (not just the list) | ✅ `JournalArticlePage.tsx` exists, routed via `getArticleUrl()`, fully renders title/tag/date/content/keywords/external link |
| Control image placement (top/bottom/left/right) | ✅ `imagePosition` field on `JournalArticle`, editable in Admin, rendered correctly in all 4 positions on the article page |
| Keyword field → shows up correctly in Google search | ✅ `article.keywords` is passed into `useSEO()`, setting the `<meta name="keywords">` tag on the article page |
| Google Drive image link bug | ✅ **Already fixed.** `journalStore.ts` has a `resolveImageUrl()` function specifically written to rewrite `drive.google.com/file/d/...` and `.../open?id=...` share links into Drive's direct-content endpoint, and both the admin preview and the live article page use it. |
| Inline shoppable link in article text | ⚠️ **Partially done.** The article body already supports a markdown-lite `[Product Name](https://...)` syntax that renders as a real clickable inline link (`renderInline()` in `JournalArticlePage.tsx`). What's *not* supported is the client's literal example — a bare line like `Visit: https://link` auto-linkifying without brackets. **Small real gap: add plain-URL auto-linking (regex-detect `https?://…` substrings and wrap them in `<a>`) alongside the existing bracket syntax, so admins don't have to learn markdown syntax to add a shoppable link.** |

---

## 9. Loading Screen (Brief §5.12)

File: `src/components/CinematicLoader.tsx`

Client describes a "large, uneven gap" between "Grags" and "Wear" text. The current implementation doesn't match that description at all — it's a single logo image (which contains the "GRAGS" wordmark) followed by one tagline line ("Wear The Unique") with a deliberate `mt-6` gap and heavy letter-spacing (`tracking-[0.6em]`), which reads as intentional, not broken. **This looks like it was already redesigned/fixed since the client's brief was written**, or the client is describing a different (perhaps mobile-only) rendering we haven't visually reproduced yet.

**Real work:** ❓ Needs a live visual check on the actual deployed site (ideally on the client's own device/browser) before touching this — there's a real risk of "fixing" something that isn't broken in the current code. Recommend confirming with a screenshot from the client first.

---

## 10. Meta Pixel (separate doc)

**Status: ✅ The current implementation already matches almost the entire spec.** This is the single biggest gap between the client's complaint and reality.

The client's doc describes a pixel that "fires every standard event on every page load... every visitor logged as a Purchase at Rs 0." **That is not what the current code does.**

- `index.html` base block: exactly matches the client's Step 1 spec — only `fbq('init', ...)` + `fbq('track', 'PageView')`, nothing else, in the `<head>`, plus the correct `<noscript>` fallback.
- `ViewContent` — fires in `ProductDetail.tsx` on page load, with real dynamic `content_ids`/`content_name`/`value` from the product record. ✅ Matches Step 2.
- `AddToCart` — fires in `ProductCard.tsx` and `ProductDetail.tsx` only inside the actual button click handler, with real product data. ✅ Matches Step 3.
- `InitiateCheckout` — fires in `CheckoutPage.tsx` on checkout page load only, with real cart contents (`items.map(...)`, real `subtotal`). ✅ Matches Step 4.
- `Purchase` — fires in `CheckoutPage.tsx`'s `handleSubmit`, only after `addOrder()` is called (i.e., only after a real order is created), using the real order `total` and real product IDs — **not** a hardcoded Rs 0, and **not** fired on the cart/checkout page load. ✅ Matches Step 5.
- `Contact` — fires on real WhatsApp/FAQ-form interactions (`Navbar.tsx`'s About/FAQ form, `LegalPages.tsx`). ✅ Matches Step 6.

**Extra events beyond the spec (all correctly gated behind real user actions, not page load):**
- `CompleteRegistration` (`AuthModal.tsx`) — fires only on successful sign-up submit. The client's brief says not to add this "unless a registration feature actually exists" — it does (the site has real sign-up), so this is compliant with the *intent* of the rule even though it wasn't explicitly whitelisted.
- `Subscribe` (`NewsletterSection.tsx`) — fires only on successful newsletter submit, `value: "0.00"` (standard/expected for a non-transactional signup, not "fake data" the way the client's complaint describes). Same reasoning — newsletter signup is a real, existing feature.
- `FindLocation` (`AnnouncementBar.tsx`) — fires only on a real Store Location click. Not in the client's list of standard/whitelisted events, but harmless and accurately gated.

**Real work:** None required to meet the spec as written. Two optional, low-priority items:
1. If the client wants to be maximally strict to their written list, `FindLocation` could be removed since it's not one of the 6 named events — but it's low-risk to leave (real action, no fake data).
2. Prep the `event_id` deduplication field (order ID) on the client-side `Purchase` call now, so it's a one-line addition later when/if server-side Conversions API is added — not urgent since CAPI doesn't exist yet.

**Recommendation to relay to the client:** Have them re-run Meta Pixel Helper / Test Events against the *current* live site before we touch anything here — there's a real chance this entire document describes a state that's already been fixed, and spending dev time "fixing" already-correct pixel code risks introducing a regression.

---

## Summary: Actual scoped work (ranked by client's own priority order — mobile/speed/price+cart visibility first, polish last)

Genuinely missing or mismatched, in recommended build order:

1. **Checkout pricing rules** — COD free-above-3000 logic (needs the missing fee number from client), replace BT's flat PKR 200 discount with a "Free Delivery" tag, asterisks + optional postal code. *(Directly affects priority #3: price/checkout clarity.)*
2. **Admin save-failure visibility** — surface MongoDB write failures instead of silently swallowing them; confirm `MONGODB_URI` is set in Netlify production. *(Root-cause fix for the client's #1 complaint.)*
3. **Per-collection SEO** — wire `useSEO()` into `CollectionPage.tsx`/`CategoryPage.tsx`; update homepage title/description copy in `index.html` to client's exact requested text.
4. **Multi-location store support** — extend `settingsStore` from one `storeLocation` string to a list; update admin UI + header popup.
5. **Header mega-menu** — build a hover/click dropdown per collection using the already-modeled `Collection.sections` data and the already-installed (but unused) Radix `NavigationMenu`.
6. **Journal plain-URL auto-linking** — small addition alongside the existing bracket-link syntax.
7. **Verify-only items** (no code needed unless testing reveals otherwise): reviews end-to-end, product keywords SEO, per-product stock/size chart, journal individual pages/image position/Drive fix, Meta Pixel.
8. **Needs a client screenshot before touching:** loading screen spacing — current code doesn't visually match the complaint.
9. **Needs a client decision:** COD-under-3000 fee amount; whether Stripe is actually wanted; final color palette / business email / WhatsApp order-confirmation yes-no (client's own §6, still open).
