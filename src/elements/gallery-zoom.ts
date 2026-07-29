import { mediaHtml } from '@/product-media'

if (!customElements.get('gallery-zoom')) {
  class GalleryZoom extends HTMLElement {
    private initialised = false
    private zoomContainer!: HTMLElement
    private videoContainer!: HTMLElement | null
    private modelContainer!: HTMLElement | null
    private previousBtn!: HTMLElement | null
    private nextBtn!: HTMLElement | null
    private thumbContainer!: HTMLElement | null | undefined
    private closeBtn!: HTMLElement | null | undefined

    private readonly wheelZoomMultiplier = -0.001
    private readonly pinchZoomMultiplier = 0.003
    private readonly touchPanModifier = 1.0

    private currentZoomImage: HTMLImageElement | null = null
    private currentIndex = 0
    private currentTransform = { panX: 0, panY: 0, zoom: 1 }
    private pinchTracking = { isTracking: false, lastPinchDistance: 0 }
    private touchTracking = { isTracking: false, lastTouchX: 0, lastTouchY: 0 }

    connectedCallback() {
      if (!this.initialised) {
        this.initialised = true

        this.zoomContainer = this.querySelector('.gallery-zoom__zoom-container')!
        this.videoContainer = this.querySelector('.gallery-zoom__video-container')
        this.modelContainer = this.querySelector('.gallery-zoom__model-container')
        this.previousBtn = this.querySelector('.gallery-zoom__prev')
        this.nextBtn = this.querySelector('.gallery-zoom__next')

        const modal = this.closest('[role="dialog"]')
        this.thumbContainer = modal?.querySelector('[data-zoom-thumbs]')
        this.closeBtn = modal?.querySelector('.gallery-zoom__close')

        if (this.thumbContainer) {
          this.thumbContainer.querySelectorAll('.gallery-zoom__thumb').forEach((el, i) => {
            el.addEventListener('click', () => this.selectThumbByIndex(i))
          })
          this.thumbContainer.addEventListener('touchmove', (event) => event.stopPropagation())
        }

        if (this.previousBtn)
          this.previousBtn.addEventListener('click', () => this.selectPreviousThumb())
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.selectNextThumb())
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close())

        this.addEventListener('touchend', () => this.stopTrackingTouch())
        this.addEventListener('touchmove', (event) => this.trackInputMovement(event))
        this.addEventListener('mousemove', (event) => this.trackInputMovement(event))
        this.addEventListener('wheel', (event) => this.trackWheel(event as WheelEvent))
        this.zoomContainer.addEventListener('click', (event) =>
          this.onZoomContainerClick(event as MouseEvent)
        )

        new ResizeObserver(() => this.setInitialImagePosition()).observe(this)
      }

      this.addEventListener('keyup', (event) => this.handleKeyup(event as KeyboardEvent))
    }

    disconnectedCallback() {}

    private thumbs(): HTMLElement[] {
      return Array.from(
        this.thumbContainer?.querySelectorAll<HTMLElement>('.gallery-zoom__thumb') || []
      )
    }

    open(imageSrc: string) {
      const thumbs = this.thumbs()
      let index = 0
      thumbs.forEach((thumb, i) => {
        if (thumb.dataset.zoomUrl === imageSrc) index = i
      })
      this.selectThumbByIndex(index)
    }

    close() {
      const modal = this.closest('[role="dialog"]')
      const backdrop = document.querySelector('.js-gallery-zoom-modal [style*="z-index: 9998"]')
      if (modal) {
        modal.classList.remove('opacity-100')
        modal.classList.add('opacity-0')
      }
      if (backdrop) {
        backdrop.classList.remove('opacity-100')
        backdrop.classList.add('opacity-0')
      }
      setTimeout(() => {
        if (modal) modal.classList.add('invisible')
        if (backdrop) backdrop.classList.add('invisible')
        document.documentElement.classList.remove('overflow-hidden')
      }, 300)
    }

    selectThumbByIndex(index: number, syncPage = true) {
      const thumbs = this.thumbs()
      if (!thumbs[index]) return

      this.currentIndex = index

      thumbs.forEach((t, i) => {
        if (i === index) {
          t.classList.remove('border-transparent')
          t.classList.add('border-primary')
        } else {
          t.classList.remove('border-primary')
          t.classList.add('border-transparent')
        }
      })

      const thumb = thumbs[index]
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })

      const { mediaType, mediaId = '', zoomUrl = '', alt = '' } = thumb.dataset

      if (mediaType === 'model') {
        this.loadModel(mediaId)
      } else if (mediaType === 'video' || mediaType === 'external_video') {
        this.loadVideo(mediaId)
      } else {
        this.loadImage(zoomUrl, alt)
      }

      if (syncPage) {
        document.dispatchEvent(new CustomEvent('gallery-zoom:index-changed', { detail: { index } }))
      }
    }

    selectPreviousThumb() {
      const thumbs = this.thumbContainer?.querySelectorAll('.gallery-zoom__thumb')
      if (!thumbs || thumbs.length < 2) return
      const newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : thumbs.length - 1
      this.selectThumbByIndex(newIndex)
    }

    selectNextThumb() {
      const thumbs = this.thumbContainer?.querySelectorAll('.gallery-zoom__thumb')
      if (!thumbs || thumbs.length < 2) return
      const newIndex = this.currentIndex < thumbs.length - 1 ? this.currentIndex + 1 : 0
      this.selectThumbByIndex(newIndex)
    }

    loadModel(mediaId: string) {
      if (this.videoContainer) {
        this.videoContainer.classList.add('hidden')
        this.videoContainer.classList.remove('flex', 'items-center', 'justify-center')
        this.videoContainer.innerHTML = ''
      }
      const html = mediaHtml(mediaId)
      if (!html || !this.modelContainer) return

      this.zoomContainer.classList.add('hidden')
      this.modelContainer.innerHTML = html
      const modelViewer = this.modelContainer.querySelector<HTMLElement>('model-viewer')
      if (modelViewer) {
        modelViewer.style.width = '100%'
        modelViewer.style.height = '100%'
      }
      this.modelContainer.classList.remove('hidden')
    }

    loadVideo(mediaId: string) {
      if (this.modelContainer) {
        this.modelContainer.classList.add('hidden')
        this.modelContainer.innerHTML = ''
      }
      const html = mediaHtml(mediaId)
      if (!html || !this.videoContainer) return

      this.zoomContainer.classList.add('hidden')
      this.videoContainer.innerHTML = html

      const video = this.videoContainer.querySelector('video')
      if (video) {
        video.setAttribute('controls', 'controls')
        video.style.width = '100%'
        video.style.height = '100%'
        video.style.objectFit = 'contain'
      }
      const iframe = this.videoContainer.querySelector('iframe')
      if (iframe) {
        iframe.style.width = '100%'
        iframe.style.height = '100%'
      }
      const deferred = this.videoContainer.querySelector('deferred-media') as
        | (HTMLElement & { loadContent?: () => void })
        | null
      deferred?.loadContent?.()

      this.videoContainer.classList.remove('hidden')
      this.videoContainer.classList.add('flex', 'items-center', 'justify-center')
    }

    loadImage(src: string, alt: string) {
      if (this.modelContainer) {
        this.modelContainer.classList.add('hidden')
        this.modelContainer.innerHTML = ''
      }
      if (this.videoContainer) {
        this.videoContainer.classList.add('hidden')
        this.videoContainer.classList.remove('flex', 'items-center', 'justify-center')
        this.videoContainer.innerHTML = ''
      }
      this.zoomContainer.classList.remove('hidden')
      this.zoomContainer.classList.add('gallery-zoom__zoom-container--loading')

      const img = document.createElement('img')
      img.className = 'gallery-zoom__zoom-image'
      img.alt = alt
      img.style.cssText =
        'position:absolute;width:auto;max-width:none;height:auto;max-height:none;visibility:hidden;opacity:0;transition:opacity 0.3s ease;'

      img.onload = () => {
        this.zoomContainer.classList.remove('gallery-zoom__zoom-container--loading')
        img.style.visibility = ''
        this.currentZoomImage = img
        this.setInitialImagePosition()
        setTimeout(() => {
          img.style.opacity = '1'
        }, 10)
      }

      img.src = src
      this.zoomContainer.replaceChildren(img)
    }

    setInitialImagePosition() {
      if (!this.currentZoomImage) return
      const cw = this.zoomContainer.clientWidth
      const ch = this.zoomContainer.clientHeight
      const iw = this.currentZoomImage.naturalWidth
      const ih = this.currentZoomImage.naturalHeight

      const scale = Math.min(cw / iw, ch / ih)
      const w = iw * scale
      const h = ih * scale

      this.currentZoomImage.style.width = `${w}px`
      this.currentZoomImage.style.height = `${h}px`
      this.currentZoomImage.style.top = `${(ch - h) / 2}px`
      this.currentZoomImage.style.left = `${(cw - w) / 2}px`

      this.setCurrentTransform(0, 0, 0)
    }

    setCurrentTransform(panX: number, panY: number, zoom: number) {
      this.currentTransform = { panX, panY, zoom }
      this.updateImagePosition()
    }

    updateImagePosition() {
      if (!this.currentZoomImage) return
      const { panX, panY, zoom } = this.currentTransform
      this.currentZoomImage.style.transform = `translate3d(${panX}px,${panY}px,0) scale(${zoom === 0 ? 1 : zoom})`
    }

    getScaledDimensions() {
      const zoom = this.currentTransform.zoom <= 1 ? 1 : this.currentTransform.zoom

      return {
        sw: (this.currentZoomImage?.clientWidth || 0) * zoom,
        sh: (this.currentZoomImage?.clientHeight || 0) * zoom,
      }
    }

    alterCurrentPanBy(x: number, y: number) {
      if (!this.currentZoomImage) return
      this.currentTransform.panX += x
      this.currentTransform.panY += y

      const cw = this.zoomContainer.clientWidth
      const ch = this.zoomContainer.clientHeight
      const { sw, sh } = this.getScaledDimensions()
      const maxX = Math.max((sw - cw) / 2, 0)
      const maxY = Math.max((sh - ch) / 2, 0)

      this.currentTransform.panX = Math.max(-maxX, Math.min(maxX, this.currentTransform.panX))
      this.currentTransform.panY = Math.max(-maxY, Math.min(maxY, this.currentTransform.panY))

      this.updateImagePosition()
    }

    alterCurrentTransformZoomBy(delta: number) {
      if (!this.currentZoomImage) return
      const minScale = 1
      const maxScale = 3
      const current = this.currentTransform.zoom <= 1 ? 1 : this.currentTransform.zoom
      this.currentTransform.zoom = Math.max(minScale, Math.min(maxScale, current + delta))
      this.alterCurrentPanBy(0, 0)
    }

    panZoomImageFromCoordinate(x: number, y: number) {
      if (!this.currentZoomImage) return
      const cw = this.zoomContainer.clientWidth
      const ch = this.zoomContainer.clientHeight
      const { sw, sh } = this.getScaledDimensions()

      const doPanX = sw > cw
      const doPanY = sh > ch

      if (!doPanX && !doPanY) return

      if (doPanX) this.currentTransform.panX = Math.round(-(x / cw - 0.5) * (sw - cw))
      if (doPanY) this.currentTransform.panY = Math.round(-(y / ch - 0.5) * (sh - ch))

      this.alterCurrentPanBy(0, 0)
    }

    stopTrackingTouch() {
      this.pinchTracking.isTracking = false
      this.touchTracking.isTracking = false
    }

    trackInputMovement(evt: TouchEvent | MouseEvent) {
      evt.preventDefault()

      if (evt instanceof TouchEvent && evt.touches.length > 0) {
        const t1 = evt.touches[0]
        if (!this.touchTracking.isTracking) {
          this.touchTracking = { isTracking: true, lastTouchX: t1.clientX, lastTouchY: t1.clientY }
        } else {
          this.alterCurrentPanBy(
            (t1.clientX - this.touchTracking.lastTouchX) * this.touchPanModifier,
            (t1.clientY - this.touchTracking.lastTouchY) * this.touchPanModifier
          )
          this.touchTracking.lastTouchX = t1.clientX
          this.touchTracking.lastTouchY = t1.clientY
        }
        if (evt.touches.length === 2) {
          const t2 = evt.touches[1]
          const dist = Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2)
          if (!this.pinchTracking.isTracking) {
            this.pinchTracking = { isTracking: true, lastPinchDistance: dist }
          } else {
            this.alterCurrentTransformZoomBy(
              (dist - this.pinchTracking.lastPinchDistance) * this.pinchZoomMultiplier
            )
            this.pinchTracking.lastPinchDistance = dist
          }
        } else {
          this.pinchTracking.isTracking = false
        }
      } else if (evt instanceof MouseEvent) {
        this.panZoomImageFromCoordinate(evt.clientX, evt.clientY)
      }
    }

    trackWheel(evt: WheelEvent) {
      evt.preventDefault()
      if (evt.deltaY !== 0) this.alterCurrentTransformZoomBy(evt.deltaY * this.wheelZoomMultiplier)
    }

    onZoomContainerClick(evt: MouseEvent) {
      evt.preventDefault()
      if (this.currentTransform.zoom > 1) {
        this.setCurrentTransform(0, 0, 1)
      } else {
        const rect = this.zoomContainer.getBoundingClientRect()
        const x = evt.clientX - rect.left
        const y = evt.clientY - rect.top
        this.alterCurrentTransformZoomBy(1)
        this.panZoomImageFromCoordinate(x, y)
      }
    }

    handleKeyup(evt: KeyboardEvent) {
      if (evt.key === 'ArrowLeft') this.selectPreviousThumb()
      else if (evt.key === 'ArrowRight') this.selectNextThumb()
      else if (evt.key === 'Escape') this.close()
    }
  }

  customElements.define('gallery-zoom', GalleryZoom)
}
