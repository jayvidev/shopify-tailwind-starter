<div align="center">
  <a href="https://tailwind-css-starter.myshopify.com">
    <img src="./docs/assets/readme.jpg" alt="Preview">
  </a>
  <p></p>
</div>

<div align="center">

# Shopify Tailwind Starter

![Liquid](https://img.shields.io/badge/Liquid-7AB55C?style=flat&logo=shopify&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-8BC0D0?logo=alpine.js&logoColor=white)

</div>

Shopify theme built with **Liquid**, **Tailwind CSS v4**, **Alpine.js 3** and **TypeScript**.

## Tech Stack & Features

- **Liquid + Tailwind CSS v4**: Design tokens and typography in [`src/theme.css`](./src/theme.css) via `@theme`.
- **Alpine.js 3 + TypeScript**: Modular components and stores registered in [`src/alpine/index.ts`](./src/alpine/index.ts), bundled via esbuild into `assets/`. No business logic inside `.liquid` files.
- **Cart**: Powered by `liquid-ajax-cart` without full page reloads.
- **Section Rendering API**: Native dynamic updates for filters and search via `?section_id=`.

## Quickstart

```bash
pnpm install
cp shopify.theme.toml.example shopify.theme.toml   # fill in your store
pnpm dev
```

## Scripts

| Script | What |
|--------|------|
| `pnpm dev` / `build` | Theme watchers / Production build |
| `pnpm typecheck` | Validate TypeScript (`tsc --noEmit`) |
| `pnpm shopify theme check` | Validate Liquid syntax and configuration |
| `pnpm format` | Prettier code formatting |

## Docs

1. [00 — Overview](./docs/00-overview.md)
2. [01 — Setup](./docs/01-setup.md)
3. [02 — Architecture](./docs/02-architecture.md)
4. [03 — Alpine](./docs/03-alpine.md)
5. [04 — Liquid conventions](./docs/04-liquid.md)
6. [05 — Section Rendering API](./docs/05-sections-api.md)
7. [06 — Theme features](./docs/06-theme-features.md)
8. [07 — Copy and translations](./docs/07-i18n.md)
9. [08 — Accessibility](./docs/08-accessibility.md)
10. [09 — Conventions](./docs/09-conventions.md)
11. [AI Prompts](./docs/ai-prompts.md)

## License

MIT
