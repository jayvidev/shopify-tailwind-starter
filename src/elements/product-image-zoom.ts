import { DESKTOP_BREAKPOINT } from '@/constants'

const CLOSE_TRANSITION_MS = 300
const ZOOM_SCALE = 1.5

type GalleryData = {
  active: number
  mediaList: Array<{ type: string }>
  selectMedia: (index: number) => void
}

type GalleryZoomElement = HTMLElement & {
  selectThumbByIndex: (index: number, scroll?: boolean) => void
}

const isDesktop = () => window.innerWidth >= DESKTOP_BREAKPOINT

const galleryData = (): GalleryData | null => {
  const el = document.querySelector<HTMLElement>('[x-data*="productMediaGallery"]')
  if (!el) return null

  return (window.Alpine?.$data(el) as GalleryData) || null
}

/** Only still images zoom — video and 3D media have their own controls. */
const isActiveZoomable = (): boolean => {
  const data = galleryData()

  return data?.mediaList?.[data.active]?.type === 'image'
}

const injectZoomStyles = () => {
  const style = document.createElement('style')
  style.textContent =
    '[data-prodify-media-container] div.aspect-square img { transition: transform 0.35s ease-in-out, opacity 0.3s; }'
  document.head.appendChild(style)
}

const modalParts = () => {
  const wrapper = document.querySelector('.js-gallery-zoom-modal')

  return {
    wrapper,
    backdrop: wrapper?.querySelector('[style*="z-index: 9998"]'),
    modal: wrapper?.querySelector('[role="dialog"]'),
  }
}

const initModal = () => {
  const template = document.querySelector<HTMLTemplateElement>('.js-media-zoom-template')
  if (!template) return

  if (!document.querySelector('.js-gallery-zoom-modal')) {
    const wrapper = document.createElement('div')
    wrapper.classList.add('js-gallery-zoom-modal')
    wrapper.appendChild(document.importNode(template.content, true))
    document.body.appendChild(wrapper)
  }

  const { backdrop, modal } = modalParts()
  if (!modal) return

  const closeModal = () => {
    modal.classList.remove('opacity-100')
    modal.classList.add('opacity-0')
    backdrop?.classList.remove('opacity-100')
    backdrop?.classList.add('opacity-0')

    setTimeout(() => {
      modal.classList.add('invisible')
      backdrop?.classList.add('invisible')
      document.documentElement.classList.remove('overflow-hidden')
    }, CLOSE_TRANSITION_MS)
  }

  backdrop?.addEventListener('click', closeModal)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal()
  })

  // Above the breakpoint the hover zoom takes over, so the modal shouldn't linger.
  window.addEventListener('resize', () => {
    if (isDesktop() && !modal.classList.contains('invisible')) closeModal()
  })
}

const openZoom = (index = 0) => {
  if (isDesktop()) return

  const { backdrop, modal } = modalParts()
  const galleryZoom = modal?.querySelector<GalleryZoomElement>('gallery-zoom')
  if (!modal || !galleryZoom) return

  modal.classList.remove('invisible', 'opacity-0')
  modal.classList.add('opacity-100')
  backdrop?.classList.remove('invisible', 'opacity-0')
  backdrop?.classList.add('opacity-100')

  galleryZoom.selectThumbByIndex(index, false)
  document.documentElement.classList.add('overflow-hidden')
}

const initHoverZoom = (wrapper: HTMLElement) => {
  const activeImage = () =>
    wrapper.querySelector<HTMLImageElement>('img.opacity-100') ||
    wrapper.querySelector<HTMLImageElement>('img')

  let zoomed: HTMLImageElement | null = null

  const reset = () => {
    if (zoomed) zoomed.style.transform = 'scale(1)'
    zoomed = null
  }

  wrapper.addEventListener('mouseenter', () => {
    wrapper.style.cursor = isActiveZoomable() ? 'zoom-in' : 'default'
  })

  wrapper.addEventListener('mousemove', (event) => {
    if (!isDesktop()) return

    if (!isActiveZoomable()) {
      reset()
      wrapper.style.cursor = 'default'
      return
    }

    wrapper.style.cursor = 'zoom-in'

    const image = activeImage()
    if (!image) return
    if (zoomed && zoomed !== image) zoomed.style.transform = 'scale(1)'
    zoomed = image

    const rect = wrapper.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    image.style.transformOrigin = `${x}% ${y}%`
    image.style.transform = `scale(${ZOOM_SCALE})`
  })

  wrapper.addEventListener('mouseleave', reset)
}

const initZoom = () => {
  document.querySelectorAll('[data-prodify-media-container]').forEach((container) => {
    const wrapper = container.querySelector<HTMLElement>('div.aspect-square')
    if (!wrapper?.querySelector('img')) return

    if (isDesktop()) {
      initHoverZoom(wrapper)
      return
    }

    // On touch the same tap opens the fullscreen modal instead.
    wrapper.style.cursor = 'pointer'
    wrapper.addEventListener('click', () => {
      if (!isActiveZoomable()) return
      openZoom(galleryData()?.active ?? 0)
    })
  })

  document.addEventListener('gallery-zoom:index-changed', (event) => {
    const { index } = (event as CustomEvent<{ index: number }>).detail
    galleryData()?.selectMedia(index)
  })
}

const init = () => {
  injectZoomStyles()
  initModal()
  initZoom()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
