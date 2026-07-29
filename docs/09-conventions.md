# 09 — Conventions

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `product-media-gallery.ts` |
| Alpine `name` | camelCase | `productMediaGallery` |
| Sections | kebab-case, `main-` for template mains | `main-collection.liquid` |
| Section class | matches the file | `"class": "section-hexacore-grid"` |
| CSS custom properties | kebab-case, prefixed by feature | `--section-padding-top` |
| Constants | SCREAMING_SNAKE at module top | `const DESKTOP_BREAKPOINT = 768` |

A section's file name is its identity: `templates/*.json` refers to it by
`"type"`. **Renaming a section means updating every template that uses it**, and
the merchant's saved settings are keyed by that type.

## No magic numbers or strings

Breakpoints, timings and event names live in `src/constants.ts`. If you're about
to write `768` or `'variant:changed'` in a module, import it instead.

## Comments

Comment the **why**, never the what. If a comment restates the code, delete it —
in TypeScript the signature already says what it takes and returns.

Worth a comment: a non-obvious workaround, a spec quirk, a decision that looks
wrong until you know the reason.

```ts
// Gross subtotal before cart discounts, so the progress bar doesn't drop
// backwards the moment a tier discount gets applied.
return (cart.original_total_price || cart.total_price) / 100
```

## Before committing

```bash
pnpm typecheck && pnpm build && pnpm shopify theme check
```

Three different tools catching three different classes of problem, and none is a
superset of another:

- **`typecheck`** — types. esbuild strips them without ever checking.
- **`theme check`** — Liquid syntax, `render` arguments against `{% doc %}`,
  schema validity, translations.
- **the browser** — everything else. All three passed while a section rendered
  invisible and product videos showed as black boxes. Green checks are necessary,
  not sufficient.

Note the CLI's theme check is **older than the VS Code extension's**. The
extension flags real Liquid syntax errors the CLI misses, so don't treat a clean
CLI run as proof.

## Formatting

Prettier with the Liquid plugin. `assets/` is ignored wholesale — it's build
output, and formatting it fights the next build.

## Build output

`assets/` is committed on purpose — see `01-setup.md`. **Run `pnpm build` before
committing**, or you ship the previous JS.

## Things that fail silently

The list of ways this stack breaks without telling you:

| Symptom | Cause |
|---|---|
| A binding does nothing | `$store.x.y` doesn't exist — Alpine doesn't throw |
| A `render` argument is ignored | The snippet never reads it |
| CSS rule never applies | Scoped to a class the markup doesn't have |
| Video renders as a black box | Malformed JSON payload |
| Element stuck at `opacity: 0` | Zero size, so the reveal observer skips it |
| Editor shows `t:sections.…` | Missing translation key |

Most were found by clicking around, not by tooling. When you change something
structural, open the page.
