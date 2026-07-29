/**
 * Custom event names shared between JS modules and Liquid templates.
 * The Liquid side (`@variant:changed.window`) can't import these, so a typo
 * there fails silently — grep for the literal before renaming any of them.
 */
export const EVENTS = {
  variantChanged: 'variant:changed',
  variantUnavailable: 'variant:unavailable',
  variantLoading: 'variant:loading',
  sortSelect: 'sort:select',
  showModal: 'show-modal',
  cartItemAdded: 'cart:item-added',
} as const

export const CART_EVENTS = {
  init: 'liquid-ajax-cart:init',
  requestStart: 'liquid-ajax-cart:request-start',
  requestEnd: 'liquid-ajax-cart:request-end',
} as const

export const SECTION_EVENTS = {
  load: 'shopify:section:load',
  reorder: 'shopify:section:reorder',
  select: 'shopify:section:select',
  deselect: 'shopify:section:deselect',
  blockSelect: 'shopify:block:select',
  blockDeselect: 'shopify:block:deselect',
} as const

export const SCROLL_THROTTLE_MS = 200

/** Matches Tailwind's `md` breakpoint. */
export const DESKTOP_BREAKPOINT = 768
