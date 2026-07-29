/**
 * Shared shapes for the Shopify objects the theme receives from Liquid or
 * from the Ajax API. Keep this the single source of truth — feature modules
 * should import from here instead of redeclaring their own shapes.
 */

export type QuantityRule = {
  min: number
  max: number | null
  increment: number
}

export type Variant = {
  available: boolean
  barcode: string
  compare_at_price: number | null
  featured_image: {
    id?: number
    src: string
    width: number
    height: number
    position: number
  } | null
  featured_media?: { id: number; preview_image?: { src: string } } | null
  id: number
  inventory_management: string
  inventory_policy?: string
  inventory_quantity?: number
  name: string
  option1: string
  option2: string
  option3: string | null
  options: string[]
  price: number
  public_title: string
  quantity_rule: QuantityRule
  requires_selling_plan: boolean
  requires_shipping: boolean
  selling_plan_allocations: unknown[]
  sku: string
  taxable: boolean
  title: string
  weight: number
}

export type CartItem = {
  id: number
  key: string
  variant_id: number
  product_id: number
  handle: string
  title: string
  quantity: number
  price: number
  line_price: number
  original_line_price: number
  final_line_price: number
  image: string | null
  url: string
}

export type DiscountApplication = {
  title: string
  description: string | null
  value: string
  value_type: string
  total_allocated_amount: number
}

export type Cart = {
  token: string
  item_count: number
  items: CartItem[]
  total_price: number
  original_total_price: number
  total_discount: number
  currency: string
  discount_applications: DiscountApplication[]
}

/** A single free-shipping / discount tier, configured from the theme settings. */
export type DiscountTier = {
  threshold: number
  amount: number
}

export type DiscountTiersConfig = {
  count: number
  tiers: DiscountTier[]
}
