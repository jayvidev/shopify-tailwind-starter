import type cartStore from '@/alpine/stores/cart'
import type tiersStore from '@/alpine/stores/discount-tiers'
import type uiStore from '@/alpine/stores/ui'

export type Stores = {
  ui: ReturnType<typeof uiStore.store>
  cart: ReturnType<typeof cartStore.store>
  tiers: ReturnType<typeof tiersStore.store>
}

export type AlpineMagics = {
  $el: HTMLElement
  $refs: Record<string, HTMLElement>
  $store: Stores
  $watch: <T>(property: string, callback: (value: T, oldValue: T) => void) => void
  $nextTick: (callback?: () => void) => Promise<void>
  $dispatch: (event: string, detail?: unknown) => void
}

/**
 * Wraps an Alpine.data factory so `this` inside the returned object also sees
 * the magic properties Alpine injects at runtime.
 */
export const defineData =
  <T extends object, A extends unknown[]>(
    factory: (...args: A) => T & ThisType<T & AlpineMagics>
  ) =>
  (...args: A) =>
    factory(...args)
