import { defineData } from '@/types/alpine'

type Initial = {
  selected?: string
  listboxId?: string
  swatches?: Record<string, string>
  isColor?: boolean
}

export default {
  name: 'dropdown',
  component: defineData((initial: Initial = {}) => ({
    open: false,
    selected: initial.selected || '',
    optionLabels: {} as Record<string, string>,
    optionAvailable: {} as Record<string, boolean>,
    activeIndex: -1,
    listboxId: initial.listboxId || 'dropdown',
    swatches: initial.swatches || {},
    isColor: initial.isColor || false,
    openLeft: false,

    init() {
      const select = this.$refs.nativeSelect as HTMLSelectElement | undefined

      if (select?.name === 'sort_by') {
        this.selected = new URLSearchParams(window.location.search).get('sort_by') || ''
      }
      this.syncLabels()
      if (select) {
        const observer = new MutationObserver(() => this.syncLabels())
        observer.observe(select, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['data-available'],
        })
      }

      this.checkPosition()
    },

    checkPosition() {
      if (!this.$refs.button || !this.$refs.menu) return

      const wasOpen = this.open
      if (!wasOpen) {
        this.$refs.menu.style.visibility = 'hidden'
        this.$refs.menu.style.display = 'block'
      }

      const rect = this.$refs.button.getBoundingClientRect()
      const menuWidth = this.$refs.menu.offsetWidth || 250

      if (!wasOpen) {
        this.$refs.menu.style.display = 'none'
        this.$refs.menu.style.visibility = ''
      }

      const spaceRight = window.innerWidth - rect.left

      this.openLeft = spaceRight < menuWidth + 20
    },

    syncLabels() {
      const select = this.$refs.nativeSelect as HTMLSelectElement | undefined
      if (!select) return

      const labels: Record<string, string> = {}
      const available: Record<string, boolean> = {}
      const options = select.options
      for (let i = 0; i < options.length; i++) {
        labels[options[i].value] = options[i].innerText
        available[options[i].value] = options[i].dataset.available !== 'false'
      }
      this.optionLabels = labels
      this.optionAvailable = available
    },

    get optionValues(): string[] {
      const select = this.$refs.nativeSelect as HTMLSelectElement | undefined
      if (!select) return []

      return Array.from(select.options)
        .filter((option) => !option.disabled)
        .map((option) => option.value)
    },

    toggle() {
      if (this.open) {
        this.close()
        return
      }
      this.checkPosition()
      this.$refs.button?.focus()
      this.activeIndex = Math.max(0, this.optionValues.indexOf(this.selected))
      this.open = true
    },

    close(focusAfter?: HTMLElement) {
      if (!this.open) return
      this.open = false
      this.activeIndex = -1
      if (focusAfter) focusAfter.focus()
    },

    activeDescendantId(): string | null {
      if (!this.open || this.activeIndex < 0) return null
      return `${this.listboxId}-opt-${this.activeIndex}`
    },

    moveActive(delta: number) {
      const values = this.optionValues
      if (!values.length) return
      const next = this.activeIndex < 0 ? 0 : this.activeIndex + delta
      this.activeIndex = (next + values.length) % values.length
      this.scrollActiveIntoView()
    },

    scrollActiveIntoView() {
      this.$nextTick(() => {
        const id = this.activeDescendantId()
        const menu = this.$refs.menu
        if (!id || !menu) return
        const node = menu.querySelector(`#${CSS.escape(id)}`)
        if (node) node.scrollIntoView({ block: 'nearest' })
      })
    },

    onKeydown(event: KeyboardEvent) {
      const values = this.optionValues
      if (!values.length) return

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault()
          if (!this.open) {
            this.toggle()
            return
          }
          this.moveActive(event.key === 'ArrowDown' ? 1 : -1)
          break
        case 'Home':
          if (!this.open) return
          event.preventDefault()
          this.activeIndex = 0
          this.scrollActiveIntoView()
          break
        case 'End':
          if (!this.open) return
          event.preventDefault()
          this.activeIndex = values.length - 1
          this.scrollActiveIntoView()
          break
        case 'Enter':
        case ' ':
          if (!this.open) return
          event.preventDefault()
          if (this.activeIndex >= 0) this.selectValue(values[this.activeIndex])
          this.$refs.button?.focus()
          break
        default: {
          if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return
          const term = event.key.toLowerCase()
          const from = this.activeIndex + 1
          const ordered = values.slice(from).concat(values.slice(0, from))
          const match = ordered.find((v) => String(v).toLowerCase().startsWith(term))
          if (!match) return
          event.preventDefault()
          if (!this.open) this.toggle()
          this.activeIndex = values.indexOf(match)
          this.scrollActiveIntoView()
        }
      }
    },

    selectValue(value: string) {
      this.selected = value
      this.open = false

      const select = this.$refs.nativeSelect as HTMLSelectElement | undefined
      if (select) {
        select.value = value
        select.dispatchEvent(new Event('change', { bubbles: true }))
      }
    },

    onResize() {
      this.checkPosition()
    },
  })),
}
