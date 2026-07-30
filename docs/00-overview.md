# 00 — Overview

## What this is

A Shopify theme starter: a complete storefront in Tailwind, with the behaviour
driven by typed Alpine modules instead of inline scripts.

- **Liquid** for markup, **Tailwind v4** for styles, **Alpine 3** for behaviour
- **TypeScript** compiled by esbuild into a handful of bundles under `assets/`
- **liquid-ajax-cart** drives the cart; no page reloads for cart operations

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
│      $store.ui · $store.cart · $store.tiers                 │
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
| Styles | `src/theme.css` | Tailwind entry, the design tokens, a few global rules |
| Copy | `locales/` | UI strings and schema labels, `en` + `es` |

## Design decisions worth knowing upfront

**Tokens live in code, not in the theme settings.** Colours, type, radii and
shadows are `@theme` values in `src/theme.css`. Themes often expose all of that
through `settings_schema.json`; this one deliberately doesn't, so restyling has
one obvious place and the settings stay about content and behaviour. See
`09-conventions.md`.

**Editor labels are written in English inline.** Section and settings schemas use
plain strings rather than `t:` keys. Storefront copy always goes through
`locales/`. One less file to keep in sync for labels only staff ever read.

**Icons are one snippet.** `snippets/icon.liquid` holds the whole set inline.
Splitting them into `assets/icon-*.svg` pays off past a hundred icons or when CSS
needs to reference them; at this size one file is easier to edit and costs no
extra requests.

## Where to go next

| I want to… | Read |
|---|---|
| Run it locally | `01-setup.md` |
| Understand the build and folders | `02-architecture.md` |
| Add a store, component or magic | `03-alpine.md` |
| Write a section or snippet | `04-liquid.md` |
| Update part of a page without reloading | `05-sections-api.md` |
| Know how the cart, filters or search work | `06-theme-features.md` |
| Add or translate copy | `07-i18n.md` |
| Keep it accessible | `08-accessibility.md` |
| Match the house style | `09-conventions.md` |
