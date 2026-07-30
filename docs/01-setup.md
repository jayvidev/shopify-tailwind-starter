# 01 — Setup

## Requirements

- Node 20+
- pnpm (this repo's `node_modules` was created with pnpm 11 — see the warning below)
- Shopify CLI, already a dev dependency

## Install and run

```bash
pnpm install
cp shopify.theme.toml.example shopify.theme.toml   # fill in your store
pnpm dev
```

`pnpm dev` runs three watchers in parallel:

| Script | What it watches |
|---|---|
| `shopify:dev` | Uploads to the dev theme, live reload, `--theme-editor-sync` |
| `css:dev` | Tailwind, `src/theme.css` → `assets/theme.css` |
| `js:dev` | esbuild, three bundles (see `02-architecture.md`) |

## Commands

| Command | Use |
|---|---|
| `pnpm build` | Production build: minified CSS and JS |
| `pnpm typecheck` | `tsc --noEmit` — esbuild strips types, it never checks them |
| `pnpm shopify theme check` | Liquid, schema and translation validation |
| `pnpm format` | Prettier over everything not in `.prettierignore` |
| `pnpm package` | Build + zip, for manual uploads |

Run all three checks before committing. They catch different things and none of
them is a superset of the others.

## Deploying ⚠️

The theme is connected to the store through the **Shopify GitHub integration**.
Shopify reads the files straight from the branch and **never runs a build**.

That means:

- The contents of `assets/` are **tracked and committed**. `.gitignore` lists the
  build output, but those files were added before that and stay tracked — git
  ignores nothing it already follows.
- **Run `pnpm build` before committing**, not before deploying. Whatever is on
  the branch is what the storefront serves.
- Committing a source change without rebuilding ships the previous JS silently.

```bash
pnpm build
git status --short assets/     # anything here still needs committing
```

## Requirements note

`node_modules` here is managed with pnpm. If `pnpm add` fails with
`ERR_PNPM_UNEXPECTED_STORE`, two pnpm versions are on the PATH with different
store layouts — align them, or call the newer binary explicitly.
