# 03 — Alpine

Everything is registered in one place: `src/alpine/index.ts`. Four arrays —
`stores`, `components`, `magics`, `directives` — and a `register()` that walks
them. Nothing is registered anywhere else.

## Stores vs components

| | Store | Component |
|---|---|---|
| Scope | One instance for the whole page | One per `x-data` element |
| Used for | State several sections share | Behaviour of one block of markup |
| Reached from Liquid | `$store.<name>.x` | `x-data='name({ … })'` |

If two sections need to agree on something, it's a store. If a section needs to
manage itself, it's a component. The header and the minicart both need to know
whether the drawer is open → `$store.ui`. A slider only concerns itself → component.

## The stores

| Store | Owns |
|---|---|
| `$store.ui` | Drawers, menus, search panel, scroll state, promo bar |
| `$store.cart` | Cart contents, in-flight flags, quantity changes, discount codes |
| `$store.tiers` | Spend-more-save-more progress (reads the cart store) |
| `$store.debug` | Focus logging, off by default |

Stores don't reach into each other's state to write. `cart` announces
`cart:item-added` and `ui` decides whether to open the drawer. Reading is fine
and explicit — `tiers` does `window.Alpine.store('cart')`, which makes the
dependency visible instead of hiding it behind shared `this`.

## Adding a store

```ts
// src/alpine/stores/example.ts
export default {
  name: 'example',
  store: () => ({
    isOpen: false,

    init() {
      // runs once, after Alpine.start()
    },

    toggle() {
      this.isOpen = !this.isOpen
    },
  }),
}
```

Import it in `alpine/index.ts` and add it to `stores`. Then add it to `Stores`
in `src/types/alpine.ts` so `$store.example` is typed inside components.

## Adding a component

```ts
// src/alpine/components/example.ts
import { defineData } from '@/types/alpine'

type Initial = {
  productId: number
  label?: string
}

export default {
  name: 'example',
  component: defineData((initial: Initial) => ({
    label: initial.label || '',

    init() {
      this.$store.ui.isFilterOpen   // typed thanks to defineData
    },
  })),
}
```

```liquid
<div x-data='example({ productId: {{ product.id }}, label: {{ title | json }} })'>
```

Rules that save time later:

- **Always `| json`** the values you interpolate. It quotes and escapes; a
  product title with an apostrophe breaks the attribute otherwise.
- **Declare an `Initial` type.** It's the only written contract between the
  Liquid and the TypeScript — nothing checks that call site.
- File name in kebab-case, `name` in camelCase: `product-info.ts` →
  `x-data='productInfo(…)'`.

## Magics

| Magic | Input | Output |
|---|---|---|
| `$money(1999)` | cents | Shopify money format |
| `$amount(19.99)` | plain number | locale-formatted number |

Both live in `src/alpine/magic/`. Reach for one when something is a pure
function of its arguments — it doesn't belong in a store just because Liquid
needs to call it.

## Custom elements

`src/elements/` is for widgets with their own lifecycle that don't need Alpine's
reactivity: the fullscreen gallery zoom, predictive search. They get their own
bundle and are loaded per page with `<script src>`.

Prefer a component. Reach for a custom element when the thing manages its own
DOM wholesale, or when it needs to work in markup Alpine doesn't own.

## Events

Names live in `src/constants.ts` — `EVENTS`, `CART_EVENTS`, `SECTION_EVENTS`.
Never type an event name as a literal in TypeScript.

Liquid can't import those constants, so `@variant:changed.window` is written by
hand there. If you rename an event, grep the `.liquid` files: nothing will warn
you, the handler will just stop firing.
