<div align="center">
  <a href="https://tailwind-css-starter.myshopify.com">
    <img src="./assets/readme.jpg" alt="Preview">
  </a>
  <p></p>
</div>

<div align="center">

![Liquid](https://img.shields.io/badge/Liquid-7AB55C?style=flat&logo=shopify&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-8BC0D0?logo=alpine.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

</div>

# Shopify Tailwind Starter

A complete storefront in Tailwind, with the behaviour in typed Alpine modules
instead of inline scripts.

- **Liquid** for markup, **Tailwind v4** for styles, **Alpine 3** for behaviour
- **TypeScript** bundled by esbuild — `pnpm typecheck` is the gate, esbuild only
  strips types
- **liquid-ajax-cart** for the cart: drawer, cart page and quick add never reload
- **Section Rendering API** for collection filters, sorting, load-more and
  predictive search

Design tokens — colours, type, radii, shadows — live in `src/theme.css`, not in
the theme settings. The settings cover content and behaviour.

## What's in it

| Area | Included |
|---|---|
| Cart | Drawer + cart page, line-level loading, discount codes, opt-in spend-more-save-more tiers |
| Collections | Filter sidebar, mobile filter drawer, sorting, price range, load more — all without reloads |
| Search | Predictive search panel plus a full results page sharing the filter UI |
| Product | Variant switching, gallery with deferred video/3D, quantity rules, sticky add to cart |
| Content sections | Image banner, slideshow, featured collection, collection list, multicolumn, rich text, collapsible content, video, newsletter |
| Templates | Product, collection, search, cart, blog, article, page, contact, 404, password, gift card, customer accounts |

## Getting started

```bash
pnpm install
cp shopify.theme.toml.example shopify.theme.toml   # fill in your store
pnpm dev
```

`shopify.theme.toml`:

```toml
[environments.development]
store = "your-store.myshopify.com"
theme = ""                        # empty uses a development theme
store-password = "…"              # only for password-protected stores
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Shopify CLI dev server plus Tailwind and esbuild in watch mode |
| `pnpm build` | Minified CSS and JS for production |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm shopify theme check` | Liquid, schema and translation validation |
| `pnpm format` | Prettier, including the Liquid plugin |
| `pnpm package` | Build, then zip the theme for a manual upload |

Run all three checks before committing — they catch different things:

```bash
pnpm typecheck && pnpm build && pnpm shopify theme check
```

## Deploying

The theme is served through the **Shopify GitHub integration**: Shopify reads the
branch and never runs a build, so the compiled `assets/` are committed.

```bash
pnpm build          # always before committing
git add .
git commit -m "…"
git push
```

Committing a source change without rebuilding ships the previous JS silently.
`pnpm package` builds and zips instead, for a manual upload.

## Documentation

`docs/` is the long version, and it's worth reading before adding anything:

| File | Covers |
|---|---|
| [`00-overview.md`](docs/00-overview.md) | The mental model and the design decisions |
| [`01-setup.md`](docs/01-setup.md) | Running it locally, commands, deploying |
| [`02-architecture.md`](docs/02-architecture.md) | Folder map, bundles, imports, types |
| [`03-alpine.md`](docs/03-alpine.md) | Stores, components, magics, events |
| [`04-liquid.md`](docs/04-liquid.md) | Section and snippet conventions |
| [`05-sections-api.md`](docs/05-sections-api.md) | Updating part of a page without a reload |
| [`06-theme-features.md`](docs/06-theme-features.md) | How the cart, filters, search and product page work |
| [`07-i18n.md`](docs/07-i18n.md) | Copy, translations, schema labels |
| [`08-accessibility.md`](docs/08-accessibility.md) | Focus, drawers, labels |
| [`09-conventions.md`](docs/09-conventions.md) | Naming, comments, styling, what fails silently |
| [`ai-prompts.md`](docs/ai-prompts.md) | Prompts for coding agents that follow these conventions |

## License

MIT
