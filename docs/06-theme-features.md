# 06 — Theme features

The parts with real behaviour behind them. Each one is markup wired to a module
in `src/`, so the Liquid stays declarative.

## Cart

liquid-ajax-cart owns the requests; the theme owns the state and the markup.

| Piece | Where |
|---|---|
| Boot and back/forward guard | `snippets/liquid-ajax-cart.liquid` |
| State, loading flags, discount codes | `src/alpine/stores/cart.ts` → `$store.cart` |
| Drawer | `snippets/minicart.liquid` |
| Cart page | `sections/main-cart.liquid` |

Both are wrapped in `data-ajax-cart-section`, so the library re-renders that
markup after every request. **The Liquid inside is always the server's truth**;
`$store.cart` only drives loading spinners, disabled states and error copy.

Two things worth knowing:

- `processingId` holds the line key (or variant id) currently in flight, which
  is how a single line item can show a spinner while the rest stay usable.
- Applying a discount code checks the resulting cart for that code. Shopify
  returns 200 even when the code doesn't apply, so the response alone tells you
  nothing.

## Discount tiers (opt-in)

Spend-more-save-more: cross a threshold, get a fixed discount. Off by default —
set *Theme settings → Cart → Active tiers* above 0.

| Piece | Where |
|---|---|
| Config | `layout/theme.liquid` → `window.theme.discountTiers` |
| Logic | `src/alpine/stores/discount-tiers.ts` → `$store.tiers` |
| Markup | `snippets/cart-discount-tiers.liquid` |

- Reads the cart from `$store.cart` rather than keeping a copy.
- **Progress uses `original_total_price`**, the gross subtotal. With
  `total_price` the bar jumps backwards the moment a discount applies.
- Capped at three tiers (`MAX_TIERS`), matching the settings schema.
- The settings only drive the display. Create the matching automatic discounts
  in the Shopify admin.

## Collection and search filtering

One component behind both templates: `src/alpine/components/collection.ts`.

| Piece | Where |
|---|---|
| Grid, sidebar, drawer, load-more | `snippets/product-grid-filters.liquid` |
| The filter form itself | `snippets/product-filters-form.liquid` |
| Templates | `sections/main-collection.liquid`, `sections/main-search.liquid` |

Filtering, sorting and pagination all go through `?section_id=` requests and
`history.pushState`, so the page never reloads. That makes the DOM ids a
contract — the component replaces `#ProductGridContainer`, `#ProductGrid`,
`#LoadMoreContainer`, `#ProductCount` and the four filter form ids. Rename one in
Liquid and filtering silently stops updating that part of the page.

Details that took a while to get right:

- **Price inputs are debounced and only fire once both ends have a value**,
  otherwise typing "1" in the minimum triggers a request for everything over £1.
- **Sorting dispatches `sort:select`** instead of submitting the form, so every
  URL change goes through one place.
- **`handleLinkClick`** intercepts pagination and clear-filter links; everything
  else navigates normally.

## Predictive search

| Piece | Where |
|---|---|
| Panel | `snippets/predictive-search.liquid` |
| Element | `src/elements/predictive-search.ts` |
| Results | `sections/predictive-search-results.liquid` |

The element debounces the input and swaps in the rendered
`predictive-search-results` section, so results are Liquid, not JSON assembled in
JS. It then fetches `search-count` from the real search page, because the
predictive endpoint doesn't return a total.

## Product page

| Piece | Where |
|---|---|
| Variant switching | `src/prodify/` |
| Quantity and button state | `src/alpine/components/product-info.ts` |
| Gallery | `src/alpine/components/product-media-gallery.ts` |
| Sticky add to cart | `src/alpine/components/sticky-add-to-cart.ts` |

Prodify owns the option `<select>`s and dispatches `variant:changed`, which the
other three listen for. Add a new piece of variant-aware UI by listening to that
event rather than by reaching into Prodify.

Player markup for video and 3D is rendered by Liquid into a JSON script tag and
mounted on demand by `src/product-media.ts` — a product with ten videos still
loads one image. `model-viewer.min.js` is 1 MB and only loads when the product
actually has 3D media; see the guard in `layout/theme.liquid`.

## Promo bar

`sections/promo-bar.liquid` plus `src/alpine/components/promo-marquee.ts`.

The component repeats the announcements until they overflow the track (no gap
before the loop) and then sets the animation duration from the measured width.
The setting is **pixels per second**, so the bar scrolls at the same speed on
every page regardless of how much copy it holds.
