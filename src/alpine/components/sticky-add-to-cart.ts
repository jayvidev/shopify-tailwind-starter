import { boundsFromRule, decrement, increment, snapToStep } from '@/quantity'
import { defineData } from '@/types/alpine'
import type { Variant } from '@/types/shopify'

type Initial = {
  formId: string
  anchorId: string
  variantId: number
  variantTitle: string
  variantImage: string
  variantPrice: number
  variantComparePrice: number
  available: boolean
  maxQty: number
  minQty: number
  stepQty: number
  ruleMax: number
  strings: { soldOut: string; addToCart: string }
}

const variantImageSrc = (variant: Variant): string | null => {
  const image = variant.featured_image as unknown

  if (typeof image === 'string') return image
  if (image) return (image as { src: string }).src

  return variant.featured_media?.preview_image?.src || null
}

export default {
  name: 'stickyAddToCart',
  component: defineData((initial: Initial) => ({
    ...initial,
    qty: initial.minQty,
    adding: false,
    isVisible: false,

    init() {
      this.updateVisibility()
    },

    get btnText(): string {
      return this.available ? this.strings.addToCart : this.strings.soldOut
    },

    get btnDisabled(): boolean {
      return !this.available || this.adding
    },

    get topQty(): number {
      return this.ruleMax ? Math.min(this.maxQty, this.ruleMax) : this.maxQty
    },

    /** Visible once the main add-to-cart form has scrolled past, until the footer. */
    updateVisibility() {
      const form = document.getElementById(this.formId)
      if (!form) return

      const footer = document.querySelector('footer')
      const footerTop = footer ? (footer as HTMLElement).offsetTop : document.body.offsetHeight

      const pastForm = form.getBoundingClientRect().bottom < 0
      const beforeFooter = window.scrollY + window.innerHeight < footerTop

      this.isVisible = pastForm && beforeFooter
      document.body.classList.toggle('has-sticky-add-to-cart', this.isVisible)
    },

    scrollToProduct() {
      document.getElementById(this.anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },

    increment() {
      this.qty = increment(this.qty, this.stepQty, this.topQty)
    },

    decrement() {
      this.qty = decrement(this.qty, this.stepQty, this.minQty)
    },

    validateQty() {
      this.qty = snapToStep(this.qty, {
        min: this.minQty,
        step: this.stepQty,
        max: this.topQty,
      })
    },

    onVariantChanged(variant: Variant) {
      const bounds = boundsFromRule(variant.quantity_rule)

      this.variantId = variant.id
      this.variantTitle = variant.title
      this.variantPrice = variant.price / 100
      this.variantComparePrice = (variant.compare_at_price || 0) / 100
      this.available = variant.available
      this.maxQty = variant.inventory_quantity || 999
      this.minQty = bounds.min
      this.stepQty = bounds.step
      this.ruleMax = bounds.max
      this.qty = bounds.min

      const image = variantImageSrc(variant)
      if (image) this.variantImage = image
    },
  })),
}
