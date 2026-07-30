# 04 — Liquid conventions

## File order

Every section and snippet follows the same order. A script checks it; keep it.

```liquid
{% doc %}          ← snippets only, always first
  …
{% enddoc %}

<div>…</div>       ← markup

{% stylesheet %}   ← CSS, never Liquid inside
  …
{% endstylesheet %}

{% schema %}       ← always last, nothing after it
  …
{% endschema %}
```

## Snippets: `{% doc %}`

Every snippet that takes parameters documents them. This isn't decoration —
`theme check` validates the calls against it and reports arguments a snippet
doesn't accept, and required arguments a caller forgot.

```liquid
{% doc %}
  Renders a product card.

  @param {object} product - The product to render
  @param {string} [class] - Extra classes on the card root
  @param {boolean} [show_stars] - Show the rating badge

  @example
  {% render 'product-card', product: product, show_stars: true %}
{% enddoc %}
```

Square brackets mean optional. Valid types: `string`, `number`, `boolean`,
`object` — **there is no `array`**, use `object`.

Keep it accurate. A documented parameter the snippet never reads is reported as
`UnusedDocParam`, and that has already caught real dead arguments here.

## `{% render %}` gotchas

Two mistakes that Liquid accepts silently but the linter catches:

```liquid
{% render 'form-input'          ❌ arguments need commas
   type: 'text'
   name: 'q' %}

{% render 'breadcrumb', title: page.title | default: 'Home' %}   ❌ no filters in arguments
```

Filters aren't allowed on `render` arguments. Compute first:

```liquid
{%- assign crumb = page.title | default: 'Home' -%}
{% render 'breadcrumb', title: crumb %}
```

## CSS

Use `{% stylesheet %}`, not `<style>`. Shopify deduplicates it — a section that
appears three times on a page emits its CSS once.

**Liquid is not rendered inside `{% stylesheet %}`.** Anything dynamic goes in as
a custom property on the element:

```liquid
<div class='section-padding' style='--section-padding-top: {{ section.settings.padding_top }}px'>

{% stylesheet %}
  .my-section { gap: var(--gap, 1rem); }
{% endstylesheet %}
```

Scope with the class declared in your schema (`"class": "section-x"`), which
Shopify puts on the section wrapper. Don't try to scope with `section.id` — it
won't interpolate.

`<style>` survives in exactly two snippets, both justified: `font-face.liquid`
needs `asset_url`, and `head-css.liquid` must apply before first paint.

## Layout utilities

Three utilities in `src/theme.css` cover what almost every section needs. Use
them instead of re-deciding the width and rhythm per section:

| Utility | Gives you |
|---|---|
| `page` | Max width plus the horizontal gutter |
| `section-spacing` | The vertical rhythm between sections |
| `grid-gap` | Product-grid gutters, halved on mobile |

```liquid
<div class='page section-spacing'>
```

Padding is not a per-section setting here. If a section needs to break the
rhythm, write the exception in its markup and say why.

## Inline `<script>`

Don't. Behaviour goes in `src/`. Three exceptions in the whole theme, each for a
reason CSS and bundles can't cover:

| Where | Why |
|---|---|
| `head-scripts.liquid` | Swaps `no-js` for `js` before first paint |
| `liquid-ajax-cart.liquid` | Plugin configuration, not logic |
| `layout/theme.liquid` | Fills `window.theme` from settings and locales |

`<script type="application/json">` is fine and encouraged — that's data, not
behaviour. JSON-LD blocks likewise.

One trap worth knowing: **JSON object keys must be strings**. `{{ media.id | json }}`
emits a bare number and produces invalid JSON. Use `{{ media.id | append: '' | json }}`.

## Schemas

**Editor labels are written inline, in English.** Storefront copy goes through
`locales/` (see `07-i18n.md`); schema labels don't, because they'd mean a second
translation file that only staff ever read. Section `name` is capped at
**25 characters**.

Settings cover content and behaviour. Colours, radii, shadows and type belong in
`src/theme.css` — see `09-conventions.md`.
