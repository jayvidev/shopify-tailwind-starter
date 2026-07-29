const EDGE_TOLERANCE = 5

export const maxScrollLeft = (el: HTMLElement): number => el.scrollWidth - el.clientWidth

export const canScrollLeft = (el: HTMLElement): boolean => Math.ceil(el.scrollLeft) > EDGE_TOLERANCE

export const canScrollRight = (el: HTMLElement): boolean =>
  Math.ceil(el.scrollLeft) < maxScrollLeft(el) - EDGE_TOLERANCE

export const scrollByAmount = (el: HTMLElement, delta: number): void => {
  const target = Math.max(0, Math.min(el.scrollLeft + delta, maxScrollLeft(el)))
  el.scrollTo({ left: target, behavior: 'smooth' })
}

/** Centre a child within its scroll container, clamped to the scrollable range. */
export const scrollChildIntoView = (el: HTMLElement, index: number): void => {
  const child = el.children[index] as HTMLElement | undefined
  if (!child) return

  const centred = child.offsetLeft - el.clientWidth / 2 + child.offsetWidth / 2
  const target = Math.max(0, Math.min(centred, maxScrollLeft(el)))

  el.scrollTo({ left: target, behavior: 'smooth' })
}
