import type { Cart, DiscountTiersConfig } from '@/types/shopify'

declare global {
  /** Replaced at build time by esbuild's `--define`. */
  const process: { env: { NODE_ENV: string } }

  /** Theme-level config injected from Liquid. */
  type ThemeConfig = {
    moneyLocale?: string
    discountTiers?: DiscountTiersConfig
    strings?: Partial<Record<import('@/strings').StringKey, string>>
  }

  /** Minimal surface of the liquid-ajax-cart API that the theme uses. */
  type LiquidAjaxCart = {
    cart: Cart
    add(body: { items: Array<{ id: number | string; quantity: number }> }): Promise<unknown>
    change(body: { id: string; quantity: number }): Promise<unknown>
    update(body: { discount?: string }): Promise<{ cart?: Cart } | undefined>
  }

  interface Window {
    theme?: ThemeConfig
    liquidAjaxCart: LiquidAjaxCart
    Alpine: import('alpinejs').Alpine
    Shopify?: { designMode?: boolean }
    starter: {
      helpers: typeof import('@/helpers').default
      money: typeof import('@/money').default
    }
    initScrollAnimate?: () => void
  }
}

export {}
