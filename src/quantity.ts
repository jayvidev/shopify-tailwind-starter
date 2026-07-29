import type { QuantityRule } from '@/types/shopify'

export type QuantityBounds = {
  min: number
  step: number
  max: number
}

export const boundsFromRule = (
  rule: Partial<QuantityRule> | null | undefined,
  fallback: Partial<QuantityBounds> = {}
): QuantityBounds => ({
  min: rule?.min || fallback.min || 1,
  step: rule?.increment || fallback.step || 1,
  max: rule?.max || 0,
})

export const increment = (qty: number, step: number, max: number): number =>
  Math.min(qty + step, max)

export const decrement = (qty: number, step: number, min: number): number =>
  Math.max(qty - step, min)

/** Round a typed quantity to the nearest valid step within [min, max]. */
export const snapToStep = (value: number | string, { min, step, max }: QuantityBounds): number => {
  const parsed = parseInt(String(value))
  if (isNaN(parsed) || parsed <= min) return min

  const steps = Math.round((parsed - min) / step)

  return Math.min(min + steps * step, max)
}
