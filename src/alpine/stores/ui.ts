import { EVENTS, SCROLL_THROTTLE_MS } from '@/constants'
import { throttle } from '@/helpers'

const DESKTOP_MENU_WIDTH = 1024
const PROMO_BAR_HIDE_AT = 100
const PROMO_BAR_SHOW_AT = 60
const MINICART_OPEN_DELAY = 50

/** Overlay visibility and window-scroll state. */
export default {
  name: 'ui',
  store: () => ({
    isMobileMenuVisible: false,
    isMinicartVisible: false,
    isPredictiveSearchVisible: false,
    isMegaMenuVisible: false,
    isFilterOpen: false,
    isPromoBarVisible: true,
    isWindowScrolled: false,

    init() {
      window.addEventListener(
        'scroll',
        throttle(this.onWindowScrollHandler.bind(this), SCROLL_THROTTLE_MS)
      )

      document.addEventListener(EVENTS.cartItemAdded, () => {
        // Let the cart sections re-render before sliding the drawer in.
        setTimeout(() => {
          this.isMinicartVisible = true
        }, MINICART_OPEN_DELAY)
      })

      window.addEventListener('resize', () => {
        if (this.isMobileMenuVisible && window.innerWidth >= DESKTOP_MENU_WIDTH) {
          this.closeMobileMenu()
        }
      })
    },

    get bodyClasses(): string[] {
      const classes = []
      if (this.isMobileMenuVisible) classes.push('mobile-menu-visible')
      return classes
    },

    openMobileMenu() {
      this.isMobileMenuVisible = true
    },

    closeMobileMenu() {
      this.isMobileMenuVisible = false
    },

    toggleMobileMenu() {
      this.isMobileMenuVisible = !this.isMobileMenuVisible
    },

    onWindowScrollHandler() {
      const isScrolled = window.scrollY > 0

      // Hysteresis: hide and show at different offsets so the bar doesn't flicker.
      if (window.scrollY > PROMO_BAR_HIDE_AT) this.isPromoBarVisible = false
      else if (window.scrollY < PROMO_BAR_SHOW_AT) this.isPromoBarVisible = true

      this.isWindowScrolled = isScrolled
      document.body.classList.toggle('scrolled', isScrolled)
    },

    openModal() {
      document.dispatchEvent(new CustomEvent(EVENTS.showModal))
    },
  }),
}
