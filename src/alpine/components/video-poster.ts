import { DESKTOP_BREAKPOINT } from '@/constants'
import { defineData } from '@/types/alpine'

type Initial = {
  /** Fallback poster for videos without a `data-poster-lg` of their own. */
  posterLg?: string
  posterAlt?: string
  autoplay?: boolean
}

/** Swap in the high-res poster on desktop, and replace the video with a still if autoplay is refused. */
export default {
  name: 'videoPoster',
  component: defineData((initial: Initial = {}) => ({
    init() {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT

      this.$el.querySelectorAll('video').forEach((video) => {
        const posterLg = video.dataset.posterLg || initial.posterLg
        if (isDesktop && posterLg) video.poster = posterLg

        video.addEventListener('playing', () => video.removeAttribute('poster'), { once: true })

        if (initial.autoplay) {
          video.play().catch(() => this.replaceWithPoster(video))
        }
      })
    },

    replaceWithPoster(video: HTMLVideoElement) {
      if (!video.poster || !video.parentNode) return

      const image = document.createElement('img')
      image.src = video.poster
      image.className = video.className
      image.setAttribute('style', video.getAttribute('style') || '')
      image.alt = initial.posterAlt || ''

      video.parentNode.replaceChild(image, video)
    },
  })),
}
