import { CART_EVENTS, EVENTS } from '@/constants'
import { t } from '@/strings'
import type { Cart } from '@/types/shopify'

type CartRequestEndDetail = {
  cart: Cart
  requestState: {
    requestType: string
    responseData?: { ok?: boolean }
  }
}

/** Cart contents, in-flight state and discount codes, on top of liquid-ajax-cart. */
export default {
  name: 'cart',
  store: () => ({
    cart: null as Cart | null,
    isCartLoading: false,
    isDiscountProcessing: false,
    processingId: null as string | null,
    discountCode: '',
    discountError: '',
    discountSuccess: '',

    init() {
      document.addEventListener(CART_EVENTS.init, () => {
        this.cart = window.liquidAjaxCart.cart
      })

      document.addEventListener(CART_EVENTS.requestStart, () => {
        this.isCartLoading = true
      })

      document.addEventListener(CART_EVENTS.requestEnd, (event) => {
        const { requestState, cart } = (event as CustomEvent<CartRequestEndDetail>).detail

        const addedFromAnotherPage =
          requestState.requestType === 'add' &&
          requestState.responseData?.ok &&
          window.location.pathname !== '/cart'

        if (addedFromAnotherPage) document.dispatchEvent(new CustomEvent(EVENTS.cartItemAdded))

        this.cart = cart
        this.isCartLoading = false
        this.processingId = null
      })
    },

    async updateQuantity(key: string, quantity: number) {
      this.processingId = key
      this.isCartLoading = true
      try {
        await window.liquidAjaxCart.change({ id: key, quantity })
      } catch (error) {
        console.error('Error updating quantity:', error)
        this.isCartLoading = false
        this.processingId = null
      }
    },

    async addToCart(variantId: number | string, quantity = 1) {
      this.processingId = String(variantId)
      this.isCartLoading = true
      try {
        await window.liquidAjaxCart.add({ items: [{ id: variantId, quantity }] })
      } catch (error) {
        console.error('Error adding to cart:', error)
        this.isCartLoading = false
        this.processingId = null
      }
    },

    async removeItem(key: string) {
      await this.updateQuantity(key, 0)
    },

    async applyDiscount(code: string) {
      if (!code) return
      this.discountError = ''
      this.isDiscountProcessing = true

      // Shopify accepts the request even when the code doesn't apply, so the only
      // way to know is to look for it in the resulting cart.
      const isCodeApplied = (cart: Cart) =>
        cart.discount_applications.some((d) => d.title.toLowerCase() === code.trim().toLowerCase())

      try {
        const state = await window.liquidAjaxCart.update({ discount: code.trim() })
        const cart = state?.cart || window.liquidAjaxCart.cart

        if (!isCodeApplied(cart)) this.discountError = t('discountInvalid')
      } catch {
        if (!isCodeApplied(window.liquidAjaxCart.cart)) this.discountError = t('discountFailed')
      } finally {
        this.isDiscountProcessing = false
      }
    },

    async removeDiscount() {
      this.isDiscountProcessing = true
      try {
        await window.liquidAjaxCart.update({ discount: '' })
      } catch (error) {
        console.error('Error removing discount:', error)
      } finally {
        this.isDiscountProcessing = false
      }
    },
  }),
}
