# 06 — Theme-specific features

Everything here sits **on top of** the starter. Read this before porting any of
it back: each one carries assumptions that only hold for this shop.

## Discount tiers

Spend-more-save-more: cross a threshold, get a fixed discount.

| Piece | Where |
|---|---|
| Config | `layout/theme.liquid` → `window.theme.discountTiers` |
| Settings | `config/settings_schema.json`, three threshold/amount pairs |
| Logic | `src/alpine/stores/discount-tiers.ts` → `$store.tiers` |

Reads the cart from `$store.cart` rather than keeping a copy. Two decisions
worth knowing:

- **Progress uses `original_total_price`**, the gross subtotal. With
  `total_price` the bar jumps backwards the moment a discount applies.
- **Capped at three tiers** (`MAX_TIERS`), matching the settings schema.

Generic enough to move to the starter as an opt-in module: it already reads
its config from `window.theme` and does nothing when `count` is 0.

## Wishlist

Client-side only, no customer account, no API.

| Piece | Where |
|---|---|
| State | `src/alpine/stores/wishlist.ts` → `$store.wishlist` |
| Page | `src/alpine/components/wishlist-page.ts` |
| Toast | `snippets/wishlist-toast.liquid` |

Handles live in `localStorage` under a fixed key. The store listens for the
`storage` event so two open tabs stay in sync.

The wishlist page has no collection to render from, so it queries the search
endpoint with an alternate template:

```
/search?view=wishlist-loader&type=product&q=handle:a OR handle:b
```

Results come back in **relevance order, not the order they were saved**. That's
a known limitation of this approach, not a bug.

## Product reviews (Judge.me)

The messiest integration here, and the one most likely to break when the app
updates.

| Piece | Where |
|---|---|
| App layer | `src/judgeme.ts` |
| State and pagination | `src/alpine/components/product-reviews.ts` |

The app exposes its data inconsistently, so `readWidgetData()` tries
`window.jdgm`, then a data `<script>` tag, then falls back to scraping the
rendered widget. `scrapeReviews()` carries long selector lists on purpose: they
cover several versions of the app's markup.

There is no pagination API. To load a page we click the widget's own button and
wait for a `MutationObserver` to report reviews we haven't seen:

```ts
await withoutScrollJacking(async () => {
  button.click()
  await waitForNewReviews(knownUuids)
})
```

`withoutScrollJacking()` temporarily replaces `scrollIntoView` and `scrollTo`,
because the widget yanks the page to itself on every click.

**If reviews break after an app update**, the selectors in `judgeme.ts` are the
first place to look.

## Product media (video and 3D)

Player markup is rendered by Liquid into a JSON script tag and parsed on demand
by `src/product-media.ts`:

```liquid
<script type='application/json' data-product-media-html>
  { {{ m.id | append: '' | json }}: {{ m | media_tag: … | json }} }
</script>
```

The `| append: ''` matters — **JSON keys must be strings**, and `{{ m.id | json }}`
emits a bare number, which makes the whole payload unparseable. When that
happens every video and 3D model renders as an empty black box, so the parse
error is logged loudly rather than swallowed.

`model-viewer.min.js` is 1 MB and only loads when the product actually has 3D
media — see the guard in `layout/theme.liquid`.

## Prodify

Variant picker inherited from the starter, in `src/prodify/`. It owns the
variant `<select>`s and dispatches `variant:changed`, which several components
listen to: `productInfo`, `productMediaGallery`, `stickyAddToCart`.
