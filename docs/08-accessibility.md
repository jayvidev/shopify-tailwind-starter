# 08 — Accessibility

Shopify's theme requirements set the bar: Lighthouse accessibility ≥ 90,
everything keyboard-reachable, a visible focus state, `alt` on every image,
labels tied to inputs.

## Focus

One global rule owns it, in `src/theme.css`. **No component should use
`focus:outline-none`** — that's how the theme ended up with fields that showed
nothing on focus.

```css
:focus-visible {
  outline: 2px solid var(--color-fg);
  outline-offset: 2px;
}
```

Text fields are the exception, for a reason worth knowing: **browsers match
`:focus-visible` on them even on a mouse click** — you're about to type, so the
intent is the same. The detached ring read as a second border floating around
the field, so fields get a 1px outline at `-1px` offset — it lands on their own
border — plus a soft halo that stays visible when that border is already dark:

```css
input:not([type='checkbox'], …):focus-visible {
  outline-color: var(--color-fg);
  box-shadow: 0 0 0 3px --alpha(var(--color-fg) / 15%);
}
```

The transparent outline in the resting state is what the transition animates
from — `outline-color` only animates if an outline already exists.

### Fields inside a wrapper

When the visual box is a wrapper — a search bar with an icon, an input with an
attached button — mark it `.field-focus` and the ring moves to the wrapper:

```liquid
<div class='field-focus flex items-center border …'>
  {% render 'icon', icon: 'search' %}
  <input …>
</div>
```

Two things make this work, both easy to break:

- `.field-focus:focus-within :focus-visible` silences the inner field. It needs
  `:focus-within` in the selector to out-specify the input rule — `:not()`
  inherits the weight of its heaviest argument, so the input rule scores (0,2,1).
- The focused field gets `z-index: 20`. **`z-index` applies to flex items even
  without `position`**, and the predictive search results header sits at `z-10`,
  so anything lower gets its bottom edge painted over.

## Focus traps

Every overlay traps focus with the Alpine focus plugin:

```liquid
x-trap.noscroll.inert='$store.ui.isMinicartVisible'
role='dialog'
aria-modal='true'
aria-label='…'
@keydown.escape.window='$store.ui.isMinicartVisible = false'
```

`.noscroll` locks the background, `.inert` takes everything outside out of the
tab order.

**Watch the autofocus.** `x-trap` focuses the first focusable child, and
programmatic focus on a text field counts as keyboard focus — so the ring
appeared before the shopper touched anything. The search panel uses
`.noautofocus` and focuses the panel itself (`tabindex="-1"`), which draws no
ring and keeps Tab working.

## Images

Every image needs `alt`. With `image_tag`, pass it explicitly — the filter does
**not** add one:

```liquid
{{ image | image_url: width: 800 | image_tag: alt: alt_text, loading: 'lazy' }}
```

Decorative images take `alt: ''`.

## Labels

Each input needs an id and a label pointing at it. Compute the id once and reuse:

```liquid
{%- assign option_id = 'Option-' | append: section.id | append: '-' | append: forloop.index0 -%}
<label for='{{ option_id }}'>{{ option.name }}</label>
{% render 'form-select', id: option_id, … %}
```

A `<label>` wrapping its input is also valid — that's implicit association, and
it's what `filter-checkbox.liquid` does.

## Skip link

In `layout/theme.liquid`, rendered with `button` so it matches everything
else, hidden until focused with `not-focus:sr-only`.

## Checking

- `pnpm shopify theme check` — catches missing `alt` among other things
- Lighthouse on home, collection and product
- Tab through a page: everything reachable, ring always visible, no focus
  escaping behind an open overlay
