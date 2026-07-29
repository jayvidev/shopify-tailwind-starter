/**
 * Player markup for video/model media. Liquid renders it into a JSON script tag
 * so the media_tag output stays server-side, and it's parsed once on first use.
 */
let cache: Record<string, string> | null = null

export const mediaHtml = (id: number | string): string | null => {
  if (!cache) {
    const tag = document.querySelector('[data-product-media-html]')
    try {
      cache = tag?.textContent ? JSON.parse(tag.textContent) : {}
    } catch (error) {
      console.error('[product-media] the media payload is not valid JSON:', error)
      cache = {}
    }
  }

  return cache?.[String(id)] || null
}
