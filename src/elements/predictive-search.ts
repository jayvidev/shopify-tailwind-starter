import { debounce } from '@/helpers'
import { fetchSection } from '@/sections'

const INPUT_DEBOUNCE_MS = 300

class PredictiveSearch extends HTMLElement {
  private input: HTMLInputElement | null
  private results: HTMLElement | null

  constructor() {
    super()

    this.input = this.querySelector('#predictive-search-input')
    this.results = this.querySelector('#predictive-search-target')

    this.input?.addEventListener(
      'input',
      debounce(() => this.onChange(), INPUT_DEBOUNCE_MS)
    )
  }

  onChange() {
    const searchTerm = this.input?.value.trim()

    if (!searchTerm) {
      this.close()
      return
    }

    this.getSearchResults(searchTerm)
  }

  async getSearchResults(searchTerm: string) {
    if (!this.results) return

    try {
      const doc = await fetchSection(
        'predictive-search-results',
        `/search/suggest?q=${encodeURIComponent(searchTerm)}`
      )
      const markup = doc.querySelector('#shopify-section-predictive-search-results')?.innerHTML
      if (!markup) return

      this.results.innerHTML = markup
      this.open()

      this.getTotalCount(searchTerm)
      window.initScrollAnimate?.()
    } catch (error) {
      this.close()
      console.error('Error fetching predictive search results:', error)
    }
  }

  async getTotalCount(searchTerm: string) {
    try {
      const doc = await fetchSection(
        'search-count',
        `/search?q=${encodeURIComponent(searchTerm)}&type=product`
      )
      const count = doc
        .querySelector<HTMLElement>('#shopify-section-search-count')
        ?.innerText.trim()

      const container = document.getElementById('predictive-search-total-count')
      if (container && count) container.innerText = count
    } catch (error) {
      console.error('Error fetching total count:', error)
    }
  }

  open() {
    if (this.results) this.results.style.display = 'block'
    this.input?.setAttribute('aria-expanded', 'true')
  }

  close() {
    if (this.results) this.results.style.display = 'none'
    this.input?.setAttribute('aria-expanded', 'false')
  }
}

customElements.define('predictive-search', PredictiveSearch)
