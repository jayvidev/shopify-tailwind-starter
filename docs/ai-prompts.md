# AI prompts

Paste into Claude Code / Cursor / Copilot Chat. Replace the angle-bracket
placeholders.

## Add an Alpine component

> Create a new Alpine component `<name>` following the conventions in
> `docs/03-alpine.md`:
> 1. `src/alpine/components/<kebab-name>.ts`, default-exporting `{ name, component }`
>    with the factory wrapped in `defineData()` and an explicit `Initial` type.
> 2. Register it in `src/alpine/index.ts`.
> 3. Use it from Liquid as `x-data='<camelName>({ … })'`, passing every value
>    through `| json`.
> Import with `@/`, never relative paths. Run `pnpm typecheck` when done.

## Add a store

> Add an Alpine store called `<name>` per `docs/03-alpine.md`:
> 1. `src/alpine/stores/<name>.ts` exporting `{ name, store }`.
> 2. Register it in `src/alpine/index.ts` and add it to `Stores` in
>    `src/types/alpine.ts` so `$store.<name>` is typed.
> If it needs another store's data, read it with `window.Alpine.store('<other>')` —
> don't duplicate the state.

## Add a section

> Create the section `sections/<name>.liquid` following `docs/04-liquid.md`:
> markup, then `{% stylesheet %}`, then `{% schema %}` last. Use the
> `page` and `section-spacing` utilities instead of
> writing padding CSS. Schema labels are plain English strings, not `t:` keys;
> storefront copy goes through `locales/en.default.json` and `locales/es.json`.
> Section `name` must be 25 characters or fewer. Finish with
> `pnpm shopify theme check`.

## Add a snippet

> Create `snippets/<name>.liquid` starting with a `{% doc %}` block that
> documents every parameter (`@param {type} name - description`, square brackets
> for optional) and an `@example`. There is no `array` type — use `object`.
> Then verify with `pnpm shopify theme check`, which validates callers against
> the doc.

## Refresh part of a page without reloading

> Use the Section Rendering API as described in `docs/05-sections-api.md`:
> `fetchSection(sectionId, url)` and `replaceSelector(doc, selector)` from
> `@/sections`. Pass the section id from Liquid via `x-data`. Use
> `setInnerHTML` rather than assigning `innerHTML` so injected `<script>` tags
> still run.

## Add copy rendered by JavaScript

> Add the string `<key>` following `docs/07-i18n.md`: the key in the
> `javascript` object of `locales/es.json` and `locales/en.default.json`, an
> entry in `DEFAULTS` in `src/strings.ts`, and the value rendered into
> `window.theme.strings` in `layout/theme.liquid`. Read it with `t('<key>')`.

## Audit accessibility

> Check this theme against `docs/08-accessibility.md`: find `focus:outline-none`
> or `outline-none` on interactive elements, `image_tag` calls without `alt`,
> `<label>` without `for` whose input isn't nested, and overlays without
> `x-trap` / `role="dialog"` / Escape handling. Report what you find before
> changing anything.

## Port a module to the starter

> Move `<module>` from this theme to the starter. First check
> `docs/00-overview.md` to confirm it isn't theme-specific. Strip anything
> shop-specific: hardcoded Spanish, storage keys, third-party app selectors,
> business rules. Anything configurable should read from `window.theme` with a
> sane default. Keep the `@/` imports — the starter uses the same alias.
