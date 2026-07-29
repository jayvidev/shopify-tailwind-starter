import { formatAmount } from '@/money'

/** `$amount(12.5)` → "12,50". Takes a plain number, not cents — see `$money` for those. */
export default {
  name: 'amount',
  callback: () => formatAmount,
}
