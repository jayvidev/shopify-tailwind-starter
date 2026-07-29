import { boundsFromRule, decrement, increment, snapToStep } from '@/quantity'
import { t } from '@/strings'
import { defineData } from '@/types/alpine'
import type { Variant } from '@/types/shopify'

type Initial = {
  variantId: number | null
  available: boolean
  inventoryQty: number
  managedDeny: boolean
  strings: { soldOut: string; addToCart: string }
  minQty?: number
  stepQty?: number
  ruleMax?: number
}

export default {
  name: 'productInfo',
  component: defineData((initial: Initial) => ({
    variantId: initial.variantId,
    available: initial.available,
    inventoryQty: initial.inventoryQty,
    managedDeny: initial.managedDeny,
    strings: initial.strings,
    minQty: initial.minQty || 1,
    stepQty: initial.stepQty || 1,
    ruleMax: initial.ruleMax || 0,
    qty: initial.minQty || 1,
    adding: false,
    loading: false,

    get inCart(): number {
      const items = this.$store.cart.cart?.items || []

      return items.find((item) => item.variant_id === this.variantId)?.quantity || 0
    },

    get maxQty(): number {
      let max = 999
      if (this.managedDeny && this.inventoryQty > 0) {
        max = Math.max(this.minQty, this.inventoryQty - this.inCart)
      }
      if (this.ruleMax) max = Math.min(max, this.ruleMax)

      return max
    },

    get isMaxInCart(): boolean {
      return (
        this.available &&
        this.managedDeny &&
        this.inventoryQty > 0 &&
        this.inCart >= this.inventoryQty
      )
    },

    get btnDisabled(): boolean {
      return this.adding || this.loading || !this.available || this.isMaxInCart
    },

    get btnText(): string {
      if (!this.available) return this.strings.soldOut
      if (this.isMaxInCart) return t('maxInCart')

      return this.strings.addToCart
    },

    increment() {
      this.qty = increment(this.qty, this.stepQty, this.maxQty)
    },

    decrement() {
      this.qty = decrement(this.qty, this.stepQty, this.minQty)
    },

    validateQty() {
      this.qty = snapToStep(this.qty, {
        min: this.minQty,
        step: this.stepQty,
        max: this.maxQty,
      })
    },

    onVariantChanged(variant: Variant & { managedDeny?: boolean }) {
      const bounds = boundsFromRule(variant.quantity_rule)

      this.variantId = variant.id
      this.available = variant.available
      this.inventoryQty = variant.inventory_quantity ?? 0
      this.managedDeny = !!variant.managedDeny
      this.adding = false
      this.minQty = bounds.min
      this.stepQty = bounds.step
      this.ruleMax = bounds.max
      this.qty = bounds.min
    },

    onVariantUnavailable() {
      this.variantId = null
      this.available = false
      this.inventoryQty = 0
      this.managedDeny = false
      this.adding = false
    },
  })),
}
