import type { Variant } from '@/types/shopify'

export type { Variant }

declare global {
  interface Window {
    prodify: {
      el: HTMLElement
      pickerType: 'radio' | 'select'
      currentVariant?: Variant | null
      abort?: AbortController
    }
  }
}
