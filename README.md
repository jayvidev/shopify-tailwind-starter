<div align="center">
  <img src="./assets/using-mobile-phone.jpg" alt="Preview" width="600">
  <p></p>
</div>

<div align="center">

![Liquid](https://img.shields.io/badge/Liquid-7AB55C?style=flat&logo=shopify&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-8BC0D0?logo=alpine.js&logoColor=white)

</div>

# Shopify Tailwind Starter

This starter is configured for a manual build-and-commit workflow with direct Shopify Git integration. It does not use GitHub Actions for building or deploying; instead, all compiled production assets are tracked and committed directly to the Git repository.

## Workflow

1. **Local Development**:
   Run the local Shopify CLI dev server and automatically compile CSS and JS on change (watch mode):
   ```bash
   pnpm dev
   ```

2. **Build for Production**:
   Before making any commit or pushing changes, you must compile the assets locally:
   ```bash
   pnpm build
   ```
   This generates the production-ready files in the `assets/` folder (`theme.css`, `theme.js`, `prodify.js`).

3. **Commit & Push**:
   The compiled assets in `assets/` are tracked by Git (despite being ignored locally in `.gitignore`). When you commit and push to your main branch (e.g., `main`), Shopify's Git integration automatically pulls the repository and updates your theme.
   ```bash
   git add .
   git commit -m "Build and development changes"
   git push origin main
   ```

---

## Shopify CLI Setup

Create a `shopify.theme.toml` file in the root directory for local development:

```toml
[environments.development]
store = "your-store.myshopify.com"
theme = "" # Leave empty to use a safe, automatic development theme
store-password = "your-store-password" # only if the store has password protection
```

---

## Available Commands

| Command | Action / Purpose |
| :--- | :--- |
| `pnpm dev` | Starts the Shopify CLI local server and watches CSS/JS files. |
| `pnpm build` | Compiles and minifies CSS (Tailwind v4) and JS (esbuild) for production. |
| `pnpm format` | Formats all files with Prettier. |
| `pnpm package` | Builds the assets and packages the theme into a `theme.zip` archive. |
