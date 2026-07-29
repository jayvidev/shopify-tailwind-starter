import 'liquid-ajax-cart'
import '@/scroll-animate'

import Alpine from 'alpinejs'
import AlpineCollapse from '@alpinejs/collapse'
import AlpineFocus from '@alpinejs/focus'
import AlpineMorph from '@alpinejs/morph'
import AlpineGlobals from '@/alpine/index'
import helpers from '@/helpers'
import money from '@/money'

// Exposed for debugging from the browser console.
window.starter = { helpers, money }
window.Alpine = Alpine

Alpine.plugin([AlpineCollapse, AlpineFocus, AlpineMorph])
AlpineGlobals.register(Alpine)
Alpine.start()

document.addEventListener('liquid-ajax-cart:request-end', () => {
  document
    .querySelectorAll('[data-ajax-cart-section] [data-animate]:not(.is-animated)')
    .forEach((el) => el.classList.add('is-animated'))
})

if (process.env.NODE_ENV === 'development') {
  window.addEventListener('DOMContentLoaded', () => {
    var css = '#preview-bar-iframe { display: none !important; }',
      headEl = document.head || document.getElementsByTagName('head')[0],
      styleEl = document.createElement('style')

    headEl.appendChild(styleEl)

    styleEl.appendChild(document.createTextNode(css))
  })
}
