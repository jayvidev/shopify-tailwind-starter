import debugStore from './stores/debug.js'
import globalStore from './stores/global.js'
import dropdownComponent from './components/dropdown.js'

export default {
  register: (Alpine) => {
    // Alpine stores
    ;[debugStore, globalStore].forEach((store) => Alpine.store(store.name, store.store()))

    // Alpine components
    ;[dropdownComponent].forEach((component) => Alpine.data(component.name, component.component))

    // Alpine directives
    // const alpineDirectives = import.meta.glob('./directives/*.js', { eager: true, import: 'default' })

    // for (const path in alpineDirectives) {
    //   const directive = alpineDirectives[path]

    //   Alpine.directive(directive.name, directive.callback)
    // }

    // Alpine magic
    // const alpineMagic = import.meta.glob('./magic/*.js', { eager: true, import: 'default' })

    // for (const path in alpineMagic) {
    //   const magic = alpineMagic[path]

    //   const name = magic.name

    //   Alpine.magic(name, magic.callback)
    // }
  },
}
