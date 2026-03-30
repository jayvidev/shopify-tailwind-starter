# Shopify Tailwind Starter

## Shopify CLI

To easily log into your preferred store and theme, create a `shopify.theme.toml` in the root directory and define your environment details.

Copy this example into `shopify.theme.toml` and replace the placeholders:

```toml
[environments.development]
store = "your-store.myshopify.com"
theme = "" # Leave empty to use a safe, automatic development theme
store-password = "your-store-password" # only if store has password protection

[environments.staging]
store = "your-store.myshopify.com"
theme = "your-theme-id"
ignore = ["templates/*", "config/*"]

[environments.production]
store = "your-store.myshopify.com"
theme = "your-theme-id"
ignore = ["templates/*", "config/*"]
```

### Commands

| Command           |                         Purpose                          |                                          Notes                                          |
| ----------------- | :------------------------------------------------------: | :-------------------------------------------------------------------------------------: |
| `pnpm dev`        |   Develop with Shopify CLI dev server + CSS/JS watch     | See [Development Themes](https://shopify.dev/docs/themes/tools/cli#development-themes)  |
| `pnpm build`      |          Build CSS and JS for production                 |                    Generates `assets/theme.css`, `theme.js`, `prodify.js`               |
| `pnpm deploy`     |  Build and push to production environment (via toml)     |               Uses `production` environment from **shopify.theme.toml**                 |
| `pnpm format`     |              Format all files with Prettier              |                                                                                         |

For all other Shopify CLI theme commands see [Shopify CLI commands for themes](https://shopify.dev/docs/themes/tools/cli/commands).

## CSS

[Tailwind CSS v4](https://tailwindcss.com) is compiled with **Tailwind CLI** from `src/entrypoints/theme.css` → `assets/theme.css`.

Additionally, **src/css/global.css** can be used for global styles and is not tree-shaken.

Fonts are declared in `snippets/font-face.liquid` and loaded via Shopify CDN (`asset_url`). Font files live in `assets/`.

## JavaScript

Built with **esbuild** — fast, zero-config bundler with native TypeScript support.

Entry points:
- `src/entrypoints/theme.js` → `assets/theme.js` (Alpine.js + Liquid Ajax Cart)
- `src/js/prodify/index.ts` → `assets/prodify.js` (variant picker logic)

### Alpine.js

[Alpine.js](https://alpinejs.dev/start-here) is included with plugins (Collapse, Focus, Morph). Stores, components, and directives live in **src/js/alpine** and are registered in **src/js/alpine/index.js**. Reference **src/js/alpine/components/dropdown.js** to see an example component.

> When adding a new store or component, import it explicitly in `src/js/alpine/index.js`.

## Assets

Static assets (fonts, images) are versioned directly in `assets/`. Generated files (`theme.css`, `theme.js`, `prodify.js`) are gitignored and built by GitHub Actions on each push to main.

## Included Goodies

### Liquid Ajax Cart

[Liquid Ajax Cart](https://liquid-ajax-cart.js.org/) library is installed and its directives are used throughout the Starter sections. Provides an out-of-the-box working AJAX cart (minicart).

> Starter uses v2 of Liquid Ajax Cart. See [differences-from-v1](https://liquid-ajax-cart.js.org/v2/differences-from-v1/)

### Predictive Search

The Shopify provided predictive search is included and can be enabled in the theme customizer. To remove it, delete the reference from **theme.liquid**.

### Prodify

Prodify is a rework of the Shopify Dawn theme's custom element logic for handling variant pickers on the PDP. See **src/js/prodify**.
