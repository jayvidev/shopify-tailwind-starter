import { EVENTS } from '@/constants'
import { fetchHTML } from '@/helpers'
import { formatAmount, formatPrice, sanitizePrice } from '@/money'
import { fetchSection, replaceSelector } from '@/sections'
import { defineData } from '@/types/alpine'

const PRICE_INPUTS = 'input[name*="price.gte"], input[name*="price.lte"]'
const PRICE_DEBOUNCE_MS = 1500

const FILTER_CONTAINERS = [
  '#CollectionFiltersForm',
  '#CollectionFiltersFormMobile',
  '#SearchFiltersForm',
  '#SearchFiltersFormMobile',
  '#MobileStickyFilterBar',
]

type Initial = {
  sectionId?: string
}

export default {
  name: 'collection',
  component: defineData((initial: Initial = {}) => ({
    loading: false,
    priceTimer: undefined as ReturnType<typeof setTimeout> | undefined,
    sectionId: initial.sectionId || null,

    init() {
      window.addEventListener('popstate', () => {
        this.fetchResults(window.location.href, false)
      })
      window.addEventListener(EVENTS.sortSelect, (event) => {
        this.fetchResults((event as CustomEvent<{ url: string }>).detail.url)
      })
      this.updateCounts()
      this.updatePriceInputs()
    },

    updateCounts() {
      const productGrid = document.querySelector('#ProductGrid')
      if (!productGrid) return
      let count = productGrid.querySelectorAll(':scope > :not([aria-hidden="true"])').length

      const totalCountEl = document.querySelector('.js-total-count')
      if (totalCountEl) {
        const total = parseInt(totalCountEl.textContent || '')
        if (!isNaN(total) && count > total) {
          count = total
        }
      }

      document.querySelectorAll('.js-visible-count').forEach((el) => {
        el.textContent = String(count)
      })
    },

    handlePriceInput(event: Event) {
      const input = event.target as HTMLInputElement
      const cursor = input.selectionStart || 0
      const oldVal = input.value

      let cleanVal = oldVal.replace(/[^0-9.,]/g, '')

      if (!cleanVal) {
        input.value = ''
        this.priceDebounce(event)
        return
      }

      const hasTrailingSeparator = cleanVal.endsWith(',') || cleanVal.endsWith('.')

      const normalized = sanitizePrice(cleanVal)
      const num = parseFloat(normalized)

      if (isNaN(num)) {
        input.value = cleanVal
        this.priceDebounce(event)
        return
      }

      let formatted = formatAmount(num, {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })

      if (hasTrailingSeparator && !formatted.includes(',')) {
        formatted += ','
      }

      input.value = formatted

      const diff = formatted.length - oldVal.length
      const newCursor = Math.max(0, cursor + diff)
      input.setSelectionRange(newCursor, newCursor)

      this.priceDebounce(event)
    },

    updatePriceInputs() {
      document.querySelectorAll<HTMLInputElement>(PRICE_INPUTS).forEach((input) => {
        if (input.value) input.value = formatPrice(input.value)
      })
    },

    /** Only refetch once both ends of the range have a value. */
    priceDebounce(event: Event) {
      clearTimeout(this.priceTimer)

      const form = (event.target as HTMLElement).closest('form')
      if (!form) return

      const gte = form.querySelector<HTMLInputElement>('input[name*="price.gte"]')
      const lte = form.querySelector<HTMLInputElement>('input[name*="price.lte"]')

      if (sanitizePrice(gte?.value) !== '' && sanitizePrice(lte?.value) !== '') {
        this.priceTimer = setTimeout(() => this.updateFilters(event), PRICE_DEBOUNCE_MS)
      }
    },

    clearPriceFilter(event: Event) {
      clearTimeout(this.priceTimer)

      const form = (event.target as HTMLElement).closest('form')
      if (!form) return

      form.querySelectorAll<HTMLInputElement>(PRICE_INPUTS).forEach((input) => (input.value = ''))
      this.updateFilters(event)
    },

    clearListFilter(event: Event) {
      const group = (event.currentTarget as HTMLElement).closest('[data-filter-group]')
      if (!group) return

      group
        .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
        .forEach((checkbox) => (checkbox.checked = false))
      this.updateFilters(event)
    },

    updateFilters(event: Event) {
      requestAnimationFrame(() => {
        const form =
          (event.target as HTMLElement).closest('form') ||
          document.querySelector('#CollectionFiltersForm') ||
          document.querySelector('#SearchFiltersForm')
        if (!form) return

        // FormData is iterable as [string, string] entries once file inputs are excluded.
        const formData = new FormData(form) as unknown as Iterable<[string, string]>
        const searchParams = new URLSearchParams([...formData])

        const paramsToKeep = new URLSearchParams()
        for (const [key, value] of searchParams.entries()) {
          if (!value || value.trim() === '') continue
          if (key.includes('price.gte') || key.includes('price.lte')) {
            const normalized = sanitizePrice(value)
            const num = parseFloat(normalized)
            if (!isNaN(num) && num >= 0) paramsToKeep.append(key, String(num))
            continue
          }
          paramsToKeep.append(key, value)
        }

        const currentParams = new URLSearchParams(window.location.search)
        for (const key of ['q', 'type', 'options[prefix]']) {
          const val = currentParams.get(key)
          if (val && !paramsToKeep.has(key)) {
            paramsToKeep.set(key, val)
          }
        }

        const params = paramsToKeep.toString()
        const url = params ? `${window.location.pathname}?${params}` : window.location.pathname

        if (url !== `${window.location.pathname}${window.location.search}`) {
          this.fetchResults(url)
        }
      })
    },

    async fetchResults(url: string, pushState = true) {
      this.loading = true

      try {
        const html = this.sectionId ? await fetchSection(this.sectionId, url) : await fetchHTML(url)

        if (pushState) {
          history.pushState({}, '', url)
        }

        const currentGrid = replaceSelector(html, '#ProductGridContainer')

        for (const id of FILTER_CONTAINERS) {
          replaceSelector(html, id)
        }

        this.updatePriceInputs()

        if (currentGrid) {
          requestAnimationFrame(() => {
            this.scrollToGrid(currentGrid)
          })
        }
      } catch (error) {
        console.error('Error fetching filtered products:', error)
      } finally {
        this.loading = false
        this.updateCounts()
        requestAnimationFrame(() => {
          window.initScrollAnimate?.()
        })
      }
    },

    getVisibleHeight(el: Element | null): number {
      if (!el) return 0
      const styles = window.getComputedStyle(el)
      if (styles.display === 'none' || styles.visibility === 'hidden') return 0
      const rect = el.getBoundingClientRect()
      if (rect.height <= 0 || rect.bottom <= 0 || rect.top >= window.innerHeight) return 0
      const visibleTop = Math.max(rect.top, 0)
      const visibleBottom = Math.min(rect.bottom, window.innerHeight)
      return Math.max(0, visibleBottom - visibleTop)
    },

    getStickyOffset() {
      const elements = [
        document.querySelector('#site-promo-bar-wrapper'),
        document.querySelector('.section-header'),
        document.querySelector('#MobileStickyFilterBar'),
      ]

      return elements.reduce((total, el) => total + this.getVisibleHeight(el), 0)
    },

    scrollToGrid(target: Element) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const behavior = reduceMotion ? 'auto' : 'smooth'

      const scrollWithOffset = () => {
        const offset = this.getStickyOffset()
        const rect = target.getBoundingClientRect()
        const top = rect.top + window.scrollY - offset - 8
        window.scrollTo({ top: Math.max(0, top), behavior })
      }

      scrollWithOffset()

      requestAnimationFrame(() => {
        const offset = this.getStickyOffset()
        const rect = target.getBoundingClientRect()
        if (rect.top < offset - 2 || rect.top > offset + 2) {
          scrollWithOffset()
        }
      })
    },

    async loadMore(event: Event) {
      const button = event.currentTarget as HTMLElement
      const url = button.dataset.nextUrl
      if (!url) return

      this.loading = true

      try {
        const html = this.sectionId ? await fetchSection(this.sectionId, url) : await fetchHTML(url)

        const newProductGrid = html.querySelector('#ProductGrid')
        const currentProductGrid = document.querySelector('#ProductGrid')

        if (newProductGrid && currentProductGrid) {
          currentProductGrid.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove())
          ;[...newProductGrid.children].forEach((el) => currentProductGrid.appendChild(el))
        }

        const newLoadMore = html.querySelector('#LoadMoreContainer')
        const currentLoadMore = document.querySelector('#LoadMoreContainer')
        if (currentLoadMore) {
          if (newLoadMore) {
            currentLoadMore.outerHTML = newLoadMore.outerHTML
          } else {
            currentLoadMore.remove()
          }
        }

        replaceSelector(html, '#ProductCountDesktop')
      } catch (error) {
        console.error('Error loading more products:', error)
      } finally {
        this.loading = false
        this.updateCounts()
        requestAnimationFrame(() => {
          window.initScrollAnimate?.()
        })
      }
    },

    handleLinkClick(event: Event) {
      const link = (event.target as HTMLElement).closest('a')
      if (!link || !link.href) return

      const url = new URL(link.href)
      if (url.origin !== window.location.origin) return

      const isPagination = url.searchParams.has('page')

      if (isPagination || link.classList.contains('clear-filters')) {
        event.preventDefault()
        this.fetchResults(link.href)
      }
    },
  })),
}
