import '@/prodify/types'
import type { Variant } from '@/prodify/types'

const A = 'data-prodify'
const attr = (s: string) => `[${A}-${s}]`
const SEL = {
  root: `[${A}]`,
  form: attr('product-form'),
  price: attr('price-container'),
  stockInfo: attr('stock-info'),
  selectedVariant: attr('selected-variant'),
  currentVariant: attr('current-variant'),
  variantStock: attr('variant-stock'),
  option: attr('option-container'),
  qtyInc: attr('quantity-increment'),
  qtyDec: attr('quantity-decrement'),
  qtyDisplay: attr('quantity-presentation'),
  qtyHidden: attr('quantity-hidden-input'),
} as const

const $ = <T extends Element>(s: string, r: Element | Document = document) => r.querySelector<T>(s)
const $$ = <T extends Element>(s: string, r: Element | Document = document) =>
  Array.from(r.querySelectorAll<T>(s))
const state = () => window.prodify

function parseJson<T>(sel: string, root: Element | Document): T | null {
  const raw = $(sel, root)?.textContent?.trim()
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function selectedOptionValueIds(): string[] {
  const ids: string[] = []
  for (const container of $$(SEL.option, state().el)) {
    const select = $<HTMLSelectElement>('select', container)
    const selected = select
      ? select.selectedOptions[0]
      : $<HTMLInputElement>('input:checked', container)
    const id = selected?.dataset.optionValueId
    if (id) ids.push(id)
  }
  return ids
}

function emit(name: string, detail: unknown) {
  state().el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }))
}

function setLoading(loading: boolean) {
  state().el.toggleAttribute('data-prodify-loading', loading)
  emit('variant:loading', { loading })
}

function syncOptionAvailability(doc: Document) {
  const current = $$(SEL.option, state().el)
  const incoming = $$(SEL.option, doc)

  current.forEach((container, i) => {
    const source = incoming[i]
    if (!source) return

    const sourceById = new Map<string, HTMLOptionElement | HTMLInputElement>()
    for (const node of $$<HTMLOptionElement | HTMLInputElement>('option, input', source)) {
      const id = node.dataset.optionValueId
      if (id) sourceById.set(id, node)
    }

    for (const node of $$<HTMLOptionElement | HTMLInputElement>('option, input', container)) {
      const id = node.dataset.optionValueId
      const next = id ? sourceById.get(id) : undefined
      if (!next) continue

      const available = next.dataset.available === 'true'
      node.dataset.available = String(available)

      if (node instanceof HTMLOptionElement && next instanceof HTMLOptionElement) {
        if (node.textContent !== next.textContent) node.textContent = next.textContent
        node.toggleAttribute('selected', next.hasAttribute('selected'))
      } else {
        node.classList.toggle('disabled', !available)
        const label = node.nextElementSibling
        if (label instanceof HTMLElement) label.dataset.unavailable = available ? '' : 'true'
      }
    }
  })
}

function swapProductInfo(doc: Document) {
  for (const q of [SEL.price, SEL.stockInfo]) {
    const src = $(q, doc)
    const tgt = $(q, state().el)
    if (src && tgt) tgt.replaceWith(src)
  }
}

function updateURL(variant: Variant | null, optionValueIds: string[]) {
  const { el } = state()
  if (el.dataset.updateUrl === 'false') return
  const query = variant ? `variant=${variant.id}` : `option_values=${optionValueIds.join(',')}`
  history.replaceState({}, '', `${el.dataset.url}?${query}`)
}

function updateQuantity(dir: 'up' | 'down') {
  const display = $<HTMLInputElement>(SEL.qtyDisplay, state().el)
  const hidden = $<HTMLInputElement>(SEL.qtyHidden, state().el)
  if (!display || !hidden) return
  const n = parseInt(display.value)
  const max = parseInt(display.getAttribute('max') ?? '') || 9999
  const newVal = dir === 'up' ? Math.min(n + 1, max) : Math.max(1, n - 1)
  display.value = hidden.value = String(newVal)
}

function onVariantChange(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLElement) || !target.closest(SEL.option)) return

  const selected =
    target instanceof HTMLSelectElement ? target.selectedOptions[0] : (target as HTMLInputElement)

  if (target instanceof HTMLSelectElement) {
    for (const option of target.options) {
      option.toggleAttribute('selected', option.value === target.value)
    }
  }

  const ids = selectedOptionValueIds()
  if (!ids.length) return

  const { el } = state()

  const connectedUrl = selected?.dataset.connectedProductUrl
  if (connectedUrl && connectedUrl !== el.dataset.url?.split('?')[0]) {
    window.location.href = `${connectedUrl}?option_values=${ids.join(',')}`
    return
  }

  const url = `${el.dataset.url}?section_id=${el.dataset.section}&option_values=${ids.join(',')}`

  state().abort?.abort()
  const controller = new AbortController()
  state().abort = controller
  setLoading(true)

  fetch(url, { signal: controller.signal })
    .then((r) => r.text())
    .then((text) => {
      const doc = new DOMParser().parseFromString(text, 'text/html')

      syncOptionAvailability(doc)

      const variant = parseJson<Variant | null>(SEL.selectedVariant, doc)

      if (!variant) {
        state().currentVariant = null
        updateURL(null, ids)
        emit('variant:unavailable', { optionValueIds: ids })
        return
      }

      const stock = parseJson<{ qty: number; managedDeny: boolean }>(SEL.variantStock, doc)
      state().currentVariant = variant

      swapProductInfo(doc)
      updateURL(variant, ids)
      emit('variant:changed', {
        ...variant,
        inventory_quantity: stock?.qty ?? 0,
        managedDeny: stock?.managedDeny ?? false,
      })
    })
    .catch((error) => {
      if ((error as Error).name !== 'AbortError') console.error(error)
    })
    .finally(() => {
      if (state().abort === controller) {
        state().abort = undefined
        setLoading(false)
      }
    })
}

const el = $<HTMLElement>(SEL.root)
if (el && !window.prodify) {
  window.prodify = {
    el,
    pickerType: (el.dataset.prodify as 'select' | 'radio') || 'radio',
    currentVariant: parseJson<Variant>(SEL.currentVariant, el),
  }

  el.addEventListener('change', onVariantChange)

  const qtyInc = $(SEL.qtyInc, el),
    qtyDec = $(SEL.qtyDec, el)
  if (qtyInc && qtyDec) {
    qtyInc.addEventListener('click', () => updateQuantity('up'))
    qtyDec.addEventListener('click', () => updateQuantity('down'))
  }
}
