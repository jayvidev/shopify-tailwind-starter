import { debounce } from '@/helpers'
import { defineData } from '@/types/alpine'

const MAX_COPIES = 20
/** Pixels per second, when the section doesn't say. */
const DEFAULT_SPEED = 60

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

        this.setDuration(track)
      })
    },

    /**
     * The animation always travels half the track, so a fixed duration would
     * scroll faster on pages with more copy. Deriving it from the distance keeps
     * the speed identical everywhere.
     */
    setDuration(track: HTMLElement) {
      const pixelsPerSecond = parseFloat(track.dataset.promoMarqueeSpeed || '') || DEFAULT_SPEED
      const distance = track.scrollWidth / 2

      if (!distance) return

      track.style.animationDuration = `${distance / pixelsPerSecond}s`
    },
  })),
}
