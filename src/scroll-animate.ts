import { SECTION_EVENTS } from '@/constants'

const ANIMATED = 'is-animated'
const ANIMATE_SELECTOR = '[data-animate], [data-animate-stagger] > *'
const DEFAULT_STAGGER_MS = 90
const SCROLL_DEBOUNCE_MS = 100
const RESIZE_DEBOUNCE_MS = 200

const isInViewport = (el: Element): boolean => {
  const rect = el.getBoundingClientRect()

  return (
    rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right > 0
  )
}

const isElementVisible = (el: HTMLElement): boolean =>
  !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)

const delayOf = (el: HTMLElement): number => parseInt(el.dataset.animateDelay || '0', 10)

const animateEl = (el: HTMLElement, delay: number): void => {
  if (el.classList.contains(ANIMATED)) return

  if (delay) setTimeout(() => el.classList.add(ANIMATED), delay)
  else el.classList.add(ANIMATED)
}

/** Skip the animation entirely — used in the theme editor and for injected sections. */
const revealAll = (scope: ParentNode = document): void => {
  scope.querySelectorAll(ANIMATE_SELECTOR).forEach((el) => el.classList.add(ANIMATED))
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      const el = entry.target as HTMLElement
      if (!isElementVisible(el)) return

      animateEl(el, delayOf(el))
      observer.unobserve(el)
    })
  },
  { threshold: 0.05, rootMargin: '0px' }
)

const observeOrAnimate = (el: HTMLElement): void => {
  if (el.classList.contains(ANIMATED)) return

  el.setAttribute('data-animate-observed', 'true')

  if (isElementVisible(el) && isInViewport(el)) animateEl(el, delayOf(el))
  else observer.observe(el)
}

export const initScrollAnimate = (): void => {
  if (window.Shopify?.designMode) {
    document.documentElement.classList.add('shopify-design-mode', 'design-mode')
    revealAll()
    return
  }

  document
    .querySelectorAll<HTMLElement>('[data-animate]:not(.is-animated):not([data-animate-observed])')
    .forEach((el) => {
      // Staggered children get their delay assigned below instead.
      if (el.closest('[data-animate-stagger]')) return
      observeOrAnimate(el)
    })

  document.querySelectorAll<HTMLElement>('[data-animate-stagger]').forEach((parent) => {
    const step = parseInt(parent.dataset.animateStagger || String(DEFAULT_STAGGER_MS), 10)
    let position = 0

    Array.from(parent.children).forEach((node) => {
      const child = node as HTMLElement
      if (child.hasAttribute('data-animate-observed') || child.classList.contains(ANIMATED)) return

      if (!child.dataset.animate) child.dataset.animate = 'fade-up'
      if (!child.dataset.animateDelay) child.dataset.animateDelay = String(position * step)

      position++
      observeOrAnimate(child)
    })
  })
}

/** Safety net for elements the observer misses (hidden at load, then revealed). */
const checkVisibility = (): void => {
  document.querySelectorAll<HTMLElement>('[data-animate]:not(.is-animated)').forEach((el) => {
    if (isElementVisible(el) && isInViewport(el)) animateEl(el, delayOf(el))
  })
}

window.initScrollAnimate = initScrollAnimate

let scrollTimer: ReturnType<typeof setTimeout>
window.addEventListener(
  'scroll',
  () => {
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(checkVisibility, SCROLL_DEBOUNCE_MS)
  },
  { passive: true }
)

let resizeTimer: ReturnType<typeof setTimeout>
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    initScrollAnimate()
    checkVisibility()
  }, RESIZE_DEBOUNCE_MS)
})

// Sections re-rendered by the editor arrive mid-scroll, so show them immediately.
Object.values(SECTION_EVENTS).forEach((eventName) => {
  document.addEventListener(eventName, (event) =>
    revealAll((event.target as ParentNode) || document)
  )
})

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimate)
} else {
  initScrollAnimate()
}
