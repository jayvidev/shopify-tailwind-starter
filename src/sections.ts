/**
 * Section Rendering API helpers.
 * Fetching `?section_id=x` returns only that section's markup instead of the
 * whole page, so we don't download header/footer/scripts just to throw them away.
 */

export const sectionUrl = (sectionId: string, url: string = window.location.href): string => {
  const target = new URL(url, window.location.origin)
  target.searchParams.set('section_id', sectionId)
  return target.toString()
}

export const fetchSection = async (
  sectionId: string,
  url: string = window.location.href
): Promise<Document> => {
  const response = await fetch(sectionUrl(sectionId, url))
  const text = await response.text()

  return new DOMParser().parseFromString(text, 'text/html')
}

/**
 * `innerHTML` does not execute injected `<script>` tags. Sections carry JSON
 * data scripts and app embeds, so re-create them to keep them working.
 */
export const setInnerHTML = (element: Element, html: string): void => {
  element.innerHTML = html

  element.querySelectorAll('script').forEach((oldScript) => {
    const newScript = document.createElement('script')

    Array.from(oldScript.attributes).forEach((attribute) => {
      newScript.setAttribute(attribute.name, attribute.value)
    })
    newScript.appendChild(document.createTextNode(oldScript.innerHTML))

    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
}

/** Copy the contents of `selector` from `source` onto the live document. */
export const replaceSelector = (source: Document, selector: string): Element | null => {
  const incoming = source.querySelector(selector)
  const current = document.querySelector(selector)

  if (!incoming || !current) return null

  setInnerHTML(current, incoming.innerHTML)

  return current
}
