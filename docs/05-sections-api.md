# 05 — Section Rendering API

## The idea

To refresh part of a page, ask Shopify for **one section** instead of the whole
document:

```
/collections/sofas?filter.v.price.gte=100&section_id=main
```

The response is just that section's HTML. Filtering a collection used to fetch
the entire page — header, footer, meta, every script — and throw away most of it.

## Helpers

`src/sections.ts`:

| Function | Does |
|---|---|
| `sectionUrl(id, url?)` | Adds `section_id` to a URL |
| `fetchSection(id, url?)` | Fetches and parses into a `Document` |
| `setInnerHTML(el, html)` | Sets HTML **and re-creates `<script>` tags** |
| `replaceSelector(doc, sel)` | Copies `sel`'s contents from `doc` onto the page |

## Usage

```ts
const html = await fetchSection(this.sectionId, url)

replaceSelector(html, '#ProductGridContainer')
for (const id of FILTER_CONTAINERS) replaceSelector(html, id)
```

The section id comes from Liquid, because the component can't know it:

```liquid
<div x-data='collection({ sectionId: "{{ section.id }}" })'>
```

`collection.ts` falls back to fetching the full page when `sectionId` is missing,
so the component still works outside a section.

## Why `setInnerHTML` exists

Assigning `innerHTML` **does not execute `<script>` tags**. Sections carry JSON
data scripts and app embeds, so the helper re-creates each script node to keep
them alive. Use it instead of `el.innerHTML = html` whenever the HTML comes from
a section.

## Where it's used

| Module | Fetches |
|---|---|
| `alpine/components/collection.ts` | Grid and filters, on filter/sort/paginate |
| `elements/predictive-search.ts` | `predictive-search-results` and `search-count` |

## Gotchas

- Only works for sections rendered by a **JSON template**. The id is the key in
  `templates/*.json` — usually `main`.
- The section must be self-contained. If the markup you want to swap lives half
  inside the section and half outside, this won't help.
- The URL keeps its query string, so filters and pagination come along.
- It's a normal navigation-less fetch: **no `popstate` entry**. Push state
  yourself if the URL should change.
