/**
 * Strings the JS renders on its own. Liquid fills `window.theme.strings` from
 * the locale files; the defaults here only keep things readable if it doesn't.
 */
const DEFAULTS = {
  discountInvalid: 'Discount code isn\u2019t valid or doesn\u2019t apply to this cart',
  discountFailed: 'Couldn\u2019t apply the discount code',
  maxInCart: 'Max in cart',
} as const

export type StringKey = keyof typeof DEFAULTS

export const t = (key: StringKey): string => window.theme?.strings?.[key] || DEFAULTS[key]
