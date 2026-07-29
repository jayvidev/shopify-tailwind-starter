import { mediaHtml } from '@/product-media'
import { canScrollLeft, canScrollRight, scrollByAmount, scrollChildIntoView } from '@/scroll'
import { defineData } from '@/types/alpine'
import type { Variant } from '@/types/shopify'

const THUMB_SCROLL_STEP = 150

type Media = {
  id: number
  src: string
  srcset: string
  type: 'image' | 'video' | 'external_video' | 'model'
}

type Initial = {
  active: number
  mediaList: Media[]
}

const fill = (el: HTMLElement) => {
  el.style.width = '100%'
  el.style.height = '100%'
}

const clear = (container: HTMLElement | null | undefined) => {
  if (!container || container.classList.contains('hidden')) return

  container.classList.add('hidden')
  container.innerHTML = ''
}

const show = (container: HTMLElement | null | undefined, html: string | null) => {
  if (!container || !html) return

  container.innerHTML = html

  const model = container.querySelector<HTMLElement>('model-viewer')
  if (model) fill(model)

  const video = container.querySelector('video')
  if (video) {
    video.setAttribute('controls', 'controls')
    fill(video)
    video.style.objectFit = 'contain'
  }

  const iframe = container.querySelector<HTMLIFrameElement>('iframe')
  if (iframe) fill(iframe)

  const deferred = container.querySelector('deferred-media') as
    | (HTMLElement & { loadContent?: () => void })
    | null
  deferred?.loadContent?.()

  container.classList.remove('hidden')
}

export default {
  name: 'productMediaGallery',
  component: defineData((initial: Initial) => ({
    active: initial.active,
    mediaList: initial.mediaList,
    canPrev: false,
    canNext: false,

    init() {
      setTimeout(() => {
        this.checkScroll()
        this.selectMedia(this.active, false)
      }, 100)
    },

    selectMedia(index: number, updateImage = true) {
      if (index === -1) return
      this.active = index

      if (updateImage) this.swapPlayer(this.mediaList[index])

      this.$nextTick(() => {
        if (this.$refs.slider) scrollChildIntoView(this.$refs.slider, index)
      })
    },

    /** Only one of the model/video players is mounted at a time. */
    swapPlayer(media: Media) {
      const container = this.$el.closest('[data-prodify-media-container]')
      const model = container?.querySelector<HTMLElement>('[data-model-viewer-container]')
      const video = container?.querySelector<HTMLElement>('[data-video-viewer-container]')

      const isModel = media.type === 'model'
      const isVideo = media.type === 'video' || media.type === 'external_video'

      if (isModel) show(model, mediaHtml(media.id))
      else clear(model)

      if (isVideo) show(video, mediaHtml(media.id))
      else clear(video)
    },

    checkScroll() {
      const el = this.$refs.slider
      if (!el) return

      this.canPrev = canScrollLeft(el)
      this.canNext = canScrollRight(el)
    },

    scrollNext() {
      scrollByAmount(this.$refs.slider, THUMB_SCROLL_STEP)
    },

    scrollPrev() {
      scrollByAmount(this.$refs.slider, -THUMB_SCROLL_STEP)
    },

    onVariantChanged(variant: Variant) {
      const mediaId = variant.featured_media?.id || variant.featured_image?.id
      if (!mediaId) return

      const index = this.mediaList.findIndex((media) => media.id === mediaId)
      if (index !== -1 && index !== this.active) this.selectMedia(index)
    },
  })),
}
