export const getLocale = (): string => window.theme?.moneyLocale || document.documentElement.lang || 'en'

export const formatAmount = (amount: number, options: Intl.NumberFormatOptions = {}): string => {
  return new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount)
}

/**
 * Normalize a user-typed price to a parseable string with "." as decimal
 * separator. Handles "1.234,56" (es) and "1,234.56" (en), plus bare thousands
 * like "1.234" — hence the 3-digit check on the last group.
 */
export const sanitizePrice = (val: string | number | null | undefined): string => {
  if (!val) return ''
  const s = String(val).trim()
  if (!s) return ''

  if (s.includes(',')) {
    return s.replace(/\./g, '').replace(',', '.')
  }

  if (s.includes('.')) {
    const parts = s.split('.')
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      return s.replace(/\./g, '')
    }
    return s
  }

  return s
}

/** Keeps decimals only when the input actually had them. */
export const formatPrice = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined || val === '') return ''
  const normalized = sanitizePrice(String(val))
  const num = parseFloat(normalized)
  if (isNaN(num)) return String(val)

  return formatAmount(num, {
    minimumFractionDigits: normalized.includes('.') ? 2 : 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  })
}

const PLACEHOLDER_REGEX = /\{\{\s*(\w+)\s*\}\}/

const formatWithDelimiters = (
  number: number,
  precision = 2,
  thousands = ',',
  decimal = '.'
): string => {
  if (isNaN(number)) return '0'

  const fixed = (number / 100.0).toFixed(precision)
  const parts = fixed.split('.')
  const dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands)
  const cents = parts[1] ? decimal + parts[1] : ''

  return dollars + cents
}

/** Shopify-style money formatting from cents: `formatMoney(1999, 'amount_with_comma_separator')`. */
export const formatMoney = (cents: number | string, format?: string): string => {
  const formatString = format ? '${{' + format + '}}' : '${{amount}}'
  const amount = typeof cents === 'string' ? Number(cents.replace('.', '')) : cents

  let value = ''

  switch (formatString.match(PLACEHOLDER_REGEX)?.[1]) {
    case 'amount':
      value = formatWithDelimiters(amount, 2)
      break
    case 'amount_no_decimals':
      value = formatWithDelimiters(amount, 0)
      break
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(amount, 2, '.', ',')
      break
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(amount, 0, '.', ',')
      break
  }

  return formatString.replace(PLACEHOLDER_REGEX, value)
}

export default {
  getLocale,
  formatAmount,
  sanitizePrice,
  formatPrice,
  formatMoney,
}
