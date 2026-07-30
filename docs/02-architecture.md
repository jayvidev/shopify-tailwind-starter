# 02 — Architecture

## Folder map

```
src/
  theme.ts              # entry: registers Alpine, plugins, stores, components
  constants.ts          # event names, breakpoints, timings — no magic strings
  helpers.ts            # emitEvent, fetchHTML, debounce, throttle, cookies
  money.ts              # formatAmount, formatPrice, sanitizePrice, formatMoney
  quantity.ts           # quantity-rule maths shared by the two add-to-cart UIs
  scroll.ts             # scroll-container primitives
  scroll-animate.ts     # data-animate reveal-on-scroll
  sections.ts           # Section Rendering API — see 05-sections-api.md
  product-media.ts      # parses the video/3D payload rendered by Liquid
  strings.ts            # t() over window.theme.strings

  alpine/
    index.ts            # single registration point for everything below
    stores/             # shared state: ui · cart · discount-tiers · debug
    components/         # per-instance behaviour, one file per x-data name
    magic/              # $money, $amount

  elements/             # custom elements, bundled separately
  types/                # shopify.ts · alpine.ts · globals.d.ts · modules.d.ts
  prodify/              # variant picker: owns the option selects
```

## Build

Three esbuild entries, all with `--alias:@=./src`:

| Entry | Output | Loaded |
|---|---|---|
| `src/theme.ts` | `assets/theme.js` | Every page |
| `src/prodify/index.ts` | `assets/prodify.js` | Every page |
| `src/elements/*.ts` | `assets/<name>.js` | Per page, via `<script src>` |

Tailwind compiles `src/theme.css` → `assets/theme.css` separately.

The `elements/` entries exist so a 9 KB gallery zoom doesn't ride along on every
page. Add a file there and it gets its own bundle with no config change.

## Imports

**Always `@/`, never `../`.** The alias is configured in three places and all
three must agree: `tsconfig.json` (`paths`), the esbuild `--alias` flag, and
your editor via `tsconfig.json`.

```ts
import { fetchSection } from '@/sections'   // ✅
import { fetchSection } from '../../sections' // ❌
```

Extensions are omitted, so a file can move from `.js` to `.ts` without touching
a single importer.

## TypeScript

`strict: true`, and **esbuild does not typecheck** — it only strips types. A
build passing means nothing about type safety; `pnpm typecheck` is the gate.

`src/types/shopify.ts` is the single source of truth for Shopify object shapes
(`Cart`, `Variant`, `CartItem`, `QuantityRule`…). Import from there rather than
redeclaring; `prodify/types.ts` re-exports `Variant` for backwards compatibility.

`src/types/alpine.ts` exports `defineData()`. Wrap every component factory in it
so `this.$store`, `this.$refs` and `this.$watch` are typed inside the object:

```ts
component: defineData((initial: Initial) => ({
  init() {
    this.$store.cart.cart          // typed
  },
}))
```

## Data flow from Liquid

Three ways, in order of preference:

1. **`x-data` arguments** — component config. Always `| json` the values.
2. **`<script type="application/json">`** — larger payloads (see
   `data-product-media-html` in `sections/main-product.liquid`).
3. **`window.theme`** — global config set once in `layout/theme.liquid`:
   `strings`, `discountTiers`, `moneyLocale`. Typed in `types/globals.d.ts`.

What we don't do any more: assigning arbitrary globals like
`window.__productVideoHtml`. They're invisible to TypeScript and impossible to
trace.
