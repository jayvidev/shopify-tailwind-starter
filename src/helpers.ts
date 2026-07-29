type AnyFn = (...args: never[]) => unknown

export const hasBodyClass = (className: string): boolean => {
  return document.body.classList.contains(className)
}

export const emitEvent = (
  type: string,
  detail: Record<string, unknown> = {},
  elem: Node = document
): boolean | undefined => {
  if (!type) return

  const event = new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail: detail,
  })

  return elem.dispatchEvent(event)
}

export const randomNumber = (min = 0, max = 1000): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const truncateLongTitle = (input: string): string => {
  return input.length > 5 ? `${input.substring(0, 18)}...` : input
}

export const getCookie = (name: string): boolean =>
  document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${name}=`))

export const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)

  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`
}

export const fetchHTML = async (endpoint: string): Promise<Document> => {
  const response = await fetch(endpoint)
  const responseText = await response.text()

  return new DOMParser().parseFromString(responseText, 'text/html')
}

export const debounce = <T extends AnyFn>(func: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export const throttle = <T extends AnyFn>(func: T, limit: number) => {
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number | undefined

  return function (this: unknown, ...args: Parameters<T>) {
    if (!lastRan) {
      func.apply(this, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan! >= limit) {
            func.apply(this, args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan)
      )
    }
  }
}

export default {
  emitEvent,
  randomNumber,
  truncateLongTitle,
  fetchHTML,
  debounce,
  throttle,
}
