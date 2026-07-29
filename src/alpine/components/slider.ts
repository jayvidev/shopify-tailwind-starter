import { maxScrollLeft } from '@/scroll'
import { defineData } from '@/types/alpine'

const MIN_SCROLLABLE = 5
const SNAP_POINT_GAP = 10
const SCROLL_SETTLE_MS = 500

export default {
  name: 'slider',
  component: defineData(() => ({
    canScrollLeft: false,
    canScrollRight: false,
    activeIndex: 0,
    numDots: 0,
    snapPoints: [] as number[],
    isScrolling: false,
    scrollTimeout: undefined as ReturnType<typeof setTimeout> | undefined,

    /** One snap position per child, minus those too close together to be distinct. */
    getSnapPoints(): number[] {
      const slider = this.$refs.slider
      if (!slider?.children.length) return []

      const maxScroll = Math.max(maxScrollLeft(slider), 0)
      if (maxScroll <= MIN_SCROLLABLE) return []

      const points = Array.from(slider.children).map((child) =>
        Math.min((child as HTMLElement).offsetLeft, maxScroll)
      )

      return points.filter((point, i) => i === 0 || point > points[i - 1] + SNAP_POINT_GAP)
    },

    updateScroll() {
      const slider = this.$refs.slider
      if (!slider || this.isScrolling) return

      this.snapPoints = this.getSnapPoints()
      this.numDots = this.snapPoints.length

      if (!this.snapPoints.length) {
        this.activeIndex = 0
        this.canScrollLeft = false
        this.canScrollRight = false
        return
      }

      let closestIndex = 0
      let closestDist = Math.abs(slider.scrollLeft - this.snapPoints[0])
      for (let i = 1; i < this.snapPoints.length; i++) {
        const distance = Math.abs(slider.scrollLeft - this.snapPoints[i])
        if (distance < closestDist) {
          closestDist = distance
          closestIndex = i
        }
      }

      this.activeIndex = closestIndex
      this.canScrollLeft = this.activeIndex > 0
      this.canScrollRight = this.activeIndex < this.snapPoints.length - 1
    },

    /** How many items fit in the viewport, unless the section overrides it. */
    getStep(): number {
      const manual = parseInt(this.$el.dataset.sliderStep || '')
      if (manual) return manual

      const slider = this.$refs.slider
      if (!slider?.children.length) return 1

      const gap = parseFloat(getComputedStyle(slider).gap) || 0
      const itemWidth = (slider.children[0] as HTMLElement).offsetWidth + gap

      return Math.max(1, Math.floor(slider.clientWidth / itemWidth))
    },

    scrollLeft() {
      this.scrollToIndex(this.activeIndex - this.getStep())
    },

    scrollRight() {
      this.scrollToIndex(this.activeIndex + this.getStep())
    },

    scrollToIndex(index: number) {
      const slider = this.$refs.slider
      if (!slider || !this.snapPoints.length) return

      const clamped = Math.max(0, Math.min(index, this.snapPoints.length - 1))

      this.activeIndex = clamped
      this.canScrollLeft = clamped > 0
      this.canScrollRight = clamped < this.snapPoints.length - 1

      // Ignore scroll events until the smooth scroll lands on the target.
      this.isScrolling = true
      slider.scrollTo({ left: this.snapPoints[clamped], behavior: 'smooth' })

      clearTimeout(this.scrollTimeout)
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false
        this.updateScroll()
      }, SCROLL_SETTLE_MS)
    },

    init() {
      this.$nextTick(() => this.updateScroll())
    },
  })),
}
