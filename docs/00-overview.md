# 00 — Overview

## What this is

A Shopify theme built on the **Shopify + Tailwind + Alpine starter**. Most of
what follows describes the starter itself; this document is also the map of
where this theme diverges from it.

- **Liquid** for markup, **Tailwind v4** for styles, **Alpine 3** for behaviour
- **TypeScript** compiled by esbuild into a handful of bundles under `assets/`
- **liquid-ajax-cart** drives the cart; no page reloads for cart operations
- Deployed through the **Shopify GitHub integration** — see `01-setup.md`, this
  one has consequences

## Mental model

```
┌─────────────────────────────────────────────────────────────┐
│  Liquid renders the markup and hands data to Alpine through │
│  x-data attributes and <script type="application/json"> tags│
│                                                             │
│      sections/*.liquid  ──x-data──►  src/alpine/components  │
│      layout/theme.liquid ──window.theme──►  src/strings     │
│                                             src/money       │
│                                                             │
│  Shared state lives in Alpine stores, never in globals:     │
│      $store.ui · $store.cart · $store.tiers · $store.wishlist│
│                                                             │
│  Anything that needs fresh HTML asks Shopify for one section│
│  (?section_id=) instead of refetching the page — src/sections│
└─────────────────────────────────────────────────────────────┘
```

The rule that keeps this honest: **no business logic inside a `.liquid` file**.
Liquid renders and passes data down; behaviour lives in `src/`, typed and
bundled. See `04-liquid.md` for the few exceptions that earn their place.

## Layers

| Layer | Where | Purpose |
|---|---|---|
| Markup | `sections/`, `snippets/`, `layout/` | Liquid only — no `<script>` with logic |
| Behaviour | `src/alpine/` | Stores (shared state) and components (per-instance) |
| Web components | `src/elements/` | Self-contained widgets with their own lifecycle |
| Pure modules | `src/*.ts` | No DOM assumptions: money, quantity, scroll, sections |
| Types | `src/types/` | Shopify object shapes, Alpine magics, globals |
| Styles | `src/theme.css` | Tailwind entry plus the handful of global rules |
| Copy | `locales/` | UI strings and schema labels, `es` + `en` |

## What comes from the starter

Everything below is generic and should stay in sync with the starter. If you fix
a bug here, fix it there.

`helpers` · `money` · `scroll` · `sections` · `quantity` · `constants` ·
`strings` · `product-media` · `scroll-animate` · `types/*` ·
stores `ui` / `cart` / `debug` · components `slider` / `dropdown` / `collection` /
`product-info` / `sticky-add-to-cart` / `video-poster` / `popup` /
`promo-marquee` / `wishlist-page` · elements `gallery-zoom` / `predictive-search` /
`product-image-zoom` · `prodify/`

## What belongs to this theme

Documented in `06-theme-features.md`. These are opt-in features layered on top
of the starter — don't port them back without stripping the parts that only
make sense here.

| Module | Why it's specific |
|---|---|
| `judgeme.ts` + `product-reviews` | Integration with one particular review app |
| `stores/discount-tiers.ts` | Spend-more-save-more rules for this shop |
| `stores/wishlist.ts` | Fixed storage key and default copy |
| `money.ts` | Falls back to `es-ES` when `window.theme.moneyLocale` is unset |

## Where to go next

| I want to… | Read |
|---|---|
| Run it locally | `01-setup.md` |
| Understand the build and folders | `02-architecture.md` |
| Add a store, component or magic | `03-alpine.md` |
| Write a section or snippet | `04-liquid.md` |
| Update part of a page without reloading | `05-sections-api.md` |
| Touch reviews, tiers or the wishlist | `06-theme-features.md` |
| Add or translate copy | `07-i18n.md` |
| Keep it accessible | `08-accessibility.md` |
