import type { Cart, DiscountTier, DiscountTiersConfig } from '@/types/shopify'

const MAX_TIERS = 3

export type TierSegment = {
  threshold: number
  amount: number
  progress: number
  absPosition: number
  reached: boolean
}

/**
 * Spend-more-save-more tiers, configured from the theme settings.
 * Reads the cart from its own store rather than holding a copy.
 */
export default {
  name: 'tiers',
  store: () => ({
    discountTiersConfig: (window.theme?.discountTiers || {
      count: 0,
      tiers: [],
    }) as DiscountTiersConfig,

    get cartTotal(): number {
      const cart = window.Alpine.store('cart') as { cart: Cart | null }
      if (!cart?.cart) return 0

      // Gross subtotal before cart discounts, so the progress bar doesn't drop
      // backwards the moment a tier discount gets applied.
      return (cart.cart.original_total_price || cart.cart.total_price) / 100
    },

    get activeTiers(): DiscountTier[] {
      const count = Math.max(0, Math.min(MAX_TIERS, this.discountTiersConfig.count || 0))
      return this.discountTiersConfig.tiers.slice(0, count)
    },

    /** 0-based index of the highest tier reached, or -1. */
    get reachedTierIndex(): number {
      const tiers = this.activeTiers
      let reached = -1
      for (let i = 0; i < tiers.length; i++) {
        if (this.cartTotal >= tiers[i].threshold) reached = i
      }
      return reached
    },

    get currentTier(): DiscountTier | null {
      const index = this.reachedTierIndex
      return index >= 0 ? this.activeTiers[index] : null
    },

    get nextTier(): DiscountTier | null {
      const tiers = this.activeTiers
      const index = this.reachedTierIndex
      return index < tiers.length - 1 ? tiers[index + 1] : null
    },

    get tierRemaining(): number {
      const next = this.nextTier
      return next ? Math.max(next.threshold - this.cartTotal, 0) : 0
    },

    /** Per-segment fill plus each threshold's position along the whole bar. */
    get tierSegments(): TierSegment[] {
      const tiers = this.activeTiers
      if (!tiers.length) return []

      const total = this.cartTotal
      const maxThreshold = tiers[tiers.length - 1].threshold

      return tiers.map((tier, i) => {
        const segmentStart = i === 0 ? 0 : tiers[i - 1].threshold
        const segmentLength = tier.threshold - segmentStart
        const progress =
          segmentLength > 0
            ? Math.min(Math.max((total - segmentStart) / segmentLength, 0), 1) * 100
            : 100

        return {
          threshold: tier.threshold,
          amount: tier.amount,
          progress,
          absPosition: (tier.threshold / maxThreshold) * 100,
          reached: total >= tier.threshold,
        }
      })
    },

    get totalTierProgress(): number {
      const tiers = this.activeTiers
      if (!tiers.length) return 0

      return Math.min((this.cartTotal / tiers[tiers.length - 1].threshold) * 100, 100)
    },
  }),
}
