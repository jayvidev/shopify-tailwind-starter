import { debounce } from '@/helpers'
import { defineData } from '@/types/alpine'

const MAX_COPIES = 20

export default {
  name: 'promoMarquee',
  component: defineData(() => ({
    init() {
      this.fill()
      window.addEventListener(
        'resize',
        debounce(() => this.fill(), 150)
      )
    },

    /** Repeat the message until it overflows the track, so the loop has no gap. */
    fill() {
      this.$el.querySelectorAll<HTMLElement>('[data-promo-marquee]').forEach((track) => {
        const container = track.closest('.promo-marquee-fade') || track.parentElement
        const minWidth = container?.clientWidth
        if (!minWidth) return

        track.querySelectorAll<HTMLElement>('[data-promo-marquee-copy]').forEach((copy) => {
          if (!copy.dataset.originalHtml) {
            copy.dataset.originalHtml = copy.innerHTML
          } else {
            copy.innerHTML = copy.dataset.originalHtml
          }

          let copies = 0
          while (copy.scrollWidth < minWidth && copies < MAX_COPIES) {
            copy.innerHTML += copy.dataset.originalHtml
            copies++
          }
        })
      })
    },
  })),
}
