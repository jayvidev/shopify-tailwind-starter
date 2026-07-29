import { fetchHTML } from '@/helpers'
import { defineData } from '@/types/alpine'

const SWIPE_THRESHOLD = 50

type Initial = {
  loaded: boolean
  sectionId: string
  autoplay?: boolean
  interval?: number
}

export default {
  name: 'productComplementary',
  component: defineData((initial: Initial) => ({
    loaded: initial.loaded,
    sectionId: initial.sectionId,
    autoplay: initial.autoplay || false,
    interval: initial.interval || 3000,
    current: 0,
    touchStartX: 0,
    touchEndX: 0,
    autoplayTimer: undefined as ReturnType<typeof setInterval> | undefined,
    observer: undefined as IntersectionObserver | undefined,

    init() {
      if (this.loaded) {
        this.setupAutoplay()
        return
      }

      const url = this.$el.dataset.url
      if (!url) return

      fetchHTML(url)
        .then((doc) => {
          const content = doc.querySelector(`#complementary-products-${this.sectionId}`)
          if (!content?.querySelector('[data-complementary-content]')) return

          this.$el.innerHTML = content.innerHTML
          this.loaded = true
          this.$nextTick(() => this.setupAutoplay())
        })
        .catch((error) => console.log('S&D info:', error))
    },

    setupAutoplay() {
      if (!this.autoplay) return

      const slides = this.$el.querySelectorAll('.min-w-full').length
      if (slides <= 1) return

      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) this.startAutoplay(slides)
          else this.stopAutoplay()
        },
        { threshold: 0.2 }
      )

      this.observer.observe(this.$el)
    },

    startAutoplay(total: number) {
      this.stopAutoplay()
      this.autoplayTimer = setInterval(() => {
        this.current = (this.current + 1) % total
      }, this.interval)
    },

    stopAutoplay() {
      clearInterval(this.autoplayTimer)
      this.autoplayTimer = undefined
    },

    handleSwipe(total: number) {
      const diff = this.touchStartX - this.touchEndX
      if (Math.abs(diff) <= SWIPE_THRESHOLD) return

      if (diff > 0 && this.current < total - 1) this.current++
      if (diff < 0 && this.current > 0) this.current--

      // Restart the timer so a manual swipe gets a full interval before advancing.
      if (this.autoplay && this.autoplayTimer) this.startAutoplay(total)
    },
  })),
}
